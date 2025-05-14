'use client'

import { getUserProfileQueryFn } from '@/api/auths/auth'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const useAuth = () => {
  const searchParams = useSearchParams()
  const [isLoginSuccess, setIsLoginSuccess] = useState(false)

  useEffect(() => {
    // Đảm bảo code chỉ chạy ở client
    const loginSuccess = searchParams.get('login') === 'success'

    if (loginSuccess) {
      localStorage.setItem('loginSuccess', 'true')
      setIsLoginSuccess(true)
    } else {
      const stored = localStorage.getItem('loginSuccess') === 'true'
      setIsLoginSuccess(stored)
    }
  }, [searchParams])

  const query = useQuery({
    queryKey: ['authUser'],
    queryFn: getUserProfileQueryFn,
    staleTime: Infinity,
    enabled: isLoginSuccess, // chỉ gọi API nếu login thành công
  })

  return query
}

export default useAuth
