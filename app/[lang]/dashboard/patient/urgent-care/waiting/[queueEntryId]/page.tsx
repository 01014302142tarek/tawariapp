"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { leaveQueue, getQueueEntryForCall } from "@/app/actions/queue";
import { useMyQueuePosition } from "@/lib/hooks/useQueueRealtime";

// ============================================
// Icons
// ============================================
const Icons = {
    back: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    ),
    clock: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    video: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    phone: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0l6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z" />
        </svg>
    ),
    logout: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
    ),
    check: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    loading: (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    ),
};

// ============================================
// Helper Functions
// ============================================
const getInitials = (name: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatWaitTime = (minutes: number): string => {
    if (minutes === 0) return "Any moment now";
    if (minutes < 60) return `~${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `~${hours}h ${mins}m`;
};

// ============================================
// Animated Queue Position
// ============================================
const AnimatedPosition: React.FC<{ position: number }> = ({ position }) => {
    return (
        <motion.div
            key={position}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-bold bg-gradient-to-br from-teal-400 to-cyan-400 bg-clip-text text-transparent"
        >
            #{position}
        </motion.div>
    );
};

// ============================================
// Pulsing Dot Animation
// ============================================
const PulsingDot: React.FC<{ color?: string }> = ({ color = "bg-teal-500" }) => {
    return (
        <span className="relative flex h-3 w-3">
            <span className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                color
            )} />
            <span className={cn(
                "relative inline-flex rounded-full h-3 w-3",
                color
            )} />
        </span>
    );
};

// ============================================
// Main Page Component
// ============================================
export default function WaitingRoomPage() {
    const router = useRouter();
    const params = useParams();
    const { isRTL, language } = useI18n();

    const queueEntryId = params.queueEntryId as string;

    const [doctorInfo, setDoctorInfo] = useState<{
        full_name: string;
        avatar_url?: string;
        specialty: string[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [leaving, setLeaving] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Real-time queue position updates
    const { entry, isConnected } = useMyQueuePosition(queueEntryId);

    // Calculate estimated wait time
    const estimatedWaitMinutes = entry ? (entry.position - 1) * 15 : 0; // Default 15 min per patient

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const result = await getQueueEntryForCall(queueEntryId);
                if (result.success && result.doctor) {
                    setDoctorInfo({
                        full_name: result.doctor.full_name,
                        avatar_url: result.doctor.avatar_url,
                        specialty: result.doctor.specialty || [],
                    });
                } else {
                    setError(result.error || (isRTL ? "لم يتم العثور على الطلب" : "Queue entry not found"));
                }
            } catch (err) {
                console.error("Error loading data:", err);
                setError(isRTL ? "حدث خطأ في تحميل البيانات" : "Error loading data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [queueEntryId, isRTL]);

    // Handle status changes - redirect when called or in_consultation
    useEffect(() => {
        if (entry) {
            if (entry.status === "in_consultation" && entry.daily_room_url) {
                // Room is ready - redirect to video call
                router.push(`/${language}/dashboard/patient/urgent-care/call/${queueEntryId}`);
            } else if (entry.status === "completed") {
                // Consultation ended - go back to urgent care
                router.push(`/${language}/dashboard/patient/urgent-care`);
            } else if (entry.status === "cancelled" || entry.status === "expired") {
                // Queue entry cancelled - go back
                router.push(`/${language}/dashboard/patient/urgent-care`);
            }
            // Note: When status is "called", we stay on waiting room until room is created
        }
    }, [entry, queueEntryId, language, router]);

    // Handle leave queue
    const handleLeaveQueue = useCallback(async () => {
        setLeaving(true);
        try {
            const result = await leaveQueue(queueEntryId);
            if (result.success) {
                router.push(`/${language}/dashboard/patient/urgent-care`);
            } else {
                setError(result.error || (isRTL ? "حدث خطأ" : "An error occurred"));
                setShowLeaveConfirm(false);
            }
        } catch (err) {
            console.error("Error leaving queue:", err);
            setError(isRTL ? "حدث خطأ" : "An error occurred");
            setShowLeaveConfirm(false);
        } finally {
            setLeaving(false);
        }
    }, [queueEntryId, language, router, isRTL]);

    // Handle back navigation
    const handleBack = () => {
        router.push(`/${language}/dashboard/patient/urgent-care`);
    };

    // Loading state
    if (loading) {
        return (
            <div className={cn("min-h-screen p-6 flex items-center justify-center", isRTL && "rtl")}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">
                        {isRTL ? "جاري التحميل..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !entry) {
        return (
            <div className={cn("min-h-screen p-6", isRTL && "rtl")}>
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <span className={cn(isRTL && "rotate-180")}>{Icons.back}</span>
                    <span>{isRTL ? "العودة" : "Back"}</span>
                </button>

                <div className="max-w-md mx-auto text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        {isRTL ? "لم يتم العثور على الطلب" : "Queue Entry Not Found"}
                    </h2>
                    <p className="text-slate-400 mb-6">
                        {error || (isRTL ? "ربما انتهت صلاحية الطلب" : "This queue entry may have expired")}
                    </p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
                    >
                        {isRTL ? "العودة للأطباء المتاحين" : "Back to Available Doctors"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen p-6", isRTL && "rtl")}>
            {/* Leave Queue Confirmation Modal */}
            <AnimatePresence>
                {showLeaveConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowLeaveConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {isRTL ? "مغادرة القائمة؟" : "Leave Queue?"}
                            </h3>
                            <p className="text-slate-400 mb-6">
                                {isRTL
                                    ? "هل أنت متأكد من رغبتك في مغادرة قائمة الانتظار؟ ستفقد موقعك الحالي."
                                    : "Are you sure you want to leave the queue? You will lose your current position."}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLeaveConfirm(false)}
                                    disabled={leaving}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
                                >
                                    {isRTL ? "إلغاء" : "Cancel"}
                                </button>
                                <button
                                    onClick={handleLeaveQueue}
                                    disabled={leaving}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    {leaving ? (
                                        <>
                                            {Icons.loading}
                                            <span>{isRTL ? "جاري..." : "Leaving..."}</span>
                                        </>
                                    ) : (
                                        <span>{isRTL ? "مغادرة" : "Leave"}</span>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-xl mx-auto">
                {/* Header with Connection Status */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-xl font-semibold text-white">
                        {isRTL ? "غرفة الانتظار" : "Waiting Room"}
                    </h1>
                    <div className="flex items-center gap-2 text-sm">
                        <PulsingDot color={isConnected ? "bg-green-500" : "bg-amber-500"} />
                        <span className="text-slate-400">
                            {isConnected ? (isRTL ? "متصل" : "Connected") : (isRTL ? "جاري الاتصال..." : "Connecting...")}
                        </span>
                    </div>
                </div>

                {/* Main Waiting Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 text-center mb-6"
                >
                    {/* Position Display */}
                    <div className="mb-6">
                        <p className="text-slate-400 mb-2">
                            {isRTL ? "موقعك في القائمة" : "Your position in queue"}
                        </p>
                        <AnimatedPosition position={entry.position} />
                    </div>

                    {/* Wait Time */}
                    <div className="flex items-center justify-center gap-2 text-slate-300 mb-8">
                        {Icons.clock}
                        <span>
                            {entry.position === 1
                                ? (isRTL ? "الطبيب سيتصل بك قريباً" : "Doctor will call you shortly")
                                : (isRTL ? `الوقت المتوقع: ${formatWaitTime(estimatedWaitMinutes)}` : `Estimated wait: ${formatWaitTime(estimatedWaitMinutes)}`)}
                        </span>
                    </div>

                    {/* Doctor Info */}
                    {doctorInfo && (
                        <div className="bg-slate-900/50 rounded-xl p-4 flex items-center gap-4">
                            {doctorInfo.avatar_url ? (
                                <Image
                                    src={doctorInfo.avatar_url}
                                    alt={doctorInfo.full_name}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                    {getInitials(doctorInfo.full_name)}
                                </div>
                            )}
                            <div className="text-start">
                                <p className="text-white font-medium">{doctorInfo.full_name}</p>
                                <p className="text-slate-400 text-sm">
                                    {doctorInfo.specialty.length > 0 ? doctorInfo.specialty.join(", ") : "General Practice"}
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Status Messages */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/30 border border-white/5 rounded-xl p-4 mb-6"
                >
                    <div className="flex items-start gap-3">
                        <div className="text-teal-400 mt-0.5">
                            {entry.position === 1 ? Icons.phone : Icons.clock}
                        </div>
                        <div>
                            <p className="text-white font-medium">
                                {entry.position === 1
                                    ? (isRTL ? "أنت التالي!" : "You're next!")
                                    : (isRTL ? "في الانتظار..." : "Waiting...")}
                            </p>
                            <p className="text-slate-400 text-sm">
                                {entry.position === 1
                                    ? (isRTL ? "استعد للاستشارة. الطبيب سيتصل بك في أي لحظة." : "Get ready for your consultation. The doctor will call you any moment.")
                                    : (isRTL ? `هناك ${entry.position - 1} مريض قبلك. سيتم إعلامك عند اقتراب دورك.` : `There are ${entry.position - 1} patient${entry.position - 1 !== 1 ? "s" : ""} ahead of you. You'll be notified when it's almost your turn.`)}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 mb-8"
                >
                    <h4 className="text-teal-400 font-medium mb-2">
                        {isRTL ? "نصائح للاستشارة" : "Tips for your consultation"}
                    </h4>
                    <ul className="text-slate-400 text-sm space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-teal-400 mt-0.5">{Icons.check}</span>
                            <span>{isRTL ? "تأكد من أن الكاميرا والميكروفون يعملان" : "Make sure your camera and microphone are working"}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-teal-400 mt-0.5">{Icons.check}</span>
                            <span>{isRTL ? "اختر مكاناً هادئاً وذا إضاءة جيدة" : "Choose a quiet, well-lit location"}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-teal-400 mt-0.5">{Icons.check}</span>
                            <span>{isRTL ? "جهز أي تقارير طبية أو أدوية للمناقشة" : "Have any medical reports or medications ready to discuss"}</span>
                        </li>
                    </ul>
                </motion.div>

                {/* Leave Queue Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setShowLeaveConfirm(true)}
                    className="w-full px-6 py-3 bg-slate-800 text-slate-400 rounded-xl font-medium hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    {Icons.logout}
                    <span>{isRTL ? "مغادرة القائمة" : "Leave Queue"}</span>
                </motion.button>

                {/* Refund Note */}
                <p className="text-center text-slate-500 text-sm mt-4">
                    {isRTL
                        ? "ملاحظة: في حال المغادرة، سيتم استرداد المبلغ المدفوع (قريباً)"
                        : "Note: If you leave, your payment will be refunded (coming soon)"}
                </p>
            </div>
        </div>
    );
}
