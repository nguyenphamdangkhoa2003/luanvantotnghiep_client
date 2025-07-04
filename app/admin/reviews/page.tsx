'use client'
import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createColumns } from './columns'
import { DataTable } from './data-table'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Review } from './columns'
import { getAllReviewsQueryFn } from '@/api/reviews/review'

// Component to manage reviews
function ReviewManagement() {
  const [customerReviews, setCustomerReviews] = useState<Review[]>([])
  const [driverReviews, setDriverReviews] = useState<Review[]>([])

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: getAllReviewsQueryFn,
    onSuccess: (response) => {
      const reviewData = response.data ?? []

      // Filter and map customer review data
      const customerReviewData: Review[] = reviewData
        .filter((review: any) => review?.reviewType === 'customer')
        .map((review: any) => ({
          id: review.id ?? '',
          reviewer: {
            id: review.reviewer?.id ?? '',
            name: review.reviewer?.name ?? 'Không xác định',
            email: review.reviewer?.email ?? 'N/A',
          },
          reviewee: {
            id: review.reviewee?.id ?? '',
            name: review.reviewee?.name ?? 'Không xác định',
            email: review.reviewee?.email ?? 'N/A',
          },
          rating: review.rating ?? 0,
          comment: review.comment ?? '',
          reviewType: review.reviewType ?? 'customer',
          createdAt: review.createdAt ?? '',
          updatedAt: review.updatedAt ?? '',
        }))

      // Filter and map driver review data
      const driverReviewData: Review[] = reviewData
        .filter((review: any) => review?.reviewType === 'driver')
        .map((review: any) => ({
          id: review.id ?? '',
          reviewer: {
            id: review.reviewer?.id ?? '',
            name: review.reviewer?.name ?? 'Không xác định',
            email: review.reviewer?.email ?? 'N/A',
          },
          reviewee: {
            id: review.reviewee?.id ?? '',
            name: review.reviewee?.name ?? 'Không xác định',
            email: review.reviewee?.email ?? 'N/A',
          },
          rating: review.rating ?? 0,
          comment: review.comment ?? '',
          reviewType: review.reviewType ?? 'driver',
          createdAt: review.createdAt ?? '',
          updatedAt: review.updatedAt ?? '',
        }))

      setCustomerReviews(customerReviewData)
      setDriverReviews(driverReviewData)
    },
    onError: (error: any) => {
      console.error('Failed to load reviews:', error.message, error.stack)
    },
  })

  // Fetch data when component mounts or refetchTrigger changes
  useEffect(() => {
    mutate()
  }, [ mutate])

  // Display skeleton while loading
  if (isPending) {
    return (
      <div className="p-3">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
          Quản lý đánh giá
        </h2>
        <div className="container mx-auto py-10">
          <div className="flex items-center mb-4">
            <Skeleton className="h-10 w-full max-w-sm" />
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              {Array(7)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={`header-${i}`} className="h-10 flex-1" />
                ))}
            </div>
            {Array(5)
              .fill(0)
              .map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-4">
                  {Array(7)
                    .fill(0)
                    .map((_, colIndex) => (
                      <Skeleton
                        key={`cell-${rowIndex}-${colIndex}`}
                        className="h-12 flex-1"
                      />
                    ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  // Display error if any
  if (isError) {
    return (
      <div className="p-3">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
          Quản lý đánh giá
        </h2>
        <div className="container mx-auto py-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              {error?.message || 'Không thể tải đánh giá'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
        Quản lý đánh giá
      </h2>
      <div className="container mx-auto py-5">
        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer">Đánh giá khách hàng</TabsTrigger>
            <TabsTrigger value="driver">Đánh giá tài xế</TabsTrigger>
          </TabsList>
          <TabsContent value="customer">
            <DataTable
              columns={createColumns('customer')}
              data={customerReviews}
              reviewType="customer"
            />
          </TabsContent>
          <TabsContent value="driver">
            <DataTable
              columns={createColumns('driver')}
              data={driverReviews}
              reviewType="driver"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ReviewManagement
