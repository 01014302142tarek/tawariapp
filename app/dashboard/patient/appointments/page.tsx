"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../context/useThemeStyles";
import { GlowingCard } from "@/components/ui/glowing-card";

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

// Mock Data
const appointments = [
    { id: 1, date: "2024-12-14", time: "2:30 PM", doctor: "Dr. Ahmed Hassan", specialty: "Cardiologist", type: "Follow-up", status: "upcoming", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
    { id: 2, date: "2024-12-18", time: "10:00 AM", doctor: "Dr. Fatima Khaled", specialty: "General Practitioner", type: "Check-up", status: "upcoming", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" },
    { id: 3, date: "2024-12-10", time: "3:00 PM", doctor: "Dr. Ahmed Hassan", specialty: "Cardiologist", type: "ECG Review", status: "completed", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
    { id: 4, date: "2024-12-05", time: "11:00 AM", doctor: "Dr. Omar Nasser", specialty: "Dermatologist", type: "Consultation", status: "completed", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face" },
];

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
    const [activeFilter, setActiveFilter] = useState("All");
    const { isDark, textPrimary, textMuted } = useThemeStyles();

    const filters = ["All", "Upcoming", "Completed"];

    const filteredAppointments = appointments.filter(apt => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Upcoming") return apt.status === "upcoming";
        if (activeFilter === "Completed") return apt.status === "completed";
        return true;
    });

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className={cn("text-2xl font-bold flex items-center gap-3", textPrimary)}>
                        <span className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.calendar}
                        </span>
                        My Appointments
                    </h1>
                    <p className={cn("mt-1", textMuted)}>View and manage your appointments</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-teal-500/20">
                    {Icons.plus}
                    <span>Book Appointment</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            activeFilter === filter
                                ? "bg-teal-500 text-white"
                                : isDark
                                    ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Appointments List */}
            <div className="grid gap-4">
                {filteredAppointments.map((apt, idx) => (
                    <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <GlowingCard glowColor="teal" className="p-5" isDark={isDark}>
                            <div className="flex items-center gap-4">
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-teal-500/30">
                                    <Image src={apt.image} alt={apt.doctor} fill className="object-cover" unoptimized />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className={cn("font-semibold", textPrimary)}>{apt.doctor}</h3>
                                        <Badge variant={apt.status === "upcoming" ? "primary" : "success"}>
                                            {apt.status === "upcoming" ? "Upcoming" : "Completed"}
                                        </Badge>
                                    </div>
                                    <p className={cn("text-sm", textMuted)}>{apt.specialty} • {apt.type}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className={cn("text-sm flex items-center gap-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                            {apt.date}
                                        </span>
                                        <span className={cn("text-sm flex items-center gap-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {apt.time}
                                        </span>
                                    </div>
                                </div>
                                {apt.status === "upcoming" && (
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-lg bg-teal-500/10 hover:bg-teal-500 text-teal-500 hover:text-white transition-all">
                                            {Icons.video}
                                        </button>
                                        <button className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                        )}>
                                            Reschedule
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
