"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { endQueueConsultation, getQueueEntryForCall, leaveQueue } from "@/app/actions/queue";

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
    const isMountedRef = useRef(true);
    const isInitializingRef = useRef(false);
    const hasJoinedRef = useRef(false); // Track if we successfully joined

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [callState, setCallState] = useState<"joining" | "joined" | "left" | "error">("joining");
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [ending, setEnding] = useState(false);
    const [participantInfo, setParticipantInfo] = useState<{
        doctorName?: string;
        patientName?: string;
    }>({});
    const [consultationEnded, setConsultationEnded] = useState(false);
    const statusPollRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch token and join call
    const initializeCall = useCallback(async () => {
        // Prevent multiple simultaneous initializations
        if (isInitializingRef.current) {
            console.log("[VideoCall] Already initializing, skipping");
            return;
        }
        isInitializingRef.current = true;
        hasJoinedRef.current = false; // Reset join status for new call

        setLoading(true);
        setError(null);

        try {
            // Small delay to let the page fully initialize (fixes race condition after navigation)
            await new Promise(resolve => setTimeout(resolve, 300));
            if (!isMountedRef.current) return;

            // First get queue entry info for participant names with retry logic
            let entryResult = await getQueueEntryForCall(queueEntryId);

            // Retry once if it fails (handles Next.js server action initialization issues)
            if (!entryResult.success && isMountedRef.current) {
                console.log("[VideoCall] First getQueueEntryForCall failed, retrying in 500ms...");
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!isMountedRef.current) return;
                entryResult = await getQueueEntryForCall(queueEntryId);
            }

            if (!isMountedRef.current) return;

            if (entryResult.success) {
                setParticipantInfo({
                    doctorName: entryResult.doctor?.full_name,
                    patientName: entryResult.patient?.full_name,
                });
            } else {
                console.error("[VideoCall] getQueueEntryForCall failed after retry:", entryResult.error);
            }

            // Fetch meeting token from API with retry logic
            console.log("[VideoCall] Fetching token for queue entry:", queueEntryId);

            const fetchTokenWithRetry = async (retryCount = 0): Promise<TokenResponse> => {
                const response = await fetch("/api/daily/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ queueEntryId }),
                });

                if (!response.ok) {
                    const errorData = await response.json();

                    // Handle room expired error specifically (410 Gone)
                    if (response.status === 410 || errorData.code === "ROOM_EXPIRED") {
                        console.log("[VideoCall] Room has expired:", errorData);
                        throw new Error(errorData.message || "Video room has expired");
                    }

                    // Retry once on certain errors (room not ready, etc.)
                    if (retryCount < 1 && (errorData.error === "Video room not created yet" || response.status === 400)) {
                        console.log("[VideoCall] Token fetch failed, retrying in 500ms...", errorData);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        if (!isMountedRef.current) throw new Error("Component unmounted");
                        return fetchTokenWithRetry(retryCount + 1);
                    }
                    console.error("[VideoCall] Token API error:", response.status, errorData);
                    throw new Error(errorData.message || errorData.error || "Failed to get meeting token");
                }

                return response.json();
            };

            const tokenData = await fetchTokenWithRetry();
            console.log("[VideoCall] Token received:", {
                roomUrl: tokenData.roomUrl,
                roomName: tokenData.roomName,
                isOwner: tokenData.isOwner,
                userName: tokenData.userName,
                tokenLength: tokenData.token?.length || 0,
            });

            if (!isMountedRef.current) return;

            // Check for existing Daily instance and destroy it safely
            try {
                const existingInstance = DailyIframe.getCallInstance();
                if (existingInstance) {
                    console.log("[VideoCall] Destroying existing Daily instance");
                    await existingInstance.destroy();
                }
            } catch (destroyErr) {
                console.warn("[VideoCall] Error destroying existing instance:", destroyErr);
                // Continue anyway - the old instance might already be invalid
            }

            if (!isMountedRef.current) return;

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

            // Add display-capture permission to the iframe for screen sharing
            // This is required for the browser to allow screen capture API
            const iframe = containerRef.current.querySelector("iframe");
            if (iframe) {
                const currentAllow = iframe.getAttribute("allow") || "";
                if (!currentAllow.includes("display-capture")) {
                    const newAllow = currentAllow ? `${currentAllow}; display-capture` : "display-capture";
                    iframe.setAttribute("allow", newAllow);
                }
            }

            callFrameRef.current = callFrame;

            // Set up event listeners with mounted check
            callFrame.on("joining-meeting", () => {
                console.log("[VideoCall] Joining meeting...");
                // Hide loading after a short delay - the iframe will show
                if (isMountedRef.current) {
                    setTimeout(() => {
                        if (isMountedRef.current && callState === "joining") {
                            setLoading(false);
                        }
                    }, 2000);
                }
            });

            callFrame.on("joined-meeting", () => {
                console.log("[VideoCall] Joined meeting successfully");
                hasJoinedRef.current = true; // Mark that we successfully joined
                if (isMountedRef.current) {
                    setCallState("joined");
                    setLoading(false);
                }
            });

            callFrame.on("left-meeting", () => {
                console.log("[VideoCall] Left meeting, hasJoined:", hasJoinedRef.current);
                if (isMountedRef.current) {
                    // Only navigate away if we were actually in a joined call
                    // Don't navigate if we hit an error during join
                    if (hasJoinedRef.current) {
                        setCallState("left");
                        handleCallEnded();
                    } else {
                        console.log("[VideoCall] Left meeting but was never joined, not navigating");
                        setCallState("left");
                    }
                }
            });

            callFrame.on("error", (event) => {
                console.error("[VideoCall] Daily error:", JSON.stringify(event, null, 2));
                console.error("[VideoCall] Daily error action:", event?.action);
                console.error("[VideoCall] Daily error msg:", event?.errorMsg);
                console.error("[VideoCall] Daily error details:", event?.error);
                if (isMountedRef.current) {
                    const errorMsg = event?.errorMsg || event?.error?.message || "Call error occurred";
                    // Check for room expired/unavailable error
                    if (errorMsg.includes("no longer available") || errorMsg.includes("room not found") || errorMsg.includes("does not exist") || errorMsg.includes("has expired")) {
                        setError(userRole === "patient"
                            ? "The video room has expired. Please wait for the doctor to restart the call."
                            : "The video room has expired. Please start the call again.");
                    } else {
                        setError(errorMsg);
                    }
                    setCallState("error");
                    setLoading(false);
                }
            });

            callFrame.on("camera-error", (event) => {
                console.warn("[VideoCall] Camera error:", event);
                // Don't set error state - just log it, call can continue without camera
            });

            callFrame.on("participant-left", (event) => {
                // If the other participant left (doctor or patient)
                if (event?.participant && !event.participant.local) {
                    console.log("[VideoCall] Other participant left:", event.participant);
                    // If patient and doctor left, the consultation is likely over
                    if (userRole === "patient") {
                        console.log("[VideoCall] Doctor left the call, checking consultation status...");
                        // Check if consultation ended
                        checkConsultationStatus();
                    }
                }
            });

            // Join with token
            console.log("[VideoCall] Joining room...");
            await callFrame.join({
                url: tokenData.roomUrl,
                token: tokenData.token,
            });

            // join() resolves when join request is sent
            // Give it a moment, then ensure UI is visible even without joined-meeting event
            console.log("[VideoCall] Join request sent, showing UI");
            if (isMountedRef.current) {
                // Small delay to let Daily initialize, then show UI
                setTimeout(() => {
                    if (isMountedRef.current && callFrameRef.current) {
                        setLoading(false);
                        setCallState("joined");
                    }
                }, 1500);
            }

        } catch (err) {
            console.error("[VideoCall] Error initializing call:", err);
            console.error("[VideoCall] Error type:", typeof err);
            console.error("[VideoCall] Error stringified:", JSON.stringify(err, null, 2));
            if (err && typeof err === 'object') {
                console.error("[VideoCall] Error keys:", Object.keys(err));
                console.error("[VideoCall] Error action:", (err as Record<string, unknown>).action);
                console.error("[VideoCall] Error errorMsg:", (err as Record<string, unknown>).errorMsg);
            }
            if (isMountedRef.current) {
                let errorMsg = "Failed to join call";
                if (err instanceof Error) {
                    errorMsg = err.message;
                } else if (err && typeof err === 'object') {
                    errorMsg = (err as Record<string, unknown>).errorMsg as string ||
                               (err as Record<string, unknown>).message as string ||
                               JSON.stringify(err);
                }
                // Check for room expired/unavailable error
                if (errorMsg.includes("no longer available") || errorMsg.includes("room not found") || errorMsg.includes("does not exist") || errorMsg.includes("has expired")) {
                    setError(userRole === "patient"
                        ? "The video room has expired. Please wait for the doctor to restart the call."
                        : "The video room has expired. Please start the call again.");
                } else {
                    setError(errorMsg);
                }
                setCallState("error");
                setLoading(false);
            }
        } finally {
            isInitializingRef.current = false;
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
            // Leave the call safely
            if (callFrameRef.current) {
                try {
                    await callFrameRef.current.leave();
                } catch (leaveErr) {
                    console.warn("[VideoCall] Error leaving call:", leaveErr);
                    // Continue anyway - we want to end the consultation
                }
            }

            // If doctor, mark consultation as completed
            if (userRole === "doctor") {
                await endQueueConsultation(queueEntryId);
            }

            handleCallEnded();
        } catch (err) {
            console.error("[VideoCall] Error ending call:", err);
            // Still navigate away even if there's an error
            handleCallEnded();
        } finally {
            if (isMountedRef.current) {
                setEnding(false);
                setShowEndConfirm(false);
            }
        }
    }, [userRole, queueEntryId, handleCallEnded]);

    // Leave call (patient) - also properly ends the queue entry
    const handleLeaveCall = useCallback(async () => {
        setEnding(true);
        try {
            // Leave the Daily call
            if (callFrameRef.current) {
                try {
                    await callFrameRef.current.leave();
                } catch (leaveErr) {
                    console.warn("[VideoCall] Error leaving call:", leaveErr);
                }
            }

            // Also update the queue entry status so patient is no longer "in queue"
            if (userRole === "patient") {
                try {
                    console.log("[VideoCall] Patient leaving - updating queue entry...");
                    await leaveQueue(queueEntryId);
                    console.log("[VideoCall] Queue entry updated successfully");
                } catch (queueErr) {
                    console.warn("[VideoCall] Error updating queue entry:", queueErr);
                    // Continue even if this fails
                }
            }

            handleCallEnded();
        } catch (err) {
            console.error("[VideoCall] Error leaving call:", err);
            handleCallEnded();
        } finally {
            if (isMountedRef.current) {
                setEnding(false);
                setShowEndConfirm(false);
            }
        }
    }, [handleCallEnded, userRole, queueEntryId]);

    // Check consultation status (for patients to detect when doctor ends the call)
    const checkConsultationStatus = useCallback(async () => {
        if (!isMountedRef.current || consultationEnded) return;

        try {
            const result = await getQueueEntryForCall(queueEntryId);
            if (!isMountedRef.current) return;

            if (result.success && result.entry) {
                console.log("[VideoCall] Status check:", result.entry.status);
                if (result.entry.status === "completed") {
                    console.log("[VideoCall] Consultation completed, redirecting...");
                    setConsultationEnded(true);
                    // Clean up and redirect
                    if (callFrameRef.current) {
                        try {
                            await callFrameRef.current.leave();
                        } catch (e) {
                            console.warn("[VideoCall] Error leaving after consultation ended:", e);
                        }
                    }
                    handleCallEnded();
                }
            }
        } catch (err) {
            console.error("[VideoCall] Error checking consultation status:", err);
        }
    }, [queueEntryId, consultationEnded, handleCallEnded]);

    // Initialize on mount - only run once
    useEffect(() => {
        // Track if this specific effect has already run
        let hasInitialized = false;

        isMountedRef.current = true;

        // Only initialize if not already initializing
        if (!isInitializingRef.current && !hasInitialized) {
            hasInitialized = true;
            initializeCall();
        }

        return () => {
            // Mark as unmounted first to prevent state updates
            isMountedRef.current = false;

            // Cleanup Daily instance on unmount
            const cleanupDaily = async () => {
                try {
                    if (callFrameRef.current) {
                        // Destroy cleans up all event listeners and the iframe
                        await callFrameRef.current.destroy();
                        callFrameRef.current = null;
                    }
                } catch (err) {
                    console.warn("[VideoCall] Error during cleanup:", err);
                }
            };

            cleanupDaily();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queueEntryId]); // Only re-run if queueEntryId changes, not when initializeCall reference changes

    // Poll for consultation status changes (for patients to detect when doctor ends the call)
    useEffect(() => {
        if (userRole !== "patient" || consultationEnded) return;

        // Start polling after joining the call
        const startPolling = () => {
            statusPollRef.current = setInterval(() => {
                if (isMountedRef.current && !consultationEnded) {
                    checkConsultationStatus();
                }
            }, 5000); // Check every 5 seconds
        };

        // Wait a bit before starting to poll
        const timeoutId = setTimeout(startPolling, 3000);

        return () => {
            clearTimeout(timeoutId);
            if (statusPollRef.current) {
                clearInterval(statusPollRef.current);
                statusPollRef.current = null;
            }
        };
    }, [userRole, consultationEnded, checkConsultationStatus]);

    // Handle back navigation
    const handleBack = () => {
        if (callState === "joined") {
            setShowEndConfirm(true);
        } else {
            handleCallEnded();
        }
    };

    return (
        <div className={cn("h-[100dvh] flex flex-col", isRTL && "rtl")}>
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
            <div className="flex-1 relative min-h-0 overflow-hidden">
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

                {/* Consultation Ended State (for patients) */}
                {consultationEnded && userRole === "patient" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10 overflow-auto">
                        <div className="text-center max-w-md mx-auto p-6 my-auto">
                            <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {isRTL ? "انتهت الاستشارة" : "Consultation Ended"}
                            </h3>
                            <p className="text-slate-400 mb-6">
                                {isRTL
                                    ? "شكراً لك. لقد أنهى الطبيب الاستشارة. يمكنك حجز استشارة جديدة في أي وقت."
                                    : "Thank you. The doctor has ended the consultation. You can book a new consultation anytime."}
                            </p>
                            <button
                                onClick={handleCallEnded}
                                className="px-6 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
                            >
                                {isRTL ? "العودة للأطباء المتاحين" : "Back to Available Doctors"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && callState === "error" && !consultationEnded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10 overflow-auto">
                        <div className="text-center max-w-md mx-auto p-6 my-auto">
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
