'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, User, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  completeTripMutationFn,
  getPassengersQueryFn,
} from '@/api/routes/route'
import React from 'react'

interface User {
  _id: string
  name: string
  email: string
}

interface Request {
  _id: string
  userId: User
  routeId: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed'
  message?: string
  seats: number
  createdAt: string
  updatedAt: string
}

interface Passenger {
  userId: string
  name: string
  email: string
  request: {
    requestId: Request
  }
  createdAt: string
}

interface PassengerApiResponse {
  data: Passenger[]
}

interface ApiError {
  message: string
  status?: number
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PassengerList({ params }: PageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const resolvedParams = React.use(params)
  const routeId = resolvedParams.id

  // Query để lấy danh sách hành khách
  const { data, isLoading, error } = useQuery<PassengerApiResponse, ApiError>({
    queryKey: ['passengers', routeId],
    queryFn: () => getPassengersQueryFn({ routeId }),
    enabled: !!routeId,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  // Mutation để hoàn thành chuyến đi
  const completeTripMutation = useMutation<
    unknown,
    ApiError,
    { tripRequestId: string }
  >({
    mutationFn: ({ tripRequestId }) =>
      completeTripMutationFn({ tripRequestId }), 
    onSuccess: () => {
      toast.success('Chuyến đi đã được xác nhận hoàn thành')
      queryClient.invalidateQueries({ queryKey: ['passengers', routeId] })
    },
    onError: (error) => {
      toast.error('Lỗi khi xác nhận hoàn thành', {
        description: error.message || 'Vui lòng thử lại sau',
        position: 'top-right',
      })
    },
  })

  // Lọc hành khách để chỉ hiển thị những người có trạng thái khác 'cancelled'
  const passengers = (data?.data || []).filter(
    (passenger) => passenger.request.requestId.status !== 'cancelled'
  )

  // Format ngày giờ
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return 'Không rõ thời gian'
    }
  }

  // Lấy badge trạng thái
  const getStatusBadge = (passenger: Passenger) => {
    switch (passenger.request.requestId.status) {
      case 'accepted':
        return <Badge variant="success">Đã xác nhận</Badge>
      case 'completed':
        return <Badge variant="success">Đã hoàn thành</Badge>
      case 'pending':
        return <Badge variant="secondary">Đang chờ</Badge>
      default:
        return (
          <Badge variant="default">
            {passenger.request.requestId.status}
          </Badge>
        )
    }
  }

  // Xử lý hoàn thành chuyến đi
  const handleComplete = (tripRequestId: string) => {
    completeTripMutation.mutate({ tripRequestId })
  }

  return (
    <div className="container mx-auto py-8 pt-16 px-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold">Danh sách hành khách</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Tổng số: {passengers.length} hành khách
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Đang tải...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          {error.message || 'Không thể tải danh sách hành khách.'}
        </div>
      ) : passengers.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Chưa có hành khách nào
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Hiện chưa có hành khách nào đăng ký tuyến đường này.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[150px]">Mã hành khách</TableHead>
              <TableHead>Thông tin</TableHead>
              <TableHead>Thời gian đặt</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passengers.map((passenger) => (
              <TableRow key={passenger.userId} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  HK-{passenger.userId.slice(-6)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{passenger.name}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-1 h-3 w-3" />
                      {passenger.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatDate(passenger.createdAt)}</TableCell>
                <TableCell>{getStatusBadge(passenger)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {passenger.request.requestId.status === 'accepted' && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() =>
                          handleComplete(passenger.request.requestId._id)
                        }
                        disabled={completeTripMutation.isPending}
                      >
                        {completeTripMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Hoàn thành'
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
