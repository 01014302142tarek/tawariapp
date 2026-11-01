"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useThemeStyles } from "../context/useThemeStyles";
import { useI18n } from "@/app/i18n";
import { getDoctorPatientsWithDetails, DoctorPatient } from "@/app/actions/appointments";

// Icons
const Icons = {
    users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
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
    spinner: (
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    ),
};

export default function PatientsPage() {
    const { t, formatNumber, formatDate, language } = useI18n();
    const router = useRouter();
    const params = useParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState<DoctorPatient[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { isDark, textPrimary, textSecondary, textMuted, inputBg, inputFocus, buttonSecondary, buttonSecondaryActive, divider, cardHover, emptyStateBg } = useThemeStyles();

    // Load patients from database
    useEffect(() => {
        let mounted = true;

        async function loadPatients() {
            setLoading(true);
            const result = await getDoctorPatientsWithDetails();
            if (mounted) {
                if (result.error) {
                    setError(result.error);
                } else {
                    setPatients(result.patients);
                }
                setLoading(false);
            }
        }
        loadPatients();

        return () => {
            mounted = false;
        };
    }, []);

    const filteredPatients = patients.filter((patient) =>
        patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.last_condition && patient.last_condition.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Navigate to messages with this patient
    const handleChat = (patientProfileId: string) => {
        router.push(`/${params.lang}/dashboard/doctor/messages?patient=${patientProfileId}`);
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-amber-500 mb-4">{Icons.spinner}</div>
                    <p className={textMuted}>{t.common.loading || "Loading..."}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-6 lg:p-8">
                <div className="text-center py-16">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", emptyStateBg, "text-red-500")}>
                        {Icons.users}
                    </div>
                    <h3 className={cn("text-lg font-medium mb-2", textPrimary)}>{t.common.error || "Error"}</h3>
                    <p className={textMuted}>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                        <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] border border-sky-300/40">
                            {Icons.users}
                        </span>
                        {t.doctorDashboard.patientsPage.title}
                    </h1>
                    <p className={cn("text-sm md:text-base mt-1", textMuted)}>{formatNumber(patients.length)} {t.doctorDashboard.patientsPage.subtitle}</p>
                </div>
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
                            <GlowingCard isDark={isDark} glowColor="amber" className="p-4 md:p-5">
                                <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-amber-500/30">
                                        {patient.avatar_url ? (
                                            <Image
                                                src={patient.avatar_url}
                                                alt={patient.full_name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 48px, 56px"
                                            />
                                        ) : (
                                            <div className={cn("w-full h-full flex items-center justify-center text-lg font-semibold", isDark ? "bg-slate-700 text-gray-300" : "bg-gray-200 text-gray-600")}>
                                                {patient.full_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={cn("font-semibold truncate text-sm md:text-base", textPrimary)}>{patient.full_name}</h3>
                                        {patient.age && (
                                            <p className={cn("text-xs md:text-sm", textMuted)}>{formatNumber(patient.age)} {t.doctorDashboard.patientsPage.labels.ageSuffix}</p>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "px-2 py-0.5 text-xs rounded-full",
                                        patient.status === "active"
                                            ? "bg-green-500/10 text-green-500"
                                            : "bg-gray-500/10 text-gray-500"
                                    )}>
                                        {patient.status === "active" ? (language === "ar" ? "نشط" : "Active") : (language === "ar" ? "غير نشط" : "Inactive")}
                                    </span>
                                </div>
                                <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                                    {patient.last_condition && (
                                        <div className="flex items-center justify-between text-xs md:text-sm">
                                            <span className={textMuted}>{t.doctorDashboard.patientsPage.labels.condition}</span>
                                            <span className={cn("truncate ml-2", textPrimary)}>{patient.last_condition}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-xs md:text-sm">
                                        <span className={textMuted}>{t.doctorDashboard.patientsPage.labels.lastVisit}</span>
                                        <span className={textSecondary}>{patient.last_visit ? formatDate(patient.last_visit) : "-"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs md:text-sm">
                                        <span className={textMuted}>{language === "ar" ? "الزيارات" : "Visits"}</span>
                                        <span className={textSecondary}>{formatNumber(patient.total_visits)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleChat(patient.profile_id)}
                                        className={cn("flex-1 flex items-center justify-center gap-1 md:gap-1.5 p-1.5 md:p-2 rounded-lg transition-all text-xs md:text-sm", isDark ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900")}
                                    >
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
                <GlowingCard isDark={isDark} glowColor="amber" className="p-0 overflow-hidden">
                    <div className={divider}>
                        {filteredPatients.map((patient, idx) => (
                            <motion.div
                                key={patient.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn("flex items-center gap-3 md:gap-4 p-3 md:p-4 transition-colors cursor-pointer", cardHover)}
                            >
                                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-amber-500/30">
                                    {patient.avatar_url ? (
                                        <Image
                                            src={patient.avatar_url}
                                            alt={patient.full_name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 40px, 48px"
                                        />
                                    ) : (
                                        <div className={cn("w-full h-full flex items-center justify-center text-sm font-semibold", isDark ? "bg-slate-700 text-gray-300" : "bg-gray-200 text-gray-600")}>
                                            {patient.full_name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={cn("font-medium text-sm md:text-base", textPrimary)}>{patient.full_name}</h3>
                                    <p className={cn("text-xs md:text-sm", textMuted)}>{patient.last_condition || "-"}</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    {patient.age && (
                                        <p className={cn("text-xs md:text-sm", textSecondary)}>{formatNumber(patient.age)} {t.doctorDashboard.patientsPage.labels.yrs}</p>
                                    )}
                                    <p className={cn("text-xs", textMuted)}>{t.doctorDashboard.patientsPage.labels.last}: {patient.last_visit ? formatDate(patient.last_visit) : "-"}</p>
                                </div>
                                <span className={cn(
                                    "px-2 py-0.5 text-xs rounded-full hidden sm:block",
                                    patient.status === "active"
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-gray-500/10 text-gray-500"
                                )}>
                                    {patient.status === "active" ? (language === "ar" ? "نشط" : "Active") : (language === "ar" ? "غير نشط" : "Inactive")}
                                </span>
                                <div className="flex gap-1.5 md:gap-2">
                                    <button
                                        onClick={() => handleChat(patient.profile_id)}
                                        className={cn("p-1.5 md:p-2 rounded-lg transition-all", isDark ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900")}
                                    >
                                        {Icons.chat}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlowingCard>
            )}

            {/* Empty State */}
            {filteredPatients.length === 0 && !loading && (
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
