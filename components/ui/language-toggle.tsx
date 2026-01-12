"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";

interface LanguageToggleProps {
    isDark?: boolean;
    className?: string;
}

export function LanguageToggle({ isDark = false, className }: LanguageToggleProps) {
    const { language, setLanguage } = useI18n();

    // Show the OTHER language - the one user can switch to
    const targetLang = language === 'en' ? 'ar' : 'en';
    const targetFlag = targetLang === 'en' ? '🇬🇧' : '🇪🇬';
    const targetLabel = targetLang === 'en' ? 'EN' : 'عربي';

    return (
        <button
            onClick={() => setLanguage(targetLang)}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                isDark
                    ? "bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300"
                    : "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700",
                className
            )}
            title={targetLang === 'en' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
            <span>{targetFlag}</span>
            <span>{targetLabel}</span>
        </button>
    );
}
