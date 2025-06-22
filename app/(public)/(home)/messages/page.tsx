'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/context/auth-provider'
import { getConversationsMutationFn } from '@/api/chat/chat'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { format, isValid } from 'date-fns'
import { Button } from '@/components/ui/button'
import { MessageSquare, PlusCircle } from 'lucide-react'

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
}

interface Conversation {
  _id: string
  ownerId: User
  passengerId: User
  requestId: { _id: string }
  routeId: { _id: string; name: string }
  updatedAt: string
}

export default function ConversationsPage() {
  const router = useRouter()
  const {
    user,
    isLoading: isAuthLoading,
    isFetching,
    isSuccess,
  } = useAuthContext()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthLoading || isFetching || !isSuccess) return
    if (!user?._id && window.location.pathname !== '/sign-in') {
      router.replace('/sign-in')
      return
    }
    if (user?._id) {
      setUserId(user._id)
    }
  }, [user, isAuthLoading, isFetching, isSuccess, router])

  const {
    data: conversations,
    isLoading,
    isError,
  } = useQuery<Conversation[]>({
    queryKey: ['conversations', userId],
    queryFn: getConversationsMutationFn,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Unknown time'
    try {
      const date = new Date(timestamp)
      if (!isValid(date)) return 'Unknown time'
      return format(date, 'MMM dd, HH:mm')
    } catch (error) {
      return 'Unknown time'
    }
  }

  const getOtherUser = (conversation: Conversation, currentUserId: string) => {
    return conversation.ownerId._id === currentUserId
      ? conversation.passengerId
      : conversation.ownerId
  }

  const handleConversationClick = (conversationId: string) => {
    router.push(`/chat/${conversationId}`)
  }


  if (isAuthLoading || isFetching || !isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-32 mx-auto" />
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-48 mx-auto" />
          <p className="text-gray-500">Loading or redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl font-semibold text-gray-800">
                  Your Conversations
                </CardTitle>
              </div>
              
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">
                  Error loading conversations
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Failed to load your conversations. Please try again later.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : conversations?.length === 0 ? (
              <div className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">
                  No conversations yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Start a new chat to connect with other users.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="divide-y divide-gray-200">
                  {conversations?.map((conversation) => {
                    const otherUser = getOtherUser(conversation, userId)
                    return (
                      <div
                        key={conversation._id}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() =>
                          handleConversationClick(conversation._id)
                        }
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherUser.avatar} />
                            <AvatarFallback className="bg-gray-200 text-gray-700 font-medium">
                              {otherUser.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {otherUser.name}
                              </h3>
                              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {formatTimestamp(conversation.updatedAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate mt-1">
                              <span className="font-medium">Route:</span>{' '}
                              {conversation.routeId.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
