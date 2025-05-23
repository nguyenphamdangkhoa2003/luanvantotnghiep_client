'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Clock, MapPin, Users, Route } from 'lucide-react'
import { format, startOfToday } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useRef, useContext } from 'react'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl from 'mapbox-gl'
import { UserLocationContext } from '@/hooks/use-user-location-context'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { createRouteMutationFn } from '@/api/routes/route'
const routeSchema = z.object({
  departurePoint: z.string().min(1, 'Điểm đi là bắt buộc'),
  destination: z.string().min(1, 'Điểm đến là bắt buộc'),
  departureDate: z
    .date({
      required_error: 'Ngày đi là bắt buộc',
      invalid_type_error: 'Ngày không hợp lệ',
    })
    .refine(
      (date) => {
        const today = startOfToday()
        return date >= today
      },
      {
        message: 'Ngày đi phải từ hôm nay trở đi',
      }
    ),
  availableSeats: z.coerce
    .number({
      required_error: 'Vui lòng nhập số chỗ',
      invalid_type_error: 'Vui lòng nhập số chỗ',
    })
    .min(1, 'Số chỗ tối thiểu là 1')
    .max(6, 'Số chỗ tối đa là 6'),
  departureTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ đi không hợp lệ'),
  price: z.coerce
    .number({
      required_error: 'Vui lòng nhập giá tiền',
      invalid_type_error: 'Giá tiền phải là số',
    })
    .min(1000, 'Giá tiền tối thiểu là 1,000 VND')
    .max(1000000, 'Giá tiền tối đa là 1,000,000 VND'),
})

type RouteFormData = z.infer<typeof routeSchema>

type Suggestion = {
  place_id: string
  description: string
  coordinates: { lng: number; lat: number }
}

