"use client";

import { useGlobalTheme } from "@/app/context/GlobalThemeContext";

// Shared theme-aware style classes for the doctor dashboard
export function useThemeStyles() {
    const { isDark, themeMode, setThemeMode, theme } = useGlobalTheme();

    return {
        theme,
        isDark,
        themeMode,
        setThemeMode,

        // Page backgrounds
        pageBg: isDark ? "bg-[#060B18]" : "bg-gray-50",

        // Cards
        cardBg: isDark ? "bg-[#0B152B]/80 border-blue-500/20" : "bg-white border-gray-200 shadow-sm",
        cardHover: isDark ? "hover:bg-blue-900/20" : "hover:bg-gray-50",

        // Text
        textPrimary: isDark ? "text-white" : "text-slate-900",
        textSecondary: isDark ? "text-slate-300" : "text-gray-600",
        textMuted: isDark ? "text-slate-400" : "text-gray-500",

        // Borders
        border: isDark ? "border-blue-900/30" : "border-gray-200",
        borderLight: isDark ? "border-blue-800/40" : "border-gray-300",
        divider: isDark ? "divide-blue-900/30" : "divide-gray-200",

        // Inputs
        inputBg: isDark
            ? "bg-[#0B1630] border-blue-500/30 text-white placeholder-gray-400"
            : "bg-white border-gray-300 text-slate-900 placeholder-gray-400",
        inputFocus: "focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40",

        // Buttons
        buttonSecondary: isDark
            ? "bg-[#0B1630] text-blue-200 border border-blue-500/30 hover:text-white hover:border-blue-400"
            : "bg-gray-100 text-gray-600 border border-gray-200 hover:text-gray-900 hover:bg-gray-200",
        buttonSecondaryActive: "bg-blue-600 text-white border border-blue-400",

        // Section headers
        sectionHeader: isDark ? "text-white" : "text-slate-900",

        // Avatar border
        avatarBorder: "border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]",

        // Empty states
        emptyStateBg: isDark ? "bg-[#0B1630]" : "bg-gray-100",
        emptyStateText: isDark ? "text-slate-400" : "text-gray-400",
    };
}
