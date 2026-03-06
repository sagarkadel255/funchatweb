"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { connectSocket, disconnectSocket, isSocketConnected, SOCKET_EVENTS } from "@/lib/utils/socket";
import { Socket } from "socket.io-client";
import { useAuthStore } from "@/lib/store/authstore";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  emit: (event: string, data?: any) => void;
  on: <T = any>(event: string, callback: (data: T) => void) => () => void;
  // New methods for chat
  emitTyping: (conversationId: string) => void;
  emitStopTyping: (conversationId: string) => void;
  emitJoinConversation: (conversationId: string) => void;
  emitLeaveConversation: (conversationId: string) => void;
  emitMarkSeen: (messageIds: string[], senderId: string) => void;
  emitUserOnline: () => void;
}

export function useSocket(): UseSocketReturn {
  const { user, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, Set<Function>>>(new Map());

  // Get or create socket instance
  const getSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    try {
      if (!isAuthenticated || !user?.id) {
        return null;
      }

      const socket = connectSocket();
      socketRef.current = socket;
      
      // Set up listeners
      socket.on("connect", () => {
        console.log("[useSocket] Connected");
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        
        // Emit user online when connected
        if (user?.id) {
          socket.emit(SOCKET_EVENTS.USER_ONLINE_EMIT, user.id);
        }
      });

      socket.on("disconnect", (reason) => {
        console.log("[useSocket] Disconnected:", reason);
        setIsConnected(false);
      });

      socket.on("connect_error", (err) => {
        console.error("[useSocket] Connection error:", err);
        setError(err.message);
        setIsConnecting(false);
      });

      return socket;
    } catch (err: any) {
      console.error("[useSocket] Failed to get socket:", err);
      setError(err.message);
      return null;
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      setIsConnecting(true);
      getSocket();
    }

    return () => {
      // Don't disconnect - let the provider handle it
      socketRef.current = null;
    };
  }, [isAuthenticated, user?.id, getSocket]);

  const emit = useCallback((event: string, data?: any) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn(`[useSocket] Cannot emit '${event}' — not connected`);
    }
  }, []);

  const on = useCallback(<T = any>(event: string, callback: (data: T) => void) => {
    const socket = getSocket();
    if (!socket) {
      console.warn(`[useSocket] Cannot listen to '${event}' — no socket`);
      return () => {};
    }

    // Store listener for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)?.add(callback as Function);

    socket.on(event, callback);
    
    return () => {
      socket.off(event, callback);
      listenersRef.current.get(event)?.delete(callback as Function);
    };
  }, [getSocket]);

  // Typing indicators
  const emitTyping = useCallback((conversationId: string) => {
    const socket = socketRef.current;
    if (socket?.connected && user?.id) {
      socket.emit(SOCKET_EVENTS.TYPING_START, { 
        conversationId,
        senderId: user.id 
      });
      console.log(`[useSocket] Typing started in conversation: ${conversationId}`);
    }
  }, [user?.id]);

  const emitStopTyping = useCallback((conversationId: string) => {
    const socket = socketRef.current;
    if (socket?.connected && user?.id) {
      socket.emit(SOCKET_EVENTS.TYPING_END, { 
        conversationId,
        senderId: user.id 
      });
      console.log(`[useSocket] Typing stopped in conversation: ${conversationId}`);
    }
  }, [user?.id]);

  // Join/leave conversation rooms
  const emitJoinConversation = useCallback((conversationId: string) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("join:conversation", { conversationId });
      console.log(`[useSocket] Joined conversation: ${conversationId}`);
    }
  }, []);

  const emitLeaveConversation = useCallback((conversationId: string) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("leave:conversation", { conversationId });
      console.log(`[useSocket] Left conversation: ${conversationId}`);
    }
  }, []);

  // Mark messages as seen
  const emitMarkSeen = useCallback((messageIds: string[], senderId: string) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.MESSAGE_SEEN_EMIT, { 
        messageIds, 
        senderId 
      });
      console.log(`[useSocket] Marked ${messageIds.length} messages as seen`);
    }
  }, []);

  // Emit user online status
  const emitUserOnline = useCallback(() => {
    const socket = socketRef.current;
    if (socket?.connected && user?.id) {
      socket.emit(SOCKET_EVENTS.USER_ONLINE_EMIT, user.id);
      console.log(`[useSocket] User online: ${user.id}`);
    }
  }, [user?.id]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    emit,
    on,
    // New methods
    emitTyping,
    emitStopTyping,
    emitJoinConversation,
    emitLeaveConversation,
    emitMarkSeen,
    emitUserOnline,
  };
}