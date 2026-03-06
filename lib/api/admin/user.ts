import api from "../axios";
import { ENDPOINTS } from "../endpoints";

export const adminApi = {
  getStats: () =>
    api.get(ENDPOINTS.ADMIN.STATS).then(r => r.data),

  getAllUsers: () =>
    api.get(ENDPOINTS.ADMIN.USERS).then(r => r.data),

  deleteUser: (userId: string) =>
    api.delete(ENDPOINTS.ADMIN.DELETE_USER(userId)).then(r => r.data),

  banUser: (userId: string) =>
    api.post(ENDPOINTS.ADMIN.BAN_USER(userId)).then(r => r.data),

  getMessageStats: () =>
    api.get(ENDPOINTS.ADMIN.MESSAGE_STATS).then(r => r.data),
};