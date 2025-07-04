'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

interface TripConfirmationData {
  _id: string
  tripRequestId: string
  confirmedByDriver?: boolean
  confirmedByPassenger?: boolean
  notes?: string
}

interface TripConfirmation {
  data: TripConfirmationData
}

interface ConfirmBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: UseFormReturn<{
    confirmedByDriver?: boolean
    confirmedByPassenger?: boolean
    notes?: string
  }>
  isConfirmationLoading: boolean
  isConfirmationError: boolean
  tripConfirmation: TripConfirmation | null
  user: { _id?: string; name?: string; avatar?: string; role?: string } | null
  canConfirm: boolean
  confirmBookingMutation: {
    isPending: boolean
  }
  handleConfirmBooking: () => void
}

export default function ConfirmBookingDialog({
  open,
  onOpenChange,
  form,
  isConfirmationLoading,
  isConfirmationError,
  tripConfirmation,
  user,
  canConfirm,
  confirmBookingMutation,
  handleConfirmBooking,
}: ConfirmBookingDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          form.reset({
            confirmedByDriver:
              tripConfirmation?.data?.confirmedByDriver || false,
            confirmedByPassenger:
              tripConfirmation?.data?.confirmedByPassenger || false,
            notes: tripConfirmation?.data?.notes || '',
          })
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận đặt xe</AlertDialogTitle>
          <AlertDialogDescription>
            Vui lòng xem lại thông tin chuyến đi dưới đây và xác nhận đặt xe.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isConfirmationLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isConfirmationError || !tripConfirmation?.data?._id ? (
          <p className="text-red-500">Lỗi tải thông tin chuyến đi</p>
        ) : (
          <Form {...form}>
            <form className="space-y-4">
              <div>
                <Label>Mã yêu cầu chuyến đi</Label>
                <Input
                  value={tripConfirmation?.data?.tripRequestId || 'N/A'}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <FormField
                control={form.control}
                name="confirmedByDriver"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="confirmedByDriver"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={user?.role !== 'driver'}
                      />
                    </FormControl>
                    <FormLabel htmlFor="confirmedByDriver">
                      Xác nhận tài xế
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmedByPassenger"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="confirmedByPassenger"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={user?.role !== 'customer'}
                      />
                    </FormControl>
                    <FormLabel htmlFor="confirmedByPassenger">
                      Xác nhận hành khách
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Nhập ghi chú..."
                        className="bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmBooking}
            disabled={
              confirmBookingMutation.isPending ||
              
              !tripConfirmation?.data?._id
            }
          >
            {confirmBookingMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Xác nhận'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
