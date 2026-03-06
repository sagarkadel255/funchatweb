"use client";

import { useState } from "react";
import { X, Clock, Send } from "lucide-react";
import Image from "next/image";
import { useFriend } from "@/lib/hooks/usefriend";
import { getInitials, getAvatarColor, formatTime } from "@/lib/utils/formatters";
import toast from "react-hot-toast";
import { getImageUrl } from "@/lib/utils/getimageurl";

export default function FriendRequestSent() {
  const { sentRequests, cancelRequest } = useFriend();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleCancel = async (requestId: string) => {
    setLoadingId(requestId);
    await cancelRequest(requestId);
    setLoadingId(null);
    setConfirmId(null);
  };

  if (sentRequests.length === 0) {
    return (
      <div className="fc-card text-center py-20">
        <div className="text-6xl mb-4">📤</div>
        <p className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          No sent requests
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Friend requests you've sent will appear here while they're pending
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Count banner */}
      <div className="flex items-center gap-2 px-1 mb-2">
        <Send className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
        <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
          {sentRequests.length} pending sent request{sentRequests.length !== 1 ? "s" : ""}
        </p>
      </div>

      {sentRequests.map((req) => {
        const receiver = req.receiverId;
        const name = receiver?.username || "Unknown";
        const isLoading = loadingId === req._id;
        const isConfirming = confirmId === req._id;

        return (
          <div key={req._id} className="fc-card flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="fc-avatar w-14 h-14" style={{ border: "2px solid var(--border-hover)" }}>
                {receiver?.profileImage ? (
                  <Image src={getImageUrl(receiver.profileImage) || ""} alt={name} width={56} height={56} className="object-cover w-full h-full" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br ${getAvatarColor(name)}`}>
                    {getInitials(name)}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold">{name}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {receiver?.email}
              </p>
              {receiver?.bio && (
                <p className="text-sm mt-1.5 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                  {receiver.bio}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: "rgba(77,168,218,0.1)", color: "var(--accent-blue)", border: "1px solid rgba(77,168,218,0.15)" }}>
                  <Clock className="w-3 h-3" />
                  Pending · {formatTime(req.createdAt)}
                </span>
              </div>
            </div>

            {/* Cancel action */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              {isConfirming ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmId(null)}
                    className="btn-secondary py-2 px-4 text-sm flex-1 sm:flex-none">
                    Keep
                  </button>
                  <button
                    onClick={() => handleCancel(req._id)}
                    disabled={isLoading}
                    className="py-2 px-4 text-sm rounded-xl font-semibold transition-all flex items-center gap-1.5 flex-1 sm:flex-none"
                    style={{ background: "rgba(239,68,68,0.1)", color: "var(--accent-red)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin-icon" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(req._id)}
                  className="w-full sm:w-auto py-2 px-4 text-sm rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5"
                  style={{ background: "rgba(239,68,68,0.06)", color: "var(--accent-red)", border: "1px solid rgba(239,68,68,0.1)" }}>
                  <X className="w-4 h-4" />
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}