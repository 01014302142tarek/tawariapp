"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "../../i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { useAuth } from "@/app/context/AuthContext";
import Footer from "@/components/landing/Footer";
import { Logo } from "@/components/ui/Logo";
import { assessSymptoms, type TriageResponse, type TriageDoctorSuggestion } from "@/app/actions/triage";
import Image from "next/image";

export default function TriagePage() {
    const { isRTL, language } = useI18n();
    const { isDark, toggleTheme } = useGlobalTheme();
    const { user } = useAuth();

    const [inputQuery, setInputQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TriageResponse | null>(null);

    const handleSearch = async (queryToRun?: string) => {
        const text = (queryToRun || inputQuery).trim();
        if (!text || isLoading) return;

        setIsLoading(true);
        try {
            const res = await assessSymptoms({
                message: text,
                language: language as "ar" | "en",
            });
            setResult(res);
        } catch (err) {
            console.error("Triage error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const commonScenarios = isRTL
        ? [
            { text: "عندي مغص في الجنب اليمين مع سخونية وترجيع", label: "مغص وسخونية" },
            { text: "صداع نصفي حاد جداً ودوخة وزغللة في العين", label: "صداع ودوخة" },
            { text: "نغزة وألم ضاغط في منتصف الصدر بيسمع في دراعي الشمال", label: "ألم في الصدر" },
            { text: "طفح جلدي أحمر مع هرش وحكة شديدة في الجسم", label: "حساسية وطفح جلدي" },
            { text: "طفلي عنده حرارة 39 ورشح وكحة مستمرة من الصبح", label: "أعراض أطفال" },
            { text: "ألم شديد في أسفل الظهر وممتد للرجل مع تنميل", label: "ألم ظهر وفقرات" },
        ]
        : [
            { text: "Severe right-side abdominal pain with fever and nausea", label: "Stomach & Fever" },
            { text: "Severe throbbing migraine with dizziness and blurry vision", label: "Migraine & Dizziness" },
            { text: "Heavy chest pressure radiating to left arm", label: "Chest Pain" },
            { text: "Itchy red skin rash across arms and chest", label: "Skin Rash & Itch" },
            { text: "My 3-year-old has 39°C fever and persistent coughing", label: "Pediatric Fever" },
            { text: "Lower back pain radiating down the leg with numbness", label: "Back Pain & Numbness" },
        ];

    return (
        <div
            className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? "bg-[#031326] text-[#FEFDFE]" : "bg-[#F4F8FC] text-[#042642]"
                }`}
            dir={isRTL ? "rtl" : "ltr"}
        >
            {/* Header */}
            <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${isDark ? "bg-[#031326]/85 border-[#044C87]/30" : "bg-[#F4F8FC]/90 border-[#D0E1F0]"
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href={`/${language}`} className="flex items-center">
                            <Logo />
                        </Link>
                        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <Link href={`/${language}/doctors`} className="hover:text-[#FD614B] transition-colors">
                                {isRTL ? "الأطباء" : "Doctors"}
                            </Link>
                            <Link href={`/${language}/dashboard/patient/urgent-care`} className="hover:text-[#FD614B] transition-colors flex items-center gap-1.5 text-[#FD614B]">
                                <span className="w-2 h-2 rounded-full bg-[#FD614B] animate-ping"></span>
                                {isRTL ? "طوارئ 24/7" : "Urgent Care 24/7"}
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-full border transition-colors ${isDark ? "border-slate-800 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                            aria-label="Toggle theme"
                        >
                            {isDark ? (
                                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        <Link
                            href={`/${language === "ar" ? "en" : "ar"}/triage`}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${isDark ? "border-slate-800 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-100"
                                }`}
                        >
                            {language === "ar" ? "English" : "العربية"}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Hero & Triage */}
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 space-y-10">
                {/* Hero Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#044C87]/15 text-[#FD614B] border border-[#FD614B]/30 text-xs font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-[#FD614B] animate-pulse"></span>
                        {isRTL ? "اختار طبيبك بسهولة 🤖" : "Choose Your Doctor with AI"}
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                        {isRTL ? "لو محتار ومش عارف أي تخصص تحجز؟" : "Not sure which specialist to book?"}
                        <br />
                        <span className="bg-gradient-to-r from-[#0C67B3] via-[#FD614B] to-[#FF8270] bg-clip-text text-transparent">
                            {isRTL ? "اكتب أعراضك وهيساعدك تختار التخصص والدكتور الأنسب" : "Let AI guide you to the right doctor in seconds"}
                        </span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {isRTL
                            ? "اكتب أعراضك باللغة العامية أو الفصحى، وهيساعدك النظام فوراً في توجيهك طبياً، وتنبيهك في حالات الطوارئ القصوى، وترشيح التخصص الأنسب مع أفضل الأطباء المعتمدين لحالتك."
                            : "Describe your symptoms in your own words. Tabibi AI categorizes urgency, detects red flags, matches the exact specialty, and connects you to verified doctors."}
                    </p>
                </div>

                {/* Input Card */}
                <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl transition-all ${isDark ? "bg-[#08213D] border-[#044C87]/40 shadow-[0_0_30px_rgba(4,76,135,0.15)]" : "bg-white border-[#D0E1F0] shadow-xl"
                    }`}>
                    <label className="block text-sm font-bold mb-2">
                        {isRTL ? "ما هي الأعراض التي تشعر بها؟" : "What symptoms are you experiencing?"}
                    </label>

                    <div className="relative">
                        <textarea
                            rows={3}
                            value={inputQuery}
                            onChange={(e) => setInputQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                            placeholder={
                                isRTL
                                    ? "مثال: عندي مغص في الجنب اليمين مع سخونية وترجيع من امبارح..."
                                    : "e.g. Sharp pain in the lower right abdomen with mild fever..."
                            }
                            className={`w-full p-4 rounded-2xl border text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#FD614B]/40 focus:border-[#FD614B] resize-none transition-all ${isDark
                                ? "bg-[#031326] border-[#044C87]/40 text-[#FEFDFE] placeholder-slate-400"
                                : "bg-[#F4F8FC] border-[#D0E1F0] text-[#042642] placeholder-slate-400"
                                }`}
                        />

                        <button
                            onClick={() => handleSearch()}
                            disabled={!inputQuery.trim() || isLoading}
                            className="mt-3 sm:mt-0 sm:absolute sm:bottom-3 sm:left-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-[#FD614B]/30 disabled:opacity-40 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>{isRTL ? "جارٍ الفحص الطبي..." : "Analyzing..."}</span>
                                </>
                            ) : (
                                <>
                                    <span>{isRTL ? "اختار طبيبي الآن 🩺" : "Find My Doctor 🩺"}</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Common scenarios chips */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                            {isRTL ? "أو جرّب أحد الأمثلة التالية بضغطة واحدة:" : "Or try one of these common cases:"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {commonScenarios.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setInputQuery(item.text);
                                        handleSearch(item.text);
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isDark
                                        ? "bg-[#031326] border-[#044C87]/40 text-[#CBD5E1] hover:border-[#FD614B] hover:text-[#FD614B]"
                                        : "bg-[#F4F8FC] border-[#D0E1F0] text-[#334E68] hover:border-[#FD614B] hover:text-[#FD614B]"
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Triage Results Display */}
                {result && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Red Flag Alert */}
                        {result.urgencyLevel === "emergency" && (
                            <div className="p-6 rounded-3xl bg-red-600/10 border-2 border-red-600 text-red-900 dark:text-red-100 shadow-xl space-y-4">
                                <div className="flex items-center gap-3 text-red-600 dark:text-red-400 font-extrabold text-xl">
                                    <svg className="w-8 h-8 shrink-0 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <h2>{isRTL ? result.titleAr : result.titleEn}</h2>
                                </div>

                                <p className="text-sm sm:text-base leading-relaxed font-medium">
                                    {isRTL ? result.summaryAr : result.summaryEn}
                                </p>

                                <div className="p-4 rounded-2xl bg-red-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                                    <div className="space-y-1 text-center sm:text-start">
                                        <h4 className="font-bold text-base">
                                            {isRTL ? "خدمة الإسعاف المصرية (123)" : "Emergency Ambulance (123)"}
                                        </h4>
                                        <p className="text-xs text-red-100">
                                            {isRTL ? result.adviceAr : result.adviceEn}
                                        </p>
                                    </div>

                                    <a
                                        href={`tel:${result.emergencyAction?.ambulanceNumber || "123"}`}
                                        className="px-6 py-3 rounded-xl bg-white text-red-700 font-extrabold text-base shadow hover:bg-red-50 transition-colors shrink-0 flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span>{isRTL ? "اتصل بـ 123 الآن" : "Call 123 Now"}</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Urgent Care Recommendation */}
                        {result.urgencyLevel === "urgent" && (
                            <div className={`p-6 rounded-3xl border shadow-lg space-y-4 ${isDark
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-100"
                                : "bg-amber-50 border-amber-300 text-amber-950"
                                }`}>
                                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 font-extrabold text-xl">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <h2>{isRTL ? result.titleAr : result.titleEn}</h2>
                                </div>

                                <p className="text-sm sm:text-base leading-relaxed">
                                    {isRTL ? result.summaryAr : result.summaryEn}
                                </p>

                                <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                                    <Link
                                        href={`/${language}/dashboard/patient/urgent-care`}
                                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-sm shadow-md hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>{isRTL ? "⚡ الدخول لطابور الطوارئ الفوري الآن" : "⚡ Enter Urgent Queue Now"}</span>
                                    </Link>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center sm:text-start">
                                        {isRTL ? "طبيب عام / طوارئ سيتصل بك بالفيديو في خلال دقائق" : "A general/urgent doctor will connect with you via video in minutes"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Routine Recommendation */}
                        {result.urgencyLevel === "routine" && (
                            <div className={`p-6 rounded-3xl border shadow-md space-y-4 ${isDark
                                ? "bg-[#08213D] border-[#044C87]/40 text-[#FEFDFE]"
                                : "bg-white border-[#D0E1F0] text-[#042642]"
                                }`}>
                                <div className="flex items-center gap-3 text-[#0C67B3] dark:text-[#90C2F9] font-extrabold text-xl">
                                    <svg className="w-7 h-7 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h2>{isRTL ? result.titleAr : result.titleEn}</h2>
                                </div>

                                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                                    {isRTL ? result.summaryAr : result.summaryEn}
                                </p>

                                <div className="p-4 rounded-2xl bg-[#044C87]/10 dark:bg-[#044C87]/20 border border-[#044C87]/30 text-xs sm:text-sm text-[#044C87] dark:text-[#90C2F9] font-medium">
                                    💡 {isRTL ? result.adviceAr : result.adviceEn}
                                </div>
                            </div>
                        )}

                        {/* Top Doctor Cards */}
                        {result.suggestedDoctors.length > 0 && (
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-extrabold text-lg sm:text-xl">
                                        {isRTL ? "أفضل الأطباء الموصى بهم في هذا التخصص:" : "Recommended Specialists:"}
                                    </h3>
                                    <Link
                                        href={`/${language}/doctors?specialty=${encodeURIComponent(result.primarySpecialtyEn)}`}
                                        className="text-sm font-semibold text-[#FD614B] hover:underline"
                                    >
                                        {isRTL ? "عرض جميع الأطباء ←" : "View All Doctors →"}
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {result.suggestedDoctors.map((doc: TriageDoctorSuggestion) => (
                                        <div
                                            key={doc.id}
                                            className={`p-5 rounded-3xl border flex flex-col justify-between transition-all hover:shadow-xl ${isDark
                                                ? "bg-[#08213D] border-[#044C87]/40 hover:border-[#FD614B]/60 hover:shadow-[0_0_20px_rgba(4,76,135,0.25)]"
                                                : "bg-white border-[#D0E1F0] hover:border-[#FD614B] hover:shadow-xl"
                                                }`}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                                                        {doc.avatarUrl ? (
                                                            <Image
                                                                src={doc.avatarUrl}
                                                                alt={doc.fullName}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center font-bold text-lg text-slate-500">
                                                                {doc.fullName.charAt(0)}
                                                            </div>
                                                        )}
                                                        {doc.isAvailableNow && (
                                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-base truncate">
                                                            {doc.fullName}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                            {isRTL ? doc.specialtyAr : doc.specialty}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold mt-0.5">
                                                            <span>★ {doc.ratingAverage.toFixed(1)}</span>
                                                            <span className="text-slate-400">•</span>
                                                            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal">
                                                                {doc.yearsOfExperience} {isRTL ? "سنوات خبرة" : "years exp"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                    <span>{isRTL ? "سعر الجلسة:" : "Session Fee:"}</span>
                                                    <span className="font-extrabold text-sm text-[#044C87] dark:text-[#FEFDFE] font-black">
                                                        {doc.consultationFee} EGP
                                                    </span>
                                                </div>
                                            </div>

                                            <Link
                                                href={
                                                    user
                                                        ? `/${language}/dashboard/patient/doctors?book=${doc.id}`
                                                        : `/${language}/login?redirect=${encodeURIComponent(`/${language}/dashboard/patient/doctors?book=${doc.id}`)}`
                                                }
                                                className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white font-bold text-xs text-center transition-all shadow-md shadow-[#FD614B]/25 block"
                                            >
                                                {isRTL ? "حجز موعد استشارة" : "Book Consultation"}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}

