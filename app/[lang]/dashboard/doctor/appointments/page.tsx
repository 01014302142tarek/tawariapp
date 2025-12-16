"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useThemeStyles } from "../context/useThemeStyles";

import { useI18n } from "@/app/i18n";

// Mock Data removed from here


// Icons
const Icons = {
    calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    search: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    video: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    clock: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

// Badge Component
const Badge = ({ children, variant = "default", isDark = true, className }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "primary"; isDark?: boolean; className?: string }) => {
    const variants = {
        default: isDark ? "bg-slate-700/50 text-slate-300" : "bg-gray-200 text-gray-700",
        success: "bg-teal-500/10 text-teal-500 border border-teal-500/20",
        warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        primary: "bg-teal-500/10 text-teal-500 border border-teal-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant], className)}>
            {children}
        </span>
    );
};

export default function AppointmentsPage() {
    const { t, isRTL, formatNumber } = useI18n();
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const { isDark, textPrimary, textSecondary, textMuted, inputBg, inputFocus, buttonSecondary, divider, cardHover, emptyStateBg } = useThemeStyles();

    // Mock Data with Translations
    const appointments = [
        { id: 1, date: "2024-12-14", time: isRTL ? "٠٩:٠٠ ص" : "09:00", patient: t.common.demoNames.sarahJohnson, type: t.doctorDashboard.appointmentsPage.types.followUp, status: "completed", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
        { id: 2, date: "2024-12-14", time: isRTL ? "١٠:٣٠ ص" : "10:30", patient: t.common.demoNames.mohamedAli, type: t.doctorDashboard.appointmentsPage.types.initialConsultation, status: "in-progress", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
        { id: 3, date: "2024-12-14", time: isRTL ? "١١:٤٥ ص" : "11:45", patient: t.common.demoNames.fatimaKhaled, type: t.doctorDashboard.appointmentsPage.types.heartCheckup, status: "upcoming", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face" },
        { id: 4, date: "2024-12-14", time: isRTL ? "٠٢:٠٠ م" : "14:00", patient: t.common.demoNames.omarNasser, type: t.doctorDashboard.appointmentsPage.types.ecgReview, status: "upcoming", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
        { id: 5, date: "2024-12-14", time: isRTL ? "٠٣:٣٠ م" : "15:30", patient: t.common.demoNames.laylaAhmed, type: t.doctorDashboard.appointmentsPage.types.bloodPressureCheck, status: "upcoming", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
        { id: 6, date: "2024-12-15", time: isRTL ? "٠٩:٠٠ ص" : "09:00", patient: t.common.demoNames.ahmedHassan, type: t.doctorDashboard.appointmentsPage.types.annualCheckup, status: "scheduled", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
        { id: 7, date: "2024-12-15", time: isRTL ? "١٠:٠٠ ص" : "10:00", patient: t.common.demoNames.nourIbrahim, type: t.doctorDashboard.appointmentsPage.types.consultation, status: "scheduled", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
    ];

    const filters = [
        { id: "all", label: t.doctorDashboard.appointmentsPage.filters.all },
        { id: "upcoming", label: t.doctorDashboard.appointmentsPage.filters.upcoming },
        { id: "completed", label: t.doctorDashboard.appointmentsPage.filters.completed },
        { id: "cancelled", label: t.doctorDashboard.appointmentsPage.filters.cancelled }
    ];

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "in-progress": return t.doctorDashboard.appointmentsPage.status.inProgress;
            case "completed": return t.doctorDashboard.appointmentsPage.status.done;
            case "upcoming": return t.doctorDashboard.appointmentsPage.status.upcoming;
            case "scheduled": return t.doctorDashboard.appointmentsPage.status.scheduled;
            default: return status;
        }
    };


    const filteredAppointments = appointments.filter((apt) => {
        const matchesFilter = activeFilter === "all" ||
            (activeFilter === "upcoming" && (apt.status === "upcoming" || apt.status === "scheduled")) ||
            (activeFilter === "completed" && apt.status === "completed") ||
            (activeFilter === "cancelled" && apt.status === "cancelled");
        const matchesSearch = apt.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.type.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const todayAppointments = filteredAppointments.filter(apt => apt.date === "2024-12-14");
    const upcomingAppointments = filteredAppointments.filter(apt => apt.date !== "2024-12-14");

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                        <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.calendar}
                        </span>
                        {t.doctorDashboard.appointmentsPage.title}
                    </h1>
                    <p className={cn("text-sm md:text-base mt-1", textMuted)}>{t.doctorDashboard.appointmentsPage.subtitle}</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold py-2 md:py-2.5 px-4 md:px-5 rounded-xl transition-all shadow-lg shadow-teal-500/20 text-sm md:text-base">
                    {Icons.plus}
                    <span>{t.doctorDashboard.appointmentsPage.newAppointment}</span>
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-3 mb-6 md:mb-8">
                {/* Search */}
                <div className="relative flex-1 md:max-w-md lg:max-w-lg">
                    <span className={cn("absolute top-1/2 -translate-y-1/2", isRTL ? "right-4" : "left-4", textMuted)}>
                        {Icons.search}
                    </span>
                    <input
                        type="text"
                        placeholder={t.doctorDashboard.appointmentsPage.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full py-3 rounded-xl border transition-colors outline-none ring-0 focus:ring-2 focus:ring-teal-500/20",
                            isRTL ? "pr-12 pl-4" : "pl-12 pr-4",
                            inputBg, inputFocus
                        )}
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 no-scrollbar">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap border",
                                activeFilter === filter.id
                                    ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20"
                                    : cn("border-transparent hover:border-teal-500/30", buttonSecondary)
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Today's Appointments */}
            {todayAppointments.length > 0 && (
                <section className="mb-6 md:mb-8">
                    <h2 className={cn("text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2", textPrimary)}>
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        {t.doctorDashboard.appointmentsPage.sections.today}
                    </h2>
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold tracking-wider uppercase opacity-60">
                        <div className="col-span-2">{t.doctorDashboard.appointmentsPage.tableHeaders.time}</div>
                        <div className="col-span-4">{t.doctorDashboard.appointmentsPage.tableHeaders.patient}</div>
                        <div className="col-span-3">{t.doctorDashboard.appointmentsPage.tableHeaders.purpose}</div>
                        <div className={cn("col-span-3", isRTL ? "text-left" : "text-right")}>{t.doctorDashboard.appointmentsPage.tableHeaders.statusActions}</div>
                    </div>
                    <GlowingCard isDark={isDark} glowColor="teal" className="p-0 overflow-hidden">
                        <div className={divider}>
                            {todayAppointments.map((apt, idx) => (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn(
                                        "flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 p-4 transition-colors cursor-pointer items-start md:items-center active:scale-[0.99] md:active:scale-100",
                                        cardHover,
                                        apt.status === "in-progress" && "bg-teal-500/5 relative overflow-hidden"
                                    )}
                                >
                                    {apt.status === "in-progress" && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 md:rounded-l-lg" />
                                    )}

                                    {/* Time Block */}
                                    <div className="md:col-span-2 flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between md:justify-start">
                                        <div className="flex items-center gap-2 cursor-pointer group/time">
                                            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500 group-hover/time:bg-teal-500 group-hover/time:text-white transition-colors">
                                                {Icons.clock}
                                            </div>
                                            <span className={cn("text-base md:text-lg font-bold tracking-tight", textPrimary)}>{apt.time}</span>
                                        </div>
                                        {/* Mobile Status Badge (Hidden on Desktop) */}
                                        <div className="md:hidden">
                                            <Badge isDark={isDark} variant={apt.status === "in-progress" ? "warning" : apt.status === "completed" ? "success" : "primary"}>
                                                {getStatusLabel(apt.status)}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Patient Info */}
                                    <div className="md:col-span-4 flex items-center gap-3 w-full">
                                        <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-teal-500/20 group-hover:border-teal-500/50 transition-colors flex-shrink-0">
                                            <Image src={apt.image} alt={apt.patient} fill className="object-cover" unoptimized />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("font-semibold truncate text-sm md:text-base", textPrimary)}>{apt.patient}</p>
                                            <p className={cn("text-xs md:hidden truncate", textMuted)}>{apt.type}</p>
                                        </div>
                                    </div>

                                    {/* Purpose (Desktop Only) */}
                                    <div className={cn("hidden md:block md:col-span-3 text-sm truncate px-1", textSecondary)}>
                                        {apt.type}
                                    </div>

                                    {/* Actions & Status (Desktop) */}
                                    <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3 w-full border-t md:border-t-0 pt-3 md:pt-0 mt-1 md:mt-0 border-white/5">
                                        <div className="hidden md:block">
                                            <Badge isDark={isDark} variant={apt.status === "in-progress" ? "warning" : apt.status === "completed" ? "success" : "primary"}>
                                                {getStatusLabel(apt.status)}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                            {(apt.status === "upcoming" || apt.status === "in-progress") ? (
                                                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 md:py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-all text-sm font-medium shadow-lg shadow-teal-500/20">
                                                    {Icons.video}
                                                    <span className="md:hidden lg:inline">{t.doctorDashboard.appointmentsPage.actions.join}</span>
                                                </button>
                                            ) : (
                                                <button className={cn("flex-1 md:flex-none px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors", isDark ? "border-white/10 hover:bg-white/5 text-gray-400" : "border-gray-200 hover:bg-gray-50 text-gray-600")}>
                                                    {t.doctorDashboard.appointmentsPage.actions.details}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlowingCard>
                </section>
            )}

            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
                <section>
                    <h2 className={cn("text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2", textPrimary)}>
                        <span className={textMuted}>{Icons.clock}</span>
                        {t.doctorDashboard.appointmentsPage.sections.upcoming}
                    </h2>
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold tracking-wider uppercase opacity-60">
                        <div className="col-span-2">{t.doctorDashboard.appointmentsPage.tableHeaders.dateTime}</div>
                        <div className="col-span-4">{t.doctorDashboard.appointmentsPage.tableHeaders.patient}</div>
                        <div className="col-span-3">{t.doctorDashboard.appointmentsPage.tableHeaders.purpose}</div>
                        <div className={cn("col-span-3", isRTL ? "text-left" : "text-right")}>{t.doctorDashboard.appointmentsPage.tableHeaders.status}</div>
                    </div>
                    <GlowingCard isDark={isDark} glowColor="teal" className="p-0 overflow-hidden">
                        <div className={divider}>
                            {upcomingAppointments.map((apt, idx) => (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn("flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 p-4 transition-colors cursor-pointer items-start md:items-center", cardHover)}
                                >
                                    {/* Date/Time */}
                                    <div className="md:col-span-2 flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                                        <div className="min-w-[70px]">
                                            <p className={cn("text-xs font-medium uppercase tracking-wide", textMuted)}>{formatNumber(apt.date)}</p>
                                            <span className={cn("text-base md:text-lg font-bold tracking-tight", textPrimary)}>{apt.time}</span>
                                        </div>
                                        <div className="md:hidden">
                                            <Badge isDark={isDark} variant="default">{getStatusLabel(apt.status)}</Badge>
                                        </div>
                                    </div>

                                    {/* Patient */}
                                    <div className="md:col-span-4 flex items-center gap-3 w-full">
                                        <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-teal-500/20">
                                            <Image src={apt.image} alt={apt.patient} fill className="object-cover" unoptimized />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("font-medium truncate text-sm md:text-base", textPrimary)}>{apt.patient}</p>
                                            <p className={cn("text-xs md:hidden truncate", textMuted)}>{apt.type}</p>
                                        </div>
                                    </div>

                                    {/* Purpose (Desktop) */}
                                    <div className={cn("hidden md:block md:col-span-3 text-sm truncate px-1", textSecondary)}>
                                        {apt.type}
                                    </div>

                                    {/* Actions/Status */}
                                    <div className="md:col-span-3 flex items-center justify-end w-full md:w-auto gap-3 hidden md:flex">
                                        <Badge isDark={isDark} variant="default">{getStatusLabel(apt.status)}</Badge>
                                        <button className={cn("p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100", isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-slate-900")}>
                                            <div className="rotate-90">...</div>
                                        </button>
                                    </div>

                                    {/* Mobile Actions only */}
                                    <div className="flex md:hidden w-full border-t border-white/5 pt-3 mt-1 justify-end">
                                        <button className={cn("text-xs font-medium", textSecondary)}>{t.doctorDashboard.appointmentsPage.actions.viewDetails}</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlowingCard>
                </section>
            )}

            {/* Empty State */}
            {filteredAppointments.length === 0 && (
                <div className="text-center py-16">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", emptyStateBg, textMuted)}>
                        {Icons.calendar}
                    </div>
                    <h3 className={cn("text-lg font-medium mb-2", textPrimary)}>{t.doctorDashboard.appointmentsPage.emptyState.title}</h3>
                    <p className={textMuted}>{t.doctorDashboard.appointmentsPage.emptyState.subtitle}</p>
                </div>
            )}
        </div>
    );
}
