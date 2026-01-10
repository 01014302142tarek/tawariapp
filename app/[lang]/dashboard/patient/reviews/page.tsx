"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../context/useThemeStyles";
import { GlowingCard } from "@/components/ui/glowing-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useI18n } from "@/app/i18n";
import { StarRating } from "@/components/reviews";
import {
    getMyReviews,
    type ReviewWithDetails,
} from "@/app/actions/reviews";

// Icons
const Icons = {
    star: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
    ),
    doctor: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
    ),
    reply: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
    ),
    check: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    calendar: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
};

export default function PatientReviewsPage() {
    const { isRTL, formatNumber } = useI18n();
    const { isDark, textPrimary, textSecondary, textMuted } = useThemeStyles();

    const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            setIsLoading(true);
            try {
                const result = await getMyReviews();
                if (result.reviews) {
                    setReviews(result.reviews);
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
            setIsLoading(false);
        }

        fetchReviews();
    }, []);

    // Calculate stats
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
    const withResponse = reviews.filter(r => r.doctor_response).length;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Helper to get doctor info
    const getDoctorName = (review: ReviewWithDetails) => {
        return review.doctor?.profile?.full_name || (isRTL ? "طبيب" : "Doctor");
    };

    const getDoctorAvatar = (review: ReviewWithDetails) => {
        return review.doctor?.profile?.avatar_url || null;
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                        <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.star}
                        </span>
                        {isRTL ? "تقييماتي" : "My Reviews"}
                    </h1>
                    <p className={cn("text-sm md:text-base mt-1", textMuted)}>
                        {isRTL ? "التقييمات التي أضفتها للأطباء" : "Reviews you've submitted for doctors"}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                {/* Total Reviews */}
                <GlowingCard glowColor="teal" className="p-4 md:p-5" isDark={isDark}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.star}
                        </div>
                        <div>
                            <p className={cn("text-2xl md:text-3xl font-bold", textPrimary)}>
                                <AnimatedNumber value={reviews.length} format={formatNumber} />
                            </p>
                            <p className={cn("text-xs md:text-sm", textMuted)}>
                                {isRTL ? "التقييمات" : "Reviews"}
                            </p>
                        </div>
                    </div>
                </GlowingCard>

                {/* Average Rating */}
                <GlowingCard glowColor="teal" className="p-4 md:p-5" isDark={isDark}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className={cn("text-2xl md:text-3xl font-bold", textPrimary)}>
                                {avgRating.toFixed(1)}
                            </p>
                            <p className={cn("text-xs md:text-sm", textMuted)}>
                                {isRTL ? "متوسط التقييم" : "Avg Rating"}
                            </p>
                        </div>
                    </div>
                </GlowingCard>

                {/* With Responses */}
                <GlowingCard glowColor="teal" className="p-4 md:p-5" isDark={isDark}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            {Icons.check}
                        </div>
                        <div>
                            <p className={cn("text-2xl md:text-3xl font-bold", textPrimary)}>
                                <AnimatedNumber value={withResponse} format={formatNumber} />
                            </p>
                            <p className={cn("text-xs md:text-sm", textMuted)}>
                                {isRTL ? "مع رد" : "With Reply"}
                            </p>
                        </div>
                    </div>
                </GlowingCard>
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
                                <div className={cn("w-12 h-12 rounded-full", isDark ? "bg-slate-700" : "bg-gray-200")} />
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
                            ? "لم تقم بإضافة أي تقييمات للأطباء بعد"
                            : "You haven't reviewed any doctors yet"}
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
                            <GlowingCard glowColor="teal" className="p-4 md:p-5" isDark={isDark}>
                                {/* Doctor Info */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-teal-500/30",
                                            isDark ? "bg-slate-700" : "bg-gray-100"
                                        )}>
                                            {getDoctorAvatar(review) ? (
                                                <Image
                                                    src={getDoctorAvatar(review)!}
                                                    alt={getDoctorName(review)}
                                                    width={48}
                                                    height={48}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className={cn(
                                                    "w-full h-full flex items-center justify-center",
                                                    isDark ? "text-gray-500" : "text-gray-400"
                                                )}>
                                                    {Icons.doctor}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className={cn("font-medium", textPrimary)}>
                                                {getDoctorName(review)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <StarRating rating={review.rating} size="sm" isDark={isDark} />
                                                <span className={cn("text-xs", textMuted)}>
                                                    {formatDate(review.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Anonymous Badge */}
                                    {review.is_anonymous && (
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-xs font-medium",
                                            "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                                        )}>
                                            {isRTL ? "مجهول" : "Anonymous"}
                                        </span>
                                    )}
                                </div>

                                {/* Comment */}
                                {review.comment && (
                                    <p className={cn("text-sm leading-relaxed mb-3", textSecondary)}>
                                        {review.comment}
                                    </p>
                                )}

                                {/* Appointment Date */}
                                {review.appointment?.scheduled_start && (
                                    <div className={cn("flex items-center gap-2 text-xs mb-3", textMuted)}>
                                        {Icons.calendar}
                                        <span>
                                            {isRTL ? "موعد في" : "Appointment on"} {formatDate(review.appointment.scheduled_start)}
                                        </span>
                                    </div>
                                )}

                                {/* Doctor Response */}
                                {review.doctor_response && (
                                    <div className={cn(
                                        "mt-3 p-3 rounded-lg",
                                        isDark ? "bg-teal-900/30" : "bg-teal-50"
                                    )}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg
                                                className={cn(
                                                    "w-4 h-4",
                                                    isDark ? "text-teal-400" : "text-teal-600"
                                                )}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span className={cn(
                                                "text-xs font-medium",
                                                isDark ? "text-teal-400" : "text-teal-700"
                                            )}>
                                                {isRTL ? "رد الطبيب" : "Doctor's Response"}
                                            </span>
                                            {review.doctor_responded_at && (
                                                <span className={cn("text-xs", textMuted)}>
                                                    {formatDate(review.doctor_responded_at)}
                                                </span>
                                            )}
                                        </div>
                                        <p className={cn("text-sm", textSecondary)}>
                                            {review.doctor_response}
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
