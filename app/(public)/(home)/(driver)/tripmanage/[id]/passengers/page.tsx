// app/driver/routes/[routeId]/passengers/page.tsx
'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Phone, Mail, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Interface cho dữ liệu hành khách
interface Passenger {
  id: string
  name: string
  phone: string
  email: string
  pickupPoint: string
  dropoffPoint: string
  status: 'confirmed' | 'pending' | 'cancelled'
  bookingTime: string
}

// Dữ liệu mẫu (thay bằng API call thực tế)
const passengersData: Record<string, Passenger[]> = {
  '1': [
    {
      id: '101',
      name: 'Nguyễn Văn A',
      phone: '0912345678',
      email: 'a.nguyen@example.com',
      pickupPoint: 'Số 1, Đường ABC, Hà Nội',
      dropoffPoint: 'Số 10, Đường XYZ, Hải Phòng',
      status: 'confirmed',
      bookingTime: '10:30 15/06/2024',
    },
    {
      id: '102',
      name: 'Trần Thị B',
      phone: '0987654321',
      email: 'b.tran@example.com',
      pickupPoint: 'Số 5, Đường DEF, Hà Nội',
      dropoffPoint: 'Số 20, Đường UVW, Hải Phòng',
      status: 'confirmed',
      bookingTime: '11:15 15/06/2024',
    },
  ],
  '2': [
    {
      id: '201',
      name: 'Lê Văn C',
      phone: '0901122334',
      email: 'c.le@example.com',
      pickupPoint: 'Số 3, Đường GHI, Hà Nội',
      dropoffPoint: 'Số 15, Đường RST, Thái Nguyên',
      status: 'pending',
      bookingTime: '08:45 16/06/2024',
    },
  ],
}

interface PageProps {
  params: { routeId: string }
}

export default function PassengerList({ params }: PageProps) {
  const router = useRouter()
  const routeId = params.routeId
  const passengers = passengersData[routeId] || []

  // Lấy thông tin tuyến đường (giả định)
  const routeInfo = {
    '1': {
      name: 'Tuyến Hà Nội - Hải Phòng',
      startPoint: 'Hà Nội',
      endPoint: 'Hải Phòng',
    },
    '2': {
      name: 'Tuyến Hà Nội - Thái Nguyên',
      startPoint: 'Hà Nội',
      endPoint: 'Thái Nguyên',
    },
  }[routeId] || { name: 'Không xác định', startPoint: '', endPoint: '' }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Đã xác nhận</Badge>
      case 'pending':
        return <Badge variant="warning">Chờ xác nhận</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl font-semibold">
                  Danh sách hành khách
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {routeInfo.name} ({routeInfo.startPoint} →{' '}
                  {routeInfo.endPoint})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Tổng số: {passengers.length} hành khách
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {passengers.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Chưa có hành khách nào
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Hiện chưa có hành khách nào đăng ký tuyến đường này.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[150px]">Mã hành khách</TableHead>
                  <TableHead>Thông tin</TableHead>
                  <TableHead>Điểm đón</TableHead>
                  <TableHead>Điểm trả</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passengers.map((passenger) => (
                  <TableRow key={passenger.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      HK-{passenger.id}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{passenger.name}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="mr-1 h-3 w-3" />
                          {passenger.phone}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="mr-1 h-3 w-3" />
                          {passenger.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {passenger.pickupPoint}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {passenger.dropoffPoint}
                    </TableCell>
                    <TableCell>{passenger.bookingTime}</TableCell>
                    <TableCell>{getStatusBadge(passenger.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Xử lý gọi điện
                            window.location.href = `tel:${passenger.phone}`
                          }}
                        >
                          <Phone className="mr-1 h-4 w-4" />
                          Gọi
                        </Button>
                        {passenger.status === 'pending' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              // Xử lý xác nhận
                              alert(`Xác nhận hành khách ${passenger.name}`)
                            }}
                          >
                            Xác nhận
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
