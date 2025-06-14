'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuthContext } from '@/context/auth-provider'
import {
  getRequestsByDriverIdQueryFn,
  handleRequestMutationFn,
} from '@/api/routes/route'
import { toast } from 'sonner'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { TbExclamationCircleFilled } from 'react-icons/tb'

interface User {
  _id: string
  email: string
  name: string
}

interface Route {
  _id: string
  startPoint?: { coordinates: [number, number]; address: string }
  endPoint?: { coordinates: [number, number]; address: string }
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

const Notifications = () => {
  const {
    user,
    isLoading: isAuthLoading,
    isFetching,
    isSuccess,
  } = useAuthContext()
  const queryClient = useQueryClient()
  const router = useRouter()
  // Fetch requests for the driver
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<ApiResponse>({
    queryKey: ['requests', user?._id],
    queryFn: () => getRequestsByDriverIdQueryFn(user!._id),
    enabled: !!user?._id && isSuccess,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  // Extract the requests array from the response
  const requests = response?.data || []

  // Mutation to handle request (accept/reject)
  const handleRequestMutation = useMutation({
    mutationFn: handleRequestMutationFn,
    onSuccess: () => {
      toast.success('Yêu cầu đã được xử lý thành công')
      queryClient.invalidateQueries({ queryKey: ['requests', user?._id] })
    },
    onError: (error: any) => {
      toast.error('Cảnh báo', {
        description: 'Bạn chưa kích hoạt gói tài xế!',
        action: {
          label: 'Kích hoạt ngay',
          onClick: () => router.push('/driverpass'),
        },
        className: 'border-2 border-red-500',
        position: 'top-right',
        style: {
          backgroundColor: '#fff',
          color: '#000',
        },
      })
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

  const formatTime = (timestamp: string) => {
    try {
      const date = parseISO(timestamp)
      return formatDistanceToNow(date, { locale: vi, addSuffix: true })
    } catch {
      return 'Không rõ thời gian'
    }
  }

  // Map status to user-friendly Vietnamese text
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
      default:
        return status
    }
  }

  // Format route display
  

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

        <div className="space-y-4">
          {isLoading ? (
            <div
              className={cn(
                'p-4 rounded-lg bg-white border border-gray-200',
                'text-center text-gray-500'
              )}
            >
              Đang tải thông báo...
            </div>
          ) : requests.length > 0 ? (
            requests.map((request) => (
              <div
                key={request._id}
                className={cn(
                  'p-4 rounded-lg bg-white border border-gray-200',
                  'shadow-sm hover:shadow-md transition-all duration-200 ease-in-out',
                  request.status === 'pending' && 'border-blue-200 bg-gray-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {request.userId.name} yêu cầu đặt {request.seats} ghế cho
                      tuyến{' '}
                      <span className="font-semibold">
                        {request.routeId.name}
                      </span>
                      {request.message && `: "${request.message}"`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(request.createdAt)} (Trạng thái:{' '}
                      {getStatusText(request.status)})
                    </p>
                    {request.status === 'pending' && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-50 text-white hover:text-blue-600"
                          onClick={() => handleAction(request._id, 'accept')}
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
                          onClick={() => handleAction(request._id, 'reject')}
                          disabled={handleRequestMutation.isPending}
                        >
                          {handleRequestMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Từ chối'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  {request.status === 'pending' && (
                    <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-lg bg-white border border-gray-200 text-center text-gray-500">
              Không có thông báo
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications
