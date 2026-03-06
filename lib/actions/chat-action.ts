// src/lib/hooks/useChatActions.ts
"use client";

import { useCallback } from "react";
import { chatApi } from "@/lib/api/chat";
import { useChatStore } from "@/lib/store/chatstore";
import { extractApiError } from "@/lib/utils/api-error";
import toast from "react-hot-toast";
import { SendMessagePayload } from "@/lib/types/chat";

export function useChatActions() {
  const store = useChatStore();

  const sendMessage = useCallback(async (payload: SendMessagePayload) => {
    try {
      const res = await chatApi.sendMessage(payload);
      if (res.success && res.data) {
        // Replace optimistic message if you created one earlier
        // or just add if not optimistic
        store.addMessage(payload.conversationId || "", res.data);
        return res.data;
      } else {
        toast.error(res.message || "Failed to send message");
        return null;
      }
    } catch (err) {
      toast.error(extractApiError(err));
      return null;
    }
  }, [store]);

  const markAsSeen = useCallback(async (messageIds: string[]) => {
    try {
      const res = await chatApi.markAsSeen(messageIds);
      if (res.success) {
        // You can update store here if needed
        // store.markMessagesAsSeen(...)
      } else {
        toast.error(res.message || "Failed to mark as seen");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }, [store]);

  // Add more chat actions as needed (editMessage, deleteMessage, etc.)
  const editMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const res = await chatApi.editMessage(messageId, content);
      if (res.success) {
        // Update store if you have updateMessage action
        toast.success("Message edited");
      } else {
        toast.error(res.message || "Failed to edit message");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }, [store]);

  return {
    sendMessage,
    markAsSeen,
    editMessage,
    // add deleteMessage, etc. when needed
  };
}