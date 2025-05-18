// pages/user/[id].tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FaArrowLeftLong } from 'react-icons/fa6'
import { toast } from 'sonner'
import ProfileTab from './_component/ProfileTab'
import DriverTab from './_component/DriverTab'
import { UserType } from '@/context/auth-provider'
import { RoleEnum } from '@/types/enum'
import { Skeleton } from '@/components/ui/skeleton'

// Mock data
const mockUserData: UserType = {
  _id: '6821cb84f57a941f98c1372f',
  username: 'tuan.manh',
  email: 'manhtuanpham68@gmail.com',
  name: 'Tuấn Mạnh',
  password: 'UNSET',
  role: RoleEnum.ADMIN,
  isEmailVerified: true,
  oauthProviders: ['google'],
  credentials: {
    version: 1,
    lastPassword: '',
    passwordUpdatedAt: 1747045252,
    updatedAt: 1747045252,
  },
  vehicles: [],
  paymentMethods: [],
  __v: 0,
  dateOfBirth: '2003-08-18',
  phoneNumber: '+84981191651',
  avatar:
    'https://res.cloudinary.com/dxbw59hvb/image/upload/v1747220881/xeshare/avatars/6821cb84f57a941f98c1372f/avatar-1747220874416-DH52100999.jpg.jpg',
  isOnline: false,
  createdAt: '2025-05-12T10:20:52.103Z',
  updatedAt: '2025-05-13T12:14:04.880Z',
  driverLicense: {
    licenseNumber: '812744404253',
    frontImage:
      'https://res.cloudinary.com/dxbw59hvb/image/upload/v1747222162/xeshare/documents/driverLicense/6821cb84f57a941f98c1372f/front/b9e96fygmdccq0v8i6gi.jpg',
    backImage:
      'https://res.cloudinary.com/dxbw59hvb/image/upload/v1747222157/xeshare/documents/driverLicense/6821cb84f57a941f98c1372f/back/gx9irxa3cdkbbjumxcfh.jpg',
    verificationStatus: 'pending',
  },
  identityDocument: {
    documentNumber: '019199887766',
    frontImage:
      'https://res.cloudinary.com/dxbw59hvb/image/upload/v1747222160/xeshare/documents/identityDocument/6821cb84f57a941f98c1372f/front/mr46v9rjccix9gsc12ng.jpg',
    backImage:
      'https://res.cloudinary.com/dxbw59hvb/image/upload/v1747222168/xeshare/documents/identityDocument/6821cb84f57a941f98c1372f/back/aaplp9vcfh6nacvxutiy.jpg',
    verificationStatus: 'approve',
  },
}

export default function UserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [userData, setUserData] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setUserData(mockUserData)
      setIsLoading(false)
    }, 1000)
  }, [params.id])

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

  if (!userData) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center space-y-4 text-center p-8">
          <h2 className="text-2xl font-bold">User not found</h2>
          <p>The user you are looking for does not exist</p>
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
          <ProfileTab
            userData={userData}
          />
        </TabsContent>

          <TabsContent value="driver" className="mt-4">
            <DriverTab
              userData={userData}
            />
          </TabsContent>
      </Tabs>

      
    </div>
  )
}
