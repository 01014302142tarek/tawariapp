"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { useI18n } from "@/app/i18n";



// Tooltip component for collapsed state
function Tooltip({ children, label, isExpanded, isRTL }: { children: React.ReactNode; label: string; isExpanded: boolean; isRTL: boolean }) {
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
                        initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 z-[60]",
                            isRTL ? "right-full mr-3" : "left-full ml-3"
                        )}
                    >
                        <div className="bg-slate-900 text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                            {label}
                            <div className={cn(
                                "absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45",
                                isRTL ? "right-0 translate-x-1" : "left-0 -translate-x-1"
                            )} />
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
    const isDark = theme === "dark";
    const [isExpanded, setIsExpanded] = useState(false);
    const { t, language, isRTL } = useI18n();

    const navItems = [
        {
            name: t.adminDashboard.sidebar.dashboard,
            href: `/${language}/dashboard/admin`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
            ),
        },
        {
            name: t.adminDashboard.sidebar.users,
            href: `/${language}/dashboard/admin/users`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
            ),
            count: 5,
        },
        {
            name: t.adminDashboard.sidebar.doctors,
            href: `/${language}/dashboard/admin/doctors`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
            ),
        },
        {
            name: t.adminDashboard.sidebar.patients,
            href: `/${language}/dashboard/admin/patients`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
            ),
        },
        {
            name: t.adminDashboard.sidebar.analytics,
            href: `/${language}/dashboard/admin/analytics`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
            ),
        },
        {
            name: t.adminDashboard.sidebar.settings,
            href: `/${language}/dashboard/admin/settings`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ];

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
                    "backdrop-blur-xl",
                    isRTL ? "right-0 border-l border-r-0" : "left-0 border-r",
                    // Hidden on mobile by default, shown when isMobileOpen is true
                    isMobileOpen
                        ? "translate-x-0"
                        : (isRTL ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"),
                    "transition-transform duration-300 md:transition-none",
                    isDark
                        ? "bg-slate-950/95 border-white/10"
                        : "bg-white/95 border-gray-200/80"
                )}
            >
                {/* Logo Area */}
                <div className={cn("h-16 flex items-center flex-shrink-0")}>
                    <Link
                        href="/"
                        className="flex items-center gap-3 group w-full"
                        style={{ paddingLeft: isRTL ? 0 : (collapsedWidth - 40) / 2, paddingRight: isRTL ? (collapsedWidth - 40) / 2 : 0 }}
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
                                Admin Panel
                            </span>
                        )}
                    </Link>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden flex flex-col justify-center">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;

                            // Handle navigation click - close sidebar after delay on mobile
                            const handleNavClick = () => {
                                if (isMobileOpen && onClose) {
                                    setTimeout(() => {
                                        onClose();
                                    }, 500); // 0.5 second delay
                                }
                            };

                            return (
                                <Tooltip key={item.name} label={item.name} isExpanded={isExpanded} isRTL={isRTL}>
                                    <Link href={item.href} onClick={handleNavClick}>
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
                                            {isActive && (
                                                <motion.div
                                                    layoutId="adminActiveIndicator"
                                                    className={cn(
                                                        "absolute top-1/2 -translate-y-1/2 w-1 h-6",
                                                        isRTL ? "right-0 rounded-l-full" : "left-0 rounded-r-full",
                                                        isDark ? "bg-teal-400" : "bg-teal-500"
                                                    )}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                />
                                            )}

                                            <div
                                                className={cn(
                                                    "flex items-center justify-center flex-shrink-0",
                                                    isActive && "drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                                                )}
                                                style={{ width: collapsedWidth - 24, minWidth: collapsedWidth - 24 }}
                                            >
                                                {item.icon}
                                            </div>

                                            <AnimatePresence mode="wait">
                                                {isExpanded && (
                                                    <motion.span
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: "auto" }}
                                                        exit={{ opacity: 0, width: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="font-medium text-sm whitespace-nowrap overflow-hidden flex-1"
                                                    >
                                                        {item.name}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>

                                            {item.count && (
                                                <motion.span
                                                    animate={{
                                                        position: isExpanded ? "relative" : "absolute",
                                                        top: isExpanded ? "auto" : -4,
                                                        [isRTL ? "left" : "right"]: isExpanded ? 12 : 8,
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                    className={cn(
                                                        "flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-teal-400 rounded-full shadow-lg shadow-teal-500/30",
                                                        isExpanded ? "w-5 h-5 ml-3" : "w-4 h-4 text-[10px]"
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

