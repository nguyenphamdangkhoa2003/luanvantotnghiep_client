'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  UploadCloud,
  X,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { addVehicleMutationFn, updateVehicleMutationFn } from '@/api/users/user'
import { Badge } from '@/components/ui/badge'

interface VehicleInfoSectionProps {
  initialData?: {
    vehicleId?: string
    plateNumber?: string
    brand?: string
    seats?: number
    registrationDocument?: string
    insuranceDocument?: string
    verificationStatus?: 'approved' | 'rejected' | 'pending'
  }
  onSuccess?: () => void
  onError?: (error: any) => void
}

// Zod schema for vehicle form
const vehicleFormSchema = z.object({
  licensePlate: z.string().min(1, 'Biển số xe là bắt buộc'),
  vehicleModel: z.string().min(1, 'Mẫu xe là bắt buộc'),
  seats: z
    .number({ invalid_type_error: 'Số ghế phải là một số' })
    .min(1, 'Số ghế phải lớn hơn 0')
    .int('Số ghế phải là số nguyên'),
  vehicleRegistration: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf']
        return file ? allowedMimes.includes(file.type) : true
      },
      { message: 'Chỉ chấp nhận JPEG, PNG, hoặc PDF' }
    )
    .refine((file) => (file ? file.size <= 5 * 1024 * 1024 : true), {
      message: 'Kích thước file tối đa 5MB',
    }),
  insuranceDocument: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf']
        return file ? allowedMimes.includes(file.type) : true
      },
      { message: 'Chỉ chấp nhận JPEG, PNG, hoặc PDF' }
    )
    .refine((file) => (file ? file.size <= 5 * 1024 * 1024 : true), {
      message: 'Kích thước file tối đa 5MB',
    }),
})

type VehicleFormValues = z.infer<typeof vehicleFormSchema>

