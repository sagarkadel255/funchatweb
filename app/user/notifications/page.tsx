"use client";

import { Bell, CheckCheck, Trash2, RefreshCw, MessageSquare, Users, Phone, Info } from "lucide-react";
import { useNotification } from "@/lib/hooks/usenotification";
import { formatTime } from "@/lib/utils/formatters";

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  message:         { icon: MessageSquare, color: "#4da8da", bg: "rgba(77,168,218,0.12)"  },
  friend_request:  { icon: Users,         color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  friend_accepted: { icon: Users,         color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  call:            { icon: Phone,          color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  system:          { icon: Info,           color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
};

function NotifIcon({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.system;
  const Icon = cfg.icon;
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: cfg.bg }}
    >
      <Icon className="w-5 h-5" style={{ color: cfg.color }} />
    </div>
  );
}

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  } = useNotification();

  const unread = notifications.filter((n) => !n.isRead).length;

  if (loading && notifications.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-3">
        <div className="h-8 w-48 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Notifications
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {unread > 0 ? (
              <span style={{ color: "var(--accent-teal)" }}>{unread} unread</span>
            ) : (
              "All caught up!"
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" }}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {notifications.length > 0 && (
            <>
              {unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "var(--gradient-blue)", color: "#fff" }}
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={deleteAll}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" }}
                title="Delete all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Bell className="w-14 h-14 mx-auto mb-4 opacity-25" />
          <p className="font-semibold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
            No notifications yet
          </p>
          <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
            Friend requests, messages and calls will appear here.
          </p>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(255,255,255,0.07)", color: "var(--text-primary)" }}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className="flex items-start gap-3 p-4 rounded-2xl transition-all"
              style={{
                background: notif.isRead
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(77,168,218,0.06)",
                border: notif.isRead
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "1px solid rgba(77,168,218,0.2)",
              }}
            >
              {/* Icon */}
              <NotifIcon type={notif.type} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="text-sm font-semibold leading-snug"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {notif.relatedUserId?.username
                      ? notif.type === "friend_request"
                        ? `${notif.relatedUserId.username} sent you a friend request`
                        : notif.type === "friend_accepted"
                        ? `${notif.relatedUserId.username} accepted your friend request`
                        : notif.title
                      : notif.title}
                  </p>
                  {!notif.isRead && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                      style={{ background: "var(--accent-blue)" }}
                    />
                  )}
                </div>

                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  {notif.message}
                </p>
                <p className="text-[11px] mt-2" style={{ color: "var(--text-muted)" }}>
                  {formatTime(notif.createdAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0 self-center">
                {!notif.isRead && (
                  <button
                    onClick={() => markAsRead(notif._id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif._id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
