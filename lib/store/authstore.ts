import { create } from "zustand";
import { AuthUser } from "../../lib/types";
import { getStoredUser, getToken, setTokens, clearTokens, storeUser } from "@/lib/utils/storage";

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setTokens: (token: string, refresh: string) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  clearAuth: () => void;
  initFromStorage: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user) => {
    if (user) storeUser(user);
    set({ user, isAuthenticated: !!user });
    console.log("[AuthStore] user set:", user?.username);
  },

  setTokens: (token, refresh) => {
    setTokens(token, refresh);
    set({ token });
  },

  updateUser: (partial) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    storeUser(updated);
    set({ user: updated });
    console.log("[AuthStore] user updated");
  },

  clearAuth: () => {
    clearTokens();
    set({ user: null, token: null, isAuthenticated: false });
    console.log("[AuthStore] auth cleared");
  },

  logout: () => {
    console.log("[AuthStore] 🔴 Logging out, clearing all data");
    
    // Clear all auth data
    clearTokens();
    
    // Clear ALL user-specific stores from localStorage
    if (typeof window !== 'undefined') {
      // Get all keys that might contain user data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('notification') || 
          key.includes('chat') || 
          key.includes('friend') || 
          key.includes('call') || 
          key.includes('auth') || 
          key.includes('token') || 
          key.includes('user') ||
          key.includes('fc_') ||
          key.includes('store') ||
          key.includes('persist')
        )) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all identified keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`[AuthStore] 🗑️ Removed ${key}`);
      });
      
      // Also remove specific known keys (double assurance)
      localStorage.removeItem('notification-store');
      localStorage.removeItem('chat-store');
      localStorage.removeItem('friend-store');
      localStorage.removeItem('call-store');
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('fc_user');
      localStorage.removeItem('fc_token');
      localStorage.removeItem('fc_refresh');
      
      // Clear session storage
      sessionStorage.clear();
      
      console.log("[AuthStore] 🧹 Cleared all user stores");
    }
    
    // Clear state
    set({ user: null, token: null, isAuthenticated: false });
    
    // Force hard redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  initFromStorage: () => {
    const token = getToken();
    const user  = getStoredUser();
    if (token && user) {
      set({ token, user, isAuthenticated: true });
      console.log("[AuthStore] restored from storage:", user.username);
    }
  },
}));