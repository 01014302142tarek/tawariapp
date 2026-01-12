"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { SparklesCore } from "@/components/ui/sparkles";
import { useI18n } from "@/app/i18n";
import { useAuth } from "@/app/context/AuthContext";
import { updateProfile } from "@/app/actions/profile";
import { updatePassword } from "@/app/actions/auth";

// Icons
const Icons = {
    user: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    cog: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    shield: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
    creditCard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
    ),
    info: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
    ),
    bell: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
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
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
};

// Toggle Switch Component
const Toggle = ({ enabled, onChange, isDark, disabled }: { enabled: boolean; onChange: () => void; isDark: boolean; disabled?: boolean }) => (
    <button
        onClick={onChange}
        disabled={disabled}
        className={cn(
            "relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
            enabled ? "bg-teal-500" : isDark ? "bg-slate-600" : "bg-gray-300",
            isDark ? "focus:ring-offset-slate-900" : "focus:ring-offset-white",
            disabled && "opacity-50 cursor-not-allowed"
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

// Settings Section Component for platform settings
const SettingsSection = ({
    title,
    icon,
    settings,
    section,
    onToggle,
    isDark,
    t,
    disabled
}: {
    title: string;
    icon: React.ReactNode;
    settings: { id: string; key: string; enabled: boolean }[];
    section: string;
    onToggle: (section: string, id: string) => void;
    isDark: boolean;
    t: ReturnType<typeof useI18n>['t'];
    disabled?: boolean;
}) => {
    return (
        <GlowingCard glowColor="teal" className="p-4 md:p-6" isDark={isDark}>
            <div className="flex items-center justify-between gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                        {icon}
                    </div>
                    <h2 className={cn("text-base md:text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>{title}</h2>
                </div>
                {disabled && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                        {t.language === "ar" ? "للعرض فقط" : "View Only"}
                    </span>
                )}
            </div>
            <div className="space-y-3 md:space-y-4">
                {settings.map((setting) => {
                    // Type-safe access to item translations based on key
                    const items = t.adminDashboard.settingsPage.items as Record<string, { label: string; desc: string }>;
                    const item = items[setting.key];
                    return (
                        <div
                            key={setting.id}
                            className={cn(
                                "flex items-center justify-between p-3 md:p-4 rounded-lg md:rounded-xl border",
                                isDark ? "bg-white/[0.02] border-white/5" : "bg-gray-50 border-gray-200",
                                disabled && "opacity-60"
                            )}
                        >
                            <div className="flex-1 mr-3 md:mr-4">
                                <p className={cn("font-medium text-sm md:text-base", isDark ? "text-white" : "text-slate-900")}>{item?.label || setting.key}</p>
                                <p className={cn("text-xs md:text-sm mt-0.5", isDark ? "text-gray-500" : "text-gray-600")}>{item?.desc || ''}</p>
                            </div>
                            <Toggle enabled={setting.enabled} onChange={() => onToggle(section, setting.id)} isDark={isDark} disabled={disabled} />
                        </div>
                    );
                })}
            </div>
        </GlowingCard>
    );
};

export default function SettingsPage() {
    const { t, isRTL, formatNumber, formatDate } = useI18n();
    const { isDark } = useGlobalTheme();
    const { profile, user, isLoading, refreshProfile } = useAuth();

    // Personal profile form state
    const [fullName, setFullName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const [notifications, setNotifications] = useState({
        email: true,
        sms: true,
        appointments: true,
        prescriptions: true,
    });

    // Password change state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Platform settings (visual only - not persisted)
    const generalSettings = [
        { id: "maintenance", key: "maintenance", enabled: false },
        { id: "registration", key: "registration", enabled: true },
        { id: "doctorApproval", key: "doctorApproval", enabled: false },
        { id: "emailNotifications", key: "emailNotifications", enabled: true },
    ];

    const securitySettings = [
        { id: "2fa", key: "twoFactor", enabled: true },
        { id: "sessionTimeout", key: "sessionTimeout", enabled: true },
        { id: "ipWhitelist", key: "ipWhitelist", enabled: false },
        { id: "auditLog", key: "auditLog", enabled: true },
    ];

    const notificationSettings = [
        { id: "newUser", key: "newUser", enabled: true },
        { id: "newDoctor", key: "newDoctor", enabled: true },
        { id: "payments", key: "paymentAlerts", enabled: true },
        { id: "systemAlerts", key: "systemAlerts", enabled: true },
    ];

    const paymentSettings = [
        { id: "payments", key: "acceptPayments", enabled: true },
        { id: "refunds", key: "refunds", enabled: false },
        { id: "invoices", key: "invoices", enabled: true },
    ];


    const [general, setGeneral] = useState(generalSettings);
    const [security, setSecurity] = useState(securitySettings);
    const [platformNotifications, setPlatformNotifications] = useState(notificationSettings);
    const [payment, setPayment] = useState(paymentSettings);

    const toggleSetting = (section: string, id: string) => {
        // Platform settings toggle (visual only - would need backend implementation)
        if (section === "general") {
            setGeneral(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
        } else if (section === "security") {
            setSecurity(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
        } else if (section === "platformNotifications") {
            setPlatformNotifications(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
        } else if (section === "payment") {
            setPayment(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
        }
    };

    const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize form with profile data
    useEffect(() => {
        if (profile?.profile) {
            setFullName(profile.profile.full_name || "");
            setNotifications({
                email: profile.profile.notify_email ?? true,
                sms: profile.profile.notify_sms ?? true,
                appointments: profile.profile.notify_appointments ?? true,
                prescriptions: profile.profile.notify_prescriptions ?? true,
            });
        }
    }, [profile]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        };
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus("idle");
        setErrorMessage("");

        try {
            const result = await updateProfile({
                full_name: fullName,
                notify_email: notifications.email,
                notify_sms: notifications.sms,
                notify_appointments: notifications.appointments,
                notify_prescriptions: notifications.prescriptions,
            });

            if (result.success) {
                setSaveStatus("success");
                // Refresh the profile in context
                await refreshProfile();
                // Reset status after 3 seconds
                if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
                savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 3000);
            } else {
                setSaveStatus("error");
                setErrorMessage(result.error || (isRTL ? "حدث خطأ أثناء الحفظ" : "Failed to save"));
            }
        } catch {
            setSaveStatus("error");
            setErrorMessage(isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePasswordChange = async () => {
        setPasswordError("");
        setPasswordSuccess(false);

        // Validation
        if (newPassword.length < 8) {
            setPasswordError(isRTL ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match");
            return;
        }

        setPasswordSaving(true);

        try {
            const result = await updatePassword(newPassword);

            if (result.success) {
                setPasswordSuccess(true);
                setNewPassword("");
                setConfirmPassword("");
                // Close modal after 2 seconds
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess(false);
                }, 2000);
            } else {
                setPasswordError(result.error || (isRTL ? "فشل تحديث كلمة المرور" : "Failed to update password"));
            }
        } catch {
            setPasswordError(isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
        } finally {
            setPasswordSaving(false);
        }
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
        setPasswordSuccess(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className={cn(
                "min-h-screen flex items-center justify-center",
                isDark ? "bg-slate-950" : "bg-gray-50"
            )}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                        {isRTL ? "جارٍ التحميل..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden min-h-screen">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="settings-sparkles"
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
                        <h1 className={cn("text-xl md:text-2xl lg:text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.settingsPage.title}</h1>
                        <p className={cn("text-sm md:text-base lg:text-lg mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            {t.adminDashboard.settingsPage.subtitle}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(
                                "px-4 md:px-5 py-2 md:py-2.5 font-medium rounded-xl transition-all flex items-center gap-2 self-start text-sm md:text-base",
                                saveStatus === "success"
                                    ? "bg-emerald-500 text-white"
                                    : saveStatus === "error"
                                        ? "bg-red-500 text-white"
                                        : "bg-teal-500 hover:bg-teal-600 text-white",
                                isSaving && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : saveStatus === "success" ? (
                                Icons.check
                            ) : (
                                Icons.save
                            )}
                            {isSaving
                                ? (isRTL ? "جارٍ الحفظ..." : "Saving...")
                                : saveStatus === "success"
                                    ? t.adminDashboard.settingsPage.saved
                                    : saveStatus === "error"
                                        ? (isRTL ? "فشل الحفظ" : "Failed")
                                        : t.adminDashboard.settingsPage.save}
                        </button>
                        {saveStatus === "error" && errorMessage && (
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        )}
                    </div>
                </div>

                {/* Personal Settings Section */}
                <div className="mb-8">
                    <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-slate-900")}>
                        {isRTL ? "الإعدادات الشخصية" : "Personal Settings"}
                    </h3>
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
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20",
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
                                        value={user?.email || ""}
                                        readOnly
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl border transition-colors cursor-not-allowed opacity-70",
                                            isDark
                                                ? "bg-white/5 border-white/10 text-white"
                                                : "bg-gray-100 border-gray-200 text-gray-900"
                                        )}
                                    />
                                    <p className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-500")}>
                                        {isRTL ? "لا يمكن تغيير البريد الإلكتروني" : "Email cannot be changed"}
                                    </p>
                                </div>
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
                                    onClick={() => setShowPasswordModal(true)}
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
                                        "w-full p-4 rounded-xl border text-start transition-colors opacity-60 cursor-not-allowed",
                                        isDark
                                            ? "border-white/10 text-white"
                                            : "border-gray-200 text-gray-900"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{isRTL ? "المصادقة الثنائية" : "Two-Factor Authentication"}</p>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                                            {isRTL ? "قريباً" : "Coming Soon"}
                                        </span>
                                    </div>
                                    <p className={cn("text-sm mt-1", isDark ? "text-gray-500" : "text-gray-600")}>
                                        {isRTL ? "تفعيل طبقة أمان إضافية" : "Enable an extra layer of security"}
                                    </p>
                                </button>
                            </div>
                        </GlowingCard>

                        {/* Personal Notifications */}
                        <GlowingCard glowColor="teal" className="p-4 md:p-6 lg:col-span-2" isDark={isDark}>
                            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                    {Icons.bell}
                                </div>
                                <h2 className={cn("text-base md:text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                    {isRTL ? "إشعاراتي" : "My Notifications"}
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { key: "email" as const, label: isRTL ? "إشعارات البريد الإلكتروني" : "Email notifications" },
                                    { key: "sms" as const, label: isRTL ? "إشعارات الرسائل النصية" : "SMS notifications" },
                                    { key: "appointments" as const, label: isRTL ? "تنبيهات المواعيد" : "Appointment alerts" },
                                    { key: "prescriptions" as const, label: isRTL ? "تنبيهات الوصفات" : "Prescription alerts" },
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
                    </div>
                </div>

                {/* Platform Settings Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                            {isRTL ? "إعدادات المنصة" : "Platform Settings"}
                        </h3>
                        <span className={cn("text-xs px-2 py-1 rounded-full", isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700")}>
                            {isRTL ? "للعرض فقط - يتطلب تنفيذ الخادم" : "View Only - Requires Backend"}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <SettingsSection title={t.adminDashboard.settingsPage.sections.general} icon={Icons.cog} settings={general} section="general" onToggle={toggleSetting} isDark={isDark} t={t} disabled />
                        <SettingsSection title={t.adminDashboard.settingsPage.sections.security} icon={Icons.shield} settings={security} section="security" onToggle={toggleSetting} isDark={isDark} t={t} disabled />
                        <SettingsSection title={t.adminDashboard.settingsPage.sections.notifications} icon={Icons.bell} settings={platformNotifications} section="platformNotifications" onToggle={toggleSetting} isDark={isDark} t={t} disabled />
                        <SettingsSection title={t.adminDashboard.settingsPage.sections.payment} icon={Icons.creditCard} settings={payment} section="payment" onToggle={toggleSetting} isDark={isDark} t={t} disabled />
                    </div>
                </div>

                {/* Platform Info */}
                <GlowingCard glowColor="teal" className="p-4 md:p-6" isDark={isDark}>
                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.info}
                        </div>
                        <h2 className={cn("text-base md:text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.settingsPage.sections.info}</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {[
                            { label: t.adminDashboard.settingsPage.info.version, value: "2.1.0" },
                            { label: t.adminDashboard.settingsPage.info.environment, value: "Production" },
                            { label: t.adminDashboard.settingsPage.info.lastUpdated, value: "Jan 11, 2026" },
                            { label: t.adminDashboard.settingsPage.info.dbStatus, value: "Healthy", highlight: true },
                        ].map((info, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "p-3 md:p-4 rounded-lg md:rounded-xl border text-center",
                                    isDark ? "bg-white/[0.02] border-white/5" : "bg-gray-50 border-gray-200"
                                )}
                            >
                                <p className={cn(
                                    "text-sm md:text-lg font-semibold mb-0.5 md:mb-1 truncate",
                                    info.highlight ? "text-emerald-500" : isDark ? "text-white" : "text-slate-900"
                                )}>
                                    {idx === 2 ? formatDate(info.value) : (idx === 0 ? formatNumber(info.value) : info.value)}
                                </p>
                                <p className={cn("text-[10px] md:text-sm", isDark ? "text-gray-500" : "text-gray-600")}>{info.label}</p>
                            </div>
                        ))}
                    </div>
                </GlowingCard>
            </main>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closePasswordModal}
                    />

                    {/* Modal */}
                    <div className={cn(
                        "relative w-full max-w-md rounded-2xl border p-6 shadow-xl",
                        isDark
                            ? "bg-slate-900 border-white/10"
                            : "bg-white border-gray-200"
                    )}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                {isRTL ? "تغيير كلمة المرور" : "Change Password"}
                            </h3>
                            <button
                                onClick={closePasswordModal}
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                                )}
                            >
                                {Icons.close}
                            </button>
                        </div>

                        {/* Success Message */}
                        {passwordSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                                    {isRTL ? "تم تغيير كلمة المرور بنجاح!" : "Password changed successfully!"}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Form */}
                                <div className="space-y-4">
                                    {/* New Password */}
                                    <div>
                                        <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                            {isRTL ? "كلمة المرور الجديدة" : "New Password"}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder={isRTL ? "أدخل كلمة المرور الجديدة" : "Enter new password"}
                                                className={cn(
                                                    "w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20 pr-12",
                                                    isDark
                                                        ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-teal-500"
                                                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-teal-500"
                                                )}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className={cn(
                                                    "absolute right-3 top-1/2 -translate-y-1/2 p-1",
                                                    isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                                                )}
                                            >
                                                {showNewPassword ? Icons.eyeOff : Icons.eye}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                            {isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder={isRTL ? "أعد إدخال كلمة المرور" : "Re-enter password"}
                                                className={cn(
                                                    "w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20 pr-12",
                                                    isDark
                                                        ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-teal-500"
                                                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-teal-500"
                                                )}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className={cn(
                                                    "absolute right-3 top-1/2 -translate-y-1/2 p-1",
                                                    isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                                                )}
                                            >
                                                {showConfirmPassword ? Icons.eyeOff : Icons.eye}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {passwordError && (
                                        <p className="text-sm text-red-500">{passwordError}</p>
                                    )}

                                    {/* Password Requirements */}
                                    <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>
                                        {isRTL ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل" : "Password must be at least 8 characters"}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={closePasswordModal}
                                        className={cn(
                                            "flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors",
                                            isDark
                                                ? "bg-white/10 hover:bg-white/20 text-white"
                                                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                                        )}
                                    >
                                        {isRTL ? "إلغاء" : "Cancel"}
                                    </button>
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={passwordSaving || !newPassword || !confirmPassword}
                                        className={cn(
                                            "flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2",
                                            "bg-teal-500 hover:bg-teal-600 text-white",
                                            (passwordSaving || !newPassword || !confirmPassword) && "opacity-60 cursor-not-allowed"
                                        )}
                                    >
                                        {passwordSaving && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        )}
                                        {passwordSaving
                                            ? (isRTL ? "جارٍ التحديث..." : "Updating...")
                                            : (isRTL ? "تحديث" : "Update")}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
