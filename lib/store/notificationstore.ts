import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Notification } from "@/lib/types/notification";

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isInitialized: boolean;
  lastFetchTime: number | null;

  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  setUnreadCount: (count: number) => void;
  setLastFetchTime: (time: number | null) => void;

  getUnreadCount: () => number;
  getUnreadNotifications: () => Notification[];
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isInitialized: false,
      lastFetchTime: null,

      setLastFetchTime: (time) => set({ lastFetchTime: time }),

      setNotifications: (notifications) => {
        console.log('[NotificationStore] 🔵 setNotifications called with:', notifications?.length || 0);
        
        const notifArray = Array.isArray(notifications) ? notifications : [];
        const unreadCount = notifArray.filter(n => !n.isRead).length;
        
        // Create new state
        const newState = {
          notifications: notifArray,
          unreadCount: unreadCount,
          lastFetchTime: Date.now()
        };
        
        console.log('[NotificationStore] ✅ Setting state with:', notifArray.length, 'notifications');
        
        // Update state
        set(newState);
        
        // Dispatch custom event AFTER state is updated
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('notifications-updated', { 
              detail: { count: notifArray.length } 
            }));
            console.log('[NotificationStore] 📢 Dispatched notifications-updated event');
          }, 0);
        }
        
        return newState;
      },

      addNotification: (notification) =>
        set((state) => {
          const current = Array.isArray(state.notifications) ? state.notifications : [];
          if (current.some(n => n._id === notification._id)) return state;
          
          return {
            notifications: [notification, ...current],
            unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
          };
        }),

      markAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map(n =>
            n._id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),

      removeNotification: (notificationId) =>
        set((state) => {
          const wasUnread = state.notifications.some(n => n._id === notificationId && !n.isRead);
          return {
            notifications: state.notifications.filter(n => n._id !== notificationId),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        }),

      clearAll: () => {
        console.log('[NotificationStore] 🔴 Clearing all notifications');
        return { 
          notifications: [], 
          unreadCount: 0,
          lastFetchTime: null,
          isInitialized: false 
        };
      },

      setUnreadCount: (count) => set({ unreadCount: count }),

      getUnreadCount: () => get().unreadCount,
      getUnreadNotifications: () => get().notifications.filter(n => !n.isRead),
    }),
    {
      name: "notification-store",
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);