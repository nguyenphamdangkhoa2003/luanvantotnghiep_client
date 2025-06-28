'use client'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getBookingHistoryQueryFn } from '@/api/routes/route'

const HistoryTripPage = () => {
  // Fetch booking history using React Query
  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['bookingHistory'],
    queryFn: getBookingHistoryQueryFn,
    select: (data) => data.data,
  })

  const tripHistory = React.useMemo(() => {
    if (!bookings) return []

    return bookings.map((booking: any, index: number) => {
      const startTime = new Date(booking.routeId.startTime)
      const durationMs = booking.routeId.duration * 1000
      const endTime = new Date(startTime.getTime() + durationMs)

      // Extract from and to from waypoints or route name
      const from =
        booking.routeId.waypoints?.[0]?.name ||
        booking.routeId.name.split(' - ')[0] ||
        'Không có'
      const to =
        booking.routeId.waypoints?.[booking.routeId.waypoints.length - 1]
          ?.name ||
        booking.routeId.name.split(' - ')[1] ||
        booking.routeId.name ||
        'Không có'

      // Map status to Vietnamese
      const statusMap: { [key: string]: string } = {
        accepted: 'Hoàn thành',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
        rejected: 'Đã bị từ chối',
        pending: 'Đang chờ',
      }

      // Construct vehicle string
      const vehicleData = booking.routeId.userId?.vehicles?.[0]
      const vehicle = vehicleData
        ? `${vehicleData.model} (${vehicleData.licensePlate})`
        : 'Không có'

      // Handle cases where requestId is null
      const bookingDate = booking.requestId?.createdAt
        ? new Date(booking.requestId.createdAt)
        : new Date(booking.createdAt)
      const status = booking.requestId?.status || booking.routeId.status

      return {
        id: booking.requestId?._id || booking._id || `temp-${index}`, // Fallback for missing requestId
        bookingDate: bookingDate.toLocaleDateString('vi-VN'), // e.g., 26/06/2025
        tripDate: startTime.toLocaleDateString('vi-VN'), // e.g., 30/06/2025
        departureTime: startTime.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }), // e.g., 01:00
        arrivalTime: endTime.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }), // e.g., 04:14
        from,
        to,
        driver: booking.routeId.userId?.name || 'Không có',
        status: statusMap[status] || status,
        vehicle,
      }
    })
  }, [bookings])

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(tripHistory.length / itemsPerPage)
  const paginatedTrips = tripHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 pt-16 px-4 max-w-4xl text-center">
        <p>Đang tải...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 pt-16 px-4 max-w-4xl text-center">
        <p className="text-red-500">Lỗi: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 pt-16 px-4 max-w-4xl">
      {/* Header section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Lịch sử chuyến đi
        </h1>
        <p className="text-muted-foreground">
          Xem lại các chuyến đi bạn đã đặt
        </p>
      </div>

      {/* Trip cards */}
      {tripHistory.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Không tìm thấy chuyến đi nào.
        </p>
      ) : (
        <div className="space-y-6 mb-8">
          {paginatedTrips.map((trip:any) => (
            <Card key={trip.id} className="hover:shadow-md transition-shadow">
              <Link href={`/trips/${trip.id}`} className="block">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>Chuyến #{trip.id}</span>
                      <Badge
                        variant={
                          trip.status === 'Hoàn thành'
                            ? 'success'
                            : 'destructive'
                        }
                        className="flex items-center gap-1"
                      >
                        {trip.status === 'Hoàn thành' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {trip.status}
                      </Badge>
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid gap-4">
                    {/* Booking and trip info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Ngày đặt
                          </p>
                          <p className="font-medium">{trip.bookingDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Ngày đi
                          </p>
                          <p className="font-medium">{trip.tripDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Giờ đi → đến
                          </p>
                          <p className="font-medium">
                            {trip.departureTime} → {trip.arrivalTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Tài xế
                          </p>
                          <p className="font-medium">{trip.driver}</p>
                        </div>
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="border-t pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-secondary mt-1">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div className="grid gap-2 flex-1">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                Điểm đón
                              </p>
                              <p className="font-medium">{trip.from}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground mt-5" />
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                Điểm đến
                              </p>
                              <p className="font-medium">{trip.to}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {trip.vehicle}
                  </div>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) setCurrentPage(currentPage - 1)
                }}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === pageNum}
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(pageNum)
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                }}
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default HistoryTripPage
