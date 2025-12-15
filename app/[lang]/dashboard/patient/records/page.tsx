"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../context/useThemeStyles";
import { GlowingCard } from "@/components/ui/glowing-card";

// Icons
const Icons = {
    folder: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
    ),
    document: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    lab: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
    ),
    heart: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    ),
    download: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    ),
    eye: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

// Mock Data
const categories = [
    { id: "all", name: "All Records", count: 12 },
    { id: "lab", name: "Lab Results", count: 5 },
    { id: "imaging", name: "Imaging", count: 3 },
    { id: "visits", name: "Visit Summaries", count: 4 },
];

const records = [
    { id: 1, type: "lab", title: "Complete Blood Count (CBC)", date: "Dec 10, 2024", doctor: "Dr. Ahmed Hassan", status: "new" },
    { id: 2, type: "lab", title: "Lipid Panel", date: "Dec 10, 2024", doctor: "Dr. Ahmed Hassan", status: "new" },
    { id: 3, type: "imaging", title: "Chest X-Ray", date: "Nov 28, 2024", doctor: "Dr. Fatima Khaled", status: "viewed" },
    { id: 4, type: "visits", title: "Cardiology Follow-up Summary", date: "Nov 15, 2024", doctor: "Dr. Ahmed Hassan", status: "viewed" },
    { id: 5, type: "lab", title: "HbA1c Test", date: "Oct 20, 2024", doctor: "Dr. Fatima Khaled", status: "viewed" },
    { id: 6, type: "imaging", title: "ECG Report", date: "Oct 15, 2024", doctor: "Dr. Ahmed Hassan", status: "viewed" },
    { id: 7, type: "visits", title: "Annual Physical Exam", date: "Sep 5, 2024", doctor: "Dr. Fatima Khaled", status: "viewed" },
];

const vitalHistory = [
    { label: "Blood Pressure", value: "120/80", unit: "mmHg", trend: "stable", date: "Dec 10, 2024" },
    { label: "Heart Rate", value: "72", unit: "bpm", trend: "stable", date: "Dec 10, 2024" },
    { label: "Weight", value: "68", unit: "kg", trend: "down", date: "Dec 10, 2024" },
    { label: "Blood Glucose", value: "95", unit: "mg/dL", trend: "stable", date: "Dec 10, 2024" },
];

const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "new" }) => {
    const variants = {
        default: "bg-slate-700/50 text-slate-300",
        success: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
        new: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant])}>
            {children}
        </span>
    );
};

export default function RecordsPage() {
    const [activeCategory, setActiveCategory] = useState("all");
    const { isDark, textPrimary, textMuted, border } = useThemeStyles();

    const filteredRecords = records.filter(record => {
        if (activeCategory === "all") return true;
        return record.type === activeCategory;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "lab": return Icons.lab;
            case "imaging": return Icons.heart;
            case "visits": return Icons.document;
            default: return Icons.document;
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                    <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                        </svg>
                    </span>
                    Medical Records
                </h1>
                <p className={cn("mt-1 text-sm md:text-base", textMuted)}>Access your medical history and documents</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Records List */}
                <div className="lg:col-span-2">
                    {/* Category Filters - Scrollable on mobile */}
                    <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 md:gap-2 whitespace-nowrap flex-shrink-0",
                                    activeCategory === cat.id
                                        ? "bg-teal-500 text-white"
                                        : isDark
                                            ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {cat.name}
                                <span className={cn(
                                    "w-4 h-4 md:w-5 md:h-5 rounded-full text-[10px] md:text-xs flex items-center justify-center",
                                    activeCategory === cat.id
                                        ? "bg-white/20"
                                        : isDark ? "bg-white/10" : "bg-gray-200"
                                )}>
                                    {cat.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Records */}
                    <div className="space-y-2 md:space-y-3">
                        {filteredRecords.map((record, idx) => (
                            <motion.div
                                key={record.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <GlowingCard glowColor="teal" className="p-3 md:p-4" isDark={isDark}>
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center bg-teal-500/10 text-teal-500 flex-shrink-0">
                                            <span className="[&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6">
                                                {getTypeIcon(record.type)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                                                <h3 className={cn("font-medium text-sm md:text-base truncate", textPrimary)}>{record.title}</h3>
                                                {record.status === "new" && <Badge variant="new">New</Badge>}
                                            </div>
                                            <p className={cn("text-xs md:text-sm truncate", textMuted)}>
                                                {record.doctor} • {record.date}
                                            </p>
                                        </div>
                                        <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
                                            <button className={cn(
                                                "p-1.5 md:p-2 rounded-lg transition-colors",
                                                isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                                            )}>
                                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </button>
                                            <button className={cn(
                                                "p-1.5 md:p-2 rounded-lg transition-colors",
                                                isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                                            )}>
                                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </GlowingCard>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Vitals Summary */}
                <div>
                    <GlowingCard glowColor="teal" className="p-4 md:p-6" isDark={isDark}>
                        <h2 className={cn("text-base md:text-lg font-semibold mb-3 md:mb-4", textPrimary)}>Latest Vitals</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 md:gap-4">
                            {vitalHistory.map((vital, idx) => (
                                <div key={idx} className={cn("p-2 md:p-3 rounded-lg", isDark ? "bg-white/[0.02]" : "bg-gray-50")}>
                                    <div className="flex items-center justify-between mb-0.5 md:mb-1">
                                        <span className={cn("text-xs md:text-sm", textMuted)}>{vital.label}</span>
                                        <span className={cn(
                                            "text-[10px] md:text-xs",
                                            vital.trend === "up" ? "text-red-500" :
                                                vital.trend === "down" ? "text-teal-500" :
                                                    "text-gray-500"
                                        )}>
                                            {vital.trend === "up" ? "↑" : vital.trend === "down" ? "↓" : "→"} {vital.trend}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-0.5 md:gap-1">
                                        <span className={cn("text-lg md:text-2xl font-bold", textPrimary)}>{vital.value}</span>
                                        <span className={cn("text-xs md:text-sm", textMuted)}>{vital.unit}</span>
                                    </div>
                                    <p className={cn("text-[10px] md:text-xs mt-0.5 md:mt-1", textMuted)}>{vital.date}</p>
                                </div>
                            ))}
                        </div>
                    </GlowingCard>
                </div>
            </div>
        </div>
    );
}
