import { Call } from "../models/call";
import { NotificationService } from "../services/notificationservice";
import { UserRepository } from "../repositories/userrepository";
import { NotFoundError, ValidationError } from "../errors";

export class CallService {
  private notificationService = new NotificationService();
  private userRepo = new UserRepository();

  // ================= INITIATE CALL =================
  async initiateCall(
    callerId: string,
    recipientId: string,
    callType: "voice" | "video"
  ) {
    // Auto-clear stale pending/accepted calls for BOTH the caller and recipient.
    // This covers cases where a previous call was not properly terminated (tab close,
    // network drop, app reload, etc.) and avoids the "User is already in a call" error.
    await Call.updateMany(
      {
        $or: [
          { callerId },
          { recipientId: callerId },
          { callerId: recipientId },
          { recipientId },
        ],
        status: { $in: ["pending", "accepted"] },
      },
      { $set: { status: "ended", endTime: new Date() } }
    );

    const caller = await this.userRepo.findById(callerId);
    if (!caller) {
      throw new NotFoundError("Caller not found");
    }

    const call = await Call.create({
      callerId,
      recipientId,
      callType,
      status: "pending",
    });

    // 🔔 Create notification using NotificationService
    await this.notificationService.createNotification(
      recipientId,
      "call",
      `${caller.username} is calling...`,
      `Incoming ${callType} call`,
      callerId,
      undefined,
      call._id.toString()
    );

    return call;
  }

  // ================= ACCEPT CALL =================
  async acceptCall(callId: string, userId: string) {
    const call = await Call.findById(callId);
    if (!call) throw new NotFoundError("Call not found");

    if (call.recipientId.toString() !== userId) {
      throw new ValidationError("Only recipient can accept");
    }

    call.status = "accepted";
    call.startTime = new Date();
    await call.save();

    return call;
  }

  // ================= REJECT CALL =================
  async rejectCall(callId: string, userId: string) {
    const call = await Call.findById(callId);
    if (!call) throw new NotFoundError("Call not found");

    call.status = "rejected";
    await call.save();

    return call;
  }

  // ================= END CALL =================
  async endCall(callId: string, userId: string) {
    const call = await Call.findById(callId);
    if (!call) throw new NotFoundError("Call not found");

    call.status = "ended";
    call.endTime = new Date();

    if (call.startTime) {
      const duration = Math.round(
        (call.endTime.getTime() - call.startTime.getTime()) / 1000
      );
      call.duration = duration;
    }

    await call.save();
    return call;
  }

  // ================= CALL HISTORY =================
  async getCallHistory(userId: string, page: number = 1) {
    const limit = 20;

    const total = await Call.countDocuments({
      $or: [{ callerId: userId }, { recipientId: userId }],
    });

    const calls = await Call.find({
      $or: [{ callerId: userId }, { recipientId: userId }],
    })
      .populate("callerId recipientId", "-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      data: calls,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // ================= MISSED CALLS =================
  async getMissedCalls(userId: string) {
    return await Call.find({
      recipientId: userId,
      status: "missed",
    })
      .populate("callerId", "-password")
      .sort({ createdAt: -1 });
  }

  // ================= CLEAR STALE CALLS =================
  // Marks any pending/accepted calls involving this user as ended.
  // Called by the frontend before initiating a new call to clear
  // stale records left when a previous call was not properly terminated.
  async clearActiveCalls(userId: string) {
    const result = await Call.updateMany(
      {
        $or: [{ callerId: userId }, { recipientId: userId }],
        status: { $in: ["pending", "accepted"] },
      },
      {
        $set: { status: "ended", endTime: new Date() },
      }
    );
    return result.modifiedCount;
  }
}
