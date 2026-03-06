"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Plus, MessageCircle, Users } from "lucide-react";
import { useAuthContext } from "@/context/authcontext";
import { useChatStore } from "@/lib/store/chatstore";
import { useFriendStore } from "@/lib/store/friendstore";
import { getInitials, getAvatarBg, formatTime } from "@/lib/utils/formatters";
import { Conversation } from "@/lib/types/chat";
import { getImageUrl } from "@/lib/utils/getimageurl";

interface ChatListProps {
  conversations: Conversation[];
  loading: boolean;
  activeId: string | null;
}

export default function ChatList({ conversations, loading, activeId }: ChatListProps) {
  const { user } = useAuthContext();
  const { typingUsers } = useChatStore();
  const { friends } = useFriendStore();

  const [search, setSearch] = useState("");

  // Safe guard
  const safeConversations = useMemo(() => {
    return Array.isArray(conversations) ? conversations : [];
  }, [conversations]);

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (search.trim() === "") return safeConversations;

    const term = search.toLowerCase().trim();
    return safeConversations.filter((conv) => {
      const other = conv.participants.find((p) => p._id !== user?.id);
      const otherName = other?.username || "";
      return (
        conv.groupName?.toLowerCase().includes(term) ||
        otherName.toLowerCase().includes(term)
      );
    });
  }, [safeConversations, search, user?.id]);

  // Sort by last message time (newest first)
  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });
  }, [filteredConversations]);

  const isTypingInConv = (convId: string) => {
    return (typingUsers[convId] || []).length > 0;
  };

  return (
    <div style={{
      width: 320,
      flexShrink: 0,
      background: "linear-gradient(160deg, #0a1530 0%, #0d1c45 100%)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 16px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}>
          <h2 style={{
            fontFamily: "'Poppins',sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#fff",
          }}>
            Messages
          </h2>
          <Link
            href="/user/friends"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(74,163,195,0.15)",
              border: "1px solid rgba(74,163,195,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              position: "relative",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(74,163,195,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(74,163,195,0.15)";
            }}
          >
            <Plus size={18} style={{ color: "var(--brand-blue)" }} />
            {/* Friend count badge */}
            {friends?.length > 0 && (
              <span style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "#3b82f6",
                color: "#fff",
                fontSize: 10,
                fontWeight: 600,
                width: 18,
                height: 18,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #0a1530",
              }}>
                {friends.length}
              </span>
            )}
          </Link>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={15} style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "rgba(255,255,255,0.3)",
          }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 99,
              color: "#fff",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Friend count bar */}
      {friends?.length > 0 && (
        <div style={{
          padding: "10px 16px",
          background: "rgba(74,163,195,0.1)",
          borderBottom: "1px solid rgba(74,163,195,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <Users size={14} style={{ color: "var(--brand-blue)" }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
            {friends.length} friend{friends.length !== 1 ? 's' : ''} online
          </span>
        </div>
      )}

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 6px" }}>
        {loading ? (
          <div style={{ padding: 12 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                display: "flex",
                gap: 12,
                padding: "10px 8px",
                alignItems: "center",
                animation: "pulse 1.5s infinite",
              }}>
                <div style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    width: "55%",
                    height: 13,
                    background: "rgba(255,255,255,0.1)",
                    marginBottom: 8,
                    borderRadius: 4,
                  }} />
                  <div style={{
                    width: "80%",
                    height: 11,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 4,
                  }} />
                </div>
              </div>
            ))}
          </div>
        ) : sortedConversations.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center" }}>
            <MessageCircle size={40} style={{ color: "rgba(255,255,255,0.2)", marginBottom: 12 }} />
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 8 }}>
              {search ? "No matching conversations" : "No conversations yet"}
            </p>
            {!search && (
              <Link href="/user/friends" style={{
                display: "inline-block",
                padding: "8px 16px",
                background: "rgba(74,163,195,0.15)",
                borderRadius: 20,
                color: "var(--brand-blue)",
                fontSize: 12,
                textDecoration: "none",
                marginTop: 8,
              }}>
                Find friends to chat with
              </Link>
            )}
          </div>
        ) : (
          sortedConversations.map((conv) => {
            const other = conv.participants.find((p) => p._id !== user?.id);
            const name = other?.username || "Unknown";
            const isActive = conv._id === activeId;
            const isTyping = (typingUsers[conv._id] || []).length > 0;
            const lastMsg = conv.lastMessage?.isDeleted
              ? "🗑 Message deleted"
              : conv.lastMessage?.content || "Start chatting!";

            return (
              <Link
                key={conv._id}
                href={`/user/chat/${conv._id}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 10px",
                  borderRadius: 14,
                  marginBottom: 2,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: isActive ? "rgba(74,163,195,0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(74,163,195,0.2)" : "1px solid transparent",
                }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    {other?.profileImage ? (
                      <div style={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        overflow: "hidden",
                      }}>
                        <Image
                          src={getImageUrl(other.profileImage) || ""}
                          alt={name}
                          width={46}
                          height={46}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        background: getAvatarBg(name),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        color: "#fff",
                        fontSize: 16,
                      }}>
                        {getInitials(name)}
                      </div>
                    )}
                    <span style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: other?.status === "online" ? "#22c55e" : "#6b7280",
                      border: "2px solid #0a1530",
                    }} />
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}>
                      <span style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#fff",
                        textTransform: "capitalize",
                      }}>
                        {name}
                      </span>
                      <span style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.3)",
                        flexShrink: 0,
                      }}>
                        {conv.lastMessageTime ? formatTime(conv.lastMessageTime) : ''}
                      </span>
                    </div>
                    {isTyping ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ display: "flex", gap: 3 }}>
                          <span className="fc-typing-dot" />
                          <span className="fc-typing-dot" />
                          <span className="fc-typing-dot" />
                        </div>
                        <span style={{ fontSize: 12, color: "var(--brand-blue)" }}>
                          typing...
                        </span>
                      </div>
                    ) : (
                      <p style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.35)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {lastMsg}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}