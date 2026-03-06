import api from "./axios";
import { ENDPOINTS } from "./endpoints";

export const chatApi = {
  sendMessage: (data: { receiverId: string; content: string; conversationId?: string; replyTo?: string; messageType?: string }) =>
    api.post(ENDPOINTS.CHAT.SEND_MESSAGE, data).then(r => r.data),

  getMessages: (conversationId: string) =>
    api.get(ENDPOINTS.CHAT.GET_MESSAGES(conversationId)).then(r => r.data),

  editMessage: (messageId: string, content: string) =>
    api.put(ENDPOINTS.CHAT.EDIT_MESSAGE(messageId), { content }).then(r => r.data),

  deleteMessage: (messageId: string) =>
    api.delete(ENDPOINTS.CHAT.DELETE_MESSAGE(messageId)).then(r => r.data),

  markAsSeen: (messageIds: string[]) =>
    api.post(ENDPOINTS.CHAT.MARK_AS_SEEN, { messageIds }).then(r => r.data),

  searchMessages: (conversationId: string, query: string) =>
    api.get(ENDPOINTS.CHAT.SEARCH_MESSAGES(conversationId), { params: { query } }).then(r => r.data),

  getConversations: () =>
    api.get(ENDPOINTS.CHAT.GET_CONVERSATIONS).then(r => r.data),
};