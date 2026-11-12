"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
    playIncomingCallRingtone,
    stopIncomingCallRingtone,
    isRingtonePlaying,
    unlockAudio,
} from "@/lib/audio/ringtone";
import {
    sendBrowserNotification,
    requestNotificationPermission,
    getNotificationPermission,
} from "@/lib/notifications/web-push";

interface IncomingCallPayload {
    id: string;
    patient_name: string;
    patient_avatar?: string;
    chief_complaint?: string;
    joined_at: string;
    payment_status: string;
}

export function DoctorCallNotifier() {
    const router = useRouter();
    const pathname = usePathname();
    const { isRTL, language } = useI18n();

    const [doctorProfileId, setDoctorProfileId] = useState<string | null>(null);
    const [incomingCall, setIncomingCall] = useState<IncomingCallPayload | null>(null);
    const [hasAudioPermission, setHasAudioPermission] = useState(false);
    const [notifPermission, setNotifPermission] = useState<string>("default");
    const [isDismissed, setIsDismissed] = useState<Record<string, boolean>>({});
    const ringingEntryIdRef = useRef<string | null>(null);

    // Don't show incoming call modal if already in an active video call room
    const isInCallPage = pathname?.includes("/urgent-care/call/") || pathname?.includes("/call/");

    // Check permissions on mount
    useEffect(() => {
        setNotifPermission(getNotificationPermission());
    }, []);

    // 1. Fetch current doctor profile ID
    useEffect(() => {
        const fetchDoctorId = async () => {
            const supabase = createBrowserSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: doc } = await supabase
                .from("doctor_profiles")
                .select("id")
                .eq("profile_id", user.id)
                .maybeSingle();

            const doctorId = (doc as { id?: string } | null)?.id;
            if (doctorId) {
                setDoctorProfileId(doctorId);
            }
        };

        fetchDoctorId();
    }, []);

    // 2. Play ringtone and trigger notifications for incoming call
    const triggerCallAlert = useCallback((call: IncomingCallPayload) => {
        // If already dismissed by doctor, skip
        if (isDismissed[call.id]) return;
        // If already in call room, skip
        if (isInCallPage) return;

        ringingEntryIdRef.current = call.id;
        setIncomingCall(call);

        // Start continuous telephone ringtone
        playIncomingCallRingtone();

        // Send native browser notification (pops on screen even if tab is minimized)
        sendBrowserNotification(
            isRTL ? "🚨 مريض عاجل في عيادة الطوارئ!" : "🚨 Urgent Patient Waiting!",
            {
                body: isRTL
                    ? `المريض ${call.patient_name || "مريض"} ينتظر استشارتك الآن.${call.chief_complaint ? ` الشكوى: ${call.chief_complaint}` : ""}`
                    : `Patient ${call.patient_name || "Patient"} is waiting for consultation.${call.chief_complaint ? ` Complaint: ${call.chief_complaint}` : ""}`,
                url: `/${language}/dashboard/doctor/urgent-care/call/${call.id}`,
                tag: `incoming-call-${call.id}`,
                requireInteraction: true,
                silent: false,
            }
        );
    }, [isDismissed, isInCallPage, isRTL, language]);

    // 3. Subscribe to Realtime Queue for this doctor
    useEffect(() => {
        if (!doctorProfileId) return;

        const supabase = createBrowserSupabaseClient();

        // Query active waiting patients
        const checkActiveQueue = async () => {
            const { data } = await supabase
                .from("consultation_queue")
                .select(`
                    id,
                    chief_complaint,
                    joined_at,
                    payment_status,
                    status,
                    patient_profiles!consultation_queue_patient_profile_id_fkey (
                        profiles!patient_profiles_profile_id_fkey (
                            full_name,
                            avatar_url
                        )
                    )
                `)
                .eq("doctor_profile_id", doctorProfileId)
                .in("status", ["waiting", "called"])
                .order("joined_at", { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const entry: any = data[0];
                const patientName = entry.patient_profiles?.profiles?.full_name || (isRTL ? "مريض عاجل" : "Urgent Patient");
                const patientAvatar = entry.patient_profiles?.profiles?.avatar_url;

                // Only ring if it's recent (within last 10 minutes)
                const isRecent = (Date.now() - new Date(entry.joined_at).getTime()) < 10 * 60 * 1000;
                if (isRecent && !isDismissed[entry.id]) {
                    triggerCallAlert({
                        id: entry.id,
                        patient_name: patientName,
                        patient_avatar: patientAvatar,
                        chief_complaint: entry.chief_complaint,
                        joined_at: entry.joined_at,
                        payment_status: entry.payment_status,
                    });
                }
            }
        };

        checkActiveQueue();

        // Realtime subscription for instant new patient arrival
        const channel = supabase
            .channel(`doctor-incoming-calls-${doctorProfileId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "consultation_queue",
                    filter: `doctor_profile_id=eq.${doctorProfileId}`,
                },
                async (payload) => {
                    console.log("[DoctorCallNotifier] New patient joined queue:", payload.new);
                    // Fetch patient details
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const newEntry = payload.new as any;
                    const { data: patData } = await supabase
                        .from("patient_profiles")
                        .select("profiles!patient_profiles_profile_id_fkey(full_name, avatar_url)")
                        .eq("id", newEntry.patient_profile_id)
                        .maybeSingle();

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const profileData = (patData as any)?.profiles;
                    triggerCallAlert({
                        id: newEntry.id,
                        patient_name: profileData?.full_name || (isRTL ? "مريض عاجل" : "Urgent Patient"),
                        patient_avatar: profileData?.avatar_url,
                        chief_complaint: newEntry.chief_complaint,
                        joined_at: newEntry.joined_at,
                        payment_status: newEntry.payment_status,
                    });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "consultation_queue",
                    filter: `doctor_profile_id=eq.${doctorProfileId}`,
                },
                (payload) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const updated = payload.new as any;
                    // If patient cancelled or consultation ended, stop ringing
                    if (["completed", "cancelled", "expired"].includes(updated.status)) {
                        if (ringingEntryIdRef.current === updated.id) {
                            stopIncomingCallRingtone();
                            setIncomingCall(null);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            stopIncomingCallRingtone();
        };
    }, [doctorProfileId, isDismissed, isRTL, triggerCallAlert]);

    // Cleanup on unmount or when entering call
    useEffect(() => {
        if (isInCallPage) {
            stopIncomingCallRingtone();
            setIncomingCall(null);
        }
    }, [isInCallPage]);

    // Handle Answer
    const handleAnswerCall = () => {
        if (!incomingCall) return;
        stopIncomingCallRingtone();
        const callUrl = `/${language}/dashboard/doctor/urgent-care/call/${incomingCall.id}`;
        setIncomingCall(null);
        router.push(callUrl);
    };

    // Handle Dismiss / Silence
    const handleDismiss = () => {
        if (!incomingCall) return;
        stopIncomingCallRingtone();
        setIsDismissed((prev) => ({ ...prev, [incomingCall.id]: true }));
        setIncomingCall(null);
    };

    // Enable Notifications & Sound Button Handler
    const handleEnableAlerts = async () => {
        await unlockAudio();
        setHasAudioPermission(true);
        const granted = await requestNotificationPermission();
        setNotifPermission(granted ? "granted" : "denied");
        // Play brief chime to confirm activation
        if (granted) {
            sendBrowserNotification(
                isRTL ? "تم تفعيل رنين المكالمات والإشعارات بنجاح! 🔔" : "Call Ringtone & Notifications Enabled!",
                { body: isRTL ? "ستصلك رنة مسموعة وتنبيه فوري عند دخول أي مريض عاجل." : "You will receive audible rings when patients join.", silent: false }
            );
        }
    };

    return (
        <>
            {/* Quick Enable Alerts Floating Pill (Shows only if permission not yet granted) */}
            {notifPermission === "default" && !isInCallPage && (
                <div className="fixed bottom-4 start-4 z-40">
                    <button
                        onClick={handleEnableAlerts}
                        className="px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-[#FD614B] text-white text-xs font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-white/20 animate-bounce"
                        title={isRTL ? "اضغط لتفعيل الرنين الصوتي للمكالمات" : "Enable incoming call ringtone"}
                    >
                        <span>🔔</span>
                        <span>{isRTL ? "تفعيل رنين المكالمات الطبية" : "Enable Call Ringtone"}</span>
                    </button>
                </div>
            )}

            {/* Incoming Call Modal Overlay */}
            <AnimatePresence>
                {incomingCall && !isInCallPage && (
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
                            {/* Ambient glowing wave */}
                            <div className="absolute -top-24 inset-x-0 h-48 bg-gradient-to-b from-cyan-500/20 to-transparent blur-3xl pointer-events-none" />

                            {/* Top Badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold mb-6 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-red-400" />
                                <span>{isRTL ? "استشارة طوارئ عاجلة واردة" : "Incoming Emergency Call"}</span>
                            </div>

                            {/* Ripple Avatar */}
                            <div className="relative mb-5 flex items-center justify-center">
                                <div className="w-28 h-28 rounded-full bg-cyan-400/15 animate-ping absolute" />
                                <div className="w-24 h-24 rounded-full bg-blue-500/25 animate-pulse absolute" />
                                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 border-2 border-white/30 shadow-2xl flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                                    {incomingCall.patient_avatar ? (
                                        <Image
                                            src={incomingCall.patient_avatar}
                                            alt={incomingCall.patient_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        incomingCall.patient_name?.charAt(0) || "👤"
                                    )}
                                </div>
                            </div>

                            {/* Patient Name */}
                            <h3 className="text-xl sm:text-2xl font-extrabold mb-1 tracking-tight text-white">
                                {incomingCall.patient_name}
                            </h3>
                            <p className="text-xs text-cyan-300 font-medium mb-4">
                                {isRTL ? "المريض بانتظار استشارتك الفورية عبر الفيديو" : "Patient waiting for immediate video consultation"}
                            </p>

                            {/* Chief Complaint Box (if available) */}
                            {incomingCall.chief_complaint && (
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 mb-6 text-start">
                                    <span className="font-semibold text-slate-400 block mb-0.5">
                                        {isRTL ? "الشكوى الطبية:" : "Chief Complaint:"}
                                    </span>
                                    <p className="line-clamp-2">{incomingCall.chief_complaint}</p>
                                </div>
                            )}

                            {/* Sound Equalizer Animation */}
                            <div className="flex items-center justify-center gap-1.5 mb-6 h-6">
                                {[0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.7].map((height, i) => (
                                    <motion.span
                                        key={i}
                                        animate={{ height: ["4px", `${height * 22}px`, "4px"] }}
                                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                                        className="w-1 bg-cyan-400 rounded-full"
                                    />
                                ))}
                                <span className="text-xs font-mono text-cyan-300 ms-2">
                                    {isRTL ? "جاري الرنين..." : "Ringing..."}
                                </span>
                            </div>

                            {/* Action Buttons: Answer vs Decline */}
                            <div className="flex items-center gap-3">
                                {/* Decline / Silence Button */}
                                <button
                                    onClick={handleDismiss}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all active:scale-95 border border-white/10 flex items-center justify-center gap-2"
                                >
                                    <span>🔕</span>
                                    <span>{isRTL ? "كتم الرنين" : "Silence"}</span>
                                </button>

                                {/* Answer Button */}
                                <button
                                    onClick={handleAnswerCall}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all active:scale-95 shadow-lg shadow-emerald-600/40 border border-emerald-400/40 flex items-center justify-center gap-2 animate-pulse"
                                >
                                    <span>📞</span>
                                    <span>{isRTL ? "رد وبدء الكشف" : "Answer Call"}</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default DoctorCallNotifier;
