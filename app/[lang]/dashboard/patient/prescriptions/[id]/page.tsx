"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../../context/useThemeStyles";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useI18n } from "@/app/i18n";
import { getPrescriptionById, requestPrescriptionRenewal, type PrescriptionWithDetails } from "@/app/actions/prescriptions";

// Icons
const Icons = {
    back: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    ),
    pill: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
    ),
    clock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    refill: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
    ),
    download: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    ),
    print: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
};

export default function PrescriptionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isRTL } = useI18n();
    const { isDark, textPrimary, textMuted } = useThemeStyles();
    const prescriptionId = params.id as string;

    const [prescription, setPrescription] = useState<PrescriptionWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [renewalLoading, setRenewalLoading] = useState(false);
    const [renewalSuccess, setRenewalSuccess] = useState(false);

    useEffect(() => {
        const fetchPrescription = async () => {
            setLoading(true);
            const result = await getPrescriptionById(prescriptionId);
            if (result.error) {
                setError(result.error);
            } else if (result.prescription) {
                setPrescription(result.prescription);
            }
            setLoading(false);
        };
        fetchPrescription();
    }, [prescriptionId]);

    const handleRequestRenewal = async () => {
        if (!prescription) return;
        setRenewalLoading(true);
        const result = await requestPrescriptionRenewal(prescription.id);
        if (result.success) {
            setRenewalSuccess(true);
        }
        setRenewalLoading(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const isExpiringSoon = (validUntil: string | null | undefined): boolean => {
        if (!validUntil) return false;
        const expiry = new Date(validUntil);
        const now = new Date();
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 7 && daysLeft > 0;
    };

    const isExpired = (validUntil: string | null | undefined): boolean => {
        if (!validUntil) return false;
        return new Date(validUntil) < new Date();
    };

    const getStatusVariant = (status: string, validUntil: string | null | undefined): "success" | "warning" | "error" | "default" => {
        if (isExpired(validUntil)) return "error";
        if (status === "active") {
            if (isExpiringSoon(validUntil)) return "warning";
            return "success";
        }
        if (status === "cancelled") return "error";
        return "default";
    };

    const getStatusLabel = (status: string, validUntil: string | null | undefined): string => {
        if (isExpired(validUntil)) return isRTL ? "منتهية الصلاحية" : "Expired";
        if (status === "active") {
            if (isExpiringSoon(validUntil)) return isRTL ? "ينتهي قريباً" : "Expiring Soon";
            return isRTL ? "نشطة" : "Active";
        }
        if (status === "cancelled") return isRTL ? "ملغية" : "Cancelled";
        return isRTL ? "مكتملة" : "Completed";
    };

    const labels = {
        title: isRTL ? "تفاصيل الوصفة" : "Prescription Details",
        back: isRTL ? "العودة" : "Back",
        prescribedBy: isRTL ? "وصفها الدكتور" : "Prescribed by",
        prescribedDate: isRTL ? "تاريخ الوصفة" : "Prescribed Date",
        validUntil: isRTL ? "صالحة حتى" : "Valid Until",
        medication: isRTL ? "الدواء" : "Medication",
        dosage: isRTL ? "الجرعة" : "Dosage",
        frequency: isRTL ? "التكرار" : "Frequency",
        duration: isRTL ? "المدة" : "Duration",
        instructions: isRTL ? "التعليمات" : "Instructions",
        refillsRemaining: isRTL ? "إعادة التعبئة المتبقية" : "Refills Remaining",
        requestRenewal: isRTL ? "طلب تجديد" : "Request Renewal",
        renewalRequested: isRTL ? "تم طلب التجديد" : "Renewal Requested",
        print: isRTL ? "طباعة" : "Print",
        download: isRTL ? "تحميل" : "Download",
        loading: isRTL ? "جاري التحميل..." : "Loading...",
        error: isRTL ? "حدث خطأ" : "Error",
        notFound: isRTL ? "الوصفة غير موجودة" : "Prescription not found",
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className={textMuted}>{labels.loading}</p>
                </div>
            </div>
        );
    }

    if (error || !prescription) {
        return (
            <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", isDark ? "bg-red-500/10" : "bg-red-50")}>
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h3 className={cn("text-lg font-medium mb-2", textPrimary)}>{labels.error}</h3>
                    <p className={textMuted}>{error || labels.notFound}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                    >
                        {labels.back}
                    </button>
                </div>
            </div>
        );
    }

    const statusVariant = getStatusVariant(prescription.status, prescription.valid_until);
    const statusLabel = getStatusLabel(prescription.status, prescription.valid_until);
    const canRequestRenewal = prescription.status === "active" && !isExpired(prescription.valid_until);

    return (
        <div className="p-4 md:p-6 lg:p-8 print:p-0">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 print:hidden">
                <button
                    onClick={() => router.back()}
                    className={cn(
                        "p-2 rounded-lg transition-colors",
                        isDark ? "hover:bg-white/5 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                    )}
                >
                    {isRTL ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    ) : Icons.back}
                </button>
                <div>
                    <h1 className={cn("text-xl md:text-2xl font-bold", textPrimary)}>{labels.title}</h1>
                </div>
            </div>

            <div className="grid gap-6 max-w-3xl mx-auto">
                {/* Doctor & Status Card */}
                <GlowingCard isDark={isDark} glowColor="teal" className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-teal-500/30 flex-shrink-0">
                                {prescription.doctor?.avatar_url ? (
                                    <Image
                                        src={prescription.doctor.avatar_url}
                                        alt={prescription.doctor.full_name || ""}
                                        fill
                                        className="object-cover"
                                        sizes="56px"
                                    />
                                ) : (
                                    <div className={cn("w-full h-full flex items-center justify-center text-xl font-bold", isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-600")}>
                                        {prescription.doctor?.full_name?.charAt(0) || "D"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className={cn("text-xs uppercase tracking-wide", textMuted)}>{labels.prescribedBy}</p>
                                <p className={cn("font-semibold text-lg", textPrimary)}>{prescription.doctor?.full_name}</p>
                            </div>
                        </div>
                        <div className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium",
                            statusVariant === "success" && "bg-green-500/10 text-green-500 border border-green-500/20",
                            statusVariant === "warning" && "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                            statusVariant === "error" && "bg-red-500/10 text-red-500 border border-red-500/20",
                            statusVariant === "default" && (isDark ? "bg-gray-500/10 text-gray-400" : "bg-gray-100 text-gray-600")
                        )}>
                            {statusLabel}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", isDark ? "bg-white/5" : "bg-gray-100")}>
                                {Icons.calendar}
                            </div>
                            <div>
                                <p className={cn("text-xs", textMuted)}>{labels.prescribedDate}</p>
                                <p className={cn("font-medium", textPrimary)}>{formatDate(prescription.prescribed_at)}</p>
                            </div>
                        </div>
                        {prescription.valid_until && (
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", isDark ? "bg-white/5" : "bg-gray-100")}>
                                    {Icons.clock}
                                </div>
                                <div>
                                    <p className={cn("text-xs", textMuted)}>{labels.validUntil}</p>
                                    <p className={cn("font-medium", textPrimary)}>{formatDate(prescription.valid_until)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </GlowingCard>

                {/* Medication Details */}
                <GlowingCard isDark={isDark} glowColor="teal" className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={cn("p-3 rounded-xl", isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-600")}>
                            {Icons.pill}
                        </div>
                        <div>
                            <h2 className={cn("text-xl font-bold", textPrimary)}>{prescription.medication_name}</h2>
                            <p className={textMuted}>{labels.medication}</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {prescription.dosage && (
                            <div className={cn("p-4 rounded-xl", isDark ? "bg-white/5" : "bg-gray-50")}>
                                <p className={cn("text-xs uppercase tracking-wide mb-1", textMuted)}>{labels.dosage}</p>
                                <p className={cn("font-medium", textPrimary)}>{prescription.dosage}</p>
                            </div>
                        )}
                        {prescription.frequency && (
                            <div className={cn("p-4 rounded-xl", isDark ? "bg-white/5" : "bg-gray-50")}>
                                <p className={cn("text-xs uppercase tracking-wide mb-1", textMuted)}>{labels.frequency}</p>
                                <p className={cn("font-medium", textPrimary)}>{prescription.frequency}</p>
                            </div>
                        )}
                        {prescription.duration && (
                            <div className={cn("p-4 rounded-xl", isDark ? "bg-white/5" : "bg-gray-50")}>
                                <p className={cn("text-xs uppercase tracking-wide mb-1", textMuted)}>{labels.duration}</p>
                                <p className={cn("font-medium", textPrimary)}>{prescription.duration}</p>
                            </div>
                        )}
                        {(prescription.refills_allowed ?? 0) > 0 && (
                            <div className={cn("p-4 rounded-xl", isDark ? "bg-white/5" : "bg-gray-50")}>
                                <p className={cn("text-xs uppercase tracking-wide mb-1", textMuted)}>{labels.refillsRemaining}</p>
                                <p className={cn("font-medium", textPrimary)}>
                                    {(prescription.refills_allowed ?? 0) - (prescription.refills_used ?? 0)} / {prescription.refills_allowed}
                                </p>
                            </div>
                        )}
                    </div>

                    {prescription.instructions && (
                        <div className={cn("mt-4 p-4 rounded-xl", isDark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200")}>
                            <p className={cn("text-xs uppercase tracking-wide mb-2", isDark ? "text-amber-400" : "text-amber-600")}>{labels.instructions}</p>
                            <p className={cn("text-sm", isDark ? "text-amber-200" : "text-amber-800")}>{prescription.instructions}</p>
                        </div>
                    )}
                </GlowingCard>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                    {canRequestRenewal && !renewalSuccess && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleRequestRenewal}
                            disabled={renewalLoading}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors",
                                "bg-teal-500 text-white hover:bg-teal-600",
                                renewalLoading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {renewalLoading ? (
                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    {Icons.refill}
                                    {labels.requestRenewal}
                                </>
                            )}
                        </motion.button>
                    )}
                    {renewalSuccess && (
                        <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                            {Icons.check}
                            {labels.renewalRequested}
                        </div>
                    )}
                    <button
                        onClick={handlePrint}
                        className={cn(
                            "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors",
                            isDark
                                ? "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                        )}
                    >
                        {Icons.print}
                        {labels.print}
                    </button>
                </div>
            </div>
        </div>
    );
}
