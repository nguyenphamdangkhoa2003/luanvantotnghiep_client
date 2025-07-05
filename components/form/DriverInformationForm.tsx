'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Loader2,
  UploadCloud,
  X,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadDocumentMutationFn } from '@/api/users/user'
import { Badge } from '@/components/ui/badge'
import { AxiosResponse } from 'axios'
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'

// Define type for uploadDocumentMutationFn parameters
type UploadDocumentType = {
  type: 'identityDocument' | 'driverLicense'
  documentNumber: string
  frontFile: File
  backFile: File
}

// Schema validation for identity document
const identitySchema = z.object({
  idNumber: z.string().min(1, 'Số giấy tờ tùy thân là bắt buộc'),
  idFrontImage: z.instanceof(File, {
    message: 'Hình ảnh mặt trước giấy tờ tùy thân là bắt buộc',
  }),
  idBackImage: z.instanceof(File, {
    message: 'Hình ảnh mặt sau giấy tờ tùy thân là bắt buộc',
  }),
})

// Schema validation for driver license
const licenseSchema = z.object({
  licenseNumber: z.string().min(1, 'Số giấy phép lái xe là bắt buộc'),
  licenseFrontImage: z.instanceof(File, {
    message: 'Hình ảnh mặt trước giấy phép lái xe là bắt buộc',
  }),
  licenseBackImage: z.instanceof(File, {
    message: 'Hình ảnh mặt sau giấy phép lái xe là bắt buộc',
  }),
})

type IdentityFormValues = z.infer<typeof identitySchema>
type LicenseFormValues = z.infer<typeof licenseSchema>

type DriverInfoFormProps = {
  userData: {
    identityDocument?: {
      documentNumber: string
      frontImage: string
      backImage: string
      verificationStatus: 'pending' | 'approved' | 'rejected'
    }
    driverLicense?: {
      licenseNumber: string
      frontImage: string
      backImage: string
      verificationStatus: 'pending' | 'approved' | 'rejected'
    }
  }
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<AxiosResponse<any, any>, Error>>
}

