'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, MapPin, Users, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { useContext, useEffect, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { useRouter, usePathname } from 'next/navigation'
import { format, isBefore, startOfDay } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  UserLocationContext,
  UserLocationContextType,
} from '@/hooks/use-user-location-context'
import mapboxgl from 'mapbox-gl'
import { searchRoutesQueryFn, SearchRouteType } from '@/api/routes/route'

const schema = z.object({
  pickup: z.string().min(1, 'Điểm đón không được để trống'),
  dropoff: z.string().min(1, 'Điểm đến không được để trống'),
  date: z
    .string()
    .min(1, 'Vui lòng chọn ngày khởi hành')
    .refine(
      (value) => {
        const selectedDate = new Date(value)
        const today = startOfDay(new Date())
        return !isBefore(selectedDate, today)
      },
      { message: 'Ngày khởi hành không được nhỏ hơn ngày hiện tại' }
    ),
  passengers: z
    .number({
      required_error: 'Vui lòng nhập số người',
      invalid_type_error: 'Vui lòng nhập số người',
    })
    .min(1, 'Số người ít nhất là 1')
    .max(4, 'Tối đa 4 người'),
})

type FormData = z.infer<typeof schema>

type Coordinates = {
  lng: number
  lat: number
}

type SearchTripProps = {
  onSearchResults?: (results: any[]) => void
}

