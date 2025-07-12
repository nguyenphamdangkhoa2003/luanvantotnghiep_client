'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Star,
  Clock,
  Map as MapIcon,
  X,
  MapPin,
  Users,
  Tag,
  ArrowRight,
} from 'lucide-react'
import { format, isValid } from 'date-fns'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Map, { Source, Layer, Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { point, lineString, pointToLineDistance, simplify } from '@turf/turf'
import { useMemo, useState, useEffect, useContext } from 'react'
import { UserLocationContext } from '@/hooks/use-user-location-context'

interface TripCardProps {
  _id: string
  userId: {
    name: string
    avatar: string
    averageRating: number
  }
  name: string
  waypoints: {
    name: string
    distance: number
    coordinates: number[]
    estimatedArrivalTime?: string
    _id: string
  }[]
  distance: number
  duration: number
  frequency: string
  startTime: string
  endTime: string
  seatsAvailable: number
  price: number
  status: string
  routeIndex: number
  passengerCount: number
  startPoint: {
    type: 'Point'
    coordinates: [number, number]
  }
  endPoint: {
    type: 'Point'
    coordinates: [number, number]
  }
  path: {
    type: 'LineString'
    coordinates: [number, number][]
  }
  simplifiedPath: {
    type: 'LineString'
    coordinates: [number, number][]
  }
  isNegotiable: boolean
  maxPickupDistance: number
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const formatTime = (isoString?: string): string => {
  if (!isoString) return 'N/A'
  try {
    const date = new Date(isoString)
    return isValid(date) ? format(date, 'HH:mm - dd/MM/yyyy') : 'N/A'
  } catch (error) {
    return 'N/A'
  }
}

const formatDate = (isoString?: string): string => {
  if (!isoString) return 'N/A'
  try {
    const date = new Date(isoString)
    return isValid(date) ? format(date, 'dd/MM/yyyy') : 'N/A'
  } catch (error) {
    return 'N/A'
  }
}

const formatAddress = (name: string): string => {
  return name.split(',').slice(0, 2).join(',').trim()
}

const formatPrice = (price: number): string => {
  if (!price || price <= 0) return 'N/A'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
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

const validatePickupCoords = (pickupCoords: any): boolean => {
  return (
    pickupCoords &&
    typeof pickupCoords.lng === 'number' &&
    typeof pickupCoords.lat === 'number' &&
    !isNaN(pickupCoords.lng) &&
    !isNaN(pickupCoords.lat) &&
    pickupCoords.lng >= -180 &&
    pickupCoords.lng <= 180 &&
    pickupCoords.lat >= -90 &&
    pickupCoords.lat <= 90
  )
}

export default function TripCard(trip: TripCardProps) {
  const router = useRouter()
  const [selectedWaypoint, setSelectedWaypoint] = useState<{
    name: string
    longitude: number
    latitude: number
  } | null>(null)

  // Data processing
  const pickupAddress = formatAddress(
    trip.waypoints[0]?.name || 'Không xác định'
  )
  const dropoffAddress = formatAddress(
    trip.waypoints.length > 0
      ? trip.waypoints[trip.waypoints.length - 1]?.name || 'Không xác định'
      : 'Không xác định'
  )
  const isNegotiable = trip.isNegotiable
  const countcustomer = trip.passengerCount
  const departureTime = formatTime(trip.startTime)
  const arrivalTime = formatTime(trip.endTime)
  const driverName = trip.userId.name
  const driverAvatar = trip.userId.avatar
  const driverInitials = getInitials(driverName)
  const driverRating = trip.userId.averageRating || 0
  const isFull = trip.seatsAvailable === 0
  const formattedPrice = formatPrice(trip.price)
  const userLocationContext = useContext(UserLocationContext)
  const userLocation = userLocationContext?.userLocation
  const [showMap, setShowMap] = useState(false)
  const maxdistance = trip.maxPickupDistance
  const departure = useMemo(() => {
    try {
      const stored = localStorage.getItem('searchTripForm')
      const parsed = stored ? JSON.parse(stored) : {}
      if (!validatePickupCoords(parsed.pickupCoords)) {
        console.warn(
          'Invalid pickupCoords in searchTripForm:',
          parsed.pickupCoords
        )
        return { ...parsed, pickupCoords: null }
      }
      return parsed
    } catch (error) {
      console.error('Error parsing searchTripForm:', error)
      return {}
    }
  }, [])

  const userDistanceToRoute = useMemo(() => {
    try {
      if (
        departure.pickupCoords &&
        validatePickupCoords(departure.pickupCoords) &&
        trip.simplifiedPath?.coordinates?.length > 0 &&
        trip.simplifiedPath.coordinates.every(validateCoordinates)
      ) {
        return pointToLineDistance(
          point([departure.pickupCoords.lng, departure.pickupCoords.lat]),
          lineString(trip.simplifiedPath.coordinates),
          { units: 'kilometers' }
        )
      }
      return null
    } catch (error) {
      return null
    }
  }, [departure.pickupCoords, trip.simplifiedPath?.coordinates, trip._id])

  // Filter intermediate waypoints (exclude first and last)
  const intermediateWaypoints = trip.waypoints.filter(
    (_, index) => index !== 0 && index !== trip.waypoints.length - 1
  )

  if (
    !trip.startPoint?.coordinates ||
    !trip.endPoint?.coordinates ||
    !trip.path?.coordinates ||
    !trip.startPoint.coordinates.every((coord) => typeof coord === 'number') ||
    !trip.endPoint.coordinates.every((coord) => typeof coord === 'number') ||
    !trip.path.coordinates.every(validateCoordinates)
  ) {
    return (
      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardContent className="p-4">
          <p className="text-red-500">
            Lỗi: Dữ liệu tọa độ chuyến đi không hợp lệ
          </p>
        </CardContent>
      </Card>
    )
  }

  // Safe waypoints processing
  const safeWaypoints = trip.waypoints.map((wp) => ({
    ...wp,
    coordinates: validateCoordinates(wp.coordinates) ? wp.coordinates : [0, 0],
    hasValidCoords: validateCoordinates(wp.coordinates),
  }))

  // Route data
  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: trip.path.coordinates,
    },
    properties: {},
  }

  // Calculate map bounds
  const coordinates = [
    trip.startPoint.coordinates,
    trip.endPoint.coordinates,
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

  const handleDetailsClick = () => {
    router.push(`/booking/tripdetail/${trip._id}`)
  }

  // Fallback route steps for details
  const fallbackRouteSteps = safeWaypoints.map((wp, index) => ({
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
  }))

  return (
    <Card
      className={`rounded-lg shadow-sm transition-all hover:shadow-md border ${
        isFull ? 'opacity-80 grayscale-[20%]' : ''
      }`}
    >
      <CardContent className="p-4 py-0.5">
        {/* Main content */}
        <div className="flex flex-col gap-4">
          {/* Route Information */}
          <div className="flex items-start gap-3">
            {/* Pickup Point */}
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <div className="mt-1 w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                    {pickupAddress}
                  </h3>
                  <div className="flex items-center mt-1 text-blue-600">
                    <Clock className="w-3 h-3 mr-1" />
                    <span className="text-xs font-medium">{departureTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center px-1">
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Dropoff Point */}
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <div className="mt-1 w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                    {dropoffAddress}
                  </h3>
                  <div className="flex items-center mt-1 text-blue-600">
                    <Clock className="w-3 h-3 mr-1" />
                    <span className="text-xs font-medium">{arrivalTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Intermediate Waypoints */}
          {intermediateWaypoints.length > 0 && (
            <div className="ml-5 pl-3 border-l-2 border-gray-200 space-y-2">
              {intermediateWaypoints.map((wp) => (
                <div key={wp._id} className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 mt-1 text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700 line-clamp-1">
                      {formatAddress(wp.name)}
                    </p>
                    {wp.estimatedArrivalTime && (
                      <p className="text-xs text-gray-500">
                        {formatDate(wp.estimatedArrivalTime)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Driver Information */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="w-10 h-10 border-2 border-white shadow">
              {driverAvatar ? (
                <Image
                  src={driverAvatar}
                  width={40}
                  height={40}
                  alt="Avatar"
                  className="rounded-full object-cover"
                />
              ) : (
                <AvatarFallback className="bg-blue-600 text-white">
                  {driverInitials}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">{driverName}</p>
              <div className="flex items-center">
                <Star className="fill-yellow-400 text-yellow-400 w-3 h-3" />
                <span className="text-xs ml-1 font-medium text-gray-600">
                  {driverRating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                isFull ? 'bg-red-50' : 'bg-blue-50'
              }`}
            >
              <Users
                className={`w-4 h-4 ${
                  isFull ? 'text-red-600' : 'text-blue-600'
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                {isFull ? 'Hết chỗ' : `${trip.seatsAvailable} chỗ trống`}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md">
              <Tag className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {formattedPrice}/ghế
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Cách điểm bạn đặt{' '}
                {userDistanceToRoute !== null
                  ? userDistanceToRoute < 1
                    ? `${(userDistanceToRoute * 1000).toFixed(0)} m`
                    : `${userDistanceToRoute.toFixed(2)} km`
                  : 'N/A'}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {countcustomer} hành khách
              </span>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                isNegotiable ? 'bg-green-50' : 'bg-gray-100'
              }`}
            >
              <Tag
                className={`w-4 h-4 ${
                  isNegotiable ? 'text-green-600' : 'text-gray-600'
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                {isNegotiable ? 'Có thể thương lượng' : 'Giá cố định'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Khoảng cách tối đa đón/trả: {maxdistance / 1000} km
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Dialog
              onOpenChange={(open) => {
                if (!open) setShowMap(false)
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 flex items-center gap-2 border-gray-300"
                  onClick={() => setShowMap(true)}
                >
                  <MapIcon className="w-4 h-4" />
                  <span>Xem bản đồ</span>
                </Button>
              </DialogTrigger>

              <DialogContent className="p-0 w-full max-w-[95vw] h-[90vh] rounded-lg overflow-hidden">
                <div className="relative flex flex-col h-full">
                  <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white">
                    <DialogTitle className="text-xl font-semibold">
                      <div className="flex items-center gap-2 text-gray-900">
                        <MapIcon className="w-5 h-5 text-blue-600" />
                        <span>Tuyến đường: {trip.name}</span>
                      </div>
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        <Clock className="w-4 h-4" />
                        <span>{(trip.duration / 60 / 60).toFixed(1)} giờ</span>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        <span>{(trip.distance / 1000).toFixed(1)} km</span>
                      </div>
                      <DialogClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-gray-900 text-gray-500"
                          aria-label="Đóng dialog"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </DialogClose>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    <div className="relative h-[60vh] md:h-full w-full md:w-2/3">
                      {!showMap ? (
                        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                          Đang chuẩn bị bản đồ...
                        </div>
                      ) : (
                        <Map
                          initialViewState={initialViewState}
                          style={{ width: '100%', height: '100%' }}
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
                          {departure.pickupCoords &&
                            validatePickupCoords(departure.pickupCoords) && (
                              <Marker
                                longitude={departure.pickupCoords.lng}
                                latitude={departure.pickupCoords.lat}
                                anchor="bottom"
                              >
                                <div className="relative">
                                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                                  <div className="absolute inset-0 animate-ping bg-blue-500 rounded-full opacity-75"></div>
                                </div>
                              </Marker>
                            )}
                          {userLocation && (
                            <Marker
                              longitude={userLocation.lng}
                              latitude={userLocation.lat}
                              anchor="bottom"
                            >
                              <div className="relative">
                                <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                                <div className="absolute inset-0 animate-ping bg-blue-500 rounded-full opacity-75"></div>
                              </div>
                            </Marker>
                          )}
                          {/* Start Marker (Điểm đầu) */}
                          <Marker
                            longitude={trip.startPoint.coordinates[0]}
                            latitude={trip.startPoint.coordinates[1]}
                            anchor="center"
                          >
                            <div className="relative">
                              <div className="w-7 h-7 rounded-full border-2 shadow-lg bg-blue-500 border-white">
                                <span className="sr-only">Điểm đầu</span>
                              </div>
                              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-md shadow-sm text-sm font-medium bg-white text-gray-900">
                                Điểm đầu: {safeWaypoints[0].name.split(',')[0]}
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
                              <div className="w-7 h-7 rounded-full border-2 shadow-lg bg-red-500 border-white">
                                <span className="sr-only">Điểm cuối</span>
                              </div>
                              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-md shadow-sm text-sm font-medium bg-white text-gray-900">
                                Điểm cuối:{' '}
                                {
                                  safeWaypoints[
                                    safeWaypoints.length - 1
                                  ].name.split(',')[0]
                                }
                              </div>
                            </div>
                          </Marker>

                          {/* Stop Markers (Điểm dừng) */}
                          {safeWaypoints
                            .filter((wp, index) => {
                              const isIntermediate =
                                index !== 0 &&
                                index !== safeWaypoints.length - 1
                              return isIntermediate && wp.hasValidCoords
                            })
                            .map((wp, index) => {
                              const [lng, lat] = wp.coordinates
                              return (
                                <Marker
                                  key={`stop-${index}-${lng}-${lat}`}
                                  longitude={lng}
                                  latitude={lat}
                                  anchor="center"
                                  onClick={(e) => {
                                    e.originalEvent.stopPropagation()
                                    setSelectedWaypoint({
                                      name: wp.name,
                                      longitude: lng,
                                      latitude: lat,
                                    })
                                  }}
                                >
                                  <div className="relative">
                                    <div
                                      className="w-6 h-6 rounded-full border-2 shadow-md bg-yellow-400 border-white"
                                      style={{
                                        clipPath:
                                          'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                                      }}
                                    >
                                      <span className="sr-only">
                                        Điểm dừng {index + 1}
                                      </span>
                                    </div>
                                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-md shadow-sm text-sm font-medium bg-white text-gray-900">
                                      Điểm dừng: {wp.name.split(',')[0]}
                                    </div>
                                  </div>
                                </Marker>
                              )
                            })}
                        </Map>
                      )}
                    </div>

                    {/* Details - 1/3 width */}
                    <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l overflow-y-auto bg-white">
                      <div className="p-6 sticky top-0 z-10 border-b bg-white">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                          <span className="w-2 h-2 rounded-full animate-pulse bg-blue-500" />
                          Chi tiết hành trình
                        </h3>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Trip Info */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Tài xế</span>
                            <span className="text-gray-900">{driverName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Giờ khởi hành</span>
                            <span className="text-gray-900">
                              {departureTime}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">
                              Giờ đến dự kiến
                            </span>
                            <span className="text-gray-900">{arrivalTime}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Số chỗ</span>
                            <span className="text-gray-900">
                              {trip.seatsAvailable}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">
                              Hành khách đã đăng ký
                            </span>
                            <span className="text-gray-900">
                              {countcustomer}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Giá mỗi ghế</span>
                            <span className="text-gray-900">
                              {formattedPrice}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">
                              Thương lượng giá
                            </span>
                            <span className="text-gray-900">
                              {isNegotiable
                                ? 'Có thể thương lượng'
                                : 'Giá cố định'}
                            </span>
                          </div>
                        </div>

                        {/* Route Steps */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">
                            Các điểm trên đường
                          </h4>
                          <div className="relative max-h-64 overflow-y-auto scrollbar-thin pr-4">
                            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-blue-500"></div>
                            <ul className="space-y-4">
                              {fallbackRouteSteps.map((step, index) => (
                                <li key={index} className="relative pl-8">
                                  <div className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 shadow-sm bg-blue-500 border-white"></div>
                                  <div className="text-sm">
                                    <p className="text-gray-900">
                                      {step.maneuver.instruction}
                                    </p>
                                    {step.distance > 1 && (
                                      <p className="text-gray-500">
                                        {(step.distance / 1000).toFixed(2)} km
                                      </p>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleDetailsClick}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isFull}
            >
              Chi tiết
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
