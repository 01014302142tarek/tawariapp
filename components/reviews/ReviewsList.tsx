"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReviewCard from "./ReviewCard";
import StarRating from "./StarRating";
import { getReviewsForDoctor, respondToReview } from "@/app/actions/reviews";

interface Review {
    id: string;
    rating: number;
    comment?: string | null;
    is_anonymous: boolean;
    created_at: string;
    doctor_response?: string | null;
    doctor_responded_at?: string | null;
    patient?: {
        id: string;
        profile: {
            full_name: string;
            avatar_url?: string;
        };
    };
}

interface ReviewsListProps {
    doctorProfileId: string;
    isDark?: boolean;
    isRTL?: boolean;
    canRespond?: boolean;
    showSummary?: boolean;
    limit?: number;
}

export default function ReviewsList({
    doctorProfileId,
    isDark = false,
    isRTL = false,
    canRespond = false,
    showSummary = true,
    limit,
}: ReviewsListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        average: 0,
        count: 0,
        distribution: [0, 0, 0, 0, 0],
    });

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const result = await getReviewsForDoctor(doctorProfileId, {
                limit: limit || 20,
            });

            if (result.error) {
                setError(result.error);
            } else {
                setReviews(result.reviews || []);

                // Calculate stats
                const reviewList = result.reviews || [];
                const distribution = [0, 0, 0, 0, 0];
                let total = 0;

                reviewList.forEach((r) => {
                    total += r.rating;
                    distribution[r.rating - 1]++;
                });

                setStats({
                    average: reviewList.length > 0 ? total / reviewList.length : 0,
                    count: reviewList.length,
                    distribution,
                });
            }
        } catch {
            setError(isRTL ? "حدث خطأ أثناء تحميل التقييمات" : "Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doctorProfileId]);

    const handleRespond = async (reviewId: string, response: string) => {
        const result = await respondToReview({ reviewId, response });
        if (!result.error) {
            // Refresh reviews
            await fetchReviews();
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "rounded-xl p-4 border animate-pulse",
                            isDark
                                ? "bg-gray-800/50 border-gray-700"
                                : "bg-white border-gray-200"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full",
                                    isDark ? "bg-gray-700" : "bg-gray-200"
                                )}
                            />
                            <div className="flex-1">
                                <div
                                    className={cn(
                                        "h-4 rounded w-1/3 mb-2",
                                        isDark ? "bg-gray-700" : "bg-gray-200"
                                    )}
                                />
                                <div
                                    className={cn(
                                        "h-3 rounded w-1/4",
                                        isDark ? "bg-gray-700" : "bg-gray-200"
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div
                className={cn(
                    "rounded-xl p-6 border text-center",
                    isDark
                        ? "bg-gray-800/50 border-gray-700"
                        : "bg-white border-gray-200"
                )}
            >
                <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary */}
            {showSummary && stats.count > 0 && (
                <div
                    className={cn(
                        "rounded-xl p-5 border",
                        isDark
                            ? "bg-gray-800/50 border-gray-700"
                            : "bg-white border-gray-200"
                    )}
                >
                    <div className="flex items-center gap-6">
                        {/* Average Rating */}
                        <div className="text-center">
                            <p
                                className={cn(
                                    "text-4xl font-bold",
                                    isDark ? "text-white" : "text-gray-900"
                                )}
                            >
                                {stats.average.toFixed(1)}
                            </p>
                            <StarRating
                                rating={stats.average}
                                size="sm"
                                isDark={isDark}
                            />
                            <p
                                className={cn(
                                    "text-sm mt-1",
                                    isDark ? "text-gray-400" : "text-gray-500"
                                )}
                            >
                                {stats.count}{" "}
                                {isRTL
                                    ? stats.count === 1
                                        ? "تقييم"
                                        : "تقييمات"
                                    : stats.count === 1
                                    ? "review"
                                    : "reviews"}
                            </p>
                        </div>

                        {/* Distribution */}
                        <div className="flex-1 space-y-1.5">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = stats.distribution[star - 1];
                                const percentage =
                                    stats.count > 0
                                        ? (count / stats.count) * 100
                                        : 0;

                                return (
                                    <div
                                        key={star}
                                        className="flex items-center gap-2"
                                    >
                                        <span
                                            className={cn(
                                                "text-xs w-3",
                                                isDark
                                                    ? "text-gray-400"
                                                    : "text-gray-500"
                                            )}
                                        >
                                            {star}
                                        </span>
                                        <svg
                                            className="w-3 h-3 text-yellow-400 fill-yellow-400"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                        </svg>
                                        <div
                                            className={cn(
                                                "flex-1 h-2 rounded-full overflow-hidden",
                                                isDark
                                                    ? "bg-gray-700"
                                                    : "bg-gray-200"
                                            )}
                                        >
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${percentage}%`,
                                                }}
                                                transition={{ duration: 0.5 }}
                                                className="h-full bg-yellow-400 rounded-full"
                                            />
                                        </div>
                                        <span
                                            className={cn(
                                                "text-xs w-8 text-end",
                                                isDark
                                                    ? "text-gray-400"
                                                    : "text-gray-500"
                                            )}
                                        >
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div
                    className={cn(
                        "rounded-xl p-8 border text-center",
                        isDark
                            ? "bg-gray-800/50 border-gray-700"
                            : "bg-white border-gray-200"
                    )}
                >
                    <svg
                        className={cn(
                            "w-12 h-12 mx-auto mb-3",
                            isDark ? "text-gray-600" : "text-gray-300"
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                    </svg>
                    <p
                        className={cn(
                            "text-lg font-medium mb-1",
                            isDark ? "text-white" : "text-gray-900"
                        )}
                    >
                        {isRTL ? "لا توجد تقييمات" : "No Reviews Yet"}
                    </p>
                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                        {isRTL
                            ? "لم يتم إضافة أي تقييمات حتى الآن"
                            : "No reviews have been submitted yet"}
                    </p>
                </div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                isDark={isDark}
                                isRTL={isRTL}
                                canRespond={canRespond}
                                onRespond={handleRespond}
                            />
                        ))}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
}
