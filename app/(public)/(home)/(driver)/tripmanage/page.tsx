'use client'

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Pencil, Plus, Loader2, Users, MapPin, Route } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getRoutesByDriverQueryFn } from '@/api/routes/route'
import { useAuthContext } from '@/context/auth-provider'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

interface Route {
  id: string
  routeName: string
  startPoint: string
  endPoint: string
  status: 'active' | 'pending' | 'cancelled'
  waypoints?: { name: string; _id: string }[] // Optional array with name and _id
}

const routeSchema = z.object({
  routeName: z.string().min(1, 'Tên tuyến đường không được để trống'),
  startPoint: z.string().min(1, 'Điểm bắt đầu không được để trống'),
  endPoint: z.string().min(1, 'Điểm kết thúc không được để trống'),
})

const formatAddress = (name: string): string => {
  const parts = name.split(',').map((part) => part.trim())
  if (parts.length < 4) {
    return name.trim()
  }

  const cityOrProvince = parts.find(
    (part) => part.includes('Thành phố') || part.includes('Tỉnh')
  )

  if (!cityOrProvince) {
    return name.trim()
  }

  return `${parts[0]}, ${cityOrProvince}`.trim()
}

const TripManage: React.FC = () => {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const { user, isLoading: isAuthLoading } = useAuthContext()

  const form = useForm<z.infer<typeof routeSchema>>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      routeName: '',
      startPoint: '',
      endPoint: '',
    },
  })

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

  const openDialog = (route?: Route) => {
    if (route) {
      setEditingRoute(route)
      form.reset({
        routeName: route.routeName,
        startPoint: route.startPoint,
        endPoint: route.endPoint,
      })
    } else {
      setEditingRoute(null)
      form.reset()
    }
    setIsDialogOpen(true)
  }

  const onSubmit = (values: z.infer<typeof routeSchema>) => {
    toast.info('Chức năng này chưa được triển khai')
    setIsDialogOpen(false)
    form.reset()
  }

  const handleViewPassengers = (routeId: string) => {
    router.push(`/tripmanage/passengers/${routeId}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
        )
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      default:
        return <Badge>{status}</Badge>
    }
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
          <div className="flex">
            <div className="flex-shrink-0">
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
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <span className="font-medium">Lỗi!</span> Không thể tải dữ liệu
                tuyến đường
              </p>
            </div>
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => openDialog()}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Đăng ký tuyến mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {editingRoute
                      ? 'Chỉnh sửa tuyến đường'
                      : 'Đăng ký tuyến đường mới'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 mt-4"
                  >
                    <FormField
                      control={form.control}
                      name="routeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">
                            Tên tuyến đường
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ví dụ: Tuyến Hà Nội - Hải Phòng"
                              className="focus-visible:ring-primary"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="startPoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Điểm bắt đầu
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ví dụ: Số 1 Đại Cồ Việt, Hà Nội"
                                className="focus-visible:ring-primary"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endPoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Điểm kết thúc
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ví dụ: 12 Lê Thánh Tông, Hải Phòng"
                                className="focus-visible:ring-primary"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsDialogOpen(false)}
                        className="min-w-[100px]"
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        className="min-w-[100px] bg-primary hover:bg-primary/90"
                      >
                        {editingRoute ? 'Cập nhật' : 'Đăng ký'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
            <div className="text-center py-12 px-4">
              <div className="mx-auto flex flex-col items-center justify-center max-w-md">
                <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Bạn chưa có tuyến đường nào
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Bắt đầu bằng cách đăng ký tuyến đường đầu tiên của bạn
                </p>
                <Button
                  onClick={() => openDialog()}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Đăng ký tuyến đường
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700 py-3 pl-6">
                      Tên tuyến đường
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Điểm bắt đầu
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Điểm kết thúc
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Trạng thái
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right pr-6">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route: Route) => (
                    <TableRow
                      key={route.id}
                      className="hover:bg-gray-50/50 border-b"
                    >
                      <TableCell className="font-medium py-4 pl-6">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="flex items-center gap-2 cursor-pointer">
                              <Route className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="truncate max-w-[200px]">
                                {route.startPoint} - {route.endPoint}
                              </span>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">
                                Thông tin tuyến đường
                              </h4>
                              <p className="text-sm">
                                <span className="font-semibold">Từ:</span>{' '}
                                {route.startPoint}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Đến:</span>{' '}
                                {route.endPoint}
                              </p>
                              {route.waypoints &&
                              Array.isArray(route.waypoints) &&
                              route.waypoints.length > 2 ? (
                                <div className="text-sm">
                                  <span className="font-semibold">
                                    Điểm dừng:
                                  </span>
                                  <ul className="list-disc pl-4">
                                    {route.waypoints
                                      .slice(1, -1)
                                      .map((waypoint, index) => (
                                        <li key={waypoint._id || index}>
                                          {waypoint.name}
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              ) : null}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell className="py-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate max-w-[180px]">
                                {route.startPoint}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{route.startPoint}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="py-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate max-w-[180px]">
                                {route.endPoint}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{route.endPoint}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(route.status)}
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleViewPassengers(route.id)
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    <Users className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Xem hành khách</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          {route.status !== 'cancelled' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDialog(route)}
                                    disabled={route.status === 'pending'}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Chỉnh sửa tuyến đường</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TripManage
