import mongoose, { Schema, Document } from "mongoose";

export interface ICall extends Document {
  _id: any;
  callerId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  callType: "voice" | "video";
  status: "pending" | "accepted" | "rejected" | "ended" | "missed";
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const callSchema = new Schema<ICall>(
  {
    callerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    callType: { type: String, enum: ["voice", "video"], required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected", "ended", "missed"], default: "pending" },
    startTime: Date,
    endTime: Date,
    duration: Number,
  },
  { timestamps: true }
);

callSchema.index({ callerId: 1, createdAt: -1 });

export const Call = mongoose.model<ICall>("Call", callSchema);