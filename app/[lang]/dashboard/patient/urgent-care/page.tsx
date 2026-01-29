"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { getOnlineDoctors, getMyQueuePosition, leaveQueue, type OnlineDoctor } from "@/app/actions/queue";
import { useOnlineDoctors } from "@/lib/hooks/useQueueRealtime";

// ============================================
// Icons
// ============================================
const Icons = {
    video: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    star: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    ),
    clock: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    users: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    check: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    refresh: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
};

// ============================================
// Helper Functions
// ============================================
const getInitials = (name: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatWaitTime = (minutes: number): string => {
    if (minutes === 0) return "Available now";
    if (minutes < 60) return `~${minutes} min wait`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `~${hours}h ${mins}m wait`;
};

// ============================================
// Doctor Card Component
// ============================================
interface DoctorCardProps {
    doctor: OnlineDoctor;
    onSelect: (doctor: OnlineDoctor) => void;
    isRTL: boolean;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSelect, isRTL }) => {
    const getStatusColor = () => {
        if (!doctor.is_online) return "bg-gray-500";
        if (doctor.is_in_consultation) return "bg-amber-500";
        if (doctor.queue_length === 0) return "bg-green-500";
        return "bg-teal-500";
    };

    const getStatusText = () => {
        if (!doctor.is_online) return "Offline";
        if (doctor.is_in_consultation && doctor.queue_length === 0) return "In consultation";
        if (doctor.queue_length === 0) return "Available now";
        return `${doctor.queue_length} in queue`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 hover:border-teal-500/30 transition-all group"
        >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="relative">
                    {doctor.avatar_url && doctor.avatar_url.trim() !== "" ? (
                        <Image
                            src={doctor.avatar_url}
                            alt={doctor.full_name}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-full object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg">
                            {getInitials(doctor.full_name)}
                        </div>
                    )}
                    {/* Online indicator */}
                    <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-slate-800",
                        getStatusColor()
                    )} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{doctor.full_name}</h3>
                    <p className="text-sm text-slate-400 truncate">
                        {doctor.specialty.length > 0 ? doctor.specialty.join(", ") : "General Practice"}
                    </p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-4 text-sm">
                {/* Rating */}
                {doctor.rating_count > 0 ? (
                    <div className="flex items-center gap-1 text-amber-400">
                        {Icons.star}
                        <span>{doctor.rating_average.toFixed(1)}</span>
                        <span className="text-slate-500">({doctor.rating_count})</span>
                    </div>
                ) : (
                    <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded-full font-medium">
                        {isRTL ? "جديد" : "New"}
                    </span>
                )}

                {/* Wait time */}
                <div className="flex items-center gap-1 text-slate-400">
                    {Icons.clock}
                    <span>{formatWaitTime(doctor.estimated_wait_minutes)}</span>
                </div>
            </div>

            {/* Status & Queue */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor())} />
                    <span className="text-sm text-slate-300">{getStatusText()}</span>
                </div>
                {doctor.queue_length > 0 && (
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                        {Icons.users}
                        <span>{doctor.queue_length} waiting</span>
                    </div>
                )}
            </div>

            {/* Price & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                    <span className="text-2xl font-bold text-white">{doctor.consultation_fee}</span>
                    <span className="text-slate-400 text-sm ml-1">EGP</span>
                </div>
                <button
                    onClick={() => onSelect(doctor)}
                    disabled={!doctor.is_online}
                    className={cn(
                        "px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2",
                        doctor.is_online
                            ? "bg-teal-500 text-white hover:bg-teal-600"
                            : "bg-slate-700 text-slate-400 cursor-not-allowed"
                    )}
                >
                    {Icons.video}
                    {isRTL ? "انضم" : "Join"}
                </button>
            </div>
        </motion.div>
    );
};

// ============================================
// Main Page Component
// ============================================
export default function UrgentCarePage() {
    const router = useRouter();
    const { isRTL, language } = useI18n();

    const [doctors, setDoctors] = useState<OnlineDoctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [existingQueueEntry, setExistingQueueEntry] = useState<string | null>(null);
    const [leavingQueue, setLeavingQueue] = useState(false);
    const [debugInfo, setDebugInfo] = useState<{ totalDoctors: number; onlineDoctors: number; verifiedDoctors: number } | null>(null);

    // Real-time updates for online doctors
    const { isConnected } = useOnlineDoctors(doctors);

    // Load doctors
    const loadDoctors = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            // Check if patient is already in a queue
            const queueStatus = await getMyQueuePosition();
            if (queueStatus.inQueue && queueStatus.queueEntry) {
                // Only set if truly in queue
                setExistingQueueEntry(queueStatus.queueEntry.id);
            } else {
                // Clear any existing queue entry (e.g., after call ended)
                setExistingQueueEntry(null);
            }

            // Get online doctors
            const result = await getOnlineDoctors();
            if (result.doctors) {
                setDoctors(result.doctors);
            }
            if (result.debug) {
                setDebugInfo(result.debug);
            }
        } catch (error) {
            console.error("Error loading doctors:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Load on mount
    useEffect(() => {
        loadDoctors();
    }, []);

    // Refresh when page gains focus (e.g., returning from call page)
    useEffect(() => {
        const handleFocus = () => {
            console.log("[Urgent Care] Page focused, refreshing data...");
            loadDoctors(false);
        };

        window.addEventListener("focus", handleFocus);

        // Also refresh on visibility change (tab becomes visible)
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                console.log("[Urgent Care] Page visible, refreshing data...");
                loadDoctors(false);
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    // Handle doctor selection - go to payment page
    const handleSelectDoctor = (doctor: OnlineDoctor) => {
        router.push(`/${language}/dashboard/patient/urgent-care/payment/${doctor.id}`);
    };

    // If patient is already in queue, redirect to waiting room
    const handleGoToWaitingRoom = () => {
        if (existingQueueEntry) {
            router.push(`/${language}/dashboard/patient/urgent-care/waiting/${existingQueueEntry}`);
        }
    };

    // Handle leaving the queue (for stuck entries)
    const handleLeaveQueue = async () => {
        if (!existingQueueEntry) return;

        setLeavingQueue(true);
        try {
            const result = await leaveQueue(existingQueueEntry);
            if (result.success) {
                setExistingQueueEntry(null);
                // Refresh doctors list
                loadDoctors(false);
            } else {
                console.error("Error leaving queue:", result.error);
            }
        } catch (error) {
            console.error("Error leaving queue:", error);
        } finally {
            setLeavingQueue(false);
        }
    };

    return (
        <div className={cn("min-h-screen p-6", isRTL && "rtl")}>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-white">
                        {isRTL ? "استشارة طبية عاجلة" : "Urgent Care"}
                    </h1>
                    <div className="flex items-center gap-3">
                        {/* Connection status */}
                        <div className="flex items-center gap-2 text-sm">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                isConnected ? "bg-green-500" : "bg-amber-500"
                            )} />
                            <span className="text-slate-400">
                                {isConnected ? "Live" : "Connecting..."}
                            </span>
                        </div>
                        {/* Refresh button */}
                        <button
                            onClick={() => loadDoctors(true)}
                            disabled={refreshing}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                        >
                            <div className={cn(refreshing && "animate-spin")}>
                                {Icons.refresh}
                            </div>
                        </button>
                    </div>
                </div>
                <p className="text-slate-400">
                    {isRTL
                        ? "تواصل مع طبيب متاح الآن للاستشارة الفورية"
                        : "Connect with an available doctor now for instant consultation"}
                </p>
            </div>

            {/* Already in queue banner */}
            {existingQueueEntry && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                            {Icons.clock}
                        </div>
                        <div>
                            <p className="text-white font-medium">
                                {isRTL ? "أنت بالفعل في قائمة الانتظار" : "You're already in a queue"}
                            </p>
                            <p className="text-sm text-slate-400">
                                {isRTL ? "انتقل إلى غرفة الانتظار لمتابعة حالتك" : "Go to waiting room to check your status"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLeaveQueue}
                            disabled={leavingQueue}
                            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-colors disabled:opacity-50"
                        >
                            {leavingQueue
                                ? (isRTL ? "جاري..." : "Leaving...")
                                : (isRTL ? "مغادرة" : "Leave")}
                        </button>
                        <button
                            onClick={handleGoToWaitingRoom}
                            className="px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
                        >
                            {isRTL ? "غرفة الانتظار" : "Waiting Room"}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Loading state */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">
                            {isRTL ? "جاري تحميل الأطباء المتاحين..." : "Loading available doctors..."}
                        </p>
                    </div>
                </div>
            ) : doctors.length === 0 ? (
                /* Empty state */
                <div className="text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        {isRTL ? "لا يوجد أطباء متاحين حالياً" : "No doctors available right now"}
                    </h3>
                    <p className="text-slate-400 mb-6">
                        {isRTL
                            ? "يرجى المحاولة مرة أخرى لاحقاً أو حجز موعد"
                            : "Please try again later or book an appointment"}
                    </p>
                    {/* Debug info - remove in production */}
                    {debugInfo && (
                        <div className="mb-6 p-3 bg-slate-800/50 rounded-lg text-left text-sm">
                            <p className="text-slate-500 mb-1">Debug Info:</p>
                            <p className="text-slate-400">Total doctors in DB: {debugInfo.totalDoctors}</p>
                            <p className="text-slate-400">Online doctors: {debugInfo.onlineDoctors}</p>
                            <p className="text-slate-400">Verified doctors: {debugInfo.verifiedDoctors}</p>
                        </div>
                    )}
                    <button
                        onClick={() => loadDoctors(true)}
                        className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors inline-flex items-center gap-2"
                    >
                        {Icons.refresh}
                        {isRTL ? "تحديث" : "Refresh"}
                    </button>
                </div>
            ) : (
                /* Doctors grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doctor) => (
                        <DoctorCard
                            key={doctor.id}
                            doctor={doctor}
                            onSelect={handleSelectDoctor}
                            isRTL={isRTL}
                        />
                    ))}
                </div>
            )}

            {/* Footer info */}
            {doctors.length > 0 && (
                <div className="mt-8 text-center text-sm text-slate-500">
                    <p>
                        {isRTL
                            ? `${doctors.length} طبيب متاح • يتم تحديث القائمة تلقائياً`
                            : `${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} available • List updates automatically`}
                    </p>
                </div>
            )}
        </div>
    );
}
