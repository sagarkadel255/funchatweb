import axios, { InternalAxiosRequestConfig } from "axios";
import { getToken, getRefreshToken, setTokens, clearTokens } from "../../lib/utils/storage";
import { connectSocket, isSocketConnected } from "../../lib/utils/socket";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Log all requests in development
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log request details
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
    params: config.params,
    data: config.data,
    hasToken: !!token
  });
  
  return config;
}, (error) => {
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

// Handle 401 → refresh token
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => {
    console.log(`[API Response] ${res.config.method?.toUpperCase()} ${res.config.url}`, {
      status: res.status,
      success: res.data?.success
    });
    return res;
  },
  async (error) => {
    // Log detailed error information
    if (error.code === 'ECONNABORTED') {
      console.error('[API Timeout] Request took too long:', error.config?.url);
    } else if (error.response) {
      // Server responded with error status
      console.error('[API Error]', {
        url: error.config?.url,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API No Response]', {
        url: error.config?.url,
        message: error.message,
        code: error.code
      });
    } else {
      // Something else happened
      console.error('[API Setup Error]', error.message);
    }

    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.log('[Auth] No refresh token, redirecting to login');
        clearTokens();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        console.log('[Auth] Refresh in progress, queuing request');
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      console.log('[Auth] Attempting token refresh');
      
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const newToken = data.data.token;
        const newRefresh = data.data.refreshToken;
        
        console.log('[Auth] Token refresh successful');
        setTokens(newToken, newRefresh);

        // Reconnect the socket with the new token so real-time features work again
        if (!isSocketConnected()) {
          try { connectSocket(newToken); } catch { /* socket will retry later */ }
        }

        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        console.error('[Auth] Token refresh failed:', refreshError);
        clearTokens();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;