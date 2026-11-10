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
import { getAdminAppointments, getAppointmentStats, approveManualPayment, rejectManualPayment, type AdminAppointment, type AppointmentStatus } from "@/app/actions/admin-appointments";

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
    receipt: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
    ),
    externalLink: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    ),
};

const Badge = ({ variant, children }: { variant: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        scheduled: "bg-[#FD614B]/10 text-[#FD614B] border border-[#FD614B]/20",
        in_waiting_room: "bg-[#FD614B]/10 text-[#FD614B] border border-[#FD614B]/20",
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
    const [selectedReceiptAppointment, setSelectedReceiptAppointment] = useState<AdminAppointment | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [rejectModalAppointment, setRejectModalAppointment] = useState<AdminAppointment | null>(null);
    const [rejectionReasonInput, setRejectionReasonInput] = useState("");

    const handleApprove = async (txId: string, appointmentId: string) => {
        setActionLoadingId(txId);
        try {
            const res = await approveManualPayment(txId);
            if (res.success) {
                setAppointments(prev => prev.map(a => {
                    if (a.id === appointmentId && a.payment) {
                        return {
                            ...a,
                            payment: {
                                ...a.payment,
                                adminApproval: "approved",
                                approvedAt: new Date().toISOString(),
                            }
                        };
                    }
                    return a;
                }));
                if (selectedReceiptAppointment?.id === appointmentId && selectedReceiptAppointment.payment) {
                    setSelectedReceiptAppointment({
                        ...selectedReceiptAppointment,
                        payment: {
                            ...selectedReceiptAppointment.payment,
                            adminApproval: "approved",
                            approvedAt: new Date().toISOString(),
                        }
                    });
                }
            } else {
                alert(res.error || (language === "ar" ? "فشل اعتماد الدفع" : "Failed to approve payment"));
            }
        } catch (e) {
            console.error("Approve error:", e);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModalAppointment?.payment?.transactionId) return;
        const txId = rejectModalAppointment.payment.transactionId;
        const aptId = rejectModalAppointment.id;
        const reason = rejectionReasonInput.trim() || (language === "ar" ? "لم يصل المبلغ على الحساب أو الإيصال غير مطابق" : "Payment not received or invalid receipt");

        setActionLoadingId(txId);
        try {
            const res = await rejectManualPayment(txId, reason);
            if (res.success) {
                setAppointments(prev => prev.map(a => {
                    if (a.id === aptId) {
                        return {
                            ...a,
                            status: "cancelled",
                            cancellation_reason: `تم رفض إيصال التحويل: ${reason}`,
                            payment: a.payment ? {
                                ...a.payment,
                                adminApproval: "rejected",
                                rejectionReason: reason,
                            } : null
                        };
                    }
                    return a;
                }));
                setRejectModalAppointment(null);
                setRejectionReasonInput("");
                if (selectedReceiptAppointment?.id === aptId) {
                    setSelectedReceiptAppointment(null);
                }
            } else {
                alert(res.error || (language === "ar" ? "فشل رفض الدفع" : "Failed to reject payment"));
            }
        } catch (e) {
            console.error("Reject error:", e);
        } finally {
            setActionLoadingId(null);
        }
    };

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
                    <div className="text-[#FD614B] mb-4 flex justify-center">{Icons.spinner}</div>
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
                    particleColor={isDark ? "253, 97, 75" : "4, 76, 135"}
                />
                {isDark && (
                    <>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FD614B]/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FD614B]/10 rounded-full blur-3xl" />
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
                        <GlowingCard key={idx} glowColor="coral" className="p-3 md:p-4" isDark={isDark}>
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#044C87] to-[#0C67B3] text-white shadow-[0_0_15px_rgba(4,76,135,0.4)] border border-[#0C67B3]/40">
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
                <GlowingCard glowColor="coral" className="p-3 md:p-4 mb-4 md:mb-6" isDark={isDark}>
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
                                        ? "bg-[#0D2C4F]/50 border-white/10 text-white placeholder-gray-500 focus:border-[#FD614B]/50"
                                        : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-[#FD614B]"
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
                                            ? "bg-[#FD614B] text-white"
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
                            <div className="text-[#FD614B] mb-4 flex justify-center">{Icons.spinner}</div>
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
                                <GlowingCard glowColor="coral" className="p-3 md:p-5" isDark={isDark}>
                                    <div className="flex flex-col gap-4">
                                        {/* Main Info Row */}
                                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                                            {/* Patient Info */}
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden border-2 border-[#FD614B]/40 flex-shrink-0">
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
                                                    <p className={cn("text-sm md:text-base font-medium text-[#FD614B]")}>{formatCurrency(apt.consultation_fee)}</p>
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
                                        {/* Payment / Receipt Information */}
                                        {apt.payment && (
                                            <div className={cn(
                                                "p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs",
                                                apt.payment.adminApproval === "pending"
                                                    ? (isDark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200")
                                                    : apt.payment.adminApproval === "approved"
                                                    ? (isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200")
                                                    : (isDark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200")
                                            )}>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-md font-bold text-xs flex items-center gap-1",
                                                        apt.payment.adminApproval === "pending"
                                                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                                            : apt.payment.adminApproval === "approved"
                                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                                            : "bg-red-500/20 text-red-400 border border-red-500/40"
                                                    )}>
                                                        {apt.payment.adminApproval === "pending" ? (
                                                            <>
                                                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                                                {language === "ar" ? "في انتظار تأكيد الإدارة" : "Pending Approval"}
                                                            </>
                                                        ) : apt.payment.adminApproval === "approved" ? (
                                                            <>
                                                                <span>✓</span>
                                                                {language === "ar" ? "تم تأكيد الدفع" : "Payment Approved"}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>✕</span>
                                                                {language === "ar" ? "تم رفض الدفع" : "Payment Rejected"}
                                                            </>
                                                        )}
                                                    </span>

                                                    <span className={cn("px-2.5 py-1 rounded-md font-bold text-xs", isDark ? "bg-white/10 text-white" : "bg-white text-slate-900 border border-slate-200")}>
                                                        {apt.payment.methodLabelAr || (apt.payment.paymentMethod === "instapay" ? "إنستا باي (InstaPay)" : apt.payment.paymentMethod === "wepay" ? "وي باي (WE Pay)" : apt.payment.paymentMethod)}
                                                    </span>

                                                    {apt.payment.targetPhone && (
                                                        <span className={cn("font-mono font-medium px-2 py-0.5 rounded", isDark ? "bg-black/30 text-gray-300" : "bg-white text-gray-700")}>
                                                            {language === "ar" ? "المحوّل إليه:" : "Target:"} {apt.payment.targetPhone}
                                                        </span>
                                                    )}
                                                    {apt.payment.senderName && (
                                                        <span className={cn(isDark ? "text-gray-300" : "text-gray-700")}>
                                                            • {language === "ar" ? "المحوّل:" : "Sender:"} <strong className="font-semibold">{apt.payment.senderName}</strong>
                                                        </span>
                                                    )}
                                                    {apt.payment.senderPhone && (
                                                        <span className={cn("font-mono", isDark ? "text-gray-400" : "text-gray-600")}>
                                                            ({apt.payment.senderPhone})
                                                        </span>
                                                    )}
                                                    {apt.payment.rejectionReason && (
                                                        <span className="text-red-400 font-medium">
                                                            • {language === "ar" ? `السبب: ${apt.payment.rejectionReason}` : `Reason: ${apt.payment.rejectionReason}`}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {apt.payment.receiptUrl && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedReceiptAppointment(apt)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white font-semibold transition-all shadow-sm"
                                                        >
                                                            {Icons.receipt}
                                                            <span>{language === "ar" ? "معاينة الإيصال" : "View Receipt"}</span>
                                                        </button>
                                                    )}

                                                    {apt.payment.transactionId && (
                                                        <div className="flex items-center gap-1.5">
                                                            {apt.payment.adminApproval !== "approved" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={actionLoadingId === apt.payment.transactionId}
                                                                    onClick={() => handleApprove(apt.payment!.transactionId!, apt.id)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm disabled:opacity-50"
                                                                >
                                                                    {actionLoadingId === apt.payment.transactionId ? (
                                                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                    ) : (
                                                                        <span>✓</span>
                                                                    )}
                                                                    <span>{language === "ar" ? "تأكيد واستلام" : "Approve"}</span>
                                                                </button>
                                                            )}

                                                            {apt.payment.adminApproval !== "rejected" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={actionLoadingId === apt.payment.transactionId}
                                                                    onClick={() => setRejectModalAppointment(apt)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold transition-all disabled:opacity-50"
                                                                >
                                                                    <span>✕</span>
                                                                    <span>{language === "ar" ? "رفض الدفع" : "Reject"}</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
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
                                                        ? "bg-[#FD614B] text-white"
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
                {/* Receipt Preview Modal */}
                {selectedReceiptAppointment && selectedReceiptAppointment.payment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                                "relative w-full max-w-xl max-h-[92vh] overflow-hidden rounded-2xl border shadow-2xl flex flex-col",
                                isDark ? "bg-[#031326] border-white/15" : "bg-white border-slate-200"
                            )}
                        >
                            {/* Modal Header */}
                            <div className={cn("p-4 border-b flex items-center justify-between", isDark ? "border-white/10" : "border-slate-200")}>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#FD614B]">{Icons.receipt}</span>
                                    <h3 className={cn("font-bold text-base md:text-lg", isDark ? "text-white" : "text-slate-900")}>
                                        {language === "ar" ? "إيصال التحويل - تأكيد الدفع" : "Payment Transfer Receipt"}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedReceiptAppointment(null)}
                                    className={cn("p-1.5 rounded-lg transition-colors", isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-600")}
                                >
                                    {Icons.x}
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4 overflow-y-auto flex-1 space-y-4">
                                {/* Image Preview */}
                                <div className="relative w-full h-80 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                                    {selectedReceiptAppointment.payment.receiptUrl ? (
                                        <Image
                                            src={selectedReceiptAppointment.payment.receiptUrl}
                                            alt="Receipt Screenshot"
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    ) : (
                                        <p className="text-gray-400 text-sm">{language === "ar" ? "لا توجد صورة متوفرة" : "No image available"}</p>
                                    )}
                                </div>

                                {/* Transfer Details Card */}
                                <div className={cn("p-4 rounded-xl space-y-2 text-sm border", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                                    <div className="flex justify-between items-center">
                                        <span className={isDark ? "text-gray-400" : "text-gray-600"}>{language === "ar" ? "طريقة الدفع:" : "Method:"}</span>
                                        <span className="font-bold text-[#FD614B]">
                                            {selectedReceiptAppointment.payment.methodLabelAr || selectedReceiptAppointment.payment.paymentMethod}
                                        </span>
                                    </div>
                                    {selectedReceiptAppointment.payment.targetPhone && (
                                        <div className="flex justify-between items-center">
                                            <span className={isDark ? "text-gray-400" : "text-gray-600"}>{language === "ar" ? "الرقم المحوّل إليه:" : "Target Number:"}</span>
                                            <span className="font-mono font-bold">{selectedReceiptAppointment.payment.targetPhone}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className={isDark ? "text-gray-400" : "text-gray-600"}>{language === "ar" ? "قيمة الاستشارة:" : "Consultation Fee:"}</span>
                                        <span className="font-bold text-emerald-500">
                                            {formatCurrency(selectedReceiptAppointment.consultation_fee)}
                                        </span>
                                    </div>
                                    {selectedReceiptAppointment.payment.senderName && (
                                        <div className="flex justify-between items-center">
                                            <span className={isDark ? "text-gray-400" : "text-gray-600"}>{language === "ar" ? "اسم المحوّل:" : "Sender Name:"}</span>
                                            <span className="font-medium">{selectedReceiptAppointment.payment.senderName}</span>
                                        </div>
                                    )}
                                    {selectedReceiptAppointment.payment.senderPhone && (
                                        <div className="flex justify-between items-center">
                                            <span className={isDark ? "text-gray-400" : "text-gray-600"}>{language === "ar" ? "رقم هاتف المحوّل:" : "Sender Phone:"}</span>
                                            <span className="font-mono">{selectedReceiptAppointment.payment.senderPhone}</span>
                                        </div>
                                    )}
                                    {selectedReceiptAppointment.payment.uploadedAt && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className={isDark ? "text-gray-400" : "text-gray-600"}>{language === "ar" ? "تاريخ الإرسال:" : "Submitted At:"}</span>
                                            <span className="font-mono">{new Date(selectedReceiptAppointment.payment.uploadedAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US")}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className={cn("p-4 border-t flex flex-wrap items-center justify-between gap-3", isDark ? "border-white/10" : "border-slate-200")}>
                                {selectedReceiptAppointment.payment.receiptUrl && (
                                    <a
                                        href={selectedReceiptAppointment.payment.receiptUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={cn(
                                            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all",
                                            isDark ? "border-white/15 bg-white/5 hover:bg-white/10 text-white" : "border-slate-300 bg-white hover:bg-slate-50 text-slate-800"
                                        )}
                                    >
                                        {Icons.externalLink}
                                        <span>{language === "ar" ? "فتح الصورة بحجمها الكامل" : "Open Full Image"}</span>
                                    </a>
                                )}

                                <div className="flex items-center gap-2 ml-auto">
                                    {selectedReceiptAppointment.payment.transactionId && (
                                        <>
                                            {selectedReceiptAppointment.payment.adminApproval !== "approved" ? (
                                                <button
                                                    type="button"
                                                    disabled={actionLoadingId === selectedReceiptAppointment.payment.transactionId}
                                                    onClick={() => handleApprove(selectedReceiptAppointment.payment!.transactionId!, selectedReceiptAppointment.id)}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md"
                                                >
                                                    {actionLoadingId === selectedReceiptAppointment.payment.transactionId ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <span>✓</span>
                                                    )}
                                                    <span>{language === "ar" ? "تأكيد واستلام المبلغ" : "Approve Payment"}</span>
                                                </button>
                                            ) : (
                                                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                                                    <span>✓</span>
                                                    <span>{language === "ar" ? "معتمد ومقبول" : "Approved"}</span>
                                                </span>
                                            )}

                                            {selectedReceiptAppointment.payment.adminApproval !== "rejected" ? (
                                                <button
                                                    type="button"
                                                    disabled={actionLoadingId === selectedReceiptAppointment.payment.transactionId}
                                                    onClick={() => setRejectModalAppointment(selectedReceiptAppointment)}
                                                    className="flex items-center gap-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                >
                                                    <span>✕</span>
                                                    <span>{language === "ar" ? "رفض الدفع" : "Reject"}</span>
                                                </button>
                                            ) : (
                                                <span className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1">
                                                    <span>✕</span>
                                                    <span>{language === "ar" ? "مرفوض" : "Rejected"}</span>
                                                </span>
                                            )}
                                        </>
                                    )}

                                    <button
                                        onClick={() => setSelectedReceiptAppointment(null)}
                                        className="px-5 py-2 bg-gradient-to-r from-[#FD614B] to-[#E84D37] text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all"
                                    >
                                        {language === "ar" ? "إغلاق" : "Close"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Reject Confirmation Modal */}
                {rejectModalAppointment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                                "w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4",
                                isDark ? "bg-[#031326] border-red-500/30" : "bg-white border-red-200"
                            )}
                        >
                            <div className="flex items-center gap-3 text-red-500">
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center font-bold text-lg">
                                    ✕
                                </div>
                                <div>
                                    <h3 className={cn("font-bold text-base", isDark ? "text-white" : "text-slate-900")}>
                                        {language === "ar" ? "رفض إيصال التحويل" : "Reject Payment Receipt"}
                                    </h3>
                                    <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                                        {language === "ar" ? "سيتم إلغاء الموعد وإخطار المريض بسبب الرفض" : "Appointment will be cancelled and patient will be notified"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={cn("text-xs font-semibold block", isDark ? "text-gray-300" : "text-gray-700")}>
                                    {language === "ar" ? "سبب الرفض (سيظهر للمريض):" : "Rejection Reason (visible to patient):"}
                                </label>
                                <textarea
                                    rows={3}
                                    value={rejectionReasonInput}
                                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                                    placeholder={language === "ar" ? "مثال: لم يتم استلام المبلغ على الحساب أو صورة الإيصال غير واضحة" : "e.g. Amount not received or receipt image is unreadable"}
                                    className={cn(
                                        "w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-red-500 resize-none",
                                        isDark ? "bg-white/5 border-white/10 text-white placeholder-gray-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-gray-400"
                                    )}
                                />
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {[
                                        "لم يصل المبلغ على الحساب",
                                        "المبلغ المحول غير مطابق",
                                        "صورة الإيصال غير واضحة",
                                    ].map((quickReason) => (
                                        <button
                                            key={quickReason}
                                            type="button"
                                            onClick={() => setRejectionReasonInput(quickReason)}
                                            className={cn(
                                                "text-[10px] px-2 py-1 rounded-md border transition-all",
                                                isDark ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                                            )}
                                        >
                                            {quickReason}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRejectModalAppointment(null);
                                        setRejectionReasonInput("");
                                    }}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-semibold border transition-all",
                                        isDark ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-slate-200 text-gray-700 hover:bg-slate-100"
                                    )}
                                >
                                    {language === "ar" ? "إلغاء" : "Cancel"}
                                </button>
                                <button
                                    type="button"
                                    disabled={Boolean(actionLoadingId)}
                                    onClick={handleReject}
                                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                                >
                                    {actionLoadingId ? (
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span>✕</span>
                                    )}
                                    <span>{language === "ar" ? "تأكيد الرفض وإلغاء الموعد" : "Confirm Rejection"}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}
