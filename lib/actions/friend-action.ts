// src/lib/hooks/useFriendActions.ts
"use client";

import { useCallback } from "react";
import { friendApi } from "@/lib/api/friend";
import { useFriendStore } from "@/lib/store/friendstore";
import { extractApiError } from "@/lib/utils/api-error";
import toast from "react-hot-toast";

export function useFriendActions() {
  const store = useFriendStore();

  const sendRequest = useCallback(async (receiverId: string) => {
    try {
      const res = await friendApi.sendRequest(receiverId);
      if (res.success && res.data) {
        store.addSentRequest(res.data);
        toast.success("Friend request sent!");
        return true;
      }
      toast.error(res.message || "Failed to send request");
      return false;
    } catch (err) {
      toast.error(extractApiError(err));
      return false;
    }
  }, [store]);

  const acceptRequest = useCallback(async (requestId: string) => {
    try {
      const res = await friendApi.acceptRequest(requestId);
      if (res.success) {
        store.removeFriendRequest(requestId);
        if (res.data) store.addFriend(res.data);
        toast.success("Friend request accepted! 🎉");
      } else {
        toast.error(res.message || "Failed to accept request");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }, [store]);

  const rejectRequest = useCallback(async (requestId: string) => {
    try {
      const res = await friendApi.rejectRequest(requestId);
      if (res.success) {
        store.removeFriendRequest(requestId);
        toast.success("Request declined");
      } else {
        toast.error(res.message || "Failed to decline request");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }, [store]);

  const cancelRequest = useCallback(async (requestId: string) => {
    try {
      const res = await friendApi.cancelRequest(requestId);
      if (res.success) {
        store.removeSentRequest(requestId);
        toast.success("Request cancelled");
      } else {
        toast.error(res.message || "Failed to cancel request");
      }
    } catch (err) {
      toast.error(extractApiError(err));
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
        toast.error(res.message || "Failed to block user");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }, [store]);

  const unblockUser = useCallback(async (userId: string) => {
    try {
      const res = await friendApi.unblockUser(userId);
      if (res.success) {
        store.unblockUser(userId);
        toast.success("User unblocked");
      } else {
        toast.error(res.message || "Failed to unblock user");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }, [store]);

  return {
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    blockUser,
    unblockUser,
  };
}