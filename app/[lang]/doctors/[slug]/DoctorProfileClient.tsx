"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/app/i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import type { DoctorProfileDetail } from "@/app/actions/appointments";

// Translations
const translations = {
    en: {
        backToDoctors: "Back to Doctors",
        verified: "Verified Doctor",
        yearsExperience: "Years Experience",
        patients: "Patients",
        reviews: "Reviews",
        about: "About",
        specializations: "Specializations",
        education: "Education",
        languages: "Languages Spoken",
        hospital: "Hospital/Clinic",
        consultationFee: "Consultation Fee",
        perSession: "per session",
        bookNow: "Book Appointment",
        availableNow: "Available Now",
        offline: "Currently Offline",
        patientReviews: "Patient Reviews",
        noReviews: "No reviews yet",
        beFirstReview: "Be the first to review this doctor after your consultation.",
        anonymous: "Anonymous Patient",
        // Nav
        navHowItWorks: "How It Works",
        navSpecialties: "Specialties",
        navDoctors: "Doctors",
        navForDoctors: "For Doctors",
        navLogin: "Login",
        navGetStarted: "Get Started",
        // Footer
        footerTagline: "Quality healthcare, accessible anywhere in Egypt.",
        footerForPatients: "For Patients",
        footerFindDoctors: "Find Doctors",
        footerHowItWorks: "How It Works",
        footerFaq: "FAQ",
        footerForDoctorsTitle: "For Doctors",
        footerJoinAsDoctor: "Join as Doctor",
        footerDoctorFaq: "Doctor FAQ",
        footerPricing: "Pricing",
        footerCompany: "Company",
        footerAboutUs: "About Us",
        footerContact: "Contact",
        footerPrivacy: "Privacy Policy",
        footerTerms: "Terms of Service",
        footerPaymentMethods: "Payment Methods",
        footerCopyright: "© 2024 TawariApp. All rights reserved.",
    },
    ar: {
        backToDoctors: "العودة للأطباء",
        verified: "طبيب موثق",
        yearsExperience: "سنوات الخبرة",
        patients: "المرضى",
        reviews: "التقييمات",
        about: "نبذة",
        specializations: "التخصصات",
        education: "التعليم",
        languages: "اللغات",
        hospital: "المستشفى/العيادة",
        consultationFee: "رسوم الاستشارة",
        perSession: "لكل جلسة",
        bookNow: "احجز موعد",
        availableNow: "متاح الآن",
        offline: "غير متصل حالياً",
        patientReviews: "تقييمات المرضى",
        noReviews: "لا توجد تقييمات بعد",
        beFirstReview: "كن أول من يقيم هذا الطبيب بعد استشارتك.",
        anonymous: "مريض مجهول",
        // Nav
        navHowItWorks: "كيف يعمل",
        navSpecialties: "التخصصات",
        navDoctors: "الأطباء",
        navForDoctors: "للأطباء",
        navLogin: "تسجيل الدخول",
        navGetStarted: "ابدأ الآن",
        // Footer
        footerTagline: "رعاية صحية عالية الجودة، متاحة في أي مكان في مصر.",
        footerForPatients: "للمرضى",
        footerFindDoctors: "ابحث عن أطباء",
        footerHowItWorks: "كيف يعمل",
        footerFaq: "الأسئلة الشائعة",
        footerForDoctorsTitle: "للأطباء",
        footerJoinAsDoctor: "انضم كطبيب",
        footerDoctorFaq: "أسئلة الأطباء",
        footerPricing: "الأسعار",
        footerCompany: "الشركة",
        footerAboutUs: "من نحن",
        footerContact: "اتصل بنا",
        footerPrivacy: "سياسة الخصوصية",
        footerTerms: "شروط الخدمة",
        footerPaymentMethods: "طرق الدفع",
        footerCopyright: "© 2024 تواري. جميع الحقوق محفوظة.",
    },
};

