"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "../../i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

// Icons
const Icons = {
    email: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    ),
    check: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default function VerifyEmailPage() {
    const { isRTL, language } = useI18n();
    const { theme } = useGlobalTheme();
    const { user } = useAuth();
    const isDark = theme === "dark";

    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendError, setResendError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);

    const translations = {
        en: {
            title: "Verify Your Email",
            subtitle: "We've sent a verification link to",
            instructions: "Click the link in the email to verify your account. If you don't see it, check your spam folder.",
            resend: "Resend Email",
            resending: "Sending...",
            resendSuccess: "Verification email sent!",
            resendError: "Failed to resend. Please try again.",
            resendIn: "Resend in",
            seconds: "s",
            alreadyVerified: "Already verified?",
            login: "Login here",
            verifiedTitle: "Email Verified!",
            verifiedMessage: "Your email has been verified. You can now access all features.",
            goToDashboard: "Go to Dashboard",
        },
        ar: {
            title: "تحقق من بريدك الإلكتروني",
            subtitle: "لقد أرسلنا رابط التحقق إلى",
            instructions: "انقر على الرابط في البريد الإلكتروني للتحقق من حسابك. إذا لم تجده، تحقق من مجلد البريد العشوائي.",
            resend: "إعادة إرسال البريد",
            resending: "جاري الإرسال...",
            resendSuccess: "تم إرسال بريد التحقق!",
            resendError: "فشل إعادة الإرسال. يرجى المحاولة مرة أخرى.",
            resendIn: "إعادة الإرسال خلال",
            seconds: "ث",
            alreadyVerified: "تم التحقق بالفعل؟",
            login: "سجل دخولك هنا",
            verifiedTitle: "تم التحقق من البريد الإلكتروني!",
            verifiedMessage: "تم التحقق من بريدك الإلكتروني. يمكنك الآن الوصول إلى جميع الميزات.",
            goToDashboard: "الذهاب إلى لوحة التحكم",
        },
    };

    const text = translations[language as keyof typeof translations] || translations.en;

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResend = async () => {
        if (countdown > 0 || !user?.email) return;

        setIsResending(true);
        setResendError(null);
        setResendSuccess(false);

        const supabase = createClient();
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: user.email,
        });

        if (error) {
            setResendError(text.resendError);
        } else {
            setResendSuccess(true);
            setCountdown(60); // 60 second cooldown
        }
        setIsResending(false);
    };

    // Check if email is verified
    const isVerified = user?.email_confirmed_at != null;

    return (
        <div className={`min-h-screen overflow-x-hidden ${isRTL ? 'font-cairo' : ''} ${isDark ? 'bg-[#031326] text-white' : 'bg-gray-50 text-slate-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#08213D] via-[#031326] to-[#031326]' : 'bg-gradient-to-br from-[#FEFDFE] via-[#F4F8FC] to-[#FEFDFE]'}`} />
                <div className={`absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? 'bg-[#044C87]/15 border border-[#044C87]/30' : 'bg-[#FD614B]/5'}`} />
                <div className={`absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full blur-3xl ${isDark ? 'bg-gradient-to-r from-[#FD614B] to-[#E84D37]/10' : 'bg-blue-500/5'}`} />
            </div>

            {/* Navigation */}
            <nav className={`relative z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#031326]/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>
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
                <div className="w-full max-w-md text-center">
                    {isVerified ? (
                        // Verified State
                        <>
                            <div className="w-24 h-24 rounded-full bg-[#044C87]/15 border border-[#044C87]/30 flex items-center justify-center mx-auto mb-6 text-[#FD614B]">
                                {Icons.check}
                            </div>
                            <h1 className={`text-2xl sm:text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {text.verifiedTitle}
                            </h1>
                            <p className={`text-sm sm:text-base mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {text.verifiedMessage}
                            </p>
                            <Link
                                href={`/${language}/dashboard/patient`}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 shadow-lg shadow-blue-500/25 transition-all"
                            >
                                {text.goToDashboard}
                            </Link>
                        </>
                    ) : (
                        // Pending Verification State
                        <>
                            <div className="w-24 h-24 rounded-full bg-[#044C87]/15 border border-[#044C87]/30 flex items-center justify-center mx-auto mb-6 text-[#FD614B]">
                                {Icons.email}
                            </div>
                            <h1 className={`text-2xl sm:text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {text.title}
                            </h1>
                            <p className={`text-sm sm:text-base mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {text.subtitle}
                            </p>
                            <p className={`text-base font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {user?.email || "your email"}
                            </p>
                            <p className={`text-sm mb-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {text.instructions}
                            </p>

                            {/* Resend Status */}
                            {resendSuccess && (
                                <div className="p-3 rounded-xl bg-[#044C87]/15 border border-[#044C87]/30 border border-[#FD614B]/20 text-[#044C87] dark:text-[#FD614B] text-sm mb-4">
                                    {text.resendSuccess}
                                </div>
                            )}
                            {resendError && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-sm mb-4">
                                    {resendError}
                                </div>
                            )}

                            {/* Resend Button */}
                            <button
                                onClick={handleResend}
                                disabled={isResending || countdown > 0}
                                className={`w-full py-3.5 rounded-xl font-bold transition-all mb-4 ${countdown > 0 || isResending
                                    ? isDark
                                        ? "bg-slate-800 text-gray-500 cursor-not-allowed"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 text-white shadow-lg shadow-blue-500/25"
                                    }`}
                            >
                                {isResending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></span>
                                        {text.resending}
                                    </span>
                                ) : countdown > 0 ? (
                                    `${text.resendIn} ${countdown}${text.seconds}`
                                ) : (
                                    text.resend
                                )}
                            </button>

                            {/* Login Link */}
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {text.alreadyVerified}{" "}
                                <Link href={`/${language}/login`} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium">
                                    {text.login}
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
