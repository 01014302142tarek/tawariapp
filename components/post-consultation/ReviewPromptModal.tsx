"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";
import { submitReview } from "@/app/actions/reviews";

interface ReviewPromptModalProps {
    isOpen: boolean;
    doctorName: string;
    appointmentId: string;
    isDark?: boolean;
    isRTL?: boolean;
    onSuccess: () => void;
    onSkip: () => void;
}

const Icons = {
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    send: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
    ),
    loading: (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    ),
    success: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

export function ReviewPromptModal({
    isOpen,
    doctorName,
    appointmentId,
    isDark = true,
    isRTL = false,
    onSuccess,
    onSkip,
}: ReviewPromptModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            setError(isRTL ? "يرجى اختيار تقييم" : "Please select a rating");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const result = await submitReview({
                appointmentId,
                rating,
                comment: comment.trim() || undefined,
                isAnonymous: false,
            });

            if (result.review) {
                setSubmitted(true);
                // Wait a moment to show success state, then call onSuccess
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            } else {
                setError(result.error || (isRTL ? "فشل في إرسال التقييم" : "Failed to submit review"));
            }
        } catch (err) {
            console.error("Error submitting review:", err);
            setError(isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const getRatingLabel = () => {
        if (rating === 0) return "";
        const labels = isRTL
            ? ["ضعيف جداً", "ضعيف", "جيد", "جيد جداً", "ممتاز"]
            : ["Very Poor", "Poor", "Good", "Very Good", "Excellent"];
        return labels[rating - 1];
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={cn(
                            "rounded-2xl shadow-2xl max-w-md w-full",
                            isDark ? "bg-[#0D2C4F]" : "bg-white",
                            isRTL && "rtl"
                        )}
                    >
                        {submitted ? (
                            // Success State
                            <div className="p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 15 }}
                                    className="text-[#FD614B] mx-auto mb-4"
                                >
                                    {Icons.success}
                                </motion.div>
                                <h3 className={cn(
                                    "text-xl font-semibold mb-2",
                                    isDark ? "text-white" : "text-slate-900"
                                )}>
                                    {isRTL ? "شكراً لتقييمك!" : "Thank You!"}
                                </h3>
                                <p className={cn(
                                    "text-sm",
                                    isDark ? "text-slate-400" : "text-slate-600"
                                )}>
                                    {isRTL
                                        ? "تقييمك يساعدنا على تحسين خدماتنا"
                                        : "Your feedback helps us improve our service"}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className={cn(
                                    "flex items-center justify-between p-4 border-b",
                                    isDark ? "border-[#044C87]/30" : "border-gray-200"
                                )}>
                                    <h3 className={cn(
                                        "text-lg font-semibold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        {isRTL ? "كيف كانت تجربتك؟" : "How was your experience?"}
                                    </h3>
                                    <button
                                        onClick={onSkip}
                                        disabled={submitting}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-100 text-gray-500"
                                        )}
                                    >
                                        {Icons.close}
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Doctor Name */}
                                    <p className={cn(
                                        "text-center mb-6",
                                        isDark ? "text-slate-400" : "text-slate-600"
                                    )}>
                                        {isRTL
                                            ? `قيّم استشارتك مع الدكتور ${doctorName}`
                                            : `Rate your consultation with Dr. ${doctorName}`}
                                    </p>

                                    {/* Star Rating */}
                                    <div className="flex flex-col items-center mb-6">
                                        <StarRating
                                            rating={rating}
                                            onRatingChange={setRating}
                                            size="lg"
                                        />
                                        <p className={cn(
                                            "mt-2 text-sm font-medium h-5",
                                            rating > 0
                                                ? (isDark ? "text-[#FD614B]" : "text-[#FD614B]")
                                                : "text-transparent"
                                        )}>
                                            {getRatingLabel()}
                                        </p>
                                    </div>

                                    {/* Comment */}
                                    <div className="mb-4">
                                        <label className={cn(
                                            "block text-sm font-medium mb-2",
                                            isDark ? "text-slate-400" : "text-gray-500"
                                        )}>
                                            {isRTL ? "أضف تعليقاً (اختياري)" : "Add a comment (optional)"}
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder={isRTL
                                                ? "شارك تجربتك مع الآخرين..."
                                                : "Share your experience with others..."
                                            }
                                            rows={3}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl border transition-colors resize-none",
                                                isDark
                                                    ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-[#FD614B]"
                                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#FD614B]",
                                                "focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                            )}
                                        />
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                                            {error}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className={cn(
                                    "flex items-center justify-between gap-3 p-4 border-t",
                                    isDark ? "border-[#044C87]/30" : "border-gray-200"
                                )}>
                                    <button
                                        onClick={onSkip}
                                        disabled={submitting}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isDark
                                                ? "text-slate-400 hover:text-slate-300"
                                                : "text-gray-500 hover:text-gray-700"
                                        )}
                                    >
                                        {isRTL ? "ربما لاحقاً" : "Maybe Later"}
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || rating === 0}
                                        className={cn(
                                            "px-6 py-2 rounded-xl font-medium transition-all",
                                            "bg-[#FD614B] text-white",
                                            "flex items-center gap-2",
                                            "shadow-lg shadow-amber-500/20",
                                            (submitting || rating === 0)
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-[#E84D37] hover:shadow-amber-500/30"
                                        )}
                                    >
                                        {submitting ? Icons.loading : Icons.send}
                                        <span>{isRTL ? "إرسال التقييم" : "Submit Review"}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ReviewPromptModal;
