import { useEffect, useRef, useState, useCallback } from 'react';
import Pusher, { Channel } from 'pusher-js';
import { useRouter } from 'next/navigation';

// Hàm lấy cookie
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
  return null;
};

// Hàm refresh token
const refreshAccessToken = async (router: ReturnType<typeof useRouter>): Promise<string> => {
  try {
    console.log('Attempting to refresh access token');
    const authCookie = getCookie('access_token');
    console.log('Current auth cookie:', authCookie || 'No cookie');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Refresh token response not ok:', {
        status: response.status,
        data: errorData,
      });
      throw new Error(errorData.message || 'Failed to refresh token');
    }

    const data = await response.json();
    const { access_token } = data;
    console.log('Access token refreshed successfully');
    localStorage.setItem('access_token', access_token);
    return access_token;
  } catch (error: any) {
    console.error('Refresh token error:', {
      message: error?.message || 'No message provided',
      stack: error?.stack || 'No stack trace',
    });
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

export const usePusher = (conversationId: string, userId: string, events: PusherEvents) => {
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<Channel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const initializePusher = useCallback(async (token: string | null) => {
    if (!conversationId || !userId) {
      console.warn('Cannot initialize Pusher: missing userId or conversationId', {
        conversationId,
        userId,
      });
      setIsConnected(false);
      return;
    }

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!pusherKey || !pusherCluster || !apiUrl) {
      console.error('Missing Pusher configuration: key, cluster, or API URL', {
        pusherKey: !!pusherKey,
        pusherCluster: !!pusherCluster,
        apiUrl: !!apiUrl,
      });
      setIsConnected(false);
      return;
    }

    const accessToken = token || localStorage.getItem('access_token') || getCookie('access_token');
    console.log('usePusher initializing with token:', accessToken ? 'Token present' : 'No token');

    if (!accessToken) {
      console.warn('No access token found, redirecting to /sign-in');
      setIsConnected(false);
      if (typeof window !== 'undefined' && window.location.pathname !== '/sign-in') {
        router.replace('/sign-in');
      }
      return;
    }

    try {
      console.log('Initializing Pusher for channel:', `private-${conversationId}`);
      pusherRef.current = new Pusher(pusherKey, {
        cluster: pusherCluster,
        authEndpoint: `${apiUrl}/chat/auth`,
        authTransport: 'ajax',
        auth: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });

      channelRef.current = pusherRef.current.subscribe(`private-${conversationId}`);

      channelRef.current.bind('pusher:subscription_succeeded', () => {
        setIsConnected(true);
        retryCountRef.current = 0;
        console.log(`Subscribed to private-${conversationId}`);
      });

      channelRef.current.bind('pusher:subscription_error', async (error: { status: number; data?: any }) => {
        console.error('Pusher subscription error:', {
          status: error.status,
          data: error.data || 'No data provided',
        });
        if (error.status === 401 && retryCountRef.current < maxRetries) {
          try {
            retryCountRef.current += 1;
            console.log(`Retrying Pusher subscription, attempt ${retryCountRef.current}/${maxRetries}`);
            const newToken = await refreshAccessToken(router);
            await initializePusher(newToken);
          } catch (err: any) {
            console.error('Failed to refresh token:', {
              message: err?.message || 'No message provided',
              stack: err?.stack || 'No stack trace',
            });
            setIsConnected(false);
            if (typeof window !== 'undefined' && window.location.pathname !== '/sign-in') {
              router.replace('/sign-in');
            }
          }
        } else {
          setIsConnected(false);
          console.error('Pusher subscription failed:', error);
        }
      });

      channelRef.current.bind('newMessage', (data: Message) => {
        console.log('Pusher newMessage event received:', data);
        events.onMessage(data);
      });
      channelRef.current.bind('typing', (data: TypingEvent) => {
        console.log('Pusher typing event received:', data);
        events.onTyping(data);
      });
      channelRef.current.bind('messageRead', (data: MessageReadEvent) => {
        console.log('Pusher messageRead event received:', data);
        events.onMessageRead(data);
      });
      channelRef.current.bind('conversationClosed', (data: ConversationClosedEvent) => {
        console.log('Pusher conversationClosed event received:', data);
        events.onConversationClosed(data);
      });
    } catch (error: any) {
      console.error('Pusher initialization failed:', {
        message: error?.message || 'No message provided',
        stack: error?.stack || 'No stack trace',
      });
      setIsConnected(false);
    }
  }, [conversationId, userId, router, events]);

  useEffect(() => {
    console.log('usePusher effect: Initializing Pusher');
    initializePusher(null);
    return () => {
      console.log('usePusher cleanup: Disconnecting Pusher');
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusherRef.current?.unsubscribe(`private-${conversationId}`);
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
      setIsConnected(false);
    };
  }, [initializePusher]);

  return { isConnected };
};