'use client'
import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createColumns } from './columns'
import { DataTable } from './data-table'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ReviewType } from './columns'
import { getAllReviewsQueryFn } from '@/api/reviews/review'

function ReviewsPage() {
  const [customerReviews, setCustomerReviews] = useState<ReviewType[]>([])
  const [driverReviews, setDriverReviews] = useState<ReviewType[]>([])
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: getAllReviewsQueryFn,
    onSuccess: (response) => {
      const reviewsData = response.data // Assuming API returns { data: [...] }

      const customerReviewsData: ReviewType[] = reviewsData
        .filter((review: any) => review.reviewType === 'customer')
        .map((review: any) => ({
          _id: review._id,
          reviewer: {
            _id: review.reviewer._id,
            name: review.reviewer.name,
          },
          reviewee: {
            _id: review.reviewee._id,
            name: review.reviewee.name,
          },
          tripRequest: {
            _id: review.tripRequest._id,
            startLocation: review.tripRequest.startLocation,
            endLocation: review.tripRequest.endLocation,
          },
          rating: review.rating,
          comment: review.comment,
          reviewType: review.reviewType,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        }))

      const driverReviewsData: ReviewType[] = reviewsData
        .filter((review: any) => review.reviewType === 'driver')
        .map((review: any) => ({
          _id: review._id,
          reviewer: {
            _id: review.reviewer._id,
            name: review.reviewer.name,
          },
          reviewee: {
            _id: review.reviewee._id,
            name: review.reviewee.name,
          },
          tripRequest: {
            _id: review.tripRequest._id,
            startLocation: review.tripRequest.startLocation,
            endLocation: review.tripRequest.endLocation,
          },
          rating: review.rating,
          comment: review.comment,
          reviewType: review.reviewType,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        }))

      setCustomerReviews(customerReviewsData)
      setDriverReviews(driverReviewsData)
    },
    onError: (err: any) => {
      console.error('Failed to fetch reviews:', err)
    },
  })

  useEffect(() => {
    mutate()
  }, [refetchTrigger, mutate])

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1)
  }

  if (isPending) {
    return (
      <div className="p-3">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
          Reviews Management
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
                    .map((_, cellIndex) => (
                      <Skeleton
                        key={`cell-${rowIndex}-${cellIndex}`}
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

  if (isError) {
    return (
      <div className="p-3">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
          Reviews Management
        </h2>
        <div className="container mx-auto py-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error?.message || 'Failed to fetch reviews'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
        Reviews Management
      </h2>
      <div className="container mx-auto py-5">
        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer">Customer Reviews</TabsTrigger>
            <TabsTrigger value="driver">Driver Reviews</TabsTrigger>
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

export default ReviewsPage
