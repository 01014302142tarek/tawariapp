"use client";

import { useGlobalTheme } from "@/app/context/GlobalThemeContext";

export function useThemeStyles() {
    const { isDark, theme } = useGlobalTheme();

    return {
        isDark,
        theme,
        // Background
        bgPrimary: isDark ? "bg-slate-950" : "bg-gray-50",
        bgSecondary: isDark ? "bg-slate-900" : "bg-white",
        bgTertiary: isDark ? "bg-slate-800" : "bg-gray-100",

        // Text
        textPrimary: isDark ? "text-white" : "text-slate-900",
        textSecondary: isDark ? "text-gray-400" : "text-gray-600",
        textMuted: isDark ? "text-gray-500" : "text-gray-500",

        // Borders
        borderPrimary: isDark ? "border-white/10" : "border-gray-200",
        borderSecondary: isDark ? "border-white/5" : "border-gray-100",

        // Cards
        cardBg: isDark ? "bg-slate-900/50" : "bg-white",
        cardBorder: isDark ? "border-white/5" : "border-gray-200",

        // Hover states
        hoverBg: isDark ? "hover:bg-white/5" : "hover:bg-gray-100",
    };
}
