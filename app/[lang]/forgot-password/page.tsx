"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "../../i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { createClient } from "@/lib/supabase/client";

// Logo Component
const LogoFull = ({ className = "", isDark = true }: { className?: string; isDark?: boolean }) => (
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
            <span className={isDark ? "text-white" : "text-slate-900"}>Tawari</span>
            <span className={isDark ? "text-gray-400" : "text-gray-500"}>App</span>
        </span>
    </div>
);

// Icons
const Icons = {
    email: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    ),
    arrowLeft: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    ),
    check: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

// Language Toggle
function LanguageToggle({ isDark = true }: { isDark?: boolean }) {
    const { language, setLanguage } = useI18n();
    return (
        <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isDark
                ? "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"
                }`}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
    );
}

export default function ForgotPasswordPage() {
    const { isRTL, language } = useI18n();
    const { theme } = useGlobalTheme();
    const isDark = theme === "dark";

    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const translations = {
        en: {
            title: "Forgot Password?",
            subtitle: "Enter your email and we'll send you a reset link",
            email: "Email Address",
            submit: "Send Reset Link",
            sending: "Sending...",
            backToLogin: "Back to Login",
            successTitle: "Check Your Email",
            successMessage: "We've sent a password reset link to your email address. Please check your inbox and follow the instructions.",
            errorGeneric: "Failed to send reset link. Please try again.",
        },
        ar: {
            title: "نسيت كلمة المرور؟",
            subtitle: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين",
            email: "البريد الإلكتروني",
            submit: "إرسال رابط إعادة التعيين",
            sending: "جاري الإرسال...",
            backToLogin: "العودة لتسجيل الدخول",
            successTitle: "تحقق من بريدك الإلكتروني",
            successMessage: "لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد واتباع التعليمات.",
            errorGeneric: "فشل إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.",
        },
    };

    const text = translations[language as keyof typeof translations] || translations.en;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/${language}/reset-password`,
        });

        if (error) {
            setError(text.errorGeneric);
            setIsSubmitting(false);
        } else {
            setIsSuccess(true);
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen overflow-x-hidden ${isRTL ? 'font-cairo' : ''} ${isDark ? 'bg-[#0F172A] text-white' : 'bg-gray-50 text-slate-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-teal-900/20 via-[#0F172A] to-[#0F172A]' : 'bg-gradient-to-br from-teal-50 via-white to-white'}`} />
                <div className={`absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? 'bg-teal-500/10' : 'bg-teal-500/5'}`} />
                <div className={`absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full blur-3xl ${isDark ? 'bg-teal-500/5' : 'bg-teal-500/5'}`} />
            </div>

            {/* Navigation */}
            <nav className={`relative z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#0F172A]/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        <Link href={`/${language}`} className="group hover:opacity-90 transition-opacity">
                            <LogoFull isDark={isDark} />
                        </Link>
                        <div className="flex items-center gap-3">
                            <LanguageToggle isDark={isDark} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
                <div className="w-full max-w-md">
                    {isSuccess ? (
                        // Success State
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-6 text-teal-500">
                                {Icons.check}
                            </div>
                            <h1 className={`text-2xl sm:text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {text.successTitle}
                            </h1>
                            <p className={`text-sm sm:text-base mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {text.successMessage}
                            </p>
                            <Link
                                href={`/${language}/login`}
                                className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium transition-colors"
                            >
                                {isRTL ? null : Icons.arrowLeft}
                                {text.backToLogin}
                                {isRTL ? <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg> : null}
                            </Link>
                        </div>
                    ) : (
                        // Form State
                        <>
                            <div className="text-center mb-8">
                                <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {text.title}
                                </h1>
                                <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {text.subtitle}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="relative">
                                    <span className={`absolute top-1/2 -translate-y-1/2 ${isDark ? "text-gray-400" : "text-gray-500"} ${isRTL ? 'right-4' : 'left-4'}`}>
                                        {Icons.email}
                                    </span>
                                    <input
                                        type="email"
                                        placeholder={text.email}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={`w-full py-3.5 border rounded-xl transition-all outline-none ${isDark
                                            ? "bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20"
                                            : "bg-white border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                                            } ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !email}
                                    className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 shadow-lg shadow-teal-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                            {text.sending}
                                        </span>
                                    ) : (
                                        text.submit
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-6">
                                <Link
                                    href={`/${language}/login`}
                                    className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium text-sm transition-colors"
                                >
                                    {isRTL ? null : Icons.arrowLeft}
                                    {text.backToLogin}
                                    {isRTL ? <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg> : null}
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
