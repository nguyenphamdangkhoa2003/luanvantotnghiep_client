'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthContext } from '@/context/auth-provider'
import { RoleEnum } from '@/types/enum'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { AlertCircle, Loader2 } from 'lucide-react'
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
import { updateUserAvatarMutationFn } from '@/api/users/user'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getUserProfileQueryFn } from '@/api/auths/auth'
import MembershipTab from './_components/MembershipTab'
import { Badge } from '@/components/ui/badge'

export default function UserProfilePage() {
  const router = useRouter()
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState('account')
  const [isLoading, setIsLoading] = useState(false)
  const { showError, ErrorAlertComponent } = useErrorAlert()
  const { user, isLoading: authLoading, error: authError } = useAuthContext()

  const { data, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: getUserProfileQueryFn,
  })

  const currentUser = data?.data
  const isDriver = currentUser?.role === RoleEnum.DRIVER

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

  if (authLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl pt-16 pb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card p-6 rounded-lg shadow">
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
          <div className="bg-card p-6 rounded-lg shadow">
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
        <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg border border-destructive">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold">Đã xảy ra lỗi</h2>
            <p className="text-muted-foreground">
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
        <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg border">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-muted rounded-full">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Không có dữ liệu</h2>
            <p className="text-muted-foreground">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card p-6 rounded-lg shadow">
        <div className="relative">
          <Avatar className="h-20 w-20">
            {currentUser?.avatar ? (
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <AvatarFallback className="bg-muted">
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

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">
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
                variant={
                  currentUser?.identityVerified === 'VERIFIED'
                    ? 'success'
                    : 'warning'
                }
                className="gap-1"
              >
                {currentUser?.identityVerified === 'VERIFIED' ? (
                  <MdOutlineVerified className="h-3 w-3" />
                ) : (
                  <CiWarning className="h-3 w-3" />
                )}
                {currentUser?.identityVerified === 'VERIFIED'
                  ? 'Đã xác minh'
                  : 'Chưa xác minh'}
              </Badge>
            )}

            <Badge variant="outline" className="text-primary">
              {currentUser?.role || user.role}
            </Badge>
          </div>

          <p className="text-muted-foreground">
            {currentUser?.email || user.email}
          </p>

          {currentUser?.currentMembership?.packageType && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="secondary" className="gap-1">
                <span className="font-medium">Gói:</span>
                <span className="text-primary capitalize">
                  {currentUser.currentMembership.packageType.toLowerCase()}
                </span>
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <span className="font-medium">Yêu cầu còn lại:</span>
                <span className="text-primary">
                  {currentUser.currentMembership.remainingRequests}
                </span>
              </Badge>
            </div>
          )}
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
