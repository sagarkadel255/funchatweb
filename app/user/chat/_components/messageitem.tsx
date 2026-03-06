"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit2, Trash2, Reply, Check, CheckCheck } from "lucide-react";
import { Message } from "@/lib/types/chat";
import { useAuthStore } from "@/lib/store/authstore";
import { formatTime, getInitials, getAvatarColor } from "@/lib/utils/formatters";
import { getImageUrl } from "@/lib/utils/getimageurl";

interface Props {
  message: Message;
  onEdit: (msg: Message) => void;
  onDelete: (msgId: string) => void;
  onReply: (msg: Message) => void;
  showAvatar?: boolean;
}

export default function MessageItem({ message, onEdit, onDelete, onReply, showAvatar = true }: Props) {
  const { user } = useAuthStore();
  const [hover, setHover] = useState(false);

  const senderId = typeof message.sender === "string" ? message.sender : message.sender?._id;
  const senderName = typeof message.sender === "object" ? message.sender?.username : "";
  const isSent = senderId === user?.id;

  if (message.isDeleted) {
    return (
      <div
        id={`message-${message._id}`}
        style={{
          display: "flex",
          justifyContent: isSent ? "flex-end" : "flex-start",
          marginBottom: 6,
        }}
      >
        <div style={{
          padding: "8px 14px",
          borderRadius: 12,
          fontSize: 13,
          fontStyle: "italic",
          color: "rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.04)",
          border: "1px dashed rgba(255,255,255,0.1)",
          maxWidth: "60%",
        }}>
          🗑 Message deleted
        </div>
      </div>
    );
  }

  return (
    <div
      id={`message-${message._id}`}
      style={{
        display: "flex",
        flexDirection: isSent ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 6,
        position: "relative",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Avatar */}
      {showAvatar && !isSent ? (
        <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
          {typeof message.sender === "object" && message.sender?.profileImage ? (
            <Image
              src={getImageUrl(message.sender.profileImage) || ""}
              alt={senderName}
              width={32}
              height={32}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div style={{
              width: "100%",
              height: "100%",
              background: getAvatarColor(senderName),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
            }}>
              {getInitials(senderName)}
            </div>
          )}
        </div>
      ) : (
        <div style={{ width: 32, flexShrink: 0 }} />
      )}

      <div style={{ maxWidth: "60%", minWidth: 80 }}>
        {/* Reply preview */}
        {message.replyTo && typeof message.replyTo !== "string" && (
          <div style={{
            marginBottom: 4,
            padding: "6px 10px",
            background: "rgba(255,255,255,0.05)",
            borderLeft: "2px solid var(--brand-blue)",
            borderRadius: "8px 8px 0 0",
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
          }}>
            <span style={{
              color: "var(--brand-blue)",
              fontWeight: 600,
              display: "block",
              marginBottom: 2,
              fontSize: 11,
            }}>
              {typeof message.replyTo.sender === "object"
                ? message.replyTo.sender.username
                : "Reply"}
            </span>
            <span style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}>
              {message.replyTo.content}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={isSent ? "fc-bubble-sent" : "fc-bubble-received"}
          style={{
            padding: "10px 14px",
            borderRadius: 18,
            background: isSent
              ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
              : "rgba(255,255,255,0.1)",
            color: "#fff",
            borderBottomRightRadius: isSent ? 4 : 18,
            borderBottomLeftRadius: isSent ? 18 : 4,
          }}
        >
          {!isSent && senderName && (
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--brand-blue)",
              marginBottom: 4,
              textTransform: "capitalize",
            }}>
              {senderName}
            </p>
          )}
          <p style={{ lineHeight: 1.5, fontSize: 14, wordBreak: "break-word" }}>
            {message.content}
          </p>
          {message.isEdited && (
            <span style={{
              fontSize: 10,
              opacity: 0.5,
              marginLeft: 4,
              fontStyle: "italic",
            }}>
              (edited)
            </span>
          )}
        </div>

        {/* Time + status */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: 3,
          justifyContent: isSent ? "flex-end" : "flex-start",
        }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
            {formatTime(message.createdAt)}
          </span>
          {isSent && (
            message.status === "seen" ? (
              <CheckCheck size={12} style={{ color: "var(--brand-blue)" }} />
            ) : (
              <Check size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
            )
          )}
        </div>
      </div>

      {/* Hover actions */}
      {hover && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          background: "rgba(15,30,74,0.95)",
          borderRadius: 10,
          padding: "4px 6px",
          border: "1px solid rgba(255,255,255,0.08)",
          flexDirection: isSent ? "row-reverse" : "row",
          position: "absolute",
          top: -30,
          [isSent ? "right" : "left"]: 40,
          zIndex: 10,
        }}>
          <button
            onClick={() => onReply(message)}
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              borderRadius: 6,
              color: "rgba(255,255,255,0.5)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
            title="Reply"
          >
            <Reply size={13} />
          </button>
          {isSent && (
            <>
              <button
                onClick={() => onEdit(message)}
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 6,
                  color: "rgba(255,255,255,0.5)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
                title="Edit"
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={() => onDelete(message._id)}
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 6,
                  color: "rgba(239,68,68,0.5)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                  e.currentTarget.style.color = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = "rgba(239,68,68,0.5)";
                }}
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}