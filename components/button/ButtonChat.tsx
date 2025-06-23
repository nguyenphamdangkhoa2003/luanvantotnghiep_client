'use client'

import { useRouter } from 'next/navigation'
import { MessageSquare, MessageCircle, MessagesSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export default function ChatFloatButton() {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isHovered, setIsHovered] = useState(false)




  const handleClick = () => {
    router.push('/messages')
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 transition-all duration-300 ease-in-out z-50',
      )}
    >
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative group flex items-center justify-center',
          'bg-primary',
          'text-white p-2.5 rounded-full shadow-xl',
          'hover:shadow-2xl hover:scale-105',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'transition-all duration-200 transform',
          'h-10 w-10' 
        )}
        aria-label="Open conversations"
      >
        {/* Icon chính */}
        <MessagesSquare
          className={cn(
            'h-10 w-10 transition-all duration-200',
            isHovered ? 'scale-110' : 'scale-100'
          )}
        />

        {/* Badge thông báo */}
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-1 -right-1',
              'flex items-center justify-center',
              'bg-red-500 text-white text-xs font-bold',
              'rounded-full h-5 w-5',
              'ring-2 ring-white',
              'animate-pulse'
            )}
          >
            {unreadCount}
          </span>
        )}

        {/* Tooltip */}
        <div
          className={cn(
            'absolute right-full mr-3 px-2 py-1',
            'bg-gray-800 text-white text-sm font-medium',
            'rounded-md shadow-lg',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity duration-200',
            'whitespace-nowrap'
          )}
        >
          Tin nhắn
          <div className="absolute top-1/2 right-0 w-2 h-2 -mr-1 transform -translate-y-1/2 rotate-45 bg-gray-800"></div>
        </div>
      </button>
    </div>
  )
}