function SearchTrip({ onSearchResults }: SearchTripProps) {
  const userLocationContext = useContext(UserLocationContext)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pickup: '',
      dropoff: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      passengers: 1,
    },
  })
  const [pickupQuery, setPickupQuery] = useState('')
  const [dropoffQuery, setDropoffQuery] = useState('')
  const [pickupSuggestions, setPickupSuggestions] = useState<
    { place_id: string; description: string; coordinates: Coordinates }[]
  >([])
  const [dropoffSuggestions, setDropoffSuggestions] = useState<
    { place_id: string; description: string; coordinates: Coordinates }[]
  >([])
  const [pickupOpen, setPickupOpen] = useState(false)
  const [dropoffOpen, setDropoffOpen] = useState(false)
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null)
  const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>(null)
  const [route, setRoute] = useState<any[]>([])
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  // Added to prevent double submissions
  const [isSearching, setIsSearching] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const mapRef = useRef<any>(null)

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  if (!MAPBOX_TOKEN) {
    console.error(
      'Mapbox token is missing. Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env.local.'
    )
  }

  // Fetch suggestions from Nominatim
  const fetchSuggestions = async (
    query: string,
    setter: (
      suggestions: {
        place_id: string
        description: string
        coordinates: Coordinates
      }[]
    ) => void
  ) => {
    if (query.length < 2) {
      setter([])
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=10&countrycodes=vn&accept-language=vi`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your.email@example.com)',
          },
        }
      )
      const data = await response.json()
      const suggestions = data.map((item: any) => ({
        place_id: item.place_id,
        description: item.display_name,
        coordinates: {
          lng: parseFloat(item.lon),
          lat: parseFloat(item.lat),
        },
      }))
      setter(suggestions)
    } catch (error) {
      console.error('Error fetching suggestions from Nominatim:', error)
      setter([])
    }
  }

  // Fetch routes from Mapbox Directions API
  const fetchRoute = async (start: Coordinates, end: Coordinates) => {
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
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}&alternatives=true&annotations=distance,duration`
      )
      const data = await response.json()

      if (!response.ok || !data.routes || data.routes.length === 0) {
        console.error('Mapbox API error:', data.message || 'No routes found')
        setRoute([])
        setSelectedRouteIndex(0)
        return
      }

      setRoute(data.routes)
      setSelectedRouteIndex(0)
      if (mapRef.current) {
        let bounds = new mapboxgl.LngLatBounds()
        data.routes.forEach((route: any) => {
          route.geometry.coordinates.forEach((coord: [number, number]) => {
            bounds.extend(coord)
          })
        })
        mapRef.current.fitBounds(bounds, { padding: 50 })
      }
    } catch (error) {
      console.error('Error fetching route from Mapbox:', error)
      setRoute([])
      setSelectedRouteIndex(0)
    }
  }

  // Fetch pickup suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(pickupQuery, setPickupSuggestions)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [pickupQuery])

  // Fetch dropoff suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(dropoffQuery, setDropoffSuggestions)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [dropoffQuery])

  // Fetch route when both pickup and dropoff coordinates are available
  useEffect(() => {
    if (pickupCoords && dropoffCoords && pathname === '/') {
      fetchRoute(pickupCoords, dropoffCoords)
    }
  }, [pickupCoords, dropoffCoords, pathname])

  // Restore data from localStorage
  useEffect(() => {
    console.log('Restoring from localStorage')
    const storedData = localStorage.getItem('searchTripForm')
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      Object.keys(parsedData).forEach((key: any) => {
        if (key === 'pickupCoords' || key === 'dropoffCoords') {
          if (key === 'pickupCoords') setPickupCoords(parsedData[key] || null)
          if (key === 'dropoffCoords') setDropoffCoords(parsedData[key] || null)
        } else {
          setValue(key, parsedData[key])
        }
      })
    }
  }, [setValue])

  // Sync pickupQuery with watch('pickup') when pickupOpen changes
  useEffect(() => {
    console.log('Syncing pickupQuery, pickupOpen:', pickupOpen)
    if (pickupOpen) {
      setPickupQuery(watch('pickup'))
    }
  }, [pickupOpen, watch])

  // Sync dropoffQuery with watch('dropoff') when dropoffOpen changes
  useEffect(() => {
    console.log('Syncing dropoffQuery, dropoffOpen:', dropoffOpen)
    if (dropoffOpen) {
      setDropoffQuery(watch('dropoff'))
    }
  }, [dropoffOpen, watch])

  const onSubmit = async (data: FormData) => {
    if (isSearching) return
    setIsSearching(true)
    setIsLoading(true)

    try {
      const searchData: SearchRouteType = {
        startCoords: pickupCoords || undefined,
        endCoords: dropoffCoords || undefined,
        date: data.date,
        seatsAvailable: data.passengers,
      }

      const response = await searchRoutesQueryFn(searchData)
      const searchResults = response.data

      const queryParams = new URLSearchParams({
        pickup: data.pickup,
        dropoff: data.dropoff,
        date: data.date,
        passengers: data.passengers.toString(),
        pickupCoords: JSON.stringify(pickupCoords || {}),
        dropoffCoords: JSON.stringify(dropoffCoords || {}),
      }).toString()

      // Lưu vào localStorage
      localStorage.setItem('searchResults', JSON.stringify(searchResults))
      localStorage.setItem(
        'searchTripForm',
        JSON.stringify({
          pickup: data.pickup,
          dropoff: data.dropoff,
          date: data.date,
          passengers: data.passengers,
          pickupCoords,
          dropoffCoords,
        })
      )

      if (pathname === '/') {
        router.push(`/booking?${queryParams}`)
      } else {
        window.history.pushState(null, '', `?${queryParams}`)
        if (onSearchResults) {
          onSearchResults(searchResults)
        }
      }
    } catch (error) {
      console.error('Error searching routes:', error)
      if (onSearchResults) {
        onSearchResults([])
      }
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  // State for date picker
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Sync date with form
  useEffect(() => {
    console.log('Syncing date, selectedDate:', selectedDate)
    if (selectedDate) {
      setValue('date', format(selectedDate, 'yyyy-MM-dd'))
    } else {
      setValue('date', '')
    }
  }, [selectedDate, setValue])

  // Restore date from form state
  const dateValue = watch('date')
  useEffect(() => {
    console.log('Restoring date, dateValue:', dateValue)
    if (dateValue) {
      const parsedDate = new Date(dateValue)
      const today = startOfDay(new Date())
      if (!isBefore(parsedDate, today)) {
        setSelectedDate(parsedDate)
      } else {
        setSelectedDate(new Date())
        setValue('date', format(new Date(), 'yyyy-MM-dd'))
      }
    } else {
      setSelectedDate(undefined)
    }
  }, [dateValue, setValue])

  const hasErrors =
    errors.pickup || errors.dropoff || errors.date || errors.passengers

  return (
    <div className="flex flex-col items-center mt-5 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-[var(--card)] p-8 rounded-2xl shadow-xl w-full max-w-6xl border border-[var(--border)]"
      >
        <h2 className="text-2xl font-semibold text-center text-[var(--foreground)] mb-6">
          Tìm chuyến xe
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Pickup */}
          <div>
            <label className="block text-[var(--foreground)] text-sm font-medium mb-2">
              Điểm đón
            </label>
            <Popover open={pickupOpen} onOpenChange={setPickupOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                  <Input
                    {...register('pickup')}
                    placeholder="Nhập điểm đón..."
                    value={watch('pickup')}
                    onChange={(e) => {
                      setValue('pickup', e.target.value)
                      setPickupQuery(e.target.value)
                      if (e.target.value.length > 1) {
                        setPickupOpen(true)
                      }
                    }}
                    className="pl-10 h-11 rounded-lg border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 rounded-lg border border-[var(--border)] bg-[var(--card)] max-h-64 overflow-y-auto"
                align="start"
                sideOffset={6}
              >
                <Command className="rounded-lg">
                  <div className="relative px-3 py-2 border-b border-[var(--border)]">
                    <CommandInput
                      placeholder="Tìm kiếm điểm đón..."
                      value={pickupQuery}
                      onValueChange={(value) => {
                        setPickupQuery(value)
                        setValue('pickup', value)
                      }}
                      className="pl-10 h-11 rounded-lg border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm bg-[var(--card)] text-[var(--foreground)]"
                    />
                  </div>
                  <CommandList>
                    <CommandEmpty className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                      Không tìm thấy kết quả
                    </CommandEmpty>
                    {pickupSuggestions.length > 0 && (
                      <CommandGroup>
                        {pickupSuggestions.map((suggestion) => (
                          <CommandItem
                            key={suggestion.place_id}
                            value={suggestion.description}
                            onSelect={(value) => {
                              setValue('pickup', value)
                              setPickupQuery(value)
                              setPickupCoords(suggestion.coordinates)
                              setPickupOpen(false)
                            }}
                            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-[var(--muted)] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
                              <span className="truncate">
                                {suggestion.description}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.pickup && (
              <p className="text-[var(--destructive)] text-xs mt-1.5 font-medium">
                {errors.pickup.message}
              </p>
            )}
          </div>

          {/* Dropoff */}
          <div>
            <label className="block text-[var(--foreground)] text-sm font-medium mb-2">
              Điểm đến
            </label>
            <Popover open={dropoffOpen} onOpenChange={setDropoffOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                  <Input
                    {...register('dropoff')}
                    placeholder="Nhập điểm đến..."
                    value={watch('dropoff')}
                    onChange={(e) => {
                      setValue('dropoff', e.target.value)
                      setDropoffQuery(e.target.value)
                      if (e.target.value.length > 1) {
                        setDropoffOpen(true)
                      }
                    }}
                    className="pl-10 h-11 rounded-lg border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 rounded-lg border border-[var(--border)] bg-[var(--card)] max-h-64 overflow-y-auto"
                align="start"
                sideOffset={6}
              >
                <Command className="rounded-lg">
                  <div className="relative px-3 py-2 border-b border-[var(--border)]">
                    <CommandInput
                      placeholder="Tìm kiếm điểm đến..."
                      value={dropoffQuery}
                      onValueChange={(value) => {
                        setDropoffQuery(value)
                        setValue('dropoff', value)
                      }}
                      className="pl-10 h-11 rounded-lg border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm bg-[var(--card)] text-[var(--foreground)]"
                    />
                  </div>
                  <CommandList>
                    <CommandEmpty className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                      Không tìm thấy kết quả
                    </CommandEmpty>
                    {dropoffSuggestions.length > 0 && (
                      <CommandGroup>
                        {dropoffSuggestions.map((suggestion) => (
                          <CommandItem
                            key={suggestion.place_id}
                            value={suggestion.description}
                            onSelect={(value) => {
                              setValue('dropoff', value)
                              setDropoffQuery(value)
                              setDropoffCoords(suggestion.coordinates)
                              setDropoffOpen(false)
                            }}
                            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-[var(--muted)] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
                              <span className="truncate">
                                {suggestion.description}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.dropoff && (
              <p className="text-[var(--destructive)] text-xs mt-1.5 font-medium">
                {errors.dropoff.message}
              </p>
            )}
          </div>

          {/* Departure Date */}
          <div>
            <label className="block text-[var(--foreground)] text-sm font-medium mb-2">
              Ngày khởi hành
            </label>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'pl-10 h-11 w-full rounded-lg border-[var(--border)] text-left font-normal',
                      !selectedDate && 'text-[var(--muted-foreground)]',
                      'focus:ring-2 focus:ring-[var(--primary)] transition-all'
                    )}
                  >
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                    {selectedDate ? (
                      format(selectedDate, 'dd/MM/yyyy')
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-lg border-[var(--border)] bg-[var(--card)]"
                  align="start"
                  sideOffset={6}
                >
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    fromDate={new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {errors.date && (
              <p className="text-[var(--destructive)] text-xs mt-1.5 font-medium">
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Number of Passengers */}
          <div>
            <label className="block text-[var(--foreground)] text-sm font-medium mb-2">
              Số người
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
              <Input
                type="number"
                {...register('passengers', {
                  valueAsNumber: true,
                  min: 1,
                  max: 6,
                })}
                className="pl-10 h-11 rounded-lg border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] transition-all"
              />
            </div>
            {errors.passengers && (
              <p className="text-[var(--destructive)] text-xs mt-1.5 font-medium">
                {errors.passengers.message}
              </p>
            )}
          </div>

          {/* Search Button */}
          <div className="lg:pt-7 pt-0 sm:col-span-2 lg:col-span-1">
            <div className="flex items-end justify-center">
              <Button
                type="submit"
                disabled={isLoading || isSearching}
                className="bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-semibold px-8 py-3 rounded-lg shadow-md hover:opacity-90 transition-all w-full h-11"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tìm...
                  </div>
                ) : (
                  'Tìm chuyến'
                )}
              </Button>
            </div>
            {hasErrors && <div className="h-5"></div>}
          </div>
        </div>
      </form>

      {/* Route selection UI - Only shown on homepage */}
      {pathname === '/' && route.length > 0 && (
        <div className="w-full max-w-6xl mt-4 mb-2">
          <h3 className="text-lg font-medium mb-2">Chọn tuyến đường</h3>
          <div className="flex flex-wrap gap-2">
            {route.map((r, index) => {
              const distance = (r.distance / 1000).toFixed(1) // Convert meters to kilometers
              const duration = (r.duration / 60).toFixed(0) // Convert seconds to minutes
              return (
                <Button
                  key={`route-btn-${index}`}
                  variant={index === selectedRouteIndex ? 'default' : 'outline'}
                  onClick={() => setSelectedRouteIndex(index)}
                  className="text-sm"
                >
                  Tuyến {index + 1}: {distance} km, ~{duration} phút
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Map container - Only shown on homepage */}
      {pathname === '/' && (
        <div className="w-full max-w-6xl mt-6">
          <h2 className="text-[20px] font-semibold mb-0.5">Map Section</h2>
          {MAPBOX_TOKEN ? (
            userLocationContext && userLocationContext.userLocation ? (
              <div className="w-full h-[400px] rounded-2xl border border-[var(--border)] shadow-xl overflow-hidden">
                <Map
                  ref={mapRef}
                  mapboxAccessToken={MAPBOX_TOKEN}
                  initialViewState={{
                    longitude: userLocationContext.userLocation.lng ?? 105.8542,
                    latitude: userLocationContext.userLocation.lat ?? 21.0285,
                    zoom: 14,
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                >
                  {/* User location marker */}
                  <Marker
                    longitude={userLocationContext.userLocation.lng ?? 105.8542}
                    latitude={userLocationContext.userLocation.lat ?? 21.0285}
                    anchor="bottom"
                  >
                    <MapPin className="w-6 h-6 text-blue-500" />
                  </Marker>

                  {/* Pickup marker */}
                  {pickupCoords && (
                    <Marker
                      longitude={pickupCoords.lng}
                      latitude={pickupCoords.lat}
                      anchor="bottom"
                    >
                      <MapPin className="w-6 h-6 text-green-500" />
                    </Marker>
                  )}

                  {/* Dropoff marker */}
                  {dropoffCoords && (
                    <Marker
                      longitude={dropoffCoords.lng}
                      latitude={dropoffCoords.lat}
                      anchor="bottom"
                    >
                      <MapPin className="w-6 h-6 text-red-500" />
                    </Marker>
                  )}

                  {/* Render multiple routes */}
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
                            'line-color':
                              index === selectedRouteIndex
                                ? '#3b82f6'
                                : '#9ca3af',
                            'line-width': index === selectedRouteIndex ? 4 : 2,
                            'line-opacity':
                              index === selectedRouteIndex ? 1 : 0.6,
                          }}
                        />
                      </Source>
                    ))}
                </Map>
              </div>
            ) : (
              <div className="w-full h-[400px] rounded-2xl border border-[var(--border)] shadow-xl flex items-center justify-center">
                <p className="text-[var(--muted-foreground)]">
                  Không thể lấy vị trí. Vui lòng nhập điểm đón.
                </p>
              </div>
            )
          ) : (
            <div className="w-full h-[400px] rounded-2xl border border-[var(--border)] shadow-xl flex items-center justify-center">
              <p className="text-[var(--destructive)]">
                Lỗi: Thiếu Mapbox API token.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


export default SearchTrip
