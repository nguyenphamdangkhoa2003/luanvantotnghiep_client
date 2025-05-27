'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Star, Clock, Map as MapIcon, X } from 'lucide-react'
import { MdArrowRight } from 'react-icons/md'
import { addSeconds, format, isValid } from 'date-fns'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useState, useEffect } from 'react'

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
    _id: string
  }[]
  distance: number
  duration: number
  frequency: string
  startTime: string
  seatsAvailable: number
  price: number
  status: string
  routeIndex: number
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
}

// Mapbox access token from environment variables
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

// Hàm định dạng thời gian
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

// Hàm tính thời gian đến
const calculateArrivalTime = (
  startTime?: string,
  duration?: number
): string => {
  if (!startTime || duration === undefined) {
    console.warn('calculateArrivalTime: Missing startTime or duration', {
      startTime,
      duration,
    })
    return 'N/A'
  }
  try {
    const startDate = new Date(startTime)
    if (!isValid(startDate)) {
      console.warn('calculateArrivalTime: Invalid startDate:', startTime)
      return 'N/A'
    }
    const arrivalDate = addSeconds(startDate, duration)
    return format(arrivalDate, 'dd/MM/yyyy HH:mm')
  } catch (error) {
    console.error(
      'calculateArrivalTime: Error calculating arrival time:',
      error,
      { startTime, duration }
    )
    return 'N/A'
  }
}

// Hàm định dạng địa chỉ
const formatAddress = (name: string): string => {
  const parts = name.split(',').map((part) => part.trim())
  return parts.slice(0, -2).join(', ').trim() || name
}

