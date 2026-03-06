"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authstore";
import AdminSidebar from "./_components/sidebar";
import AdminHeader from "./_components/header";
import LoadingSpinner from "@/app/_components/loadingspinner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, initFromStorage } = useAuthStore();

  useEffect(() => {
    initFromStorage();
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("fc_token") : null;
    if (!isAuthenticated && !token) {
      router.replace("/login");
    } else if (isAuthenticated && user?.role !== "admin") {
      router.replace("/user/dashboard");
    }
  }, [isAuthenticated, user]);

  const token = typeof window !== "undefined" ? localStorage.getItem("fc_token") : null;
  if (!isAuthenticated && !token) return <LoadingSpinner fullScreen />;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}