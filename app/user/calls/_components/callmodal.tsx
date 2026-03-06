"use client";

import { Phone, PhoneOff, Video } from "lucide-react";
import Image from "next/image";
import { IncomingCall } from "@/lib/types";
import { getInitials, getAvatarColor } from "@/lib/utils/formatters";

interface Props {
  call: IncomingCall;
  onAccept: () => void;
  onReject: () => void;
}

export default function CallModal({ call, onAccept, onReject }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="text-center animate-slide-up">
        {/* Pulsing avatar rings */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-2 animate-pulse-ring"
            style={{ borderColor: "var(--accent-teal)" }} />
          <div className="absolute inset-2 rounded-full border-2 animate-pulse-ring"
            style={{ borderColor: "var(--accent-teal)", animationDelay: "0.4s" }} />
          <div className="fc-avatar w-28 h-28 relative z-10" style={{ border: "3px solid var(--accent-teal)" }}>
            {call.callerImage ? (
              <Image src={call.callerImage} alt={call.callerName} width={112} height={112} className="object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-br ${getAvatarColor(call.callerName)}`}>
                {getInitials(call.callerName)}
              </div>
            )}
          </div>
        </div>

        <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
          Incoming {call.callType === "video" ? "video" : "voice"} call
        </p>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          {call.callerName}
        </h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-8"
          style={{ background: "rgba(77,168,218,0.1)", border: "1px solid var(--border-hover)" }}>
          {call.callType === "video" ? (
            <Video className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
          ) : (
            <Phone className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
          )}
          <span className="text-sm capitalize" style={{ color: "var(--accent-blue)" }}>
            {call.callType} Call
          </span>
        </div>

        <div className="flex items-center justify-center gap-8">
          {/* Reject */}
          <div className="text-center">
            <button onClick={onReject}
              className="w-16 h-16 rounded-full flex items-center justify-center text-white mb-2 transition-all hover:scale-110 active:scale-95"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 20px rgba(239,68,68,0.4)" }}>
              <PhoneOff className="w-6 h-6" />
            </button>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Decline</p>
          </div>

          {/* Accept */}
          <div className="text-center">
            <button onClick={onAccept}
              className="w-16 h-16 rounded-full flex items-center justify-center text-white mb-2 transition-all hover:scale-110 active:scale-95"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 4px 20px rgba(34,197,94,0.4)" }}>
              {call.callType === "video" ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
            </button>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Accept</p>
          </div>
        </div>
      </div>
    </div>
  );
}