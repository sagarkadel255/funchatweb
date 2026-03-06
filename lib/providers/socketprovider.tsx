"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store/authstore";
import { connectSocket, disconnectSocket } from "@/lib/utils/socket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    
    if (isAuthenticated && user?.id) {
      console.log("[SocketProvider] Initializing socket connection");
      
      try {
        const socket = connectSocket();
        
        if (socket) {
          const onConnect = () => {
            console.log("[SocketProvider] Socket connected");
            socket.emit("user:online", user.id);
          };

          if (socket.connected) {
            onConnect();
          } else {
            socket.once("connect", onConnect);
          }
        }
      } catch (error) {
        console.error("[SocketProvider] Failed to connect socket:", error);
      }

      initialized.current = true;
    }
  }, [isAuthenticated, user?.id]);

  return <>{children}</>;
}