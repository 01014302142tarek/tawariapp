"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useThemeStyles } from "../context/useThemeStyles";
import { useI18n } from "@/app/i18n";
import { useAuth, isDoctorProfile } from "@/app/context/AuthContext";
import { ReviewCard, StarRating } from "@/components/reviews";
import {
    getDoctorReviews,
    getDoctorRatingStats,
    respondToReview,
    type ReviewWithDetails,
} from "@/app/actions/reviews";

// Icons
const Icons = {
    star: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
    ),
    filter: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
    ),
    reply: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

export default function DoctorReviewsPage() {
    const { t, isRTL, formatNumber } = useI18n();
    const { profile } = useAuth();
    const { isDark, textPrimary, textSecondary, textMuted, inputBg, inputFocus, buttonSecondary, buttonSecondaryActive } = useThemeStyles();

    const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
    const [stats, setStats] = useState({ rating_average: 0, rating_count: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState<"all" | "responded" | "pending">("all");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

    // Fetch reviews
    useEffect(() => {
        async function fetchData() {
            if (!profile || !isDoctorProfile(profile) || !profile.doctorProfile) return;

            setIsLoading(true);
            try {
                const hasResponse = filter === "responded" ? true : filter === "pending" ? false : undefined;

                const [reviewsResult, statsResult] = await Promise.all([
                    getDoctorReviews({
                        limit: 50,
                        sortBy,
                        hasResponse,
                    }),
                    getDoctorRatingStats(profile.doctorProfile.id),
                ]);

                if (reviewsResult.reviews) {
                    setReviews(reviewsResult.reviews);
                    setTotal(reviewsResult.total);
                }

                if (statsResult.stats) {
                    setStats(statsResult.stats);
                }
            } catch {
                // Error handled silently - reviews will show empty state
            }
            setIsLoading(false);
        }

        fetchData();
    }, [profile, filter, sortBy]);

    // Handle respond to review
    const handleRespond = async (reviewId: string, response: string) => {
        const result = await respondToReview({ reviewId, response });
        if (result.success) {
            // Update the review in the list
            setReviews(prev => prev.map(r =>
                r.id === reviewId
                    ? { ...r, doctor_response: response, doctor_responded_at: new Date().toISOString() }
                    : r
            ));
        }
    };

    // Calculate stats
    const respondedCount = reviews.filter(r => r.doctor_response).length;
    const pendingCount = reviews.filter(r => !r.doctor_response).length;

    // Rating distribution
    const ratingDistribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
            ratingDistribution[r.rating - 1]++;
        }
    });

    const getFilterLabel = (key: string) => {
        const labels: Record<string, string> = {
            all: isRTL ? "الكل" : "All",
            responded: isRTL ? "تم الرد" : "Responded",
            pending: isRTL ? "بانتظار الرد" : "Pending",
        };
        return labels[key] || key;
    };

    const getSortLabel = (key: string) => {
        const labels: Record<string, string> = {
            newest: isRTL ? "الأحدث" : "Newest",
            oldest: isRTL ? "الأقدم" : "Oldest",
            highest: isRTL ? "الأعلى تقييماً" : "Highest",
            lowest: isRTL ? "الأدنى تقييماً" : "Lowest",
        };
        return labels[key] || key;
    };

    if (!profile || !isDoctorProfile(profile)) {
        return (
            <div className="p-4 md:p-6 lg:p-8">
                <div className={cn("text-center py-12", textMuted)}>
                    {isRTL ? "يرجى تسجيل الدخول كطبيب" : "Please log in as a doctor"}
                </div>
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
                            {Icons.star}
                        </span>
                        {isRTL ? "تقييمات المرضى" : "Patient Reviews"}
                    </h1>
                    <p className={cn("text-sm md:text-base mt-1", textMuted)}>
                        {formatNumber(total)} {isRTL ? "تقييم" : "reviews"}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                {/* Overall Rating */}
                <GlowingCard glowColor="teal" className="p-4 md:p-5" isDark={isDark}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className={cn("text-2xl md:text-3xl font-bold", textPrimary)}>
                                {stats.rating_average.toFixed(1)}
                            </p>
                            <p className={cn("text-xs md:text-sm", textMuted)}>
                                {isRTL ? "التقييم العام" : "Overall Rating"}
                            </p>
                        </div>
                    </div>
                </GlowingCard>

                {/* Total Reviews */}
                <GlowingCard glowColor="teal" className="p-4 md:p-5" isDark={isDark}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.star}
                        </div>
                        <div>
                            <p className={cn("text-2xl md:text-3xl font-bold", textPrimary)}>
                                <AnimatedNumber value={stats.rating_count} format={formatNumber} />
                            </p>
                            <p className={cn("text-xs md:text-sm", textMuted)}>
                                {isRTL ? "إجمالي التقييمات" : "Total Reviews"}
                            </p>
                        </div>
                    </div>
                </GlowingCard>

                {/* Responded */}
                <GlowingCard glowColor="teal" className="p-4 md:p-5" isDark={isDark}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            {Icons.check}
                        </div>
                        <div>
                            <p className={cn("text-2xl md:text-3xl font-bold", textPrimary)}>
                                <AnimatedNumber value={respondedCount} format={formatNumber} />
                            </p>
                            <p className={cn("text-xs md:text-sm", textMuted)}>
                                {isRTL ? "تم الرد" : "Responded"}
                            </p>
                        </div>
                    </div>
                </GlowingCard>

                {/* Pending Response */}
                <GlowingCard glowColor="teal" className="p-4 md:p-5" isDark={isDark}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            {Icons.reply}
                        </div>
                        <div>
                            <p className={cn("text-2xl md:text-3xl font-bold", textPrimary)}>
                                <AnimatedNumber value={pendingCount} format={formatNumber} />
                            </p>
                            <p className={cn("text-xs md:text-sm", textMuted)}>
                                {isRTL ? "بانتظار الرد" : "Pending"}
                            </p>
                        </div>
                    </div>
                </GlowingCard>
            </div>

            {/* Rating Distribution */}
            <GlowingCard glowColor="teal" className="p-4 md:p-6 mb-6 md:mb-8" isDark={isDark}>
                <h3 className={cn("font-semibold mb-4", textPrimary)}>
                    {isRTL ? "توزيع التقييمات" : "Rating Distribution"}
                </h3>
                <div className="flex items-center gap-6">
                    {/* Average */}
                    <div className="text-center">
                        <p className={cn("text-4xl font-bold", textPrimary)}>
                            {stats.rating_average.toFixed(1)}
                        </p>
                        <StarRating rating={stats.rating_average} size="sm" isDark={isDark} />
                        <p className={cn("text-sm mt-1", textMuted)}>
                            {formatNumber(stats.rating_count)} {isRTL ? "تقييم" : "reviews"}
                        </p>
                    </div>

                    {/* Distribution Bars */}
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingDistribution[star - 1];
                            const percentage = total > 0 ? (count / total) * 100 : 0;

                            return (
                                <div key={star} className="flex items-center gap-2">
                                    <span className={cn("text-xs w-3", textMuted)}>{star}</span>
                                    <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                                        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                    </svg>
                                    <div className={cn("flex-1 h-2 rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-gray-200")}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 0.5 }}
                                            className="h-full bg-yellow-400 rounded-full"
                                        />
                                    </div>
                                    <span className={cn("text-xs w-8 text-end", textMuted)}>
                                        {formatNumber(count)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </GlowingCard>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {(["all", "pending", "responded"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                                filter === f
                                    ? buttonSecondaryActive
                                    : buttonSecondary
                            )}
                        >
                            {getFilterLabel(f)}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 sm:ml-auto">
                    <span className={cn("text-sm", textMuted)}>{isRTL ? "ترتيب:" : "Sort:"}</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className={cn(
                            "px-3 py-2 rounded-xl text-sm border",
                            inputBg,
                            inputFocus
                        )}
                    >
                        {(["newest", "oldest", "highest", "lowest"] as const).map((s) => (
                            <option key={s} value={s}>{getSortLabel(s)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "rounded-xl p-4 border animate-pulse",
                                isDark ? "bg-slate-800/50 border-white/5" : "bg-white border-gray-200"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-full", isDark ? "bg-slate-700" : "bg-gray-200")} />
                                <div className="flex-1">
                                    <div className={cn("h-4 rounded w-1/3 mb-2", isDark ? "bg-slate-700" : "bg-gray-200")} />
                                    <div className={cn("h-3 rounded w-1/4", isDark ? "bg-slate-700" : "bg-gray-200")} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <GlowingCard glowColor="teal" className="p-12 text-center" isDark={isDark}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                        {Icons.star}
                    </div>
                    <h3 className={cn("text-lg font-semibold mb-2", textPrimary)}>
                        {isRTL ? "لا توجد تقييمات" : "No Reviews Yet"}
                    </h3>
                    <p className={cn("text-sm", textMuted)}>
                        {isRTL
                            ? "لم يتم إضافة أي تقييمات حتى الآن"
                            : "No reviews have been submitted yet"}
                    </p>
                </GlowingCard>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review, idx) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <ReviewCard
                                review={review}
                                isDark={isDark}
                                isRTL={isRTL}
                                showPatient={true}
                                canRespond={true}
                                onRespond={handleRespond}
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
