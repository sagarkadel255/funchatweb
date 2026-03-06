"use client";

import { useState, useEffect } from "react";
import { notificationApi } from "@/lib/api/notification";
import { useNotificationStore } from "@/lib/store/notificationstore";
import { useAuthStore } from "@/lib/store/authstore";

export function useNotification() {
  const store = useNotificationStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log("🔵 Fetching notifications for user:", user.id);
      const res = await notificationApi.getNotifications(1, 50);
      
      if (res.success) {
        console.log("📦 Saving to store:", res.data.length, "notifications");
        store.setNotifications(res.data);
      }
    } catch (error) {
      console.error("❌ Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      console.log("✅ Marking as read:", notificationId);
      const res = await notificationApi.markAsRead(notificationId);
      
      if (res.success) {
        // Update local store
        store.markAsRead(notificationId);
        
        // Dispatch event to update UI
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('notifications-updated'));
        }
      }
    } catch (error) {
      console.error("❌ Failed to mark as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      console.log("✅ Marking all as read");
      const res = await notificationApi.markAllRead();
      
      if (res.success) {
        // Update local store
        store.markAllAsRead();
        
        // Dispatch event to update UI
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('notifications-updated'));
        }
      }
    } catch (error) {
      console.error("❌ Failed to mark all as read:", error);
    }
  };

  // Delete single notification
  const deleteNotification = async (notificationId: string) => {
    try {
      console.log("🗑️ Deleting notification:", notificationId);
      const res = await notificationApi.deleteNotification(notificationId);
      
      if (res.success) {
        // Remove from local store
        store.removeNotification(notificationId);
        
        // Dispatch event to update UI
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('notifications-updated'));
        }
      }
    } catch (error) {
      console.error("❌ Failed to delete notification:", error);
    }
  };

  // Delete all notifications
  const deleteAll = async () => {
    try {
      console.log("🗑️ Deleting all notifications");
      const res = await notificationApi.deleteAllNotifications();
      
      if (res.success) {
        // Clear local store
        store.clearAll();
        
        // Dispatch event to update UI
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('notifications-updated'));
        }
      }
    } catch (error) {
      console.error("❌ Failed to delete all notifications:", error);
    }
  };

  // Load notifications when user changes
  useEffect(() => {
    if (user?.id) {
      store.clearAll();
      loadNotifications();
    }
  }, [user?.id]);

  return {
    notifications: store.notifications,
    loading,
    unreadCount: store.unreadCount,
    refresh: loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  };
}