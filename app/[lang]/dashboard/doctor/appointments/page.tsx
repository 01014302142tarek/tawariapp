"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useThemeStyles } from "../context/useThemeStyles";
import { useI18n } from "@/app/i18n";
import { useToast } from "@/components/ui/toast";
import {
    getDoctorAppointments,
    startConsultation,
    endConsultation,
    cancelAppointmentAsDoctor,
    markNoShow,
    resetAppointmentToScheduled,
    type AppointmentWithDetails,
    type AppointmentStatus,
} from "@/app/actions/appointments";

// Icons
const Icons = {
    calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    search: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    video: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    clock: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    x: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    check: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    undo: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
    ),
};

// Badge Component
const Badge = ({ children, variant = "default", isDark = true, className }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "primary" | "error"; isDark?: boolean; className?: string }) => {
    const variants = {
        default: isDark ? "bg-slate-700/50 text-slate-300" : "bg-gray-200 text-gray-700",
        success: "bg-green-500/10 text-green-500 border border-green-500/20",
        warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        primary: "bg-teal-500/10 text-teal-500 border border-teal-500/20",
        error: "bg-red-500/10 text-red-500 border border-red-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap", variants[variant], className)}>
            {children}
        </span>
    );
};

export default function AppointmentsPage() {
    const router = useRouter();
    const { t, isRTL, language } = useI18n();
    const { showConfirm, showError } = useToast();
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const { isDark, textPrimary, textSecondary, textMuted, inputBg, inputFocus, buttonSecondary, divider, cardHover, emptyStateBg } = useThemeStyles();

    const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadAppointments = useCallback(async () => {
        setLoading(true);
        const result = await getDoctorAppointments();
        if (result.appointments) {
            setAppointments(result.appointments);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    const filters = [
        { id: "all", label: t.doctorDashboard.appointmentsPage.filters.all },
        { id: "upcoming", label: t.doctorDashboard.appointmentsPage.filters.upcoming },
        { id: "completed", label: t.doctorDashboard.appointmentsPage.filters.completed },
        { id: "cancelled", label: t.doctorDashboard.appointmentsPage.filters.cancelled }
    ];

    const getStatusVariant = (status: AppointmentStatus): "default" | "success" | "warning" | "primary" | "error" => {
        switch (status) {
            case "in_progress": return "warning";
            case "completed": return "success";
            case "scheduled": return "primary";
            case "in_waiting_room": return "warning";
            case "cancelled": return "error";
            case "no_show": return "error";
            default: return "default";
        }
    };

    const getStatusLabel = (status: AppointmentStatus): string => {
        switch (status) {
            case "in_progress": return t.doctorDashboard.appointmentsPage.status.inProgress;
            case "completed": return t.doctorDashboard.appointmentsPage.status.done;
            case "scheduled": return t.doctorDashboard.appointmentsPage.status.scheduled;
            case "in_waiting_room": return isRTL ? "في غرفة الانتظار" : "In Waiting Room";
            case "cancelled": return isRTL ? "ملغي" : "Cancelled";
            case "no_show": return isRTL ? "لم يحضر" : "No Show";
            default: return status;
        }
    };

    const formatTime = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatDate = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const isToday = (isoString: string): boolean => {
        const date = new Date(isoString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const handleStartConsultation = (appointmentId: string, patientName: string) => {
        showConfirm(
            isRTL
                ? `هل تريد بدء الاستشارة مع ${patientName}؟ سيتم تغيير حالة الموعد إلى "قيد التقدم".`
                : `Start consultation with ${patientName}? This will change the appointment status to "In Progress".`,
            async () => {
                setActionLoading(appointmentId);
                try {
                    const result = await startConsultation(appointmentId);
                    if (result.success) {
                        // Navigate to the embedded consultation page
                        router.push(`/${language}/dashboard/consultation/${appointmentId}`);
                    } else {
                        showError(result.error || (isRTL ? "فشل في بدء الاستشارة" : "Failed to start consultation"));
                    }
                } catch {
                    showError(isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
                }
                setActionLoading(null);
            }
        );
    };

    const handleEndConsultation = (appointmentId: string) => {
        showConfirm(
            isRTL
                ? "هل أنت متأكد من إنهاء هذه الاستشارة؟ سيتم تغيير حالة الموعد إلى \"مكتمل\"."
                : "Are you sure you want to end this consultation? This will mark the appointment as \"Completed\".",
            async () => {
                setActionLoading(appointmentId);
                await endConsultation(appointmentId);
                await loadAppointments();
                setActionLoading(null);
            }
        );
    };

    const handleResetToScheduled = (appointmentId: string, patientName: string) => {
        showConfirm(
            isRTL
                ? `هل تريد إعادة تعيين الموعد مع ${patientName} إلى حالة "مجدول"؟ سيتم حذف جلسة الاستشارة الحالية.`
                : `Reset appointment with ${patientName} back to "Scheduled"? This will delete the current consultation session.`,
            async () => {
                setActionLoading(appointmentId);
                try {
                    const result = await resetAppointmentToScheduled(appointmentId);
                    if (result.success) {
                        await loadAppointments();
                    } else {
                        showError(result.error || (isRTL ? "فشل في إعادة تعيين الموعد" : "Failed to reset appointment"));
                    }
                } catch {
                    showError(isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
                }
                setActionLoading(null);
            }
        );
    };

    const handleCancel = (appointmentId: string) => {
        showConfirm(
            isRTL ? "هل أنت متأكد من إلغاء هذا الموعد؟" : "Are you sure you want to cancel this appointment?",
            async () => {
                setActionLoading(appointmentId);
                await cancelAppointmentAsDoctor(appointmentId);
                await loadAppointments();
                setActionLoading(null);
            }
        );
    };

    const handleNoShow = async (appointmentId: string) => {
        setActionLoading(appointmentId);
        await markNoShow(appointmentId);
        await loadAppointments();
        setActionLoading(null);
    };

    const filteredAppointments = appointments.filter((apt) => {
        const matchesFilter = activeFilter === "all" ||
            (activeFilter === "upcoming" && ["scheduled", "in_waiting_room"].includes(apt.status)) ||
            (activeFilter === "completed" && apt.status === "completed") ||
            (activeFilter === "cancelled" && ["cancelled", "no_show"].includes(apt.status));
        const matchesSearch = apt.patient?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        return matchesFilter && matchesSearch;
    });

    const todayAppointments = filteredAppointments.filter(apt => isToday(apt.scheduled_start));
    const upcomingAppointments = filteredAppointments.filter(apt => !isToday(apt.scheduled_start) && new Date(apt.scheduled_start) > new Date());

    if (loading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                        <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.calendar}
                        </span>
                        {t.doctorDashboard.appointmentsPage.title}
                    </h1>
                    <p className={cn("text-sm md:text-base mt-1", textMuted)}>{t.doctorDashboard.appointmentsPage.subtitle}</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-3 mb-6 md:mb-8">
                {/* Search */}
                <div className="relative flex-1 md:max-w-md lg:max-w-lg">
                    <span className={cn("absolute top-1/2 -translate-y-1/2", isRTL ? "right-4" : "left-4", textMuted)}>
                        {Icons.search}
                    </span>
                    <input
                        type="text"
                        placeholder={t.doctorDashboard.appointmentsPage.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full py-3 rounded-xl border transition-colors outline-none ring-0 focus:ring-2 focus:ring-teal-500/20",
                            isRTL ? "pr-12 pl-4" : "pl-12 pr-4",
                            inputBg, inputFocus
                        )}
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 no-scrollbar">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap border",
                                activeFilter === filter.id
                                    ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20"
                                    : cn("border-transparent hover:border-teal-500/30", buttonSecondary)
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Today's Appointments */}
            {todayAppointments.length > 0 && (
                <section className="mb-6 md:mb-8">
                    <h2 className={cn("text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2", textPrimary)}>
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        {t.doctorDashboard.appointmentsPage.sections.today}
                    </h2>
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold tracking-wider uppercase opacity-60">
                        <div className="col-span-2">{t.doctorDashboard.appointmentsPage.tableHeaders.time}</div>
                        <div className="col-span-4">{t.doctorDashboard.appointmentsPage.tableHeaders.patient}</div>
                        <div className="col-span-3">{t.doctorDashboard.appointmentsPage.tableHeaders.purpose}</div>
                        <div className={cn("col-span-3", isRTL ? "text-left" : "text-right")}>{t.doctorDashboard.appointmentsPage.tableHeaders.statusActions}</div>
                    </div>
                    <GlowingCard isDark={isDark} glowColor="teal" className="p-0 overflow-hidden">
                        <div className={divider}>
                            {todayAppointments.map((apt, idx) => (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn(
                                        "flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 p-4 transition-colors items-start md:items-center",
                                        cardHover,
                                        apt.status === "in_progress" && "bg-teal-500/5 relative overflow-hidden"
                                    )}
                                >
                                    {apt.status === "in_progress" && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 md:rounded-l-lg" />
                                    )}

                                    {/* Time Block */}
                                    <div className="md:col-span-2 flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between md:justify-start">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
                                                {Icons.clock}
                                            </div>
                                            <span className={cn("text-base md:text-lg font-bold tracking-tight", textPrimary)}>
                                                {formatTime(apt.scheduled_start)}
                                            </span>
                                        </div>
                                        {/* Mobile Status Badge */}
                                        <div className="md:hidden">
                                            <Badge isDark={isDark} variant={getStatusVariant(apt.status)}>
                                                {getStatusLabel(apt.status)}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Patient Info */}
                                    <div className="md:col-span-4 flex items-center gap-3 w-full">
                                        <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-teal-500/20 flex-shrink-0">
                                            {apt.patient?.avatar_url ? (
                                                <Image src={apt.patient.avatar_url} alt={apt.patient.full_name} fill className="object-cover" unoptimized />
                                            ) : (
                                                <div className={cn("w-full h-full flex items-center justify-center text-lg font-bold", isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-600")}>
                                                    {apt.patient?.full_name.charAt(0) || "?"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("font-semibold truncate text-sm md:text-base", textPrimary)}>
                                                {apt.patient?.full_name || "Unknown Patient"}
                                            </p>
                                            <p className={cn("text-xs md:hidden truncate", textMuted)}>
                                                {apt.chief_complaint || t.doctorDashboard.appointmentsPage.types.consultation}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Purpose (Desktop Only) */}
                                    <div className={cn("hidden md:block md:col-span-3 text-sm truncate px-1", textSecondary)}>
                                        {apt.chief_complaint || t.doctorDashboard.appointmentsPage.types.consultation}
                                    </div>

                                    {/* Actions & Status (Desktop) */}
                                    <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3 w-full border-t md:border-t-0 pt-3 md:pt-0 mt-1 md:mt-0 border-white/5">
                                        <div className="hidden md:block">
                                            <Badge isDark={isDark} variant={getStatusVariant(apt.status)}>
                                                {getStatusLabel(apt.status)}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                            {actionLoading === apt.id ? (
                                                <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full" />
                                            ) : (
                                                <>
                                                    {apt.status === "scheduled" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStartConsultation(apt.id, apt.patient?.full_name || "Patient")}
                                                                className="flex items-center gap-2 px-3 py-1.5 md:py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-all text-sm font-medium shadow-lg shadow-teal-500/20"
                                                            >
                                                                {Icons.video}
                                                                <span className="md:hidden lg:inline">{t.doctorDashboard.appointmentsPage.actions.join}</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancel(apt.id)}
                                                                className={cn("p-2 rounded-lg transition-colors", isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50")}
                                                                title={isRTL ? "إلغاء" : "Cancel"}
                                                            >
                                                                {Icons.x}
                                                            </button>
                                                        </>
                                                    )}
                                                    {apt.status === "in_waiting_room" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStartConsultation(apt.id, apt.patient?.full_name || "Patient")}
                                                                className="flex items-center gap-2 px-3 py-1.5 md:py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-all text-sm font-medium shadow-lg shadow-teal-500/20"
                                                            >
                                                                {Icons.video}
                                                                <span>{isRTL ? "ابدأ الاستشارة" : "Start"}</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleNoShow(apt.id)}
                                                                className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", isDark ? "text-gray-400 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100")}
                                                            >
                                                                {isRTL ? "لم يحضر" : "No Show"}
                                                            </button>
                                                        </>
                                                    )}
                                                    {apt.status === "in_progress" && (
                                                        <>
                                                            <button
                                                                onClick={() => router.push(`/${language}/dashboard/consultation/${apt.id}`)}
                                                                className="flex items-center gap-2 px-3 py-1.5 md:py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-all text-sm font-medium shadow-lg shadow-teal-500/20"
                                                            >
                                                                {Icons.video}
                                                                <span>{isRTL ? "متابعة" : "Resume"}</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleEndConsultation(apt.id)}
                                                                className="flex items-center gap-2 px-3 py-1.5 md:py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all text-sm font-medium"
                                                            >
                                                                {Icons.check}
                                                                <span>{isRTL ? "إنهاء" : "End"}</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleResetToScheduled(apt.id, apt.patient?.full_name || "Patient")}
                                                                className={cn("p-2 rounded-lg transition-colors", isDark ? "text-amber-400 hover:bg-amber-500/10" : "text-amber-600 hover:bg-amber-50")}
                                                                title={isRTL ? "إعادة تعيين إلى مجدول" : "Reset to Scheduled"}
                                                            >
                                                                {Icons.undo}
                                                            </button>
                                                        </>
                                                    )}
                                                    {apt.status === "completed" && (
                                                        <button className={cn("px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors", isDark ? "border-white/10 hover:bg-white/5 text-gray-400" : "border-gray-200 hover:bg-gray-50 text-gray-600")}>
                                                            {t.doctorDashboard.appointmentsPage.actions.details}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlowingCard>
                </section>
            )}

            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
                <section>
                    <h2 className={cn("text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2", textPrimary)}>
                        <span className={textMuted}>{Icons.clock}</span>
                        {t.doctorDashboard.appointmentsPage.sections.upcoming}
                    </h2>
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold tracking-wider uppercase opacity-60">
                        <div className="col-span-2">{t.doctorDashboard.appointmentsPage.tableHeaders.dateTime}</div>
                        <div className="col-span-4">{t.doctorDashboard.appointmentsPage.tableHeaders.patient}</div>
                        <div className="col-span-3">{t.doctorDashboard.appointmentsPage.tableHeaders.purpose}</div>
                        <div className={cn("col-span-3", isRTL ? "text-left" : "text-right")}>{t.doctorDashboard.appointmentsPage.tableHeaders.status}</div>
                    </div>
                    <GlowingCard isDark={isDark} glowColor="teal" className="p-0 overflow-hidden">
                        <div className={divider}>
                            {upcomingAppointments.map((apt, idx) => (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn("flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 p-4 transition-colors items-start md:items-center", cardHover)}
                                >
                                    {/* Date/Time */}
                                    <div className="md:col-span-2 flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                                        <div className="min-w-[70px]">
                                            <p className={cn("text-xs font-medium uppercase tracking-wide", textMuted)}>
                                                {formatDate(apt.scheduled_start)}
                                            </p>
                                            <span className={cn("text-base md:text-lg font-bold tracking-tight", textPrimary)}>
                                                {formatTime(apt.scheduled_start)}
                                            </span>
                                        </div>
                                        <div className="md:hidden">
                                            <Badge isDark={isDark} variant={getStatusVariant(apt.status)}>
                                                {getStatusLabel(apt.status)}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Patient */}
                                    <div className="md:col-span-4 flex items-center gap-3 w-full">
                                        <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-teal-500/20">
                                            {apt.patient?.avatar_url ? (
                                                <Image src={apt.patient.avatar_url} alt={apt.patient.full_name} fill className="object-cover" unoptimized />
                                            ) : (
                                                <div className={cn("w-full h-full flex items-center justify-center text-sm font-bold", isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-600")}>
                                                    {apt.patient?.full_name.charAt(0) || "?"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("font-medium truncate text-sm md:text-base", textPrimary)}>
                                                {apt.patient?.full_name || "Unknown Patient"}
                                            </p>
                                            <p className={cn("text-xs md:hidden truncate", textMuted)}>
                                                {apt.chief_complaint || t.doctorDashboard.appointmentsPage.types.consultation}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Purpose (Desktop) */}
                                    <div className={cn("hidden md:block md:col-span-3 text-sm truncate px-1", textSecondary)}>
                                        {apt.chief_complaint || t.doctorDashboard.appointmentsPage.types.consultation}
                                    </div>

                                    {/* Status */}
                                    <div className="md:col-span-3 flex items-center justify-end w-full md:w-auto gap-3 hidden md:flex">
                                        <Badge isDark={isDark} variant={getStatusVariant(apt.status)}>
                                            {getStatusLabel(apt.status)}
                                        </Badge>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlowingCard>
                </section>
            )}

            {/* Empty State */}
            {filteredAppointments.length === 0 && (
                <div className="text-center py-16">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", emptyStateBg, textMuted)}>
                        {Icons.calendar}
                    </div>
                    <h3 className={cn("text-lg font-medium mb-2", textPrimary)}>{t.doctorDashboard.appointmentsPage.emptyState.title}</h3>
                    <p className={textMuted}>{t.doctorDashboard.appointmentsPage.emptyState.subtitle}</p>
                </div>
            )}
        </div>
    );
}
