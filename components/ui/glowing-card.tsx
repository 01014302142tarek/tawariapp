"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Try to use theme context if available, otherwise default to dark
let useThemeHook: (() => { theme: string }) | null = null;
try {
    // Dynamic import would be better but for simplicity we use a fallback
} catch {
    // Context not available
}

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
    teal: "from-teal-100/80 via-teal-50/40 to-transparent",
    amber: "from-amber-100/80 via-amber-50/40 to-transparent",
    purple: "from-purple-100/80 via-purple-50/40 to-transparent",
    blue: "from-blue-100/80 via-blue-50/40 to-transparent",
    pink: "from-pink-100/80 via-pink-50/40 to-transparent",
    green: "from-green-100/80 via-green-50/40 to-transparent",
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
    teal: "border-teal-200 hover:border-teal-300 shadow-teal-100/50",
    amber: "border-amber-200 hover:border-amber-300 shadow-amber-100/50",
    purple: "border-purple-200 hover:border-purple-300 shadow-purple-100/50",
    blue: "border-blue-200 hover:border-blue-300 shadow-blue-100/50",
    pink: "border-pink-200 hover:border-pink-300 shadow-pink-100/50",
    green: "border-green-200 hover:border-green-300 shadow-green-100/50",
};

// Create a version that accepts isDark prop for explicit control
export function GlowingCard({ children, className, glowColor = "teal", isDark }: GlowingCardProps) {
    // If isDark is explicitly provided, use it directly
    // Otherwise fall back to localStorage/system preference detection
    const [autoDetectedDark, setAutoDetectedDark] = React.useState(true);

    React.useEffect(() => {
        // Only run auto-detection if isDark is not explicitly passed
        if (isDark === undefined) {
            // Check localStorage for theme (check both doctor and patient dashboards)
            const doctorTheme = localStorage.getItem("doctor-dashboard-theme");
            const patientTheme = localStorage.getItem("patient-dashboard-theme");
            const savedTheme = doctorTheme || patientTheme;
            if (savedTheme) {
                setAutoDetectedDark(savedTheme === "dark");
            } else {
                // Check system preference
                setAutoDetectedDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
            }

            // Listen for storage changes
            const handleStorage = () => {
                const dTheme = localStorage.getItem("doctor-dashboard-theme");
                const pTheme = localStorage.getItem("patient-dashboard-theme");
                const theme = dTheme || pTheme;
                if (theme) {
                    setAutoDetectedDark(theme === "dark");
                }
            };

            window.addEventListener("storage", handleStorage);

            // Also check periodically for local changes
            const interval = setInterval(() => {
                const dTheme = localStorage.getItem("doctor-dashboard-theme");
                const pTheme = localStorage.getItem("patient-dashboard-theme");
                const theme = dTheme || pTheme;
                if (theme) {
                    setAutoDetectedDark(theme === "dark");
                }
            }, 100);

            return () => {
                window.removeEventListener("storage", handleStorage);
                clearInterval(interval);
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
                    : "bg-white shadow-lg shadow-gray-100",
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
