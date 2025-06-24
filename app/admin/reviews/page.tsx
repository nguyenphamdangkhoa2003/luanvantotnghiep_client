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

// Component quản lý đánh giá
function QuanLyDanhGia() {
  const [danhGiaKhachHang, setDanhGiaKhachHang] = useState<ReviewType[]>([])
  const [danhGiaTaiXe, setDanhGiaTaiXe] = useState<ReviewType[]>([])
  const [khoiDongLai, setKhoiDongLai] = useState(0)

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: getAllReviewsQueryFn,
    onSuccess: (response) => {
      const duLieuDanhGia = response.data ?? []
      console.log('Phản hồi API:', duLieuDanhGia)

      // Lọc và ánh xạ dữ liệu đánh giá của khách hàng
      const duLieuDanhGiaKhachHang: ReviewType[] = duLieuDanhGia
        .filter((danhGia: any) => danhGia?.reviewType === 'customer')
        .map((danhGia: any) => ({
          _id: danhGia._id ?? '',
          reviewer: {
            _id: danhGia.reviewer?._id ?? '',
            name: danhGia.reviewer?.name ?? 'Không xác định',
            email: danhGia.reviewer?.email ?? 'N/A',
          },
          reviewee: {
            _id: danhGia.reviewee?._id ?? '',
            name: danhGia.reviewee?.name ?? 'Không xác định',
            email: danhGia.reviewee?.email ?? 'N/A',
          },
       
          rating: danhGia.rating ?? 0,
          comment: danhGia.comment ?? '',
          reviewType: danhGia.reviewType ?? 'customer',
          createdAt: danhGia.createdAt ?? '',
          updatedAt: danhGia.updatedAt ?? '',
        }))

      // Lọc và ánh xạ dữ liệu đánh giá của tài xế
      const duLieuDanhGiaTaiXe: ReviewType[] = duLieuDanhGia
        .filter((danhGia: any) => danhGia?.reviewType === 'driver')
        .map((danhGia: any) => ({
          _id: danhGia._id ?? '',
          reviewer: {
            _id: danhGia.reviewer?._id ?? '',
            name: danhGia.reviewer?.name ?? 'Không xác định',
            email: danhGia.reviewer?.email ?? 'N/A',
          },
          reviewee: {
            _id: danhGia.reviewee?._id ?? '',
            name: danhGia.reviewee?.name ?? 'Không xác định',
            email: danhGia.reviewee?.email ?? 'N/A',
          },
         
          rating: danhGia.rating ?? 0,
          comment: danhGia.comment ?? '',
          reviewType: danhGia.reviewType ?? 'driver',
          createdAt: danhGia.createdAt ?? '',
          updatedAt: danhGia.updatedAt ?? '',
        }))

      setDanhGiaKhachHang(duLieuDanhGiaKhachHang)
      setDanhGiaTaiXe(duLieuDanhGiaTaiXe)
    },
    onError: (loi: any) => {
      console.error('Không thể tải đánh giá:', loi.message, loi.stack)
    },
  })

  // Gọi API khi component mount hoặc khi refetchTrigger thay đổi
  useEffect(() => {
    mutate()
  }, [khoiDongLai, mutate])

  // Hàm để làm mới dữ liệu
  const taiLai = () => {
    setKhoiDongLai((truoc) => truoc + 1)
  }

  // Hiển thị skeleton khi đang tải
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
                  <Skeleton key={`tieu-de-${i}`} className="h-10 flex-1" />
                ))}
            </div>
            {Array(5)
              .fill(0)
              .map((_, hangIndex) => (
                <div key={`hang-${hangIndex}`} className="flex gap-4">
                  {Array(7)
                    .fill(0)
                    .map((_, oIndex) => (
                      <Skeleton
                        key={`o-${hangIndex}-${oIndex}`}
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

  // Hiển thị lỗi nếu có
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
              data={danhGiaKhachHang}
              reviewType="customer"
            />
          </TabsContent>
          <TabsContent value="driver">
            <DataTable
              columns={createColumns('driver')}
              data={danhGiaTaiXe}
              reviewType="driver"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default QuanLyDanhGia
