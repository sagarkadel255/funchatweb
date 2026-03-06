"use client";

import { useCallback, useEffect, useState } from "react";
import { chatApi } from "@/lib/api/chat";
import { useChatStore } from "@/lib/store/chatstore";
import { useAuthStore } from "@/lib/store/authstore";
import { useFriendStore } from "@/lib/store/friendstore";
import { extractApiError } from "@/lib/utils/api-error";
import toast from "react-hot-toast";
import { getSocket, SOCKET_EVENTS } from "@/lib/utils/socket";
import { Message, Conversation, SendMessagePayload } from "@/lib/types/chat";

export function useChat() {
  const store = useChatStore();
  const { user } = useAuthStore();
  const { friends } = useFriendStore();
  
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    setError(null);
    try {
      const res = await chatApi.getConversations();
      if (res.success) {
        store.setConversations(res.data || []);
      } else {
        toast.error(res.message || "Failed to load conversations");
      }
    } catch (e) {
      const msg = extractApiError(e);
      console.error("Load conversations error:", msg);
      setError(msg);
      toast.error("Failed to load conversations");
    } finally {
      setLoadingConvs(false);
    }
  }, [store]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMsgs(true);
    setError(null);
    try {
      const res = await chatApi.getMessages(conversationId);
      if (res.success) {
        const messagesData = Array.isArray(res.data) ? res.data : 
                           (res.data?.data ? (Array.isArray(res.data.data) ? res.data.data : []) : []);
        store.setMessages(conversationId, messagesData);
        
        // Mark as seen after loading
        setTimeout(() => markAsSeen(conversationId), 500);
      } else {
        toast.error(res.message || "Failed to load messages");
      }
    } catch (e) {
      const msg = extractApiError(e);
      console.error("Load messages error:", msg);
      setError(msg);
      toast.error("Failed to load messages");
    } finally {
      setLoadingMsgs(false);
    }
  }, [store]);

  // Send message
  const sendMessage = useCallback(async (
    receiverId: string, 
    content: string, 
    conversationId?: string, 
    replyTo?: string
  ) => {
    if (!user?.id) {
      toast.error("You must be logged in");
      return null;
    }

    if (!content.trim()) return null;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const timestamp = new Date().toISOString();

    // Create optimistic message
    const optimisticMsg: Message = {
      _id: tempId,
      sender: { 
        _id: user.id, 
        username: user.username || "You", 
        profileImage: user.profileImage 
      },
      receiver: receiverId,
      conversationId: conversationId || "",
      content: content.trim(),
      messageType: "text",
      createdAt: timestamp,
      updatedAt: timestamp,
      status: "sent",
      seenBy: [],
      isEdited: false,
      isDeleted: false,
      optimistic: true,
    };

    // Add optimistic message
    if (conversationId) {
      store.addMessage(conversationId, optimisticMsg);
    }

    setSending(true);
    try {
      const payload: SendMessagePayload = {
        receiverId,
        content: content.trim(),
      };
      if (replyTo) payload.replyTo = replyTo;
      if (conversationId) payload.conversationId = conversationId;

      const res = await chatApi.sendMessage(payload);
      
      if (res.success && res.data) {
        // Replace optimistic message with real one
        if (conversationId) {
          store.removeMessage(conversationId, tempId);
          store.addMessage(conversationId, res.data);
        }
        return res.data;
      } else {
        // Remove optimistic message on failure
        if (conversationId) {
          store.removeMessage(conversationId, tempId);
        }
        toast.error(res.message || "Failed to send message");
        return null;
      }
    } catch (e) {
      // Remove optimistic message on error
      if (conversationId) {
        store.removeMessage(conversationId, tempId);
      }
      const msg = extractApiError(e);
      toast.error(msg);
      return null;
    } finally {
      setSending(false);
    }
  }, [store, user]);

  // Edit message
  const editMessage = useCallback(async (conversationId: string, messageId: string, content: string) => {
    try {
      const res = await chatApi.editMessage(messageId, content);
      if (res.success) {
        store.updateMessage(conversationId, messageId, {
          content,
          isEdited: true,
          editedAt: new Date().toISOString(),
        });
        toast.success("Message edited");
        return true;
      } else {
        toast.error(res.message || "Failed to edit message");
        return false;
      }
    } catch (e) {
      toast.error(extractApiError(e));
      return false;
    }
  }, [store]);

  // Delete message
  const deleteMessage = useCallback(async (conversationId: string, messageId: string) => {
    try {
      const res = await chatApi.deleteMessage(messageId);
      if (res.success) {
        store.updateMessage(conversationId, messageId, {
          isDeleted: true,
          content: "This message was deleted",
        });
        toast.success("Message deleted");
        return true;
      } else {
        toast.error(res.message || "Failed to delete message");
        return false;
      }
    } catch (e) {
      toast.error(extractApiError(e));
      return false;
    }
  }, [store]);

  // Mark messages as seen
  const markAsSeen = useCallback(async (conversationId: string) => {
    if (!user?.id || !conversationId) return;

    const messages = store.getMessagesForConversation(conversationId);
    const safeMessages = Array.isArray(messages) ? messages : [];
    
    const unseenIds = safeMessages
      .filter(m => {
        if (!m) return false;
        const senderId = typeof m.sender === 'string' ? m.sender : m.sender?._id;
        return senderId !== user.id && m.status !== 'seen' && !m.isDeleted;
      })
      .map(m => m._id);

    if (unseenIds.length === 0) return;

    try {
      await chatApi.markAsSeen(unseenIds);
      // Update status in store
      unseenIds.forEach(id => {
        store.updateMessage(conversationId, id, { status: 'seen' });
      });
    } catch (e) {
      console.error("Failed to mark messages as seen:", e);
    }
  }, [store, user]);

  // Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user?.id) return;

    // Handle new message
    const handleNewMessage = (message: Message) => {
      console.log("📩 New message received:", message);
      
      if (!message || !message.conversationId) return;
      
      // Add message to store
      store.addMessage(message.conversationId, message);

      // Show notification if not in current conversation
      if (store.currentConversationId !== message.conversationId) {
        const senderName = typeof message.sender === 'object' ? message.sender?.username : 'Someone';
        toast.success(`📨 ${senderName}: ${message.content.substring(0, 30)}...`);
      } else {
        // If in current conversation, mark as seen
        markAsSeen(message.conversationId);
      }
    };

    // Handle message seen
    const handleMessageSeen = (data: { messageIds: string[] }) => {
      if (store.currentConversationId && data.messageIds) {
        data.messageIds.forEach(id => {
          if (id) store.updateMessage(store.currentConversationId!, id, { status: 'seen' });
        });
      }
    };

    // Handle typing indicators
    const handleTyping = (data: { senderId: string; isTyping: boolean }) => {
      if (!store.currentConversationId || !data?.senderId) return;
      
      // Find username from participants
      const conv = store.getConversation(store.currentConversationId);
      const participant = conv?.participants?.find(p => p?._id === data.senderId);
      
      if (participant?.username) {
        store.setTyping(store.currentConversationId, participant.username, data.isTyping);
      }
    };

    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED, handleNewMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_SEEN_RECV, handleMessageSeen);
    socket.on(SOCKET_EVENTS.TYPING_INDICATOR, handleTyping);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_RECEIVED, handleNewMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_SEEN_RECV, handleMessageSeen);
      socket.off(SOCKET_EVENTS.TYPING_INDICATOR, handleTyping);
    };
  }, [store, user, markAsSeen]);

  return {
    // Data
    conversations: store.conversations,
    messages: store.messages,
    currentConversationId: store.currentConversationId,
    typingUsers: store.typingUsers,
    friends: friends || [],
    
    // Loading states
    loadingConvs,
    loadingMsgs,
    sending,
    error,
    
    // Actions
    loadConversations,
    loadMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsSeen,
    setCurrentConversation: store.setCurrentConversation,
    
    // Helpers
    getMessagesForConversation: store.getMessagesForConversation,
  };
}