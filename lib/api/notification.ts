import api from "./axios";
import { ENDPOINTS } from "./endpoints";

export const notificationApi = {
  getNotifications: async (page = 1, limit = 20, isRead?: boolean) => {
    try {
      const response = await api.get(ENDPOINTS.NOTIFICATION.GET_ALL, { 
        params: { page, limit, isRead }
      });
      
      const notifications = response.data?.data?.data || [];
      
      return {
        success: true,
        data: notifications,
        unreadCount: response.data?.data?.unread || 0,
        message: response.data.message || 'Success'
      };
    } catch (error: any) {
      console.error("getNotifications error:", error.message);
      return {
        success: false,
        message: error.message || "Failed to fetch notifications",
        data: [],
        unreadCount: 0
      };
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const response = await api.post(ENDPOINTS.NOTIFICATION.MARK_AS_READ(notificationId), {});
      return {
        success: true,
        data: response.data,
        message: 'Marked as read'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to mark as read",
        data: null
      };
    }
  },

  markAllRead: async () => {
    try {
      const response = await api.post(ENDPOINTS.NOTIFICATION.MARK_ALL_READ, {});
      return {
        success: true,
        data: response.data,
        message: 'All marked as read'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to mark all as read",
        data: { modifiedCount: 0 }
      };
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      const response = await api.delete(ENDPOINTS.NOTIFICATION.DELETE_ONE(notificationId));
      return {
        success: true,
        data: response.data,
        message: 'Deleted successfully'
      };
    } catch (error: any) {
      console.error("deleteNotification error:", error.message);
      return {
        success: false,
        message: error.message || "Failed to delete notification",
        data: null
      };
    }
  },

  deleteAllNotifications: async () => {
    try {
      const response = await api.delete(ENDPOINTS.NOTIFICATION.DELETE_ALL);
      return {
        success: true,
        data: response.data,
        message: 'All deleted successfully'
      };
    } catch (error: any) {
      console.error("deleteAllNotifications error:", error.message);
      return {
        success: false,
        message: error.message || "Failed to delete notifications",
        data: { deletedCount: 0 }
      };
    }
  }
};