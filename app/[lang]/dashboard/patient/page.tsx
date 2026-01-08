"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "./context/ThemeContext";
import { useI18n } from "@/app/i18n";
import { useAuth } from "@/app/context/AuthContext";

// Import Aceternity components
import { GlowingCard } from "@/components/ui/glowing-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { SparklesCore } from "@/components/ui/sparkles";

// ============================================
// ICONS
// ============================================
const Icons = {
    calendar: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    prescription: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    message: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    ),
    heart: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    ),
    video: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    folder: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
    ),
    clock: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    hand: (
        <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
    ),
};

// ============================================
// COMPONENTS
// ============================================

// Badge Component
const Badge = ({ children, variant = "default", className }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "primary"; className?: string }) => {
    const variants = {
        default: "bg-slate-700/50 text-slate-300",
        success: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
        warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        primary: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant], className)}>
            {children}
        </span>
    );
};

// Section Header
const SectionHeader = ({ title, subtitle, action, isDark = true }: { title: string; subtitle?: string; action?: React.ReactNode; isDark?: boolean }) => (
    <div className="flex items-center justify-between mb-6">
        <div>
            <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>{title}</h2>
            {subtitle && <p className={cn("text-sm mt-1", isDark ? "text-gray-500" : "text-gray-600")}>{subtitle}</p>}
        </div>
        {action}
    </div>
);

// ============================================
// MOCK DATA
// ============================================

