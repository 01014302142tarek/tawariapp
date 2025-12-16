"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { SparklesCore } from "@/components/ui/sparkles";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useI18n } from "@/app/i18n";

// Icons
const Icons = {
    patient: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    ),
    check: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    sparkle: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    ),
    calendar: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    search: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    folder: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
    ),
};

// Mock patient data


const Badge = ({ variant, children }: { variant: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        inactive: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant])}>
            {children}
        </span>
    );
};

export default function PatientsPage() {
    const { t, isRTL, formatNumber, formatDate } = useI18n();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    // Mock patient data
    const patients = [
        { id: 1, name: t.common.demoNames.sarahJohnson, email: "sarah.j@email.com", age: 34, lastVisit: "Dec 12, 2024", doctor: t.common.demoNames.drAhmedHassan, status: "active", appointments: 12, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
        { id: 2, name: t.common.demoNames.mohamedAli, email: "mohamed.ali@email.com", age: 45, lastVisit: "Dec 10, 2024", doctor: t.common.demoNames.drOmarKhalil, status: "active", appointments: 8, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
        { id: 3, name: t.common.demoNames.laylaAhmed, email: "layla.a@email.com", age: 28, lastVisit: "Dec 8, 2024", doctor: isRTL ? "د. فاطمة حسن" : "Dr. Fatima Hassan", status: "active", appointments: 5, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
        { id: 4, name: t.common.demoNames.omarNasser, email: "omar.n@email.com", age: 52, lastVisit: "Nov 28, 2024", doctor: t.common.demoNames.drAhmedHassan, status: "inactive", appointments: 15, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
        { id: 5, name: t.common.demoNames.fatimaKhaled, email: "fatima.k@email.com", age: 38, lastVisit: "Dec 14, 2024", doctor: isRTL ? "د. سارة أحمد" : "Dr. Sarah Ahmed", status: "active", appointments: 3, image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face" },
        { id: 6, name: t.common.demoNames.ahmedHassan, email: "ahmed.m@email.com", age: 41, lastVisit: "Dec 11, 2024", doctor: t.common.demoNames.drOmarKhalil, status: "active", appointments: 9, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
    ];

    const filteredPatients = patients.filter(patient => {
        const matchesFilter = filter === "all" || patient.status === filter;
        const matchesSearch = patient.name.toLowerCase().includes(search.toLowerCase()) ||
            patient.email.toLowerCase().includes(search.toLowerCase()) ||
            patient.doctor.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = [
        { label: t.adminDashboard.patientsPage.stats.totalPatients, value: 1158, icon: Icons.patient, color: "teal" },
        { label: t.adminDashboard.patientsPage.stats.active, value: 1089, icon: Icons.check, color: "emerald" },
        { label: t.adminDashboard.patientsPage.stats.newThisMonth, value: 47, icon: Icons.sparkle, color: "blue" },
        { label: t.adminDashboard.patientsPage.stats.avgAppointments, value: 8.5, icon: Icons.calendar, color: "amber" },
    ];

    const getFilterLabel = (key: string) => {
        return t.adminDashboard.patientsPage.filters[key as keyof typeof t.adminDashboard.patientsPage.filters] || key;
    };

    return (
        <div className="relative overflow-hidden min-h-screen">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="patients-sparkles"
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
                        <h1 className={cn("text-xl md:text-2xl lg:text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.patientsPage.title}</h1>
                        <p className={cn("text-sm md:text-base lg:text-lg mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            {t.adminDashboard.patientsPage.subtitle}
                        </p>
                    </div>
                    <button className="px-4 md:px-5 py-2 md:py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2 self-start text-sm md:text-base">
                        {Icons.plus}
                        {t.adminDashboard.patientsPage.addPatient}
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    {stats.map((stat, idx) => (
                        <GlowingCard key={idx} glowColor="teal" className="p-3 md:p-4" isDark={isDark}>
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center bg-teal-500/10 text-teal-500">
                                    <span className="[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">
                                        {stat.icon}
                                    </span>
                                </div>
                                <div>
                                    <p className={cn("text-lg md:text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                        <AnimatedNumber value={stat.value} format={formatNumber} />
                                    </p>
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
                                placeholder={t.adminDashboard.patientsPage.searchPlaceholder}
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
                            {["all", "active", "inactive"].map((f) => (
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

                {/* Patients - Horizontal List Layout */}
                <div className="space-y-4">
                    {filteredPatients.map((patient, idx) => (
                        <motion.div
                            key={patient.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <GlowingCard glowColor="teal" className="p-3 md:p-5" isDark={isDark}>
                                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                                    {/* Patient Info */}
                                    <div className="flex items-center gap-3 md:gap-4 flex-1">
                                        <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden border-2 border-teal-500/30 flex-shrink-0">
                                            <Image src={patient.image} alt={patient.name} fill className="object-cover" unoptimized />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                                                <h3 className={cn("font-semibold text-sm md:text-base", isDark ? "text-white" : "text-slate-900")}>{patient.name}</h3>
                                                <Badge variant={patient.status}>{getFilterLabel(patient.status)}</Badge>
                                            </div>
                                            <p className={cn("text-xs md:text-sm truncate", isDark ? "text-gray-500" : "text-gray-600")}>{patient.email}</p>
                                        </div>
                                    </div>

                                    {/* Patient Details */}
                                    <div className="flex flex-wrap items-center gap-4 md:gap-6 lg:gap-8">
                                        <div className="text-center">
                                            <p className={cn("text-sm md:text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>{formatNumber(patient.age)}</p>
                                            <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>{t.adminDashboard.patientsPage.card.age}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className={cn("text-sm md:text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>{formatNumber(patient.appointments)}</p>
                                            <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>{t.adminDashboard.patientsPage.card.visits}</p>
                                        </div>
                                        <div className="hidden lg:block">
                                            <p className={cn("text-xs md:text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{patient.doctor}</p>
                                            <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>{t.adminDashboard.patientsPage.card.primaryDoctor}</p>
                                        </div>
                                        <div className="hidden lg:block">
                                            <p className={cn("text-xs md:text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{formatDate(patient.lastVisit)}</p>
                                            <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>{t.adminDashboard.patientsPage.card.lastVisit}</p>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <button className={cn(
                                        "px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 md:gap-2",
                                        isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    )}>
                                        {Icons.folder}
                                        {t.adminDashboard.patientsPage.card.viewRecords}
                                    </button>
                                </div>
                            </GlowingCard>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
