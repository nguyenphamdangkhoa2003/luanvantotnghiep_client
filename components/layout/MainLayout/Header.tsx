'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogIn, Menu, X, Bell, Loader2 } from 'lucide-react'
import {
  MdOutlineAdminPanelSettings,
  MdCalendarToday,
  MdAccountCircle,
} from 'react-icons/md'
import { CiMenuKebab } from 'react-icons/ci'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { RoleEnum } from '@/types/enum'
import LogoutDialog from '@/components/dialog/LogoutDialog'
import Logo from '../Logo'
import { ThemeColorToggle } from '@/components/toggle/ThemeColorToggle'
import { ThemeModeToggle } from '@/components/toggle/ThemeModeToggle'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/context/auth-provider'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRequestsByDriverIdQueryFn,
  handleRequestMutationFn,
  getRoutesByDriverQueryFn,
  getRoutesByPassengerQueryFn,
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
  avatar?: string
  role: RoleEnum
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

interface Route {
  _id: string
  name: string
  userId: User
  status: 'active' | 'completed'
  startTime: string
  updatedAt: string
}

interface RequestApiResponse {
  data: Request[]
}

interface RouteApiResponse {
  data: Route[]
}

interface ReviewCheckResponse {
  hasReviewed: boolean
}

interface ApiError {
  message: string
  status?: number
}

