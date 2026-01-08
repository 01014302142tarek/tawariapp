"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { useI18n } from "@/app/i18n";
import { useAuth } from "@/app/context/AuthContext";
import { MovingBorder } from "@/components/ui/moving-border";

// Icons
const Icons = {
    sun: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
    ),
    moon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
    ),
    system: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
    ),
    appearance: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
        </svg>
    ),
    bell: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
    ),
    chevronDown: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    ),
    chevronRight: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
    check: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    logout: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
    ),
    video: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    calendar: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    menu: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    ),
};

// Default avatar for doctors without profile photo
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face";

// User Dropdown with Theme Appearance submenu
const UserDropdown = ({
    name,
    image,
    isDark,
    themeMode,
    onSetThemeMode,
    onLogout
}: {
    name: string;
    image: string;
    isDark: boolean;
    themeMode: "system" | "light" | "dark";
    onSetThemeMode: (mode: "system" | "light" | "dark") => void;
    onLogout: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const { t, isRTL } = useI18n();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowThemeMenu(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const themeOptions = [
        { mode: "system" as const, label: t.common.systemTheme || "System", icon: Icons.system },
        { mode: "light" as const, label: t.common.lightMode || "Light", icon: Icons.sun },
        { mode: "dark" as const, label: t.common.darkMode || "Dark", icon: Icons.moon },
    ];

    return (
        <div ref={dropdownRef} className="relative z-[100]">
            <button
                onClick={() => { setIsOpen(!isOpen); setShowThemeMenu(false); }}
                className={cn(
                    "flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-xl transition-colors",
                    isDark ? "hover:bg-white/5" : "hover:bg-gray-100"
                )}
            >
                <div className="relative">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-teal-500/30">
                        <Image src={image} alt={name} fill className="object-cover" unoptimized />
                    </div>
                </div>
                <div className="text-left hidden sm:block">
                    <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{name}</p>
                    <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-600")}>{t.common.roles.doctor}</p>
                </div>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className={cn("hidden sm:block", isDark ? "text-gray-400" : "text-gray-500")}>
                    {Icons.chevronDown}
                </motion.span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "absolute top-full mt-2 w-64 rounded-xl shadow-2xl overflow-hidden z-[100]",
                            isRTL ? "left-0" : "right-0",
                            isDark ? "bg-slate-900 border border-white/10" : "bg-white border border-gray-200"
                        )}
                    >
                        <div className="p-2">
                            {/* Theme Appearance Button */}
                            <button
                                onClick={() => setShowThemeMenu(!showThemeMenu)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors",
                                    isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {Icons.appearance}
                                    <span className="text-sm">{t.common.themeAppearance || "Theme Appearance"}</span>
                                </div>
                                <motion.span animate={{ rotate: showThemeMenu ? 90 : 0 }}>
                                    {Icons.chevronRight}
                                </motion.span>
                            </button>

                            {/* Theme Options Submenu */}
                            <AnimatePresence>
                                {showThemeMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className={cn(
                                            "overflow-hidden rounded-lg mt-1 mb-1",
                                            isDark ? "bg-white/5" : "bg-gray-50"
                                        )}
                                    >
                                        {themeOptions.map((option) => (
                                            <button
                                                key={option.mode}
                                                onClick={() => {
                                                    onSetThemeMode(option.mode);
                                                    setShowThemeMenu(false);
                                                    setIsOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-4 py-2.5 transition-colors",
                                                    isDark
                                                        ? "text-gray-400 hover:text-white hover:bg-white/5"
                                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                                                    themeMode === option.mode && (isDark ? "text-teal-400" : "text-teal-600")
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {option.icon}
                                                    <span className="text-sm">{option.label}</span>
                                                </div>
                                                {themeMode === option.mode && (
                                                    <span className={isDark ? "text-teal-400" : "text-teal-600"}>
                                                        {Icons.check}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className={cn("my-2 border-t", isDark ? "border-white/10" : "border-gray-200")} />

                            <button className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            )}>
                                {Icons.settings}
                                <span className="text-sm">{t.common.settings || "Settings"}</span>
                            </button>
                            <button
                                onClick={onLogout}
                                className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                isDark ? "text-gray-400 hover:text-red-400 hover:bg-red-500/10" : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                            )}>
                                {Icons.logout}
                                <span className="text-sm">{t.common.logout || "Logout"}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const { theme, themeMode, setThemeMode } = useTheme();
    const { t, isRTL, language } = useI18n();
    const { profile, signOut } = useAuth();
    const router = useRouter();
    const isDark = theme === "dark";

    // Get user's name and avatar from profile
    const userName = profile?.profile.full_name || t.common.demoNames.drHassan;
    const userAvatar = profile?.profile.avatar_url || DEFAULT_AVATAR;

    const handleLogout = async () => {
        await signOut();
        router.push(`/${language}/login`);
    };

    const currentDate = new Date().toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <header className={cn(
            "relative z-40 border-b backdrop-blur-xl transition-colors duration-300",
            isDark ? "border-white/5 bg-slate-950/80" : "border-gray-200 bg-white/80"
        )}>
            <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
                {/* Left: Mobile Menu + Date */}
                <div className="flex items-center gap-3">
                    {/* Hamburger menu - mobile only */}
                    <button
                        onClick={onMenuClick}
                        className={cn(
                            "p-2 rounded-lg md:hidden transition-colors",
                            isDark
                                ? "text-gray-400 hover:text-white hover:bg-white/5"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        )}
                    >
                        {Icons.menu}
                    </button>
                    {/* Date - hidden on mobile */}
                    <div className={cn("items-center gap-2 hidden md:flex", isDark ? "text-gray-400" : "text-gray-600")}>
                        {Icons.calendar}
                        <span className="font-medium">{currentDate}</span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Video Call Button - visible on all screens */}
                    <MovingBorder
                        duration={3000}
                        className="px-3 md:px-5 py-2 md:py-2.5 font-medium cursor-pointer"
                        bgClassName={isDark ? "bg-slate-900/[0.8]" : "bg-white"}
                    >
                        <div className={cn("flex items-center gap-1.5 md:gap-2 text-sm", isDark ? "text-white" : "text-teal-600")}>
                            {Icons.video}
                            <span>{t.doctorDashboard?.actions?.startVideoCall || "Start Call"}</span>
                        </div>
                    </MovingBorder>

                    {/* Notifications - visible on all screens */}
                    <button className={cn(
                        "relative p-2 md:p-2.5 rounded-xl border transition-colors",
                        isDark
                            ? "bg-white/5 hover:bg-white/10 border-white/5 text-gray-400"
                            : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-600"
                    )}>
                        {Icons.bell}
                        <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-teal-500 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center">3</span>
                    </button>

                    {/* User Dropdown */}
                    <UserDropdown
                        name={userName}
                        image={userAvatar}
                        isDark={isDark}
                        themeMode={themeMode}
                        onSetThemeMode={setThemeMode}
                        onLogout={handleLogout}
                    />
                </div>
            </div>
        </header>
    );
}
