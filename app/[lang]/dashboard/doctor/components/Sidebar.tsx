"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { useI18n } from "@/app/i18n";

const navItems = [
    {
        name: "Dashboard",
        href: "/dashboard/doctor",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
        ),
    },
    {
        name: "Appointments",
        href: "/dashboard/doctor/appointments",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
        ),
    },
    {
        name: "Patients",
        href: "/dashboard/doctor/patients",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
        ),
    },
    {
        name: "Consultations",
        href: "/dashboard/doctor/consultations",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
        ),
    },
    {
        name: "Messages",
        href: "/dashboard/doctor/messages",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
        ),
        count: 3,
    },
    {
        name: "Analytics",
        href: "/dashboard/doctor/analytics",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ),
    },
];

// Tooltip component for collapsed state
function Tooltip({ children, label, isExpanded }: { children: React.ReactNode; label: string; isExpanded: boolean }) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => !isExpanded && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {children}
            <AnimatePresence>
                {showTooltip && !isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[60]"
                    >
                        <div className="bg-slate-900 text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                            {label}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function Sidebar({ isMobileOpen, onClose }: { isMobileOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const { theme } = useTheme();
    const { t, isRTL, language } = useI18n();
    const isDark = theme === "dark";
    const [isExpanded, setIsExpanded] = useState(false);

    // Translation helper for nav items
    const getNavLabel = (name: string) => {
        const labels: Record<string, string> = {
            "Dashboard": t.doctorDashboard.sidebar.dashboard,
            "Appointments": t.doctorDashboard.sidebar.appointments,
            "Patients": t.doctorDashboard.sidebar.patients,
            "Consultations": t.doctorDashboard.sidebar.schedule,
            "Messages": t.doctorDashboard.sidebar.messages,
            "Analytics": t.doctorDashboard.sidebar.analytics,
        };
        return labels[name] || name;
    };

    // Fixed widths for consistent centering
    const collapsedWidth = 72;
    const expandedWidth = 240;

    return (
        <>
            {/* Mobile backdrop */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    width: isExpanded ? expandedWidth : collapsedWidth,
                    x: 0
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
                className={cn(
                    "fixed top-0 h-screen flex flex-col z-50 overflow-hidden",
                    "border-r backdrop-blur-xl",
                    isRTL ? "right-0 border-l border-r-0" : "left-0",
                    // Hidden on mobile by default, shown when isMobileOpen is true
                    isMobileOpen
                        ? (isRTL ? "translate-x-0" : "translate-x-0")
                        : (isRTL ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"),
                    "transition-transform duration-300 md:transition-none",
                    isDark
                        ? "bg-slate-950/95 border-white/10"
                        : "bg-white/95 border-gray-200/80"
                )}
            >
                {/* Logo Area */}
                <div className={cn(
                    "h-16 flex items-center flex-shrink-0"
                )}>
                    <Link
                        href="/"
                        className="flex items-center gap-3 group w-full"
                        style={{ paddingLeft: (collapsedWidth - 40) / 2 }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                            style={{
                                boxShadow: isDark
                                    ? "0 0 20px rgba(20, 184, 166, 0.3)"
                                    : "0 4px 12px rgba(0, 0, 0, 0.1)"
                            }}
                        >
                            <Image
                                src="/logo-custom.png"
                                alt="TawariApp"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                        {isExpanded && (
                            <span
                                className={cn(
                                    "text-lg font-bold whitespace-nowrap",
                                    isDark ? "text-white" : "text-slate-900"
                                )}
                            >
                                TawariApp
                            </span>
                        )}
                    </Link>
                </div>

                {/* Main Navigation - Centered vertically */}
                <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden flex flex-col justify-center">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const href = `/${language}${item.href}`;
                            const isActive = pathname === href;

                            // Handle navigation click - close sidebar after delay on mobile
                            const handleNavClick = () => {
                                if (isMobileOpen && onClose) {
                                    setTimeout(() => {
                                        onClose();
                                    }, 500); // 0.5 second delay
                                }
                            };

                            return (
                                <Tooltip key={item.name} label={getNavLabel(item.name)} isExpanded={isExpanded}>
                                    <Link href={href} onClick={handleNavClick}>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={cn(
                                                "flex items-center py-2.5 rounded-xl transition-all duration-200 relative mx-3",
                                                isActive
                                                    ? isDark
                                                        ? "bg-gradient-to-r from-teal-500/20 to-teal-500/5 text-teal-400"
                                                        : "bg-gradient-to-r from-teal-500/15 to-teal-500/5 text-teal-600"
                                                    : isDark
                                                        ? "text-gray-400 hover:text-white hover:bg-white/5"
                                                        : "text-gray-600 hover:text-slate-900 hover:bg-gray-100/80"
                                            )}
                                        >
                                            {/* Active indicator */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className={cn(
                                                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full",
                                                        isDark ? "bg-teal-400" : "bg-teal-500"
                                                    )}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                />
                                            )}

                                            {/* Icon container - fixed width for consistent centering */}
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center flex-shrink-0",
                                                    isActive && "drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                                                )}
                                                style={{ width: collapsedWidth - 24, minWidth: collapsedWidth - 24 }}
                                            >
                                                {item.icon}
                                            </div>

                                            {/* Label - only visible when expanded */}
                                            <AnimatePresence mode="wait">
                                                {isExpanded && (
                                                    <motion.span
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: "auto" }}
                                                        exit={{ opacity: 0, width: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="font-medium text-sm whitespace-nowrap overflow-hidden flex-1"
                                                    >
                                                        {getNavLabel(item.name)}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>

                                            {/* Badge count */}
                                            {item.count && (
                                                <motion.span
                                                    animate={{
                                                        position: isExpanded ? "relative" : "absolute",
                                                        top: isExpanded ? "auto" : -4,
                                                        right: isExpanded ? 12 : 8,
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                    className={cn(
                                                        "flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-teal-400 rounded-full shadow-lg shadow-teal-500/30",
                                                        isExpanded ? "w-5 h-5 mr-3" : "w-4 h-4 text-[10px]"
                                                    )}
                                                >
                                                    {item.count}
                                                </motion.span>
                                            )}
                                        </motion.div>
                                    </Link>
                                </Tooltip>
                            );
                        })}
                    </div>
                </nav>
            </motion.aside>
        </>
    );
}

