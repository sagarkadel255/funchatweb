// src/lib/hooks/useCallActions.ts
"use client";

import { useCallback } from "react";
import { callApi } from "@/lib/api/call"; // create this if needed
import toast from "react-hot-toast";

export function useCallActions() {
  const initiateCall = useCallback(async (receiverId: string, type: "voice" | "video") => {
    try {
      const res = await callApi.initiateCall({ receiverId, type });
      if (res.success) {
        toast.success(`Calling ${type}...`);
        return res.data;
      } else {
        toast.error(res.message || "Failed to start call");
        return null;
      }
    } catch (err) {
      toast.error("Call initiation failed");
      return null;
    }
  }, []);

  // Add acceptCall, rejectCall, endCall when you implement them

  return {
    initiateCall,
    // acceptCall,
    // rejectCall,
    // endCall,
  };
}