"use client";

import { useEffect } from "react";
import { useChat } from "@/lib/hooks/usechat";
import ChatList from "./_components/chatlist";
import { MessageCircle, Sparkles, ArrowRight } from "lucide-react";

export default function ChatPage() {
  const { conversations, loadConversations, loadingConvs } = useChat();

  useEffect(() => { loadConversations(); }, []);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <ChatList conversations={conversations} loading={loadingConvs} activeId={null} />

      {/* Premium empty state */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "var(--bg-secondary)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative ambient orbs */}
        <div style={{
          position: "absolute", top: "15%", left: "20%",
          width: 340, height: 340, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,156,249,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "20%", right: "15%",
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        {/* Subtle dot grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

        {/* Content card */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", maxWidth: 400, padding: "0 24px",
        }}>
          {/* Animated icon ring */}
          <div style={{
            position: "relative", marginBottom: 28,
            width: 96, height: 96,
          }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: "var(--gradient-primary)", opacity: 0.15,
              animation: "glowPulse 3s ease-in-out infinite",
            }} />
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(79,156,249,0.15) 0%, rgba(139,92,246,0.15) 100%)",
              border: "1px solid rgba(139,92,246,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}>
              <MessageCircle size={38} style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }} />
            </div>
          </div>

          <h3 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800, fontSize: 22,
            color: "var(--text-primary)", marginBottom: 10, lineHeight: 1.3,
          }}>
            Select a conversation
          </h3>
          <p style={{
            color: "var(--text-muted)", fontSize: 14,
            lineHeight: 1.7, marginBottom: 28,
          }}>
            Pick an existing chat from the left panel or start a fresh conversation with a friend.
          </p>

          {/* Stats chip */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(79,156,249,0.08)",
            border: "1px solid rgba(79,156,249,0.18)",
            borderRadius: 12, padding: "9px 16px",
            marginBottom: 14,
          }}>
            <Sparkles size={14} style={{ color: "var(--accent-blue)" }} />
            <span style={{ color: "var(--accent-blue)", fontSize: 13, fontWeight: 600 }}>
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""} ready
            </span>
          </div>

          {/* Hint */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            color: "var(--text-muted)", fontSize: 12,
          }}>
            <ArrowRight size={12} />
            <span>Choose from the list on the left</span>
          </div>
        </div>
      </div>
    </div>
  );
}
