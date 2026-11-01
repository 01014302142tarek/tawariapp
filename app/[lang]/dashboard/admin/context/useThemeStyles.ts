"use client";

import { useGlobalTheme } from "@/app/context/GlobalThemeContext";

export function useThemeStyles() {
    const { isDark, theme } = useGlobalTheme();

    return {
        isDark,
        theme,
        // Background
        bgPrimary: isDark ? "bg-[#060B18]" : "bg-gray-50",
        bgSecondary: isDark ? "bg-[#0B152B]" : "bg-white",
        bgTertiary: isDark ? "bg-[#0F1D38]" : "bg-gray-100",

        // Text
        textPrimary: isDark ? "text-white" : "text-slate-900",
        textSecondary: isDark ? "text-slate-300" : "text-gray-600",
        textMuted: isDark ? "text-slate-400" : "text-gray-500",

        // Borders
        borderPrimary: isDark ? "border-blue-900/30" : "border-gray-200",
        borderSecondary: isDark ? "border-blue-800/20" : "border-gray-100",

        // Cards
        cardBg: isDark ? "bg-[#0B152B]/85" : "bg-white",
        cardBorder: isDark ? "border-blue-500/20" : "border-gray-200",

        // Hover states
        hoverBg: isDark ? "hover:bg-blue-900/20" : "hover:bg-gray-100",
    };
}
