'use client'

import { getUserProfileQueryFn } from '@/api/auths/auth'
import { useQuery } from '@tanstack/react-query'

const useAuth = () => {
  const query = useQuery({
    queryKey: ['authUser'],
    queryFn: getUserProfileQueryFn,
    staleTime: Infinity,
  })

  return query
}

export default useAuth
