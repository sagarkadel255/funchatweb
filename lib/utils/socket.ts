import { io, Socket } from "socket.io-client";
import { getToken } from "./storage";

let socket: Socket | null = null;
let connectionAttempts = 0;

export const getSocket = (): Socket | null => {
  return socket;
};

// Set to true when a socket auth failure is detected.
// The next connectSocket() call will force-create a new socket with a fresh token.
let needsFreshSocket = false;

export const connectSocket = (token?: string): Socket => {
  const authToken = token || getToken();
  if (!authToken) {
    console.warn("[Socket] No auth token available");
    throw new Error("No auth token");
  }

  // If socket exists and is connected or actively connecting, return it
  if (socket && !needsFreshSocket) {
    if (socket.connected) {
      return socket;
    }
    // Socket exists but disconnected — update auth with fresh token and reconnect.
    // Do NOT destroy it; socket.io manages its own reconnection lifecycle.
    (socket as any).auth = { token: authToken };
    if (!socket.active) {
      socket.connect();
    }
    return socket;
  }

  // Need a fresh socket (first connect, or after an auth error)
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  needsFreshSocket = false;
  connectionAttempts = 0;

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
  console.log("[Socket] Creating new connection to:", SOCKET_URL);

  socket = io(SOCKET_URL, {
    auth: { token: authToken },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected successfully:", socket?.id);
    connectionAttempts = 0;
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket] Connection error:", error.message);
    connectionAttempts++;

    const isAuthError =
      error.message.includes("Unauthorized") || error.message.includes("Invalid token");

    if (isAuthError) {
      // Auth errors: mark that we need a fresh socket next time, then stop retrying
      needsFreshSocket = true;
      socket?.io.reconnection(false);

      if (typeof window !== "undefined") {
        const hasRefresh = !!localStorage.getItem("fc_refresh");
        if (!hasRefresh) {
          console.warn("[Socket] Auth failed, no refresh token — redirecting to login");
          window.location.href = "/login";
        }
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    console.log("[Socket] Manually disconnecting");
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connectionAttempts = 0;
  }
};

export const isSocketConnected = (): boolean => {
  return !!(socket && socket.connected);
};

export const safeEmit = (event: string, data?: unknown): void => {
  try {
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn(`[Socket] Cannot emit ${event} - not connected`);
    }
  } catch (err) {
    console.warn(`[Socket] safeEmit(${event}) failed:`, err);
  }
};

export const SOCKET_EVENTS = {
  USER_ONLINE_EMIT: "user:online",
  TYPING_START: "typing:start",
  TYPING_END: "typing:end",
  MESSAGE_SEEN_EMIT: "message:seen",
  CALL_OFFER: "call:offer",
  CALL_ANSWER: "call:answer",
  CALL_REJECTED_EMIT: "call:rejected",
  CALL_ENDED_EMIT: "call:ended",
  ICE_CANDIDATE_EMIT: "ice_candidate",
  USER_STATUS: "user:status",
  MESSAGE_RECEIVED: "message:received",
  MESSAGE_SEEN_RECV: "message:seen",
  TYPING_INDICATOR: "typing:indicator",
  NOTIFICATION_NEW: "notification:new",
  NEW_FRIEND_REQUEST: "newFriendRequest",
  NEW_NOTIFICATION: "newNotification",
  NOTIFICATION_COUNT: "notification:count",
  INCOMING_CALL: "incoming_call",
  CALL_ANSWERED: "call_answered",
  CALL_REJECTED_RECV: "call_rejected",
  CALL_ENDED_RECV: "call_ended",
  ICE_CANDIDATE_RECV: "ice_candidate",
} as const;

// Add this at the bottom of lib/utils/socket.ts, before the exports

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
];

export const createPeerConnection = (
  onIceCandidate: (c: RTCIceCandidate) => void,
  onTrack: (e: RTCTrackEvent) => void,
  onConnectionStateChange?: (s: RTCPeerConnectionState) => void
): RTCPeerConnection => {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  
  pc.onicecandidate = (e) => { 
    if (e.candidate) onIceCandidate(e.candidate); 
  };
  
  pc.ontrack = (e) => onTrack(e);
  
  pc.onconnectionstatechange = () => {
    console.log("[PeerConnection] State:", pc.connectionState);
    onConnectionStateChange?.(pc.connectionState);
  };
  
  pc.oniceconnectionstatechange = () => 
    console.log("[PeerConnection] ICE State:", pc.iceConnectionState);
  
  pc.onsignalingstatechange = () => 
    console.log("[PeerConnection] Signaling State:", pc.signalingState);
    
  return pc;
};