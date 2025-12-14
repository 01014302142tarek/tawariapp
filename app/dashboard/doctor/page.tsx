"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "./context/ThemeContext";

// Import Aceternity components
import { GlowingCard } from "@/components/ui/glowing-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { SparklesCore } from "@/components/ui/sparkles";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

// ============================================
// ICONS
// ============================================
const Icons = {
    calendar: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    check: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    money: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    star: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
    ),
    video: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    calendarDays: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
        </svg>
    ),
    document: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    chat: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
    ),
    chart: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
    ),
    settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    logout: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
    ),
    bell: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
    ),
    chevronDown: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    ),
    users: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    sun: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
    ),
    moon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
    ),
};

// ============================================
// COMPONENTS
// ============================================

// Badge Component
const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "primary" }) => {
    const variants = {
        default: "bg-slate-700/50 text-slate-300",
        success: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
        warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        primary: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant])}>
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

// Avatar
const Avatar = ({ src, alt, size = "md", status }: { src: string; alt: string; size?: "sm" | "md" | "lg"; status?: "online" | "offline" }) => {
    const sizes = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-14 h-14" };
    return (
        <div className="relative">
            <div className={cn("rounded-full overflow-hidden border-2 border-teal-500/30", sizes[size])}>
                <Image src={src} alt={alt} fill className="object-cover" unoptimized />
            </div>
            {status === "online" && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-teal-500 border-2 border-slate-900 rounded-full" />
            )}
        </div>
    );
};

// Progress Bar
const ProgressBar = ({ value, max, isDark = true }: { value: number; max: number; isDark?: boolean }) => {
    const percentage = (value / max) * 100;
    return (
        <div className={cn("w-full h-2 rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-gray-200")}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400"
            />
        </div>
    );
};

// ============================================
// MOCK DATA
// ============================================

