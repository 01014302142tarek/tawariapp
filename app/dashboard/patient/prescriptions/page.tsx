"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../context/useThemeStyles";
import { GlowingCard } from "@/components/ui/glowing-card";

// Icons
const Icons = {
    prescription: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    pill: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
    ),
    clock: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    refresh: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
    ),
};

// Mock Data
const prescriptions = [
    {
        id: 1,
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "1 tablet daily",
        prescribedBy: "Dr. Ahmed Hassan",
        startDate: "Nov 15, 2024",
        refillDate: "Dec 28, 2024",
        pillsRemaining: 18,
        status: "active",
        instructions: "Take in the morning with water"
    },
    {
        id: 2,
        name: "Metformin",
        dosage: "500mg",
        frequency: "2 tablets with meals",
        prescribedBy: "Dr. Fatima Khaled",
        startDate: "Oct 20, 2024",
        refillDate: "Jan 5, 2025",
        pillsRemaining: 45,
        status: "active",
        instructions: "Take with breakfast and dinner"
    },
    {
        id: 3,
        name: "Atorvastatin",
        dosage: "20mg",
        frequency: "1 tablet at bedtime",
        prescribedBy: "Dr. Ahmed Hassan",
        startDate: "Sep 10, 2024",
        refillDate: "Dec 20, 2024",
        pillsRemaining: 5,
        status: "refill-needed",
        instructions: "Take at night before sleep"
    },
    {
        id: 4,
        name: "Omeprazole",
        dosage: "20mg",
        frequency: "1 capsule before breakfast",
        prescribedBy: "Dr. Fatima Khaled",
        startDate: "Aug 5, 2024",
        refillDate: "Dec 15, 2024",
        pillsRemaining: 0,
        status: "expired",
        instructions: "Take 30 minutes before eating"
    },
];

const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" }) => {
    const variants = {
        default: "bg-slate-700/50 text-slate-300",
        success: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
        warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        danger: "bg-red-500/10 text-red-400 border border-red-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant])}>
            {children}
        </span>
    );
};

export default function PrescriptionsPage() {
    const [activeFilter, setActiveFilter] = useState("All");
    const { isDark, textPrimary, textMuted } = useThemeStyles();

    const filters = ["All", "Active", "Refill Needed", "Expired"];

    const filteredPrescriptions = prescriptions.filter(rx => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Active") return rx.status === "active";
        if (activeFilter === "Refill Needed") return rx.status === "refill-needed";
        if (activeFilter === "Expired") return rx.status === "expired";
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active": return <Badge variant="success">Active</Badge>;
            case "refill-needed": return <Badge variant="warning">Refill Needed</Badge>;
            case "expired": return <Badge variant="danger">Expired</Badge>;
            default: return <Badge>Unknown</Badge>;
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className={cn("text-2xl font-bold flex items-center gap-3", textPrimary)}>
                        <span className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.prescription}
                        </span>
                        My Prescriptions
                    </h1>
                    <p className={cn("mt-1", textMuted)}>Manage your medications and refills</p>
                </div>
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

            {/* Prescriptions List */}
            <div className="grid gap-4">
                {filteredPrescriptions.map((rx, idx) => (
                    <motion.div
                        key={rx.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <GlowingCard glowColor="teal" className="p-5" isDark={isDark}>
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-14 h-14 rounded-xl flex items-center justify-center",
                                    rx.status === "active" ? "bg-teal-500/10 text-teal-500" :
                                        rx.status === "refill-needed" ? "bg-amber-500/10 text-amber-500" :
                                            "bg-red-500/10 text-red-500"
                                )}>
                                    {Icons.pill}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className={cn("text-lg font-semibold", textPrimary)}>
                                            {rx.name} <span className={textMuted}>{rx.dosage}</span>
                                        </h3>
                                        {getStatusBadge(rx.status)}
                                    </div>
                                    <p className={cn("text-sm mb-2", textMuted)}>{rx.frequency}</p>
                                    <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                        Prescribed by {rx.prescribedBy}
                                    </p>
                                    <div className="flex items-center gap-6 mt-3">
                                        <div className="flex items-center gap-2">
                                            {Icons.clock}
                                            <span className={cn("text-sm", textMuted)}>
                                                Refill by: {rx.refillDate}
                                            </span>
                                        </div>
                                        <span className={cn(
                                            "text-sm font-medium",
                                            rx.pillsRemaining <= 5 ? "text-amber-500" : isDark ? "text-gray-400" : "text-gray-600"
                                        )}>
                                            {rx.pillsRemaining} pills remaining
                                        </span>
                                    </div>
                                    <p className={cn("text-xs mt-2 italic flex items-center gap-1", textMuted)}>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
                                        {rx.instructions}
                                    </p>
                                </div>
                                {rx.status === "refill-needed" && (
                                    <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors">
                                        {Icons.refresh}
                                        Request Refill
                                    </button>
                                )}
                            </div>
                        </GlowingCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
