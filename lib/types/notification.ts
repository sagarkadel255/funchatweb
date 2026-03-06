export interface NotificationUser {
  _id: string;
  username: string;
  profileImage?: string;
  email?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: "message" | "call" | "friend_request" | "friend_accepted" | "system";
  title: string;
  message: string;
  relatedUserId?: NotificationUser | null;
  relatedMessageId?: string;
  relatedCallId?: string;
  isRead: boolean;
  readAt?: string;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}