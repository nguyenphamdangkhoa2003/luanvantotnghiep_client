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
import { Loader2 } from 'lucide-react'

interface CancelBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cancelBookingMutation: {
    isPending: boolean
  }
  handleCancelBooking: () => void
}

export default function CancelBookingDialog({
  open,
  onOpenChange,
  cancelBookingMutation,
  handleCancelBooking,
}: CancelBookingDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hủy đặt xe</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn hủy đặt xe này không? Hành động này không thể
            hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Quay lại</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancelBooking}
            className="bg-red-600 hover:bg-red-700"
          >
            {cancelBookingMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Hủy đặt xe'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
