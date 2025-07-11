'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogIn, Menu, X, Bell, Loader2, Package2, Package2Icon } from 'lucide-react'
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
  const { data: requestResponse, isLoading: isRequestsLoading } =
    useQuery<RequestApiResponse>({
      queryKey: ['requests', user?._id],
      queryFn: () => getRequestsByDriverIdQueryFn(user!._id),
      enabled: !!user?._id && isSuccess && isDriver,
      staleTime: 5 * 60 * 1000, // 5 phút
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    })

  const pendingRequests =
    requestResponse?.data.filter((request) => request.status === 'pending') ||
    []

  // Query lấy danh sách routes
  const { data: routeResponse, isLoading: isRoutesLoading } =
    useQuery<RouteApiResponse>({
      queryKey: ['routes', user?._id],
      queryFn: () =>
        isDriver
          ? getRoutesByDriverQueryFn(user!._id)
          : getRoutesByPassengerQueryFn(user!._id),
      enabled: !!user?._id && isSuccess,
      staleTime: 5 * 60 * 1000, // 5 phút
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    })

  const routes = routeResponse?.data || []

  // Query lấy danh sách completed requests
  const {
    data: completedRequestsResponse,
    isLoading: isCompletedRequestsLoading,
  } = useQuery<RequestApiResponse>({
    queryKey: ['completedRequests', user?._id],
    queryFn: () =>
      isDriver
        ? getRequestsByDriverIdQueryFn(user!._id)
        : getRequestsByUserIdQueryFn(user!._id),
    enabled: !!user?._id && isSuccess,
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  const completedRequests =
    completedRequestsResponse?.data.filter(
      (request) => request.status === 'completed'
    ) || []

  // Query kiểm tra trạng thái đánh giá
  const { data: reviewStatusData, isLoading: isReviewStatusLoading } = useQuery<
    (ReviewCheckResponse | null)[]
  >({
    queryKey: ['reviewStatus', completedRequests.map((req) => req._id)],
    queryFn: async () => {
      const promises = completedRequests.map((req) =>
        checkReviewStatusQueryFn(req._id, user!._id).catch(
          (error: ApiError) => {
            toast.error(
              `Lỗi khi kiểm tra trạng thái đánh giá cho yêu cầu ${req._id}`,
              {
                description: error.message || 'Vui lòng thử lại sau.',
              }
            )
            return null
          }
        )
      )
      return Promise.all(promises)
    },
    enabled: completedRequests.length > 0 && !!user?._id && isSuccess,
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  const unratedRequests = completedRequests
    .filter((req, index) => {
      const reviewStatus = reviewStatusData?.[index]
      return reviewStatus && !reviewStatus.hasReviewed
    })
    .filter(Boolean)

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
      router.push('/messages')
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
      if (!user) {
        toast.error('Vui lòng đăng nhập để đánh giá.')
        return
      }
      const request = unratedRequests.find((req) => req._id === requestId)
      if (!request || !request.routeId?.userId) {
        toast.error('Không tìm thấy yêu cầu hoặc thông tin tài xế hợp lệ.')
        return
      }
      const revieweeId = isDriver ? request.userId._id : request.routeId.userId
      router.push(
        `/rating?tripRequestId=${request._id}&revieweeId=${revieweeId}`
      )
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
    .map((route) => {
      const routeUnratedRequests = unratedRequests.filter(
        (req) => req.routeId._id === route._id
      )
      return routeUnratedRequests.map((req) => ({
        type: 'route' as const,
        data: { route, request: req },
      }))
    })
    .flat()
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
            className="text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors duration-150"
          >
            Trang chủ
          </Link>

          {user?.role === RoleEnum.DRIVER && (
            <>
              <Link
                href="/registeratrip"
                className="text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors duration-150"
              >
                Đăng ký tuyến đường
              </Link>
            </>
          )}
          <Link
            href="/contact"
            className="text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors duration-150"
          >
            Liên hệ
          </Link>
          <Link
            href="/about"
            className="text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors duration-150"
          >
            Về chúng tôi
          </Link>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'relative hover:bg-[var(--muted)] hover:shadow-sm',
                    'transition-all duration-200 ease-in-out rounded-[var(--radius-md)] p-2'
                  )}
                >
                  <Bell size={20} className="text-[var(--foreground)]" />
                  {totalNotifications > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                      {totalNotifications > 9 ? '9+' : totalNotifications}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={cn(
                  'w-72 sm:w-96 bg-[var(--card)] border-[var(--border)]',
                  'rounded-xl shadow-lg p-3 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--primary)] scrollbar-track-[var(--card)]'
                )}
                side="bottom"
                align="end"
                sideOffset={10}
              >
                {isRequestsLoading ||
                isRoutesLoading ||
                isCompletedRequestsLoading ||
                isReviewStatusLoading ? (
                  <DropdownMenuItem
                    className={cn(
                      'px-4 py-3 text-sm text-[var(--muted-foreground)] flex items-center justify-center gap-2',
                      'rounded-lg'
                    )}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải thông báo...
                  </DropdownMenuItem>
                ) : totalNotifications > 0 ? (
                  <>
                    {/* Phần Yêu cầu mới */}
                    {isDriver && requestNotifications.length > 0 && (
                      <>
                        <div className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                          Yêu cầu mới
                        </div>
                        {requestNotifications.map(({ data }) => (
                          <DropdownMenuItem
                            key={data._id}
                            className={cn(
                              'flex flex-col items-start gap-2 px-4 py-3 text-sm text-[var(--foreground)]',
                              'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                              'transition-all duration-200 ease-in-out rounded-lg cursor-default'
                            )}
                          >
                            <span className="font-medium">
                              {data.userId.name} yêu cầu đặt {data.seats} ghế
                              cho tuyến {data.routeId.name}
                              {data.message && `: "${data.message}"`}
                            </span>
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {formatTime(data.createdAt)}
                            </span>
                            <div className="mt-2 flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md"
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
                                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-md"
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
                          <DropdownMenuSeparator className="my-2 bg-[var(--border)]" />
                        )}
                      </>
                    )}

                    {/* Phần Cần đánh giá */}
                    {reviewNotifications.length > 0 && (
                      <>
                        <div className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                          Cần đánh giá
                        </div>
                        {reviewNotifications.map(({ data }, index) => (
                          <DropdownMenuItem
                            key={`${data.route._id}-${data.request?._id}-${index}`}
                            className={cn(
                              'flex flex-col items-start gap-2 px-4 py-3 text-sm text-[var(--foreground)]',
                              'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                              'transition-all duration-200 ease-in-out rounded-lg cursor-default'
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
                                  Hành khách:{' '}
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
                                className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-md"
                                onClick={() =>
                                  handleReview(data.route, data.request._id)
                                }
                                disabled={isReviewStatusLoading}
                              >
                                Đánh giá
                              </Button>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}

                    <DropdownMenuSeparator className="my-2 bg-[var(--border)]" />
                    <DropdownMenuItem
                      asChild
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm text-[var(--primary)]',
                        'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                        'transition-all duration-200 ease-in-out rounded-lg cursor-pointer'
                      )}
                    >
                      <Link href="/notifications">Xem thêm</Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    className={cn(
                      'px-4 py-3 text-sm text-[var(--muted-foreground)] flex items-center justify-center gap-2',
                      'rounded-lg'
                    )}
                  >
                    <Bell
                      size={16}
                      className="text-[var(--muted-foreground)]"
                    />
                    Không có thông báo mới
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!user ? (
            <div className="hidden md:flex sm:flex items-center gap-2">
              <Button
                className={cn(
                  'bg-[var(--primary)] text-[var(--primary-foreground)]',
                  'hover:bg-[var(--primary)]/90 hover:shadow-md',
                  'transition-all duration-200 ease-in-out',
                  'rounded-lg px-4 py-2 text-sm font-medium'
                )}
                variant="default"
                onClick={() => router.push('/sign-in')}
              >
                Đăng nhập
              </Button>
              <Button
                variant="outline"
                className={cn(
                  'bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]',
                  'hover:bg-[var(--muted)] hover:shadow-md',
                  'transition-all duration-200 ease-in-out',
                  'rounded-lg px-4 py-2 text-sm font-medium'
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
                      'flex items-center gap-2 p-2',
                      'hover:bg-[var(--muted)] hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-lg'
                    )}
                  >
                    <div
                      className={cn(
                        'h-9 w-9 rounded-full bg-[var(--muted)]',
                        'flex items-center justify-center shadow-sm ring-1 ring-[var(--border)]'
                      )}
                    >
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          width={36}
                          height={36}
                          alt="Avatar"
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {user.name?.split(' ')?.[0]?.charAt(0)}
                          {user.name?.split(' ')?.[1]?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left text-sm leading-tight hidden lg:grid">
                      <span className="truncate font-semibold text-[var(--foreground)]">
                        {user.name}
                      </span>
                      <span className="truncate text-xs text-[var(--muted-foreground)]">
                        {user.email}
                      </span>
                    </div>
                    <span className="ml-auto lg:block hidden size-4 text-[var(--muted-foreground)]">
                      <CiMenuKebab />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    'w-56 sm:w-64 bg-[var(--card)] border-[var(--border)]',
                    'rounded-xl shadow-lg p-2 transition-all duration-200 ease-in-out'
                  )}
                  side="bottom"
                  align="end"
                  sideOffset={10}
                >
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]',
                      'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                    )}
                  >
                    <MdAccountCircle size={18} />
                    <span>Hồ sơ</span>
                  </DropdownMenuItem>
                  {user.role === RoleEnum.CUSTOMER && (
                    <DropdownMenuItem
                      onClick={() => router.push('/historybooking')}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]',
                        'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                        'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                      )}
                    >
                      <MdCalendarToday size={18} />
                      <span>Lịch sử hoạt động</span>
                    </DropdownMenuItem>
                  )}

                  {user.role === RoleEnum.ADMIN && (
                    <DropdownMenuItem
                      onClick={() => router.push('/admin')}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]',
                        'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                        'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                      )}
                    >
                      <MdOutlineAdminPanelSettings size={18} />
                      <span>Trang quản trị</span>
                    </DropdownMenuItem>
                  )}
                  {user.role === RoleEnum.DRIVER && (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push('/tripmanage')}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]',
                          'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                          'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                        )}
                      >
                        <MdOutlineAdminPanelSettings size={18} />
                        <span>Quản lý tuyến đường</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push('/driverpass')}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]',
                          'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                          'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                        )}
                      >
                        <Package2Icon size={18} />
                        <span>Gói dịch vụ</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="my-1 bg-[var(--border)]" />
                  <div className="py-2">
                    <ThemeColorToggle />
                  </div>
                  <DropdownMenuItem
                    onClick={() => setIsLogoutOpen(true)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]',
                      'hover:bg-red-500 hover:text-white hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500'
                    )}
                  >
                    <LogIn size={18} />
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
              'md:hidden hover:bg-[var(--muted)] hover:shadow-sm',
              'transition-all duration-200 ease-in-out rounded-lg'
            )}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'fixed top-0 right-0 h-full w-72 sm:w-80 bg-[var(--card)] shadow-xl z-50',
          'transform transition-all duration-300 ease-in-out border-l border-[var(--border)]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
          <span className="text-lg font-semibold text-[var(--foreground)]">
            Menu
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className={cn(
              'hover:bg-[var(--muted)] hover:shadow-sm',
              'transition-all duration-200 ease-in-out rounded-lg'
            )}
          >
            <X size={24} className="text-[var(--foreground)]" />
          </Button>
        </div>
        <div className="flex flex-col space-y-2 p-4">
          <Link
            href="/"
            className={cn(
              'p-3 text-[var(--foreground)] text-sm font-medium',
              'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
              'transition-all duration-200 ease-in-out rounded-lg'
            )}
            onClick={() => setIsOpen(false)}
          >
            Trang chủ
          </Link>
          {user?.role === RoleEnum.DRIVER && (
            <>
              <Link
                href="/registeratrip"
                className={cn(
                  'p-3 text-[var(--foreground)] text-sm font-medium',
                  'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                  'transition-all duration-200 ease-in-out rounded-lg'
                )}
                onClick={() => setIsOpen(false)}
              >
                Đăng ký tuyến đường
              </Link>
            </>
          )}
          <Link
            href="/contact"
            className={cn(
              'p-3 text-[var(--foreground)] text-sm font-medium',
              'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
              'transition-all duration-200 ease-in-out rounded-lg'
            )}
            onClick={() => setIsOpen(false)}
          >
            Liên hệ
          </Link>
          <Link
            href="/about"
            className={cn(
              'p-3 text-[var(--foreground)] text-sm font-medium',
              'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
              'transition-all duration-200 ease-in-out rounded-lg'
            )}
            onClick={() => setIsOpen(false)}
          >
            Về chúng tôi
          </Link>

          {!user ? (
            <div className="pt-4 space-y-2">
              <Button
                variant="default"
                className={cn(
                  'w-full bg-[var(--primary)] text-[var(--primary-foreground)]',
                  'hover:bg-[var(--primary)]/90 hover:shadow-md',
                  'transition-all duration-200 ease-in-out rounded-lg py-2.5 text-sm font-medium'
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
                  'w-full bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]',
                  'hover:bg-[var(--muted)] hover:shadow-md',
                  'transition-all duration-200 ease-in-out rounded-lg py-2.5 text-sm font-medium'
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
                      'flex items-center gap-3 p-3 w-full justify-start',
                      'hover:bg-[var(--muted)] hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-lg'
                    )}
                  >
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full bg-[var(--muted)]',
                        'flex items-center justify-center shadow-sm ring-1 ring-[var(--border)]'
                      )}
                    >
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          width={40}
                          height={40}
                          alt="Avatar"
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-base font-semibold text-[var(--foreground)]">
                          {user.name?.split(' ')?.[0]?.charAt(0)}
                          {user.name?.split(' ')?.[1]?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-[var(--foreground)]">
                        {user.name}
                      </span>
                      <span className="truncate text-xs text-[var(--muted-foreground)]">
                        {user.email}
                      </span>
                    </div>
                    <span className="ml-auto size-5 text-[var(--muted-foreground)]">
                      <CiMenuKebab />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    'w-56 sm:w-64 bg-[var(--card)] border-[var(--border)]',
                    'rounded-xl shadow-lg p-2 mx-2 transition-all duration-200 ease-in-out'
                  )}
                  side="bottom"
                  align="end"
                  sideOffset={10}
                >
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]',
                      'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                    )}
                  >
                    <MdAccountCircle size={18} />
                    <span>Hồ sơ</span>
                  </DropdownMenuItem>
                  {user.role === RoleEnum.CUSTOMER && (
                    <DropdownMenuItem
                      onClick={() => router.push('/historybooking')}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]',
                        'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                        'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                      )}
                    >
                      <MdCalendarToday size={18} />
                      <span>Lịch sử hoạt động</span>
                    </DropdownMenuItem>
                  )}

                  {user.role === RoleEnum.ADMIN && (
                    <DropdownMenuItem
                      onClick={() => router.push('/admin')}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]',
                        'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                        'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                      )}
                    >
                      <MdOutlineAdminPanelSettings size={18} />
                      <span>Trang quản trị</span>
                    </DropdownMenuItem>
                  )}
                  {user.role === RoleEnum.DRIVER && (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push('/tripmanage')}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]',
                          'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                          'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                        )}
                      >
                        <MdOutlineAdminPanelSettings size={18} />
                        <span>Quản lý tuyến đường</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push('/tripmanage')}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]',
                          'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                          'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                        )}
                      >
                        <Package2Icon size={18} />
                        <span>Gói dịch vụ</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="my-1 bg-[var(--border)]" />
                  <div className="py-2">
                    <ThemeColorToggle />
                  </div>
                  <DropdownMenuItem
                    onClick={() => setIsLogoutOpen(true)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]',
                      'hover:bg-red-500 hover:text-white hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500'
                    )}
                  >
                    <LogIn size={18} />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
      <LogoutDialog isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} />
    </nav>
  )
}

export default Header
