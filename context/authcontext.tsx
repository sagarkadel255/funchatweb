"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { AuthUser } from "@/lib/types/auth";
import { useAuthStore } from "@/lib/store/authstore";
import { getToken, getRefreshToken, setTokens, clearTokens } from "@/lib/utils/storage";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: boolean;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  initialized: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, setUser, isAuthenticated, initFromStorage, clearAuth } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const boot = async () => {
      initFromStorage();

      const token = getToken();
      if (!token) {
        // No stored token — guest user
        setInitialized(true);
        return;
      }

      try {
        // Verify the stored token is still valid against the backend
        await axios.get(`${BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Token is good
        console.log("[AuthProvider] token verified, initialized from storage");
      } catch (err: any) {
        if (err?.response?.status === 401) {
          // Token expired — try refreshing
          const refreshToken = getRefreshToken();
          if (refreshToken) {
            try {
              const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
              const newToken = data.data.token;
              const newRefresh = data.data.refreshToken;
              setTokens(newToken, newRefresh);
              console.log("[AuthProvider] token refreshed on boot");
            } catch {
              // Refresh also failed — force logout
              console.warn("[AuthProvider] refresh failed on boot — clearing auth");
              clearAuth();
              clearTokens();
              window.location.href = "/login";
              return;
            }
          } else {
            // No refresh token — force logout
            console.warn("[AuthProvider] no refresh token on boot — clearing auth");
            clearAuth();
            clearTokens();
            window.location.href = "/login";
            return;
          }
        }
        // Other errors (network down, etc.) — let the user stay and retry naturally
      }

      setInitialized(true);
    };

    boot();
  }, []);

  if (!initialized) return null;

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, initialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
