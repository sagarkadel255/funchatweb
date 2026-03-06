"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Shield, Eye, EyeOff, UserPlus } from "lucide-react";
import { z } from "zod";
import toast from "react-hot-toast";
import { extractApiError } from "@/lib/utils/api-error";
import api from "@/lib/api/axios";

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Min 3 characters")
    .max(20, "Max 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm password"),
  role: z.enum(["user", "admin"]),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type CreateUserData = z.infer<typeof createUserSchema>;

export default function CreateUserForm() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "user" },
  });

  const onSubmit = (values: CreateUserData) => {
    setError(null);
    startTransition(async () => {
      try {
        console.log("📝 Admin creating user:", values.username);
        // Use the auth register endpoint — admins can create users
        const res = await api.post("/auth/register", {
          username: values.username,
          email: values.email,
          password: values.password,
          role: values.role,
        });

        if (res.data.success) {
          toast.success(`User "${values.username}" created successfully!`);
          console.log("✅ User created:", res.data.data?.user?.id);
          router.push("/admin/users");
        } else {
          setError(res.data.message || "Failed to create user");
          toast.error(res.data.message || "Failed");
        }
      } catch (e) {
        const msg = extractApiError(e);
        console.error("Create user error:", msg);
        setError(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl text-sm flex items-center gap-2"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fca5a5",
          }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Username */}
      <div className="space-y-1.5">
        <label className="fc-label">Username</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="johndoe"
            className={`fc-input pl-10 ${errors.username ? "error" : ""}`}
            {...register("username")}
          />
        </div>
        {errors.username && (
          <p className="text-xs" style={{ color: "var(--accent-red)" }}>{errors.username.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="fc-label">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="email"
            placeholder="user@example.com"
            className={`fc-input pl-10 ${errors.email ? "error" : ""}`}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs" style={{ color: "var(--accent-red)" }}>{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="fc-label">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            className={`fc-input pl-10 pr-10 ${errors.password ? "error" : ""}`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}>
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs" style={{ color: "var(--accent-red)" }}>{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="fc-label">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="password"
            placeholder="••••••••"
            className={`fc-input pl-10 ${errors.confirmPassword ? "error" : ""}`}
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs" style={{ color: "var(--accent-red)" }}>{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Role */}
      <div className="space-y-1.5">
        <label className="fc-label">Role</label>
        <div className="relative">
          <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <select
            className={`fc-input pl-10 ${errors.role ? "error" : ""}`}
            style={{ appearance: "none", cursor: "pointer" }}
            {...register("role")}>
            <option value="user" style={{ background: "#172448" }}>User</option>
            <option value="admin" style={{ background: "#172448" }}>Admin</option>
          </select>
        </div>
        {errors.role && (
          <p className="text-xs" style={{ color: "var(--accent-red)" }}>{errors.role.message}</p>
        )}
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Admin users have full access to the admin panel and all controls.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className="fc-btn-ghost flex-1">
          Cancel
        </button>
        <button type="submit" disabled={pending} className="fc-btn flex-1">
          {pending ? (
            <>
              <span style={{
                width: 15, height: 15, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
              }} className="anim-spin" />
              Creating…
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Create User
            </>
          )}
        </button>
      </div>
    </form>
  );
}