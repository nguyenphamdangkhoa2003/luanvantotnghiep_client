'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthContext } from '@/context/auth-provider'
import { RoleEnum } from '@/types/enum'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { AlertCircle, Loader2, Star } from 'lucide-react'
import { FaBan } from 'react-icons/fa'
import { CiWarning } from 'react-icons/ci'
import { MdOutlineVerified } from 'react-icons/md'
import { useErrorAlert } from '@/components/dialog/ErrorAlertDiglog'
import PasswordDialog from '@/components/dialog/PasswordDialog'
import { getInitials } from '@/utils'
import { AccountTab } from './_components/AccountTab'
import { SecurityTab } from './_components/SecurityTab'
import { DriverTab } from './_components/DriverTab'
import { Skeleton } from '@/components/ui/skeleton'
import {
  updateUserAvatarMutationFn,
  updateUserRoleMutationFn,
} from '@/api/users/user'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getUserProfileQueryFn } from '@/api/auths/auth'
import MembershipTab from './_components/MembershipTab'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function UserProfilePage() {
  const router = useRouter()
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState('account')
  const [isLoading, setIsLoading] = useState(false)
  const { showError, ErrorAlertComponent } = useErrorAlert()
  const { user, isLoading: authLoading, error: authError } = useAuthContext()
  const [hasAttemptedRoleUpdate, setHasAttemptedRoleUpdate] = useState(false)

  const { data, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: getUserProfileQueryFn,
  })

  const currentUser = data?.data
  const isDriver = currentUser?.role === RoleEnum.DRIVER

  const updateRoleMutation = useMutation({
    mutationFn: (data: { role: string }) => updateUserRoleMutationFn(data),
    onSuccess: () => {
      toast.success('Cập nhật vai trò thành công', {
        description: 'Người dùng đã được chuyển sang vai trò Tài xế',
      })
      setHasAttemptedRoleUpdate(true)
      refetch()
    },
    onError: (error: any) => {
      toast.error('Cập nhật vai trò thất bại', {
        description: error.message || 'Đã xảy ra lỗi khi cập nhật vai trò',
      })
      setHasAttemptedRoleUpdate(false)
    },
  })

  const isIdentityVerified =
    currentUser?.identityDocument?.verificationStatus === 'approved'
  const isDriverLicenseVerified =
    currentUser?.driverLicense?.verificationStatus === 'approved'
  const isDriverVehiclesVerified =
    currentUser?.vehicles?.length > 0 &&
    currentUser?.vehicles.every(
      (vehicle: any) => vehicle.verificationStatus === 'approved'
    )
  const hasDataToVerify =
    currentUser && (currentUser.identityDocument || currentUser.driverLicense)
  const isFullyVerified =
    hasDataToVerify && isIdentityVerified && isDriverLicenseVerified

  useEffect(() => {
    if (
      isFullyVerified &&
      currentUser?.role !== 'driver' &&
      !hasAttemptedRoleUpdate
    ) {
      updateRoleMutation.mutate({ role: 'driver' })
    }
  }, [isFullyVerified, currentUser?.role, hasAttemptedRoleUpdate])

  const uploadAvatarMutation = useMutation({
    mutationFn: updateUserAvatarMutationFn,
    onMutate: () => setIsLoading(true),
    onSuccess: () => {
      toast.success('Cập nhật ảnh đại diện thành công!')
      refetch()
    },
    onError: (error: any) => {
      showError(error.message || 'Cập nhật ảnh đại diện thất bại')
    },
    onSettled: () => setIsLoading(false),
  })

  const handleUploadAvatar = (file: File) => {
    if (!user?._id) {
      toast.error('Không tìm thấy người dùng')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh vượt quá 5MB')
      return
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Chỉ chấp nhận file JPEG hoặc PNG')
      return
    }
    uploadAvatarMutation.mutate(file)
  }

  const handleBack = () => router.back()
  const handleLogin = () => router.push('sign-in')

  const FullyVerified =
    isIdentityVerified && isDriverLicenseVerified && isDriverVehiclesVerified

  if (authLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl pt-16 pb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[var(--card)] p-6 rounded-lg shadow">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="sm:hidden space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="w-full space-y-3">
            <div className="hidden sm:flex items-center gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="hidden sm:block h-4 w-64" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-md" />
            ))}
          </div>
          <div className="bg-[var(--card)] p-6 rounded-lg shadow">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
              <div className="pt-4">
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4 pt-5">
        <div className="max-w-md w-full p-6 bg-[var(--card)] rounded-lg shadow-lg border border-[var(--destructive)]">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-[var(--destructive)]/10 rounded-full">
              <AlertCircle className="h-8 w-8 text-[var(--destructive)]" />
            </div>
            <h2 className="text-2xl font-bold">Đã xảy ra lỗi</h2>
            <p className="text-[var(--muted-foreground)]">
              {authError.message || 'Không thể tải dữ liệu người dùng'}
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleBack}>
                Quay lại
              </Button>
              <Button onClick={() => window.location.reload()}>Thử lại</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4 pt-5">
        <div className="max-w-md w-full p-6 bg-[var(--card)] rounded-lg shadow-lg border">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-[var(--muted)] rounded-full">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Không có dữ liệu</h2>
            <p className="text-[var(--muted-foreground)]">
              Vui lòng đăng nhập để xem hồ sơ
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleBack}>
                Quay lại
              </Button>
              <Button onClick={handleLogin}>Đăng nhập</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabTriggers = [
    { value: 'account', label: 'Tài khoản' },
    { value: 'security', label: 'Bảo mật' },
    { value: 'driver', label: 'Tài xế' },
    ...(isDriver ? [{ value: 'membership', label: 'Gói thành viên' }] : []),
  ]

  return (
    <div className="container mx-auto p-4 max-w-4xl pt-16 pb-10">
      <ErrorAlertComponent />

      {/* Profile Header */}
      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 bg-[var(--card)] p-4 sm:p-6 rounded-lg shadow">
        {/* Avatar and User Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="relative">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
              {currentUser?.avatar ? (
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              ) : (
                <AvatarFallback className="bg-[var(--muted)]">
                  {getInitials(currentUser?.name || user.name)}
                </AvatarFallback>
              )}
            </Avatar>
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <h1 className="text-lg sm:text-2xl font-bold">
                {currentUser?.name || user.name}
              </h1>

              {currentUser?.banned && (
                <Badge variant="destructive" className="gap-1">
                  <FaBan className="h-3 w-3" />
                  Bị khóa
                </Badge>
              )}

              {isDriver && (
                <Badge
                  variant={FullyVerified ? 'success' : 'warning'}
                  className="gap-1"
                >
                  {FullyVerified ? (
                    <MdOutlineVerified className="h-3 w-3" />
                  ) : (
                    <CiWarning className="h-3 w-3" />
                  )}
                  {FullyVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                </Badge>
              )}

              <Badge variant="outline" className="text-[var(--primary)]">
                {currentUser?.role || user.role}
              </Badge>
            </div>

            <p className="text-sm sm:text-base text-[var(--muted-foreground)]">
              {currentUser?.email || user.email}
            </p>

            {currentUser?.currentMembership?.packageType && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <Badge variant="secondary" className="gap-1">
                  <span className="font-medium">Gói:</span>
                  <span className="text-[var(--primary)] capitalize">
                    {currentUser.currentMembership.packageType.toLowerCase()}
                  </span>
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <span className="font-medium">Yêu cầu còn lại:</span>
                  <span className="text-[var(--primary)]">
                    {currentUser.currentMembership.remainingRequests}
                  </span>
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Rating and Reviews Link */}
        <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:absolute sm:top-6 sm:right-6">
          {currentUser?.averageRating && currentUser?.ratingCount > 0 ? (
            <div
              className="flex items-center gap-1"
              aria-label={`Đánh giá: ${currentUser.averageRating} sao từ ${currentUser.ratingCount} người`}
            >
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-[var(--foreground)]">
                {currentUser.averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                ({currentUser.ratingCount} đánh giá)
              </span>
            </div>
          ) : (
            <span className="text-xs text-[var(--muted-foreground)]">
              Chưa có đánh giá
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/profile/reviews/${user._id}`)}
            className="h-10 w-full sm:w-auto px-4 text-[var(--primary)] border-[var(--border)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] rounded-lg"
            aria-label="Xem nhận xét của người dùng"
          >
            Xem nhận xét
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-6 space-y-6">
        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <TabsList
            className="w-full grid"
            style={{
              gridTemplateColumns: `repeat(${tabTriggers.length}, minmax(0, 1fr))`,
            }}
          >
            {tabTriggers.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="account" className="mt-6">
            <AccountTab
              user={currentUser || user}
              isLoading={isLoading}
              handleUploadAvatar={handleUploadAvatar}
            />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecurityTab
              user={currentUser || user}
              setIsPasswordDialogOpen={setIsPasswordDialogOpen}
            />
          </TabsContent>

          <TabsContent value="driver" className="mt-6">
            <DriverTab user={currentUser} refetchData={refetch} />
          </TabsContent>

          <TabsContent value="membership" className="mt-6">
            <MembershipTab userId={currentUser?._id || user._id} />
          </TabsContent>
        </Tabs>
      </div>

      <PasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </div>
  )
}
