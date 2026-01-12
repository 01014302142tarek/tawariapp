"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "./context/ThemeContext";
import { useI18n } from "@/app/i18n";
import { useAuth } from "@/app/context/AuthContext";
import { getPendingDoctors, getVerificationStats, approveDoctor, rejectDoctor, getRecentActivity, type AdminActivityItem } from "@/app/actions/admin-verification";
import { getAdminUserStats } from "@/app/actions/admin-users";
import { getAdminAnalytics, getSystemOverview, type SystemOverviewMetrics } from "@/app/actions/admin-analytics";

// Import Aceternity components
import { GlowingCard } from "@/components/ui/glowing-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { SparklesCore } from "@/components/ui/sparkles";

// ============================================
// ICONS
// ============================================
const Icons = {
    users: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    doctor: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
    ),
    patient: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    ),
    money: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    chart: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
    ),
    settings: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    x: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    hand: (
        <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
    ),
    arrowUp: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
    ),
    clock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    server: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
        </svg>
    ),
    activity: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
    ),
};

// ============================================
// COMPONENTS
// ============================================

const ProgressBar = ({ value, max, isDark = true }: { value: number; max: number; color?: string; isDark?: boolean }) => {
    const percentage = (value / max) * 100;
    return (
        <div className={cn("w-full h-2 rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-gray-200")}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400"
            />
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminDashboard() {
    const { theme } = useTheme();
    const { t, isRTL, formatNumber } = useI18n();
    const { profile } = useAuth();
    const isDark = theme === "dark";

    // Get admin's first name from profile
    const adminName = profile?.profile.full_name?.split(' ')[0] || "";

    // Use state for time-based greeting to avoid hydration mismatch
    const [greetingKey, setGreetingKey] = useState<"morning" | "afternoon" | "evening">("morning");

    useEffect(() => {
        const time = new Date().getHours();
        setGreetingKey(time < 12 ? "morning" : time < 17 ? "afternoon" : "evening");
    }, []);

    const greeting = t.doctorDashboard.greeting[greetingKey];

    // State for pending doctors
    const [pendingApprovals, setPendingApprovals] = useState<Array<{
        id: string;
        name: string;
        email: string;
        specialty: string | null;
        image: string;
        date: string;
    }>>([]);
    const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0, total: 0 });
    const [recentActivity, setRecentActivity] = useState<AdminActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State for real dashboard stats
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        totalDoctors: 0,
        totalPatients: 0,
        totalRevenue: 0,
    });
    const [systemMetrics, setSystemMetrics] = useState<SystemOverviewMetrics>({
        uptime_percentage: 0,
        satisfaction_percentage: 0,
        active_sessions: 0,
        total_sessions_capacity: 200,
    });

    // Fetch pending doctors on mount
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [doctorsResult, statsResult, activityResult, userStatsResult, analyticsResult, systemOverviewResult] = await Promise.all([
                    getPendingDoctors(), // Defaults to "pending"
                    getVerificationStats(),
                    getRecentActivity(),
                    getAdminUserStats(),
                    getAdminAnalytics(),
                    getSystemOverview(),
                ]);

                if (doctorsResult.doctors) {
                    setPendingApprovals(doctorsResult.doctors.slice(0, 3).map(doc => ({
                        id: doc.id,
                        name: doc.fullName,
                        email: doc.email,
                        specialty: doc.specialty,
                        image: doc.avatarUrl || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
                        date: new Date(doc.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "en-US"),
                    })));
                }
                setStats(statsResult);
                setRecentActivity(activityResult);

                // Set real dashboard stats
                if (userStatsResult.stats && analyticsResult.analytics) {
                    setDashboardStats({
                        totalUsers: userStatsResult.stats.total_users,
                        totalDoctors: userStatsResult.stats.doctors,
                        totalPatients: userStatsResult.stats.patients,
                        totalRevenue: analyticsResult.analytics.total_revenue,
                    });
                }

                // Set real system metrics
                if (systemOverviewResult.metrics) {
                    setSystemMetrics(systemOverviewResult.metrics);
                }
            } catch {
                // Error fetching admin data - will show empty state
            }
            setIsLoading(false);
        }
        fetchData();
    }, [isRTL]);

    // Handle approve/reject
    const handleApprove = async (doctorId: string) => {
        const result = await approveDoctor(doctorId);
        if (result.success) {
            setPendingApprovals(prev => prev.filter(d => d.id !== doctorId));
            setStats(prev => ({ ...prev, pending: prev.pending - 1, verified: prev.verified + 1 }));
        }
    };

    const handleReject = async (doctorId: string) => {
        const result = await rejectDoctor(doctorId, "Application rejected");
        if (result.success) {
            setPendingApprovals(prev => prev.filter(d => d.id !== doctorId));
            setStats(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
        }
    };

    // Helper function to format relative time
    const formatRelativeTime = (timestamp: string): string => {
        const now = Date.now();
        const then = new Date(timestamp).getTime();
        const diffMinutes = Math.floor((now - then) / (1000 * 60));

        if (diffMinutes < 1) {
            return isRTL ? "الآن" : "Just now";
        } else if (diffMinutes < 60) {
            return isRTL ? `منذ ${formatNumber(diffMinutes)} دقيقة` : `${diffMinutes} ${t.common.time.minsAgo}`;
        } else if (diffMinutes < 1440) {
            const hours = Math.floor(diffMinutes / 60);
            return isRTL ? `منذ ${formatNumber(hours)} ساعة` : `${hours} ${t.common.time.hoursAgo}`;
        } else {
            const days = Math.floor(diffMinutes / 1440);
            return isRTL ? `منذ ${formatNumber(days)} يوم` : `${days}d ago`;
        }
    };

    // Map activity action types to translated labels
    const getActivityLabel = (actionType: string, action: string): string => {
        switch (actionType) {
            case "registration":
                return action.includes("doctor") ? t.adminDashboard.activity.registration : t.adminDashboard.activity.registration;
            case "payment":
                return t.adminDashboard.activity.payment;
            case "appointment":
                return t.adminDashboard.activity.appointment;
            case "approval":
                return t.adminDashboard.activity.approval;
            default:
                return action;
        }
    };

    return (
        <div className="relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="admin-dashboard-sparkles"
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={isDark ? 25 : 15}
                    particleColor={isDark ? "20, 184, 166" : "13, 148, 136"}
                />
                {isDark && (
                    <>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
                    </>
                )}
            </div>

            {/* Main Content */}
            <main className="relative z-0 p-4 md:p-6 lg:p-8">
                {/* Greeting */}
                <section className="mb-6 md:mb-8">
                    <h2 className={cn("text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3", isDark ? "text-white" : "text-slate-900")}>
                        {greeting}, {adminName} {Icons.hand}
                    </h2>
                    <p className={cn("text-base md:text-lg", isDark ? "text-gray-400" : "text-gray-600")}>
                        {t.adminDashboard.greeting.subtitle}
                    </p>
                </section>

                {/* Stats - Horizontal Cards Layout */}
                <section className="mb-6 md:mb-8">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {[
                            { label: t.adminDashboard.stats.totalUsers, value: dashboardStats.totalUsers, change: "+12%", icon: Icons.users, color: "teal" },
                            { label: t.adminDashboard.stats.totalDoctors, value: dashboardStats.totalDoctors, change: "+5%", icon: Icons.doctor, color: "emerald" },
                            { label: t.adminDashboard.stats.totalPatients, value: dashboardStats.totalPatients, change: "+18%", icon: Icons.patient, color: "blue" },
                            { label: t.adminDashboard.stats.totalRevenue, value: dashboardStats.totalRevenue, suffix: isRTL ? " ج.م" : " EGP", change: "+23%", icon: Icons.money, color: "amber" },
                        ].map((stat, idx) => (
                            <GlowingCard key={idx} glowColor="teal" className="p-3 md:p-5" isDark={isDark}>
                                <div className="flex items-start justify-between mb-2 md:mb-4">
                                    <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center bg-teal-500/10 text-teal-500">
                                        <span className="[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">
                                            {stat.icon}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-0.5 md:gap-1 text-emerald-500 text-xs md:text-sm font-medium">
                                        {Icons.arrowUp}
                                        {formatNumber(stat.change)}
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-0.5 md:gap-1">
                                    <span className={cn("text-xl md:text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                        {isLoading ? (
                                            <span className="animate-pulse">--</span>
                                        ) : (
                                            <AnimatedNumber value={stat.value} format={(v) => formatNumber(v)} />
                                        )}
                                    </span>
                                    {stat.suffix && <span className={cn("text-xs md:text-lg", isDark ? "text-gray-400" : "text-gray-500")}>{stat.suffix}</span>}
                                </div>
                                <p className={cn("text-xs md:text-sm mt-1 truncate", isDark ? "text-gray-500" : "text-gray-600")}>{stat.label}</p>
                            </GlowingCard>
                        ))}
                    </div>
                </section>

                {/* Main Grid - 3 column asymmetric layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 mb-6 md:mb-8">
                    {/* Pending Approvals - Wide */}
                    <div className="md:col-span-1 lg:col-span-5">
                        <GlowingCard glowColor="teal" className="p-4 md:p-6 h-full" isDark={isDark}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                        {Icons.clock}
                                    </div>
                                    <div>
                                        <h3 className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.stats.pendingApprovals}</h3>
                                        <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-600")}>{formatNumber(stats.pending)} {t.adminDashboard.stats.awaitingReview}</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/admin/doctors" className="text-teal-500 hover:text-teal-400 text-sm font-medium">
                                    {t.common.viewAll} {isRTL ? "←" : "→"}
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {isLoading ? (
                                    <div className={cn("p-8 text-center rounded-xl border", isDark ? "border-white/5" : "border-gray-200")}>
                                        <div className="animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-2" />
                                        <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-600")}>{t.common.loading || (isRTL ? "جاري التحميل..." : "Loading...")}</p>
                                    </div>
                                ) : pendingApprovals.length === 0 ? (
                                    <div className={cn("p-8 text-center rounded-xl border", isDark ? "border-white/5" : "border-gray-200")}>
                                        <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-600")}>
                                            {isRTL ? "لا توجد طلبات معلقة" : "No pending approvals"}
                                        </p>
                                    </div>
                                ) : pendingApprovals.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                            isDark ? "bg-white/[0.02] border-white/5 hover:border-teal-500/20" : "bg-gray-50 border-gray-200 hover:border-teal-500/30"
                                        )}
                                    >
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-teal-500/30 flex-shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("font-medium text-sm truncate", isDark ? "text-white" : "text-slate-900")}>{item.name}</p>
                                            <p className={cn("text-xs truncate", isDark ? "text-gray-500" : "text-gray-600")}>{item.specialty}</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => handleApprove(item.id)}
                                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white transition-all"
                                            >
                                                {Icons.check}
                                            </button>
                                            <button
                                                onClick={() => handleReject(item.id)}
                                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all"
                                            >
                                                {Icons.x}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </GlowingCard>
                    </div>

                    {/* System Status & Performance */}
                    <div className="md:col-span-1 lg:col-span-4">
                        <GlowingCard glowColor="teal" className="p-4 md:p-6 h-full" isDark={isDark}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                    {Icons.server}
                                </div>
                                <h3 className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.sections.systemOverview}</h3>
                            </div>

                            {/* System Status */}
                            <div className={cn("p-4 rounded-xl border mb-5", isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200")}>
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                                    </span>
                                    <div>
                                        <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.system.allOperational}</p>
                                        <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-600")}>{t.adminDashboard.system.lastChecked}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-4">
                                {[
                                    { label: t.adminDashboard.system.uptime, current: systemMetrics.uptime_percentage, max: 100, color: "emerald" },
                                    { label: t.adminDashboard.system.satisfaction, current: systemMetrics.satisfaction_percentage, max: 100, color: "teal" },
                                    { label: t.adminDashboard.system.sessions, current: systemMetrics.active_sessions, max: systemMetrics.total_sessions_capacity, color: "blue" },
                                ].map((metric, idx) => {
                                    const percentage = Math.round((metric.current / metric.max) * 100);
                                    return (
                                        <div key={idx}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{metric.label}</span>
                                                <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{formatNumber(percentage)}%</span>
                                            </div>
                                            <ProgressBar value={metric.current} max={metric.max} color={metric.color} isDark={isDark} />
                                        </div>
                                    );
                                })}
                            </div>
                        </GlowingCard>
                    </div>

                    {/* Recent Activity */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <GlowingCard glowColor="teal" className="p-4 md:p-6 h-full" isDark={isDark}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                    {Icons.activity}
                                </div>
                                <h3 className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.sections.recentActivity}</h3>
                            </div>

                            <div className="space-y-4">
                                {recentActivity.length === 0 ? (
                                    <div className={cn("p-4 text-center", isDark ? "text-gray-500" : "text-gray-600")}>
                                        <p className="text-sm">{isRTL ? "لا يوجد نشاط حديث" : "No recent activity"}</p>
                                    </div>
                                ) : recentActivity.map((activity, idx) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-start gap-3"
                                    >
                                        <div className={cn(
                                            "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                                            activity.actionType === "registration" ? "bg-teal-500" :
                                                activity.actionType === "payment" ? "bg-emerald-500" :
                                                    activity.actionType === "approval" ? "bg-blue-500" : "bg-amber-500"
                                        )} />
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                                                {getActivityLabel(activity.actionType, activity.action)}
                                            </p>
                                            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-600")}>
                                                {activity.name} • {formatRelativeTime(activity.timestamp)}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </GlowingCard>
                    </div>
                </div>

                {/* Quick Actions - Bottom Row */}
                <section>
                    <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.sections.quickActions}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {[
                            { title: t.adminDashboard.actions.addDoctor, description: t.adminDashboard.actionDesc.registerDoctor, icon: Icons.doctor, href: "/dashboard/admin/doctors" },
                            { title: t.adminDashboard.actions.addPatient, description: t.adminDashboard.actionDesc.registerPatient, icon: Icons.patient, href: "/dashboard/admin/patients" },
                            { title: t.adminDashboard.actions.viewReports, description: t.adminDashboard.actionDesc.analytics, icon: Icons.chart, href: "/dashboard/admin/analytics" },
                            { title: t.common.settings, description: t.adminDashboard.actionDesc.config, icon: Icons.settings, href: "/dashboard/admin/settings" },
                        ].map((action, idx) => (
                            <Link key={idx} href={action.href}>
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <GlowingCard glowColor="teal" className="p-3 md:p-4 cursor-pointer group h-full" isDark={isDark}>
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 mb-2 md:mb-3 group-hover:bg-teal-500 group-hover:text-white transition-all">
                                            <span className="[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">
                                                {action.icon}
                                            </span>
                                        </div>
                                        <h4 className={cn("font-medium text-xs md:text-sm group-hover:text-teal-500 transition-colors truncate", isDark ? "text-white" : "text-slate-900")}>
                                            {action.title}
                                        </h4>
                                        <p className={cn("text-[10px] md:text-xs mt-0.5 truncate", isDark ? "text-gray-500" : "text-gray-600")}>{action.description}</p>
                                    </GlowingCard>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
