"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { endQueueConsultation, getQueueEntryForCall } from "@/app/actions/queue";

// ============================================
// Types
// ============================================
interface QueueVideoCallProps {
    queueEntryId: string;
    userRole: "doctor" | "patient";
    language: string;
    isRTL: boolean;
    isDark?: boolean;
    onCallEnded?: () => void;
}

interface TokenResponse {
    token: string;
    roomUrl: string;
    roomName: string;
    isOwner: boolean;
    userName: string;
}

// ============================================
// Icons
// ============================================
const Icons = {
    phone: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
        </svg>
    ),
    endCall: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
        </svg>
    ),
    loading: (
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    ),
    back: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    ),
};

// ============================================
// Main Component
// ============================================
export function QueueVideoCall({
    queueEntryId,
    userRole,
    language,
    isRTL,
    isDark = true,
    onCallEnded,
}: QueueVideoCallProps) {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const callFrameRef = useRef<DailyCall | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [callState, setCallState] = useState<"joining" | "joined" | "left" | "error">("joining");
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [ending, setEnding] = useState(false);
    const [participantInfo, setParticipantInfo] = useState<{
        doctorName?: string;
        patientName?: string;
    }>({});

    // Fetch token and join call
    const initializeCall = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // First get queue entry info for participant names
            const entryResult = await getQueueEntryForCall(queueEntryId);
            if (entryResult.success) {
                setParticipantInfo({
                    doctorName: entryResult.doctor?.full_name,
                    patientName: entryResult.patient?.full_name,
                });
            }

            // Fetch meeting token from API
            const response = await fetch("/api/daily/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ queueEntryId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get meeting token");
            }

            const tokenData: TokenResponse = await response.json();

            // Check for existing Daily instance
            const existingInstance = DailyIframe.getCallInstance();
            if (existingInstance) {
                console.log("Daily: Destroying existing instance");
                await existingInstance.destroy();
            }

            // Create new call frame
            if (!containerRef.current) {
                throw new Error("Container not found");
            }

            const callFrame = DailyIframe.createFrame(containerRef.current, {
                iframeStyle: {
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "16px",
                },
                showLeaveButton: false, // We'll handle this ourselves
                showFullscreenButton: true,
            });

            callFrameRef.current = callFrame;

            // Set up event listeners
            callFrame.on("joined-meeting", () => {
                console.log("Daily: Joined meeting");
                setCallState("joined");
                setLoading(false);
            });

            callFrame.on("left-meeting", () => {
                console.log("Daily: Left meeting");
                setCallState("left");
                handleCallEnded();
            });

            callFrame.on("error", (event) => {
                console.error("Daily error:", event);
                setError(event?.errorMsg || "Call error occurred");
                setCallState("error");
            });

            callFrame.on("participant-left", (event) => {
                // If the other participant left, show a notification
                if (event?.participant && !event.participant.local) {
                    console.log("Other participant left:", event.participant);
                }
            });

            // Join with token
            await callFrame.join({
                url: tokenData.roomUrl,
                token: tokenData.token,
            });

        } catch (err) {
            console.error("Error initializing call:", err);
            setError(err instanceof Error ? err.message : "Failed to join call");
            setCallState("error");
            setLoading(false);
        }
    }, [queueEntryId]);

    // Handle call ended
    const handleCallEnded = useCallback(() => {
        if (onCallEnded) {
            onCallEnded();
        } else {
            // Default navigation based on role
            const basePath = userRole === "doctor"
                ? `/${language}/dashboard/doctor/urgent-care`
                : `/${language}/dashboard/patient/urgent-care`;
            router.push(basePath);
        }
    }, [userRole, language, router, onCallEnded]);

    // End call (doctor only)
    const handleEndCall = useCallback(async () => {
        setEnding(true);

        try {
            // Leave the call
            if (callFrameRef.current) {
                await callFrameRef.current.leave();
            }

            // If doctor, mark consultation as completed
            if (userRole === "doctor") {
                await endQueueConsultation(queueEntryId);
            }

            handleCallEnded();
        } catch (err) {
            console.error("Error ending call:", err);
            setError("Failed to end call properly");
        } finally {
            setEnding(false);
            setShowEndConfirm(false);
        }
    }, [userRole, queueEntryId, handleCallEnded]);

    // Leave call (patient)
    const handleLeaveCall = useCallback(async () => {
        try {
            if (callFrameRef.current) {
                await callFrameRef.current.leave();
            }
            handleCallEnded();
        } catch (err) {
            console.error("Error leaving call:", err);
            handleCallEnded();
        }
    }, [handleCallEnded]);

    // Initialize on mount
    useEffect(() => {
        initializeCall();

        return () => {
            // Cleanup on unmount
            if (callFrameRef.current) {
                callFrameRef.current.destroy().catch(console.error);
            }
        };
    }, [initializeCall]);

    // Handle back navigation
    const handleBack = () => {
        if (callState === "joined") {
            setShowEndConfirm(true);
        } else {
            handleCallEnded();
        }
    };

    return (
        <div className={cn("min-h-screen flex flex-col", isRTL && "rtl")}>
            {/* End Call Confirmation Modal */}
            <AnimatePresence>
                {showEndConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowEndConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={cn(
                                "rounded-2xl p-6 max-w-sm w-full",
                                isDark ? "bg-slate-800" : "bg-white"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                                {userRole === "doctor"
                                    ? (isRTL ? "إنهاء الاستشارة؟" : "End Consultation?")
                                    : (isRTL ? "مغادرة المكالمة؟" : "Leave Call?")}
                            </h3>
                            <p className={cn("mb-6", isDark ? "text-slate-400" : "text-slate-600")}>
                                {userRole === "doctor"
                                    ? (isRTL
                                        ? "سيتم إنهاء الاستشارة وتحديث حالة المريض."
                                        : "This will end the consultation and update the patient's status.")
                                    : (isRTL
                                        ? "هل أنت متأكد من رغبتك في مغادرة المكالمة؟"
                                        : "Are you sure you want to leave the call?")}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEndConfirm(false)}
                                    disabled={ending}
                                    className={cn(
                                        "flex-1 px-4 py-2 rounded-lg font-medium transition-colors",
                                        isDark
                                            ? "bg-slate-700 text-white hover:bg-slate-600"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    )}
                                >
                                    {isRTL ? "إلغاء" : "Cancel"}
                                </button>
                                <button
                                    onClick={userRole === "doctor" ? handleEndCall : handleLeaveCall}
                                    disabled={ending}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    {ending ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            <span>{isRTL ? "جاري..." : "Ending..."}</span>
                                        </>
                                    ) : (
                                        <span>
                                            {userRole === "doctor"
                                                ? (isRTL ? "إنهاء" : "End")
                                                : (isRTL ? "مغادرة" : "Leave")}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className={cn(
                "p-4 border-b flex items-center justify-between",
                isDark ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"
            )}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            isDark
                                ? "hover:bg-slate-800 text-slate-400"
                                : "hover:bg-gray-100 text-gray-600"
                        )}
                    >
                        <span className={cn(isRTL && "rotate-180 block")}>{Icons.back}</span>
                    </button>
                    <div>
                        <h1 className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>
                            {isRTL ? "استشارة فيديو" : "Video Consultation"}
                        </h1>
                        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
                            {userRole === "doctor"
                                ? (participantInfo.patientName || (isRTL ? "مريض" : "Patient"))
                                : (participantInfo.doctorName || (isRTL ? "طبيب" : "Doctor"))}
                        </p>
                    </div>
                </div>

                {/* End Call Button */}
                {callState === "joined" && (
                    <button
                        onClick={() => setShowEndConfirm(true)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                        {Icons.endCall}
                        <span className="hidden sm:inline">
                            {userRole === "doctor"
                                ? (isRTL ? "إنهاء الاستشارة" : "End Consultation")
                                : (isRTL ? "مغادرة" : "Leave")}
                        </span>
                    </button>
                )}
            </div>

            {/* Video Container */}
            <div className="flex-1 relative">
                {/* Loading State */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                        <div className="text-center">
                            {Icons.loading}
                            <p className="text-white mt-4">
                                {isRTL ? "جاري الاتصال..." : "Connecting..."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && callState === "error" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                        <div className="text-center max-w-md mx-auto p-6">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {isRTL ? "فشل الاتصال" : "Connection Failed"}
                            </h3>
                            <p className="text-slate-400 mb-6">{error}</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleCallEnded}
                                    className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
                                >
                                    {isRTL ? "العودة" : "Go Back"}
                                </button>
                                <button
                                    onClick={initializeCall}
                                    className="px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
                                >
                                    {isRTL ? "إعادة المحاولة" : "Retry"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Daily.co Container */}
                <div
                    ref={containerRef}
                    className="absolute inset-0 bg-slate-900"
                    style={{ minHeight: "400px" }}
                />
            </div>
        </div>
    );
}

export default QueueVideoCall;
