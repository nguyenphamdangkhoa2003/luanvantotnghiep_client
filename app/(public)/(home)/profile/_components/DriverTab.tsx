
'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { DriverInfoForm } from '@/components/form/DriverInformationForm'
import { VehicleInfoSection } from '@/components/form/VehicleInfoSection'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface User {
  _id: { $oid: string }
  name: string
  avatar?: string
  dateOfBirth?: string
  phoneNumber?: string
  identityDocument?: {
    documentNumber: string
    frontImage: string
    backImage: string
    verificationStatus: 'approved' | 'rejected' | 'pending'
    _id: { $oid: string }
    verifiedAt?: { $date: string }
  }
  driverLicense?: {
    licenseNumber: string
    frontImage: string
    backImage: string
    verificationStatus: 'approved' | 'rejected' | 'pending'
    _id: { $oid: string }
    verifiedAt?: { $date: string }
  }
  vehicles?: Array<{
    _id: { $oid: string }
    licensePlate: string
    model: string
    seats: number
    registrationDocument: string
    insuranceDocument?: string
    verificationStatus: 'approved' | 'rejected' | 'pending'
  }>
}

interface DriverTabProps {
  user: User
  refetchData: () => Promise<void>
}

export function DriverTab({ user, refetchData }: DriverTabProps) {
  console.log('DriverTab user data:', user) // Debug log
  console.log('DriverTab vehicle data:', user.vehicles?.[0]) // Debug log

  const isDriverInfoApproved =
    user.identityDocument?.verificationStatus === 'approved' &&
    user.driverLicense?.verificationStatus === 'approved'

  const isVehicleApproved = user.vehicles?.[0]?.verificationStatus === 'approved'

  const getStatusBadge = (status?: 'approved' | 'rejected' | 'pending') => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 gap-1 transition-colors">
            <CheckCircle2 className="h-3 w-3" />
            Đã xác minh
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 gap-1 transition-colors">
            <Clock className="h-3 w-3" />
            Đang chờ
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 gap-1 transition-colors">
            <AlertCircle className="h-3 w-3" />
            Từ chối
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 gap-1 transition-colors">
            <Clock className="h-3 w-3" />
            Chưa xác minh
          </Badge>
        )
    }
  }

  return (
    <Card className="border-none shadow-lg rounded-xl bg-white dark:bg-gray-900">
      <CardHeader className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Thông tin tài xế
            </CardTitle>
            <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
              Quản lý thông tin cá nhân và giấy tờ xác minh
            </CardDescription>
          </div>
          {isDriverInfoApproved && (
            <Badge className="bg-green-600 text-white hover:bg-green-700 h-9 px-4 py-2 font-medium">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Đã xác minh đầy đủ
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 space-y-8">
        {isDriverInfoApproved ? (
          <div className="space-y-8">
            {/* CCCD Section */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      1
                    </span>
                    Căn cước công dân
                  </CardTitle>
                  {getStatusBadge(user.identityDocument?.verificationStatus)}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Số CCCD
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                      {user.identityDocument?.documentNumber ||
                        'Chưa có dữ liệu'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Họ và tên
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                      {user.name || 'Chưa có dữ liệu'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Ngày sinh
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                      {user.dateOfBirth || 'Chưa có dữ liệu'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Số điện thoại
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                      {user.phoneNumber || 'Chưa có dữ liệu'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <CardHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mặt trước CCCD
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-4">
                      {user.identityDocument?.frontImage ? (
                        <div className="relative aspect-[3.5/2.2] rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <img
                            src={user.identityDocument.frontImage}
                            alt="Mặt trước căn cước công dân"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="aspect-[3.5/2.2] rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                          Không có ảnh
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <CardHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mặt sau CCCD
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-4">
                      {user.identityDocument?.backImage ? (
                        <div className="relative aspect-[3.5/2.2] rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <img
                            src={user.identityDocument.backImage}
                            alt="Mặt sau căn cước công dân"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="aspect-[3.5/2.2] rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                          Không có ảnh
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Driver License Section */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      2
                    </span>
                    Giấy phép lái xe
                  </CardTitle>
                  {getStatusBadge(user.driverLicense?.verificationStatus)}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Số GPLX
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                      {user.driverLicense?.licenseNumber || 'Chưa có dữ liệu'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <CardHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mặt trước GPLX
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-4">
                      {user.driverLicense?.frontImage ? (
                        <div className="relative aspect-[3.5/2.2] rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <img
                            src={user.driverLicense.frontImage}
                            alt="Mặt trước giấy phép lái xe"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="aspect-[3.5/2.2] rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                          Không có ảnh
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <CardHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mặt sau GPLX
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-4">
                      {user.driverLicense?.backImage ? (
                        <div className="relative aspect-[3.5/2.2] rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <img
                            src={user.driverLicense.backImage}
                            alt="Mặt sau giấy phép lái xe"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="aspect-[3.5/2.2] rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                          Không có ảnh
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Info Section */}
            {isVehicleApproved ? (
              <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        3
                      </span>
                      Thông tin phương tiện
                    </CardTitle>
                    {getStatusBadge(user.vehicles?.[0]?.verificationStatus)}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Biển số xe
                      </p>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold">
                        {user.vehicles?.[0]?.licensePlate || 'Chưa có dữ liệu'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Mẫu xe
                      </p>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold">
                        {user.vehicles?.[0]?.model || 'Chưa có dữ liệu'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Số ghế
                      </p>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold">
                        {user.vehicles?.[0]?.seats || 'Chưa có dữ liệu'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                      <CardHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Giấy đăng ký xe
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 py-4">
                        {user.vehicles?.[0]?.registrationDocument ? (
                          <div className="relative aspect-[3.5/2.2] rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <img
                              src={user.vehicles[0].registrationDocument}
                              alt="Giấy đăng ký xe"
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.png'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="aspect-[3.5/2.2] rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                            Không có ảnh
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                      <CardHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Giấy bảo hiểm
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 py-4">
                        {user.vehicles?.[0]?.insuranceDocument ? (
                          <div className="relative aspect-[3.5/2.2] rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <img
                              src={user.vehicles[0].insuranceDocument}
                              alt="Giấy bảo hiểm"
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.png'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="aspect-[3.5/2.2] rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                            Không có ảnh
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <VehicleInfoSection
                initialData={{
                  vehicleId: user.vehicles?.[0]?._id?.$oid,
                  plateNumber: user.vehicles?.[0]?.licensePlate,
                  brand: user.vehicles?.[0]?.model,
                  seats: user.vehicles?.[0]?.seats,
                  registrationDocument: user.vehicles?.[0]?.registrationDocument,
                  insuranceDocument: user.vehicles?.[0]?.insuranceDocument,
                  verificationStatus: user.vehicles?.[0]?.verificationStatus,
                }}
                onSuccess={async () => {
                  await refetchData()
                }}
                onError={(error: any) => {
                  console.error('Vehicle submission error:', error)
                }}
              />
            )}
          </div>
        ) : (
          <DriverInfoForm userData={user} refetch={refetchData} />
        )}
      </CardContent>
    </Card>
  )
}

