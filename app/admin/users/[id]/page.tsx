"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Edit, Trash2, Ban, Shield, User,
  Mail, Phone, Calendar, MessageSquare, Clock, Activity
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api/axios";
import { adminApi } from "@/lib/api/admin/user";
import { getInitials, getAvatarColor, formatTime } from "@/lib/utils/formatters";
import { extractApiError } from "@/lib/utils/api-error";
import DeleteModal from "@/app/user/_components/deletemodal";
import toast from "react-hot-toast";
import { getImageUrl } from "@/lib/utils/getimageurl";

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [banning, setBanning] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      // Try to fetch single user — if your backend doesn't have GET /admin/users/:id yet,
      // fall back to fetching the user list and finding by id
      let userData: any = null;
      try {
        const res = await api.get(`/admin/users/${userId}`);
        userData = res.data.success ? res.data.data : null;
      } catch {
        // Fallback: fetch all users and find by ID
        const list = await (adminApi.getAllUsers as any)(1, 100);
        userData = (list.data || []).find((u: any) => u._id === userId) || null;
      }
      setUser(userData);
      console.log("✅ User loaded:", userData?.username);
    } catch (e) {
      console.error("Load user error:", extractApiError(e));
      toast.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    setBanning(true);
    try {
      const res = await adminApi.banUser(userId);
      if (res.success) {
        toast.success("User has been banned");
        fetchUser();
      } else {
        toast.error(res.message || "Ban failed");
      }
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setBanning(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await adminApi.deleteUser(userId);
      if (res.success) {
        toast.success("User deleted");
        router.push("/admin/users");
      } else {
        toast.error(res.message || "Delete failed");
        setShowDelete(false);
      }
    } catch (e) {
      toast.error(extractApiError(e));
      setShowDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        <div className="skeleton h-5 rounded w-28" />
        <div className="fc-card flex items-center gap-5">
          <div className="skeleton w-20 h-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-6 rounded w-40" />
            <div className="skeleton h-4 rounded w-56" />
            <div className="skeleton h-4 rounded w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="fc-card-dark space-y-2">
              <div className="skeleton h-3 rounded w-24" />
              <div className="skeleton h-5 rounded w-36" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold mb-2">User not found</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          This user may have been deleted or doesn't exist.
        </p>
        <Link href="/admin/users" style={{ textDecoration: "none" }}>
          <button className="fc-btn">← Back to Users</button>
        </Link>
      </div>
    );
  }

  const infoItems = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Phone", value: user.phone || "Not provided" },
    { icon: Calendar, label: "Joined", value: formatTime(user.createdAt) },
    { icon: Clock, label: "Last Seen", value: user.lastSeen ? formatTime(user.lastSeen) : "Unknown" },
    { icon: MessageSquare, label: "Friends", value: `${user.friends?.length || 0} friends` },
    { icon: Activity, label: "Status", value: user.status || "offline" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity"
        style={{ color: "var(--text-secondary)" }}>
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* Profile card */}
      <div className="fc-card-dark mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="fc-avatar w-20 h-20" style={{ border: "3px solid var(--border-hover)" }}>
            {user.profileImage ? (
              <Image src={getImageUrl(user.profileImage) || ""} alt={user.username} width={80} height={80} className="object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br ${getAvatarColor(user.username)}`}>
                {getInitials(user.username)}
              </div>
            )}
          </div>
          {/* Online status indicator */}
          <span className={`status-dot absolute -bottom-0.5 -right-0.5 ${
            user.status === "online" ? "status-online" :
            user.status === "away" ? "status-away" : "status-offline"
          }`} style={{ width: 14, height: 14, borderWidth: 2 }} />
        </div>

        {/* Name & badges */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {user.username}
            </h2>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold capitalize"
              style={user.role === "admin"
                ? { background: "rgba(124,109,204,0.15)", color: "#a78bfa", border: "1px solid rgba(124,109,204,0.25)" }
                : { background: "rgba(77,168,218,0.1)", color: "var(--accent-blue)", border: "1px solid var(--border-hover)" }}>
              {user.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {user.role}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold capitalize`}
              style={{
                background: user.status === "online" ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
                color: user.status === "online" ? "#22c55e" : "var(--text-muted)",
                border: `1px solid ${user.status === "online" ? "rgba(34,197,94,0.2)" : "var(--border)"}`,
              }}>
              <span className={`w-1.5 h-1.5 rounded-full ${user.status === "online" ? "bg-green-400" : "bg-gray-500"}`} />
              {user.status}
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{user.email}</p>
          {user.bio && (
            <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>{user.bio}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <Link href={`/admin/users/${userId}/edit`} style={{ textDecoration: "none" }}>
            <button className="fc-btn-ghost" style={{ padding: "7px 14px", fontSize: 13 }}>
              <Edit className="w-4 h-4" /> Edit
            </button>
          </Link>
          <button
            onClick={handleBan}
            disabled={banning}
            className="py-2 px-3 text-sm flex items-center gap-1.5 rounded-xl transition-all font-semibold"
            style={{ background: "rgba(249,115,22,0.1)", color: "var(--accent-orange)", border: "1px solid rgba(249,115,22,0.2)" }}>
            {banning ? (
              <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin-icon" />
            ) : (
              <Ban className="w-4 h-4" />
            )}
            Ban
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="py-2 px-3 text-sm flex items-center gap-1.5 rounded-xl transition-all font-semibold"
            style={{ background: "rgba(239,68,68,0.08)", color: "var(--accent-red)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {infoItems.map((item, i) => (
          <div key={i} className="fc-card-dark flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(77,168,218,0.08)" }}>
              <item.icon className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--text-muted)" }}>
                {item.label}
              </p>
              <p className="text-sm font-medium truncate capitalize">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Blocked users */}
      {user.blockedUsers?.length > 0 && (
        <div className="fc-card-dark mb-5">
          <h3 className="font-bold mb-3 text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Blocked Users ({user.blockedUsers.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.blockedUsers.map((id: string) => (
              <span key={id} className="text-xs px-3 py-1.5 rounded-full font-mono"
                style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Raw data accordion */}
      <details className="fc-card-dark group">
        <summary className="cursor-pointer font-semibold text-sm flex items-center justify-between list-none"
          style={{ color: "var(--text-secondary)" }}>
          Raw User Data
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>click to expand</span>
        </summary>
        <pre className="mt-4 text-xs overflow-auto p-4 rounded-xl"
          style={{ background: "rgba(0,0,0,0.3)", color: "var(--accent-teal)", maxHeight: 300 }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </details>

      {/* Delete modal */}
      <DeleteModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete ${user.username}?`}
        description="This permanently deletes this user and all their messages, conversations, and data. This action cannot be undone."
      />
    </div>
  );
}