// src/lib/hooks/useNotificationActions.ts
"use client";

import { useCallback } from "react";
import { notificationApi } from "@/lib/api/notification";
import { useNotificationStore } from "@/lib/store/notificationstore";
import { extractApiError } from "@/lib/utils/api-error";
import toast from "react-hot-toast";

export function useNotificationActions() {
  const store = useNotificationStore();

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const res = await notificationApi.markAsRead(notificationId);
      if (res.success) {
        store.markAsRead(notificationId);
      } else {
        toast.error(res.message || "Failed to mark as read");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }, [store]);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await notificationApi.markAllRead();
      if (res.success) {
        store.markAllAsRead();
        toast.success("All notifications marked as read");
      } else {
        toast.error(res.message || "Failed to mark all as read");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }, [store]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const res = await notificationApi.deleteNotification(notificationId);
      if (res.success) {
        store.removeNotification(notificationId);
        toast.success("Notification deleted");
      } else {
        toast.error(res.message || "Failed to delete notification");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }, [store]);

  const deleteAllNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.deleteAllNotifications();
      if (res.success) {
        store.clearAll();
        toast.success("All notifications cleared");
      } else {
        toast.error(res.message || "Failed to clear notifications");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }, [store]);

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
}