"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, UserCog } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api/axios";
import { adminApi } from "@/lib/api/admin/user";
import { extractApiError } from "@/lib/utils/api-error";
import UpdateUserForm from "../../_componenrts/updateuserform";

interface UserData {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  phone?: string;
  role: "user" | "admin";
  status: string;
  profileImage?: string;
}

export default function EditUserPage() {
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        let userData: UserData | null = null;

        // Try dedicated admin user-detail endpoint first
        try {
          const res = await api.get(`/admin/users/${userId}`);
          userData = res.data.success ? res.data.data : null;
        } catch {
          // Fallback: get full user list and find by ID
          const list = await (adminApi.getAllUsers as any)(1, 200);
          userData = (list.data || []).find((u: any) => u._id === userId) || null;
        }

        if (!userData) {
          setError("User not found");
        } else {
          setUser(userData);
          console.log("✅ Loaded user for edit:", userData.username);
        }
      } catch (e) {
        const msg = extractApiError(e);
        console.error("Fetch user for edit error:", msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <div className="skeleton h-5 rounded w-28" />
        <div className="skeleton h-8 rounded w-48" />
        <div className="fc-card-dark space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-3 rounded w-24" />
              <div className="skeleton h-11 rounded-xl w-full" />
            </div>
          ))}
          <div className="flex gap-3">
            <div className="skeleton h-11 rounded-xl flex-1" />
            <div className="skeleton h-11 rounded-xl flex-1" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !user) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">
          {error || "User not found"}
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Could not load this user's data.
        </p>
        <Link href="/admin/users" style={{ textDecoration: "none" }}>
          <button className="fc-btn">← Back to Users</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back navigation */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/admin/users/${userId}`}
          className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft className="w-4 h-4" />
          Back to User
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <Link
          href="/admin/users"
          className="text-sm hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-muted)" }}>
          All Users
        </Link>
      </div>

      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(77,168,218,0.1)" }}>
          <UserCog className="w-5 h-5" style={{ color: "var(--accent-blue)" }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Edit User
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Editing{" "}
            <span style={{ color: "var(--accent-blue)" }}>@{user.username}</span>
          </p>
        </div>
      </div>

      {/* Current user info banner */}
      <div className="p-4 rounded-2xl mb-6 flex items-center gap-3"
        style={{ background: "rgba(77,168,218,0.05)", border: "1px solid var(--border)" }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: user.status === "online" ? "#22c55e" : "var(--text-muted)" }} />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{user.username}</p>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>
        </div>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full capitalize flex-shrink-0"
          style={{ background: "rgba(77,168,218,0.1)", color: "var(--accent-blue)" }}>
          {user.role}
        </span>
      </div>

      {/* Form */}
      <div className="fc-card">
        <h3 className="font-bold mb-5" style={{ fontFamily: "var(--font-display)" }}>
          Update Information
        </h3>
        <UpdateUserForm
          userId={userId}
          initialData={{
            username: user.username,
            email: user.email,
            bio: user.bio,
            phone: user.phone,
            role: user.role,
          }}
        />
      </div>

      {/* Danger zone */}
      <div className="mt-6 p-5 rounded-2xl"
        style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)" }}>
        <h3 className="font-bold text-sm mb-1" style={{ color: "var(--accent-red)" }}>
          Danger Zone
        </h3>
        <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
          These actions are irreversible. Proceed with caution.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/users/${userId}`}>
            <button className="py-2 px-4 text-xs rounded-xl font-semibold transition-all"
              style={{ background: "rgba(249,115,22,0.1)", color: "var(--accent-orange)", border: "1px solid rgba(249,115,22,0.2)" }}>
              Ban User
            </button>
          </Link>
          <Link href={`/admin/users/${userId}`}>
            <button className="py-2 px-4 text-xs rounded-xl font-semibold transition-all"
              style={{ background: "rgba(239,68,68,0.08)", color: "var(--accent-red)", border: "1px solid rgba(239,68,68,0.15)" }}>
              Delete User
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}