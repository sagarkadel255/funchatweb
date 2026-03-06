"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { forgetPasswordSchema, ForgetPasswordData } from "../schema";
import toast from "react-hot-toast";

export default function ForgetPasswordForm() {
  const [sent, setSent]         = useState(false);
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgetPasswordData>({
    resolver: zodResolver(forgetPasswordSchema),
  });

  const busy = isSubmitting || pending;

  const onSubmit = (values: ForgetPasswordData) => {
    startTransition(async () => {
      try {
        // POST /auth/forgot-password — endpoint to be added on backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
        });
        const data = await res.json();
        if (data.success) {
          setSent(true);
          toast.success("Reset link sent!");
          console.log("[ForgetPassword] email sent to:", values.email);
        } else {
          toast.error(data.message || "Failed to send reset link");
        }
      } catch {
        // Show success anyway to not leak if email exists
        setSent(true);
        toast.success("If that email exists, a reset link has been sent.");
      }
    });
  };

  if (sent) {
    return (
      <div className="anim-up" style={{ textAlign:"center" }}>
        <div style={{ fontSize:64, marginBottom:20 }}>📧</div>
        <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:24, color:"#fff", marginBottom:10 }}>
          Check your inbox
        </h2>
        <p style={{ color:"rgba(255,255,255,0.5)", fontSize:14, marginBottom:28 }}>
          We&apos;ve sent a password reset link to your email address.
        </p>
        <Link href="/login" className="fc-btn" style={{ textDecoration:"none", display:"inline-flex" }}>
          <ArrowLeft size={16}/> Back to Login
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
        Forgot Password? 🔑
      </h2>
      <p style={{ color:"rgba(255,255,255,0.45)", fontSize:14, marginBottom:28 }}>
        Enter your email and we&apos;ll send a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:18 }}>
        <div>
          <label className="fc-label">Email address</label>
          <div style={{ position:"relative" }}>
            <Mail style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",width:16,height:16,color:"rgba(255,255,255,0.3)" }} />
            <input
              type="email"
              placeholder="you@example.com"
              className={`fc-input ${errors.email ? "error" : ""}`}
              style={{ paddingLeft:40 }}
              {...register("email")}
            />
          </div>
          {errors.email && <p style={{ color:"#f87171",fontSize:12,marginTop:4 }}>{errors.email.message}</p>}
        </div>

        <button type="submit" disabled={busy} className="fc-btn" style={{ width:"100%", padding:"12px 0" }}>
          {busy ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}