// Custom Logo Component
const LogoFull = ({ className = "", isDark = true }: { className?: string; isDark?: boolean }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <svg className="h-10 w-10 flex-shrink-0" viewBox="0 0 100 90" fill="none">
            <defs>
                <linearGradient id="heartGradientProfile" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2DD4BF" />
                    <stop offset="50%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
                <linearGradient id="heartShadowProfile" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0F766E" />
                    <stop offset="100%" stopColor="#134E4A" />
                </linearGradient>
            </defs>
            <path
                d="M50 85 C50 85 10 55 10 30 C10 15 22 5 35 5 C42 5 48 10 50 15 C52 10 58 5 65 5 C78 5 90 15 90 30 C90 55 50 85 50 85Z"
                fill="url(#heartShadowProfile)"
                transform="translate(2, 2)"
                opacity="0.3"
            />
            <path
                d="M50 85 C50 85 10 55 10 30 C10 15 22 5 35 5 C42 5 48 10 50 15 C52 10 58 5 65 5 C78 5 90 15 90 30 C90 55 50 85 50 85Z"
                fill="none"
                stroke="url(#heartGradientProfile)"
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
            <span className={isDark ? "text-white" : "text-slate-800"}>Tawari</span>
            <span className={isDark ? "text-gray-400" : "text-slate-500"}>App</span>
        </span>
    </div>
);

// Icons
const Icons = {
    menu: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    close: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    back: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
    verified: <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>,
    language: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>,
    briefcase: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    academic: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
    hospital: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    globe: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
    chat: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
};

// Theme Toggle Button
function ThemeToggle() {
    const { toggleTheme, isDark } = useGlobalTheme();
    return (
        <button
            onClick={toggleTheme}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${isDark
                ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:text-amber-300'
                : 'bg-teal-500 hover:bg-teal-600 border border-teal-500 text-slate-600 hover:text-slate-800'
                }`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
            ) : (
                <svg className="w-5 h-5 text-white" fill="white" viewBox="0 0 24 24">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    );
}

// Language Toggle Button
function LanguageToggle() {
    const { language, setLanguage } = useI18n();
    const { isDark } = useGlobalTheme();
    return (
        <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isDark
                ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700'
                }`}
        >
            {Icons.language}
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
    );
}

