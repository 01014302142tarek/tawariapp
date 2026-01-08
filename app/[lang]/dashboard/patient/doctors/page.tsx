"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useThemeStyles } from "../context/useThemeStyles";
import { useI18n } from "@/app/i18n";
import {
    getAvailableDoctors,
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
};

type ViewMode = "list" | "booking";

interface BookingState {
    doctor: DoctorForBooking | null;
    selectedDate: string;
    selectedSlot: AvailableSlot | null;
    patientNotes: string;
    availableSlots: AvailableSlot[];
    loadingSlots: boolean;
}

export default function DoctorsPage() {
    const { t, isRTL, language } = useI18n();
    const { isDark, textPrimary, textSecondary, textMuted, inputBg, inputFocus, border } = useThemeStyles();

    const [doctors, setDoctors] = useState<DoctorForBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
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

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        setLoading(true);
        const result = await getAvailableDoctors({ limit: 50 });
        if (result.doctors) {
            setDoctors(result.doctors);
        }
        setLoading(false);
    };

    const filteredDoctors = doctors.filter(doc => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            doc.full_name.toLowerCase().includes(query) ||
            doc.specializations.some(s => s.toLowerCase().includes(query))
        );
    });

    const handleBookDoctor = (doctor: DoctorForBooking) => {
        // Set default date to tomorrow
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
    };

    const loadSlotsForDate = async (doctorId: string, date: string) => {
        setBooking(prev => ({ ...prev, loadingSlots: true, selectedSlot: null }));
        const result = await getAvailableSlots(doctorId, date, 30);
        setBooking(prev => ({
            ...prev,
            availableSlots: result.slots || [],
            loadingSlots: false,
        }));
    };

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

        if (result.success) {
            setBookingStatus("success");
            setTimeout(() => {
                setViewMode("list");
                setBookingStatus("idle");
                setBooking({
                    doctor: null,
                    selectedDate: "",
                    selectedSlot: null,
                    patientNotes: "",
                    availableSlots: [],
                    loadingSlots: false,
                });
            }, 2000);
        } else {
            setBookingStatus("error");
            setTimeout(() => setBookingStatus("idle"), 3000);
        }
    };

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

    if (loading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
                {viewMode === "list" ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        {/* Header */}
                        <div className="mb-6 md:mb-8">
                            <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                                <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                    {Icons.users}
                                </span>
                                {t.patientDashboard.doctorsPage.title}
                            </h1>
                            <p className={cn("text-sm md:text-base mt-1", textMuted)}>
                                {t.patientDashboard.doctorsPage.subtitle}
                            </p>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <span className={cn("absolute top-1/2 -translate-y-1/2", isRTL ? "right-4" : "left-4", textMuted)}>
                                    {Icons.search}
                                </span>
                                <input
                                    type="text"
                                    placeholder={t.patientDashboard.doctorsPage.searchPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={cn(
                                        "w-full py-3 rounded-xl border transition-colors outline-none",
                                        isRTL ? "pr-12 pl-4" : "pl-12 pr-4",
                                        inputBg,
                                        inputFocus,
                                        border
                                    )}
                                />
                            </div>
                        </div>

                        {/* Doctors Grid */}
                        {filteredDoctors.length === 0 ? (
                            <GlowingCard isDark={isDark} glowColor="teal" className="p-12 text-center">
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", isDark ? "bg-slate-900" : "bg-gray-100", textMuted)}>
                                    {Icons.users}
                                </div>
                                <h3 className={cn("text-lg font-medium mb-2", textPrimary)}>
                                    {t.patientDashboard.doctorsPage.noResults}
                                </h3>
                                <p className={textMuted}>{t.patientDashboard.doctorsPage.noResultsDesc}</p>
                            </GlowingCard>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredDoctors.map((doctor, idx) => (
                                    <motion.div
                                        key={doctor.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <GlowingCard isDark={isDark} glowColor="teal" className="p-4 h-full flex flex-col">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-teal-500/30 flex-shrink-0">
                                                    {doctor.avatar_url ? (
                                                        <Image
                                                            src={doctor.avatar_url}
                                                            alt={doctor.full_name}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className={cn("w-full h-full flex items-center justify-center text-2xl font-bold", isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-600")}>
                                                            {doctor.full_name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={cn("font-semibold truncate", textPrimary)}>
                                                        {doctor.full_name}
                                                    </h3>
                                                    <p className={cn("text-sm", textSecondary)}>
                                                        {doctor.specializations.join(", ") || "General Practice"}
                                                    </p>
                                                    {doctor.years_of_experience && (
                                                        <p className={cn("text-xs mt-1", textMuted)}>
                                                            {doctor.years_of_experience} {t.patientDashboard.doctorsPage.years} {t.patientDashboard.doctorsPage.experience.toLowerCase()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {doctor.bio && (
                                                <p className={cn("text-sm mb-4 line-clamp-2", textMuted)}>
                                                    {doctor.bio}
                                                </p>
                                            )}

                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                                <div>
                                                    {doctor.consultation_fee && (
                                                        <p className="text-teal-500 font-semibold">
                                                            {formatCurrency(doctor.consultation_fee)}
                                                            <span className={cn("text-xs font-normal ml-1", textMuted)}>
                                                                {t.patientDashboard.doctorsPage.perSession}
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleBookDoctor(doctor)}
                                                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium text-sm transition-colors"
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
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
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
                                <GlowingCard isDark={isDark} glowColor="teal" className="p-6">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-teal-500/30 flex-shrink-0">
                                            {booking.doctor.avatar_url ? (
                                                <Image
                                                    src={booking.doctor.avatar_url}
                                                    alt={booking.doctor.full_name}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className={cn("w-full h-full flex items-center justify-center text-3xl font-bold", isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-600")}>
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
                                            {booking.doctor.consultation_fee && (
                                                <p className="text-teal-500 font-semibold mt-2">
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
                                <GlowingCard isDark={isDark} glowColor="teal" className="p-6">
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
                                                <div className="animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full" />
                                            </div>
                                        ) : booking.availableSlots.length === 0 ? (
                                            <p className={cn("text-center py-8", textMuted)}>
                                                {t.patientDashboard.doctorsPage.noSlots}
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2">
                                                {booking.availableSlots.map((slot, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setBooking(prev => ({ ...prev, selectedSlot: slot }))}
                                                        className={cn(
                                                            "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1",
                                                            booking.selectedSlot?.start === slot.start
                                                                ? "bg-teal-500 text-white"
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
                                                ? "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white shadow-lg shadow-teal-500/20"
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
