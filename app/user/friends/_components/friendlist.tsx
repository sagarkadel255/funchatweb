"use client";

import { useEffect, useState } from "react";
import { Search, MessageSquare, Phone, Video, UserX } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFriend } from "@/lib/hooks/usefriend";
import { getInitials, getAvatarColor, formatTime } from "@/lib/utils/formatters";
import CallInitiator from "@/app/user/calls/_components/call-initiator";
import { Friend } from "@/lib/types";
import { getImageUrl } from "@/lib/utils/getimageurl";

type StatusFilter = "all" | "online" | "offline";

export default function FriendList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [callTarget, setCallTarget] = useState<{ friend: Friend; type: "voice" | "video" } | null>(null);
  const { friends, blockUser } = useFriend();
  const router = useRouter();
  useEffect(() => {
    console.log("👥 Friends in friendlist component:", friends);
    console.log("friend count:", Array.isArray(friends) ? friends.length : "not an array");
    if (!Array.isArray(friends)) {
      console.error("Expected friends to be an array, but got:", friends);
    }
  }, [friends]);

  // ── SAFE GUARD ── This line prevents "filter is not a function" crash
  const safeFriends = Array.isArray(friends) ? friends : [];

  const onlineCount = safeFriends.filter((f) => f.status === "online").length;

  const filtered = safeFriends.filter((f) => {
    const matchSearch =
      f.username.toLowerCase().includes(search.toLowerCase()) ||
      (f.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "online"
        ? f.status === "online"
        : f.status !== "online";
    return matchSearch && matchStatus;
  });

  if (safeFriends.length === 0) {
    return (
      <div className="fc-card text-center py-20">
        <div className="text-6xl mb-4">👥</div>
        <p className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          No friends yet
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Click <strong>Add Friend</strong> above to find and connect with people
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search friends by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="fc-input pl-10"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)" }}>
          {(["all", "online", "offline"] as StatusFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className="px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1.5"
              style={
                statusFilter === key
                  ? { background: "var(--gradient-teal)", color: "#fff" }
                  : { color: "var(--text-secondary)" }
              }
            >
              {key}
              {key === "online" && onlineCount > 0 && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(34,197,94,0.2)", color: "#22c55e" }}
                >
                  {onlineCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {search && (
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="fc-card text-center py-12">
          <div className="text-3xl mb-3">🔍</div>
          <p className="font-bold mb-1">No friends match</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Try adjusting your search or status filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((friend: Friend) => (  // ← Added explicit type here to avoid any implicit any
            <FriendCard
              key={friend._id}
              friend={friend}
              onMessage={() => router.push(`/user/chat`)}
              onVoiceCall={() => setCallTarget({ friend, type: "voice" })}
              onVideoCall={() => setCallTarget({ friend, type: "video" })}
              onBlock={() => blockUser(friend._id)}
            />
          ))}
        </div>
      )}

      {callTarget && (
        <CallInitiator
          friend={callTarget.friend}
          callType={callTarget.type}
          onClose={() => setCallTarget(null)}
        />
      )}
    </div>
  );
}

/* ── Individual card ── (unchanged) ── */
function FriendCard({
  friend,
  onMessage,
  onVoiceCall,
  onVideoCall,
  onBlock,
}: {
  friend: Friend;
  onMessage: () => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onBlock: () => void;
}) {
  const [confirmBlock, setConfirmBlock] = useState(false);

  const isOnline = friend.status === "online";
  const isAway = friend.status === "away";
  const statusColor = isOnline ? "#22c55e" : isAway ? "var(--accent-orange)" : "var(--text-muted)";
  const statusClass = isOnline ? "status-online" : isAway ? "status-away" : "status-offline";

  return (
    <div className="fc-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div className="fc-avatar w-14 h-14" style={{ border: "2px solid var(--border-hover)" }}>
            {friend.profileImage ? (
              <Image src={getImageUrl(friend.profileImage) || ""} alt={friend.username} width={56} height={56} className="object-cover w-full h-full" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br ${getAvatarColor(friend.username)}`}>
                {getInitials(friend.username)}
              </div>
            )}
          </div>
          <span className={`status-dot absolute -bottom-0.5 -right-0.5 ${statusClass}`}
            style={{ width: 13, height: 13, borderWidth: 2 }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{friend.username}</p>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{friend.email}</p>
          <p className="text-xs mt-0.5 font-medium capitalize" style={{ color: statusColor }}>
            ● {friend.status}
            {!isOnline && friend.lastSeen && (
              <span className="font-normal ml-1" style={{ color: "var(--text-muted)" }}>
                · {formatTime(friend.lastSeen)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Bio */}
      {friend.bio ? (
        <p className="text-xs mb-4 line-clamp-2 flex-1" style={{ color: "var(--text-secondary)" }}>
          {friend.bio}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      {/* Actions */}
      {confirmBlock ? (
        <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs mb-2.5 text-center" style={{ color: "var(--text-secondary)" }}>
            Block <strong style={{ color: "var(--text-primary)" }}>{friend.username}</strong>?
          </p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmBlock(false)} className="btn-secondary flex-1 py-1.5 text-xs">
              Cancel
            </button>
            <button
              onClick={() => { setConfirmBlock(false); onBlock(); }}
              className="flex-1 py-1.5 text-xs rounded-xl font-semibold transition-all flex items-center gap-1.5 sm:flex-none"
              style={{ background: "rgba(239,68,68,0.1)", color: "var(--accent-red)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <UserX className="w-4 h-4" />
              Block
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={onMessage}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
            style={{ background: "rgba(77,168,218,0.1)", color: "var(--accent-blue)", border: "1px solid rgba(77,168,218,0.15)" }}
            title="Send message">
            <MessageSquare className="w-3.5 h-3.5" />
            Message
          </button>
          <button
            onClick={onVoiceCall}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110"
            style={{ background: "rgba(77,201,201,0.1)", color: "var(--accent-teal)", border: "1px solid rgba(77,201,201,0.15)" }}
            title="Voice call">
            <Phone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onVideoCall}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110"
            style={{ background: "rgba(124,109,204,0.1)", color: "#a78bfa", border: "1px solid rgba(124,109,204,0.15)" }}
            title="Video call">
            <Video className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setConfirmBlock(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110"
            style={{ background: "rgba(239,68,68,0.06)", color: "var(--accent-red)", border: "1px solid rgba(239,68,68,0.1)" }}
            title="Block user">
            <UserX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}