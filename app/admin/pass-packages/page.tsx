'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { createColumns } from './columns'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { PassPackageType } from './columns'

export default function PassPackagesPage() {
  const [isPending, setIsPending] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passPackages, setPassPackages] = useState<PassPackageType[]>([])
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PassPackageType | null>(
    null
  )
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    price: '',
    description: '',
  })
  const [errors, setErrors] = useState<Partial<typeof formData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data
  const initialMockData: PassPackageType[] = [
    {
      _id: '1',
      name: 'Gói Tháng',
      duration: 30,
      price: 500000,
      description: 'Truy cập trong 30 ngày',
      createdAt: '2025-05-01T10:00:00Z',
      updatedAt: '2025-05-01T10:00:00Z',
    },
    {
      _id: '2',
      name: 'Gói Năm',
      duration: 365,
      price: 5000000,
      description: 'Truy cập cả năm với ưu đãi',
      createdAt: '2025-04-20T09:00:00Z',
      updatedAt: '2025-04-20T09:00:00Z',
    },
    {
      _id: '3',
      name: 'Gói Tuần',
      duration: 7,
      price: 150000,
      description: 'Truy cập ngắn hạn 7 ngày',
      createdAt: '2025-03-15T08:00:00Z',
      updatedAt: '2025-03-15T08:00:00Z',
    },
  ]

  // Tải mock data
  useEffect(() => {
    setIsPending(true)
    const timeout = setTimeout(() => {
      try {
        setPassPackages(initialMockData)
        setIsPending(false)
      } catch (err) {
        setIsError(true)
        setError('Không tải được danh sách gói pass')
        setIsPending(false)
      }
    }, 1000)
    return () => clearTimeout(timeout)
  }, [refetchTrigger])

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {}
    if (!formData.name.trim()) newErrors.name = 'Tên gói là bắt buộc'
    if (
      !formData.duration ||
      isNaN(Number(formData.duration)) ||
      Number(formData.duration) <= 0
    )
      newErrors.duration = 'Thời hạn phải là số dương'
    if (
      !formData.price ||
      isNaN(Number(formData.price)) ||
      Number(formData.price) <= 0
    )
      newErrors.price = 'Giá phải là số dương'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc')
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const timestamp = new Date().toISOString()
      if (editingPackage) {
        setPassPackages((prev) =>
          prev.map((pkg) =>
            pkg._id === editingPackage._id
              ? {
                  ...pkg,
                  name: formData.name,
                  duration: Number(formData.duration),
                  price: Number(formData.price),
                  description: formData.description || undefined,
                  updatedAt: timestamp,
                }
              : pkg
          )
        )
        toast.success('Cập nhật gói pass thành công')
      } else {
        const newId = (passPackages.length + 1).toString()
        const newPackage: PassPackageType = {
          _id: newId,
          name: formData.name,
          duration: Number(formData.duration),
          price: Number(formData.price),
          description: formData.description || undefined,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        setPassPackages((prev) => [...prev, newPackage])
        toast.success('Tạo gói pass thành công')
      }
      setFormData({ name: '', duration: '', price: '', description: '' })
      setEditingPackage(null)
      setOpenDialog(false)
    } catch (error) {
      toast.error('Lưu gói pass thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleOpenDialog = (pkg: PassPackageType | null = null) => {
    if (pkg) {
      setEditingPackage(pkg)
      setFormData({
        name: pkg.name,
        duration: pkg.duration.toString(),
        price: pkg.price.toString(),
        description: pkg.description || '',
      })
    } else {
      setEditingPackage(null)
      setFormData({ name: '', duration: '', price: '', description: '' })
    }
    setOpenDialog(true)
  }

  const deletePackage = (id: string) => {
    setPassPackages((prev) => prev.filter((pkg) => pkg._id !== id))
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
          Gói Pass
        </h2>
        <div className="container mx-auto py-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              {error || 'Không tải được danh sách gói pass'}
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
              setEditingPackage(null)
              setFormData({
                name: '',
                duration: '',
                price: '',
                description: '',
              })
              setErrors({})
            }
            setOpenDialog(open)
          }}
        >
          <DialogContent className='max-w-3xl'>
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
                  placeholder="VD: Gói Tháng"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Thời Hạn (ngày)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    handleInputChange('duration', e.target.value)
                  }
                  placeholder="VD: 30"
                  disabled={isSubmitting}
                />
                {errors.duration && (
                  <p className="text-sm text-destructive">{errors.duration}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá (VND)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="VD: 500000"
                  disabled={isSubmitting}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô Tả (không bắt buộc)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="VD: Truy cập trong 30 ngày"
                  disabled={isSubmitting}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
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
          columns={createColumns(refetch, setEditingPackage, setOpenDialog)}
          data={passPackages}
          meta={{ deletePackage }}
        />
      </div>
    </div>
  )
}