const patients = [
    { id: 1, name: "Sarah Johnson", designation: "9:00 AM", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
    { id: 2, name: "Mohamed Ali", designation: "10:30 AM", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
    { id: 3, name: "Fatima Khaled", designation: "11:45 AM", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face" },
    { id: 4, name: "Omar Nasser", designation: "2:00 PM", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
    { id: 5, name: "Layla Ahmed", designation: "3:30 PM", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
];

const appointments = [
    { id: 1, time: "09:00", patient: "Sarah Johnson", type: "Follow-up", status: "completed", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
    { id: 2, time: "10:30", patient: "Mohamed Ali", type: "Initial Consultation", status: "in-progress", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
    { id: 3, time: "11:45", patient: "Fatima Khaled", type: "Heart Checkup", status: "upcoming", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face" },
    { id: 4, time: "14:00", patient: "Omar Nasser", type: "ECG Review", status: "upcoming", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
];

const quickActions = [
    { title: "Start Video Call", description: "Connect with your next patient via HD video", icon: Icons.video },
    { title: "View Schedule", description: "Manage appointments and availability", icon: Icons.calendarDays },
    { title: "Patient Records", description: "Access medical records securely", icon: Icons.document },
    { title: "Messages", description: "Chat with patients in real-time", icon: Icons.chat },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function Doctor2Dashboard() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className="relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="dashboard-sparkles"
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
            <main className="relative z-0 p-8">
                {/* Greeting Section */}
                <section className="mb-8">
                    <h2 className={cn("text-3xl font-bold mb-2 flex items-center gap-3", isDark ? "text-white" : "text-slate-900")}>
                        {new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening"}, Dr. Hassan
                        <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                        </svg>
                    </h2>
                    <p className={cn("text-lg", isDark ? "text-gray-400" : "text-gray-600")}>
                        Here&apos;s what&apos;s happening with your patients today.
                    </p>
                </section>

                {/* Stats Row */}
                <section className="mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Today's Appointments", value: 5, icon: Icons.calendar },
                            { label: "Completed", value: 2, icon: Icons.check },
                            { label: "Revenue Today", value: 2400, suffix: " EGP", icon: Icons.money },
                            { label: "Rating", value: 4.9, suffix: "/5", icon: Icons.star },
                        ].map((stat, idx) => (
                            <GlowingCard key={idx} glowColor="teal" className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                        {stat.icon}
                                    </div>
                                    <Badge variant="primary">Today</Badge>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className={cn("text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                        <AnimatedNumber value={stat.value} />
                                    </span>
                                    {stat.suffix && <span className={cn("text-lg", isDark ? "text-gray-400" : "text-gray-500")}>{stat.suffix}</span>}
                                </div>
                                <p className={cn("text-sm mt-1", isDark ? "text-gray-500" : "text-gray-600")}>{stat.label}</p>
                            </GlowingCard>
                        ))}
                    </div>
                </section>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                    {/* Appointments */}
                    <div className="xl:col-span-2">
                        <GlowingCard glowColor="teal" className="p-6">
                            <SectionHeader
                                title="Today's Appointments"
                                subtitle={`${appointments.length} scheduled`}
                                isDark={isDark}
                                action={
                                    <button className="text-teal-500 hover:text-teal-400 text-sm font-medium transition-colors">
                                        View All →
                                    </button>
                                }
                            />

                            <div className="space-y-3">
                                {appointments.map((apt, idx) => (
                                    <motion.div
                                        key={apt.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.01]",
                                            apt.status === "in-progress"
                                                ? "bg-teal-500/5 border-teal-500/30"
                                                : apt.status === "completed"
                                                    ? "bg-teal-500/5 border-teal-500/10"
                                                    : isDark
                                                        ? "bg-white/[0.02] border-white/5 hover:border-teal-500/20"
                                                        : "bg-gray-50 border-gray-200 hover:border-teal-500/30"
                                        )}
                                    >
                                        <div className="text-center min-w-[50px]">
                                            <span className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>{apt.time}</span>
                                        </div>
                                        <div className={cn("w-px h-10", isDark ? "bg-white/10" : "bg-gray-200")} />
                                        <Avatar src={apt.image} alt={apt.patient} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("font-medium truncate", isDark ? "text-white" : "text-slate-900")}>{apt.patient}</p>
                                            <p className={cn("text-sm truncate", isDark ? "text-gray-500" : "text-gray-600")}>{apt.type}</p>
                                        </div>
                                        <Badge variant={apt.status === "in-progress" ? "warning" : apt.status === "completed" ? "success" : "primary"}>
                                            {apt.status === "in-progress" ? "In Progress" : apt.status === "completed" ? "Done" : "Upcoming"}
                                        </Badge>
                                        {apt.status === "upcoming" && (
                                            <button className="p-2 rounded-lg bg-teal-500/10 hover:bg-teal-500 text-teal-500 hover:text-white transition-all">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </GlowingCard>
                    </div>

                    {/* Performance + Patients */}
                    <div className="space-y-6">
                        {/* Performance */}
                        <GlowingCard glowColor="teal" className="p-6">
                            <SectionHeader title="Weekly Performance" isDark={isDark} />
                            <div className="space-y-5">
                                {[
                                    { label: "Consultations", current: 45, max: 60 },
                                    { label: "Patient Satisfaction", current: 92, max: 100 },
                                    { label: "Response Rate", current: 78, max: 100 },
                                ].map((metric, idx) => {
                                    const percentage = Math.round((metric.current / metric.max) * 100);
                                    return (
                                        <div key={idx}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{metric.label}</span>
                                                <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{percentage}%</span>
                                            </div>
                                            <ProgressBar value={metric.current} max={metric.max} isDark={isDark} />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Online Status */}
                            <div className={cn("mt-6 pt-5 border-t", isDark ? "border-white/5" : "border-gray-200")}>
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500" />
                                    </span>
                                    <div>
                                        <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>You&apos;re Online</p>
                                        <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-600")}>Available for consultations</p>
                                    </div>
                                </div>
                            </div>
                        </GlowingCard>

                        {/* Today's Patients */}
                        <GlowingCard glowColor="teal" className="p-6">
                            <SectionHeader
                                title="Today's Patients"
                                subtitle="5 scheduled"
                                isDark={isDark}
                            />
                            <div className="flex justify-center">
                                <AnimatedTooltip items={patients} />
                            </div>
                            <p className={cn("text-center text-sm mt-4", isDark ? "text-gray-500" : "text-gray-600")}>Hover to see details</p>
                        </GlowingCard>
                    </div>
                </div>

                {/* Quick Actions */}
                <section>
                    <SectionHeader title="Quick Actions" subtitle="Manage your practice" isDark={isDark} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -4 }}
                                className={cn(
                                    "p-5 border rounded-2xl cursor-pointer hover:border-teal-500/30 hover:bg-teal-500/5 transition-all group",
                                    isDark
                                        ? "bg-slate-900/50 border-white/5"
                                        : "bg-white border-gray-200 shadow-sm"
                                )}
                            >
                                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 mb-4 group-hover:bg-teal-500 group-hover:text-white transition-all">
                                    {action.icon}
                                </div>
                                <h3 className={cn("font-semibold mb-1 group-hover:text-teal-500 transition-colors", isDark ? "text-white" : "text-slate-900")}>{action.title}</h3>
                                <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-600")}>{action.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
