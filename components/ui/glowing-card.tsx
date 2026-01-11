"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingCardProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: "teal" | "amber" | "purple" | "blue" | "pink" | "green";
    isDark?: boolean;
}

const glowColorsDark = {
    teal: "from-teal-500/20 via-teal-400/10 to-transparent",
    amber: "from-amber-500/20 via-amber-400/10 to-transparent",
    purple: "from-purple-500/20 via-purple-400/10 to-transparent",
    blue: "from-blue-500/20 via-blue-400/10 to-transparent",
    pink: "from-pink-500/20 via-pink-400/10 to-transparent",
    green: "from-green-500/20 via-green-400/10 to-transparent",
};

const glowColorsLight = {
    teal: "from-teal-100/60 via-teal-50/30 to-transparent",
    amber: "from-amber-100/60 via-amber-50/30 to-transparent",
    purple: "from-purple-100/60 via-purple-50/30 to-transparent",
    blue: "from-blue-100/60 via-blue-50/30 to-transparent",
    pink: "from-pink-100/60 via-pink-50/30 to-transparent",
    green: "from-green-100/60 via-green-50/30 to-transparent",
};

const borderColorsDark = {
    teal: "border-teal-500/20 hover:border-teal-500/40",
    amber: "border-amber-500/20 hover:border-amber-500/40",
    purple: "border-purple-500/20 hover:border-purple-500/40",
    blue: "border-blue-500/20 hover:border-blue-500/40",
    pink: "border-pink-500/20 hover:border-pink-500/40",
    green: "border-green-500/20 hover:border-green-500/40",
};

const borderColorsLight = {
    teal: "border-teal-200/80 hover:border-teal-400 shadow-sm hover:shadow-md hover:shadow-teal-100/50",
    amber: "border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-md hover:shadow-amber-100/50",
    purple: "border-purple-200/80 hover:border-purple-400 shadow-sm hover:shadow-md hover:shadow-purple-100/50",
    blue: "border-blue-200/80 hover:border-blue-400 shadow-sm hover:shadow-md hover:shadow-blue-100/50",
    pink: "border-pink-200/80 hover:border-pink-400 shadow-sm hover:shadow-md hover:shadow-pink-100/50",
    green: "border-green-200/80 hover:border-green-400 shadow-sm hover:shadow-md hover:shadow-green-100/50",
};

// Helper function to resolve theme from localStorage
function resolveThemeFromStorage(): boolean {
    if (typeof window === "undefined") return false; // Default to light

    // Check for new theme mode keys first
    const themeKeys = [
        "doctor-dashboard-theme-mode",
        "patient-dashboard-theme-mode",
        "admin-theme-mode"
    ];

    for (const key of themeKeys) {
        const mode = localStorage.getItem(key);
        if (mode) {
            if (mode === "system") {
                return window.matchMedia("(prefers-color-scheme: dark)").matches;
            }
            return mode === "dark";
        }
    }

    // Check for old theme keys (backwards compatibility)
    const legacyKeys = [
        "doctor-dashboard-theme",
        "patient-dashboard-theme",
        "admin-theme"
    ];

    for (const key of legacyKeys) {
        const theme = localStorage.getItem(key);
        if (theme) {
            return theme === "dark";
        }
    }

    // Default to light theme
    return false;
}

export function GlowingCard({ children, className, glowColor = "teal", isDark }: GlowingCardProps) {
    const [autoDetectedDark, setAutoDetectedDark] = React.useState(false);

    React.useEffect(() => {
        if (isDark === undefined) {
            // Initial detection
            setAutoDetectedDark(resolveThemeFromStorage());

            // Listen for storage changes (cross-tab)
            const handleStorage = () => {
                setAutoDetectedDark(resolveThemeFromStorage());
            };
            window.addEventListener("storage", handleStorage);

            // Listen for system theme changes when in system mode
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleMediaChange = () => {
                setAutoDetectedDark(resolveThemeFromStorage());
            };
            mediaQuery.addEventListener("change", handleMediaChange);

            // Listen for custom theme change events (same-tab theme switches)
            const handleThemeChange = () => {
                setAutoDetectedDark(resolveThemeFromStorage());
            };
            window.addEventListener("themeChange", handleThemeChange);

            return () => {
                window.removeEventListener("storage", handleStorage);
                window.removeEventListener("themeChange", handleThemeChange);
                mediaQuery.removeEventListener("change", handleMediaChange);
            };
        }
    }, [isDark]);

    // Use explicit isDark if provided, otherwise use auto-detected value
    const resolvedIsDark = isDark !== undefined ? isDark : autoDetectedDark;

    const borderColors = resolvedIsDark ? borderColorsDark : borderColorsLight;
    const glowColors = resolvedIsDark ? glowColorsDark : glowColorsLight;

    // Check if className includes any overflow class to avoid overriding it
    const hasOverflowClass = className?.includes('overflow-');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "relative rounded-2xl border backdrop-blur-sm group transition-all duration-300",
                !hasOverflowClass && "overflow-hidden",
                resolvedIsDark
                    ? "bg-slate-900/50 shadow-lg shadow-black/5"
                    : "bg-white shadow-lg",
                borderColors[glowColor],
                className
            )}
        >
            {/* Glow effect */}
            <div
                className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    glowColors[glowColor]
                )}
            />
            {/* Content */}
            <div className="relative z-10 p-5">{children}</div>
        </motion.div>
    );
}
