import mongoose, { Schema, Document } from "mongoose";

export interface IFriendRequest extends Document {
  _id: any;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

friendRequestSchema.index({ senderId: 1, receiverId: 1 });

export const FriendRequest = mongoose.model<IFriendRequest>("FriendRequest", friendRequestSchema);