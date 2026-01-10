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
    users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    search: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    video: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    chat: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
    ),
    profile: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    grid: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
    ),
    list: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    ),
};

// Mock Data


export default function PatientsPage() {
    const { t, formatNumber, formatDate } = useI18n();
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const { isDark, textPrimary, textSecondary, textMuted, inputBg, inputFocus, buttonSecondary, buttonSecondaryActive, divider, cardHover, emptyStateBg } = useThemeStyles();

    // Mock Data
    const patients = [
        { id: 1, name: t.common.demoNames.sarahJohnson, age: 34, condition: t.doctorDashboard.patientsPage.conditions.hypertension, lastVisit: "Dec 14, 2024", status: "active", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
        { id: 2, name: t.common.demoNames.mohamedAli, age: 45, condition: t.doctorDashboard.patientsPage.conditions.arrhythmia, lastVisit: "Dec 14, 2024", status: "active", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
        { id: 3, name: t.common.demoNames.fatimaKhaled, age: 28, condition: t.doctorDashboard.patientsPage.conditions.routineCheckup, lastVisit: "Dec 10, 2024", status: "active", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face" },
        { id: 4, name: t.common.demoNames.omarNasser, age: 52, condition: t.doctorDashboard.patientsPage.conditions.heartDisease, lastVisit: "Dec 8, 2024", status: "active", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
        { id: 5, name: t.common.demoNames.laylaAhmed, age: 41, condition: t.doctorDashboard.patientsPage.conditions.bloodPressure, lastVisit: "Dec 5, 2024", status: "inactive", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
        { id: 6, name: t.common.demoNames.ahmedHassan, age: 38, condition: t.doctorDashboard.patientsPage.conditions.cholesterol, lastVisit: "Nov 28, 2024", status: "active", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
        { id: 7, name: t.common.demoNames.nourIbrahim, age: 29, condition: t.doctorDashboard.patientsPage.conditions.palpitations, lastVisit: "Nov 20, 2024", status: "inactive", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
        { id: 8, name: t.common.demoNames.youssefMahmoud, age: 61, condition: t.doctorDashboard.patientsPage.conditions.postSurgery, lastVisit: "Nov 15, 2024", status: "active", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face" },
    ];

    const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.condition.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                        <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.users}
                        </span>
                        {t.doctorDashboard.patientsPage.title}
                    </h1>
                    <p className={cn("text-sm md:text-base mt-1", textMuted)}>{formatNumber(patients.length)} {t.doctorDashboard.patientsPage.subtitle}</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold py-2 md:py-2.5 px-4 md:px-5 rounded-xl transition-all shadow-lg shadow-teal-500/20 text-sm md:text-base">
                    {Icons.plus}
                    <span>{t.doctorDashboard.patientsPage.addPatient}</span>
                </button>
            </div>

            {/* Search & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <span className={cn("absolute left-4 top-1/2 -translate-y-1/2", textMuted)}>
                        {Icons.search}
                    </span>
                    <input
                        type="text"
                        placeholder={t.doctorDashboard.patientsPage.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn("w-full pl-12 pr-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn("p-3 rounded-xl transition-all", viewMode === "grid" ? buttonSecondaryActive : buttonSecondary)}
                    >
                        {Icons.grid}
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn("p-3 rounded-xl transition-all", viewMode === "list" ? buttonSecondaryActive : buttonSecondary)}
                    >
                        {Icons.list}
                    </button>
                </div>
            </div>

            {/* Patient Grid */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {filteredPatients.map((patient, idx) => (
                        <motion.div
                            key={patient.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <GlowingCard isDark={isDark} glowColor="teal" className="p-4 md:p-5">
                                <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-teal-500/30">
                                        <Image src={patient.image} alt={patient.name} fill className="object-cover" unoptimized />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={cn("font-semibold truncate text-sm md:text-base", textPrimary)}>{patient.name}</h3>
                                        <p className={cn("text-xs md:text-sm", textMuted)}>{formatNumber(patient.age)} {t.doctorDashboard.patientsPage.labels.ageSuffix}</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                                    <div className="flex items-center justify-between text-xs md:text-sm">
                                        <span className={textMuted}>{t.doctorDashboard.patientsPage.labels.condition}</span>
                                        <span className={cn("truncate ml-2", textPrimary)}>{patient.condition}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs md:text-sm">
                                        <span className={textMuted}>{t.doctorDashboard.patientsPage.labels.lastVisit}</span>
                                        <span className={textSecondary}>{formatDate(patient.lastVisit)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 flex items-center justify-center gap-1 md:gap-1.5 p-1.5 md:p-2 rounded-lg bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white transition-all text-xs md:text-sm">
                                        {Icons.video}
                                        <span>{t.doctorDashboard.patientsPage.actions.call}</span>
                                    </button>
                                    <button className={cn("flex-1 flex items-center justify-center gap-1 md:gap-1.5 p-1.5 md:p-2 rounded-lg transition-all text-xs md:text-sm", isDark ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900")}>
                                        {Icons.chat}
                                        <span>{t.doctorDashboard.patientsPage.actions.chat}</span>
                                    </button>
                                    <button className={cn("p-1.5 md:p-2 rounded-lg transition-all", isDark ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900")}>
                                        {Icons.profile}
                                    </button>
                                </div>
                            </GlowingCard>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <GlowingCard isDark={isDark} glowColor="teal" className="p-0 overflow-hidden">
                    <div className={divider}>
                        {filteredPatients.map((patient, idx) => (
                            <motion.div
                                key={patient.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn("flex items-center gap-3 md:gap-4 p-3 md:p-4 transition-colors cursor-pointer", cardHover)}
                            >
                                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-teal-500/30">
                                    <Image src={patient.image} alt={patient.name} fill className="object-cover" unoptimized />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={cn("font-medium text-sm md:text-base", textPrimary)}>{patient.name}</h3>
                                    <p className={cn("text-xs md:text-sm", textMuted)}>{patient.condition}</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className={cn("text-xs md:text-sm", textSecondary)}>{formatNumber(patient.age)} {t.doctorDashboard.patientsPage.labels.yrs}</p>
                                    <p className={cn("text-xs", textMuted)}>{t.doctorDashboard.patientsPage.labels.last}: {formatDate(patient.lastVisit)}</p>
                                </div>
                                <div className="flex gap-1.5 md:gap-2">
                                    <button className="p-1.5 md:p-2 rounded-lg bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white transition-all">
                                        {Icons.video}
                                    </button>
                                    <button className={cn("p-1.5 md:p-2 rounded-lg transition-all", isDark ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900")}>
                                        {Icons.chat}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlowingCard>
            )}

            {/* Empty State */}
            {filteredPatients.length === 0 && (
                <div className="text-center py-16">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", emptyStateBg, textMuted)}>
                        {Icons.users}
                    </div>
                    <h3 className={cn("text-lg font-medium mb-2", textPrimary)}>{t.doctorDashboard.patientsPage.emptyState.title}</h3>
                    <p className={textMuted}>{t.doctorDashboard.patientsPage.emptyState.subtitle}</p>
                </div>
            )}
        </div>
    );
}
