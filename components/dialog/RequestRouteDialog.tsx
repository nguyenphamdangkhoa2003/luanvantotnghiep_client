'use client'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { requestRouteMutationFn } from '@/api/routes/route'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface RouteRequestDialogProps {
  routeId: string
  seats: number
  maxseat: number
}

export function RouteRequestDialog({
  routeId,
  seats: initialSeats,
  maxseat,
}: RouteRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [seats, setSeats] = useState(initialSeats) // Manage seats in state

  const mutation = useMutation({
    mutationFn: requestRouteMutationFn,
    onSuccess: () => {
      toast.success('Gửi yêu cầu đặt tuyến đường thành công')
      setOpen(false)
      setMessage('')
      setSeats(initialSeats) // Reset seats after success
    },
    onError: (error) => {
      toast.error(error.message || 'Gửi yêu cầu thất bại')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      routeId,
      seats,
      message: message.trim() || undefined,
    })
  }

  // Handle seats input change
  const handleSeatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numValue = parseInt(value, 10)
    // Only update if the value is a valid number and within the maxseat limit
    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxseat) {
      setSeats(numValue)
    } else if (value === '') {
      setSeats(1) // Default to 1 if input is cleared
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
          Đặt tuyến đường này
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Yêu cầu đặt tuyến đường
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Gửi yêu cầu đặt chỗ cho tuyến đường đã chọn. Bạn có thể thêm lời
            nhắn nếu cần.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
              Thông tin tuyến đường
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="routeId"
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  Mã tuyến đường
                </Label>
                <Input
                  id="routeId"
                  value={routeId}
                  disabled
                  className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="seats"
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  Số chỗ đặt
                </Label>
                <Input
                  id="seats"
                  type="number"
                  value={seats}
                  onChange={handleSeatsChange}
                  className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  min={1}
                  max={maxseat}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label
                htmlFor="message"
                className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
                Lời nhắn thêm
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Yêu cầu đặc biệt hoặc ghi chú? (không bắt buộc)"
                className="min-h-[120px] border-gray-300 dark:border-gray-600"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {message.length}/200 ký tự
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
              className="border-gray-300 hover:bg-gray-50"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi yêu cầu'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
