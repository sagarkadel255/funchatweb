export interface Call {
  _id: string;
  callerId: { _id: string; username: string; profileImage?: string } | string;
  recipientId: { _id: string; username: string; profileImage?: string } | string;
  callType: "voice" | "video";
  status: "pending" | "accepted" | "rejected" | "ended" | "missed";
  startTime?: string;
  endTime?: string;
  duration?: number;
  createdAt: string;
}

export interface IncomingCall {
  callId: string;
  callerId: string;
  callerName: string;
  callerImage?: string;
  callType: "voice" | "video";
  offer?: RTCSessionDescriptionInit;
}

export interface CallApiResponse {
  success: boolean;
  message?: string;
  data?: Call;
}

