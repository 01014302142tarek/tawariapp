"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../context/useThemeStyles";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useI18n } from "@/app/i18n";

// Icons
const Icons = {
    calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    video: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
};



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

export default function AppointmentsPage() {
    const { t, isRTL, formatNumber, formatDate } = useI18n();
    const [activeFilter, setActiveFilter] = useState("All");
    const { isDark, textPrimary, textMuted } = useThemeStyles();

    // Mock Data
    const appointments = [
        { id: 1, date: "2024-12-14", time: isRTL ? "٠٢:٣٠ م" : "2:30 PM", doctor: "Dr. Ahmed Hassan", specialty: t.specialties.cardiology, type: t.doctorDashboard.appointmentsPage.types.followUp, status: "upcoming", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
        { id: 2, date: "2024-12-18", time: isRTL ? "١٠:٠٠ ص" : "10:00 AM", doctor: "Dr. Fatima Khaled", specialty: t.specialties.general, type: t.doctorDashboard.appointmentsPage.types.generalCheckup, status: "upcoming", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" },
        { id: 3, date: "2024-12-10", time: isRTL ? "٠٣:٠٠ م" : "3:00 PM", doctor: "Dr. Ahmed Hassan", specialty: t.specialties.cardiology, type: t.doctorDashboard.appointmentsPage.types.ecgReview, status: "completed", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
        { id: 4, date: "2024-12-05", time: isRTL ? "١١:٠٠ ص" : "11:00 AM", doctor: "Dr. Omar Nasser", specialty: t.specialties.dermatology, type: t.doctorDashboard.appointmentsPage.types.consultation, status: "completed", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face" },
    ];

    const filters = [
        { key: "All", label: t.patientDashboard.appointmentsPage.filters.all },
        { key: "Upcoming", label: t.patientDashboard.appointmentsPage.filters.upcoming },
        { key: "Completed", label: t.patientDashboard.appointmentsPage.filters.completed },
    ];

    const filteredAppointments = appointments.filter(apt => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Upcoming") return apt.status === "upcoming";
        if (activeFilter === "Completed") return apt.status === "completed";
        return true;
    });

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                        <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                        </span>
                        {t.patientDashboard.appointmentsPage.title}
                    </h1>
                    <p className={cn("mt-1 text-sm md:text-base", textMuted)}>{t.patientDashboard.appointmentsPage.subtitle}</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold py-2 md:py-2.5 px-4 md:px-5 rounded-lg md:rounded-xl transition-all shadow-lg shadow-teal-500/20 text-sm md:text-base">
                    {Icons.plus}
                    <span>{t.patientDashboard.appointmentsPage.bookNew}</span>
                </button>
            </div>

            {/* Filters - Scrollable on mobile */}
            <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide">
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className={cn(
                            "px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
                            activeFilter === filter.key
                                ? "bg-teal-500 text-white"
                                : isDark
                                    ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Appointments List */}
            <div className="grid gap-3 md:gap-4">
                {filteredAppointments.map((apt, idx) => (
                    <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <GlowingCard glowColor="teal" className="p-3 md:p-5" isDark={isDark}>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden border-2 border-teal-500/30 flex-shrink-0">
                                        <Image src={apt.image} alt={apt.doctor} fill className="object-cover" unoptimized />
                                    </div>
                                    <div className="flex-1 sm:hidden">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className={cn("font-semibold text-sm", textPrimary)}>{apt.doctor}</h3>
                                            <Badge variant={apt.status === "upcoming" ? "primary" : "success"}>
                                                {apt.status === "upcoming" ? t.patientDashboard.appointmentsPage.filters.upcoming : t.patientDashboard.appointmentsPage.filters.completed}
                                            </Badge>
                                        </div>
                                        <p className={cn("text-xs", textMuted)}>{apt.specialty}</p>
                                    </div>
                                </div>
                                <div className="flex-1 hidden sm:block">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className={cn("font-semibold", textPrimary)}>{apt.doctor}</h3>
                                        <Badge variant={apt.status === "upcoming" ? "primary" : "success"}>
                                            {apt.status === "upcoming" ? t.patientDashboard.appointmentsPage.filters.upcoming : t.patientDashboard.appointmentsPage.filters.completed}
                                        </Badge>
                                    </div>
                                    <p className={cn("text-sm", textMuted)}>{apt.specialty} • {apt.type}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className={cn("text-sm flex items-center gap-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                            {formatDate(apt.date)}
                                        </span>
                                        <span className={cn("text-sm flex items-center gap-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {isRTL ? apt.time.replace('AM', 'ص').replace('PM', 'م') : formatNumber(apt.time)}
                                        </span>
                                    </div>
                                </div>
                                {/* Mobile: Date/Time + Type row */}
                                <div className="flex items-center justify-between sm:hidden">
                                    <div className="flex items-center gap-3">
                                        <span className={cn("text-xs flex items-center gap-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                            {formatDate(apt.date)}
                                        </span>
                                        <span className={cn("text-xs flex items-center gap-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {isRTL ? apt.time.replace('AM', 'ص').replace('PM', 'م') : formatNumber(apt.time)}
                                        </span>
                                    </div>
                                    <span className={cn("text-xs", textMuted)}>{apt.type}</span>
                                </div>
                                {apt.status === "upcoming" && (
                                    <div className="flex gap-2 sm:flex-shrink-0">
                                        <button className="p-2 rounded-lg bg-teal-500/10 hover:bg-teal-500 text-teal-500 hover:text-white transition-all">
                                            {Icons.video}
                                        </button>
                                        <button className={cn(
                                            "flex-1 sm:flex-initial px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors",
                                            isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                        )}>
                                            {t.patientDashboard.appointmentsPage.reschedule}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </GlowingCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
