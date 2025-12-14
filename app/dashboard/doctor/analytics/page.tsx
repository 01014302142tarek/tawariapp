"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useThemeStyles } from "../context/useThemeStyles";

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

// Chart Data
const weeklyData = [
    { day: "Mon", consultations: 8, revenue: 1600 },
    { day: "Tue", consultations: 12, revenue: 2400 },
    { day: "Wed", consultations: 10, revenue: 2000 },
    { day: "Thu", consultations: 15, revenue: 3000 },
    { day: "Fri", consultations: 11, revenue: 2200 },
    { day: "Sat", consultations: 6, revenue: 1200 },
    { day: "Sun", consultations: 4, revenue: 800 },
];

const topDiagnoses = [
    { name: "Hypertension", count: 45, percentage: 28 },
    { name: "Arrhythmia", count: 32, percentage: 20 },
    { name: "Heart Disease", count: 28, percentage: 17 },
    { name: "Cholesterol", count: 24, percentage: 15 },
    { name: "General Checkup", count: 32, percentage: 20 },
];

const maxConsultations = Math.max(...weeklyData.map(d => d.consultations));

export default function AnalyticsPage() {
    const { isDark, pageBg, textPrimary, textSecondary, textMuted } = useThemeStyles();

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className={cn("text-2xl font-bold flex items-center gap-3", textPrimary)}>
                    <span className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                        {Icons.chart}
                    </span>
                    Analytics
                </h1>
                <p className={cn("mt-1", textMuted)}>Track your performance and metrics</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Patients", value: 156, change: "+12%", icon: Icons.users },
                    { label: "Consultations", value: 66, change: "+8%", icon: Icons.video },
                    { label: "Revenue (EGP)", value: 13200, change: "+15%", icon: Icons.money },
                    { label: "Avg. Rating", value: 4.9, change: "+0.2", icon: Icons.star },
                ].map((stat, idx) => (
                    <GlowingCard key={idx} glowColor="teal" className="p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                {stat.icon}
                            </div>
                            <span className="flex items-center gap-1 text-sm text-teal-500">
                                {Icons.trendUp}
                                {stat.change}
                            </span>
                        </div>
                        <div className={cn("text-3xl font-bold mb-1", textPrimary)}>
                            <AnimatedNumber value={stat.value} />
                        </div>
                        <p className={cn("text-sm", textMuted)}>{stat.label}</p>
                    </GlowingCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Weekly Consultations Chart */}
                <div className="lg:col-span-2">
                    <GlowingCard glowColor="teal" className="p-6 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className={cn("text-lg font-semibold", textPrimary)}>Weekly Consultations</h2>
                                <p className={cn("text-sm", textMuted)}>This week&apos;s performance</p>
                            </div>
                            <div className="text-right">
                                <p className={cn("text-2xl font-bold", textPrimary)}>66</p>
                                <p className="text-sm text-teal-500">Total this week</p>
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <div className="flex items-end justify-between gap-3 h-48 pt-8">
                            {weeklyData.map((data, idx) => {
                                const heightPercent = (data.consultations / maxConsultations) * 100;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center h-full">
                                        <div className="flex-1 w-full flex items-end">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPercent}%` }}
                                                transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                                                className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg relative group cursor-pointer"
                                                style={{ minHeight: "8px" }}
                                            >
                                                <div className={cn(
                                                    "absolute -top-7 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10",
                                                    isDark ? "bg-slate-800 text-white" : "bg-gray-800 text-white"
                                                )}>
                                                    {data.consultations}
                                                </div>
                                            </motion.div>
                                        </div>
                                        <span className={cn("text-xs mt-2", textMuted)}>{data.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </GlowingCard>
                </div>

                {/* Patient Satisfaction */}
                <div>
                    <GlowingCard glowColor="teal" className="p-6 h-full">
                        <h2 className={cn("text-lg font-semibold mb-6", textPrimary)}>Patient Satisfaction</h2>

                        <div className="text-center mb-6">
                            <div className="relative w-32 h-32 mx-auto">
                                <svg className="w-full h-full -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="none"
                                        className={isDark ? "text-slate-800" : "text-gray-200"}
                                    />
                                    <motion.circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                        className="text-teal-500"
                                        initial={{ strokeDasharray: "0 352" }}
                                        animate={{ strokeDasharray: "324 352" }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={cn("text-3xl font-bold", textPrimary)}>92%</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className={textSecondary}>Excellent</span>
                                <span className={textPrimary}>68%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className={textSecondary}>Good</span>
                                <span className={textPrimary}>24%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className={textSecondary}>Average</span>
                                <span className={textPrimary}>8%</span>
                            </div>
                        </div>
                    </GlowingCard>
                </div>
            </div>

            {/* Top Diagnoses */}
            <GlowingCard glowColor="teal" className="p-6">
                <h2 className={cn("text-lg font-semibold mb-6", textPrimary)}>Top Diagnoses This Month</h2>
                <div className="space-y-4">
                    {topDiagnoses.map((diagnosis, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <div className="w-8 text-center">
                                <span className={cn("text-sm font-medium", textMuted)}>#{idx + 1}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={cn("text-sm font-medium", textPrimary)}>{diagnosis.name}</span>
                                    <span className={cn("text-sm", textSecondary)}>{diagnosis.count} patients</span>
                                </div>
                                <div className={cn("w-full h-2 rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-gray-200")}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${diagnosis.percentage}%` }}
                                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                                        className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full"
                                    />
                                </div>
                            </div>
                            <div className="w-12 text-right">
                                <span className="text-sm text-teal-500">{diagnosis.percentage}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </GlowingCard>
        </div>
    );
}
