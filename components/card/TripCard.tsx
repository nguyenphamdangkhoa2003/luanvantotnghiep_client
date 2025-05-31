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

const calculateArrivalTime = (startTime?: string, duration?: number): string => {
  if (!startTime || duration === undefined) return 'N/A'
  try {
    const startDate = new Date(startTime)
    const arrivalDate = addSeconds(startDate, duration)
    return isValid(arrivalDate) ? format(arrivalDate, 'HH:mm - dd/MM/yyyy') : 'N/A'
  } catch (error) {
    return 'N/A'
  }
}

const formatAddress = (name: string): string => {
  return name.split(',').slice(0, 2).join(',').trim()
}

const getInitials = (name: string): string => {
  return name.split(' ')
    .map(n => n.charAt(0))
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
    coords[0] >= -180 &&
    coords[0] <= 180 &&
    coords[1] >= -90 &&
    coords[1] <= 90
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
  const pickupAddress = formatAddress(trip.waypoints[0]?.name || 'Không xác định')
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
  const isFull = trip.seatsAvailable === 0

  // Validate data
  if (!trip.waypoints || trip.waypoints.length === 0) {
    return (
      <Card className="border border-gray-200 rounded-lg bg-gray-50 p-4">
        <p className="text-yellow-600">Chưa có dữ liệu điểm dừng</p>
      </Card>
    )
  }

  if (!trip.startPoint?.coordinates || !trip.endPoint?.coordinates || !trip.path?.coordinates) {
    return (
      <Card className="border border-gray-200 rounded-lg bg-gray-50 p-4">
        <p className="text-red-500">Lỗi: Dữ liệu chuyến đi không hợp lệ</p>
      </Card>
    )
  }

  // Safe waypoints processing
  const safeWaypoints = trip.waypoints.map(wp => ({
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
      className={`border border-gray-200 rounded-lg transition-all hover:shadow-md ${
        isFull ? 'bg-gray-50 opacity-80' : 'bg-white'
      } hover:border-blue-300`}
    >
      <CardContent className="px-4">
        {/* Main content */}
        <div className="flex flex-row sm:flex-row gap-4">
          {/* Left Section - Pickup and Driver */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {pickupAddress}
              </h3>
              <div className="flex items-center mt-1 text-blue-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">{departureTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
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
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {driverInitials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{driverName}</p>
                <div className="flex items-center">
                  <Star className="fill-yellow-400 text-yellow-400 w-4 h-4" />
                  <span className="text-sm ml-1 font-medium text-gray-700">
                    {driverRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section - Arrow */}
          <div className="hidden sm:flex items-center justify-center px-2">
            <MdArrowRight className="text-gray-400 w-6 h-6" />
          </div>

          {/* Right Section - Dropoff */}
          <div className="flex-1">
            <div className="text-right">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {dropoffAddress}
              </h3>
              <div className="flex items-center justify-end mt-1 text-blue-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">{arrivalTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-4 border-gray-200" />

        {/* Bottom Action Buttons */}
        <div className="flex justify-between items-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isFull
                ? 'bg-red-100 text-red-600'
                : trip.seatsAvailable > 2
                ? 'bg-green-100 text-green-600'
                : 'bg-yellow-100 text-yellow-600'
            }`}
          >
            {isFull ? 'Hết chỗ' : `Còn ${trip.seatsAvailable} chỗ`}
          </span>

          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-gray-600 hover:text-blue-600 hover:border-blue-300 flex items-center gap-2"
                >
                  <MapIcon className="w-4 h-4" />
                  <span>Xem bản đồ</span>
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
              className={`${
                isFull
                  ? 'bg-gray-300 text-gray-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
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