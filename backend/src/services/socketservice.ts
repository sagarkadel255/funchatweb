import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { MessageService } from "./messageservice";
import { NotificationService } from "./notificationservice";
import { config } from "../config/env";

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
  };
}

// Multi-device support → userId → Set<socketId>
const onlineUsers = new Map<string, Set<string>>();

export class SocketService {
  private messageService = new MessageService();
  private notificationService = new NotificationService();

  constructor(private io: Server) {
    this.setupMiddleware();
    this.setupEvents();
  }

  static getOnlineUsers() {
    return onlineUsers;
  }

  // ================= SOCKET AUTH MIDDLEWARE =================
  private setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Unauthorized: No token provided"));
      }

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as {
          id: string;
        };

        (socket as AuthenticatedSocket).data.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error("Unauthorized: Invalid token"));
      }
    });
  }

  // ================= MAIN SOCKET EVENTS =================
  private setupEvents() {
    this.io.on("connection", async (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      const userId = authSocket.data.userId;

      console.log("✅ Socket connected:", socket.id, "User:", userId);

      // ===== CRITICAL: Join user to their personal room =====
      // This ensures notifications sent to this room only go to this user
      socket.join(userId);
      console.log(`[Socket] User ${userId} joined personal room`);

      // ===== USER ONLINE =====
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }

      onlineUsers.get(userId)!.add(socket.id);

      await User.findByIdAndUpdate(userId, {
        status: "online",
        lastSeen: new Date(),
      });

      // Broadcast to ALL users that this user is online
      this.io.emit("user:status", { userId, status: "online" });

      // ================= SEND MESSAGE =================
      // messageService.sendMessage now emits "message:received" internally,
      // so no extra emit is needed here.
      socket.on(
        "message:send",
        async (data: { receiverId: string; content: string }) => {
          if (!data.receiverId || !data.content) return;

          try {
            await this.messageService.sendMessage(
              userId,
              data.receiverId,
              data.content
            );
            console.log(`[Socket] Message sent from ${userId} to ${data.receiverId}`);
          } catch (error) {
            socket.emit("error", { message: "Failed to send message" });
          }
        }
      );

      // ================= MESSAGE SEEN =================
      // messageService.markAsSeen now emits "message:seen" to senders internally.
      socket.on(
        "message:seen",
        async (data: { messageIds: string[]; senderId: string }) => {
          if (!data.messageIds?.length) return;

          try {
            await this.messageService.markAsSeen(data.messageIds, userId);
          } catch (error) {
            console.error("Error marking seen:", error);
          }
        }
      );

      // ================= TYPING =================
      socket.on(
        "typing:start",
        (data: { receiverId: string }) => {
          if (!data.receiverId) return;

          // Send typing indicator ONLY to the receiver's room
          this.io.to(data.receiverId).emit("typing:indicator", {
            senderId: userId,
            isTyping: true,
          });
        }
      );

      socket.on(
        "typing:end",
        (data: { receiverId: string }) => {
          if (!data.receiverId) return;

          // Send typing indicator ONLY to the receiver's room
          this.io.to(data.receiverId).emit("typing:indicator", {
            senderId: userId,
            isTyping: false,
          });
        }
      );

      // ================= WEBRTC SIGNALING =================
      socket.on(
        "call:offer",
        (data: {
          recipientId: string;
          callId: string;
          offer: any;
          callType: "voice" | "video";
          callerName: string;
          callerImage?: string;
        }) => {
          if (!data.recipientId) return;

          // Send call offer ONLY to the recipient's room
          this.io.to(data.recipientId).emit("incoming_call", {
            ...data,
            callerId: userId,
          });
          
          console.log(`[Socket] Call offer from ${userId} to ${data.recipientId}`);
        }
      );

      socket.on(
        "call:answer",
        (data: {
          callerId: string;
          callId: string;
          answer: any;
        }) => {
          if (!data.callerId) return;

          // Send call answer ONLY to the caller's room
          this.io.to(data.callerId).emit("call_answered", {
            callId: data.callId,
            answer: data.answer,
          });
        }
      );

      socket.on(
        "call:rejected",
        (data: { callerId: string; callId: string }) => {
          if (!data.callerId) return;

          // Send rejection ONLY to the caller's room
          this.io.to(data.callerId).emit("call_rejected", {
            callId: data.callId,
          });
        }
      );

      socket.on(
        "call:ended",
        (data: { otherUserId: string; callId: string }) => {
          if (!data.otherUserId) return;

          // Send end call signal ONLY to the other user's room
          this.io.to(data.otherUserId).emit("call_ended", {
            callId: data.callId,
          });
        }
      );

      socket.on(
        "ice_candidate",
        (data: {
          targetId: string;
          callId: string;
          candidate: any;
        }) => {
          if (!data.targetId) return;

          // Send ICE candidate ONLY to the target user's room
          this.io.to(data.targetId).emit("ice_candidate", {
            callId: data.callId,
            candidate: data.candidate,
          });
        }
      );

      // ================= GENERIC NOTIFICATION =================
      socket.on(
        "notification:create",
        async (data: {
          userId: string;
          type: string;
          title: string;
          message: string;
          relatedUserId?: string;
          relatedMessageId?: string;
          relatedCallId?: string;
        }) => {
          if (!data.userId) return;

          try {
            await this.notificationService.createNotification(
              data.userId,
              data.type,
              data.title,
              data.message,
              data.relatedUserId,
              data.relatedMessageId,
              data.relatedCallId
            );

            // Update unread count for the recipient only
            const unreadCount =
              await this.notificationService.getUnreadCount(
                data.userId
              );

            this.io.to(data.userId).emit("notification:new", {
              type: data.type,
              unreadCount,
            });
            
            console.log(`[Socket] Notification created for user ${data.userId}`);
          } catch (error) {
            console.error("Notification error:", error);
          }
        }
      );

      // ================= DISCONNECT =================
      socket.on("disconnect", async () => {
        console.log("❌ Socket disconnected:", socket.id, "User:", userId);

        const userSockets = onlineUsers.get(userId);
        if (!userSockets) return;

        userSockets.delete(socket.id);

        // Leave the personal room
        socket.leave(userId);

        // If no devices remain → mark offline
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          await User.findByIdAndUpdate(userId, {
            status: "offline",
            lastSeen: new Date(),
          });

          // Broadcast offline status to all users
          this.io.emit("user:status", {
            userId,
            status: "offline",
          });
          
          console.log(`[Socket] User ${userId} is now offline`);
        }
      });
    });
  }
}