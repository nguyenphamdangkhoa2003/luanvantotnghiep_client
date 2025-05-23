'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Star,
  Clock,
  Phone,
  Info,
  Car,
  Hash,
  MapPin,
  Shield,
  CarFront,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getRouteByIdQueryFn } from '@/api/routes/route'
import { addSeconds, format, isValid } from 'date-fns'
import Image from 'next/image'

const TripDetails = () => {
  const params = useParams()
  const tripId = params?.id as string

  // Utility functions from TripCard
  const formatTime = (isoString?: string): string => {
    if (!isoString) return 'N/A'
    try {
      const date = new Date(isoString)
      if (!isValid(date)) return 'N/A'
      return format(date, 'HH:mm')
    } catch (error) {
      console.error(
        'formatTime: Error parsing date:',
        error,
        'isoString:',
        isoString
      )
      return 'N/A'
    }
  }

  const calculateArrivalTime = (
    startTime?: string,
    duration?: number
  ): string => {
    if (!startTime || !duration) return 'N/A'
    try {
      const startDate = new Date(startTime)
      if (!isValid(startDate)) return 'N/A'
      const arrivalDate = addSeconds(startDate, duration)
      return format(arrivalDate, 'HH:mm')
    } catch (error) {
      console.error(
        'calculateArrivalTime: Error calculating arrival time:',
        error,
        {
          startTime,
          duration,
        }
      )
      return 'N/A'
    }
  }

  const formatAddress = (address: string): string => {
    const parts = address.split(',').map((part) => part.trim())
    return parts.slice(0, -1).join(', ').trim() || address
  }

  const getInitials = (name: string): string => {
    const names = name.split(' ')
    return names
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Fetch route data using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['route', tripId],
    queryFn: () => getRouteByIdQueryFn(tripId), // Use getRouteByIdQueryFn
    enabled: !!tripId,
  })
  const trip = data?.data
  console.log(trip)
  // Loading state
  if (!tripId || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 mb-20 bg-[var(--background)]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2
            border-[var(--primary)] mb-4"
        ></div>
        <p className="text-[var(--muted-foreground)] text-lg">
          Đang tải thông tin chuyến đi...
        </p>
      </div>
    )
  }

  // Error or no trip found
  if (error || !trip) {
    return (
      <div
        className="flex flex-col items-center justify-center pt-24 px-4 pb-20
          bg-[var(--background)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-[var(--muted-foreground)] mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-medium text-[var(--foreground)] mb-2">
          Không tìm thấy chuyến đi
        </h3>
        <p className="text-[var(--muted-foreground)] text-center max-w-md">
          Chuyến đi bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          href="/booking"
          className="mt-6 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)]
            rounded-[var(--radius-md)] hover:bg-[var(--ring)] transition"
        >
          Quay lại danh sách chuyến đi
        </Link>
      </div>
    )
  }

  // Data mappings based on Route schema
  const pickupAddress = formatAddress(
    trip.waypoints?.[0]?.name || 'Không xác định'
  )
  const dropoffAddress = formatAddress(
    trip.waypoints?.[1]?.name || 'Không xác định'
  )
  const departureTime = formatTime(trip.startTime)
  const arrivalTime = calculateArrivalTime(trip.startTime, trip.duration)
  const driverName = trip.userId?.name || 'Không xác định'
  const driverAvatar = trip.userId?.avatar || '/images/default-avatar.jpg'
  const driverInitials = getInitials(driverName)
  const driverRating = trip.userId?.rating || 4.5
  const driverPhone = trip.userId?.phoneNumber || 'Chưa cung cấp'
  const joinYear = trip.userId?.createdAt
    ? new Date(trip.userId.createdAt).getFullYear()
    : 'Chưa xác định'
  const vehicle = trip.userId?.vehicles?.[0] || {}

  return (
    <div className="mx-auto p-4 md:p-6 max-w-5xl space-y-6 bg-[var(--background)]">
      {/* Card Thông tin chuyến đi */}
      <Card className="border border-[var(--border)] rounded-[var(--radius-lg)] shadow-md mt-10">
        <CardContent className="py-6 px-10">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
            Thông tin chuyến đi
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Điểm đón - bên trái */}
            <div className="flex-1">
              <div className="flex items-start gap-3 p-4 bg-[var(--accent)] rounded-[var(--radius-md)]">
                <div
                  className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center
                    shrink-0"
                >
                  <MapPin className="w-5 h-5 text-[var(--primary-foreground)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--muted-foreground)] text-sm">
                    ĐIỂM ĐÓN
                  </p>
                  <p className="font-semibold text-[var(--foreground)]">
                    {pickupAddress}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-[var(--primary)]">
                    <Clock className="w-4 h-4" />
                    <span>Khởi hành: {departureTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Điểm đến - bên phải */}
            <div className="flex-1">
              <div className="flex items-start gap-3 p-4 bg-[var(--accent)] rounded-[var(--radius-md)]">
                <div
                  className="w-10 h-10 rounded-full bg-[var(--destructive)] flex items-center justify-center
                    shrink-0"
                >
                  <MapPin className="w-5 h-5 text-[var(--primary-foreground)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--muted-foreground)] text-sm">
                    ĐIỂM ĐẾN
                  </p>
                  <p className="font-semibold text-[var(--foreground)]">
                    {dropoffAddress}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-[var(--destructive)]">
                    <Clock className="w-4 h-4" />
                    <span>Dự kiến: {arrivalTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin chỗ ngồi - ở giữa */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--chart-2)]/20 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-[var(--chart-2)]"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-[var(--foreground)]">
                Còn {trip.seatsAvailable} chỗ trống
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Thông tin tài xế */}
      <Card className="border border-[var(--border)] rounded-[var(--radius-lg)] shadow-md">
        <CardContent className="py-6 px-10">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">
              Tài xế
            </h3>
            <div className="flex items-center gap-1 bg-green-500/20 dark:bg-[var(--chart-1)]/20 px-3 py-1 rounded-full">
              <Shield className="w-4 h-4 text-green-500 dark:text-[var(--chart-1)]" />
              <span className="text-sm font-medium text-green-500 dark:text-[var(--chart-1)]">
                Đã xác minh
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {driverAvatar && (
                  <AvatarImage
                    src={driverAvatar}
                    alt={`Avatar của ${driverName}`}
                    className="rounded-full object-cover"
                  />
                )}
                <AvatarFallback className="bg-[var(--accent)] text-[var(--accent-foreground)] text-lg font-medium flex items-center justify-center">
                  {driverInitials}
                </AvatarFallback>

                
              </Avatar>
              <div>
                <p className="font-semibold text-lg text-[var(--foreground)]">
                  {driverName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(driverRating)
                          ? 'fill-[var(--chart-1)] text-[var(--chart-1)]'
                          : 'text-[var(--muted-foreground)]'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {driverRating}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Tham gia
                  </p>
                  <p className="font-medium text-[var(--foreground)]">
                    {joinYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2 md:col-auto">
                <Phone className="w-5 h-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Điện thoại
                  </p>
                  <p className="font-medium text-[var(--foreground)]">
                    {driverPhone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes (if available) */}
          {trip.notes && (
            <div className="mt-4 p-3 bg-[var(--muted)] rounded-[var(--radius-md)]">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[var(--foreground)]">{trip.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Thông tin xe */}
      <Card className="border border-[var(--border)] rounded-[var(--radius-lg)] shadow-md">
        <CardContent className="py-6 px-10">
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Thông tin xe
          </h3>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 bg-[var(--muted)] rounded-[var(--radius-md)] flex items-center
                  justify-center"
              >
                <CarFront className="w-8 h-8 text-[var(--muted-foreground)]" />
              </div>
              <div>
                <p className="font-semibold text-lg text-[var(--foreground)]">
                  {vehicle.type || 'Chưa cung cấp'}
                </p>
                <p className="text-[var(--muted-foreground)]">
                  Năm sản xuất: {vehicle.year || 'Chưa cung cấp'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Biển số
                  </p>
                  <p className="font-medium text-[var(--foreground)]">
                    {vehicle.plate || 'Chưa cung cấp'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--muted-foreground)]"
                >
                  <circle cx="9" cy="12" r="1" />
                  <circle cx="9" cy="5" r="1" />
                  <circle cx="9" cy="19" r="1" />
                  <circle cx="15" cy="12" r="1" />
                  <circle cx="15" cy="5" r="1" />
                  <circle cx="15" cy="19" r="1" />
                </svg>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Màu sắc
                  </p>
                  <p className="font-medium text-[var(--foreground)]">
                    {vehicle.color || 'Chưa cung cấp'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {vehicle.features?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-[var(--foreground)] mb-2">
                Tiện ích trên xe
              </h4>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((feature: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-[var(--accent)]
                      text-[var(--accent-foreground)] rounded-full text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Removed Chat button */}
        {/* Nút đặt chuyến */}
        <Link
          href="/booking"
          className="flex items-center justify-center gap-2 bg-[var(--primary)]
            hover:bg-[var(--ring)] text-[var(--primary-foreground)] font-semibold py-3 px-6
            rounded-[var(--radius-md)] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
          Đặt chuyến ngay
        </Link>
      </div>
    </div>
  )
}

export default TripDetails
