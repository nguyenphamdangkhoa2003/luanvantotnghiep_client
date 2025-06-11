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
import { Pencil, Plus, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getRoutesByDriverQueryFn } from '@/api/routes/route'
import { useAuthContext } from '@/context/auth-provider'

interface Route {
  id: string
  routeName: string
  startPoint: string
  endPoint: string
  status: 'active' | 'pending' | 'cancelled'
  waypoints?: { name: string }[]
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

const TipManage: React.FC = () => {
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

  // Fetch routes using useQuery
  const {
    data: routes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['routes', user?._id],
    queryFn: () => getRoutesByDriverQueryFn(user?._id),
    enabled: !!user?._id,
    select: (response) => {
      console.log('API Response:', response) // Debug the API response
      if (!response?.data) return []
      return response.data
        .map((route: any) => ({
          id: route._id,
          routeName: route.name || '',
          startPoint: route.waypoints?.[0]?.name
            ? formatAddress(route.waypoints[0].name)
            : 'Unknown',
          endPoint:
            route.waypoints?.length > 1
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

  // Placeholder onSubmit (since no API is available)
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
        return <Badge variant="success">Đang hoạt động</Badge>
      case 'pending':
        return <Badge variant="warning">Chờ duyệt</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>
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
        <p className="text-muted-foreground">
          Vui lòng đăng nhập để xem tuyến đường
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-destructive">Lỗi khi tải dữ liệu tuyến đường</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-semibold">
              Quản lý tuyến đường
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Đăng ký tuyến mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="text-xl">
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
                              placeholder="Nhập tên tuyến đường"
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
                                placeholder="Nhập điểm bắt đầu"
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
                                placeholder="Nhập điểm kết thúc"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button type="submit">
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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : routes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Bạn chưa có tuyến đường nào
              </p>
              <Button className="mt-4" onClick={() => openDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Đăng ký tuyến đầu tiên
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">
                    Tên tuyến đường
                  </TableHead>
                  <TableHead className="font-semibold">Điểm bắt đầu</TableHead>
                  <TableHead className="font-semibold">Điểm kết thúc</TableHead>
                  <TableHead className="font-semibold">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-right">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route: Route) => (
                  <TableRow key={route.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {route.startPoint} - {route.endPoint}
                    </TableCell>
                    <TableCell>{route.startPoint}</TableCell>
                    <TableCell>{route.endPoint}</TableCell>
                    <TableCell>{getStatusBadge(route.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {route.status === 'active' && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewPassengers(route.id)}
                            className="h-8 w-8"
                            title="Xem hành khách"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        )}
                        {route.status !== 'cancelled' && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDialog(route)}
                            disabled={route.status === 'pending'}
                            className="h-8 w-8"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TipManage
