"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useThemeStyles } from "../context/useThemeStyles";
import { useI18n } from "@/app/i18n";
import {
    getAvailableDoctors,
    getSpecializations,
    bookAppointment,
    type DoctorForBooking,
} from "@/app/actions/appointments";
import { getAvailableSlots, type AvailableSlot } from "@/app/actions/availability";

// Icons
const Icons = {
    search: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    star: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    ),
    starOutline: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
    ),
    calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    clock: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    chevronLeft: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
    ),
    chevronRight: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
    ),
    check: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    filter: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
    ),
    online: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
        </svg>
    ),
    sort: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
        </svg>
    ),
    x: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

type ViewMode = "list" | "booking";
type SortOption = "rating" | "fee_low" | "fee_high" | "experience";

interface BookingState {
    doctor: DoctorForBooking | null;
    selectedDate: string;
    selectedSlot: AvailableSlot | null;
    patientNotes: string;
    availableSlots: AvailableSlot[];
    loadingSlots: boolean;
}

interface Filters {
    search: string;
    specialization: string;
    sortBy: SortOption;
    availableNow: boolean;
}

function DoctorsPageContent() {
    const { t, isRTL, language } = useI18n();
    const { isDark, textPrimary, textSecondary, textMuted, inputBg, inputFocus, border } = useThemeStyles();
    const router = useRouter();
    const searchParams = useSearchParams();
    const autoBookId = searchParams.get("book") || searchParams.get("doctor");
    const autoBookSlug = searchParams.get("slug");

    const [mounted, setMounted] = useState(false);
    const [doctors, setDoctors] = useState<DoctorForBooking[]>([]);
    const [specializations, setSpecializations] = useState<{ id: string; name_en: string; name_ar: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        search: "",
        specialization: "all",
        sortBy: "rating",
        availableNow: false,
    });
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [booking, setBooking] = useState<BookingState>({
        doctor: null,
        selectedDate: "",
        selectedSlot: null,
        patientNotes: "",
        availableSlots: [],
        loadingSlots: false,
    });
    const [bookingStatus, setBookingStatus] = useState<"idle" | "booking" | "success" | "error">("idle");
    const bookingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Handle hydration and cleanup
    useEffect(() => {
        setMounted(true);
        return () => {
            if (bookingTimerRef.current) clearTimeout(bookingTimerRef.current);
        };
    }, []);

    const loadSpecializations = useCallback(async () => {
        const result = await getSpecializations();
        if (result.specializations) {
            setSpecializations(result.specializations);
        }
    }, []);

    const loadDoctors = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getAvailableDoctors({
                search: filters.search || undefined,
                specialization: filters.specialization !== "all" ? filters.specialization : undefined,
                sortBy: filters.sortBy,
                availableNow: filters.availableNow || undefined,
                limit: 50,
            });
            if (result.error) {
                console.error("Error loading doctors:", result.error);
            }
            setDoctors(result.doctors || []);
        } catch (error) {
            console.error("Failed to load doctors:", error);
            setDoctors([]);
        }
        setLoading(false);
    }, [filters.search, filters.specialization, filters.sortBy, filters.availableNow]);

    // Load specializations on mount
    useEffect(() => {
        loadSpecializations();
    }, [loadSpecializations]);

    // Load doctors when filters change (debounced for search)
    useEffect(() => {
        const timer = setTimeout(() => {
            loadDoctors();
        }, filters.search ? 300 : 0);

        return () => clearTimeout(timer);
    }, [filters.search, filters.specialization, filters.sortBy, filters.availableNow, loadDoctors]);

    const loadSlotsForDate = useCallback(async (doctorId: string, date: string) => {
        setBooking(prev => ({ ...prev, loadingSlots: true, selectedSlot: null }));
        const result = await getAvailableSlots(doctorId, date, 30);
        setBooking(prev => ({
            ...prev,
            availableSlots: result.slots || [],
            loadingSlots: false,
        }));
    }, []);

    const handleBookDoctor = useCallback((doctor: DoctorForBooking) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split("T")[0];

        setBooking({
            doctor,
            selectedDate: dateStr,
            selectedSlot: null,
            patientNotes: "",
            availableSlots: [],
            loadingSlots: false,
        });
        setViewMode("booking");
        loadSlotsForDate(doctor.id, dateStr);
    }, [loadSlotsForDate]);

    // Auto-open booking view if book/doctor ID is passed in URL
    useEffect(() => {
        if ((!autoBookId && !autoBookSlug) || doctors.length === 0 || viewMode === "booking") return;

        const targetDoctor = doctors.find(
            (d) => d.id === autoBookId || (autoBookSlug && d.slug === autoBookSlug)
        );

        if (targetDoctor) {
            handleBookDoctor(targetDoctor);
        }
    }, [autoBookId, autoBookSlug, doctors, viewMode, handleBookDoctor]);

    const handleDateChange = (date: string) => {
        setBooking(prev => ({ ...prev, selectedDate: date }));
        if (booking.doctor) {
            loadSlotsForDate(booking.doctor.id, date);
        }
    };

    const handleConfirmBooking = async () => {
        if (!booking.doctor || !booking.selectedSlot) return;

        setBookingStatus("booking");
        const result = await bookAppointment({
            doctorProfileId: booking.doctor.id,
            scheduledStart: booking.selectedSlot.start,
            scheduledEnd: booking.selectedSlot.end,
            patientNotes: booking.patientNotes || undefined,
        });

        if (result.success && result.appointmentId) {
            // Redirect to checkout page for payment
            router.push(`/${language}/checkout?appointment=${result.appointmentId}`);
        } else {
            console.error("Booking failed:", result.error);
            setBookingStatus("error");
            if (bookingTimerRef.current) clearTimeout(bookingTimerRef.current);
            bookingTimerRef.current = setTimeout(() => setBookingStatus("idle"), 3000);
        }
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            specialization: "all",
            sortBy: "rating",
            availableNow: false,
        });
    };

    const hasActiveFilters = filters.specialization !== "all" || filters.availableNow || filters.sortBy !== "rating";

    const formatTime = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat(isRTL ? "ar-EG" : "en-EG", {
            style: "currency",
            currency: "EGP",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} className="text-yellow-400">{Icons.star}</span>);
            } else {
                stars.push(<span key={i} className={textMuted}>{Icons.starOutline}</span>);
            }
        }
        return stars;
    };

    const sortOptions: { value: SortOption; labelEn: string; labelAr: string }[] = [
        { value: "rating", labelEn: "Top Rated", labelAr: "الأعلى تقييماً" },
        { value: "fee_low", labelEn: "Lowest Fee", labelAr: "الأقل سعراً" },
        { value: "fee_high", labelEn: "Highest Fee", labelAr: "الأعلى سعراً" },
        { value: "experience", labelEn: "Most Experienced", labelAr: "الأكثر خبرة" },
    ];

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-2 border-[#FD614B] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
                {viewMode === "list" ? (
                    <motion.div
                        key="list"
                        initial={false}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        {/* Header */}
                        <div className="mb-6 md:mb-8">
                            <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                                <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#044C87] to-[#0C67B3] flex items-center justify-center text-white shadow-[0_0_15px_rgba(4,76,135,0.4)] border border-[#0C67B3]/40">
                                    {Icons.users}
                                </span>
                                {t.patientDashboard.doctorsPage.title}
                            </h1>
                            <p className={cn("text-sm md:text-base mt-1", textMuted)}>
                                {t.patientDashboard.doctorsPage.subtitle}
                            </p>
                        </div>

                        {/* Search and Filters Bar */}
                        <div className="mb-6 space-y-4">
                            {/* Search Row */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search Input */}
                                <div className="relative flex-1">
                                    <span className={cn("absolute top-1/2 -translate-y-1/2", isRTL ? "right-4" : "left-4", textMuted)}>
                                        {Icons.search}
                                    </span>
                                    <input
                                        type="text"
                                        placeholder={t.patientDashboard.doctorsPage.searchPlaceholder}
                                        value={filters.search}
                                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                        className={cn(
                                            "w-full py-3 rounded-xl border transition-colors outline-none",
                                            isRTL ? "pr-12 pl-4" : "pl-12 pr-4",
                                            inputBg,
                                            inputFocus,
                                            border
                                        )}
                                    />
                                    {filters.search && (
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                                            className={cn("absolute top-1/2 -translate-y-1/2", isRTL ? "left-4" : "right-4", textMuted, "hover:text-red-500")}
                                        >
                                            {Icons.x}
                                        </button>
                                    )}
                                </div>

                                {/* Filter Toggle Button */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors",
                                        showFilters
                                            ? "bg-[#FD614B] text-white border-[#FD614B]"
                                            : cn(inputBg, border, textSecondary, "hover:border-[#FD614B]")
                                    )}
                                >
                                    {Icons.filter}
                                    <span className="font-medium">{isRTL ? "فلترة" : "Filters"}</span>
                                    {hasActiveFilters && (
                                        <span className="w-2 h-2 bg-[#FD614B] rounded-full" />
                                    )}
                                </button>
                            </div>

                            {/* Filters Panel */}
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <GlowingCard isDark={isDark} glowColor="coral" className="p-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {/* Specialization Filter */}
                                                <div>
                                                    <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                                                        {isRTL ? "التخصص" : "Specialization"}
                                                    </label>
                                                    <select
                                                        value={filters.specialization}
                                                        onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                                                        className={cn(
                                                            "w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none",
                                                            inputBg,
                                                            inputFocus,
                                                            border
                                                        )}
                                                    >
                                                        <option value="all">{isRTL ? "جميع التخصصات" : "All Specializations"}</option>
                                                        {specializations.map(spec => (
                                                            <option key={spec.id} value={spec.name_en}>
                                                                {isRTL ? spec.name_ar : spec.name_en}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Sort By */}
                                                <div>
                                                    <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                                                        {isRTL ? "ترتيب حسب" : "Sort By"}
                                                    </label>
                                                    <select
                                                        value={filters.sortBy}
                                                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as SortOption }))}
                                                        className={cn(
                                                            "w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none",
                                                            inputBg,
                                                            inputFocus,
                                                            border
                                                        )}
                                                    >
                                                        {sortOptions.map(opt => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {isRTL ? opt.labelAr : opt.labelEn}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Available Now Toggle */}
                                                <div className="flex items-end">
                                                    <button
                                                        onClick={() => setFilters(prev => ({ ...prev, availableNow: !prev.availableNow }))}
                                                        className={cn(
                                                            "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors w-full justify-center",
                                                            filters.availableNow
                                                                ? "bg-green-500/10 border-green-500 text-green-500"
                                                                : cn(inputBg, border, textSecondary, "hover:border-green-500")
                                                        )}
                                                    >
                                                        <span className={cn("w-2 h-2 rounded-full", filters.availableNow ? "bg-green-500" : "bg-gray-400")} />
                                                        {isRTL ? "متاح الآن" : "Available Now"}
                                                    </button>
                                                </div>

                                                {/* Clear Filters */}
                                                <div className="flex items-end">
                                                    <button
                                                        onClick={clearFilters}
                                                        disabled={!hasActiveFilters && !filters.search}
                                                        className={cn(
                                                            "px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors w-full",
                                                            hasActiveFilters || filters.search
                                                                ? "border-red-500/50 text-red-500 hover:bg-red-500/10"
                                                                : cn(border, textMuted, "cursor-not-allowed opacity-50")
                                                        )}
                                                    >
                                                        {isRTL ? "مسح الفلاتر" : "Clear Filters"}
                                                    </button>
                                                </div>
                                            </div>
                                        </GlowingCard>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Results Count */}
                            <div className={cn("text-sm", textMuted)}>
                                {loading ? (
                                    isRTL ? "جاري البحث..." : "Searching..."
                                ) : (
                                    isRTL
                                        ? `${doctors.length} طبيب متاح`
                                        : `${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} found`
                                )}
                            </div>
                        </div>

                        {/* Doctors Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className={cn("rounded-xl p-4 animate-pulse", isDark ? "bg-white/5" : "bg-gray-100")}>
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={cn("w-16 h-16 rounded-xl", isDark ? "bg-white/10" : "bg-gray-200")} />
                                            <div className="flex-1">
                                                <div className={cn("h-5 rounded w-3/4 mb-2", isDark ? "bg-white/10" : "bg-gray-200")} />
                                                <div className={cn("h-4 rounded w-1/2", isDark ? "bg-white/10" : "bg-gray-200")} />
                                            </div>
                                        </div>
                                        <div className={cn("h-12 rounded", isDark ? "bg-white/10" : "bg-gray-200")} />
                                    </div>
                                ))}
                            </div>
                        ) : doctors.length === 0 ? (
                            <GlowingCard isDark={isDark} glowColor="coral" className="p-12 text-center">
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", isDark ? "bg-[#08213D]" : "bg-gray-100", textMuted)}>
                                    {Icons.users}
                                </div>
                                <h3 className={cn("text-lg font-medium mb-2", textPrimary)}>
                                    {t.patientDashboard.doctorsPage.noResults}
                                </h3>
                                <p className={textMuted}>{t.patientDashboard.doctorsPage.noResultsDesc}</p>
                                {(hasActiveFilters || filters.search) && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-4 px-4 py-2 bg-[#FD614B] text-white rounded-lg text-sm font-medium hover:bg-[#E84D37] transition-colors"
                                    >
                                        {isRTL ? "مسح الفلاتر" : "Clear Filters"}
                                    </button>
                                )}
                            </GlowingCard>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {doctors.map((doctor) => (
                                    <motion.div
                                        key={doctor.id}
                                        initial={false}
                                    >
                                        <GlowingCard isDark={isDark} glowColor="coral" className="p-4 h-full flex flex-col">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#FD614B]/40 flex-shrink-0">
                                                    {doctor.avatar_url ? (
                                                        <Image
                                                            src={doctor.avatar_url}
                                                            alt={doctor.full_name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="64px"
                                                        />
                                                    ) : (
                                                        <div className={cn("w-full h-full flex items-center justify-center text-2xl font-bold", isDark ? "bg-[#FD614B]/10 text-[#FD614B]" : "bg-[#FFF5F3] text-[#E84D37]")}>
                                                            {doctor.full_name.charAt(0)}
                                                        </div>
                                                    )}
                                                    {doctor.is_available_now && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={cn("font-semibold truncate", textPrimary)}>
                                                        {doctor.full_name}
                                                    </h3>
                                                    <p className={cn("text-sm", textSecondary)}>
                                                        {doctor.specializations
                                                            .map(s => {
                                                                if (!isRTL) return s;
                                                                const found = specializations.find(sp => sp.name_en.toLowerCase() === s.toLowerCase());
                                                                return found ? found.name_ar : s;
                                                            })
                                                            .join(", ") || (isRTL ? "طب عام" : "General Practice")}
                                                    </p>
                                                    {doctor.years_of_experience && (
                                                        <p className={cn("text-xs mt-1", textMuted)}>
                                                            {doctor.years_of_experience} {t.patientDashboard.doctorsPage.years} {t.patientDashboard.doctorsPage.experience.toLowerCase()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            {doctor.rating_average !== undefined && doctor.rating_average > 0 && (
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="flex items-center gap-0.5">
                                                        {renderStars(doctor.rating_average)}
                                                    </div>
                                                    <span className={cn("text-sm font-medium", textSecondary)}>
                                                        {doctor.rating_average.toFixed(1)}
                                                    </span>
                                                    {doctor.rating_count !== undefined && doctor.rating_count > 0 && (
                                                        <span className={cn("text-xs", textMuted)}>
                                                            ({doctor.rating_count} {isRTL ? "تقييم" : "reviews"})
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {doctor.bio && (
                                                <p className={cn("text-sm mb-4 line-clamp-2", textMuted)}>
                                                    {doctor.bio}
                                                </p>
                                            )}

                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                                <div>
                                                    {doctor.consultation_fee && (
                                                        <p className="text-[#FD614B] font-semibold">
                                                            {formatCurrency(doctor.consultation_fee)}
                                                            <span className={cn("text-xs font-normal ml-1", textMuted)}>
                                                                {t.patientDashboard.doctorsPage.perSession}
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleBookDoctor(doctor)}
                                                    className="px-4 py-2 bg-[#FD614B] hover:bg-[#E84D37] text-white rounded-lg font-medium text-sm transition-colors"
                                                >
                                                    {t.patientDashboard.doctorsPage.bookNow}
                                                </button>
                                            </div>
                                        </GlowingCard>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="booking"
                        initial={false}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {/* Back Button */}
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "flex items-center gap-2 mb-6 text-sm font-medium transition-colors",
                                isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            {isRTL ? Icons.chevronRight : Icons.chevronLeft}
                            {t.patientDashboard.doctorsPage.back}
                        </button>

                        {booking.doctor && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Doctor Info */}
                                <GlowingCard isDark={isDark} glowColor="coral" className="p-6">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#FD614B]/40 flex-shrink-0">
                                            {booking.doctor.avatar_url ? (
                                                <Image
                                                    src={booking.doctor.avatar_url}
                                                    alt={booking.doctor.full_name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            ) : (
                                                <div className={cn("w-full h-full flex items-center justify-center text-3xl font-bold", isDark ? "bg-[#FD614B]/10 text-[#FD614B]" : "bg-[#FFF5F3] text-[#E84D37]")}>
                                                    {booking.doctor.full_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className={cn("text-xl font-bold", textPrimary)}>
                                                {booking.doctor.full_name}
                                            </h2>
                                            <p className={cn("text-sm", textSecondary)}>
                                                {booking.doctor.specializations.join(", ")}
                                            </p>
                                            {booking.doctor.rating_average !== undefined && booking.doctor.rating_average > 0 && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex items-center gap-0.5">
                                                        {renderStars(booking.doctor.rating_average)}
                                                    </div>
                                                    <span className={cn("text-sm", textSecondary)}>
                                                        {booking.doctor.rating_average.toFixed(1)}
                                                    </span>
                                                </div>
                                            )}
                                            {booking.doctor.consultation_fee && (
                                                <p className="text-[#FD614B] font-semibold mt-2">
                                                    {formatCurrency(booking.doctor.consultation_fee)}
                                                    <span className={cn("text-xs font-normal ml-1", textMuted)}>
                                                        {t.patientDashboard.doctorsPage.perSession}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {booking.doctor.bio && (
                                        <p className={cn("text-sm", textMuted)}>{booking.doctor.bio}</p>
                                    )}
                                </GlowingCard>

                                {/* Booking Form */}
                                <GlowingCard isDark={isDark} glowColor="coral" className="p-6">
                                    {/* Date Selection */}
                                    <div className="mb-6">
                                        <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                                            {t.patientDashboard.doctorsPage.selectDate}
                                        </label>
                                        <input
                                            type="date"
                                            value={booking.selectedDate}
                                            onChange={(e) => handleDateChange(e.target.value)}
                                            min={new Date().toISOString().split("T")[0]}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl border text-sm",
                                                inputBg,
                                                inputFocus,
                                                border
                                            )}
                                        />
                                    </div>

                                    {/* Time Slots */}
                                    <div className="mb-6">
                                        <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                                            {t.patientDashboard.doctorsPage.availableSlots}
                                        </label>
                                        {booking.loadingSlots ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin w-6 h-6 border-2 border-[#FD614B] border-t-transparent rounded-full" />
                                            </div>
                                        ) : booking.availableSlots.length === 0 ? (
                                            <p className={cn("text-center py-8", textMuted)}>
                                                {t.patientDashboard.doctorsPage.noSlots}
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2">
                                                {booking.availableSlots.map((slot) => (
                                                    <button
                                                        key={slot.start}
                                                        onClick={() => setBooking(prev => ({ ...prev, selectedSlot: slot }))}
                                                        className={cn(
                                                            "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1",
                                                            booking.selectedSlot?.start === slot.start
                                                                ? "bg-[#FD614B] text-white"
                                                                : isDark
                                                                    ? "bg-white/5 hover:bg-white/10 text-gray-300"
                                                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                        )}
                                                    >
                                                        {Icons.clock}
                                                        {formatTime(slot.start)}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Patient Notes */}
                                    <div className="mb-6">
                                        <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                                            {t.patientDashboard.doctorsPage.patientNotes}
                                        </label>
                                        <textarea
                                            value={booking.patientNotes}
                                            onChange={(e) => setBooking(prev => ({ ...prev, patientNotes: e.target.value }))}
                                            placeholder={t.patientDashboard.doctorsPage.patientNotesPlaceholder}
                                            rows={3}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl border text-sm resize-none",
                                                inputBg,
                                                inputFocus,
                                                border
                                            )}
                                        />
                                    </div>

                                    {/* Confirm Button */}
                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={!booking.selectedSlot || bookingStatus !== "idle"}
                                        className={cn(
                                            "w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                                            booking.selectedSlot && bookingStatus === "idle"
                                                ? "bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white shadow-lg shadow-[#FD614B]/30"
                                                : bookingStatus === "success"
                                                    ? "bg-green-500 text-white"
                                                    : bookingStatus === "error"
                                                        ? "bg-red-500 text-white"
                                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        )}
                                    >
                                        {bookingStatus === "booking" && (
                                            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                        )}
                                        {bookingStatus === "success" && Icons.check}
                                        {bookingStatus === "idle" && t.patientDashboard.doctorsPage.confirmBooking}
                                        {bookingStatus === "booking" && t.patientDashboard.doctorsPage.booking}
                                        {bookingStatus === "success" && t.patientDashboard.doctorsPage.bookingConfirmed}
                                        {bookingStatus === "error" && t.patientDashboard.doctorsPage.bookingFailed}
                                    </button>
                                </GlowingCard>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


export default function DoctorsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#FD614B]/40 border-t-[#FD614B] rounded-full animate-spin" />
            </div>
        }>
            <DoctorsPageContent />
        </Suspense>
    );
}
