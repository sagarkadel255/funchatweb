import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--bg-primary)", color: "var(--text-primary)" }}>

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-4 sticky top-0 z-50"
        style={{ background: "rgba(7,13,31,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--gradient-teal)", boxShadow: "0 4px 16px rgba(45,212,191,0.35)" }}>
            <span style={{ fontSize: 18 }}>💬</span>
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--accent-teal)" }}>
            FunChat
          </span>
        </div>

        <ul className="hidden md:flex gap-8 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {["Features", "Services", "About"].map((item) => (
            <li key={item}>
              <a href={`#${item.toLowerCase()}`}
                className="hover:text-white transition-colors cursor-pointer"
                style={{ textDecoration: "none" }}>
                {item}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link href="/login"
            className="py-2 px-5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}>
            Sign In
          </Link>
          <Link href="/signup"
            className="py-2 px-5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "var(--gradient-primary)",
              color: "#fff",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(79,156,249,0.35)",
            }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative px-8 md:px-16 py-28 md:py-40 overflow-hidden">
        <div style={{
          position: "absolute", top: "10%", left: "15%",
          width: 480, height: 480, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,156,249,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "5%", right: "10%",
          width: 360, height: 360, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20" style={{ position: "relative", zIndex: 1 }}>
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7 text-sm font-semibold"
              style={{
                background: "rgba(45,212,191,0.08)",
                border: "1px solid rgba(45,212,191,0.2)",
                color: "var(--accent-teal)",
              }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-teal)", boxShadow: "0 0 8px rgba(45,212,191,0.7)", display: "inline-block" }} />
              Real-time messaging platform
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
              Chat.{" "}
              <span style={{
                background: "var(--gradient-teal)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Connect.
              </span>
              <br />
              <span style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Have Fun.
              </span>
            </h1>

            <p className="text-lg mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}>
              A smooth, powerful messaging experience with real-time chat, voice calls,
              and video calling — all beautifully designed in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/signup"
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all"
                style={{
                  background: "var(--gradient-primary)",
                  color: "#fff",
                  padding: "14px 32px",
                  fontSize: 15,
                  textDecoration: "none",
                  boxShadow: "0 8px 32px rgba(79,156,249,0.4)",
                }}>
                Get Started Free →
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-hover)",
                  color: "var(--text-secondary)",
                  padding: "14px 32px",
                  fontSize: 15,
                  textDecoration: "none",
                }}>
                Sign In
              </Link>
            </div>

            <div className="flex items-center gap-3 mt-10 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {["#4f9cf9", "#2dd4bf", "#8b5cf6", "#f59e0b"].map((c, i) => (
                  <div key={i} style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: c, border: "2px solid var(--bg-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "#fff",
                  }}>
                    {["JD", "AK", "MR", "SL"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>10M+</span> users worldwide
              </p>
            </div>
          </div>

          {/* Mock chat UI */}
          <div className="flex-1 flex justify-center anim-float">
            <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: "var(--gradient-sidebar)",
                border: "1px solid var(--border-hover)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(79,156,249,0.08)",
              }}>
              <div className="px-5 py-4 flex items-center gap-3"
                style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                  style={{ background: "var(--gradient-blue)" }}>JD</div>
                <div>
                  <p className="font-bold text-sm">Jane Doe</p>
                  <p className="text-xs font-semibold" style={{ color: "#22c55e" }}>● Online</p>
                </div>
                <div className="ml-auto flex gap-2">
                  {["📞", "🎥"].map((icon) => (
                    <div key={icon} className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                      style={{ background: "rgba(77,168,218,0.12)", cursor: "pointer" }}>
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-4 py-5 space-y-3" style={{ minHeight: 210 }}>
                {[
                  { from: "left", text: "Hey! How are you? 👋" },
                  { from: "right", text: "I'm great, thanks! 😊" },
                  { from: "left", text: "Want to hop on a call? 📞" },
                  { from: "right", text: "Sure! Starting now 🎉" },
                ].map((msg, i) => (
                  <div key={i} className={`flex justify-${msg.from}`}>
                    <div className="px-4 py-2.5 rounded-2xl max-w-[78%] text-sm"
                      style={msg.from === "right"
                        ? { background: "var(--gradient-blue)", borderBottomRightRadius: 4 }
                        : { background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)", borderBottomLeftRadius: 4 }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 flex gap-2" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex-1 rounded-xl px-4 py-2.5 text-sm"
                  style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
                  Type a message…
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--gradient-blue)", cursor: "pointer" }}>
                  <span className="text-sm text-white">➤</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-8 md:px-16"
        style={{ background: "linear-gradient(180deg, var(--bg-primary) 0%, #0d1630 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(79,156,249,0.08)", border: "1px solid rgba(79,156,249,0.2)", color: "var(--accent-blue)" }}>
              ⚡ Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Powerful{" "}
              <span style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Features</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Everything you need to stay connected with friends, family, and colleagues in one place
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "💬", title: "Instant Chat", desc: "Real-time messages with read receipts and typing indicators", gradient: "rgba(79,156,249,0.12)" },
              { icon: "📞", title: "Voice Calls", desc: "Crystal-clear HD voice calls powered by WebRTC technology", gradient: "rgba(45,212,191,0.12)" },
              { icon: "🎥", title: "Video Calls", desc: "Face-to-face conversations with high-definition video quality", gradient: "rgba(139,92,246,0.12)" },
              { icon: "👥", title: "Friend System", desc: "Add friends, manage requests, and stay connected easily", gradient: "rgba(245,158,11,0.12)" },
            ].map((f, i) => (
              <div key={i} className="text-center"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: "28px 22px",
                  position: "relative",
                  overflow: "hidden",
                }}>
                <div style={{
                  position: "absolute", top: -30, right: -30,
                  width: 100, height: 100, borderRadius: "50%",
                  background: f.gradient, pointerEvents: "none",
                }} />
                <div className="text-4xl mb-5" style={{ position: "relative" }}>{f.icon}</div>
                <h3 className="font-bold mb-2.5 text-base" style={{ fontFamily: "var(--font-display)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-28 px-8 md:px-16" style={{ background: "#0d1630" }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.2)", color: "var(--accent-teal)" }}>
              🚀 Services
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
              Our{" "}
              <span style={{
                background: "var(--gradient-teal)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Services</span>
            </h2>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              FunChat offers a comprehensive suite of communication tools designed to make
              your conversations engaging, secure, and productive.
            </p>
            <div className="space-y-3.5">
              {[
                "24/7 reliable messaging infrastructure",
                "End-to-end encrypted communications",
                "Cross-platform synchronization",
                "File sharing and media support",
                "Real-time notifications",
                "Admin dashboard and controls",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.25)" }}>
                    <span className="text-xs font-bold" style={{ color: "var(--accent-teal)" }}>✓</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-sm h-80 rounded-3xl flex flex-col items-center justify-center gap-4 relative overflow-hidden"
              style={{ background: "var(--gradient-card)", border: "1px solid var(--border-hover)" }}>
              <div style={{ fontSize: 72, position: "relative" }}>🚀</div>
              <p className="font-bold text-lg" style={{ fontFamily: "var(--font-display)", position: "relative" }}>Built for scale</p>
              <p className="text-sm text-center px-8" style={{ color: "var(--text-secondary)", position: "relative" }}>
                Powering millions of conversations every day
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-28 px-8 md:px-16"
        style={{ background: "linear-gradient(180deg, #0d1630 0%, var(--bg-primary) 100%)" }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-20">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>
              🌍 About
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
              About{" "}
              <span style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>FunChat</span>
            </h2>
            <p className="text-lg mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              FunChat was built with a simple mission: make communication fun, simple, and accessible to everyone.
            </p>
            <p className="text-base mb-10 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              We believe staying connected shouldn't be complicated. With powerful WebRTC technology,
              real-time Socket.io messaging, and a beautiful interface, we bring people together every day.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { val: "10M+", label: "Active Users", color: "var(--accent-teal)" },
                { val: "150+", label: "Countries", color: "var(--accent-blue)" },
                { val: "99.9%", label: "Uptime", color: "#a78bfa" },
              ].map((s, i) => (
                <div key={i} className="text-center p-4 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                  <div className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: s.color }}>
                    {s.val}
                  </div>
                  <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-sm h-80 rounded-3xl flex flex-col items-center justify-center gap-4 relative overflow-hidden"
              style={{ background: "var(--gradient-card)", border: "1px solid var(--border-hover)" }}>
              <div style={{ fontSize: 72, position: "relative" }}>🌍</div>
              <p className="font-bold text-lg" style={{ fontFamily: "var(--font-display)", position: "relative" }}>Connecting the world</p>
              <p className="text-sm text-center px-8" style={{ color: "var(--text-secondary)", position: "relative" }}>
                Available in 150+ countries across all devices
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-8 md:px-16 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f1d3d 0%, #111e4a 50%, #0d1830 100%)" }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="max-w-2xl mx-auto" style={{ position: "relative" }}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Ready to{" "}
            <span style={{
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>get started?</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: "var(--text-secondary)" }}>
            Join millions of people already using FunChat to stay connected
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup"
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all"
              style={{
                background: "var(--gradient-primary)",
                color: "#fff",
                padding: "15px 36px",
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 8px 32px rgba(79,156,249,0.4)",
              }}>
              Create Free Account →
            </Link>
            <Link href="/login"
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border-hover)",
                color: "var(--text-secondary)",
                padding: "15px 36px",
                fontSize: 15,
                textDecoration: "none",
              }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-16" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-primary)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gradient-teal)" }}>
              <span style={{ fontSize: 14 }}>💬</span>
            </div>
            <span className="font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--accent-teal)" }}>FunChat</span>
          </div>
          <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
            © 2026 FunChat. All rights reserved.
          </p>
          <div className="flex gap-5 text-sm" style={{ color: "var(--text-muted)" }}>
            <a href="#" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Privacy</a>
            <a href="#" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}