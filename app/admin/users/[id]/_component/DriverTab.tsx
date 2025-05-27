import { UserType } from '@/context/auth-provider'
import { Button } from '@/components/ui/button'
import { MdOutlineVerified, MdWarning, MdClose, MdZoomIn } from 'react-icons/md'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/dialog/ConfirmDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { useMutation } from '@tanstack/react-query'
import {
  verifyDocumentMutationFn,
  approveVehicleMutationFn,
} from '@/api/users/user'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface DriverTabProps {
  userData: UserType
  refetch: () => void
}

interface Vehicle {
  _id: string
  licensePlate: string
  model: string
  seats: number
  registrationDocument: string
  insuranceDocument?: string
  verificationStatus: 'pending' | 'approved' | 'rejected' // Cập nhật để dùng chữ thường
}

export default function DriverTab({ userData, refetch }: DriverTabProps) {
  const [rejectReason, setRejectReason] = useState('')
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [currentDocumentType, setCurrentDocumentType] = useState<
    'driverLicense' | 'identityDocument' | 'vehicle' | null
  >(null)
  const [currentVehicleId, setCurrentVehicleId] = useState<string | null>(null)
  const [zoomImage, setZoomImage] = useState<{
    url: string
    alt: string
  } | null>(null)

  // Mutation for document verification
  const verifyDocumentMutation = useMutation({
    mutationFn: ({
      type,
      action,
      reason,
    }: {
      type: 'driverLicense' | 'identityDocument'
      action: 'approve' | 'reject'
      reason?: string
    }) =>
      verifyDocumentMutationFn(userData._id, type, {
        action,
        reason: reason || 'Xác minh thành công',
      }),
    onSuccess: (_, variables) => {
      const { action, type } = variables
      const documentName =
        type === 'identityDocument' ? 'Căn cước công dân' : 'Giấy phép lái xe'
      if (action === 'approve') {
        toast.success('Xác minh danh tính thành công', {
          description: `Thông tin ${documentName} đã được xử lý`,
        })
      } else {
        toast.success('Đã từ chối xác minh', {
          description: `Thông tin ${documentName} đã bị từ chối`,
        })
      }
      refetch()
      setIsRejectDialogOpen(false)
      setRejectReason('')
    },
    onError: (error: any) => {
      toast.error('Xác minh thất bại', {
        description: error.message || 'Đã xảy ra lỗi khi xác minh',
      })
    },
  })

  // Mutation for vehicle verification
  const verifyVehicleMutation = useMutation({
    mutationFn: ({
      vehicleId,
      action,
      reason,
    }: {
      vehicleId: string
      action: 'approved' | 'rejected' // Cập nhật để dùng chữ thường
      reason?: string
    }) =>
      approveVehicleMutationFn(userData._id, vehicleId, {
        verificationStatus: action, // Gửi chữ thường: approved, rejected
        rejectionReason: reason,
      }),
    onSuccess: (_, variables) => {
      const { action } = variables
      if (action === 'approved') {
        toast.success('Xác minh phương tiện thành công', {
          description: `Phương tiện đã được xử lý`,
        })
      } else {
        toast.success('Đã từ chối xác minh phương tiện', {
          description: `Phương tiện đã bị từ chối`,
        })
      }
      refetch()
      setIsRejectDialogOpen(false)
      setRejectReason('')
      setCurrentVehicleId(null)
    },
    onError: (error: any) => {
      toast.error('Xác minh phương tiện thất bại', {
        description: error.message || 'Đã xảy ra lỗi khi xác minh',
      })
    },
  })

  const handleApproveDocument = (
    type: 'driverLicense' | 'identityDocument'
  ) => {
    setCurrentDocumentType(type)
    verifyDocumentMutation.mutate({
      type,
      action: 'approve',
    })
  }

  const handleApproveVehicle = (vehicleId: string) => {
    setCurrentDocumentType('vehicle')
    setCurrentVehicleId(vehicleId)
    verifyVehicleMutation.mutate({
      vehicleId,
      action: 'approved', // Cập nhật để dùng chữ thường
    })
  }

  const handleOpenRejectDialog = (
    type: 'driverLicense' | 'identityDocument' | 'vehicle',
    vehicleId?: string
  ) => {
    setCurrentDocumentType(type)
    if (type === 'vehicle' && vehicleId) {
      setCurrentVehicleId(vehicleId)
    }
    setIsRejectDialogOpen(true)
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Lý do từ chối không được để trống')
      return
    }
    if (currentDocumentType === 'vehicle' && currentVehicleId) {
      verifyVehicleMutation.mutate({
        vehicleId: currentVehicleId,
        action: 'rejected', // Cập nhật để dùng chữ thường
        reason: rejectReason,
      })
    } else if (
      currentDocumentType === 'driverLicense' ||
      currentDocumentType === 'identityDocument'
    ) {
      verifyDocumentMutation.mutate({
        type: currentDocumentType,
        action: 'reject',
        reason: rejectReason,
      })
    }
  }

  const handleZoomImage = (url: string, alt: string) => {
    setZoomImage({ url, alt })
  }

  const isIdentityVerified =
    userData.identityDocument?.verificationStatus === 'approved'
  const isDriverLicenseVerified =
    userData.driverLicense?.verificationStatus === 'approved'
    const isDriverVehiclesVerified =
      userData.vehicles?.[0].verificationStatus === 'approved'
  const isFullyVerified =
    isIdentityVerified && isDriverLicenseVerified && isDriverVehiclesVerified

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <Badge variant="success" className="gap-1">
            <MdOutlineVerified className="h-4 w-4" />
            Đã xác minh
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="warning" className="gap-1">
            <MdWarning className="h-4 w-4" />
            Chờ xác minh
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <MdWarning className="h-4 w-4" />
            Xác minh lại
          </Badge>
        )
      default:
        return (
          <Badge variant="destructive" className="gap-1">
            <MdWarning className="h-4 w-4" />
            Chưa xác minh
          </Badge>
        )
    }
  }

  const renderImageWithZoom = (imageUrl: string | undefined, alt: string) => {
    if (!imageUrl) {
      return (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Không có ảnh</p>
        </div>
      )
    }

    return (
      <div className="relative w-full h-full group">
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover rounded-lg"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={() => handleZoomImage(imageUrl, alt)}
          >
            <MdZoomIn className="h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="mb-0">
          <h2 className="text-2xl font-semibold tracking-tight">
            Thông tin tài xế
          </h2>
          <p className="text-sm text-muted-foreground">
            Quản lý thông tin giấy tờ, phương tiện và xác minh danh tính
          </p>
        </div>
      </div>
      {/* Thông báo khi đã xác minh */}
      {isFullyVerified && (
        <div className="p-4 bg-success/10 rounded-lg border border-success/30 flex items-start gap-3">
          <MdOutlineVerified className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-success">Đã xác minh</h4>
            <p className="text-sm text-success/80">
              Tất cả giấy tờ của tài xế này đã được xác minh và hợp lệ
            </p>
          </div>
        </div>
      )}
      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-3xl p-4">
          <DialogHeader>
            <DialogTitle>
              Từ chối{' '}
              {currentDocumentType === 'identityDocument'
                ? 'Căn cước công dân'
                : currentDocumentType === 'driverLicense'
                ? 'Giấy phép lái xe'
                : 'Phương tiện'}
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối xác minh.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false)
                setRejectReason('')
                setCurrentVehicleId(null)
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={
                verifyDocumentMutation.isPending ||
                verifyVehicleMutation.isPending ||
                !rejectReason.trim()
              }
            >
              {verifyDocumentMutation.isPending ||
              verifyVehicleMutation.isPending
                ? 'Đang xử lý...'
                : 'Từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog
        open={!!zoomImage}
        onOpenChange={(open) => !open && setZoomImage(null)}
      >
        <DialogContent className="max-w-4xl p-4">
          <DialogTitle className="sr-only">Ảnh tài liệu phóng to</DialogTitle>
          <div className="relative w-full h-[80vh]">
            {zoomImage && (
              <Image
                src={zoomImage.url}
                alt={zoomImage.alt}
                fill
                className="object-contain"
                priority
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Grid layout cho các loại giấy tờ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card CCCD */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Căn cước công dân</span>
                {getStatusBadge(userData.identityDocument?.verificationStatus)}
              </CardTitle>
              {!isIdentityVerified && (
                <div className="flex gap-2">
                  <ConfirmDialog
                    title="Xác minh Căn cước công dân"
                    description="Bạn có chắc chắn muốn xác minh Căn cước công dân của tài xế này?"
                    confirmText="Xác nhận xác minh"
                    cancelText="Hủy bỏ"
                    onConfirm={() => handleApproveDocument('identityDocument')}
                  >
                    <Button
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2 shadow-sm"
                      disabled={verifyDocumentMutation.isPending}
                    >
                      <MdOutlineVerified className="h-4 w-4" />
                      Xác minh
                    </Button>
                  </ConfirmDialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="shadow-sm"
                    onClick={() => handleOpenRejectDialog('identityDocument')}
                    disabled={verifyDocumentMutation.isPending}
                  >
                    <MdClose className="h-4 w-4" />
                    Từ chối
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Số CCCD
                </h4>
                <p className="font-medium text-lg">
                  {userData.identityDocument?.documentNumber || '---'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Ảnh mặt trước
                </h4>
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  {renderImageWithZoom(
                    userData.identityDocument?.frontImage,
                    'Ảnh mặt trước CCCD'
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Ảnh mặt sau
                </h4>
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  {renderImageWithZoom(
                    userData.identityDocument?.backImage,
                    'Ảnh mặt sau CCCD'
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card GPLX */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Giấy phép lái xe</span>
                {getStatusBadge(userData.driverLicense?.verificationStatus)}
              </CardTitle>
              {!isDriverLicenseVerified && (
                <div className="flex gap-2">
                  <ConfirmDialog
                    title="Xác minh Giấy phép lái xe"
                    description="Bạn có chắc chắn muốn xác minh Giấy phép lái xe của tài xế này?"
                    confirmText="Xác nhận xác minh"
                    cancelText="Hủy bỏ"
                    onConfirm={() => handleApproveDocument('driverLicense')}
                  >
                    <Button
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2 shadow-sm"
                      disabled={verifyDocumentMutation.isPending}
                    >
                      <MdOutlineVerified className="h-4 w-4" />
                      Xác minh
                    </Button>
                  </ConfirmDialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="shadow-sm"
                    onClick={() => handleOpenRejectDialog('driverLicense')}
                    disabled={verifyDocumentMutation.isPending}
                  >
                    <MdClose className="h-4 w-4" />
                    Từ chối
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Số GPLX
                </h4>
                <p className="font-medium text-lg">
                  {userData.driverLicense?.licenseNumber || '---'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Ảnh mặt trước
                </h4>
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  {renderImageWithZoom(
                    userData.driverLicense?.frontImage,
                    'Ảnh mặt trước GPLX'
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Ảnh mặt sau
                </h4>
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  {renderImageWithZoom(
                    userData.driverLicense?.backImage,
                    'Ảnh mặt sau GPLX'
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Section */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Danh sách phương tiện</CardTitle>
        </CardHeader>
        <CardContent>
          {userData.vehicles?.length ? (
            <div className="space-y-6">
              {userData.vehicles.map((vehicle: Vehicle) => (
                <div key={vehicle._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        {vehicle.model} ({vehicle.licensePlate})
                      </span>
                      {getStatusBadge(vehicle.verificationStatus)}
                    </div>
                    {vehicle.verificationStatus !== 'approved' && (
                      <div className="flex gap-2">
                        <ConfirmDialog
                          title="Xác minh phương tiện"
                          description={`Bạn có chắc chắn muốn xác minh phương tiện ${vehicle.model} (${vehicle.licensePlate})?`}
                          confirmText="Xác nhận xác minh"
                          cancelText="Hủy bỏ"
                          onConfirm={() => handleApproveVehicle(vehicle._id)}
                        >
                          <Button
                            variant="default"
                            size="sm"
                            className="flex items-center gap-2 shadow-sm"
                            disabled={verifyVehicleMutation.isPending}
                          >
                            <MdOutlineVerified className="h-4 w-4" />
                            Xác minh
                          </Button>
                        </ConfirmDialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="shadow-sm"
                          onClick={() =>
                            handleOpenRejectDialog('vehicle', vehicle._id)
                          }
                          disabled={verifyVehicleMutation.isPending}
                        >
                          <MdClose className="h-4 w-4" />
                          Từ chối
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Biển số
                      </h4>
                      <p className="font-medium text-lg">
                        {vehicle.licensePlate}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Mẫu xe
                      </h4>
                      <p className="font-medium text-lg">{vehicle.model}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Số ghế
                      </h4>
                      <p className="font-medium text-lg">{vehicle.seats}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Giấy đăng ký
                      </h4>
                      <div className="relative aspect-video rounded-lg overflow-hidden border">
                        {renderImageWithZoom(
                          vehicle.registrationDocument,
                          `Giấy đăng ký của ${vehicle.licensePlate}`
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Giấy bảo hiểm
                      </h4>
                      <div className="relative aspect-video rounded-lg overflow-hidden border">
                        {renderImageWithZoom(
                          vehicle.insuranceDocument,
                          `Giấy bảo hiểm của ${vehicle.licensePlate}`
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Không có phương tiện nào.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
