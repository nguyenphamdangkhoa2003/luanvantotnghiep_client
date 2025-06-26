'use client'

import { getUsersQueryFn } from '@/api/users/user'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertCircle,
  ShieldAlert,
  UserCheck,
  Users,
  FileText,
  Car,
  FileBadge,
  Bell,
  AlertTriangle,
  Star,
  Frown,
  Clock,
} from 'lucide-react'
import { getInitials } from '@/utils'
import Link from 'next/link'

function AdminPage() {
  // Mock data for alerts (replace with real data)
  const alerts = [
    {
      id: 1,
      type: 'negative_review',
      message: 'Người dùng báo cáo trải nghiệm tiêu cực',
      severity: 'cao',
      user: { name: 'John Doe', id: '123' },
    },
    {
      id: 2,
      type: 'low_rating',
      message: 'Tài xế nhận đánh giá 1 sao',
      severity: 'trung bình',
      user: { name: 'Jane Smith', id: '456' },
    },
    {
      id: 3,
      type: 'document_expired',
      message: 'Giấy phép lái xe đã hết hạn',
      severity: 'thấp',
      user: { name: 'Bob Johnson', id: '789' },
    },
  ]

  const {
    data: apiResponse,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersQueryFn,
  })

  const users = apiResponse?.data?.data || []
  
  const pendingUsers = Array.isArray(users)
    ? users.filter((user) => {
        const hasPendingIdentity =
          user.identityDocument?.verificationStatus === 'pending'
        const hasPendingLicense =
          user.driverLicense?.verificationStatus === 'pending'
        const hasPendingVehicles = user.vehicles?.some(
          (vehicle: any) => vehicle.verificationStatus === 'pending'
        )

        return hasPendingIdentity || hasPendingLicense || hasPendingVehicles
      })
    : []

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <h1 className="text-2xl font-bold mb-6">
          Danh sách người dùng chờ xác minh
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48 mt-2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full shadow-lg border border-destructive">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold">Đã xảy ra lỗi</h2>
                <p className="text-muted-foreground">
                  {error?.message || 'Không thể tải danh sách người dùng'}
                </p>
                <Button onClick={() => refetch()}>Thử lại</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Yêu cầu xác minh đang chờ</p>
              <p className="text-xl font-semibold">{pendingUsers.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Cảnh báo đang hoạt động</p>
              <p className="text-xl font-semibold">{alerts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tổng số người dùng</p>
              <p className="text-xl font-semibold">{users.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border border-gray-100 shadow-sm mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Yêu cầu xác minh
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Xem xét và phê duyệt các tài liệu đang chờ
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {pendingUsers.length} Đang chờ
            </Badge>
          </div>
        </CardHeader>

        {pendingUsers.length === 0 ? (
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-green-50 rounded-full mb-3">
              <UserCheck className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">
              Tất cả yêu cầu xác minh đã hoàn tất
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Hiện tại không có yêu cầu xác minh nào đang chờ xử lý.
            </p>
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {pendingUsers.map((user) => (
                <Card
                  key={user._id}
                  className="border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border border-gray-200">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.name} />
                        ) : (
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">
                          {user.name}
                        </CardTitle>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {user.role === 'customer'
                            ? 'Khách hàng'
                            : user.role === 'driver'
                            ? 'Tài xế'
                            : user.role}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex flex-wrap gap-2">
                      {user.identityDocument?.verificationStatus ===
                        'pending' && (
                        <Badge className="text-xs bg-amber-50 text-amber-700 hover:bg-amber-50">
                          <FileText className="h-3 w-3 mr-1" />
                          CMND/CCCD
                        </Badge>
                      )}
                      {user.driverLicense?.verificationStatus === 'pending' && (
                        <Badge className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-50">
                          <FileBadge className="h-3 w-3 mr-1" />
                          Bằng lái
                        </Badge>
                      )}
                      {user.vehicles?.some(
                        (v: any) => v.verificationStatus === 'pending'
                      ) && (
                        <Badge className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-50">
                          <Car className="h-3 w-3 mr-1" />
                          {
                            user.vehicles.filter(
                              (v: any) => v.verificationStatus === 'pending'
                            ).length
                          }{' '}
                          Phương tiện
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/admin/users/${user._id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        Xem xét
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

export default AdminPage
