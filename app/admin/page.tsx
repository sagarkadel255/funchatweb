"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare, Users, Phone, TrendingUp,
  Activity, ArrowUpRight, Shield, Zap,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin/user";
import { useAuthStore } from "@/lib/store/authstore";

const STAT_CONFIG = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    gradient: "linear-gradient(135deg, #4f9cf9 0%, #6366f1 100%)",
    glow: "rgba(79,156,249,0.2)",
    desc: (s: any) => `${s?.activeUsers ?? 0} currently active`,
  },
  {
    key: "totalMessages",
    label: "Total Messages",
    icon: MessageSquare,
    gradient: "linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)",
    glow: "rgba(45,212,191,0.2)",
    desc: () => "All time messages",
  },
  {
    key: "totalCalls",
    label: "Total Calls",
    icon: Phone,
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
    glow: "rgba(139,92,246,0.2)",
    desc: () => "Voice + Video",
  },
  {
    key: "newUsersToday",
    label: "New Today",
    icon: TrendingUp,
    gradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
    glow: "rgba(245,158,11,0.2)",
    desc: () => "Registered today",
  },
  {
    key: "onlineUsers",
    label: "Online Now",
    icon: Activity,
    gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    glow: "rgba(34,197,94,0.2)",
    desc: () => "Currently connected",
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [msgStats, setMsgStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.getMessageStats()])
      .then(([s, m]) => {
        if (s.success) setStats(s.data);
        if (m.success) setMsgStats(m.data);
      })
      .catch((e) => console.error("Stats load error:", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "28px 24px", maxWidth: 1100, margin: "0 auto" }}>

      {/* ── Hero card ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        borderRadius: 24, marginBottom: 30,
        background: "linear-gradient(135deg, #0d1635 0%, #111c4e 50%, #0d1830 100%)",
        border: "1px solid rgba(79,156,249,0.15)",
        padding: "32px 36px",
      }}>
        {/* Decorative orbs */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,156,249,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: "35%",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 24 }}>
          {/* Shield badge */}
          <div style={{
            width: 72, height: 72, borderRadius: 20, flexShrink: 0,
            background: "var(--gradient-blue)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(79,156,249,0.4)",
          }}>
            <Shield size={34} style={{ color: "#fff" }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(79,156,249,0.12)", border: "1px solid rgba(79,156,249,0.2)",
              borderRadius: 999, padding: "3px 12px", marginBottom: 10,
            }}>
              <Zap size={10} style={{ color: "var(--accent-blue)" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-blue)", letterSpacing: "0.08em" }}>
                ADMIN PANEL
              </span>
            </div>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26,
              marginBottom: 6, lineHeight: 1.2,
            }}>
              Welcome back,{" "}
              <span style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                {user?.username || "Admin"}
              </span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              &nbsp;·&nbsp; Here's a live overview of your platform.
            </p>
          </div>

          {/* Live indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 12, padding: "8px 16px", flexShrink: 0,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--accent-green)",
              boxShadow: "0 0 8px rgba(34,197,94,0.7)",
              display: "inline-block",
              animation: "statusPulse 2s ease infinite",
            }} />
            <span style={{ color: "var(--accent-green)", fontSize: 12, fontWeight: 700 }}>Live</span>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
        gap: 16, marginBottom: 28,
      }}>
        {STAT_CONFIG.map((card, i) => (
          <div key={i} style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 20, padding: "22px 20px",
            position: "relative", overflow: "hidden",
            transition: "all 0.25s ease",
            cursor: "default",
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${card.glow}`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.boxShadow = "";
            }}>
            {/* Corner glow */}
            <div style={{
              position: "absolute", top: -30, right: -30,
              width: 100, height: 100, borderRadius: "50%",
              background: card.gradient, opacity: 0.07, pointerEvents: "none",
            }} />

            {/* Icon */}
            <div style={{
              width: 42, height: 42, borderRadius: 13, marginBottom: 16,
              background: `${card.glow}`,
              border: `1px solid ${card.glow}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <card.icon size={20} style={{
                background: card.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }} />
            </div>

            {loading ? (
              <>
                <div className="skeleton" style={{ height: 36, width: 80, borderRadius: 10, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: 100, borderRadius: 6, marginBottom: 4 }} />
                <div className="skeleton" style={{ height: 10, width: 72, borderRadius: 6 }} />
              </>
            ) : (
              <>
                <div style={{
                  fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em",
                  fontFamily: "var(--font-display)", marginBottom: 4, lineHeight: 1,
                  background: card.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  {stats?.[card.key] ?? "—"}
                </div>
                <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 3 }}>
                  {card.label}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: 11 }}>
                  {card.desc(stats)}
                </p>
              </>
            )}

            {/* Arrow */}
            {!loading && (
              <div style={{
                position: "absolute", top: 16, right: 16,
                color: "var(--text-muted)", opacity: 0.4,
              }}>
                <ArrowUpRight size={14} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Message Statistics ── */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 20, padding: "24px 28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11,
            background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <MessageSquare size={16} style={{ color: "var(--accent-teal)" }} />
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>
              Message Statistics
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>Detailed breakdown of platform messages</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ height: 10, width: 80, borderRadius: 4, marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 28, width: 60, borderRadius: 6 }} />
              </div>
            ))}
          </div>
        ) : msgStats ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {Object.entries(msgStats).map(([key, val], idx) => {
              const gradients = [
                "var(--gradient-teal)", "var(--gradient-blue)", "var(--gradient-primary)",
                "var(--gradient-amber)", "var(--gradient-green)",
              ];
              const g = gradients[idx % gradients.length];
              return (
                <div key={key} style={{
                  padding: "16px 18px", borderRadius: 14,
                  background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
                  transition: "border-color 0.2s",
                }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p style={{
                    fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)",
                    background: g, WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>
                    {String(val)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "28px 0", color: "var(--text-muted)", fontSize: 13 }}>
            No message statistics available
          </div>
        )}
      </div>
    </div>
  );
}
