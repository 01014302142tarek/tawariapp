"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/app/i18n";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
    playIncomingCallRingtone,
    stopIncomingCallRingtone,
    unlockAudio,
} from "@/lib/audio/ringtone";
import {
    sendBrowserNotification,
    requestNotificationPermission,
    getNotificationPermission,
} from "@/lib/notifications/web-push";

interface PatientCallAlert {
    queueEntryId: string;
    doctorName: string;
    doctorAvatar?: string;
    specialty?: string;
}

export function PatientCallNotifier() {
    const router = useRouter();
    const pathname = usePathname();
    const { isRTL, language } = useI18n();

    const [alert, setAlert] = useState<PatientCallAlert | null>(null);
    const [notifPermission, setNotifPermission] = useState<string>("default");
    const alertedEntryIdRef = useRef<string | null>(null);

    // Skip if already inside a live video call room
    const isInCallPage = pathname?.includes("/urgent-care/call/") || pathname?.includes("/call/");

    useEffect(() => {
        setNotifPermission(getNotificationPermission());
    }, []);

    useEffect(() => {
        if (isInCallPage) {
            stopIncomingCallRingtone();
            setAlert(null);
            return;
        }

        const supabase = createBrowserSupabaseClient();

        // Subscribe to patient's consultation_queue status updates
        const setupListener = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get patient profile ID
            const { data: pat } = await supabase
                .from("patient_profiles")
                .select("id")
                .eq("profile_id", user.id)
                .maybeSingle();

            const patientId = (pat as { id?: string } | null)?.id;
            if (!patientId) return;

            const channel = supabase
                .channel(`patient-incoming-call-${patientId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "consultation_queue",
                        filter: `patient_profile_id=eq.${patientId}`,
                    },
                    async (payload) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const updated = payload.new as any;
                        if ((updated.status === "called" || updated.status === "in_consultation") && alertedEntryIdRef.current !== updated.id) {
                            alertedEntryIdRef.current = updated.id;

                            // Fetch doctor details
                            const { data: docData } = await supabase
                                .from("doctor_profiles")
                                .select("profiles!doctor_profiles_profile_id_fkey(full_name, avatar_url)")
                                .eq("id", updated.doctor_profile_id)
                                .maybeSingle();

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const docProfile = (docData as any)?.profiles;
                            const docName = docProfile?.full_name || (isRTL ? "الطبيب المعالج" : "Your Doctor");

                            // Start Ringtone & Push Notification
                            playIncomingCallRingtone();
                            sendBrowserNotification(
                                isRTL ? "🩺 حان دورك الآن مع الدكتور!" : "🩺 Doctor is Ready for You!",
                                {
                                    body: isRTL
                                        ? `د. ${docName} يدعوك لبدء مكالمة الفيديو الفورية الآن.`
                                        : `Dr. ${docName} is calling you for your consultation now.`,
                                    url: `/${language}/dashboard/patient/urgent-care/call/${updated.id}`,
                                    tag: `patient-call-${updated.id}`,
                                    requireInteraction: true,
                                }
                            );

                            setAlert({
                                queueEntryId: updated.id,
                                doctorName: docName,
                                doctorAvatar: docProfile?.avatar_url,
                            });
                        } else if (["completed", "cancelled", "expired"].includes(updated.status)) {
                            stopIncomingCallRingtone();
                            setAlert(null);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupListener();

        return () => {
            stopIncomingCallRingtone();
        };
    }, [isInCallPage, isRTL, language]);

    const handleEnterCall = () => {
        if (!alert) return;
        stopIncomingCallRingtone();
        const callUrl = `/${language}/dashboard/patient/urgent-care/call/${alert.queueEntryId}`;
        setAlert(null);
        router.push(callUrl);
    };

    const handleDismiss = () => {
        stopIncomingCallRingtone();
        setAlert(null);
    };

    const handleEnableAlerts = async () => {
        await unlockAudio();
        const granted = await requestNotificationPermission();
        setNotifPermission(granted ? "granted" : "denied");
        if (granted) {
            sendBrowserNotification(
                isRTL ? "تم تفعيل رنين وإشعارات الاستشارة الطبية! 🔔" : "Consultation Alerts Enabled!",
                { body: isRTL ? "ستصلك رنة وتنبيه فوري عند جهوزية الدكتور لمكالمتك." : "You will receive a call alert when the doctor is ready.", silent: false }
            );
        }
    };

    return (
        <>
            {/* Quick Enable Alerts Floating Pill */}
            {notifPermission === "default" && !isInCallPage && (
                <div className="fixed bottom-4 start-4 z-40">
                    <button
                        onClick={handleEnableAlerts}
                        className="px-3.5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-white/20"
                        title={isRTL ? "اضغط لتفعيل تنبيهات ورنين المكالمة" : "Enable consultation call alerts"}
                    >
                        <span>🔔</span>
                        <span>{isRTL ? "تفعيل تنبيهات ورنين المكالمة" : "Enable Consultation Alerts"}</span>
                    </button>
                </div>
            )}

            {/* Incoming Call Modal for Patient */}
            <AnimatePresence>
                {alert && !isInCallPage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none"
                    >
                        <motion.div
                            initial={{ scale: 0.85, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.85, y: 30 }}
                            className="w-full max-w-md bg-gradient-to-b from-[#08213D] to-slate-950 border border-white/20 rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl relative overflow-hidden"
                        >
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold mb-6 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span>{isRTL ? "الدكتور بانتظارك في غرفة الكشف الآن" : "Doctor is Ready in Call Room"}</span>
                            </div>

                            <div className="relative mb-5 flex items-center justify-center">
                                <div className="w-28 h-28 rounded-full bg-emerald-400/20 animate-ping absolute" />
                                <div className="w-24 h-24 rounded-full bg-cyan-500/25 animate-pulse absolute" />
                                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 border-2 border-white/30 shadow-2xl flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                                    {alert.doctorAvatar ? (
                                        <Image
                                            src={alert.doctorAvatar}
                                            alt={alert.doctorName}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        alert.doctorName?.charAt(0) || "🩺"
                                    )}
                                </div>
                            </div>

                            <h3 className="text-xl sm:text-2xl font-extrabold mb-1 text-white">
                                {alert.doctorName}
                            </h3>
                            <p className="text-xs text-emerald-300 font-medium mb-6">
                                {isRTL ? "طبيب معتمد - عيادة الطوارئ الفورية" : "Verified Doctor - Urgent Care"}
                            </p>

                            <div className="flex items-center justify-center gap-1.5 mb-6 h-6">
                                {[0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.7].map((height, i) => (
                                    <motion.span
                                        key={i}
                                        animate={{ height: ["4px", `${height * 22}px`, "4px"] }}
                                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                                        className="w-1 bg-emerald-400 rounded-full"
                                    />
                                ))}
                                <span className="text-xs font-mono text-emerald-300 ms-2">
                                    {isRTL ? "المكالمة جاهزة..." : "Ready to join..."}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDismiss}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all active:scale-95 border border-white/10"
                                >
                                    {isRTL ? "إغلاق" : "Dismiss"}
                                </button>
                                <button
                                    onClick={handleEnterCall}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all active:scale-95 shadow-lg shadow-emerald-600/40 border border-emerald-400/40 flex items-center justify-center gap-2 animate-pulse"
                                >
                                    <span>📞</span>
                                    <span>{isRTL ? "دخول المكالمة الآن" : "Join Call Now"}</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default PatientCallNotifier;
