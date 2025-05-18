// components/user/ProfileTab.tsx
import { UserType } from '@/context/auth-provider'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FaRegEdit } from 'react-icons/fa'
import { MdOutlineVerified } from 'react-icons/md'
import { CiMail, CiPhone } from 'react-icons/ci'
import { FaBirthdayCake } from 'react-icons/fa'

interface ProfileTabProps {
  userData: UserType
}

export default function ProfileTab({ userData }: ProfileTabProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userData.avatar} alt={userData.name} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {userData.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">{userData.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  @{userData.username}
                </span>
                {userData.isEmailVerified && (
                  <MdOutlineVerified className="text-green-500" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                User ID: {userData._id}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CiMail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{userData.email}</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CiPhone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">
                  {userData.phoneNumber || 'Not provided'}
                </p>
              </div>
            </div>

            {/* Birth Date */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FaBirthdayCake className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Birth Date</p>
                <p className="font-medium">
                  {userData.dateOfBirth
                    ? formatDate(userData.dateOfBirth)
                    : 'Not provided'}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="h-5 w-5 flex items-center justify-center">
                <span className="text-muted-foreground">👑</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{userData.role}</p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Additional Sections */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Account Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center p-3">
            <div>
              <p className="font-medium">Email Verification</p>
              <p className="text-sm text-muted-foreground">
                {userData.isEmailVerified ? 'Verified' : 'Not verified'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {userData.isEmailVerified ? (
                <MdOutlineVerified className="text-green-500" />
              ) : (
                <Button variant="outline" size="sm">
                  Verify
                </Button>
              )}
            </div>
          </div>

          
        </CardContent>
      </Card>
    </div>
  )
}