export function DriverInfoForm({ userData, refetch }: DriverInfoFormProps) {
  const queryClient = useQueryClient()

  // Form for identity document
  const identityForm = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      idNumber: userData.identityDocument?.documentNumber || '',
      idFrontImage: undefined,
      idBackImage: undefined,
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  // Form for driver license
  const licenseForm = useForm<LicenseFormValues>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      licenseNumber: userData.driverLicense?.licenseNumber || '',
      licenseFrontImage: undefined,
      licenseBackImage: undefined,
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  // Update forms only when necessary
  useEffect(() => {
    // Only update idNumber if it has changed to preserve form state
    if (
      userData.identityDocument?.documentNumber !==
      identityForm.getValues('idNumber')
    ) {
      identityForm.setValue(
        'idNumber',
        userData.identityDocument?.documentNumber || '',
        {
          shouldValidate: false,
        }
      )
    }
    if (
      userData.driverLicense?.licenseNumber !==
      licenseForm.getValues('licenseNumber')
    ) {
      licenseForm.setValue(
        'licenseNumber',
        userData.driverLicense?.licenseNumber || '',
        {
          shouldValidate: false,
        }
      )
    }
  }, [userData, identityForm, licenseForm])

  // Mutation for identity document upload
  const uploadIdentityMutation = useMutation({
    mutationFn: uploadDocumentMutationFn,
    onError: (error) => {
      toast.error(error.message || 'Tải lên giấy tờ tùy thân thất bại.')
    },
    onSuccess: async () => {
      toast.success('Gửi giấy tờ tùy thân thành công.')
      queryClient.invalidateQueries({ queryKey: ['user'] })
      await refetch()
      identityForm.reset({
        idNumber: userData.identityDocument?.documentNumber || '',
        idFrontImage: undefined,
        idBackImage: undefined,
      })
    },
  })

  // Mutation for driver license upload
  const uploadLicenseMutation = useMutation({
    mutationFn: uploadDocumentMutationFn,
    onError: (error) => {
      toast.error(error.message || 'Tải lên giấy phép lái xe thất bại.')
    },
    onSuccess: async () => {
      toast.success('Gửi giấy phép lái xe thành công.')
      queryClient.invalidateQueries({ queryKey: ['user'] })
      await refetch()
      licenseForm.reset({
        licenseNumber: userData.driverLicense?.licenseNumber || '',
        licenseFrontImage: undefined,
        licenseBackImage: undefined,
      })
    },
  })

  // Handle file upload for identity form
  const handleIdentityFileUpload = async (
    fieldName: keyof IdentityFormValues,
    file: File
  ) => {
    try {
      const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedMimes.includes(file.type)) {
        throw new Error('Chỉ chấp nhận file JPEG, PNG hoặc PDF')
      }
      identityForm.setValue(fieldName, file, { shouldValidate: true })
    } catch (error: any) {
      identityForm.setError(fieldName, {
        type: 'manual',
        message: error.message || 'Xử lý file thất bại',
      })
    }
  }

  // Handle file upload for license form
  const handleLicenseFileUpload = async (
    fieldName: keyof LicenseFormValues,
    file: File
  ) => {
    try {
      const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedMimes.includes(file.type)) {
        throw new Error('Chỉ chấp nhận file JPEG, PNG hoặc PDF')
      }
      licenseForm.setValue(fieldName, file, { shouldValidate: true })
    } catch (error: any) {
      licenseForm.setError(fieldName, {
        type: 'manual',
        message: error.message || 'Xử lý file thất bại',
      })
    }
  }

  // Handle submit identity documents
  async function handleSubmitIdentity(values: IdentityFormValues) {
    try {
      await uploadIdentityMutation.mutateAsync({
        type: 'identityDocument',
        documentNumber: values.idNumber,
        frontFile: values.idFrontImage,
        backFile: values.idBackImage,
      })
    } catch (error) {
      // Error handled in mutation onError
    }
  }

  // Handle submit driver license
  async function handleSubmitLicense(values: LicenseFormValues) {
    try {
      await uploadLicenseMutation.mutateAsync({
        type: 'driverLicense',
        documentNumber: values.licenseNumber,
        frontFile: values.licenseFrontImage,
        backFile: values.licenseBackImage,
      })
    } catch (error) {
      // Error handled in mutation onError
    }
  }

  const isSubmittingIdentity = uploadIdentityMutation.isPending
  const isSubmittingLicense = uploadLicenseMutation.isPending

  const renderVerificationStatus = (
    status: 'pending' | 'approved' | 'rejected'
  ) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <Check className="w-4 h-4 mr-1" />
            Đã xác minh
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Đang chờ xác minh
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-4 h-4 mr-1" />
            Xác minh thất bại
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Personal Identification Section */}
      <Form {...identityForm}>
        <form
          onSubmit={identityForm.handleSubmit(handleSubmitIdentity)}
          className="space-y-6"
        >
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Thông tin giấy tờ tùy thân
                </CardTitle>
                {userData.identityDocument && (
                  <div>
                    {renderVerificationStatus(
                      userData.identityDocument.verificationStatus
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField
                control={identityForm.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      Số giấy tờ tùy thân
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập số giấy tờ tùy thân"
                        {...field}
                        disabled={isSubmittingIdentity}
                        className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={identityForm.control}
                  name="idFrontImage"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel className="text-gray-700">
                          Mặt trước giấy tờ
                        </FormLabel>
                        <FormDescription className="text-gray-500 text-sm">
                          Tải lên ảnh rõ nét của mặt trước
                        </FormDescription>
                        <FormControl>
                          <div className="space-y-2">
                            <label
                              htmlFor="idFrontImage"
                              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                fieldState.error
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-300 hover:border-primary bg-gray-50'
                              } ${
                                isSubmittingIdentity
                                  ? 'pointer-events-none'
                                  : ''
                              }`}
                            >
                              {field.value ? (
                                <div className="relative w-full h-full p-2">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                      src={URL.createObjectURL(field.value)}
                                      alt="Xem trước mặt trước giấy tờ"
                                      className="max-w-full max-h-full object-contain rounded-md"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      identityForm.resetField('idFrontImage')
                                    }}
                                  >
                                    <X className="w-4 h-4 text-gray-600" />
                                  </button>
                                </div>
                              ) : userData.identityDocument?.frontImage ? (
                                <div className="relative w-full h-full p-2">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                      src={userData.identityDocument.frontImage}
                                      alt="Ảnh mặt trước giấy tờ đã tải lên"
                                      className="max-w-full max-h-full object-contain rounded-md"
                                    />
                                  </div>
                                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    Đã tải lên
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                                  <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                                  <p className="text-sm text-gray-500 text-center">
                                    <span className="font-medium text-primary">
                                      Nhấn để tải lên
                                    </span>{' '}
                                    hoặc kéo thả file vào đây
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Định dạng: JPEG, PNG, PDF
                                  </p>
                                </div>
                              )}
                              <input
                                id="idFrontImage"
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handleIdentityFileUpload(
                                      'idFrontImage',
                                      file
                                    )
                                  }
                                }}
                                accept="image/jpeg,image/png,application/pdf"
                                disabled={isSubmittingIdentity}
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
                  control={identityForm.control}
                  name="idBackImage"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel className="text-gray-700">
                          Mặt sau giấy tờ
                        </FormLabel>
                        <FormDescription className="text-gray-500 text-sm">
                          Tải lên ảnh rõ nét của mặt sau
                        </FormDescription>
                        <FormControl>
                          <div className="space-y-2">
                            <label
                              htmlFor="idBackImage"
                              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                fieldState.error
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-300 hover:border-primary bg-gray-50'
                              } ${
                                isSubmittingIdentity
                                  ? 'pointer-events-none'
                                  : ''
                              }`}
                            >
                              {field.value ? (
                                <div className="relative w-full h-full p-2">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                      src={URL.createObjectURL(field.value)}
                                      alt="Xem trước mặt sau giấy tờ"
                                      className="max-w-full max-h-full object-contain rounded-md"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      identityForm.resetField('idBackImage')
                                    }}
                                  >
                                    <X className="w-4 h-4 text-gray-600" />
                                  </button>
                                </div>
                              ) : userData.identityDocument?.backImage ? (
                                <div className="relative w-full h-full p-2">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                      src={userData.identityDocument.backImage}
                                      alt="Ảnh mặt sau giấy tờ đã tải lên"
                                      className="max-w-full max-h-full object-contain rounded-md"
                                    />
                                  </div>
                                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    Đã tải lên
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                                  <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                                  <p className="text-sm text-gray-500 text-center">
                                    <span className="font-medium text-primary">
                                      Nhấn để tải lên
                                    </span>{' '}
                                    hoặc kéo thả file vào đây
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Định dạng: JPEG, PNG, PDF
                                  </p>
                                </div>
                              )}
                              <input
                                id="idBackImage"
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handleIdentityFileUpload(
                                      'idBackImage',
                                      file
                                    )
                                  }
                                }}
                                accept="image/jpeg,image/png,application/pdf"
                                disabled={isSubmittingIdentity}
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

              {(!userData.identityDocument ||
                userData.identityDocument.verificationStatus !==
                  'approved') && (
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmittingIdentity}
                    className="px-8 py-3 text-base font-medium bg-primary hover:bg-primary-dark shadow-sm"
                  >
                    {isSubmittingIdentity ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi xác minh giấy tờ'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Driver License Section */}
      <Form {...licenseForm}>
        <form
          onSubmit={licenseForm.handleSubmit(handleSubmitLicense)}
          className="space-y-6"
        >
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Giấy phép lái xe
                </CardTitle>
                {userData.driverLicense && (
                  <div>
                    {renderVerificationStatus(
                      userData.driverLicense.verificationStatus
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField
                control={licenseForm.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      Số giấy phép lái xe
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập số giấy phép lái xe"
                        {...field}
                        disabled={isSubmittingLicense}
                        className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={licenseForm.control}
                  name="licenseFrontImage"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel className="text-gray-700">
                          Mặt trước giấy phép lái xe
                        </FormLabel>
                        <FormDescription className="text-gray-500 text-sm">
                          Tải lên ảnh rõ nét của mặt trước
                        </FormDescription>
                        <FormControl>
                          <div className="space-y-2">
                            <label
                              htmlFor="licenseFrontImage"
                              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                fieldState.error
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-300 hover:border-primary bg-gray-50'
                              } ${
                                isSubmittingLicense ? 'pointer-events-none' : ''
                              }`}
                            >
                              {field.value ? (
                                <div className="relative w-full h-full p-2">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                      src={URL.createObjectURL(field.value)}
                                      alt="Xem trước mặt trước giấy phép lái xe"
                                      className="max-w-full max-h-full object-contain rounded-md"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      licenseForm.resetField(
                                        'licenseFrontImage'
                                      )
                                    }}
                                  >
                                    <X className="w-4 h-4 text-gray-600" />
                                  </button>
                                </div>
                              ) : userData.driverLicense?.frontImage ? (
                                <div className="relative w-full h-full p-2">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                      src={userData.driverLicense.frontImage}
                                      alt="Ảnh mặt trước giấy phép lái xe đã tải lên"
                                      className="max-w-full max-h-full object-contain rounded-md"
                                    />
                                  </div>
                                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    Đã tải lên
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                                  <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                                  <p className="text-sm text-gray-500 text-center">
                                    <span className="font-medium text-primary">
                                      Nhấn để tải lên
                                    </span>{' '}
                                    hoặc kéo thả file vào đây
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Định dạng: JPEG, PNG, PDF
                                  </p>
                                </div>
                              )}
                              <input
                                id="licenseFrontImage"
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handleLicenseFileUpload(
                                      'licenseFrontImage',
                                      file
                                    )
                                  }
                                }}
                                accept="image/jpeg,image/png,application/pdf"
                                disabled={isSubmittingLicense}
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
                  control={licenseForm.control}
                  name="licenseBackImage"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel className="text-gray-700">
                          Mặt sau giấy phép lái xe
                        </FormLabel>
                        <FormDescription className="text-gray-500 text-sm">
                          Tải lên ảnh rõ nét của mặt sau
                        </FormDescription>
                        <FormControl>
                          <div className="space-y-2">
                            <label
                              htmlFor="licenseBackImage"
                              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                fieldState.error
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-300 hover:border-primary bg-gray-50'
                              } ${
                                isSubmittingLicense ? 'pointer-events-none' : ''
                              }`}
                            >
                              {field.value ? (
                                <div className="relative w-full h-full p-2">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                      src={URL.createObjectURL(field.value)}
                                      alt="Xem trước mặt sau giấy phép lái xe"
                                      className="max-w-full max-h-full object-contain rounded-md"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      licenseForm.resetField('licenseBackImage')
                                    }}
                                  >
                                    <X className="w-4 h-4 text-gray-600" />
                                  </button>
                                </div>
                              ) : userData.driverLicense?.backImage ? (
                                <div className="relative w-full h-full p-2">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                      src={userData.driverLicense.backImage}
                                      alt="Ảnh mặt sau giấy phép lái xe đã tải lên"
                                      className="max-w-full max-h-full object-contain rounded-md"
                                    />
                                  </div>
                                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    Đã tải lên
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                                  <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                                  <p className="text-sm text-gray-500 text-center">
                                    <span className="font-medium text-primary">
                                      Nhấn để tải lên
                                    </span>{' '}
                                    hoặc kéo thả file vào đây
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Định dạng: JPEG, PNG, PDF
                                  </p>
                                </div>
                              )}
                              <input
                                id="licenseBackImage"
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handleLicenseFileUpload(
                                      'licenseBackImage',
                                      file
                                    )
                                  }
                                }}
                                accept="image/jpeg,image/png,application/pdf"
                                disabled={isSubmittingLicense}
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

              {(!userData.driverLicense ||
                userData.driverLicense.verificationStatus !== 'approved') && (
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmittingLicense}
                    className="px-8 py-3 text-base font-medium bg-primary hover:bg-primary-dark shadow-sm"
                  >
                    {isSubmittingLicense ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi xác minh giấy phép'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