// Star Rating Component
function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`${sizeClasses[size]} ${star <= Math.floor(rating) ? 'text-amber-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
}

// Format date for reviews
function formatDate(dateString: string, language: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Format doctor name
function formatDoctorName(name: string): string {
    if (name.toLowerCase().startsWith('dr')) {
        return name;
    }
    return `Dr. ${name}`;
}

interface DoctorProfileClientProps {
    doctor: DoctorProfileDetail;
    lang: string;
}

export default function DoctorProfileClient({ doctor, lang }: DoctorProfileClientProps) {
    const { isRTL, language } = useI18n();
    const { isDark } = useGlobalTheme();
    const t = translations[language as keyof typeof translations] || translations.en;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Theme-aware class helpers
    const bgMain = isDark ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]';
    const textPrimary = isDark ? 'text-white' : 'text-slate-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-slate-600';
    const textMuted = isDark ? 'text-gray-500' : 'text-slate-500';
    const borderColor = isDark ? 'border-white/5' : 'border-slate-200';
    const navBg = isDark ? 'bg-[#0F172A]/80' : 'bg-white/90';
    const cardBg = isDark
        ? 'bg-[#1E293B]/50 border border-white/5'
        : 'bg-white border border-slate-200 shadow-lg';

    const doctorName = formatDoctorName(doctor.full_name);
    const specialty = doctor.specializations[0] || "General Practice";

    return (
        <div className={`min-h-screen ${bgMain} ${textPrimary} overflow-x-hidden transition-colors duration-300 ${isRTL ? 'font-cairo' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-teal-900/20 via-[#0F172A] to-[#0F172A]' : 'bg-gradient-to-br from-teal-50 via-white to-white'}`} />
                <div className={`absolute top-1/4 -right-1/4 w-[800px] h-[800px] ${isDark ? 'bg-teal-500/10' : 'bg-teal-200/30'} rounded-full blur-3xl`} />
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 ${navBg} backdrop-blur-xl border-b ${borderColor} transition-colors duration-300`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        <Link href={`/${language}`} className="group hover:opacity-90 transition-opacity">
                            <LogoFull isDark={isDark} />
                        </Link>

                        <div className="hidden lg:flex items-center gap-8">
                            <Link href={`/${language}#how-it-works`} className={`${textSecondary} hover:text-teal-500 transition-colors text-sm font-medium`}>{t.navHowItWorks}</Link>
                            <Link href={`/${language}#specialties`} className={`${textSecondary} hover:text-teal-500 transition-colors text-sm font-medium`}>{t.navSpecialties}</Link>
                            <Link href={`/${language}/doctors`} className="text-teal-500 transition-colors text-sm font-medium">{t.navDoctors}</Link>
                            <Link href={`/${language}#for-doctors`} className={`${textSecondary} hover:text-teal-500 transition-colors text-sm font-medium`}>{t.navForDoctors}</Link>
                        </div>

                        <div className="hidden lg:flex items-center gap-3">
                            <ThemeToggle />
                            <LanguageToggle />
                            <Link href={`/${language}/login`} className={`${textSecondary} hover:${textPrimary} font-medium text-sm px-4 py-2 transition-colors`}>{t.navLogin}</Link>
                            <Link href={`/${language}/get-started`} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-teal-500/25">{t.navGetStarted}</Link>
                        </div>

                        <div className="flex lg:hidden items-center gap-2">
                            <ThemeToggle />
                            <button className={`p-2 ${textSecondary} hover:${textPrimary}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                {mobileMenuOpen ? Icons.close : Icons.menu}
                            </button>
                        </div>
                    </div>

                    {mobileMenuOpen && (
                        <div className={`lg:hidden py-4 border-t ${borderColor}`}>
                            <div className="flex flex-col gap-4">
                                <Link href={`/${language}#how-it-works`} className={`${textSecondary} hover:text-teal-500 py-2`}>{t.navHowItWorks}</Link>
                                <Link href={`/${language}#specialties`} className={`${textSecondary} hover:text-teal-500 py-2`}>{t.navSpecialties}</Link>
                                <Link href={`/${language}/doctors`} className="text-teal-500 py-2">{t.navDoctors}</Link>
                                <Link href={`/${language}#for-doctors`} className={`${textSecondary} hover:text-teal-500 py-2`}>{t.navForDoctors}</Link>
                                <div className={`flex flex-col gap-3 pt-4 border-t ${borderColor}`}>
                                    <div className="flex items-center gap-3">
                                        <LanguageToggle />
                                        <Link href={`/${language}/login`} className={`${textSecondary} hover:${textPrimary} font-medium text-sm px-4 py-2 transition-colors`}>{t.navLogin}</Link>
                                    </div>
                                    <Link href={`/${language}/get-started`} className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-5 py-2 rounded-full text-center">{t.navGetStarted}</Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 pt-24 lg:pt-28 pb-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        href={`/${language}/doctors`}
                        className={`inline-flex items-center gap-2 mb-6 ${textSecondary} hover:text-teal-500 transition-colors`}
                    >
                        <span className={isRTL ? 'rotate-180' : ''}>{Icons.back}</span>
                        {t.backToDoctors}
                    </Link>

                    {/* Doctor Profile Card */}
                    <div className={`rounded-3xl overflow-hidden ${cardBg}`}>
                        {/* Header Section */}
                        <div className={`p-6 sm:p-8 ${isDark ? 'bg-gradient-to-r from-teal-900/30 to-teal-800/20' : 'bg-gradient-to-r from-teal-50 to-teal-100/50'}`}>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-teal-500/50 shadow-xl">
                                        {doctor.avatar_url ? (
                                            <Image
                                                src={doctor.avatar_url}
                                                alt={doctorName}
                                                fill
                                                className="object-cover"
                                                sizes="160px"
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center text-4xl font-bold ${isDark ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-600'}`}>
                                                {doctor.full_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    {doctor.is_available_now && (
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            {t.availableNow}
                                        </div>
                                    )}
                                </div>

                                {/* Basic Info */}
                                <div className="flex-1 text-center sm:text-start">
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                        <h1 className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>{doctorName}</h1>
                                        {Icons.verified}
                                    </div>
                                    <p className="text-teal-500 font-semibold text-lg mb-2">{specialty}</p>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                                        <StarRating rating={doctor.rating_average || 0} />
                                        <span className={textSecondary}>
                                            ({doctor.rating_average?.toFixed(1) || '0.0'}) · {doctor.rating_count || 0} {t.reviews}
                                        </span>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-4">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                                            {Icons.briefcase}
                                            <span className={`text-sm ${textSecondary}`}>
                                                {doctor.years_of_experience || 0} {t.yearsExperience}
                                            </span>
                                        </div>
                                        {doctor.hospital && (
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                                                {Icons.hospital}
                                                <span className={`text-sm ${textSecondary}`}>{doctor.hospital}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Verified Badge */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-500 text-sm font-medium">
                                        {Icons.verified}
                                        {t.verified}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-6 sm:p-8 grid md:grid-cols-3 gap-8">
                            {/* Left Column - Details */}
                            <div className="md:col-span-2 space-y-6">
                                {/* About */}
                                {doctor.bio && (
                                    <div>
                                        <h2 className={`text-lg font-bold mb-3 ${textPrimary}`}>{t.about}</h2>
                                        <p className={`${textSecondary} leading-relaxed`}>{doctor.bio}</p>
                                    </div>
                                )}

                                {/* Specializations */}
                                {doctor.specializations.length > 0 && (
                                    <div>
                                        <h2 className={`text-lg font-bold mb-3 ${textPrimary}`}>{t.specializations}</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {doctor.specializations.map((spec, index) => (
                                                <span
                                                    key={index}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${isDark ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-100 text-teal-700'}`}
                                                >
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {doctor.education && (
                                    <div>
                                        <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${textPrimary}`}>
                                            {Icons.academic}
                                            {t.education}
                                        </h2>
                                        <p className={textSecondary}>{doctor.education}</p>
                                    </div>
                                )}

                                {/* Languages */}
                                {doctor.languages && doctor.languages.length > 0 && (
                                    <div>
                                        <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${textPrimary}`}>
                                            {Icons.globe}
                                            {t.languages}
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {doctor.languages.map((lang, index) => (
                                                <span
                                                    key={index}
                                                    className={`px-3 py-1.5 rounded-full text-sm ${isDark ? 'bg-white/5 text-gray-300' : 'bg-slate-100 text-slate-700'}`}
                                                >
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reviews Section */}
                                <div>
                                    <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
                                        {Icons.chat}
                                        {t.patientReviews}
                                    </h2>
                                    {doctor.reviews_preview && doctor.reviews_preview.length > 0 ? (
                                        <div className="space-y-4">
                                            {doctor.reviews_preview.map((review) => (
                                                <div
                                                    key={review.id}
                                                    className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <p className={`font-medium ${textPrimary}`}>
                                                                {review.patient_name || t.anonymous}
                                                            </p>
                                                            <p className={`text-xs ${textMuted}`}>
                                                                {formatDate(review.created_at, language)}
                                                            </p>
                                                        </div>
                                                        <StarRating rating={review.rating} size="sm" />
                                                    </div>
                                                    {review.comment && (
                                                        <p className={`${textSecondary} text-sm`}>{review.comment}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                                            <p className={textMuted}>{t.noReviews}</p>
                                            <p className={`text-sm mt-1 ${textMuted}`}>{t.beFirstReview}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Booking Card */}
                            <div className="md:col-span-1">
                                <div className={`sticky top-28 rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
                                    <div className="text-center mb-6">
                                        <p className={`text-sm ${textMuted} mb-1`}>{t.consultationFee}</p>
                                        <p className={`text-3xl font-bold ${textPrimary}`}>
                                            {doctor.consultation_fee || 0} {isRTL ? 'جنيه' : 'EGP'}
                                        </p>
                                        <p className={`text-sm ${textMuted}`}>{t.perSession}</p>
                                    </div>

                                    {/* Availability Status */}
                                    <div className={`flex items-center justify-center gap-2 mb-6 px-4 py-2 rounded-full ${
                                        doctor.is_available_now
                                            ? 'bg-green-500/10 text-green-500'
                                            : isDark ? 'bg-white/5 text-gray-400' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full ${doctor.is_available_now ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                        {doctor.is_available_now ? t.availableNow : t.offline}
                                    </div>

                                    {/* Book Button */}
                                    <Link
                                        href={`/${language}/login?redirect=/doctors/${doctor.slug}`}
                                        className="block w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl transition-all text-center shadow-lg shadow-teal-500/25"
                                    >
                                        {t.bookNow}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className={`${isDark ? 'bg-[#0a0f1a]' : 'bg-slate-50'} border-t ${borderColor} py-16 px-4 transition-colors duration-300`}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        <div className="lg:col-span-1">
                            <Link href={`/${language}`} className="block mb-6 group hover:opacity-90 transition-opacity">
                                <LogoFull isDark={isDark} />
                            </Link>
                            <p className={`${textMuted} text-sm mb-6 max-w-xs`}>{t.footerTagline}</p>
                        </div>
                        <div>
                            <h4 className={`font-bold mb-4 ${textPrimary}`}>{t.footerForPatients}</h4>
                            <div className="flex flex-col gap-3">
                                <Link href={`/${language}/doctors`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footerFindDoctors}</Link>
                                <Link href={`/${language}#how-it-works`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footerHowItWorks}</Link>
                                <Link href={`/${language}/faq`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footerFaq}</Link>
                            </div>
                        </div>
                        <div>
                            <h4 className={`font-bold mb-4 ${textPrimary}`}>{t.footerForDoctorsTitle}</h4>
                            <div className="flex flex-col gap-3">
                                <Link href={`/${language}/doctor-onboarding`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footerJoinAsDoctor}</Link>
                                <Link href={`/${language}/faq`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footerDoctorFaq}</Link>
                                <span className={`${textSecondary} text-sm hover:text-teal-500 transition-colors cursor-default`}>{t.footerPricing}</span>
                            </div>
                        </div>
                        <div>
                            <h4 className={`font-bold mb-4 ${textPrimary}`}>{t.footerCompany}</h4>
                            <div className="flex flex-col gap-3">
                                <Link href={`/${language}/about`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footerAboutUs}</Link>
                                <Link href={`/${language}/contact`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footerContact}</Link>
                                <Link href={`/${language}/privacy`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footerPrivacy}</Link>
                                <Link href={`/${language}/terms`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footerTerms}</Link>
                            </div>
                        </div>
                    </div>

                    <div className={`border-t ${borderColor} pt-8`}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <span className={`text-xs ${textMuted}`}>{t.footerPaymentMethods}</span>
                                <div className="flex gap-2">
                                    <div className={`w-10 h-6 ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded flex items-center justify-center text-xs font-bold ${textSecondary}`}>VISA</div>
                                    <div className={`w-10 h-6 ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded flex items-center justify-center text-xs font-bold ${textSecondary}`}>MC</div>
                                    <div className={`w-10 h-6 ${isDark ? 'bg-red-500/20' : 'bg-red-100'} rounded flex items-center justify-center text-xs font-bold text-red-500`}>VC</div>
                                </div>
                            </div>
                            <p className={`text-xs ${textMuted}`}>{t.footerCopyright}</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
