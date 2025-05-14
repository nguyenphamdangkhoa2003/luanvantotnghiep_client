'use client'
import { useState } from 'react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { updateUserAvatarMutationFn } from '@/api/users/user'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getUserProfileQueryFn } from '@/api/auths/auth'

export default function UserProfilePage() {
  const router = useRouter()
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState('account')
  const [isLoading, setIsLoading] = useState(false)
  const [isDriver, setIsDriver] = useState(false)
  const { showError, ErrorAlertComponent } = useErrorAlert()
  const { user, isLoading: authLoading, error: authError } = useAuthContext()
  const { data, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: getUserProfileQueryFn,
  })

  const currentUser = data?.data

  const uploadAvatarMutation = useMutation({
    mutationFn: updateUserAvatarMutationFn,
    onMutate: () => {
      setIsLoading(true)
    },
    onSuccess: () => {
      toast.success('Avatar updated successfully!')
      refetch()
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to upload avatar')
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const handleUploadAvatar = (file: File) => {
    if (!user?._id) {
      toast.error('User not found')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB')
      return
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only JPEG or PNG files are allowed')
      return
    }
    uploadAvatarMutation.mutate(file)
  }

  const handleBack = () => router.back()

  if (authLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6 max-w-4xl pt-16 pb-10 bg-gray-50 dark:bg-gray-900">
        {/* Skeleton for Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full" />
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
        {/* Skeleton for Tabs */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
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
        <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-red-100 dark:border-red-900">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Error occurred
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {authError.message || 'Failed to load user data'}
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Go Back
              </Button>
              <Button
                variant="default"
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4 pt-5">
        <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
              <AlertCircle className="h-8 w-8 text-gray-600 dark:text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              No User Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please login to view your profile
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Go Back
              </Button>
              <Button
                variant="default"
                onClick={() => router.push('/sign-in')}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabTriggers = [
    { value: 'account', label: 'Account' },
    { value: 'security', label: 'Security' },
    { value: 'driver', label: 'Driver' },
  ]

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl pt-16 pb-10 bg-gray-50 dark:bg-gray-900">
      <ErrorAlertComponent />
      {/* User Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
            {currentUser?.avatar ? (
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {getInitials(currentUser?.name || user.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="sm:hidden space-y-1">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                {currentUser?.name || user.name}
              </h2>
              {currentUser?.banned && (
                <div className="text-xs sm:text-sm text-red-500 flex items-center gap-1 font-bold">
                  <FaBan className="text-red-500" />
                  Banned
                </div>
              )}
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {currentUser?.email || user.email}
            </p>
          </div>
        </div>
        <div className="w-full space-y-1">
          <div className="hidden sm:flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              {currentUser?.name || user.name}
            </h2>
            {currentUser?.banned && (
              <div className="text-xs sm:text-sm text-red-500 flex items-center gap-1 font-bold">
                <FaBan className="text-red-500" />
                Banned
              </div>
            )}
            {(isDriver || currentUser?.role === RoleEnum.DRIVER) &&
            currentUser?.identityVerified === 'VERIFIED' ? (
              <div className="text-xs sm:text-sm text-green-500 flex items-center gap-1 font-bold">
                <MdOutlineVerified className="text-green-500" />
                Verified
              </div>
            ) : isDriver || currentUser?.role === RoleEnum.DRIVER ? (
              <div className="text-xs sm:text-sm text-yellow-500 flex items-center gap-1 font-bold">
                <CiWarning className="text-yellow-500" />
                Unverified
              </div>
            ) : null}
          </div>
          <div className="sm:hidden flex items-center gap-2">
            {(isDriver || currentUser?.role === RoleEnum.DRIVER) &&
            currentUser?.identityVerified === 'VERIFIED' ? (
              <div className="text-xs text-green-500 flex items-center gap-1 font-bold">
                <MdOutlineVerified className="text-green-500" />
                Verified
              </div>
            ) : isDriver || currentUser?.role === RoleEnum.DRIVER ? (
              <div className="text-xs text-yellow-500 flex items-center gap-1 font-bold">
                <CiWarning className="text-yellow-500" />
                Unverified
              </div>
            ) : null}
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Role: {currentUser?.role || user.role}
            </p>
          </div>
          <p className="hidden sm:block text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {currentUser?.email || user.email}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <p className="hidden sm:block text-blue-600 dark:text-blue-400">
              Role: {currentUser?.role || user.role}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList
          className="w-full grid bg-gray-100 dark:bg-gray-700"
          style={{
            gridTemplateColumns: `repeat(${tabTriggers.length}, minmax(0, 1fr))`,
          }}
        >
          {tabTriggers.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="account">
          <AccountTab
            user={currentUser || user}
            isLoading={isLoading}
            handleUploadAvatar={handleUploadAvatar}
          />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab
            user={currentUser || user}
            setIsPasswordDialogOpen={setIsPasswordDialogOpen}
          />
        </TabsContent>
        <TabsContent value="driver">
        </TabsContent>
      </Tabs>
      <PasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </div>
  )
}
