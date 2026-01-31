"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../context/useThemeStyles";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useI18n } from "@/app/i18n";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
    getPatientAppointments,
    cancelAppointmentAsPatient,
    joinWaitingRoom,
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
    plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
};

const Badge = ({ children, variant = "default", isDark = true }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "primary" | "error"; isDark?: boolean }) => {
    const variants = {
        default: isDark ? "bg-slate-700/50 text-slate-300" : "bg-gray-200 text-gray-700",
        success: "bg-green-500/10 text-green-400 border border-green-500/20",
        warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        primary: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
        error: "bg-red-500/10 text-red-400 border border-red-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant])}>
            {children}
        </span>
    );
};

export default function AppointmentsPage({
    initialAppointments = [],
    initialLoaded = false,
}: {
    initialAppointments?: AppointmentWithDetails[];
    initialLoaded?: boolean;
}) {
    const { t, isRTL, language } = useI18n();
    const router = useRouter();
    const { showConfirm, showError } = useToast();
    const [activeFilter, setActiveFilter] = useState("All");
    const { isDark, textPrimary, textMuted } = useThemeStyles();

    const [appointments, setAppointments] = useState<AppointmentWithDetails[]>(initialAppointments);
    const [loading, setLoading] = useState(!initialLoaded);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Cancellation dialog state
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);
    const [cancellationReason, setCancellationReason] = useState("");

    const loadAppointments = useCallback(async () => {
        setLoading(true);
        const result = await getPatientAppointments();
        if (result.appointments) {
            setAppointments(result.appointments);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!initialLoaded) {
            loadAppointments();
        }
    }, [initialLoaded, loadAppointments]);

    const filters = [
        { key: "All", label: t.patientDashboard.appointmentsPage.filters.all },
        { key: "Upcoming", label: t.patientDashboard.appointmentsPage.filters.upcoming },
        { key: "Completed", label: t.patientDashboard.appointmentsPage.filters.completed },
        { key: "Cancelled", label: isRTL ? "ملغي" : "Cancelled" },
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
            case "in_progress": return isRTL ? "جاري" : "In Progress";
            case "completed": return t.patientDashboard.appointmentsPage.filters.completed;
            case "scheduled": return t.patientDashboard.appointmentsPage.filters.upcoming;
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
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleJoinWaitingRoom = async (appointmentId: string) => {
        setActionLoading(appointmentId);
        try {
            const result = await joinWaitingRoom(appointmentId);
            if (result.success) {
                // Navigate to the waiting room page
                router.push(`/${language}/dashboard/consultation/${appointmentId}/waiting-room`);
            } else {
                showError(result.error || (isRTL ? "فشل الانضمام لغرفة الانتظار" : "Failed to join waiting room"));
            }
        } catch {
            showError(isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
        }
        setActionLoading(null);
    };

    const handleJoinConsultation = (appointmentId: string) => {
        // Navigate to the embedded consultation page
        router.push(`/${language}/dashboard/consultation/${appointmentId}`);
    };

    const handleCancel = (appointmentId: string) => {
        setCancellingAppointmentId(appointmentId);
        setCancellationReason("");
        setShowCancelDialog(true);
    };

    const handleConfirmCancel = async () => {
        if (!cancellingAppointmentId) return;

        if (!cancellationReason.trim()) {
            showError(isRTL ? "يرجى إدخال سبب الإلغاء" : "Please enter a cancellation reason");
            return;
        }

        setActionLoading(cancellingAppointmentId);
        setShowCancelDialog(false);

        try {
            const result = await cancelAppointmentAsPatient(cancellingAppointmentId, cancellationReason.trim());
            if (result.success) {
                await loadAppointments();
            } else {
                showError(result.error || (isRTL ? "فشل إلغاء الموعد" : "Failed to cancel appointment"));
            }
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            showError(isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
        }

        setActionLoading(null);
        setCancellingAppointmentId(null);
        setCancellationReason("");
    };

    const handleCloseCancelDialog = () => {
        setShowCancelDialog(false);
        setCancellingAppointmentId(null);
        setCancellationReason("");
    };

    const filteredAppointments = appointments.filter(apt => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Upcoming") return ["scheduled", "in_waiting_room", "in_progress"].includes(apt.status);
        if (activeFilter === "Completed") return apt.status === "completed";
        if (activeFilter === "Cancelled") return apt.status === "cancelled";
        return true;
    });

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat(isRTL ? "ar-EG" : "en-EG", {
            style: "currency",
            currency: "EGP",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Cancellation Reason Dialog */}
            <AnimatePresence>
                {showCancelDialog && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[101]"
                            onClick={handleCloseCancelDialog}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[102] w-full max-w-md mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={cn(
                                "rounded-2xl p-6 shadow-2xl border",
                                isDark ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"
                            )}>
                                <div className="flex items-center gap-3 mb-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseCancelDialog}
                                        className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
                                        title={isRTL ? "إغلاق" : "Close"}
                                    >
                                        {Icons.x}
                                    </button>
                                    <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                        {isRTL ? "إلغاء الموعد" : "Cancel Appointment"}
                                    </h3>
                                </div>
                                <p className={cn("mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
                                    {isRTL
                                        ? "يرجى إخبارنا بسبب الإلغاء حتى نتمكن من تحسين خدماتنا."
                                        : "Please tell us why you're cancelling so we can improve our service."}
                                </p>
                                <textarea
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder={isRTL ? "اكتب سبب الإلغاء هنا..." : "Enter your reason for cancelling..."}
                                    className={cn(
                                        "w-full p-3 rounded-lg border resize-none h-24 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500",
                                        isDark
                                            ? "bg-slate-800 border-white/10 text-white placeholder-gray-500"
                                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                                    )}
                                    dir={isRTL ? "rtl" : "ltr"}
                                />
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCloseCancelDialog}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isDark
                                                ? "text-gray-400 hover:text-white hover:bg-white/5"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                        )}
                                    >
                                        {isRTL ? "تراجع" : "Go Back"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmCancel}
                                        disabled={!cancellationReason.trim()}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                            cancellationReason.trim()
                                                ? "bg-red-500 text-white hover:bg-red-600"
                                                : "bg-red-500/50 text-white/50 cursor-not-allowed"
                                        )}
                                    >
                                        {isRTL ? "تأكيد الإلغاء" : "Confirm Cancel"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                        <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.calendar}
                        </span>
                        {t.patientDashboard.appointmentsPage.title}
                    </h1>
                    <p className={cn("mt-1 text-sm md:text-base", textMuted)}>{t.patientDashboard.appointmentsPage.subtitle}</p>
                </div>
                <button
                    onClick={() => router.push(`/${language}/dashboard/patient/doctors`)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold py-2 md:py-2.5 px-4 md:px-5 rounded-lg md:rounded-xl transition-all shadow-lg shadow-teal-500/20 text-sm md:text-base"
                >
                    {Icons.plus}
                    <span>{t.patientDashboard.appointmentsPage.bookNew}</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide">
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className={cn(
                            "px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
                            activeFilter === filter.key
                                ? "bg-teal-500 text-white"
                                : isDark
                                    ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
                <GlowingCard glowColor="teal" className="p-12 text-center" isDark={isDark}>
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", isDark ? "bg-slate-900" : "bg-gray-100", textMuted)}>
                        {Icons.calendar}
                    </div>
                    <h3 className={cn("text-lg font-medium mb-2", textPrimary)}>
                        {isRTL ? "لا توجد مواعيد" : "No appointments found"}
                    </h3>
                    <p className={textMuted}>
                        {isRTL ? "احجز موعدك الأول مع طبيب" : "Book your first appointment with a doctor"}
                    </p>
                </GlowingCard>
            ) : (
                <div className="grid gap-3 md:gap-4">
                    {filteredAppointments.map((apt, idx) => (
                        <motion.div
                            key={apt.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <GlowingCard glowColor="teal" className="p-3 md:p-5" isDark={isDark}>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden border-2 border-teal-500/30 flex-shrink-0">
                                            {apt.doctor?.avatar_url ? (
                                                <Image
                                                    src={apt.doctor.avatar_url}
                                                    alt={apt.doctor.full_name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 48px, 56px"
                                                />
                                            ) : (
                                                <div className={cn("w-full h-full flex items-center justify-center text-xl font-bold", isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-600")}>
                                                    {apt.doctor?.full_name.charAt(0) || "D"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 sm:hidden">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className={cn("font-semibold text-sm", textPrimary)}>
                                                    {apt.doctor?.full_name || "Doctor"}
                                                </h3>
                                                <Badge variant={getStatusVariant(apt.status)} isDark={isDark}>
                                                    {getStatusLabel(apt.status)}
                                                </Badge>
                                            </div>
                                            <p className={cn("text-xs", textMuted)}>
                                                {apt.doctor?.specialty || (isRTL ? "استشارة" : "Consultation")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-1 hidden sm:block">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className={cn("font-semibold", textPrimary)}>
                                                {apt.doctor?.full_name || "Doctor"}
                                            </h3>
                                            <Badge variant={getStatusVariant(apt.status)} isDark={isDark}>
                                                {getStatusLabel(apt.status)}
                                            </Badge>
                                        </div>
                                        <p className={cn("text-sm", textMuted)}>
                                            {apt.doctor?.specialty || (isRTL ? "استشارة" : "Consultation")}
                                            {apt.consultation_fee && ` • ${formatCurrency(apt.consultation_fee)}`}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className={cn("text-sm flex items-center gap-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                </svg>
                                                {formatDate(apt.scheduled_start)}
                                            </span>
                                            <span className={cn("text-sm flex items-center gap-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                                {Icons.clock}
                                                {formatTime(apt.scheduled_start)}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Mobile: Date/Time row */}
                                    <div className="flex items-center justify-between sm:hidden">
                                        <div className="flex items-center gap-3">
                                            <span className={cn("text-xs flex items-center gap-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                </svg>
                                                {formatDate(apt.scheduled_start)}
                                            </span>
                                            <span className={cn("text-xs flex items-center gap-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                                {Icons.clock}
                                                {formatTime(apt.scheduled_start)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {actionLoading === apt.id ? (
                                        <div className="flex items-center justify-center py-2">
                                            <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full" />
                                        </div>
                                    ) : (
                                        <>
                                            {apt.status === "scheduled" && (
                                                <div className="flex gap-2 sm:flex-shrink-0">
                                                    <button
                                                        onClick={() => handleJoinWaitingRoom(apt.id)}
                                                        className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        {Icons.video}
                                                        {isRTL ? "انضم للانتظار" : "Join Waiting"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(apt.id)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors",
                                                            isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"
                                                        )}
                                                        title={isRTL ? "إلغاء" : "Cancel"}
                                                    >
                                                        {Icons.x}
                                                    </button>
                                                </div>
                                            )}
                                            {apt.status === "in_waiting_room" && (
                                                <div className="flex gap-2 sm:flex-shrink-0">
                                                    <button
                                                        onClick={() => router.push(`/${language}/dashboard/consultation/${apt.id}/waiting-room`)}
                                                        className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        {Icons.clock}
                                                        {isRTL ? "العودة لغرفة الانتظار" : "Back to Waiting Room"}
                                                    </button>
                                                </div>
                                            )}
                                            {apt.status === "in_progress" && (
                                                <div className="flex gap-2 sm:flex-shrink-0">
                                                    <button
                                                        onClick={() => handleJoinConsultation(apt.id)}
                                                        className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        {Icons.video}
                                                        {isRTL ? "انضم للاستشارة" : "Join Call"}
                                                    </button>
                                                </div>
                                            )}
                                            {apt.status === "completed" && (
                                                <div className="flex gap-2 sm:flex-shrink-0">
                                                    <button
                                                        className={cn(
                                                            "flex-1 sm:flex-initial px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors",
                                                            isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                        )}
                                                    >
                                                        {isRTL ? "عرض التفاصيل" : "View Details"}
                                                    </button>
                                                </div>
                                            )}
                                            {apt.status === "cancelled" && apt.cancellation_reason && (
                                                <div className="w-full mt-2 sm:mt-0 sm:w-auto">
                                                    <div className={cn(
                                                        "p-3 rounded-lg border",
                                                        isDark ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-100"
                                                    )}>
                                                        <p className={cn("text-xs font-medium mb-1", isDark ? "text-red-400" : "text-red-600")}>
                                                            {isRTL ? "سبب الإلغاء:" : "Cancellation Reason:"}
                                                        </p>
                                                        <p className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-700")}>
                                                            {apt.cancellation_reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </GlowingCard>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
