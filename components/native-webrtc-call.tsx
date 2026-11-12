"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import { QueueChat } from "@/components/queue-chat";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ============================================
// Types & WebRTC Configuration
// ============================================
export interface NativeWebRTCCallProps {
    roomId: string;
    userRole: "doctor" | "patient";
    userName?: string;
    remoteUserName?: string;
    remoteUserAvatar?: string;
    currentProfileId?: string;
    recipientProfileId?: string;
    onEndCall: (durationSeconds?: number) => void;
    isRTL?: boolean;
    language?: string;
    isDark?: boolean;
}

const RTC_CONFIG: RTCConfiguration = {
    iceServers: [
        // High-availability Google Public STUN
        { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
        { urls: ["stun:stun2.l.google.com:19302", "stun:stun3.l.google.com:19302"] },
        // Cloudflare Public STUN
        { urls: ["stun:stun.cloudflare.com:3478"] },
        // OpenRelay Public TURN (Essential for mobile carrier 4G/5G NAT traversal)
        { urls: ["stun:openrelay.metered.ca:80"] },
        {
            urls: [
                "turn:openrelay.metered.ca:80",
                "turn:openrelay.metered.ca:443",
                "turn:openrelay.metered.ca:443?transport=tcp",
            ],
            username: "openrelayproject",
            credential: "openrelayproject",
        },
    ],
    iceCandidatePoolSize: 10,
};

export function NativeWebRTCCall({
    roomId,
    userRole,
    userName,
    remoteUserName,
    remoteUserAvatar,
    currentProfileId,
    recipientProfileId,
    onEndCall,
    isRTL = true,
    isDark = true,
}: NativeWebRTCCallProps) {
    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const isMountedRef = useRef(true);

    // Call state
    const [connectionStatus, setConnectionStatus] = useState<
        "initializing" | "connecting" | "connected" | "reconnecting" | "failed" | "disconnected"
    >("initializing");
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [peerJoined, setPeerJoined] = useState(false);
    const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

    // Media states
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isRemoteAudioMuted, setIsRemoteAudioMuted] = useState(false);
    const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
    const [mediaError, setMediaError] = useState<string | null>(null);

    // UI states
    const [isSwapped, setIsSwapped] = useState(false);
    const [videoFit, setVideoFit] = useState<"cover" | "contain">("cover");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
    const [isSpeakingRemote, setIsSpeakingRemote] = useState(false);

    // Target names
    const targetDisplayName =
        remoteUserName ||
        (userRole === "doctor"
            ? isRTL ? "المريض" : "Patient"
            : isRTL ? "طبيب معتمد" : "Doctor");

    const myDisplayName =
        userName ||
        (userRole === "doctor"
            ? isRTL ? "طبيب معتمد" : "Doctor"
            : isRTL ? "المريض" : "Patient");

    // Clean room ID for Supabase realtime channel
    const cleanRoomId = roomId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 36);

    // Call duration timer
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (connectionStatus === "connected") {
            interval = setInterval(() => {
                setDurationSeconds((prev) => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [connectionStatus]);

    const formatDuration = (totalSec: number) => {
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // Check for camera count (Front / Back switch on mobile)
    useEffect(() => {
        async function detectCameras() {
            try {
                if (navigator.mediaDevices?.enumerateDevices) {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = devices.filter((d) => d.kind === "videoinput");
                    setHasMultipleCameras(videoDevices.length > 1);
                }
            } catch {
                // Ignore enumeration failure
            }
        }
        detectCameras();
    }, []);

    // Setup Audio Visualizer (speaking indicator)
    const setupAudioVisualizer = useCallback((stream: MediaStream, isLocal: boolean) => {
        try {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioCtx) return;

            if (!audioContextRef.current || audioContextRef.current.state === "closed") {
                audioContextRef.current = new AudioCtx();
            }
            const ctx = audioContextRef.current;
            if (ctx.state === "suspended") {
                ctx.resume().catch(() => {});
            }

            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length === 0) return;

            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 128;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkSpeaking = () => {
                if (!isMountedRef.current) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                const isSpeaking = average > 18;

                if (isLocal) {
                    setIsSpeakingLocal(isSpeaking && !isAudioMuted);
                } else {
                    setIsSpeakingRemote(isSpeaking && !isRemoteAudioMuted);
                }

                animFrameRef.current = requestAnimationFrame(checkSpeaking);
            };

            checkSpeaking();
        } catch (err) {
            console.warn("[NativeWebRTC] Audio visualizer setup error:", err);
        }
    }, [isAudioMuted, isRemoteAudioMuted]);

    // Send WebRTC Offer (Initiated deterministically by Doctor)
    const sendOffer = useCallback(async () => {
        const pc = pcRef.current;
        const channel = channelRef.current;
        if (!pc || !channel) return;

        try {
            console.log("[NativeWebRTC] Creating and sending WebRTC Offer");
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });
            await pc.setLocalDescription(offer);

            await channel.send({
                type: "broadcast",
                event: "offer",
                payload: {
                    sdp: offer,
                    senderRole: userRole,
                },
            });
        } catch (err) {
            console.error("[NativeWebRTC] Error creating offer:", err);
        }
    }, [userRole]);

    // Initialize WebRTC and Signaling
    useEffect(() => {
        isMountedRef.current = true;
        let localStream: MediaStream | null = null;
        let peerConnection: RTCPeerConnection | null = null;
        let channel: RealtimeChannel | null = null;

        async function startCall() {
            setConnectionStatus("connecting");
            setMediaError(null);

            // 1. Acquire Local Media (Camera + Microphone)
            try {
                localStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: facingMode },
                        width: { ideal: 1280, max: 1920 },
                        height: { ideal: 720, max: 1080 },
                        frameRate: { ideal: 30, max: 30 },
                    },
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                });
            } catch (videoError) {
                console.warn("[NativeWebRTC] Video+Audio capture failed, falling back to Audio only:", videoError);
                try {
                    // Fallback: Audio-only if webcam is unavailable/blocked
                    localStream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                        },
                        video: false,
                    });
                    setIsVideoOff(true);
                } catch (audioError) {
                    console.error("[NativeWebRTC] Media permission denied:", audioError);
                    setMediaError(
                        isRTL
                            ? "يرجى السماح بالوصول إلى الكاميرا والمايكروفون من إعدادات المتصفح لبدء الاستشارة."
                            : "Please allow camera and microphone access in your browser settings."
                    );
                    setConnectionStatus("failed");
                    return;
                }
            }

            if (!isMountedRef.current) {
                localStream.getTracks().forEach((t) => t.stop());
                return;
            }

            localStreamRef.current = localStream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
            }

            // Start audio visualizer for local stream
            setupAudioVisualizer(localStream, true);

            // 2. Initialize RTCPeerConnection
            peerConnection = new RTCPeerConnection(RTC_CONFIG);
            pcRef.current = peerConnection;

            // Add local tracks to peer connection
            localStream.getTracks().forEach((track) => {
                if (peerConnection && localStream) {
                    peerConnection.addTrack(track, localStream);
                }
            });

            // Handle incoming remote stream tracks
            peerConnection.ontrack = (event) => {
                console.log("[NativeWebRTC] Received remote track:", event.track.kind);
                if (event.streams && event.streams[0]) {
                    const stream = event.streams[0];
                    remoteStreamRef.current = stream;
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = stream;
                    }
                    setHasRemoteVideo(stream.getVideoTracks().length > 0);
                    setConnectionStatus("connected");
                    setupAudioVisualizer(stream, false);
                }
            };

            // Handle local ICE candidates and broadcast
            peerConnection.onicecandidate = (event) => {
                if (event.candidate && channelRef.current) {
                    channelRef.current.send({
                        type: "broadcast",
                        event: "ice-candidate",
                        payload: {
                            candidate: event.candidate.toJSON(),
                            senderRole: userRole,
                        },
                    });
                }
            };

            // Monitor ICE Connection State
            peerConnection.oniceconnectionstatechange = () => {
                if (!peerConnection) return;
                const state = peerConnection.iceConnectionState;
                console.log("[NativeWebRTC] ICE Connection State:", state);
                if (state === "connected" || state === "completed") {
                    setConnectionStatus("connected");
                } else if (state === "disconnected") {
                    setConnectionStatus("reconnecting");
                } else if (state === "failed") {
                    setConnectionStatus("failed");
                    try {
                        peerConnection.restartIce();
                    } catch {
                        // Ignore restart fail
                    }
                }
            };

            // 3. Connect to Supabase Realtime Signaling Channel
            const supabase = createBrowserSupabaseClient();
            channel = supabase.channel(`webrtc-call-${cleanRoomId}`, {
                config: { broadcast: { self: false } },
            });
            channelRef.current = channel;

            // Handle Peer Ready Event
            channel.on("broadcast", { event: "peer-ready" }, async (message) => {
                const payload = message.payload as { role: string; name?: string; isAudioMuted?: boolean; isVideoOff?: boolean };
                console.log("[NativeWebRTC] Remote peer is ready:", payload);
                setPeerJoined(true);
                if (payload.isAudioMuted !== undefined) setIsRemoteAudioMuted(payload.isAudioMuted);
                if (payload.isVideoOff !== undefined) setIsRemoteVideoOff(payload.isVideoOff);

                // If I am the doctor, initiate the WebRTC Offer
                if (userRole === "doctor") {
                    await sendOffer();
                } else {
                    // Patient replies with peer-ready to trigger doctor offer if doctor was already in room
                    channel?.send({
                        type: "broadcast",
                        event: "peer-ready",
                        payload: {
                            role: userRole,
                            name: myDisplayName,
                            isAudioMuted,
                            isVideoOff,
                        },
                    });
                }
            });

            // Handle WebRTC Offer (Received by Callee / Patient)
            channel.on("broadcast", { event: "offer" }, async (message) => {
                const payload = message.payload as { sdp: RTCSessionDescriptionInit; senderRole: string };
                if (payload.senderRole === userRole) return; // Ignore own messages
                console.log("[NativeWebRTC] Received WebRTC Offer from:", payload.senderRole);

                if (!pcRef.current) return;
                try {
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));

                    // Flush any queued ICE candidates
                    while (pendingCandidatesRef.current.length > 0) {
                        const candidate = pendingCandidatesRef.current.shift();
                        if (candidate) {
                            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                        }
                    }

                    // Create and send Answer
                    const answer = await pcRef.current.createAnswer();
                    await pcRef.current.setLocalDescription(answer);

                    await channel?.send({
                        type: "broadcast",
                        event: "answer",
                        payload: {
                            sdp: answer,
                            senderRole: userRole,
                        },
                    });
                } catch (err) {
                    console.error("[NativeWebRTC] Error handling offer:", err);
                }
            });

            // Handle WebRTC Answer (Received by Caller / Doctor)
            channel.on("broadcast", { event: "answer" }, async (message) => {
                const payload = message.payload as { sdp: RTCSessionDescriptionInit; senderRole: string };
                if (payload.senderRole === userRole) return;
                console.log("[NativeWebRTC] Received WebRTC Answer from:", payload.senderRole);

                if (!pcRef.current) return;
                try {
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));

                    // Flush any queued ICE candidates
                    while (pendingCandidatesRef.current.length > 0) {
                        const candidate = pendingCandidatesRef.current.shift();
                        if (candidate) {
                            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                        }
                    }
                } catch (err) {
                    console.error("[NativeWebRTC] Error handling answer:", err);
                }
            });

            // Handle ICE Candidate Exchange
            channel.on("broadcast", { event: "ice-candidate" }, async (message) => {
                const payload = message.payload as { candidate: RTCIceCandidateInit; senderRole: string };
                if (payload.senderRole === userRole) return;

                if (pcRef.current?.remoteDescription && pcRef.current.remoteDescription.type) {
                    try {
                        await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
                    } catch (err) {
                        console.warn("[NativeWebRTC] Error adding ICE candidate:", err);
                    }
                } else {
                    pendingCandidatesRef.current.push(payload.candidate);
                }
            });

            // Handle Media State Updates (Mute / Camera toggle from remote side)
            channel.on("broadcast", { event: "media-state" }, (message) => {
                const payload = message.payload as { isAudioMuted?: boolean; isVideoOff?: boolean };
                if (payload.isAudioMuted !== undefined) setIsRemoteAudioMuted(payload.isAudioMuted);
                if (payload.isVideoOff !== undefined) setIsRemoteVideoOff(payload.isVideoOff);
            });

            // Handle Call Ended Event from other party
            channel.on("broadcast", { event: "call-ended" }, () => {
                console.log("[NativeWebRTC] Remote peer ended the call");
                setConnectionStatus("disconnected");
                onEndCall(durationSeconds);
            });

            // Subscribe to channel and broadcast initial presence
            channel.subscribe((status) => {
                console.log("[NativeWebRTC] Channel subscription status:", status);
                if (status === "SUBSCRIBED") {
                    channel?.send({
                        type: "broadcast",
                        event: "peer-ready",
                        payload: {
                            role: userRole,
                            name: myDisplayName,
                            isAudioMuted,
                            isVideoOff,
                        },
                    });
                }
            });
        }

        startCall();

        // Cleanup on unmount
        return () => {
            isMountedRef.current = false;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (audioContextRef.current && audioContextRef.current.state !== "closed") {
                audioContextRef.current.close().catch(() => {});
            }

            // Stop local media tracks
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
                localStreamRef.current = null;
            }

            // Close WebRTC PeerConnection
            if (pcRef.current) {
                pcRef.current.close();
                pcRef.current = null;
            }

            // Leave Realtime Channel
            if (channelRef.current) {
                channelRef.current.unsubscribe();
                channelRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cleanRoomId]);

    // Mute / Unmute Microphone
    const toggleAudio = useCallback(() => {
        if (!localStreamRef.current) return;
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            const newMuted = !audioTrack.enabled;
            setIsAudioMuted(newMuted);

            channelRef.current?.send({
                type: "broadcast",
                event: "media-state",
                payload: { isAudioMuted: newMuted, isVideoOff },
            });
        }
    }, [isVideoOff]);

    // Toggle Camera On / Off
    const toggleVideo = useCallback(() => {
        if (!localStreamRef.current) return;
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            const newVideoOff = !videoTrack.enabled;
            setIsVideoOff(newVideoOff);

            channelRef.current?.send({
                type: "broadcast",
                event: "media-state",
                payload: { isAudioMuted, isVideoOff: newVideoOff },
            });
        }
    }, [isAudioMuted]);

    // Flip Camera (Front / Back switch for mobile phones & tablets)
    const flipCamera = useCallback(async () => {
        if (!localStreamRef.current || !pcRef.current) return;
        try {
            const nextFacing = facingMode === "user" ? "environment" : "user";
            const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];

            let newStream: MediaStream;
            try {
                newStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { exact: nextFacing }, width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false,
                });
            } catch {
                newStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: nextFacing } },
                    audio: false,
                });
            }

            const newVideoTrack = newStream.getVideoTracks()[0];
            if (!newVideoTrack) return;

            // Replace track in WebRTC sender
            const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
            if (sender) {
                await sender.replaceTrack(newVideoTrack);
            }

            // Update local stream and element
            if (oldVideoTrack) {
                oldVideoTrack.stop();
                localStreamRef.current.removeTrack(oldVideoTrack);
            }
            localStreamRef.current.addTrack(newVideoTrack);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
            }

            setFacingMode(nextFacing);
        } catch (err) {
            console.warn("[NativeWebRTC] Flip camera error:", err);
        }
    }, [facingMode]);

    // Toggle Fullscreen
    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    }, []);

    // Handle Confirm End Call
    const handleConfirmEndCall = useCallback(() => {
        channelRef.current?.send({
            type: "broadcast",
            event: "call-ended",
            payload: { role: userRole },
        });

        // Stop local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop());
        }
        if (pcRef.current) {
            pcRef.current.close();
        }

        setShowEndModal(false);
        onEndCall(durationSeconds);
    }, [durationSeconds, onEndCall, userRole]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full h-[100dvh] bg-slate-950 flex flex-col md:flex-row overflow-hidden select-none",
                isDark ? "dark text-white" : "text-slate-900"
            )}
            style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
            {/* Top Bar Header (Glassmorphic) */}
            <header className="absolute top-0 inset-x-0 h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between z-30 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent backdrop-blur-sm pointer-events-auto">
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="relative">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 border border-white/20 flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-lg overflow-hidden">
                            {remoteUserAvatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={remoteUserAvatar} alt={targetDisplayName} className="w-full h-full object-cover" />
                            ) : (
                                targetDisplayName.charAt(0)
                            )}
                        </div>
                        {isSpeakingRemote && (
                            <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-white text-xs sm:text-sm font-bold leading-tight drop-shadow-md">
                                {targetDisplayName}
                            </h2>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {userRole === "doctor" ? (isRTL ? "مريض" : "Patient") : (isRTL ? "طبيب معتمد 🩺" : "Doctor 🩺")}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {connectionStatus === "connected" ? (
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[11px] sm:text-xs text-emerald-200 font-mono font-medium drop-shadow">
                                        {formatDuration(durationSeconds)}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                    <span className="text-[11px] sm:text-xs text-amber-200 font-medium">
                                        {connectionStatus === "reconnecting"
                                            ? isRTL ? "إعادة الاتصال..." : "Reconnecting..."
                                            : isRTL ? "جاري التوصيل المباشر..." : "Connecting..."}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* Aspect Ratio Fill/Fit */}
                    <button
                        onClick={() => setVideoFit((f) => (f === "cover" ? "contain" : "cover"))}
                        className="hidden sm:flex p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/10 transition-colors backdrop-blur-md"
                        title={videoFit === "cover" ? (isRTL ? "عرض كامل الإطار" : "Fit to screen") : (isRTL ? "ملء الشاشة" : "Fill screen")}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>

                    {/* Toggle In-Call Chat Button */}
                    <button
                        onClick={() => setIsChatOpen((prev) => !prev)}
                        className={cn(
                            "px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-lg border backdrop-blur-md",
                            isChatOpen
                                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20"
                                : "bg-slate-900/70 hover:bg-slate-800 text-white border-white/15"
                        )}
                        title={isRTL ? "فتح المحادثة والصور" : "Toggle Chat & Photos"}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{isRTL ? "الصور والشات 📷" : "Chat & Photos 📷"}</span>
                    </button>

                    {/* End Call Button */}
                    <button
                        onClick={() => setShowEndModal(true)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/30 active:scale-95 border border-red-500/40"
                    >
                        <svg className="w-4 h-4 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                        </svg>
                        <span className="hidden sm:inline">
                            {userRole === "doctor" ? (isRTL ? "إنهاء الاستشارة" : "End Call") : (isRTL ? "مغادرة" : "Leave")}
                        </span>
                    </button>
                </div>
            </header>

            {/* Video Stage Container */}
            <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
                {/* Remote Main Video (or Local if swapped) */}
                <video
                    ref={isSwapped ? localVideoRef : remoteVideoRef}
                    autoPlay
                    playsInline
                    muted={isSwapped} // Muted if local video is in main frame
                    className={cn(
                        "w-full h-full transition-all duration-300",
                        videoFit === "cover" ? "object-cover" : "object-contain",
                        (!isSwapped && isRemoteVideoOff) || (isSwapped && isVideoOff) ? "hidden" : "block"
                    )}
                />

                {/* Remote Video Off / Waiting Card Placeholder */}
                {((!isSwapped && isRemoteVideoOff) || (!isSwapped && !peerJoined)) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-[#031326] z-10">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 border-2 border-white/20 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-2xl overflow-hidden">
                                {remoteUserAvatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={remoteUserAvatar} alt={targetDisplayName} className="w-full h-full object-cover" />
                                ) : (
                                    targetDisplayName.charAt(0)
                                )}
                            </div>
                            {isSpeakingRemote && (
                                <span className="absolute -inset-2 rounded-full border-4 border-emerald-400 animate-ping opacity-60" />
                            )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{targetDisplayName}</h3>
                        <p className="text-sm text-slate-300 max-w-sm">
                            {!peerJoined
                                ? isRTL
                                    ? "في انتظار انضمام الطرف الآخر للمكالمة، يتم التوصيل التلقائي فور دخوله..."
                                    : "Waiting for the participant to join the room..."
                                : isRemoteVideoOff
                                ? isRTL
                                    ? "الكاميرا متوقفة مؤقتاً من طرف المتحدث، الصوت يعمل بشكل طبيعي."
                                    : "Camera turned off by participant, audio is active."
                                : isRTL
                                ? "المكالمة متصلة"
                                : "Call connected"}
                        </p>
                        {isRemoteAudioMuted && (
                            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs">
                                <span>🎙️ {isRTL ? "المايكروفون مكتوم" : "Muted"}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Permission Error Banner */}
                {mediaError && (
                    <div className="absolute top-20 inset-x-4 sm:inset-x-auto sm:w-[480px] p-4 rounded-2xl bg-red-500/20 border border-red-500/40 backdrop-blur-xl text-white text-sm z-30 shadow-2xl flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <div className="flex-1">
                            <p className="font-semibold mb-1">{isRTL ? "تنبيه الأذونات" : "Permission Warning"}</p>
                            <p className="text-red-200 text-xs sm:text-sm">{mediaError}</p>
                        </div>
                    </div>
                )}

                {/* Picture-in-Picture (PiP) Local Video (Tap to Swap) */}
                <motion.div
                    drag
                    dragConstraints={containerRef}
                    dragMomentum={false}
                    onClick={() => setIsSwapped((s) => !s)}
                    className={cn(
                        "absolute z-20 cursor-pointer overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl bg-slate-900/90 backdrop-blur-md group transition-all",
                        isRTL ? "left-3 sm:left-6" : "right-3 sm:right-6",
                        "bottom-20 sm:bottom-24 w-28 h-36 sm:w-40 sm:h-52"
                    )}
                    title={isRTL ? "اضغط للتبديل مع الشاشة الرئيسية" : "Tap to swap views"}
                >
                    <video
                        ref={isSwapped ? remoteVideoRef : localVideoRef}
                        autoPlay
                        playsInline
                        muted={!isSwapped} // Local is muted
                        className={cn(
                            "w-full h-full object-cover transition-opacity",
                            (isSwapped && isRemoteVideoOff) || (!isSwapped && isVideoOff) ? "hidden" : "block"
                        )}
                    />
                    {((isSwapped && isRemoteVideoOff) || (!isSwapped && isVideoOff)) && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-2 text-center text-white">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm mb-1">
                                {isSwapped ? targetDisplayName.charAt(0) : myDisplayName.charAt(0)}
                            </div>
                            <span className="text-[10px] text-slate-400">
                                {isRTL ? "الكاميرا متوقفة" : "Camera Off"}
                            </span>
                        </div>
                    )}
                    {/* Badge on PiP */}
                    <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-white">
                        <span className="truncate">{isSwapped ? targetDisplayName : (isRTL ? "أنت" : "You")}</span>
                        {(!isSwapped && isAudioMuted) && <span className="text-red-400">🎙️✕</span>}
                    </div>
                </motion.div>

                {/* Floating Bottom Control Dock */}
                <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex items-center justify-center pointer-events-none z-30 px-3">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="pointer-events-auto flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-3 rounded-full bg-slate-950/80 backdrop-blur-2xl border border-white/15 shadow-2xl"
                    >
                        {/* 1. Mic Button */}
                        <button
                            onClick={toggleAudio}
                            className={cn(
                                "w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all text-white shadow-md active:scale-90",
                                isAudioMuted
                                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                                    : "bg-slate-800/80 hover:bg-slate-700 border border-white/10"
                            )}
                            title={isAudioMuted ? (isRTL ? "تشغيل المايكروفون" : "Unmute Mic") : (isRTL ? "كتم المايكروفون" : "Mute Mic")}
                        >
                            {isAudioMuted ? (
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            )}
                        </button>

                        {/* 2. Camera Button */}
                        <button
                            onClick={toggleVideo}
                            className={cn(
                                "w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all text-white shadow-md active:scale-90",
                                isVideoOff
                                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                                    : "bg-slate-800/80 hover:bg-slate-700 border border-white/10"
                            )}
                            title={isVideoOff ? (isRTL ? "تشغيل الكاميرا" : "Turn Video On") : (isRTL ? "إيقاف الكاميرا" : "Turn Video Off")}
                        >
                            {isVideoOff ? (
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </button>

                        {/* 3. Flip Camera (Front / Back on Mobile & Tablets) */}
                        {hasMultipleCameras && (
                            <button
                                onClick={flipCamera}
                                className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white border border-white/10 flex items-center justify-center transition-all shadow-md active:scale-90"
                                title={isRTL ? "تبديل الكاميرا (الأمامية / الخلفية)" : "Flip Camera"}
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        )}

                        {/* 4. Chat & Photos Drawer Toggle */}
                        <button
                            onClick={() => setIsChatOpen((prev) => !prev)}
                            className={cn(
                                "w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 relative",
                                isChatOpen
                                    ? "bg-amber-500 text-slate-950 font-bold"
                                    : "bg-slate-800/80 hover:bg-slate-700 text-white border border-white/10"
                            )}
                            title={isRTL ? "محادثة وإرسال صور" : "Chat & Photos"}
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </button>

                        {/* 5. Fullscreen Toggle */}
                        <button
                            onClick={toggleFullscreen}
                            className="hidden md:flex w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white border border-white/10 items-center justify-center transition-all shadow-md active:scale-90"
                            title={isFullscreen ? (isRTL ? "تصغير" : "Exit Fullscreen") : (isRTL ? "ملء الشاشة" : "Fullscreen")}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </button>

                        {/* 6. End Call Button (Prominent Red) */}
                        <button
                            onClick={() => setShowEndModal(true)}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transition-all active:scale-90 border-2 border-red-500/50"
                            title={isRTL ? "إنهاء المكالمة" : "End Call"}
                        >
                            <svg className="w-6 h-6 sm:w-7 sm:h-7 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                            </svg>
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* In-Call Realtime Chat Split-Pane (Desktop) / Slide-up Sheet (Mobile & Foldables) */}
            <AnimatePresence>
                {isChatOpen && currentProfileId && recipientProfileId && (
                    <motion.div
                        initial={{ opacity: 0, x: isRTL ? -100 : 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRTL ? -100 : 100 }}
                        className={cn(
                            "z-40 transition-all",
                            // On Mobile: bottom drawer sheet
                            "fixed inset-x-0 bottom-0 h-[80vh] sm:h-[85vh] rounded-t-3xl border-t border-white/20 shadow-2xl bg-slate-900/95 backdrop-blur-2xl",
                            // On Desktop / Laptop: right/left docked sidebar
                            "md:static md:w-[380px] md:h-full md:rounded-none md:border-t-0 md:border-s md:border-white/10"
                        )}
                    >
                        <QueueChat
                            currentProfileId={currentProfileId}
                            recipientProfileId={recipientProfileId}
                            recipientName={targetDisplayName}
                            recipientAvatar={remoteUserAvatar}
                            isDark={isDark}
                            isRTL={isRTL}
                            isOpen={true}
                            embedded={true}
                            onOpenChange={(val) => setIsChatOpen(val)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* End Call Confirmation Modal */}
            <AnimatePresence>
                {showEndModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#08213D] border border-white/15 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl text-white"
                        >
                            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                                <svg className="w-8 h-8 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                {isRTL ? "إنهاء الاستشارة الطبية؟" : "End Consultation?"}
                            </h3>
                            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                                {userRole === "doctor"
                                    ? isRTL
                                        ? "عند إنهاء المكالمة ستتمكن من كتابة الروشتة وتوصيات العلاج للمريض مباشرة."
                                        : "Ending the call will complete the consultation and allow writing the prescription."
                                    : isRTL
                                    ? "هل أنت متأكد من مغادرة مكالمة الاستشارة مع الطبيب الآن؟"
                                    : "Are you sure you want to leave the consultation with the doctor now?"}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEndModal(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors border border-white/10"
                                >
                                    {isRTL ? "إلغاء والمتابعة" : "Cancel"}
                                </button>
                                <button
                                    onClick={handleConfirmEndCall}
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors shadow-lg shadow-red-600/30"
                                >
                                    {isRTL ? "تأكيد الإنهاء" : "Yes, End Call"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default NativeWebRTCCall;
