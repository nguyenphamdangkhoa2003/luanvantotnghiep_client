'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePusher } from '@/hooks/usePusher'
import { useAuthContext } from '@/context/auth-provider'
import {
  fetchMessages,
  sendMessage,
  sendTypingEvent,
  markMessageAsRead,
} from '@/api/chat/chat'
import { use } from 'react'
import { debounce } from 'lodash'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Check, SendHorizontal } from 'lucide-react'
import { format, isValid } from 'date-fns'

interface Message {
  _id: string
  conversationId: string
  senderId: string
  content: string
  isRead: boolean
  timestamp: string
  sender?: {
    name: string
    avatar?: string
  }
}

interface FetchMessagesResponse {
  messages: Message[]
  requestId: string
}

interface Props {
  params: Promise<{ conversationId: string }>
}

export default function ChatPage({ params }: Props) {
  const { conversationId } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const {
    user,
    isLoading: isAuthLoading,
    isFetching,
    isSuccess,
  } = useAuthContext()
  const queryClient = useQueryClient()

  // Set userId from auth context and prevent redirect loop
  useEffect(() => {
    console.log('ChatPage AuthContext state:', {
      user,
      isAuthLoading,
      isFetching,
      isSuccess,
    })
    if (isAuthLoading || isFetching || !isSuccess) {
      console.log('Waiting for auth to complete')
      return
    }
    if (!user?._id && window.location.pathname !== '/sign-in') {
      console.warn('No user ID, redirecting to /sign-in')
      router.replace('/sign-in')
      return
    }
    if (user?._id) {
      console.log('Setting userId:', user._id)
      setUserId(user._id)
    }
  }, [user, isAuthLoading, isFetching, isSuccess, router])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, otherUserTyping])

  // Fetch messages using TanStack Query
  const {
    data: fetchedMessagesResponse,
    isLoading,
    isError,
  } = useQuery<FetchMessagesResponse>({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: !!conversationId && !!userId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  // Handle fetched messages
  useEffect(() => {
    if (!fetchedMessagesResponse || !userId || !conversationId) {
      console.warn('Skipping message handling: missing data', {
        fetchedMessagesResponse: !!fetchedMessagesResponse,
        userId,
        conversationId,
      })
      return
    }
    console.log('Fetched messages:', fetchedMessagesResponse.messages)
    console.log('Request ID:', fetchedMessagesResponse.requestId)
    setMessages(fetchedMessagesResponse.messages)
    const unreadMessages = fetchedMessagesResponse.messages
      .filter((msg) => msg.senderId !== userId && !msg.isRead)
      .map((msg) => msg._id)
    console.log('Unread messages to mark as read:', unreadMessages)
    if (unreadMessages.length > 0) {
      markAsReadMutation.mutate({
        conversationId,
        messageIds: unreadMessages,
      })
    } else {
      console.log('No unread messages to mark')
    }
  }, [fetchedMessagesResponse, conversationId, userId])

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string
      content: string
    }) => {
      if (!conversationId || !content) {
        throw new Error('Missing conversationId or content in sendMessage')
      }
      return sendMessage(conversationId, content)
    },
    onSuccess: () => {
      console.log('Message sent successfully')
      setNewMessage('')
      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      })
    },
    onError: (error: any) => {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    },
  })

  const typingMutation = useMutation({
    mutationFn: ({
      conversationId,
      isTyping,
    }: {
      conversationId: string
      isTyping: boolean
    }) => {
      if (!conversationId || typeof isTyping !== 'boolean') {
        throw new Error(
          'Missing or invalid conversationId or isTyping in typingMutation'
        )
      }
      return sendTypingEvent(conversationId, isTyping)
    },
    onError: (error: any) => {
      console.error('Error sending typing event:', error)
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: ({
      conversationId,
      messageIds,
    }: {
      conversationId: string
      messageIds: string | string[]
    }) => {
      if (!conversationId || !messageIds) {
        throw new Error(
          'Missing conversationId or messageIds in markAsReadMutation'
        )
      }
      console.log('Marking as read:', { conversationId, messageIds })
      if (Array.isArray(messageIds)) {
        return Promise.all(
          messageIds.map((messageId) =>
            markMessageAsRead(conversationId, messageId)
          )
        )
      }
      return markMessageAsRead(conversationId, messageIds)
    },
    onSuccess: () => {
      console.log('Successfully marked message(s) as read')
      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      })
    },
    onError: (error: any) => {
      console.error('Error marking message as read:', error)
      if (
        error?.response?.status === 401 &&
        typeof window !== 'undefined' &&
        window.location.pathname !== '/sign-in'
      ) {
        console.log('401 error detected, redirecting to /sign-in')
        router.replace('/sign-in')
      }
    },
  })

  // Memoize Pusher event handlers
  const handleNewMessage = useCallback(
    (message: Message) => {
      console.log('New message received via Pusher:', message)
      setMessages((prev) => {
        const messageIds = new Set(prev.map((msg) => msg._id))
        if (messageIds.has(message._id)) return prev
        return [...prev, message]
      })
      queryClient.setQueryData(
        ['messages', conversationId],
        (old: FetchMessagesResponse | undefined) => {
          if (old?.messages.some((msg) => msg._id === message._id)) return old
          return old
            ? { ...old, messages: [...old.messages, message] }
            : { messages: [message], requestId: '' }
        }
      )
      if (
        message.senderId !== userId &&
        !message.isRead &&
        conversationId &&
        userId
      ) {
        console.log('Marking new message as read:', message._id)
        markAsReadMutation.mutate({
          conversationId,
          messageIds: message._id,
        })
      }
    },
    [queryClient, conversationId, userId]
  )

  const handleTyping = useCallback(
    (typing: { userId: string; isTyping: boolean }) => {
      console.log('Typing event received:', typing)
      if (typing.userId !== userId) {
        setOtherUserTyping(typing.isTyping)
      }
    },
    [userId]
  )

  const handleMessageRead = useCallback(
    (event: { messageId: string }) => {
      console.log('Message read event received:', event)
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === event.messageId ? { ...msg, isRead: true } : msg
        )
      )
      queryClient.setQueryData(
        ['messages', conversationId],
        (old: FetchMessagesResponse | undefined) =>
          old
            ? {
                ...old,
                messages: old.messages.map((msg) =>
                  msg._id === event.messageId ? { ...msg, isRead: true } : msg
                ),
              }
            : old
      )
    },
    [queryClient, conversationId]
  )

  const handleConversationClosed = useCallback(() => {
    console.log('Conversation closed event received')
    router.replace('/')
  }, [router])

  // Memoize Pusher events object
  const pusherEvents = useMemo(
    () => ({
      onMessage: handleNewMessage,
      onTyping: handleTyping,
      onMessageRead: handleMessageRead,
      onConversationClosed: handleConversationClosed,
    }),
    [
      handleNewMessage,
      handleTyping,
      handleMessageRead,
      handleConversationClosed,
    ]
  )

  // Use Pusher hook
  const { isConnected } = usePusher(
    conversationId || '',
    userId || '',
    pusherEvents
  )

  // Debounced typing event
  const debouncedTypingEvent = useCallback(
    debounce((typing: boolean) => {
      if (typing !== isTyping && conversationId && userId) {
        console.log('Sending typing event:', typing)
        setIsTyping(typing)
        typingMutation.mutate({ conversationId, isTyping: typing })
      }
    }, 500),
    [isTyping, conversationId, userId, typingMutation]
  )

  // Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!newMessage.trim() || !conversationId || !userId) {
      console.warn('Cannot send message: missing data', {
        newMessage: newMessage.trim(),
        conversationId,
        userId,
      })
      return
    }
    console.log('Sending message:', newMessage)
    sendMessageMutation.mutate({ conversationId, content: newMessage })
    setIsTyping(false)
    debouncedTypingEvent(false)
  }

  // Send typing event
  const handleTypingEvent = (typing: boolean) => {
    debouncedTypingEvent(typing)
  }

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Validate and format timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) {
      console.warn('Timestamp is undefined')
      return 'Unknown time'
    }
    try {
      const date = new Date(timestamp)
      if (!isValid(date)) {
        console.warn(`Invalid timestamp: ${timestamp}`)
        return 'Unknown time'
      }
      return format(date, 'HH:mm')
    } catch (error) {
      console.warn(`Error formatting timestamp: ${timestamp}`, error)
      return 'Unknown time'
    }
  }

  // Handle loading state
  if (isAuthLoading || isFetching || !isSuccess) {
    return (
      <div className="container mx-auto p-4">
        <p>Checking authentication...</p>
      </div>
    )
  }

  if (!userId || !conversationId) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading or redirecting...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <Card className="flex flex-col w-full max-w-3xl mx-auto my-8 border shadow-sm min-h-0 overflow-hidden">
        <CardHeader className="border-b p-4 bg-white">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">Chat</h2>
              <p className="text-sm text-gray-500">
                {isConnected ? 'Online' : 'Connecting...'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          {isLoading ? (
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
          ) : isError ? (
            <div className="p-4 text-red-500">Error loading messages</div>
          ) : messages.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <ScrollArea
              className="h-[calc(100vh-200px)] p-4"
              ref={scrollAreaRef}
              aria-label="Chat messages"
            >
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${
                      msg.senderId === userId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex max-w-[85%] lg:max-w-[75%] ${
                        msg.senderId === userId
                          ? 'flex-row-reverse'
                          : 'flex-row'
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
                            msg.senderId === userId
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                          {msg.senderId === userId && (
                            <Check
                              className={`h-3 w-3 ${
                                msg.isRead ? 'text-blue-400' : 'text-gray-400'
                              }`}
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                        <span className="text-xs text-gray-500">typing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>

        <CardFooter className="border-t p-4 bg-white">
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
                placeholder="Type a message..."
                disabled={sendMessageMutation.isPending}
                aria-label="Type a message"
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
        </CardFooter>
      </Card>
    </div>
  )
}
