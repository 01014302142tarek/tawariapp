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

// ============================================
// MOCK DATA
// ============================================

const nextAppointment = {
    doctor: "Dr. Ahmed Hassan",
    specialty: "Cardiologist",
    date: "Today",
    time: "2:30 PM",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    location: "Room 205, Building A",
};

const activePrescriptions = [
    { name: "Lisinopril 10mg", dosage: "1 tablet daily", refillDate: "Dec 28, 2024", status: "active" },
    { name: "Metformin 500mg", dosage: "2 tablets with meals", refillDate: "Jan 5, 2025", status: "active" },
    { name: "Atorvastatin 20mg", dosage: "1 tablet at bedtime", refillDate: "Dec 20, 2024", status: "refill-needed" },
];

const recentActivity = [
    { type: "appointment", title: "Appointment with Dr. Hassan", time: "2 days ago", icon: Icons.calendar },
    { type: "prescription", title: "Prescription refilled - Lisinopril", time: "5 days ago", icon: Icons.prescription },
    { type: "message", title: "Message from Dr. Hassan", time: "1 week ago", icon: Icons.message },
    { type: "record", title: "Lab results uploaded", time: "2 weeks ago", icon: Icons.folder },
];

const quickActions = [
    { title: "Book Appointment", description: "Schedule a visit with your doctor", icon: Icons.calendar },
    { title: "View Prescriptions", description: "Check your active medications", icon: Icons.prescription },
    { title: "Message Doctor", description: "Send a message to your care team", icon: Icons.message },
    { title: "View Records", description: "Access your medical history", icon: Icons.folder },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function PatientDashboard() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const greeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening";

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
            <main className="relative z-0 p-8">
                {/* Greeting Section */}
                <section className="mb-8">
                    <h2 className={cn("text-3xl font-bold mb-2 flex items-center gap-3", isDark ? "text-white" : "text-slate-900")}>
                        {greeting}, Sarah {Icons.hand}
                    </h2>
                    <p className={cn("text-lg", isDark ? "text-gray-400" : "text-gray-600")}>
                        Here&apos;s an overview of your health and upcoming appointments.
                    </p>
                </section>

                {/* Stats Row */}
                <section className="mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Upcoming Appointments", value: 2, icon: Icons.calendar },
                            { label: "Active Prescriptions", value: 3, icon: Icons.prescription },
                            { label: "Unread Messages", value: 2, icon: Icons.message },
                            { label: "Health Score", value: 92, suffix: "%", icon: Icons.heart },
                        ].map((stat, idx) => (
                            <GlowingCard key={idx} glowColor="teal" className="p-5" isDark={isDark}>
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
                    {/* Next Appointment */}
                    <div className="xl:col-span-2">
                        <GlowingCard glowColor="teal" className="p-6" isDark={isDark}>
                            <SectionHeader title="Next Appointment" subtitle="Your upcoming visit" isDark={isDark} />

                            <div className={cn(
                                "p-5 rounded-xl border",
                                isDark ? "bg-teal-500/5 border-teal-500/20" : "bg-teal-50 border-teal-200"
                            )}>
                                <div className="flex items-start gap-4">
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-teal-500/30">
                                        <Image src={nextAppointment.image} alt={nextAppointment.doctor} fill className="object-cover" unoptimized />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                            {nextAppointment.doctor}
                                        </h3>
                                        <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                            {nextAppointment.specialty}
                                        </p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center gap-2 text-teal-500">
                                                {Icons.calendar}
                                                <span className="text-sm font-medium">{nextAppointment.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-teal-500">
                                                {Icons.clock}
                                                <span className="text-sm font-medium">{nextAppointment.time}</span>
                                            </div>
                                        </div>
                                        <p className={cn("text-sm mt-2 flex items-center gap-1", isDark ? "text-gray-500" : "text-gray-600")}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                            {nextAppointment.location}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors">
                                            Join Video Call
                                        </button>
                                        <button className={cn(
                                            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                            isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                        )}>
                                            Reschedule
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Active Prescriptions Preview */}
                            <div className="mt-6">
                                <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-slate-900")}>
                                    Active Prescriptions
                                </h3>
                                <div className="space-y-3">
                                    {activePrescriptions.slice(0, 2).map((rx, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border",
                                                isDark ? "bg-white/[0.02] border-white/5" : "bg-gray-50 border-gray-200"
                                            )}
                                        >
                                            <div>
                                                <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>{rx.name}</p>
                                                <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-600")}>{rx.dosage}</p>
                                            </div>
                                            <Badge variant={rx.status === "refill-needed" ? "warning" : "success"}>
                                                {rx.status === "refill-needed" ? "Refill Soon" : "Active"}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GlowingCard>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <GlowingCard glowColor="teal" className="p-6" isDark={isDark}>
                            <SectionHeader title="Recent Activity" isDark={isDark} />
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
                    <SectionHeader title="Quick Actions" subtitle="What would you like to do?" isDark={isDark} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                    className="p-5 cursor-pointer group h-full"
                                    isDark={isDark}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 mb-4 group-hover:bg-teal-500 group-hover:text-white transition-all">
                                        {action.icon}
                                    </div>
                                    <h3 className={cn("font-semibold mb-1 group-hover:text-teal-500 transition-colors", isDark ? "text-white" : "text-slate-900")}>
                                        {action.title}
                                    </h3>
                                    <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-600")}>
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
