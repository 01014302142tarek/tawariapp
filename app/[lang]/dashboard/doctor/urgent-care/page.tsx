"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { useI18n } from "@/app/i18n";
import { useAuth } from "@/app/context/AuthContext";
import {
    getDoctorQueueStatus,
    callPatient,
    callNextPatient,
    returnPatientToQueue,
    endQueueConsultation,
    startQueueConsultation,
    type QueueEntry,
} from "@/app/actions/queue";
import { useDoctorQueue, useDoctorOnlineStatus } from "@/lib/hooks/useQueueRealtime";
import { QueueChat } from "@/components/queue-chat";
import { AnimatedNumber } from "@/components/ui/animated-number";

// ============================================
// Icons
// ============================================
const Icons = {
    power: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
        </svg>
    ),
    video: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    phone: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0l6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z" />
        </svg>
    ),
    users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    clock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    money: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    loading: (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    ),
    user: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    clipboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
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

const formatWaitTime = (joinedAt: string): string => {
    const now = Date.now();
    const joined = new Date(joinedAt).getTime();
    const diffMinutes = Math.floor((now - joined) / (1000 * 60));

    if (diffMinutes < 1) return "Just joined";
    if (diffMinutes === 1) return "1 min";
    if (diffMinutes < 60) return `${diffMinutes} min`;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${hours}h ${mins}m`;
};

// ============================================
// Patient Card in Queue
// ============================================
interface QueuePatientCardProps {
    entry: QueueEntry & { patient_name: string; patient_avatar?: string };
    position: number;
    isDark: boolean;
    isRTL: boolean;
    isCurrent: boolean;
    onCall: () => void;
    calling: boolean;
}

const QueuePatientCard: React.FC<QueuePatientCardProps> = ({
    entry,
    position,
    isDark,
    isRTL,
    isCurrent,
    onCall,
    calling,
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={cn(
                "p-4 rounded-xl border transition-all",
                isCurrent
                    ? "bg-[#FD614B]/10 border-[#FD614B]/40"
                    : isDark
                        ? "bg-white/[0.02] border-white/5 hover:border-white/10"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
            )}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Position */}
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0",
                        isCurrent
                            ? "bg-[#FD614B] text-white"
                            : isDark
                                ? "bg-slate-700 text-slate-300"
                                : "bg-gray-200 text-gray-600"
                    )}>
                        {position}
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                            {entry.patient_avatar ? (
                                <Image
                                    src={entry.patient_avatar}
                                    alt={entry.patient_name}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#044C87] to-[#FD614B] flex items-center justify-center text-white font-medium flex-shrink-0">
                                    {getInitials(entry.patient_name)}
                                </div>
                            )}
                            <div>
                                <p className={cn("font-bold text-base", isDark ? "text-white" : "text-slate-900")}>
                                    {entry.patient_name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    {Icons.clock}
                                    <span>{isRTL ? "في الانتظار منذ" : "Waiting"} {formatWaitTime(entry.joined_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Chief Complaint */}
                        {entry.chief_complaint && (
                            <div className={cn(
                                "mt-2 p-2.5 rounded-lg text-xs sm:text-sm",
                                isDark ? "bg-[#0D2C4F]/50" : "bg-white"
                            )}>
                                <div className="flex items-start gap-1.5">
                                    <span className="text-slate-400 mt-0.5">{Icons.clipboard}</span>
                                    <div>
                                        <p className="text-slate-500 text-[11px] mb-0.5">
                                            {isRTL ? "الشكوى الرئيسية:" : "Chief Complaint:"}
                                        </p>
                                        <p className={cn("font-medium", isDark ? "text-slate-300" : "text-slate-700")}>
                                            {entry.chief_complaint}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Info */}
                        <div className="flex items-center gap-3 mt-2 text-xs">
                            <div className="flex items-center gap-1 text-slate-500">
                                {Icons.money}
                                <span>{entry.payment_amount} EGP</span>
                            </div>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full font-medium",
                                entry.payment_status === "completed_mock" || entry.payment_status === "completed"
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-amber-500/10 text-amber-400"
                            )}>
                                {entry.payment_status === "completed_mock" ? (isRTL ? "مدفوع (تجريبي)" : "Paid (Mock)") :
                                    entry.payment_status === "completed" ? (isRTL ? "مدفوع" : "Paid") :
                                        (isRTL ? "معلق" : "Pending")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Call Action Button - Available for EVERY patient in queue */}
                <div className="flex items-center justify-end flex-shrink-0 self-end sm:self-center">
                    {isCurrent ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            {isRTL ? "الاستشارة الحالية" : "Current Consultation"}
                        </span>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.04, boxShadow: "0 0 15px rgba(253,97,75,0.4)" }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            onClick={onCall}
                            disabled={calling}
                            title={isRTL ? `بدء المكالمة الآن مع ${entry.patient_name}` : `Call ${entry.patient_name} now`}
                            className={cn(
                                "px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md",
                                calling ? "opacity-60 cursor-not-allowed" : "",
                                entry.payment_status === "completed" || entry.payment_status === "completed_mock"
                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                                    : "bg-[#FD614B] hover:bg-[#E84D37] text-white shadow-[#FD614B]/20"
                            )}
                        >
                            {calling ? (
                                <>
                                    {Icons.loading}
                                    <span>{isRTL ? "جاري الاتصال..." : "Calling..."}</span>
                                </>
                            ) : (
                                <>
                                    {Icons.video}
                                    <span>{isRTL ? "بدء المكالمة الآن" : "Start Call Now"}</span>
                                </>
                            )}
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// ============================================
// Current Consultation Card
// ============================================
interface CurrentConsultationProps {
    entry: QueueEntry & { patient_name?: string; patient_avatar?: string };
    isDark: boolean;
    isRTL: boolean;
    onStartCall: () => void;
    onPostpone: () => void;
    onEnd: () => void;
    starting: boolean;
    postponing: boolean;
    ending: boolean;
}

const CurrentConsultationCard: React.FC<CurrentConsultationProps> = ({
    entry,
    isDark,
    isRTL,
    onStartCall,
    onPostpone,
    onEnd,
    starting,
    postponing,
    ending,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "p-5 sm:p-6 rounded-2xl border-2 border-[#FD614B] transition-all shadow-lg",
                isDark ? "bg-[#FD614B]/10 border-[#FD614B]/50" : "bg-[#FFF5F3] border-[#FD614B]/40"
            )}
        >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FD614B]" />
                    </span>
                    <span className="text-[#FD614B] font-bold text-sm sm:text-base">
                        {entry.status === "called"
                            ? (isRTL ? "المريض قيد الاستدعاء" : "Patient Called")
                            : (isRTL ? "استشارة جارية حالياً" : "Consultation In Progress")}
                    </span>
                </div>
                {entry.called_at && (
                    <span className="text-slate-500 text-xs sm:text-sm flex items-center gap-1">
                        {Icons.clock}
                        <span>{isRTL ? "منذ" : "Called"} {formatWaitTime(entry.called_at)}</span>
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4 mb-5">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#FD614B]/50 flex items-center justify-center bg-gradient-to-br from-[#044C87] to-[#FD614B] text-white font-bold text-xl flex-shrink-0 shadow-md">
                    {entry.patient_avatar ? (
                        <Image
                            src={entry.patient_avatar}
                            alt={entry.patient_name || "Patient"}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <span>{getInitials(entry.patient_name || "مريض")}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn("text-lg sm:text-xl font-bold truncate", isDark ? "text-white" : "text-slate-900")}>
                            {entry.patient_name || (isRTL ? "مريض في الانتظار" : "Patient Waiting")}
                        </p>
                        <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                            entry.payment_status === "completed" || entry.payment_status === "completed_mock"
                                ? "bg-green-500/15 text-green-400 border border-green-500/30"
                                : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        )}>
                            {entry.payment_status === "completed" || entry.payment_status === "completed_mock"
                                ? (isRTL ? "مدفوع" : "Paid")
                                : (isRTL ? "إيصال معلق" : "Pending Receipt")}
                        </span>
                    </div>
                    <p className={cn("text-xs sm:text-sm mt-0.5", isDark ? "text-slate-400" : "text-slate-600")}>
                        {isRTL ? "المريض جاهز للاستشارة الفورية عبر الفيديو" : "Patient ready for immediate video consultation"}
                    </p>
                </div>
            </div>

            {entry.chief_complaint && (
                <div className={cn(
                    "p-3.5 rounded-xl mb-5 text-sm",
                    isDark ? "bg-[#0D2C4F]/60 border border-white/5" : "bg-white border border-gray-200"
                )}>
                    <div className="flex items-start gap-2">
                        <span className="text-[#FD614B] mt-0.5 flex-shrink-0">{Icons.clipboard}</span>
                        <div>
                            <p className="text-slate-400 text-xs mb-0.5 font-medium">
                                {isRTL ? "الشكوى الرئيسية للمريض:" : "Chief Complaint:"}
                            </p>
                            <p className={cn("font-medium", isDark ? "text-white" : "text-slate-800")}>
                                {entry.chief_complaint}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5">
                {/* Main Video Call Button */}
                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(253,97,75,0.45)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={onStartCall}
                    disabled={starting || postponing || ending}
                    className="w-full py-3.5 sm:py-4 bg-[#FD614B] text-white rounded-xl font-bold text-base sm:text-lg hover:bg-[#E84D37] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#FD614B]/20"
                >
                    {starting ? (
                        <>
                            {Icons.loading}
                            <span>{isRTL ? "جاري الدخول لغرفة المكالمة..." : "Entering Call Room..."}</span>
                        </>
                    ) : (
                        <>
                            {Icons.video}
                            <span>{isRTL ? "بدء مكالمة الفيديو الآن" : "Start Video Call Now"}</span>
                        </>
                    )}
                </motion.button>

                {/* Secondary Controls: Postpone / End */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onPostpone}
                        disabled={starting || postponing || ending}
                        className={cn(
                            "py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 border cursor-pointer",
                            isDark
                                ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                                : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100",
                            (starting || postponing || ending) && "opacity-50 cursor-not-allowed"
                        )}
                        title={isRTL ? "إذا كان المريض غير متاح حالياً، أعده لقائمة الانتظار واختر مريضاً آخر" : "Return to queue if patient is unavailable"}
                    >
                        {postponing ? (
                            <>
                                {Icons.loading}
                                <span>{isRTL ? "جاري التأجيل..." : "Postponing..."}</span>
                            </>
                        ) : (
                            <>
                                {Icons.clock}
                                <span>{isRTL ? "المريض غير متاح (تأجيل للانتظار)" : "Unavailable (Return to Queue)"}</span>
                            </>
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onEnd}
                        disabled={starting || postponing || ending}
                        className={cn(
                            "py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 border cursor-pointer",
                            isDark
                                ? "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                                : "bg-gray-100 text-slate-700 border-gray-300 hover:bg-gray-200",
                            (starting || postponing || ending) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {ending ? (
                            <>
                                {Icons.loading}
                                <span>{isRTL ? "جاري الإنهاء..." : "Ending..."}</span>
                            </>
                        ) : (
                            <>
                                {Icons.check}
                                <span>{isRTL ? "إنهاء الاستشارة" : "End Consultation"}</span>
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

// ============================================
// Main Page Component
// ============================================
export default function DoctorUrgentCarePage() {
    const router = useRouter();
    const { theme } = useTheme();
    const { isRTL, language } = useI18n();
    const { profile, isLoading: profileLoading, refreshProfile } = useAuth();
    const isDark = theme === "dark";

    // Get doctor's name and avatar from profile
    // Show "..." during loading, then actual name
    const doctorName = profile?.profile.full_name || (profileLoading ? "..." : "Doctor");
    // Ensure avatar is a valid non-empty string, otherwise null
    const avatarUrl = profile?.profile.avatar_url;
    const doctorAvatar = avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : null;

    const [doctorProfileId, setDoctorProfileId] = useState<string | null>(null);
    const [doctorMessagingProfileId, setDoctorMessagingProfileId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [calling, setCalling] = useState(false);
    const [callingPatientId, setCallingPatientId] = useState<string | null>(null);
    const [startingCall, setStartingCall] = useState(false);
    const [postponing, setPostponing] = useState(false);
    const [ending, setEnding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(false);

    const [currentPatient, setCurrentPatient] = useState<(QueueEntry & { patient_name?: string; patient_avatar?: string; patient_messaging_profile_id?: string }) | null>(null);
    const [waitingPatients, setWaitingPatients] = useState<Array<QueueEntry & { patient_name: string; patient_avatar?: string; patient_messaging_profile_id?: string }>>([]);
    const [todayStats, setTodayStats] = useState({ completed: 0, earnings: 0 });

    // Refs to prevent double-clicks
    const isStartingCallRef = useRef(false);
    const isCallingNextRef = useRef(false);

    // Real-time hooks
    const { isOnline: realtimeOnline, isConnected } = useDoctorOnlineStatus(doctorProfileId);
    const { queue } = useDoctorQueue(doctorProfileId);

    // Load initial data (showLoading = true for initial load, false for background refresh)
    const loadQueueStatus = useCallback(async (showLoading = false) => {
        if (showLoading) {
            setLoading(true);
        }
        try {
            const result = await getDoctorQueueStatus();
            if (result.error) {
                setError(result.error);
            } else {
                setCurrentPatient(result.currentPatient);
                setWaitingPatients(result.waitingPatients);
                setTodayStats(result.todayStats);
                setIsOnline(result.isOnline);
                // Set doctor profile IDs from the result
                if (result.doctorProfileId) {
                    setDoctorProfileId(result.doctorProfileId);
                }
                if (result.doctorMessagingProfileId) {
                    setDoctorMessagingProfileId(result.doctorMessagingProfileId);
                }
            }
        } catch (err) {
            console.error("Error loading queue status:", err);
            setError(isRTL ? "حدث خطأ في تحميل البيانات" : "Error loading data");
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, [isRTL]);

    // Load queue status on mount (with loading spinner)
    useEffect(() => {
        loadQueueStatus(true);
    }, [loadQueueStatus]);

    // Refresh profile once on mount to ensure fresh data (bypass stale cache)
    useEffect(() => {
        refreshProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Note: We no longer auto-set offline on page refresh/close
    // The doctor's online status persists until they manually toggle offline
    // This prevents the status from resetting when the page is refreshed

    // Sync isOnline with realtime updates when connected
    useEffect(() => {
        if (isConnected && doctorProfileId) {
            setIsOnline(realtimeOnline);
        }
    }, [isConnected, realtimeOnline, doctorProfileId]);

    // Update waiting patients when real-time queue updates
    useEffect(() => {
        // Merge real-time updates with existing patient names
        // Handle both adding and removing patients
        setWaitingPatients(prev => {
            if (queue.length === 0) {
                // Queue is empty - return empty array
                return [];
            }
            const updated = queue.map(q => {
                const existing = prev.find(p => p.id === q.id);
                return {
                    ...q,
                    // Prefer queue's patient_name (from FK join), then existing, then fallback
                    patient_name: q.patient_name || existing?.patient_name || "Patient",
                    patient_avatar: q.patient_avatar || existing?.patient_avatar,
                    patient_messaging_profile_id: q.patient_messaging_profile_id || existing?.patient_messaging_profile_id,
                };
            });
            return updated;
        });
    }, [queue]);

    // Polling fallback - refresh queue every 5 seconds in case real-time doesn't work
    useEffect(() => {
        if (!doctorProfileId) return;

        const interval = setInterval(() => {
            loadQueueStatus(false); // Background refresh without loading spinner
        }, 5000);

        return () => clearInterval(interval);
    }, [doctorProfileId, loadQueueStatus]);

    // Refresh immediately when page gains focus (e.g., returning from call page)
    useEffect(() => {
        const handleFocus = () => {
            console.log("[Doctor Urgent Care] Page focused, refreshing data...");
            loadQueueStatus(false);
        };

        window.addEventListener("focus", handleFocus);

        // Also refresh on visibility change (tab becomes visible)
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                console.log("[Doctor Urgent Care] Page visible, refreshing data...");
                loadQueueStatus(false);
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [loadQueueStatus]);

    // Handle calling any specific patient or next in queue
    const handleCallPatient = async (targetPatientId?: string, directJoin = true) => {
        if (isCallingNextRef.current) return;
        isCallingNextRef.current = true;

        const effectiveId = targetPatientId || (waitingPatients[0]?.id);
        if (!effectiveId) {
            isCallingNextRef.current = false;
            return;
        }

        setCalling(true);
        setCallingPatientId(effectiveId);
        setError(null);

        try {
            const result = await callPatient(effectiveId);
            if (result.success && result.queueEntry) {
                const calledEntry = result.queueEntry;
                setCurrentPatient(calledEntry);
                await loadQueueStatus(false);

                if (directJoin) {
                    router.push(`/${language}/dashboard/doctor/urgent-care/call/${calledEntry.id}`);
                }
            } else {
                setError(result.error || (isRTL ? "حدث خطأ أثناء استدعاء المريض" : "An error occurred"));
                isCallingNextRef.current = false;
            }
        } catch (err) {
            console.error("Error calling patient:", err);
            setError(isRTL ? "حدث خطأ أثناء استدعاء المريض" : "An error occurred");
            isCallingNextRef.current = false;
        } finally {
            setCalling(false);
            setCallingPatientId(null);
            if (!directJoin) {
                isCallingNextRef.current = false;
            }
        }
    };

    // Return current patient to queue if unavailable right now
    const handlePostpone = async (patientId: string) => {
        setPostponing(true);
        setError(null);
        try {
            const result = await returnPatientToQueue(patientId);
            if (result.success) {
                setCurrentPatient(null);
                await loadQueueStatus(false);
            } else {
                setError(result.error || (isRTL ? "فشل تأجيل المريض" : "Failed to return patient to queue"));
            }
        } catch (err) {
            console.error("Error postponing patient:", err);
            setError(isRTL ? "حدث خطأ أثناء تأجيل المريض" : "An error occurred");
        } finally {
            setPostponing(false);
        }
    };

    // Complete / end consultation
    const handleEndConsultation = async (patientId: string) => {
        setEnding(true);
        setError(null);
        try {
            const result = await endQueueConsultation(patientId);
            if (result.success) {
                setCurrentPatient(null);
                await loadQueueStatus(false);
            } else {
                setError(result.error || (isRTL ? "فشل إنهاء الاستشارة" : "Failed to end consultation"));
            }
        } catch (err) {
            console.error("Error ending consultation:", err);
            setError(isRTL ? "حدث خطأ أثناء إنهاء الاستشارة" : "An error occurred");
        } finally {
            setEnding(false);
        }
    };

    // Handle start video call
    const handleStartCall = async () => {
        if (!currentPatient) return;

        // Prevent double-clicks using ref for immediate blocking
        if (isStartingCallRef.current) return;
        isStartingCallRef.current = true;

        setStartingCall(true);
        setError(null);

        try {
            const result = await startQueueConsultation(currentPatient.id);
            if (result.success && result.roomUrl) {
                // Redirect to video call page
                router.push(`/${language}/dashboard/doctor/urgent-care/call/${currentPatient.id}`);
            } else {
                setError(result.error || (isRTL ? "حدث خطأ" : "An error occurred"));
                isStartingCallRef.current = false;
            }
        } catch (err) {
            console.error("Error starting consultation:", err);
            setError(isRTL ? "حدث خطأ" : "An error occurred");
            isStartingCallRef.current = false;
        } finally {
            setStartingCall(false);
            // Note: Don't reset ref here on success - page navigates away
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className={cn("min-h-screen p-6 flex items-center justify-center", isRTL && "rtl")}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#FD614B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className={cn(isDark ? "text-slate-400" : "text-slate-600")}>
                        {isRTL ? "جاري التحميل..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen p-3.5 sm:p-6 max-w-full overflow-x-hidden", isRTL && "rtl")}>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {/* Doctor Avatar */}
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#FD614B]/40 flex items-center justify-center bg-[#FD614B]/10">
                            {profileLoading ? (
                                <div className="w-6 h-6 border-2 border-[#FD614B] border-t-transparent rounded-full animate-spin" />
                            ) : doctorAvatar ? (
                                <Image
                                    src={doctorAvatar}
                                    alt={doctorName}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                />
                            ) : (
                                <span className="text-xl font-semibold text-[#FD614B]">
                                    {getInitials(doctorName)}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className={cn("text-2xl font-bold mb-1", isDark ? "text-white" : "text-slate-900")}>
                                {doctorName || (isRTL ? "الاستشارات العاجلة" : "Urgent Care Queue")}
                            </h1>
                            <p className={cn(isDark ? "text-slate-400" : "text-slate-600")}>
                                {isRTL ? "إدارة قائمة انتظار المرضى" : "Manage your patient queue"}
                            </p>
                        </div>
                    </div>

                    {/* Online Status (Synced with Header) */}
                    <div className={cn(
                        "flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-semibold select-none",
                        isOnline
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500 dark:text-emerald-400 shadow-sm"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400 shadow-sm"
                    )}>
                        <span className="relative flex h-2.5 w-2.5">
                            {isOnline && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            )}
                            <span className={cn(
                                "relative inline-flex rounded-full h-2.5 w-2.5",
                                isOnline ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                            )} />
                        </span>
                        <span className="whitespace-nowrap">
                            {isOnline ? (isRTL ? "متصل الآن" : "Online") : (isRTL ? "غير متصل" : "Offline")}
                        </span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                    >
                        <p className="text-red-400">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Row */}
            {(isOnline || waitingPatients.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className={cn(
                        "p-4 rounded-xl border",
                        isDark ? "bg-[#0D2C4F]/50 border-white/5" : "bg-white border-gray-200"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                isDark ? "bg-[#FD614B]/10 text-[#FD614B]" : "bg-[#FFF5F3] text-[#E84D37]"
                            )}>
                                {Icons.users}
                            </div>
                            <div>
                                <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                    <AnimatedNumber value={waitingPatients.length} />
                                </p>
                                <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
                                    {isRTL ? "في الانتظار" : "In Queue"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={cn(
                        "p-4 rounded-xl border",
                        isDark ? "bg-[#0D2C4F]/50 border-white/5" : "bg-white border-gray-200"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                isDark ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"
                            )}>
                                {Icons.check}
                            </div>
                            <div>
                                <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                    <AnimatedNumber value={todayStats.completed} delay={0.06} />
                                </p>
                                <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
                                    {isRTL ? "مكتمل اليوم" : "Completed Today"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={cn(
                        "p-4 rounded-xl border",
                        isDark ? "bg-[#0D2C4F]/50 border-white/5" : "bg-white border-gray-200"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                isDark ? "bg-[#FD614B]/10 text-[#FD614B]" : "bg-[#FFF5F3] text-[#E84D37]"
                            )}>
                                {Icons.money}
                            </div>
                            <div>
                                <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                    <AnimatedNumber value={todayStats.earnings} delay={0.12} />
                                </p>
                                <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
                                    {isRTL ? "جنيه اليوم" : "EGP Today"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Current Consultation */}
            {currentPatient && (currentPatient.status === "called" || currentPatient.status === "in_consultation") && (
                <div className="mb-8">
                    <h2 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-slate-900")}>
                        {isRTL ? "الاستشارة الحالية" : "Current Consultation"}
                    </h2>
                    <CurrentConsultationCard
                        entry={currentPatient}
                        isDark={isDark}
                        isRTL={isRTL}
                        onStartCall={handleStartCall}
                        onPostpone={() => handlePostpone(currentPatient.id)}
                        onEnd={() => handleEndConsultation(currentPatient.id)}
                        starting={startingCall}
                        postponing={postponing}
                        ending={ending}
                    />
                </div>
            )}

            {/* Queue List */}
            {isOnline && (
                <div>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div>
                            <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                {isRTL ? "قائمة الانتظار" : "Waiting Queue"}
                            </h2>
                            <p className={cn("text-xs mt-0.5", isDark ? "text-slate-400" : "text-slate-600")}>
                                {isRTL
                                    ? "يمكنك اختيار وبدء المكالمة مع أي مريض في القائمة مباشرة"
                                    : "You can select and start a call with any patient in the queue directly"}
                            </p>
                        </div>
                        {waitingPatients.length > 0 && !currentPatient && (
                            <motion.button
                                whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(253,97,75,0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                onClick={() => handleCallPatient()}
                                disabled={calling}
                                className="px-4 py-2 bg-[#FD614B] text-white rounded-lg font-medium hover:bg-[#E84D37] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-[#FD614B]/20"
                            >
                                {calling && !callingPatientId ? Icons.loading : Icons.phone}
                                <span>{isRTL ? "استدعاء التالي" : "Call Next"}</span>
                            </motion.button>
                        )}
                    </div>

                    {waitingPatients.length === 0 ? (
                        <div className={cn(
                            "p-12 rounded-2xl border text-center",
                            isDark ? "bg-[#0D2C4F]/30 border-white/5" : "bg-gray-50 border-gray-200"
                        )}>
                            <div className={cn(
                                "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                                isDark ? "bg-slate-700" : "bg-gray-200"
                            )}>
                                {Icons.users}
                            </div>
                            <h3 className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                                {isRTL ? "لا يوجد مرضى في الانتظار" : "No Patients Waiting"}
                            </h3>
                            <p className={cn(isDark ? "text-slate-400" : "text-slate-600")}>
                                {isRTL
                                    ? "سيظهر المرضى هنا عند انضمامهم لقائمتك"
                                    : "Patients will appear here when they join your queue"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {waitingPatients.map((patient, index) => (
                                    <QueuePatientCard
                                        key={patient.id}
                                        entry={patient}
                                        position={index + 1}
                                        isDark={isDark}
                                        isRTL={isRTL}
                                        isCurrent={patient.id === currentPatient?.id}
                                        onCall={() => handleCallPatient(patient.id)}
                                        calling={calling && callingPatientId === patient.id}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}

            {/* Offline State */}
            {!isOnline && (
                <div className={cn(
                    "p-12 rounded-2xl border text-center",
                    isDark ? "bg-[#0D2C4F]/30 border-white/5" : "bg-gray-50 border-gray-200"
                )}>
                    <div className={cn(
                        "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
                        isDark ? "bg-slate-700" : "bg-gray-200"
                    )}>
                        <svg className={cn("w-10 h-10", isDark ? "text-slate-500" : "text-gray-400")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                        {isRTL ? "أنت غير متصل" : "You're Currently Offline"}
                    </h3>
                    <p className={cn("mb-6 max-w-md mx-auto", isDark ? "text-slate-400" : "text-slate-600")}>
                        {isRTL
                            ? "يمكنك تفعيل الاتصال في أي وقت من زر 'متصل الآن' في الهيدر أعلى الصفحة لبدء استقبال المرضى"
                            : "You can go online anytime using the 'Online' switch in the header above to start accepting patients"}
                    </p>
                </div>
            )}

            {/* Queue Chat - Show when there's a patient to chat with */}
            {isOnline && doctorMessagingProfileId && (
                // Prioritize current patient, then first waiting patient
                currentPatient?.patient_messaging_profile_id ? (
                    <QueueChat
                        recipientProfileId={currentPatient.patient_messaging_profile_id}
                        recipientName={currentPatient.patient_name || (isRTL ? "مريض" : "Patient")}
                        recipientAvatar={currentPatient.patient_avatar}
                        isDark={isDark}
                        isRTL={isRTL}
                        currentProfileId={doctorMessagingProfileId}
                    />
                ) : waitingPatients.length > 0 && waitingPatients[0].patient_messaging_profile_id ? (
                    <QueueChat
                        recipientProfileId={waitingPatients[0].patient_messaging_profile_id}
                        recipientName={waitingPatients[0].patient_name}
                        recipientAvatar={waitingPatients[0].patient_avatar}
                        isDark={isDark}
                        isRTL={isRTL}
                        currentProfileId={doctorMessagingProfileId}
                    />
                ) : null
            )}
        </div>
    );
}
