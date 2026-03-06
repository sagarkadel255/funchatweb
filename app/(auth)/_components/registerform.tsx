"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Rocket } from "lucide-react";
import { registerSchema, RegisterData } from "../schema";
import { handleRegister } from "@/lib/actions/auth-action";
import { useAuthContext } from "@/context/authcontext";
import { useAuthStore } from "@/lib/store/authstore";
import toast from "react-hot-toast";

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

  if (!password) return null;
  return (
    <div style={{ marginTop: 7 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= score ? colors[score] : "rgba(255,255,255,0.08)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: colors[score], fontWeight: 600 }}>
        {labels[score]} {score === 4 ? "✓" : ""}
      </p>
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const { setUser } = useAuthContext();
  const { setTokens } = useAuthStore();
  const [error, setError]          = useState<string | null>(null);
  const [showPwd, setShowPwd]      = useState(false);
  const [pending, startTransition] = useTransition();

  const { register: formRegister, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  const busy          = isSubmitting || pending;
  const passwordValue = watch("password", "");

  const onSubmit = (values: RegisterData) => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await handleRegister({ username: values.username, email: values.email, password: values.password });
        if (!res.success) { setError(res.message); toast.error(res.message); return; }
        setTokens(res.data.token, res.data.refreshToken);
        setUser(res.data.user);
        toast.success("Account created! Welcome, " + res.data.user.username + "!");
        setTimeout(() => router.push("/user/dashboard"), 400);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Registration failed";
        setError(msg);
        toast.error(msg);
        console.error("[RegisterForm] error:", msg);
      }
    });
  };

  const inputStyle = (hasError: boolean) => ({
    paddingLeft: 42,
    ...(hasError ? {} : {}),
  });

  return (
    <div className="anim-up">
      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)",
          borderRadius: 999, padding: "4px 12px", marginBottom: 16,
        }}>
          <Rocket size={11} style={{ color: "var(--accent-violet)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-violet)", letterSpacing: "0.05em" }}>
            GET STARTED FREE
          </span>
        </div>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800, fontSize: 28,
          color: "#fff", marginBottom: 6, lineHeight: 1.2,
        }}>
          Create your{" "}
          <span style={{
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            account
          </span>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Already have one?{" "}
          <Link href="/login" style={{ color: "var(--accent-blue)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          borderLeft: "3px solid var(--accent-red)",
          borderRadius: 10, padding: "11px 14px", marginBottom: 18,
          fontSize: 13, color: "#fca5a5", display: "flex", alignItems: "center", gap: 8,
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Username */}
        <div>
          <label className="fc-label">Username</label>
          <div style={{ position: "relative" }}>
            <User style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              type="text" placeholder="johndoe"
              className={`fc-input ${errors.username ? "error" : ""}`}
              style={inputStyle(!!errors.username)}
              {...formRegister("username")}
            />
          </div>
          {errors.username && <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 5 }}>{errors.username.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="fc-label">Email address</label>
          <div style={{ position: "relative" }}>
            <Mail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              type="email" placeholder="you@example.com"
              className={`fc-input ${errors.email ? "error" : ""}`}
              style={inputStyle(!!errors.email)}
              {...formRegister("email")}
            />
          </div>
          {errors.email && <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 5 }}>{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="fc-label">Password</label>
          <div style={{ position: "relative" }}>
            <Lock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              type={showPwd ? "text" : "password"} placeholder="Min. 6 characters"
              className={`fc-input ${errors.password ? "error" : ""}`}
              style={{ paddingLeft: 42, paddingRight: 46 }}
              {...formRegister("password")}
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex",
            }}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <PasswordStrength password={passwordValue} />
          {errors.password && <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 5 }}>{errors.password.message}</p>}
        </div>

        {/* Confirm password */}
        <div>
          <label className="fc-label">Confirm password</label>
          <div style={{ position: "relative" }}>
            <Lock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              type="password" placeholder="Repeat password"
              className={`fc-input ${errors.confirmPassword ? "error" : ""}`}
              style={inputStyle(!!errors.confirmPassword)}
              {...formRegister("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 5 }}>{errors.confirmPassword.message}</p>}
        </div>

        {/* Terms note */}
        <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
          By creating an account, you agree to our{" "}
          <span style={{ color: "var(--accent-blue)" }}>Terms of Service</span> and{" "}
          <span style={{ color: "var(--accent-blue)" }}>Privacy Policy</span>.
        </p>

        {/* Submit */}
        <button type="submit" disabled={busy} className="fc-btn"
          style={{ width: "100%", padding: "13px 0", fontSize: 15, borderRadius: 14 }}>
          {busy ? (
            <>
              <span style={{
                width: 16, height: 16, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
              }} className="anim-spin" />
              Creating account…
            </>
          ) : (
            <><UserPlus size={16} /> Create Account</>
          )}
        </button>
      </form>
    </div>
  );
}
