'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadButton } from '@/components/button/ButtonUpload'
import { ConfirmDialog } from '@/components/dialog/ConfirmDialog'
import { FcGoogle } from 'react-icons/fc'
import { getInitials } from '@/utils'
import { UserProfileForm } from '@/components/form/PersonInformationForm'

type AccountTabProps = {
  user: any
  isLoading: boolean
  handleUploadAvatar: (file: File) => void
}

export function AccountTab({
  user,
  isLoading,
  handleUploadAvatar,
}: AccountTabProps) {
  const fullName = user.name || 'Username'

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={fullName} />
              ) : (
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {getInitials(fullName)}
                </AvatarFallback>
              )}
            </Avatar>
            <UploadButton
              onUpload={handleUploadAvatar}
              isUploading={isLoading}
            />
          </div>
          <UserProfileForm
            initialValues={{
              name: user.name || '',
              phoneNumber: user.phoneNumber || '',
              dateOfBirth: user.dateOfBirth || '',
              bio: user.bio || '',
            }}
          />
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Email Address
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
            </div>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                user.isEmailVerified
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              }`}
            >
              {user.isEmailVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>

          {user.externalAccount && (
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-2">
                {user.externalAccount.provider === 'google' ? (
                  <FcGoogle className="text-xl" />
                ) : null}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Connected {user.externalAccount.provider} Account
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.externalAccount.emails[0]?.value}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
