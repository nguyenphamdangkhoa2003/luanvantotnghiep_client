import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  UploadCloud,
  X,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { uploadDocumentMutationFn } from '@/api/users/user';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';

// Schema validation
export const formSchema = z.object({
  idFrontImage: z
    .instanceof(File, {
      message: 'Hình ảnh mặt trước giấy tờ tùy thân là bắt buộc',
    })
    .optional(),
  idBackImage: z
    .instanceof(File, {
      message: 'Hình ảnh mặt sau giấy tờ tùy thân là bắt buộc',
    })
    .optional(),
  licenseFrontImage: z
    .instanceof(File, {
      message: 'Hình ảnh mặt trước giấy phép lái xe là bắt buộc',
    })
    .optional(),
  licenseBackImage: z
    .instanceof(File, {
      message: 'Hình ảnh mặt sau giấy phép lái xe là bắt buộc',
    })
    .optional(),
  idNumber: z.string().min(1, 'Số giấy tờ tùy thân là bắt buộc'),
  licenseNumber: z.string().min(1, 'Số giấy phép lái xe là bắt buộc'),
});

type DriverInfoFormProps = {
  userData: {
    identityDocument?: {
      documentNumber: string
      frontImage: string
      backImage: string
      verificationStatus: 'pending' | 'verified' | 'rejected'
    }
    driverLicense?: {
      licenseNumber: string
      frontImage: string
      backImage: string
      verificationStatus: 'pending' | 'verified' | 'rejected'
    }
  }
  refetch: () => Promise<void>
}

export function DriverInfoForm({ userData, refetch }: DriverInfoFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idNumber: userData.identityDocument?.documentNumber || '',
      licenseNumber: userData.driverLicense?.licenseNumber || '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  useEffect(() => {
    form.reset({
      idNumber: userData.identityDocument?.documentNumber || '',
      licenseNumber: userData.driverLicense?.licenseNumber || '',
    });
  }, [userData, form]);

  // Mutation for identity document upload
  const uploadIdentityMutation = useMutation({
    mutationFn: uploadDocumentMutationFn,
    onError: (error) => {
      toast.error(error.message || 'Tải lên giấy tờ tùy thân thất bại.');
    },
    onSuccess: async () => {
      toast.success('Gửi giấy tờ tùy thân thành công.');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      await refetch();
    },
  });

  // Mutation for driver license upload
  const uploadLicenseMutation = useMutation({
    mutationFn: uploadDocumentMutationFn,
    onError: (error) => {
      toast.error(error.message || 'Tải lên giấy phép lái xe thất bại.');
    },
    onSuccess: async () => {
      toast.success('Gửi giấy phép lái xe thành công.');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      await refetch();
    },
  });

  const handleFileUpload = async (
    fieldName: keyof z.infer<typeof formSchema>,
    file: File
  ) => {
    try {
      const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedMimes.includes(file.type)) {
        throw new Error('Chỉ chấp nhận file JPEG, PNG hoặc PDF');
      }
      form.setValue(fieldName, file, { shouldValidate: true });
    } catch (error: any) {
      form.setError(fieldName, {
        type: 'manual',
        message: error.message || 'Xử lý file thất bại',
      });
    }
  };

  // Handle submit identity documents
  async function handleSubmitIdentity(values: z.infer<typeof formSchema>) {
    try {
      if (!values.idFrontImage || !values.idBackImage) {
        throw new Error('Vui lòng tải lên cả 2 mặt giấy tờ');
      }
      
      await uploadIdentityMutation.mutateAsync({
        type: 'identityDocument',
        documentNumber: values.idNumber,
        frontFile: values.idFrontImage,
        backFile: values.idBackImage,
      });
    } catch (error) {
      // Error handled in mutation onError
    }
  }

  // Handle submit driver license
  async function handleSubmitLicense(values: z.infer<typeof formSchema>) {
    try {
      if (!values.licenseFrontImage || !values.licenseBackImage) {
        throw new Error('Vui lòng tải lên cả 2 mặt giấy phép lái xe');
      }
      
      await uploadLicenseMutation.mutateAsync({
        type: 'driverLicense',
        documentNumber: values.licenseNumber,
        frontFile: values.licenseFrontImage,
        backFile: values.licenseBackImage,
      });
    } catch (error) {
      // Error handled in mutation onError
    }
  }

  const isSubmittingIdentity = uploadIdentityMutation.isPending;
  const isSubmittingLicense = uploadLicenseMutation.isPending;

  const renderVerificationStatus = (
    status: 'pending' | 'verified' | 'rejected'
  ) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800">
            <Check className="w-4 h-4 mr-1" />
            Đã xác minh
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Đang chờ xác minh
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-4 h-4 mr-1" />
            Xác minh thất bại
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Personal Identification Section */}
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
              control={form.control}
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
                      disabled={
                        isSubmittingIdentity ||
                        userData.identityDocument?.verificationStatus ===
                          'verified'
                      }
                      className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
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
                              userData.identityDocument?.verificationStatus ===
                              'verified'
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
                                    e.stopPropagation();
                                    form.resetField('idFrontImage');
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
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload('idFrontImage', file);
                                }
                              }}
                              accept="image/jpeg,image/png,application/pdf"
                              disabled={
                                isSubmittingIdentity ||
                                userData.identityDocument
                                  ?.verificationStatus === 'verified'
                              }
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
                              userData.identityDocument?.verificationStatus ===
                              'verified'
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
                                    e.stopPropagation();
                                    form.resetField('idBackImage');
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
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload('idBackImage', file);
                                }
                              }}
                              accept="image/jpeg,image/png,application/pdf"
                              disabled={
                                isSubmittingIdentity ||
                                userData.identityDocument
                                  ?.verificationStatus === 'verified'
                              }
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
              userData.identityDocument.verificationStatus !== 'verified') && (
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={form.handleSubmit(handleSubmitIdentity)}
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

        {/* Driver License Section */}
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
              control={form.control}
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
                      disabled={
                        isSubmittingLicense ||
                        userData.driverLicense?.verificationStatus ===
                          'verified'
                      }
                      className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
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
                              userData.driverLicense?.verificationStatus ===
                              'verified'
                                ? 'pointer-events-none'
                                : ''
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
                                    e.stopPropagation();
                                    form.resetField('licenseFrontImage');
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
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload('licenseFrontImage', file);
                                }
                              }}
                              accept="image/jpeg,image/png,application/pdf"
                              disabled={
                                isSubmittingLicense ||
                                userData.driverLicense?.verificationStatus ===
                                  'verified'
                              }
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
                              userData.driverLicense?.verificationStatus ===
                              'verified'
                                ? 'pointer-events-none'
                                : ''
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
                                    e.stopPropagation();
                                    form.resetField('licenseBackImage');
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
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload('licenseBackImage', file);
                                }
                              }}
                              accept="image/jpeg,image/png,application/pdf"
                              disabled={
                                isSubmittingLicense ||
                                userData.driverLicense?.verificationStatus ===
                                  'verified'
                              }
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
              userData.driverLicense.verificationStatus !== 'verified') && (
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={form.handleSubmit(handleSubmitLicense)}
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
  );
}