// Hàm lấy chữ cái đầu của tên tài xế
const getInitials = (name: string): string => {
  const names = name.split(' ')
  return names
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Hàm kiểm tra tọa độ hợp lệ
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

export default function TripCard(trip: TripCardProps) {
  const router = useRouter()
  const pickupAddress = formatAddress(
    trip.waypoints[0]?.name || 'Không xác định'
  )
  const dropoffAddress = formatAddress(
    trip.waypoints.length > 0
      ? trip.waypoints[trip.waypoints.length - 1]?.name || 'Không xác định'
      : 'Không xác định'
  )
  const departureTime = formatTime(trip.startTime)
  const arrivalTime = calculateArrivalTime(trip.startTime, trip.duration)
  const driverName = trip.userId.name
  const driverAvatar = trip.userId.avatar
  const driverInitials = getInitials(driverName)
  const driverRating = trip.userId.averageRating || 0
 

  const [selectedWaypoint, setSelectedWaypoint] = useState<{
    name: string
    longitude: number
    latitude: number
  } | null>(null)

  // Validate waypoints
  if (!trip.waypoints || trip.waypoints.length === 0) {
    console.error('Invalid trip data: missing waypoints', trip)
    return (
      <Card className="border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--muted)] p-4">
        <p className="text-yellow-600">Chưa có dữ liệu điểm dừng</p>
      </Card>
    )
  }

  // Validate trip data
  if (
    !trip.startPoint?.coordinates ||
    !trip.endPoint?.coordinates ||
    !trip.path?.coordinates ||
    !trip.path.coordinates.every(validateCoordinates)
  ) {
    console.error('Invalid trip data: Missing or invalid coordinates', trip)
    return (
      <Card className="border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--muted)] p-4">
        <p className="text-destructive">Lỗi: Dữ liệu chuyến đi không hợp lệ</p>
      </Card>
    )
  }

  // Process waypoints safely
  const safeWaypoints = trip.waypoints.map((wp) => {
    const defaultCoords = [0, 0] as [number, number]
    return {
      ...wp,
      coordinates: validateCoordinates(wp.coordinates)
        ? wp.coordinates
        : defaultCoords,
      hasValidCoords: validateCoordinates(wp.coordinates),
    }
  })

  // Debug logging
  useEffect(() => {
    console.log('Waypoints analysis:', {
      rawData: trip.waypoints,
      processed: safeWaypoints.map((wp) => ({
        name: wp.name,
        coordinates: wp.coordinates,
        isValid: wp.hasValidCoords,
      })),
      validCount: safeWaypoints.filter((wp) => wp.hasValidCoords).length,
    })
  }, [trip])

  // GeoJSON for the route path using trip.path.coordinates
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

  if (coordinates.length < 2) {
    console.error('Not enough valid coordinates to display map', coordinates)
    return (
      <Card className="border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--muted)] p-4">
        <p className="text-destructive">
          Lỗi: Không đủ tọa độ để hiển thị bản đồ
        </p>
      </Card>
    )
  }

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
    <div>
      <Card
        className={`border border-[var(--border)] rounded-[var(--radius-md)] hover:shadow-md transition-shadow ${
          trip.seatsAvailable === 0
            ? 'bg-[var(--muted)] opacity-80'
            : 'bg-[var(--card)]'
        } hover:border-[var(--ring)]`}
      >
        <CardContent className="py-1 px-2 md:px-10">
          <div className="flex flex-row gap-3">
            {/* Left Side - Pickup and Driver */}
            <div className="flex-1">
              <div className="mb-3">
                <span className="max-h-5">
                  <p
                    className={`font-medium md:text-xl ${
                      trip.seatsAvailable === 0
                        ? 'text-[var(--muted-foreground)]'
                        : 'text-[var(--foreground)]'
                    }`}
                  >
                    {pickupAddress}
                  </p>
                </span>
                <p
                  className={`text-sm md:text-base font-medium mt-1 flex items-center ${
                    trip.seatsAvailable === 0
                      ? 'text-[var(--muted-foreground)]'
                      : 'text-[var(--primary)]'
                  }`}
                >
                  <Clock
                    className={`inline-block w-4 h-4 mr-1 ${
                      trip.seatsAvailable === 0
                        ? 'text-[var(--muted-foreground)]'
                        : 'text-[var(--primary)]'
                    }`}
                  />
                  {departureTime}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Avatar
                  className={`w-10 h-10 md:w-10 md:h-10 border-2 ${
                    trip.seatsAvailable === 0
                      ? 'border-[var(--border)]'
                      : 'border-[var(--card)]'
                  } shadow-sm`}
                >
                  <Image
                    src={driverAvatar}
                    width={36}
                    height={36}
                    alt="Avatar"
                    className="rounded-full object-cover"
                  />
                  <AvatarFallback
                    className={`${
                      trip.seatsAvailable === 0
                        ? 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                        : 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                    } font-medium`}
                  >
                    {driverInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p
                    className={`text-sm font-bold md:text-base ${
                      trip.seatsAvailable === 0
                        ? 'text-[var(--muted-foreground)]'
                        : 'text-[var(--foreground)]'
                    }`}
                  >
                    {driverName}
                  </p>
                  <div className="flex items-center">
                    <Star
                      className={`${
                        trip.seatsAvailable === 0
                          ? 'text-[var(--muted-foreground)]'
                          : 'fill-[var(--chart-1)] text-[var(--chart-1)]'
                      } w-4 h-4`}
                    />
                    <span
                      className={`text-xs ml-1 font-medium ${
                        trip.seatsAvailable === 0
                          ? 'text-[var(--muted-foreground)]'
                          : 'text-[var(--foreground)]'
                      }`}
                    >
                      {driverRating}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Icon ArrowRight */}
            <div className="flex justify-center items-center mt-2 sm:mt-0">
              <MdArrowRight
                className={`${
                  trip.seatsAvailable === 0
                    ? 'text-[var(--muted-foreground)]'
                    : 'text-[var(--muted-foreground)]'
                } w-6 h-6 sm:w-8 sm:h-8`}
              />
            </div>

            {/* Right Side - Dropoff and Seats */}
            <div className="flex-1 flex flex-col items-end justify-between">
              <div className="mb-3 text-right">
                <p
                  className={`font-medium md:text-xl ${
                    trip.seatsAvailable === 0
                      ? 'text-[var(--muted-foreground)]'
                      : 'text-[var(--foreground)]'
                  }`}
                >
                  {dropoffAddress}
                </p>
                <p
                  className={`text-sm md:text-base font-medium mt-1 flex items-center justify-end ${
                    trip.seatsAvailable === 0
                      ? 'text-[var(--muted-foreground)]'
                      : 'text-[var(--primary)]'
                  }`}
                >
                  <Clock
                    className={`inline-block w-4 h-4 mr-1 ${
                      trip.seatsAvailable === 0
                        ? 'text-[var(--muted-foreground)]'
                        : 'text-[var(--primary)]'
                    }`}
                  />
                  {arrivalTime}
                </p>
              </div>
              <div className="pb-3 text-right flex items-center gap-2">
                <span
                  className={`inline-block px-1 md:px-3 py-1 rounded-full text-xs font-medium ${
                    trip.seatsAvailable > 2
                      ? 'bg-[var(--chart-2)]/50 text-[var(--chart-2)]'
                      : trip.seatsAvailable > 0
                      ? 'bg-[var(--chart-3)]/50 text-[var(--chart-3)]'
                      : 'bg-[var(--destructive)]/50 text-[var(--destructive)]'
                  }`}
                >
                  {trip.seatsAvailable > 0
                    ? `Còn ${trip.seatsAvailable} chỗ trống`
                    : 'Hết chỗ'}
                </span>
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
                            <span>Tuyến đường: {trip.name}</span>
                          </div>
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{(trip.duration / 60 /60).toFixed(1)} giờ</span>
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
                          {safeWaypoints.filter((wp) => wp.hasValidCoords)
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
                              style={{ width: '100%', height: '100%' }}
                              mapStyle="mapbox://styles/mapbox/streets-v12"
                              mapboxAccessToken={MAPBOX_TOKEN}
                              attributionControl={false}
                            >
                              <Source
                                id="route"
                                type="geojson"
                                data={routeGeoJSON}
                              >
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
                                    {safeWaypoints[0].name.split(',')[0]}
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
                                <span className="font-medium">
                                  {driverName}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Giờ khởi hành
                                </span>
                                <span className="font-medium">
                                  {departureTime}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Giờ đến dự kiến
                                </span>
                                <span className="font-medium">
                                  {arrivalTime}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Số chỗ
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
                                  {fallbackRouteSteps.map((step, index) => (
                                    <li key={index} className="relative pl-8">
                                      <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm"></div>
                                      <div className="text-sm">
                                        <p className="font-medium text-foreground">
                                          {step.maneuver.instruction}
                                        </p>
                                        {step.distance > 0 && (
                                          <p className="text-muted-foreground mt-1">
                                            {(step.distance / 1000).toFixed(2)}{' '}
                                            km
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
                  className={`${
                    trip.seatsAvailable === 0
                      ? 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                      : 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  }`}
                  disabled={trip.seatsAvailable === 0}
                >
                  Chi tiết
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
