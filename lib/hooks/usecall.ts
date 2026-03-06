"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { callApi } from "@/lib/api/call";
import { createPeerConnection, getSocket, SOCKET_EVENTS } from "@/lib/utils/socket";
import { Call, IncomingCall } from "@/lib/types/call";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/store/authstore";

export function useCall() {
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "ringing" | "connected" | "ended">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const { user } = useAuthStore();

  // Refs to avoid stale closures in socket callbacks
  const activeCallIdRef = useRef<string | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidate[]>([]);

  // Keep ref in sync whenever activeCall changes
  useEffect(() => {
    activeCallIdRef.current = activeCall?._id ?? null;
  }, [activeCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, []);

  const getMedia = useCallback(async (video: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? { width: 1280, height: 720 } : false,
      });
      localStreamRef.current = stream;
      return stream;
    } catch (error: any) {
      console.error("Media access error:", error);
      if (error.name === "NotAllowedError") {
        toast.error("Please allow camera/microphone access");
      } else if (error.name === "NotFoundError") {
        toast.error("No camera/microphone found");
      } else {
        toast.error("Could not access camera/microphone");
      }
      throw error;
    }
  }, []);

  const initiateCall = useCallback(async (
    recipientId: string,
    callType: "voice" | "video",
    localVideoEl?: HTMLVideoElement | null,
    remoteVideoEl?: HTMLVideoElement | null,
    existingStream?: MediaStream | null
  ) => {
    try {
      setCallStatus("calling");

      // Reuse the preview stream if provided to avoid a second getUserMedia call
      // and ensure mute/video-off controls affect the stream in the peer connection.
      const stream = existingStream || await getMedia(callType === "video");
      localStreamRef.current = stream;
      if (localVideoEl) localVideoEl.srcObject = stream;

      // Create peer connection — ICE callback reads from ref so it is never stale
      const pc = createPeerConnection(
        (candidate) => {
          const socket = getSocket();
          const callId = activeCallIdRef.current;
          if (socket && callId) {
            socket.emit(SOCKET_EVENTS.ICE_CANDIDATE_EMIT, {
              targetId: recipientId,
              callId,
              candidate,
            });
          } else {
            // Buffer candidates until we have the callId from the HTTP API
            pendingIceCandidatesRef.current.push(candidate);
          }
        },
        (event) => {
          if (event.streams[0]) {
            setRemoteStream(event.streams[0]);
            if (remoteVideoEl) remoteVideoEl.srcObject = event.streams[0];
          }
        }
      );

      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pcRef.current = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Create call record on backend — this gives us the callId
      const res = await callApi.initiateCall({
        receiverId: recipientId,
        type: callType,
      });

      if (!res.success) {
        throw new Error(res.message || "Failed to start call");
      }

      // Set the ref FIRST so any already-buffered ICE candidates can be flushed
      activeCallIdRef.current = res.data._id;
      setActiveCall(res.data);

      // Flush buffered ICE candidates now that we have the callId
      const socket = getSocket();
      if (socket && pendingIceCandidatesRef.current.length > 0) {
        for (const candidate of pendingIceCandidatesRef.current) {
          socket.emit(SOCKET_EVENTS.ICE_CANDIDATE_EMIT, {
            targetId: recipientId,
            callId: res.data._id,
            candidate,
          });
        }
        pendingIceCandidatesRef.current = [];
      }

      // Send offer to callee via socket
      if (socket) {
        socket.emit(SOCKET_EVENTS.CALL_OFFER, {
          recipientId,
          callId: res.data._id,
          offer,
          callType,
          callerName: user?.username,
          callerImage: user?.profileImage,
        });
      }

      return { success: true, data: res.data };
    } catch (error) {
      console.error("[useCall] initiateCall error:", error);
      setCallStatus("idle");
      activeCallIdRef.current = null;
      pendingIceCandidatesRef.current = [];
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      toast.error(error instanceof Error ? error.message : "Failed to start call");
      return { success: false, message: "Call initiation failed" };
    }
  }, [getMedia, user]);

  const acceptCall = useCallback(async (
    callId: string,
    callType: "voice" | "video",
    offer?: RTCSessionDescriptionInit,
    localVideoEl?: HTMLVideoElement | null,
    remoteVideoEl?: HTMLVideoElement | null
  ) => {
    try {
      const stream = await getMedia(callType === "video");
      if (localVideoEl) localVideoEl.srcObject = stream;

      const res = await callApi.acceptCall(callId);
      if (!res.success) {
        throw new Error(res.message || "Failed to accept call");
      }

      const callerId =
        typeof res.data.callerId === "string"
          ? res.data.callerId
          : res.data.callerId._id;

      if (offer) {
        const pc = createPeerConnection(
          (candidate) => {
            const socket = getSocket();
            if (socket) {
              socket.emit(SOCKET_EVENTS.ICE_CANDIDATE_EMIT, {
                targetId: callerId,
                callId,
                candidate,
              });
            }
          },
          (event) => {
            if (event.streams[0]) {
              setRemoteStream(event.streams[0]);
              if (remoteVideoEl) remoteVideoEl.srcObject = event.streams[0];
            }
          }
        );

        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        pcRef.current = pc;

        const socket = getSocket();
        if (socket) {
          socket.emit(SOCKET_EVENTS.CALL_ANSWER, {
            callerId,
            callId,
            answer,
          });
        }
      }

      // Set ref before state so callbacks can use it immediately
      activeCallIdRef.current = callId;
      setCallStatus("connected");
      setActiveCall(res.data);
      setIncomingCall(null);

      return { success: true, data: res.data };
    } catch (error) {
      console.error("[useCall] acceptCall error:", error);
      setCallStatus("idle");
      activeCallIdRef.current = null;
      toast.error("Failed to accept call");
      return { success: false, message: "Failed to accept call" };
    }
  }, [getMedia]);

  // callerId is required so the backend can notify the caller
  const rejectCall = useCallback(async (callId: string, callerId: string) => {
    try {
      await callApi.rejectCall(callId);
      const socket = getSocket();
      if (socket) {
        socket.emit(SOCKET_EVENTS.CALL_REJECTED_EMIT, { callId, callerId });
      }
      setIncomingCall(null);
      setCallStatus("idle");
    } catch (error) {
      console.error("[useCall] rejectCall error:", error);
      toast.error("Failed to reject call");
    }
  }, []);

  const endCall = useCallback(async () => {
    if (!activeCall) return;

    try {
      await callApi.endCall(activeCall._id);

      // Determine the other user correctly regardless of whether fields are populated
      const callerIdStr =
        typeof activeCall.callerId === "string"
          ? activeCall.callerId
          : activeCall.callerId._id;
      const recipientIdStr =
        typeof activeCall.recipientId === "string"
          ? activeCall.recipientId
          : activeCall.recipientId._id;
      const otherUserId = callerIdStr === user?.id ? recipientIdStr : callerIdStr;

      const socket = getSocket();
      if (socket) {
        socket.emit(SOCKET_EVENTS.CALL_ENDED_EMIT, {
          callId: activeCall._id,
          otherUserId,
        });
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      activeCallIdRef.current = null;
      setActiveCall(null);
      setRemoteStream(null);
      setCallStatus("ended");
      setTimeout(() => setCallStatus("idle"), 1500);
    } catch (error) {
      console.error("[useCall] endCall error:", error);
      toast.error("Failed to end call");
    }
  }, [activeCall, user]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(t => {
      t.enabled = isMuted;
    });
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach(t => {
      t.enabled = isVideoOff;
    });
    setIsVideoOff(!isVideoOff);
  }, [isVideoOff]);

  const loadCallHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await callApi.getCallHistory();
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setCallHistory(data);
      }
    } catch (error) {
      console.error("Failed to load call history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Socket event handlers — use refs so they never have stale state
  const handleCallAnswer = useCallback(async (data: { callId: string; answer: RTCSessionDescriptionInit }) => {
    if (pcRef.current) {
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        setCallStatus("connected");
      } catch (e) {
        console.error("[useCall] setRemoteDescription failed:", e);
      }
    }
  }, []); // stable — reads pcRef, not activeCall state

  const handleIceCandidate = useCallback(async (data: { callId: string; candidate: RTCIceCandidateInit }) => {
    if (pcRef.current) {
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        console.error("[useCall] addIceCandidate failed:", e);
      }
    }
  }, []); // stable — reads pcRef, not activeCall state

  const handleCallRejected = useCallback((data: { callId: string }) => {
    // Use ref so we always compare against the current call ID
    if (activeCallIdRef.current === data.callId || activeCallIdRef.current) {
      toast.error("Call was rejected");
      setCallStatus("idle");
      activeCallIdRef.current = null;
      setActiveCall(null);
      setRemoteStream(null);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    }
  }, []);

  const handleCallEnded = useCallback((data: { callId: string }) => {
    if (activeCallIdRef.current === data.callId || activeCallIdRef.current) {
      setCallStatus("ended");
      toast.success("Call ended");
      activeCallIdRef.current = null;
      setRemoteStream(null);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      setTimeout(() => {
        setCallStatus("idle");
        setActiveCall(null);
      }, 1500);
    }
  }, []);

  return {
    activeCall,
    incomingCall,
    callStatus,
    isMuted,
    isVideoOff,
    callHistory,
    loading,
    localStreamRef,
    remoteStream,
    setIncomingCall,
    setCallStatus,
    setActiveCall,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    loadCallHistory,
    handleCallAnswer,
    handleIceCandidate,
    handleCallRejected,
    handleCallEnded,
  };
}
