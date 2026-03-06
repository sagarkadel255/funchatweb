"use client";

import { getInitials, getAvatarColor, formatTime } from "@/lib/utils/formatters";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils/getimageurl";

interface Props {
  users: any[];
  onBan: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function UserTable({ users, onBan, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="fc-avatar w-9 h-9">
                    {u.profileImage ? (
                      <Image src={getImageUrl(u.profileImage) || ""} alt={u.username} width={36} height={36} className="object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${getAvatarColor(u.username)}`}>
                        {getInitials(u.username)}
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-sm">{u.username}</p>
                </div>
              </td>
              <td className="px-5 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>{u.email}</td>
              <td className="px-5 py-4">
                <span className="text-xs px-2.5 py-1 rounded-full capitalize"
                  style={{ background: "rgba(77,168,218,0.08)", color: "var(--accent-blue)" }}>
                  {u.role}
                </span>
              </td>
              <td className="px-5 py-4 text-sm capitalize" style={{ color: "var(--text-secondary)" }}>{u.status}</td>
              <td className="px-5 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>{formatTime(u.createdAt)}</td>
              <td className="px-5 py-4">
                <div className="flex gap-2">
                  <button onClick={() => onBan(u._id)} className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(249,115,22,0.1)", color: "var(--accent-orange)" }}>Ban</button>
                  <button onClick={() => onDelete(u._id)} className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.08)", color: "var(--accent-red)" }}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}