export default function PatientDashboard() {
    const { theme } = useTheme();
    const { t, language, isRTL, formatNumber, formatDate } = useI18n();
    const { profile } = useAuth();
    const isDark = theme === "dark";

    // Get user's first name from profile
    const userName = profile?.profile.full_name?.split(' ')[0] || (isRTL ? "سارة" : "Sarah");

    const greeting = new Date().getHours() < 12 ? t.doctorDashboard.greeting.morning : new Date().getHours() < 17 ? t.doctorDashboard.greeting.afternoon : t.doctorDashboard.greeting.evening;

    const nextAppointment = {
        doctor: t.common.demoNames.drAhmedHassan,
        specialty: t.specialties.cardiology,
        date: t.common.today,
        time: isRTL ? "٠٢:٣٠ م" : "2:30 PM",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
        location: isRTL ? "غرفة ٢٠٥، مبنى أ" : "Room 205, Building A",
    };

    const activePrescriptions = [
        { name: "Lisinopril 10mg", dosage: t.patientDashboard.prescriptionsPage.frequency.daily.replace("{n}", formatNumber(1)), refillDate: formatDate("Dec 28, 2024"), status: "active" },
        { name: "Metformin 500mg", dosage: t.patientDashboard.prescriptionsPage.frequency.daily.replace("{n}", formatNumber(2)), refillDate: formatDate("Jan 5, 2025"), status: "active" },
        { name: "Atorvastatin 20mg", dosage: t.patientDashboard.prescriptionsPage.frequency.bedtime.replace("{n}", formatNumber(1)), refillDate: formatDate("Dec 20, 2024"), status: "refill-needed" },
    ];

    const recentActivity = [
        { type: "appointment", title: `${t.patientDashboard.activity.appointment} ${t.common.demoNames.drHassan}`, time: isRTL ? `منذ يومين` : `2 ${t.common.time.daysAgo}`, icon: Icons.calendar },
        { type: "prescription", title: `${t.patientDashboard.activity.prescription} - Lisinopril`, time: isRTL ? `منذ ${formatNumber(5)} أيام` : `5 ${t.common.time.daysAgo}`, icon: Icons.prescription },
        { type: "message", title: `${t.patientDashboard.activity.message} ${t.common.demoNames.drHassan}`, time: t.common.time.dayAgo, icon: Icons.message }, // "1 day ago" key works for singular
        { type: "record", title: t.patientDashboard.activity.record, time: isRTL ? `منذ ${formatNumber(14)} يوماً` : `14 ${t.common.time.daysAgo}`, icon: Icons.folder },
    ];

    const quickActions = [
        { title: t.patientDashboard.actions.bookAppointment, description: t.patientDashboard.actionDesc.bookAppointment, icon: Icons.calendar },
        { title: t.patientDashboard.actions.viewPrescriptions, description: t.patientDashboard.actionDesc.viewPrescriptions, icon: Icons.prescription },
        { title: t.patientDashboard.actions.messageDoctor, description: t.patientDashboard.actionDesc.messageDoctor, icon: Icons.message },
        { title: t.patientDashboard.actions.medicalRecords, description: t.patientDashboard.actionDesc.medicalRecords, icon: Icons.folder },
    ];

    return (
        <div className="relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="patient-dashboard-sparkles"
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={isDark ? 25 : 15}
                    particleColor={isDark ? "20, 184, 166" : "13, 148, 136"}
                />
                {/* Gradient orbs - dark mode only */}
                {isDark && (
                    <>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
                    </>
                )}
            </div>

            {/* Main Content */}
            <main className="relative z-0 p-4 md:p-6 lg:p-8">
                {/* Greeting Section */}
                <section className="mb-6 md:mb-8">
                    <h2 className={cn("text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3", isDark ? "text-white" : "text-slate-900")}>
                        {greeting}, {userName} {Icons.hand}
                    </h2>
                    <p className={cn("text-base md:text-lg", isDark ? "text-gray-400" : "text-gray-600")}>
                        {t.patientDashboard.greeting.subtitle}
                    </p>
                </section>

                {/* Stats Row */}
                <section className="mb-6 md:mb-8">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {[
                            { label: t.patientDashboard.stats.upcomingAppointments, value: 2, icon: Icons.calendar },
                            { label: t.patientDashboard.stats.activePrescriptions, value: 3, icon: Icons.prescription },
                            { label: t.patientDashboard.stats.unreadMessages, value: 2, icon: Icons.message },
                            { label: t.patientDashboard.stats.healthScore, value: 92, suffix: "%", icon: Icons.heart },
                        ].map((stat, idx) => (
                            <GlowingCard key={idx} glowColor="teal" className="p-3 md:p-5" isDark={isDark}>
                                <div className="flex items-start justify-between mb-2 md:mb-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                        <span className="[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">
                                            {stat.icon}
                                        </span>
                                    </div>
                                    <Badge variant="primary" className="text-[9px] md:text-xs px-1.5 md:px-2 py-0.5 hidden sm:block">{t.common.today}</Badge>
                                </div>
                                <div className="flex items-baseline gap-0.5 md:gap-1">
                                    <span className={cn("text-2xl md:text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                        <AnimatedNumber value={stat.value} format={(v) => formatNumber(v)} />
                                    </span>
                                    {stat.suffix && <span className={cn("text-base md:text-lg", isDark ? "text-gray-400" : "text-gray-500")}>{formatNumber(stat.suffix)}</span>}
                                </div>
                                <p className={cn("text-[11px] md:text-sm mt-1 leading-tight", isDark ? "text-gray-500" : "text-gray-600")}>{stat.label}</p>
                            </GlowingCard>
                        ))}
                    </div>
                </section>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    {/* Next Appointment */}
                    <div className="xl:col-span-2">
                        <GlowingCard glowColor="teal" className="p-4 md:p-6" isDark={isDark}>
                            <SectionHeader title={t.patientDashboard.sections.nextAppointment} subtitle={t.patientDashboard.sections.upcomingVisit} isDark={isDark} />

                            <div className={cn(
                                "p-3 md:p-5 rounded-xl border",
                                isDark ? "bg-teal-500/5 border-teal-500/20" : "bg-teal-50 border-teal-200"
                            )}>
                                <div className="flex flex-col gap-3 sm:gap-4">
                                    {/* Doctor info row */}
                                    <div className="flex items-start gap-3">
                                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden border-2 border-teal-500/30 flex-shrink-0">
                                            <Image src={nextAppointment.image} alt={nextAppointment.doctor} fill className="object-cover" unoptimized />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={cn("text-base sm:text-lg font-semibold truncate", isDark ? "text-white" : "text-slate-900")}>
                                                {nextAppointment.doctor}
                                            </h3>
                                            <p className={cn("text-xs sm:text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                                {nextAppointment.specialty}
                                            </p>
                                            {/* Date/Time - visible on sm+ */}
                                            <div className="hidden sm:flex items-center gap-4 mt-3">
                                                <div className="flex items-center gap-2 text-teal-500">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                    </svg>
                                                    <span className="text-sm font-medium">{nextAppointment.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-teal-500">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">{nextAppointment.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile: Date/Time/Location row */}
                                    <div className="flex sm:hidden items-center justify-between text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-teal-500">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                </svg>
                                                <span className="font-medium">{nextAppointment.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-teal-500">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-medium">{nextAppointment.time}</span>
                                            </div>
                                        </div>
                                        <div className={cn("flex items-center gap-1 truncate", isDark ? "text-gray-500" : "text-gray-600")}>
                                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                            <span className="truncate">{nextAppointment.location}</span>
                                        </div>
                                    </div>

                                    {/* Desktop: Location */}
                                    <p className={cn("hidden sm:flex text-sm items-center gap-1", isDark ? "text-gray-500" : "text-gray-600")}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                        {nextAppointment.location}
                                    </p>

                                    {/* Action buttons - full width on mobile */}
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button className="flex-1 sm:flex-initial px-3 md:px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs md:text-sm font-medium rounded-lg transition-colors text-center">
                                            {t.doctorDashboard.actions.startVideoCall}
                                        </button>
                                        <button className={cn(
                                            "flex-1 sm:flex-initial px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors text-center",
                                            isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                        )}>
                                            {t.patientDashboard.appointmentsPage.reschedule}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Active Prescriptions Preview */}
                            <div className="mt-4 md:mt-6">
                                <h3 className={cn("text-base md:text-lg font-semibold mb-3 md:mb-4", isDark ? "text-white" : "text-slate-900")}>
                                    {t.patientDashboard.sections.recentPrescriptions}
                                </h3>
                                <div className="space-y-2 md:space-y-3">
                                    {activePrescriptions.slice(0, 2).map((rx, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "flex items-center justify-between p-2.5 md:p-3 rounded-lg border gap-2",
                                                isDark ? "bg-white/[0.02] border-white/5" : "bg-gray-50 border-gray-200"
                                            )}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className={cn("font-medium text-sm md:text-base truncate", isDark ? "text-white" : "text-slate-900")}>{rx.name}</p>
                                                <p className={cn("text-xs md:text-sm truncate", isDark ? "text-gray-500" : "text-gray-600")}>{rx.dosage}</p>
                                            </div>
                                            <Badge variant={rx.status === "refill-needed" ? "warning" : "success"} className="flex-shrink-0 text-[10px] md:text-xs">
                                                {rx.status === "refill-needed" ? t.patientDashboard.prescriptionsPage.status.refillNeeded : t.patientDashboard.prescriptionsPage.status.active}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GlowingCard>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <GlowingCard glowColor="teal" className="p-4 md:p-6" isDark={isDark}>
                            <SectionHeader title={t.adminDashboard.sections.recentActivity} isDark={isDark} />
                            <div className="space-y-4">
                                {recentActivity.map((activity, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 flex-shrink-0">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={
                                                    activity.type === "appointment" ? "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" :
                                                        activity.type === "prescription" ? "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" :
                                                            activity.type === "message" ? "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" :
                                                                "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                                                } />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("text-sm font-medium truncate", isDark ? "text-white" : "text-slate-900")}>
                                                {activity.title}
                                            </p>
                                            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-600")}>
                                                {activity.time}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </GlowingCard>
                    </div>
                </div>

                {/* Quick Actions */}
                <section>
                    <SectionHeader title={t.patientDashboard.sections.quickActions} subtitle={t.patientDashboard.actionDesc.bookAppointment} isDark={isDark} />
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {quickActions.map((action, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -4 }}
                            >
                                <GlowingCard
                                    glowColor="teal"
                                    className="p-3 md:p-5 cursor-pointer group h-full"
                                    isDark={isDark}
                                >
                                    <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 mb-2 md:mb-4 group-hover:bg-teal-500 group-hover:text-white transition-all">
                                        <span className="[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">
                                            {action.icon}
                                        </span>
                                    </div>
                                    <h3 className={cn("font-semibold text-xs md:text-base mb-0.5 md:mb-1 group-hover:text-teal-500 transition-colors leading-tight", isDark ? "text-white" : "text-slate-900")}>
                                        {action.title}
                                    </h3>
                                    <p className={cn("text-[10px] md:text-sm leading-tight line-clamp-2 hidden sm:block", isDark ? "text-gray-500" : "text-gray-600")}>
                                        {action.description}
                                    </p>
                                </GlowingCard>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
