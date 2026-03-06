import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  _id: any;
  userId: mongoose.Types.ObjectId;
  type: "message" | "call" | "friend_request" | "friend_accepted" | "system";
  title: string;
  message: string;
  relatedUserId?: mongoose.Types.ObjectId;
  relatedMessageId?: mongoose.Types.ObjectId;
  relatedCallId?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["message", "call", "friend_request", "friend_accepted", "system"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    relatedMessageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    relatedCallId: {
      type: Schema.Types.ObjectId,
      ref: "Call",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    data: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);