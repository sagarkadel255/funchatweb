"use server";
import { adminApi } from "../../../lib/api/admin/user";
import { extractApiError } from "../../../lib/utils/api-error";

export async function handleGetAdminStats() {
  try { return await adminApi.getStats(); }
  catch (e) { return { success: false, message: extractApiError(e), data: null }; }
}

export async function handleDeleteUser(userId: string) {
  try { return await adminApi.deleteUser(userId); }
  catch (e) { return { success: false, message: extractApiError(e), data: null }; }
}

export async function handleBanUser(userId: string) {
  try { return await adminApi.banUser(userId); }
  catch (e) { return { success: false, message: extractApiError(e), data: null }; }
}