'use client'

import { RefObject, memo, useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Message {
  _id: string
  senderId: string
  content: string
  createdAt?: string
  sender?: {
    name: string
    avatar?: string
  }
}

interface ChatMessagesProps {
  messages: Message[]
  userId: string | null
  isMessagesLoading: boolean
  isMessagesError: boolean
  otherUserTyping: boolean
  scrollAreaRef: RefObject<HTMLDivElement | null>
  formatTimestamp: (timestamp?: string) => string
}

function ChatMessages({
  messages,
  userId,
  isMessagesLoading,
  isMessagesError,
  otherUserTyping,
  scrollAreaRef,
  formatTimestamp,
}: ChatMessagesProps) {
  const messageList = useMemo(() => {
    return messages.map((msg) => (
      <div
        key={msg._id}
        className={`flex ${
          msg.senderId === userId ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`flex max-w-[85%] lg:max-w-[75%] ${
            msg.senderId === userId ? 'flex-row-reverse' : 'flex-row'
          } items-end gap-2`}
        >
          {msg.senderId !== userId && (
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={msg.sender?.avatar} />
              <AvatarFallback className="bg-gray-200 text-gray-700">
                {msg.sender?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col gap-1">
            <div
              className={`rounded-2xl px-4 py-3 ${
                msg.senderId === userId
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : 'bg-white border rounded-tl-none shadow-sm'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                msg.senderId === userId ? 'justify-end' : 'justify-start'
              }`}
            >
              <span className="text-xs text-gray-500">
                {formatTimestamp(msg.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    ))
  }, [messages, userId, formatTimestamp])

  return (
    <div className="flex-1 p-0">
      {isMessagesLoading ? (
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              className={`h-16 w-3/4 rounded-lg ${
                i % 2 === 0 ? 'ml-auto' : 'mr-auto'
              }`}
            />
          ))}
        </div>
      ) : isMessagesError ? (
        <div className="p-4 text-red-500">Lỗi tải tin nhắn</div>
      ) : messages.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          Chưa có tin nhắn. Bắt đầu trò chuyện!
        </div>
      ) : (
        <ScrollArea
          className="h-[calc(100vh-200px)] p-4"
          ref={scrollAreaRef}
          aria-label="Tin nhắn"
        >
          <div className="space-y-4">
            {messageList}
            {otherUserTyping && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] items-start gap-2">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gray-200 text-gray-700">
                      U
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="bg-white border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm w-fit">
                      <div className="flex space-x-1.5">
                        <div
                          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">đang nhập...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

export default memo(ChatMessages)
