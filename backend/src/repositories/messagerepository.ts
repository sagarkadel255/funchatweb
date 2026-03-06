import { Message, IMessage } from "../models/message";
import { Conversation } from "../models/conversation";

export class MessageRepository {
  async create(data: Partial<IMessage>): Promise<IMessage> {
    const message = await Message.create(data);

    const conversation = await Conversation.findById(data.conversationId);
    if (conversation) {
      conversation.lastMessage = message._id;
      conversation.lastMessageTime = new Date();
      await conversation.save();
    }

    return message;
  }

  async findById(id: string): Promise<IMessage | null> {
    return await Message.findById(id)
      .populate("sender receiver replyTo")
      .select("-__v");
  }

  async findByConversation(conversationId: string, page: number = 1, limit: number = 50) {
    const total = await Message.countDocuments({
      conversationId,
      isDeleted: false,
    });

    const messages = await Message.find({
      conversationId,
      isDeleted: false,
    })
      .populate("sender receiver replyTo")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-__v");

    return {
      data: messages.reverse(),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: Partial<IMessage>): Promise<IMessage | null> {
    return await Message.findByIdAndUpdate(id, data, {
      new: true,
      select: "-__v",
    }).populate("sender receiver replyTo");
  }

  async delete(id: string): Promise<void> {
    await Message.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
      content: "",
    });
  }

  async markAsSeen(messageIds: string[], userId: string): Promise<void> {
    await Message.updateMany(
      { _id: { $in: messageIds } },
      {
        $set: { status: "seen" },
        $addToSet: { seenBy: { userId, seenAt: new Date() } },
      }
    );
  }

  async search(conversationId: string, query: string, page: number = 1, limit: number = 20) {
    const messages = await Message.find({
      conversationId,
      content: { $regex: query, $options: "i" },
      isDeleted: false,
    })
      .populate("sender receiver")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-__v");

    return messages;
  }

  async deleteUserMessages(userId: string): Promise<void> {
    await Message.deleteMany({
      $or: [{ sender: userId }, { receiver: userId }],
    });
  }
}