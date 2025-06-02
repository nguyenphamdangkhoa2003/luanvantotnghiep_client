import API from '../api';

export const fetchMessages = async (conversationId: string) => {
    const response = await API.get(`/chat/messages/${conversationId}`, {
        withCredentials: true,
    });
    return response.data;
};

export const sendMessage = async (conversationId: string, content: string) => {
    const response = await API.post(
        `/chat/send`,
        {
            conversationId,
            content,
        },
        { withCredentials: true }
    );
    return response.data;
};

export const sendTypingEvent = async (
    conversationId: string,
    isTyping: boolean
) => {
    const response = await API.post(
        `/chat/typing`,
        {
            conversationId,
            isTyping,
        },
        { withCredentials: true }
    );
    return response.data;
};

export const markMessageAsRead = async (
    conversationId: string,
    messageId: string
) => {
    const response = await API.post(
        `/chat/readMessage`,
        {
            conversationId,
            messageId,
        },
        { withCredentials: true }
    );
    return response.data;
};
