
'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import TripCard from '@/components/card/TripCard'
import SearchTrip from '@/components/form/SearchTripForm'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

// Define Trip type based on TripCardProps from TripCard.tsx
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

export default function BookingPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const pickup = searchParams.get('pickup')
    const dropoff = searchParams.get('dropoff')
    const date = searchParams.get('date')
    const passengers = searchParams.get('passengers')

    // Load stored results from localStorage
    try {
      const storedResults = localStorage.getItem('searchResults')
      if (storedResults) {
        const parsedResults = JSON.parse(storedResults)
        setTrips(parsedResults)
        localStorage.removeItem('searchResults')
      }
    } catch (error) {
      console.error('Error parsing searchResults from localStorage:', error)
    }

    // Save search parameters to localStorage
    if (pickup && dropoff && date && passengers) {
      try {
        localStorage.setItem(
          'searchTripForm',
          JSON.stringify({
            pickup,
            dropoff,
            date,
            passengers: Number.isNaN(parseInt(passengers)) ? 1 : parseInt(passengers),
          })
        )
      } catch (error) {
        console.error('Error saving searchTripForm to localStorage:', error)
      }
    }
  }, [searchParams])

  const handleSearchResults = (results: Trip[]) => {
    setTrips(results)
  }

  return (
    <div className="mx-auto p-4 md:p-6 bg-[var(--background)] min-h-screen">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center text-sm text-[var(--muted-foreground)] mb-2 mt-8 max-w-[90%] mx-auto"
      >
        <Link
          href="/"
          className="flex text-[var(--primary)] items-center hover:underline"
          aria-label="Trang chủ"
        >
          <Home className="w-4 h-4 mr-1" />
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4 mx-2 text-[var(--muted-foreground)]" aria-hidden="true" />
        <span className="font-normal" aria-current="page">
          Kết quả tìm kiếm
        </span>
      </nav>

      {/* Search Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-6 text-center">
          <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
            Tìm chuyến đi phù hợp
          </span>
        </h1>
        <SearchTrip onSearchResults={handleSearchResults} />
      </div>

      {/* Trips List */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          <span className="text-[var(--primary)]">Chuyến đi có sẵn</span>
          <span className="text-[var(--muted-foreground)] text-base ml-2">
            ({trips.length} kết quả)
          </span>
        </h2>

        {trips.length === 0 ? (
          <div
            className="text-[var(--destructive)] p-4 rounded bg-[var(--destructive)/10]"
            role="alert"
          >
            <p>Không tìm thấy tuyến đường bạn muốn</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {trips.map((trip, index) => (
              <TripCard key={trip._id || `trip-${index}`} {...trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}