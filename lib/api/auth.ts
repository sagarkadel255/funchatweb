import api from "./axios";
import { ENDPOINTS } from "./endpoints";

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post(ENDPOINTS.AUTH.REGISTER, data).then(r => r.data),

  login: (data: { email: string; password: string }) =>
    api.post(ENDPOINTS.AUTH.LOGIN, data).then(r => r.data),

  refreshToken: (refreshToken: string) =>
    api.post(ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken }).then(r => r.data),

  logout: () =>
    api.post(ENDPOINTS.AUTH.LOGOUT).then(r => r.data),

  getProfile: () =>
    api.get(ENDPOINTS.AUTH.PROFILE).then(r => r.data),

  updateProfile: (formData: FormData) =>
    api.put(ENDPOINTS.AUTH.UPDATE_PROFILE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, data).then(r => r.data),

  searchUsers: (query: string) =>
    api.get(ENDPOINTS.AUTH.SEARCH_USERS, { params: { query } }).then(r => r.data),
};