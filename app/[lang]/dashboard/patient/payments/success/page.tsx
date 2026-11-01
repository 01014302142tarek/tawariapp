"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { GlowingCard } from "@/components/ui/glowing-card";
import { getPaymentStatus } from "@/app/actions/payments";
import confetti from "canvas-confetti";

// Icons
const Icons = {
    check: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    receipt: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    home: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
};

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isRTL, language } = useI18n();

    const transactionId = searchParams.get("transaction");

    const [amount, setAmount] = useState<number | null>(null);

    // Trigger confetti on mount
    useEffect(() => {
        // Fire confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#f59e0b", "#22d3ee", "#a855f7"],
        });

        // Fetch payment status
        async function fetchStatus() {
            if (transactionId) {
                const result = await getPaymentStatus(transactionId);
                if (result.success && result.amount) {
                    setAmount(result.amount);
                }
            }
        }

        fetchStatus();
    }, [transactionId]);

    return (
        <div className={cn("min-h-screen bg-slate-950 flex items-center justify-center p-4", isRTL && "rtl")}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <GlowingCard glowColor="amber" className="p-8 text-center" isDark>
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6"
                    >
                        <span className="text-amber-400">{Icons.check}</span>
                    </motion.div>

                    {/* Success Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {isRTL ? "تم الدفع بنجاح!" : "Payment Successful!"}
                        </h1>
                        <p className="text-gray-400 mb-6">
                            {isRTL
                                ? "تم تأكيد موعدك. سنرسل لك تذكيرًا قبل الموعد."
                                : "Your appointment is confirmed. We'll send you a reminder before the appointment."}
                        </p>
                    </motion.div>

                    {/* Payment Details */}
                    {amount !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-slate-800/50 rounded-xl p-4 mb-6"
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">
                                    {isRTL ? "المبلغ المدفوع" : "Amount Paid"}
                                </span>
                                <span className="text-amber-400 font-bold text-xl">
                                    {amount.toFixed(2)} {isRTL ? "ج.م" : "EGP"}
                                </span>
                            </div>
                            {transactionId && (
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                                    <span className="text-gray-500 text-sm">
                                        {isRTL ? "رقم العملية" : "Transaction ID"}
                                    </span>
                                    <span className="text-gray-400 text-sm font-mono">
                                        {transactionId.slice(0, 8)}...
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                    >
                        <button
                            onClick={() => router.push(`/${language}/dashboard/patient/appointments`)}
                            className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                        >
                            {Icons.calendar}
                            <span>{isRTL ? "عرض مواعيدي" : "View My Appointments"}</span>
                        </button>

                        <button
                            onClick={() => router.push(`/${language}/dashboard/patient`)}
                            className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                        >
                            {Icons.home}
                            <span>{isRTL ? "العودة للرئيسية" : "Back to Dashboard"}</span>
                        </button>
                    </motion.div>
                </GlowingCard>

                {/* Additional Info */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center text-gray-500 text-sm mt-4"
                >
                    {isRTL
                        ? "ستتلقى رسالة تأكيد عبر البريد الإلكتروني قريبًا"
                        : "You will receive a confirmation email shortly"}
                </motion.p>
            </motion.div>
        </div>
    );
}

function PaymentSuccessLoading() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<PaymentSuccessLoading />}>
            <PaymentSuccessContent />
        </Suspense>
    );
}
