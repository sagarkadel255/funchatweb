"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff, X, RefreshCw } from "lucide-react";
import { Friend } from "@/lib/types";
import { useCall } from "@/lib/hooks/usecall";
import { getSocket, SOCKET_EVENTS } from "@/lib/utils/socket";
import toast from "react-hot-toast";

interface Props {
  friend: Friend;
  callType: "voice" | "video";
  onClose: () => void;
}

type Phase = "preview" | "calling" | "connecting" | "connected" | "ended";

export default function CallInitiator({ friend, callType, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("preview");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | "checking">("checking");
  const [availableDevices, setAvailableDevices] = useState<{ audio: boolean; video: boolean }>({ audio: false, video: false });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { initiateCall, endCall, handleCallAnswer, handleIceCandidate } = useCall();

  // ========== DEVICE CHECKING ==========

  const checkPermissions = useCallback(async () => {
    setPermissionState("checking");
    try {
      // Check if browser supports mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setPermissionState("denied");
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudio = devices.some(d => d.kind === "audioinput");
      const hasVideo = devices.some(d => d.kind === "videoinput");
      
      setAvailableDevices({ audio: hasAudio, video: hasVideo });

      // Check if we have permission by trying to get a quick stream
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: callType === "video" 
        });
        
        // Stop the test stream immediately
        testStream.getTracks().forEach(t => t.stop());
        setPermissionState("granted");
      } catch (err) {
        if (err instanceof DOMException) {
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setPermissionState("denied");
          } else if (err.name === "NotFoundError") {
            setPermissionState("prompt");
          } else {
            setPermissionState("prompt");
          }
        } else {
          setPermissionState("prompt");
        }
      }
    } catch (e) {
      console.log("Could not enumerate devices", e);
      setPermissionState("prompt");
    }
  }, [callType]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // ========== MEDIA ACCESS ==========

  const requestMediaAccess = useCallback(async () => {
    try {
      // Check if media devices are supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Your browser doesn't support camera/microphone");
        onClose();
        return null;
      }

      const constraints = {
        audio: true,
        video: callType === "video" ? { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } : false,
      };

      console.log("Requesting media with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setLocalStream(stream);
      setPermissionState("granted");
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (e) {
      console.warn("⚠️ Media access error:", e);
      
      if (e instanceof DOMException) {
        switch (e.name) {
          case "NotAllowedError":
          case "PermissionDeniedError":
            toast.error(
              <div>
                <p className="font-bold mb-1">Camera/Microphone Access Blocked</p>
                <p className="text-sm">Please follow these steps:</p>
                <ol className="text-xs mt-2 list-decimal pl-4">
                  <li>Click the camera/lock icon in your browser's address bar</li>
                  <li>Select "Allow" for camera and microphone</li>
                  <li>Click the "Retry" button below</li>
                </ol>
              </div>,
              { duration: 8000 }
            );
            setPermissionState("denied");
            break;
            
          case "NotFoundError":
          case "DevicesNotFoundError":
            toast.error(
              <div>
                <p className="font-bold mb-1">No Camera/Microphone Found</p>
                <p className="text-sm">Please check your device connections</p>
              </div>
            );
            setPermissionState("denied");
            break;
            
          case "NotReadableError":
          case "TrackStartError":
            toast.error("Camera or microphone is already in use by another app");
            setPermissionState("denied");
            break;
            
          case "OverconstrainedError":
            toast.error("Camera doesn't support the required settings");
            setPermissionState("denied");
            break;
            
          default:
            toast.error(`Camera/microphone error: ${e.message || "Unknown error"}`);
            setPermissionState("denied");
        }
      } else {
        toast.error("Could not access camera/microphone");
        setPermissionState("denied");
      }
      
      return null;
    }
  }, [callType, onClose]);

  // Get local media on mount for preview
  useEffect(() => {
    let mounted = true;
    
    const initMedia = async () => {
      if (permissionState === "granted") {
        const stream = await requestMediaAccess();
        if (!stream && mounted) {
          onClose();
        }
      }
    };
    
    initMedia();

    return () => {
      mounted = false;
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [permissionState, requestMediaAccess, onClose]);

  // ========== CALL FUNCTIONS ==========

  const startDurationTimer = useCallback(() => {
    setCallDuration(0);
    durationRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationRef.current) { 
      clearInterval(durationRef.current); 
      durationRef.current = null; 
    }
  }, []);

  const cleanup = useCallback(() => {
    stopDurationTimer();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
  }, [localStream, stopDurationTimer]);

  const handleEndCall = useCallback(async () => {
    stopDurationTimer();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    try {
      if (phase === "connected" || phase === "calling" || phase === "connecting") {
        await endCall();
      }
    } catch (e) {
      console.error("Error ending call:", e);
    }

    cleanup();
    setPhase("ended");
    setTimeout(onClose, 1500);
  }, [phase, endCall, cleanup, onClose, stopDurationTimer]);

  const handleStartCall = async () => {
    if (!localStream) {
      toast.error("Please allow camera/microphone access first");
      return;
    }

    setPhase("calling");
    try {
      const result = await initiateCall(
        friend._id,
        callType,
        localVideoRef.current,
        remoteVideoRef.current,
        localStream  // reuse preview stream so mute/video controls affect the right stream
      );
      
      if (result?.success && result.data?._id) {
        setCallId(result.data._id);
        console.log("📞 Call initiated:", result.data._id);
      } else {
        toast.error(result?.message || "Could not start call");
        setPhase("preview");
      }
    } catch (e) {
      console.error("❌ Start call error:", e);
      toast.error("Call failed — please try again");
      setPhase("preview");
    }
  };

  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(t => { 
      t.enabled = !isMuted; 
    });
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(t => { 
      t.enabled = !isVideoOff; 
    });
    setIsVideoOff(!isVideoOff);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ========== SOCKET EVENTS ==========

  useEffect(() => {
    const socket = getSocket();
    
    if (!socket) {
      console.warn("Socket not connected");
      return;
    }

    const onAnswer = async (data: { callId: string; answer: RTCSessionDescriptionInit }) => {
      if (data.callId === callId) {
        console.log("📞 Call answered — setting remote description");
        await handleCallAnswer(data); // sets remote SDP so WebRTC audio/video flows
        setPhase("connected");
        startDurationTimer();
      }
    };

    const onRejected = (data: { callId: string }) => {
      if (data.callId === callId) {
        toast.error(`${friend.username} declined the call`);
        handleEndCall();
      }
    };

    const onEnded = (data: { callId: string }) => {
      if (data.callId === callId) {
        setPhase("ended");
        stopDurationTimer();
        setTimeout(() => {
          cleanup();
          onClose();
        }, 2000);
      }
    };

    const onIceCandidate = async (data: { callId: string; candidate: RTCIceCandidateInit }) => {
      if (data.callId === callId) {
        await handleIceCandidate(data); // adds ICE candidate to peer connection
      }
    };

    socket.on(SOCKET_EVENTS.CALL_ANSWERED, onAnswer);
    socket.on(SOCKET_EVENTS.CALL_REJECTED_RECV, onRejected);
    socket.on(SOCKET_EVENTS.CALL_ENDED_RECV, onEnded);
    socket.on(SOCKET_EVENTS.ICE_CANDIDATE_RECV, onIceCandidate);

    return () => {
      if (socket) {
        socket.off(SOCKET_EVENTS.CALL_ANSWERED, onAnswer);
        socket.off(SOCKET_EVENTS.CALL_REJECTED_RECV, onRejected);
        socket.off(SOCKET_EVENTS.CALL_ENDED_RECV, onEnded);
        socket.off(SOCKET_EVENTS.ICE_CANDIDATE_RECV, onIceCandidate);
      }
    };
  }, [callId, friend.username, onClose, startDurationTimer, stopDurationTimer, cleanup, handleEndCall]);

  useEffect(() => {
    if (phase === "calling") {
      timeoutRef.current = setTimeout(() => {
        toast.error("No answer — call timed out");
        handleEndCall();
      }, 45000);
    }
    return () => { 
      if (timeoutRef.current) clearTimeout(timeoutRef.current); 
    };
  }, [phase, handleEndCall]);

  // ========== RENDER ==========

  const phaseLabel: Record<Phase, string> = {
    preview: callType === "video" ? "Ready for video call" : "Ready for voice call",
    calling: "Calling...",
    connecting: "Connecting...",
    connected: formatDuration(callDuration),
    ended: "Call ended",
  };

  const renderPermissionUI = () => {
    if (permissionState === "checking") {
      return (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Checking camera and microphone...</p>
        </div>
      );
    }

    if (permissionState === "denied" || permissionState === "prompt") {
      return (
        <div className="text-center p-6">
          <div className="mb-4">
            <VideoOff className="w-16 h-16 mx-auto text-red-500/50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Camera & Microphone Access Required</h3>
          
          {!availableDevices.audio && !availableDevices.video ? (
            <p className="text-white/70 mb-4">No camera or microphone detected on your device.</p>
          ) : (
            <>
              <p className="text-white/70 mb-4">
                {callType === "video" 
                  ? "To start a video call, we need access to your camera and microphone." 
                  : "To start a voice call, we need access to your microphone."}
              </p>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 text-left">
                <p className="text-yellow-500 text-sm font-medium mb-2">📋 Steps to allow access:</p>
                <ol className="text-white/70 text-sm space-y-2 list-decimal pl-4">
                  <li>Click the camera/lock icon in your browser's address bar</li>
                  <li>Select "Allow" for {callType === "video" ? "camera and microphone" : "microphone"}</li>
                  <li>Refresh the page or click the retry button below</li>
                </ol>
              </div>

              <button
                onClick={async () => {
                  setPermissionState("checking");
                  const stream = await requestMediaAccess();
                  if (stream) {
                    setPermissionState("granted");
                  } else {
                    setPermissionState("denied");
                  }
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center gap-2 mx-auto transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Access
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="mt-4 text-white/50 hover:text-white/70 text-sm"
          >
            Cancel
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)" }}>

      <div
        className="relative w-full max-w-4xl mx-4 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(160deg, #0a0f1f 0%, #121827 100%)" }}>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/70 transition-all"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>

        {/* Permission UI or Call UI */}
        {(permissionState === "denied" || permissionState === "prompt" || permissionState === "checking") ? (
          renderPermissionUI()
        ) : (
          <>
            {/* Main video area */}
            <div className="relative bg-black" style={{ height: callType === "video" ? 400 : 300 }}>
              {/* Remote video */}
              {callType === "video" && (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ display: phase === "connected" || phase === "connecting" ? "block" : "none" }}
                />
              )}

              {/* Local video */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`absolute transition-all duration-300 ${
                  phase === "connected" && callType === "video"
                    ? "bottom-4 right-4 w-48 h-64 rounded-lg shadow-2xl border-2 border-white/20"
                    : "inset-0 w-full h-full object-cover"
                }`}
                style={{ transform: "scaleX(-1)" }}
              />

              {/* Video off overlay */}
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <VideoOff className="w-16 h-16 mx-auto mb-3 text-white/30" />
                    <p className="text-white/50">Camera is off</p>
                  </div>
                </div>
              )}

              {/* Call info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{friend.username}</h3>
                    <p className="text-sm text-white/70 mt-1">{phaseLabel[phase]}</p>
                  </div>
                  {phase === "calling" && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-white/70 text-sm">Ringing</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-6">
              {/* Preview controls */}
              {phase === "preview" && (
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <button
                      onClick={toggleMute}
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all hover:scale-110 ${
                        isMuted ? "bg-red-500/20" : "bg-white/10"
                      }`}
                    >
                      {isMuted ? <MicOff className="w-6 h-6 text-red-500" /> : <Mic className="w-6 h-6 text-white" />}
                    </button>
                    <p className="text-xs text-white/50">{isMuted ? "Unmute" : "Mute"}</p>
                  </div>

                  {callType === "video" && (
                    <div className="text-center">
                      <button
                        onClick={toggleVideo}
                        className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all hover:scale-110 ${
                          isVideoOff ? "bg-red-500/20" : "bg-white/10"
                        }`}
                      >
                        {isVideoOff ? <VideoOff className="w-6 h-6 text-red-500" /> : <Video className="w-6 h-6 text-white" />}
                      </button>
                      <p className="text-xs text-white/50">{isVideoOff ? "Show" : "Hide"}</p>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      onClick={handleStartCall}
                      className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center mb-2 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-green-600/30"
                    >
                      {callType === "video" ? <Video className="w-7 h-7 text-white" /> : <Phone className="w-7 h-7 text-white" />}
                    </button>
                    <p className="text-xs text-white/50">Start Call</p>
                  </div>
                </div>
              )}

              {/* Calling/Connected controls */}
              {(phase === "calling" || phase === "connected") && (
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <button
                      onClick={toggleMute}
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all hover:scale-110 ${
                        isMuted ? "bg-red-500/20" : "bg-white/10"
                      }`}
                    >
                      {isMuted ? <MicOff className="w-6 h-6 text-red-500" /> : <Mic className="w-6 h-6 text-white" />}
                    </button>
                    <p className="text-xs text-white/50">{isMuted ? "Unmute" : "Mute"}</p>
                  </div>

                  {callType === "video" && phase === "connected" && (
                    <div className="text-center">
                      <button
                        onClick={toggleVideo}
                        className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all hover:scale-110 ${
                          isVideoOff ? "bg-red-500/20" : "bg-white/10"
                        }`}
                      >
                        {isVideoOff ? <VideoOff className="w-6 h-6 text-red-500" /> : <Video className="w-6 h-6 text-white" />}
                      </button>
                      <p className="text-xs text-white/50">{isVideoOff ? "Show" : "Hide"}</p>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      onClick={handleEndCall}
                      className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center mb-2 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-red-600/30"
                    >
                      <PhoneOff className="w-7 h-7 text-white" />
                    </button>
                    <p className="text-xs text-white/50">End Call</p>
                  </div>
                </div>
              )}

              {/* Ended state */}
              {phase === "ended" && (
                <div className="text-center py-4">
                  <p className="text-white/70">Call ended · Closing...</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}