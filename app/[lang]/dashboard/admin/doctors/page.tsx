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
    getPendingDoctors,
    getVerificationStats,
    getDoctorApplicationDetails,
    approveDoctor,
    rejectDoctor,
    getCredentialViewUrl,
} from "@/app/actions/admin-verification";

// Icons
const Icons = {
    doctor: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
    ),
    check: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    clock: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    x: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    money: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    star: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
    document: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    email: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    ),
    license: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
        </svg>
    ),
    experience: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
    ),
    eye: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    externalLink: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
    ),
};

interface PendingDoctor {
    id: string;
    profileId: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    licenseNumber: string | null;
    yearsOfExperience: number;
    bio: string | null;
    consultationFee: number | null;
    verificationStatus: string;
    createdAt: string;
    specialty: string | null;
}

interface DoctorDetails extends PendingDoctor {
    phone: string | null;
    credentials: Array<{
        id: string;
        credentialType: string;
        documentUrl: string;
        documentName: string | null;
        verificationStatus: string;
    }>;
}

const Badge = ({ variant, children }: { variant: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        verified: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        pending: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
        inactive: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant] || variants.inactive)}>
            {children}
        </span>
    );
};

export default function DoctorsPage() {
    const { t, isRTL, formatNumber } = useI18n();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [filter, setFilter] = useState("pending");
    const [search, setSearch] = useState("");
    const [doctors, setDoctors] = useState<PendingDoctor[]>([]);
    const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorDetails | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [viewingCredential, setViewingCredential] = useState<string | null>(null);

    // Fetch data on mount and when filter changes
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [doctorsResult, statsResult] = await Promise.all([
                    getPendingDoctors(filter),
                    getVerificationStats(),
                ]);

                if (doctorsResult.doctors) {
                    setDoctors(doctorsResult.doctors);
                }
                setStats(statsResult);
            } catch {
                // Error fetching data - will show empty state
            }
            setIsLoading(false);
        }
        fetchData();
    }, [filter]);

    // View doctor details
    const handleViewDetails = async (doctorId: string) => {
        setIsDetailLoading(true);
        try {
            const result = await getDoctorApplicationDetails(doctorId);
            if (result.doctor) {
                setSelectedDoctor(result.doctor);
            }
        } catch {
            // Error fetching details - modal won't open
        }
        setIsDetailLoading(false);
    };

    // Approve doctor
    const handleApprove = async (doctorId: string) => {
        setActionLoading(doctorId);
        try {
            const result = await approveDoctor(doctorId);
            if (result.success) {
                // Refetch the list to update UI
                const doctorsResult = await getPendingDoctors(filter);
                if (doctorsResult.doctors) {
                    setDoctors(doctorsResult.doctors);
                }
                // Update stats
                setStats(prev => ({ ...prev, pending: prev.pending - 1, verified: prev.verified + 1 }));
                setSelectedDoctor(null);
            }
        } catch {
            // Error approving doctor - action state will reset
        }
        setActionLoading(null);
    };

    // Reject doctor
    const handleReject = async (doctorId: string) => {
        if (!rejectReason.trim()) return;

        setActionLoading(doctorId);
        try {
            const result = await rejectDoctor(doctorId, rejectReason);
            if (result.success) {
                // Refetch the list to update UI
                const doctorsResult = await getPendingDoctors(filter);
                if (doctorsResult.doctors) {
                    setDoctors(doctorsResult.doctors);
                }
                // Update stats
                setStats(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
                setSelectedDoctor(null);
                setShowRejectModal(false);
                setRejectReason("");
            }
        } catch {
            // Error rejecting doctor - action state will reset
        }
        setActionLoading(null);
    };

    // View credential document
    const handleViewCredential = async (documentUrl: string) => {
        setViewingCredential(documentUrl);
        try {
            const result = await getCredentialViewUrl(documentUrl);
            if (result.url) {
                // Open in new tab
                window.open(result.url, "_blank", "noopener,noreferrer");
            }
            // If no URL returned, credential view will silently fail
        } catch {
            // Error viewing credential - viewing state will reset
        }
        setViewingCredential(null);
    };

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.fullName.toLowerCase().includes(search.toLowerCase()) ||
            (doc.specialty?.toLowerCase() || "").includes(search.toLowerCase());
        return matchesSearch;
    });

    const statsConfig = [
        { label: t.adminDashboard.doctorsPage.stats.totalDoctors, value: stats.total, icon: Icons.doctor, color: "teal" },
        { label: t.adminDashboard.doctorsPage.stats.active, value: stats.verified, icon: Icons.check, color: "emerald" },
        { label: t.adminDashboard.doctorsPage.stats.pending, value: stats.pending, icon: Icons.clock, color: "orange" },
        { label: isRTL ? "مرفوض" : "Rejected", value: stats.rejected, icon: Icons.x, color: "red" },
    ];

    const getFilterLabel = (key: string) => {
        const labels: Record<string, string> = {
            all: isRTL ? "الكل" : "All",
            pending: isRTL ? "قيد الانتظار" : "Pending",
            verified: isRTL ? "معتمد" : "Verified",
            rejected: isRTL ? "مرفوض" : "Rejected",
        };
        return labels[key] || key;
    };

    return (
        <div className="relative overflow-hidden min-h-screen">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="doctors-sparkles"
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
                            {isRTL ? "التحقق من الأطباء" : "Doctor Verification"}
                        </h1>
                        <p className={cn("text-sm md:text-base lg:text-lg mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            {isRTL ? "مراجعة واعتماد طلبات الأطباء" : "Review and approve doctor applications"}
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
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
                                placeholder={isRTL ? "البحث عن طبيب..." : "Search doctors..."}
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
                            {["pending", "verified", "rejected", "all"].map((f) => (
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
                ) : filteredDoctors.length === 0 ? (
                    <GlowingCard glowColor="teal" className="p-12 text-center" isDark={isDark}>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.doctor}
                        </div>
                        <h3 className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                            {isRTL ? "لا توجد طلبات" : "No Applications"}
                        </h3>
                        <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-600")}>
                            {isRTL
                                ? "لا توجد طلبات أطباء تطابق معايير البحث"
                                : "No doctor applications match your search criteria"}
                        </p>
                    </GlowingCard>
                ) : (
                    /* Doctors Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        {filteredDoctors.map((doctor, idx) => (
                            <motion.div
                                key={doctor.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <GlowingCard glowColor="teal" className="p-4 md:p-6 h-full" isDark={isDark}>
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3 md:mb-5">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden border-2 border-teal-500/30">
                                                <Image
                                                    src={doctor.avatarUrl || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face"}
                                                    alt={doctor.fullName}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                            <div>
                                                <h3 className={cn("font-semibold text-sm md:text-lg", isDark ? "text-white" : "text-slate-900")}>
                                                    {doctor.fullName}
                                                </h3>
                                                <p className={cn("text-xs md:text-sm", isDark ? "text-gray-500" : "text-gray-600")}>
                                                    {doctor.specialty || (isRTL ? "غير محدد" : "Not specified")}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={doctor.verificationStatus}>{getFilterLabel(doctor.verificationStatus)}</Badge>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-5">
                                        <div className={cn("p-2 md:p-3 rounded-lg md:rounded-xl", isDark ? "bg-white/[0.03]" : "bg-gray-50")}>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-teal-500">{Icons.license}</span>
                                                <span className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>
                                                    {isRTL ? "الترخيص" : "License"}
                                                </span>
                                            </div>
                                            <p className={cn("text-xs md:text-sm font-medium truncate", isDark ? "text-white" : "text-slate-900")}>
                                                {doctor.licenseNumber || "—"}
                                            </p>
                                        </div>
                                        <div className={cn("p-2 md:p-3 rounded-lg md:rounded-xl", isDark ? "bg-white/[0.03]" : "bg-gray-50")}>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-teal-500">{Icons.experience}</span>
                                                <span className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>
                                                    {isRTL ? "الخبرة" : "Experience"}
                                                </span>
                                            </div>
                                            <p className={cn("text-xs md:text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                                                {formatNumber(doctor.yearsOfExperience)} {isRTL ? "سنوات" : "years"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Application Date */}
                                    <p className={cn("text-xs mb-4", isDark ? "text-gray-500" : "text-gray-600")}>
                                        {isRTL ? "تاريخ التقديم:" : "Applied:"} {new Date(doctor.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "en-US")}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewDetails(doctor.id)}
                                            className={cn(
                                                "flex-1 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-colors",
                                                isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                            )}
                                        >
                                            {isRTL ? "عرض التفاصيل" : "View Details"}
                                        </button>
                                        {doctor.verificationStatus === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(doctor.id)}
                                                    disabled={actionLoading === doctor.id}
                                                    className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === doctor.id ? "..." : (isRTL ? "قبول" : "Approve")}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedDoctor(doctor as DoctorDetails);
                                                        setShowRejectModal(true);
                                                    }}
                                                    className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                                                >
                                                    {isRTL ? "رفض" : "Reject"}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </GlowingCard>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Doctor Details Modal */}
            <AnimatePresence>
                {(selectedDoctor && !showRejectModal) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedDoctor(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6",
                                isDark ? "bg-slate-900 border border-white/10" : "bg-white"
                            )}
                        >
                            {isDetailLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
                                </div>
                            ) : (
                                <>
                                    {/* Modal Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-teal-500/30">
                                                <Image
                                                    src={selectedDoctor.avatarUrl || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face"}
                                                    alt={selectedDoctor.fullName}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                            <div>
                                                <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                                    {selectedDoctor.fullName}
                                                </h2>
                                                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                                    {selectedDoctor.specialty || (isRTL ? "غير محدد" : "Not specified")}
                                                </p>
                                                <Badge variant={selectedDoctor.verificationStatus}>
                                                    {getFilterLabel(selectedDoctor.verificationStatus)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedDoctor(null)}
                                            className={cn(
                                                "p-2 rounded-lg transition-colors",
                                                isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                                            )}
                                        >
                                            {Icons.close}
                                        </button>
                                    </div>

                                    {/* Contact Info */}
                                    <div className={cn("p-4 rounded-xl mb-4", isDark ? "bg-white/5" : "bg-gray-50")}>
                                        <h3 className={cn("font-semibold mb-3", isDark ? "text-white" : "text-slate-900")}>
                                            {isRTL ? "معلومات الاتصال" : "Contact Information"}
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-teal-500">{Icons.email}</span>
                                                <span className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-700")}>
                                                    {selectedDoctor.email || "—"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Professional Info */}
                                    <div className={cn("p-4 rounded-xl mb-4", isDark ? "bg-white/5" : "bg-gray-50")}>
                                        <h3 className={cn("font-semibold mb-3", isDark ? "text-white" : "text-slate-900")}>
                                            {isRTL ? "المعلومات المهنية" : "Professional Information"}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className={cn("text-xs mb-1", isDark ? "text-gray-500" : "text-gray-600")}>
                                                    {isRTL ? "رقم الترخيص" : "License Number"}
                                                </p>
                                                <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                                                    {selectedDoctor.licenseNumber || "—"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className={cn("text-xs mb-1", isDark ? "text-gray-500" : "text-gray-600")}>
                                                    {isRTL ? "سنوات الخبرة" : "Years of Experience"}
                                                </p>
                                                <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                                                    {formatNumber(selectedDoctor.yearsOfExperience)} {isRTL ? "سنوات" : "years"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className={cn("text-xs mb-1", isDark ? "text-gray-500" : "text-gray-600")}>
                                                    {isRTL ? "رسوم الاستشارة" : "Consultation Fee"}
                                                </p>
                                                <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                                                    {selectedDoctor.consultationFee ? `${formatNumber(selectedDoctor.consultationFee)} ${isRTL ? "ج.م" : "EGP"}` : "—"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className={cn("text-xs mb-1", isDark ? "text-gray-500" : "text-gray-600")}>
                                                    {isRTL ? "تاريخ التقديم" : "Application Date"}
                                                </p>
                                                <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                                                    {new Date(selectedDoctor.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "en-US")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    {selectedDoctor.bio && (
                                        <div className={cn("p-4 rounded-xl mb-4", isDark ? "bg-white/5" : "bg-gray-50")}>
                                            <h3 className={cn("font-semibold mb-3", isDark ? "text-white" : "text-slate-900")}>
                                                {isRTL ? "نبذة تعريفية" : "Biography"}
                                            </h3>
                                            <p className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-700")}>
                                                {selectedDoctor.bio}
                                            </p>
                                        </div>
                                    )}

                                    {/* Credentials */}
                                    {selectedDoctor.credentials && selectedDoctor.credentials.length > 0 && (
                                        <div className={cn("p-4 rounded-xl mb-6", isDark ? "bg-white/5" : "bg-gray-50")}>
                                            <h3 className={cn("font-semibold mb-3", isDark ? "text-white" : "text-slate-900")}>
                                                {isRTL ? "المستندات المرفقة" : "Uploaded Documents"}
                                            </h3>
                                            <div className="space-y-2">
                                                {selectedDoctor.credentials.map((cred) => (
                                                    <div
                                                        key={cred.id}
                                                        className={cn(
                                                            "flex items-center justify-between p-3 rounded-lg",
                                                            isDark ? "bg-white/5" : "bg-gray-100"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-teal-500">{Icons.document}</span>
                                                            <div>
                                                                <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                                                                    {cred.documentName || cred.credentialType}
                                                                </p>
                                                                <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-600")}>
                                                                    {cred.credentialType}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleViewCredential(cred.documentUrl)}
                                                                disabled={viewingCredential === cred.documentUrl}
                                                                className={cn(
                                                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                                                    isDark
                                                                        ? "bg-teal-500/10 hover:bg-teal-500/20 text-teal-400"
                                                                        : "bg-teal-50 hover:bg-teal-100 text-teal-600",
                                                                    viewingCredential === cred.documentUrl && "opacity-50"
                                                                )}
                                                            >
                                                                {viewingCredential === cred.documentUrl ? (
                                                                    <span className="animate-spin">⏳</span>
                                                                ) : (
                                                                    <>
                                                                        {Icons.eye}
                                                                        <span>{isRTL ? "عرض" : "View"}</span>
                                                                        {Icons.externalLink}
                                                                    </>
                                                                )}
                                                            </button>
                                                            <Badge variant={cred.verificationStatus}>
                                                                {getFilterLabel(cred.verificationStatus)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {selectedDoctor.verificationStatus === "pending" && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApprove(selectedDoctor.id)}
                                                disabled={actionLoading === selectedDoctor.id}
                                                className="flex-1 py-3 rounded-xl font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading === selectedDoctor.id ? "..." : (isRTL ? "قبول الطلب" : "Approve Application")}
                                            </button>
                                            <button
                                                onClick={() => setShowRejectModal(true)}
                                                className="flex-1 py-3 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                                            >
                                                {isRTL ? "رفض الطلب" : "Reject Application"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && selectedDoctor && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            setShowRejectModal(false);
                            setRejectReason("");
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
                                {isRTL ? "رفض الطلب" : "Reject Application"}
                            </h3>
                            <p className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
                                {isRTL
                                    ? `هل أنت متأكد من رفض طلب ${selectedDoctor.fullName}؟`
                                    : `Are you sure you want to reject ${selectedDoctor.fullName}'s application?`}
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={isRTL ? "سبب الرفض (مطلوب)" : "Reason for rejection (required)"}
                                rows={4}
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
                                        setShowRejectModal(false);
                                        setRejectReason("");
                                    }}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-xl font-medium transition-colors",
                                        isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    )}
                                >
                                    {isRTL ? "إلغاء" : "Cancel"}
                                </button>
                                <button
                                    onClick={() => handleReject(selectedDoctor.id)}
                                    disabled={!rejectReason.trim() || actionLoading === selectedDoctor.id}
                                    className="flex-1 py-2.5 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                                >
                                    {actionLoading === selectedDoctor.id ? "..." : (isRTL ? "تأكيد الرفض" : "Confirm Rejection")}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
