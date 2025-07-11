'use client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Star,
  StarHalf,
  Clock,
  Phone,
  Car,
  Hash,
  MapPin,
  Shield,
  CarFront,
  Users,
  MessageSquare,
  ArrowRight,
  MessageCircle,
  Map as MapIcon,
  X,
  Palette,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  getRouteByIdQueryFn,
  getRequestsByUserIdQueryFn,
} from '@/api/routes/route'
import { addSeconds, format, isValid } from 'date-fns'
import { toast } from 'sonner'
import Map, { Source, Layer, Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RouteRequestDialog } from '@/components/dialog/RequestRouteDialog'
import { useAuthContext } from '@/context/auth-provider'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const TripDetails = () => {
  const params = useParams()
  const router = useRouter()
  const tripId = params?.id as string
  const { user } = useAuthContext()
  const userId = user?._id

  const formatTime = (isoString?: string): string => {
    if (!isoString) {
      console.warn('formatTime: isoString is undefined or null')
      return 'N/A'
    }
    try {
      const date = new Date(isoString)
      if (!isValid(date)) {
        console.warn('formatTime: Invalid date from isoString:', isoString)
        return 'N/A'
      }
      return format(date, 'dd/MM/yyyy HH:mm')
    } catch (error) {
      console.error(
        'formatTime: Error parsing date:',
        error,
        'isoString:',
        isoString
      )
      return 'N/A'
    }
  }
  const formatDate = (isoString?: string): string => {
    if (!isoString) {
      console.warn('formatTime: isoString is undefined or null')
      return 'N/A'
    }
      const date = new Date(isoString)
      return format(date, 'dd/MM/yyyy')
    
  }
  const calculateWaypointTime = (
    startTime: string | undefined,
    cumulativeDistance: number
  ): string => {
    if (
      !startTime ||
      !isValid(new Date(startTime)) ||
      isNaN(cumulativeDistance)
    ) {
      console.warn('calculateWaypointTime: Invalid startTime or distance', {
        startTime,
        cumulativeDistance,
      })
      return 'N/A'
    }
    try {
      const speed = 16.67 // 60 km/h = 16.67 m/s
      const travelTimeSeconds = cumulativeDistance / speed
      const startDate = new Date(startTime)
      const arrivalDate = addSeconds(startDate, Math.round(travelTimeSeconds))
      return formatTime(arrivalDate.toISOString())
    } catch (error) {
      console.error('calculateWaypointTime: Error calculating time:', error)
      return 'N/A'
    }
  }

  const formatAddress = (address: string): string => {
    return address.trim() || 'Không xác định'
  }

  const getInitials = (name: string): string => {
    const names = name.split(' ')
    return names
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const validateCoordinates = (coords: unknown): coords is [number, number] => {
    return (
      Array.isArray(coords) &&
      coords.length === 2 &&
      typeof coords[0] === 'number' &&
      typeof coords[1] === 'number' &&
      !isNaN(coords[0]) &&
      !isNaN(coords[1]) &&
      coords[0] >= -180 &&
      coords[0] <= 180 &&
      coords[1] >= -90 &&
      coords[1] <= 90
    )
  }

  const {
    data: tripData,
    isLoading: isTripLoading,
    error: tripError,
  } = useQuery({
    queryKey: ['route', tripId],
    queryFn: () => getRouteByIdQueryFn(tripId),
    enabled: !!tripId,
  })
  const trip = tripData?.data

  const {
    data: requestsData,
    isLoading: isRequestsLoading,
    error: requestsError,
  } = useQuery({
    queryKey: ['requests', userId],
    queryFn: () => getRequestsByUserIdQueryFn(userId!),
    enabled: !!userId,
  })
  const requests = requestsData?.data || []

  const hasRequested = requests.some(
    (request: any) =>
      request.routeId._id === tripId &&
      (request.status === 'accepted' || request.status === 'completed')
  )

  if (!tripId || isTripLoading || (userId && isRequestsLoading)) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 mb-20 bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)] mb-4"></div>
        <p className="text-[var(--muted-foreground)] text-lg">
          Đang tải thông tin chuyến đi...
        </p>
      </div>
    )
  }

  if (tripError || !trip) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 px-4 pb-20 bg-[var(--background)]">
        <Users className="h-16 w-16 text-[var(--muted-foreground)] mb-4" />
        <h3 className="text-xl font-medium text-[var(--foreground)] mb-2">
          Không tìm thấy chuyến đi
        </h3>
        <p className="text-[var(--muted-foreground)] text-center max-w-md">
          Chuyến đi bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          href="/booking"
          className="mt-6 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius-md)] hover:bg-[var(--ring)] transition"
        >
          Quay lại danh sách chuyến đi
        </Link>
      </div>
    )
  }

  if (requestsError) {
    toast.error(
      'Không thể kiểm tra trạng thái yêu cầu: ' +
        (requestsError.message || 'Lỗi không xác định')
    )
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 px-4 pb-20 bg-[var(--background)]">
        <Users className="h-16 w-16 text-[var(--muted-foreground)] mb-4" />
        <h3 className="text-xl font-medium text-[var(--foreground)] mb-2">
          Vui lòng đăng nhập
        </h3>
        <p className="text-[var(--muted-foreground)] text-center max-w-md">
          Bạn cần đăng nhập để đặt chuyến đi hoặc xem trạng thái yêu cầu.
        </p>
        <Button
          onClick={() => router.push('/login')}
          className="mt-6 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius-md)]"
        >
          Đăng nhập
        </Button>
      </div>
    )
  }

  const pickupAddress = formatAddress(
    trip.waypoints?.[0]?.name || 'Không xác định'
  )
  const dropoffAddress = formatAddress(
    trip.waypoints?.length > 0
      ? trip.waypoints[trip.waypoints.length - 1]?.name || 'Không xác định'
      : 'Không xác định'
  )
  const departureTime = formatTime(trip.startTime)
  const arrivalTime = formatTime(trip.endTime)
  const driverName = trip.userId?.name || 'Không xác định'
  const driverAvatar = trip.userId?.avatar || '/images/default-avatar.jpg'
  const driverInitials = getInitials(driverName)
  const driverRating = trip.userId?.averageRating || 0
  const joinYear = trip.userId?.createdAt
    ? new Date(trip.userId.createdAt).getFullYear()
    : 'Chưa xác định'
  const vehicle = trip.userId?.vehicles?.[0] || {}
  const isNegotiable = trip.isNegotiable ?? false
  const price = trip.price
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(trip.price)
    : 'Chưa cung cấp'
  const passengers = trip.passengerCount

  // Map setup
  if (!trip.waypoints || trip.waypoints.length === 0) {
    console.error('Invalid trip data: missing waypoints', trip)
  }

  if (
    !trip.startPoint?.coordinates ||
    !trip.endPoint?.coordinates ||
    !trip.path?.coordinates ||
    !trip.path.coordinates.every(validateCoordinates)
  ) {
    console.error('Invalid trip data: Missing or invalid coordinates', trip)
  }

  const safeWaypoints =
    trip.waypoints?.map((wp: any) => {
      const defaultCoords = [0, 0] as [number, number]
      return {
        ...wp,
        coordinates: validateCoordinates(wp.coordinates)
          ? wp.coordinates
          : defaultCoords,
        hasValidCoords: validateCoordinates(wp.coordinates),
      }
    }) || []

  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: trip.path?.coordinates || [],
    },
    properties: {},
  }

  const coordinates = [
    trip.startPoint?.coordinates,
    trip.endPoint?.coordinates,
    ...(routeGeoJSON.geometry.coordinates || []),
  ].filter(validateCoordinates)

  const longitudes = coordinates.map((coord) => coord[0])
  const latitudes = coordinates.map((coord) => coord[1])
  const bounds = {
    minLng: Math.min(...longitudes),
    maxLng: Math.max(...longitudes),
    minLat: Math.min(...latitudes),
    maxLat: Math.max(...latitudes),
  }
  const centerLng = (bounds.minLng + bounds.maxLng) / 2
  const centerLat = (bounds.minLat + bounds.maxLat) / 2
  const latDiff = bounds.maxLat - bounds.minLat
  const lngDiff = bounds.maxLng - bounds.minLng
  const zoom = Math.min(13, Math.log2(360 / Math.max(latDiff, lngDiff)) - 1)
  const initialViewState = {
    longitude: centerLng,
    latitude: centerLat,
    zoom,
  }

  const fallbackRouteSteps = safeWaypoints.map((wp: any, index: number) => {
    const cumulativeDistance = safeWaypoints
      .slice(0, index + 1)
      .reduce((sum: number, waypoint: any) => sum + (waypoint.distance || 0), 0)
    return {
      maneuver: {
        instruction:
          index === 0
            ? `Điểm đầu: ${wp.name}`
            : index === safeWaypoints.length - 1
            ? `Điểm cuối: ${wp.name}`
            : `Điểm dừng: ${wp.name}`,
      },
      distance: wp.distance || 0,
      name: wp.name,
      estimatedArrivalTime: calculateWaypointTime(
        trip.startTime,
        cumulativeDistance
      ),
    }
  })

  return (
    <div className="mx-auto p-4 md:p-6 max-w-5xl space-y-6 bg-[var(--background)]">
      <Card className="border border-[var(--border)] rounded-[var(--radius-lg)] shadow-md mt-10">
        <CardContent className="py-6 px-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Thông tin chuyến đi
            </h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:bg-primary/10"
                  aria-label="Xem bản đồ tuyến đường"
                >
                  <MapIcon className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 w-[1200px] max-w-[95vw] h-[90vh] bg-background rounded-lg overflow-hidden border-0 shadow-xl">
                <div className="relative flex flex-col h-full">
                  {/* Header */}
                  <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background border-b">
                    <DialogTitle className="text-xl font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <MapIcon className="w-5 h-5 text-primary" />
                        <span>Tuyến đường: {trip.name || 'Chuyến đi'}</span>
                      </div>
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{(trip.duration / 60 / 60).toFixed(1)} giờ</span>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        <span>{(trip.distance / 1000).toFixed(1)} km</span>
                      </div>
                      <DialogClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Đóng dialog"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </DialogClose>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Map - 2/3 width */}
                    <div className="relative h-[60vh] md:h-full w-full md:w-2/3">
                      {safeWaypoints.filter((wp: any) => wp.hasValidCoords)
                        .length === 0 && (
                        <div className="absolute top-0 left-0 right-0 bg-yellow-100 text-yellow-800 p-2 text-center z-10">
                          Không có điểm dừng hợp lệ để hiển thị
                        </div>
                      )}
                      {!MAPBOX_TOKEN ? (
                        <div className="flex items-center justify-center h-full bg-muted text-destructive">
                          Lỗi: Không tìm thấy Mapbox token
                        </div>
                      ) : (
                        <Map
                          initialViewState={initialViewState}
                          style={{
                            width: '100%',
                            height: '100%',
                          }}
                          mapStyle="mapbox://styles/mapbox/streets-v12"
                          mapboxAccessToken={MAPBOX_TOKEN}
                          attributionControl={false}
                        >
                          <Source id="route" type="geojson" data={routeGeoJSON}>
                            <Layer
                              id="route"
                              type="line"
                              paint={{
                                'line-color': '#3b82f6',
                                'line-width': 4,
                                'line-opacity': 0.8,
                              }}
                            />
                          </Source>

                          {/* Start Marker (Điểm đầu) */}
                          <Marker
                            longitude={trip.startPoint.coordinates[0]}
                            latitude={trip.startPoint.coordinates[1]}
                            anchor="center"
                          >
                            <div className="relative">
                              <div className="w-7 h-7 bg-green-500 rounded-full border-2 border-white shadow-lg">
                                <span className="sr-only">Điểm đầu</span>
                              </div>
                              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-white rounded-md shadow-sm text-sm font-medium">
                                Điểm đầu:{' '}
                                {safeWaypoints[0]?.name || 'Không xác định'}
                              </div>
                            </div>
                          </Marker>

                          {/* End Marker (Điểm cuối) */}
                          <Marker
                            longitude={trip.endPoint.coordinates[0]}
                            latitude={trip.endPoint.coordinates[1]}
                            anchor="center"
                          >
                            <div className="relative">
                              <div className="w-7 h-7 bg-red-500 rounded-full border-2 border-white shadow-lg">
                                <span className="sr-only">Điểm cuối</span>
                              </div>
                              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-white rounded-md shadow-sm text-sm font-medium">
                                Điểm cuối:{' '}
                                {safeWaypoints[safeWaypoints.length - 1]
                                  ?.name || 'Không xác định'}
                              </div>
                            </div>
                          </Marker>

                          {/* Intermediate Waypoints */}
                          {safeWaypoints
                            .filter((wp: any, index: number) => {
                              const isIntermediate =
                                index !== 0 &&
                                index !== safeWaypoints.length - 1
                              return isIntermediate && wp.hasValidCoords
                            })
                            .map((wp: any, index: number) => {
                              const [lng, lat] = wp.coordinates
                              return (
                                <Marker
                                  key={`stop-${index}-${lng}-${lat}`}
                                  longitude={lng}
                                  latitude={lat}
                                  anchor="center"
                                >
                                  <div className="relative">
                                    <div
                                      className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-md"
                                      style={{
                                        clipPath:
                                          'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                                      }}
                                    >
                                      <span className="sr-only">
                                        Điểm dừng {index + 1}
                                      </span>
                                    </div>
                                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-white rounded-md shadow-sm text-sm font-medium">
                                      Điểm dừng: {wp.name}
                                    </div>
                                  </div>
                                </Marker>
                              )
                            })}
                        </Map>
                      )}
                    </div>

                    {/* Details - 1/3 width */}
                    <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-muted bg-background overflow-y-auto">
                      <div className="p-6 sticky top-0 z-10 bg-background border-b border-muted">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          Chi tiết hành trình
                        </h3>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Trip Info */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Tài xế
                            </span>
                            <span className="font-medium">{driverName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Giờ khởi hành
                            </span>
                            <span className="font-medium">{departureTime}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Giờ đến dự kiến
                            </span>
                            <span className="font-medium">{arrivalTime}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Số chỗ trống
                            </span>
                            <span className="font-medium">
                              {trip.seatsAvailable}
                            </span>
                          </div>
                        </div>

                        {/* Route Steps */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-foreground">
                            Các điểm trên đường
                          </h4>
                          <div className="relative max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-muted pr-4">
                            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-primary/20"></div>
                            <ul className="space-y-4">
                              {fallbackRouteSteps.map(
                                (step: any, index: number) => (
                                  <li key={index} className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm"></div>
                                    <div className="text-sm">
                                      <p className="font-medium text-foreground">
                                        {step.maneuver.instruction}
                                      </p>
                                      {step.distance > 0 && (
                                        <p className="text-muted-foreground mt-1">
                                          {(step.distance / 1000).toFixed(2)} km
                                        </p>
                                      )}
                                      <p className="text-muted-foreground mt-1">
                                        Ngày đến: {step.estimatedArrivalTime}
                                      </p>
                                    </div>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-start gap-3 p-4 bg-[var(--accent)] rounded-[var(--radius-md)]">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[var(--primary-foreground)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--muted-foreground)] text-sm">
                    ĐIỂM ĐÓN
                  </p>
                  <p className="font-semibold text-[var(--foreground)]">
                    {pickupAddress}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-[var(--primary)]">
                    <Clock className="w-4 h-4" />
                    <span>Khởi hành: {departureTime}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start gap-3 p-4 bg-[var(--accent)] rounded-[var(--radius-md)]">
                <div className="w-10 h-10 rounded-full bg-[var(--destructive)] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[var(--primary-foreground)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--muted-foreground)] text-sm">
                    ĐIỂM ĐẾN
                  </p>
                  <p className="font-semibold text-[var(--foreground)]">
                    {dropoffAddress}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-[var(--destructive)]">
                    <Clock className="w-4 h-4" />
                    <span>Dự kiến: {arrivalTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {safeWaypoints.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Các điểm dừng
              </h3>
              <div className="relative pl-8">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-primary/20"></div>
                {safeWaypoints
                  .slice(1, safeWaypoints.length - 1)
                  .map((wp: any, index: number) => (
                    <div key={index} className="relative mb-4">
                      <div className="absolute left-[-1.5rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm"></div>
                      <div className="flex items-start gap-3 p-4 bg-[var(--accent)] rounded-[var(--radius-md)]">
                        <div>
                          <p className="font-medium text-[var(--muted-foreground)] text-sm">
                            {`ĐIỂM DỪNG ${index + 1}`}
                          </p>
                          <p className="font-semibold text-[var(--foreground)]">
                            {wp.name}
                          </p>

                          <p className="text-sm text-[var(--muted-foreground)] mt-1">
                            Ngày đến: {formatDate(wp.estimatedArrivalTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-[var(--accent)] rounded-[var(--radius-md)]">
              <div className="w-10 h-10 rounded-full bg-[var(--chart-2)] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[var(--primary-foreground)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--muted-foreground)] text-sm">
                  SỐ KHÁCH
                </p>
                <p className="font-semibold text-[var(--foreground)]">
                  {passengers} khách
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[var(--accent)] rounded-[var(--radius-md)]">
              <div className="w-10 h-10 rounded-full bg-[var(--chart-3)] flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-[var(--primary-foreground)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--muted-foreground)] text-sm">
                  GIÁ CÓ THƯƠNG LƯỢNG
                </p>
                <p className="font-semibold text-[var(--foreground)]">
                  {isNegotiable ? 'Có' : 'Không'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[var(--accent)] rounded-[var(--radius-md)]">
              <div className="w-10 h-10 rounded-full bg-[var(--chart-4)] flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 text-[var(--primary-foreground)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--muted-foreground)] text-sm">
                  GIÁ CHUYẾN ĐI
                </p>
                <p className="font-semibold text-[var(--foreground)]">
                  {price}/ghế
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--chart-2)]/20 rounded-full">
              <Users className="w-5 h-5 text-[var(--chart-2)]" />
              <span className="font-medium text-[var(--foreground)]">
                Còn {trip.seatsAvailable} chỗ trống
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Thông tin tài xế */}
      <Card className="border border-[var(--border)] rounded-[var(--radius-lg)] shadow-md">
        <CardContent className="py-6 px-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[var(--foreground)]">
              Tài xế
            </h3>
            <div className="flex items-center gap-2">
              <Link
                href={`/booking/reviews/${trip.userId._id}`}
                className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
              >
                <MessageCircle className="w-4 h-4" />
                Xem nhận xét
              </Link>
              <div className="flex items-center gap-1 bg-green-500/20 dark:bg-[var(--chart-1)]/20 px-3 py-1 rounded-full">
                <Shield className="w-4 h-4 text-green-500 dark:text-[var(--chart-1)]" />
                <span className="text-sm font-medium text-green-500 dark:text-[var(--chart-1)]">
                  Đã xác minh
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {driverAvatar && (
                  <AvatarImage
                    src={driverAvatar}
                    alt={`Avatar của ${driverName}`}
                    className="rounded-full object-cover"
                  />
                )}
                <AvatarFallback className="bg-[var(--accent)] text-[var(--accent-foreground)] text-lg font-medium flex items-center justify-center">
                  {driverInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg text-[var(--foreground)]">
                  {driverName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {[...Array(5)].map((_, i) => {
                    const ratingValue = driverRating
                    if (i < Math.floor(ratingValue)) {
                      return (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-[var(--chart-1)] text-[var(--chart-1)]"
                        />
                      )
                    } else if (
                      i === Math.floor(ratingValue) &&
                      ratingValue % 1 >= 0.5
                    ) {
                      return (
                        <StarHalf
                          key={i}
                          className="w-4 h-4 fill-[var(--chart-1)] text-[var(--chart-1)]"
                        />
                      )
                    } else {
                      return (
                        <Star
                          key={i}
                          className="w-4 h-4 text-[var(--muted-foreground)]"
                        />
                      )
                    }
                  })}
                  <span className="text-sm text-[var(--muted-foreground)]">
                    ({driverRating.toFixed(1)})
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Tham gia
                  </p>
                  <p className="font-medium text-[var(--foreground)]">
                    {joinYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2 md:col-auto">
                <Phone className="w-5 h-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Điện thoại
                  </p>
                  <p className="font-medium text-[var(--foreground)]">
                    +84********
                  </p>
                </div>
              </div>
            </div>
          </div>
          {trip.userId?.bio && (
            <div className="flex flex-row flex-wrap gap-2 mt-2">
              {trip.userId.bio
                .split('\n')
                .map((line: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full text-sm"
                  >
                    {line}
                  </span>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Thông tin xe */}
      <Card className="border border-[var(--border)] rounded-[var(--radius-lg)] shadow-md">
        <CardContent className="py-6 px-10">
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Thông tin xe
          </h3>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[var(--muted)] rounded-[var(--radius-md)] flex items-center justify-center">
                <CarFront className="w-8 h-8 text-[var(--muted-foreground)]" />
              </div>
              <div>
                <p className="font-semibold text-lg text-[var(--foreground)]">
                  {vehicle.model || 'Chưa cung cấp'}
                </p>
                <p className="text-[var(--muted-foreground)]">
                  {vehicle.seats || 'Chưa cung cấp'} chỗ
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Biển số
                  </p>
                  <p className="font-medium text-[var(--foreground)]">
                    {vehicle.licensePlate || 'Chưa cung cấp'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Màu sắc
                  </p>
                  <p className="font-medium text-[var(--foreground)]">
                    {vehicle.color || 'Chưa cung cấp'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {vehicle.features?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-[var(--foreground)] mb-2">
                Tiện ích trên xe
              </h4>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((feature: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {trip.seatsAvailable === 0 ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-[var(--radius-md)]">
            <Users className="w-5 h-5" />
            <span className="font-medium">Chuyến đi này đã hết chỗ</span>
          </div>
        ) : hasRequested ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-[var(--radius-md)]">
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">
              Bạn đã gửi yêu cầu cho chuyến đi này
            </span>
            <Button
              variant="link"
              className="text-yellow-800 p-0 h-auto"
              onClick={() => router.push('/my-requests')}
            >
              Xem trạng thái
            </Button>
          </div>
        ) : (
          <RouteRequestDialog
            routeId={tripId}
            seats={passengers}
            maxseat={trip.seatsAvailable}
          />
        )}
      </div>
    </div>
  )
}

export default TripDetails
