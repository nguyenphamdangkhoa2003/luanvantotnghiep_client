import { useEffect, useRef, useState, useCallback } from 'react';
import Pusher, { Channel } from 'pusher-js';
import { useRouter } from 'next/navigation';

// Hàm lấy cookie
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
    return null;
};

// Hàm refresh token
const refreshAccessToken = async (
    router: ReturnType<typeof useRouter>
): Promise<string> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        const { access_token } = data;

        localStorage.setItem('access_token', access_token);
        console.log(
            'Access token refreshed and saved to localStorage:',
            access_token
        );

        return access_token;
    } catch (error) {
        console.error('Refresh token error:', error);
        throw error;
    }
};

interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    timestamp: string;
}

interface TypingEvent {
    userId: string;
    conversationId: string;
    isTyping: boolean;
}

interface MessageReadEvent {
    messageId: string;
    userId: string;
    conversationId: string;
    timestamp: string;
}

interface ConversationClosedEvent {
    conversationId: string;
    timestamp: string;
}

interface PusherEvents {
    onMessage: (message: Message) => void;
    onTyping: (typing: TypingEvent) => void;
    onMessageRead: (event: MessageReadEvent) => void;
    onConversationClosed: (event: ConversationClosedEvent) => void;
}

export const usePusher = (
    conversationId: string,
    userId: string,
    events: PusherEvents
) => {
    const pusherRef = useRef<Pusher | null>(null);
    const channelRef = useRef<Channel | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const router = useRouter();
    const retryCountRef = useRef(0);
    const maxRetries = 3;

    const initializePusher = useCallback(
        (token: string | null) => {
            // Kiểm tra token trước khi khởi tạo
            const accessToken =
                token ||
                getCookie('access_token') ||
                localStorage.getItem('access_token');

            if (!accessToken) {
                console.error('No access token found');
                setIsConnected(false);
                return;
            }

            // Ngắt kết nối Pusher hiện tại nếu có
            if (pusherRef.current) {
                pusherRef.current.disconnect();
            }

            pusherRef.current = new Pusher(
                process.env.NEXT_PUBLIC_PUSHER_KEY!,
                {
                    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
                    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/chat/auth`,
                    authTransport: 'ajax',
                    auth: {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    },
                }
            );

            channelRef.current = pusherRef.current.subscribe(
                `private-${conversationId}`
            );

            channelRef.current.bind('pusher:subscription_succeeded', () => {
                setIsConnected(true);
                retryCountRef.current = 0; // Reset retry count on success
                console.log(`Subscribed to private-${conversationId}`);
            });

            channelRef.current.bind(
                'pusher:subscription_error',
                async (error: { status: number }) => {
                    console.error('Subscription error:', error);
                    if (
                        error.status === 401 &&
                        retryCountRef.current < maxRetries
                    ) {
                        try {
                            retryCountRef.current += 1;
                            const newToken = await refreshAccessToken(router);
                            initializePusher(newToken);
                        } catch (err) {
                            setIsConnected(false);
                            console.error('Failed to refresh token:', err);
                        }
                    } else {
                        setIsConnected(false);
                        console.error('Subscription failed:', error);
                    }
                }
            );

            channelRef.current.bind('newMessage', (data: Message) => {
                console.log('New message:', data);
                events.onMessage(data);
            });

            channelRef.current.bind('typing', (data: TypingEvent) => {
                console.log('Typing event:', data);
                events.onTyping(data);
            });

            channelRef.current.bind('messageRead', (data: MessageReadEvent) => {
                console.log('Message read:', data);
                events.onMessageRead(data);
            });

            channelRef.current.bind(
                'conversationClosed',
                (data: ConversationClosedEvent) => {
                    console.log('Conversation closed:', data);
                    events.onConversationClosed(data);
                }
            );
        },
        [conversationId, router, events]
    );

    useEffect(() => {
        if (!userId || !conversationId) {
            console.error('Missing userId or conversationId');
            setIsConnected(false);
            return;
        }

        console.log(
            'Pusher init - User ID:',
            userId,
            'Conversation ID:',
            conversationId
        );

        initializePusher(null);

        return () => {
            if (channelRef.current) {
                channelRef.current.unbind_all();
                pusherRef.current?.unsubscribe(`private-${conversationId}`);
            }
            if (pusherRef.current) {
                pusherRef.current.disconnect();
            }
            setIsConnected(false);
        };
    }, [conversationId, userId, initializePusher]);

    return { isConnected };
};
