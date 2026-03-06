"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Shield, FileText, Phone, Save } from "lucide-react";
import { z } from "zod";
import toast from "react-hot-toast";
import { extractApiError } from "@/lib/utils/api-error";
import api from "@/lib/api/axios";

const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Min 3 characters")
    .max(20, "Max 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, "Bio max 500 characters").optional(),
  phone: z.string().optional(),
  role: z.enum(["user", "admin"]),
});

type UpdateUserData = z.infer<typeof updateUserSchema>;

interface Props {
  userId: string;
  initialData?: {
    username?: string;
    bio?: string;
    phone?: string;
    role?: "user" | "admin";
    email?: string;
  };
}

export default function UpdateUserForm({ userId, initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateUserData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: initialData?.username || "",
      bio: initialData?.bio || "",
      phone: initialData?.phone || "",
      role: initialData?.role || "user",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        username: initialData.username || "",
        bio: initialData.bio || "",
        phone: initialData.phone || "",
        role: initialData.role || "user",
      });
    }
  }, [initialData]);

  const onSubmit = (values: UpdateUserData) => {
    setError(null);
    startTransition(async () => {
      try {
        console.log("✏️ Admin updating user:", userId, values);
        // Build update payload — only include non-empty fields
        const payload: Record<string, string> = { role: values.role };
        if (values.username) payload.username = values.username;
        if (values.bio !== undefined) payload.bio = values.bio;
        if (values.phone !== undefined) payload.phone = values.phone;

        // Admin uses the same profile update endpoint scoped to a userId
        // If your backend has a dedicated admin update route, swap the URL here
        const res = await api.put(`/admin/users/${userId}`, payload);

        if (res.data.success) {
          toast.success("User updated successfully!");
          console.log("✅ User updated:", userId);
          router.push(`/admin/users/${userId}`);
        } else {
          setError(res.data.message || "Update failed");
          toast.error(res.data.message || "Update failed");
        }
      } catch (e) {
        // Fallback: some backends may not have a dedicated admin user-update route yet
        const msg = extractApiError(e);
        console.error("Update user error:", msg);
        // Show a softer message if 404 (route doesn't exist yet on backend)
        if (msg.includes("404") || msg.includes("Not Found")) {
          setError("Admin user-update endpoint not yet available on backend. Add PUT /admin/users/:id.");
        } else {
          setError(msg);
        }
        toast.error(msg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl text-sm"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fca5a5",
          }}>
          ⚠️ {error}
        </div>
      )}

      {/* Email display (read-only) */}
      {initialData?.email && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Email (read-only)</p>
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{initialData.email}</p>
        </div>
      )}

      {/* Username */}
      <div className="space-y-1.5">
        <label className="fc-label">Username</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="New username..."
            className={`fc-input pl-10 ${errors.username ? "error" : ""}`}
            {...register("username")}
          />
        </div>
        {errors.username && (
          <p className="text-xs" style={{ color: "var(--accent-red)" }}>{errors.username.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="fc-label">Phone</label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="tel"
            placeholder="+1 234 567 8900"
            className="fc-input pl-10"
            {...register("phone")}
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <label className="fc-label">Bio</label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3.5 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <textarea
            rows={3}
            placeholder="User bio..."
            className="fc-input pl-10 resize-none"
            {...register("bio")}
          />
        </div>
        {errors.bio && (
          <p className="text-xs" style={{ color: "var(--accent-red)" }}>{errors.bio.message}</p>
        )}
      </div>

      {/* Role */}
      <div className="space-y-1.5">
        <label className="fc-label">Role</label>
        <div className="relative">
          <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <select
            className="fc-input pl-10"
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
          Changing to Admin grants full panel access. Change carefully.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="fc-btn-ghost flex-1">
          Cancel
        </button>
        <button type="submit" disabled={pending || !isDirty} className="fc-btn flex-1">
          {pending ? (
            <>
              <span style={{
                width: 15, height: 15, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
              }} className="anim-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}