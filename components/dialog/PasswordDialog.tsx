'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader, Lock } from 'lucide-react'
import { IoMdSend } from 'react-icons/io'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { changePasswordMutationFn } from '@/api/auths/auth'

// Schema cho form đổi mật khẩu
export const setPasswordFormSchema = z
  .object({
    password: z.string().min(1, { message: 'Mật khẩu cũ là bắt buộc' }),
    password1: z
      .string()
      .min(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
      .regex(/[A-Z]/, { message: 'Cần ít nhất 1 chữ hoa' })
      .regex(/[0-9]/, { message: 'Cần ít nhất 1 số' })
      .regex(/[^A-Za-z0-9]/, { message: 'Cần ít nhất 1 ký tự đặc biệt' }),
    password2: z.string(),
  })
  .refine((data) => data.password1 === data.password2, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['password2'],
  })

export interface PasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PasswordDialog({ open, onOpenChange }: PasswordDialogProps) {
  const setPasswordForm = useForm<z.infer<typeof setPasswordFormSchema>>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: {
      password: '',
      password1: '',
      password2: '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof setPasswordFormSchema>) =>
      changePasswordMutationFn(data),
    onSuccess: (response) => {
        setPasswordForm.reset()
        onOpenChange(false)
        toast.success('Thành công', {
          description: response.data.message,
          position: 'top-center',
        })
    },
    onError: (error: any) => {
      let errorMessage =
        error.response?.data?.message || 'Đổi mật khẩu thất bại'
      if (error.response?.status === 401) {
        errorMessage = 'Mật khẩu cũ không đúng'
      }
      toast.error('Lỗi', {
        description: errorMessage,
        position: 'top-center',
      })
    },
  })

  const handleSetPassword = (data: z.infer<typeof setPasswordFormSchema>) => {
    mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Đổi Mật Khẩu
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Vui lòng nhập mật khẩu cũ và mật khẩu mới của bạn
          </DialogDescription>
        </DialogHeader>

        <Form {...setPasswordForm}>
          <form
            onSubmit={setPasswordForm.handleSubmit(handleSetPassword)}
            className="space-y-4"
          >
            <FormField
              control={setPasswordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mật Khẩu Hiện Tại
                  </FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={setPasswordForm.control}
              name="password1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mật Khẩu Mới
                  </FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, số và
                    ký tự đặc biệt
                  </div>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={setPasswordForm.control}
              name="password2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nhập Lại Mật Khẩu Mới
                  </FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="px-6 h-10 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="px-6 h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <IoMdSend className="h-4 w-4 mr-2" />
                    Đổi mật khẩu
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default PasswordDialog
