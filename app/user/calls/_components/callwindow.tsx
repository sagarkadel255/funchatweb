"use client";

import { useRef, useEffect } from "react";
import { MicOff, Mic, VideoOff, Video, PhoneOff, Volume2 } from "lucide-react";
import { Call } from "@/lib/types";

interface Props {
  call: Call;
  callType: "voice" | "video";
  callStatus: string;
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  remoteStream?: MediaStream | null;
}

export default function CallWindow({
  call, callType, callStatus, isMuted, isVideoOff,
  onToggleMute, onToggleVideo, onEndCall, localStreamRef, remoteStream,
}: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localStreamRef.current]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const statusLabel: Record<string, string> = {
    calling: "Calling...",
    ringing: "Ringing...",
    connected: "Connected",
    ended: "Call ended",
  };

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: "#0a1020" }}>
      {/* Remote video (full screen) */}
      {callType === "video" ? (
        <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0d1630, #172448)" }}>
          <div className="text-center">
            <div className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold text-white mx-auto mb-4"
              style={{ background: "var(--gradient-blue)", boxShadow: "var(--shadow-glow)" }}>
              📞
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.7) 100%)" }} />

      {/* Status */}
      <div className="relative z-10 text-center pt-12">
        <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
          {statusLabel[callStatus] || callStatus}
        </p>
        <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
          {typeof call.callerId === "object" && call.callerId?.username
            ? call.callerId.username
            : typeof call.recipientId === "object" && call.recipientId?.username
            ? call.recipientId.username
            : "User"}
        </p>
      </div>

      {/* Local video PiP */}
      {callType === "video" && (
        <div className="absolute top-4 right-4 z-20 w-32 h-44 rounded-2xl overflow-hidden shadow-2xl"
          style={{ border: "2px solid rgba(255,255,255,0.2)" }}>
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: "#0d1630" }}>
              <VideoOff className="w-8 h-8" style={{ color: "var(--text-muted)" }} />
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-12 left-0 right-0 z-10 flex items-center justify-center gap-6">
        <div className="text-center">
          <button onClick={onToggleMute}
            className="w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all hover:scale-105"
            style={{ background: isMuted ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.15)" }}>
            {isMuted ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5 text-white" />}
          </button>
          <p className="text-xs text-white/60">{isMuted ? "Unmute" : "Mute"}</p>
        </div>

        {callType === "video" && (
          <div className="text-center">
            <button onClick={onToggleVideo}
              className="w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all hover:scale-105"
              style={{ background: isVideoOff ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.15)" }}>
              {isVideoOff ? <VideoOff className="w-5 h-5 text-red-400" /> : <Video className="w-5 h-5 text-white" />}
            </button>
            <p className="text-xs text-white/60">{isVideoOff ? "Show" : "Hide"}</p>
          </div>
        )}

        <div className="text-center">
          <button onClick={onEndCall}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 20px rgba(239,68,68,0.4)" }}>
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
          <p className="text-xs text-white/60">End</p>
        </div>
      </div>
    </div>
  );
}