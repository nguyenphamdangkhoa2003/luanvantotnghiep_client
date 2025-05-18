'use client'

import useAuth from '@/hooks/use-auth'
import { AvatarProviderEnum, RoleEnum } from '@/types/enum'
import React, { createContext, useContext } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import API from '@/api/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export interface UserType {
  _id: string
  username: string
  email: string
  name: string
  role: string
  isEmailVerified: boolean
  isOnline: boolean
  oauthProviders: string[]
  credentials: {
    version: number
    lastPassword: string
    passwordUpdatedAt: number
    updatedAt: number
  }
  createdAt: string
  updatedAt: string
  vehicles: any[]
  paymentMethods: {
    _id: string
    type: string
    details: {
      provider: string
      token: string
      last4: string
    }
    isVerified: boolean
  }[]
  __v?: number
  avatar?: string
  identityDocument?: {
    documentNumber: string
    frontImage: string
    backImage: string
    verificationStatus: string
    _id: string
  }
  driverLicense?: {
    licenseNumber: string
    frontImage: string
    backImage: string
    verificationStatus: string
    _id: string
  }
  dateOfBirth?: string
  phoneNumber?: string 
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
