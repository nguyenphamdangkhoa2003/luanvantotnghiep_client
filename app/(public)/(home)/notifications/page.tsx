'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuthContext } from '@/context/auth-provider'
import {
  getRoutesByDriverQueryFn,
  getRoutesByPassengerQueryFn,
  handleRequestMutationFn,
  getRequestsByDriverIdQueryFn,
  getRequestsByUserIdQueryFn,
} from '@/api/routes/route'
import { checkReviewStatusQueryFn } from '@/api/reviews/review'
import { toast } from 'sonner'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

interface User {
  _id: string
  email: string
  name: string
  role: 'driver' | 'passenger'
}

interface Route {
  _id: string
  name: string
  userId: User
  status: 'active' | 'completed'
  startTime: string
  completedAt?: string
}

interface Request {
  _id: string
  userId: User
  routeId: { _id: string; name: string; userId: string }
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed'
  message?: string
  seats: number
  createdAt: string
  updatedAt: string
}

interface RouteApiResponse {
  data: Route[]
}

interface RequestApiResponse {
  data: Request[]
}

interface ReviewCheckResponse {
  hasReviewed: boolean
}

interface ApiError {
  message: string
  status?: number
}

const Notifications = () => {
  const {
    user,
    isLoading: isAuthLoading,
    isFetching,
    isSuccess,
  } = useAuthContext()
  const queryClient = useQueryClient()
  const router = useRouter()

  const isDriver = user?.role === 'driver'

  // Query lấy danh sách routes
  const {
    data: routeResponse,
    isLoading: routesLoading,
    isError: routesError,
  } = useQuery<RouteApiResponse>({
    queryKey: ['routes', user?._id],
    queryFn: () =>
      isDriver
        ? getRoutesByDriverQueryFn(user!._id)
        : getRoutesByPassengerQueryFn(user!._id),
    enabled: !!user?._id && isSuccess,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  const routes = routeResponse?.data || []
  console.log('Routes fetched:', routes)

  // Query lấy danh sách requests (cho tài xế)
  const {
    data: requestResponse,
    isLoading: requestsLoading,
    isError: requestsError,
  } = useQuery<RequestApiResponse>({
    queryKey: ['requests', user?._id],
    queryFn: () => getRequestsByDriverIdQueryFn(user!._id),
    enabled: !!user?._id && isSuccess && isDriver,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  const pendingRequests =
    requestResponse?.data.filter((req) => req.status === 'pending') || []
  console.log('Pending requests:', pendingRequests)

  // Query lấy danh sách completed requests
  const { data: completedRequestsResponse } = useQuery<RequestApiResponse>({
    queryKey: ['completedRequests', user?._id],
    queryFn: () =>
      isDriver
        ? getRequestsByDriverIdQueryFn(user!._id)
        : getRequestsByUserIdQueryFn(user!._id),
    enabled: !!user?._id && isSuccess,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  const completedRequests =
    completedRequestsResponse?.data.filter(
      (request) => request.status === 'completed'
    ) || []
  console.log('Completed requests:', completedRequests)

  // Query kiểm tra trạng thái đánh giá
  const reviewStatusQueries = useQuery<(ReviewCheckResponse | null)[]>({
    queryKey: ['reviewStatus', completedRequests.map((req) => req._id)],
    queryFn: async () => {
      const promises = completedRequests.map((req) =>
        checkReviewStatusQueryFn(req._id, user!._id).catch((error) => {
          console.error(
            `Error checking review status for request ${req._id}:`,
            {
              error: error.message,
              status: error.response?.status,
              tripRequestId: req._id,
              reviewerId: user!._id,
            }
          )
          return null
        })
      )
      const results = await Promise.all(promises)
      console.log('Review status results:', results)
      return results
    },
    enabled: completedRequests.length > 0 && !!user?._id && isSuccess,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  const unratedRequests = completedRequests
    .filter((req, index) => {
      const reviewStatus = reviewStatusQueries.data?.[index]
      return reviewStatus && !reviewStatus.hasReviewed
    })
    .filter(Boolean)
  console.log('Unrated requests:', unratedRequests)

  // Mutation xử lý yêu cầu
  const handleRequestMutation = useMutation<
    unknown,
    ApiError,
    { requestId: string; action: 'accept' | 'reject'; reason?: string }
  >({
    mutationFn: handleRequestMutationFn,
    onSuccess: () => {
      toast.success('Yêu cầu đã được xử lý thành công')
      queryClient.invalidateQueries({ queryKey: ['requests', user?._id] })
      queryClient.invalidateQueries({
        queryKey: ['completedRequests', user?._id],
      })
      queryClient.invalidateQueries({ queryKey: ['reviewStatus'] })
    },
    onError: (error) => {
      toast.error('Cảnh báo', {
        description: error.message || 'Bạn chưa kích hoạt gói tài xế!',
        action: {
          label: 'Kích hoạt ngay',
          onClick: () => router.push('/driverpass'),
        },
        className: 'border-2 border-red-500',
        position: 'top-right',
        style: { backgroundColor: '#fff', color: '#000' },
      })
    },
  })

  const handleAction = (requestId: string, action: 'accept' | 'reject') => {
    handleRequestMutation.mutate({
      requestId,
      action,
      reason: action === 'reject' ? 'Tài xế đã từ chối yêu cầu' : undefined,
    })
  }

  const handleReview = async (route: Route, requestId: string) => {
    try {
      const request = unratedRequests.find((req) => req._id === requestId)
      if (!request) {
        toast.error('Không tìm thấy yêu cầu hợp lệ cho chuyến đi này.')
        return
      }
      if (!user) {
        toast.error('Vui lòng đăng nhập để đánh giá.')
        return
      }
      if (user._id === request.routeId.userId) {
        const revieweeId = request.userId._id
        router.push(
          `/rating?tripRequestId=${request._id}&revieweeId=${revieweeId}`
        )
      } else {
        const revieweeId = request.routeId.userId
        router.push(
          `/rating?tripRequestId=${request._id}&revieweeId=${revieweeId}`
        )
      }
    } catch (error) {
      toast.error('Lỗi khi lấy thông tin chuyến đi', {
        description: 'Vui lòng thử lại sau.',
      })
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      const date = parseISO(timestamp)
      return formatDistanceToNow(date, { locale: vi, addSuffix: true })
    } catch {
      return 'Không rõ thời gian'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ xử lý'
      case 'accepted':
        return 'Đã chấp nhận'
      case 'rejected':
        return 'Đã từ chối'
      case 'cancelled':
        return 'Đã hủy'
      case 'completed':
        return 'Đã hoàn thành'
      case 'active':
        return 'Đang hoạt động'
      default:
        return status
    }
  }

  // Sắp xếp pendingRequests theo createdAt (mới nhất trước)
  const sortedPendingRequests = [...pendingRequests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Sắp xếp routes theo completedAt hoặc startTime (mới nhất trước)
  const sortedRoutes = [...routes].sort((a, b) => {
    const timeA = a.completedAt || a.startTime
    const timeB = b.completedAt || b.startTime
    return new Date(timeB).getTime() - new Date(timeA).getTime()
  })

  // Lọc routes có unratedRequests
  const routesWithUnratedRequests = sortedRoutes.filter((route) =>
    unratedRequests.some((req) => req.routeId._id === route._id)
  )

  // Lọc routes không có unratedRequests
  const routesWithoutUnratedRequests = sortedRoutes.filter(
    (route) => !unratedRequests.some((req) => req.routeId._id === route._id)
  )

  if (isAuthLoading || isFetching || !isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--background)] pt-20 pb-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p>Đang kiểm tra xác thực...</p>
        </div>
      </div>
    )
  }

  if (!user?._id) {
    return (
      <div className="min-h-screen bg-[var(--background)] pt-20 pb-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p>Vui lòng đăng nhập để xem thông báo.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            Thông báo
          </h1>
          <Link href="/">
            <Button
              variant="outline"
              className={cn(
                'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
                'border-[var(--border)] hover:bg-[var(--muted)] hover:shadow-md',
                'transition-all duration-200 ease-in-out rounded-[var(--radius-md)]'
              )}
            >
              Quay lại
            </Button>
          </Link>
        </div>

        {routesLoading || requestsLoading || reviewStatusQueries.isLoading ? (
          <div
            className={cn(
              'p-4 rounded-lg bg-white border border-gray-200',
              'text-center text-gray-500'
            )}
          >
            Đang tải thông báo...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Phần 1: Yêu cầu mới (chỉ tài xế) */}
            {isDriver && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Yêu cầu mới
                </h2>
                {sortedPendingRequests.length > 0 ? (
                  <div className="space-y-4">
                    {sortedPendingRequests.map((request) => (
                      <div
                        key={request._id}
                        className={cn(
                          'p-4 rounded-lg bg-white border border-blue-200',
                          'shadow-sm hover:shadow-md transition-all duration-200 ease-in-out bg-gray-50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Bell
                            size={18}
                            className="text-blue-500 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {request.userId.name} yêu cầu đặt {request.seats}{' '}
                              ghế cho tuyến{' '}
                              <span className="font-semibold">
                                {request.routeId.name}
                              </span>
                              {request.message && `: "${request.message}"`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTime(request.createdAt)} (Trạng thái:{' '}
                              {getStatusText(request.status)})
                            </p>
                            <div className="mt-3 flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-50 text-white hover:text-blue-600"
                                onClick={() =>
                                  handleAction(request._id, 'accept')
                                }
                                disabled={handleRequestMutation.isPending}
                              >
                                {handleRequestMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Chấp nhận'
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="bg-red-500 hover:bg-red-50 text-white hover:text-red-600"
                                onClick={() =>
                                  handleAction(request._id, 'reject')
                                }
                                disabled={handleRequestMutation.isPending}
                              >
                                {handleRequestMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Từ chối'
                                )}
                              </Button>
                            </div>
                          </div>
                          <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={cn(
                      'p-4 rounded-lg bg-white border border-gray-200',
                      'text-center text-gray-500'
                    )}
                  >
                    Không có yêu cầu mới
                  </div>
                )}
              </div>
            )}

            {/* Phần 2: Cần đánh giá */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Cần đánh giá
              </h2>
              {routesWithUnratedRequests.length > 0 ? (
                <div className="space-y-4">
                  {routesWithUnratedRequests.map((route) => {
                    const routeUnratedRequests = unratedRequests.filter(
                      (req) => req.routeId._id === route._id
                    )
                    console.log(
                      'Route:',
                      route._id,
                      'Unrated requests:',
                      routeUnratedRequests
                    )
                    return (
                      <div
                        key={route._id}
                        className={cn(
                          'p-4 rounded-lg bg-white border border-green-200',
                          'shadow-sm hover:shadow-md transition-all duration-200 ease-in-out bg-green-50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Bell
                            size={18}
                            className="text-green-500 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Chuyến đi{' '}
                              <span className="font-semibold">
                                {route.name}
                              </span>{' '}
                              đã hoàn thành. Vui lòng đánh giá{' '}
                              {isDriver ? 'hành khách' : 'tài xế'}.
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTime(route.completedAt || route.startTime)}{' '}
                              (Trạng thái: {getStatusText(route.status)})
                            </p>
                            {isDriver && routeUnratedRequests.length > 1 ? (
                              <div className="mt-2 space-y-2">
                                {routeUnratedRequests.map((request) => (
                                  <div
                                    key={request._id}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="text-sm text-gray-500">
                                      Hành khách: {request.userId.name}
                                    </span>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-50 text-white hover:text-green-600"
                                      onClick={() =>
                                        handleReview(route, request._id)
                                      }
                                      disabled={reviewStatusQueries.isLoading}
                                    >
                                      Đánh giá
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-3">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-50 text-white hover:text-green-600"
                                  onClick={() =>
                                    handleReview(
                                      route,
                                      routeUnratedRequests[0]?._id
                                    )
                                  }
                                  disabled={
                                    !routeUnratedRequests[0] ||
                                    reviewStatusQueries.isLoading
                                  }
                                >
                                  Đánh giá
                                </Button>
                              </div>
                            )}
                          </div>
                          <span className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div
                  className={cn(
                    'p-4 rounded-lg bg-white border border-gray-200',
                    'text-center text-gray-500'
                  )}
                >
                  Không có chuyến đi cần đánh giá
                </div>
              )}
            </div>

            {/* Phần 3: Chuyến đi của bạn */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Chuyến đi của bạn
              </h2>
              {routesWithoutUnratedRequests.length > 0 ? (
                <div className="space-y-4">
                  {routesWithoutUnratedRequests.map((route) => (
                    <div
                      key={route._id}
                      className={cn(
                        'p-4 rounded-lg bg-white border border-gray-200',
                        'shadow-sm hover:shadow-md transition-all duration-200 ease-in-out'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Bell
                          size={18}
                          className="text-blue-500 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Chuyến đi{' '}
                            <span className="font-semibold">{route.name}</span>{' '}
                            {route.status === 'completed'
                              ? 'đã hoàn thành.'
                              : 'đang hoạt động.'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(route.completedAt || route.startTime)}{' '}
                            (Trạng thái: {getStatusText(route.status)})
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={cn(
                    'p-4 rounded-lg bg-white border border-gray-200',
                    'text-center text-gray-500'
                  )}
                >
                  Không có chuyến đi
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
