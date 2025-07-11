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
  Calendar,
  Clock,
  MapPin,
  User,
  XCircle,
  CheckCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

const HistoryTripPage = () => {
  const queryClient = useQueryClient()
  const [cancelRequestId, setCancelRequestId] = React.useState<string | null>(
    null
  )
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false)
  const [isFilterOpen, setIsFilterOpen] = React.useState(true) // Mặc định mở trên desktop

  // Filter states
  const [filterStatus, setFilterStatus] = React.useState<string>('all')
  const [filterFromDate, setFilterFromDate] = React.useState<string>('')
  const [filterToDate, setFilterToDate] = React.useState<string>('')

  // Fetch booking history
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
      toast.success('Hủy chuyến thành công')
      setIsCancelDialogOpen(false)
      setCancelRequestId(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể hủy chuyến')
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

      const from =
        booking.routeId.startPoint?.name ||
        booking.routeId.waypoints?.[0]?.name ||
        booking.routeId.name?.split(' - ')[0] ||
        'Không xác định'
      const to =
        booking.routeId.endPoint?.name ||
        booking.routeId.waypoints?.[booking.routeId.waypoints.length - 1]
          ?.name ||
        booking.routeId.name?.split(' - ')[1] ||
        booking.routeId.name ||
        'Không xác định'

      const vehicleData = booking.routeId.userId?.vehicles?.[0]
      const vehicle = vehicleData
        ? `${vehicleData.model} (${vehicleData.licensePlate})`
        : 'Không xác định'

      const bookingDate = booking.requestId?.createdAt
        ? new Date(booking.requestId.createdAt)
        : new Date(booking.createdAt)

      const status = booking.requestId?.status || booking.routeId.status

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
        bookingDate,
        bookingDateStr: bookingDate.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        tripDate: startTime.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        departureDateTime,
        arrivalDateTime,
        from,
        to,
        driver: booking.routeId.userId?.name || 'Không xác định',
        status,
        routeStatus: booking.routeId.status,
        vehicle,
        price: booking.routeId.price
          ? new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(booking.routeId.price)
          : 'Liên hệ',
        seats: booking.seats || 1,
      }
    })
  }, [bookings])

  // Filtered trip history
  const filteredTripHistory = React.useMemo(() => {
    return tripHistory.filter((trip:any) => {
      if (filterStatus !== 'all' && trip.status !== filterStatus) return false
      if (filterFromDate) {
        const fromDate = new Date(filterFromDate)
        if (trip.bookingDate < fromDate) return false
      }
      if (filterToDate) {
        const toDate = new Date(filterToDate)
        toDate.setHours(23, 59, 59, 999)
        if (trip.bookingDate > toDate) return false
      }
      return true
    })
  }, [tripHistory, filterStatus, filterFromDate, filterToDate])

  // Reset filters
  const resetFilters = () => {
    setFilterStatus('all')
    setFilterFromDate('')
    setFilterToDate('')
    setCurrentPage(1)
  }

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredTripHistory.length / itemsPerPage)
  const paginatedTrips = filteredTripHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
