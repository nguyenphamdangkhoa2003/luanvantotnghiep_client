'use client'
import { useEffect, useState } from 'react'
import { createColumns } from './columns'
import { DataTable } from './data-table'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { getUsersQueryFn } from '@/api/users/user'

function UsersPage() {
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



  const users = apiResponse?.data.data || []
  
  if (isPending) {
    return (
      <div className="p-3">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
          Users
        </h2>
        <div className="container mx-auto py-10">
          <div className="flex items-center mb-4">
            <Skeleton className="h-10 w-full max-w-sm" />
          </div>

          {/* Table Skeleton */}
          <div className="space-y-4">
            {/* Header row */}
            <div className="flex gap-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={`header-${i}`} className="h-10 flex-1" />
                ))}
            </div>

            {/* Data rows */}
            {Array(5)
              .fill(0)
              .map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-4">
                  {Array(5)
                    .fill(0)
                    .map((_, cellIndex) => (
                      <Skeleton
                        key={`cell-${rowIndex}-${cellIndex}`}
                        className="h-12 flex-1"
                      />
                    ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-3">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
          Users
        </h2>
        <div className="container mx-auto py-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error?.message || 'Failed to fetch users'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
        Users
      </h2>
      <div className="container mx-auto py-5">
        <DataTable columns={createColumns(refetch)} data={users} />
      </div>
    </div>
  )
}

export default UsersPage
