export interface Message {
  _id: string;
  sender: { _id: string; username: string; profileImage?: string } | string;
  receiver: string;
  conversationId: string;
  content: string;
  messageType: "text" | "image" | "video" | "audio" | "file";
  media?: { url: string; mimetype: string; size: number };
  replyTo?: Message | string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  status: "sent" | "delivered" | "seen";
  seenBy: Array<{ userId: string; seenAt: string }>;
  createdAt: string;
  updatedAt: string;
  optimistic?: boolean; // For client-side only messages
}

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    username: string;
    profileImage?: string;
    status: "online" | "offline" | "away";
  }>;
  conversationType: "direct" | "group";
  groupName?: string;
  lastMessage?: Message;
  lastMessageTime: string;
  unreadCount?: number;
}

export interface SendMessagePayload {
    conversationId?: string; // optional for backend to create new conversation
  receiverId: string;
  content: string;
  messageType?: "text";
  replyTo?: string;
}