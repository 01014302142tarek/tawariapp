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
    users: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    doctor: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
    ),
    patient: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    ),
    admin: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
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
    edit: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
    ),
    trash: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
};

// Mock user data


const Badge = ({ variant, children }: { variant: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        pending: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        inactive: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
        Doctor: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
        Patient: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        Admin: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant])}>
            {children}
        </span>
    );
};

export default function UsersPage() {
    const { t, isRTL, formatNumber, formatDate } = useI18n();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    // Mock user data
    const users = [
        { id: 1, name: t.common.demoNames.drAhmedHassan, email: "ahmed.hassan@email.com", role: t.common.roles.doctor, status: "active", joinDate: "Dec 1, 2024", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
        { id: 2, name: t.common.demoNames.sarahJohnson, email: "sarah.j@email.com", role: t.common.roles.patient, status: "active", joinDate: "Nov 28, 2024", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
        { id: 3, name: t.common.demoNames.drFatimaKhaled, email: "fatima.k@email.com", role: t.common.roles.doctor, status: "pending", joinDate: "Dec 10, 2024", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" },
        { id: 4, name: t.common.demoNames.mohamedAli, email: "mohamed.ali@email.com", role: t.common.roles.patient, status: "active", joinDate: "Nov 15, 2024", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
        { id: 5, name: t.common.demoNames.drOmarNasser, email: "omar.n@email.com", role: t.common.roles.doctor, status: "inactive", joinDate: "Oct 20, 2024", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
        { id: 6, name: t.common.demoNames.laylaAhmed, email: "layla.a@email.com", role: t.common.roles.patient, status: "active", joinDate: "Dec 5, 2024", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
    ];

    const filteredUsers = users.filter(user => {
        const matchesFilter = filter === "all" || user.role.toLowerCase() === filter || user.status === filter;
        const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = [
        { label: t.adminDashboard.usersPage.stats.totalUsers, value: 1247, icon: Icons.users, color: "teal" },
        { label: t.adminDashboard.usersPage.stats.doctors, value: 89, icon: Icons.doctor, color: "emerald" },
        { label: t.adminDashboard.usersPage.stats.patients, value: 1153, icon: Icons.patient, color: "blue" },
        { label: t.adminDashboard.usersPage.stats.admins, value: 5, icon: Icons.admin, color: "amber" },
    ];

    const getFilterLabel = (key: string) => {
        return t.adminDashboard.usersPage.filters[key as keyof typeof t.adminDashboard.usersPage.filters] || key;
    };

    return (
        <div className="relative overflow-hidden min-h-screen">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="users-sparkles"
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
                {/* Header with Stats */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className={cn("text-xl md:text-2xl lg:text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.usersPage.title}</h1>
                        <p className={cn("text-sm md:text-base lg:text-lg mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            {t.adminDashboard.usersPage.subtitle}
                        </p>
                    </div>
                    <button className="px-4 md:px-5 py-2 md:py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2 self-start text-sm md:text-base">
                        {Icons.plus}
                        {t.adminDashboard.usersPage.addUser}
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
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                        <div className="flex-1 relative">
                            <div className={cn("absolute top-1/2 -translate-y-1/2 text-gray-500", isRTL ? "right-3" : "left-3")}>{Icons.search}</div>
                            <input
                                type="text"
                                placeholder={t.adminDashboard.usersPage.searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={cn(
                                    "w-full py-2 md:py-2.5 rounded-xl border outline-none transition-colors text-sm md:text-base",
                                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
                                    isDark
                                        ? "bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50"
                                        : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500"
                                )}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap overflow-x-auto">
                            {["all", "doctor", "patient", "admin", "active", "pending", "inactive"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-3 md:px-4 py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-colors capitalize whitespace-nowrap",
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

                {/* Users Grid - Card Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                    {filteredUsers.map((user, idx) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <GlowingCard glowColor="teal" className="p-3 md:p-5" isDark={isDark}>
                                <div className="flex items-start justify-between mb-3 md:mb-4">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden border-2 border-teal-500/30">
                                            <Image src={user.image} alt={user.name} fill className="object-cover" unoptimized />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={cn("font-semibold text-sm md:text-base truncate", isDark ? "text-white" : "text-slate-900")}>{user.name}</p>
                                            <p className={cn("text-xs md:text-sm truncate", isDark ? "text-gray-500" : "text-gray-600")}>{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1.5 md:gap-2">
                                        <Badge variant={user.role}>{getFilterLabel(user.role.toLowerCase())}</Badge>
                                        <Badge variant={user.status}>{getFilterLabel(user.status)}</Badge>
                                    </div>
                                    <div className="flex gap-1">
                                        <button className={cn(
                                            "p-1.5 md:p-2 rounded-lg transition-colors",
                                            isDark ? "hover:bg-white/5 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                                        )}>{Icons.edit}</button>
                                        <button className={cn(
                                            "p-1.5 md:p-2 rounded-lg transition-colors text-red-500",
                                            isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
                                        )}>{Icons.trash}</button>
                                    </div>
                                </div>
                                <p className={cn("text-[10px] md:text-xs mt-2 md:mt-3 pt-2 md:pt-3 border-t", isDark ? "text-gray-500 border-white/5" : "text-gray-500 border-gray-200")}>
                                    {t.adminDashboard.usersPage.table.joined} {formatDate(user.joinDate)}
                                </p>
                            </GlowingCard>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
