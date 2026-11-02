"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "../../i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { useAuth } from "@/app/context/AuthContext";
import { Logo } from "@/components/ui/Logo";

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
function LanguageToggle({ isDark = true }: { isDark?: boolean }) {
    const { language, setLanguage } = useI18n();
    return (
        <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isDark
                ? "bg-white/5 hover:bg-white/10 border-white/10"
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
    onFocus,
    onBlur,
    error,
    errorMessage,
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
    onFocus?: () => void;
    onBlur?: () => void;
    error?: boolean;
    errorMessage?: string;
}) {
    // Browsers enforce LTR for type="tel" and type="email", so we use type="text" in RTL mode
    const inputType = showPasswordToggle
        ? (showPassword ? "text" : "password")
        : (isRTL && (type === "tel" || type === "email") ? "text" : type);

    return (
        <div className="relative">
            <div className="relative">
                <span className={`absolute top-1/2 -translate-y-1/2 ${error ? 'text-red-400' : isDark ? 'text-gray-400' : 'text-gray-500'} ${isRTL ? 'right-4' : 'left-4'}`}>
                    {icon}
                </span>
                <input
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    dir={isRTL ? "rtl" : "ltr"}
                    style={isRTL ? { textAlign: 'right' } : undefined}
                    className={`w-full py-3.5 border rounded-xl placeholder-gray-500 focus:ring-2 transition-all outline-none ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'
                        } ${error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5 text-red-400"
                            : isDark
                                ? "bg-[#0B1630]/80 border-blue-500/30 text-white focus:border-blue-500 focus:ring-blue-500/25"
                                : "bg-white border-blue-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className={`absolute top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors ${isRTL ? 'left-4' : 'right-4'}`}
                    >
                        {showPassword ? Icons.eyeOff : Icons.eye}
                    </button>
                )}
            </div>
            {error && errorMessage && (
                <p className={`text-xs text-red-400 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {errorMessage}
                </p>
            )}
        </div>
    );
}

