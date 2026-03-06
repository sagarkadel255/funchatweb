// app/user/AuthGuard.tsx
"use client";

import { useAuthContext } from "@/context/authcontext";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load (if you have loading state)
    if (user === undefined) return;

    if (!user || user.role !== "user") {
      router.replace("/login");
    }
  }, [user, router]);

  // Show loading or denied while checking
  if (!user || user.role !== "user") {
    return <div className="min-h-screen flex items-center justify-center">Checking access...</div>;
  }

  return <>{children}</>;
}