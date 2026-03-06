"use client";

import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { useAuthStore } from "@/lib/store/authstore";
import Image from "next/image";
import Link from "next/link";
import { getInitials, getAvatarColor } from "@/lib/utils/formatters";
import { getImageUrl } from "@/lib/utils/getimageurl";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "User Management",
  "/admin/stats": "Analytics",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const title = Object.entries(PAGE_TITLES).find(([p]) => pathname.startsWith(p))?.[1] || "Admin";

  return (
    <header className="fc-header">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5"
          style={{ background: "rgba(77,168,218,0.1)", color: "var(--accent-blue)", border: "1px solid var(--border-hover)" }}>
          <Shield className="w-3 h-3" /> Admin Panel
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold">{user?.username}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
        <Link href="/admin">
          <div className="fc-avatar w-9 h-9" style={{ border: "2px solid var(--border-hover)" }}>
            {user?.profileImage ? (
              <Image src={getImageUrl(user.profileImage) || ""} alt={user.username} width={36} height={36} className="object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${getAvatarColor(user?.username || "A")}`}>
                {getInitials(user?.username || "A")}
              </div>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}