'use client'

import React from 'react'
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
import { Button } from '@/components/ui/button'
import { MapPin, Plus } from 'lucide-react'

interface Route {
  id: string
  routeName: string
  startPoint: string
  endPoint: string
  status: 'active' | 'pending' | 'cancelled'
  waypoints?: { name: string; _id: string }[]
}

const routeSchema = z.object({
  routeName: z.string().min(1, 'Tên tuyến đường không được để trống'),
  startPoint: z.string().min(1, 'Điểm bắt đầu không được để trống'),
  endPoint: z.string().min(1, 'Điểm kết thúc không được để trống'),
})

interface RouteFormProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  editingRoute: Route | null
  onSubmit: (values: z.infer<typeof routeSchema>) => void
  form: ReturnType<typeof useForm<z.infer<typeof routeSchema>>>
}

const RouteForm: React.FC<RouteFormProps> = ({
  isOpen,
  setIsOpen,
  editingRoute,
  onSubmit,
  form,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Đăng ký tuyến mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {editingRoute ? 'Chỉnh sửa tuyến đường' : 'Đăng ký tuyến đường mới'}
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
                  <FormLabel className="font-medium">Tên tuyến đường</FormLabel>
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
                    <FormLabel className="font-medium">Điểm bắt đầu</FormLabel>
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
                    <FormLabel className="font-medium">Điểm kết thúc</FormLabel>
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
                onClick={() => setIsOpen(false)}
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
  )
}

export default RouteForm
