'use client'

import useAuth from '@/hooks/use-auth'
import { AvatarProviderEnum, RoleEnum } from '@/types/enum'
import React, { createContext, useContext } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import API from '@/api/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export type UserType = {
  _id: string
  name: string
  givenName: string
  familyName: string
  password: string
  phoneNumber: string
  dateOfBirth: string
  isEmailVerified: boolean
  email: string
  bio: string
  passwordEnabled: boolean
  deleteSelfEnabled: boolean
  hasImage: boolean
  avatar: string
  createdAt: Date
  updatedAt: Date
  banned: boolean
  lastSignInAt: Date
  externalAccount?: {
    provider: 'google'
    id: string
    name: string
    emails: { value: string; type?: string }[]
    picture: string
  }
  role: RoleEnum
  passwordEnable: boolean
  identityVerified: string
  driverInfo: {
    idPortraitImage?: string
    extractedIdNumber?: string
    extractedFullName?: string
    extractedDob?: string
    extractedGender?: string
    extractedAddress?: string
    extractedLicenseNumber?: string
    extractedLicenseClass?: string
    extractedLicenseIssueDate?: string
    extractedLicenseExpiryDate?: string
    extractedLicensePlace?: string
    extractedPlateNumber?: string
    extractedVehicleOwner?: string
    extractedVehicleType?: string
    extractedVehicleBrand?: string
    extractedVehicleChassisNumber?: string
    extractedVehicleEngineNumber?: string
    extractedVehicleRegistrationDate?: string
  }
}

type AuthContextType = {
  user?: UserType
  error: any
  isLoading: boolean
  isFetching: boolean
  isSuccess: boolean
  refetch: () => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data, error, isLoading, isFetching, refetch, isSuccess } = useAuth()
  const user = data?.data
  const logout = async () => {
    try {
      const response = await API.post(
        '/auth/logout',
      )
      if (response.data.message === 'Đăng xuất thành công') {
        localStorage.removeItem('loginSuccess')
        queryClient.removeQueries({ queryKey: ['authUser'] })
        router.push('/sign-in')
      }
    } catch (err) {
      toast.success('Thành công', {
        description: "Đăng xuất thất bại",
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        isLoading,
        isFetching,
        refetch,
        isSuccess,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext phải được sử dụng trong AuthProvider')
  }
  return context
}
