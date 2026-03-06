// src/lib/hooks/useFriend.ts
"use client";

import { useCallback, useState, useEffect } from "react";
import { friendApi } from "@/lib/api/friend";
import { useFriendStore } from "@/lib/store/friendstore";
import { useAuthStore } from "@/lib/store/authstore";
import { Friend, FriendRequest } from "@/lib/types/friend";
import { extractApiError } from "@/lib/utils/api-error";
import toast from "react-hot-toast";
import { getSocket } from "@/lib/utils/socket";

export function useFriend() {
  const store = useFriendStore();
  const authStore = useAuthStore();

  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingReceived, setLoadingReceived] = useState(false);
  const [loadingSent, setLoadingSent] = useState(false);

  // ── Data Loaders ─────────────────────────────────────────────────────

  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    try {
      const res = await friendApi.getFriends();
      if (res.success) {
        // Backend returns { success, data: friendsArray } — data is the array directly
        const friendsArray = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        console.log("📦 Friends loaded:", friendsArray.length);
        store.setFriends(friendsArray);
      } else {
        toast.error(res.message || "Failed to load friends");
      }
    } catch (e) {
      console.error("Load friends error:", extractApiError(e));
      toast.error("Failed to load friends");
    } finally {
      setLoadingFriends(false);
    }
  }, [store]);

  const loadReceivedRequests = useCallback(async () => {
    setLoadingReceived(true);
    try {
      const res = await friendApi.getFriendRequests();
      if (res.success) {
        const requestsArray = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const received = requestsArray.filter((req: FriendRequest) => {
          const receiverId = typeof req.receiverId === 'string' ? req.receiverId : req.receiverId?._id;
          return receiverId === authStore.user?.id;
        });
        console.log("📦 Received requests:", received.length);
        store.setFriendRequests(received);
      } else {
        toast.error(res.message || "Failed to load received requests");
      }
    } catch (e) {
      console.error("Load received error:", extractApiError(e));
      toast.error("Failed to load received requests");
    } finally {
      setLoadingReceived(false);
    }
  }, [store, authStore.user?.id]);

  const loadSentRequests = useCallback(async () => {
    setLoadingSent(true);
    try {
      const res = await friendApi.getFriendRequests();
      if (res.success) {
        const requestsArray = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const sent = requestsArray.filter((req: FriendRequest) => {
          const senderId = typeof req.senderId === 'string' ? req.senderId : req.senderId?._id;
          return senderId === authStore.user?.id;
        });
        console.log("📦 Sent requests:", sent.length);
        store.setSentRequests(sent);
      } else {
        toast.error(res.message || "Failed to load sent requests");
      }
    } catch (e) {
      console.error("Load sent error:", extractApiError(e));
      toast.error("Failed to load sent requests");
    } finally {
      setLoadingSent(false);
    }
  }, [store, authStore.user?.id]);

  // ── Actions ─────────────────────────────────────────────────────────

  const sendRequest = useCallback(async (receiverId: string) => {
    try {
      const res = await friendApi.sendRequest(receiverId);
      if (res.success && res.data) {
        store.addSentRequest(res.data);
        toast.success("Friend request sent!");
        return true;
      }
      toast.error(res.message || "Failed to send");
      return false;
    } catch (e) {
      toast.error(extractApiError(e));
      return false;
    }
  }, [store]);

  const acceptRequest = useCallback(async (requestId: string) => {
    try {
      console.log("✅ Accepting request:", requestId);
      const res = await friendApi.acceptRequest(requestId);
      console.log("✅ Accept response:", res);
      
      if (res.success) {
        // Remove from received requests
        store.removeFriendRequest(requestId);
        
        // If the API returns the friend data, add it directly
        if (res.data) {
          console.log("✅ Adding friend:", res.data);
          store.addFriend(res.data);
        }
        
        // Refresh friends list to be absolutely sure
        await loadFriends();
        
        toast.success("Friend request accepted! 🎉");
      } else {
        toast.error(res.message || "Failed to accept");
      }
    } catch (e) {
      console.error("❌ Accept error:", e);
      toast.error(extractApiError(e));
    }
  }, [store, loadFriends]);

  const rejectRequest = useCallback(async (requestId: string) => {
    try {
      const res = await friendApi.rejectRequest(requestId);
      if (res.success) {
        store.removeFriendRequest(requestId);
        toast.success("Request declined");
      } else {
        toast.error(res.message || "Failed to decline");
      }
    } catch (e) {
      toast.error(extractApiError(e));
    }
  }, [store]);

  const cancelRequest = useCallback(async (requestId: string) => {
    try {
      const res = await friendApi.cancelRequest(requestId);
      if (res.success) {
        store.removeSentRequest(requestId);
        toast.success("Request cancelled");
      } else {
        toast.error(res.message || "Failed to cancel");
      }
    } catch (e) {
      toast.error(extractApiError(e));
    }
  }, [store]);

  const blockUser = useCallback(async (userId: string) => {
    try {
      const res = await friendApi.blockUser(userId);
      if (res.success) {
        store.removeFriend(userId);
        store.blockUser(userId);
        toast.success("User blocked");
      } else {
        toast.error(res.message || "Failed to block");
      }
    } catch (e) {
      toast.error(extractApiError(e));
    }
  }, [store]);

  const unblockUser = useCallback(async (userId: string) => {
    try {
      const res = await friendApi.unblockUser(userId);
      if (res.success) {
        store.unblockUser(userId);
        toast.success("User unblocked");
      } else {
        toast.error(res.message || "Failed to unblock");
      }
    } catch (e) {
      toast.error(extractApiError(e));
    }
  }, [store]);

  // ── Real-time socket listeners ─────────────────────────────────────

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewFriendRequest = (req: FriendRequest) => {
      console.log("🔔 New friend request received:", req);
      
      const receiverId = typeof req.receiverId === 'object' ? req.receiverId?._id : req.receiverId;
      const senderId = typeof req.senderId === 'object' ? req.senderId?._id : req.senderId;
      
      if (receiverId === authStore.user?.id) {
        store.addFriendRequest(req);
        const name = typeof req.senderId === "object" ? req.senderId.username : "someone";
        toast.success(`New friend request from ${name}!`);
      } else if (senderId === authStore.user?.id) {
        store.addSentRequest(req);
      }
    };

    const handleFriendRequestUpdate = (update: { requestId: string; status: string }) => {
      console.log("🔄 Friend request update:", update);
      store.removeFriendRequest(update.requestId);
      store.removeSentRequest(update.requestId);
      
      // Refresh friends list when request is accepted
      if (update.status === "accepted") {
        loadFriends();
      }
    };

    const handleUserStatus = (data: { userId: string; status: Friend["status"] }) => {
      const currentFriends = store.friends;
      const updatedFriends = currentFriends.map(f => 
        f._id === data.userId ? { ...f, status: data.status } : f
      );
      store.setFriends(updatedFriends);
    };

    socket.on("newFriendRequest", handleNewFriendRequest);
    socket.on("friendRequestUpdate", handleFriendRequestUpdate);
    socket.on("user:status", handleUserStatus);

    return () => {
      socket.off("newFriendRequest", handleNewFriendRequest);
      socket.off("friendRequestUpdate", handleFriendRequestUpdate);
      socket.off("user:status", handleUserStatus);
    };
  }, [store, authStore.user?.id, loadFriends]);

  return {
    loadFriends,
    loadReceivedRequests,
    loadSentRequests,

    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    blockUser,
    unblockUser,

    loadingFriends,
    loadingReceived,
    loadingSent,

    friends: store.friends,
    friendRequests: store.friendRequests,
    sentRequests: store.sentRequests,
    blockedUsers: store.blockedUsers,
    isFriend: store.isFriend,
    hasPendingRequest: store.hasPendingRequest,
    hasSentRequest: store.hasSentRequest,
    isBlocked: store.isBlocked,
    clearAll: store.clearAll,
  };
}