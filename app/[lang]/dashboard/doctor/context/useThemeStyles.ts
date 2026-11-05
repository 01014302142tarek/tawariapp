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
        pageBg: isDark ? "bg-[#031326]" : "bg-[#F4F8FC]",

        // Cards
        cardBg: isDark ? "bg-[#08213D]/85 border-[#044C87]/35" : "bg-white border-[#D0E1F0] shadow-sm",
        cardHover: isDark ? "hover:bg-[#0C2A4D]" : "hover:bg-[#EBF3FA]",

        // Text
        textPrimary: isDark ? "text-[#FEFDFE]" : "text-[#042642]",
        textSecondary: isDark ? "text-[#CBD5E1]" : "text-[#334E68]",
        textMuted: isDark ? "text-[#94A3B8]" : "text-[#627D98]",

        // Borders
        border: isDark ? "border-[#044C87]/30" : "border-[#D0E1F0]",
        borderLight: isDark ? "border-[#044C87]/40" : "border-[#E2E8F0]",
        divider: isDark ? "divide-[#044C87]/30" : "divide-[#E2E8F0]",

        // Inputs
        inputBg: isDark
            ? "bg-[#061D38] border-[#044C87]/40 text-[#FEFDFE] placeholder-gray-400"
            : "bg-white border-[#D0E1F0] text-[#042642] placeholder-gray-400",
        inputFocus: "focus:outline-none focus:border-[#FD614B] focus:ring-1 focus:ring-[#FD614B]/40",

        // Buttons
        buttonSecondary: isDark
            ? "bg-[#061D38] text-blue-100 border border-[#044C87]/40 hover:text-white hover:border-[#FD614B]"
            : "bg-slate-100 text-slate-700 border border-slate-200 hover:text-slate-900 hover:bg-slate-200",
        buttonSecondaryActive: "bg-[#FD614B] text-white border border-[#FD614B]",

        // Section headers
        sectionHeader: isDark ? "text-[#FEFDFE]" : "text-[#042642]",

        // Avatar border
        avatarBorder: "border-[#FD614B]/70 shadow-[0_0_12px_rgba(253,97,75,0.35)]",

        // Empty states
        emptyStateBg: isDark ? "bg-[#061D38]" : "bg-[#F4F8FC]",
        emptyStateText: isDark ? "text-slate-400" : "text-slate-500",
    };
}
