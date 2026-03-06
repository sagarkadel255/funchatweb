import { User } from "../models/user";
import { FriendRequest } from "../models/friendrequest";
import { UserRepository } from "../repositories/userrepository";
import { NotificationService } from "../services/notificationservice";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../errors";

export class FriendService {
  private userRepo = new UserRepository();
  private notificationService = new NotificationService();

  async cancelRequest(requestId: string, senderId: string) {
  const request = await FriendRequest.findById(requestId);
  if (!request) throw new NotFoundError("Request not found");
  if (request.senderId.toString() !== senderId) {
    throw new ValidationError("Not your request");
  }
  await request.deleteOne();
  return;}

  // ================= SEND FRIEND REQUEST =================
  async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new ValidationError("Cannot send request to yourself");
    }

    const sender = await this.userRepo.findById(senderId);
    const receiver = await this.userRepo.findById(receiverId);

    if (!sender || !receiver) {
      throw new NotFoundError("User not found");
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      status: "pending",
    });

    if (existing) {
      throw new ConflictError("Request already exists");
    }

    const request = await FriendRequest.create({
      senderId,
      receiverId,
    });

    // 🔔 Create Notification (using NotificationService)
    await this.notificationService.createNotification(
      receiverId,
      "friend_request",
      `${sender.username} sent you a friend request`,
      "New friend request",
      senderId
    );

    return request;
  }

  // ================= ACCEPT FRIEND REQUEST =================
  async acceptRequest(requestId: string) {
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      throw new NotFoundError("Request not found");
    }

    request.status = "accepted";
    await request.save();

    await this.userRepo.addFriend(
      request.senderId.toString(),
      request.receiverId.toString()
    );

    const receiver = await this.userRepo.findById(
      request.receiverId.toString()
    );

    // 🔔 Notify sender that request was accepted
    await this.notificationService.createNotification(
      request.senderId.toString(),
      "friend_accepted",
      `${receiver?.username || "User"} accepted your friend request`,
      "You are now friends",
      request.receiverId.toString()
    );

    return request;
  }

  // ================= REJECT FRIEND REQUEST =================
  async rejectRequest(requestId: string) {
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      throw new NotFoundError("Request not found");
    }

    request.status = "rejected";
    await request.save();

    return request;
  }

  // ================= GET FRIEND REQUESTS =================
  async getFriendRequests(
    userId: string,
    type: "sent" | "received" = "received"
  ) {
    const query =
      type === "sent"
        ? { senderId: userId, status: "pending" }
        : { receiverId: userId, status: "pending" };

    return await FriendRequest.find(query)
      .populate("senderId receiverId", "username email profileImage")
      .sort({ createdAt: -1 });
  }

  // ================= GET FRIENDS =================
  async getFriends(userId: string, page: number = 1) {
    return await this.userRepo.findFriends(userId, page);
  }

  // ================= BLOCK USER =================
  async blockUser(userId: string, blockId: string) {
    await this.userRepo.blockUser(userId, blockId);
  }

  // ================= UNBLOCK USER =================
  async unblockUser(userId: string, unblockId: string) {
    await this.userRepo.unblockUser(userId, unblockId);
  }

  // ================= REMOVE FRIEND =================
  async removeFriend(userId: string, friendId: string) {
    await this.userRepo.removeFriend(userId, friendId);
  }
}
