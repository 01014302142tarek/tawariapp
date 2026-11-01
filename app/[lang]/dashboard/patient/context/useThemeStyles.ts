"use client";

import { useGlobalTheme } from "@/app/context/GlobalThemeContext";

export function useThemeStyles() {
    const { isDark } = useGlobalTheme();

    return {
        isDark,
        // Background
        pageBg: isDark ? "bg-[#060B18]" : "bg-gray-50",
        cardBg: isDark ? "bg-[#0B152B]/80 border-blue-500/20" : "bg-white",

        // Text
        textPrimary: isDark ? "text-white" : "text-slate-900",
        textSecondary: isDark ? "text-slate-300" : "text-gray-700",
        textMuted: isDark ? "text-slate-400" : "text-gray-600",

        // Borders
        border: isDark ? "border-blue-900/30" : "border-gray-200",
        divider: isDark ? "border-blue-800/40" : "border-gray-200",

        // Inputs
        inputBg: isDark
            ? "bg-[#0B1630] border-blue-500/30 text-white placeholder:text-gray-400"
            : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400",
        inputFocus: isDark
            ? "focus:border-blue-500 focus:ring-blue-500/30"
            : "focus:border-blue-500 focus:ring-blue-500/20",

        // Cards
        cardHover: isDark ? "hover:bg-blue-900/20" : "hover:bg-gray-50",

        // Accent
        accent: "text-blue-400",
        accentBg: "bg-blue-600/20",
    };
}
