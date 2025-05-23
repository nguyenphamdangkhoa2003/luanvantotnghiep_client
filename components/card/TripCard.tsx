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
    return format(date, 'HH:mm')
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
  if (!startTime || !duration) {
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
    return format(arrivalDate, 'HH:mm')
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
    .slice(0, 2)
}

export default function TripCard(trip: TripCardProps) {
  const router = useRouter()
  const pickupAddress = formatAddress(
    trip.waypoints[0]?.name || 'Không xác định'
  )
  const dropoffAddress = formatAddress(
    trip.waypoints[1]?.name || 'Không xác định'
  )
  const departureTime = formatTime(trip.startTime)
  const arrivalTime = calculateArrivalTime(trip.startTime, trip.duration)
  const driverName = trip.userId.name
  const driverAvatar = trip.userId.avatar
  const driverInitials = getInitials(driverName)
  const driverRating = 4.5

  const [selectedWaypoint, setSelectedWaypoint] = useState<{
    name: string
    longitude: number
    latitude: number
  } | null>(null)
  const [directions, setDirections] = useState<any>(null)

  // Validate coordinates
  const isValidCoordinates = (coords: [number, number][]): boolean => {
    if (!coords || coords.length < 2) {
      console.error(
        'Invalid coordinates: Array is empty or has insufficient points',
        coords
      )
      return false
    }
    return coords.every(([lng, lat]) => {
      const isValid =
        typeof lng === 'number' &&
        typeof lat === 'number' &&
        lng >= -180 &&
        lng <= 180 &&
        lat >= -90 &&
        lat <= 90
      if (!isValid) {
        console.error('Invalid coordinate pair:', [lng, lat])
      }
      return isValid
    })
  }

  // Fetch directions from Mapbox API
  useEffect(() => {
    const fetchDirections = async () => {
      if (!MAPBOX_TOKEN) {
        console.error('Mapbox token is missing')
        return
      }
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${trip.startPoint.coordinates[0]},${trip.startPoint.coordinates[1]};${trip.endPoint.coordinates[0]},${trip.endPoint.coordinates[1]}?access_token=${MAPBOX_TOKEN}&geometries=geojson&steps=true&overview=full&language=vi`
        )
        const data = await response.json()
        if (data.routes && data.routes.length > 0) {
          console.log('Directions API response:', data) // Debug log
          setDirections(data)
        } else {
          console.error('No routes found in Directions API response:', data)
        }
      } catch (error) {
        console.error('Error fetching directions:', error)
      }
    }
    fetchDirections()
  }, [trip.startPoint, trip.endPoint])

  // GeoJSON for the route path
  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: isValidCoordinates(
        directions?.routes?.[trip.routeIndex]?.geometry?.coordinates ||
          trip.path.coordinates
      )
        ? directions?.routes?.[trip.routeIndex]?.geometry?.coordinates ||
          trip.path.coordinates
        : [],
    },
    properties: {},
  }

  const coordinates = [
    trip.startPoint.coordinates,
    trip.endPoint.coordinates,
    ...(routeGeoJSON.geometry.coordinates || []),
  ]
  const validCoordinates = coordinates.filter(
    ([lng, lat]) =>
      typeof lng === 'number' &&
      typeof lat === 'number' &&
      lng >= -180 &&
      lng <= 180 &&
      lat >= -90 &&
      lat <= 90
  )

  if (validCoordinates.length < 2) {
    console.error(
      'Not enough valid coordinates to display map',
      validCoordinates
    )
  }

  const longitudes = validCoordinates.map((coord) => coord[0])
  const latitudes = validCoordinates.map((coord) => coord[1])
  const bounds = {
    minLng: Math.min(...longitudes),
    maxLng: Math.max(...longitudes),
    minLat: Math.min(...latitudes),
    maxLat: Math.max(...latitudes),
  }
  const centerLng = (bounds.minLng + bounds.maxLng) / 2
  const centerLat = (bounds.minLat + bounds.maxLat) / 2
  const initialViewState = {
    longitude: centerLng,
    latitude: centerLat,
    zoom: 13,
  }

  const handleDetailsClick = () => {
    router.push(`/booking/tripdetail/${trip._id}`)
  }

  const waypointsWithCoords = trip.waypoints.map((wp, index) => ({
    ...wp,
    coordinates:
      wp.coordinates.length === 2 &&
      isValidCoordinates([wp.coordinates as [number, number]])
        ? wp.coordinates
        : index === 0
        ? trip.startPoint.coordinates
        : index === trip.waypoints.length - 1
        ? trip.endPoint.coordinates
        : [],
  }))

  const routeSteps =
    directions?.routes?.[trip.routeIndex]?.legs?.[0]?.steps || []

  const fallbackRouteSteps = [
    {
      maneuver: { instruction: `Bắt đầu tại ${waypointsWithCoords[0].name}` },
      distance: 0,
      name: waypointsWithCoords[0].name,
    },
    {
      maneuver: {
        instruction: `Đến đích tại ${
          waypointsWithCoords[waypointsWithCoords.length - 1].name
        }`,
      },
      distance: trip.distance,
      name: waypointsWithCoords[waypointsWithCoords.length - 1].name,
    },
  ]

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
                            <span>{(trip.duration / 60).toFixed(0)} phút</span>
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

                              {/* Start Marker */}
                              <Marker
                                longitude={trip.startPoint.coordinates[0]}
                                latitude={trip.startPoint.coordinates[1]}
                              >
                                <div className="relative">
                                  <div className="w-7 h-7 bg-green-500 rounded-full border-2 border-white shadow-lg" />
                                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-white rounded-md shadow-sm text-sm font-medium">
                                    Điểm đón
                                  </div>
                                </div>
                              </Marker>

                              {/* End Marker */}
                              <Marker
                                longitude={trip.endPoint.coordinates[0]}
                                latitude={trip.endPoint.coordinates[1]}
                              >
                                <div className="relative">
                                  <div className="w-7 h-7 bg-red-500 rounded-full border-2 border-white shadow-lg" />
                                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-white rounded-md shadow-sm text-sm font-medium">
                                    Điểm đến
                                  </div>
                                </div>
                              </Marker>

                              {/* Waypoints */}
                              {waypointsWithCoords
                                .filter(
                                  (wp, index) =>
                                    index !== 0 &&
                                    index !== waypointsWithCoords.length - 1
                                )
                                .map((wp) => (
                                  <Marker
                                    key={wp._id}
                                    longitude={wp.coordinates[0]}
                                    latitude={wp.coordinates[1]}
                                  >
                                    <div className="relative">
                                      <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md" />
                                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-white rounded-md shadow-sm text-sm font-medium">
                                        {wp.name.split(',')[0]}
                                      </div>
                                    </div>
                                  </Marker>
                                ))}

                              {selectedWaypoint && (
                                <Popup
                                  longitude={selectedWaypoint.longitude}
                                  latitude={selectedWaypoint.latitude}
                                  onClose={() => setSelectedWaypoint(null)}
                                  closeButton={false}
                                  anchor="bottom"
                                  className="[&>div]:!p-2 [&>div]:!rounded-lg [&>div]:!shadow-lg"
                                >
                                  <div className="max-w-xs">
                                    <p className="text-sm font-medium text-foreground">
                                      {selectedWaypoint.name}
                                    </p>
                                    <button
                                      onClick={() => setSelectedWaypoint(null)}
                                      className="absolute top-1 right-1 p-1 rounded-full hover:bg-muted"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </Popup>
                              )}
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
                                  Giờ đến
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
                                  {(routeSteps.length > 0
                                    ? routeSteps
                                    : fallbackRouteSteps
                                  ).map((step: any, index: number) => (
                                    <li key={index} className="relative pl-8">
                                      <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm"></div>
                                      <div className="text-sm">
                                        <p className="font-medium text-foreground">
                                          {step.maneuver?.instruction ||
                                            step.name}
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