export default function RegistrationForm() {
  const userLocationContext = useContext(UserLocationContext)

  if (!userLocationContext) {
    throw new Error(
      'RegistrationForm must be used within a UserLocationContext.Provider'
    )
  }

  const { userLocation } = userLocationContext
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      departurePoint: '',
      destination: '',
      departureDate: new Date(), // Allow today
      departureTime: '08:00',
      availableSeats: 1,
      price: 10000,
    },
  })

  // State for autocomplete
  const [departureQuery, setDepartureQuery] = useState('')
  const [destinationQuery, setDestinationQuery] = useState('')
  const [departureSuggestions, setDepartureSuggestions] = useState<
    Suggestion[]
  >([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    Suggestion[]
  >([])
  const [departureOpen, setDepartureOpen] = useState(false)
  const [destinationOpen, setDestinationOpen] = useState(false)
  const [departureCoords, setDepartureCoords] = useState<{
    lng: number
    lat: number
  } | null>(null)
  const [destinationCoords, setDestinationCoords] = useState<{
    lng: number
    lat: number
  } | null>(null)
  const [isLoadingDeparture, setIsLoadingDeparture] = useState(false)
  const [isLoadingDestination, setIsLoadingDestination] = useState(false)
  const [departureName, setDepartureName] = useState<string>('')
  const [destinationName, setDestinationName] = useState<string>('')

  // State for map and routes
  const [route, setRoute] = useState<any[]>([])
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const mapRef = useRef<any>(null)

  // Ref for debounce timers
  const departureTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (input: string): Promise<Suggestion[]> => {
    if (input.length < 2) {
      return []
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          input
        )}&addressdetails=1&limit=10&countrycodes=vn&accept-language=vi`,
        {
          headers: {
            'User-Agent': 'XeShare/1.0 (contact@xeshare.com)',
          },
        }
      )
      if (!response.ok) {
        throw new Error('Nominatim API error')
      }
      const data = await response.json()
      return data.map((item: any) => ({
        place_id: item.place_id,
        description: item.display_name,
        coordinates: {
          lng: parseFloat(item.lon),
          lat: parseFloat(item.lat),
        },
      }))
    } catch (error) {
      console.error('Error fetching suggestions from Nominatim:', error)
      return []
    }
  }

  // Fetch routes from Mapbox Directions API
  const fetchRoute = async (
    start: { lng: number; lat: number },
    end: { lng: number; lat: number }
  ) => {
    if (
      !start ||
      !end ||
      isNaN(start.lng) ||
      isNaN(start.lat) ||
      isNaN(end.lng) ||
      isNaN(end.lat)
    ) {
      console.error('Invalid coordinates:', { start, end })
      setRoute([])
      setSelectedRouteIndex(0)
      return
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}&alternatives=true&annotations=distance,duration,congestion&overview=full`
      )
      const data = await response.json()

      if (!response.ok || !data.routes || data.routes.length === 0) {
        toast('Lỗi', {
          description: 'Không tìm thấy tuyến đường. Vui lòng thử lại!',
          style: { background: '#ff3333', color: '#fff' },
        })
        setRoute([])
        setSelectedRouteIndex(0)
        return
      }

      setRoute(data.routes)
      setSelectedRouteIndex(0)

      // Set waypoint names
      if (data.waypoints && data.waypoints.length >= 2) {
        setDepartureName(data.waypoints[0].name || watch('departurePoint'))
        setDestinationName(data.waypoints[1].name || watch('destination'))
        setValue(
          'departurePoint',
          data.waypoints[0].name || watch('departurePoint')
        )
        setValue('destination', data.waypoints[1].name || watch('destination'))
      }

      if (mapRef.current) {
        let bounds = new mapboxgl.LngLatBounds()
        data.routes.forEach((route: any) => {
          if (route.geometry?.coordinates) {
            route.geometry.coordinates.forEach((coord: [number, number]) => {
              bounds.extend(coord)
            })
          }
        })
        if (!bounds.isEmpty()) {
          mapRef.current.fitBounds(bounds, { padding: 50 })
        }
      }
    } catch (error) {
      console.error('Error fetching route from Mapbox:', error)
      toast('Lỗi', {
        description: 'Lỗi khi tải tuyến đường. Vui lòng kiểm tra kết nối!',
        style: { background: '#ff3333', color: '#fff' },
      })
      setRoute([])
      setSelectedRouteIndex(0)
    }
  }

  useEffect(() => {
    if (departureTimeoutRef.current) {
      clearTimeout(departureTimeoutRef.current)
    }

    if (departureQuery) {
      setIsLoadingDeparture(true)
      departureTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(departureQuery)
          .then((data) => {
            setDepartureSuggestions(data)
          })
          .catch((error) => {
            console.error('Departure autocomplete error:', error)
            setDepartureSuggestions([])
          })
          .finally(() => {
            setIsLoadingDeparture(false)
          })
      }, 600)
    } else {
      setDepartureSuggestions([])
      setIsLoadingDeparture(false)
    }

    return () => {
      if (departureTimeoutRef.current) {
        clearTimeout(departureTimeoutRef.current)
      }
    }
  }, [departureQuery])

  useEffect(() => {
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current)
    }

    if (destinationQuery) {
      setIsLoadingDestination(true)
      destinationTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(destinationQuery)
          .then((data) => {
            setDestinationSuggestions(data)
          })
          .catch((error) => {
            console.error('Destination autocomplete error:', error)
            setDestinationSuggestions([])
          })
          .finally(() => {
            setIsLoadingDestination(false)
          })
      }, 600)
    } else {
      setDestinationSuggestions([])
      setIsLoadingDestination(false)
    }

    return () => {
      if (destinationTimeoutRef.current) {
        clearTimeout(destinationTimeoutRef.current)
      }
    }
  }, [destinationQuery])

  useEffect(() => {
    if (departureCoords && destinationCoords) {
      fetchRoute(departureCoords, destinationCoords)
    }
  }, [departureCoords, destinationCoords])

  const onSubmit = async (data: RouteFormData) => {
    if (route.length === 0 || !departureCoords || !destinationCoords) {
      toast('Lỗi', {
        description: 'Vui lòng chọn điểm đi, điểm đến và tuyến đường hợp lệ!',
        style: { background: '#ff3333', color: '#fff' },
      })
      return
    }

    setIsSubmitting(true)
    try {
      const selectedRoute = route[selectedRouteIndex]
      if (
        !selectedRoute.geometry ||
        !selectedRoute.distance ||
        !selectedRoute.duration
      ) {
        throw new Error('Dữ liệu tuyến đường không đầy đủ')
      }

      const startDate = new Date(data.departureDate)
      const [hours, minutes] = data.departureTime.split(':')
      startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      const routeData = {
        name: `${departureName || data.departurePoint} - ${
          destinationName || data.destination
        }`,
        startAddress: departureName || data.departurePoint,
        startCoords: departureCoords,
        endAddress: destinationName || data.destination,
        endCoords: destinationCoords,
        waypoints: [
          {
            distance: 0,
            name: departureName || data.departurePoint,
            location: {
              lng: departureCoords.lng,
              lat: departureCoords.lat,
            },
          },
          {
            distance: selectedRoute.distance,
            name: destinationName || data.destination,
            location: {
              lng: destinationCoords.lng,
              lat: destinationCoords.lat,
            },
          },
        ],
        path: {
          type: 'LineString',
          coordinates: selectedRoute.geometry.coordinates,
        },
        distance: selectedRoute.distance,
        duration: selectedRoute.duration,
        routeIndex: selectedRouteIndex,
        startTime: startDate.toISOString(),
        price: data.price,
        seatsAvailable: data.availableSeats,
        frequency: 'daily',
      }
      await createRouteMutationFn(routeData)

      toast('Thành công', {
        description: `Tuyến đường ${routeData.name} (${(
          selectedRoute.distance / 1000
        ).toFixed(1)} km, ~${(selectedRoute.duration / 60).toFixed(
          0
        )} phút) đã được đăng ký!`,
        style: { background: '#00fd15', color: '#fff' },
      })

      reset()
      setDepartureQuery('')
      setDestinationQuery('')
      setDepartureCoords(null)
      setDestinationCoords(null)
      setDepartureName('')
      setDestinationName('')
      setRoute([])
      setSelectedRouteIndex(0)
    } catch (error: any) {
      console.error(
        'Error creating route:',
        error.response?.data || error.message
      )
      toast('Lỗi', {
        description:
          error.response?.data?.message ||
          'Không thể đăng ký tuyến đường. Vui lòng thử lại!',
        style: { background: '#ff3333', color: '#fff' },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center px-4 py-6 max-w-7xl mx-auto">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6 h-full">
          <Card className="shadow-sm h-full border-[var(--border)] bg-[var(--card)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-[var(--foreground)]">
                <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Route className="w-6 h-6" />
                </div>
                <div>
                  <p className="leading-tight">Đăng ký tuyến đường mới</p>
                  <p className="text-sm font-normal text-[var(--muted-foreground)] mt-1">
                    Điền thông tin tuyến đường bạn muốn chia sẻ
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <Separator className="bg-[var(--border)]" />
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Departure Point */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                    <MapPin className="w-4 h-4 text-[var(--primary)]" />
                    Điểm đi<span className="text-[var(--destructive)]">*</span>
                  </label>
                  <Popover open={departureOpen} onOpenChange={setDepartureOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          placeholder="Nhập địa chỉ xuất phát"
                          value={watch('departurePoint') ?? ''}
                          onChange={(e) => {
                            setValue('departurePoint', e.target.value)
                            setDepartureQuery(e.target.value)
                            if (e.target.value.length > 1) {
                              setDepartureOpen(true)
                            }
                          }}
                          className="pl-10 h-11 rounded-lg border-[var(--border)] text-[var(--foreground)] hover:border-[var(--ring)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20"
                          aria-label="Điểm đi"
                        />
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0 shadow-xl rounded-lg border-[var(--border)] bg-[var(--popover)]"
                      align="start"
                    >
                      <Command className="rounded-lg">
                        <div className="px-3 pt-3 pb-2 border-b bg-[var(--card)] rounded-t-lg">
                          <CommandInput
                            placeholder="Tìm kiếm điểm đi..."
                            value={departureQuery}
                            onValueChange={(value) => {
                              setDepartureQuery(value)
                              setValue('departurePoint', value)
                            }}
                            className="border-none focus:ring-0 h-9 text-[var(--foreground)]"
                            aria-label="Tìm kiếm điểm đi"
                          />
                        </div>
                        <CommandList className="max-h-[300px] overflow-y-auto">
                          <CommandEmpty className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                            {isLoadingDeparture ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg
                                  className="animate-spin h-4 w-4 text-[var(--primary)]"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Đang tìm kiếm...
                              </span>
                            ) : (
                              'Không tìm thấy địa điểm phù hợp'
                            )}
                          </CommandEmpty>
                          {departureSuggestions.length > 0 && (
                            <CommandGroup className="p-1">
                              {departureSuggestions.map((suggestion) => (
                                <CommandItem
                                  key={suggestion.place_id}
                                  value={suggestion.description}
                                  onSelect={(value) => {
                                    setValue('departurePoint', value)
                                    setDepartureQuery(value)
                                    setDepartureCoords(suggestion.coordinates)
                                    setDepartureName(value)
                                    setDepartureOpen(false)
                                  }}
                                  className="px-3 py-2.5 cursor-pointer rounded-md hover:bg-[var(--accent)] text-[var(--foreground)] aria-selected:bg-[var(--primary)]/10 aria-selected:text-[var(--primary)]"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 p-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                                      <MapPin className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium line-clamp-1">
                                        {suggestion.description.split(',')[0]}
                                      </p>
                                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                                        {suggestion.description
                                          .split(',')
                                          .slice(1)
                                          .join(',')}
                                      </p>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.departurePoint && (
                    <p className="text-sm text-[var(--destructive)] mt-1.5 flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.departurePoint.message}
                    </p>
                  )}
                </div>

                {/* Destination Point */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                    <MapPin className="w-4 h-4 text-[var(--primary)]" />
                    Điểm đến<span className="text-[var(--destructive)]">*</span>
                  </label>
                  <Popover
                    open={destinationOpen}
                    onOpenChange={setDestinationOpen}
                  >
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          placeholder="Nhập địa chỉ điểm đến"
                          value={watch('destination') ?? ''}
                          onChange={(e) => {
                            setValue('destination', e.target.value)
                            setDestinationQuery(e.target.value)
                            if (e.target.value.length > 1) {
                              setDestinationOpen(true)
                            }
                          }}
                          className="pl-10 h-11 rounded-lg border-[var(--border)] text-[var(--foreground)] hover:border-[var(--ring)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20"
                          aria-label="Điểm đến"
                        />
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0 shadow-xl rounded-lg border-[var(--border)] bg-[var(--popover)]"
                      align="start"
                    >
                      <Command className="rounded-lg">
                        <div className="px-3 pt-3 pb-2 border-b bg-[var(--card)] rounded-t-lg">
                          <CommandInput
                            placeholder="Tìm kiếm điểm đến..."
                            value={destinationQuery}
                            onValueChange={(value) => {
                              setDestinationQuery(value)
                              setValue('destination', value)
                            }}
                            className="border-none focus:ring-0 h-9 text-[var(--foreground)]"
                            aria-label="Tìm kiếm điểm đến"
                          />
                        </div>
                        <CommandList className="max-h-[300px] overflow-y-auto">
                          <CommandEmpty className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                            {isLoadingDestination ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg
                                  className="animate-spin h-4 w-4 text-[var(--primary)]"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Đang tìm kiếm...
                              </span>
                            ) : (
                              'Không tìm thấy địa điểm phù hợp'
                            )}
                          </CommandEmpty>
                          {destinationSuggestions.length > 0 && (
                            <CommandGroup className="p-1">
                              {destinationSuggestions.map((suggestion) => (
                                <CommandItem
                                  key={suggestion.place_id}
                                  value={suggestion.description}
                                  onSelect={(value) => {
                                    setValue('destination', value)
                                    setDestinationQuery(value)
                                    setDestinationCoords(suggestion.coordinates)
                                    setDestinationName(value)
                                    setDestinationOpen(false)
                                  }}
                                  className="px-3 py-2.5 cursor-pointer rounded-md hover:bg-[var(--accent)] text-[var(--foreground)] aria-selected:bg-[var(--primary)]/10 aria-selected:text-[var(--primary)]"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 p-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                                      <MapPin className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium line-clamp-1">
                                        {suggestion.description.split(',')[0]}
                                      </p>
                                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                                        {suggestion.description
                                          .split(',')
                                          .slice(1)
                                          .join(',')}
                                      </p>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.destination && (
                    <p className="text-sm text-[var(--destructive)] mt-1.5 flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.destination.message}
                    </p>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                      <CalendarIcon className="w-4 h-4 text-[var(--primary)]" />
                      Ngày đi
                      <span className="text-[var(--destructive)]">*</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal h-11 pl-3 border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]',
                            !watch('departureDate') &&
                              'text-[var(--muted-foreground)]',
                            'hover:border-[var(--ring)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20'
                          )}
                          aria-label="Chọn ngày đi"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-[var(--muted-foreground)]" />
                          {format(watch('departureDate'), 'dd/MM/yyyy', {
                            locale: vi,
                          })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 shadow-xl border-[var(--border)] bg-[var(--popover)]">
                        <Calendar
                          mode="single"
                          selected={watch('departureDate')}
                          onSelect={(date) =>
                            date && setValue('departureDate', date)
                          }
                          initialFocus
                          fromDate={startOfToday()}
                          locale={vi}
                          className="border-0"
                          classNames={{
                            day_selected:
                              'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]',
                            day_today:
                              'bg-[var(--accent)] text-[var(--foreground)]',
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.departureDate && (
                      <p className="text-sm text-[var(--destructive)] mt-1.5 flex items-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.departureDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                      <Clock className="w-4 h-4 text-[var(--primary)]" />
                      Giờ đi<span className="text-[var(--destructive)]">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="time"
                        {...register('departureTime')}
                        className="h-11 pl-10 rounded-lg border-[var(--border)] text-[var(--foreground)] hover:border-[var(--ring)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20"
                        aria-label="Giờ đi"
                      />
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    </div>
                    {errors.departureTime && (
                      <p className="text-sm text-[var(--destructive)] mt-1.5 flex items-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.departureTime.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Available Seats and Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                      <Users className="w-4 h-4 text-[var(--primary)]" />
                      Số chỗ trống
                      <span className="text-[var(--destructive)]">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="6"
                        {...register('availableSeats', { valueAsNumber: true })}
                        className="h-11 pl-10 rounded-lg border-[var(--border)] text-[var(--foreground)] hover:border-[var(--ring)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20"
                        aria-label="Số chỗ trống"
                      />
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    </div>
                    {errors.availableSeats && (
                      <p className="text-sm text-[var(--destructive)] mt-1.5 flex items-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.availableSeats.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-[var(--primary)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      Giá tiền (VND)
                      <span className="text-[var(--destructive)]">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Nhập giá tiền"
                        {...register('price', { valueAsNumber: true })}
                        className="h-11 pl-10 rounded-lg border-[var(--border)] text-[var(--foreground)] hover:border-[var(--ring)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20"
                        aria-label="Giá tiền"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                        ₫
                      </span>
                    </div>
                    {errors.price && (
                      <p className="text-sm text-[var(--destructive)] mt-1.5 flex items-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      route.length === 0 ||
                      !departureCoords ||
                      !destinationCoords
                    }
                    className="w-full h-12 text-base font-medium bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký tuyến đường'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <div className="space-y-6 h-full">
          <Card className="shadow-sm h-full flex flex-col border-[var(--border)] bg-[var(--card)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2 text-[var(--foreground)]">
                <MapPin className="w-5 h-5 text-[var(--primary)]" />
                Bản đồ tuyến đường
              </CardTitle>
            </CardHeader>
            <Separator className="bg-[var(--border)]" />
            <CardContent className="pt-4 flex-1 flex flex-col">
              {route.length > 0 && (
                <div className="mb-4 max-h-[200px] overflow-y-auto">
                  <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">
                    Lựa chọn tuyến đường
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {route.map((r, index) => (
                      <div
                        key={`route-${index}`}
                        onClick={() => setSelectedRouteIndex(index)}
                        className={cn(
                          'p-3 border rounded-lg cursor-pointer transition-colors',
                          index === selectedRouteIndex
                            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                            : 'border-[var(--border)] hover:border-[var(--ring)]/30'
                        )}
                        role="button"
                        aria-label={`Chọn tuyến ${index + 1}`}
                      >
                        <div className="flex justify-between items-center">
                          <Badge
                            variant={
                              index === selectedRouteIndex
                                ? 'default'
                                : 'outline'
                            }
                            className={cn(
                              index === selectedRouteIndex
                                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                                : 'border-[var(--border)] text-[var(--foreground)]'
                            )}
                          >
                            Tuyến {index + 1}
                          </Badge>
                          <span className="ml-2 text-sm text-[var(--foreground)]">
                            {(r.distance / 1000).toFixed(1)} km
                          </span>
                          {index === selectedRouteIndex && (
                            <span className="text-xs text-[var(--primary)] ml-auto">
                              Đang chọn
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-[400px] rounded-lg overflow-hidden border-[var(--border)]">
                {MAPBOX_TOKEN ? (
                  <Map
                    ref={mapRef}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    initialViewState={{
                      longitude: userLocation?.lng ?? 105.8542,
                      latitude: userLocation?.lat ?? 21.0285,
                      zoom: 14,
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    aria-label="Bản đồ tuyến đường"
                  >
                    {userLocation && (
                      <Marker
                        longitude={userLocation.lng}
                        latitude={userLocation.lat}
                        anchor="bottom"
                      >
                        <div className="relative">
                          <div className="w-6 h-6 bg-[#3b82f6] rounded-full border-2 border-[var(--card)] shadow-md"></div>
                          <div className="absolute inset-0 animate-ping bg-[#3b82f6] rounded-full opacity-75"></div>
                        </div>
                      </Marker>
                    )}

                    {departureCoords && (
                      <Marker
                        longitude={departureCoords.lng}
                        latitude={departureCoords.lat}
                        anchor="bottom"
                      >
                        <div className="bg-[var(--accent)] p-1.5 rounded-full shadow-lg border-2 border-[var(--card)]">
                          <MapPin className="w-4 h-4 text-[var(--accent-foreground)]" />
                        </div>
                      </Marker>
                    )}

                    {destinationCoords && (
                      <Marker
                        longitude={destinationCoords.lng}
                        latitude={destinationCoords.lat}
                        anchor="bottom"
                      >
                        <div className="bg-[var(--destructive)] p-1.5 rounded-full shadow-lg border-2 border-[var(--card)]">
                          <MapPin className="w-4 h-4 text-[var(--destructive-foreground)]" />
                        </div>
                      </Marker>
                    )}

                    {route.length > 0 &&
                      route.map((r, index) => (
                        <Source
                          key={`route-${index}`}
                          id={`route-${index}`}
                          type="geojson"
                          data={r.geometry}
                        >
                          <Layer
                            id={`route-layer-${index}`}
                            type="line"
                            source={`route-${index}`}
                            layout={{
                              'line-join': 'round',
                              'line-cap': 'round',
                            }}
                            paint={{
                              'line-color': '#3b82f6',
                              'line-width':
                                index === selectedRouteIndex ? 4 : 2,
                              'line-opacity':
                                index === selectedRouteIndex ? 1 : 0.6,
                            }}
                          />
                        </Source>
                      ))}
                  </Map>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--muted)]">
                    <p className="text-[var(--destructive)]">
                      Không thể tải bản đồ. Vui lòng kiểm tra Mapbox token.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
