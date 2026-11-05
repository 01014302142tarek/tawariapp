"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { SparklesCore } from "@/components/ui/sparkles";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useI18n } from "@/app/i18n";
import { getAdminUsers, getAdminUserStats, updateUserStatus, createUser, CreateUserInput, AdminUser, AdminUserStats, UserRole, UserStatus } from "@/app/actions/admin-users";
import { useToast } from "@/components/ui/toast";

// Icons
const Icons = {
    users: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    doctor: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
    ),
    patient: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    ),
    admin: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
    plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    search: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    edit: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
    ),
    trash: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    spinner: (
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    ),
};

const Badge = ({ variant, children }: { variant: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
        pending: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20",
        inactive: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border border-gray-500/20",
        suspended: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
        doctor: "bg-[#FD614B]/10 text-[#FD614B] border border-[#FD614B]/20",
        patient: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
        admin: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant] || variants.inactive)}>
            {children}
        </span>
    );
};

export default function UsersPage() {
    const { t, isRTL, formatNumber, formatDate, language } = useI18n();
    const { theme } = useTheme();
    const { showToast } = useToast();
    const isDark = theme === "dark";
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState<AdminUserStats>({ total_users: 0, doctors: 0, patients: 0, admins: 0 });
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showStatusModal, setShowStatusModal] = useState<AdminUser | null>(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState<Partial<CreateUserInput>>({
        role: "patient",
        gender: "male",
        admin_type: "support_agent",
    });

    // Load data from database
    useEffect(() => {
        let mounted = true;

        async function loadData() {
            setLoading(true);

            const [usersResult, statsResult] = await Promise.all([
                getAdminUsers({ limit: 50 }),
                getAdminUserStats()
            ]);

            if (mounted) {
                if (!usersResult.error) {
                    setUsers(usersResult.users);
                }
                if (!statsResult.error) {
                    setStats(statsResult.stats);
                }
                setLoading(false);
            }
        }
        loadData();

        return () => {
            mounted = false;
        };
    }, []);

    // Handle status change
    const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
        setActionLoading(userId);
        const result = await updateUserStatus(userId, newStatus);

        if (result.success) {
            // Update local state
            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, status: newStatus } : user
            ));
            setShowStatusModal(null);
        } else {
            alert(result.error || (language === "ar" ? "حدث خطأ" : "An error occurred"));
        }

        setActionLoading(null);
    };

    // Handle add user
    const handleAddUser = async () => {
        if (!newUser.email || !newUser.password || !newUser.full_name || !newUser.role) {
            showToast(language === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields", "error");
            return;
        }

        setActionLoading("add_user");

        const result = await createUser(newUser as CreateUserInput);

        if (result.success) {
            showToast(
                language === "ar" ? "تم إنشاء المستخدم بنجاح" : "User created successfully",
                "success"
            );
            setShowAddUserModal(false);
            setNewUser({ role: "patient", gender: "male", admin_type: "support_agent" });
            
            // Reload users list
            const usersResult = await getAdminUsers({ limit: 50 });
            if (!usersResult.error) {
                setUsers(usersResult.users);
            }
            
            // Reload stats
            const statsResult = await getAdminUserStats();
            if (!statsResult.error) {
                setStats(statsResult.stats);
            }
        } else {
            showToast(result.error || (language === "ar" ? "حدث خطأ" : "An error occurred"), "error");
        }

        setActionLoading(null);
    };

    // Filter users based on search and filter
    const filteredUsers = users.filter(user => {
        const roleFilter = filter === "all" ||
            filter === user.role ||
            filter === user.status;
        const searchFilter = search === "" ||
            user.full_name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        return roleFilter && searchFilter;
    });

    const statCards = [
        { label: t.adminDashboard.usersPage.stats.totalUsers, value: stats.total_users, icon: Icons.users, color: "amber" },
        { label: t.adminDashboard.usersPage.stats.doctors, value: stats.doctors, icon: Icons.doctor, color: "emerald" },
        { label: t.adminDashboard.usersPage.stats.patients, value: stats.patients, icon: Icons.patient, color: "blue" },
        { label: t.adminDashboard.usersPage.stats.admins, value: stats.admins, icon: Icons.admin, color: "amber" },
    ];

    const getFilterLabel = (key: string) => {
        const labels: Record<string, string> = {
            all: language === "ar" ? "الكل" : "All",
            doctor: language === "ar" ? "طبيب" : "Doctor",
            patient: language === "ar" ? "مريض" : "Patient",
            admin: language === "ar" ? "مدير" : "Admin",
            active: language === "ar" ? "نشط" : "Active",
            pending: language === "ar" ? "معلق" : "Pending",
            inactive: language === "ar" ? "غير نشط" : "Inactive",
        };
        return labels[key] || key;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-[#FD614B] mb-4 flex justify-center">{Icons.spinner}</div>
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>{t.common.loading || "Loading..."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden min-h-screen">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="users-sparkles"
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
                {/* Header with Stats */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className={cn("text-xl md:text-2xl lg:text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.usersPage.title}</h1>
                        <p className={cn("text-sm md:text-base lg:text-lg mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            {t.adminDashboard.usersPage.subtitle}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAddUserModal(true)}
                        className="px-4 md:px-5 py-2 md:py-2.5 bg-[#FD614B] hover:bg-[#E84D37] text-white font-medium rounded-xl transition-colors flex items-center gap-2 self-start text-sm md:text-base"
                    >
                        {Icons.plus}
                        {t.adminDashboard.usersPage.addUser}
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    {statCards.map((stat, idx) => (
                        <GlowingCard key={idx} glowColor="coral" className="p-3 md:p-4" isDark={isDark}>
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#044C87] to-[#0C67B3] text-white shadow-[0_0_15px_rgba(4,76,135,0.4)] border border-[#0C67B3]/40">
                                    <span className="[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">
                                        {stat.icon}
                                    </span>
                                </div>
                                <div>
                                    <p className={cn("text-lg md:text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                        <AnimatedNumber value={stat.value} format={formatNumber} />
                                    </p>
                                    <p className={cn("text-[10px] md:text-xs truncate", isDark ? "text-gray-500" : "text-gray-600")}>{stat.label}</p>
                                </div>
                            </div>
                        </GlowingCard>
                    ))}
                </div>

                {/* Search and Filters */}
                <GlowingCard glowColor="coral" className="p-3 md:p-4 mb-4 md:mb-6" isDark={isDark}>
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                        <div className="flex-1 relative">
                            <div className={cn("absolute top-1/2 -translate-y-1/2 text-gray-500", isRTL ? "right-3" : "left-3")}>{Icons.search}</div>
                            <input
                                type="text"
                                placeholder={t.adminDashboard.usersPage.searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={cn(
                                    "w-full py-2 md:py-2.5 rounded-xl border outline-none transition-colors text-sm md:text-base",
                                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
                                    isDark
                                        ? "bg-[#0D2C4F]/50 border-white/10 text-white placeholder-gray-500 focus:border-[#FD614B]/50"
                                        : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-[#FD614B]"
                                )}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap overflow-x-auto">
                            {["all", "doctor", "patient", "admin", "active", "pending", "inactive"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-3 md:px-4 py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-colors capitalize whitespace-nowrap",
                                        filter === f
                                            ? "bg-[#FD614B] text-white"
                                            : isDark
                                                ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    )}
                                >
                                    {getFilterLabel(f)}
                                </button>
                            ))}
                        </div>
                    </div>
                </GlowingCard>

                {/* Users Grid - Card Layout */}
                {filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                        {filteredUsers.map((user, idx) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <GlowingCard glowColor="coral" className="p-3 md:p-5" isDark={isDark}>
                                    <div className="flex items-start justify-between mb-3 md:mb-4">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden border-2 border-[#FD614B]/40">
                                                {user.avatar_url ? (
                                                    <Image
                                                        src={user.avatar_url}
                                                        alt={user.full_name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 40px, 48px"
                                                    />
                                                ) : (
                                                    <div className={cn("w-full h-full flex items-center justify-center text-lg font-semibold", isDark ? "bg-slate-700 text-gray-300" : "bg-gray-200 text-gray-600")}>
                                                        {user.full_name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={cn("font-semibold text-sm md:text-base truncate", isDark ? "text-white" : "text-slate-900")}>{user.full_name}</p>
                                                <p className={cn("text-xs md:text-sm truncate", isDark ? "text-gray-500" : "text-gray-600")}>{user.email || user.phone || "-"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1.5 md:gap-2">
                                            <Badge variant={user.role}>{getFilterLabel(user.role)}</Badge>
                                            <Badge variant={user.status}>{getFilterLabel(user.status)}</Badge>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setShowStatusModal(user)}
                                                disabled={actionLoading === user.id}
                                                className={cn(
                                                    "p-1.5 md:p-2 rounded-lg transition-colors",
                                                    isDark ? "hover:bg-white/5 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                                                )}
                                            >
                                                {actionLoading === user.id ? (
                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                    </svg>
                                                ) : Icons.edit}
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(user.id, "suspended")}
                                                disabled={actionLoading === user.id || user.status === "suspended"}
                                                className={cn(
                                                    "p-1.5 md:p-2 rounded-lg transition-colors text-red-500 disabled:opacity-50",
                                                    isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
                                                )}
                                            >
                                                {Icons.trash}
                                            </button>
                                        </div>
                                    </div>
                                    <p className={cn("text-[10px] md:text-xs mt-2 md:mt-3 pt-2 md:pt-3 border-t", isDark ? "text-gray-500 border-white/5" : "text-gray-500 border-gray-200")}>
                                        {t.adminDashboard.usersPage.table.joined} {formatDate(user.created_at)}
                                    </p>
                                </GlowingCard>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", isDark ? "bg-white/5" : "bg-gray-100")}>
                            {Icons.users}
                        </div>
                        <h3 className={cn("text-lg font-medium mb-2", isDark ? "text-white" : "text-slate-900")}>
                            {language === "ar" ? "لا يوجد مستخدمون" : "No users found"}
                        </h3>
                        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                            {language === "ar" ? "حاول تعديل الفلاتر أو البحث" : "Try adjusting filters or search"}
                        </p>
                    </div>
                )}
            </main>

            {/* Status Change Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowStatusModal(null)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "relative w-full max-w-md rounded-2xl p-6",
                            isDark ? "bg-[#08213D] border border-white/10" : "bg-white shadow-xl"
                        )}
                    >
                        <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-slate-900")}>
                            {language === "ar" ? "تغيير حالة المستخدم" : "Change User Status"}
                        </h3>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-[#FD614B]/40">
                                {showStatusModal.avatar_url ? (
                                    <Image
                                        src={showStatusModal.avatar_url}
                                        alt={showStatusModal.full_name}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                ) : (
                                    <div className={cn("w-full h-full flex items-center justify-center text-lg font-semibold", isDark ? "bg-slate-700 text-gray-300" : "bg-gray-200 text-gray-600")}>
                                        {showStatusModal.full_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>{showStatusModal.full_name}</p>
                                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                    {language === "ar" ? "الحالة الحالية:" : "Current status:"} <Badge variant={showStatusModal.status}>{getFilterLabel(showStatusModal.status)}</Badge>
                                </p>
                            </div>
                        </div>

                        <p className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
                            {language === "ar" ? "اختر الحالة الجديدة:" : "Select new status:"}
                        </p>

                        <div className="space-y-2 mb-6">
                            {(["active", "suspended"] as UserStatus[]).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(showStatusModal.id, status)}
                                    disabled={actionLoading === showStatusModal.id || showStatusModal.status === status}
                                    className={cn(
                                        "w-full p-3 rounded-xl text-left flex items-center justify-between transition-colors disabled:opacity-50",
                                        status === "active"
                                            ? isDark
                                                ? "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20"
                                                : "bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                                            : isDark
                                                ? "bg-red-500/10 hover:bg-red-500/20 border border-red-500/20"
                                                : "bg-red-50 hover:bg-red-100 border border-red-200"
                                    )}
                                >
                                    <div>
                                        <p className={cn(
                                            "font-medium",
                                            status === "active"
                                                ? "text-emerald-500"
                                                : "text-red-500"
                                        )}>
                                            {status === "active"
                                                ? (language === "ar" ? "تفعيل" : "Activate")
                                                : (language === "ar" ? "تعليق" : "Suspend")}
                                        </p>
                                        <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-600")}>
                                            {status === "active"
                                                ? (language === "ar" ? "السماح للمستخدم بالوصول للنظام" : "Allow user access to the system")
                                                : (language === "ar" ? "منع المستخدم من الوصول" : "Block user access")}
                                        </p>
                                    </div>
                                    {actionLoading === showStatusModal.id && (
                                        <svg className="w-5 h-5 animate-spin text-[#FD614B]" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                    )}
                                    {showStatusModal.status === status && (
                                        <span className={cn("text-xs px-2 py-1 rounded-full", isDark ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500")}>
                                            {language === "ar" ? "الحالية" : "Current"}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowStatusModal(null)}
                            className={cn(
                                "w-full py-2.5 rounded-xl font-medium transition-colors",
                                isDark
                                    ? "bg-white/5 hover:bg-white/10 text-gray-400"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                            )}
                        >
                            {language === "ar" ? "إلغاء" : "Cancel"}
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowAddUserModal(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "relative w-full max-w-2xl rounded-2xl p-6 my-8 max-h-[90vh] overflow-y-auto",
                            isDark ? "bg-[#08213D] border border-white/10" : "bg-white shadow-xl"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className={cn("text-xl font-semibold mb-6", isDark ? "text-white" : "text-slate-900")}>
                            {language === "ar" ? "إضافة مستخدم جديد" : "Add New User"}
                        </h3>

                        <div className="space-y-4">
                            {/* Role Selection */}
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                    {language === "ar" ? "الدور *" : "Role *"}
                                </label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                                    className={cn(
                                        "w-full px-4 py-2.5 rounded-xl border outline-none transition-colors",
                                        isDark
                                            ? "bg-[#0D2C4F] border-white/10 text-white [&>option]:bg-[#08213D]"
                                            : "bg-gray-50 border-gray-200 text-slate-900"
                                    )}
                                >
                                    <option value="patient">{language === "ar" ? "مريض" : "Patient"}</option>
                                    <option value="doctor">{language === "ar" ? "طبيب" : "Doctor"}</option>
                                    <option value="admin">{language === "ar" ? "مدير" : "Admin"}</option>
                                </select>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                        {language === "ar" ? "الاسم الكامل *" : "Full Name *"}
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.full_name || ""}
                                        onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                        className={cn(
                                            "w-full px-4 py-2.5 rounded-xl border outline-none transition-colors",
                                            isDark
                                                ? "bg-[#0D2C4F] border-white/10 text-white placeholder-gray-500"
                                                : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400"
                                        )}
                                        placeholder={language === "ar" ? "أدخل الاسم الكامل" : "Enter full name"}
                                    />
                                </div>

                                <div>
                                    <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                        {language === "ar" ? "البريد الإلكتروني *" : "Email *"}
                                    </label>
                                    <input
                                        type="email"
                                        value={newUser.email || ""}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className={cn(
                                            "w-full px-4 py-2.5 rounded-xl border outline-none transition-colors",
                                            isDark
                                                ? "bg-[#0D2C4F] border-white/10 text-white placeholder-gray-500"
                                                : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400"
                                        )}
                                        placeholder={language === "ar" ? "email@example.com" : "email@example.com"}
                                    />
                                </div>

                                <div>
                                    <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                        {language === "ar" ? "كلمة المرور *" : "Password *"}
                                    </label>
                                    <input
                                        type="password"
                                        value={newUser.password || ""}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className={cn(
                                            "w-full px-4 py-2.5 rounded-xl border outline-none transition-colors",
                                            isDark
                                                ? "bg-[#0D2C4F] border-white/10 text-white placeholder-gray-500"
                                                : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400"
                                        )}
                                        placeholder={language === "ar" ? "أدخل كلمة المرور" : "Enter password"}
                                    />
                                </div>

                                <div>
                                    <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                        {language === "ar" ? "الهاتف" : "Phone"}
                                    </label>
                                    <input
                                        type="tel"
                                        value={newUser.phone || ""}
                                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                        className={cn(
                                            "w-full px-4 py-2.5 rounded-xl border outline-none transition-colors",
                                            isDark
                                                ? "bg-[#0D2C4F] border-white/10 text-white placeholder-gray-500"
                                                : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400"
                                        )}
                                        placeholder="+20 123 456 7890"
                                    />
                                </div>
                            </div>

                            {/* Patient-specific fields */}
                            {newUser.role === "patient" && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                                    <div>
                                        <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                            {language === "ar" ? "تاريخ الميلاد" : "Date of Birth"}
                                        </label>
                                        <input
                                            type="date"
                                            value={newUser.date_of_birth || ""}
                                            onChange={(e) => setNewUser({ ...newUser, date_of_birth: e.target.value })}
                                            className={cn(
                                                "w-full px-4 py-2.5 rounded-xl border outline-none transition-colors color-scheme-dark",
                                                isDark
                                                    ? "bg-[#0D2C4F] border-white/10 text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                                                    : "bg-gray-50 border-gray-200 text-slate-900"
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                            {language === "ar" ? "الجنس" : "Gender"}
                                        </label>
                                        <select
                                            value={newUser.gender || "male"}
                                            onChange={(e) => setNewUser({ ...newUser, gender: e.target.value as "male" | "female" })}
                                            className={cn(
                                                "w-full px-4 py-2.5 rounded-xl border outline-none transition-colors",
                                                isDark
                                                    ? "bg-[#0D2C4F] border-white/10 text-white [&>option]:bg-[#08213D]"
                                                    : "bg-gray-50 border-gray-200 text-slate-900"
                                            )}
                                        >
                                            <option value="male">{language === "ar" ? "ذكر" : "Male"}</option>
                                            <option value="female">{language === "ar" ? "أنثى" : "Female"}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                            {language === "ar" ? "فصيلة الدم" : "Blood Type"}
                                        </label>
                                        <select
                                            value={newUser.blood_type || ""}
                                            onChange={(e) => setNewUser({ ...newUser, blood_type: e.target.value })}
                                            className={cn(
                                                "w-full px-4 py-2.5 rounded-xl border outline-none transition-colors",
                                                isDark
                                                    ? "bg-[#0D2C4F] border-white/10 text-white [&>option]:bg-[#08213D]"
                                                    : "bg-gray-50 border-gray-200 text-slate-900"
                                            )}
                                        >
                                            <option value="">{language === "ar" ? "اختر" : "Select"}</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Doctor-specific fields */}
                            {newUser.role === "doctor" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                                    <div>
                                        <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                            {language === "ar" ? "رقم الترخيص" : "License Number"}
                                        </label>
                                        <input
                                            type="text"
                                            value={newUser.license_number || ""}
                                            onChange={(e) => setNewUser({ ...newUser, license_number: e.target.value })}
                                            className={cn(
                                                "w-full px-4 py-2.5 rounded-xl border outline-none transition-colors",
                                                isDark
                                                    ? "bg-[#0D2C4F] border-white/10 text-white placeholder-gray-500"
                                                    : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400"
                                            )}
                                            placeholder="123456"
                                        />
                                    </div>

                                    <div>
                                        <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                            {language === "ar" ? "سنوات الخبرة" : "Years of Experience"}
                                        </label>
                                        <input
                                            type="number"
                                            value={newUser.years_of_experience || ""}
                                            onChange={(e) => setNewUser({ ...newUser, years_of_experience: parseInt(e.target.value) || 0 })}
                                            className={cn(
                                                "w-full px-4 py-2.5 rounded-xl border outline-none transition-colors",
                                                isDark
                                                    ? "bg-[#0D2C4F] border-white/10 text-white placeholder-gray-500"
                                                    : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400"
                                            )}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                            {language === "ar" ? "رسوم الاستشارة (ج.م)" : "Consultation Fee (EGP)"}
                                        </label>
                                        <input
                                            type="number"
                                            value={newUser.consultation_fee || ""}
                                            onChange={(e) => setNewUser({ ...newUser, consultation_fee: parseFloat(e.target.value) || 0 })}
                                            className={cn(
                                                "w-full px-4 py-2.5 rounded-xl border outline-none transition-colors",
                                                isDark
                                                    ? "bg-[#0D2C4F] border-white/10 text-white placeholder-gray-500"
                                                    : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400"
                                            )}
                                            placeholder="200"
                                            min="0"
                                            step="50"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Admin-specific fields */}
                            {newUser.role === "admin" && (
                                <div className="pt-4 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                                    <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                        {language === "ar" ? "نوع المدير" : "Admin Type"}
                                    </label>
                                    <select
                                        value={newUser.admin_type || "support_agent"}
                                        onChange={(e) => setNewUser({ ...newUser, admin_type: e.target.value as "full_admin" | "support_agent" })}
                                        className={cn(
                                            "w-full px-4 py-2.5 rounded-xl border outline-none transition-colors",
                                            isDark
                                                ? "bg-[#0D2C4F] border-white/10 text-white [&>option]:bg-[#08213D]"
                                                : "bg-gray-50 border-gray-200 text-slate-900"
                                        )}
                                    >
                                        <option value="support_agent">{language === "ar" ? "وكيل دعم" : "Support Agent"}</option>
                                        <option value="full_admin">{language === "ar" ? "مدير كامل" : "Full Admin"}</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6 pt-6 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddUserModal(false);
                                    setNewUser({ role: "patient", gender: "male", admin_type: "support_agent" });
                                }}
                                disabled={actionLoading === "add_user"}
                                className={cn(
                                    "flex-1 py-2.5 rounded-xl font-medium transition-colors",
                                    isDark
                                        ? "bg-white/5 hover:bg-white/10 text-gray-400"
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                                )}
                            >
                                {language === "ar" ? "إلغاء" : "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleAddUser}
                                disabled={actionLoading === "add_user"}
                                className="flex-1 py-2.5 rounded-xl font-medium bg-[#FD614B] hover:bg-[#E84D37] text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading === "add_user" ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        {language === "ar" ? "جارِ الإنشاء..." : "Creating..."}
                                    </>
                                ) : (
                                    language === "ar" ? "إضافة مستخدم" : "Add User"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
