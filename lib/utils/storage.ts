import { AuthUser } from "@/lib/types/auth";

const TOKEN_KEY     = "fc_token";
const REFRESH_KEY   = "fc_refresh";
const USER_KEY      = "fc_user";

const isBrowser = typeof window !== "undefined";

export const getToken         = (): string | null => isBrowser ? localStorage.getItem(TOKEN_KEY)   : null;
export const getRefreshToken  = (): string | null => isBrowser ? localStorage.getItem(REFRESH_KEY) : null;

export const setTokens = (token: string, refreshToken: string) => {
  if (!isBrowser) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  console.log("[Storage] tokens saved");
};

export const clearTokens = () => {
  if (!isBrowser) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  console.log("[Storage] tokens cleared");
};

export const storeUser = (user: AuthUser) => {
  if (!isBrowser) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredUser = (): AuthUser | null => {
  if (!isBrowser) return null;
  try {
    const v = localStorage.getItem(USER_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
};