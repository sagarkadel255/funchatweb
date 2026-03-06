import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  _id: any;
  participants: mongoose.Types.ObjectId[];
  conversationType: "direct" | "group";
  groupName?: string;
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    conversationType: { type: String, enum: ["direct", "group"], default: "direct" },
    groupName: String,
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    lastMessageTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);