import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  _id: any;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "video" | "audio" | "file";
  media?: { url: string; mimetype: string; size: number };
  replyTo?: mongoose.Types.ObjectId;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  status: "sent" | "delivered" | "seen";
  seenBy: Array<{ userId: mongoose.Types.ObjectId; seenAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    content: { type: String, maxlength: 5000 },
    messageType: { type: String, enum: ["text", "image", "video", "audio", "file"], default: "text" },
    media: { url: String, mimetype: String, size: Number },
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
    isEdited: { type: Boolean, default: false },
    editedAt: Date,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    status: { type: String, enum: ["sent", "delivered", "seen"], default: "sent" },
    seenBy: [{ userId: { type: Schema.Types.ObjectId, ref: "User" }, seenAt: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);