const Header = () => {
  const router = useRouter()
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const {
    user,
    isLoading: isAuthLoading,
    isFetching,
    isSuccess,
  } = useAuthContext()
  const queryClient = useQueryClient()

  const isDriver = user?.role === RoleEnum.DRIVER

  // Query lấy danh sách requests (cho tài xế)
  const { data: requestResponse } = useQuery<RequestApiResponse>({
    queryKey: ['requests', user?._id],
    queryFn: () => getRequestsByDriverIdQueryFn(user!._id),
    enabled: !!user?._id && isSuccess && isDriver,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  const pendingRequests =
    requestResponse?.data.filter((request) => request.status === 'pending') ||
    []
  console.log('Pending requests:', pendingRequests)

  // Query lấy danh sách routes
  const { data: routeResponse } = useQuery<RouteApiResponse>({
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

  const completedRoutesWithRequests = routes.filter((route) =>
    unratedRequests.some((req) => req.routeId._id === route._id)
  )

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

  // Sắp xếp pendingRequests theo createdAt (mới nhất trước)
  const sortedPendingRequests = [...pendingRequests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Sắp xếp completedRoutesWithRequests theo updatedAt (mới nhất trước)
  const sortedCompletedRoutesWithRequests = [
    ...completedRoutesWithRequests,
  ].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  // Tạo danh sách thông báo cho phần "Cần đánh giá"
  const reviewNotifications = sortedCompletedRoutesWithRequests
    .flatMap((route) => {
      const routeUnratedRequests = unratedRequests.filter(
        (req) => req.routeId._id === route._id
      )
      if (isDriver && routeUnratedRequests.length > 1) {
        return routeUnratedRequests.map((req) => ({
          type: 'route' as const,
          data: { route, request: req },
        }))
      }
      return [
        {
          type: 'route' as const,
          data: { route, request: routeUnratedRequests[0] },
        },
      ].filter((item) => item.data.request)
    })
    .slice(0, 3) // Giới hạn tối đa 3 thông báo đánh giá

  // Tạo danh sách thông báo cho phần "Yêu cầu mới"
  const requestNotifications = sortedPendingRequests
    .map((req) => ({ type: 'request' as const, data: req }))
    .slice(0, 3) // Giới hạn tối đa 3 yêu cầu mới

  // Tổng số thông báo để hiển thị badge
  const totalNotifications =
    requestNotifications.length + reviewNotifications.length

  return (
    <nav
      className={cn(
        'fixed w-full z-20 top-0 start-0 bg-[var(--background)] border-b',
        'border-[var(--border)] shadow-sm'
      )}
    >
      <div className="max-w-screen-xl flex items-center justify-between mx-auto px-4 sm:px-6 py-3">
        <Link href="/" className="flex items-center space-x-1">
          <Logo
            width="200"
            height="100%"
            className="md:block hidden"
            fill="var(--primary)"
          />
          <Logo
            width="150"
            height="100%"
            className="md:hidden block"
            fill="var(--primary)"
          />
        </Link>

        <div className="hidden md:flex space-x-6 text-lg font-medium text-[var(--foreground)]">
          <Link
            href="/"
            className="text-primary hover:text-primary/80 transition"
          >
            Trang chủ
          </Link>
          <Link
            href="/booking"
            className="text-primary hover:text-primary/80 transition"
          >
            Đặt trước
          </Link>
          <Link
            href="/contact"
            className="text-primary hover:text-primary/80 transition"
          >
            Liên hệ
          </Link>
          <Link
            href="/about"
            className="text-primary hover:text-primary/80 transition"
          >
            Về chúng tôi
          </Link>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'relative hover:bg-[var(--muted)] hover:shadow-md',
                  'transition-all duration-200 ease-in-out rounded-[var(--radius-md)] p-2'
                )}
              >
                <Bell size={20} className="text-[var(--foreground)]" />
                {totalNotifications > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className={cn(
                'w-64 sm:w-80 bg-[var(--card)] border-[var(--border)]',
                'rounded-[var(--radius-md)] shadow-lg p-2 max-h-[80vh] overflow-y-auto'
              )}
              side="bottom"
              align="end"
              sideOffset={8}
            >
              {reviewStatusQueries.isLoading ? (
                <DropdownMenuItem
                  className={cn(
                    'px-3 py-2 text-sm text-[var(--muted-foreground)]',
                    'rounded-[var(--radius-sm)] text-center'
                  )}
                >
                  Đang tải thông báo...
                </DropdownMenuItem>
              ) : totalNotifications > 0 ? (
                <>
                  {/* Phần Yêu cầu mới */}
                  {isDriver && requestNotifications.length > 0 && (
                    <>
                      <div className="px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                        Yêu cầu mới
                      </div>
                      {requestNotifications.map(({ data }) => (
                        <DropdownMenuItem
                          key={data._id}
                          className={cn(
                            'flex flex-col items-start gap-1 px-3 py-2 text-sm text-[var(--foreground)]',
                            'hover:bg-[var(--muted)] hover:shadow-sm',
                            'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-default'
                          )}
                        >
                          <span className="font-medium">
                            {data.userId.name} yêu cầu đặt {data.seats} ghế cho
                            tuyến {data.routeId.name}
                            {data.message && `: "${data.message}"`}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {formatTime(data.createdAt)}
                          </span>
                          <div className="mt-2 flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-50 text-white hover:text-blue-600 text-xs"
                              onClick={() => handleAction(data._id, 'accept')}
                              disabled={handleRequestMutation.isPending}
                            >
                              {handleRequestMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                'Chấp nhận'
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-500 hover:bg-red-50 text-white hover:text-gray-600 text-xs"
                              onClick={() => handleAction(data._id, 'reject')}
                              disabled={handleRequestMutation.isPending}
                            >
                              {handleRequestMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                'Từ chối'
                              )}
                            </Button>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {reviewNotifications.length > 0 && (
                        <DropdownMenuSeparator className="my-1" />
                      )}
                    </>
                  )}

                  {/* Phần Cần đánh giá */}
                  {reviewNotifications.length > 0 && (
                    <>
                      <div className="px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                        Cần đánh giá
                      </div>
                      {reviewNotifications.map(({ data }, index) => (
                        <DropdownMenuItem
                          key={`${data.route._id}-${data.request?._id}-${index}`}
                          className={cn(
                            'flex flex-col items-start gap-1 px-3 py-2 text-sm text-[var(--foreground)]',
                            'hover:bg-[var(--muted)] hover:shadow-sm',
                            'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-default'
                          )}
                        >
                          <span className="font-medium">
                            Chuyến đi{' '}
                            <span className="font-semibold">
                              {data.route.name}
                            </span>{' '}
                            đã hoàn thành.{' '}
                            {isDriver && (
                              <>
                                Hành viên:{' '}
                                <span className="font-semibold">
                                  {data.request.userId.name}
                                </span>
                              </>
                            )}
                            Vui lòng đánh giá{' '}
                            {isDriver ? 'hành khách' : 'tài xế'}.
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {formatTime(data.route.updatedAt)}
                          </span>
                          <div className="mt-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-500 hover:bg-green-50 text-white hover:text-green-600 text-xs"
                              onClick={() =>
                                handleReview(data.route, data.request._id)
                              }
                              disabled={reviewStatusQueries.isLoading}
                            >
                              Đánh giá
                            </Button>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}

                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    asChild
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-[var(--primary)]',
                      'hover:bg-[var(--muted)] hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-pointer'
                    )}
                  >
                    <Link href="/notifications">Xem thêm</Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  className={cn(
                    'px-3 py-2 text-sm text-[var(--muted-foreground)]',
                    'rounded-[var(--radius-sm)] text-center'
                  )}
                >
                  Không có thông báo mới
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {!user ? (
            <div className="hidden md:flex sm:flex items-center gap-2">
              <Button
                className={cn(
                  'bg-[var(--primary)] text-[var(--primary-foreground)]',
                  'hover:bg-[var(--primary)]/90 hover:shadow-md',
                  'transition-all duration-200 ease-in-out',
                  'rounded-[var(--radius-md)] px-3 sm:px-4 py-2 text-sm'
                )}
                variant="default"
                onClick={() => router.push('/sign-in')}
              >
                Đăng nhập
              </Button>
              <Button
                variant="outline"
                className={cn(
                  'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
                  'border-[var(--border)] hover:bg-[var(--muted)] hover:shadow-md',
                  'transition-all duration-200 ease-in-out',
                  'rounded-[var(--radius-md)] px-3 sm:px-4 py-2 text-sm'
                )}
                onClick={() => router.push('/sign-up')}
              >
                Đăng ký
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex sm:flex items-center gap-2 sm:gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    className={cn(
                      'flex items-center gap-2 p-1',
                      'hover:bg-[var(--muted)] hover:shadow-md',
                      'transition-all duration-200 ease-in rounded-[var(--radius)]'
                    )}
                  >
                    <div
                      className={cn(
                        'h-8 sm:h-9 w-8 sm:w-9 rounded-full bg-[var(--muted)]',
                        'flex items-center justify-center shadow-sm'
                      )}
                    >
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          width={36}
                          height={36}
                          alt="Avatar"
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {user?.name?.split(' ')?.[0]?.charAt(0)}
                          {user?.name?.split(' ')?.[1]?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left text-sm leading-tight hidden lg:grid">
                      <span className="truncate font-semibold text-[var(--foreground)]">
                        {user?.name}
                      </span>
                      <span className="truncate text-xs text-[var(--muted-foreground)]">
                        {user?.email}
                      </span>
                    </div>
                    <span className="ml-auto lg:block hidden size-4 text-[var(--muted-foreground)]">
                      <CiMenuKebab />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    'w-[--radix-down-menu-trigger-width] min-w-52 sm:min-w-56',
                    'bg-[var(--card)] border-[var(--border)] rounded-[var(--radius-md)]',
                    'shadow-lg'
                  )}
                  side="bottom"
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)]',
                      'hover:bg-[var(--muted)] hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-pointer'
                    )}
                  >
                    <MdAccountCircle size={16} />
                    <span>Hồ sơ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/historybooking')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)]',
                      'hover:bg-[var(--muted)] hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-pointer'
                    )}
                  >
                    <MdCalendarToday size={16} />
                    <span>Lịch sử hoạt động</span>
                  </DropdownMenuItem>
                  {user.role === RoleEnum.ADMIN && (
                    <DropdownMenuItem
                      onClick={() => router.push('/admin')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)]',
                        'hover:bg-[var(--muted)] hover:shadow-sm',
                        'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-pointer'
                      )}
                    >
                      <MdOutlineAdminPanelSettings size={16} />
                      <span>Trang quản trị</span>
                    </DropdownMenuItem>
                  )}
                  <ThemeColorToggle />
                  <DropdownMenuItem
                    onClick={() => setIsLogoutOpen(true)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)]',
                      'hover:bg-[var(--muted)] hover:text-red-500',
                      'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-pointer'
                    )}
                  >
                    <LogIn size={16} />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <ThemeModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'md:hidden hover:bg-[var(--muted)] hover:shadow-md',
              'transition-all duration-200 ease-in-out rounded-[var(--radius-md)]'
            )}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'fixed top-0 right-0 h-full w-64 sm:w-72 bg-white shadow-lg z-50',
          'transform transition-all duration-200 ease-in-out',
          isOpen ? '' : 'translate-x-full'
        )}
      >
        <div className="flex justify-end p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className={cn(
              ' hover:bg-gray-50',
              'transition-all duration-200 ease-in-out rounded'
            )}
          >
            <X size={24} />
          </Button>
        </div>
        <div className="flex flex-col space-y-1 px-4">
          <Link
            href="/"
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-gray-50 rounded-full w-full cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Trang chủ
          </Link>
          <Link
            href="/booking"
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-gray-50 rounded w-full cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Đặt vé
          </Link>
          <Link
            href="/contact"
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-gray-50 rounded w-full cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Liên hệ
          </Link>
          <Link
            href="/about"
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-gray-50 rounded w-full cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Về chúng tôi
          </Link>

          {!user ? (
            <div className="pt-4 space-y-2">
              <Button
                variant="default"
                className={cn(
                  'w-full bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md',
                  'transition-all duration-200 ease-in rounded py-2 text-sm'
                )}
                onClick={() => {
                  router.push('/sign-in')
                  setIsOpen(false)
                }}
              >
                Đăng nhập
              </Button>
              <Button
                variant="outline"
                className={cn(
                  'w-full bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:shadow-md',
                  'transition-all duration-200 ease-in rounded py-2 text-sm'
                )}
                onClick={() => {
                  router.push('/sign-up')
                  setIsOpen(false)
                }}
              >
                Đăng ký
              </Button>
            </div>
          ) : (
            <div className="pt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    className={cn(
                      'flex items-center gap-2 p-2 w-full justify-start',
                      'hover:bg-gray-50 hover:shadow-md',
                      'transition-all duration-200 ease-in rounded'
                    )}
                  >
                    <div
                      className={cn(
                        'h-9 w-9 rounded-full bg-gray-100',
                        'flex items-center justify-center shadow-sm'
                      )}
                    >
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          width={36}
                          height={36}
                          alt="Avatar"
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-gray-600">
                          {user?.name?.split(' ')?.[0]?.charAt(0)}
                          {user?.name?.split(' ')?.[1]?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-gray-600">
                        {user?.name}
                      </span>
                      <span className="truncate text-xs text-gray-400">
                        {user?.email}
                      </span>
                    </div>
                    <span className="ml-auto size-4 text-gray-400">
                      <CiMenuKebab />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    'w-64 mx-2 bg-white border-gray-200 rounded-lg shadow-sm p-2'
                  )}
                  side="bottom"
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-gray-600',
                      'hover:bg-gray-50 hover:shadow-sm',
                      'transition-all duration-200 ease-in rounded cursor-pointer'
                    )}
                  >
                    <MdAccountCircle size={16} />
                    <span>Hồ sơ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/historybooking')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-gray-600',
                      'hover:bg-gray-50 hover:shadow-sm',
                      'transition-all duration-200 ease-in rounded cursor-pointer'
                    )}
                  >
                    <MdCalendarToday size={16} />
                    <span>Lịch sử hoạt động</span>
                  </DropdownMenuItem>
                  {user.role === RoleEnum.ADMIN && (
                    <DropdownMenuItem
                      onClick={() => router.push('/admin')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 text-sm text-gray-600',
                        'hover:bg-gray-50 hover:shadow-sm',
                        'transition-all duration-200 ease-in rounded cursor-pointer'
                      )}
                    >
                      <MdOutlineAdminPanelSettings size={16} />
                      <span>Trang quản trị</span>
                    </DropdownMenuItem>
                  )}
                  <ThemeColorToggle />
                  <DropdownMenuItem
                    onClick={() => setIsLogoutOpen(true)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-gray-600',
                      'hover:bg-gray-50 hover:text-red-500',
                      'transition-all duration-200 ease-in rounded cursor-pointer'
                    )}
                  >
                    <LogIn size={16} />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <div className="pt-4">
            <ThemeModeToggle />
          </div>
        </div>
      </div>
      <LogoutDialog isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} />
    </nav>
  )
}

export default Header
