"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Search, X, UserPlus, Check, Loader2, Users } from "lucide-react";
import Image from "next/image";
import { authApi } from "@/lib/api/auth";
import { useFriend } from "@/lib/hooks/usefriend";
import { useAuthStore } from "@/lib/store/authstore";
import { getInitials, getAvatarColor } from "@/lib/utils/formatters";
import { getImageUrl } from "@/lib/utils/getimageurl";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface Props {
  onClose: () => void;
}

export default function AddFriendModal({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const { sendRequest, friends, friendRequests } = useFriend();
  const { user } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleSearch();
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [debouncedQuery]);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    
    setSearching(true);
    setHasSearched(true);
    try {
      const res = await authApi.searchUsers(q);
      const raw: any[] = res.data || [];

      // Build sets of IDs to exclude from results
      const myId = user?.id;
      const friendIds = new Set(friends.map((f) => f._id));

      // Also exclude people who already sent ME a request
      const receivedFromIds = new Set(
        friendRequests.map((r) =>
          typeof r.senderId === "string" ? r.senderId : r.senderId?._id
        ).filter(Boolean)
      );

      const filtered = raw.filter(
        (u) =>
          u._id !== myId &&
          !friendIds.has(u._id) &&
          !receivedFromIds.has(u._id)
      );

      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSend = (userId: string) => {
    startTransition(async () => {
      const ok = await sendRequest(userId);
      if (ok) setSentIds((s) => new Set(s).add(userId));
    });
  };

  const alreadyFriend = (userId: string) => friends.some((f) => f._id === userId);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(77,168,218,0.1)" }}>
              <UserPlus className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
            </div>
            <div>
              <h3 className="font-bold" style={{ fontFamily: "var(--font-display)" }}>Add Friend</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Search by username or email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: "var(--text-muted)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search username or email..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value) { 
                  setResults([]); 
                  setHasSearched(false); 
                }
              }}
              className="fc-input pl-10"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {/* Loading */}
          {searching && (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: "var(--accent-blue)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Searching...</p>
            </div>
          )}

          {/* No results */}
          {!searching && hasSearched && results.length === 0 && (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🔍</div>
              <p className="font-semibold text-sm mb-1">No users found</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Try a different username or email
              </p>
            </div>
          )}

          {/* Prompt */}
          {!searching && !hasSearched && (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🌐</div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Type a name or email to find people
              </p>
            </div>
          )}

          {/* User cards */}
          {!searching &&
            results.map((u) => {
              const isSent = sentIds.has(u._id);
              const isFriend = alreadyFriend(u._id);

              return (
                <div
                  key={u._id}
                  className="flex items-center gap-3 p-3.5 rounded-2xl transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="fc-avatar w-11 h-11">
                      {u.profileImage ? (
                        <Image src={getImageUrl(u.profileImage)||'/default-avatar.png'} alt={u.username} width={44} height={44} className="object-cover w-full h-full" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br ${getAvatarColor(u.username)}`}>
                          {getInitials(u.username)}
                        </div>
                      )}
                    </div>
                    {u.status === "online" && (
                      <span className="status-dot status-online absolute -bottom-0.5 -right-0.5"
                        style={{ width: 10, height: 10, borderWidth: 1.5 }} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{u.username}</p>
                      {u.status === "online" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                          Online
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {u.email}
                    </p>
                    {u.bio && (
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {u.bio}
                      </p>
                    )}
                  </div>

                  {/* Action button */}
                  {isFriend ? (
                    <span className="text-xs px-3 py-1.5 rounded-xl flex-shrink-0 flex items-center gap-1.5"
                      style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                      <Users className="w-3.5 h-3.5" /> Friends
                    </span>
                  ) : isSent ? (
                    <span className="text-xs px-3 py-1.5 rounded-xl flex-shrink-0 flex items-center gap-1.5"
                      style={{ background: "rgba(77,168,218,0.1)", color: "var(--accent-blue)", border: "1px solid rgba(77,168,218,0.2)" }}>
                      <Check className="w-3.5 h-3.5" /> Sent
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSend(u._id)}
                      disabled={isPending}
                      className="btn-primary py-1.5 px-3 text-xs flex-shrink-0 flex items-center gap-1.5 disabled:opacity-60">
                      {isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                      Add
                    </button>
                  )}
                </div>
              );
            })}
        </div>

        {/* Hint */}
        <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
          Search automatically as you type
        </p>
      </div>
    </div>
  );
}