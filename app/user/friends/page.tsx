"use client";

import { useEffect, useState } from "react";
import { UserPlus, Users, Inbox, Send, RefreshCw } from "lucide-react";
import { useFriend } from "@/lib/hooks/usefriend";
import FriendList from "./_components/friendlist";
import FriendRequestReceived from "./_components/friendrequest";
import FriendRequestSent from "./_components/sentrequest";
import AddFriendModal from "./_components/addfriendmoadl";
import toast from "react-hot-toast";

type Tab = "friends" | "received" | "sent";

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>("friends");
  const [showAdd, setShowAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    loadFriends,
    loadReceivedRequests,
    loadSentRequests,
    friends,
    friendRequests,
    sentRequests,
  } = useFriend();

  // ── Initial data load ──
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([
        loadFriends(),
        loadReceivedRequests(),
        loadSentRequests(),
      ]);
      setIsLoading(false);
    };
    fetchAll();
  }, []);

  const handleRefresh = async () => {
    const t = toast.loading("Refreshing...");
    await Promise.all([loadFriends(), loadReceivedRequests(), loadSentRequests()]);
    toast.dismiss(t);
    toast.success("Data refreshed!");
  };

  // Safe guards
  const safeFriends = Array.isArray(friends) ? friends : [];
  const safeFriendRequests = Array.isArray(friendRequests) ? friendRequests : [];
  const safeSentRequests = Array.isArray(sentRequests) ? sentRequests : [];

  const onlineCount = safeFriends.filter((f) => f.status === "online").length;

  const TABS = [
    { key: "friends" as Tab, label: "Friends", icon: Users, count: safeFriends.length },
    { key: "received" as Tab, label: "Received", icon: Inbox, count: safeFriendRequests.length },
    { key: "sent" as Tab, label: "Sent", icon: Send, count: safeSentRequests.length },
  ];

  const SkeletonCard = () => (
    <div className="fc-card animate-pulse">
      <div className="flex items-center gap-4 p-4">
        <div className="w-14 h-14 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded w-3/4" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="h-3 rounded w-1/2" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>
      </div>
    </div>
  );

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  const SkeletonList = () => (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{
            fontFamily: "var(--font-display)",
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Friends
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {safeFriends.length} friends
            {onlineCount > 0 && (
              <span style={{ color: "var(--accent-teal)" }}> · {onlineCount} online</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-white/8"
            style={{ color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)" }}
            title="Refresh data">
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAdd(true)}
            className="fc-btn flex items-center gap-2"
            style={{ padding: "8px 18px", fontSize: 14, borderRadius: 12 }}>
            <UserPlus className="w-4 h-4" />
            Add Friend
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-6"
        style={{ background: "rgba(255,255,255,0.04)", width: "fit-content" }}>
        {TABS.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="relative px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
            style={
              tab === key
                ? { background: "var(--gradient-blue)", color: "#fff" }
                : { color: "var(--text-secondary)" }
            }>
            <Icon className="w-3.5 h-3.5" />
            {label}
            {count > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none"
                style={{
                  background:
                    tab === key
                      ? "rgba(255,255,255,0.25)"
                      : key === "received"
                      ? "var(--gradient-teal)"
                      : "rgba(255,255,255,0.1)",
                  color: "#fff",
                }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {tab === "friends" && (isLoading ? <SkeletonGrid /> : <FriendList />)}
        {tab === "received" && (isLoading ? <SkeletonList /> : <FriendRequestReceived />)}
        {tab === "sent" && (isLoading ? <SkeletonList /> : <FriendRequestSent />)}
      </div>

      {showAdd && <AddFriendModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}