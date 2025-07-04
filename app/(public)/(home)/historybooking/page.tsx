'use client'
import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  getBookingHistoryQueryFn,
  cancelBookingMutationFn,
} from '@/api/routes/route'

const HistoryTripPage = () => {
  const queryClient = useQueryClient()
  const [cancelRequestId, setCancelRequestId] = React.useState<string | null>(
    null
  )
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false)

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

  const cancelMutation = useMutation({
    mutationFn: cancelBookingMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingHistory'] })
      toast.success('Hủy yêu cầu đặt chỗ thành công')
      setIsCancelDialogOpen(false)
      setCancelRequestId(null)
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Không thể hủy yêu cầu đặt chỗ'
      )
    },
  })

  const handleCancelRequest = (requestId: string) => {
    setCancelRequestId(requestId)
    setIsCancelDialogOpen(true)
  }

  const confirmCancel = () => {
    if (cancelRequestId) {
      cancelMutation.mutate({ requestId: cancelRequestId })
    }
  }

  const tripHistory = React.useMemo(() => {
    if (!bookings) return []

    return bookings.map((booking: any, index: number) => {
      const startTime = new Date(booking.routeId.startTime)
      const endTime = new Date(booking.routeId.endTime)

      // Extract from and to from waypoints or route name
      const from =
        booking.routeId.startPoint?.name ||
        booking.routeId.waypoints?.[0]?.name ||
        booking.routeId.name?.split(' - ')[0] ||
        'Không có'
      const to =
        booking.routeId.endPoint?.name ||
        booking.routeId.waypoints?.[booking.routeId.waypoints.length - 1]
          ?.name ||
        booking.routeId.name?.split(' - ')[1] ||
        booking.routeId.name ||
        'Không có'

      // Construct vehicle string
      const vehicleData = booking.routeId.userId?.vehicles?.[0]
      const vehicle = vehicleData
        ? `${vehicleData.model} (${vehicleData.licensePlate})`
        : 'Không có'

      // Handle cases where requestId is null
      const bookingDate = booking.requestId?.createdAt
        ? new Date(booking.requestId.createdAt)
        : new Date(booking.createdAt)

      // Determine display status: prioritize request status for passenger
      const status = booking.requestId?.status || booking.routeId.status

      // Format date and time for departure and arrival
      const isSameDay = startTime.toDateString() === endTime.toDateString()
      const departureDateTime = startTime.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      const arrivalDateTime = endTime.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })

      return {
        id: booking.requestId?._id || booking._id || `temp-${index}`,
        bookingDate: bookingDate.toLocaleDateString('vi-VN'),
        tripDate: startTime.toLocaleDateString('vi-VN'),
        departureDateTime,
        arrivalDateTime,
        isSameDay,
        from,
        to,
        driver: booking.routeId.userId?.name || 'Không có',
        status,
        routeStatus: booking.routeId.status,
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
        <div className="space-y-6 mb-1">
          {paginatedTrips.map((trip: any) => (
            <Card key={trip.id} className="hover:shadow-md transition-shadow py-3">
              <CardHeader >
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-1">
                    <span>Chuyến #{trip.id.slice(-6)}</span>
                    <Badge
                      variant={
                        trip.status === 'completed' ||
                        trip.status === 'Hoàn thành'
                          ? 'success'
                          : trip.status === 'cancelled' || trip.status === 'Hủy'
                          ? 'destructive'
                          : trip.status === 'accepted'
                          ? 'default'
                          : 'secondary'
                      }
                      className="flex items-center gap-1"
                    >
                      {trip.status === 'completed' ||
                      trip.status === 'Hoàn thành' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {trip.status === 'completed'
                        ? 'Hoàn thành'
                        : trip.status === 'cancelled'
                        ? 'Hủy'
                        : trip.status === 'accepted'
                        ? 'Đã chấp nhận'
                        : trip.status}
                    </Badge>
                  </CardTitle>
                  <Badge variant="outline" className="text-sm">
                    Tuyến: {trip.routeStatus}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid gap-2">
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
                        <p className="text-sm text-muted-foreground">Ngày đi</p>
                        <p className="font-medium">{trip.tripDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Giờ đi</p>
                        <p className="font-medium">{trip.departureDateTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Giờ đến</p>
                        <p className="font-medium">{trip.arrivalDateTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tài xế</p>
                        <p className="font-medium">{trip.driver}</p>
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="border-t pt-2">
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

              <CardFooter className=" justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {trip.vehicle}
                </div>
                {trip.status === 'accepted' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      handleCancelRequest(trip.id)
                    }}
                  >
                    Hủy yêu cầu
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận hủy yêu cầu</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy yêu cầu đặt chỗ này? Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang hủy...
                </>
              ) : (
                'Xác nhận'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
    </div>
  )
}

export default HistoryTripPage
