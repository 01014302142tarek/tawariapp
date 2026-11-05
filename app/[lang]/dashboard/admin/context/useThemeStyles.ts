"use client";

import { useGlobalTheme } from "@/app/context/GlobalThemeContext";

export function useThemeStyles() {
    const { isDark, theme } = useGlobalTheme();

    return {
        isDark,
        theme,
        // Background
        bgPrimary: isDark ? "bg-[#031326]" : "bg-[#F4F8FC]",
        bgSecondary: isDark ? "bg-[#08213D]" : "bg-white",
        bgTertiary: isDark ? "bg-[#0D2C4F]" : "bg-[#EBF3FA]",

        // Text
        textPrimary: isDark ? "text-[#FEFDFE]" : "text-[#042642]",
        textSecondary: isDark ? "text-[#CBD5E1]" : "text-[#334E68]",
        textMuted: isDark ? "text-[#94A3B8]" : "text-[#627D98]",

        // Borders
        borderPrimary: isDark ? "border-[#044C87]/30" : "border-[#D0E1F0]",
        borderSecondary: isDark ? "border-[#044C87]/20" : "border-[#E2E8F0]",

        // Cards
        cardBg: isDark ? "bg-[#08213D]/85" : "bg-white",
        cardBorder: isDark ? "border-[#044C87]/35" : "border-[#D0E1F0]",

        // Hover states
        hoverBg: isDark ? "hover:bg-[#0C2A4D]" : "hover:bg-[#EBF3FA]",
    };
}