console.log(bookings)
  return (
    <div className="container mx-auto py-8 pt-16 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Lịch sử chuyến đi
        </h1>
        <p className="text-lg text-muted-foreground">
          Theo dõi các chuyến đi bạn đã đặt
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="rounded-xl p-6">
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3 space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="rounded-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-40" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-5 w-36" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Skeleton className="h-5 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="rounded-xl text-center py-12">
          <CardContent className="space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h3 className="text-xl font-semibold">Đã xảy ra lỗi</h3>
            <p className="text-muted-foreground">{error.message}</p>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() =>
                queryClient.refetchQueries({ queryKey: ['bookingHistory'] })
              }
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <Button
                variant="outline"
                className="rounded-lg mb-4 flex items-center gap-2 w-full lg:hidden"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4" />
                {isFilterOpen ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
                {isFilterOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              <Card
                className={`rounded-xl shadow-sm p-6 transition-all duration-300 ${
                  isFilterOpen ? 'block' : 'hidden lg:block'
                }`}
              >
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    Bộ lọc
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                      onClick={resetFilters}
                    >
                      Đặt lại
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                      Trạng thái
                    </Label>
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger
                        id="status"
                        className="rounded-lg focus:ring-2 focus:ring-primary"
                      >
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Hủy</SelectItem>
                        <SelectItem value="accepted">Đã xác nhận</SelectItem>
                        <SelectItem value="pending">Đang chờ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromDate" className="text-sm font-medium">
                      Từ ngày
                    </Label>
                    <Input
                      id="fromDate"
                      type="date"
                      value={filterFromDate}
                      onChange={(e) => setFilterFromDate(e.target.value)}
                      className="rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toDate" className="text-sm font-medium">
                      Đến ngày
                    </Label>
                    <Input
                      id="toDate"
                      type="date"
                      value={filterToDate}
                      onChange={(e) => setFilterToDate(e.target.value)}
                      className="rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </CardContent>
                <CardFooter className="p-0 pt-6">
                  <Button
                    className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                    onClick={() => {
                      setCurrentPage(1)
                      setIsFilterOpen(false)
                    }}
                  >
                    Áp dụng
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Trip Cards */}
          <div className="lg:col-span-3">
            {/* Results Summary */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">
                Tìm thấy{' '}
                <span className="font-medium">
                  {filteredTripHistory.length}
                </span>{' '}
                chuyến đi
              </p>
              {(filterStatus !== 'all' || filterFromDate || filterToDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80"
                  onClick={resetFilters}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            {/* No Results */}
            {filteredTripHistory.length === 0 ? (
              <Card className="rounded-xl text-center py-12 shadow-sm">
                <CardContent className="space-y-4">
                  <div className="mx-auto bg-muted/50 p-4 rounded-full w-fit">
                    <Calendar className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    Không tìm thấy chuyến đi
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {filterStatus !== 'all' || filterFromDate || filterToDate
                      ? 'Không có chuyến đi nào phù hợp với bộ lọc. Thử thay đổi bộ lọc để xem thêm.'
                      : 'Bạn chưa có chuyến đi nào trong lịch sử.'}
                  </p>
                  {(filterStatus !== 'all' ||
                    filterFromDate ||
                    filterToDate) && (
                    <Button
                      variant="outline"
                      className="rounded-lg"
                      onClick={resetFilters}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {paginatedTrips.map((trip:any) => (
                  <Card
                    key={trip.id}
                    className="rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg font-semibold">
                            Chuyến #{trip.id.slice(-6).toUpperCase()}
                          </CardTitle>
                          <Badge
                            variant={
                              trip.status === 'completed'
                                ? 'success'
                                : trip.status === 'cancelled'
                                ? 'destructive'
                                : trip.status === 'accepted'
                                ? 'default'
                                : 'secondary'
                            }
                            className="px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {trip.status === 'completed'
                              ? 'Hoàn thành'
                              : trip.status === 'cancelled'
                              ? 'Hủy'
                              : trip.status === 'accepted'
                              ? 'Đã xác nhận'
                              : 'Đang chờ'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Đặt ngày: {trip.bookingDateStr}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Khởi hành
                              </p>
                              <p className="font-medium">
                                {trip.departureDateTime}
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Số ghế
                              </p>
                              <p className="font-medium">{trip.seats}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Tài xế
                              </p>
                              <p className="font-medium">{trip.driver}</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Phương tiện
                              </p>
                              <p className="font-medium">{trip.vehicle}</p>
                            </div>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                Điểm đón
                              </p>
                              <p className="font-medium">{trip.from}</p>
                            </div>
                            <div className="flex items-center justify-center">
                              <svg
                                className="h-5 w-5 text-muted-foreground hidden sm:block"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                Điểm đến
                              </p>
                              <p className="font-medium">{trip.to}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4">
                      <div className="text-sm font-medium">
                        Giá: {trip.price}
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        {trip.status === 'accepted' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-lg flex-1 sm:flex-none"
                            onClick={() => handleCancelRequest(trip.id)}
                            disabled={cancelMutation.isPending}
                          >
                            {cancelMutation.isPending &&
                              cancelRequestId === trip.id && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              )}
                            Hủy
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg flex-1 sm:flex-none"
                          asChild
                        >
                          <Link href={`/trips/${trip.id}`}>Chi tiết</Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Trước
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum =
                      totalPages <= 5
                        ? i + 1
                        : currentPage <= 3
                        ? i + 1
                        : currentPage >= totalPages - 2
                        ? totalPages - 4 + i
                        : currentPage - 2 + i
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? 'default' : 'outline'
                        }
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sau
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Xác nhận hủy chuyến
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn hủy chuyến đi này? Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="rounded-lg flex-1"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Quay lại
            </Button>
            <Button
              variant="destructive"
              className="rounded-lg flex-1"
              onClick={confirmCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang hủy...
                </>
              ) : (
                'Hủy chuyến'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HistoryTripPage
