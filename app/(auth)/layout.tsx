import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FunChat – Sign In",
};

const FEATURES = [
  { icon: "💬", label: "Real-time messaging",   sub: "Instant delivery, always" },
  { icon: "📞", label: "Voice & video calls",   sub: "Crystal-clear quality" },
  { icon: "👥", label: "Friend network",         sub: "Stay connected with everyone" },
  { icon: "🔒", label: "Secure & private",       sub: "End-to-end encryption" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>

      {/* ── LEFT: Brand panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          flex: "0 0 460px",
          background: "linear-gradient(160deg, #060e2e 0%, #0f1f5c 35%, #1a1060 65%, #07091c 100%)",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 44px",
          position: "relative",
          overflow: "hidden",
          borderRight: "1px solid rgba(79,156,249,0.1)",
        }}
      >
        {/* Decorative orbs */}
        <div style={{
          position: "absolute", top: -120, right: -120,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -80,
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,156,249,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "45%", left: "55%",
          width: 150, height: 150, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(45,212,191,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Grid pattern overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(79,156,249,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,156,249,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", textAlign: "center", width: "100%" }}>
          {/* Logo */}
          <div style={{
            width: 80, height: 80, borderRadius: 22,
            margin: "0 auto 28px",
            background: "var(--gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36,
            boxShadow: "0 12px 40px rgba(79,156,249,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset",
          }}>
            💬
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900, fontSize: 38,
            color: "#fff", marginBottom: 10,
            letterSpacing: -1,
          }}>
            Fun<span style={{
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Chat</span>
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 15, lineHeight: 1.7,
            maxWidth: 300, margin: "0 auto 44px",
          }}>
            Chat, call, and connect with the people who matter most — all in one beautiful place.
          </p>

          {/* Feature rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "13px 18px",
                textAlign: "left",
                transition: "border-color 0.2s",
              }}>
                <span style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: "rgba(79,156,249,0.1)",
                  border: "1px solid rgba(79,156,249,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>
                  {f.icon}
                </span>
                <div>
                  <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>{f.label}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 1 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom caption */}
          <p style={{
            marginTop: 40,
            fontSize: 12, color: "rgba(255,255,255,0.2)",
          }}>
            Trusted · Secure · Always Free
          </p>
        </div>
      </div>

      {/* ── RIGHT: Form panel ── */}
      <div style={{
        flex: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
        background: "linear-gradient(160deg, #08091f 0%, #06091a 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: "absolute", top: "20%", right: "10%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,156,249,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
          {/* Card shell */}
          <div style={{
            background: "rgba(13,18,48,0.7)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(79,156,249,0.12)",
            borderRadius: 24,
            padding: "36px 32px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset",
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
