'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getAllPackagesQueryFn,
  purchaseMembershipMutationFn,
} from '@/api/memberships/membership'
import { useAuthContext } from '@/context/auth-provider'

// Hàm định dạng tiền tệ
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

// Hàm tạo danh sách tính năng dựa trên dữ liệu
const generateFeatures = (pkg: {
  acceptRequests: number
  durationDays: number
}) => {
  const baseFeatures = [
    `Được nhận tối đa ${pkg.acceptRequests} chuyến xe`,
    `Thời hạn sử dụng ${pkg.durationDays} ngày`,
    'Hỗ trợ khách hàng 24/7',
  ]
  return [...baseFeatures]
}

// Child component for each package card
function PackageCard({
  pkg,
  currentMembership,
}: {
  pkg: any
  currentMembership: any
}) {
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationKey: ['purchaseMembership', pkg._id],
    mutationFn: purchaseMembershipMutationFn,
    onSuccess: (response) => {
      window.location.href = response.data.paymentUrl
    },
    onError: () => {
      setError('Lỗi khi đăng ký gói. Vui lòng thử lại.')
    },
  })

  const features = generateFeatures(pkg)
  const period =
    pkg.durationDays >= 365
      ? 'năm'
      : pkg.durationDays >= 30
      ? 'tháng'
      : pkg.durationDays >= 7
      ? 'tuần'
      : 'ngày'

  const isActivePackage = currentMembership?.packageType === pkg.name

  return (
    <div className="relative w-full sm:w-1/2 lg:w-1/3 max-w-sm">
      {pkg.popular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[hsl(221.2,83.2%,45%)] text-[var(--primaryForeground)] text-xs font-bold px-4 py-1 rounded-full shadow-md">
          PHỔ BIẾN
        </div>
      )}

      <Card
        className={`h-full flex flex-col transition-all duration-300 hover:shadow-2xl bg-[var(--card)] text-[var(--cardForeground)] border-[var(--border)] rounded-[var(--radius)] shadow-md ${
          pkg.popular
            ? 'border-2 border-[hsl(221.2,83.2%,45%)] bg-gradient-to-b from-[var(--card)] to-[hsl(221.2,83.2%,98%)]'
            : 'border'
        }`}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-extrabold text-center text-[var(--primary)]">
            {pkg.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 flex-grow">
          <div className="text-center mb-6">
            <div className="flex justify-center items-baseline">
              <span className="text-4xl font-bold text-[var(--foreground)]">
                {formatCurrency(pkg.price)}
              </span>
              <span className="ml-2 text-lg text-[var(--mutedForeground)]">
                VNĐ/{period}
              </span>
            </div>
          </div>

          <ul className="space-y-3 text-lg">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-[var(--primary)] mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-[var(--foreground)]">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="justify-center pb-6 pt-4">
          <Button
            size="lg"
            className={`w-full h-12 text-base font-semibold rounded-[var(--radius)] transition-all duration-200 hover:scale-101 hover:shadow-md ${
              pkg.popular
                ? 'text-[var(--primaryForeground)] hover:bg-primary/80'
                : 'bg-[var(--primary)] text-[var(--primaryForeground)] hover:bg-primary/80'
            } ${isActivePackage ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => mutation.mutate({ packageType: pkg.name })}
            disabled={mutation.isPending || isActivePackage}
          >
            {isActivePackage
              ? 'Đã kích hoạt'
              : mutation.isPending
              ? 'Đang xử lý...'
              : 'Đăng ký ngay'}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <p className="text-[var(--destructive)] text-center mt-2">{error}</p>
      )}
    </div>
  )
}

export default function DrivePass() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthContext() // Get user data from AuthContext

  const {
    data: packages = [],
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ['packages'],
    queryFn: getAllPackagesQueryFn,
    select: (response) => response.data,
  })

  useEffect(() => {
    if (isError) {
      setError('Không thể tải danh sách gói dịch vụ. Vui lòng thử lại sau.')
    }
  }, [isError, queryError])

  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    if (paymentStatus === 'success') {
      toast.success('Thanh toán thành công! Gói DrivePass đã được kích hoạt.')
      router.replace('/drivepass')
    } else if (paymentStatus === 'fail') {
      toast.error('Thanh toán thất bại. Vui lòng thử lại.')
      router.replace('/drivepass')
    }
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <p className="text-lg font-medium">Đang tải...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--destructive)]">
        <p className="text-lg font-medium">{error}</p>
      </div>
    )
  }

  // Sort packages by durationDays in ascending order
  const sortedPackages = [...packages].sort((a, b) => {
    const aDays = a.durationDays || 0
    const bDays = b.durationDays || 0
    return aDays - bDays
  })

  return (
    <div className="min-h-screen py-12 pt-16 px-4 sm:px-6 lg:px-8 text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--foreground)]">
            Chọn Gói Dịch Vụ{' '}
            <span className="text-[var(--primary)]">DrivePass</span>
          </h1>
          <p className="text-xl text-[var(--mutedForeground)] max-w-2xl mx-auto mt-4">
            Nâng cao trải nghiệm lái xe và tối ưu thu nhập với các gói dịch vụ
            đa dạng
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-wrap justify-center gap-10 max-w-7xl mx-auto">
          {sortedPackages.map((pkg) => (
            <PackageCard
              key={pkg._id}
              pkg={pkg}
              currentMembership={user?.currentMembership}
            />
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center text-[var(--mutedForeground)]">
          <p className="mb-4 text-lg">Không chắc chắn nên chọn gói nào?</p>
          <Button
            variant="outline"
            className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primaryForeground)] hover:scale-105 font-semibold px-6 py-2 rounded-[var(--radius)] transition-all duration-200"
          >
            Liên hệ tư vấn
          </Button>
        </div>
      </div>
    </div>
  )
}
