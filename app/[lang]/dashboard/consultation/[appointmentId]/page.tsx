"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { getConsultationSession, endConsultation } from "@/app/actions/appointments";

// Jitsi Meet types
declare global {
    interface Window {
        JitsiMeetExternalAPI: new (domain: string, options: JitsiOptions) => JitsiAPI;
    }
}

interface JitsiOptions {
    roomName: string;
    parentNode: HTMLElement;
    width: string;
    height: string;
    configOverwrite?: Record<string, unknown>;
    interfaceConfigOverwrite?: Record<string, unknown>;
    userInfo?: {
        displayName: string;
        email?: string;
    };
}

interface JitsiAPI {
    dispose: () => void;
    executeCommand: (command: string, ...args: unknown[]) => void;
    addListener: (event: string, callback: () => void) => void;
    removeListener: (event: string, callback: () => void) => void;
}

export default function ConsultationPage() {
    const params = useParams();
    const router = useRouter();
    const { t, isRTL, language } = useI18n();

    const appointmentId = params.appointmentId as string;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [jitsiRoomId, setJitsiRoomId] = useState<string | null>(null);
    const [jitsiApi, setJitsiApi] = useState<JitsiAPI | null>(null);
    const [isEnding, setIsEnding] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);

    // Load consultation session
    useEffect(() => {
        async function loadSession() {
            setLoading(true);
            try {
                const { session, error: sessionError } = await getConsultationSession(appointmentId);

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

                setJitsiRoomId(session.jitsi_room_id);
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

    // Initialize Jitsi Meet
    useEffect(() => {
        if (!jitsiRoomId || jitsiApi) return;

        // Load Jitsi script
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;

        script.onload = () => {
            const container = document.getElementById("jitsi-container");
            if (!container || !window.JitsiMeetExternalAPI) return;

            const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
                roomName: jitsiRoomId,
                parentNode: container,
                width: "100%",
                height: "100%",
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: false,
                    disableDeepLinking: true,
                    enableWelcomePage: false,
                    enableClosePage: false,
                    defaultLanguage: language,
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    SHOW_BRAND_WATERMARK: false,
                    SHOW_CHROME_EXTENSION_BANNER: false,
                    TOOLBAR_BUTTONS: [
                        "microphone",
                        "camera",
                        "closedcaptions",
                        "desktop",
                        "fullscreen",
                        "chat",
                        "recording",
                        "settings",
                        "raisehand",
                        "videoquality",
                        "tileview",
                    ],
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                },
            });

            // Handle when participant leaves
            api.addListener("readyToClose", () => {
                setShowEndModal(true);
            });

            setJitsiApi(api);
        };

        document.body.appendChild(script);

        return () => {
            // Clean up
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [jitsiRoomId, jitsiApi, language]);

    // Clean up Jitsi on unmount
    useEffect(() => {
        return () => {
            if (jitsiApi) {
                jitsiApi.dispose();
            }
        };
    }, [jitsiApi]);

    // Handle end consultation
    const handleEndConsultation = useCallback(async () => {
        setIsEnding(true);
        try {
            const result = await endConsultation(appointmentId);
            if (result.success) {
                if (jitsiApi) {
                    jitsiApi.dispose();
                }
                // Redirect to notes page so doctor can write consultation notes
                router.push(`/${language}/dashboard/consultation/${appointmentId}/notes`);
            } else {
                setError(result.error || "Failed to end consultation");
            }
        } catch {
            setError("Failed to end consultation");
        } finally {
            setIsEnding(false);
            setShowEndModal(false);
        }
    }, [appointmentId, jitsiApi, router, language]);

    // Handle leave without ending (for patients)
    const handleLeave = useCallback(() => {
        if (jitsiApi) {
            jitsiApi.dispose();
        }
        router.push(`/${language}/dashboard/patient/appointments`);
    }, [jitsiApi, router, language]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">{t.common?.loading || "Loading consultation..."}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
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
                        className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                    >
                        {t.common?.goBack || "Go Back"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen bg-slate-950 flex flex-col", isRTL && "rtl")}>
            {/* Header */}
            <header className="h-14 bg-slate-900/80 backdrop-blur border-b border-white/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white font-medium">
                        {t.consultation?.inProgress || "Consultation in Progress"}
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

            {/* Jitsi Container */}
            <div id="jitsi-container" className="flex-1 bg-black" />

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
                            className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-white/10"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {t.consultation?.endTitle || "End Consultation?"}
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    {t.consultation?.endMessage || "Are you sure you want to end this consultation? This action cannot be undone."}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleLeave}
                                        className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
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
        </div>
    );
}
