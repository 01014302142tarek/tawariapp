"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { getConsultationSession, endConsultation, getConsultationUserInfo, getAppointmentById } from "@/app/actions/appointments";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { NativeWebRTCCall } from "@/components/native-webrtc-call";
import { PrescriptionPromptModal, QuickPrescriptionForm, ReviewPromptModal } from "@/components/post-consultation";

export default function ConsultationPage() {
    const params = useParams();
    const router = useRouter();
    const { t, isRTL, language } = useI18n();

    const appointmentId = params.appointmentId as string;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [roomUrl, setRoomUrl] = useState<string | null>(null);
    const [isEnding, setIsEnding] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [userInfo, setUserInfo] = useState<{ displayName: string; email?: string; role: "doctor" | "patient" } | null>(null);
    const [callJoined, setCallJoined] = useState(false);
    const [isDark, setIsDark] = useState(false);

    // Post-call flow state
    const [postCallPhase, setPostCallPhase] = useState<"none" | "prescription_prompt" | "prescription_form" | "review_prompt">("none");
    const [patientProfileId, setPatientProfileId] = useState<string | null>(null);
    const [patientName, setPatientName] = useState<string | null>(null);
    const [doctorName, setDoctorName] = useState<string | null>(null);
    const [consultationEnded, setConsultationEnded] = useState(false);

    const callFrameRef = useRef<DailyCall | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const statusPollRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains("dark"));
        };
        
        checkDarkMode();
        
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        
        return () => observer.disconnect();
    }, []);

    // Load consultation session and user info
    useEffect(() => {
        async function loadSession() {
            setLoading(true);
            try {
                // Fetch session and user info in parallel
                const [sessionResult, userInfoResult] = await Promise.all([
                    getConsultationSession(appointmentId),
                    getConsultationUserInfo(),
                ]);

                const { session, error: sessionError } = sessionResult;

                if (sessionError) {
                    setError(sessionError);
                    return;
                }

                if (!session) {
                    setError("Consultation session not found");
                    return;
                }

                if (session.ended_at) {
                    setError("This consultation has already ended");
                    return;
                }

                // The room URL is stored in jitsi_room_id field (we'll rename this later)
                // For Daily, we store the full URL
                setRoomUrl(session.jitsi_room_id);
                setUserInfo(userInfoResult);
            } catch {
                setError("Failed to load consultation session");
            } finally {
                setLoading(false);
            }
        }

        if (appointmentId) {
            loadSession();
        }
    }, [appointmentId]);

    // Initialize Daily call
    useEffect(() => {
        // Prevent duplicate initialization
        if (!roomUrl || callFrameRef.current) return;

        // If using high-availability WebRTC fallback room
        if (roomUrl && !roomUrl.includes("daily.co")) {
            setCallJoined(true);
            return;
        }

        if (!containerRef.current) return;

        const dailyDomain = process.env.NEXT_PUBLIC_DAILY_DOMAIN;
        if (!roomUrl.startsWith("https://") && !dailyDomain) {
            setError("Video service not configured");
            return;
        }

        // Clean up any existing Daily instance (React Strict Mode / remount protection)
        try {
            const existingInstance = DailyIframe.getCallInstance();
            if (existingInstance) {
                console.log("Daily: Cleaning up existing call instance before creating new one");
                existingInstance.destroy();
            }
        } catch (destroyErr) {
            console.warn("Daily: Error cleaning up existing instance:", destroyErr);
        }

        // Construct full room URL if not already full
        const fullRoomUrl = roomUrl.startsWith("https://")
            ? roomUrl
            : `https://${dailyDomain}/${roomUrl}`;

        // Create the Daily call frame
        const callFrame = DailyIframe.createFrame(containerRef.current, {
            iframeStyle: {
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                border: "0",
                borderRadius: "0",
            },
            showLeaveButton: false, // We have our own end button
            showFullscreenButton: true,
        });

        // Set the allow attribute on the iframe for camera/microphone permissions
        const iframe = containerRef.current.querySelector("iframe");
        if (iframe) {
            iframe.setAttribute("allow", "camera; microphone; autoplay; display-capture; screen-wake-lock");
        }

        callFrameRef.current = callFrame;

        // Set up event listeners
        callFrame.on("joined-meeting", () => {
            console.log("Daily: Joined meeting");
            setCallJoined(true);
        });

        callFrame.on("left-meeting", () => {
            console.log("Daily: Left meeting");
            setShowEndModal(true);
        });

        callFrame.on("error", (event) => {
            console.error("Daily error:", event);
            // Check if the error is about room not existing (expired)
            const errorMsg = (event as { errorMsg?: string })?.errorMsg || "";
            if (errorMsg.includes("does not exist")) {
                setError("This consultation room has expired. Please start a new consultation from the appointments page.");
            } else {
                setError("Video call error. Please try again.");
            }
        });

        // Join the call
        callFrame.join({
            url: fullRoomUrl,
            userName: userInfo?.displayName || "Participant",
        }).catch((err) => {
            console.error("Failed to join Daily call:", err);
            const errorMsg = (err as { errorMsg?: string })?.errorMsg || "";
            if (errorMsg.includes("does not exist")) {
                setError("This consultation room has expired. Please start a new consultation from the appointments page.");
            } else {
                setError("Failed to join video call. Please check your connection.");
            }
        });

        return () => {
            // Cleanup on unmount
            if (callFrameRef.current) {
                callFrameRef.current.destroy();
                callFrameRef.current = null;
            }
        };
    }, [roomUrl, userInfo]);

    // Handle end consultation
    const handleEndConsultation = useCallback(async () => {
        setIsEnding(true);
        try {
            // Leave the Daily call first
            if (callFrameRef.current) {
                await callFrameRef.current.leave();
                callFrameRef.current.destroy();
                callFrameRef.current = null;
            }

            const result = await endConsultation(appointmentId);
            if (result.success) {
                setShowEndModal(false);
                setIsEnding(false);

                // For doctors, show prescription prompt instead of navigating
                if (userInfo?.role === "doctor") {
                    setPatientProfileId(result.patientProfileId || null);
                    setPatientName(result.patientName || null);
                    setPostCallPhase("prescription_prompt");
                    return; // Don't navigate yet
                }

                // For patients, navigate to appointments
                router.push(`/${language}/dashboard/patient/appointments`);
            } else {
                setError(result.error || "Failed to end consultation");
            }
        } catch {
            setError("Failed to end consultation");
        } finally {
            setIsEnding(false);
            setShowEndModal(false);
        }
    }, [appointmentId, router, language, userInfo?.role]);

    // Handle leave without ending (for patients)
    const handleLeave = useCallback(async () => {
        if (callFrameRef.current) {
            await callFrameRef.current.leave();
            callFrameRef.current.destroy();
            callFrameRef.current = null;
        }
        router.push(`/${language}/dashboard/patient/appointments`);
    }, [router, language]);

    // Post-call handlers for doctors
    const handleAddPrescription = useCallback(() => {
        setPostCallPhase("prescription_form");
    }, []);

    const handleSkipPrescription = useCallback(() => {
        // Navigate to notes page when skipping prescription
        router.push(`/${language}/dashboard/consultation/${appointmentId}/notes`);
    }, [router, language, appointmentId]);

    const handlePrescriptionSaved = useCallback(() => {
        // Navigate to notes page after saving prescription
        router.push(`/${language}/dashboard/consultation/${appointmentId}/notes`);
    }, [router, language, appointmentId]);

    const handlePrescriptionCancelled = useCallback(() => {
        // Go back to prompt
        setPostCallPhase("prescription_prompt");
    }, []);

    // Post-call handlers for patients
    const handleReviewSubmitted = useCallback(() => {
        router.push(`/${language}/dashboard/patient/appointments`);
    }, [router, language]);

    const handleSkipReview = useCallback(() => {
        router.push(`/${language}/dashboard/patient/appointments`);
    }, [router, language]);

    // Check consultation status (for patients to detect when doctor ends the call)
    const checkConsultationStatus = useCallback(async () => {
        if (!isMountedRef.current || consultationEnded) return;

        try {
            const result = await getAppointmentById(appointmentId);
            if (!isMountedRef.current) return;

            if (result.appointment?.status === "completed") {
                console.log("[Consultation] Consultation completed by doctor");
                setConsultationEnded(true);

                // Stop polling
                if (statusPollRef.current) {
                    clearInterval(statusPollRef.current);
                    statusPollRef.current = null;
                }

                // Clean up call
                if (callFrameRef.current) {
                    try {
                        await callFrameRef.current.leave();
                        callFrameRef.current.destroy();
                        callFrameRef.current = null;
                    } catch (e) {
                        console.warn("[Consultation] Error leaving after consultation ended:", e);
                    }
                }

                // Get doctor name for review modal
                const doctorFullName = result.appointment?.doctor?.full_name;
                setDoctorName(doctorFullName || null);

                // Show review modal for patient
                setPostCallPhase("review_prompt");
            }
        } catch (err) {
            console.error("[Consultation] Error checking status:", err);
        }
    }, [appointmentId, consultationEnded]);

    // Poll for consultation status changes (for patients to detect when doctor ends the call)
    useEffect(() => {
        isMountedRef.current = true;

        if (userInfo?.role !== "patient" || consultationEnded) return;

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
            isMountedRef.current = false;
            clearTimeout(timeoutId);
            if (statusPollRef.current) {
                clearInterval(statusPollRef.current);
                statusPollRef.current = null;
            }
        };
    }, [userInfo?.role, consultationEnded, checkConsultationStatus]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#031326] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#FD614B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">{t.common?.loading || "Loading consultation..."}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-[#031326] flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        {t.common?.error || "Error"}
                    </h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-[#FD614B] text-white rounded-lg hover:bg-[#E84D37] transition-colors"
                    >
                        {t.common?.goBack || "Go Back"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("h-screen bg-[#031326] flex flex-col overflow-hidden", isRTL && "rtl")}>
            {/* Header */}
            <header className="h-14 flex-shrink-0 bg-[#08213D]/80 backdrop-blur border-b border-white/10 flex items-center justify-between px-4 z-10">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-3 h-3 rounded-full",
                        callJoined ? "bg-green-500 animate-pulse" : "bg-[#FD614B] animate-pulse"
                    )} />
                    <span className="text-white font-medium">
                        {callJoined
                            ? (t.consultation?.inProgress || "Consultation in Progress")
                            : (isRTL ? "جاري الاتصال..." : "Connecting...")
                        }
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowEndModal(true)}
                        className="px-4 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                    >
                        {t.consultation?.endCall || "End Call"}
                    </button>
                </div>
            </header>

            {/* Video Container */}
            <div className="flex-1 relative bg-black">
                {roomUrl && !roomUrl.includes("daily.co") ? (
                    <NativeWebRTCCall
                        roomId={appointmentId}
                        userRole={userInfo?.role === "doctor" ? "doctor" : "patient"}
                        userName={userInfo?.displayName}
                        onEndCall={() => setShowEndModal(true)}
                        isRTL={isRTL}
                        language={language}
                    />
                ) : (
                    <div
                        ref={containerRef}
                        className="absolute inset-0"
                    />
                )}
            </div>

            {/* End Consultation Modal */}
            <AnimatePresence>
                {showEndModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={cn(
                                "rounded-2xl p-6 max-w-md w-full border",
                                isDark ? "bg-[#08213D] border-white/10" : "bg-white border-gray-200"
                            )}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                                    </svg>
                                </div>
                                <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                                    {t.consultation?.endTitle || "End Consultation?"}
                                </h3>
                                <p className={cn("mb-6", isDark ? "text-gray-400" : "text-gray-600")}>
                                    {t.consultation?.endMessage || "Are you sure you want to end this consultation? This action cannot be undone."}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleLeave}
                                        className={cn(
                                            "flex-1 px-4 py-2.5 rounded-xl transition-colors",
                                            isDark
                                                ? "bg-[#0D2C4F] text-white hover:bg-slate-700"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        )}
                                    >
                                        {t.consultation?.justLeave || "Just Leave"}
                                    </button>
                                    <button
                                        onClick={handleEndConsultation}
                                        disabled={isEnding}
                                        className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                                    >
                                        {isEnding ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                {t.common?.loading || "Loading..."}
                                            </span>
                                        ) : (
                                            t.consultation?.endAndComplete || "End & Complete"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Post-Consultation Modals */}

            {/* Doctor: Prescription Prompt */}
            {userInfo?.role === "doctor" && (
                <PrescriptionPromptModal
                    isOpen={postCallPhase === "prescription_prompt"}
                    patientName={patientName || (isRTL ? "المريض" : "Patient")}
                    isDark={isDark}
                    isRTL={isRTL}
                    onAddPrescription={handleAddPrescription}
                    onSkip={handleSkipPrescription}
                />
            )}

            {/* Doctor: Prescription Form */}
            {userInfo?.role === "doctor" && patientProfileId && (
                <QuickPrescriptionForm
                    isOpen={postCallPhase === "prescription_form"}
                    patientProfileId={patientProfileId}
                    patientName={patientName || (isRTL ? "المريض" : "Patient")}
                    appointmentId={appointmentId}
                    isDark={isDark}
                    isRTL={isRTL}
                    onSuccess={handlePrescriptionSaved}
                    onCancel={handlePrescriptionCancelled}
                />
            )}

            {/* Patient: Review Modal */}
            {userInfo?.role === "patient" && consultationEnded && (
                <ReviewPromptModal
                    isOpen={postCallPhase === "review_prompt"}
                    doctorName={doctorName || (isRTL ? "الطبيب" : "Doctor")}
                    appointmentId={appointmentId}
                    isDark={isDark}
                    isRTL={isRTL}
                    onSuccess={handleReviewSubmitted}
                    onSkip={handleSkipReview}
                />
            )}
        </div>
    );
}
