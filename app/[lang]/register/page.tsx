"use client";

import React, { useState } from "react";
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
    user: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    email: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    ),
    phone: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
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
    check: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
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
}) {
    // Browsers enforce LTR for type="tel" and type="email", so we use type="text" in RTL mode
    const inputType = showPasswordToggle
        ? (showPassword ? "text" : "password")
        : (isRTL && (type === "tel" || type === "email") ? "text" : type);

    return (
        <div className="relative">
            <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`}>
                {icon}
            </span>
            <input
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                dir={isRTL ? "rtl" : "ltr"}
                style={isRTL ? { textAlign: 'right' } : undefined}
                className={`w-full py-3.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'}`}
            />
            {showPasswordToggle && (
                <button
                    type="button"
                    onClick={onTogglePassword}
                    className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors ${isRTL ? 'left-4' : 'right-4'}`}
                >
                    {showPassword ? Icons.eyeOff : Icons.eye}
                </button>
            )}
        </div>
    );
}

export default function RegisterPage() {
    const { t, isRTL, language } = useI18n();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle registration logic here
        console.log("Form submitted:", formData);
    };

    const translations = {
        en: {
            title: "Create Your Account",
            subtitle: "Join thousands of patients getting quality healthcare",
            fullName: "Full Name",
            email: "Email Address",
            phone: "Phone Number",
            password: "Password",
            termsPrefix: "I agree to the",
            termsLink: "Terms of Service",
            and: "and",
            privacyLink: "Privacy Policy",
            register: "Create Account",
            orContinue: "Or continue with",
            alreadyHave: "Already have an account?",
            loginLink: "Login here",
        },
        ar: {
            title: "إنشاء حسابك",
            subtitle: "انضم إلى آلاف المرضى الذين يحصلون على رعاية صحية عالية الجودة",
            fullName: "الاسم الكامل",
            email: "البريد الإلكتروني",
            phone: "رقم الهاتف",
            password: "كلمة المرور",
            termsPrefix: "أوافق على",
            termsLink: "شروط الخدمة",
            and: "و",
            privacyLink: "سياسة الخصوصية",
            register: "إنشاء الحساب",
            orContinue: "أو المتابعة باستخدام",
            alreadyHave: "لديك حساب بالفعل؟",
            loginLink: "سجل دخولك هنا",
        },
    };

    const text = translations[language as keyof typeof translations] || translations.en;

    return (
        <div className={`min-h-screen bg-[#0F172A] text-white overflow-x-hidden ${isRTL ? 'font-cairo' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-[#0F172A] to-[#0F172A]" />
                <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
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
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                            {text.title}
                        </h1>
                        <p className="text-gray-400 text-sm sm:text-base">
                            {text.subtitle}
                        </p>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InputField
                            icon={Icons.user}
                            type="text"
                            placeholder={text.fullName}
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            isRTL={isRTL}
                        />

                        <InputField
                            icon={Icons.email}
                            type="email"
                            placeholder={text.email}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            isRTL={isRTL}
                        />

                        <InputField
                            icon={Icons.phone}
                            type="tel"
                            placeholder={text.phone}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            isRTL={isRTL}
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
                        />

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3">
                            <button
                                type="button"
                                onClick={() => setAgreedToTerms(!agreedToTerms)}
                                className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${agreedToTerms
                                    ? "bg-teal-500 border-teal-500 text-white"
                                    : "border-gray-600 hover:border-gray-500"
                                    }`}
                            >
                                {agreedToTerms && Icons.check}
                            </button>
                            <span className="text-sm text-gray-400">
                                {text.termsPrefix}{" "}
                                <Link href={`/${language}/terms`} className="text-teal-400 hover:text-teal-300">
                                    {text.termsLink}
                                </Link>{" "}
                                {text.and}{" "}
                                <Link href={`/${language}/privacy`} className="text-teal-400 hover:text-teal-300">
                                    {text.privacyLink}
                                </Link>
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!agreedToTerms}
                            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all ${agreedToTerms
                                ? "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 shadow-lg shadow-teal-500/25"
                                : "bg-gray-700 cursor-not-allowed"
                                }`}
                        >
                            {text.register}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-gray-500 text-sm">{text.orContinue}</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl hover:bg-slate-800 hover:border-white/20 transition-all">
                            {Icons.google}
                            <span className="text-sm text-gray-300">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl hover:bg-slate-800 hover:border-white/20 transition-all">
                            {Icons.apple}
                            <span className="text-sm text-gray-300">Apple</span>
                        </button>
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-gray-400 text-sm mt-6">
                        {text.alreadyHave}{" "}
                        <Link href={`/${language}/login`} className="text-teal-400 hover:text-teal-300 font-medium">
                            {text.loginLink}
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
