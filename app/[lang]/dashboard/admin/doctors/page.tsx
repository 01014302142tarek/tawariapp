"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { SparklesCore } from "@/components/ui/sparkles";
import { AnimatedNumber } from "@/components/ui/animated-number";

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
};

// Mock doctor data
const doctors = [
    { id: 1, name: "Dr. Ahmed Hassan", specialty: "Cardiologist", patients: 156, rating: 4.9, status: "active", revenue: 45600, consultations: 234, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
    { id: 2, name: "Dr. Sarah Ahmed", specialty: "Dermatologist", patients: 89, rating: 4.8, status: "pending", revenue: 0, consultations: 0, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" },
    { id: 3, name: "Dr. Omar Khalil", specialty: "Neurologist", patients: 203, rating: 4.7, status: "active", revenue: 67800, consultations: 312, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
    { id: 4, name: "Dr. Fatima Hassan", specialty: "Pediatrician", patients: 312, rating: 4.9, status: "active", revenue: 89200, consultations: 456, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face" },
    { id: 5, name: "Dr. Mohamed Nasser", specialty: "Orthopedic", patients: 178, rating: 4.6, status: "inactive", revenue: 34500, consultations: 189, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
    { id: 6, name: "Dr. Layla Mahmoud", specialty: "Psychiatrist", patients: 134, rating: 4.8, status: "active", revenue: 52300, consultations: 276, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
];

const Badge = ({ variant, children }: { variant: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        pending: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        inactive: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant])}>
            {children}
        </span>
    );
};

export default function DoctorsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const filteredDoctors = doctors.filter(doc => {
        const matchesFilter = filter === "all" || doc.status === filter;
        const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = [
        { label: "Total Doctors", value: 89, icon: Icons.doctor, color: "teal" },
        { label: "Active", value: 76, icon: Icons.check, color: "emerald" },
        { label: "Pending", value: 8, icon: Icons.clock, color: "orange" },
        { label: "Revenue", value: 237, suffix: "K", icon: Icons.money, color: "amber" },
    ];

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
                        <h1 className={cn("text-xl md:text-2xl lg:text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>Doctor Management</h1>
                        <p className={cn("text-sm md:text-base lg:text-lg mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            Manage doctor accounts and approvals
                        </p>
                    </div>
                    <button className="px-4 md:px-5 py-2 md:py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2 self-start text-sm md:text-base">
                        {Icons.plus}
                        Add Doctor
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
                                    <div className="flex items-baseline gap-0.5">
                                        <p className={cn("text-lg md:text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                            <AnimatedNumber value={stat.value} />
                                        </p>
                                        {stat.suffix && <span className={cn("text-sm md:text-lg", isDark ? "text-gray-400" : "text-gray-500")}>{stat.suffix}</span>}
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
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{Icons.search}</div>
                            <input
                                type="text"
                                placeholder="Search doctors by name or specialty..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={cn(
                                    "w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-colors",
                                    isDark
                                        ? "bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50"
                                        : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500"
                                )}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {["all", "active", "pending", "inactive"].map((f) => (
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
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </GlowingCard>

                {/* Doctors - Bento Grid Layout */}
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
                                            <Image src={doctor.image} alt={doctor.name} fill className="object-cover" unoptimized />
                                        </div>
                                        <div>
                                            <h3 className={cn("font-semibold text-sm md:text-lg", isDark ? "text-white" : "text-slate-900")}>{doctor.name}</h3>
                                            <p className={cn("text-xs md:text-sm", isDark ? "text-gray-500" : "text-gray-600")}>{doctor.specialty}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-teal-500">{Icons.star}</span>
                                                <span className={cn("text-xs md:text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{doctor.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={doctor.status}>{doctor.status}</Badge>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-5">
                                    <div className={cn("p-2 md:p-3 rounded-lg md:rounded-xl text-center", isDark ? "bg-white/[0.03]" : "bg-gray-50")}>
                                        <p className={cn("text-sm md:text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>{doctor.patients}</p>
                                        <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>Patients</p>
                                    </div>
                                    <div className={cn("p-2 md:p-3 rounded-lg md:rounded-xl text-center", isDark ? "bg-white/[0.03]" : "bg-gray-50")}>
                                        <p className={cn("text-sm md:text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>{doctor.consultations}</p>
                                        <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>Consults</p>
                                    </div>
                                    <div className={cn("p-2 md:p-3 rounded-lg md:rounded-xl text-center", isDark ? "bg-white/[0.03]" : "bg-gray-50")}>
                                        <p className={cn("text-sm md:text-lg font-bold text-emerald-500")}>{(doctor.revenue / 1000).toFixed(0)}K</p>
                                        <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>Revenue</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button className={cn(
                                        "flex-1 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-colors",
                                        isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    )}>
                                        View Profile
                                    </button>
                                    {doctor.status === "pending" && (
                                        <button className="px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium bg-teal-500 hover:bg-teal-600 text-white transition-colors">
                                            Approve
                                        </button>
                                    )}
                                </div>
                            </GlowingCard>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
