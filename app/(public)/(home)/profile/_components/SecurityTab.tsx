'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TbLock } from 'react-icons/tb'
import { FaRegEdit } from 'react-icons/fa'
import { formatVietnamDateTime } from '@/utils'

type SecurityTabProps = {
  user: any
  setIsPasswordDialogOpen: (open: boolean) => void
}

export function SecurityTab({
  user,
  setIsPasswordDialogOpen,
}: SecurityTabProps) {
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Chưa từng'
    try {
      const isoDate = new Date(timestamp * 1000).toISOString()
      return formatVietnamDateTime(isoDate)
    } catch {
      return 'Không rõ'
    }
  }

  const hasPassword = user.password && user.password !== 'UNSET'
  const isOAuthUser = user.oauthProviders?.length > 0
  const lastPasswordUpdate =
    hasPassword && user.credentials?.passwordUpdatedAt
      ? formatDate(user.credentials.passwordUpdatedAt)
      : null

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Mật khẩu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPassword ? (
            <>
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <TbLock className="text-gray-600 dark:text-gray-300" />
                  <span className="text-gray-600 dark:text-gray-300">
                    ••••••••••
                  </span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setIsPasswordDialogOpen(true)}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                >
                  <FaRegEdit />
                </Button>
              </div>
              {lastPasswordUpdate && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span>Lần thay đổi cuối: </span>
                  <span>{lastPasswordUpdate}</span>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-center p-3 text-gray-700 dark:text-gray-300">
                {isOAuthUser
                  ? 'Đăng nhập bằng Google (chưa đặt mật khẩu)'
                  : 'Chưa đặt mật khẩu'}
              </div>
              <Button
                variant="link"
                onClick={() => setIsPasswordDialogOpen(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                + Đặt mật khẩu
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
