"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { GlowingCard } from "@/components/ui/glowing-card";
import { getDoctorEarnings, requestPayout } from "@/app/actions/payments";

// Icons
const Icons = {
    money: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    clock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    bank: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
    ),
    trending: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    user: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    empty: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    ),
    back: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    ),
};

interface EarningsData {
    totalEarnings: number;
    pendingEarnings: number;
    availableForPayout: number;
    paidOut: number;
    recentEarnings: Array<{
        id: string;
        amount: number;
        status: string;
        createdAt: string;
        patientName?: string;
    }>;
}

export default function DoctorEarningsPage() {
    const router = useRouter();
    const { isRTL, language } = useI18n();

    const [loading, setLoading] = useState(true);
    const [earnings, setEarnings] = useState<EarningsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [withdrawError, setWithdrawError] = useState<string | null>(null);
    const [withdrawSuccess, setWithdrawSuccess] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
    });

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains("dark"));
        };
        
        checkDarkMode();
        
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        
        return () => observer.disconnect();
    }, []);

    // Load earnings
    useEffect(() => {
        async function loadEarnings() {
            const result = await getDoctorEarnings();

            if (result.success && result.earnings) {
                setEarnings(result.earnings);
            } else {
                setError(result.error || (isRTL ? "فشل تحميل الأرباح" : "Failed to load earnings"));
            }
            setLoading(false);
        }

        loadEarnings();
    }, [isRTL]);

    // Handle withdrawal request
    const handleWithdraw = async () => {
        setWithdrawing(true);
        setWithdrawError(null);

        const result = await requestPayout(bankDetails);

        if (result.success) {
            setWithdrawSuccess(true);
            // Reload earnings to reflect the change
            const updatedEarnings = await getDoctorEarnings();
            if (updatedEarnings.success && updatedEarnings.earnings) {
                setEarnings(updatedEarnings.earnings);
            }
            // Close modal after 2 seconds
            setTimeout(() => {
                setShowWithdrawModal(false);
                setWithdrawSuccess(false);
                setBankDetails({ bankName: "", accountNumber: "", accountHolderName: "" });
            }, 2000);
        } else {
            setWithdrawError(result.error || (isRTL ? "فشل طلب السحب" : "Failed to request withdrawal"));
        }

        setWithdrawing(false);
    };

    // Get status display
    const getStatusDisplay = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    color: "text-amber-400",
                    bg: "bg-amber-500/20",
                    label: isRTL ? "قيد الانتظار" : "Pending",
                };
            case "available":
                return {
                    color: "text-teal-400",
                    bg: "bg-teal-500/20",
                    label: isRTL ? "متاح للسحب" : "Available",
                };
            case "paid_out":
                return {
                    color: "text-blue-400",
                    bg: "bg-blue-500/20",
                    label: isRTL ? "تم الدفع" : "Paid Out",
                };
            default:
                return {
                    color: "text-gray-400",
                    bg: "bg-gray-500/20",
                    label: status,
                };
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">
                        {isRTL ? "جاري التحميل..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen bg-slate-950 py-8 px-4", isRTL && "rtl")}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push(`/${language}/dashboard/doctor`)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <span className={isRTL ? "rotate-180" : ""}>{Icons.back}</span>
                        <span>{isRTL ? "العودة" : "Back"}</span>
                    </button>
                    <h1 className="text-2xl font-bold text-white">
                        {isRTL ? "الأرباح" : "Earnings"}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {isRTL ? "تتبع أرباحك ومدفوعاتك" : "Track your earnings and payouts"}
                    </p>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                        {error}
                    </div>
                )}

                {earnings && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Total Earnings */}
                            <GlowingCard glowColor="teal" className="p-4" isDark>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-teal-400">{Icons.trending}</span>
                                    <span className="text-gray-400 text-sm">
                                        {isRTL ? "إجمالي الأرباح" : "Total Earnings"}
                                    </span>
                                </div>
                                <p className="text-xl font-bold text-white">
                                    {earnings.totalEarnings.toFixed(2)}
                                    <span className="text-sm text-gray-400 ms-1">
                                        {isRTL ? "ج.م" : "EGP"}
                                    </span>
                                </p>
                            </GlowingCard>

                            {/* Available for Payout */}
                            <GlowingCard glowColor="green" className="p-4" isDark>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-green-400">{Icons.check}</span>
                                    <span className="text-gray-400 text-sm">
                                        {isRTL ? "متاح للسحب" : "Available"}
                                    </span>
                                </div>
                                <p className="text-xl font-bold text-white">
                                    {earnings.availableForPayout.toFixed(2)}
                                    <span className="text-sm text-gray-400 ms-1">
                                        {isRTL ? "ج.م" : "EGP"}
                                    </span>
                                </p>
                            </GlowingCard>

                            {/* Pending */}
                            <GlowingCard glowColor="amber" className="p-4" isDark>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-amber-400">{Icons.clock}</span>
                                    <span className="text-gray-400 text-sm">
                                        {isRTL ? "قيد الانتظار" : "Pending"}
                                    </span>
                                </div>
                                <p className="text-xl font-bold text-white">
                                    {earnings.pendingEarnings.toFixed(2)}
                                    <span className="text-sm text-gray-400 ms-1">
                                        {isRTL ? "ج.م" : "EGP"}
                                    </span>
                                </p>
                            </GlowingCard>

                            {/* Paid Out */}
                            <GlowingCard glowColor="blue" className="p-4" isDark>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-blue-400">{Icons.bank}</span>
                                    <span className="text-gray-400 text-sm">
                                        {isRTL ? "تم صرفه" : "Paid Out"}
                                    </span>
                                </div>
                                <p className="text-xl font-bold text-white">
                                    {earnings.paidOut.toFixed(2)}
                                    <span className="text-sm text-gray-400 ms-1">
                                        {isRTL ? "ج.م" : "EGP"}
                                    </span>
                                </p>
                            </GlowingCard>
                        </div>

                        {/* Request Payout Button */}
                        {earnings.availableForPayout > 0 && (
                            <GlowingCard glowColor="teal" className="p-4 mb-6" isDark>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">
                                            {isRTL ? "طلب سحب الأرباح" : "Request Payout"}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {isRTL
                                                ? `لديك ${earnings.availableForPayout.toFixed(2)} ج.م متاح للسحب`
                                                : `You have ${earnings.availableForPayout.toFixed(2)} EGP available`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowWithdrawModal(true)}
                                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
                                    >
                                        {Icons.bank}
                                        <span>{isRTL ? "سحب" : "Withdraw"}</span>
                                    </button>
                                </div>
                            </GlowingCard>
                        )}

                        {/* Recent Earnings */}
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-white">
                                {isRTL ? "الأرباح الأخيرة" : "Recent Earnings"}
                            </h2>
                        </div>

                        {/* Empty State */}
                        {earnings.recentEarnings.length === 0 && (
                            <GlowingCard glowColor="blue" className="p-8 text-center" isDark>
                                <span className="text-gray-600 mx-auto block mb-4">{Icons.empty}</span>
                                <h3 className="text-lg font-medium text-white mb-2">
                                    {isRTL ? "لا توجد أرباح بعد" : "No Earnings Yet"}
                                </h3>
                                <p className="text-gray-400">
                                    {isRTL
                                        ? "ستظهر أرباحك هنا بعد إتمام الاستشارات"
                                        : "Your earnings will appear here after completing consultations"}
                                </p>
                            </GlowingCard>
                        )}

                        {/* Earnings List */}
                        {earnings.recentEarnings.length > 0 && (
                            <div className="space-y-3">
                                {earnings.recentEarnings.map((earning, index) => {
                                    const statusDisplay = getStatusDisplay(earning.status);

                                    return (
                                        <motion.div
                                            key={earning.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <GlowingCard glowColor="teal" className="p-4" isDark>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                                                            <span className="text-teal-400">{Icons.user}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">
                                                                {earning.patientName || (isRTL ? "مريض" : "Patient")}
                                                            </p>
                                                            <p className="text-gray-500 text-xs">
                                                                {formatDate(earning.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <p className="text-white font-bold">
                                                            +{earning.amount.toFixed(2)} {isRTL ? "ج.م" : "EGP"}
                                                        </p>
                                                        <span className={cn(
                                                            "inline-block text-xs px-2 py-0.5 rounded-full mt-1",
                                                            statusDisplay.bg,
                                                            statusDisplay.color
                                                        )}>
                                                            {statusDisplay.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </GlowingCard>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Platform Fee Note */}
                        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-white/10">
                            <p className="text-gray-400 text-sm">
                                {isRTL
                                    ? "ملاحظة: يتم خصم رسوم المنصة (2.75% + 3 ج.م) من كل استشارة قبل احتساب صافي أرباحك."
                                    : "Note: Platform fee (2.75% + 3 EGP) is deducted from each consultation before calculating your net earnings."}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "w-full max-w-md rounded-2xl border p-6",
                            isDark ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"
                        )}
                    >
                        {withdrawSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-green-400">{Icons.check}</span>
                                </div>
                                <h3 className={cn("text-xl font-bold mb-2", isDark ? "text-white" : "text-slate-900")}>
                                    {isRTL ? "تم تقديم الطلب بنجاح!" : "Request Submitted!"}
                                </h3>
                                <p className={cn(isDark ? "text-gray-400" : "text-gray-600")}>
                                    {isRTL
                                        ? "سيتم معالجة طلب السحب خلال 3-5 أيام عمل"
                                        : "Your withdrawal will be processed within 3-5 business days"}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                        {isRTL ? "طلب سحب الأرباح" : "Request Withdrawal"}
                                    </h3>
                                    <button
                                        onClick={() => setShowWithdrawModal(false)}
                                        className={cn(isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                                    <p className="text-teal-400 text-sm">
                                        {isRTL
                                            ? `المبلغ المتاح للسحب: ${earnings?.availableForPayout.toFixed(2)} ج.م`
                                            : `Available for withdrawal: ${earnings?.availableForPayout.toFixed(2)} EGP`}
                                    </p>
                                </div>

                                {withdrawError && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <p className="text-red-400 text-sm">{withdrawError}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className={cn("block text-sm mb-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                            {isRTL ? "اسم البنك" : "Bank Name"}
                                        </label>
                                        <input
                                            type="text"
                                            value={bankDetails.bankName}
                                            onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                            placeholder={isRTL ? "مثال: البنك الأهلي المصري" : "e.g., National Bank of Egypt"}
                                            className={cn(
                                                "w-full px-4 py-3 border rounded-lg focus:outline-none",
                                                isDark
                                                    ? "bg-slate-800 border-white/10 text-white placeholder-gray-500 focus:border-teal-500"
                                                    : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500"
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <label className={cn("block text-sm mb-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                            {isRTL ? "رقم الحساب" : "Account Number"}
                                        </label>
                                        <input
                                            type="text"
                                            value={bankDetails.accountNumber}
                                            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                            placeholder={isRTL ? "رقم الحساب البنكي" : "Bank account number"}
                                            className={cn(
                                                "w-full px-4 py-3 border rounded-lg focus:outline-none",
                                                isDark
                                                    ? "bg-slate-800 border-white/10 text-white placeholder-gray-500 focus:border-teal-500"
                                                    : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500"
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <label className={cn("block text-sm mb-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                            {isRTL ? "اسم صاحب الحساب" : "Account Holder Name"}
                                        </label>
                                        <input
                                            type="text"
                                            value={bankDetails.accountHolderName}
                                            onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                                            placeholder={isRTL ? "الاسم كما يظهر في الحساب" : "Name as it appears on account"}
                                            className={cn(
                                                "w-full px-4 py-3 border rounded-lg focus:outline-none",
                                                isDark
                                                    ? "bg-slate-800 border-white/10 text-white placeholder-gray-500 focus:border-teal-500"
                                                    : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500"
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setShowWithdrawModal(false)}
                                        className={cn(
                                            "flex-1 px-4 py-3 border rounded-lg transition-colors",
                                            isDark
                                                ? "border-white/10 text-white hover:bg-white/5"
                                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                        )}
                                    >
                                        {isRTL ? "إلغاء" : "Cancel"}
                                    </button>
                                    <button
                                        onClick={handleWithdraw}
                                        disabled={withdrawing || !bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountHolderName}
                                        className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {withdrawing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>{isRTL ? "جاري الإرسال..." : "Submitting..."}</span>
                                            </>
                                        ) : (
                                            <span>{isRTL ? "تأكيد السحب" : "Confirm Withdrawal"}</span>
                                        )}
                                    </button>
                                </div>

                                <p className={cn("mt-4 text-xs text-center", isDark ? "text-gray-500" : "text-gray-600")}>
                                    {isRTL
                                        ? "سيتم معالجة طلب السحب خلال 3-5 أيام عمل"
                                        : "Withdrawal requests are processed within 3-5 business days"}
                                </p>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
