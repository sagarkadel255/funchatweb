"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, BarChart2, Shield, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/store/authstore";
import { authApi } from "@/lib/api/auth";
import { disconnectSocket } from "@/lib/utils/socket";
import toast from "react-hot-toast";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/stats", icon: BarChart2, label: "Analytics" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    disconnectSocket();
    clearAuth();
    toast.success("Signed out");
    router.push("/login");
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="fc-sidebar">
      {/* Admin logo mark */}
      <div style={{ marginBottom: 20, position: "relative" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: "var(--gradient-blue)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(79,156,249,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset",
          position: "relative",
        }}>
          <Shield size={20} style={{ color: "#fff" }} />
          {/* Glow ring */}
          <div style={{
            position: "absolute", inset: -3, borderRadius: 17,
            border: "1px solid rgba(79,156,249,0.25)", pointerEvents: "none",
          }} />
        </div>
      </div>

      {/* Separator */}
      <div style={{
        width: 28, height: 1, marginBottom: 14,
        background: "var(--border)",
      }} />

      {/* Nav icons */}
      <nav style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 6, flex: 1,
      }}>
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} title={item.label}
              style={{ textDecoration: "none" }}>
              <div className={`fc-sidebar-icon ${active ? "active" : ""}`}>
                <item.icon size={20} />
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Separator */}
      <div style={{
        width: 28, height: 1, marginBottom: 12,
        background: "var(--border)",
      }} />

      {/* Logout */}
      <button
        onClick={handleLogout}
        title="Logout"
        className="fc-sidebar-icon"
        style={{
          background: "none", border: "none",
          transition: "all 0.22s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-red)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "none";
          (e.currentTarget as HTMLButtonElement).style.color = "";
        }}>
        <LogOut size={19} />
      </button>
    </aside>
  );
}
