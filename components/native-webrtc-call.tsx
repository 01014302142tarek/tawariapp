"use client";

import React, { useEffect, useState, useMemo } from "react";
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

export function NativeWebRTCCall({
    roomId,
    userRole,
    userName,
    remoteUserName,
    onEndCall,
    isRTL = true,
}: NativeWebRTCCallProps) {
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    // Call duration timer
    useEffect(() => {
        const interval = setInterval(() => {
            setDurationSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatDuration = (totalSec: number) => {
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const targetDisplayName =
        remoteUserName ||
        (userRole === "doctor"
            ? isRTL
                ? "المريض"
                : "Patient"
            : isRTL
            ? "الطبيب"
            : "Doctor");

    const myDisplayName =
        userName ||
        (userRole === "doctor"
            ? isRTL
                ? "طبيب معتمد"
                : "Doctor"
            : isRTL
            ? "المريض"
            : "Patient");

    // Construct deterministic high-performance room URL (relayed via SFU videobridge)
    const { roomUrlWithConfig, bareRoomUrl } = useMemo(() => {
        const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "fairmeeting.net";
        const cleanRoomId = roomId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
        const roomName = `tabibi-room-${cleanRoomId}`;
        const base = `https://${jitsiDomain}/${roomName}`;

        const configParams = [
            `userInfo.displayName="${encodeURIComponent(myDisplayName)}"`,
            `config.prejoinPageEnabled=false`,
            `config.prejoinConfig.enabled=false`,
            `config.requireDisplayName=false`,
            `config.enableLobby=false`,
            `config.startWithAudioMuted=false`,
            `config.startWithVideoMuted=false`,
            `config.disableDeepLinking=true`,
            `config.enableClosePage=false`,
            `config.defaultLanguage="ar"`,
            `interfaceConfig.TOOLBAR_BUTTONS=['microphone','camera','desktop','tileview','hangup','select-background']`,
            `interfaceConfig.SHOW_JITSI_WATERMARK=false`,
            `interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false`,
            `interfaceConfig.SHOW_BRAND_WATERMARK=false`,
            `interfaceConfig.SHOW_POWERED_BY=false`,
            `interfaceConfig.MOBILE_APP_PROMO=false`,
            `interfaceConfig.HIDE_DEEP_LINKING_LOGO=true`,
            `interfaceConfig.SHOW_CHROME_EXTENSION_BANNER=false`,
        ].join("&");

        return {
            roomUrlWithConfig: `${base}#${configParams}`,
            bareRoomUrl: `${base}#${configParams}`,
        };
    }, [roomId, myDisplayName]);

    // Listen for hangup events from the embedded conference
    useEffect(() => {
        const handleIframeMessage = (event: MessageEvent) => {
            try {
                const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
                if (
                    data?.type === "video-conference-left" ||
                    data?.event === "video-conference-left" ||
                    data?.action === "hangup"
                ) {
                    onEndCall();
                }
            } catch {
                // Ignore non-json messages
            }
        };

        window.addEventListener("message", handleIframeMessage);
        return () => window.removeEventListener("message", handleIframeMessage);
    }, [onEndCall]);

    return (
        <div className="relative w-full h-full bg-[#031326] flex flex-col overflow-hidden select-none">
            {/* Top Bar Header */}
            <header className="h-14 flex-shrink-0 bg-[#08213D] border-b border-white/10 flex items-center justify-between px-3 sm:px-4 z-20 shadow-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onEndCall}
                        className="p-1.5 sm:p-2 rounded-xl bg-[#0D2C4F] hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
                        title={isRTL ? "مغادرة" : "Back"}
                    >
                        <svg
                            className={cn("w-4 h-4 sm:w-5 sm:h-5", isRTL && "rotate-180")}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                            />
                        </svg>
                    </button>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border border-white/20 flex items-center justify-center font-bold text-white text-xs sm:text-sm">
                        {targetDisplayName.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-white text-xs sm:text-sm font-semibold leading-tight">
                            {targetDisplayName}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] sm:text-xs text-slate-300 font-mono">
                                {formatDuration(durationSeconds)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Top Action Controls */}
                <div className="flex items-center gap-2">
                    <a
                        href={bareRoomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-[#0D2C4F] hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border border-white/10"
                        title={isRTL ? "فتح في نافذة خارجية كاملة" : "Open in External Window"}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                        <span className="hidden sm:inline">
                            {isRTL ? "نافذة خارجية" : "External Window"}
                        </span>
                    </a>

                    <button
                        onClick={onEndCall}
                        className="px-3 py-1.5 sm:px-4 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-red-600/30"
                    >
                        <svg className="w-4 h-4 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                        </svg>
                        <span>
                            {userRole === "doctor"
                                ? isRTL
                                    ? "إنهاء المكالمة"
                                    : "End Call"
                                : isRTL
                                ? "مغادرة"
                                : "Leave"}
                        </span>
                    </button>
                </div>
            </header>

            {/* Video Stage: High-Performance SFU Video Conference */}
            <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
                {!iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#08213D] text-white z-10">
                        <div className="w-10 h-10 border-3 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mb-4" />
                        <p className="text-sm font-medium text-slate-200">
                            {isRTL ? "جاري توصيل مكالمة الفيديو بالصوت والصورة..." : "Connecting high-definition video call..."}
                        </p>
                    </div>
                )}

                <iframe
                    src={roomUrlWithConfig}
                    allow="camera *; microphone *; display-capture *; autoplay *; clipboard-write *; screen-wake-lock *;"
                    className="w-full h-full border-0 absolute inset-0"
                    allowFullScreen
                    onLoad={() => setIframeLoaded(true)}
                />
            </div>
        </div>
    );
}

export default NativeWebRTCCall;
