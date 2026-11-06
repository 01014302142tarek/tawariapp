"use client";

import { useState } from "react";
import { X, UserCheck, Stethoscope, User, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export interface GoogleAccountSelection {
    email: string;
    fullName: string;
    role: "patient" | "doctor";
    avatarUrl?: string;
}

interface GoogleAuthModalProps {
    isOpen: boolean;
    defaultRole?: "patient" | "doctor";
    isAr?: boolean;
    onClose: () => void;
    onSelectAccount: (account: GoogleAccountSelection) => Promise<void>;
}

const PRESET_GOOGLE_ACCOUNTS: GoogleAccountSelection[] = [
    {
        email: "tbakr373@gmail.com",
        fullName: "Tarek Bakr",
        role: "patient",
    },
    {
        email: "patient1@tawari.test",
        fullName: "Ahmed Hassan",
        role: "patient",
    },
    {
        email: "doctor1@tawari.test",
        fullName: "Dr. Mohamed Ibrahim",
        role: "doctor",
        avatarUrl:
            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    },
];

export default function GoogleAuthModal({
    isOpen,
    defaultRole = "patient",
    isAr = true,
    onClose,
    onSelectAccount,
}: GoogleAuthModalProps) {
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customEmail, setCustomEmail] = useState("");
    const [customName, setCustomName] = useState("");
    const [selectedRole, setSelectedRole] = useState<"patient" | "doctor">(defaultRole);
    const [submittingEmail, setSubmittingEmail] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handlePresetClick = async (preset: GoogleAccountSelection) => {
        setErrorMessage(null);
        setSubmittingEmail(preset.email);
        try {
            await onSelectAccount({
                ...preset,
                role: defaultRole === "doctor" && preset.email === "tbakr373@gmail.com" ? "doctor" : preset.role,
            });
        } catch (err) {
            setErrorMessage(
                err instanceof Error
                    ? err.message
                    : isAr
                    ? "حدث خطأ أثناء تسجيل الدخول عبر Google"
                    : "Failed to sign in with Google"
            );
        } finally {
            setSubmittingEmail(null);
        }
    };

    const handleCustomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        const trimmedEmail = customEmail.trim().toLowerCase();
        if (!trimmedEmail || !trimmedEmail.includes("@")) {
            setErrorMessage(
                isAr
                    ? "يرجى إدخال بريد إلكتروني صحيح من Google (مثال: name@gmail.com)"
                    : "Please enter a valid Google email address (e.g. name@gmail.com)"
            );
            return;
        }
        const resolvedName =
            customName.trim() ||
            trimmedEmail
                .split("@")[0]
                .replace(/[._-]+/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());

        setSubmittingEmail(trimmedEmail);
        try {
            await onSelectAccount({
                email: trimmedEmail,
                fullName: resolvedName,
                role: selectedRole,
            });
        } catch (err) {
            setErrorMessage(
                err instanceof Error
                    ? err.message
                    : isAr
                    ? "حدث خطأ أثناء تسجيل الدخول عبر Google"
                    : "Failed to sign in with Google"
            );
        } finally {
            setSubmittingEmail(null);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
            dir={isAr ? "rtl" : "ltr"}
            role="dialog"
            aria-modal="true"
            aria-labelledby="google-auth-modal-title"
        >
            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Top Google Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center gap-2.5">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="text-sm font-semibold text-slate-700">
                            {isAr ? "تسجيل الدخول باستخدام Google" : "Sign in with Google"}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={isAr ? "إغلاق" : "Close"}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="text-center mb-5">
                        <h3
                            id="google-auth-modal-title"
                            className="text-xl font-bold text-slate-900"
                        >
                            {isAr ? "اختر حسابك للمتابعة إلى طبيبي" : "Choose an account to continue to Tabibi"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            {isAr
                                ? "سجّل الدخول أو أنشئ حساباً جديداً بضغطة واحدة عبر Google"
                                : "Sign in or register a new account in one click with Google"}
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                            {errorMessage}
                        </div>
                    )}

                    {!showCustomForm ? (
                        <div className="space-y-2.5">
                            {PRESET_GOOGLE_ACCOUNTS.map((acc) => {
                                const isBusy = submittingEmail === acc.email;
                                const initials = acc.fullName
                                    .split(" ")
                                    .map((p) => p[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase();

                                return (
                                    <button
                                        key={acc.email}
                                        type="button"
                                        disabled={Boolean(submittingEmail)}
                                        onClick={() => handlePresetClick(acc)}
                                        data-testid={`google-account-${acc.email}`}
                                        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all text-start group cursor-pointer disabled:opacity-60"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                                                {initials}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                                        {acc.fullName}
                                                    </p>
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                                            acc.role === "doctor"
                                                                ? "bg-blue-50 text-blue-700"
                                                                : "bg-teal-50 text-teal-700"
                                                        }`}
                                                    >
                                                        {acc.role === "doctor" ? (
                                                            <>
                                                                <Stethoscope className="w-3 h-3" />
                                                                {isAr ? "طبيب" : "Doctor"}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck className="w-3 h-3" />
                                                                {isAr ? "مريض" : "Patient"}
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate mt-0.5" dir="ltr">
                                                    {acc.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs font-semibold text-teal-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                                            {isBusy
                                                ? isAr
                                                    ? "جاري الدخول..."
                                                    : "Signing in..."
                                                : isAr
                                                ? "متابعة"
                                                : "Continue"}
                                        </div>
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                onClick={() => setShowCustomForm(true)}
                                data-testid="google-use-another-account"
                                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-slate-300 hover:border-teal-500 hover:bg-slate-50 transition-all text-start cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {isAr ? "استخدام حساب Google آخر" : "Use another Google account"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {isAr
                                            ? "سجّل بأي بريد Gmail كمريض أو طبيب"
                                            : "Register with any Gmail address as Patient or Doctor"}
                                    </p>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleCustomSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    {isAr ? "البريد الإلكتروني في Google" : "Google Email Address"}
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
                                    <input
                                        type="email"
                                        required
                                        value={customEmail}
                                        onChange={(e) => setCustomEmail(e.target.value)}
                                        placeholder="yourname@gmail.com"
                                        dir="ltr"
                                        className="w-full ps-10 pe-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    {isAr ? "الاسم الكامل" : "Full Name"}
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder={isAr ? "مثال: طارق بكر" : "e.g. Tarek Bakr"}
                                        className="w-full ps-10 pe-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    {isAr ? "نوع الحساب" : "Account Role"}
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole("patient")}
                                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                            selectedRole === "patient"
                                                ? "border-teal-600 bg-teal-50 text-teal-800"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <UserCheck className="w-4 h-4" />
                                        {isAr ? "مريض (Patient)" : "Patient"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole("doctor")}
                                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                            selectedRole === "doctor"
                                                ? "border-teal-600 bg-teal-50 text-teal-800"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <Stethoscope className="w-4 h-4" />
                                        {isAr ? "طبيب (Doctor)" : "Doctor"}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCustomForm(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    {isAr ? "رجوع" : "Back"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={Boolean(submittingEmail)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                                >
                                    <span>
                                        {submittingEmail
                                            ? isAr
                                                ? "جاري التسجيل..."
                                                : "Signing in..."
                                            : isAr
                                            ? "المتابعة باستخدام Google"
                                            : "Continue with Google"}
                                    </span>
                                    <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>
                            {isAr
                                ? "اتصال آمن ومشفر عبر بوابة Google للمصادقة"
                                : "Secure authentication powered by Google OAuth"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
