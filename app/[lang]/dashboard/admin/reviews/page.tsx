"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { SparklesCore } from "@/components/ui/sparkles";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useI18n } from "@/app/i18n";
import {
    getReviewsForModeration,
    hideReview,
    unhideReview,
    type ReviewWithDetails,
} from "@/app/actions/reviews";
import { StarRating } from "@/components/reviews";

// Icons
const Icons = {
    star: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
    ),
    visible: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    hidden: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    ),
    all: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
    ),
    search: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    flag: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
    ),
    restore: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
        </svg>
    ),
};

const Badge = ({ variant, children }: { variant: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        visible: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        hidden: "bg-red-500/10 text-red-400 border border-red-500/20",
        anonymous: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant] || variants.visible)}>
            {children}
        </span>
    );
};

export default function AdminReviewsPage() {
    const { t, isRTL, formatNumber } = useI18n();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");
    const [search, setSearch] = useState("");
    const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [selectedReview, setSelectedReview] = useState<ReviewWithDetails | null>(null);
    const [showHideModal, setShowHideModal] = useState(false);
    const [hideReason, setHideReason] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Fetch reviews
    useEffect(() => {
        async function fetchReviews() {
            setIsLoading(true);
            try {
                const visibleOnly = filter === "visible" ? true : filter === "hidden" ? false : undefined;
                const result = await getReviewsForModeration({
                    limit: 50,
                    visibleOnly: visibleOnly === true ? true : undefined,
                });

                if (result.reviews) {
                    let filteredReviews = result.reviews;
                    // If filter is "hidden", filter to only hidden reviews
                    if (filter === "hidden") {
                        filteredReviews = result.reviews.filter(r => !r.is_visible);
                    } else if (filter === "visible") {
                        filteredReviews = result.reviews.filter(r => r.is_visible);
                    }
                    setReviews(filteredReviews);
                    setTotal(filteredReviews.length);
                }
            } catch {
                // Error handled silently - reviews will show empty state
            }
            setIsLoading(false);
        }
        fetchReviews();
    }, [filter]);

    // Hide review handler
    const handleHide = async (reviewId: string) => {
        if (!hideReason.trim()) return;

        setActionLoading(reviewId);
        try {
            const result = await hideReview({ reviewId, reason: hideReason });
            if (result.success) {
                setReviews(prev => prev.map(r =>
                    r.id === reviewId ? { ...r, is_visible: false, hidden_reason: hideReason } : r
                ));
                setShowHideModal(false);
                setSelectedReview(null);
                setHideReason("");
            }
        } catch {
            // Error hiding review - action state will reset
        }
        setActionLoading(null);
    };

    // Unhide review handler
    const handleUnhide = async (reviewId: string) => {
        setActionLoading(reviewId);
        try {
            const result = await unhideReview(reviewId);
            if (result.success) {
                setReviews(prev => prev.map(r =>
                    r.id === reviewId ? { ...r, is_visible: true, hidden_reason: undefined } : r
                ));
            }
        } catch {
            // Error unhiding review - action state will reset
        }
        setActionLoading(null);
    };

    // Filter reviews by search
    const filteredReviews = reviews.filter(review => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        const patientName = review.patient?.profile?.full_name?.toLowerCase() || "";
        const doctorName = review.doctor?.profile?.full_name?.toLowerCase() || "";
        const comment = review.comment?.toLowerCase() || "";
        return patientName.includes(searchLower) || doctorName.includes(searchLower) || comment.includes(searchLower);
    });

    // Stats
    const visibleCount = reviews.filter(r => r.is_visible).length;
    const hiddenCount = reviews.filter(r => !r.is_visible).length;

    const statsConfig = [
        { label: isRTL ? "إجمالي التقييمات" : "Total Reviews", value: total, icon: Icons.star, color: "teal" },
        { label: isRTL ? "مرئي" : "Visible", value: visibleCount, icon: Icons.visible, color: "emerald" },
        { label: isRTL ? "مخفي" : "Hidden", value: hiddenCount, icon: Icons.hidden, color: "red" },
    ];

    const getFilterLabel = (key: string) => {
        const labels: Record<string, string> = {
            all: isRTL ? "الكل" : "All",
            visible: isRTL ? "مرئي" : "Visible",
            hidden: isRTL ? "مخفي" : "Hidden",
        };
        return labels[key] || key;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Helper to get patient name
    const getPatientName = (review: ReviewWithDetails) => {
        if (review.is_anonymous) {
            return isRTL ? "مريض مجهول" : "Anonymous";
        }
        return review.patient?.profile?.full_name || (isRTL ? "مريض" : "Patient");
    };

    // Helper to get doctor name
    const getDoctorName = (review: ReviewWithDetails) => {
        return review.doctor?.profile?.full_name || (isRTL ? "طبيب" : "Doctor");
    };

    return (
        <div className="relative overflow-hidden min-h-screen">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="reviews-sparkles"
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={isDark ? 20 : 10}
                    particleColor={isDark ? "20, 184, 166" : "13, 148, 136"}
                />
                {isDark && (
                    <>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
                    </>
                )}
            </div>

            <main className="relative z-0 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className={cn("text-xl md:text-2xl lg:text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                            {isRTL ? "إدارة التقييمات" : "Review Moderation"}
                        </h1>
                        <p className={cn("text-sm md:text-base lg:text-lg mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            {isRTL ? "مراجعة وإدارة تقييمات المرضى" : "Review and manage patient reviews"}
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                    {statsConfig.map((stat, idx) => (
                        <GlowingCard key={idx} glowColor="teal" className="p-3 md:p-4" isDark={isDark}>
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center bg-teal-500/10 text-teal-500">
                                    <span className="[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">
                                        {stat.icon}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-0.5">
                                        <p className={cn("text-lg md:text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                            <AnimatedNumber value={stat.value} format={formatNumber} />
                                        </p>
                                    </div>
                                    <p className={cn("text-[10px] md:text-xs truncate", isDark ? "text-gray-500" : "text-gray-600")}>{stat.label}</p>
                                </div>
                            </div>
                        </GlowingCard>
                    ))}
                </div>

                {/* Search and Filters */}
                <GlowingCard glowColor="teal" className="p-3 md:p-4 mb-4 md:mb-6" isDark={isDark}>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <div className={cn("absolute top-1/2 -translate-y-1/2 text-gray-500", isRTL ? "right-3" : "left-3")}>{Icons.search}</div>
                            <input
                                type="text"
                                placeholder={isRTL ? "البحث في التقييمات..." : "Search reviews..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={cn(
                                    "w-full py-2.5 rounded-xl border outline-none transition-colors",
                                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
                                    isDark
                                        ? "bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50"
                                        : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500"
                                )}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {(["all", "visible", "hidden"] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize",
                                        filter === f
                                            ? "bg-teal-500 text-white"
                                            : isDark
                                                ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    )}
                                >
                                    {getFilterLabel(f)}
                                </button>
                            ))}
                        </div>
                    </div>
                </GlowingCard>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <GlowingCard glowColor="teal" className="p-12 text-center" isDark={isDark}>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.star}
                        </div>
                        <h3 className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                            {isRTL ? "لا توجد تقييمات" : "No Reviews"}
                        </h3>
                        <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-600")}>
                            {isRTL
                                ? "لا توجد تقييمات تطابق معايير البحث"
                                : "No reviews match your search criteria"}
                        </p>
                    </GlowingCard>
                ) : (
                    /* Reviews List */
                    <div className="space-y-4">
                        {filteredReviews.map((review, idx) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <GlowingCard glowColor="teal" className="p-4 md:p-6" isDark={isDark}>
                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                        {/* Left: Review Content */}
                                        <div className="flex-1">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-teal-500/30">
                                                        <Image
                                                            src={review.patient?.profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"}
                                                            alt={getPatientName(review)}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className={cn("font-medium text-sm md:text-base", isDark ? "text-white" : "text-slate-900")}>
                                                            {getPatientName(review)}
                                                        </p>
                                                        <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-600")}>
                                                            {isRTL ? "لـ" : "to"} {getDoctorName(review)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <StarRating rating={review.rating} size="sm" isDark={isDark} />
                                                    {review.is_anonymous && <Badge variant="anonymous">{isRTL ? "مجهول" : "Anonymous"}</Badge>}
                                                    <Badge variant={review.is_visible ? "visible" : "hidden"}>
                                                        {review.is_visible ? (isRTL ? "مرئي" : "Visible") : (isRTL ? "مخفي" : "Hidden")}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Comment */}
                                            {review.comment && (
                                                <p className={cn("text-sm leading-relaxed mb-3", isDark ? "text-gray-300" : "text-gray-600")}>
                                                    {review.comment}
                                                </p>
                                            )}

                                            {/* Doctor Response */}
                                            {review.doctor_response && (
                                                <div className={cn("p-3 rounded-lg mb-3", isDark ? "bg-teal-900/30" : "bg-teal-50")}>
                                                    <p className={cn("text-xs font-medium mb-1", isDark ? "text-teal-400" : "text-teal-700")}>
                                                        {isRTL ? "رد الطبيب:" : "Doctor's Response:"}
                                                    </p>
                                                    <p className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
                                                        {review.doctor_response}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Hidden Reason */}
                                            {!review.is_visible && review.hidden_reason && (
                                                <div className={cn("p-3 rounded-lg mb-3", isDark ? "bg-red-900/30" : "bg-red-50")}>
                                                    <p className={cn("text-xs font-medium mb-1", isDark ? "text-red-400" : "text-red-700")}>
                                                        {isRTL ? "سبب الإخفاء:" : "Hidden Reason:"}
                                                    </p>
                                                    <p className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
                                                        {review.hidden_reason}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Date */}
                                            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>
                                                {formatDate(review.created_at)}
                                            </p>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex md:flex-col gap-2">
                                            {review.is_visible ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedReview(review);
                                                        setShowHideModal(true);
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                        isDark
                                                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                                            : "bg-red-50 hover:bg-red-100 text-red-600"
                                                    )}
                                                >
                                                    {Icons.flag}
                                                    <span>{isRTL ? "إخفاء" : "Hide"}</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUnhide(review.id)}
                                                    disabled={actionLoading === review.id}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                        isDark
                                                            ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                                                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600",
                                                        actionLoading === review.id && "opacity-50"
                                                    )}
                                                >
                                                    {actionLoading === review.id ? (
                                                        <span className="animate-spin">⏳</span>
                                                    ) : (
                                                        <>
                                                            {Icons.restore}
                                                            <span>{isRTL ? "استعادة" : "Restore"}</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </GlowingCard>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Hide Modal */}
            <AnimatePresence>
                {showHideModal && selectedReview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            setShowHideModal(false);
                            setSelectedReview(null);
                            setHideReason("");
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "w-full max-w-md rounded-2xl p-6",
                                isDark ? "bg-slate-900 border border-white/10" : "bg-white"
                            )}
                        >
                            <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-slate-900")}>
                                {isRTL ? "إخفاء التقييم" : "Hide Review"}
                            </h3>

                            {/* Review Preview */}
                            <div className={cn("p-3 rounded-lg mb-4", isDark ? "bg-white/5" : "bg-gray-50")}>
                                <div className="flex items-center gap-2 mb-2">
                                    <StarRating rating={selectedReview.rating} size="sm" isDark={isDark} />
                                    <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                        {isRTL ? "بواسطة" : "by"} {getPatientName(selectedReview)}
                                    </span>
                                </div>
                                {selectedReview.comment && (
                                    <p className={cn("text-sm line-clamp-2", isDark ? "text-gray-300" : "text-gray-600")}>
                                        {selectedReview.comment}
                                    </p>
                                )}
                            </div>

                            <p className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
                                {isRTL
                                    ? "هل أنت متأكد من إخفاء هذا التقييم؟ لن يظهر للمستخدمين الآخرين."
                                    : "Are you sure you want to hide this review? It won't be visible to other users."}
                            </p>
                            <textarea
                                value={hideReason}
                                onChange={(e) => setHideReason(e.target.value)}
                                placeholder={isRTL ? "سبب الإخفاء (مطلوب)" : "Reason for hiding (required)"}
                                rows={3}
                                className={cn(
                                    "w-full p-3 rounded-xl border outline-none transition-colors mb-4 resize-none",
                                    isDark
                                        ? "bg-slate-800 border-white/10 text-white placeholder-gray-500 focus:border-red-500/50"
                                        : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-red-500"
                                )}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowHideModal(false);
                                        setSelectedReview(null);
                                        setHideReason("");
                                    }}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-xl font-medium transition-colors",
                                        isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    )}
                                >
                                    {isRTL ? "إلغاء" : "Cancel"}
                                </button>
                                <button
                                    onClick={() => handleHide(selectedReview.id)}
                                    disabled={!hideReason.trim() || actionLoading === selectedReview.id}
                                    className="flex-1 py-2.5 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                                >
                                    {actionLoading === selectedReview.id ? "..." : (isRTL ? "تأكيد الإخفاء" : "Confirm Hide")}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
