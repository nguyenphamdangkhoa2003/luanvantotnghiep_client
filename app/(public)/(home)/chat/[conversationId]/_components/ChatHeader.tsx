'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'

interface ChatHeaderProps {
  user: { _id?: string; name?: string; avatar?: string; role?: string } | null
  isConnected: boolean
  onConfirmBooking: () => void
  onCancelBooking: () => void
  hasTripConfirmation: boolean
}

export default function ChatHeader({
  user,
  isConnected,
  onConfirmBooking,
  onCancelBooking,
  hasTripConfirmation,
}: ChatHeaderProps) {
  return (
    <div className="border-b p-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">Trò chuyện</h2>
            <p className="text-sm text-gray-500">
              {isConnected ? 'Trực tuyến' : 'Đang kết nối...'}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={onConfirmBooking}
              disabled={!hasTripConfirmation}
            >
              Xác nhận đặt xe
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onCancelBooking}
              className="text-red-600 focus:text-red-600"
            >
              Hủy đặt xe
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
