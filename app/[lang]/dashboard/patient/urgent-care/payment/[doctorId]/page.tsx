"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { getOnlineDoctors, joinDoctorQueue, type OnlineDoctor } from "@/app/actions/queue";

// ============================================
// Icons
// ============================================
const Icons = {
    back: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    ),
    star: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    ),
    clock: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    shield: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
    creditCard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    users: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    loading: (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    ),
};

// ============================================
// Helper Functions
// ============================================
const getInitials = (name: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatWaitTime = (minutes: number): string => {
    if (minutes === 0) return "Available now";
    if (minutes < 60) return `~${minutes} min wait`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `~${hours}h ${mins}m wait`;
};

// ============================================
// Main Page Component
// ============================================
export default function PaymentPage() {
    const router = useRouter();
    const params = useParams();
    const { isRTL, language } = useI18n();

    const doctorId = params.doctorId as string;

    const [doctor, setDoctor] = useState<OnlineDoctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chiefComplaint, setChiefComplaint] = useState("");

    // Service fee (platform fee)
    const serviceFee = 10; // EGP - flat service fee for now
    const totalAmount = doctor ? doctor.consultation_fee + serviceFee : 0;

    // Load doctor details
    useEffect(() => {
        const loadDoctor = async () => {
            setLoading(true);
            try {
                const result = await getOnlineDoctors();
                if (result.doctors) {
                    const foundDoctor = result.doctors.find(d => d.id === doctorId);
                    if (foundDoctor) {
                        setDoctor(foundDoctor);
                    } else {
                        setError(isRTL ? "الطبيب غير متاح" : "Doctor not available");
                    }
                }
            } catch (err) {
                console.error("Error loading doctor:", err);
                setError(isRTL ? "حدث خطأ في تحميل البيانات" : "Error loading doctor data");
            } finally {
                setLoading(false);
            }
        };

        loadDoctor();
    }, [doctorId, isRTL]);

    // Handle payment (mock)
    const handleCompletePayment = async () => {
        if (!doctor) return;

        setProcessing(true);
        setError(null);

        try {
            // Join the queue with mock payment
            const result = await joinDoctorQueue({
                doctorProfileId: doctor.id,
                chiefComplaint: chiefComplaint.trim() || undefined,
                paymentAmount: totalAmount,
            });

            if (result.success && result.queueEntryId) {
                // Redirect to waiting room
                router.push(`/${language}/dashboard/patient/urgent-care/waiting/${result.queueEntryId}`);
            } else {
                setError(result.error || (isRTL ? "حدث خطأ" : "An error occurred"));
            }
        } catch (err) {
            console.error("Error completing payment:", err);
            setError(isRTL ? "حدث خطأ في المعالجة" : "Error processing payment");
        } finally {
            setProcessing(false);
        }
    };

    // Handle back navigation
    const handleBack = () => {
        router.push(`/${language}/dashboard/patient/urgent-care`);
    };

    // Loading state
    if (loading) {
        return (
            <div className={cn("min-h-screen p-6 flex items-center justify-center", isRTL && "rtl")}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">
                        {isRTL ? "جاري التحميل..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    // Error state (doctor not found or offline)
    if (!doctor) {
        return (
            <div className={cn("min-h-screen p-6", isRTL && "rtl")}>
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <span className={cn(isRTL && "rotate-180")}>{Icons.back}</span>
                    <span>{isRTL ? "العودة" : "Back"}</span>
                </button>

                <div className="max-w-md mx-auto text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        {isRTL ? "الطبيب غير متاح" : "Doctor Not Available"}
                    </h2>
                    <p className="text-slate-400 mb-6">
                        {error || (isRTL ? "الطبيب غير متصل حالياً" : "This doctor is currently offline")}
                    </p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
                    >
                        {isRTL ? "اختر طبيباً آخر" : "Choose Another Doctor"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen p-6", isRTL && "rtl")}>
            {/* Back Button */}
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
                <span className={cn(isRTL && "rotate-180")}>{Icons.back}</span>
                <span>{isRTL ? "العودة" : "Back"}</span>
            </button>

            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {isRTL ? "تأكيد الدفع" : "Confirm Payment"}
                    </h1>
                    <p className="text-slate-400">
                        {isRTL ? "راجع التفاصيل قبل الانضمام للقائمة" : "Review details before joining the queue"}
                    </p>
                </div>

                {/* Doctor Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 mb-6"
                >
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            {doctor.avatar_url ? (
                                <Image
                                    src={doctor.avatar_url}
                                    alt={doctor.full_name}
                                    width={72}
                                    height={72}
                                    className="w-[72px] h-[72px] rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-xl">
                                    {getInitials(doctor.full_name)}
                                </div>
                            )}
                            {/* Online indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-slate-800 bg-green-500" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-lg">{doctor.full_name}</h3>
                            <p className="text-slate-400">
                                {doctor.specialty.length > 0 ? doctor.specialty.join(", ") : "General Practice"}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-4 mt-2 text-sm">
                                <div className="flex items-center gap-1 text-amber-400">
                                    {Icons.star}
                                    <span>{doctor.rating_average.toFixed(1)}</span>
                                    <span className="text-slate-500">({doctor.rating_count})</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                    {Icons.clock}
                                    <span>{formatWaitTime(doctor.estimated_wait_minutes)}</span>
                                </div>
                                {doctor.queue_length > 0 && (
                                    <div className="flex items-center gap-1 text-slate-400">
                                        {Icons.users}
                                        <span>{doctor.queue_length} {isRTL ? "ينتظرون" : "waiting"}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Chief Complaint Input */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 mb-6"
                >
                    <label className="block text-white font-medium mb-2">
                        {isRTL ? "ما هي شكواك الرئيسية؟" : "What's your chief complaint?"}
                        <span className="text-slate-500 text-sm font-normal ms-2">
                            ({isRTL ? "اختياري" : "Optional"})
                        </span>
                    </label>
                    <textarea
                        value={chiefComplaint}
                        onChange={(e) => setChiefComplaint(e.target.value)}
                        placeholder={isRTL ? "صف مشكلتك الصحية بإيجاز..." : "Briefly describe your health concern..."}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        rows={3}
                        maxLength={500}
                    />
                    <p className="text-slate-500 text-sm mt-2">
                        {chiefComplaint.length}/500 {isRTL ? "حرف" : "characters"}
                    </p>
                </motion.div>

                {/* Payment Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 mb-6"
                >
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        {Icons.creditCard}
                        {isRTL ? "ملخص الدفع" : "Payment Summary"}
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between text-slate-400">
                            <span>{isRTL ? "رسوم الاستشارة" : "Consultation Fee"}</span>
                            <span>{doctor.consultation_fee} EGP</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>{isRTL ? "رسوم الخدمة" : "Service Fee"}</span>
                            <span>{serviceFee} EGP</span>
                        </div>
                        <div className="border-t border-white/10 pt-3 flex justify-between text-white font-semibold text-lg">
                            <span>{isRTL ? "الإجمالي" : "Total"}</span>
                            <span>{totalAmount} EGP</span>
                        </div>
                    </div>
                </motion.div>

                {/* Mock Payment Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6"
                >
                    <div className="flex items-start gap-3">
                        <div className="text-amber-400 mt-0.5">
                            {Icons.shield}
                        </div>
                        <div>
                            <p className="text-amber-200 font-medium">
                                {isRTL ? "وضع الاختبار" : "Test Mode"}
                            </p>
                            <p className="text-amber-200/70 text-sm">
                                {isRTL
                                    ? "هذه صفحة دفع تجريبية. لن يتم خصم أي مبالغ حقيقية."
                                    : "This is a demo payment page. No real charges will be made."}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6"
                    >
                        <p className="text-red-400">{error}</p>
                    </motion.div>
                )}

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <button
                        onClick={handleBack}
                        disabled={processing}
                        className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {isRTL ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                        onClick={handleCompletePayment}
                        disabled={processing}
                        className="flex-1 px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                {Icons.loading}
                                <span>{isRTL ? "جاري المعالجة..." : "Processing..."}</span>
                            </>
                        ) : (
                            <>
                                {Icons.check}
                                <span>{isRTL ? "إتمام الدفع" : "Complete Payment"}</span>
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Footer Info */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    {isRTL
                        ? "بالضغط على إتمام الدفع، ستنضم إلى قائمة انتظار الطبيب"
                        : "By clicking Complete Payment, you will join the doctor's queue"}
                </p>
            </div>
        </div>
    );
}
