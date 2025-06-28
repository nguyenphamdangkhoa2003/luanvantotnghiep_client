'use client'

import { ArrowLeft, Home, Star } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getReviewsReceivedByUserQueryFn } from '@/api/reviews/review'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Review {
  _id: string
  reviewer: { name: string } | string // Handle both populated object and ObjectId
  reviewee: { name: string }
  tripRequest: { _id: string; startLocation?: string; endLocation?: string } // Optional fields
  rating: number
  comment?: string
  reviewType: 'customer' | 'driver'
  createdAt: string // Add createdAt for timestamp
}

export default function DriverReviewsPage() {
  const params = useParams()
  const userId = params?.id as string | undefined
  const router = useRouter()
  const [filterRating, setFilterRating] = useState<string>('all')

  const {
    data: reviews = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['driverReviews', userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('Missing userId')
      }
      return getReviewsReceivedByUserQueryFn(userId)
    },
    enabled: !!userId, 
    select: (data) => (Array.isArray(data) ? data : data.data || []),
  })

  const filteredReviews =
    filterRating === 'all'
      ? reviews
      : reviews.filter(
          (review: Review) => review.rating === Number(filterRating)
        )

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(date)
  }

  return (
    <div className="mx-auto p-4 md:p-6 bg-[var(--background)] min-h-screen">
      {/* Back Button */}
      <div className="flex items-center text-sm text-[var(--muted-foreground)] mb-2 mt-8 max-w-[90%] mx-auto">
        <button
          onClick={() => router.back()}
          className="flex text-[var(--primary)] items-center hover:underline"
          aria-label="Quay lại trang trước"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại
        </button>
        <span className="mx-2 text-[var(--muted-foreground)]">|</span>
        <Link
          href="/"
          className="flex text-[var(--primary)] items-center hover:underline"
          aria-label="Trang chủ"
        >
          <Home className="w-4 h-4 mr-1" />
          Trang chủ
        </Link>
      </div>

      {/* Reviews Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--primary)] mb-6 text-center">
          Nhận xét về tài xế
        </h1>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            <span className="text-[var(--primary)]">Tất cả nhận xét</span>
            <span className="text-[var(--muted-foreground)] text-base ml-2">
              ({filteredReviews.length} nhận xét)
            </span>
          </h2>
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo sao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="1">1 sao</SelectItem>
              <SelectItem value="2">2 sao</SelectItem>
              <SelectItem value="3">3 sao</SelectItem>
              <SelectItem value="4">4 sao</SelectItem>
              <SelectItem value="5">5 sao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-[var(--foreground)] p-4 rounded bg-[var(--background)]/10">
            <p>Đang tải nhận xét...</p>
          </div>
        ) : error ? (
          <div
            className="text-[var(--destructive)] p-4 rounded bg-[var(--destructive)/10]"
            role="alert"
          >
            <p>
              Không thể tải nhận xét: {error.message || 'Vui lòng thử lại.'}
            </p>
          </div>
        ) : !userId ? (
          <div
            className="text-[var(--destructive)] p-4 rounded bg-[var(--destructive)/10]"
            role="alert"
          >
            <p>
              Không tìm thấy ID tài xế. Vui lòng kiểm tra URL hoặc cấu hình
              tuyến đường.
            </p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div
            className="text-[var(--destructive)] p-4 rounded bg-[var(--destructive)/10]"
            role="alert"
          >
            <p>Không có nhận xét nào với số sao đã chọn.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReviews.map((review: Review) => (
              <div
                key={review._id}
                className="p-4 border rounded-lg bg-[var(--card)] shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">
                      {typeof review.reviewer === 'string'
                        ? 'Không xác định'
                        : review.reviewer?.name || 'Không xác định'}{' '}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Thời gian:{' '}
                      {review.createdAt ? formatDate(review.createdAt) : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className="w-5 h-5 text-yellow-400"
                          fill={
                            index < (review.rating || 0)
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-[var(--muted-foreground)] ml-1">
                      ({review.rating || 0}/5)
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p className="mt-2 text-[var(--foreground)]">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
