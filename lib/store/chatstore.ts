import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Message, Conversation } from "@/lib/types/chat";

interface ChatStore {
  // Data
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  currentConversationId: string | null;
  typingUsers: Record<string, string[]>; // conversationId -> array of usernames typing

  // Conversation actions
  setConversations: (convs: any) => void; // Accept any type, we'll process it
  addOrUpdateConversation: (conv: Conversation) => void;
  setCurrentConversation: (convId: string | null) => void;

  // Message actions
  setMessages: (convId: string, msgs: Message[]) => void;
  addMessage: (convId: string, msg: Message) => void;
  updateMessage: (convId: string, messageId: string, updates: Partial<Message>) => void;
  removeMessage: (convId: string, messageId: string) => void;
  clearMessages: (convId: string) => void;

  // Typing indicators
  setTyping: (convId: string, username: string, isTyping: boolean) => void;
  
  // Helpers
  getConversation: (convId: string) => Conversation | undefined;
  getMessagesForConversation: (convId: string) => Message[];
  
  // Clear all
  clearAll: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      currentConversationId: null,
      typingUsers: {},

      // Conversation actions - FIXED version
      setConversations: (conversations) => {
        console.log('📦 setConversations called with:', conversations);
        
        // Extract the actual array from various possible formats
        let convArray = [];
        
        if (Array.isArray(conversations)) {
          // It's already an array
          convArray = conversations;
        } else if (conversations?.data) {
          // It's an object with a data property
          if (Array.isArray(conversations.data)) {
            convArray = conversations.data;
          } else if (conversations.data?.data && Array.isArray(conversations.data.data)) {
            // Nested deeper
            convArray = conversations.data.data;
          }
        }
        
        console.log('📦 Processed conversations array length:', convArray.length);
        
        set({ conversations: convArray });
      },

      addOrUpdateConversation: (conv) =>
        set((state) => {
          const exists = state.conversations.some((c) => c._id === conv._id);
          if (exists) {
            return {
              conversations: state.conversations.map((c) =>
                c._id === conv._id ? { ...c, ...conv } : c
              ),
            };
          }
          return {
            conversations: [...state.conversations, conv],
          };
        }),

      setCurrentConversation: (convId) => {
        set({ currentConversationId: convId });
      },

      // Message actions
      setMessages: (convId, messages) => {
        const msgArray = Array.isArray(messages) ? messages : [];
        set((state) => ({
          messages: { ...state.messages, [convId]: msgArray },
        }));
      },

      addMessage: (convId, message) =>
        set((state) => {
          const current = state.messages[convId] || [];
          
          // Prevent duplicate messages
          if (current.some((m) => m._id === message._id)) {
            return state;
          }

          const newMessages = [...current, message].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          // Update last message in conversation
          const updatedConvs = state.conversations.map((c) =>
            c._id === convId
              ? {
                  ...c,
                  lastMessage: message,
                  lastMessageTime: message.createdAt,
                }
              : c
          );

          return {
            messages: { ...state.messages, [convId]: newMessages },
            conversations: updatedConvs,
          };
        }),

      updateMessage: (convId, messageId, updates) =>
        set((state) => {
          const current = state.messages[convId] || [];
          return {
            messages: {
              ...state.messages,
              [convId]: current.map((m) =>
                m._id === messageId ? { ...m, ...updates } : m
              ),
            },
          };
        }),

      removeMessage: (convId, messageId) =>
        set((state) => {
          const current = state.messages[convId] || [];
          return {
            messages: {
              ...state.messages,
              [convId]: current.filter((m) => m._id !== messageId),
            },
          };
        }),

      clearMessages: (convId) =>
        set((state) => {
          const { [convId]: _, ...rest } = state.messages;
          return { messages: rest };
        }),

      // Typing indicators
      setTyping: (convId, username, isTyping) =>
        set((state) => {
          const current = state.typingUsers[convId] || [];
          
          if (isTyping) {
            if (!current.includes(username)) {
              return {
                typingUsers: {
                  ...state.typingUsers,
                  [convId]: [...current, username],
                },
              };
            }
          } else {
            return {
              typingUsers: {
                ...state.typingUsers,
                [convId]: current.filter((u) => u !== username),
              },
            };
          }
          return state;
        }),

      // Helpers
      getConversation: (convId) => {
        return get().conversations.find((c) => c._id === convId);
      },

      getMessagesForConversation: (convId) => {
        return get().messages[convId] || [];
      },

      // Clear all
      clearAll: () =>
        set({
          conversations: [],
          messages: {},
          currentConversationId: null,
          typingUsers: {},
        }),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        conversations: state.conversations,
      }),
    }
  )
);