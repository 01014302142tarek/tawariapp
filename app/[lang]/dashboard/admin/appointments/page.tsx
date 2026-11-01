"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { SparklesCore } from "@/components/ui/sparkles";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useI18n } from "@/app/i18n";
import { getAdminAppointments, getAppointmentStats, type AdminAppointment, type AppointmentStatus } from "@/app/actions/admin-appointments";

const ITEMS_PER_PAGE = 10;

// Icons
const Icons = {
    calendar: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    check: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    x: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    clock: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    noShow: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
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
    chevronLeft: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    ),
    chevronRight: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
    user: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    message: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
    ),
};

const Badge = ({ variant, children }: { variant: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        scheduled: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        in_waiting_room: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        in_progress: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
        no_show: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant] || variants.scheduled)}>
            {children}
        </span>
    );
};

export default function AdminAppointmentsPage() {
    const { t, isRTL, formatNumber, language } = useI18n();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [loading, setLoading] = useState(false);
    const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
    const [totalAppointments, setTotalAppointments] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({ total: 0, scheduled: 0, completed: 0, cancelled: 0, no_show: 0 });

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Load appointments from database
    const loadAppointments = useCallback(async (page: number, searchTerm: string, status: AppointmentStatus | "all") => {
        setLoading(true);

        const offset = (page - 1) * ITEMS_PER_PAGE;
        const result = await getAdminAppointments({
            limit: ITEMS_PER_PAGE,
            offset,
            search: searchTerm || undefined,
            status: status,
        });
        if (!result.error) {
            setAppointments(result.appointments);
            setTotalAppointments(result.total);
        }

        setLoading(false);
        if (isFirstLoad) {
            setIsFirstLoad(false);
        }
    }, [isFirstLoad]);

    // Load stats
    useEffect(() => {
        async function loadStats() {
            const result = await getAppointmentStats();
            if (!result.error) {
                setStats(result.stats);
            }
        }
        loadStats();
    }, []);

    useEffect(() => {
        loadAppointments(currentPage, debouncedSearch, statusFilter);
    }, [currentPage, debouncedSearch, statusFilter, loadAppointments]);

    const totalPages = Math.ceil(totalAppointments / ITEMS_PER_PAGE);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const formatDate = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat(isRTL ? "ar-EG" : "en-EG", {
            style: "currency",
            currency: "EGP",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusLabel = (status: AppointmentStatus): string => {
        const labels: Record<AppointmentStatus, { en: string; ar: string }> = {
            scheduled: { en: "Scheduled", ar: "مجدول" },
            in_waiting_room: { en: "Waiting", ar: "في الانتظار" },
            in_progress: { en: "In Progress", ar: "جاري" },
            completed: { en: "Completed", ar: "مكتمل" },
            cancelled: { en: "Cancelled", ar: "ملغي" },
            no_show: { en: "No Show", ar: "لم يحضر" },
        };
        return isRTL ? labels[status].ar : labels[status].en;
    };

    const statCards = [
        { label: language === "ar" ? "إجمالي المواعيد" : "Total Appointments", value: stats.total, icon: Icons.calendar, color: "amber" },
        { label: language === "ar" ? "مجدول" : "Scheduled", value: stats.scheduled, icon: Icons.clock, color: "blue" },
        { label: language === "ar" ? "مكتمل" : "Completed", value: stats.completed, icon: Icons.check, color: "emerald" },
        { label: language === "ar" ? "ملغي" : "Cancelled", value: stats.cancelled, icon: Icons.x, color: "red" },
    ];

    const filters: { key: AppointmentStatus | "all"; label: string }[] = [
        { key: "all", label: language === "ar" ? "الكل" : "All" },
        { key: "scheduled", label: language === "ar" ? "مجدول" : "Scheduled" },
        { key: "completed", label: language === "ar" ? "مكتمل" : "Completed" },
        { key: "cancelled", label: language === "ar" ? "ملغي" : "Cancelled" },
        { key: "no_show", label: language === "ar" ? "لم يحضر" : "No Show" },
    ];

    if (isFirstLoad) {
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
                    id="appointments-sparkles"
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
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className={cn("text-xl md:text-2xl lg:text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                            {language === "ar" ? "المواعيد" : "Appointments"}
                        </h1>
                        <p className={cn("text-sm md:text-base lg:text-lg mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            {language === "ar" ? "إدارة جميع المواعيد ومراجعة أسباب الإلغاء" : "Manage all appointments and review cancellation reasons"}
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    {statCards.map((stat, idx) => (
                        <GlowingCard key={idx} glowColor="amber" className="p-3 md:p-4" isDark={isDark}>
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] border border-sky-300/40">
                                    <span className="[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">
                                        {stat.icon}
                                    </span>
                                </div>
                                <div>
                                    <p className={cn("text-lg md:text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                        <AnimatedNumber value={stat.value} format={formatNumber} />
                                    </p>
                                    <p className={cn("text-[10px] md:text-xs truncate", isDark ? "text-gray-500" : "text-gray-600")}>{stat.label}</p>
                                </div>
                            </div>
                        </GlowingCard>
                    ))}
                </div>

                {/* Search and Filters */}
                <GlowingCard glowColor="amber" className="p-3 md:p-4 mb-4 md:mb-6" isDark={isDark}>
                    <div className="flex flex-col gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <div className={cn("absolute top-1/2 -translate-y-1/2 text-gray-500", isRTL ? "right-3" : "left-3")}>{Icons.search}</div>
                            <input
                                type="text"
                                placeholder={language === "ar" ? "البحث عن المواعيد..." : "Search appointments..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={cn(
                                    "w-full py-2.5 rounded-xl border outline-none transition-colors",
                                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
                                    isDark
                                        ? "bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-amber-500/50"
                                        : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-amber-500"
                                )}
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            <span className={cn("text-xs font-medium flex items-center", isDark ? "text-gray-400" : "text-gray-600")}>
                                {language === "ar" ? "الحالة:" : "Status:"}
                            </span>
                            {filters.map((filter) => (
                                <button
                                    key={filter.key}
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter(filter.key);
                                        setCurrentPage(1);
                                    }}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                        statusFilter === filter.key
                                            ? "bg-amber-500 text-white"
                                            : isDark
                                                ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </GlowingCard>

                {/* Appointments List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="text-amber-500 mb-4 flex justify-center">{Icons.spinner}</div>
                            <p className={isDark ? "text-gray-400" : "text-gray-600"}>{t.common.loading || "Loading..."}</p>
                        </div>
                    </div>
                ) : appointments.length > 0 ? (
                    <div className="space-y-4">
                        {appointments.map((apt, idx) => (
                            <motion.div
                                key={apt.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <GlowingCard glowColor="amber" className="p-3 md:p-5" isDark={isDark}>
                                    <div className="flex flex-col gap-4">
                                        {/* Main Info Row */}
                                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                                            {/* Patient Info */}
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden border-2 border-amber-500/30 flex-shrink-0">
                                                    {apt.patient.avatar_url ? (
                                                        <Image
                                                            src={apt.patient.avatar_url}
                                                            alt={apt.patient.full_name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 768px) 40px, 48px"
                                                        />
                                                    ) : (
                                                        <div className={cn("w-full h-full flex items-center justify-center text-lg font-semibold", isDark ? "bg-slate-700 text-gray-300" : "bg-gray-200 text-gray-600")}>
                                                            {apt.patient.full_name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className={cn("font-semibold text-sm md:text-base", isDark ? "text-white" : "text-slate-900")}>{apt.patient.full_name}</h3>
                                                        <Badge variant={apt.status}>
                                                            {getStatusLabel(apt.status)}
                                                        </Badge>
                                                    </div>
                                                    <p className={cn("text-xs md:text-sm", isDark ? "text-gray-500" : "text-gray-600")}>
                                                        {language === "ar" ? "مريض" : "Patient"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <div className={cn("hidden md:flex items-center justify-center text-gray-500", isRTL && "rotate-180")}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </div>

                                            {/* Doctor Info */}
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden border-2 border-emerald-500/30 flex-shrink-0">
                                                    {apt.doctor.avatar_url ? (
                                                        <Image
                                                            src={apt.doctor.avatar_url}
                                                            alt={apt.doctor.full_name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 768px) 40px, 48px"
                                                        />
                                                    ) : (
                                                        <div className={cn("w-full h-full flex items-center justify-center text-lg font-semibold", isDark ? "bg-slate-700 text-gray-300" : "bg-gray-200 text-gray-600")}>
                                                            {apt.doctor.full_name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={cn("font-semibold text-sm md:text-base", isDark ? "text-white" : "text-slate-900")}>{apt.doctor.full_name}</h3>
                                                    <p className={cn("text-xs md:text-sm truncate", isDark ? "text-gray-500" : "text-gray-600")}>
                                                        {apt.doctor.specialty || (language === "ar" ? "طبيب" : "Doctor")}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Date/Time & Fee */}
                                            <div className="flex flex-wrap items-center gap-4 md:gap-6">
                                                <div className="text-center">
                                                    <p className={cn("text-sm md:text-base font-medium", isDark ? "text-white" : "text-slate-900")}>{formatDate(apt.scheduled_start)}</p>
                                                    <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>{formatTime(apt.scheduled_start)}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className={cn("text-sm md:text-base font-medium text-amber-500")}>{formatCurrency(apt.consultation_fee)}</p>
                                                    <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>
                                                        {language === "ar" ? "الرسوم" : "Fee"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cancellation Reason - Only show for cancelled appointments */}
                                        {apt.status === "cancelled" && apt.cancellation_reason && (
                                            <div className={cn(
                                                "p-3 md:p-4 rounded-xl border",
                                                isDark ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-100"
                                            )}>
                                                <div className="flex items-start gap-3">
                                                    <div className={cn("flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center", isDark ? "bg-red-500/10" : "bg-red-100")}>
                                                        {Icons.message}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className={cn("text-xs font-semibold", isDark ? "text-red-400" : "text-red-600")}>
                                                                {language === "ar" ? "سبب الإلغاء" : "Cancellation Reason"}
                                                            </p>
                                                            {apt.cancelled_by_name && (
                                                                <span className={cn("text-xs flex items-center gap-1", isDark ? "text-gray-500" : "text-gray-500")}>
                                                                    {Icons.user}
                                                                    {language === "ar" ? `بواسطة: ${apt.cancelled_by_name}` : `By: ${apt.cancelled_by_name}`}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-700")}>
                                                            {apt.cancellation_reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </GlowingCard>
                            </motion.div>
                        ))}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        currentPage === 1
                                            ? "opacity-50 cursor-not-allowed"
                                            : isDark
                                                ? "hover:bg-white/10"
                                                : "hover:bg-gray-100",
                                        isDark ? "text-gray-400" : "text-gray-600"
                                    )}
                                >
                                    {isRTL ? Icons.chevronRight : Icons.chevronLeft}
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                type="button"
                                                onClick={() => goToPage(pageNum)}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                                                    currentPage === pageNum
                                                        ? "bg-amber-500 text-white"
                                                        : isDark
                                                            ? "hover:bg-white/10 text-gray-400"
                                                            : "hover:bg-gray-100 text-gray-600"
                                                )}
                                            >
                                                {formatNumber(pageNum)}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        currentPage === totalPages
                                            ? "opacity-50 cursor-not-allowed"
                                            : isDark
                                                ? "hover:bg-white/10"
                                                : "hover:bg-gray-100",
                                        isDark ? "text-gray-400" : "text-gray-600"
                                    )}
                                >
                                    {isRTL ? Icons.chevronLeft : Icons.chevronRight}
                                </button>

                                <span className={cn("text-sm ml-4", isDark ? "text-gray-500" : "text-gray-600")}>
                                    {language === "ar"
                                        ? `${formatNumber(currentPage)} من ${formatNumber(totalPages)}`
                                        : `${formatNumber(currentPage)} of ${formatNumber(totalPages)}`}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", isDark ? "bg-white/5" : "bg-gray-100")}>
                            {Icons.calendar}
                        </div>
                        <h3 className={cn("text-lg font-medium mb-2", isDark ? "text-white" : "text-slate-900")}>
                            {language === "ar" ? "لا توجد مواعيد" : "No appointments found"}
                        </h3>
                        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                            {language === "ar" ? "حاول تعديل البحث أو الفلاتر" : "Try adjusting your search or filters"}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
