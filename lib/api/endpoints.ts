export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH_TOKEN: "/auth/refresh",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
    UPDATE_PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
    SEARCH_USERS: "/auth/search",
  },

  FRIEND: {
    SEND_REQUEST: "/friends/request",
    ACCEPT_REQUEST: "/friends/accept",
    REJECT_REQUEST: "/friends/reject",
    CANCEL_REQUEST: (requestId: string) => `/friends/request/${requestId}`,
    GET_ALL_REQUESTS: "/friends/requests",
    GET_SENT_REQUESTS: "/friends/requests/sent",      // Added
    GET_RECEIVED_REQUESTS: "/friends/requests/received", // Added
    GET_FRIENDS: "/friends",
    BLOCK_USER: "/friends/block",
    UNBLOCK_USER: "/friends/unblock",
  },

  CHAT: {
    SEND_MESSAGE: "/messages",
    GET_MESSAGES: (conversationId: string) => `/messages/${conversationId}`,
    EDIT_MESSAGE: (messageId: string) => `/messages/${messageId}`,
    DELETE_MESSAGE: (messageId: string) => `/messages/${messageId}`,
    MARK_AS_SEEN: "/messages/seen",
    SEARCH_MESSAGES: (conversationId: string) => `/messages/search/${conversationId}`,
    GET_CONVERSATIONS: "/conversations",
  },

  CALL: {
    INITIATE: "/calls",
    ACCEPT: "/calls/accept",
    REJECT: "/calls/reject",
    END: "/calls/end",
    CLEAR_STALE: "/calls/clear-stale",
    HISTORY: "/calls/history",
    MISSED: "/calls/missed",
  },

  NOTIFICATION: {
    GET_ALL: "/notifications",
    GET_UNREAD_COUNT: "/notifications/unread/count",
    GET_BY_TYPE: (type: string) => `/notifications/type/${type}`,
    MARK_AS_READ: (notificationId: string) => `/notifications/${notificationId}/read`,
    MARK_ALL_READ: "/notifications/read-all",
    DELETE_ONE: (notificationId: string) => `/notifications/${notificationId}`,
    DELETE_ALL: "/notifications",
  },

  ADMIN: {
    STATS: "/admin/stats",
    USERS: "/admin/users",
    DELETE_USER: (userId: string) => `/admin/users/${userId}`,
    BAN_USER: (userId: string) => `/admin/users/${userId}/ban`,
    MESSAGE_STATS: "/admin/messages/stats",
  },
} as const;