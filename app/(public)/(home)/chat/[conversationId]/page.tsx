'use client'

import { useState, useEffect, useCallback, useMemo, useRef, use } from 'react'
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
import { cancelBookingMutationFn } from '@/api/routes/route'
import {
  getTripConfirmationByRequestQueryFn,
  updateTripConfirmationMutationFn,
} from '@/api/confirmation/confirmation'
import { debounce } from 'lodash'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import ChatHeader from './_components/ChatHeader'
import ChatMessages from './_components//ChatMessages'
import ChatInput from './_components//ChatInput'
import ConfirmBookingDialog from './_components//ConfirmBookingDialog'
import CancelBookingDialog from './_components//CancelBookingDialog'
import { Card } from '@/components/ui/card'
import { formatDate, isValid } from 'date-fns'
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

interface TripConfirmationData {
  _id: string
  tripRequestId: string
  confirmedByDriver?: boolean
  confirmedByPassenger?: boolean
  notes?: string
}

interface TripConfirmation {
  data: TripConfirmationData
}

interface CancelRequestType {
  requestId: string
}

interface UpdateTripConfirmationType {
  confirmedByDriver?: boolean
  confirmedByPassenger?: boolean
  notes?: string
}

interface Props {
  params: Promise<{ conversationId: string }>
}

// Define form schema
const formSchema = z.object({
  confirmedByDriver: z.boolean().optional(),
  confirmedByPassenger: z.boolean().optional(),
  notes: z.string().optional(),
})

