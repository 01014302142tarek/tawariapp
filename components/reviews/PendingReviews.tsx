"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReviewForm from "./ReviewForm";
import { getPendingReviewAppointments } from "@/app/actions/reviews";

interface PendingAppointment {
    id: string;
    scheduled_start: string;
    doctor: {
        id: string;
        full_name: string;
        avatar_url?: string | null;
        specialization?: string | null;
    };
}

interface PendingReviewsProps {
    isDark?: boolean;
    isRTL?: boolean;
    onReviewSubmitted?: () => void;
}

export default function PendingReviews({
    isDark = false,
    isRTL = false,
    onReviewSubmitted,
}: PendingReviewsProps) {
    const [appointments, setAppointments] = useState<PendingAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] =
        useState<PendingAppointment | null>(null);
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const [showAll, setShowAll] = useState(false);

    const fetchPendingReviews = async () => {
        setLoading(true);
        try {
            const result = await getPendingReviewAppointments();
            if (!result.error) {
                setAppointments(result.appointments || []);
            }
        } catch {
            // Silent fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const handleDismiss = (appointmentId: string) => {
        setDismissedIds((prev) => new Set([...prev, appointmentId]));
    };

    const handleReviewSuccess = () => {
        if (selectedAppointment) {
            setDismissedIds((prev) =>
                new Set([...prev, selectedAppointment.id])
            );
            setSelectedAppointment(null);
            onReviewSubmitted?.();
        }
    };

    const visibleAppointments = appointments.filter(
        (a) => !dismissedIds.has(a.id)
    );

    // Show only first 1 item unless "View More" is clicked
    const displayedAppointments = showAll 
        ? visibleAppointments 
        : visibleAppointments.slice(0, 1);
    
    const hasMore = visibleAppointments.length > 1;

    if (loading) {
        return null; // Don't show loading state to avoid UI flicker
    }

    if (visibleAppointments.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3 md:space-y-4">
            {/* Header with View More button */}
            {hasMore && (
                <div className="flex items-center justify-end">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                            isDark
                                ? "text-amber-400 hover:bg-amber-900/30"
                                : "text-amber-600 hover:bg-amber-50"
                        )}
                    >
                        {showAll ? (
                            <>
                                {isRTL ? "عرض أقل" : "View Less"}
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </>
                        ) : (
                            <>
                                {isRTL 
                                    ? `+${visibleAppointments.length - 1} المزيد` 
                                    : `+${visibleAppointments.length - 1} More`}
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            )}
            
            <AnimatePresence mode="popLayout">
                {displayedAppointments.map((appointment) => (
                    <motion.div
                        key={appointment.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                            "rounded-xl p-4 border",
                            isDark
                                ? "bg-gradient-to-r from-amber-950/30 to-zinc-900/60 border-amber-500/20"
                                : "bg-gradient-to-r from-amber-50 to-white border-amber-200"
                        )}
                    >
                        {selectedAppointment?.id === appointment.id ? (
                            <ReviewForm
                                appointment={appointment}
                                isDark={isDark}
                                isRTL={isRTL}
                                onSuccess={handleReviewSuccess}
                                onCancel={() => setSelectedAppointment(null)}
                            />
                        ) : (
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            isDark
                                                ? "bg-amber-900/50"
                                                : "bg-amber-100"
                                        )}
                                    >
                                        <svg
                                            className={cn(
                                                "w-5 h-5",
                                                isDark
                                                    ? "text-amber-400"
                                                    : "text-amber-600"
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
                                    </div>
                                    <div>
                                        <p
                                            className={cn(
                                                "text-sm font-medium",
                                                isDark
                                                    ? "text-white"
                                                    : "text-gray-900"
                                            )}
                                        >
                                            {isRTL
                                                ? `قيّم تجربتك مع ${appointment.doctor.full_name}`
                                                : `Rate your experience with ${appointment.doctor.full_name}`}
                                        </p>
                                        <p
                                            className={cn(
                                                "text-xs",
                                                isDark
                                                    ? "text-gray-400"
                                                    : "text-gray-500"
                                            )}
                                        >
                                            {appointment.doctor.specialization}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            handleDismiss(appointment.id)
                                        }
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            isDark
                                                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                        )}
                                        title={isRTL ? "تجاهل" : "Dismiss"}
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() =>
                                            setSelectedAppointment(appointment)
                                        }
                                        className={cn(
                                            "px-4 py-2 text-sm font-semibold rounded-lg transition-all",
                                            "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-md shadow-amber-500/20"
                                        )}
                                    >
                                        {isRTL ? "أضف تقييم" : "Add Review"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
