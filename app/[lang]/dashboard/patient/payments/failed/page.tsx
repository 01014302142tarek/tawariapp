"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { GlowingCard } from "@/components/ui/glowing-card";

// Icons
const Icons = {
    x: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    refresh: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    support: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    home: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
};

function PaymentFailedContent() {
    const router = useRouter();
    const { isRTL, language } = useI18n();

    // Common failure reasons
    const failureReasons = isRTL
        ? [
            "رصيد البطاقة غير كافٍ",
            "تم رفض البطاقة من البنك",
            "انتهت صلاحية البطاقة",
            "بيانات البطاقة غير صحيحة",
            "مشكلة في الاتصال بالشبكة",
        ]
        : [
            "Insufficient card balance",
            "Card declined by bank",
            "Expired card",
            "Incorrect card details",
            "Network connection issue",
        ];

    return (
        <div className={cn("min-h-screen bg-slate-950 flex items-center justify-center p-4", isRTL && "rtl")}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <GlowingCard glowColor="pink" className="p-8 text-center" isDark>
                    {/* Failed Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6"
                    >
                        <span className="text-red-400">{Icons.x}</span>
                    </motion.div>

                    {/* Failed Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {isRTL ? "فشل الدفع" : "Payment Failed"}
                        </h1>
                        <p className="text-gray-400 mb-6">
                            {isRTL
                                ? "لم نتمكن من معالجة الدفع. لم يتم خصم أي مبلغ من حسابك."
                                : "We couldn't process your payment. No amount was charged to your account."}
                        </p>
                    </motion.div>

                    {/* Common Reasons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-slate-800/50 rounded-xl p-4 mb-6 text-start"
                    >
                        <p className="text-gray-400 text-sm mb-3">
                            {isRTL ? "أسباب محتملة:" : "Possible reasons:"}
                        </p>
                        <ul className="space-y-2">
                            {failureReasons.slice(0, 3).map((reason, index) => (
                                <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                    >
                        <button
                            onClick={() => router.back()}
                            className="w-full py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
                        >
                            {Icons.refresh}
                            <span>{isRTL ? "حاول مرة أخرى" : "Try Again"}</span>
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

                {/* Support Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-4"
                >
                    <button
                        onClick={() => router.push(`/${language}/support`)}
                        className="text-gray-500 text-sm hover:text-gray-400 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        {Icons.support}
                        <span>
                            {isRTL ? "هل تحتاج مساعدة؟ تواصل مع الدعم" : "Need help? Contact Support"}
                        </span>
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}

function PaymentFailedLoading() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export default function PaymentFailedPage() {
    return (
        <Suspense fallback={<PaymentFailedLoading />}>
            <PaymentFailedContent />
        </Suspense>
    );
}
