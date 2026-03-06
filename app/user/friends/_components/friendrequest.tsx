"use client";

import { useState } from "react";
import { Check, X, Clock } from "lucide-react";
import Image from "next/image";
import { useFriend } from "@/lib/hooks/usefriend";
import { getInitials, getAvatarColor, formatTime } from "@/lib/utils/formatters";
import { getImageUrl } from "@/lib/utils/getimageurl";

export default function FriendRequestReceived() {
  const { friendRequests, acceptRequest, rejectRequest, loadFriends } = useFriend();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAccept = async (requestId: string) => {
    setLoadingId(requestId);
    await acceptRequest(requestId);
    await loadFriends(); // Force refresh friends list
    setLoadingId(null);
  };

  const handleReject = async (requestId: string) => {
    setLoadingId(requestId);
    await rejectRequest(requestId);
    setLoadingId(null);
  };

  if (friendRequests.length === 0) {
    return (
      <div className="fc-card text-center py-20">
        <div className="text-6xl mb-4">📬</div>
        <p className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          No pending requests
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          When someone sends you a friend request, it'll appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1 mb-2">
        <Clock className="w-4 h-4" style={{ color: "var(--accent-teal)" }} />
        <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
          {friendRequests.length} pending request{friendRequests.length !== 1 ? "s" : ""}
        </p>
      </div>

      {friendRequests.map((req) => {
        const sender = req.senderId;
        const name = typeof sender === 'object' ? sender?.username || "Unknown" : "Unknown";
        const isLoading = loadingId === req._id;

        return (
          <div key={req._id} className="fc-card flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="fc-avatar w-14 h-14" style={{ border: "2px solid var(--border-hover)" }}>
                {typeof sender === 'object' && sender?.profileImage ? (
                  <Image src={getImageUrl(sender.profileImage) || ""} alt={name} width={56} height={56} className="object-cover w-full h-full" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br ${getAvatarColor(name)}`}>
                    {getInitials(name)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold">{name}</p>
              {typeof sender === 'object' && sender?.email && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {sender.email}
                </p>
              )}
              <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                <Clock className="w-3 h-3" />
                Sent {formatTime(req.createdAt)}
              </p>
            </div>

            <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={() => handleAccept(req._id)}
                disabled={isLoading}
                className="btn-primary flex-1 sm:flex-none py-2 px-4 text-sm">
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Accept
              </button>
              <button
                onClick={() => handleReject(req._id)}
                disabled={isLoading}
                className="btn-secondary flex-1 sm:flex-none py-2 px-4 text-sm">
                <X className="w-4 h-4" />
                Decline
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}