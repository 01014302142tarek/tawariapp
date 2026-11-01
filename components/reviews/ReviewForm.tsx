"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import StarRating from "./StarRating";
import { submitReview } from "@/app/actions/reviews";

interface ReviewFormProps {
    appointment: {
        id: string;
        scheduled_start: string;
        doctor: {
            id: string;
            full_name: string;
            avatar_url?: string | null;
            specialization?: string | null;
        };
    };
    isDark?: boolean;
    isRTL?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ReviewForm({
    appointment,
    isDark = false,
    isRTL = false,
    onSuccess,
    onCancel,
}: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            setError(isRTL ? "يرجى اختيار تقييم" : "Please select a rating");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await submitReview({
                appointmentId: appointment.id,
                rating,
                comment: comment.trim() || undefined,
                isAnonymous,
            });

            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess?.();
                }, 1500);
            }
        } catch {
            setError(isRTL ? "حدث خطأ أثناء إرسال التقييم" : "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "rounded-xl p-6 border text-center",
                    isDark
                        ? "bg-gray-800/50 border-gray-700"
                        : "bg-white border-gray-200"
                )}
            >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <h3
                    className={cn(
                        "text-lg font-semibold mb-2",
                        isDark ? "text-white" : "text-gray-900"
                    )}
                >
                    {isRTL ? "شكراً لك!" : "Thank You!"}
                </h3>
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                    {isRTL
                        ? "تم إرسال تقييمك بنجاح"
                        : "Your review has been submitted successfully"}
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-xl p-5 border",
                isDark
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white border-gray-200"
            )}
        >
            {/* Doctor Info */}
            <div className="flex items-center gap-3 mb-5">
                <div
                    className={cn(
                        "w-12 h-12 rounded-full overflow-hidden flex-shrink-0",
                        isDark ? "bg-gray-700" : "bg-gray-100"
                    )}
                >
                    {appointment.doctor.avatar_url ? (
                        <Image
                            src={appointment.doctor.avatar_url}
                            alt={appointment.doctor.full_name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div
                            className={cn(
                                "w-full h-full flex items-center justify-center",
                                isDark ? "text-gray-500" : "text-gray-400"
                            )}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                />
                            </svg>
                        </div>
                    )}
                </div>
                <div>
                    <p
                        className={cn(
                            "font-medium",
                            isDark ? "text-white" : "text-gray-900"
                        )}
                    >
                        {appointment.doctor.full_name}
                    </p>
                    {appointment.doctor.specialization && (
                        <p
                            className={cn(
                                "text-sm",
                                isDark ? "text-gray-400" : "text-gray-500"
                            )}
                        >
                            {appointment.doctor.specialization}
                        </p>
                    )}
                    <p
                        className={cn(
                            "text-xs",
                            isDark ? "text-gray-500" : "text-gray-400"
                        )}
                    >
                        {isRTL ? "موعد في" : "Appointment on"}{" "}
                        {formatDate(appointment.scheduled_start)}
                    </p>
                </div>
            </div>

            {/* Rating */}
            <div className="mb-5">
                <label
                    className={cn(
                        "block text-sm font-medium mb-2",
                        isDark ? "text-gray-300" : "text-gray-700"
                    )}
                >
                    {isRTL ? "تقييمك" : "Your Rating"} *
                </label>
                <StarRating
                    rating={rating}
                    size="lg"
                    interactive
                    onChange={setRating}
                    isDark={isDark}
                />
            </div>

            {/* Comment */}
            <div className="mb-5">
                <label
                    className={cn(
                        "block text-sm font-medium mb-2",
                        isDark ? "text-gray-300" : "text-gray-700"
                    )}
                >
                    {isRTL ? "تعليقك (اختياري)" : "Your Comment (optional)"}
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={
                        isRTL
                            ? "شاركنا تجربتك مع الطبيب..."
                            : "Share your experience with the doctor..."
                    }
                    rows={4}
                    maxLength={1000}
                    className={cn(
                        "w-full px-3 py-2.5 rounded-lg border text-sm resize-none",
                        isDark
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500",
                        "focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    )}
                />
                <p
                    className={cn(
                        "text-xs mt-1",
                        isDark ? "text-gray-500" : "text-gray-400"
                    )}
                >
                    {comment.length}/1000
                </p>
            </div>

            {/* Anonymous Toggle */}
            <div className="mb-5">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span
                        className={cn(
                            "text-sm",
                            isDark ? "text-gray-300" : "text-gray-700"
                        )}
                    >
                        {isRTL
                            ? "إخفاء اسمي (تقييم مجهول)"
                            : "Hide my name (anonymous review)"}
                    </span>
                </label>
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                    >
                        <div
                            className={cn(
                                "p-3 rounded-lg text-sm",
                                "bg-red-100 text-red-700"
                            )}
                        >
                            {error}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                            isDark
                                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        )}
                    >
                        {isRTL ? "إلغاء" : "Cancel"}
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                    className={cn(
                        "px-5 py-2 text-sm font-semibold rounded-lg transition-all",
                        "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-md shadow-amber-500/20",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    {isSubmitting
                        ? isRTL
                            ? "جاري الإرسال..."
                            : "Submitting..."
                        : isRTL
                        ? "إرسال التقييم"
                        : "Submit Review"}
                </button>
            </div>
        </motion.div>
    );
}
