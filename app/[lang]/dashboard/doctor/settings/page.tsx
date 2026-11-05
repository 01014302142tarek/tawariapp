"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { SparklesCore } from "@/components/ui/sparkles";
import { useI18n } from "@/app/i18n";
import { useAuth, isDoctorProfile } from "@/app/context/AuthContext";
import { updateProfile, updateDoctorProfile } from "@/app/actions/profile";
import { updatePassword } from "@/app/actions/auth";

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
    calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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
    building: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
    ),
};

// Toggle Switch Component
const Toggle = ({ enabled, onChange, isDark }: { enabled: boolean; onChange: () => void; isDark: boolean }) => (
    <button
        onClick={onChange}
        className={cn(
            "relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
            enabled ? "bg-[#FD614B]" : isDark ? "bg-slate-600" : "bg-gray-300",
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
    const { isDark } = useGlobalTheme();
    const { profile, user, isLoading, refreshProfile } = useAuth();

    // Get doctor-specific data if profile is a doctor
    const doctorProfile = profile && isDoctorProfile(profile) ? profile.doctorProfile : null;

    // Form state
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [clinicName, setClinicName] = useState("");
    const [clinicAddress, setClinicAddress] = useState("");
    const [clinicPhone, setClinicPhone] = useState("");
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
        if (doctorProfile) {
            setBio(doctorProfile.bio || "");
            setClinicName(doctorProfile.clinic_name || "");
            setClinicAddress(doctorProfile.clinic_address || "");
            setClinicPhone(doctorProfile.clinic_phone || "");
        }
    }, [profile, doctorProfile]);

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
            // Update base profile
            const profileResult = await updateProfile({
                full_name: fullName,
                notify_email: notifications.email,
                notify_sms: notifications.sms,
                notify_appointments: notifications.appointments,
                notify_prescriptions: notifications.prescriptions,
            });

            if (!profileResult.success) {
                setSaveStatus("error");
                setErrorMessage(profileResult.error || (isRTL ? "حدث خطأ أثناء الحفظ" : "Failed to save"));
                return;
            }

            // Update doctor profile (clinic info, bio)
            const doctorResult = await updateDoctorProfile({
                bio: bio || undefined,
                clinic_name: clinicName || undefined,
                clinic_address: clinicAddress || undefined,
                clinic_phone: clinicPhone || undefined,
            });

            if (doctorResult.success) {
                setSaveStatus("success");
                // Refresh the profile in context
                await refreshProfile();
                // Reset status after 3 seconds
                if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
                savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 3000);
            } else {
                setSaveStatus("error");
                setErrorMessage(doctorResult.error || (isRTL ? "حدث خطأ أثناء الحفظ" : "Failed to save"));
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
                isDark ? "bg-[#031326]" : "bg-gray-50"
            )}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[#FD614B] border-t-transparent rounded-full animate-spin" />
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
                    id="doctor-settings-sparkles"
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={isDark ? 20 : 10}
                    particleColor={isDark ? "253, 97, 75" : "4, 76, 135"}
                />
                {isDark && (
                    <>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FD614B]/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FD614B]/10 rounded-full blur-3xl" />
                    </>
                )}
            </div>

            <main className="relative z-0 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className={cn("text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-3", isDark ? "text-white" : "text-slate-900")}>
                            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#044C87] to-[#0C67B3] flex items-center justify-center text-white shadow-[0_0_15px_rgba(4,76,135,0.4)] border border-[#0C67B3]/40">
                                {Icons.cog}
                            </span>
                            {isRTL ? "الإعدادات" : "Settings"}
                        </h1>
                        <p className={cn("text-sm md:text-base lg:text-lg mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            {isRTL ? "إدارة حسابك وتفضيلاتك المهنية" : "Manage your account and professional preferences"}
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
                                        : "bg-[#FD614B] hover:bg-[#E84D37] text-white",
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
                                    ? (isRTL ? "تم الحفظ" : "Saved")
                                    : saveStatus === "error"
                                        ? (isRTL ? "فشل الحفظ" : "Failed")
                                        : (isRTL ? "حفظ" : "Save")}
                        </button>
                        {saveStatus === "error" && errorMessage && (
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Profile Section */}
                    <GlowingCard glowColor="coral" className="p-4 md:p-6" isDark={isDark}>
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#044C87] to-[#0C67B3] flex items-center justify-center text-white shadow-[0_0_15px_rgba(4,76,135,0.4)] border border-[#0C67B3]/40">
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
                                        "w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20",
                                        isDark
                                            ? "bg-white/5 border-white/10 text-white focus:border-[#FD614B]"
                                            : "bg-gray-50 border-gray-200 text-gray-900 focus:border-[#FD614B]"
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
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                    {isRTL ? "نبذة عني" : "Bio"}
                                </label>
                                <textarea
                                    rows={3}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder={isRTL ? "اكتب نبذة قصيرة عن نفسك وخبراتك الطبية..." : "Write a short bio about yourself and your medical expertise..."}
                                    className={cn(
                                        "w-full px-4 py-3 rounded-xl border transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20",
                                        isDark
                                            ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#FD614B]"
                                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FD614B]"
                                    )}
                                />
                                <p className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-500")}>
                                    {isRTL ? "سيظهر في ملفك الشخصي للمرضى" : "This will appear on your profile for patients"}
                                </p>
                            </div>
                        </div>
                    </GlowingCard>

                    {/* Clinic Information Section */}
                    <GlowingCard glowColor="coral" className="p-4 md:p-6" isDark={isDark}>
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#044C87] to-[#0C67B3] flex items-center justify-center text-white shadow-[0_0_15px_rgba(4,76,135,0.4)] border border-[#0C67B3]/40">
                                {Icons.building}
                            </div>
                            <div>
                                <h2 className={cn("text-base md:text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                    {isRTL ? "معلومات العيادة" : "Clinic Information"}
                                </h2>
                                <p className={cn("text-xs", isDark ? "text-[#FD614B]" : "text-[#E84D37]")}>
                                    {isRTL ? "مطلوب لإنشاء الوصفات الطبية" : "Required for prescriptions"}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                    {isRTL ? "اسم العيادة" : "Clinic Name"} *
                                </label>
                                <input
                                    type="text"
                                    value={clinicName}
                                    onChange={(e) => setClinicName(e.target.value)}
                                    placeholder={isRTL ? "مثال: عيادة الشفاء" : "e.g., Healing Clinic"}
                                    className={cn(
                                        "w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20",
                                        isDark
                                            ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#FD614B]"
                                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FD614B]"
                                    )}
                                />
                            </div>
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                    {isRTL ? "عنوان العيادة" : "Clinic Address"} *
                                </label>
                                <textarea
                                    rows={2}
                                    value={clinicAddress}
                                    onChange={(e) => setClinicAddress(e.target.value)}
                                    placeholder={isRTL ? "العنوان الكامل للعيادة" : "Full clinic address"}
                                    className={cn(
                                        "w-full px-4 py-3 rounded-xl border transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20",
                                        isDark
                                            ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#FD614B]"
                                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FD614B]"
                                    )}
                                />
                            </div>
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                    {isRTL ? "رقم هاتف العيادة" : "Clinic Phone"}
                                </label>
                                <input
                                    type="tel"
                                    value={clinicPhone}
                                    onChange={(e) => setClinicPhone(e.target.value)}
                                    placeholder={isRTL ? "مثال: 02-12345678" : "e.g., 02-12345678"}
                                    className={cn(
                                        "w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20",
                                        isDark
                                            ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#FD614B]"
                                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FD614B]"
                                    )}
                                />
                            </div>
                            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>
                                {isRTL
                                    ? "هذه المعلومات ستظهر على الوصفات الطبية التي تصدرها"
                                    : "This information will appear on prescriptions you issue"}
                            </p>
                        </div>
                    </GlowingCard>

                    {/* Language Section */}
                    <GlowingCard glowColor="coral" className="p-4 md:p-6" isDark={isDark}>
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#044C87] to-[#0C67B3] flex items-center justify-center text-white shadow-[0_0_15px_rgba(4,76,135,0.4)] border border-[#0C67B3]/40">
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
                                            ? "border-[#FD614B] bg-[#FD614B]/10"
                                            : isDark
                                                ? "border-white/10 hover:border-white/20"
                                                : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                                        {lang.label}
                                    </span>
                                    {language === lang.code && (
                                        <span className="text-[#FD614B]">{Icons.check}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </GlowingCard>

                    {/* Notifications Section */}
                    <GlowingCard glowColor="coral" className="p-4 md:p-6" isDark={isDark}>
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#044C87] to-[#0C67B3] flex items-center justify-center text-white shadow-[0_0_15px_rgba(4,76,135,0.4)] border border-[#0C67B3]/40">
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
                                { key: "appointments" as const, label: isRTL ? "حجوزات المواعيد الجديدة" : "New appointment bookings" },
                                { key: "prescriptions" as const, label: isRTL ? "طلبات تجديد الوصفات" : "Prescription renewal requests" },
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

                    {/* Security & Practice Section */}
                    <GlowingCard glowColor="coral" className="p-4 md:p-6" isDark={isDark}>
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#044C87] to-[#0C67B3] flex items-center justify-center text-white shadow-[0_0_15px_rgba(4,76,135,0.4)] border border-[#0C67B3]/40">
                                {Icons.shield}
                            </div>
                            <h2 className={cn("text-base md:text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                {isRTL ? "الأمان والممارسة" : "Security & Practice"}
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
                                    <p className="font-medium">{isRTL ? "رسوم الاستشارة" : "Consultation Fee"}</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#FD614B]/20 text-[#FD614B]">
                                        {isRTL ? "قريباً" : "Coming Soon"}
                                    </span>
                                </div>
                                <p className={cn("text-sm mt-1", isDark ? "text-gray-500" : "text-gray-600")}>
                                    {isRTL ? "تعديل رسوم الاستشارة الخاصة بك" : "Adjust your consultation fees"}
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
                                    <p className="font-medium">{isRTL ? "إدارة الجدول" : "Manage Schedule"}</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#FD614B]/20 text-[#FD614B]">
                                        {isRTL ? "قريباً" : "Coming Soon"}
                                    </span>
                                </div>
                                <p className={cn("text-sm mt-1", isDark ? "text-gray-500" : "text-gray-600")}>
                                    {isRTL ? "تحديث ساعات العمل والتوفر" : "Update working hours and availability"}
                                </p>
                            </button>
                        </div>
                    </GlowingCard>
                </div>
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
                            ? "bg-[#08213D] border-white/10"
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
                                                    "w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 pr-12",
                                                    isDark
                                                        ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#FD614B]"
                                                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FD614B]"
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
                                                    "w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 pr-12",
                                                    isDark
                                                        ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#FD614B]"
                                                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FD614B]"
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
                                            "bg-[#FD614B] hover:bg-[#E84D37] text-white",
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
