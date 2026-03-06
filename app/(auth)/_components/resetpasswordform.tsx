"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { resetPasswordSchema, ResetPasswordData } from "../schema";
import toast from "react-hot-toast";

export default function ResetPasswordForm() {
  const router      = useRouter();
  const params      = useSearchParams();
  const token       = params.get("token") || "";
  const [showPwd, setShowPwd] = useState(false);
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const busy = isSubmitting || pending;

  const onSubmit = (values: ResetPasswordData) => {
    startTransition(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: values.password }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Password reset successfully!");
          console.log("[ResetPassword] success");
          setTimeout(() => router.push("/login"), 1000);
        } else {
          toast.error(data.message || "Reset failed");
        }
      } catch {
        toast.error("Something went wrong. Try again.");
      }
    });
  };

  if (!token) {
    return (
      <div className="anim-up" style={{ textAlign:"center" }}>
        <div style={{ fontSize:64, marginBottom:16 }}>❌</div>
        <h2 style={{ color:"#fff", fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:22, marginBottom:10 }}>
          Invalid Reset Link
        </h2>
        <p style={{ color:"rgba(255,255,255,0.5)", marginBottom:24, fontSize:14 }}>
          This link is invalid or has expired.
        </p>
        <Link href="/forget-password" className="fc-btn" style={{ textDecoration:"none", display:"inline-flex" }}>
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="anim-up">
      <Link href="/login" style={{ display:"inline-flex",alignItems:"center",gap:6,color:"rgba(255,255,255,0.4)",textDecoration:"none",fontSize:13,marginBottom:24 }}>
        <ArrowLeft size={14}/> Back to Login
      </Link>

      <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:26, color:"#fff", marginBottom:6 }}>
        Set New Password 🔒
      </h2>
      <p style={{ color:"rgba(255,255,255,0.45)", fontSize:14, marginBottom:28 }}>
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:18 }}>
        <div>
          <label className="fc-label">New Password</label>
          <div style={{ position:"relative" }}>
            <Lock style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",width:16,height:16,color:"rgba(255,255,255,0.3)" }} />
            <input
              type={showPwd ? "text" : "password"}
              placeholder="New password"
              className={`fc-input ${errors.password ? "error" : ""}`}
              style={{ paddingLeft:40, paddingRight:44 }}
              {...register("password")}
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
              position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",
              background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.4)",padding:0,
            }}>
              {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          {errors.password && <p style={{ color:"#f87171",fontSize:12,marginTop:4 }}>{errors.password.message}</p>}
        </div>

        <div>
          <label className="fc-label">Confirm New Password</label>
          <div style={{ position:"relative" }}>
            <Lock style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",width:16,height:16,color:"rgba(255,255,255,0.3)" }} />
            <input
              type="password"
              placeholder="Repeat new password"
              className={`fc-input ${errors.confirmPassword ? "error" : ""}`}
              style={{ paddingLeft:40 }}
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && <p style={{ color:"#f87171",fontSize:12,marginTop:4 }}>{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={busy} className="fc-btn" style={{ width:"100%", padding:"12px 0" }}>
          {busy ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}