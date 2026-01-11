"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { SparklesCore } from "@/components/ui/sparkles";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useI18n } from "@/app/i18n";
import { getAdminPatients, AdminPatient } from "@/app/actions/admin-users";

const ITEMS_PER_PAGE = 10;

// Icons
const Icons = {
    patient: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    ),
    check: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    sparkle: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    ),
    calendar: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    search: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    folder: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
    ),
    spinner: (
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    ),
    chevronLeft: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    ),
    chevronRight: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
};

const Badge = ({ variant, children }: { variant: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        inactive: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant] || variants.inactive)}>
            {children}
        </span>
    );
};

export default function PatientsPage() {
    const { t, isRTL, formatNumber, formatDate, language } = useI18n();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [genderFilter, setGenderFilter] = useState("all");
    const [bloodTypeFilter, setBloodTypeFilter] = useState("all");
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<AdminPatient[]>([]);
    const [totalPatients, setTotalPatients] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1); // Reset to first page on search
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Load patients from database
    const loadPatients = useCallback(async (page: number, searchTerm: string, status: string, gender: string, bloodType: string) => {
        setLoading(true);
        
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const result = await getAdminPatients({
            limit: ITEMS_PER_PAGE,
            offset,
            search: searchTerm || undefined,
            status: status !== "all" ? status : undefined,
            gender: gender !== "all" ? gender : undefined,
            bloodType: bloodType !== "all" ? bloodType : undefined,
        });
        if (!result.error) {
            setPatients(result.patients);
            setTotalPatients(result.total);
        }
        
        setLoading(false);
        if (isFirstLoad) {
            setIsFirstLoad(false);
        }
    }, [isFirstLoad]);

    useEffect(() => {
        loadPatients(currentPage, debouncedSearch, statusFilter, genderFilter, bloodTypeFilter);
    }, [currentPage, debouncedSearch, statusFilter, genderFilter, bloodTypeFilter, loadPatients]);

    const totalPages = Math.ceil(totalPatients / ITEMS_PER_PAGE);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Store current date in state to avoid hydration mismatch
    const [currentDate, setCurrentDate] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentDate(new Date());
    }, []);

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth?: string): number | null => {
        if (!dateOfBirth || !currentDate) return null;
        const birth = new Date(dateOfBirth);
        let age = currentDate.getFullYear() - birth.getFullYear();
        const monthDiff = currentDate.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Calculate stats from real data
    const activePatients = patients.filter(p => p.total_appointments > 0).length;
    const avgAppointments = patients.length > 0
        ? (patients.reduce((sum, p) => sum + p.total_appointments, 0) / patients.length).toFixed(1)
        : 0;

    // Calculate new this month (using state-based currentDate to avoid hydration issues)
    const newThisMonth = currentDate ? patients.filter(p => {
        const created = new Date(p.created_at);
        return created.getMonth() === currentDate.getMonth() && created.getFullYear() === currentDate.getFullYear();
    }).length : 0;

    const stats = [
        { label: t.adminDashboard.patientsPage.stats.totalPatients, value: totalPatients, icon: Icons.patient, color: "teal" },
        { label: t.adminDashboard.patientsPage.stats.active, value: activePatients, icon: Icons.check, color: "emerald" },
        { label: t.adminDashboard.patientsPage.stats.newThisMonth, value: newThisMonth, icon: Icons.sparkle, color: "blue" },
        { label: t.adminDashboard.patientsPage.stats.avgAppointments, value: Number(avgAppointments), icon: Icons.calendar, color: "amber" },
    ];

    const getFilterLabel = (key: string) => {
        const labels: Record<string, string> = {
            all: language === "ar" ? "الكل" : "All",
            active: language === "ar" ? "نشط" : "Active",
            inactive: language === "ar" ? "غير نشط" : "Inactive",
        };
        return labels[key] || key;
    };

    if (isFirstLoad) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-teal-500 mb-4 flex justify-center">{Icons.spinner}</div>
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
                    id="patients-sparkles"
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
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className={cn("text-xl md:text-2xl lg:text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>{t.adminDashboard.patientsPage.title}</h1>
                        <p className={cn("text-sm md:text-base lg:text-lg mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            {t.adminDashboard.patientsPage.subtitle}
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    {stats.map((stat, idx) => (
                        <GlowingCard key={idx} glowColor="teal" className="p-3 md:p-4" isDark={isDark}>
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center bg-teal-500/10 text-teal-500">
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
                <GlowingCard glowColor="teal" className="p-3 md:p-4 mb-4 md:mb-6" isDark={isDark}>
                    <div className="flex flex-col gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <div className={cn("absolute top-1/2 -translate-y-1/2 text-gray-500", isRTL ? "right-3" : "left-3")}>{Icons.search}</div>
                            <input
                                type="text"
                                placeholder={t.adminDashboard.patientsPage.searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                aria-label={language === "ar" ? "البحث عن المرضى" : "Search patients"}
                                className={cn(
                                    "w-full py-2.5 rounded-xl border outline-none transition-colors",
                                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
                                    isDark
                                        ? "bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50"
                                        : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500"
                                )}
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex flex-col md:flex-row gap-3">
                            {/* Status Filter */}
                            <div className="flex gap-2 flex-wrap">
                                <span className={cn("text-xs font-medium flex items-center", isDark ? "text-gray-400" : "text-gray-600")}>
                                    {language === "ar" ? "الحالة:" : "Status:"}
                                </span>
                                {["all", "active", "inactive"].map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => {
                                            setStatusFilter(status);
                                            setCurrentPage(1);
                                        }}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                                            statusFilter === status
                                                ? "bg-teal-500 text-white"
                                                : isDark
                                                    ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                    >
                                        {getFilterLabel(status)}
                                    </button>
                                ))}
                            </div>

                            {/* Gender Filter */}
                            <div className="flex gap-2 flex-wrap">
                                <span className={cn("text-xs font-medium flex items-center", isDark ? "text-gray-400" : "text-gray-600")}>
                                    {language === "ar" ? "الجنس:" : "Gender:"}
                                </span>
                                {["all", "male", "female"].map((gender) => (
                                    <button
                                        key={gender}
                                        type="button"
                                        onClick={() => {
                                            setGenderFilter(gender);
                                            setCurrentPage(1);
                                        }}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                                            genderFilter === gender
                                                ? "bg-teal-500 text-white"
                                                : isDark
                                                    ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                    >
                                        {gender === "all" 
                                            ? (language === "ar" ? "الكل" : "All")
                                            : gender === "male"
                                                ? (language === "ar" ? "ذكر" : "Male")
                                                : (language === "ar" ? "أنثى" : "Female")
                                        }
                                    </button>
                                ))}
                            </div>

                            {/* Blood Type Filter */}
                            <div className="flex gap-2 flex-wrap">
                                <span className={cn("text-xs font-medium flex items-center", isDark ? "text-gray-400" : "text-gray-600")}>
                                    {language === "ar" ? "فصيلة الدم:" : "Blood:"}
                                </span>
                                <select
                                    value={bloodTypeFilter}
                                    onChange={(e) => {
                                        setBloodTypeFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors outline-none",
                                        isDark
                                            ? "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 [&>option]:bg-slate-900 [&>option]:text-white"
                                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                                    )}
                                >
                                    <option value="all">{language === "ar" ? "الكل" : "All"}</option>
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
                    </div>
                </GlowingCard>

                {/* Patients - Horizontal List Layout */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="text-teal-500 mb-4 flex justify-center">{Icons.spinner}</div>
                            <p className={isDark ? "text-gray-400" : "text-gray-600"}>{t.common.loading || "Loading..."}</p>
                        </div>
                    </div>
                ) : patients.length > 0 ? (
                    <div className="space-y-4">
                        {patients.map((patient, idx) => {
                            const age = calculateAge(patient.date_of_birth);
                            const isActive = patient.total_appointments > 0;

                            return (
                                <motion.div
                                    key={patient.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <GlowingCard glowColor="teal" className="p-3 md:p-5" isDark={isDark}>
                                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                                            {/* Patient Info */}
                                            <div className="flex items-center gap-3 md:gap-4 flex-1">
                                                <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden border-2 border-teal-500/30 flex-shrink-0">
                                                    {patient.avatar_url ? (
                                                        <Image src={patient.avatar_url} alt={patient.full_name} fill className="object-cover" unoptimized />
                                                    ) : (
                                                        <div className={cn("w-full h-full flex items-center justify-center text-lg font-semibold", isDark ? "bg-slate-700 text-gray-300" : "bg-gray-200 text-gray-600")}>
                                                            {patient.full_name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                                                        <h3 className={cn("font-semibold text-sm md:text-base", isDark ? "text-white" : "text-slate-900")}>{patient.full_name}</h3>
                                                        <Badge variant={isActive ? "active" : "inactive"}>
                                                            {getFilterLabel(isActive ? "active" : "inactive")}
                                                        </Badge>
                                                    </div>
                                                    <p className={cn("text-xs md:text-sm truncate", isDark ? "text-gray-500" : "text-gray-600")}>{patient.email || "-"}</p>
                                                </div>
                                            </div>

                                            {/* Patient Details */}
                                            <div className="flex flex-wrap items-center gap-4 md:gap-6 lg:gap-8">
                                                {age !== null && (
                                                    <div className="text-center">
                                                        <p className={cn("text-sm md:text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>{formatNumber(age)}</p>
                                                        <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>{t.adminDashboard.patientsPage.card.age}</p>
                                                    </div>
                                                )}
                                                {patient.gender && (
                                                    <div className="text-center">
                                                        <p className={cn("text-sm md:text-lg font-bold capitalize", isDark ? "text-white" : "text-slate-900")}>
                                                            {patient.gender === "male" ? (language === "ar" ? "ذكر" : "Male") : (language === "ar" ? "أنثى" : "Female")}
                                                        </p>
                                                        <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>
                                                            {language === "ar" ? "الجنس" : "Gender"}
                                                        </p>
                                                    </div>
                                                )}
                                                {patient.blood_type && (
                                                    <div className="text-center">
                                                        <p className={cn("text-sm md:text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>{patient.blood_type}</p>
                                                        <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>
                                                            {language === "ar" ? "فصيلة الدم" : "Blood Type"}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="text-center">
                                                    <p className={cn("text-sm md:text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>{formatNumber(patient.total_appointments)}</p>
                                                    <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>{t.adminDashboard.patientsPage.card.visits}</p>
                                                </div>
                                                <div className="hidden lg:block">
                                                    <p className={cn("text-xs md:text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{formatDate(patient.created_at)}</p>
                                                    <p className={cn("text-[10px] md:text-xs", isDark ? "text-gray-500" : "text-gray-600")}>
                                                        {language === "ar" ? "تاريخ التسجيل" : "Joined"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action */}
                                            <button
                                                type="button"
                                                aria-label={`${t.adminDashboard.patientsPage.card.viewRecords} - ${patient.full_name}`}
                                                className={cn(
                                                    "px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 md:gap-2",
                                                    isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                )}
                                            >
                                                {Icons.folder}
                                                {t.adminDashboard.patientsPage.card.viewRecords}
                                            </button>
                                        </div>
                                    </GlowingCard>
                                </motion.div>
                            );
                        })}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    aria-label={language === "ar" ? "الصفحة السابقة" : "Previous page"}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        currentPage === 1
                                            ? "opacity-50 cursor-not-allowed"
                                            : isDark
                                                ? "hover:bg-white/10"
                                                : "hover:bg-gray-100",
                                        isDark ? "text-gray-400" : "text-gray-600"
                                    )}
                                >
                                    {isRTL ? Icons.chevronRight : Icons.chevronLeft}
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                type="button"
                                                onClick={() => goToPage(pageNum)}
                                                aria-label={`${language === "ar" ? "صفحة" : "Page"} ${pageNum}`}
                                                aria-current={currentPage === pageNum ? "page" : undefined}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                                                    currentPage === pageNum
                                                        ? "bg-teal-500 text-white"
                                                        : isDark
                                                            ? "hover:bg-white/10 text-gray-400"
                                                            : "hover:bg-gray-100 text-gray-600"
                                                )}
                                            >
                                                {formatNumber(pageNum)}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    aria-label={language === "ar" ? "الصفحة التالية" : "Next page"}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        currentPage === totalPages
                                            ? "opacity-50 cursor-not-allowed"
                                            : isDark
                                                ? "hover:bg-white/10"
                                                : "hover:bg-gray-100",
                                        isDark ? "text-gray-400" : "text-gray-600"
                                    )}
                                >
                                    {isRTL ? Icons.chevronLeft : Icons.chevronRight}
                                </button>

                                <span className={cn("text-sm ml-4", isDark ? "text-gray-500" : "text-gray-600")}>
                                    {language === "ar"
                                        ? `${formatNumber(currentPage)} من ${formatNumber(totalPages)}`
                                        : `${formatNumber(currentPage)} of ${formatNumber(totalPages)}`}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", isDark ? "bg-white/5" : "bg-gray-100")}>
                            {Icons.patient}
                        </div>
                        <h3 className={cn("text-lg font-medium mb-2", isDark ? "text-white" : "text-slate-900")}>
                            {language === "ar" ? "لا يوجد مرضى" : "No patients found"}
                        </h3>
                        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                            {language === "ar" ? "حاول تعديل البحث" : "Try adjusting your search"}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
