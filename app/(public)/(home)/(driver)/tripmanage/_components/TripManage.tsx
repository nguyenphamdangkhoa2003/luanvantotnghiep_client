'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthContext } from '@/context/auth-provider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2, Route, MapPin } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import RouteForm from './RouteForm'
import RouteTable from './RouteTable'
import PaginationControls from './PaginationControls'
import EmptyState from './EmptyState'
import UpdateRouteForm from '@/components/form/UpdateRouteForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  getRoutesByDriverQueryFn,
  deleteRouteMutationFn,
} from '@/api/routes/route'
import { format } from 'date-fns'
import CloneRouteForm from '@/components/form/CloneTripForm'

interface Route {
  id: string
  routeName: string
  startPoint: string
  endPoint: string
  status: 'active' | 'pending' | 'cancelled'
  waypoints?: {
    name: string
    _id: string
    coordinates?: [number, number]
    distance?: number
    estimatedArrivalTime: string
  }[]
  startCoords?: { lng: number; lat: number }
  endCoords?: { lng: number; lat: number }
  path?: { type: string; coordinates: [number, number][] }
  distance?: number
  duration?: number
  startTime?: string
  endTime?: string
  seatsAvailable?: number
  price?: number
  maxPickupDistance: number
  isNegotiable:boolean
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
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const { user, isLoading: isAuthLoading } = useAuthContext()
  const [isCloneDialogOpen, setIsCloneDialogOpen]=useState(false)
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
      return response.data.map((route: any) => ({
        id: route._id,
        routeName: route.name || '',
        startPoint: route.startPoint?.name
          ? formatAddress(route.startPoint.name)
          : route.waypoints &&
            Array.isArray(route.waypoints) &&
            route.waypoints[0]?.name
          ? formatAddress(route.waypoints[0].name)
          : 'Unknown',
        endPoint: route.endPoint?.name
          ? formatAddress(route.endPoint.name)
          : route.waypoints &&
            Array.isArray(route.waypoints) &&
            route.waypoints.length > 1
          ? formatAddress(route.waypoints[route.waypoints.length - 1].name)
          : 'Unknown',
        status: route.status,
        waypoints: route.waypoints,
        startCoords: route.startPoint?.coordinates
          ? {
              lng: route.startPoint.coordinates[0],
              lat: route.startPoint.coordinates[1],
            }
          : route.waypoints &&
            Array.isArray(route.waypoints) &&
            route.waypoints[0]?.coordinates
          ? {
              lng: route.waypoints[0].coordinates[0],
              lat: route.waypoints[0].coordinates[1],
            }
          : undefined,
        endCoords: route.endPoint?.coordinates
          ? {
              lng: route.endPoint.coordinates[0],
              lat: route.endPoint.coordinates[1],
            }
          : route.waypoints &&
            Array.isArray(route.waypoints) &&
            route.waypoints.length > 1
          ? {
              lng: route.waypoints[route.waypoints.length - 1].coordinates[0],
              lat: route.waypoints[route.waypoints.length - 1].coordinates[1],
            }
          : undefined,
        path: route.path,
        distance: route.distance,
        duration: route.duration,
        startTime: route.startTime,
        endTime: route.endTime,
        seatsAvailable: route.seatsAvailable,
        price: route.price,
        maxPickupDistance: route.maxPickupDistance,
        isNegotiable: route.isNegotiable,
      }))
    },
  })
