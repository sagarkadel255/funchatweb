"use client";

import { Phone, Video, PhoneIncoming, PhoneMissed, PhoneOutgoing } from "lucide-react";
import Image from "next/image";
import { useCall } from "@/lib/hooks/usecall";
import { useAuthStore } from "@/lib/store/authstore";
import { getInitials, getAvatarColor, formatTime, formatCallDuration } from "@/lib/utils/formatters";
import { getImageUrl } from "@/lib/utils/getimageurl";

export default function CallList() {
  const { callHistory, loading } = useCall();
  const { user } = useAuthStore();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="fc-card flex items-center gap-4">
            <div className="skeleton w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 rounded w-36" />
              <div className="skeleton h-3 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (callHistory.length === 0) {
    return (
      <div className="fc-card text-center py-16">
        <div className="text-5xl mb-4">📞</div>
        <p className="font-bold text-lg mb-1">No call history</p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Your voice and video calls will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {callHistory.map((call) => {
        const callerId = typeof call.callerId === "string" ? call.callerId : call.callerId._id;
        const recipientId = typeof call.recipientId === "string" ? call.recipientId : call.recipientId._id;
        const isOutgoing = callerId === user?.id;
        const other = isOutgoing
          ? (typeof call.recipientId === "string" ? null : call.recipientId)
          : (typeof call.callerId === "string" ? null : call.callerId);
        const name = other?.username || "Unknown";
        const isMissed = call.status === "missed";

        return (
          <div key={call._id} className="fc-card flex items-center gap-4">
            <div className="fc-avatar w-12 h-12 flex-shrink-0">
              {other?.profileImage ? (
                <Image src={getImageUrl(other.profileImage) || ""} alt={name} width={48} height={48} className="object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${getAvatarColor(name)}`}>
                  {getInitials(name)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {isMissed ? (
                  <PhoneMissed className="w-3.5 h-3.5" style={{ color: "var(--accent-red)" }} />
                ) : isOutgoing ? (
                  <PhoneOutgoing className="w-3.5 h-3.5" style={{ color: "var(--accent-blue)" }} />
                ) : (
                  <PhoneIncoming className="w-3.5 h-3.5" style={{ color: "var(--accent-teal)" }} />
                )}
                <span className="text-xs" style={{
                  color: isMissed ? "var(--accent-red)" :
                    isOutgoing ? "var(--accent-blue)" : "var(--accent-teal)"
                }}>
                  {isMissed ? "Missed" : isOutgoing ? "Outgoing" : "Incoming"}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>·</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {call.duration ? formatCallDuration(call.duration) : "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {formatTime(call.createdAt)}
              </p>
              <div className="w-8 h-8 flex items-center justify-center rounded-xl"
                style={{
                  background: call.callType === "video" ? "rgba(77,201,201,0.1)" : "rgba(77,168,218,0.1)",
                  color: call.callType === "video" ? "var(--accent-teal)" : "var(--accent-blue)"
                }}>
                {call.callType === "video" ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}