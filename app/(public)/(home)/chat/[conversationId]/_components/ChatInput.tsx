'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, SendHorizontal } from 'lucide-react'
import { UseMutateFunction } from '@tanstack/react-query'

interface ChatInputProps {
  newMessage: string
  setNewMessage: (value: string) => void
  isTyping: boolean
  handleTypingEvent: (typing: boolean) => void
  handleSendMessage: (e?: React.FormEvent) => void
  sendMessageMutation: {
    isPending: boolean
  }
}

export default function ChatInput({
  newMessage,
  setNewMessage,
  isTyping,
  handleTypingEvent,
  handleSendMessage,
  sendMessageMutation,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="border-t p-4 bg-white">
      <form
        onSubmit={handleSendMessage}
        className="flex w-full items-end gap-2 max-w-full"
      >
        <div className="flex-1 relative min-w-0">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTypingEvent(!!e.target.value)
            }}
            onBlur={() => handleTypingEvent(false)}
            onKeyDown={handleKeyDown}
            className="pr-10 min-h-[40px] rounded-full w-full"
            placeholder="Nhập tin nhắn..."
            disabled={sendMessageMutation.isPending}
            aria-label="Nhập tin nhắn"
          />
          {isTyping && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-1">
              <div
                className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          )}
        </div>
        <Button
          type="submit"
          size="icon"
          className="rounded-full h-10 w-10 flex-shrink-0"
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
        >
          {sendMessageMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  )
}
