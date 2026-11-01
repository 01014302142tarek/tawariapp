"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "../../i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { requestPasswordReset } from "@/app/actions/auth";
import { Logo } from "@/components/ui/Logo";

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
            errorRateLimit: "Too many reset attempts. Please try again in",
            minutes: "minutes",
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
            errorRateLimit: "محاولات كثيرة جداً. يرجى المحاولة مرة أخرى خلال",
            minutes: "دقائق",
        },
    };

    const text = translations[language as keyof typeof translations] || translations.en;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const redirectTo = `${window.location.origin}/${language}/reset-password`;
        const result = await requestPasswordReset(email, redirectTo);

        if (!result.success) {
            if (result.retryAfter) {
                const minutes = Math.ceil(result.retryAfter / 60);
                setError(`${text.errorRateLimit} ${minutes} ${text.minutes}`);
            } else {
                setError(result.error || text.errorGeneric);
            }
            setIsSubmitting(false);
        } else {
            setIsSuccess(true);
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen overflow-x-hidden ${isRTL ? 'font-cairo' : ''} ${isDark ? 'bg-[#060B18] text-white' : 'bg-gray-50 text-slate-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#0B1528] via-[#060B18] to-[#060B18]' : 'bg-gradient-to-br from-amber-50 via-white to-white'}`} />
                <div className={`absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? 'bg-blue-500/15 border border-blue-500/25' : 'bg-amber-500/5'}`} />
                <div className={`absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full blur-3xl ${isDark ? 'bg-blue-600/10' : 'bg-blue-500/5'}`} />
            </div>

            {/* Navigation */}
            <nav className={`relative z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#060B18]/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        <Link href={`/${language}`} className="group hover:opacity-90 transition-opacity">
                            <Logo isDark={isDark} />
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
                            <div className="w-20 h-20 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mx-auto mb-6 text-amber-500">
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
                                className={`inline-flex items-center gap-2 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} font-medium transition-colors`}
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
                                            ? "bg-[#0B1528] border-blue-500/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                                            : "bg-white border-gray-200 text-slate-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            } ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !email}
                                    className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
                                    className={`inline-flex items-center gap-2 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} font-medium text-sm transition-colors`}
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
