"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { useI18n } from "@/app/i18n";
import { useSidebar } from "../context/SidebarContext";
import { Logo, LogoIcon } from "@/components/ui/Logo";



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
                        <div className="bg-[#0B152B] border border-blue-500/30 text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                            {label}
                            <div className={cn(
                                "absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0B152B] border-l border-t border-blue-500/30 rotate-45",
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
    const { data: sidebarData } = useSidebar();

    const navItems = [
        {
            name: t.patientDashboard.sidebar.dashboard,
            href: `/${language}/dashboard/patient`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
            ),
        },
        {
            name: isRTL ? "استشارة عاجلة" : "Urgent Care",
            href: `/${language}/dashboard/patient/urgent-care`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
            ),
            highlight: true,
        },
        {
            name: t.patientDashboard.sidebar.appointments,
            href: `/${language}/dashboard/patient/appointments`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
            ),
        },
        {
            name: t.patientDashboard.sidebar.findDoctors,
            href: `/${language}/dashboard/patient/doctors`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
            ),
        },
        {
            name: t.patientDashboard.sidebar.prescriptions,
            href: `/${language}/dashboard/patient/prescriptions`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            ),
        },
        {
            name: t.patientDashboard.sidebar.messages,
            href: `/${language}/dashboard/patient/messages`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
            ),
            count: sidebarData.unreadMessages > 0 ? sidebarData.unreadMessages : undefined, // Only show count if > 0
        },
        {
            name: t.patientDashboard.sidebar.records,
            href: `/${language}/dashboard/patient/records`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
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
                        ? "bg-[#031326]/95 border-white/10"
                        : "bg-white/95 border-gray-200/80"
                )}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center flex-shrink-0">
                    <Link
                        href="/"
                        className={cn(
                            "flex items-center group w-full overflow-hidden transition-all duration-200",
                            isExpanded ? (isRTL ? "pr-4 pl-2" : "pl-4 pr-2") : "justify-center px-0"
                        )}
                    >
                        {isExpanded ? (
                            <Logo isDark={isDark} size="md" />
                        ) : (
                            <LogoIcon size="md" isDark={isDark} />
                        )}
                    </Link>
                </div>

                {/* Main Navigation - Centered vertically */}
                <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden flex flex-col justify-center">
                    <div className="space-y-1">
                        {navItems.map((item, index) => {
                            // Dashboard (index 0) should only be active on exact match
                            // Other items can be active on exact match or sub-paths
                            const isActive = index === 0
                                ? pathname === item.href
                                : pathname === item.href || pathname?.startsWith(item.href + "/");
                            const isHighlighted = "highlight" in item && item.highlight;

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
                                                        ? "bg-[#044C87]/30 text-[#FEFDFE] font-semibold shadow-sm"
                                                        : "bg-[#044C87]/15 text-[#044C87] font-semibold shadow-sm"
                                                    : isHighlighted && !isActive
                                                        ? isDark
                                                            ? "text-[#FD614B] hover:bg-[#FD614B]/10"
                                                            : "text-[#FD614B] hover:bg-[#FD614B]/10"
                                                        : isDark
                                                            ? "text-gray-400 hover:text-white hover:bg-white/5"
                                                            : "text-gray-600 hover:text-slate-900 hover:bg-gray-100/80"
                                            )}
                                        >
                                            {/* Active indicator */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="patientActiveIndicator"
                                                    className={cn(
                                                        "absolute top-1/2 -translate-y-1/2 w-1 h-6 rounded-full",
                                                        isRTL ? "-right-1" : "-left-1",
                                                        "bg-[#FD614B] shadow-[0_0_8px_rgba(253,97,75,0.7)]"
                                                    )}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                />
                                            )}

                                            {/* Icon container - fixed width for consistent centering */}
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center flex-shrink-0 transition-colors",
                                                    isActive ? "text-[#FD614B]" : ""
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
                                                        {item.name}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>

                                            {/* Badge count */}
                                            {item.count !== undefined && item.count > 0 && (
                                                <motion.span
                                                    animate={{
                                                        position: isExpanded ? "relative" : "absolute",
                                                        top: isExpanded ? "auto" : -4,
                                                        [isRTL ? "left" : "right"]: isExpanded ? 12 : 8,
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                    className={cn(
                                                        "flex items-center justify-center text-xs font-bold text-white bg-[#FD614B] rounded-full shadow-md shadow-[#FD614B]/30",
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

