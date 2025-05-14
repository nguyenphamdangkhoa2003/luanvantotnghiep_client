'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { updateUserProfileMutationFn } from '@/api/users/user'
import { useAuthContext } from '@/context/auth-provider'
import { AxiosResponse } from 'axios'

const normalizePhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (!digits || digits.length < 9) {
    return value
  }
  if (digits.startsWith('0')) {
    if (digits.length === 10) {
      return `+84${digits.slice(1)}`
    }
  } else if (digits.startsWith('+84')) {
    if (digits.length === 11) {
      return digits
    }
  } else if (digits.startsWith('84') && digits.length === 11) {
    return `+${digits}`
  } else if (digits.length === 9) {
    return `+84${digits}`
  }
  return value
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Tên phải có ít nhất 2 ký tự.',
  }),
  phoneNumber: z
    .string()
    .min(10, { message: 'Số điện thoại phải có ít nhất 10 chữ số.' })
    .transform(normalizePhoneNumber)
    .refine((val) => /^\+84\d{9}$/.test(val), {
      message: 'Số điện thoại phải bắt đầu bằng +84 và có 9 chữ số sau đó.',
    }),
  dateOfBirth: z.string().min(1, {
    message: 'Ngày sinh không được để trống.',
  }),
  bio: z.string().optional(),
})

interface User {
  _id: string
  name: string
  phoneNumber?: string
  dateOfBirth?: string
  bio?: string
}
interface ApiResponse {
  data: User
}
type UserProfileFormProps = {
  initialValues?: {
    name?: string
    phoneNumber?: string
    dateOfBirth?: string
    bio?: string
  }
}

export function UserProfileForm({
  initialValues,
}: UserProfileFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || '',
      phoneNumber: initialValues?.phoneNumber || '',
      dateOfBirth: initialValues?.dateOfBirth || '',
      bio: initialValues?.bio || '',
    },
  })

  const { mutate, isPending } = useMutation<
    AxiosResponse<ApiResponse>,
    any,
    z.infer<typeof formSchema>
  >({
    mutationFn: updateUserProfileMutationFn,
    onSuccess: async (response) => {
      const data = response.data.data
      toast.success('Cập nhật hồ sơ thành công')
      form.reset({
        name: data.name || '',
        phoneNumber: data.phoneNumber || '',
        dateOfBirth: data.dateOfBirth || '',
        bio: data.bio || '',
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật hồ sơ thất bại')
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 md:space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên</FormLabel>
              <FormControl>
                <Input placeholder="Nhập họ và tên của bạn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập số điện thoại (VD: 0981191651)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Ngày sinh</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giới thiệu</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Giới thiệu về bản thân"
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}