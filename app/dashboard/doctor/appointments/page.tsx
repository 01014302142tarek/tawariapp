"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useThemeStyles } from "../context/useThemeStyles";

// Mock Data
const appointments = [
    { id: 1, date: "2024-12-14", time: "09:00", patient: "Sarah Johnson", type: "Follow-up", status: "completed", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
    { id: 2, date: "2024-12-14", time: "10:30", patient: "Mohamed Ali", type: "Initial Consultation", status: "in-progress", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
    { id: 3, date: "2024-12-14", time: "11:45", patient: "Fatima Khaled", type: "Heart Checkup", status: "upcoming", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face" },
    { id: 4, date: "2024-12-14", time: "14:00", patient: "Omar Nasser", type: "ECG Review", status: "upcoming", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
    { id: 5, date: "2024-12-14", time: "15:30", patient: "Layla Ahmed", type: "Blood Pressure Check", status: "upcoming", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
    { id: 6, date: "2024-12-15", time: "09:00", patient: "Ahmed Hassan", type: "Annual Checkup", status: "scheduled", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
    { id: 7, date: "2024-12-15", time: "10:00", patient: "Nour Ibrahim", type: "Consultation", status: "scheduled", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
];

const filters = ["All", "Upcoming", "Completed", "Cancelled"];

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
const Badge = ({ children, variant = "default", isDark = true }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "primary"; isDark?: boolean }) => {
    const variants = {
        default: isDark ? "bg-slate-700/50 text-slate-300" : "bg-gray-200 text-gray-700",
        success: "bg-teal-500/10 text-teal-500 border border-teal-500/20",
        warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        primary: "bg-teal-500/10 text-teal-500 border border-teal-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant])}>
            {children}
        </span>
    );
};

export default function AppointmentsPage() {
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const { isDark, pageBg, textPrimary, textSecondary, textMuted, inputBg, inputFocus, buttonSecondary, buttonSecondaryActive, divider, cardHover, emptyStateBg } = useThemeStyles();

    const filteredAppointments = appointments.filter((apt) => {
        const matchesFilter = activeFilter === "All" ||
            (activeFilter === "Upcoming" && (apt.status === "upcoming" || apt.status === "scheduled")) ||
            (activeFilter === "Completed" && apt.status === "completed") ||
            (activeFilter === "Cancelled" && apt.status === "cancelled");
        const matchesSearch = apt.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.type.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const todayAppointments = filteredAppointments.filter(apt => apt.date === "2024-12-14");
    const upcomingAppointments = filteredAppointments.filter(apt => apt.date !== "2024-12-14");

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className={cn("text-2xl font-bold flex items-center gap-3", textPrimary)}>
                        <span className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.calendar}
                        </span>
                        Appointments
                    </h1>
                    <p className={cn("mt-1", textMuted)}>Manage your patient appointments</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-teal-500/20">
                    {Icons.plus}
                    <span>New Appointment</span>
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <span className={cn("absolute left-4 top-1/2 -translate-y-1/2", textMuted)}>
                        {Icons.search}
                    </span>
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn("w-full pl-12 pr-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                activeFilter === filter ? buttonSecondaryActive : buttonSecondary
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Today's Appointments */}
            {todayAppointments.length > 0 && (
                <section className="mb-8">
                    <h2 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", textPrimary)}>
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        Today
                    </h2>
                    <GlowingCard glowColor="teal" className="p-0 overflow-hidden">
                        <div className={divider}>
                            {todayAppointments.map((apt, idx) => (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn(
                                        "flex items-center gap-4 p-4 transition-colors cursor-pointer",
                                        cardHover,
                                        apt.status === "in-progress" && "bg-teal-500/5"
                                    )}
                                >
                                    <div className="text-center min-w-[60px]">
                                        <span className={cn("text-lg font-bold", textPrimary)}>{apt.time}</span>
                                    </div>
                                    <div className={cn("w-px h-10", isDark ? "bg-white/10" : "bg-gray-200")} />
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-teal-500/30">
                                        <Image src={apt.image} alt={apt.patient} fill className="object-cover" unoptimized />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("font-medium truncate", textPrimary)}>{apt.patient}</p>
                                        <p className={cn("text-sm truncate", textMuted)}>{apt.type}</p>
                                    </div>
                                    <Badge isDark={isDark} variant={apt.status === "in-progress" ? "warning" : apt.status === "completed" ? "success" : "primary"}>
                                        {apt.status === "in-progress" ? "In Progress" : apt.status === "completed" ? "Done" : "Upcoming"}
                                    </Badge>
                                    {(apt.status === "upcoming" || apt.status === "in-progress") && (
                                        <button className="p-2 rounded-lg bg-teal-500/10 hover:bg-teal-500 text-teal-500 hover:text-white transition-all">
                                            {Icons.video}
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </GlowingCard>
                </section>
            )}

            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
                <section>
                    <h2 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", textPrimary)}>
                        <span className={textMuted}>{Icons.clock}</span>
                        Upcoming
                    </h2>
                    <GlowingCard glowColor="teal" className="p-0 overflow-hidden">
                        <div className={divider}>
                            {upcomingAppointments.map((apt, idx) => (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn("flex items-center gap-4 p-4 transition-colors cursor-pointer", cardHover)}
                                >
                                    <div className="text-center min-w-[80px]">
                                        <p className={cn("text-xs", textMuted)}>{apt.date}</p>
                                        <span className={cn("text-lg font-bold", textPrimary)}>{apt.time}</span>
                                    </div>
                                    <div className={cn("w-px h-10", isDark ? "bg-white/10" : "bg-gray-200")} />
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-teal-500/30">
                                        <Image src={apt.image} alt={apt.patient} fill className="object-cover" unoptimized />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("font-medium truncate", textPrimary)}>{apt.patient}</p>
                                        <p className={cn("text-sm truncate", textMuted)}>{apt.type}</p>
                                    </div>
                                    <Badge isDark={isDark} variant="default">Scheduled</Badge>
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
                    <h3 className={cn("text-lg font-medium mb-2", textPrimary)}>No appointments found</h3>
                    <p className={textMuted}>Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}
