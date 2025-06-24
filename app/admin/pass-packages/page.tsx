'use client'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { DataTable } from './data-table'
import { createColumns, PassPackageType } from './columns'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getAllPackagesQueryFn,
  createPackageMutationFn,
  updatePackageMutationFn,
  deletePackageMutationFn,
} from '@/api/memberships/membership'

export default function PassPackagesPage() {
  const queryClient = useQueryClient()
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PassPackageType | null>(
    null
  )
  const [formData, setFormData] = useState({
    name: '',
    acceptRequests: '',
    price: '',
    durationDays: '',
    descriptions: [''],
  })
  const [errors, setErrors] = useState<Partial<typeof formData>>({})

  // Fetch all packages
  const {
    data: apiResponse,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['pass-packages'],
    queryFn: async () => {
      const response = await getAllPackagesQueryFn()
      return {
        ...response,
        data: response.data.map((pkg: any) => ({
          _id: pkg._id,
          name: pkg.name,
          acceptRequests: pkg.acceptRequests,
          price: pkg.price,
          durationDays: pkg.durationDays,
          description: pkg.description || [],
        })),
      }
    },
  })
  const passPackages = apiResponse?.data || []

  // Create package mutation
  const createPackageMutation = useMutation({
    mutationFn: createPackageMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pass-packages'] })
      toast.success('Tạo gói thành công')
      resetForm()
      setOpenDialog(false)
    },
    onError: (error: any) => {
      console.error('Create Package Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      const errorMessage =
        error.response?.data?.message || 'Lỗi khi tạo gói, vui lòng thử lại'
      toast.error(errorMessage)
    },
  })

  // Update package mutation
  const updatePackageMutation = useMutation({
    mutationFn: ({ packageName, data }: { packageName: string; data: any }) =>
      updatePackageMutationFn(packageName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pass-packages'] })
      toast.success('Cập nhật gói thành công')
      resetForm()
      setOpenDialog(false)
    },
    onError: (error: any) => {
      console.error('Update Package Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      const errorMessage =
        error.response?.data?.message || 'Lỗi khi cập nhật gói'
      toast.error(errorMessage)
    },
  })

  // Delete package mutation
  const deletePackageMutation = useMutation({
    mutationFn: deletePackageMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pass-packages'] })
      toast.success('Xóa gói thành công')
    },
    onError: (error: any) => {
      console.error('Delete Package Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      const errorMessage = error.response?.data?.message || 'Lỗi khi xóa gói'
      toast.error(errorMessage)
    },
  })

  const resetForm = () => {
    setEditingPackage(null)
    setFormData({
      name: '',
      acceptRequests: '',
      price: '',
      durationDays: '',
      descriptions: [''],
    })
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {}
    if (!formData.name.trim()) newErrors.name = 'Tên gói là bắt buộc'
    if (
      !formData.acceptRequests ||
      isNaN(Number(formData.acceptRequests)) ||
      Number(formData.acceptRequests) <= 0
    )
      newErrors.acceptRequests = 'Số yêu cầu phải là số dương'
    if (
      !formData.price ||
      isNaN(Number(formData.price)) ||
      Number(formData.price) <= 0
    )
      newErrors.price = 'Giá phải là số dương'
    if (
      !formData.durationDays ||
      isNaN(Number(formData.durationDays)) ||
      Number(formData.durationDays) <= 0
    )
      newErrors.durationDays = 'Thời hạn phải là số dương'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc')
      return
    }

    try {
      const packageData = {
        name: formData.name,
        acceptRequests: Number(formData.acceptRequests),
        price: Number(formData.price),
        durationDays: Number(formData.durationDays),
        description: formData.descriptions.filter((desc) => desc.trim()),
      }
      console.log('Sending packageData:', packageData)
      if (editingPackage) {
        await updatePackageMutation.mutateAsync({
          packageName: editingPackage.name,
          data: packageData,
        })
      } else {
        await createPackageMutation.mutateAsync(packageData)
      }
    } catch (error: any) {
      console.error('Submit Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      toast.error(
        'Lưu gói thất bại: ' + (error.response?.data?.message || error.message)
      )
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleDescriptionChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newDescriptions = [...prev.descriptions]
      newDescriptions[index] = value
      return { ...prev, descriptions: newDescriptions }
    })
  }

  const addDescription = () => {
    setFormData((prev) => ({
      ...prev,
      descriptions: [...prev.descriptions, ''],
    }))
  }

  const removeDescription = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      descriptions: prev.descriptions.filter((_, i) => i !== index),
    }))
  }

  const handleOpenDialog = (pkg: PassPackageType | null = null) => {
    if (pkg) {
      setEditingPackage(pkg)
      setFormData({
        name: pkg.name,
        acceptRequests: pkg.acceptRequests.toString(),
        price: pkg.price.toString(),
        durationDays: pkg.durationDays.toString(),
        descriptions: pkg.description.length > 0 ? pkg.description : [''],
      })
    } else {
      resetForm()
    }
    setOpenDialog(true)
  }

  const deletePackage = (packageName: string) => {
    deletePackageMutation.mutate(packageName)
  }

  if (isPending) {
    return (
      <div className="p-3">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
          Gói Pass
        </h2>
        <div className="container mx-auto py-10">
          <div className="flex items-center mb-4">
            <Skeleton className="h-10 w-full max-w-sm" />
          </div>
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-4">
                  {Array(10)
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
          Gói Pass
        </h2>
        <div className="container mx-auto py-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              {error?.message || 'Không tải được danh sách gói pass'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
        Gói Pass
      </h2>
      <div className="container mx-auto py-5">
        <Button onClick={() => handleOpenDialog()} className="mb-4">
          Thêm Gói Pass Mới
        </Button>
        <Dialog
          open={openDialog}
          onOpenChange={(open) => {
            if (!open) {
              resetForm()
            }
            setOpenDialog(open)
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Sửa Gói Pass' : 'Thêm Gói Pass'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên Gói</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="VD: Enterprise"
                  disabled={
                    createPackageMutation.isPending ||
                    updatePackageMutation.isPending
                  }
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="acceptRequests">Số Yêu Cầu</Label>
                <Input
                  id="acceptRequests"
                  type="number"
                  min="1"
                  value={formData.acceptRequests}
                  onChange={(e) =>
                    handleInputChange('acceptRequests', e.target.value)
                  }
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  placeholder="VD: 500"
                  disabled={
                    createPackageMutation.isPending ||
                    updatePackageMutation.isPending
                  }
                />
                {errors.acceptRequests && (
                  <p className="text-sm text-destructive">
                    {errors.acceptRequests}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá (VND)</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  placeholder="VD: 500000"
                  disabled={
                    createPackageMutation.isPending ||
                    updatePackageMutation.isPending
                  }
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationDays">Thời Hạn (ngày)</Label>
                <Input
                  id="durationDays"
                  type="number"
                  min="1"
                  value={formData.durationDays}
                  onChange={(e) =>
                    handleInputChange('durationDays', e.target.value)
                  }
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  placeholder="VD: 30"
                  disabled={
                    createPackageMutation.isPending ||
                    updatePackageMutation.isPending
                  }
                />
                {errors.durationDays && (
                  <p className="text-sm text-destructive">
                    {errors.durationDays}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                {formData.descriptions.map((desc, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={desc}
                      onChange={(e) =>
                        handleDescriptionChange(index, e.target.value)
                      }
                      placeholder={`Mô tả ${index + 1}`}
                      disabled={
                        createPackageMutation.isPending ||
                        updatePackageMutation.isPending
                      }
                    />
                    {formData.descriptions.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeDescription(index)}
                        disabled={
                          createPackageMutation.isPending ||
                          updatePackageMutation.isPending
                        }
                      >
                        Xóa
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDescription}
                  disabled={
                    createPackageMutation.isPending ||
                    updatePackageMutation.isPending
                  }
                >
                  Thêm Mô tả
                </Button>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                  disabled={
                    createPackageMutation.isPending ||
                    updatePackageMutation.isPending
                  }
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createPackageMutation.isPending ||
                    updatePackageMutation.isPending
                  }
                >
                  {createPackageMutation.isPending ||
                  updatePackageMutation.isPending
                    ? editingPackage
                      ? 'Đang cập nhật...'
                      : 'Đang tạo...'
                    : editingPackage
                    ? 'Cập Nhật Gói'
                    : 'Tạo Gói Pass'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <DataTable
          columns={createColumns(
            () =>
              queryClient.invalidateQueries({ queryKey: ['pass-packages'] }),
            (pkg) => handleOpenDialog(pkg),
            setOpenDialog
          )}
          data={passPackages}
          meta={{ deletePackage }}
        />
      </div>
    </div>
  )
}
