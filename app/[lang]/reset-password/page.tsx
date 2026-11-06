"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "../../i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { createClient } from "@/lib/supabase/client";
import { updatePassword } from "@/app/actions/auth";
import { Logo } from "@/components/ui/Logo";

// Icons
const Icons = {
    lock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    eye: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    eyeOff: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
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

export default function ResetPasswordPage() {
    const { isRTL, language } = useI18n();
    const { theme } = useGlobalTheme();
    const router = useRouter();
    const isDark = theme === "dark";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

    const translations = {
        en: {
            title: "Reset Password",
            subtitle: "Enter your new password below",
            newPassword: "New Password",
            confirmPassword: "Confirm Password",
            submit: "Reset Password",
            resetting: "Resetting...",
            successTitle: "Password Reset!",
            successMessage: "Your password has been successfully reset. You can now login with your new password.",
            goToLogin: "Go to Login",
            errorMismatch: "Passwords do not match",
            errorMinLength: "Password must be at least 6 characters",
            errorGeneric: "Failed to reset password. Please try again.",
            errorInvalidLink: "Invalid or Expired Link",
            errorInvalidMessage: "This password reset link is invalid or has expired. Please request a new one.",
            requestNew: "Request New Link",
        },
        ar: {
            title: "إعادة تعيين كلمة المرور",
            subtitle: "أدخل كلمة المرور الجديدة أدناه",
            newPassword: "كلمة المرور الجديدة",
            confirmPassword: "تأكيد كلمة المرور",
            submit: "إعادة تعيين كلمة المرور",
            resetting: "جاري إعادة التعيين...",
            successTitle: "تم إعادة تعيين كلمة المرور!",
            successMessage: "تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.",
            goToLogin: "الذهاب لتسجيل الدخول",
            errorMismatch: "كلمات المرور غير متطابقة",
            errorMinLength: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل",
            errorGeneric: "فشل إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.",
            errorInvalidLink: "رابط غير صالح أو منتهي الصلاحية",
            errorInvalidMessage: "رابط إعادة تعيين كلمة المرور هذا غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.",
            requestNew: "طلب رابط جديد",
        },
    };

    const text = translations[language as keyof typeof translations] || translations.en;

    // Check if user has a valid recovery session
    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            // User should have a session from the recovery link
            setIsValidSession(!!session);
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError(text.errorMinLength);
            return;
        }

        if (password !== confirmPassword) {
            setError(text.errorMismatch);
            return;
        }

        setIsSubmitting(true);

        // Use rate-limited server action
        const result = await updatePassword(password);

        if (!result.success) {
            setError(result.error || text.errorGeneric);
            setIsSubmitting(false);
        } else {
            setIsSuccess(true);
            setIsSubmitting(false);
            // Sign out and redirect to login after 3 seconds
            setTimeout(async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push(`/${language}/login`);
            }, 3000);
        }
    };

    // Loading state
    if (isValidSession === null) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#031326]' : 'bg-gray-50'}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

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
                <div className="w-full max-w-md">
                    {!isValidSession ? (
                        // Invalid Session State
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h1 className={`text-2xl sm:text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {text.errorInvalidLink}
                            </h1>
                            <p className={`text-sm sm:text-base mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {text.errorInvalidMessage}
                            </p>
                            <Link
                                href={`/${language}/forgot-password`}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 shadow-lg shadow-blue-500/25 transition-all"
                            >
                                {text.requestNew}
                            </Link>
                        </div>
                    ) : isSuccess ? (
                        // Success State
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-[#044C87]/15 border border-[#044C87]/30 flex items-center justify-center mx-auto mb-6 text-[#FD614B]">
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
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 shadow-lg shadow-blue-500/25 transition-all"
                            >
                                {text.goToLogin}
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

                                {/* New Password */}
                                <div className="relative">
                                    <span className={`absolute top-1/2 -translate-y-1/2 ${isDark ? "text-gray-400" : "text-gray-500"} ${isRTL ? 'right-4' : 'left-4'}`}>
                                        {Icons.lock}
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder={text.newPassword}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className={`w-full py-3.5 border rounded-xl transition-all outline-none ${isDark
                                            ? "bg-[#08213D] border-[#044C87]/40 text-white placeholder-gray-400 focus:border-[#044C87] focus:ring-2 focus:ring-[#044C87]/20"
                                            : "bg-white border-gray-200 text-slate-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-[#044C87]/20"
                                            } ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-600"} ${isRTL ? 'left-4' : 'right-4'}`}
                                    >
                                        {showPassword ? Icons.eyeOff : Icons.eye}
                                    </button>
                                </div>

                                {/* Confirm Password */}
                                <div className="relative">
                                    <span className={`absolute top-1/2 -translate-y-1/2 ${isDark ? "text-gray-400" : "text-gray-500"} ${isRTL ? 'right-4' : 'left-4'}`}>
                                        {Icons.lock}
                                    </span>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder={text.confirmPassword}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className={`w-full py-3.5 border rounded-xl transition-all outline-none ${isDark
                                            ? "bg-[#08213D] border-[#044C87]/40 text-white placeholder-gray-400 focus:border-[#044C87] focus:ring-2 focus:ring-[#044C87]/20"
                                            : "bg-white border-gray-200 text-slate-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-[#044C87]/20"
                                            } ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className={`absolute top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-600"} ${isRTL ? 'left-4' : 'right-4'}`}
                                    >
                                        {showConfirmPassword ? Icons.eyeOff : Icons.eye}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !password || !confirmPassword}
                                    className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                            {text.resetting}
                                        </span>
                                    ) : (
                                        text.submit
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
