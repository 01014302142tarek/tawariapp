"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useThemeStyles } from "../context/useThemeStyles";
import { useI18n } from "@/app/i18n";
import { getDoctorAnalytics, DoctorAnalyticsData } from "@/app/actions/doctor-analytics";

// Icons
const Icons = {
    chart: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
    ),
    users: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    video: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    money: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    star: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
    ),
    trendUp: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
    ),
};

export default function AnalyticsPage() {
    const { t, isRTL, formatNumber, language } = useI18n();
    const { isDark, textPrimary, textSecondary, textMuted } = useThemeStyles();

    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<DoctorAnalyticsData | null>(null);

    useEffect(() => {
        async function loadAnalytics() {
            setLoading(true);
            const data = await getDoctorAnalytics();
            setAnalyticsData(data);
            setLoading(false);
        }
        loadAnalytics();
    }, []);

    const diagnosesMap: Record<string, string> = isRTL ? {
        "Hypertension": "ارتفاع ضغط الدم",
        "Arrhythmia": "عدم انتظام ضربات القلب",
        "Heart Disease": "أمراض القلب",
        "Cholesterol": "الكوليسترول",
        "General Checkup": "فحص عام",
        "Follow-up": "متابعة",
        "Consultation": "استشارة",
        "Routine Check": "فحص روتيني",
        "Health Assessment": "تقييم صحي"
    } : {
        "Hypertension": "Hypertension",
        "Arrhythmia": "Arrhythmia",
        "Heart Disease": "Heart Disease",
        "Cholesterol": "Cholesterol",
        "General Checkup": "General Checkup",
        "Follow-up": "Follow-up",
        "Consultation": "Consultation",
        "Routine Check": "Routine Check",
        "Health Assessment": "Health Assessment"
    };

    const daysMap: Record<string, string> = isRTL ? {
        "Sun": "أحد", "Mon": "إثنين", "Tue": "ثلاثاء", "Wed": "أربعاء", "Thu": "خميس", "Fri": "جمعة", "Sat": "سبت"
    } : {
        "Sun": "Sun", "Mon": "Mon", "Tue": "Tue", "Wed": "Wed", "Thu": "Thu", "Fri": "Fri", "Sat": "Sat"
    };

    // Get data from analytics or use defaults for loading state
    const stats = analyticsData?.stats || {
        totalPatients: 0,
        totalConsultations: 0,
        totalRevenue: 0,
        avgRating: 0,
        patientChange: 0,
        consultationChange: 0,
        revenueChange: 0,
        ratingChange: 0,
    };

    const weeklyData = analyticsData?.weeklyData || [];
    const satisfaction = analyticsData?.satisfaction || { overall: 0, excellent: 0, good: 0, average: 0, poor: 0 };
    const topDiagnoses = analyticsData?.topDiagnoses || [];

    const maxConsultations = weeklyData.length > 0
        ? Math.max(...weeklyData.map(d => d.consultations), 1)
        : 1;

    const totalWeeklyConsultations = weeklyData.reduce((sum, d) => sum + d.consultations, 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-amber-500 mb-4 flex justify-center">
                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
                </div>
            </div>
        );
    }


    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                    <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] border border-sky-300/40">
                        {Icons.chart}
                    </span>
                    {t.doctorDashboard.analyticsPage.title}
                </h1>
                <p className={cn("text-sm md:text-base mt-1", textMuted)}>{t.doctorDashboard.analyticsPage.subtitle}</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                {[
                    { label: t.doctorDashboard.analyticsPage.stats.totalPatients, value: stats.totalPatients, change: `${stats.patientChange >= 0 ? "+" : ""}${stats.patientChange}%`, icon: Icons.users },
                    { label: t.doctorDashboard.analyticsPage.stats.consultations, value: stats.totalConsultations, change: `${stats.consultationChange >= 0 ? "+" : ""}${stats.consultationChange}%`, icon: Icons.video },
                    { label: t.doctorDashboard.analyticsPage.stats.revenue, value: stats.totalRevenue, change: `${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange}%`, icon: Icons.money },
                    { label: t.doctorDashboard.analyticsPage.stats.avgRating, value: stats.avgRating || 0, change: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}` : "-", icon: Icons.star },
                ].map((stat, idx) => (
                    <GlowingCard key={idx} isDark={isDark} glowColor="amber" className="p-3 md:p-5">
                        <div className="flex items-start justify-between mb-2 md:mb-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] border border-sky-300/40">
                                <span className="[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">
                                    {stat.icon}
                                </span>
                            </div>
                            <span className="flex items-center gap-0.5 md:gap-1 text-xs md:text-sm text-amber-500">
                                {Icons.trendUp}
                                {formatNumber(stat.change)}
                            </span>
                        </div>
                        <div className={cn("text-xl md:text-3xl font-bold mb-0.5 md:mb-1", textPrimary)}>
                            <AnimatedNumber value={stat.value} format={formatNumber} />
                        </div>
                        <p className={cn("text-xs md:text-sm truncate", textMuted)}>{stat.label}</p>
                    </GlowingCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {/* Weekly Consultations Chart */}
                <div className="lg:col-span-2">
                    <GlowingCard isDark={isDark} glowColor="amber" className="p-4 md:p-6 h-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6">
                            <div>
                                <h2 className={cn("text-base md:text-lg font-semibold", textPrimary)}>{t.doctorDashboard.analyticsPage.charts.weekly.title}</h2>
                                <p className={cn("text-xs md:text-sm", textMuted)}>{t.doctorDashboard.analyticsPage.charts.weekly.subtitle}</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className={cn("text-xl md:text-2xl font-bold", textPrimary)}>{formatNumber(totalWeeklyConsultations)}</p>
                                <p className="text-xs md:text-sm text-amber-500">{t.doctorDashboard.analyticsPage.charts.weekly.total}</p>
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <div className="flex items-end justify-between gap-2 md:gap-3 h-36 md:h-48 pt-6 md:pt-8">
                            {weeklyData.map((data, idx) => {
                                const heightPercent = (data.consultations / maxConsultations) * 100;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center h-full">
                                        <div className="flex-1 w-full flex items-end">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPercent}%` }}
                                                transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                                                className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg relative group cursor-pointer"
                                                style={{ minHeight: "8px" }}
                                            >
                                                <div className={cn(
                                                    "absolute -top-7 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10",
                                                    isDark ? "bg-slate-800 text-white" : "bg-gray-800 text-white"
                                                )}>
                                                    {formatNumber(data.consultations)}
                                                </div>
                                            </motion.div>
                                        </div>
                                        <span className={cn("text-xs mt-2", textMuted)}>{daysMap[data.day]}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </GlowingCard>
                </div>

                {/* Patient Satisfaction */}
                <div>
                    <GlowingCard isDark={isDark} glowColor="amber" className="p-4 md:p-6 h-full">
                        <h2 className={cn("text-base md:text-lg font-semibold mb-4 md:mb-6", textPrimary)}>{t.doctorDashboard.analyticsPage.charts.satisfaction.title}</h2>

                        <div className="text-center mb-4 md:mb-6">
                            <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="52"
                                        stroke="currentColor"
                                        strokeWidth="10"
                                        fill="none"
                                        className={isDark ? "text-slate-800" : "text-gray-200"}
                                    />
                                    <motion.circle
                                        cx="64"
                                        cy="64"
                                        r="52"
                                        stroke="currentColor"
                                        strokeWidth="10"
                                        fill="none"
                                        strokeLinecap="round"
                                        className="text-amber-500"
                                        initial={{ strokeDasharray: "0 327" }}
                                        animate={{ strokeDasharray: `${Math.round((satisfaction.overall / 100) * 327)} 327` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={cn("text-2xl md:text-3xl font-bold", textPrimary)}>{formatNumber(satisfaction.overall)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                            <div className="flex items-center justify-between text-xs md:text-sm">
                                <span className={textSecondary}>{t.doctorDashboard.analyticsPage.charts.satisfaction.excellent}</span>
                                <span className={textPrimary}>{formatNumber(satisfaction.excellent)}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs md:text-sm">
                                <span className={textSecondary}>{t.doctorDashboard.analyticsPage.charts.satisfaction.good}</span>
                                <span className={textPrimary}>{formatNumber(satisfaction.good)}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs md:text-sm">
                                <span className={textSecondary}>{t.doctorDashboard.analyticsPage.charts.satisfaction.average}</span>
                                <span className={textPrimary}>{formatNumber(satisfaction.average)}%</span>
                            </div>
                        </div>
                    </GlowingCard>
                </div>
            </div>

            {/* Top Diagnoses */}
            <GlowingCard isDark={isDark} glowColor="amber" className="p-4 md:p-6">
                <h2 className={cn("text-base md:text-lg font-semibold mb-4 md:mb-6", textPrimary)}>{t.doctorDashboard.analyticsPage.diagnoses.title}</h2>
                {topDiagnoses.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                        {topDiagnoses.map((diagnosis, idx) => (
                            <div key={idx} className="flex items-center gap-2 md:gap-4">
                                <div className="w-6 md:w-8 text-center">
                                    <span className={cn("text-xs md:text-sm font-medium", textMuted)}>#{formatNumber(idx + 1)}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={cn("text-xs md:text-sm font-medium", textPrimary)}>{diagnosesMap[diagnosis.name] || diagnosis.name}</span>
                                        <span className={cn("text-xs md:text-sm hidden sm:inline", textSecondary)}>{formatNumber(diagnosis.count)} {t.doctorDashboard.analyticsPage.diagnoses.patients}</span>
                                    </div>
                                    <div className={cn("w-full h-1.5 md:h-2 rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-gray-200")}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${diagnosis.percentage}%` }}
                                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                                        />
                                    </div>
                                </div>
                                <div className="w-10 md:w-12 text-right">
                                    <span className="text-xs md:text-sm text-amber-500">{formatNumber(diagnosis.percentage)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className={textMuted}>
                            {language === "ar" ? "لا توجد بيانات تشخيصية بعد" : "No diagnosis data available yet"}
                        </p>
                    </div>
                )}
            </GlowingCard>
        </div>
    );
}
