'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/context/auth-provider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2, Route } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import RouteForm from './RouteForm'
import RouteTable from './RouteTable'
import PaginationControls from './PaginationControls'
import EmptyState from './EmptyState'
import { getRoutesByDriverQueryFn } from '@/api/routes/route'

interface Route {
  id: string
  routeName: string
  startPoint: string
  endPoint: string
  status: 'active' | 'pending' | 'cancelled'
  waypoints?: { name: string; _id: string }[]
}

const formatAddress = (name: string): string => {
  const parts = name.split(',').map((part) => part.trim())
  if (parts.length < 4) {
    return name.trim()
  }
  const cityOrProvince = parts.find(
    (part) => part.includes('Thành phố') || part.includes('Tỉnh')
  )
  return cityOrProvince ? `${parts[0]}, ${cityOrProvince}`.trim() : name.trim()
}

const TripManage: React.FC = () => {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const { user, isLoading: isAuthLoading } = useAuthContext()

  const {
    data: routes = [],
    isLoading,
    error,
    isRefetching,
  } = useQuery({
    queryKey: ['routes', user?._id],
    queryFn: () => getRoutesByDriverQueryFn(user!._id),
    enabled: !!user?._id,
    select: (response) => {
      if (!response?.data) return []
      return response.data
        .map((route: any) => ({
          id: route._id,
          routeName: route.name || '',
          startPoint:
            route.waypoints &&
            Array.isArray(route.waypoints) &&
            route.waypoints[0]?.name
              ? formatAddress(route.waypoints[0].name)
              : 'Unknown',
          endPoint:
            route.waypoints &&
            Array.isArray(route.waypoints) &&
            route.waypoints.length > 1
              ? formatAddress(route.waypoints[route.waypoints.length - 1].name)
              : 'Unknown',
          status: route.status,
          waypoints: route.waypoints,
        }))
        .filter((route: Route) => route.status !== 'cancelled')
    },
  })

  const totalItems = routes.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRoutes = routes.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const openDialog = () => {
    setIsDialogOpen(true)
  }

  const handleViewPassengers = (routeId: string) => {
    router.push(`/tripmanage/passengers/${routeId}`)
  }

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Vui lòng <span className="font-medium">đăng nhập</span> để xem
                tuyến đường
              </p>
            </div>
         mock
        </div>
      </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <span className="font-medium">Lỗi!</span> Không thể tải dữ liệu
              tuyến đường
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Route className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-semibold text-gray-800">
                Quản lý tuyến đường
              </CardTitle>
            </div>
            <RouteForm
              isOpen={isDialogOpen}
              setIsOpen={setIsDialogOpen}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading || isRefetching ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : routes.length === 0 ? (
            <EmptyState onOpenDialog={openDialog} />
          ) : (
            <>
              <RouteTable
                routes={paginatedRoutes}
                onEdit={openDialog}
                onViewPassengers={handleViewPassengers}
              />
              {totalPages > 1 && (
                <PaginationControls
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TripManage