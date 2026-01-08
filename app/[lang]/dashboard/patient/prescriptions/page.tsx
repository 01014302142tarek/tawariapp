"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../context/useThemeStyles";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useI18n } from "@/app/i18n";
import {
    getPatientPrescriptions,
    requestPrescriptionRenewal,
    type PrescriptionWithDetails,
    type PrescriptionStatus,
} from "@/app/actions/prescriptions";

// Icons
const Icons = {
    prescription: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    pill: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
    ),
    refresh: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
    ),
};

const Badge = ({ variant, children, isDark = true }: { variant: string; children: React.ReactNode; isDark?: boolean }) => {
    const variants: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        completed: isDark ? "bg-slate-700/50 text-slate-300" : "bg-gray-200 text-gray-700",
        cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
        success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        danger: "bg-red-500/10 text-red-400 border border-red-500/20",
        default: isDark ? "bg-slate-700/50 text-slate-300" : "bg-gray-200 text-gray-700",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant] || variants.default)}>
            {children}
        </span>
    );
};

export default function PrescriptionsPage() {
    const { t, isRTL } = useI18n();
    const [activeFilter, setActiveFilter] = useState("All");
    const { isDark, textPrimary, textMuted } = useThemeStyles();

    const [prescriptions, setPrescriptions] = useState<PrescriptionWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadPrescriptions();
    }, []);

    const loadPrescriptions = async () => {
        setLoading(true);
        const result = await getPatientPrescriptions();
        if (result.prescriptions) {
            setPrescriptions(result.prescriptions);
        }
        setLoading(false);
    };

    const handleRequestRenewal = async (prescriptionId: string) => {
        setActionLoading(prescriptionId);
        const result = await requestPrescriptionRenewal(prescriptionId);
        if (result.success) {
            alert(isRTL ? "تم إرسال طلب التجديد بنجاح" : "Renewal request sent successfully");
        } else {
            alert(result.error || (isRTL ? "فشل في إرسال الطلب" : "Failed to send request"));
        }
        setActionLoading(null);
    };

    const filters = [
        { key: "All", label: t.patientDashboard.prescriptionsPage.filters.all },
        { key: "Active", label: t.patientDashboard.prescriptionsPage.filters.active },
        { key: "Completed", label: isRTL ? "مكتمل" : "Completed" },
    ];

    const filteredPrescriptions = prescriptions.filter(rx => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Active") return rx.status === "active";
        if (activeFilter === "Completed") return rx.status === "completed";
        return true;
    });

    const getStatusText = (status: PrescriptionStatus) => {
        switch (status) {
            case "active": return t.patientDashboard.prescriptionsPage.status.active;
            case "completed": return isRTL ? "مكتمل" : "Completed";
            case "cancelled": return isRTL ? "ملغي" : "Cancelled";
            default: return status;
        }
    };

    const getStatusBadge = (status: PrescriptionStatus) => {
        switch (status) {
            case "active": return <Badge variant="success" isDark={isDark}>{getStatusText(status)}</Badge>;
            case "completed": return <Badge variant="default" isDark={isDark}>{getStatusText(status)}</Badge>;
            case "cancelled": return <Badge variant="danger" isDark={isDark}>{getStatusText(status)}</Badge>;
            default: return <Badge variant="default" isDark={isDark}>{status}</Badge>;
        }
    };

    const formatDate = (isoString?: string): string => {
        if (!isoString) return "-";
        const date = new Date(isoString);
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Check if prescription might need refill (valid_until approaching or passed)
    const needsRefill = (rx: PrescriptionWithDetails): boolean => {
        if (rx.status !== "active") return false;
        if (!rx.valid_until) return false;
        const validUntil = new Date(rx.valid_until);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7; // Show refill button if expiring within 7 days
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
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                    <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                        {Icons.prescription}
                    </span>
                    {t.patientDashboard.prescriptionsPage.title}
                </h1>
                <p className={cn("mt-1 text-sm md:text-base", textMuted)}>{t.patientDashboard.prescriptionsPage.subtitle}</p>
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

            {/* Prescriptions List */}
            {filteredPrescriptions.length === 0 ? (
                <GlowingCard glowColor="teal" className="p-12 text-center" isDark={isDark}>
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", isDark ? "bg-slate-900" : "bg-gray-100", textMuted)}>
                        {Icons.prescription}
                    </div>
                    <h3 className={cn("text-lg font-medium mb-2", textPrimary)}>
                        {isRTL ? "لا توجد وصفات طبية" : "No prescriptions found"}
                    </h3>
                    <p className={textMuted}>
                        {isRTL ? "ستظهر وصفاتك الطبية هنا" : "Your prescriptions will appear here"}
                    </p>
                </GlowingCard>
            ) : (
                <div className="grid gap-3 md:gap-4">
                    {filteredPrescriptions.map((rx, idx) => (
                        <motion.div
                            key={rx.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <GlowingCard glowColor="teal" className="p-4 md:p-5" isDark={isDark}>
                                {/* Mobile Layout */}
                                <div className="md:hidden">
                                    {/* Header: Icon + Name + Badge */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={cn(
                                            "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                                            rx.status === "active" ? "bg-teal-500/10 text-teal-500" :
                                                rx.status === "cancelled" ? "bg-red-500/10 text-red-500" :
                                                    isDark ? "bg-slate-800 text-gray-400" : "bg-gray-100 text-gray-500"
                                        )}>
                                            {Icons.pill}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h3 className={cn("text-base font-semibold truncate", textPrimary)}>
                                                    {rx.medication_name}
                                                </h3>
                                                {getStatusBadge(rx.status)}
                                            </div>
                                            <p className={cn("text-sm", textMuted)}>
                                                {rx.dosage} {rx.frequency && `· ${rx.frequency}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className={cn(
                                        "grid grid-cols-2 gap-3 py-3 mb-3 border-y",
                                        isDark ? "border-white/5" : "border-gray-100"
                                    )}>
                                        <div>
                                            <p className={cn("text-[10px] uppercase tracking-wide mb-0.5", textMuted)}>
                                                {t.patientDashboard.prescriptionsPage.labels.prescribedBy}
                                            </p>
                                            <p className={cn("text-xs font-medium truncate", textPrimary)}>
                                                {rx.doctor?.full_name || "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={cn("text-[10px] uppercase tracking-wide mb-0.5", textMuted)}>
                                                {isRTL ? "تاريخ الوصفة" : "Prescribed"}
                                            </p>
                                            <p className={cn("text-xs font-medium", textPrimary)}>
                                                {formatDate(rx.prescribed_at)}
                                            </p>
                                        </div>
                                        {rx.valid_until && (
                                            <div>
                                                <p className={cn("text-[10px] uppercase tracking-wide mb-0.5", textMuted)}>
                                                    {isRTL ? "صالح حتى" : "Valid Until"}
                                                </p>
                                                <p className={cn("text-xs font-medium", textPrimary)}>
                                                    {formatDate(rx.valid_until)}
                                                </p>
                                            </div>
                                        )}
                                        {rx.duration && (
                                            <div>
                                                <p className={cn("text-[10px] uppercase tracking-wide mb-0.5", textMuted)}>
                                                    {isRTL ? "المدة" : "Duration"}
                                                </p>
                                                <p className={cn("text-xs font-medium", textPrimary)}>
                                                    {rx.duration}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Instructions */}
                                    {rx.instructions && (
                                        <div className={cn("flex items-start gap-2 text-xs mb-3", textMuted)}>
                                            <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                            </svg>
                                            <p className="italic leading-relaxed">{rx.instructions}</p>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {needsRefill(rx) && (
                                        <button
                                            onClick={() => handleRequestRenewal(rx.id)}
                                            disabled={actionLoading === rx.id}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
                                        >
                                            {actionLoading === rx.id ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                Icons.refresh
                                            )}
                                            {t.patientDashboard.prescriptionsPage.actions.requestRefill}
                                        </button>
                                    )}
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:items-center">
                                    {/* Icon + Name - 4 cols */}
                                    <div className="col-span-4 flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                            rx.status === "active" ? "bg-teal-500/10 text-teal-500" :
                                                rx.status === "cancelled" ? "bg-red-500/10 text-red-500" :
                                                    isDark ? "bg-slate-800 text-gray-400" : "bg-gray-100 text-gray-500"
                                        )}>
                                            {Icons.pill}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className={cn("text-base font-semibold truncate", textPrimary)}>
                                                    {rx.medication_name}
                                                </h3>
                                                {rx.dosage && <span className={cn("text-sm", textMuted)}>{rx.dosage}</span>}
                                            </div>
                                            <p className={cn("text-sm", textMuted)}>{rx.frequency || rx.duration || "-"}</p>
                                        </div>
                                    </div>

                                    {/* Doctor Info - 3 cols */}
                                    <div className="col-span-3 flex items-center gap-2">
                                        {rx.doctor?.avatar_url ? (
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                                <Image src={rx.doctor.avatar_url} alt={rx.doctor.full_name} fill className="object-cover" unoptimized />
                                            </div>
                                        ) : (
                                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0", isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-600")}>
                                                {rx.doctor?.full_name.charAt(0) || "D"}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className={cn("text-xs uppercase tracking-wide mb-0.5", textMuted)}>
                                                {t.patientDashboard.prescriptionsPage.labels.prescribedBy}
                                            </p>
                                            <p className={cn("text-sm font-medium truncate", isDark ? "text-gray-300" : "text-gray-700")}>
                                                {rx.doctor?.full_name || "-"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dates - 2 cols */}
                                    <div className="col-span-2">
                                        <p className={cn("text-xs uppercase tracking-wide mb-0.5", textMuted)}>
                                            {isRTL ? "تاريخ الوصفة" : "Prescribed"}
                                        </p>
                                        <p className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                                            {formatDate(rx.prescribed_at)}
                                        </p>
                                    </div>

                                    {/* Status + Action - 3 cols */}
                                    <div className="col-span-3 flex items-center justify-end gap-3">
                                        {getStatusBadge(rx.status)}
                                        {needsRefill(rx) && (
                                            <button
                                                onClick={() => handleRequestRenewal(rx.id)}
                                                disabled={actionLoading === rx.id}
                                                className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
                                            >
                                                {actionLoading === rx.id ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    Icons.refresh
                                                )}
                                                {t.patientDashboard.prescriptionsPage.actions.refill}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Instructions - Desktop */}
                                {rx.instructions && (
                                    <div className={cn("hidden md:block mt-3 pt-3 border-t", isDark ? "border-white/5" : "border-gray-100")}>
                                        <p className={cn("text-xs italic flex items-center gap-1.5", textMuted)}>
                                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                            </svg>
                                            {rx.instructions}
                                        </p>
                                    </div>
                                )}
                            </GlowingCard>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
