"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useI18n } from "../../i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { getAvailableDoctors, getSpecializations, type DoctorForBooking } from "@/app/actions/appointments";

// Custom Logo Component
const LogoFull = ({ className = "", isDark = true }: { className?: string; isDark?: boolean }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <svg className="h-10 w-10 flex-shrink-0" viewBox="0 0 100 90" fill="none">
            <defs>
                <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2DD4BF" />
                    <stop offset="50%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
                <linearGradient id="heartShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0F766E" />
                    <stop offset="100%" stopColor="#134E4A" />
                </linearGradient>
            </defs>
            <path
                d="M50 85 C50 85 10 55 10 30 C10 15 22 5 35 5 C42 5 48 10 50 15 C52 10 58 5 65 5 C78 5 90 15 90 30 C90 55 50 85 50 85Z"
                fill="url(#heartShadow)"
                transform="translate(2, 2)"
                opacity="0.3"
            />
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
            <span className={isDark ? "text-white" : "text-slate-800"}>Tawari</span>
            <span className={isDark ? "text-gray-400" : "text-slate-500"}>App</span>
        </span>
    </div>
);

// Icons
const Icons = {
    menu: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    close: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    search: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    star: <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    starEmpty: <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    filter: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    language: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>,
    chevronDown: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
    verified: <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>,
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

// Translations
const translations = {
    en: {
        pageTitle: "Find Your Doctor",
        pageSubtitle: "Browse our network of verified healthcare professionals",
        searchPlaceholder: "Search doctors by name or specialty...",
        allSpecialties: "All Specialties",
        filters: "Filters",
        sortBy: "Sort by",
        rating: "Rating",
        feeLow: "Fee: Low to High",
        feeHigh: "Fee: High to Low",
        experience: "Experience",
        availableNow: "Available Now",
        yearsExp: "years",
        reviews: "reviews",
        perSession: "/ session",
        bookNow: "Book Now",
        viewProfile: "View Profile",
        noResults: "No doctors found",
        noResultsDesc: "Try adjusting your search or filters",
        loading: "Loading doctors...",
        verified: "Verified",
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
        pageTitle: "ابحث عن طبيبك",
        pageSubtitle: "تصفح شبكتنا من المتخصصين الصحيين المعتمدين",
        searchPlaceholder: "ابحث عن الأطباء بالاسم أو التخصص...",
        allSpecialties: "جميع التخصصات",
        filters: "تصفية",
        sortBy: "ترتيب حسب",
        rating: "التقييم",
        feeLow: "السعر: من الأقل للأعلى",
        feeHigh: "السعر: من الأعلى للأقل",
        experience: "الخبرة",
        availableNow: "متاح الآن",
        yearsExp: "سنوات",
        reviews: "تقييم",
        perSession: "/ جلسة",
        bookNow: "احجز الآن",
        viewProfile: "عرض الملف",
        noResults: "لم يتم العثور على أطباء",
        noResultsDesc: "حاول تعديل البحث أو الفلاتر",
        loading: "جاري تحميل الأطباء...",
        verified: "موثق",
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

function DoctorsPageContent() {
    const searchParams = useSearchParams();
    const { isRTL, language } = useI18n();
    const { isDark } = useGlobalTheme();
    const t = translations[language as keyof typeof translations] || translations.en;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [doctors, setDoctors] = useState<DoctorForBooking[]>([]);
    const [specializations, setSpecializations] = useState<{ id: string; name_en: string; name_ar: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"rating" | "fee_low" | "fee_high" | "experience">("rating");
    const [availableOnly, setAvailableOnly] = useState(false);

    // Theme-aware class helpers
    const bgMain = isDark ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]';
    const textPrimary = isDark ? 'text-white' : 'text-slate-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-slate-600';
    const textMuted = isDark ? 'text-gray-500' : 'text-slate-500';
    const borderColor = isDark ? 'border-white/5' : 'border-slate-200';
    const navBg = isDark ? 'bg-[#0F172A]/80' : 'bg-white/90';
    const cardBg = isDark
        ? 'bg-[#1E293B]/50 border border-white/5 hover:border-teal-500/30 hover:bg-[#1E293B]'
        : 'bg-white border-2 border-teal-100 shadow-lg shadow-teal-50 hover:shadow-xl hover:shadow-teal-100/60 hover:border-teal-300';
    const inputBg = isDark
        ? 'bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50'
        : 'bg-white border-slate-200 text-slate-900 placeholder-gray-400 focus:border-teal-500';

    // Track if initial specialty has been applied
    const initialSpecialtyApplied = useRef(false);

    // Get specialty from URL on mount - use useMemo for initial value
    const initialSpecialty = useMemo(() => {
        return searchParams.get("specialty") || "all";
    }, [searchParams]);

    // Apply initial specialty only once
    useEffect(() => {
        if (!initialSpecialtyApplied.current && initialSpecialty !== "all") {
            initialSpecialtyApplied.current = true;
            setSelectedSpecialty(initialSpecialty);
        }
    }, [initialSpecialty]);

    // Fetch doctors - wrapped in useCallback to prevent unnecessary re-renders
    const fetchDoctors = useCallback(async (
        specialty: string,
        search: string,
        available: boolean,
        sort: typeof sortBy
    ) => {
        setLoading(true);
        try {
            const { doctors: fetchedDoctors, error } = await getAvailableDoctors({
                specialization: specialty === "all" ? undefined : specialty,
                search: search || undefined,
                availableNow: available || undefined,
                sortBy: sort,
                limit: 50,
            });
            if (error) {
                console.error("Error fetching doctors:", error);
            }
            setDoctors(fetchedDoctors);
        } catch (err) {
            console.error("Failed to fetch doctors:", err);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch doctors when filters change (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDoctors(selectedSpecialty, searchQuery, availableOnly, sortBy);
        }, 300);
        return () => clearTimeout(timer);
    }, [selectedSpecialty, searchQuery, availableOnly, sortBy, fetchDoctors]);

    // Fetch specializations on mount
    useEffect(() => {
        let mounted = true;
        async function loadSpecializations() {
            const { specializations: specs } = await getSpecializations();
            if (mounted) {
                setSpecializations(specs);
            }
        }
        loadSpecializations();
        return () => { mounted = false; };
    }, []);

    return (
        <div className={`min-h-screen ${bgMain} ${textPrimary} overflow-x-hidden transition-colors duration-300 ${isRTL ? 'font-cairo' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-teal-900/20 via-[#0F172A] to-[#0F172A]' : 'bg-gradient-to-br from-teal-50 via-white to-white'}`} />
                <div className={`absolute top-1/4 -right-1/4 w-[800px] h-[800px] ${isDark ? 'bg-teal-500/10' : 'bg-teal-200/30'} rounded-full blur-3xl`} />
                {!isDark && <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-3xl" />}
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                            {t.pageTitle}
                        </h1>
                        <p className={`${textSecondary} text-lg max-w-2xl mx-auto`}>
                            {t.pageSubtitle}
                        </p>
                    </div>

                    {/* Search & Filters */}
                    <div className={`rounded-2xl p-4 sm:p-6 mb-8 ${isDark ? 'bg-slate-800/30 border border-white/5' : 'bg-white border border-slate-200 shadow-lg'}`}>
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <div className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 ${textMuted}`}>
                                    {Icons.search}
                                </div>
                                <input
                                    type="text"
                                    placeholder={t.searchPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border transition-all outline-none ${inputBg}`}
                                />
                            </div>

                            {/* Specialty Filter */}
                            <div className="relative min-w-[200px]">
                                <select
                                    value={selectedSpecialty}
                                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer transition-all outline-none ${inputBg}`}
                                >
                                    <option value="all">{t.allSpecialties}</option>
                                    {specializations.map((spec) => (
                                        <option key={spec.id} value={spec.name_en.toLowerCase()}>
                                            {isRTL ? spec.name_ar : spec.name_en}
                                        </option>
                                    ))}
                                </select>
                                <div className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none ${textMuted}`}>
                                    {Icons.chevronDown}
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="relative min-w-[180px]">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                    className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer transition-all outline-none ${inputBg}`}
                                >
                                    <option value="rating">{t.rating}</option>
                                    <option value="fee_low">{t.feeLow}</option>
                                    <option value="fee_high">{t.feeHigh}</option>
                                    <option value="experience">{t.experience}</option>
                                </select>
                                <div className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none ${textMuted}`}>
                                    {Icons.chevronDown}
                                </div>
                            </div>

                            {/* Available Now Toggle */}
                            <button
                                onClick={() => setAvailableOnly(!availableOnly)}
                                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                                    availableOnly
                                        ? 'bg-green-500 text-white'
                                        : isDark
                                            ? 'bg-slate-700/50 border border-white/10 hover:border-green-500/50'
                                            : 'bg-slate-100 border border-slate-200 hover:border-green-500'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${availableOnly ? 'bg-white animate-pulse' : 'bg-green-500'}`} />
                                {t.availableNow}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                                <p className={textSecondary}>{t.loading}</p>
                            </div>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <svg className={`w-10 h-10 ${textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>{t.noResults}</h3>
                            <p className={textSecondary}>{t.noResultsDesc}</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {doctors.map((doctor) => (
                                <div
                                    key={doctor.id}
                                    className={`group rounded-2xl p-5 transition-all ${cardBg}`}
                                >
                                    {/* Avatar */}
                                    <div className="relative mb-4">
                                        <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-teal-500/50 group-hover:border-teal-500 transition-colors">
                                            {doctor.avatar_url ? (
                                                <Image
                                                    src={doctor.avatar_url}
                                                    alt={doctor.full_name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="96px"
                                                />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center text-2xl font-bold ${isDark ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-600'}`}>
                                                    {doctor.full_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        {doctor.is_available_now && (
                                            <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                {t.availableNow}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <h3 className={`font-bold ${textPrimary}`}>
                                                {doctor.full_name.toLowerCase().startsWith('dr') ? doctor.full_name : `Dr. ${doctor.full_name}`}
                                            </h3>
                                            {Icons.verified}
                                        </div>

                                        {/* Specialty */}
                                        <p className="text-teal-500 text-sm font-medium mb-1">
                                            {doctor.specializations[0] || "General Practice"}
                                        </p>

                                        {/* Experience */}
                                        <p className={`${textMuted} text-xs mb-3`}>
                                            {doctor.years_of_experience || 0} {t.yearsExp}
                                        </p>

                                        {/* Rating */}
                                        <div className="flex items-center justify-center gap-1 mb-4">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span key={star}>
                                                        {star <= Math.floor(doctor.rating_average || 0) ? Icons.star : Icons.starEmpty}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className={`text-sm ${textSecondary}`}>
                                                ({doctor.rating_count || 0} {t.reviews})
                                            </span>
                                        </div>

                                        {/* Fee & Actions */}
                                        <div className={`pt-4 border-t ${borderColor}`}>
                                            <p className={`${textPrimary} font-bold mb-3`}>
                                                {doctor.consultation_fee || 0} {isRTL ? 'جنيه' : 'EGP'}
                                                <span className={`text-xs font-normal ${textMuted}`}> {t.perSession}</span>
                                            </p>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/${language}/doctors/${doctor.slug}`}
                                                    className={`flex-1 py-2 rounded-xl text-sm font-medium text-center transition-all ${
                                                        isDark
                                                            ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                                                            : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
                                                    }`}
                                                >
                                                    {t.viewProfile}
                                                </Link>
                                                <Link
                                                    href={`/${language}/login?redirect=/doctors/${doctor.id}`}
                                                    className="flex-1 bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm py-2 rounded-xl transition-all text-center"
                                                >
                                                    {t.bookNow}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className={`relative z-10 mt-20 ${isDark ? 'bg-gradient-to-b from-[#0F172A] to-[#0a0f1a]' : 'bg-gradient-to-b from-white to-slate-50'} border-t ${borderColor} transition-colors duration-300`}>
                {/* Decorative top wave */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50"></div>

                <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
                    {/* Main footer content */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
                        {/* Brand column */}
                        <div className="lg:col-span-1">
                            <Link href={`/${language}`} className="inline-block mb-6 group hover:scale-105 transition-transform">
                                <LogoFull isDark={isDark} />
                            </Link>
                            <p className={`${textMuted} text-sm mb-6 leading-relaxed max-w-xs`}>
                                {t.footerTagline}
                            </p>
                            {/* Social links placeholder */}
                            <div className="flex gap-3">
                                <div className={`w-9 h-9 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center cursor-pointer transition-all`}>
                                    <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </div>
                                <div className={`w-9 h-9 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center cursor-pointer transition-all`}>
                                    <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                                </div>
                                <div className={`w-9 h-9 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center cursor-pointer transition-all`}>
                                    <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                                </div>
                            </div>
                        </div>

                        {/* For Patients column */}
                        <div>
                            <h4 className={`font-bold text-base mb-6 ${textPrimary}`}>{t.footerForPatients}</h4>
                            <div className="flex flex-col gap-3.5">
                                <Link href={`/${language}/doctors`} className={`${textSecondary} text-sm hover:text-teal-500 hover:${isRTL ? 'mr' : 'ml'}-1 transition-all`}>{t.footerFindDoctors}</Link>
                                <Link href={`/${language}#how-it-works`} className={`${textSecondary} text-sm hover:text-teal-500 hover:${isRTL ? 'mr' : 'ml'}-1 transition-all`}>{t.footerHowItWorks}</Link>
                                <Link href={`/${language}/faq`} className={`${textSecondary} text-sm hover:text-teal-500 hover:${isRTL ? 'mr' : 'ml'}-1 transition-all`}>{t.footerFaq}</Link>
                            </div>
                        </div>

                        {/* For Doctors column */}
                        <div>
                            <h4 className={`font-bold text-base mb-6 ${textPrimary}`}>{t.footerForDoctorsTitle}</h4>
                            <div className="flex flex-col gap-3.5">
                                <Link href={`/${language}/doctor-onboarding`} className={`${textSecondary} text-sm hover:text-teal-500 hover:${isRTL ? 'mr' : 'ml'}-1 transition-all`}>{t.footerJoinAsDoctor}</Link>
                                <Link href={`/${language}/faq`} className={`${textSecondary} text-sm hover:text-teal-500 hover:${isRTL ? 'mr' : 'ml'}-1 transition-all`}>{t.footerDoctorFaq}</Link>
                            </div>
                        </div>

                        {/* Company column */}
                        <div>
                            <h4 className={`font-bold text-base mb-6 ${textPrimary}`}>{t.footerCompany}</h4>
                            <div className="flex flex-col gap-3.5">
                                <Link href={`/${language}/about`} className={`${textSecondary} text-sm hover:text-teal-500 hover:${isRTL ? 'mr' : 'ml'}-1 transition-all`}>{t.footerAboutUs}</Link>
                                <Link href={`/${language}/contact`} className={`${textSecondary} text-sm hover:text-teal-500 hover:${isRTL ? 'mr' : 'ml'}-1 transition-all`}>{t.footerContact}</Link>
                                <Link href={`/${language}/privacy`} className={`${textSecondary} text-sm hover:text-teal-500 hover:${isRTL ? 'mr' : 'ml'}-1 transition-all`}>{t.footerPrivacy}</Link>
                                <Link href={`/${language}/terms`} className={`${textSecondary} text-sm hover:text-teal-500 hover:${isRTL ? 'mr' : 'ml'}-1 transition-all`}>{t.footerTerms}</Link>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className={`border-t ${borderColor} pt-8`}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <span className={`text-xs font-medium ${textMuted}`}>{t.footerPaymentMethods}</span>
                                <div className="flex gap-2.5">
                                    <div className={`w-12 h-8 ${isDark ? 'bg-white/10 hover:bg-white/15' : 'bg-slate-200 hover:bg-slate-300'} rounded-md flex items-center justify-center text-xs font-bold ${textSecondary} transition-colors`}>
                                        VISA
                                    </div>
                                    <div className={`w-12 h-8 ${isDark ? 'bg-white/10 hover:bg-white/15' : 'bg-slate-200 hover:bg-slate-300'} rounded-md flex items-center justify-center text-xs font-bold ${textSecondary} transition-colors`}>
                                        MC
                                    </div>
                                    <div className={`w-12 h-8 ${isDark ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-red-100 hover:bg-red-200'} rounded-md flex items-center justify-center text-xs font-bold text-red-500 transition-colors`}>
                                        VC
                                    </div>
                                </div>
                            </div>
                            <p className={`text-xs ${textMuted}`}>{t.footerCopyright}</p>
                        </div>
                    </div>
                </div>

                {/* Decorative bottom gradient */}
                <div className="h-1 bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>
            </footer>
        </div>
    );
}

// Loading fallback for Suspense
function DoctorsPageLoading() {
    const { isDark } = useGlobalTheme();
    return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>Loading...</p>
            </div>
        </div>
    );
}

export default function DoctorsPage() {
    return (
        <Suspense fallback={<DoctorsPageLoading />}>
            <DoctorsPageContent />
        </Suspense>
    );
}
