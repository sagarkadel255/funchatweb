"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, LogIn, Sparkles } from "lucide-react";
import { loginSchema, LoginData } from "../schema";
import { handleLogin } from "@/lib/actions/auth-action";
import { useAuthContext } from "@/context/authcontext";
import { useAuthStore } from "@/lib/store/authstore";
import toast from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuthContext();
  const { setTokens } = useAuthStore();
  const [error, setError]          = useState<string | null>(null);
  const [showPwd, setShowPwd]      = useState(false);
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const busy = isSubmitting || pending;

  const onSubmit = (values: LoginData) => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await handleLogin(values);
        if (!res.success) { setError(res.message); toast.error(res.message); return; }
        setTokens(res.data.token, res.data.refreshToken);
        setUser(res.data.user);
        toast.success("Welcome back, " + res.data.user.username + "!");
        setTimeout(() => router.push(res.data.user.role === "admin" ? "/admin" : "/user/dashboard"), 400);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Login failed";
        setError(msg);
        toast.error(msg);
        console.error("[LoginForm] error:", msg);
      }
    });
  };

  return (
    <div className="anim-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(79,156,249,0.1)", border: "1px solid rgba(79,156,249,0.2)",
          borderRadius: 999, padding: "4px 12px", marginBottom: 16,
        }}>
          <Sparkles size={11} style={{ color: "var(--accent-blue)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-blue)", letterSpacing: "0.05em" }}>
            WELCOME BACK
          </span>
        </div>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800, fontSize: 28,
          color: "#fff", marginBottom: 6, lineHeight: 1.2,
        }}>
          Sign in to{" "}
          <span style={{
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            FunChat
          </span>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "var(--accent-blue)", fontWeight: 600, textDecoration: "none" }}>
            Create one free
          </Link>
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          borderLeft: "3px solid var(--accent-red)",
          borderRadius: 10, padding: "11px 14px", marginBottom: 20,
          fontSize: 13, color: "#fca5a5", display: "flex", alignItems: "center", gap: 8,
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Email */}
        <div>
          <label className="fc-label">Email address</label>
          <div style={{ position: "relative" }}>
            <Mail style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              width: 16, height: 16, color: "var(--text-muted)", pointerEvents: "none",
            }} />
            <input
              type="email"
              placeholder="you@example.com"
              className={`fc-input ${errors.email ? "error" : ""}`}
              style={{ paddingLeft: 42 }}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 5 }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label className="fc-label" style={{ marginBottom: 0 }}>Password</label>
            <Link href="/forget-password" style={{ color: "var(--accent-blue)", fontSize: 12, textDecoration: "none", fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <Lock style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              width: 16, height: 16, color: "var(--text-muted)", pointerEvents: "none",
            }} />
            <input
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              className={`fc-input ${errors.password ? "error" : ""}`}
              style={{ paddingLeft: 42, paddingRight: 46 }}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", padding: 0, display: "flex",
              }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 5 }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={busy} className="fc-btn"
          style={{ width: "100%", marginTop: 6, padding: "13px 0", fontSize: 15, borderRadius: 14 }}
        >
          {busy ? (
            <>
              <span style={{
                width: 16, height: 16, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
              }} className="anim-spin" />
              Signing in…
            </>
          ) : (
            <><LogIn size={16} /> Sign In</>
          )}
        </button>
      </form>

      {/* Bottom link */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 14px" }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>New to FunChat?</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <Link href="/signup" style={{ display: "block", textDecoration: "none" }}>
        <div style={{
          width: "100%", padding: "11px 0",
          border: "1px solid var(--border-accent)", borderRadius: 14,
          textAlign: "center", fontSize: 14, fontWeight: 600,
          color: "var(--accent-blue)", background: "rgba(79,156,249,0.04)",
          transition: "all 0.2s",
        }}>
          Create a free account →
        </div>
      </Link>
    </div>
  );
}
