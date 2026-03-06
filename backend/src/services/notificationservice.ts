import { Notification, INotification } from "../models/notification";
import { User, IUser } from "../models/user";
import { NotFoundError, ValidationError } from "../errors";
import { io } from "../index";
import { Types } from "mongoose";

// Define a type for populated notification
type PopulatedNotification = INotification & {
  relatedUserId?: IUser | null;
};

export class NotificationService {
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    relatedUserId?: string,
    relatedMessageId?: string,
    relatedCallId?: string,
    data?: Record<string, any>
  ): Promise<INotification> {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // If there's a related user, get their info for the notification
    let relatedUserInfo = null;
    if (relatedUserId) {
      relatedUserInfo = await User.findById(relatedUserId).select('username profileImage email');
    }

    const notification = await Notification.create({
      userId, // This is the recipient's ID
      type,
      title,
      message,
      relatedUserId, // This is the sender's ID (for friend requests)
      relatedMessageId,
      relatedCallId,
      data: {
        ...data,
        relatedUserName: relatedUserInfo?.username,
        relatedUserImage: relatedUserInfo?.profileImage
      },
    });

    // Get the fully populated notification for real-time push
    const populatedNotification = await Notification.findById(notification._id)
      .populate<{ relatedUserId: IUser | null }>("relatedUserId", "username profileImage email")
      .lean();

    // ── REAL-TIME PUSH ──
    if (io && populatedNotification) {
      // Format the payload with proper user data
      const payload = {
        _id: populatedNotification._id.toString(),
        userId: populatedNotification.userId.toString(),
        type: populatedNotification.type,
        title: populatedNotification.title,
        message: populatedNotification.message,
        relatedUserId: populatedNotification.relatedUserId ? {
          _id: populatedNotification.relatedUserId._id.toString(),
          username: populatedNotification.relatedUserId.username || 'User',
          profileImage: populatedNotification.relatedUserId.profileImage,
          email: populatedNotification.relatedUserId.email
        } : null,
        relatedMessageId: populatedNotification.relatedMessageId?.toString(),
        relatedCallId: populatedNotification.relatedCallId?.toString(),
        data: populatedNotification.data,
        createdAt: populatedNotification.createdAt.toISOString(),
        isRead: populatedNotification.isRead,
      };

      // CRITICAL FIX: Emit ONLY to the recipient's room (userId)
      // The recipient is the user who should see this notification
      
      // For friend requests, emit to the recipient
      if (type === "friend_request") {
        io.to(userId).emit("newFriendRequest", payload);
        console.log(`[Socket] Emitted newFriendRequest to recipient ${userId} from sender ${relatedUserInfo?.username}`);
      } 
      // For friend accepted, emit to the original requester
      else if (type === "friend_accepted") {
        io.to(userId).emit("newNotification", payload);
        console.log(`[Socket] Emitted friend_accepted to ${userId} from ${relatedUserInfo?.username}`);
      }
      // For all other notifications
      else {
        io.to(userId).emit("newNotification", payload);
      }

      // Update unread count in real-time for the recipient only
      const unreadCount = await this.getUnreadCount(userId);
      io.to(userId).emit("notification:count", { unreadCount });

      console.log(
        `[Socket] Emitted notification to user ${userId} from ${relatedUserInfo?.username || 'system'} (unread: ${unreadCount})`
      );
    } else {
      console.warn("[NotificationService] io is undefined or notification not found — no real-time push");
    }

    return notification;
  }

  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    isRead?: boolean
  ) {
    // CRITICAL FIX: This query ensures ONLY the logged-in user's notifications are returned
    const query: any = { userId };

    if (isRead !== undefined) {
      query.isRead = isRead;
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate<{ relatedUserId: IUser | null }>({
        path: "relatedUserId",
        select: "username profileImage email",
        model: User
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Format the response to ensure relatedUserId is always an object when it exists
    const formattedNotifications = notifications.map(notif => ({
      ...notif,
      _id: notif._id.toString(),
      userId: notif.userId.toString(),
      relatedUserId: notif.relatedUserId ? {
        _id: notif.relatedUserId._id.toString(),
        username: notif.relatedUserId.username || 'User',
        profileImage: notif.relatedUserId.profileImage,
        email: notif.relatedUserId.email
      } : null,
      relatedMessageId: notif.relatedMessageId?.toString(),
      relatedCallId: notif.relatedCallId?.toString(),
      createdAt: notif.createdAt.toISOString(),
      updatedAt: notif.updatedAt.toISOString(),
      readAt: notif.readAt?.toISOString()
    }));

    return {
      data: formattedNotifications,
      total,
      page,
      pages: Math.ceil(total / limit),
      unread: await Notification.countDocuments({ userId, isRead: false }),
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({
      userId,
      isRead: false,
    });
  }

  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<INotification> {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (notification.userId.toString() !== userId) {
      throw new ValidationError("Cannot read other user's notifications");
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    // Update unread count after marking as read
    if (io) {
      const unreadCount = await this.getUnreadCount(userId);
      io.to(userId).emit("notification:count", { unreadCount });
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    // Update unread count after marking all as read
    if (io) {
      io.to(userId).emit("notification:count", { unreadCount: 0 });
    }

    return result.modifiedCount;
  }

  async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<void> {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (notification.userId.toString() !== userId) {
      throw new ValidationError("Cannot delete other user's notifications");
    }

    await Notification.findByIdAndDelete(notificationId);

    // Update unread count after deletion
    if (io) {
      const unreadCount = await this.getUnreadCount(userId);
      io.to(userId).emit("notification:count", { unreadCount });
    }
  }

  async deleteAllNotifications(userId: string): Promise<number> {
    const result = await Notification.deleteMany({ userId });

    // Update unread count after deletion
    if (io) {
      io.to(userId).emit("notification:count", { unreadCount: 0 });
    }

    return result.deletedCount;
  }

  async deleteOldNotifications(
    userId: string,
    days: number = 30
  ): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await Notification.deleteMany({
      userId,
      createdAt: { $lt: date },
    });

    return result.deletedCount;
  }

  async getNotificationsByType(
    userId: string,
    type: string,
    page: number = 1,
    limit: number = 20
  ) {
    const total = await Notification.countDocuments({ userId, type });
    const notifications = await Notification.find({ userId, type })
      .populate<{ relatedUserId: IUser | null }>({
        path: "relatedUserId",
        select: "username profileImage email",
        model: User
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Format the response
    const formattedNotifications = notifications.map(notif => ({
      ...notif,
      _id: notif._id.toString(),
      userId: notif.userId.toString(),
      relatedUserId: notif.relatedUserId ? {
        _id: notif.relatedUserId._id.toString(),
        username: notif.relatedUserId.username || 'User',
        profileImage: notif.relatedUserId.profileImage,
        email: notif.relatedUserId.email
      } : null,
      relatedMessageId: notif.relatedMessageId?.toString(),
      relatedCallId: notif.relatedCallId?.toString(),
      createdAt: notif.createdAt.toISOString(),
      updatedAt: notif.updatedAt.toISOString(),
      readAt: notif.readAt?.toISOString()
    }));

    return {
      data: formattedNotifications,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async broadcastNotification(
  title: string,
  message: string,
  type: string = "system"
): Promise<number> {
  const users = await User.find().select("_id");

  const notifications = users.map((user) => ({
    userId: user._id,
    type,
    title,
    message,
  }));

  const result = await Notification.insertMany(notifications);
  
  // Send real-time updates to all users individually
  if (io) {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const notification = result[i]; // Get the inserted notification with _id
      
      if (notification) {
        // Get populated user info
        const populatedNotification = await Notification.findById(notification._id)
          .populate<{ relatedUserId: IUser | null }>("relatedUserId", "username profileImage email")
          .lean();

        if (populatedNotification) {
          const payload = {
            _id: populatedNotification._id.toString(),
            userId: populatedNotification.userId.toString(),
            type: populatedNotification.type,
            title: populatedNotification.title,
            message: populatedNotification.message,
            relatedUserId: null, // Broadcast notifications have no related user
            relatedMessageId: populatedNotification.relatedMessageId?.toString(),
            relatedCallId: populatedNotification.relatedCallId?.toString(),
            data: populatedNotification.data,
            createdAt: populatedNotification.createdAt.toISOString(),
            isRead: populatedNotification.isRead,
          };

          io.to(user._id.toString()).emit("newNotification", payload);
        }
      }
      
      // Update unread count
      const unreadCount = await this.getUnreadCount(user._id.toString());
      io.to(user._id.toString()).emit("notification:count", { unreadCount });
    }
  }

  return result.length;
 }
}