console.log(routes)
  const deleteMutation = useMutation({
    mutationFn: deleteRouteMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes', user?._id] })
      toast.success('Xóa tuyến đường thành công')
      setIsDeleteDialogOpen(false)
      setRouteToDelete(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xóa tuyến đường')
    },
  })

  const handleDelete = (routeId: string) => {
    setRouteToDelete(routeId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (routeToDelete) {
      deleteMutation.mutate(routeToDelete)
    }
  }

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

  const handleEdit = (route: Route) => {
    setSelectedRoute(route)
    setIsEditDialogOpen(true)
  }

  const handleClone = (route: Route) => {
    setSelectedRoute(route)
    setIsCloneDialogOpen(true)
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
            <RouteForm isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
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
                onClone={handleClone}
                onEdit={handleEdit}
                onViewPassengers={handleViewPassengers}
                onDelete={handleDelete}
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[1200px] p-0 max-h-[95vh] overflow-y-auto">
          <DialogHeader className="px-6 pt-6 pb-4 sticky top-0 bg-[var(--popover)] z-10">
            <DialogTitle className="text-xl flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Chỉnh sửa tuyến đường
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            {selectedRoute && (
              <UpdateRouteForm
                route={{
                  id: selectedRoute.id,
                  name: selectedRoute.routeName,
                  startAddress: selectedRoute.startPoint,
                  startCoords: selectedRoute.startCoords || { lng: 0, lat: 0 },
                  endAddress: selectedRoute.endPoint,
                  endCoords: selectedRoute.endCoords || { lng: 0, lat: 0 },
                  waypoints:
                    selectedRoute.waypoints &&
                    selectedRoute.waypoints.length > 2
                      ? selectedRoute.waypoints.slice(1, -1).map((wp) => ({
                          name: wp.name,
                          coordinates: wp.coordinates
                            ? { lng: wp.coordinates[0], lat: wp.coordinates[1] }
                            : null,
                          distance: wp.distance || 0,
                          estimatedArrivalTime: wp.estimatedArrivalTime,
                        }))
                      : [],
                  path: selectedRoute.path || {
                    type: 'LineString',
                    coordinates: [],
                  },
                  distance: selectedRoute.distance || 0,
                  duration: selectedRoute.duration || 0,
                  startTime: selectedRoute.startTime,
                  endTime: selectedRoute.endTime,
                  seatsAvailable: selectedRoute.seatsAvailable || 1,
                  price: selectedRoute.price || 1000,
                  maxPickupDistance: selectedRoute.maxPickupDistance,
                  isNegotiable: selectedRoute.isNegotiable,
                }}
                setIsOpen={setIsEditDialogOpen}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isCloneDialogOpen} onOpenChange={setIsCloneDialogOpen}>
        <DialogContent className="sm:max-w-[1200px] p-0 max-h-[95vh] overflow-y-auto">
          <DialogHeader className="px-6 pt-6 pb-4 sticky top-0 bg-[var(--popover)] z-10">
            <DialogTitle className="text-xl flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Tạo tuyến cũ
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            {selectedRoute && (
              <CloneRouteForm
                route={{
                  id: selectedRoute.id,
                  name: selectedRoute.routeName,
                  startAddress: selectedRoute.startPoint,
                  startCoords: selectedRoute.startCoords || { lng: 0, lat: 0 },
                  endAddress: selectedRoute.endPoint,
                  endCoords: selectedRoute.endCoords || { lng: 0, lat: 0 },
                  waypoints:
                    selectedRoute.waypoints &&
                    selectedRoute.waypoints.length > 2
                      ? selectedRoute.waypoints.slice(1, -1).map((wp) => ({
                          name: wp.name,
                          coordinates: wp.coordinates
                            ? { lng: wp.coordinates[0], lat: wp.coordinates[1] }
                            : null,
                          distance: wp.distance || 0,
                          estimatedArrivalTime: wp.estimatedArrivalTime,
                        }))
                      : [],
                  path: selectedRoute.path || {
                    type: 'LineString',
                    coordinates: [],
                  },
                  distance: selectedRoute.distance || 0,
                  duration: selectedRoute.duration || 0,
                  startTime: selectedRoute.startTime,
                  endTime: selectedRoute.endTime,
                  seatsAvailable: selectedRoute.seatsAvailable || 1,
                  price: selectedRoute.price || 1000,
                  maxPickupDistance: selectedRoute.maxPickupDistance,
                  isNegotiable: selectedRoute.isNegotiable,
                }}
                setIsOpen={setIsCloneDialogOpen}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tuyến đường</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tuyến đường này? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TripManage
