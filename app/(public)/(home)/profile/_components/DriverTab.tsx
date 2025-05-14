'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DriverInfoForm } from '@/components/form/DriverInformationForm'

type DriverTabProps = {
  user: any
  refetchData:any
}

export function DriverTab({ user, refetchData }: DriverTabProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
          🚗 Thông tin tài xế
        </CardTitle>
      </CardHeader>
      <CardContent>
        {user.identityVerified === 'VERIFIED' ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Card CCCD */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                  Căn cước công dân
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="h-fit bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Ảnh chân dung
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.idPortraitImage ? (
                        <img
                          src={user.idPortraitImage}
                          alt="Ảnh CCCD"
                          className="w-full h-auto rounded-md border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="text-gray-600 dark:text-gray-400">
                          Không có ảnh
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <div className="md:col-span-2 space-y-4">
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Số CCCD
                          </p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {user.extractedIdNumber || 'Chưa có dữ liệu'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Họ và tên
                          </p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {user.extractedFullName || 'Chưa có dữ liệu'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ngày sinh
                          </p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {user.extractedDob || 'Chưa có dữ liệu'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Giới tính
                          </p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {user.extractedGender || 'Chưa có dữ liệu'}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Địa chỉ
                          </p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {user.extractedAddress || 'Chưa có dữ liệu'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Card GPLX */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                  Giấy phép lái xe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Số GPLX
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.extractedLicenseNumber || 'Chưa có dữ liệu'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Hạng
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.extractedLicenseClass || 'Chưa có dữ liệu'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ngày cấp
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.extractedLicenseIssueDate || 'Chưa có dữ liệu'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ngày hết hạn
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.extractedLicenseExpiryDate || 'Chưa có dữ liệu'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nơi cấp
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.extractedLicensePlace || 'Chưa có dữ liệu'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
            {/* Card Đăng ký xe */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                  Đăng ký xe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Biển số xe
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.extractedPlateNumber || 'Chưa có dữ liệu'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Chủ xe
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.extractedVehicleOwner || 'Chưa có dữ liệu'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Loại xe
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.extractedVehicleType || 'Chưa có dữ liệu'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nhãn hiệu
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.extractedVehicleBrand || 'Chưa có dữ liệu'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Số khung
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.extractedVehicleChassisNumber ||
                          'Chưa có dữ liệu'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Số máy
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.extractedVehicleEngineNumber || 'Chưa có dữ liệu'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ngày đăng ký
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.extractedVehicleRegistrationDate ||
                          'Chưa có dữ liệu'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        ) : (
          <DriverInfoForm userData={user} refetch={refetchData} />
        )}
      </CardContent>
    </Card>
  )
}
