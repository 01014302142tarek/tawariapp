"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useThemeStyles } from "../context/useThemeStyles";
import { useI18n } from "@/app/i18n";
import { getDoctorConsultations, ConsultationHistoryItem } from "@/app/actions/appointments";

// Icons
const Icons = {
    video: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    play: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
        </svg>
    ),
    clock: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    link: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
    ),
    spinner: (
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    ),
};

export default function ConsultationsPage() {
    const { t, formatNumber, formatDate, language } = useI18n();
    const router = useRouter();
    const params = useParams();
    const [roomCode, setRoomCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeConsultations, setActiveConsultations] = useState<ConsultationHistoryItem[]>([]);
    const [historyConsultations, setHistoryConsultations] = useState<ConsultationHistoryItem[]>([]);
    const { isDark, textPrimary, textSecondary, textMuted, inputBg, inputFocus, divider, cardHover, emptyStateBg } = useThemeStyles();

    // Load consultations from database
    useEffect(() => {
        let mounted = true;

        async function loadConsultations() {
            setLoading(true);
            const result = await getDoctorConsultations({ limit: 20 });
            if (mounted && !result.error) {
                setActiveConsultations(result.active);
                setHistoryConsultations(result.history);
            }
            if (mounted) {
                setLoading(false);
            }
        }
        loadConsultations();

        return () => {
            mounted = false;
        };
    }, []);

    // Format time from ISO string
    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Calculate elapsed time for active consultations
    const getElapsedTime = (startTime?: string) => {
        if (!startTime) return "";
        const start = new Date(startTime);
        const now = new Date();
        const diffMinutes = Math.round((now.getTime() - start.getTime()) / 60000);
        return `${formatNumber(diffMinutes)} ${t.doctorDashboard.consultationsPage.timeLabels.min}`;
    };

    // Handle rejoin consultation
    const handleRejoin = (appointmentId: string) => {
        router.push(`/${params.lang}/dashboard/consultation/${appointmentId}`);
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-teal-500 mb-4">{Icons.spinner}</div>
                    <p className={textMuted}>{t.common.loading || "Loading..."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <div>
                    <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                        <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.video}
                        </span>
                        {t.doctorDashboard.consultationsPage.title}
                    </h1>
                    <p className={cn("text-sm md:text-base mt-1", textMuted)}>{t.doctorDashboard.consultationsPage.subtitle}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                {/* Start New Call */}
                <GlowingCard isDark={isDark} glowColor="teal" className="p-4 md:p-6">
                    <h2 className={cn("text-base md:text-lg font-semibold mb-2 md:mb-4", textPrimary)}>{t.doctorDashboard.consultationsPage.newConsultation.title}</h2>
                    <p className={cn("text-xs md:text-sm mb-4 md:mb-6", textMuted)}>{t.doctorDashboard.consultationsPage.newConsultation.subtitle}</p>
                    <button
                        onClick={() => router.push(`/${params.lang}/dashboard/doctor/appointments`)}
                        className="w-full flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold py-3 md:py-4 px-4 md:px-6 rounded-xl transition-all shadow-lg shadow-teal-500/20 group"
                    >
                        <motion.span
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center"
                        >
                            {Icons.play}
                        </motion.span>
                        <span className="text-base md:text-lg">{t.doctorDashboard.consultationsPage.newConsultation.button}</span>
                    </button>
                </GlowingCard>

                {/* Join by Code */}
                <GlowingCard isDark={isDark} glowColor="teal" className="p-4 md:p-6">
                    <h2 className={cn("text-base md:text-lg font-semibold mb-2 md:mb-4", textPrimary)}>{t.doctorDashboard.consultationsPage.joinRoom.title}</h2>
                    <p className={cn("text-xs md:text-sm mb-4 md:mb-6", textMuted)}>{t.doctorDashboard.consultationsPage.joinRoom.subtitle}</p>
                    <div className="flex gap-2 md:gap-3">
                        <div className="relative flex-1">
                            <span className={cn("absolute left-3 md:left-4 top-1/2 -translate-y-1/2", textMuted)}>
                                {Icons.link}
                            </span>
                            <input
                                type="text"
                                placeholder={t.doctorDashboard.consultationsPage.joinRoom.placeholder}
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                className={cn("w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 rounded-xl border transition-colors text-sm md:text-base", inputBg, inputFocus)}
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (roomCode.trim()) {
                                    router.push(`/${params.lang}/dashboard/consultation/${roomCode.trim()}`);
                                }
                            }}
                            className="px-4 md:px-6 py-3 md:py-3.5 bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white font-semibold rounded-xl border border-teal-500/20 transition-all text-sm md:text-base"
                        >
                            {t.doctorDashboard.consultationsPage.joinRoom.button}
                        </button>
                    </div>
                </GlowingCard>
            </div>

            {/* Active Consultation */}
            {activeConsultations.length > 0 && (
                <section className="mb-6 md:mb-8">
                    <h2 className={cn("text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2", textPrimary)}>
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                        {t.doctorDashboard.consultationsPage.active.title}
                    </h2>
                    {activeConsultations.map((consultation) => (
                        <GlowingCard key={consultation.id} isDark={isDark} glowColor="teal" className="p-4 md:p-6 border-teal-500/30 mb-3">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                                <div className="relative">
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-teal-500">
                                        {consultation.patient_avatar ? (
                                            <Image src={consultation.patient_avatar} alt={consultation.patient_name} fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className={cn("w-full h-full flex items-center justify-center text-xl font-semibold", isDark ? "bg-slate-700 text-gray-300" : "bg-gray-200 text-gray-600")}>
                                                {consultation.patient_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-teal-500 rounded-full flex items-center justify-center">
                                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-ping"></span>
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className={cn("text-lg md:text-xl font-semibold", textPrimary)}>{consultation.patient_name}</h3>
                                    {consultation.consultation_type && (
                                        <p className={cn("text-sm", textMuted)}>{consultation.consultation_type}</p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 text-xs md:text-sm">
                                        <span className="text-teal-500 flex items-center gap-1">
                                            {Icons.clock}
                                            {consultation.status === "in_waiting_room"
                                                ? (language === "ar" ? "في غرفة الانتظار" : "In Waiting Room")
                                                : `${t.doctorDashboard.consultationsPage.active.startedAt} ${formatTime(consultation.actual_start || consultation.scheduled_start)}`
                                            }
                                        </span>
                                        {consultation.actual_start && consultation.status === "in_progress" && (
                                            <span className={textMuted}>{t.doctorDashboard.consultationsPage.active.duration}: {getElapsedTime(consultation.actual_start)}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleRejoin(consultation.appointment_id)}
                                        className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-400 transition-all text-sm md:text-base"
                                    >
                                        {consultation.status === "in_waiting_room"
                                            ? (language === "ar" ? "بدء الاستشارة" : "Start")
                                            : t.doctorDashboard.consultationsPage.active.rejoin
                                        }
                                    </button>
                                </div>
                            </div>
                        </GlowingCard>
                    ))}
                </section>
            )}

            {/* History */}
            <section>
                <h2 className={cn("text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2", textPrimary)}>
                    <span className={textMuted}>{Icons.clock}</span>
                    {t.doctorDashboard.consultationsPage.history.title}
                </h2>
                {historyConsultations.length > 0 ? (
                    <GlowingCard isDark={isDark} glowColor="teal" className="p-0 overflow-hidden">
                        <div className={divider}>
                            {historyConsultations.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn("flex items-center gap-3 md:gap-4 p-3 md:p-4 transition-colors cursor-pointer", cardHover)}
                                >
                                    <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-teal-500/30">
                                        {item.patient_avatar ? (
                                            <Image src={item.patient_avatar} alt={item.patient_name} fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className={cn("w-full h-full flex items-center justify-center text-sm font-semibold", isDark ? "bg-slate-700 text-gray-300" : "bg-gray-200 text-gray-600")}>
                                                {item.patient_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={cn("font-medium text-sm md:text-base", textPrimary)}>{item.patient_name}</h3>
                                        <p className={cn("text-xs md:text-sm", textMuted)}>{item.consultation_type || (language === "ar" ? "استشارة" : "Consultation")}</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className={cn("text-xs md:text-sm", textSecondary)}>{formatDate(item.scheduled_start)}</p>
                                        <p className={cn("text-xs", textMuted)}>{formatTime(item.scheduled_start)}</p>
                                    </div>
                                    <div className="text-right">
                                        {item.duration_minutes ? (
                                            <span className="text-xs md:text-sm text-teal-500">
                                                {formatNumber(item.duration_minutes)} {t.doctorDashboard.consultationsPage.timeLabels.min}
                                            </span>
                                        ) : (
                                            <span className="text-xs md:text-sm text-gray-500">-</span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlowingCard>
                ) : (
                    <div className="text-center py-12">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", emptyStateBg, textMuted)}>
                            {Icons.video}
                        </div>
                        <h3 className={cn("text-lg font-medium mb-2", textPrimary)}>
                            {language === "ar" ? "لا توجد استشارات سابقة" : "No consultation history"}
                        </h3>
                        <p className={textMuted}>
                            {language === "ar" ? "ستظهر استشاراتك المكتملة هنا" : "Your completed consultations will appear here"}
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
