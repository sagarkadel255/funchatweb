"use client";
import { useAuthStore } from "@/lib/store/authstore";
import { useEffect } from "react";

export function useAuth() {
  const store = useAuthStore();
  useEffect(() => { store.initFromStorage(); }, []);
  return store;
}