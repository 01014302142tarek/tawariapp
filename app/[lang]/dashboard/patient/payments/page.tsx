"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { getPatientTransactions, TransactionRecord } from "@/app/actions/payments";

// Icons
const Icons = {
    receipt: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    x: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    clock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    refresh: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    card: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    ),
    wallet: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    empty: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    back: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    ),
};

export default function PaymentHistoryPage() {
    const router = useRouter();
    const { isRTL, language } = useI18n();
    const { isDark } = useGlobalTheme();

    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Load transactions
    useEffect(() => {
        async function loadTransactions() {
            const result = await getPatientTransactions();

            if (result.success && result.transactions) {
                setTransactions(result.transactions);
            } else {
                setError(result.error || (isRTL ? "فشل تحميل سجل الدفع" : "Failed to load payment history"));
            }
            setLoading(false);
        }

        loadTransactions();
    }, [isRTL]);

    // Get status color and icon
    const getStatusDisplay = (status: string) => {
        switch (status) {
            case "completed":
                return {
                    color: "text-[#FD614B]",
                    bg: "bg-[#FD614B]/20",
                    icon: Icons.check,
                    label: isRTL ? "مكتمل" : "Completed",
                };
            case "pending":
                return {
                    color: "text-[#FD614B]",
                    bg: "bg-[#FD614B]/20",
                    icon: Icons.clock,
                    label: isRTL ? "قيد الانتظار" : "Pending",
                };
            case "failed":
                return {
                    color: "text-red-400",
                    bg: "bg-red-500/20",
                    icon: Icons.x,
                    label: isRTL ? "فشل" : "Failed",
                };
            case "refunded":
                return {
                    color: "text-blue-400",
                    bg: "bg-blue-500/20",
                    icon: Icons.refresh,
                    label: isRTL ? "مسترد" : "Refunded",
                };
            default:
                return {
                    color: "text-gray-400",
                    bg: "bg-gray-500/20",
                    icon: Icons.clock,
                    label: status,
                };
        }
    };

    // Get transaction type label
    const getTypeLabel = (type: string) => {
        switch (type) {
            case "consultation":
                return isRTL ? "استشارة" : "Consultation";
            case "renewal":
                return isRTL ? "تجديد" : "Renewal";
            case "refund":
                return isRTL ? "استرداد" : "Refund";
            default:
                return type;
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Calculate totals
    const totalPaid = transactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0);

    // Loading state
    if (loading) {
        return (
            <div className={cn("min-h-screen flex items-center justify-center", isDark ? "bg-[#031326] text-white" : "bg-gray-50 text-slate-900")}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#FD614B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className={cn("text-lg", isDark ? "text-white" : "text-slate-900")}>
                        {isRTL ? "جاري التحميل..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen py-8 px-4", isDark ? "bg-[#031326]" : "bg-gray-50", isRTL && "rtl")}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push(`/${language}/dashboard/patient`)}
                        className={cn("flex items-center gap-2 transition-colors mb-4", isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-slate-900")}
                    >
                        <span className={isRTL ? "rotate-180" : ""}>{Icons.back}</span>
                        <span>{isRTL ? "العودة" : "Back"}</span>
                    </button>
                    <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                        {isRTL ? "سجل المدفوعات" : "Payment History"}
                    </h1>
                    <p className={cn("mt-1 text-sm sm:text-base", isDark ? "text-gray-400" : "text-gray-600")}>
                        {isRTL ? "عرض جميع معاملاتك المالية" : "View all your financial transactions"}
                    </p>
                </div>

                {/* Summary Card */}
                <GlowingCard glowColor="coral" className="p-5 mb-6" isDark={isDark}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                {isRTL ? "إجمالي المدفوعات" : "Total Paid"}
                            </p>
                            <p className={cn("text-2xl font-bold mt-1", isDark ? "text-white" : "text-slate-900")}>
                                {totalPaid.toFixed(2)} {isRTL ? "ج.م" : "EGP"}
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-[#FD614B]/20 flex items-center justify-center">
                            <span className="text-[#FD614B]">{Icons.receipt}</span>
                        </div>
                    </div>
                    <div className={cn("mt-4 pt-4 border-t flex gap-4 text-sm", isDark ? "border-white/10" : "border-slate-200")}>
                        <div>
                            <span className={isDark ? "text-gray-400" : "text-gray-600"}>{isRTL ? "عدد المعاملات" : "Transactions"}</span>
                            <span className={cn("font-medium ms-2", isDark ? "text-white" : "text-slate-900")}>{transactions.length}</span>
                        </div>
                        <div>
                            <span className={isDark ? "text-gray-400" : "text-gray-600"}>{isRTL ? "مكتملة" : "Completed"}</span>
                            <span className="text-[#FD614B] font-medium ms-2">
                                {transactions.filter((t) => t.status === "completed").length}
                            </span>
                        </div>
                    </div>
                </GlowingCard>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                        {error}
                    </div>
                )}

                {/* Empty State */}
                {transactions.length === 0 && !error && (
                    <GlowingCard glowColor="blue" className="p-8 text-center" isDark={isDark}>
                        <span className={cn("mx-auto block mb-4", isDark ? "text-gray-600" : "text-gray-400")}>{Icons.empty}</span>
                        <h3 className={cn("text-lg font-medium mb-2", isDark ? "text-white" : "text-slate-900")}>
                            {isRTL ? "لا توجد معاملات" : "No Transactions"}
                        </h3>
                        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                            {isRTL
                                ? "لم تقم بأي معاملات مالية بعد"
                                : "You haven't made any transactions yet"}
                        </p>
                    </GlowingCard>
                )}

                {/* Transactions List */}
                {transactions.length > 0 && (
                    <div className="space-y-3">
                        {transactions.map((transaction, index) => {
                            const statusDisplay = getStatusDisplay(transaction.status);

                            return (
                                <motion.div
                                    key={transaction.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <GlowingCard
                                        glowColor={transaction.status === "completed" ? "amber" : "blue"}
                                        className="p-4"
                                        isDark={isDark}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                                    statusDisplay.bg
                                                )}>
                                                    <span className={statusDisplay.color}>
                                                        {transaction.paymentMethod === "wallet"
                                                            ? Icons.wallet
                                                            : Icons.card}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                                                        {getTypeLabel(transaction.transactionType)}
                                                    </p>
                                                    {transaction.doctorName && (
                                                        <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                                            {transaction.doctorName}
                                                        </p>
                                                    )}
                                                    <p className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-500")}>
                                                        {formatDate(transaction.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <p className={cn(
                                                    "font-bold",
                                                    transaction.status === "completed"
                                                        ? isDark ? "text-white" : "text-slate-900"
                                                        : "text-gray-400"
                                                )}>
                                                    {transaction.amount.toFixed(2)} {isRTL ? "ج.م" : "EGP"}
                                                </p>
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 font-medium",
                                                    statusDisplay.bg,
                                                    statusDisplay.color
                                                )}>
                                                    {statusDisplay.icon}
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
            </div>
        </div>
    );
}
