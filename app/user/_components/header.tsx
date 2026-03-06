"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/authstore";
import { useNotificationStore } from "@/lib/store/notificationstore";
import { getInitials, getAvatarBg } from "@/lib/utils/formatters";
import { getImageUrl } from "@/lib/utils/getimageurl";

const PAGE_TITLES: Record<string, string> = {
  "/user/dashboard":     "Dashboard",
  "/user/chat":          "Messages",
  "/user/friends":       "Friends",
  "/user/notifications": "Notifications",
  "/user/calls":         "Calls",
  "/user/profile":       "Profile",
};

export default function UserHeader({ title }: { title?: string }) {
  const { user }        = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const pathname        = usePathname();

  // Derive page title from route if not provided
  const pageKey    = Object.keys(PAGE_TITLES).find(k => pathname.startsWith(k)) ?? "";
  const pageTitle  = title ?? PAGE_TITLES[pageKey] ?? "FunChat";

  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      height: 60,
      borderBottom: "1px solid var(--border)",
      background: "rgba(8,9,30,0.7)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      zIndex: 40,
      gap: 16,
    }}>

      {/* ── Left: Page title ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {/* Accent dot */}
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--gradient-primary)",
          flexShrink: 0,
          boxShadow: "0 0 8px rgba(79,156,249,0.8)",
        }} />
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 18,
          color: "var(--text-primary)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {pageTitle}
        </h1>
      </div>

      {/* ── Center: Search bar ── */}
      <div style={{
        flex: 1,
        maxWidth: 340,
        position: "relative",
      }}>
        <Search
          size={14}
          style={{
            position: "absolute",
            left: 14, top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder="Search messages, friends…"
          className="fc-search"
          style={{ fontSize: 13 }}
          readOnly
          onClick={() => {
            // Navigate to chat page which has search
            if (typeof window !== "undefined") window.location.href = "/user/chat";
          }}
        />
      </div>

      {/* ── Right: Actions ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>

        {/* Notification bell */}
        <Link href="/user/notifications" style={{ position: "relative", textDecoration: "none" }}>
          <div className="fc-icon-btn" style={{
            background: unreadCount > 0 ? "rgba(79,156,249,0.08)" : undefined,
            borderColor: unreadCount > 0 ? "rgba(79,156,249,0.25)" : undefined,
          }}>
            <Bell size={17} style={{
              color: unreadCount > 0 ? "var(--accent-blue)" : "var(--text-secondary)",
            }} />
          </div>
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: -5, right: -5,
              minWidth: 18, height: 18, borderRadius: "var(--radius-full)",
              background: "var(--accent-red)",
              color: "#fff", fontSize: 9, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px",
              border: "2px solid var(--bg-primary)",
              boxShadow: "0 2px 8px rgba(239,68,68,0.5)",
              animation: "glowPulse 2s ease-in-out infinite",
            }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Thin vertical rule */}
        <div style={{ width: 1, height: 24, background: "var(--border)", flexShrink: 0 }} />

        {/* User avatar */}
        <Link
          href="/user/profile"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}
        >
          <div style={{ position: "relative" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", overflow: "hidden",
              border: "2px solid rgba(79,156,249,0.35)",
              boxShadow: "0 0 10px rgba(79,156,249,0.2)",
              transition: "border-color 0.2s",
            }}>
              {user?.profileImage ? (
                <Image
                  src={getImageUrl(user.profileImage)||''}
                  alt={user.username}
                  width={36} height={36}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              ) : (
                <div style={{
                  width: "100%", height: "100%",
                  background: getAvatarBg(user?.username || "U"),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 13, color: "#fff",
                }}>
                  {getInitials(user?.username || "U")}
                </div>
              )}
            </div>
            {/* Online indicator */}
            <span style={{
              position: "absolute", bottom: 0, right: 0,
              width: 9, height: 9, borderRadius: "50%",
              background: "var(--status-online)",
              border: "2px solid var(--bg-primary)",
              boxShadow: "0 0 5px rgba(34,197,94,0.7)",
            }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: "var(--text-primary)",
              maxWidth: 100, overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user?.username || "User"}
            </span>
            <span style={{ fontSize: 10, color: "var(--status-online)" }}>● Online</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
