"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { getAppointmentById } from "@/app/actions/appointments";
import { useToast } from "@/components/ui/toast";

// Animated dots for waiting
const WaitingDots = () => (
    <span className="inline-flex gap-1">
        {[0, 1, 2].map((i) => (
            <motion.span
                key={i}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-teal-500"
            />
        ))}
    </span>
);

// Pulse ring animation
const PulseRing = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
        className="absolute inset-0 rounded-full border-2 border-teal-500/30"
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{
            duration: 2,
            repeat: Infinity,
            delay,
            ease: "easeOut",
        }}
    />
);

export default function WaitingRoomPage() {
    const params = useParams();
    const router = useRouter();
    const { isRTL, language } = useI18n();
    const { showConfirm } = useToast();
    const appointmentId = params.appointmentId as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [doctorName, setDoctorName] = useState<string>("");
    const [appointmentTime, setAppointmentTime] = useState<string>("");
    const [waitingTime, setWaitingTime] = useState(0);

    // Handle cancel with confirmation
    const handleCancel = () => {
        showConfirm(
            isRTL ? "هل أنت متأكد من إلغاء هذا الموعد؟" : "Are you sure you want to cancel this appointment?",
            () => router.push(`/${language}/dashboard/patient/appointments`),
        );
    };

    // Check appointment status and redirect when doctor starts consultation
    const checkStatus = useCallback(async () => {
        try {
            const result = await getAppointmentById(appointmentId);

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.appointment) {
                // If appointment is in_progress, redirect to call
                if (result.appointment.status === "in_progress") {
                    router.push(`/${language}/dashboard/consultation/${appointmentId}`);
                    return;
                }

                // If appointment was cancelled or completed, redirect back
                if (result.appointment.status === "cancelled" || result.appointment.status === "completed") {
                    router.push(`/${language}/dashboard/patient/appointments`);
                    return;
                }

                // Update doctor info
                if (result.appointment.doctor?.full_name) {
                    setDoctorName(result.appointment.doctor.full_name);
                }
                if (result.appointment.scheduled_start) {
                    setAppointmentTime(new Date(result.appointment.scheduled_start).toLocaleTimeString(
                        isRTL ? "ar-EG" : "en-US",
                        { hour: "2-digit", minute: "2-digit" }
                    ));
                }
            }

            setLoading(false);
        } catch {
            setError(isRTL ? "فشل في التحقق من الحالة" : "Failed to check status");
            setLoading(false);
        }
    }, [appointmentId, language, router, isRTL]);

    // Initial check and polling
    useEffect(() => {
        checkStatus();

        // Poll every 3 seconds
        const interval = setInterval(checkStatus, 3000);

        return () => clearInterval(interval);
    }, [checkStatus]);

    // Waiting time counter
    useEffect(() => {
        const interval = setInterval(() => {
            setWaitingTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Format waiting time
    const formatWaitingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins === 0) {
            return isRTL ? `${secs} ثانية` : `${secs} seconds`;
        }
        return isRTL
            ? `${mins} دقيقة و ${secs} ثانية`
            : `${mins}m ${secs}s`;
    };

    // Labels
    const labels = {
        waitingRoom: isRTL ? "غرفة الانتظار" : "Waiting Room",
        waitingForDoctor: isRTL ? "في انتظار الطبيب" : "Waiting for Doctor",
        doctorWillJoin: isRTL
            ? "سينضم الطبيب قريباً. يرجى الانتظار..."
            : "Your doctor will join shortly. Please wait...",
        yourDoctor: isRTL ? "طبيبك" : "Your Doctor",
        scheduledTime: isRTL ? "الموعد المحدد" : "Scheduled Time",
        waitingFor: isRTL ? "وقت الانتظار" : "Waiting for",
        tips: isRTL ? "نصائح" : "Tips",
        tip1: isRTL
            ? "تأكد من أن الكاميرا والميكروفون يعملان بشكل صحيح"
            : "Make sure your camera and microphone are working properly",
        tip2: isRTL
            ? "اجلس في مكان هادئ وجيد الإضاءة"
            : "Sit in a quiet, well-lit area",
        tip3: isRTL
            ? "جهز أي أسئلة أو ملاحظات طبية تريد مناقشتها"
            : "Have any questions or medical notes ready to discuss",
        checkDevices: isRTL ? "فحص الأجهزة" : "Check Devices",
        cancel: isRTL ? "إلغاء" : "Cancel",
        error: isRTL ? "خطأ" : "Error",
        goBack: isRTL ? "العودة" : "Go Back",
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-2 border-gray-600 border-t-teal-400 rounded-full mx-auto mb-4" />
                    <p className="text-gray-400">{isRTL ? "جاري التحميل..." : "Loading..."}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">{labels.error}</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        {labels.goBack}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg text-center">
                {/* Animated Waiting Icon */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <PulseRing delay={0} />
                    <PulseRing delay={0.5} />
                    <PulseRing delay={1} />
                    <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500/20 to-teal-600/20 flex items-center justify-center"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </motion.div>
                </div>

                {/* Status */}
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {labels.waitingForDoctor}
                </h1>
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-8">
                    <span>{labels.doctorWillJoin}</span>
                    <WaitingDots />
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {doctorName && (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-xs text-gray-500 mb-1">{labels.yourDoctor}</p>
                            <p className="text-white font-medium">{doctorName}</p>
                        </div>
                    )}
                    {appointmentTime && (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-xs text-gray-500 mb-1">{labels.scheduledTime}</p>
                            <p className="text-white font-medium">{appointmentTime}</p>
                        </div>
                    )}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-gray-500 mb-1">{labels.waitingFor}</p>
                        <p className="text-teal-400 font-medium">{formatWaitingTime(waitingTime)}</p>
                    </div>
                </div>

                {/* Tips */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left mb-8">
                    <h3 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                        </svg>
                        {labels.tips}
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">1.</span>
                            {labels.tip1}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">2.</span>
                            {labels.tip2}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">3.</span>
                            {labels.tip3}
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => router.push(`/${language}/dashboard/consultation/${appointmentId}/pre-call`)}
                        className={cn(
                            "px-6 py-3 rounded-xl font-medium transition-colors",
                            "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                        )}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {labels.checkDevices}
                        </span>
                    </button>
                    <button
                        onClick={handleCancel}
                        className={cn(
                            "px-6 py-3 rounded-xl font-medium transition-colors",
                            "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                        )}
                    >
                        {labels.cancel}
                    </button>
                </div>
            </div>
        </div>
    );
}
