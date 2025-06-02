'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePusher } from '@/hooks/usePusher';
import { useAuthContext } from '@/context/auth-provider';
import {
    fetchMessages,
    sendMessage,
    sendTypingEvent,
    markMessageAsRead,
} from '@/api/chat/chat';
import { use } from 'react';

interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    timestamp: string;
}

interface Props {
    params: Promise<{ conversationId: string }>;
}

export default function ChatPage({ params }: Props) {
    const { conversationId } = use(params);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [userId, setUserId] = useState<string>('');
    const router = useRouter();
    const { user } = useAuthContext();
    const queryClient = useQueryClient();

    // Set userId from auth context
    useEffect(() => {
        if (user?._id) {
            setUserId(user._id);
        } else {
        }
    }, [user, router]);

    // Fetch messages using TanStack Query
    const {
        data: fetchedMessages,
        isLoading,
        isSuccess,
    } = useQuery<Message[]>({
        queryKey: ['messages', conversationId],
        queryFn: () => fetchMessages(conversationId),
        enabled: !!conversationId && !!userId,
    });

    // Handle success case with useEffect
    useEffect(() => {
        if (isSuccess && fetchedMessages) {
            setMessages(fetchedMessages);
        }
    }, [isSuccess, fetchedMessages]);

    // Mutations
    const sendMessageMutation = useMutation({
        mutationFn: ({
            conversationId,
            content,
        }: {
            conversationId: string;
            content: string;
        }) => sendMessage(conversationId, content),
        onSuccess: () => {
            setNewMessage('');
            queryClient.invalidateQueries({
                queryKey: ['messages', conversationId],
            });
        },
        onError: (error) => {
            console.error('Error sending message:', error);
        },
    });

    const typingMutation = useMutation({
        mutationFn: ({
            conversationId,
            isTyping,
        }: {
            conversationId: string;
            isTyping: boolean;
        }) => sendTypingEvent(conversationId, isTyping),
        onError: (error) => {
            console.error('Error sending typing event:', error);
        },
    });

    const markAsReadMutation = useMutation({
        mutationFn: ({
            conversationId,
            messageId,
        }: {
            conversationId: string;
            messageId: string;
        }) => markMessageAsRead(conversationId, messageId),
        onError: (error) => {
            console.error('Error marking message as read:', error);
        },
    });

    // Memoize Pusher event handlers
    const handleNewMessage = useCallback(
        (message: Message) => {
            setMessages((prev) => [...prev, message]);
            queryClient.setQueryData(
                ['messages', conversationId],
                (old: Message[] | undefined) =>
                    old ? [...old, message] : [message]
            );
        },
        [queryClient, conversationId]
    );

    const handleTyping = useCallback(
        (typing: { userId: string; isTyping: boolean }) => {
            if (typing.userId !== userId) {
                setOtherUserTyping(typing.isTyping);
            }
        },
        [userId]
    );

    const handleMessageRead = useCallback(
        (event: { messageId: string }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === event.messageId ? { ...msg, isRead: true } : msg
                )
            );
            queryClient.setQueryData(
                ['messages', conversationId],
                (old: Message[] | undefined) =>
                    old
                        ? old.map((msg) =>
                              msg._id === event.messageId
                                  ? { ...msg, isRead: true }
                                  : msg
                          )
                        : old
            );
        },
        [queryClient, conversationId]
    );

    const handleConversationClosed = useCallback(() => {
        alert('This conversation has ended.');
        router.push('/');
    }, [router]);

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
    );

    // Use Pusher hook
    const { isConnected } = usePusher(conversationId, userId, pusherEvents);

    // Send message
    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        sendMessageMutation.mutate({ conversationId, content: newMessage });
    };

    // Send typing event
    const handleTypingEvent = (isTyping: boolean) => {
        if (isTyping === isTyping) return;
        setIsTyping(isTyping);
        typingMutation.mutate({ conversationId, isTyping });
    };

    // Mark message as read
    const handleMarkAsRead = (messageId: string) => {
        markAsReadMutation.mutate({ conversationId, messageId });
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Chat</h1>
            {isLoading && <p>Loading messages...</p>}
            {!isConnected && <p>Connecting to chat...</p>}
            <div className="border rounded p-4 h-96 overflow-y-auto mb-4">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`mb-2 ${
                            msg.senderId === userId ? 'text-right' : 'text-left'
                        }`}>
                        <span
                            className={`inline-block p-2 rounded ${
                                msg.senderId === userId
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200'
                            }`}>
                            {msg.content}
                        </span>
                        {msg.isRead && msg.senderId === userId && (
                            <span className="text-xs text-gray-500 ml-2">
                                Read
                            </span>
                        )}
                        {msg.senderId !== userId && !msg.isRead && (
                            <button
                                className="text-xs text-blue-500 ml-2"
                                onClick={() => handleMarkAsRead(msg._id)}>
                                Mark as read
                            </button>
                        )}
                    </div>
                ))}
                {otherUserTyping && (
                    <p className="text-gray-500 text-sm">
                        Other user is typing...
                    </p>
                )}
            </div>
            <div className="flex">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTypingEvent(true);
                    }}
                    onBlur={() => handleTypingEvent(false)}
                    className="flex-1 border rounded-l p-2"
                    placeholder="Type a message..."
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white p-2 rounded-r">
                    Send
                </button>
            </div>
        </div>
    );
}
