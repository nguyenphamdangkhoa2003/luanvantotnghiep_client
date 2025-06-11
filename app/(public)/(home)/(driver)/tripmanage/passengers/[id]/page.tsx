'use client'

import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getPassengersQueryFn } from '@/api/routes/route'

// Interface for API response data
interface Passenger {
  userId: string
  name: string
  email: string
  requestId: string
  createdAt: string
}

interface PageProps {
  params: Promise<{ id: string }> // Update to reflect params as a Promise
}

export default function PassengerList({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = React.use(params) // Unwrap the params Promise
  const routeId = resolvedParams.id // Access id after unwrapping
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log('Resolved Params:', resolvedParams)
  console.log('RouteId:', routeId)

  // Fetch passengers when component mounts
  useEffect(() => {
    if (!routeId) {
      setError('Không tìm thấy ID tuyến đường.')
      setLoading(false)
      return
    }

    const fetchPassengers = async () => {
      try {
        setLoading(true)
        console.log('Fetching passengers for routeId:', routeId)
        const response = await getPassengersQueryFn({ routeId })
        console.log('API Response:', response)
        setPassengers(response.data || [])
        setError(null)
      } catch (err) {
        setError('Không thể tải danh sách hành khách.')
        console.error('API Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPassengers()
  }, [routeId])

  // Format createdAt date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getStatusBadge = (passenger: Passenger) => {
    return <Badge variant="success">Đã xác nhận</Badge>
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
          {loading ? (
            <div className="text-center py-12">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : passengers.length === 0 ? (
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
                  <TableHead>Thời gian đặt</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passengers.map((passenger) => (
                  <TableRow key={passenger.userId} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      HK-{passenger.userId.slice(-6)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{passenger.name}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="mr-1 h-3 w-3" />
                          {passenger.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(passenger.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(passenger)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            alert('Chức năng gọi không khả dụng.')
                          }}
                          disabled
                        >
                          Gọi
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            alert(`Xác nhận hành khách ${passenger.name}`)
                          }}
                        >
                          Xác nhận
                        </Button>
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
