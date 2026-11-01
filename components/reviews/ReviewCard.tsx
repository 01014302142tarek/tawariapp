"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import StarRating from "./StarRating";

interface ReviewCardProps {
    review: {
        id: string;
        rating: number;
        comment?: string | null;
        is_anonymous: boolean;
        created_at: string;
        doctor_response?: string | null;
        doctor_responded_at?: string | null;
        // Support both flat and nested patient structures
        patient?: {
            id?: string;
            full_name?: string;
            avatar_url?: string | null;
            profile?: {
                full_name: string;
                avatar_url?: string | null;
            };
        } | null;
        // Support both flat and nested doctor structures
        doctor?: {
            id?: string;
            full_name?: string;
            avatar_url?: string | null;
            specialization?: string | null;
            profile?: {
                full_name: string;
                avatar_url?: string | null;
            };
            specializations?: Array<{ name: string }>;
        } | null;
    };
    isDark?: boolean;
    isRTL?: boolean;
    showDoctor?: boolean;
    showPatient?: boolean;
    onRespond?: (reviewId: string, response: string) => Promise<void>;
    canRespond?: boolean;
}

export default function ReviewCard({
    review,
    isDark = false,
    isRTL = false,
    showDoctor = false,
    showPatient = true,
    onRespond,
    canRespond = false,
}: ReviewCardProps) {
    const [isResponding, setIsResponding] = useState(false);
    const [response, setResponse] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleSubmitResponse = async () => {
        if (!onRespond || !response.trim()) return;

        setIsSubmitting(true);
        try {
            await onRespond(review.id, response.trim());
            setIsResponding(false);
            setResponse("");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle both flat (full_name) and nested (profile.full_name) structures
    const getPatientName = () => {
        if (!review.patient) return isRTL ? "مريض" : "Patient";
        return review.patient.profile?.full_name || review.patient.full_name || (isRTL ? "مريض" : "Patient");
    };

    const getPatientAvatar = () => {
        if (!review.patient) return null;
        return review.patient.profile?.avatar_url || review.patient.avatar_url || null;
    };

    const getDoctorName = () => {
        if (!review.doctor) return "";
        return review.doctor.profile?.full_name || review.doctor.full_name || "";
    };

    const getDoctorAvatar = () => {
        if (!review.doctor) return null;
        return review.doctor.profile?.avatar_url || review.doctor.avatar_url || null;
    };

    const getDoctorSpecialization = () => {
        if (!review.doctor) return null;
        return review.doctor.specialization || review.doctor.specializations?.[0]?.name || null;
    };

    const displayName = review.is_anonymous
        ? isRTL
            ? "مريض مجهول"
            : "Anonymous Patient"
        : getPatientName();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-xl p-4 border",
                isDark
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white border-gray-200"
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {showPatient && (
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full overflow-hidden flex-shrink-0",
                                isDark ? "bg-gray-700" : "bg-gray-100"
                            )}
                        >
                            {!review.is_anonymous && getPatientAvatar() ? (
                                <Image
                                    src={getPatientAvatar()!}
                                    alt={displayName}
                                    width={40}
                                    height={40}
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
                                        className="w-5 h-5"
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
                    )}

                    {showDoctor && review.doctor && (
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full overflow-hidden flex-shrink-0",
                                isDark ? "bg-gray-700" : "bg-gray-100"
                            )}
                        >
                            {getDoctorAvatar() ? (
                                <Image
                                    src={getDoctorAvatar()!}
                                    alt={getDoctorName()}
                                    width={40}
                                    height={40}
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
                                        className="w-5 h-5"
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
                    )}

                    <div>
                        <p
                            className={cn(
                                "font-medium",
                                isDark ? "text-white" : "text-gray-900"
                            )}
                        >
                            {showDoctor && review.doctor
                                ? getDoctorName()
                                : displayName}
                        </p>
                        {showDoctor && getDoctorSpecialization() && (
                            <p
                                className={cn(
                                    "text-sm",
                                    isDark ? "text-gray-400" : "text-gray-500"
                                )}
                            >
                                {getDoctorSpecialization()}
                            </p>
                        )}
                        <p
                            className={cn(
                                "text-xs",
                                isDark ? "text-gray-500" : "text-gray-400"
                            )}
                        >
                            {formatDate(review.created_at)}
                        </p>
                    </div>
                </div>

                <StarRating rating={review.rating} size="sm" isDark={isDark} />
            </div>

            {/* Comment */}
            {review.comment && (
                <p
                    className={cn(
                        "mt-3 text-sm leading-relaxed",
                        isDark ? "text-gray-300" : "text-gray-600"
                    )}
                >
                    {review.comment}
                </p>
            )}

            {/* Doctor Response */}
            {review.doctor_response && (
                <div
                    className={cn(
                        "mt-4 p-3 rounded-lg",
                        isDark ? "bg-amber-950/30 border border-amber-500/20" : "bg-amber-50/80 border border-amber-200"
                    )}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <svg
                            className={cn(
                                "w-4 h-4",
                                isDark ? "text-amber-400" : "text-amber-600"
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
                        <span
                            className={cn(
                                "text-xs font-medium",
                                isDark ? "text-amber-400" : "text-amber-700"
                            )}
                        >
                            {isRTL ? "رد الطبيب" : "Doctor's Response"}
                        </span>
                        {review.doctor_responded_at && (
                            <span
                                className={cn(
                                    "text-xs",
                                    isDark ? "text-gray-500" : "text-gray-400"
                                )}
                            >
                                {formatDate(review.doctor_responded_at)}
                            </span>
                        )}
                    </div>
                    <p
                        className={cn(
                            "text-sm",
                            isDark ? "text-gray-300" : "text-gray-600"
                        )}
                    >
                        {review.doctor_response}
                    </p>
                </div>
            )}

            {/* Respond Button (for doctors) */}
            {canRespond && !review.doctor_response && !isResponding && (
                <button
                    onClick={() => setIsResponding(true)}
                    className={cn(
                        "mt-3 text-sm font-medium transition-colors",
                        isDark
                            ? "text-amber-400 hover:text-amber-300"
                            : "text-amber-600 hover:text-amber-700"
                    )}
                >
                    {isRTL ? "إضافة رد" : "Add Response"}
                </button>
            )}

            {/* Response Form */}
            {isResponding && (
                <div className="mt-4 space-y-3">
                    <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder={
                            isRTL
                                ? "اكتب ردك على هذا التقييم..."
                                : "Write your response to this review..."
                        }
                        rows={3}
                        className={cn(
                            "w-full px-3 py-2 rounded-lg border text-sm resize-none",
                            isDark
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500",
                            "focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                        )}
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                setIsResponding(false);
                                setResponse("");
                            }}
                            className={cn(
                                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                                isDark
                                    ? "text-gray-400 hover:text-white"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {isRTL ? "إلغاء" : "Cancel"}
                        </button>
                        <button
                            onClick={handleSubmitResponse}
                            disabled={!response.trim() || isSubmitting}
                            className={cn(
                                "px-4 py-1.5 text-sm font-semibold rounded-lg transition-all",
                                "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-md shadow-amber-500/20",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            {isSubmitting
                                ? isRTL
                                    ? "جاري الإرسال..."
                                    : "Sending..."
                                : isRTL
                                ? "إرسال"
                                : "Send"}
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
