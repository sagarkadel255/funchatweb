export class CreateNotificationDTO {
  userId!: string;
  type!: "message" | "call" | "friend_request" | "friend_accepted" | "system";
  title!: string;
  message!: string;
  relatedUserId?: string;
  relatedMessageId?: string;
  relatedCallId?: string;
  data?: Record<string, any>;
}

export class MarkAsReadDTO {
  notificationId!: string;
}

export class MarkAllAsReadDTO {
  userId!: string;
}

export class DeleteNotificationDTO {
  notificationId!: string;
}

export class GetNotificationsDTO {
  userId!: string;
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}