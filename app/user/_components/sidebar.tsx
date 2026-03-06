"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Users, Bell, Phone, User, LogOut } from "lucide-react";
import Image from "next/image";
import { useAuthContext } from "@/context/authcontext";
import { useAuthStore } from "@/lib/store/authstore";
import { useNotificationStore } from "@/lib/store/notificationstore";
import { getInitials, getAvatarBg } from "@/lib/utils/formatters";
import { disconnectSocket } from "@/lib/utils/socket";
import toast from "react-hot-toast";
import { getImageUrl } from "@/lib/utils/getimageurl";

const NAV = [
  { href: "/user/dashboard",     icon: Home,          label: "Dashboard" },
  { href: "/user/chat",          icon: MessageCircle, label: "Messages" },
  { href: "/user/friends",       icon: Users,         label: "Friends" },
  { href: "/user/notifications", icon: Bell,          label: "Notifications", notify: true },
  { href: "/user/calls",         icon: Phone,         label: "Calls" },
  { href: "/user/profile",       icon: User,          label: "Profile" },
];

export default function UserSidebar() {
  const { user, initialized } = useAuthContext();
  const logout = useAuthStore((state) => state.logout);
  const { unreadCount } = useNotificationStore();
  const pathname = usePathname();

  if (!initialized || !user) return null;

  const handleLogout = () => {
    disconnectSocket();
    localStorage.clear();
    sessionStorage.clear();
    logout();
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  return (
    <div className="fc-sidebar">

      {/* ── Logo mark ── */}
      <div style={{
        width: 42, height: 42,
        borderRadius: 14,
        background: "var(--gradient-primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24,
        boxShadow: "var(--shadow-glow-blue)",
        flexShrink: 0,
        fontSize: 18,
        fontWeight: 900,
        color: "#fff",
        fontFamily: "var(--font-display)",
        letterSpacing: -1,
        position: "relative",
      }}>
        F
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flex: 1,
        width: "100%",
        alignItems: "center",
      }}>
        {NAV.map(item => {
          const isActive = item.href === "/user/chat"
            ? pathname.startsWith("/user/chat")
            : pathname === item.href;
          const showBadge = item.notify && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`fc-sidebar-icon ${isActive ? "active" : ""}`}
            >
              <item.icon size={19} strokeWidth={isActive ? 2.5 : 2} />
              {showBadge && (
                <span className="fc-sidebar-badge">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Separator ── */}
      <div style={{
        width: 32, height: 1,
        background: "var(--border)",
        marginBottom: 12,
        flexShrink: 0,
      }} />

      {/* ── User avatar → profile link ── */}
      <Link
        href="/user/profile"
        title={user.username}
        style={{
          marginBottom: 8,
          position: "relative",
          textDecoration: "none",
          display: "block",
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 42, height: 42, borderRadius: "50%", overflow: "hidden",
          border: "2px solid rgba(79,156,249,0.4)",
          boxShadow: "0 0 14px rgba(79,156,249,0.2)",
        }}>
          {user.profileImage ? (
            <Image
              src={getImageUrl(user.profileImage)||' '}
              alt={user.username}
              width={42} height={42}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              background: getAvatarBg(user.username),
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 15, color: "#fff",
            }}>
              {getInitials(user.username)}
            </div>
          )}
        </div>
        {/* Online pulse dot */}
        <span style={{
          position: "absolute", bottom: 1, right: 1,
          width: 11, height: 11, borderRadius: "50%",
          background: "var(--status-online)",
          border: "2px solid var(--bg-sidebar)",
          boxShadow: "0 0 8px rgba(34,197,94,0.7)",
        }} />
      </Link>

      {/* ── Logout ── */}
      <button
        onClick={handleLogout}
        title="Logout"
        className="fc-sidebar-icon"
        style={{ color: "rgba(239,68,68,0.65)", marginTop: 4, flexShrink: 0 }}
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
