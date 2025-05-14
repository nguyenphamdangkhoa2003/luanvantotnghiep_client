import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { X, UploadCloud } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

interface VehicleInfoSectionProps {
  isSubmitting?: boolean
  onFileUpload?: (fieldName: string, file: File) => void
  onClearFile?: (fieldName: string) => void
}

export function VehicleInfoSection({
  isSubmitting = false,
  onFileUpload,
  onClearFile,
}: VehicleInfoSectionProps) {
  const form = useFormContext()

  const handleFileUpload = (fieldName: string, file: File) => {
    if (onFileUpload) {
      onFileUpload(fieldName, file)
    } else {
      form.setValue(fieldName, file, { shouldValidate: true })
    }
  }

  const handleClearFile = (fieldName: string) => {
    if (onClearFile) {
      onClearFile(fieldName)
    } else {
      form.setValue(fieldName, undefined, { shouldValidate: true })
    }
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="bg-gray-50 px-6 py-4 border-b">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Thông tin phương tiện
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            name="licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Biển số xe</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập biển số xe"
                    {...field}
                    disabled={isSubmitting}
                    className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />
          <FormField
            name="vehicleModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Mẫu xe</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập mẫu xe"
                    {...field}
                    disabled={isSubmitting}
                    className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="vehicleRegistration"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="space-y-2">
                <FormLabel className="text-gray-700">Giấy đăng ký xe</FormLabel>
                <FormDescription className="text-gray-500 text-sm">
                  Tải lên ảnh rõ nét của giấy đăng ký xe (JPEG, PNG hoặc PDF)
                </FormDescription>
                <FormControl>
                  <div className="space-y-2">
                    <label
                      htmlFor="vehicleRegistration"
                      className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        fieldState.error
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 hover:border-primary bg-gray-50'
                      }`}
                    >
                      {field.value ? (
                        <div className="relative w-full h-full p-2">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <img
                              src={URL.createObjectURL(field.value)}
                              alt="Xem trước giấy đăng ký xe"
                              className="max-w-full max-h-full object-contain rounded-md"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full shadow-sm"
                            onClick={(e) => {
                              e.preventDefault()
                              handleClearFile('vehicleRegistration')
                            }}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </Button>
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
                        id="vehicleRegistration"
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload('vehicleRegistration', file)
                          }
                        }}
                        accept="image/jpeg,image/png,application/pdf"
                        disabled={isSubmitting}
                      />
                    </label>
                    <FormMessage className="text-red-500 text-sm" />
                  </div>
                </FormControl>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
