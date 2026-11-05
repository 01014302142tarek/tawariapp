"use client";

import { useGlobalTheme } from "@/app/context/GlobalThemeContext";

export function useThemeStyles() {
    const { isDark } = useGlobalTheme();

    return {
        isDark,
        // Background
        pageBg: isDark ? "bg-[#031326]" : "bg-[#F4F8FC]",
        cardBg: isDark ? "bg-[#08213D]/85 border-[#044C87]/35" : "bg-white border-[#D0E1F0] shadow-sm",

        // Text
        textPrimary: isDark ? "text-[#FEFDFE]" : "text-[#042642]",
        textSecondary: isDark ? "text-[#CBD5E1]" : "text-[#334E68]",
        textMuted: isDark ? "text-[#94A3B8]" : "text-[#627D98]",

        // Borders
        border: isDark ? "border-[#044C87]/30" : "border-[#D0E1F0]",
        divider: isDark ? "border-[#044C87]/40" : "border-[#E2E8F0]",

        // Inputs
        inputBg: isDark
            ? "bg-[#061D38] border-[#044C87]/40 text-[#FEFDFE] placeholder:text-gray-400"
            : "bg-white border-[#D0E1F0] text-[#042642] placeholder:text-gray-400",
        inputFocus: isDark
            ? "focus:border-[#FD614B] focus:ring-[#FD614B]/30"
            : "focus:border-[#044C87] focus:ring-[#044C87]/20",

        // Cards
        cardHover: isDark ? "hover:bg-[#0C2A4D]" : "hover:bg-[#EBF3FA]",

        // Accent
        accent: "text-[#FD614B]",
        accentBg: "bg-[#FD614B]/15",
    };
}