export function VehicleInfoSection({
  initialData,
  onSuccess,
  onError,
}: VehicleInfoSectionProps) {
  // Log initialData for debugging
  console.log('VehicleInfoSection initialData:', initialData)

  // Setup form
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      licensePlate: initialData?.plateNumber || '',
      vehicleModel: initialData?.brand || '',
      seats: initialData?.seats || 4,
      vehicleRegistration: undefined,
      insuranceDocument: undefined,
    },
    mode: 'onSubmit',
  })

  // Determine if updating or adding a vehicle
  const isUpdating = !!initialData?.vehicleId

  // Vehicle submission mutation
  const vehicleMutation = useMutation({
    mutationFn: async (data: VehicleFormValues) => {
      console.log('Submitting data:', data)
      if (!isUpdating && !data.vehicleRegistration) {
        throw new Error('Giấy đăng ký xe là bắt buộc khi thêm phương tiện mới.')
      }

      const payload = {
        licensePlate: data.licensePlate,
        model: data.vehicleModel,
        seats: data.seats,
        registrationDocument: data.vehicleRegistration,
        insuranceDocument: data.insuranceDocument,
      }

      if (isUpdating) {
        return await updateVehicleMutationFn(initialData!.vehicleId!, payload)
      } else {
        // Ensure registrationDocument is a File for addVehicleMutationFn
        return await addVehicleMutationFn({
          ...payload,
          registrationDocument: data.vehicleRegistration!, // Non-null assertion since we validated above
        })
      }
    },
    onError: (error: any) => {
      console.error('Vehicle submission error:', {
        message: error.message,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
              headers: error.response.headers,
            }
          : null,
        request: error.request ? error.request : null,
      })
      toast.error(
        error.message ||
          error.response?.data?.message?.join(', ') ||
          'Lưu thông tin phương tiện thất bại.'
      )
      onError?.(error)
    },
    onSuccess: () => {
      toast.success(
        isUpdating
          ? 'Cập nhật thông tin phương tiện thành công.'
          : 'Lưu thông tin phương tiện thành công.'
      )
      form.reset()
      onSuccess?.()
    },
  })

  const onSubmit = async (values: VehicleFormValues) => {
    try {
      await vehicleMutation.mutateAsync(values)
    } catch (error) {
      // Error handled in mutation onError
    }
  }

  // Helper to check if file is an image
  const isImageFile = (file?: File) =>
    file && ['image/jpeg', 'image/png'].includes(file.type)

  // Helper to check if URL is an image
  const isImageUrl = (url?: string) => {
    const isImage = url && /\.(jpg|jpeg|png|webp)$/i.test(url)
    console.log('isImageUrl:', { url, isImage })
    return isImage
  }

  // Helper to get status badge
  const getStatusBadge = (status?: 'approved' | 'rejected' | 'pending') => {
    console.log('getStatusBadge status:', status)
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
    <Card className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              3
            </span>
            Thông tin phương tiện
          </CardTitle>
          {getStatusBadge(initialData?.verificationStatus)}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Biển số xe
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập biển số xe (VD: 30A-12345)"
                        {...field}
                        disabled={vehicleMutation.isPending}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Mẫu xe
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập mẫu xe (VD: Toyota Camry)"
                        {...field}
                        disabled={vehicleMutation.isPending}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="seats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Số ghế
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập số ghế (VD: 4)"
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value ? parseInt(value, 10) : 4)
                        }}
                        min="1"
                        disabled={vehicleMutation.isPending}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="vehicleRegistration"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="space-y-2">
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Giấy đăng ký xe
                      </FormLabel>
                      <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                        {isUpdating
                          ? 'Hình ảnh hiện tại được hiển thị. (JPEG, PNG, tối đa 5MB).'
                          : 'Tải lên giấy đăng ký xe (JPEG, PNG, tối đa 5MB).'}
                      </FormDescription>
                      <FormControl>
                        <div className="space-y-2">
                          <label
                            htmlFor="vehicleRegistration"
                            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                              fieldState.error
                                ? 'border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900/30'
                                : 'border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 bg-gray-50 dark:bg-gray-800'
                            }`}
                          >
                            {field.value ? (
                              <div className="relative w-full h-full p-2">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  {isImageFile(field.value) ? (
                                    <img
                                      src={URL.createObjectURL(field.value)}
                                      alt="Xem trước giấy đăng ký xe"
                                      className="max-w-full max-h-full object-contain rounded-md"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                                      <FileText className="w-10 h-10 mb-2" />
                                      <span className="text-sm truncate max-w-[200px]">
                                        {field.value.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    form.setValue(
                                      'vehicleRegistration',
                                      undefined,
                                      {
                                        shouldValidate: true,
                                      }
                                    )
                                  }}
                                  disabled={vehicleMutation.isPending}
                                >
                                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </Button>
                              </div>
                            ) : initialData?.registrationDocument ? (
                              <div className="relative w-full h-full p-2">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  {isImageUrl(
                                    initialData.registrationDocument
                                  ) ? (
                                    <img
                                      src={initialData.registrationDocument}
                                      alt="Giấy đăng ký xe hiện tại"
                                      className="max-w-full max-h-full object-contain rounded-md"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          '/placeholder-image.png'
                                      }}
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                                      <FileText className="w-10 h-10 mb-2" />
                                      <span className="text-sm truncate max-w-[200px]">
                                        Giấy đăng ký xe (PDF)
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    form.setValue(
                                      'vehicleRegistration',
                                      undefined,
                                      {
                                        shouldValidate: true,
                                      }
                                    )
                                  }}
                                  disabled={vehicleMutation.isPending}
                                >
                                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                                <UploadCloud className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500" />
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                  <span className="font-medium text-purple-600 dark:text-purple-400">
                                    Nhấn để tải lên
                                  </span>{' '}
                                  hoặc kéo thả file
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  JPEG, PNG, PDF (tối đa 5MB)
                                </p>
                              </div>
                            )}
                            <input
                              id="vehicleRegistration"
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  form.setValue('vehicleRegistration', file, {
                                    shouldValidate: true,
                                  })
                                }
                              }}
                              accept="image/jpeg,image/png,application/pdf"
                              disabled={vehicleMutation.isPending}
                              aria-describedby="vehicleRegistration-description"
                            />
                          </label>
                          <FormMessage className="text-red-500 text-sm" />
                        </div>
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="insuranceDocument"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="space-y-2">
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Giấy bảo hiểm xe (Tùy chọn)
                      </FormLabel>
                      <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                        {initialData?.insuranceDocument
                          ? 'Hình ảnh hiện tại được hiển thị (JPEG, PNG, tối đa 5MB).'
                          : 'Tải lên giấy bảo hiểm xe nếu có (JPEG, PNG, tối đa 5MB).'}
                      </FormDescription>
                      <FormControl>
                        <div className="space-y-2">
                          <label
                            htmlFor="insuranceDocument"
                            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                              fieldState.error
                                ? 'border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900/30'
                                : 'border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 bg-gray-50 dark:bg-gray-800'
                            }`}
                          >
                            {field.value ? (
                              <div className="relative w-full h-full p-2">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  {isImageFile(field.value) ? (
                                    <img
                                      src={URL.createObjectURL(field.value)}
                                      alt="Xem trước giấy bảo hiểm xe"
                                      className="max-w-full max-h-full object-contain rounded-md"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                                      <FileText className="w-10 h-10 mb-2" />
                                      <span className="text-sm truncate max-w-[200px]">
                                        {field.value.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    form.setValue(
                                      'insuranceDocument',
                                      undefined,
                                      {
                                        shouldValidate: true,
                                      }
                                    )
                                  }}
                                  disabled={vehicleMutation.isPending}
                                >
                                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </Button>
                              </div>
                            ) : initialData?.insuranceDocument ? (
                              <div className="relative w-full h-full p-2">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  {isImageUrl(initialData.insuranceDocument) ? (
                                    <img
                                      src={initialData.insuranceDocument}
                                      alt="Giấy bảo hiểm xe hiện tại"
                                      className="max-w-full max-h-full object-contain rounded-md"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          '/placeholder-image.png'
                                      }}
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                                      <FileText className="w-10 h-10 mb-2" />
                                      <span className="text-sm truncate max-w-[200px]">
                                        Giấy bảo hiểm xe (PDF)
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    form.setValue(
                                      'insuranceDocument',
                                      undefined,
                                      {
                                        shouldValidate: true,
                                      }
                                    )
                                  }}
                                  disabled={vehicleMutation.isPending}
                                >
                                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                                <UploadCloud className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500" />
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                  <span className="font-medium text-purple-600 dark:text-purple-400">
                                    Nhấn để tải lên
                                  </span>{' '}
                                  hoặc kéo thả file
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  JPEG, PNG (tối đa 5MB)
                                </p>
                              </div>
                            )}
                            <input
                              id="insuranceDocument"
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  form.setValue('insuranceDocument', file, {
                                    shouldValidate: true,
                                  })
                                }
                              }}
                              accept="image/jpeg,image/png,application/pdf"
                              disabled={vehicleMutation.isPending}
                              aria-describedby="insuranceDocument-description"
                            />
                          </label>
                          <FormMessage className="text-red-500 text-sm" />
                        </div>
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  form.reset({
                    licensePlate: initialData?.plateNumber || '',
                    vehicleModel: initialData?.brand || '',
                    seats: initialData?.seats || 4,
                    vehicleRegistration: undefined,
                    insuranceDocument: undefined,
                  })
                }
                disabled={vehicleMutation.isPending}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Xóa form
              </Button>
              <Button
                type="submit"
                disabled={vehicleMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2"
              >
                {vehicleMutation.isPending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                      />
                    </svg>
                    Đang lưu...
                  </span>
                ) : isUpdating ? (
                  'Cập nhật thông tin phương tiện'
                ) : (
                  'Lưu thông tin phương tiện'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
