import { User, IUser } from "../models/user";

export class UserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    return await User.create(data);
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async findFriends(userId: string, page: number = 1, limit: number = 20) {
    const user = await User.findById(userId).populate("friends");
    if (!user) return null;

    const start = (page - 1) * limit;
    const friends = user.friends.slice(start, start + limit);
    return {
      data: friends,
      total: user.friends.length,
      page,
      pages: Math.ceil(user.friends.length / limit),
    };
  }

  async search(query: string, limit: number = 20): Promise<IUser[]> {
    return await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .limit(limit)
      .select("-password");
  }

  async getAll(page: number = 1, limit: number = 20) {
    const total = await User.countDocuments();
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-password");

    return {
      data: users,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async addFriend(userId: string, friendId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: friendId },
    });
    await User.findByIdAndUpdate(friendId, {
      $addToSet: { friends: userId },
    });
  }

  async blockUser(userId: string, blockId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: blockId },
      $pull: { friends: blockId },
    });
  }

  async unblockUser(userId: string, unblockId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: unblockId },
    });
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });
  }
}