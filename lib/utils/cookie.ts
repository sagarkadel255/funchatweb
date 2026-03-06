// Server-side cookie helpers (used in server actions / API routes)
import { AuthUser } from "@/lib/types/auth";

export async function getServerToken(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers");
    const store = cookies();
    return store.get("fc_token")?.value || null;
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const { cookies } = await import("next/headers");
    const store = cookies();
    const raw = store.get("fc_user")?.value;
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}