export default function ChatPage({ params }: Props) {
  const { conversationId } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const {
    user,
    isLoading: isAuthLoading,
    isFetching,
    isSuccess,
  } = useAuthContext()
  const queryClient = useQueryClient()

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmedByDriver: false,
      confirmedByPassenger: false,
      notes: '',
    },
  })

  // Set userId from auth context and prevent redirect loop
  useEffect(() => {
    if (isAuthLoading || isFetching || !isSuccess) {
      return
    }
    if (!user?._id && window.location.pathname !== '/sign-in') {
      router.replace('/sign-in')
      return
    }
    if (user?._id) {
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
    isLoading: isMessagesLoading,
    isError: isMessagesError,
  } = useQuery<FetchMessagesResponse>({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: !!conversationId && !!userId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  // Fetch trip confirmation data
  const {
    data: tripConfirmation,
    isLoading: isConfirmationLoading,
    isError: isConfirmationError,
  } = useQuery<TripConfirmation | null>({
    queryKey: ['tripConfirmation', fetchedMessagesResponse?.requestId],
    queryFn: () =>
      fetchedMessagesResponse?.requestId
        ? getTripConfirmationByRequestQueryFn(
            fetchedMessagesResponse.requestId
          ).then((response) => ({ data: response.data }))
        : Promise.resolve(null),
    enabled: !!fetchedMessagesResponse?.requestId && !!userId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  // Sync form with tripConfirmation data
  useEffect(() => {
    if (tripConfirmation?.data) {
      form.reset({
        confirmedByDriver: tripConfirmation.data.confirmedByDriver || false,
        confirmedByPassenger:
          tripConfirmation.data.confirmedByPassenger || false,
        notes: tripConfirmation.data.notes || '',
      })
    }
  }, [tripConfirmation, form])

  // Handle fetched messages
  useEffect(() => {
    if (!fetchedMessagesResponse || !userId || !conversationId) {
      return
    }
    setMessages(fetchedMessagesResponse.messages)
    const unreadMessages = fetchedMessagesResponse.messages
      .filter((msg) => msg.senderId !== userId && !msg.isRead)
      .map((msg) => msg._id)
    if (unreadMessages.length > 0) {
      markAsReadMutation.mutate({
        conversationId,
        messageIds: unreadMessages,
      })
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
      setNewMessage('')
      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      })
    },
    onError: (error: any) => {},
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
    onError: (error: any) => {},
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
      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      })
    },
    onError: (error: any) => {
      if (
        error?.response?.status === 401 &&
        typeof window !== 'undefined' &&
        window.location.pathname !== '/sign-in'
      ) {
        router.replace('/sign-in')
      }
    },
  })

  const cancelBookingMutation = useMutation({
    mutationFn: (data: CancelRequestType) => cancelBookingMutationFn(data),
    onSuccess: () => {
      toast.success('Hủy đặt xe thành công')
      router.replace('/')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Hủy đặt xe thất bại. Vui lòng thử lại.')
    },
  })

  const confirmBookingMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateTripConfirmationType
    }) => updateTripConfirmationMutationFn(id, data),
    onSuccess: () => {
      toast.success('Đặt xe thành công')
      queryClient.invalidateQueries({
        queryKey: ['tripConfirmation', fetchedMessagesResponse?.requestId],
      })
      setShowConfirmDialog(false)
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'Xác nhận đặt xe thất bại. Vui lòng thử lại.'
      )
    },
  })

  // Memoize Pusher event handlers
  const handleNewMessage = useCallback(
    (message: Message) => {
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
      if (typing.userId !== userId) {
        setOtherUserTyping(typing.isTyping)
      }
    },
    [userId]
  )

  const handleMessageRead = useCallback(
    (event: { messageId: string }) => {
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
      toast.error('Không thể gửi tin nhắn: dữ liệu không đầy đủ.')
      return
    }
    sendMessageMutation.mutate({ conversationId, content: newMessage })
    setIsTyping(false)
    debouncedTypingEvent(false)
  }

  // Handle cancel booking
  const handleCancelBooking = () => {
    if (!fetchedMessagesResponse?.requestId) {
      toast.error('Không thể hủy đặt xe: dữ liệu không đầy đủ.')
      return
    }
    cancelBookingMutation.mutate({
      requestId: fetchedMessagesResponse.requestId,
    })
  }

  // Handle confirm booking
  const handleConfirmBooking = () => {
    if (!fetchedMessagesResponse?.requestId || !tripConfirmation?.data?._id) {
      toast.error('Không thể xác nhận đặt xe: dữ liệu không đầy đủ.')
      return
    }
    if (
      (user?.role === 'driver' && tripConfirmation?.data?.confirmedByDriver) ||
      (user?.role === 'customer' &&
        tripConfirmation?.data?.confirmedByPassenger)
    ) {
      toast.error('Bạn đã xác nhận đặt xe này.')
      return
    }
    const formValues = form.getValues()
    const updateData: UpdateTripConfirmationType = {
      ...(user?.role === 'driver'
        ? { confirmedByDriver: formValues.confirmedByDriver }
        : {}),
      ...(user?.role === 'customer'
        ? { confirmedByPassenger: formValues.confirmedByPassenger }
        : {}),
      notes: formValues.notes?.trim() || undefined,
    }
    confirmBookingMutation.mutate({
      id: tripConfirmation.data._id,
      data: updateData,
    })
  }

  // Send typing event
  const handleTypingEvent = (typing: boolean) => {
    debouncedTypingEvent(typing)
  }

  // Validate and format timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) {
      return 'Thời gian không xác định'
    }
    try {
      const date = new Date(timestamp)
      if (!isValid(date)) {
        return 'Thời gian không xác định'
      }
      return formatDate(date, 'dd/MM/yy HH:mm')
    } catch (error) {
      return 'Thời gian không xác định'
    }
  }

  // Handle loading state
  if (isAuthLoading || isFetching || !isSuccess) {
    return (
      <div className="container mx-auto p-4">
        <p>Đang kiểm tra xác thực...</p>
      </div>
    )
  }

  if (!userId || !conversationId) {
    return (
      <div className="container mx-auto p-4">
        <p>Đang tải hoặc chuyển hướng...</p>
      </div>
    )
  }

  // Check if user is allowed to confirm
  const canConfirm =
    user?.role === 'driver'
      ? !tripConfirmation?.data?.confirmedByDriver
      : user?.role === 'customer'
      ? !tripConfirmation?.data?.confirmedByPassenger
      : false

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <Card className="flex flex-col w-full max-w-3xl mx-auto my-8 border shadow-sm min-h-0 overflow-hidden">
        <ChatHeader
          user={user||null}
          isConnected={isConnected}
          onConfirmBooking={() => setShowConfirmDialog(true)}
          onCancelBooking={() => setShowCancelDialog(true)}
          hasTripConfirmation={!!tripConfirmation?.data?._id}
        />
        <ChatMessages
          messages={messages}
          userId={userId}
          isMessagesLoading={isMessagesLoading}
          isMessagesError={isMessagesError}
          otherUserTyping={otherUserTyping}
          scrollAreaRef={scrollAreaRef}
          formatTimestamp={formatTimestamp}
        />
        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          isTyping={isTyping}
          handleTypingEvent={handleTypingEvent}
          handleSendMessage={handleSendMessage}
          sendMessageMutation={sendMessageMutation}
        />
        <ConfirmBookingDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          form={form}
          isConfirmationLoading={isConfirmationLoading}
          isConfirmationError={isConfirmationError}
          tripConfirmation={tripConfirmation|| null}
          user={user|| null}
          canConfirm={canConfirm}
          confirmBookingMutation={confirmBookingMutation}
          handleConfirmBooking={handleConfirmBooking}
        />
        <CancelBookingDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          cancelBookingMutation={cancelBookingMutation}
          handleCancelBooking={handleCancelBooking}
        />
      </Card>
    </div>
  )
}
