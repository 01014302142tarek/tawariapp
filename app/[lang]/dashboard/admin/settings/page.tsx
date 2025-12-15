"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { SparklesCore } from "@/components/ui/sparkles";

// Icons
const Icons = {
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
};

// Toggle Switch Component
const Toggle = ({ enabled, onChange, isDark }: { enabled: boolean; onChange: () => void; isDark: boolean }) => (
    <button
        onClick={onChange}
        className={cn(
            "relative w-12 h-6 rounded-full transition-colors",
            enabled ? "bg-teal-500" : isDark ? "bg-slate-700" : "bg-gray-300"
        )}
    >
        <motion.div
            animate={{ x: enabled ? 24 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
        />
    </button>
);

// Settings sections
const generalSettings = [
    { id: "maintenance", label: "Maintenance Mode", description: "Enable to show maintenance page to users", enabled: false },
    { id: "registration", label: "User Registration", description: "Allow new users to register on the platform", enabled: true },
    { id: "doctorApproval", label: "Doctor Auto-Approval", description: "Automatically approve new doctor registrations", enabled: false },
    { id: "emailNotifications", label: "Email Notifications", description: "Send email notifications for platform events", enabled: true },
];

const securitySettings = [
    { id: "2fa", label: "Two-Factor Authentication", description: "Require 2FA for all admin accounts", enabled: true },
    { id: "sessionTimeout", label: "Session Timeout", description: "Automatically log out inactive users after 30 minutes", enabled: true },
    { id: "ipWhitelist", label: "IP Whitelist", description: "Restrict admin access to whitelisted IPs only", enabled: false },
    { id: "auditLog", label: "Audit Logging", description: "Log all admin actions for security review", enabled: true },
];

const notificationSettings = [
    { id: "newUser", label: "New User Alerts", description: "Notify when new users register", enabled: true },
    { id: "newDoctor", label: "Doctor Registration", description: "Notify when doctors await approval", enabled: true },
    { id: "payments", label: "Payment Alerts", description: "Notify for payment transactions", enabled: true },
    { id: "systemAlerts", label: "System Alerts", description: "Critical system notifications", enabled: true },
];

const paymentSettings = [
    { id: "payments", label: "Accept Payments", description: "Enable payment processing on the platform", enabled: true },
    { id: "refunds", label: "Automatic Refunds", description: "Process refunds for cancelled appointments", enabled: false },
    { id: "invoices", label: "Generate Invoices", description: "Automatically generate PDF invoices", enabled: true },
];

// Settings Section Component - moved outside to prevent re-renders
const SettingsSection = ({
    title,
    icon,
    settings,
    section,
    onToggle,
    isDark
}: {
    title: string;
    icon: React.ReactNode;
    settings: { id: string; label: string; description: string; enabled: boolean }[];
    section: string;
    onToggle: (section: string, id: string) => void;
    isDark: boolean;
}) => (
    <GlowingCard glowColor="teal" className="p-4 md:p-6" isDark={isDark}>
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                {icon}
            </div>
            <h2 className={cn("text-base md:text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>{title}</h2>
        </div>
        <div className="space-y-3 md:space-y-4">
            {settings.map((setting) => (
                <div
                    key={setting.id}
                    className={cn(
                        "flex items-center justify-between p-3 md:p-4 rounded-lg md:rounded-xl border",
                        isDark ? "bg-white/[0.02] border-white/5" : "bg-gray-50 border-gray-200"
                    )}
                >
                    <div className="flex-1 mr-3 md:mr-4">
                        <p className={cn("font-medium text-sm md:text-base", isDark ? "text-white" : "text-slate-900")}>{setting.label}</p>
                        <p className={cn("text-xs md:text-sm mt-0.5", isDark ? "text-gray-500" : "text-gray-600")}>{setting.description}</p>
                    </div>
                    <Toggle enabled={setting.enabled} onChange={() => onToggle(section, setting.id)} isDark={isDark} />
                </div>
            ))}
        </div>
    </GlowingCard>
);

export default function SettingsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [general, setGeneral] = useState(generalSettings);
    const [security, setSecurity] = useState(securitySettings);
    const [notifications, setNotifications] = useState(notificationSettings);
    const [payment, setPayment] = useState(paymentSettings);
    const [saved, setSaved] = useState(false);

    const toggleSetting = (section: string, id: string) => {
        if (section === "general") {
            setGeneral(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
        } else if (section === "security") {
            setSecurity(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
        } else if (section === "notifications") {
            setNotifications(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
        } else if (section === "payment") {
            setPayment(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
        }
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

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
                        <h1 className={cn("text-xl md:text-2xl lg:text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>System Settings</h1>
                        <p className={cn("text-sm md:text-base lg:text-lg mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            Configure platform preferences and features
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
                        {saved ? "Saved!" : "Save Changes"}
                    </button>
                </div>

                {/* Settings Grid - 2x2 Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    <SettingsSection title="General Settings" icon={Icons.cog} settings={general} section="general" onToggle={toggleSetting} isDark={isDark} />
                    <SettingsSection title="Security Settings" icon={Icons.shield} settings={security} section="security" onToggle={toggleSetting} isDark={isDark} />
                    <SettingsSection title="Notifications" icon={Icons.bell} settings={notifications} section="notifications" onToggle={toggleSetting} isDark={isDark} />
                    <SettingsSection title="Payment Settings" icon={Icons.creditCard} settings={payment} section="payment" onToggle={toggleSetting} isDark={isDark} />
                </div>

                {/* Platform Info */}
                <GlowingCard glowColor="teal" className="p-4 md:p-6" isDark={isDark}>
                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.info}
                        </div>
                        <h2 className={cn("text-base md:text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>Platform Information</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {[
                            { label: "Version", value: "2.1.0" },
                            { label: "Environment", value: "Production" },
                            { label: "Last Updated", value: "Dec 14, 2024" },
                            { label: "Database Status", value: "Healthy", highlight: true },
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
                                    {info.value}
                                </p>
                                <p className={cn("text-[10px] md:text-sm", isDark ? "text-gray-500" : "text-gray-600")}>{info.label}</p>
                            </div>
                        ))}
                    </div>
                </GlowingCard>
            </main>
        </div>
    );
}

