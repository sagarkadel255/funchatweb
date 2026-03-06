"use server";

import { authApi } from "@/lib/api/auth";
import { extractApiError } from "@/lib/utils/api-error";

export async function handleLogin(data: { email: string; password: string }) {
  try {
    const res = await authApi.login(data);
    console.log("[auth-action] login success for:", data.email);
    return res;
  } catch (e) {
    const message = extractApiError(e);
    console.error("[auth-action] login error:", message);
    return { success: false, message, data: null };
  }
}

export async function handleRegister(data: { username: string; email: string; password: string }) {
  try {
    const res = await authApi.register(data);
    console.log("[auth-action] register success for:", data.email);
    return res;
  } catch (e) {
    const message = extractApiError(e);
    console.error("[auth-action] register error:", message);
    return { success: false, message, data: null };
  }
}

export async function handleLogout() {
  try {
    const res = await authApi.logout();
    return res;
  } catch (e) {
    return { success: false, message: extractApiError(e), data: null };
  }
}