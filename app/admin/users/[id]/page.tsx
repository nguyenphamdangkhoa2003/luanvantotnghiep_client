'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FaArrowLeftLong } from 'react-icons/fa6'
import { toast } from 'sonner'
import ProfileTab from './_component/ProfileTab'
import DriverTab from './_component/DriverTab'
import { UserType } from '@/context/auth-provider'
import { RoleEnum } from '@/types/enum'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserByIdQueryFn } from '@/api/users/user'
import React from 'react'

export default function UserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

  // Unwrap params using React.use()
  const resolvedParams = React.use(params)
  const userId = resolvedParams.id

  // Fetch user data using useQuery
  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useQuery<UserType, Error>({
    queryKey: ['user', userId],
    queryFn: () => getUserByIdQueryFn(userId).then((res) => res.data),
    enabled: !!userId,
  })

  const handleBack = () => router.back()

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center space-y-4 text-center p-8">
          <h2 className="text-2xl font-bold">User not found</h2>
          <p>
            {error?.message || 'The user you are looking for does not exist'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              Go Back
            </Button>
            <Button onClick={() => router.push('/admin/users')}>
              View all users
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Button
        variant="ghost"
        onClick={handleBack}
        className="flex items-center gap-2"
      >
        <FaArrowLeftLong /> Back to Users
      </Button>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="driver">Driver</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTab userData={userData} />
        </TabsContent>

        <TabsContent value="driver" className="mt-4">
          <DriverTab userData={userData} refetch={refetch} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
