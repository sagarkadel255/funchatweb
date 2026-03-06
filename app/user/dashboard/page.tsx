// app/user/dashboard/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { MessageCircle, Users, Bell, Phone, ArrowRight, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuthContext } from "@/context/authcontext";
import { useChatStore } from "@/lib/store/chatstore";
import { useFriendStore } from "@/lib/store/friendstore";
import { useNotificationStore } from "@/lib/store/notificationstore";
import { getInitials, getAvatarColor, formatTime } from "@/lib/utils/formatters";
import { chatApi } from "@/lib/api/chat";
import { friendApi } from "@/lib/api/friend";
import { getImageUrl } from "@/lib/utils/getimageurl";

const STAT_CONFIGS = [
  {
    key: "conversations",
    label: "Conversations",
    sub: "Active threads",
    icon: MessageCircle,
    href: "/user/chat",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
    glow: "rgba(79,156,249,0.2)",
    iconBg: "rgba(59,130,246,0.15)",
    iconColor: "#60a5fa",
  },
  {
    key: "friends",
    label: "Friends",
    sub: "Connected",
    icon: Users,
    href: "/user/friends",
    gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    glow: "rgba(34,197,94,0.2)",
    iconBg: "rgba(34,197,94,0.15)",
    iconColor: "#4ade80",
  },
  {
    key: "calls",
    label: "Calls",
    sub: "History",
    icon: Phone,
    href: "/user/calls",
    gradient: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
    glow: "rgba(168,85,247,0.2)",
    iconBg: "rgba(168,85,247,0.15)",
    iconColor: "#c084fc",
  },
  {
    key: "notifications",
    label: "Notifications",
    sub: "Unread",
    icon: Bell,
    href: "/user/notifications",
    gradient: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
    glow: "rgba(249,115,22,0.2)",
    iconBg: "rgba(249,115,22,0.15)",
    iconColor: "#fb923c",
  },
];

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { conversations, setConversations } = useChatStore();
  const { friends, setFriends } = useFriendStore();
  const { unreadCount } = useNotificationStore();

  useEffect(() => {
    chatApi.getConversations().then((res) => {
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setConversations(data);
      }
    }).catch(() => {});

    friendApi.getFriends().then((res) => {
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setFriends(data);
      }
    }).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 5  ? "Good night" :
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
    "Good evening";

  const greetingEmoji =
    hour < 5  ? "🌙" :
    hour < 12 ? "☀️" :
    hour < 17 ? "🌤️" :
    "🌆";

  const onlineFriends = useMemo(() => {
    if (!Array.isArray(friends)) return [];
    return friends.filter((f) => f.status === "online");
  }, [friends]);

  const recentConversations = useMemo(() => {
    if (!Array.isArray(conversations)) return [];
    return conversations.slice(0, 6);
  }, [conversations]);

  const statValues: Record<string, number> = {
    conversations: Array.isArray(conversations) ? conversations.length : 0,
    friends:       Array.isArray(friends) ? friends.length : 0,
    calls:         0,
    notifications: unreadCount,
  };

  return (
    <div style={{
      minHeight: "100%",
      background: "var(--bg-secondary)",
      padding: "24px 28px 40px",
      overflowY: "auto",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ══════════════════════════════════════════
            HERO GREETING CARD
        ══════════════════════════════════════════ */}
        <div style={{
          background: "linear-gradient(135deg, #0f1f5c 0%, #1a1060 40%, #0d1840 100%)",
          borderRadius: 24,
          padding: "32px 36px",
          marginBottom: 28,
          border: "1px solid rgba(79,156,249,0.15)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative glows */}
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -40, left: 120,
            width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(79,156,249,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Content */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(79,156,249,0.12)",
                border: "1px solid rgba(79,156,249,0.2)",
                borderRadius: 999, padding: "4px 12px",
                marginBottom: 14,
              }}>
                <Zap size={11} style={{ color: "var(--accent-blue)" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-blue)", letterSpacing: "0.05em" }}>
                  FUNCHAT
                </span>
              </div>

              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: 30,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.2,
                marginBottom: 8,
              }}>
                {greeting}, {" "}
                <span style={{
                  background: "var(--gradient-primary)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  {user?.username || "Friend"}
                </span>
                {" "}{greetingEmoji}
              </h1>

              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric",
                })}
                {" · "}
                {Array.isArray(conversations) && conversations.length > 0
                  ? `${conversations.length} active conversation${conversations.length !== 1 ? "s" : ""}`
                  : "Start a conversation today"}
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/user/chat" className="fc-btn fc-btn-sm">
                  <MessageCircle size={13} />
                  Open Messages
                </Link>
                <Link href="/user/friends" className="fc-btn-ghost" style={{ padding: "7px 14px", fontSize: 12, borderRadius: 10 }}>
                  <Users size={13} />
                  Find Friends
                </Link>
              </div>
            </div>

            {/* Right: online indicator */}
            <div style={{
              flexShrink: 0, textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid rgba(79,156,249,0.4)",
                boxShadow: "var(--shadow-glow-blue)",
              }}>
                {user?.profileImage ? (
                  <Image src={getImageUrl(user.profileImage) || ""} alt={user?.username || ""} width={72} height={72} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    background: "var(--gradient-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, fontWeight: 800, color: "#fff",
                  }}>
                    {getInitials(user?.username || "U")}
                  </div>
                )}
              </div>
              <span style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, color: "var(--status-online)", fontWeight: 600,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--status-online)",
                  boxShadow: "0 0 6px var(--status-online)",
                  display: "inline-block",
                }} />
                Online
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            STAT CARDS
        ══════════════════════════════════════════ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 28,
        }}>
          {STAT_CONFIGS.map((cfg) => (
            <Link
              key={cfg.key}
              href={cfg.href}
              style={{ textDecoration: "none" }}
            >
              <div style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "20px 18px",
                transition: "all 0.25s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-hover)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${cfg.glow}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}>
                {/* Background accent blob */}
                <div style={{
                  position: "absolute", top: -30, right: -30,
                  width: 100, height: 100, borderRadius: "50%",
                  background: cfg.iconBg,
                  pointerEvents: "none",
                }} />

                <div style={{ position: "relative" }}>
                  {/* Icon row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: cfg.iconBg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1px solid ${cfg.iconBg}`,
                    }}>
                      <cfg.icon size={20} style={{ color: cfg.iconColor }} />
                    </div>
                    <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
                  </div>

                  {/* Value */}
                  <div style={{
                    fontSize: 32,
                    fontWeight: 800,
                    fontFamily: "var(--font-display)",
                    color: "#fff",
                    lineHeight: 1,
                    marginBottom: 6,
                    background: cfg.gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    {statValues[cfg.key]}
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                    {cfg.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {cfg.sub}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            BOTTOM SECTION: Conversations + Friends
        ══════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

          {/* ── Recent Conversations ── */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            overflow: "hidden",
          }}>
            {/* Section header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 20px",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "rgba(59,130,246,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <MessageCircle size={16} style={{ color: "var(--accent-blue)" }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                    Recent Messages
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {recentConversations.length} conversation{recentConversations.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <Link href="/user/chat" style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 12, fontWeight: 600, color: "var(--accent-blue)",
                textDecoration: "none",
                padding: "6px 12px", borderRadius: 8,
                background: "rgba(79,156,249,0.08)",
                border: "1px solid rgba(79,156,249,0.15)",
                transition: "all 0.2s",
              }}>
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {recentConversations.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "rgba(79,156,249,0.08)",
                  border: "1px solid rgba(79,156,249,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <MessageCircle size={28} style={{ color: "var(--accent-blue)", opacity: 0.6 }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                  No conversations yet
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                  Connect with friends and start chatting!
                </p>
                <Link href="/user/friends" className="fc-btn fc-btn-sm">
                  <Users size={13} /> Find Friends
                </Link>
              </div>
            ) : (
              <div>
                {recentConversations.map((conv, idx) => {
                  const other = conv.participants?.find((p: any) => p._id !== user?.id);
                  const name = other?.username || "Unknown";
                  const lastMsg = conv.lastMessage?.content || "Say hello! 👋";
                  const isOnline = other?.status === "online";

                  return (
                    <Link
                      key={conv._id}
                      href={`/user/chat/${conv._id}`}
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      <div style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 20px",
                        borderBottom: idx < recentConversations.length - 1 ? "1px solid var(--border)" : "none",
                        transition: "background 0.18s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>

                        {/* Avatar */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <div style={{
                            width: 46, height: 46, borderRadius: "50%",
                            overflow: "hidden",
                            border: "2px solid var(--border)",
                          }}>
                            {other?.profileImage ? (
                              <Image src={getImageUrl(other.profileImage) || ""} alt={name} width={46} height={46} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center text-white font-bold ${getAvatarColor(name)}`}
                                style={{ fontSize: 15 }}>
                                {getInitials(name)}
                              </div>
                            )}
                          </div>
                          <span style={{
                            position: "absolute", bottom: 1, right: 1,
                            width: 11, height: 11, borderRadius: "50%",
                            background: isOnline ? "var(--status-online)" : "var(--status-offline)",
                            border: "2px solid var(--bg-card)",
                            boxShadow: isOnline ? "0 0 6px rgba(34,197,94,0.6)" : "none",
                          }} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {name}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0, marginLeft: 8 }}>
                              {formatTime(conv.lastMessageTime)}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lastMsg}
                          </p>
                        </div>

                        {/* Unread badge */}
                        {(conv.unreadCount ?? 0) > 0 && (
                          <div className="fc-badge" style={{ fontSize: 10 }}>
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Online Friends Panel ── */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              padding: "18px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "rgba(34,197,94,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <TrendingUp size={16} style={{ color: "var(--accent-green)" }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                    Online Friends
                  </div>
                  <div style={{ fontSize: 11, color: "var(--accent-green)" }}>
                    {onlineFriends.length} active now
                  </div>
                </div>
              </div>
              <Link href="/user/friends" style={{
                textDecoration: "none",
                fontSize: 11, color: "var(--text-muted)",
                background: "var(--bg-hover)",
                padding: "4px 10px", borderRadius: 8,
                border: "1px solid var(--border)",
              }}>
                All
              </Link>
            </div>

            {onlineFriends.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "rgba(34,197,94,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px",
                }}>
                  <Users size={22} style={{ color: "var(--accent-green)", opacity: 0.5 }} />
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                  No friends online
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Check back later
                </p>
              </div>
            ) : (
              <div style={{ padding: "8px 0" }}>
                {onlineFriends.slice(0, 8).map((friend: any) => (
                  <Link
                    key={friend._id}
                    href={`/user/chat?userId=${friend._id}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 20px",
                      cursor: "pointer",
                      transition: "background 0.18s",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>

                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: "50%",
                          overflow: "hidden",
                          border: "2px solid rgba(34,197,94,0.3)",
                        }}>
                          {friend.profileImage ? (
                            <Image src={getImageUrl(friend.profileImage) || ""} alt={friend.username} width={40} height={40} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center text-white font-bold ${getAvatarColor(friend.username)}`}
                              style={{ fontSize: 13 }}>
                              {getInitials(friend.username)}
                            </div>
                          )}
                        </div>
                        <span style={{
                          position: "absolute", bottom: 1, right: 1,
                          width: 10, height: 10, borderRadius: "50%",
                          background: "var(--status-online)",
                          border: "2px solid var(--bg-card)",
                          boxShadow: "0 0 6px rgba(34,197,94,0.6)",
                        }} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {friend.username}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--accent-green)" }}>Online</p>
                      </div>

                      <MessageCircle size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Footer CTA */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
              <Link href="/user/friends" className="fc-btn" style={{ width: "100%", borderRadius: 12, padding: "10px 16px", fontSize: 13 }}>
                <Users size={14} /> Manage Friends
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
