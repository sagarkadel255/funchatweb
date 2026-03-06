"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authstore";
import { useSocket } from "@/lib/hooks/usesocket";
import { useCall } from "@/lib/hooks/usecall";
import { IncomingCall } from "@/lib/types";
import { getSocket, SOCKET_EVENTS } from "@/lib/utils/socket";
import Sidebar from "./_components/sidebar";
import UserHeader from "./_components/header";
import LoadingSpinner from "@/app/_components/loadingspinner";
import CallModal from "./calls/_components/callmodal";
import CallWindow from "./calls/_components/callwindow";
import toast from "react-hot-toast";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, initFromStorage } = useAuthStore();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  const {
    activeCall,
    callStatus,
    isMuted,
    isVideoOff,
    localStreamRef,
    remoteStream,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    handleCallAnswer,
    handleIceCandidate,
    handleCallRejected,
    handleCallEnded,
  } = useCall();

  const { on: socketOn } = useSocket();

  // Handle incoming call event
  const handleIncomingCall = useCallback((data: {
    callId: string;
    callerId: string;
    callerName: string;
    callerImage?: string;
    callType: "voice" | "video";
    offer?: RTCSessionDescriptionInit;
  }) => {
    console.log("📞 Incoming call received:", data);
    
    if (activeCall || callStatus !== "idle") {
      console.log("Already in a call, rejecting incoming call");
      const socket = getSocket();
      if (socket) {
        socket.emit(SOCKET_EVENTS.CALL_REJECTED_EMIT, {
          callId: data.callId,
          callerId: data.callerId,
        });
      }
      return;
    }

    setIncomingCall({
      callId: data.callId,
      callerId: data.callerId,
      callerName: data.callerName,
      callerImage: data.callerImage,
      callType: data.callType,
      offer: data.offer,
    });

    // Play notification sound
    try {
      const audio = new Audio('/sounds/incoming-call.mp3');
      audio.play().catch(() => {});
    } catch (error) {
      console.log("Could not play notification sound");
    }

    // Show browser notification
    if (typeof window !== "undefined" && Notification.permission === "granted") {
      new Notification("Incoming Call", {
        body: `${data.callerName} is calling...`,
        icon: data.callerImage || '/default-avatar.png',
      });
    }
  }, [activeCall, callStatus]);

  // Subscribe to all call-related socket events
  useEffect(() => {
    // Incoming call
    const unsubscribeIncoming = socketOn("incoming_call", handleIncomingCall);
    
    // Call answered by remote peer - now matches the expected signature
    const unsubscribeAnswered = socketOn("call_answered", handleCallAnswer);
    
    // Call rejected by remote peer
    const unsubscribeRejected = socketOn("call_rejected", handleCallRejected);
    
    // Call ended by remote peer
    const unsubscribeEnded = socketOn("call_ended", handleCallEnded);
    
    // ICE candidate from remote peer - now matches the expected signature
    const unsubscribeIce = socketOn("ice_candidate", handleIceCandidate);

    // Request notification permission
    if (typeof window !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      unsubscribeIncoming();
      unsubscribeAnswered();
      unsubscribeRejected();
      unsubscribeEnded();
      unsubscribeIce();
    };
  // handleCallAnswer, handleIceCandidate, handleCallRejected, handleCallEnded are
  // now stable (no activeCall in their deps) so this effect only re-runs when
  // handleIncomingCall changes (which depends on activeCall/callStatus).
  }, [socketOn, handleIncomingCall, handleCallAnswer, handleCallRejected, handleCallEnded, handleIceCandidate]);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("fc_token") : null;
    if (!isAuthenticated && !token) {
      router.replace("/login");
    } else if (isAuthenticated && user?.role === "admin") {
      router.replace("/admin");
    }
  }, [isAuthenticated, user, router]);

  const token = typeof window !== "undefined" ? localStorage.getItem("fc_token") : null;
  if (!isAuthenticated && !token) return <LoadingSpinner fullScreen />;

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    console.log("Accepting call:", incomingCall.callId);
    acceptCall(
      incomingCall.callId, 
      incomingCall.callType, 
      incomingCall.offer
    );
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;
    console.log("Rejecting call:", incomingCall.callId);
    rejectCall(incomingCall.callId, incomingCall.callerId);
    setIncomingCall(null);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <UserHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Incoming call modal */}
      {incomingCall && callStatus === "idle" && (
        <CallModal
          call={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Active call window */}
      {activeCall && callStatus === "connected" && (
        <CallWindow
          call={activeCall}
          callType={activeCall.callType}
          callStatus={callStatus}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onEndCall={endCall}
          localStreamRef={localStreamRef}
          remoteStream={remoteStream}
        />
      )}

      {/* Show ringing/calling state if needed */}
      {activeCall && callStatus === "calling" && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Calling...</p>
          </div>
        </div>
      )}
    </div>
  );
}