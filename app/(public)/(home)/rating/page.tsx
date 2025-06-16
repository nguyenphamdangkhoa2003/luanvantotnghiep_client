'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Star, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query' // Thêm useQueryClient
import { useAuthContext } from '@/context/auth-provider'
import { createReviewMutationFn } from '@/api/reviews/review'

// Schema xác thực form
const reviewSchema = z.object({
  rating: z.number().min(1, 'Vui lòng chọn số sao').max(5, 'Tối đa 5 sao'),
  comment: z.string().max(500, 'Nhận xét tối đa 500 ký tự').optional(),
})

const Reviews = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tripRequestId = searchParams.get('tripRequestId')
  const revieweeId = searchParams.get('revieweeId')
  const { user, isLoading: authLoading } = useAuthContext()
  const queryClient = useQueryClient() // Khởi tạo queryClient
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)

  // Xác định reviewType
  const isDriver = user?.role === 'driver'
  const reviewType = isDriver ? 'driver' : 'customer'

  // Thiết lập form
  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 1,
      comment: '',
    },
  })

  // Tạo mutation đánh giá
  const createReviewMutation = useMutation({
    mutationFn: (data: { rating: number; comment?: string }) => {
      console.log('Mutation Payload:', {
        revieweeId,
        tripRequestId,
        rating: data.rating,
        reviewType,
        comment: data.comment,
      })
      return createReviewMutationFn({
        revieweeId: revieweeId!,
        tripRequestId: tripRequestId!,
        rating: data.rating,
        reviewType,
        comment: data.comment,
      })
    },
    onSuccess: () => {
      toast.success('Đánh giá của bạn đã được gửi thành công!', {
        description: 'Cảm ơn bạn đã đóng góp ý kiến.',
      })
      // Invalidate các query liên quan để Header.tsx cập nhật ngay
      queryClient.invalidateQueries({ queryKey: ['reviewStatus'] })
      queryClient.invalidateQueries({ queryKey: ['completedRequests'] })
      queryClient.invalidateQueries({ queryKey: ['routes'] })
      router.push('/')
    },
    onError: (error: any) => {
      toast.error('Gửi đánh giá thất bại', {
        description: error.message || 'Đã xảy ra lỗi khi gửi đánh giá.',
      })
    },
  })

  const onSubmit = (values: z.infer<typeof reviewSchema>) => {
    if (!tripRequestId || !revieweeId) {
      toast.error('Thiếu thông tin chuyến đi hoặc người được đánh giá.')
      return
    }
    createReviewMutation.mutate(values)
  }

  if (authLoading) {
    return (
      <div className="container mx-auto py-8 max-w-md flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Lỗi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Vui lòng đăng nhập để đánh giá.
            </p>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => router.push('/sign-in')}
            >
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tripRequestId || !revieweeId) {
    return (
      <div className="container mx-auto py-8 max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Lỗi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Thiếu thông tin chuyến đi hoặc người được đánh giá.
            </p>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => router.back()}
            >
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold text-center">
            Đánh giá {isDriver ? 'hành khách' : 'tài xế'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                      Đánh giá của bạn
                    </FormLabel>
                    <FormControl>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Button
                            key={star}
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => field.onChange(star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(null)}
                            aria-label={`Chọn ${star} sao`}
                            disabled={createReviewMutation.isPending}
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                hoveredStar !== null && star <= hoveredStar
                                  ? 'text-yellow-300 fill-yellow-300'
                                  : star <= field.value
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </Button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                      Nhận xét (tùy chọn)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Hãy chia sẻ trải nghiệm của bạn..."
                        className="min-h-[100px]"
                        disabled={createReviewMutation.isPending}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center mt-1">
                      <FormMessage className="text-xs" />
                      <span className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/500
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={createReviewMutation.isPending}
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createReviewMutation.isPending}
                >
                  {createReviewMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Gửi đánh giá'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Reviews
