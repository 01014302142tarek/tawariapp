"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface NativeWebRTCCallProps {
    roomId: string;
    userRole: "doctor" | "patient";
    userName?: string;
    remoteUserName?: string;
    onEndCall: () => void;
    isRTL?: boolean;
    language?: string;
}

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:openrelay.metered.ca:80" },
        {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
        {
            urls: "turn:openrelay.metered.ca:443",
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
    onEndCall,
    isRTL = true,
}: NativeWebRTCCallProps) {
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
    const candidatesQueueRef = useRef<RTCIceCandidateInit[]>([]);
    const isMountedRef = useRef(true);

    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(true);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [remoteAudioMuted, setRemoteAudioMuted] = useState(false);
    const [remoteVideoOff, setRemoteVideoOff] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    // Call duration timer
    useEffect(() => {
        if (!connected) return;
        const interval = setInterval(() => {
            setDurationSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [connected]);

    const formatDuration = (totalSec: number) => {
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // Check available devices for camera flipping
    useEffect(() => {
        navigator.mediaDevices?.enumerateDevices?.().then((devices) => {
            const videoInputs = devices.filter((d) => d.kind === "videoinput");
            setHasMultipleCameras(videoInputs.length > 1);
        }).catch(() => {});
    }, []);

    // Core WebRTC initialization
    const initCall = useCallback(async () => {
        setPermissionError(null);
        setConnecting(true);

        try {
            // Check if mediaDevices is supported (requires HTTPS when accessing via network IP on mobile)
            if (!navigator?.mediaDevices?.getUserMedia) {
                const isHttpLan = typeof window !== "undefined" && window.location.protocol === "http:" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
                setPermissionError(
                    isHttpLan
                        ? (isRTL
                            ? "متصفح الهاتف (Safari/Chrome) يتطلب اتصالاً آمناً (HTTPS) لتشغيل الكاميرا عبر شبكة الواي فاي. الكاميرا تعمل بنجاح عند استخدام رابط آمن (HTTPS) أو من الكمبيوتر (localhost)."
                            : "Mobile browsers require a secure connection (HTTPS) to access camera and microphone over Wi-Fi. It works when using HTTPS or localhost.")
                        : (isRTL
                            ? "المتصفح الحالي لا يدعم الوصول للكاميرا والميكروفون."
                            : "Your browser does not support camera/microphone access.")
                );
                setConnecting(false);
                return;
            }

            // 1. Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            if (!isMountedRef.current) {
                stream.getTracks().forEach((t) => t.stop());
                return;
            }

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // 2. Initialize PeerConnection
            const pc = new RTCPeerConnection(ICE_SERVERS);
            pcRef.current = pc;

            // Add local tracks to peer connection
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // 3. Handle remote track
            pc.ontrack = (event) => {
                console.log("[NativeWebRTC] Received remote track:", event.track.kind);
                if (event.streams && event.streams[0]) {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                    setConnected(true);
                    setConnecting(false);
                }
            };

            // 4. Handle ICE connection state changes
            pc.oniceconnectionstatechange = () => {
                console.log("[NativeWebRTC] ICE state:", pc.iceConnectionState);
                if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
                    setConnected(true);
                    setConnecting(false);
                } else if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
                    // Try ICE restart if failed
                    if (pc.iceConnectionState === "failed" && userRole === "doctor") {
                        pc.restartIce();
                    }
                }
            };

            // 5. Connect to Supabase Realtime channel for signaling
            const supabase = createClient();
            const channel = supabase.channel(`webrtc-call-${roomId}`, {
                config: { broadcast: { self: false } },
            });
            channelRef.current = channel;

            // Send ICE candidates to remote peer via Realtime
            pc.onicecandidate = (event) => {
                if (event.candidate && channelRef.current) {
                    channelRef.current.send({
                        type: "broadcast",
                        event: "signal",
                        payload: {
                            type: "candidate",
                            candidate: event.candidate.toJSON(),
                            senderRole: userRole,
                        },
                    });
                }
            };

            // Create Offer helper (doctor initiates)
            const sendOffer = async () => {
                if (!pcRef.current) return;
                try {
                    const offer = await pcRef.current.createOffer({
                        offerToReceiveAudio: true,
                        offerToReceiveVideo: true,
                    });
                    await pcRef.current.setLocalDescription(offer);
                    console.log("[NativeWebRTC] Sending offer as doctor");
                    channel.send({
                        type: "broadcast",
                        event: "signal",
                        payload: {
                            type: "offer",
                            sdp: offer,
                            senderRole: userRole,
                        },
                    });
                } catch (err) {
                    console.error("[NativeWebRTC] Error creating offer:", err);
                }
            };

            // Listen for signals
            channel.on("broadcast", { event: "signal" }, async ({ payload }) => {
                if (!payload || payload.senderRole === userRole) return;
                console.log("[NativeWebRTC] Received signal:", payload.type, "from:", payload.senderRole);

                try {
                    if (payload.type === "ready") {
                        // Remote peer announced presence
                        if (userRole === "doctor") {
                            await sendOffer();
                        } else {
                            // Patient responds ready so doctor can offer
                            channel.send({
                                type: "broadcast",
                                event: "signal",
                                payload: { type: "ready", senderRole: userRole },
                            });
                        }
                    } else if (payload.type === "offer") {
                        if (userRole === "patient") {
                            console.log("[NativeWebRTC] Patient handling offer");
                            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));

                            // Flush queued candidates
                            while (candidatesQueueRef.current.length > 0) {
                                const cand = candidatesQueueRef.current.shift();
                                if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
                            }

                            const answer = await pc.createAnswer();
                            await pc.setLocalDescription(answer);
                            console.log("[NativeWebRTC] Sending answer as patient");
                            channel.send({
                                type: "broadcast",
                                event: "signal",
                                payload: {
                                    type: "answer",
                                    sdp: answer,
                                    senderRole: userRole,
                                },
                            });
                        }
                    } else if (payload.type === "answer") {
                        if (userRole === "doctor") {
                            console.log("[NativeWebRTC] Doctor handling answer");
                            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));

                            // Flush queued candidates
                            while (candidatesQueueRef.current.length > 0) {
                                const cand = candidatesQueueRef.current.shift();
                                if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
                            }
                        }
                    } else if (payload.type === "candidate") {
                        if (pc.remoteDescription && pc.remoteDescription.type) {
                            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
                        } else {
                            candidatesQueueRef.current.push(payload.candidate);
                        }
                    } else if (payload.type === "track-status") {
                        if (payload.audioMuted !== undefined) setRemoteAudioMuted(payload.audioMuted);
                        if (payload.videoOff !== undefined) setRemoteVideoOff(payload.videoOff);
                    }
                } catch (signalErr) {
                    console.error("[NativeWebRTC] Signal handling error:", signalErr);
                }
            });

            // Subscribe and announce presence
            channel.subscribe(async (status) => {
                console.log("[NativeWebRTC] Channel status:", status);
                if (status === "SUBSCRIBED") {
                    // Send ready announcement
                    channel.send({
                        type: "broadcast",
                        event: "signal",
                        payload: { type: "ready", senderRole: userRole },
                    });

                    // If doctor, also send initial offer after a brief delay if patient already ready
                    if (userRole === "doctor") {
                        setTimeout(() => {
                            if (isMountedRef.current && !connected) {
                                sendOffer();
                            }
                        }, 1200);
                    }
                }
            });

        } catch (err: unknown) {
            console.error("[NativeWebRTC] Media/Init error:", err);
            const error = err as Error;
            if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                setPermissionError(
                    isRTL
                        ? "يرجى السماح للمتصفح بالوصول إلى الكاميرا والميكروفون لإجراء المكالمة."
                        : "Please allow camera and microphone access in your browser to start the call."
                );
            } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
                setPermissionError(
                    isRTL
                        ? "لم يتم العثور على كاميرا أو ميكروفون متصل بالجهاز."
                        : "No camera or microphone found on this device."
                );
            } else {
                setPermissionError(error.message || "Failed to initialize call");
            }
            setConnecting(false);
        }
    }, [roomId, userRole, isRTL, connected]);

    useEffect(() => {
        isMountedRef.current = true;
        initCall();

        return () => {
            isMountedRef.current = false;
            // Clean up streams and connection
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
                localStreamRef.current = null;
            }
            if (pcRef.current) {
                pcRef.current.close();
                pcRef.current = null;
            }
            if (channelRef.current) {
                channelRef.current.unsubscribe();
                channelRef.current = null;
            }
        };
    }, [initCall]);

    // Mute/Unmute microphone
    const toggleAudio = () => {
        if (!localStreamRef.current) return;
        const tracks = localStreamRef.current.getAudioTracks();
        tracks.forEach((t) => {
            t.enabled = !t.enabled;
        });
        const isMuted = !tracks[0]?.enabled;
        setIsAudioMuted(isMuted);
        channelRef.current?.send({
            type: "broadcast",
            event: "signal",
            payload: {
                type: "track-status",
                audioMuted: isMuted,
                videoOff: isVideoOff,
                senderRole: userRole,
            },
        });
    };

    // Video On/Off
    const toggleVideo = () => {
        if (!localStreamRef.current) return;
        const tracks = localStreamRef.current.getVideoTracks();
        tracks.forEach((t) => {
            t.enabled = !t.enabled;
        });
        const isOff = !tracks[0]?.enabled;
        setIsVideoOff(isOff);
        channelRef.current?.send({
            type: "broadcast",
            event: "signal",
            payload: {
                type: "track-status",
                audioMuted: isAudioMuted,
                videoOff: isOff,
                senderRole: userRole,
            },
        });
    };

    // Switch between front and back cameras on mobile
    const switchCamera = async () => {
        if (!localStreamRef.current || !pcRef.current) return;
        try {
            const nextFacing = facingMode === "user" ? "environment" : "user";
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { exact: nextFacing } },
                audio: false,
            });

            const newTrack = newStream.getVideoTracks()[0];
            const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
            if (sender) {
                await sender.replaceTrack(newTrack);
            }

            const oldTrack = localStreamRef.current.getVideoTracks()[0];
            if (oldTrack) {
                oldTrack.stop();
                localStreamRef.current.removeTrack(oldTrack);
            }
            localStreamRef.current.addTrack(newTrack);

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
            }
            setFacingMode(nextFacing);
        } catch (err) {
            console.warn("[NativeWebRTC] Camera switch failed:", err);
        }
    };

    const targetDisplayName = remoteUserName || (userRole === "doctor" ? (isRTL ? "المريض" : "Patient") : (isRTL ? "الطبيب" : "Doctor"));

    return (
        <div className="relative w-full h-full bg-[#031326] flex flex-col overflow-hidden select-none">
            {/* Top Bar Overlay */}
            <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <button
                        onClick={onEndCall}
                        className="p-2 rounded-xl bg-[#08213D]/80 hover:bg-[#0D2C4F] text-slate-300 border border-white/10 backdrop-blur transition-colors"
                        title={isRTL ? "رجوع" : "Back"}
                    >
                        <svg className={cn("w-5 h-5", isRTL && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[#0D2C4F] border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                        {targetDisplayName.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-white text-sm sm:text-base font-semibold leading-tight">
                            {targetDisplayName}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                                className={cn(
                                    "w-2 h-2 rounded-full",
                                    connected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                                )}
                            />
                            <span className="text-xs text-slate-300">
                                {connected
                                    ? formatDuration(durationSeconds)
                                    : isRTL
                                    ? "بانتظار الطرف الآخر..."
                                    : "Waiting for other participant..."}
                            </span>
                        </div>
                    </div>
                </div>

                {remoteAudioMuted && (
                    <div className="px-2.5 py-1 bg-red-500/80 backdrop-blur text-white text-xs rounded-full flex items-center gap-1 font-medium pointer-events-auto">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                        <span>{isRTL ? "مكتوم الصوت" : "Muted"}</span>
                    </div>
                )}
            </div>

            {/* Permission / Hardware Error Screen */}
            {permissionError && (
                <div className="absolute inset-0 z-40 bg-[#031326] flex items-center justify-center p-6 text-center">
                    <div className="max-w-md bg-[#08213D] border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-white text-lg font-bold mb-2">
                            {isRTL ? "إذن الكاميرا والميكروفون مطلوب" : "Permission Required"}
                        </h3>
                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                            {permissionError}
                        </p>
                        <button
                            onClick={initCall}
                            className="w-full py-2.5 px-4 bg-[#FD614B] hover:bg-[#E84D37] text-white font-medium rounded-xl transition-colors"
                        >
                            {isRTL ? "إعادة المحاولة والموافقة" : "Retry & Allow"}
                        </button>
                    </div>
                </div>
            )}

            {/* Main Stage: Remote Video */}
            <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
                {/* Remote Video Stream */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className={cn(
                        "w-full h-full object-cover transition-opacity duration-300",
                        connected && !remoteVideoOff ? "opacity-100" : "opacity-0"
                    )}
                />

                {/* Remote Placeholder when not connected or camera turned off */}
                {(!connected || remoteVideoOff) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#08213D]/90 text-center p-6">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold text-3xl sm:text-4xl shadow-xl shadow-amber-500/20">
                                {targetDisplayName.charAt(0)}
                            </div>
                            {connecting && (
                                <div className="absolute -inset-2 rounded-full border-2 border-amber-400/40 border-t-amber-400 animate-spin" />
                            )}
                        </div>
                        <h3 className="text-white text-lg font-semibold mb-1">
                            {targetDisplayName}
                        </h3>
                        <p className="text-slate-400 text-xs sm:text-sm">
                            {remoteVideoOff && connected
                                ? (isRTL ? "أوقف الكاميرا (مكالمة صوتية)" : "Camera turned off")
                                : (isRTL ? "جاري الاتصال المباشر..." : "Connecting securely...")}
                        </p>
                    </div>
                )}

                {/* Floating Self-View (Picture-in-Picture) */}
                <div className="absolute top-20 right-4 sm:top-20 sm:right-6 w-24 h-36 sm:w-36 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-[#08213D] z-20 transition-all">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={cn(
                            "w-full h-full object-cover",
                            facingMode === "user" && "scale-x-[-1]",
                            isVideoOff && "hidden"
                        )}
                    />
                    {isVideoOff && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0D2C4F] text-slate-400">
                            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                            </svg>
                            <span className="text-[10px]">{isRTL ? "كاميرا متوقفة" : "Off"}</span>
                        </div>
                    )}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/60 backdrop-blur rounded-full text-[10px] text-white font-medium">
                        {isRTL ? "أنت" : "You"}
                    </div>
                </div>
            </div>

            {/* Bottom Floating Call Controls */}
            <div className="absolute bottom-6 inset-x-0 z-30 flex items-center justify-center px-4 pointer-events-none">
                <div className="flex items-center gap-3 sm:gap-4 bg-[#08213D]/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto">
                    {/* Toggle Microphone */}
                    <button
                        onClick={toggleAudio}
                        className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all transform active:scale-95",
                            isAudioMuted
                                ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                                : "bg-[#0D2C4F] hover:bg-slate-700 border border-white/10"
                        )}
                        title={isAudioMuted ? (isRTL ? "تشغيل الميكروفون" : "Unmute") : (isRTL ? "كتم الميكروفون" : "Mute")}
                    >
                        {isAudioMuted ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        )}
                    </button>

                    {/* Toggle Camera */}
                    <button
                        onClick={toggleVideo}
                        className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all transform active:scale-95",
                            isVideoOff
                                ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                                : "bg-[#0D2C4F] hover:bg-slate-700 border border-white/10"
                        )}
                        title={isVideoOff ? (isRTL ? "تشغيل الكاميرا" : "Turn Video On") : (isRTL ? "إيقاف الكاميرا" : "Turn Video Off")}
                    >
                        {isVideoOff ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>

                    {/* Flip Camera (Mobile) */}
                    {hasMultipleCameras && (
                        <button
                            onClick={switchCamera}
                            className="w-12 h-12 rounded-xl bg-[#0D2C4F] hover:bg-slate-700 border border-white/10 text-white flex items-center justify-center transition-all transform active:scale-95"
                            title={isRTL ? "تبديل الكاميرا (أمامية/خلفية)" : "Flip Camera"}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    )}

                    {/* End Call Button */}
                    <button
                        onClick={onEndCall}
                        className="h-12 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2 shadow-lg shadow-red-600/40 transition-all transform active:scale-95"
                    >
                        <svg className="w-5 h-5 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                        </svg>
                        <span className="text-sm font-semibold">
                            {userRole === "doctor"
                                ? (isRTL ? "إنهاء الاستشارة" : "End Call")
                                : (isRTL ? "مغادرة" : "Leave")}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NativeWebRTCCall;
