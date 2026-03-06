"use client";

import { useEffect, useState } from "react";
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Calendar, Clock, Filter } from "lucide-react";
import Image from "next/image";
import { useCall } from "@/lib/hooks/usecall";
import { useAuthStore } from "@/lib/store/authstore";
import { getInitials, getAvatarColor, formatTime, formatCallDuration } from "@/lib/utils/formatters";
import { Call } from "@/lib/types/call";
import { getImageUrl } from "@/lib/utils/getimageurl";

type FilterType = "all" | "incoming" | "outgoing" | "missed";

export default function CallsPage() {
  const { callHistory, loading, loadCallHistory } = useCall();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<FilterType>("all");
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);

  useEffect(() => {
    loadCallHistory();
  }, []);

  useEffect(() => {
    // ✅ FIX: Ensure callHistory is an array before using it
    const history = Array.isArray(callHistory) ? callHistory : [];
    
    let filtered = [...history];
    
    switch (filter) {
      case "incoming":
        filtered = filtered.filter(call => 
          typeof call.recipientId === "object" && call.recipientId?._id === user?.id
        );
        break;
      case "outgoing":
        filtered = filtered.filter(call => 
          typeof call.callerId === "object" && call.callerId?._id === user?.id
        );
        break;
      case "missed":
        filtered = filtered.filter(call => call.status === "missed");
        break;
    }
    
    setFilteredCalls(filtered);
  }, [filter, callHistory, user]);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
          Call History
        </h1>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-32" />
                <div className="h-3 bg-white/10 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filters = [
    { value: "all" as FilterType, label: "All", icon: Calendar },
    { value: "incoming" as FilterType, label: "Incoming", icon: PhoneIncoming },
    { value: "outgoing" as FilterType, label: "Outgoing", icon: PhoneOutgoing },
    { value: "missed" as FilterType, label: "Missed", icon: PhoneMissed },
  ];

  // ✅ Ensure filteredCalls is an array
  const hasCalls = filteredCalls && filteredCalls.length > 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Call History
        </h1>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="bg-transparent text-sm border-none outline-none cursor-pointer"
            style={{ color: "var(--accent-blue)" }}
          >
            {filters.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === value ? "bg-blue-600 text-white" : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {value === "all" && (
              <span className="ml-1 text-xs opacity-75">
                {Array.isArray(callHistory) ? callHistory.length : 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Calls list */}
      {!hasCalls ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl">
          <div className="text-6xl mb-4">📞</div>
          <h3 className="text-xl font-bold mb-2">No calls yet</h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Your call history will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCalls.map((call) => {
            // Safely extract IDs
            const callerId = typeof call.callerId === "string" ? call.callerId : call.callerId?._id;
            const recipientId = typeof call.recipientId === "string" ? call.recipientId : call.recipientId?._id;
            
            const isOutgoing = callerId === user?.id;
            const otherUser = isOutgoing
              ? (typeof call.recipientId === "string" ? null : call.recipientId)
              : (typeof call.callerId === "string" ? null : call.callerId);
            
            const name = otherUser?.username || "Unknown";
            const isMissed = call.status === "missed";
            
            let icon = PhoneOutgoing;
            let iconColor = "var(--accent-blue)";
            let bgColor = "rgba(77,168,218,0.1)";
            
            if (isMissed) {
              icon = PhoneMissed;
              iconColor = "var(--accent-red)";
              bgColor = "rgba(239,68,68,0.1)";
            } else if (!isOutgoing) {
              icon = PhoneIncoming;
              iconColor = "var(--accent-teal)";
              bgColor = "rgba(34,197,94,0.1)";
            }

            return (
              <div
                key={call._id}
                className="flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-white/5"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    {otherUser?.profileImage ? (
                      <Image
                        src={getImageUrl(otherUser.profileImage) || ""}
                        alt={name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-white font-bold ${getAvatarColor(name)}`}>
                        {getInitials(name)}
                      </div>
                    )}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: bgColor }}
                  >
                    {icon === PhoneOutgoing && <PhoneOutgoing className="w-3 h-3" style={{ color: iconColor }} />}
                    {icon === PhoneIncoming && <PhoneIncoming className="w-3 h-3" style={{ color: iconColor }} />}
                    {icon === PhoneMissed && <PhoneMissed className="w-3 h-3" style={{ color: iconColor }} />}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: bgColor, color: iconColor }}>
                      {call.callType === "video" ? "Video" : "Voice"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatTime(call.createdAt)}
                    </span>
                    {call.duration ? (
                      <>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>•</span>
                        <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                          <Clock className="w-3 h-3" />
                          {formatCallDuration(call.duration)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {call.status === "missed" ? "Missed" : "No answer"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Call type icon */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: bgColor }}
                >
                  {call.callType === "video" ? (
                    <Video className="w-4 h-4" style={{ color: iconColor }} />
                  ) : (
                    <Phone className="w-4 h-4" style={{ color: iconColor }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}