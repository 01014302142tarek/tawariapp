"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { SparklesCore } from "@/components/ui/sparkles";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useI18n } from "@/app/i18n";
import { getAdminAnalytics, AdminAnalytics } from "@/app/actions/admin-analytics";

// Icons
const Icons = {
    money: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    users: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    calendar: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    clock: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    arrowUp: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
    ),
    globe: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
    ),
    link: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
    ),
    share: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
    ),
    search: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    spinner: (
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    ),
};

// Progress Bar
const ProgressBar = ({ value, max, isDark = true }: { value: number; max: number; color?: string; isDark?: boolean }) => {
    const percentage = (value / max) * 100;
    return (
        <div className={cn("w-full h-2 rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-gray-200")}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
            />
        </div>
    );
};

export default function AnalyticsPage() {
    const { t, formatNumber, language } = useI18n();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [period, setPeriod] = useState("year");
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);

    // Load analytics from database
    useEffect(() => {
        async function loadAnalytics() {
            setLoading(true);
            const result = await getAdminAnalytics();
            if (!result.error) {
                setAnalytics(result.analytics);
            }
            setLoading(false);
        }
        loadAnalytics();
    }, []);

    // Use real data or fallback to defaults
    const monthlyData = analytics?.monthly_appointments || [
        { month: "Jan", value: 0 }, { month: "Feb", value: 0 }, { month: "Mar", value: 0 },
        { month: "Apr", value: 0 }, { month: "May", value: 0 }, { month: "Jun", value: 0 },
        { month: "Jul", value: 0 }, { month: "Aug", value: 0 }, { month: "Sep", value: 0 },
        { month: "Oct", value: 0 }, { month: "Nov", value: 0 }, { month: "Dec", value: 0 },
    ];

    const topDoctors = analytics?.top_doctors || [];
    const maxValue = Math.max(...monthlyData.map(d => d.value), 1);

    const revenueInK = analytics ? Math.round(analytics.total_revenue / 1000) : 0;

    const stats = [
        { label: t.adminDashboard.analyticsPage.stats.revenue, value: revenueInK, suffix: ` ${t.common.units.kEgp}`, icon: Icons.money, color: "amber" },
        { label: t.adminDashboard.analyticsPage.stats.users, value: analytics?.total_users || 0, icon: Icons.users, color: "blue" },
        { label: t.adminDashboard.analyticsPage.stats.appointments, value: analytics?.total_appointments || 0, icon: Icons.calendar, color: "emerald" },
        { label: t.adminDashboard.analyticsPage.stats.session, value: analytics?.avg_session_minutes || 0, suffix: ` ${t.common.units.min}`, icon: Icons.clock, color: "amber" },
    ];

    const trafficSources = [
        { source: t.adminDashboard.analyticsPage.traffic.direct, percentage: 45, icon: Icons.globe, color: "amber" },
        { source: t.adminDashboard.analyticsPage.traffic.referral, percentage: 30, icon: Icons.link, color: "blue" },
        { source: t.adminDashboard.analyticsPage.traffic.social, percentage: 15, icon: Icons.share, color: "emerald" },
        { source: t.adminDashboard.analyticsPage.traffic.search, percentage: 10, icon: Icons.search, color: "amber" },
    ];

    const getPeriodLabel = (key: string) => {
        return t.adminDashboard.analyticsPage.periods[key as keyof typeof t.adminDashboard.analyticsPage.periods] || key;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-amber-500 mb-4 flex justify-center">{Icons.spinner}</div>
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>{t.common.loading || "Loading..."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden min-h-screen">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="analytics-sparkles"
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={isDark ? 20 : 10}
                    particleColor={isDark ? "245, 158, 11" : "217, 119, 6"}
                />
                {isDark && (
                    <>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
                    </>
                )}
            </div>

            <main className="relative z-0 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className={cn("text-xl md:text-2xl lg:text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.analyticsPage.title}</h1>
                        <p className={cn("text-sm md:text-base lg:text-lg mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            {t.adminDashboard.analyticsPage.subtitle}
                        </p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                        {["week", "month", "year"].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={cn(
                                    "px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-colors capitalize whitespace-nowrap",
                                    period === p
                                        ? "bg-amber-500 text-white"
                                        : isDark
                                            ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {getPeriodLabel(p)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    {stats.map((stat, idx) => (
                        <GlowingCard key={idx} glowColor="amber" className="p-3 md:p-5" isDark={isDark}>
                            <div className="flex items-start justify-between mb-2 md:mb-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] border border-sky-300/40">
                                    <span className="[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">
                                        {stat.icon}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-0.5 md:gap-1">
                                <span className={cn("text-lg md:text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                    <AnimatedNumber value={stat.value} format={formatNumber} />
                                </span>
                                {stat.suffix && <span className={cn("text-[10px] md:text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{stat.suffix}</span>}
                            </div>
                            <p className={cn("text-[10px] md:text-sm mt-0.5 md:mt-1 truncate", isDark ? "text-gray-500" : "text-gray-600")}>{stat.label}</p>
                        </GlowingCard>
                    ))}
                </div>

                {/* Charts - 2 Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    {/* Appointments Chart */}
                    <GlowingCard glowColor="amber" className="p-4 md:p-6 overflow-visible" isDark={isDark}>
                        <h3 className={cn("text-base md:text-lg font-semibold mb-4 md:mb-6", isDark ? "text-white" : "text-slate-900")}>
                            {language === "ar" ? "المواعيد الشهرية" : "Monthly Appointments"}
                        </h3>
                        <div className="overflow-x-auto">
                            <div className="min-w-[280px]">
                                {/* Chart container with fixed height */}
                                <div className="relative h-36 md:h-48 flex items-end gap-[2px] md:gap-1">
                                    {monthlyData.map((data, idx) => {
                                        const heightPercent = maxValue > 0 ? (data.value / maxValue) * 100 : 0;
                                        return (
                                            <div key={idx} className="flex-1 flex flex-col h-full justify-end group relative">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${Math.max(heightPercent, 2)}%` }}
                                                    transition={{ delay: idx * 0.05, duration: 0.5 }}
                                                    className="w-full rounded-t-sm md:rounded-t-md bg-gradient-to-t from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 transition-colors cursor-pointer"
                                                    style={{ minHeight: '4px' }}
                                                />
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                        {formatNumber(data.value)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Month labels */}
                                <div className="flex gap-[2px] md:gap-1 mt-2">
                                    {monthlyData.map((data, idx) => (
                                        <div key={idx} className="flex-1 text-center">
                                            <span className={cn("text-[7px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>{data.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GlowingCard>

                    {/* Traffic Sources */}
                    <GlowingCard glowColor="amber" className="p-4 md:p-6" isDark={isDark}>
                        <h3 className={cn("text-base md:text-lg font-semibold mb-4 md:mb-6", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.analyticsPage.charts.traffic}</h3>
                        <div className="space-y-3 md:space-y-5">
                            {trafficSources.map((source, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-1.5 md:mb-2">
                                        <div className="flex items-center gap-1.5 md:gap-2">
                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500">
                                                <span className="[&>svg]:w-3 [&>svg]:h-3 md:[&>svg]:w-4 md:[&>svg]:h-4">
                                                    {source.icon}
                                                </span>
                                            </div>
                                            <span className={cn("text-xs md:text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{source.source}</span>
                                        </div>
                                        <span className={cn("text-xs md:text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{formatNumber(source.percentage)}%</span>
                                    </div>
                                    <ProgressBar value={source.percentage} max={100} color={source.color} isDark={isDark} />
                                </div>
                            ))}
                        </div>
                    </GlowingCard>
                </div>

                {/* Top Doctors Table */}
                <GlowingCard glowColor="amber" className="p-4 md:p-6" isDark={isDark}>
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h3 className={cn("text-base md:text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.analyticsPage.table.title}</h3>
                        {/* Mobile scroll indicator */}
                        <div className="flex items-center gap-1 md:hidden text-amber-500">
                            <span className="text-[10px]">Scroll</span>
                            <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                    {topDoctors.length > 0 ? (
                        <div className="overflow-x-auto -mx-4 md:mx-0 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className={cn("border-b", isDark ? "border-white/5" : "border-gray-200")}>
                                        <th className={cn("px-3 md:px-4 py-2 md:py-3 text-start text-xs md:text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>{t.adminDashboard.analyticsPage.table.rank}</th>
                                        <th className={cn("px-3 md:px-4 py-2 md:py-3 text-start text-xs md:text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>{t.adminDashboard.analyticsPage.table.doctor}</th>
                                        <th className={cn("px-3 md:px-4 py-2 md:py-3 text-start text-xs md:text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>{t.adminDashboard.analyticsPage.table.specialty}</th>
                                        <th className={cn("px-3 md:px-4 py-2 md:py-3 text-start text-xs md:text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>{t.adminDashboard.analyticsPage.table.patients}</th>
                                        <th className={cn("px-3 md:px-4 py-2 md:py-3 text-start text-xs md:text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>{t.adminDashboard.analyticsPage.table.revenue}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topDoctors.map((doctor, idx) => (
                                        <motion.tr
                                            key={doctor.id || idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={cn("border-b", isDark ? "border-white/5" : "border-gray-100")}
                                        >
                                            <td className="px-3 md:px-4 py-3 md:py-4">
                                                <span className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm bg-amber-500/20 text-amber-500">
                                                    {formatNumber(doctor.rank)}
                                                </span>
                                            </td>
                                            <td className={cn("px-3 md:px-4 py-3 md:py-4 font-medium text-xs md:text-base", isDark ? "text-white" : "text-slate-900")}>{doctor.name}</td>
                                            <td className={cn("px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{doctor.specialty}</td>
                                            <td className={cn("px-3 md:px-4 py-3 md:py-4 text-xs md:text-base", isDark ? "text-white" : "text-slate-900")}>{formatNumber(doctor.patients)}</td>
                                            <td className="px-3 md:px-4 py-3 md:py-4 text-amber-500 font-medium text-xs md:text-base">{formatNumber(doctor.revenue.toLocaleString())} {t.common.units.egp}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                                {language === "ar" ? "لا توجد بيانات بعد" : "No data available yet"}
                            </p>
                        </div>
                    )}
                </GlowingCard>
            </main>
        </div>
    );
}
