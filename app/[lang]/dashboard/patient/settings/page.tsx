"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { SparklesCore } from "@/components/ui/sparkles";
import { useI18n } from "@/app/i18n";
import { useAuth } from "@/app/context/AuthContext";

// Icons
const Icons = {
    user: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    bell: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
    ),
    shield: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
    globe: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
    ),
    cog: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    save: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
    ),
};

// Toggle Switch Component
const Toggle = ({ enabled, onChange, isDark }: { enabled: boolean; onChange: () => void; isDark: boolean }) => (
    <button
        onClick={onChange}
        className={cn(
            "relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
            enabled ? "bg-teal-500" : isDark ? "bg-slate-600" : "bg-gray-300",
            isDark ? "focus:ring-offset-slate-900" : "focus:ring-offset-white"
        )}
    >
        <span
            className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full shadow-lg transition-all duration-200",
                enabled ? "left-[22px] bg-white" : "left-0.5 bg-white",
                isDark && !enabled && "bg-gray-200"
            )}
        />
    </button>
);

export default function SettingsPage() {
    const { isRTL, language, setLanguage } = useI18n();
    const { theme } = useTheme();
    const { profile, user } = useAuth();
    const isDark = theme === "dark";

    const [notifications, setNotifications] = useState({
        email: true,
        sms: true,
        appointments: true,
        prescriptions: true,
    });

    const [saved, setSaved] = useState(false);
    const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        };
    }, []);

    const handleSave = () => {
        setSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="relative overflow-hidden min-h-screen">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="patient-settings-sparkles"
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={isDark ? 20 : 10}
                    particleColor={isDark ? "20, 184, 166" : "13, 148, 136"}
                />
                {isDark && (
                    <>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
                    </>
                )}
            </div>

            <main className="relative z-0 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className={cn("text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-3", isDark ? "text-white" : "text-slate-900")}>
                            <span className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                {Icons.cog}
                            </span>
                            {isRTL ? "الإعدادات" : "Settings"}
                        </h1>
                        <p className={cn("text-sm md:text-base lg:text-lg mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            {isRTL ? "إدارة حسابك وتفضيلاتك" : "Manage your account and preferences"}
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        className={cn(
                            "px-4 md:px-5 py-2 md:py-2.5 font-medium rounded-xl transition-all flex items-center gap-2 self-start text-sm md:text-base",
                            saved
                                ? "bg-emerald-500 text-white"
                                : "bg-teal-500 hover:bg-teal-600 text-white"
                        )}
                    >
                        {saved ? Icons.check : Icons.save}
                        {saved ? (isRTL ? "تم الحفظ" : "Saved") : (isRTL ? "حفظ" : "Save")}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Profile Section */}
                    <GlowingCard glowColor="teal" className="p-4 md:p-6" isDark={isDark}>
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                {Icons.user}
                            </div>
                            <h2 className={cn("text-base md:text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                {isRTL ? "الملف الشخصي" : "Profile"}
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                    {isRTL ? "الاسم الكامل" : "Full Name"}
                                </label>
                                <input
                                    type="text"
                                    defaultValue={profile?.profile?.full_name || ""}
                                    className={cn(
                                        "w-full px-4 py-3 rounded-xl border transition-colors",
                                        isDark
                                            ? "bg-white/5 border-white/10 text-white focus:border-teal-500"
                                            : "bg-gray-50 border-gray-200 text-gray-900 focus:border-teal-500"
                                    )}
                                />
                            </div>
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                    {isRTL ? "البريد الإلكتروني" : "Email"}
                                </label>
                                <input
                                    type="email"
                                    defaultValue={user?.email || ""}
                                    className={cn(
                                        "w-full px-4 py-3 rounded-xl border transition-colors",
                                        isDark
                                            ? "bg-white/5 border-white/10 text-white focus:border-teal-500"
                                            : "bg-gray-50 border-gray-200 text-gray-900 focus:border-teal-500"
                                    )}
                                />
                            </div>
                        </div>
                    </GlowingCard>

                    {/* Language Section */}
                    <GlowingCard glowColor="teal" className="p-4 md:p-6" isDark={isDark}>
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                {Icons.globe}
                            </div>
                            <h2 className={cn("text-base md:text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                {isRTL ? "اللغة" : "Language"}
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                { code: "en", label: "English" },
                                { code: "ar", label: "العربية" },
                            ].map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => setLanguage(lang.code as "en" | "ar")}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-xl border transition-colors",
                                        language === lang.code
                                            ? "border-teal-500 bg-teal-500/10"
                                            : isDark
                                                ? "border-white/10 hover:border-white/20"
                                                : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                                        {lang.label}
                                    </span>
                                    {language === lang.code && (
                                        <span className="text-teal-500">{Icons.check}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </GlowingCard>

                    {/* Notifications Section */}
                    <GlowingCard glowColor="teal" className="p-4 md:p-6" isDark={isDark}>
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                {Icons.bell}
                            </div>
                            <h2 className={cn("text-base md:text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                {isRTL ? "الإشعارات" : "Notifications"}
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                { key: "email" as const, label: isRTL ? "إشعارات البريد الإلكتروني" : "Email notifications" },
                                { key: "sms" as const, label: isRTL ? "إشعارات الرسائل النصية" : "SMS notifications" },
                                { key: "appointments" as const, label: isRTL ? "تذكيرات المواعيد" : "Appointment reminders" },
                                { key: "prescriptions" as const, label: isRTL ? "تحديثات الوصفات" : "Prescription updates" },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border",
                                        isDark ? "border-white/10" : "border-gray-200"
                                    )}
                                >
                                    <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                                        {item.label}
                                    </span>
                                    <Toggle
                                        enabled={notifications[item.key]}
                                        onChange={() => toggleNotification(item.key)}
                                        isDark={isDark}
                                    />
                                </div>
                            ))}
                        </div>
                    </GlowingCard>

                    {/* Security Section */}
                    <GlowingCard glowColor="teal" className="p-4 md:p-6" isDark={isDark}>
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                {Icons.shield}
                            </div>
                            <h2 className={cn("text-base md:text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                {isRTL ? "الأمان" : "Security"}
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <button
                                className={cn(
                                    "w-full p-4 rounded-xl border text-start transition-colors",
                                    isDark
                                        ? "border-white/10 hover:border-white/20 text-white"
                                        : "border-gray-200 hover:border-gray-300 text-gray-900"
                                )}
                            >
                                <p className="font-medium">{isRTL ? "تغيير كلمة المرور" : "Change Password"}</p>
                                <p className={cn("text-sm mt-1", isDark ? "text-gray-500" : "text-gray-600")}>
                                    {isRTL ? "تحديث كلمة مرور حسابك" : "Update your account password"}
                                </p>
                            </button>
                            <button
                                className={cn(
                                    "w-full p-4 rounded-xl border text-start transition-colors",
                                    isDark
                                        ? "border-white/10 hover:border-white/20 text-white"
                                        : "border-gray-200 hover:border-gray-300 text-gray-900"
                                )}
                            >
                                <p className="font-medium">{isRTL ? "المصادقة الثنائية" : "Two-Factor Authentication"}</p>
                                <p className={cn("text-sm mt-1", isDark ? "text-gray-500" : "text-gray-600")}>
                                    {isRTL ? "تفعيل طبقة أمان إضافية" : "Enable an extra layer of security"}
                                </p>
                            </button>
                        </div>
                    </GlowingCard>
                </div>
            </main>
        </div>
    );
}
