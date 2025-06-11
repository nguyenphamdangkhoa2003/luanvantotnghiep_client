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
} from '@/components/ui/dropdown-menu'
import { RoleEnum } from '@/types/enum'
import LogoutDialog from '@/components/dialog/LogoutDialog'
import Logo from '../Logo'
import { ThemeColorToggle } from '@/components/toggle/ThemeColorToggle'
import { ThemeModeToggle } from '@/components/toggle/ThemeModeToggle'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/context/auth-provider'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRequestsByDriverIdQueryFn, handleRequestMutationFn } from '@/api/routes/route'
import { toast } from 'sonner'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

interface User {
  _id: string
  email: string
  name: string
}



interface Request {
  _id: string
  userId: User
  routeId: {
    name:string
  }
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  message?: string
  seats: number
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  data: Request[]
}

const Header = () => {
  const router = useRouter()
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { user, isLoading: isAuthLoading, isFetching, isSuccess } = useAuthContext()
  const queryClient = useQueryClient()

  // Fetch requests for the driver
  const { data: response } = useQuery<ApiResponse>({
    queryKey: ['requests', user?._id],
    queryFn: () => getRequestsByDriverIdQueryFn(user!._id),
    enabled: !!user?._id && isSuccess,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  // Filter only pending requests
  const pendingRequests = response?.data.filter((request) => request.status === 'pending') || []

  // Mutation to handle request (accept/reject)
  const handleRequestMutation = useMutation({
    mutationFn: handleRequestMutationFn,
    onSuccess: () => {
      toast.success('Yêu cầu đã được xử lý thành công')
      queryClient.invalidateQueries({ queryKey: ['requests', user?._id] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.')
    },
  })

  // Handle accept/reject actions
  const handleAction = (requestId: string, action: 'accept' | 'reject') => {
    handleRequestMutation.mutate({
      requestId,
      action,
      reason: action === 'reject' ? 'Tài xế đã từ chối yêu cầu' : undefined,
    })
  }

  // Format timestamp to relative time (e.g., "2 giờ trước")
  const formatTime = (timestamp: string) => {
    try {
      const date = parseISO(timestamp)
      return formatDistanceToNow(date, { locale: vi, addSuffix: true })
    } catch {
      return 'Không rõ thời gian'
    }
  }


  return (
    <nav
      className={cn(
        'fixed w-full z-20 top-0 start-0 bg-[var(--background)] border-b',
        'border-[var(--border)] shadow-sm'
      )}
    >
      <div className="max-w-screen-xl flex items-center justify-between mx-auto px-4 sm:px-6 py-3">
        {/* Logo */}
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

        {/* Menu Desktop */}
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

        {/* Phần điều khiển */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Nút thông báo (Desktop) */}
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
                {pendingRequests.length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className={cn(
                'w-64 sm:w-80 bg-[var(--card)] border-[var(--border)]',
                'rounded-[var(--radius-md)] shadow-lg p-2'
              )}
              side="bottom"
              align="end"
              sideOffset={8}
            >
              {pendingRequests.length > 0 ? (
                <>
                  {pendingRequests.map((request) => (
                    <DropdownMenuItem
                      key={request._id}
                      className={cn(
                        'flex flex-col items-start gap-1 px-3 py-2 text-sm text-[var(--foreground)]',
                        'hover:bg-[var(--muted)] hover:shadow-sm',
                        'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-default'
                      )}
                    >
                      <span className="font-medium">
                        {request.userId.name} yêu cầu đặt {request.seats} ghế
                        cho tuyến {request.routeId.name}
                        {request.message && `: "${request.message}"`}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {formatTime(request.createdAt)}
                      </span>
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-50 text-white hover:text-blue-600 text-xs"
                          onClick={() => handleAction(request._id, 'accept')}
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
                          onClick={() => handleAction(request._id, 'reject')}
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
                    'rounded-[var(--radius-sm)]'
                  )}
                >
                  Không có yêu cầu đang chờ xử lý
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
                    'w-[--radix-dropdown-menu-trigger-width] min-w-52 sm:min-w-56',
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
          {/* Hamburger Menu Button */}
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-64 sm:w-72 bg-white shadow-lg z-1000',
          'transform transition-all duration-200 ease-in-out',
          isOpen ? '' : 'translate-x-full'
        )}
      >
        <div className="flex justify-end p-4"></div>
        <div className="flex space-y-1">
          <Link
            href="/"
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-gray-50 rounded w-full cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Trang chủ
          </Link>
          <Link
            href="/booking"
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-gray-50 rounded w-full cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Đặt trước
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

          {/* Auth Section for Mobile */}
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
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    'w-64 bg-white border-gray-200 rounded-lg shadow-lg p-2'
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
        </div>
      </div>
      <LogoutDialog isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} />
    </nav>
  )
}

export default Header