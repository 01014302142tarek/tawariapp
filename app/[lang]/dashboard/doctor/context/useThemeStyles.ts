"use client";

import { useTheme } from "./ThemeContext";

// Shared theme-aware style classes for the doctor2 dashboard
export function useThemeStyles() {
    const { theme, themeMode, setThemeMode } = useTheme();
    const isDark = theme === "dark";

    return {
        theme,
        isDark,
        themeMode,
        setThemeMode,

        // Page backgrounds
        pageBg: isDark ? "bg-slate-950" : "bg-gray-50",

        // Cards
        cardBg: isDark ? "bg-slate-900/50 border-white/5" : "bg-white border-gray-200 shadow-sm",
        cardHover: isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50",

        // Text
        textPrimary: isDark ? "text-white" : "text-slate-900",
        textSecondary: isDark ? "text-gray-400" : "text-gray-600",
        textMuted: isDark ? "text-gray-500" : "text-gray-500",

        // Borders
        border: isDark ? "border-white/5" : "border-gray-200",
        borderLight: isDark ? "border-white/10" : "border-gray-300",
        divider: isDark ? "divide-white/5" : "divide-gray-200",

        // Inputs
        inputBg: isDark
            ? "bg-slate-900/50 border-white/5 text-white placeholder-gray-500"
            : "bg-white border-gray-300 text-slate-900 placeholder-gray-400",
        inputFocus: "focus:outline-none focus:border-teal-500/50",

        // Buttons
        buttonSecondary: isDark
            ? "bg-slate-900/50 text-gray-400 border border-white/5 hover:text-white hover:border-white/10"
            : "bg-gray-100 text-gray-600 border border-gray-200 hover:text-gray-900 hover:bg-gray-200",
        buttonSecondaryActive: "bg-teal-500/10 text-teal-500 border border-teal-500/20",

        // Section headers
        sectionHeader: isDark ? "text-white" : "text-slate-900",

        // Avatar border
        avatarBorder: "border-teal-500/30",

        // Empty states
        emptyStateBg: isDark ? "bg-slate-900" : "bg-gray-100",
        emptyStateText: isDark ? "text-gray-600" : "text-gray-400",
    };
}
