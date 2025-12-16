"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "../../i18n";

// Logo Component
const LogoFull = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <svg className="h-10 w-10 flex-shrink-0" viewBox="0 0 100 90" fill="none">
            <defs>
                <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2DD4BF" />
                    <stop offset="50%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
            </defs>
            <path
                d="M50 85 C50 85 10 55 10 30 C10 15 22 5 35 5 C42 5 48 10 50 15 C52 10 58 5 65 5 C78 5 90 15 90 30 C90 55 50 85 50 85Z"
                fill="none"
                stroke="url(#heartGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5 45 L25 45 L35 25 L50 65 L65 35 L75 45 L95 45"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
        <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Tawari</span>
            <span className="text-gray-400">App</span>
        </span>
    </div>
);

// Icons
const Icons = {
    patient: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    doctor: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
            <path d="M11 2v2" />
            <path d="M5 2v2" />
            <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" />
            <path d="M8 15a6 6 0 0 0 12 0v-3" />
            <circle cx="20" cy="10" r="2" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
    ),
    arrow: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
    ),
    arrowLeft: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8l-4 4m0 0l4 4m-4-4h18" />
        </svg>
    ),
};

// Language Icon
const LanguageIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
);

// Language Toggle Component
function LanguageToggle() {
    const { language, setLanguage } = useI18n();

    return (
        <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors"
        >
            {LanguageIcon}
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
    );
}

// Feature Item Component
function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2 text-gray-300 text-sm">
            {Icons.check}
            <span>{text}</span>
        </div>
    );
}

// User Type Card Component
function UserTypeCard({
    type,
    icon,
    title,
    description,
    features,
    ctaText,
    ctaLink,
    isRTL,
}: {
    type: "patient" | "doctor";
    icon: React.ReactNode;
    title: string;
    description: string;
    features: string[];
    ctaText: string;
    ctaLink: string;
    isRTL: boolean;
}) {
    return (
        <div className="group relative bg-slate-800/50 border border-white/10 rounded-2xl p-6 md:p-8 hover:border-teal-500/50 hover:bg-slate-800/80 transition-all duration-300">
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/0 to-teal-600/0 group-hover:from-teal-500/5 group-hover:to-teal-600/10 transition-all duration-300" />

            <div className="relative z-10">
                {/* Icon */}
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${type === "patient" ? "from-teal-500/20 to-teal-600/10" : "from-amber-500/20 to-amber-600/10"} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}>
                    <span className={type === "patient" ? "text-teal-400" : "text-amber-400"}>
                        {icon}
                    </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{title}</h2>

                {/* Description */}
                <p className="text-gray-400 mb-6 leading-relaxed">{description}</p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                    {features.map((feature, idx) => (
                        <FeatureItem key={idx} text={feature} />
                    ))}
                </div>

                {/* CTA Button */}
                <Link
                    href={ctaLink}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg ${type === "patient"
                        ? "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 shadow-teal-500/25"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/25"
                        }`}
                >
                    <span>{ctaText}</span>
                </Link>
            </div>
        </div>
    );
}

export default function GetStartedPage() {
    const { t, isRTL, language } = useI18n();

    return (
        <div className={`min-h-screen bg-[#0F172A] text-white overflow-x-hidden ${isRTL ? 'font-cairo' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-[#0F172A] to-[#0F172A]" />
                <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        <Link href={`/${language}`} className="group hover:opacity-90 transition-opacity">
                            <LogoFull />
                        </Link>

                        <div className="flex items-center gap-3">
                            <LanguageToggle />
                            <Link
                                href={`/${language}/login`}
                                className="hidden sm:block text-gray-300 hover:text-white font-medium text-sm px-4 py-2 transition-colors"
                            >
                                {t.nav.login}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-4 md:mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">
                            {t.getStartedPage.title}
                        </span>
                    </h1>
                    <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
                        {t.getStartedPage.subtitle}
                    </p>
                </div>

                {/* User Type Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 max-w-4xl mx-auto mb-12 md:mb-16">
                    <UserTypeCard
                        type="patient"
                        icon={Icons.patient}
                        title={t.getStartedPage.patientTitle}
                        description={t.getStartedPage.patientDesc}
                        features={[
                            t.getStartedPage.patientFeature1,
                            t.getStartedPage.patientFeature2,
                            t.getStartedPage.patientFeature3,
                        ]}
                        ctaText={t.getStartedPage.patientCta}
                        ctaLink={`/${language}/register`}
                        isRTL={isRTL}
                    />

                    <UserTypeCard
                        type="doctor"
                        icon={Icons.doctor}
                        title={t.getStartedPage.doctorTitle}
                        description={t.getStartedPage.doctorDesc}
                        features={[
                            t.getStartedPage.doctorFeature1,
                            t.getStartedPage.doctorFeature2,
                            t.getStartedPage.doctorFeature3,
                        ]}
                        ctaText={t.getStartedPage.doctorCta}
                        ctaLink={`/${language}/doctor-onboarding`}
                        isRTL={isRTL}
                    />
                </div>

                {/* Login Link */}
                <div className="text-center">
                    <p className="text-gray-400 text-sm md:text-base">
                        {t.getStartedPage.alreadyHaveAccount}{" "}
                        <Link
                            href={`/${language}/login`}
                            className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
                        >
                            {t.getStartedPage.loginHere}
                        </Link>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-500 text-sm">{t.footer.copyright}</p>
                </div>
            </footer>
        </div>
    );
}
