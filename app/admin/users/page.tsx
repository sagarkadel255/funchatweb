"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, Trash2, Ban, RefreshCw, Shield, User, UserPlus, Edit2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin/user";
import { getInitials, getAvatarColor, formatTime } from "@/lib/utils/formatters";
import DeleteModal from "@/app/user/_components/deletemodal";
import toast from "react-hot-toast";
import { getImageUrl } from "@/lib/utils/getimageurl";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const fetchUsers = (p = 1, q = search) => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adminApi.getAllUsers as any)(p, 15, q || undefined)
      .then((res: any) => {
        if (res.success) {
          setUsers(res.data || []);
          setTotal(res.pagination?.total || res.data?.length || 0);
        }
      })
      .catch((e: any) => console.error("Fetch users error:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = () => { setPage(1); fetchUsers(1, search); };

  const handleBan = (userId: string) => {
    startTransition(async () => {
      try {
        const res = await adminApi.banUser(userId);
        if (res.success) {
          toast.success("User banned");
          fetchUsers(page);
        } else {
          toast.error(res.message || "Failed");
        }
      } catch (e: any) { toast.error(e.message || "Failed"); }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        const res = await adminApi.deleteUser(deleteTarget);
        if (res.success) {
          toast.success("User deleted");
          setDeleteTarget(null);
          fetchUsers(page);
        } else {
          toast.error(res.message || "Failed");
        }
      } catch (e: any) { toast.error(e.message || "Failed"); }
    });
  };

  const LIMIT = 15;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{
            fontFamily: "var(--font-display)",
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>User Management</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {total} total users registered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchUsers(page)} className="fc-icon-btn" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/admin/users/create" style={{ textDecoration: "none" }}>
            <button className="fc-btn" style={{ padding: "8px 18px", fontSize: 13, borderRadius: 12 }}>
              <UserPlus className="w-4 h-4" /> Create User
            </button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input type="text" placeholder="Search by username or email…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="fc-input pl-10" />
        </div>
        <button onClick={handleSearch} className="fc-btn" style={{ padding: "8px 20px", fontSize: 13, borderRadius: 12 }}>
          Search
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 20, overflow: "hidden",
      }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="skeleton w-9 h-9 rounded-full" />
                        <div className="skeleton h-4 rounded w-28" />
                      </div>
                    </td>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-20" /></td>
                    ))}
                    <td className="px-5 py-4"><div className="skeleton h-7 rounded w-16" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12" style={{ color: "var(--text-secondary)" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: "1px solid var(--border)" }}
                    className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="fc-avatar w-9 h-9 flex-shrink-0">
                          {u.profileImage ? (
                            <Image src={getImageUrl(u.profileImage) || ""} alt={u.username} width={36} height={36} className="object-cover" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${getAvatarColor(u.username)}`}>
                              {getInitials(u.username)}
                            </div>
                          )}
                        </div>
                        <Link href={`/admin/users/${u._id}`}
                          className="font-semibold text-sm hover:underline transition-all"
                          style={{ color: "var(--accent-blue)" }}>
                          {u.username}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{u.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold capitalize"
                        style={u.role === "admin"
                          ? { background: "rgba(124,109,204,0.1)", color: "#a78bfa", border: "1px solid rgba(124,109,204,0.2)" }
                          : { background: "rgba(77,168,218,0.08)", color: "var(--accent-blue)", border: "1px solid var(--border)" }}>
                        {u.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold capitalize`}
                        style={{
                          background: u.status === "online" ? "rgba(34,197,94,0.1)" :
                            u.status === "away" ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.04)",
                          color: u.status === "online" ? "#22c55e" :
                            u.status === "away" ? "var(--accent-orange)" : "var(--text-muted)",
                        }}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          u.status === "online" ? "bg-green-400" :
                          u.status === "away" ? "bg-orange-400" : "bg-gray-500"
                        }`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {formatTime(u.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/users/${u._id}/edit`} style={{ textDecoration: "none" }}>
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                            style={{ background: "rgba(79,156,249,0.1)", color: "var(--accent-blue)", border: "none", cursor: "pointer" }}
                            title="Edit user">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <button onClick={() => handleBan(u._id)} disabled={pending}
                          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                          style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "none", cursor: "pointer" }}
                          title="Ban user">
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(u._id)} disabled={pending}
                          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                          style={{ background: "rgba(239,68,68,0.08)", color: "var(--accent-red)", border: "none", cursor: "pointer" }}
                          title="Delete user">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => { setPage(page - 1); fetchUsers(page - 1); }}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">← Prev</button>
              <button disabled={page >= totalPages} onClick={() => { setPage(page + 1); fetchUsers(page + 1); }}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={pending}
        title="Delete User?"
        description="This will permanently delete the user and all their data. This action cannot be undone."
      />
    </div>
  );
}