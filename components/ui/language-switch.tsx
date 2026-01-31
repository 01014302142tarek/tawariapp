"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";

interface LanguageSwitchProps {
    isDark?: boolean;
    className?: string;
}

export function LanguageSwitch({ isDark = false, className }: LanguageSwitchProps) {
    const { language, setLanguage } = useI18n();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering dynamic content after mount
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration flag
        setMounted(true);
    }, []);

    const toggleLanguage = () => {
        setLanguage(language === "en" ? "ar" : "en");
    };

    // Show a neutral placeholder until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <button
                className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all font-medium text-sm",
                    isDark
                        ? "bg-white/5 border-white/10 text-gray-300"
                        : "bg-gray-100 border-gray-200 text-gray-600",
                    className
                )}
                disabled
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                </svg>
                <span className="w-6">...</span>
            </button>
        );
    }

    return (
        <button
            onClick={toggleLanguage}
            className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all font-medium text-sm",
                isDark
                    ? "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white"
                    : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-600 hover:text-gray-900",
                className
            )}
            title={language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
            </svg>
            <span>{language === "en" ? "عربي" : "EN"}</span>
        </button>
    );
}
