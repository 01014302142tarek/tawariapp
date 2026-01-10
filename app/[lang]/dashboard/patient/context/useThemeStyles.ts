"use client";

import { useGlobalTheme } from "@/app/context/GlobalThemeContext";

export function useThemeStyles() {
    const { isDark } = useGlobalTheme();

    return {
        isDark,
        // Background
        pageBg: isDark ? "bg-slate-950" : "bg-gray-50",
        cardBg: isDark ? "bg-slate-900/50" : "bg-white",

        // Text
        textPrimary: isDark ? "text-white" : "text-slate-900",
        textSecondary: isDark ? "text-gray-300" : "text-gray-700",
        textMuted: isDark ? "text-gray-500" : "text-gray-600",

        // Borders
        border: isDark ? "border-white/5" : "border-gray-200",
        divider: isDark ? "border-white/10" : "border-gray-200",

        // Inputs
        inputBg: isDark
            ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400",
        inputFocus: isDark
            ? "focus:border-teal-500/50 focus:ring-teal-500/20"
            : "focus:border-teal-500 focus:ring-teal-500/20",

        // Cards
        cardHover: isDark ? "hover:bg-white/5" : "hover:bg-gray-50",

        // Accent
        accent: "text-teal-500",
        accentBg: "bg-teal-500/10",
    };
}
