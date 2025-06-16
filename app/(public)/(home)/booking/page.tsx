
'use client'

import {
  ChevronDown,
  ChevronRight,
  Compass,
  Home,
  Loader2,
  Filter,
  AlertCircle,
  Check,
} from 'lucide-react'
import Link from 'next/link'
import TripCard from '@/components/card/TripCard'
import SearchTrip from '@/components/form/SearchTripForm'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { searchRoutesQueryFn } from '@/api/routes/route'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Define Trip type
interface Trip {
  _id: string
  userId: {
    name: string
    avatar: string
    averageRating: number
  } | null
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

// Define filter type
interface FilterState {
  minPrice?: number
  maxPrice?: number
  minSeats?: number
  minRating?: number
}

// Define sort options
type SortOption = 'price:asc' | 'price:desc' | 'seats:asc' | 'seats:desc'

export default function BookingPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterState>(() => {
    const stored = localStorage.getItem('searchTripFilter')
    return stored ? JSON.parse(stored) : {}
  })
  const [sortBy, setSortBy] = useState<SortOption | null>(() => {
    const stored = localStorage.getItem('searchTripSort')
    return stored ? (stored as SortOption) : null
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const searchParams = useSearchParams()

  // Hàm xác thực tọa độ
  const isValidCoords = (coords: any): coords is [number, number] => {
    return (
      Array.isArray(coords) &&
      coords.length === 2 &&
      typeof coords[0] === 'number' &&
      !isNaN(coords[0]) &&
      coords[0] >= -180 &&
      coords[0] <= 180 &&
      typeof coords[1] === 'number' &&
      !isNaN(coords[1]) &&
      coords[1] >= -90 &&
      coords[1] <= 90
    )
  }


  // Hàm tải kết quả từ API
  const loadSearchResults = async (searchData: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const startCoords = searchData.pickupCoords
      const endCoords = searchData.dropoffCoords

      if (!startCoords || !endCoords) {
        throw new Error('Tọa độ điểm đi hoặc điểm đến không hợp lệ.')
      }

      console.log('Sending to API:', { startCoords, endCoords, date: searchData.date, seatsAvailable: searchData.passengers })

      const response = await searchRoutesQueryFn({
        startCoords,
        endCoords,
        date: searchData.date,
        seatsAvailable: searchData.passengers,
      })
      setTrips(response.data)
      localStorage.setItem('searchResults', JSON.stringify(response.data))
    } catch (error: any) {
      console.error('Error loading search results:', error)
      setError(error.message || 'Đã có lỗi xảy ra khi tìm kiếm chuyến đi.')
      setTrips([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      const pickup = searchParams.get('pickup')
      const dropoff = searchParams.get('dropoff')
      const date = searchParams.get('date')
      const passengers = searchParams.get('passengers')
      const pickupCoords = searchParams.get('pickupCoords')
      const dropoffCoords = searchParams.get('dropoffCoords')

      if (pickup && dropoff && date && passengers) {
        let parsedPickupCoords: [number, number] | null = null
        let parsedDropoffCoords: [number, number] | null = null

        try {
          if (pickupCoords) {
            const parsed = JSON.parse(pickupCoords)
            if (isValidCoords(parsed)) parsedPickupCoords = parsed
            else console.warn('Invalid pickupCoords from URL:', parsed)
          }
          if (dropoffCoords) {
            const parsed = JSON.parse(dropoffCoords)
            if (isValidCoords(parsed)) parsedDropoffCoords = parsed
            else console.warn('Invalid dropoffCoords from URL:', parsed)
          }
        } catch (e) {
          console.error('Error parsing coords from URL:', e)
        }

        const searchData = {
          pickup,
          dropoff,
          date,
          passengers: Number(passengers) || 1,
          pickupCoords: parsedPickupCoords,
          dropoffCoords: parsedDropoffCoords,
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
            searchData.passengers &&
            (!searchData.pickupCoords || isValidCoords(searchData.pickupCoords)) &&
            (!searchData.dropoffCoords || isValidCoords(searchData.dropoffCoords))
          ) {
            await loadSearchResults(searchData)

            const queryParams = new URLSearchParams({
              pickup: searchData.pickup,
              dropoff: searchData.dropoff,
              date: searchData.date,
              passengers: searchData.passengers.toString(),
              pickupCoords: JSON.stringify(searchData.pickupCoords || {}),
              dropoffCoords: JSON.stringify(searchData.dropoffCoords || {}),
            }).toString()

            window.history.replaceState(null, '', `?${queryParams}`)
          } else {
            setTrips([])
            setIsLoading(false)
          }
        } else {
          setTrips([])
          setIsLoading(false)
        }
      }
    }

    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams.get('pickup'),
    searchParams.get('dropoff'),
    searchParams.get('date'),
    searchParams.get('passengers'),
    searchParams.get('pickupCoords'),
    searchParams.get('dropoffCoords'),
  ])

  const handleSearchResults = (results: Trip[]) => {
    setTrips(results)
    setError(null)
    setIsLoading(false)
    localStorage.setItem('searchResults', JSON.stringify(results))
  }

  // Lọc và sắp xếp trips
  const filteredTrips = trips
    .filter((trip) => {
      if (filter.minPrice && trip.price < filter.minPrice) return false
      if (filter.maxPrice && trip.price > filter.maxPrice) return false
      if (filter.minSeats && trip.seatsAvailable < filter.minSeats) return false
      if (filter.minRating && (!trip.userId || trip.userId.averageRating < filter.minRating)) return false
      return true
    })
    .sort((a, b) => {
      if (!sortBy) return 0
      const [field, direction] = sortBy.split(':') as [string, 'asc' | 'desc']
      if (field === 'price') {
        return direction === 'asc' ? a.price - b.price : b.price - a.price
      } else if (field === 'seats') {
        return direction === 'asc'
          ? a.seatsAvailable - b.seatsAvailable
          : b.seatsAvailable - a.seatsAvailable
      }
      return 0
    })

  // Xử lý áp dụng bộ lọc
  const handleApplyFilter = (newFilter: FilterState) => {
    setFilter(newFilter)
    localStorage.setItem('searchTripFilter', JSON.stringify(newFilter))
    setIsFilterOpen(false)
  }

  // Xử lý xóa bộ lọc
  const handleResetFilter = () => {
    const newFilter = {}
    setFilter(newFilter)
    localStorage.setItem('searchTripFilter', JSON.stringify(newFilter))
    setIsFilterOpen(false)
  }

  // Xử lý thay đổi sắp xếp
  const handleSort = (option: SortOption) => {
    setSortBy(option)
    localStorage.setItem('searchTripSort', option)
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
        <ChevronRight
          className="w-4 h-4 mx-2 text-[var(--muted-foreground)]"
          aria-hidden="true"
        />
        <span className="font-normal" aria-current="page">
          Kết quả tìm kiếm
        </span>
      </nav>

      {/* Search Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-6 text-center">
          <span className="text-primary">Tìm chuyến đi phù hợp</span>
        </h1>
        <SearchTrip onSearchResults={handleSearchResults} />
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Chuyến đi có sẵn
              <span className="ml-2 text-primary font-normal">
                ({filteredTrips.length} kết quả)
              </span>
            </h2>
            {searchParams.get('pickup') && searchParams.get('dropoff') && (
              <p className="text-sm text-gray-500 mt-1">
                Từ <span className="font-medium">{searchParams.get('pickup')}</span>{' '}
                đến <span className="font-medium">{searchParams.get('dropoff')}</span>
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="w-4 h-4" />
                  <span>Lọc</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Lọc chuyến đi</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="minPrice">Giá tối thiểu (VNĐ)</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      placeholder="Ví dụ: 100000"
                      defaultValue={filter.minPrice || ''}
                      min={0}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxPrice">Giá tối đa (VNĐ)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="Ví dụ: 500000"
                      defaultValue={filter.maxPrice || ''}
                      min={0}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minSeats">Số chỗ tối thiểu</Label>
                    <Input
                      id="minSeats"
                      type="number"
                      placeholder="Ví dụ: 1"
                      defaultValue={filter.minSeats || ''}
                      min={1}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minRating">Số sao tối thiểu</Label>
                    <Input
                      id="minRating"
                      type="number"
                      step="0.5"
                      placeholder="Ví dụ: 4.0"
                      defaultValue={filter.minRating || ''}
                      min={1}
                      max={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleResetFilter}>
                    Xóa bộ lọc
                  </Button>
                  <Button
                    onClick={() => {
                      const newFilter = {
                        minPrice: Number(
                          (document.getElementById('minPrice') as HTMLInputElement)?.value
                        ) || undefined,
                        maxPrice: Number(
                          (document.getElementById('maxPrice') as HTMLInputElement)?.value
                        ) || undefined,
                        minSeats: Number(
                          (document.getElementById('minSeats') as HTMLInputElement)?.value
                        ) || undefined,
                        minRating: Number(
                          (document.getElementById('minRating') as HTMLInputElement)?.value
                        ) || undefined,
                      }
                      handleApplyFilter(newFilter)
                    }}
                  >
                    Áp dụng
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <span>Sắp xếp</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort('price:asc')}>
                  <div className="flex items-center w-full">
                    <span>Giá: Thấp đến cao</span>
                    {sortBy === 'price:asc' && <Check className="w-4 h-4 ml-auto" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('price:desc')}>
                  <div className="flex items-center w-full">
                    <span>Giá: Cao đến thấp</span>
                    {sortBy === 'price:desc' && <Check className="w-4 h-4 ml-auto" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('seats:asc')}>
                  <div className="flex items-center w-full">
                    <span>Số chỗ: Thấp đến cao</span>
                    {sortBy === 'seats:asc' && <Check className="w-4 h-4 ml-auto" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('seats:desc')}>
                  <div className="flex items-center w-full">
                    <span>Số chỗ: Cao đến thấp</span>
                    {sortBy === 'seats:desc' && <Check className="w-4 h-4 ml-auto" />}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content section */}
        <div className="space-y-4">
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 rounded-lg bg-gray-50">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-gray-600">Đang tìm kiếm chuyến đi...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex flex-col items-center text-center">
              <AlertCircle className="w-5 h-5 text-red-500 mb-2" />
              <p className="text-red-600 font-medium">Không tim thấy tuyến đường bạn muốn, vui lòng thử lại!</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filteredTrips.length === 0 && (
            <div className="p-6 rounded-lg bg-blue-50 border border-blue-100 flex flex-col items-center text-center">
              <Compass className="w-5 h-5 text-blue-500 mb-2" />
              <h3 className="font-medium text-blue-700">Không tìm thấy chuyến đi</h3>
              <p className="text-sm text-blue-600 mt-1 max-w-md">
                Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc
              </p>
            </div>
          )}

          {/* Results list */}
          {!isLoading && !error && filteredTrips.length > 0 && (
            <>
              <div className="grid gap-4">
                {filteredTrips.map((trip:any) => (
                  <TripCard key={trip._id} {...trip} />
                ))}
              </div>

              {filteredTrips.length >= 5 && (
                <div className="flex justify-center mt-4">
                  <Button variant="outline" size="sm">
                    Xem thêm chuyến đi
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
