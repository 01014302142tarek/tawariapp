"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "../../i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { useAuth } from "@/app/context/AuthContext";
import { Logo } from "@/components/ui/Logo";

// Icons
const Icons = {
    email: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    ),
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
    google: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    ),
    apple: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
    ),
};

// Language Icon
const LanguageIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
);

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
            {LanguageIcon}
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
    );
}

// Input Field Component
function InputField({
    icon,
    type,
    placeholder,
    value,
    onChange,
    showPasswordToggle,
    showPassword,
    onTogglePassword,
    isRTL,
    isDark = true,
}: {
    icon: React.ReactNode;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showPasswordToggle?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
    isRTL?: boolean;
    isDark?: boolean;
}) {
    // Browsers enforce LTR for type="email", so we use type="text" in RTL mode
    const inputType = showPasswordToggle
        ? (showPassword ? "text" : "password")
        : (isRTL && type === "email" ? "text" : type);

    return (
        <div className="relative">
            <span className={`absolute top-1/2 -translate-y-1/2 ${isDark ? "text-gray-400" : "text-gray-500"} ${isRTL ? 'right-4' : 'left-4'}`}>
                {icon}
            </span>
            <input
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                dir={isRTL ? "rtl" : "ltr"}
                style={isRTL ? { textAlign: 'right' } : undefined}
                className={`w-full py-3.5 border rounded-2xl transition-all outline-none ${isDark
                        ? "bg-[#08213D] border-[#044C87]/40 text-[#FEFDFE] placeholder-gray-400 focus:border-[#FD614B] focus:ring-2 focus:ring-[#FD614B]/20"
                        : "bg-white border-blue-200 text-slate-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    } ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'}`}
            />
            {showPasswordToggle && (
                <button
                    type="button"
                    onClick={onTogglePassword}
                    className={`absolute top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-600"} ${isRTL ? 'left-4' : 'right-4'}`}
                >
                    {showPassword ? Icons.eyeOff : Icons.eye}
                </button>
            )}
        </div>
    );
}

function LoginPageContent() {
    const { isRTL, language } = useI18n();
    const { theme } = useGlobalTheme();
    const { signIn, signInWithGoogle, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    // Use explicit redirect param, or let middleware determine based on user role
    const redirectParam = searchParams.get('redirect');

    const isDark = theme === "dark";
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const { error } = await signIn(formData.email, formData.password, rememberMe);

        if (error) {
            setError(language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
            setIsSubmitting(false);
        } else {
            // If explicit redirect provided, use it; otherwise go to generic dashboard
            // and let middleware redirect based on user role from user_metadata
            const targetUrl = redirectParam || `/${language}/dashboard`;
            router.push(targetUrl);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        const { error } = await signInWithGoogle(redirectParam || `/${language}/dashboard`);
        if (error) {
            setError(language === 'ar' ? 'فشل تسجيل الدخول بواسطة Google' : 'Failed to sign in with Google');
        }
    };

    const translations = {
        en: {
            title: "Welcome Back",
            subtitle: "Login to access your healthcare dashboard",
            email: "Email Address",
            password: "Password",
            rememberMe: "Remember me",
            forgotPassword: "Forgot password?",
            login: "Login",
            loggingIn: "Logging in...",
            orContinue: "Or continue with",
            noAccount: "Don't have an account?",
            registerLink: "Create one here",
        },
        ar: {
            title: "مرحباً بعودتك",
            subtitle: "سجل الدخول للوصول إلى لوحة التحكم الصحية الخاصة بك",
            email: "البريد الإلكتروني",
            password: "كلمة المرور",
            rememberMe: "تذكرني",
            forgotPassword: "نسيت كلمة المرور؟",
            login: "تسجيل الدخول",
            loggingIn: "جاري تسجيل الدخول...",
            orContinue: "أو المتابعة باستخدام",
            noAccount: "ليس لديك حساب؟",
            registerLink: "أنشئ واحداً هنا",
        },
    };

    const text = translations[language as keyof typeof translations] || translations.en;

    if (authLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#031326]' : 'bg-[#F0F7FF]'}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen overflow-x-hidden ${isRTL ? 'font-cairo' : ''} ${isDark ? 'bg-[#031326] text-white' : 'bg-[#F0F7FF] text-slate-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#042642] via-[#031326] to-[#020B16]' : 'bg-gradient-to-br from-blue-50 via-white to-white'}`} />
                <div className={`absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? 'bg-[#044C87]/20' : 'bg-blue-300/20'}`} />
                <div className={`absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full blur-3xl ${isDark ? 'bg-[#FD614B]/15' : 'bg-blue-200/20'}`} />
            </div>

            {/* Navigation */}
            <nav className={`relative z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#031326]/85 border-[#044C87]/30' : 'bg-white/80 border-blue-100'}`}>
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
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {text.title}
                        </h1>
                        <p className={`text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                            {text.subtitle}
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <InputField
                            icon={Icons.email}
                            type="email"
                            placeholder={text.email}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            isRTL={isRTL}
                            isDark={isDark}
                        />

                        <InputField
                            icon={Icons.lock}
                            type="password"
                            placeholder={text.password}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            showPasswordToggle
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                            isRTL={isRTL}
                            isDark={isDark}
                        />

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className={`w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 ${isDark ? 'border-blue-900 bg-[#0B1630]' : 'border-gray-300 bg-white'}`}
                                />
                                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{text.rememberMe}</span>
                            </label>
                            <Link href={`/${language}/forgot-password`} className={`text-sm ${isDark ? 'text-[#FD614B] hover:brightness-110' : 'text-[#FD614B] hover:brightness-90'} font-medium transition-colors`}>
                                {text.forgotPassword}
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 shadow-lg shadow-[#FD614B]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                    {text.loggingIn}
                                </span>
                            ) : (
                                text.login
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className={`flex-1 h-px ${isDark ? 'bg-blue-900/30' : 'bg-gray-200'}`} />
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{text.orContinue}</span>
                        <div className={`flex-1 h-px ${isDark ? 'bg-blue-900/30' : 'bg-gray-200'}`} />
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-1 gap-3">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className={`flex items-center justify-center gap-2 py-3 px-4 border rounded-2xl transition-all ${isDark
                                ? 'bg-[#08213D] border-[#044C87]/40 hover:bg-[#0D2C4F] hover:border-[#FD614B]/50'
                                : 'bg-white border-blue-100 hover:bg-blue-50 hover:border-blue-200'
                            }`}
                        >
                            {Icons.google}
                            <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>Google</span>
                        </button>
                    </div>

                    {/* Register Link */}
                    <p className={`text-center text-sm mt-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                        {text.noAccount}{" "}
                        <Link href={`/${language}/get-started`} className={`${isDark ? 'text-[#FD614B] hover:brightness-110' : 'text-[#FD614B] hover:brightness-90'} font-semibold`}>
                            {text.registerLink}
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}

// Loading fallback component
function LoginPageLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#031326]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
    );
}

// Default export with Suspense wrapper for useSearchParams
export default function LoginPage() {
    return (
        <Suspense fallback={<LoginPageLoading />}>
            <LoginPageContent />
        </Suspense>
    );
}
