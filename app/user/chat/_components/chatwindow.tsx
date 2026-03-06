"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Search,
  Users,
  X,
  Check,
  CheckCheck,
} from "lucide-react";
import { useChat } from "@/lib/hooks/usechat";
import { useSocket } from "@/lib/hooks/usesocket";
import { useAuthStore } from "@/lib/store/authstore";
import { useCall } from "@/lib/hooks/usecall";
import { Conversation, Message } from "@/lib/types/chat";
import { getInitials, getAvatarBg, formatTime } from "@/lib/utils/formatters";
import MessageItem from "./messageitem";
import ChatInput from "./chatinput";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils/getimageurl";

interface Props {
  conversation: Conversation;
}

// Helper function to safely get sender info
const getSenderInfo = (sender: any) => {
  if (!sender) return { _id: '', username: 'Unknown', profileImage: undefined };
  if (typeof sender === 'string') {
    return {
      _id: sender,
      username: 'Unknown',
      profileImage: undefined
    };
  }
  return sender || { _id: '', username: 'Unknown', profileImage: undefined };
};

export default function ChatWindow({ conversation }: Props) {
  const { user } = useAuthStore();
  const {
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsSeen,
    typingUsers,
  } = useChat();
  const { emitTyping, emitStopTyping, emitJoinConversation, emitLeaveConversation } = useSocket();
  const { initiateCall } = useCall();

  const bottomRef = useRef<HTMLDivElement>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);

  // Ensure messages is an array
  const convMessages = messages[conversation._id] || [];
  const safeConvMessages = Array.isArray(convMessages) ? convMessages : [];
  
  const isTyping = (typingUsers[conversation._id] || []).length > 0;
  const otherUser = conversation.participants.find((p) => p._id !== user?.id);

  // Join conversation room on mount
  useEffect(() => {
    if (!conversation._id) return;

    emitJoinConversation(conversation._id);
    
    // Mark messages as seen
    markAsSeen(conversation._id);

    // Scroll to bottom
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => {
      emitLeaveConversation(conversation._id);
    };
  }, [conversation._id, emitJoinConversation, emitLeaveConversation, markAsSeen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [safeConvMessages.length]);

  // Handle typing
  const handleTypingStart = useCallback(() => {
    emitTyping(conversation._id);
  }, [conversation._id, emitTyping]);

  const handleTypingStop = useCallback(() => {
    emitStopTyping(conversation._id);
  }, [conversation._id, emitStopTyping]);

  // Handle send message
  const handleSend = async (content: string) => {
    if (!otherUser?._id) return;

    if (editingMsg) {
      await editMessage(conversation._id, editingMsg._id, content);
      setEditingMsg(null);
    } else {
      const replyId = replyingTo?._id;
      await sendMessage(otherUser._id, content, conversation._id, replyId);
      setReplyingTo(null);
    }
  };

  // Handle call
  const handleCall = (type: "voice" | "video") => {
    if (otherUser) {
      initiateCall(otherUser._id, type);
    }
  };

  // Search messages
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const results = safeConvMessages.filter(
      (msg) =>
        msg && !msg.isDeleted &&
        msg.content?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const jumpToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    element?.classList.add("fc-search-highlight");
    setTimeout(() => element?.classList.remove("fc-search-highlight"), 2000);
    setShowSearch(false);
    setSearchQuery("");
  };

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #0a0f1f 0%, #121827 100%)",
      height: "100vh",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        background: "rgba(0,0,0,0.3)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/user/chat"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={18} />
          </Link>

          {/* Avatar */}
          <div style={{ position: "relative" }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid rgba(74,163,195,0.3)",
            }}>
              {otherUser?.profileImage ? (
                <Image
                  src={getImageUrl(otherUser.profileImage) || ""}
                  alt={otherUser.username}
                  width={44}
                  height={44}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  background: getAvatarBg(otherUser?.username || "U"),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#fff",
                }}>
                  {getInitials(otherUser?.username || "U")}
                </div>
              )}
            </div>
            <span style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: otherUser?.status === "online" ? "#22c55e" : "#6b7280",
              border: "2px solid #121827",
            }} />
          </div>

          {/* User info */}
          <div>
            <p style={{
              fontWeight: 600,
              fontSize: 16,
              color: "#fff",
              textTransform: "capitalize",
            }}>
              {otherUser?.username}
            </p>
            <p style={{
              fontSize: 12,
              color: isTyping ? "#3b82f6" : otherUser?.status === "online" ? "#22c55e" : "#6b7280",
            }}>
              {isTyping ? "Typing..." : otherUser?.status === "online" ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => handleCall("voice")}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.7)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(74,163,195,0.2)";
              e.currentTarget.style.color = "var(--brand-blue)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            }}
            title="Voice Call"
          >
            <Phone size={16} />
          </button>
          <button
            onClick={() => handleCall("video")}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.7)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(74,163,195,0.2)";
              e.currentTarget.style.color = "var(--brand-blue)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            }}
            title="Video Call"
          >
            <Video size={16} />
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: showSearch ? "rgba(74,163,195,0.2)" : "rgba(255,255,255,0.1)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: showSearch ? "var(--brand-blue)" : "rgba(255,255,255,0.7)",
              transition: "all 0.2s",
            }}
            title="Search Messages"
          >
            <Search size={16} />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: showMenu ? "rgba(74,163,195,0.2)" : "rgba(255,255,255,0.1)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: showMenu ? "var(--brand-blue)" : "rgba(255,255,255,0.7)",
              transition: "all 0.2s",
            }}
            title="Menu"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div style={{
          padding: "12px 20px",
          background: "rgba(0,0,0,0.3)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
        }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.3)",
            }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search in conversation..."
              style={{
                width: "100%",
                padding: "10px 16px 10px 36px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                color: "#fff",
                fontSize: 13,
                outline: "none",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.3)",
                  cursor: "pointer",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <div style={{
              marginTop: 8,
              maxHeight: 150,
              overflowY: "auto",
              background: "rgba(0,0,0,0.5)",
              borderRadius: 8,
              padding: 4,
            }}>
              {searchResults.map((msg) => {
                const senderInfo = getSenderInfo(msg.sender);
                return (
                  <button
                    key={msg._id}
                    onClick={() => jumpToMessage(msg._id)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px 12px",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "#fff",
                      fontSize: 12,
                      borderRadius: 4,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>
                        {senderInfo.username} · {formatTime(msg.createdAt)}
                      </span>
                      <span style={{ color: msg.status === "seen" ? "var(--brand-blue)" : "rgba(255,255,255,0.3)" }}>
                        {msg.status === "seen" ? <CheckCheck size={12} /> : <Check size={12} />}
                      </span>
                    </div>
                    <div style={{ marginTop: 2, color: "#fff" }}>
                      {msg.content?.substring(0, 50)}
                      {msg.content?.length > 50 && "..."}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}>
        {safeConvMessages.length === 0 ? (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.4)",
          }}>
            <Users size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p style={{ fontSize: 14, marginBottom: 8 }}>
              No messages yet
            </p>
            <p style={{ fontSize: 12 }}>
              Say hello to {otherUser?.username}!
            </p>
          </div>
        ) : (
          <>
            {safeConvMessages.map((msg, index) => {
              if (!msg) return null;
              
              const senderInfo = getSenderInfo(msg.sender);
              const prevSenderInfo = index > 0 ? getSenderInfo(safeConvMessages[index - 1]?.sender) : null;
              
              const showAvatar = index === 0 || senderInfo._id !== prevSenderInfo?._id;

              return (
                <MessageItem
                  key={msg._id}
                  message={msg}
                  onEdit={setEditingMsg}
                  onDelete={() => deleteMessage(conversation._id, msg._id)}
                  onReply={setReplyingTo}
                  showAvatar={showAvatar}
                />
              );
            })}
          </>
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div style={{
            display: "flex",
            justifyContent: "flex-start",
            marginBottom: 8,
          }}>
            <div style={{
              padding: "8px 16px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: 20,
              borderBottomLeftRadius: 4,
            }}>
              <div style={{ display: "flex", gap: 4 }}>
                <span className="fc-typing-dot" />
                <span className="fc-typing-dot" />
                <span className="fc-typing-dot" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={handleSend}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        conversationId={conversation._id}
        receiverId={otherUser?._id || ""}
        replyTo={replyingTo}
        editMsg={editingMsg}
        onCancelReply={() => setReplyingTo(null)}
        onCancelEdit={() => setEditingMsg(null)}
      />

      {/* Menu Dropdown */}
      {showMenu && (
        <div style={{
          position: "absolute",
          top: 70,
          right: 20,
          background: "#0f1e4a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          padding: "4px 0",
          minWidth: 150,
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          zIndex: 20,
        }}>
          <button
            onClick={() => {
              // View profile
              setShowMenu(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "8px 16px",
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 13,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            <Users size={14} />
            View Profile
          </button>
          <button
            onClick={() => {
              // Block user
              setShowMenu(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "8px 16px",
              background: "none",
              border: "none",
              color: "#ef4444",
              fontSize: 13,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            Block User
          </button>
        </div>
      )}
    </div>
  );
}