export default function RegisterPage() {
    const { isRTL, language } = useI18n();
    const { theme } = useGlobalTheme();
    const { signUp, signInWithGoogle, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const isDark = theme === "dark";
    const [showPassword, setShowPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Field touched state for validation
    const [touched, setTouched] = useState({
        fullName: false,
        email: false,
        phone: false,
        password: false,
    });

    // Email validation
    const validateEmail = (email: string) => {
        // RFC 5322 compliant email regex (simplified but robust)
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

        const checks = {
            hasText: email.length > 0,
            hasAtSign: email.includes('@'),
            hasValidFormat: emailRegex.test(email),
            isNotTooLong: email.length <= 254, // RFC 5321 max length
        };

        return {
            ...checks,
            isValid: checks.hasValidFormat && checks.isNotTooLong,
        };
    };

    // Password validation - moderate: 8+ chars + at least 2 of: uppercase, lowercase, number, special
    const validatePassword = (password: string) => {
        const checks = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
        const typeCount = [checks.hasUppercase, checks.hasLowercase, checks.hasNumber, checks.hasSpecial].filter(Boolean).length;
        return {
            ...checks,
            hasAtLeastTwoTypes: typeCount >= 2,
            isValid: checks.minLength && typeCount >= 2,
        };
    };

    // Validation functions for all fields
    const validateFullName = (name: string) => {
        return {
            isNotEmpty: name.trim().length > 0,
            isValid: name.trim().length > 0,
        };
    };

    const validatePhone = (phone: string) => {
        return {
            isNotEmpty: phone.trim().length > 0,
            isValid: phone.trim().length > 0,
        };
    };

    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    const fullNameValidation = validateFullName(formData.fullName);
    const phoneValidation = validatePhone(formData.phone);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Mark all fields as touched when submitting
        setTouched({
            fullName: true,
            email: true,
            phone: true,
            password: true,
        });
        setEmailTouched(true);

        // Check all required fields
        if (!fullNameValidation.isValid) {
            setError(language === "ar" ? "الاسم الكامل مطلوب" : "Full Name is required");
            return;
        }

        if (!emailValidation.isValid) {
            setError(text.emailError);
            return;
        }

        if (!phoneValidation.isValid) {
            setError(language === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required");
            return;
        }

        if (!passwordValidation.isValid) {
            setError(text.passwordError);
            return;
        }

        setIsSubmitting(true);

        const { error } = await signUp(formData.email, formData.password, {
            fullName: formData.fullName,
            phone: formData.phone,
            role: "patient",
        });

        if (error) {
            setError(language === 'ar' ? 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.' : 'Failed to create account. Please try again.');
            setIsSubmitting(false);
        } else {
            // Redirect to verify email page
            router.push(`/${language}/verify-email`);
        }
    };

    const handleGoogleSignUp = async () => {
        setError(null);
        const { error } = await signInWithGoogle(`/${language}/dashboard`);
        if (error) {
            setError(language === 'ar' ? 'فشل التسجيل بواسطة Google' : 'Failed to sign up with Google');
        }
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
            registering: "Creating Account...",
            orContinue: "Or continue with",
            alreadyHave: "Already have an account?",
            loginLink: "Login here",
            passwordRequirements: {
                title: "Password must have:",
                minLength: "At least 8 characters",
                twoTypes: "At least 2 of the following:",
                uppercase: "Uppercase letter (A-Z)",
                lowercase: "Lowercase letter (a-z)",
                number: "Number (0-9)",
                special: "Special character (!@#$%...)",
            },
            passwordError: "Please create a stronger password",
            emailError: "Please enter a valid email address",
            emailInvalid: "Invalid email format",
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
            registering: "جاري إنشاء الحساب...",
            orContinue: "أو المتابعة باستخدام",
            alreadyHave: "لديك حساب بالفعل؟",
            loginLink: "سجل دخولك هنا",
            passwordRequirements: {
                title: "يجب أن تحتوي كلمة المرور على:",
                minLength: "8 أحرف على الأقل",
                twoTypes: "نوعين على الأقل مما يلي:",
                uppercase: "حرف كبير (A-Z)",
                lowercase: "حرف صغير (a-z)",
                number: "رقم (0-9)",
                special: "رمز خاص (!@#$%...)",
            },
            passwordError: "يرجى إنشاء كلمة مرور أقوى",
            emailError: "يرجى إدخال عنوان بريد إلكتروني صالح",
            emailInvalid: "تنسيق البريد الإلكتروني غير صحيح",
        },
    };

    const text = translations[language as keyof typeof translations] || translations.en;

    if (authLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#060B18]' : 'bg-[#F0F7FF]'}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen overflow-x-hidden ${isRTL ? 'font-cairo' : ''} ${isDark ? 'bg-[#060B18] text-white' : 'bg-[#F0F7FF] text-slate-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#0B1528] via-[#060B18] to-[#040813]' : 'bg-gradient-to-br from-blue-50 via-white to-white'}`} />
                <div className={`absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? 'bg-blue-600/15' : 'bg-blue-300/20'}`} />
                <div className={`absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full blur-3xl ${isDark ? 'bg-amber-500/10' : 'bg-blue-200/20'}`} />
            </div>

            {/* Navigation */}
            <nav className={`relative z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#060B18]/85 border-blue-900/30' : 'bg-white/80 border-blue-100'}`}>
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
                        <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {text.subtitle}
                        </p>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <InputField
                            icon={Icons.user}
                            type="text"
                            placeholder={text.fullName}
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            onBlur={() => setTouched({ ...touched, fullName: true })}
                            isRTL={isRTL}
                            isDark={isDark}
                            error={touched.fullName && !fullNameValidation.isValid}
                            errorMessage={language === "ar" ? "الاسم الكامل مطلوب" : "Full Name is required"}
                        />

                        <div>
                            <InputField
                                icon={Icons.email}
                                type="email"
                                placeholder={text.email}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                isRTL={isRTL}
                                isDark={isDark}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => {
                                    setEmailFocused(false);
                                    setEmailTouched(true);
                                    setTouched({ ...touched, email: true });
                                }}
                                error={touched.email && !emailValidation.isValid}
                                errorMessage={language === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address"}
                            />
                            {/* Email Validation Feedback */}
                            {emailTouched && formData.email.length > 0 && !emailValidation.isValid && (
                                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                    </svg>
                                    <span>{text.emailInvalid}</span>
                                </div>
                            )}
                            {emailValidation.isValid && formData.email.length > 0 && (
                                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-400">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                    </svg>
                                    <span>{language === 'ar' ? 'البريد الإلكتروني صالح' : 'Valid email'}</span>
                                </div>
                            )}
                        </div>

                        <InputField
                            icon={Icons.phone}
                            type="tel"
                            placeholder={text.phone}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            onBlur={() => setTouched({ ...touched, phone: true })}
                            isRTL={isRTL}
                            isDark={isDark}
                            error={touched.phone && !phoneValidation.isValid}
                            errorMessage={language === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required"}
                        />

                        <div>
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
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => {
                                    setPasswordFocused(false);
                                    setTouched({ ...touched, password: true });
                                }}
                                error={touched.password && !passwordValidation.isValid}
                                errorMessage={language === "ar" ? "كلمة المرور غير صالحة" : "Password does not meet requirements"}
                            />

                            {/* Password Requirements */}
                            {(passwordFocused || formData.password.length > 0) && (
                                <div className={`mt-2 p-3 rounded-lg text-xs space-y-1.5 ${isDark ? 'bg-slate-800/50 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                                    <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {text.passwordRequirements.title}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className={passwordValidation.minLength ? 'text-amber-500' : (isDark ? 'text-gray-500' : 'text-gray-400')}>
                                            {passwordValidation.minLength ? '✓' : '○'}
                                        </span>
                                        <span className={passwordValidation.minLength ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-gray-400' : 'text-gray-500')}>
                                            {text.passwordRequirements.minLength}
                                        </span>
                                    </div>
                                    <p className={`font-medium mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {text.passwordRequirements.twoTypes}
                                    </p>
                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className={passwordValidation.hasUppercase ? 'text-amber-500' : (isDark ? 'text-gray-500' : 'text-gray-400')}>
                                                {passwordValidation.hasUppercase ? '✓' : '○'}
                                            </span>
                                            <span className={passwordValidation.hasUppercase ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-gray-400' : 'text-gray-500')}>
                                                {text.passwordRequirements.uppercase}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={passwordValidation.hasLowercase ? 'text-amber-500' : (isDark ? 'text-gray-500' : 'text-gray-400')}>
                                                {passwordValidation.hasLowercase ? '✓' : '○'}
                                            </span>
                                            <span className={passwordValidation.hasLowercase ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-gray-400' : 'text-gray-500')}>
                                                {text.passwordRequirements.lowercase}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={passwordValidation.hasNumber ? 'text-amber-500' : (isDark ? 'text-gray-500' : 'text-gray-400')}>
                                                {passwordValidation.hasNumber ? '✓' : '○'}
                                            </span>
                                            <span className={passwordValidation.hasNumber ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-gray-400' : 'text-gray-500')}>
                                                {text.passwordRequirements.number}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={passwordValidation.hasSpecial ? 'text-amber-500' : (isDark ? 'text-gray-500' : 'text-gray-400')}>
                                                {passwordValidation.hasSpecial ? '✓' : '○'}
                                            </span>
                                            <span className={passwordValidation.hasSpecial ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-gray-400' : 'text-gray-500')}>
                                                {text.passwordRequirements.special}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3">
                            <button
                                type="button"
                                onClick={() => setAgreedToTerms(!agreedToTerms)}
                                className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${agreedToTerms
                                    ? "bg-blue-600 border-blue-500 text-white shadow-sm"
                                    : isDark
                                        ? "border-blue-900/60 bg-[#0B1630] hover:border-blue-500"
                                        : "border-gray-300 hover:border-gray-400"
                                    }`}
                            >
                                {agreedToTerms && Icons.check}
                            </button>
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                                {text.termsPrefix}{" "}
                                <Link href={`/${language}/terms`} className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} underline`}>
                                    {text.termsLink}
                                </Link>{" "}
                                {text.and}{" "}
                                <Link href={`/${language}/privacy`} className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} underline`}>
                                    {text.privacyLink}
                                </Link>
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={
                                !agreedToTerms ||
                                isSubmitting ||
                                !fullNameValidation.isValid ||
                                !emailValidation.isValid ||
                                !phoneValidation.isValid ||
                                !passwordValidation.isValid
                            }
                            className={`w-full py-3.5 rounded-2xl font-bold transition-all ${
                                agreedToTerms &&
                                !isSubmitting &&
                                fullNameValidation.isValid &&
                                emailValidation.isValid &&
                                phoneValidation.isValid &&
                                passwordValidation.isValid
                                    ? "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30"
                                    : isDark
                                        ? "bg-blue-950/40 text-blue-300/40 border border-blue-900/40 cursor-not-allowed"
                                        : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                            }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                    {text.registering}
                                </span>
                            ) : (
                                text.register
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className={`flex-1 h-px ${isDark ? 'bg-blue-900/30' : 'bg-gray-200'}`} />
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{text.orContinue}</span>
                        <div className={`flex-1 h-px ${isDark ? 'bg-blue-900/30' : 'bg-gray-200'}`} />
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-1 gap-3">
                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
                            className={`flex items-center justify-center gap-2 py-3 px-4 border rounded-2xl transition-all ${isDark
                                ? "bg-[#0B152B]/85 border-blue-500/30 hover:bg-[#0E1D3C] hover:border-blue-400"
                                : "bg-white border-blue-100 hover:bg-blue-50 hover:border-blue-200"
                            }`}
                        >
                            {Icons.google}
                            <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>Google</span>
                        </button>
                    </div>

                    {/* Login Link */}
                    <p className={`text-center text-sm mt-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                        {text.alreadyHave}{" "}
                        <Link href={`/${language}/login`} className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} font-semibold`}>
                            {text.loginLink}
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
