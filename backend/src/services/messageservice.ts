import { Conversation } from "../models/conversation";
import { Message } from "../models/message";
import { MessageRepository } from "../repositories/messagerepository";
import { UserRepository } from "../repositories/userrepository";
import { NotificationService } from "../services/notificationservice";
import { NotFoundError, ValidationError } from "../errors";
import { Types } from "mongoose";
import { io } from "../index";

export class MessageService {
  private messageRepo = new MessageRepository();
  private userRepo = new UserRepository();
  private notificationService = new NotificationService();

  // ================= GET OR CREATE CONVERSATION =================
  async getOrCreateConversation(userId1: string, userId2: string) {
    let conversation = await Conversation.findOne({
      conversationType: "direct",
      participants: { $all: [userId1, userId2] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId1, userId2],
        conversationType: "direct",
      });
    }

    return conversation;
  }

  // ================= SEND MESSAGE =================
  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string
  ) {
    const sender = await this.userRepo.findById(senderId);
    const receiver = await this.userRepo.findById(receiverId);

    if (!sender || !receiver) {
      throw new NotFoundError("User not found");
    }

    if (receiver.blockedUsers.includes(new Types.ObjectId(senderId))) {
      throw new ValidationError("You have been blocked by this user");
    }

    const conversation = await this.getOrCreateConversation(
      senderId,
      receiverId
    );

    const message = await this.messageRepo.create({
      sender: new Types.ObjectId(senderId),
      receiver: new Types.ObjectId(receiverId),
      conversationId: conversation._id,
      content,
      status: "sent",
    });

    // Populate message fields so the receiver gets a rich object via socket
    const populatedMessage = await Message.findById(message._id)
      .populate("sender receiver replyTo")
      .select("-__v")
      .lean();

    // Emit real-time message delivery to the receiver's room
    if (io && populatedMessage) {
      io.to(receiverId).emit("message:received", populatedMessage);
    }

    // 🔔 Create Notification using NotificationService
    await this.notificationService.createNotification(
      receiverId,
      "message",
      `New message from ${sender.username}`,
      content.substring(0, 50),
      senderId,
      message._id.toString()
    );

    return populatedMessage ?? message;
  }

  // ================= EDIT MESSAGE =================
  async editMessage(messageId: string, userId: string, content: string) {
    const message = await Message.findById(messageId);
    if (!message) throw new NotFoundError("Message not found");

    if (message.sender.toString() !== userId) {
      throw new ValidationError("Can only edit your own messages");
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    return message;
  }

  // ================= DELETE MESSAGE =================
  async deleteMessage(messageId: string, userId: string) {
    const message = await Message.findById(messageId);
    if (!message) throw new NotFoundError("Message not found");

    if (message.sender.toString() !== userId) {
      throw new ValidationError("Can only delete your own messages");
    }

    await this.messageRepo.delete(messageId);
  }

  // ================= MARK AS SEEN =================
  async markAsSeen(messageIds: string[], userId: string) {
    await this.messageRepo.markAsSeen(messageIds, userId);

    // Notify the original senders that their messages were seen
    if (io && messageIds.length > 0) {
      const msgs = await Message.find({ _id: { $in: messageIds } }).select("sender").lean();
      const senderIds = [...new Set(msgs.map((m) => m.sender.toString()))];
      senderIds.forEach((senderId) => {
        io.to(senderId).emit("message:seen", { messageIds });
      });
    }
  }

  // ================= GET CONVERSATIONS =================
  async getConversations(userId: string, page: number = 1) {
    const limit = 20;

    // Explicit ObjectId cast avoids a Mongoose CastError 500 if
    // the string value from the JWT is ever in an unexpected format
    const userOid = new Types.ObjectId(userId);

    const conversations = await Conversation.find({
      participants: userOid,
    })
      .populate({ path: "participants", select: "-password" })
      .populate("lastMessage")
      .sort({ lastMessageTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Conversation.countDocuments({
      participants: userOid,
    });

    return {
      data: conversations,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // ================= GET MESSAGES =================
  async getMessages(conversationId: string, page: number = 1) {
    return await this.messageRepo.findByConversation(
      conversationId,
      page
    );
  }

  // ================= SEARCH MESSAGES =================
  async searchMessages(conversationId: string, query: string) {
    return await this.messageRepo.search(conversationId, query);
  }
}
