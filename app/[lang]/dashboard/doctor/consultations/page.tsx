"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useThemeStyles } from "../context/useThemeStyles";
import { useI18n } from "@/app/i18n";

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
};

export default function ConsultationsPage() {
    const { t, formatNumber, formatDate } = useI18n();
    const [roomCode, setRoomCode] = useState("");
    const { isDark, textPrimary, textSecondary, textMuted, inputBg, inputFocus, divider, cardHover } = useThemeStyles();

    // Mock Data
    const consultations = [
        { id: 1, patient: t.common.demoNames.mohamedAli, type: t.doctorDashboard.consultationsPage.types.initialConsultation, duration: `25 ${t.doctorDashboard.consultationsPage.timeLabels.min}`, status: "active", startedAt: "10:30 AM", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
    ];

    const history = [
        { id: 1, patient: t.common.demoNames.sarahJohnson, type: t.doctorDashboard.consultationsPage.types.followUp, duration: `18 ${t.doctorDashboard.consultationsPage.timeLabels.min}`, date: "Dec 14, 2024", time: "09:00 AM", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
        { id: 2, patient: t.common.demoNames.omarNasser, type: t.doctorDashboard.consultationsPage.types.ecgReview, duration: `32 ${t.doctorDashboard.consultationsPage.timeLabels.min}`, date: "Dec 13, 2024", time: "03:30 PM", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
        { id: 3, patient: t.common.demoNames.fatimaKhaled, type: t.doctorDashboard.consultationsPage.types.checkup, duration: `22 ${t.doctorDashboard.consultationsPage.timeLabels.min}`, date: "Dec 12, 2024", time: "11:00 AM", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face" },
        { id: 4, patient: t.common.demoNames.laylaAhmed, type: t.doctorDashboard.consultationsPage.types.bloodPressure, duration: `15 ${t.doctorDashboard.consultationsPage.timeLabels.min}`, date: "Dec 11, 2024", time: "02:00 PM", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
        { id: 5, patient: t.common.demoNames.ahmedHassan, type: t.doctorDashboard.consultationsPage.types.consultation, duration: `28 ${t.doctorDashboard.consultationsPage.timeLabels.min}`, date: "Dec 10, 2024", time: "10:00 AM", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
    ];



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
                    <button className="w-full flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold py-3 md:py-4 px-4 md:px-6 rounded-xl transition-all shadow-lg shadow-teal-500/20 group">
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
                        <button className="px-4 md:px-6 py-3 md:py-3.5 bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white font-semibold rounded-xl border border-teal-500/20 transition-all text-sm md:text-base">
                            {t.doctorDashboard.consultationsPage.joinRoom.button}
                        </button>
                    </div>
                </GlowingCard>
            </div>

            {/* Active Consultation */}
            {consultations.length > 0 && (
                <section className="mb-6 md:mb-8">
                    <h2 className={cn("text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2", textPrimary)}>
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                        {t.doctorDashboard.consultationsPage.active.title}
                    </h2>
                    {consultations.map((consultation) => (
                        <GlowingCard key={consultation.id} isDark={isDark} glowColor="teal" className="p-4 md:p-6 border-teal-500/30">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                                <div className="relative">
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-teal-500">
                                        <Image src={consultation.image} alt={consultation.patient} fill className="object-cover" unoptimized />
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-teal-500 rounded-full flex items-center justify-center">
                                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-ping"></span>
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className={cn("text-lg md:text-xl font-semibold", textPrimary)}>{consultation.patient}</h3>
                                    <p className={cn("text-sm", textMuted)}>{consultation.type}</p>
                                    <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 text-xs md:text-sm">
                                        <span className="text-teal-500 flex items-center gap-1">
                                            {Icons.clock}
                                            {t.doctorDashboard.consultationsPage.active.startedAt} {formatNumber(consultation.startedAt)}
                                        </span>
                                        <span className={textMuted}>{t.doctorDashboard.consultationsPage.active.duration}: {formatNumber(consultation.duration)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                                    <button className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-400 transition-all text-sm md:text-base">
                                        {t.doctorDashboard.consultationsPage.active.rejoin}
                                    </button>
                                    <button className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-red-500/10 text-red-400 font-semibold rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-sm md:text-base">
                                        {t.doctorDashboard.consultationsPage.active.end}
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
                <GlowingCard isDark={isDark} glowColor="teal" className="p-0 overflow-hidden">
                    <div className={divider}>
                        {history.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn("flex items-center gap-3 md:gap-4 p-3 md:p-4 transition-colors cursor-pointer", cardHover)}
                            >
                                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-teal-500/30">
                                    <Image src={item.image} alt={item.patient} fill className="object-cover" unoptimized />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={cn("font-medium text-sm md:text-base", textPrimary)}>{item.patient}</h3>
                                    <p className={cn("text-xs md:text-sm", textMuted)}>{item.type}</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className={cn("text-xs md:text-sm", textSecondary)}>{formatDate(item.date)}</p>
                                    <p className={cn("text-xs", textMuted)}>{formatNumber(item.time)}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs md:text-sm text-teal-500">{formatNumber(item.duration)}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlowingCard>
            </section>
        </div>
    );
}
