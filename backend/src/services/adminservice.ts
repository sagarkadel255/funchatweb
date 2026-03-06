import { User } from "../models/user";
import { Message } from "../models/message";
import { Call } from "../models/call";
import { UserRepository } from "../repositories/userrepository";
import { MessageRepository } from "../repositories/messagerepository";
import { NotFoundError } from "../errors";

export class AdminService {
  private userRepo = new UserRepository();
  private messageRepo = new MessageRepository();

  async getStats() {
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();
    const totalCalls = await Call.countDocuments();
    const onlineUsers = await User.countDocuments({ status: "online" });

    return {
      totalUsers,
      totalMessages,
      totalCalls,
      onlineUsers,
      offlineUsers: totalUsers - onlineUsers,
    };
  }

  async getAllUsers(page: number = 1) {
    const limit = 20;
    const total = await User.countDocuments();
    const users = await User.find()
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      data: users,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getUserById(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  async deleteUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    await this.userRepo.delete(userId);
    await this.messageRepo.deleteUserMessages(userId);
    await Call.deleteMany({
      $or: [{ callerId: userId }, { recipientId: userId }],
    });
  }

  async banUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    user.status = "offline";
    await user.save();
  }

  async getMessageStats() {
    const total = await Message.countDocuments();
    const byType = await Message.aggregate([
      {
        $group: {
          _id: "$messageType",
          count: { $sum: 1 },
        },
      },
    ]);

    return { total, byType };
  }
}