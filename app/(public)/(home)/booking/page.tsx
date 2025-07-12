'use client'

import {
  ChevronRight,
  Home,
  Filter,
  Star,
  Users,
  Clock,
  Move,
  Calendar,
  MapPin,
} from 'lucide-react'
import Link from 'next/link'
import TripCard from '@/components/card/TripCard'
import SearchTrip from '@/components/form/SearchTripForm'
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { searchRoutesQueryFn } from '@/api/routes/route'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { UserLocationContext } from '@/hooks/use-user-location-context'
import { IUserLocation } from '@/types/user-location'
import { point, lineString, pointToLineDistance } from '@turf/turf'

interface Trip {
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

export default function BookingPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [sortBy, setSortBy] = useState<string>('price-asc')
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000000])
  const [minSeats, setMinSeats] = useState<number>(1)
  const [minRating, setMinRating] = useState<number>(0)
  const [noPassengers, setNoPassengers] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const searchParams = useSearchParams()
  const [userLocation, setUserLocation] = useState<IUserLocation>()

  const departure = useMemo(() => {
    return JSON.parse(localStorage.getItem('searchTripForm') || '{}')
  }, [])
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

  const validatePickupCoords = (pickupCoords: any): boolean => {
    return (
      pickupCoords &&
      typeof pickupCoords.lng === 'number' &&
      typeof pickupCoords.lat === 'number' &&
      pickupCoords.lng >= -180 &&
      pickupCoords.lng <= 180 &&
      pickupCoords.lat >= -90 &&
      pickupCoords.lat <= 90
    )
  }
  function getUserLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location: ', error.message)
        }
      )
    } else {
      console.error('Geolocation is not supported by this browser.')
    }
  }

  useEffect(() => {
    getUserLocation()
  }, [])

  // Load search results from API
  const loadSearchResults = async (searchData: any) => {
    try {
      setLoading(true)
      const response = await searchRoutesQueryFn({
        startCoords: searchData.pickupCoords,
        endCoords: searchData.dropoffCoords,
        date: searchData.date,
        seatsAvailable: searchData.passengers,
        maxDistance: searchData.maxDistance,
      })

      setTrips(response.data)
      localStorage.setItem('searchResults', JSON.stringify(response.data))
    } catch (error) {
      setTrips([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTrips = useMemo(() => {
    let filtered = trips
      .map((trip) => {
        let userDistanceToRoute = null
        try {
          if (
            departure.pickupCoords &&
            validatePickupCoords(departure.pickupCoords) &&
            trip.path?.coordinates?.length > 0 &&
            trip.path.coordinates.every(validateCoordinates)
          ) {
            userDistanceToRoute = pointToLineDistance(
              point([departure.pickupCoords.lng, departure.pickupCoords.lat]),
              lineString(trip.path.coordinates),
              { units: 'kilometers' }
            )
          }
        } catch (error) {
          console.warn(`Invalid coordinates for trip ${trip._id}:`, error)
        }
        return { ...trip, userDistanceToRoute }
      })
      .filter(
        (trip) => trip.price >= priceRange[0] && trip.price <= priceRange[1]
      )
      .filter((trip) => trip.seatsAvailable >= minSeats)
      .filter((trip) => trip.userId.averageRating >= minRating)
      .filter((trip) => !noPassengers || trip.passengerCount === 0)

    switch (sortBy) {
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price)
      case 'seats-asc':
        return filtered.sort((a, b) => a.seatsAvailable - b.seatsAvailable)
      case 'seats-desc':
        return filtered.sort((a, b) => b.seatsAvailable - a.seatsAvailable)
      case 'distance-asc':
        return filtered.sort(
          (a, b) => (a.userDistanceToRoute ?? 0) - (b.userDistanceToRoute ?? 0)
        )
      case 'distance-desc':
        return filtered.sort(
          (a, b) => (b.userDistanceToRoute ?? 0) - (a.userDistanceToRoute ?? 0)
        )
      default:
        return filtered
    }
  }, [trips, priceRange, minRating, minSeats, noPassengers, sortBy, departure])

  useEffect(() => {
    const loadInitialData = async () => {
      // Load from localStorage to display cached results first
      const cachedResults = localStorage.getItem('searchResults')
      if (cachedResults) {
        setTrips(JSON.parse(cachedResults))
        setLoading(false)
      }

      // Continue with API call to ensure fresh data
      const pickup = searchParams.get('pickup')
      const dropoff = searchParams.get('dropoff')
      const date = searchParams.get('date')
      const passengers = searchParams.get('passengers')
      const pickupCoords = searchParams.get('pickupCoords')
      const dropoffCoords = searchParams.get('dropoffCoords')
      const maxDistanceParam = searchParams.get('maxDistance')

      if (pickup && dropoff && date && passengers) {
        const searchData = {
          pickup,
          dropoff,
          date,
          passengers: Number(passengers) || 1,
          pickupCoords: pickupCoords ? JSON.parse(pickupCoords) : null,
          dropoffCoords: dropoffCoords ? JSON.parse(dropoffCoords) : null,
          maxDistance: maxDistanceParam ? Number(maxDistanceParam) : 50,
        }

        localStorage.setItem('searchTripForm', JSON.stringify(searchData))
        await loadSearchResults(searchData)
      } else {
        const storedForm = localStorage.getItem('searchTripForm')
        if (storedForm) {
          const searchData = JSON.parse(storedForm)

          if (
            searchData.pickup &&
            searchData.dropoff &&
            searchData.date &&
            searchData.passengers
          ) {
            await loadSearchResults(searchData)

            const queryParams = new URLSearchParams({
              pickup: searchData.pickup,
              dropoff: searchData.dropoff,
              date: searchData.date,
              passengers: searchData.passengers.toString(),
              pickupCoords: JSON.stringify(searchData.pickupCoords || {}),
              dropoffCoords: JSON.stringify(searchData.dropoffCoords || {}),
              maxDistance: (searchData.maxDistance || 50).toString(),
            }).toString()

            window.history.replaceState(null, '', `?${queryParams}`)
          }
        }
      }
    }

    loadInitialData()
  }, [searchParams])

  const handleSearchResults = (results: Trip[]) => {
    setTrips(results)
    localStorage.setItem('searchResults', JSON.stringify(results))
  }
  const pickup = searchParams.get('pickup')
  const dropoff = searchParams.get('dropoff')
  const date = searchParams.get('date')
  const passengers = searchParams.get('passengers')
  const maxDistanceParam = searchParams.get('maxDistance')
  return (
    <UserLocationContext.Provider value={{ userLocation, setUserLocation }}>
      <div
        className="mx-auto p-4 md:p-6 min-h-screen"
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center text-sm mb-4 mt-6"
            style={{ color: 'var(--mutedForeground)' }}
          >
            <Link
              href="/"
              className="flex items-center hover:underline"
              style={{ color: 'var(--primary)' }}
              aria-label="Trang chủ"
            >
              <Home className="w-4 h-4 mr-1" />
              Trang chủ
            </Link>
            <ChevronRight
              className="w-4 h-4 mx-2"
              style={{ color: 'var(--muted)' }}
              aria-hidden="true"
            />
            <span style={{ color: 'var(--foreground)' }} aria-current="page">
              Kết quả tìm kiếm
            </span>
          </nav>

          {/* Search Section */}
          <div
            className="mb-2 p-6"
            style={{
              backgroundColor: 'var(--card)',
              color: 'var(--cardForeground)',
            }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-6 justify-center flex">
              <span className="text-primary">Tìm chuyến đi phù hợp</span>
            </h1>
            <SearchTrip onSearchResults={handleSearchResults} />
          </div>
          {/* Enhanced Search Parameters Display */}
          {(pickup || dropoff || date || passengers || maxDistanceParam) && (
            <div
              className="mb-6 p-6 rounded-xl shadow-sm border"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-primary" />
                Thông tin tìm kiếm
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {pickup && (
                  <div
                    className="p-3 rounded-lg transition-all hover:shadow-md"
                    style={{
                      backgroundColor: 'var(--secondary)',
                      border: '1px solid var(--input)',
                    }}
                  >
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Điểm đón
                        </p>
                        <p className="font-medium">{pickup}</p>
                      </div>
                    </div>
                  </div>
                )}

                {dropoff && (
                  <div
                    className="p-3 rounded-lg transition-all hover:shadow-md"
                    style={{
                      backgroundColor: 'var(--secondary)',
                      border: '1px solid var(--input)',
                    }}
                  >
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Điểm đến
                        </p>
                        <p className="font-medium">{dropoff}</p>
                      </div>
                    </div>
                  </div>
                )}

                {date && (
                  <div
                    className="p-3 rounded-lg transition-all hover:shadow-md"
                    style={{
                      backgroundColor: 'var(--secondary)',
                      border: '1px solid var(--input)',
                    }}
                  >
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Ngày đi
                        </p>
                        <p className="font-medium">
                          {new Date(date).toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {passengers && (
                  <div
                    className="p-3 rounded-lg transition-all hover:shadow-md"
                    style={{
                      backgroundColor: 'var(--secondary)',
                      border: '1px solid var(--input)',
                    }}
                  >
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Hành khách
                        </p>
                        <p className="font-medium">{passengers} người</p>
                      </div>
                    </div>
                  </div>
                )}

                {maxDistanceParam && (
                  <div
                    className="p-3 rounded-lg transition-all hover:shadow-md"
                    style={{
                      backgroundColor: 'var(--secondary)',
                      border: '1px solid var(--input)',
                    }}
                  >
                    <div className="flex items-center">
                      <Move className="w-5 h-5 mr-2 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Khoảng cách
                        </p>
                        <p className="font-medium">{maxDistanceParam} m</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Sidebar */}
            <div className="lg:w-1/4 space-y-4">
              <div
                className="p-4 rounded-lg shadow-sm"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              >
                <h3
                  className="font-semibold text-lg mb-4 flex items-center"
                  style={{ color: 'var(--foreground)' }}
                >
                  <Filter
                    className="w-5 h-5 mr-2"
                    style={{ color: 'var(--primary)' }}
                  />
                  Bộ lọc
                </h3>

                {/* Price Filter */}
                <div className="mb-6">
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Khoảng giá (VNĐ)
                  </label>
                  <Slider
                    min={0}
                    max={5000000}
                    step={10000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-2"
                    style={
                      {
                        '--slider-track-background': 'var(--muted)',
                        '--slider-thumb-background': 'var(--primary)',
                      } as any
                    }
                  />
                  <div
                    className="flex justify-between text-sm mt-2"
                    style={{ color: 'var(--mutedForeground)' }}
                  >
                    <span>{priceRange[0].toLocaleString()} VNĐ</span>
                    <span>{priceRange[1].toLocaleString()} VNĐ</span>
                  </div>
                </div>

                {/* Seats Filter */}
                <div className="mb-6">
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Số ghế tối thiểu
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={minSeats}
                    onChange={(e) => setMinSeats(Number(e.target.value) || 1)}
                    className="w-full"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Đánh giá tối thiểu
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setMinRating(star)}
                        className={`p-1 rounded ${
                          minRating >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                    {minRating > 0 && (
                      <button
                        onClick={() => setMinRating(0)}
                        className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>

                {/* No Passengers Filter */}
                <div className="mb-6">
                  <label
                    className="flex items-center text-sm font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <input
                      type="checkbox"
                      checked={noPassengers}
                      onChange={(e) => setNoPassengers(e.target.checked)}
                      className="mr-2 h-4 w-4 text-[var(--primary)] border-[var(--border)] rounded focus:ring-[var(--primary)]"
                    />
                    Chỉ hiển thị chuyến đi không có hành khách
                  </label>
                </div>
              </div>
            </div>

            {/* Trips List */}
            <div className="lg:w-3/4 space-y-4">
              {/* Sort and Results Header */}
              <div
                className="p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              >
                <h2
                  className="text-xl font-bold"
                  style={{ color: 'var(--foreground)' }}
                >
                  <span style={{ color: 'var(--primary)' }}>
                    Chuyến đi có sẵn
                  </span>
                  <span
                    className="text-base ml-2"
                    style={{ color: 'var(--mutedForeground)' }}
                  >
                    ({filteredTrips.length} kết quả)
                  </span>
                </h2>

                <div className="w-full sm:w-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger
                      className="w-full sm:w-[200px]"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)',
                      }}
                    >
                      <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        backgroundColor: 'var(--popover)',
                        color: 'var(--popoverForeground)',
                      }}
                    >
                      <SelectItem value="price-asc">
                        Giá: Thấp đến cao
                      </SelectItem>
                      <SelectItem value="price-desc">
                        Giá: Cao đến thấp
                      </SelectItem>
                      <SelectItem value="seats-asc">
                        Ghế: Ít đến nhiều
                      </SelectItem>
                      <SelectItem value="seats-desc">
                        Ghế: Nhiều đến ít
                      </SelectItem>
                      <SelectItem value="distance-asc">Gần bạn nhất</SelectItem>
                      <SelectItem value="distance-desc">Xa bạn nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* No Results */}
              {!loading && filteredTrips.length === 0 && (
                <div
                  className="bg-red-50 text-red-700 p-6 rounded-lg border border-red-100 flex flex-col items-center justify-center py-12"
                  role="alert"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mb-4 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="font-medium text-lg mb-2">
                    Không tìm thấy chuyến đi phù hợp
                  </h3>
                  <p className="text-center text-gray-600 max-w-md">
                    Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với điểm đón/trả
                    khác
                  </p>
                </div>
              )}

              {/* Results List */}
              {!loading && filteredTrips.length > 0 && (
                <div className="grid gap-4">
                  {filteredTrips.map((trip, index) => (
                    <div
                      key={trip._id || `trip-${index}`}
                      className="rounded-lg transition-shadow"
                      style={{
                        backgroundColor: 'var(--card)',
                        color: 'var(--cardForeground)',
                      }}
                    >
                      <TripCard {...trip} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLocationContext.Provider>
  )
}
