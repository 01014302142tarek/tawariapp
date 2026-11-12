"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { endQueueConsultation, getQueueEntryForCall, leaveQueue } from "@/app/actions/queue";
import { PrescriptionPromptModal, QuickPrescriptionForm, ReviewPromptModal } from "@/components/post-consultation";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import { NativeWebRTCCall } from "@/components/native-webrtc-call";
import { QueueChat } from "@/components/queue-chat";

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
    const showingPostCallRef = useRef(false); // Prevent auto-navigation when showing post-call modals

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [callState, setCallState] = useState<"joining" | "joined" | "left" | "error">("joining");
    const [webrtcUrl, setWebrtcUrl] = useState<string | null>(null);
    const [webrtcUserName, setWebrtcUserName] = useState<string>("");
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [ending, setEnding] = useState(false);
    const [participantInfo, setParticipantInfo] = useState<{
        doctorName?: string;
        patientName?: string;
    }>({});
    const [messagingInfo, setMessagingInfo] = useState<{
        currentProfileId?: string;
        recipientProfileId?: string;
        recipientName?: string;
        recipientAvatar?: string;
    }>({});
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [callDurationSeconds, setCallDurationSeconds] = useState(0);
    const [consultationEnded, setConsultationEnded] = useState(false);
    const statusPollRef = useRef<NodeJS.Timeout | null>(null);

    // Call duration timer
    useEffect(() => {
        if (callState !== "joined") return;
        const interval = setInterval(() => {
            setCallDurationSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [callState]);

    const formatCallDuration = (totalSec: number) => {
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // Listen for hangup events from the embedded video conference iframe
    useEffect(() => {
        const handleIframeMessage = (event: MessageEvent) => {
            try {
                const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
                if (
                    data?.type === "video-conference-left" ||
                    data?.event === "video-conference-left" ||
                    data?.action === "hangup"
                ) {
                    setShowEndConfirm(true);
                }
            } catch {
                // Ignore non-JSON messages
            }
        };

        window.addEventListener("message", handleIframeMessage);
        return () => window.removeEventListener("message", handleIframeMessage);
    }, []);

    // Post-consultation flow state
    const [postCallPhase, setPostCallPhase] = useState<"none" | "prescription_prompt" | "prescription_form" | "review_prompt">("none");
    const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);
    const [patientProfileId, setPatientProfileId] = useState<string | null>(null);

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

    // Check consultation status (for patients to detect when doctor ends the call)
    const checkConsultationStatus = useCallback(async () => {
        if (!isMountedRef.current || consultationEnded) return;

        try {
            const result = await getQueueEntryForCall(queueEntryId);
            if (!isMountedRef.current) return;

            if (result.success && result.entry) {
                console.log("[VideoCall] Status check:", result.entry.status);
                if (result.entry.status === "completed") {
                    console.log("[VideoCall] Consultation completed by doctor");
                    setConsultationEnded(true);

                    // If appointment ID is available, show review modal
                    if (result.entry.appointment_id) {
                        console.log("[VideoCall] Appointment ID found, showing review modal:", result.entry.appointment_id);
                        // Set flag BEFORE leaving call to prevent auto-navigation
                        showingPostCallRef.current = true;
                        setCreatedAppointmentId(result.entry.appointment_id);
                        setPostCallPhase("review_prompt");
                    }

                    // Clean up call AFTER setting modal state
                    if (callFrameRef.current) {
                        try {
                            await callFrameRef.current.leave();
                        } catch (e) {
                            console.warn("[VideoCall] Error leaving after consultation ended:", e);
                        }
                    }

                    // Only navigate if no modal to show (no appointment ID)
                    if (!result.entry.appointment_id) {
                        handleCallEnded();
                    }
                }
            }
        } catch (err) {
            console.error("[VideoCall] Error checking consultation status:", err);
        }
    }, [queueEntryId, consultationEnded, handleCallEnded]);

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
                const isDoctor = userRole === "doctor";
                const recipientProfileId = isDoctor
                    ? entryResult.patient?.messaging_profile_id
                    : entryResult.doctor?.messaging_profile_id;
                const recipientName = isDoctor
                    ? (entryResult.patient?.full_name || (isRTL ? "المريض" : "Patient"))
                    : (entryResult.doctor?.full_name || (isRTL ? "الطبيب" : "Doctor"));
                const recipientAvatar = isDoctor
                    ? entryResult.patient?.avatar_url
                    : entryResult.doctor?.avatar_url;

                setParticipantInfo({
                    doctorName: entryResult.doctor?.full_name,
                    patientName: entryResult.patient?.full_name,
                });
                setMessagingInfo({
                    currentProfileId: entryResult.userMessagingProfileId,
                    recipientProfileId,
                    recipientName,
                    recipientAvatar,
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

            // Handle high-availability WebRTC room (relayed through SFU videobridge)
            if (tokenData.roomUrl && !tokenData.roomUrl.includes("daily.co")) {
                const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "fairmeeting.net";
                let effectiveUrl = tokenData.roomUrl.replace("meet.jit.si", jitsiDomain);
                const [cleanBase] = effectiveUrl.split("#");
                const participantDisplayName = tokenData.userName || (userRole === "doctor" ? (isRTL ? "طبيب معتمد" : "Doctor") : (isRTL ? "المريض" : "Patient"));
                const configParams = [
                    `userInfo.displayName="${encodeURIComponent(participantDisplayName)}"`,
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

                const finalWebRtcUrl = `${cleanBase}#${configParams}`;
                console.log("[VideoCall] Using WebRTC room:", finalWebRtcUrl);
                setWebrtcUrl(finalWebRtcUrl);
                setWebrtcUserName(participantDisplayName);
                hasJoinedRef.current = true;
                setCallState("joined");
                setLoading(false);
                return;
            }

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
                console.log("[VideoCall] Left meeting, hasJoined:", hasJoinedRef.current, "showingPostCall:", showingPostCallRef.current);
                if (isMountedRef.current) {
                    setCallState("left");
                    // Only navigate away if we were actually in a joined call
                    // AND we're not showing post-call modals (prescription/review)
                    if (hasJoinedRef.current && !showingPostCallRef.current) {
                        handleCallEnded();
                    } else if (!hasJoinedRef.current) {
                        console.log("[VideoCall] Left meeting but was never joined, not navigating");
                    } else {
                        console.log("[VideoCall] Left meeting but showing post-call modal, not navigating");
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
    }, [queueEntryId, callState, checkConsultationStatus, handleCallEnded, userRole]);

    // End call (doctor only)
    const handleEndCall = useCallback(async () => {
        console.log("[VideoCall] handleEndCall started, userRole:", userRole);
        setEnding(true);

        try {
            // If doctor, mark consultation as completed FIRST (before leaving call)
            // This ensures we get the appointment ID and can show the prescription modal
            if (userRole === "doctor") {
                console.log("[VideoCall] Doctor ending call, calling endQueueConsultation...");
                const result = await endQueueConsultation(queueEntryId);
                console.log("[VideoCall] endQueueConsultation result:", result);

                if (result.success) {
                    console.log("[VideoCall] Consultation ended successfully, setting up prescription modal");
                    // Set flag BEFORE leaving call to prevent auto-navigation
                    showingPostCallRef.current = true;
                    console.log("[VideoCall] showingPostCallRef set to true");

                    // Store IDs for prescription creation
                    setCreatedAppointmentId(result.appointmentId || null);
                    setPatientProfileId(result.patientProfileId || null);
                    console.log("[VideoCall] IDs set - appointmentId:", result.appointmentId, "patientProfileId:", result.patientProfileId);

                    // Show prescription prompt
                    setPostCallPhase("prescription_prompt");
                    console.log("[VideoCall] postCallPhase set to prescription_prompt");

                    // NOW leave the call (won't navigate due to flag)
                    if (callFrameRef.current) {
                        try {
                            console.log("[VideoCall] Leaving Daily call...");
                            await callFrameRef.current.leave();
                            console.log("[VideoCall] Left Daily call successfully");
                        } catch (leaveErr) {
                            console.warn("[VideoCall] Error leaving call:", leaveErr);
                        }
                    }

                    setEnding(false);
                    setShowEndConfirm(false);
                    console.log("[VideoCall] handleEndCall complete, modal should be visible now");
                    return; // Don't navigate - showing prescription modal
                } else {
                    console.error("[VideoCall] endQueueConsultation failed:", result.error);
                }
            }

            // Only reach here on error or non-doctor - leave and navigate
            console.log("[VideoCall] Falling through to navigation (error or non-doctor)");
            if (callFrameRef.current) {
                try {
                    await callFrameRef.current.leave();
                } catch (leaveErr) {
                    console.warn("[VideoCall] Error leaving call:", leaveErr);
                }
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

    // Prescription flow handlers (doctor)
    const handleAddPrescription = useCallback(() => {
        setPostCallPhase("prescription_form");
    }, []);

    const handleSkipPrescription = useCallback(() => {
        showingPostCallRef.current = false;
        handleCallEnded();
    }, [handleCallEnded]);

    const handlePrescriptionSaved = useCallback(() => {
        showingPostCallRef.current = false;
        handleCallEnded();
    }, [handleCallEnded]);

    const handlePrescriptionCancelled = useCallback(() => {
        // Go back to prompt or skip
        setPostCallPhase("prescription_prompt");
    }, []);

    // Review flow handlers (patient)
    const handleReviewSubmitted = useCallback(() => {
        showingPostCallRef.current = false;
        handleCallEnded();
    }, [handleCallEnded]);

    const handleSkipReview = useCallback(() => {
        showingPostCallRef.current = false;
        handleCallEnded();
    }, [handleCallEnded]);

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

    // Use Supabase Realtime for instant notification when doctor ends the call
    // Falls back to polling every 15 seconds as a safety net
    useEffect(() => {
        if (userRole !== "patient" || consultationEnded) return;

        const supabase = createBrowserSupabaseClient();

        // Subscribe to realtime changes on this queue entry
        const channel = supabase
            .channel(`queue-status-${queueEntryId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "consultation_queue",
                    filter: `id=eq.${queueEntryId}`,
                },
                (payload) => {
                    console.log("[VideoCall] Realtime update received:", payload.new);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if ((payload.new as any).status === "completed") {
                        checkConsultationStatus();
                    }
                }
            )
            .subscribe((status) => {
                console.log("[VideoCall] Realtime subscription status:", status);
            });

        // Also keep polling as fallback (but less frequently - every 15 seconds)
        const startPolling = () => {
            statusPollRef.current = setInterval(() => {
                if (isMountedRef.current && !consultationEnded) {
                    checkConsultationStatus();
                }
            }, 15000); // Fallback check every 15 seconds
        };

        // Wait a bit before starting to poll
        const timeoutId = setTimeout(startPolling, 5000);

        return () => {
            clearTimeout(timeoutId);
            if (statusPollRef.current) {
                clearInterval(statusPollRef.current);
                statusPollRef.current = null;
            }
            supabase.removeChannel(channel);
        };
    }, [userRole, consultationEnded, checkConsultationStatus, queueEntryId]);

    // Handle back navigation
    const handleBack = () => {
        if (callState === "joined") {
            setShowEndConfirm(true);
        } else {
            handleCallEnded();
        }
    };

    // Debug: log render state
    console.log("[VideoCall] Render state:", {
        userRole,
        postCallPhase,
        consultationEnded,
        createdAppointmentId,
        patientProfileId,
        callState,
        showingPostCall: showingPostCallRef.current,
    });

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
                                isDark ? "bg-[#0D2C4F]" : "bg-white"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                                {userRole === "doctor"
                                    ? (isRTL ? "إكمال الاستشارة؟" : "Complete Consultation?")
                                    : (isRTL ? "مغادرة المكالمة؟" : "Leave Call?")}
                            </h3>
                            <p className={cn("mb-6", isDark ? "text-slate-400" : "text-slate-600")}>
                                {userRole === "doctor"
                                    ? (isRTL
                                        ? "سيتم إكمال الاستشارة وتحديث حالة المريض."
                                        : "This will complete the consultation and update the patient's status.")
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
                                            <span>{isRTL ? "جاري..." : "Completing..."}</span>
                                        </>
                                    ) : (
                                        <span>
                                            {userRole === "doctor"
                                                ? (isRTL ? "إكمال" : "Complete")
                                                : (isRTL ? "مغادرة" : "Leave")}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header (shown during connecting / error states) */}
            {callState !== "joined" && (
                <div className={cn(
                    "p-3 sm:p-4 border-b flex items-center justify-between z-20",
                    isDark ? "bg-[#08213D] border-white/10" : "bg-white border-gray-200"
                )}>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                isDark
                                    ? "hover:bg-[#0D2C4F] text-slate-400"
                                    : "hover:bg-gray-100 text-gray-600"
                            )}
                        >
                            <span className={cn(isRTL && "rotate-180 block")}>{Icons.back}</span>
                        </button>
                        <div>
                            <h1 className={cn("font-semibold text-sm sm:text-base", isDark ? "text-white" : "text-slate-900")}>
                                {isRTL ? "استشارة فيديو عاجلة" : "Urgent Video Consultation"}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-600")}>
                                    {userRole === "doctor"
                                        ? (participantInfo.patientName || (isRTL ? "المريض" : "Patient"))
                                        : (participantInfo.doctorName || (isRTL ? "الطبيب" : "Doctor"))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Container */}
            <div className="flex-1 relative min-h-0 overflow-hidden">
                {/* Loading State */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#08213D] z-10">
                        <div className="text-center">
                            {Icons.loading}
                            <p className="text-white mt-4">
                                {isRTL ? "جاري الاتصال..." : "Connecting..."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Consultation Ended State (for patients) - Show review modal if appointment ID available */}
                {consultationEnded && userRole === "patient" && postCallPhase !== "review_prompt" && !createdAppointmentId && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#08213D] z-10 overflow-auto">
                        <div className="text-center max-w-md mx-auto p-6 my-auto">
                            <div className="w-16 h-16 rounded-full bg-[#FD614B]/10 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#FD614B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                className="px-6 py-2 bg-[#FD614B] text-white rounded-lg font-medium hover:bg-[#E84D37] transition-colors"
                            >
                                {isRTL ? "العودة للأطباء المتاحين" : "Back to Available Doctors"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && callState === "error" && !consultationEnded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#08213D] z-10 overflow-auto">
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
                                    className="px-4 py-2 bg-[#FD614B] text-white rounded-lg font-medium hover:bg-[#E84D37] transition-colors"
                                >
                                    {isRTL ? "إعادة المحاولة" : "Retry"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Native In-House WebRTC Call Room (100% In-App, Zero External Dependencies) */}
                {callState === "joined" && (
                    <div
                        className="w-full h-full absolute inset-0 bg-slate-950"
                        style={{
                            display: postCallPhase !== "none" ? "none" : "block",
                        }}
                    >
                        <NativeWebRTCCall
                            roomId={queueEntryId}
                            userRole={userRole}
                            userName={userRole === "doctor" ? participantInfo.doctorName : participantInfo.patientName}
                            remoteUserName={userRole === "doctor" ? participantInfo.patientName : participantInfo.doctorName}
                            remoteUserAvatar={messagingInfo.recipientAvatar}
                            currentProfileId={messagingInfo.currentProfileId}
                            recipientProfileId={messagingInfo.recipientProfileId}
                            onEndCall={() => {
                                if (userRole === "doctor") {
                                    handleEndCall();
                                } else {
                                    handleLeaveCall();
                                }
                            }}
                            isRTL={isRTL}
                            language={language}
                            isDark={isDark}
                        />
                    </div>
                )}
            </div>

            {/* Post-Consultation Modals */}

            {/* Doctor: Prescription Prompt */}
            {userRole === "doctor" && (
                <PrescriptionPromptModal
                    isOpen={postCallPhase === "prescription_prompt"}
                    patientName={participantInfo.patientName || (isRTL ? "المريض" : "Patient")}
                    isDark={isDark}
                    isRTL={isRTL}
                    onAddPrescription={handleAddPrescription}
                    onSkip={handleSkipPrescription}
                />
            )}

            {/* Doctor: Prescription Form */}
            {userRole === "doctor" && patientProfileId && (
                <QuickPrescriptionForm
                    isOpen={postCallPhase === "prescription_form"}
                    patientProfileId={patientProfileId}
                    patientName={participantInfo.patientName || (isRTL ? "المريض" : "Patient")}
                    appointmentId={createdAppointmentId || undefined}
                    isDark={isDark}
                    isRTL={isRTL}
                    onSuccess={handlePrescriptionSaved}
                    onCancel={handlePrescriptionCancelled}
                />
            )}

            {/* Patient: Review Modal */}
            {userRole === "patient" && consultationEnded && createdAppointmentId && (
                <ReviewPromptModal
                    isOpen={postCallPhase === "review_prompt" || (consultationEnded && !!createdAppointmentId)}
                    doctorName={participantInfo.doctorName || (isRTL ? "الطبيب" : "Doctor")}
                    appointmentId={createdAppointmentId}
                    isDark={isDark}
                    isRTL={isRTL}
                    onSuccess={handleReviewSubmitted}
                    onSkip={handleSkipReview}
                />
            )}
        </div>
    );
}

export default QueueVideoCall;
