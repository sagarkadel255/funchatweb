import Cookies from 'js-cookie';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const setCookie = (key: string, value: string, days = 7) => {
  try {
    Cookies.set(key, value, {
      expires: days,
      secure: process.env.NEXT_PUBLIC_NODE_ENV === 'production',
      sameSite: 'strict',
    });
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
};

export const getCookie = (key: string) => {
  try {
    return Cookies.get(key);
  } catch (error) {
    console.error('Error getting cookie:', error);
    return undefined;
  }
};

export const removeCookie = (key: string) => {
  try {
    Cookies.remove(key);
  } catch (error) {
    console.error('Error removing cookie:', error);
  }
};

export const setAuthTokens = (token: string, refreshToken: string) => {
  setCookie(TOKEN_KEY, token);
  setCookie(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAuthToken = () => getCookie(TOKEN_KEY);

export const getRefreshToken = () => getCookie(REFRESH_TOKEN_KEY);

export const clearAuthTokens = () => {
  removeCookie(TOKEN_KEY);
  removeCookie(REFRESH_TOKEN_KEY);
  removeCookie(USER_KEY);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

export const setUser = (user: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getUser = (): Record<string, any> | null => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  return null;
};





/// Server-side cookie helpers (used in server actions / API routes)
//import { AuthUser } from "@/lib/types/auth";

//export async function getServerToken(): Promise<string | null> {
  //try {
    //const { cookies } = await import("next/headers");
    //const store = cookies();
    //return store.get("fc_token")?.value || null;
  //} catch {
    //return null;
  //}
//}

/*export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const { cookies } = await import("next/headers");
    const store = cookies();
    const raw = store.get("fc_user")?.value;
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}*/
