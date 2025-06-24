'use client'

import React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getActiveMembershipQueryFn,
  purchaseMembershipMutationFn,
} from '@/api/memberships/membership'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useErrorAlert } from '@/components/dialog/ErrorAlertDiglog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Membership {
  _id: string
  packageType: string
  acceptRequests: number
  price: number
  durationDays: number
  startDate: string
  endDate: string
  status: 'active' | 'expired'
  createdAt: string
  updatedAt: string
}

const MembershipCard = ({
  membership,
  onRenew,
}: {
  membership: Membership
  onRenew: (packageType: string) => void
}) => {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: vi })
    } catch {
      return 'N/A'
    }
  }

  const isActive = membership.status === 'active'
  const cardVariant = isActive ? 'default' : 'expired'

  return (
    <div
      className={`border rounded-lg p-6 ${
        isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 capitalize">
              {membership.packageType.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <Badge
              variant={isActive ? 'success' : 'destructive'}
              className="text-sm"
            >
              {isActive ? 'Đang hoạt động' : 'Đã hết hạn'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Giá gói</p>
              <p className="font-medium">
                {membership.price.toLocaleString('vi-VN')} VND
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Số yêu cầu</p>
              <p className="font-medium">{membership.acceptRequests}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Thời hạn</p>
              <p className="font-medium">{membership.durationDays} ngày</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày kích hoạt</p>
              <p className="font-medium">{formatDate(membership.startDate)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between">
          <div className="text-right">
            <p className="text-sm text-gray-500">Hết hạn vào</p>
            <p
              className={`font-bold ${
                isActive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatDate(membership.endDate)}
            </p>
          </div>

          {!isActive && (
            <Button
              variant="outline"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => onRenew(membership.packageType)}
            >
              Gia hạn gói
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

const MembershipTab = ({ userId }: { userId: string }) => {
  const { showError, ErrorAlertComponent } = useErrorAlert()
  const router = useRouter()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activeMembership', userId],
    queryFn: getActiveMembershipQueryFn,
    retry: (failureCount, error: any) => {
      if (error.response?.status === 404) return false
      return failureCount < 3
    },
  })

  const renewMutation = useMutation({
    mutationFn: purchaseMembershipMutationFn,
    onSuccess: () => {
      toast.success('Gia hạn gói thành viên thành công!')
      refetch()
      router.refresh()
    },
    onError: (error: any) => {
      showError(error.message || 'Có lỗi xảy ra khi gia hạn gói thành viên.')
    },
  })

  const handleRenew = (packageType: string) => {
    renewMutation.mutate({ packageType })
  }

  // if (error && error.response?.status !== 404) {
  //   return (
  //     <div className="space-y-4">
  //       <ErrorAlertComponent />
  //       <div className="text-center py-8">
  //         <h3 className="text-lg font-medium text-gray-900 mb-2">
  //           Không tải được thông tin gói thành viên
  //         </h3>
  //         <p className="text-gray-600 mb-4">
  //           Vui lòng thử lại sau hoặc liên hệ hỗ trợ
  //         </p>
  //         <Button onClick={() => refetch()}>Thử lại</Button>
  //       </div>
  //     </div>
  //   )
  // }

  const membership: Membership | null = data?.data || null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Quản lý gói thành viên
        </h2>
      </div>

      {!membership ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bạn chưa có gói thành viên
          </h3>
          <p className="text-gray-600 mb-4">
            Đăng ký ngay để trải nghiệm các tính năng ưu đãi
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/driverpass')}
          >
            Chọn gói thành viên
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <MembershipCard membership={membership} onRenew={handleRenew} />
        </div>
      )}
    </div>
  )
}

export default MembershipTab
