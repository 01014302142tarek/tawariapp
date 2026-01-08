"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useThemeStyles } from "../context/useThemeStyles";
import { useI18n } from "@/app/i18n";
import {
    getDoctorAvailability,
    setDayAvailability,
    getBlockedTimes,
    addBlockedTime,
    removeBlockedTime,
    type DoctorAvailability,
    type BlockedTime,
} from "@/app/actions/availability";

// Icons
const Icons = {
    clock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    plus: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    trash: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
    calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    check: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
};

interface TimeSlot {
    start_time: string;
    end_time: string;
}

interface DaySchedule {
    dayOfWeek: number;
    slots: TimeSlot[];
    isActive: boolean;
}

export default function SchedulePage() {
    const { t, isRTL } = useI18n();
    const { isDark, textPrimary, textSecondary, textMuted, inputBg, inputFocus, border } = useThemeStyles();

    const [schedule, setSchedule] = useState<DaySchedule[]>([]);
    const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);
    const [savedDays, setSavedDays] = useState<Set<number>>(new Set());

    // Blocked time form state
    const [showBlockedForm, setShowBlockedForm] = useState(false);
    const [blockedForm, setBlockedForm] = useState({
        start_datetime: "",
        end_datetime: "",
        reason: "",
    });

    const dayNames = [
        t.doctorDashboard.schedulePage.days.sunday,
        t.doctorDashboard.schedulePage.days.monday,
        t.doctorDashboard.schedulePage.days.tuesday,
        t.doctorDashboard.schedulePage.days.wednesday,
        t.doctorDashboard.schedulePage.days.thursday,
        t.doctorDashboard.schedulePage.days.friday,
        t.doctorDashboard.schedulePage.days.saturday,
    ];

    // Initialize schedule with empty days
    useEffect(() => {
        const initSchedule: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
            dayOfWeek: i,
            slots: [],
            isActive: true,
        }));
        setSchedule(initSchedule);
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [availResult, blockedResult] = await Promise.all([
                getDoctorAvailability(),
                getBlockedTimes(),
            ]);

            if (availResult.availability) {
                setSchedule(prev =>
                    prev.map(day => {
                        const daySlots = availResult.availability.filter(
                            a => a.day_of_week === day.dayOfWeek && a.is_active
                        );
                        return {
                            ...day,
                            slots: daySlots.map(s => ({
                                start_time: s.start_time,
                                end_time: s.end_time,
                            })),
                        };
                    })
                );
            }

            if (blockedResult.blockedTimes) {
                setBlockedTimes(blockedResult.blockedTimes);
            }
        } catch (error) {
            console.error("Error loading schedule data:", error);
        }
        setLoading(false);
    };

    const addTimeSlot = (dayOfWeek: number) => {
        setSchedule(prev =>
            prev.map(day => {
                if (day.dayOfWeek === dayOfWeek) {
                    const lastSlot = day.slots[day.slots.length - 1];
                    const newStart = lastSlot ? lastSlot.end_time : "09:00";
                    const newEnd = lastSlot
                        ? addHours(lastSlot.end_time, 2)
                        : "17:00";
                    return {
                        ...day,
                        slots: [...day.slots, { start_time: newStart, end_time: newEnd }],
                    };
                }
                return day;
            })
        );
    };

    const removeTimeSlot = (dayOfWeek: number, slotIndex: number) => {
        setSchedule(prev =>
            prev.map(day => {
                if (day.dayOfWeek === dayOfWeek) {
                    return {
                        ...day,
                        slots: day.slots.filter((_, i) => i !== slotIndex),
                    };
                }
                return day;
            })
        );
    };

    const updateSlot = (
        dayOfWeek: number,
        slotIndex: number,
        field: "start_time" | "end_time",
        value: string
    ) => {
        setSchedule(prev =>
            prev.map(day => {
                if (day.dayOfWeek === dayOfWeek) {
                    return {
                        ...day,
                        slots: day.slots.map((slot, i) =>
                            i === slotIndex ? { ...slot, [field]: value } : slot
                        ),
                    };
                }
                return day;
            })
        );
    };

    const saveDay = async (dayOfWeek: number) => {
        setSaving(dayOfWeek);
        const day = schedule.find(d => d.dayOfWeek === dayOfWeek);
        if (!day) return;

        const result = await setDayAvailability(dayOfWeek, day.slots);
        if (result.success) {
            setSavedDays(prev => new Set([...prev, dayOfWeek]));
            setTimeout(() => {
                setSavedDays(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(dayOfWeek);
                    return newSet;
                });
            }, 2000);
        }
        setSaving(null);
    };

    const handleAddBlockedTime = async () => {
        if (!blockedForm.start_datetime || !blockedForm.end_datetime) return;

        const result = await addBlockedTime({
            start_datetime: blockedForm.start_datetime,
            end_datetime: blockedForm.end_datetime,
            reason: blockedForm.reason || undefined,
        });

        if (result.success) {
            setBlockedForm({ start_datetime: "", end_datetime: "", reason: "" });
            setShowBlockedForm(false);
            loadData();
        }
    };

    const handleRemoveBlockedTime = async (id: string) => {
        const result = await removeBlockedTime(id);
        if (result.success) {
            setBlockedTimes(prev => prev.filter(bt => bt.id !== id));
        }
    };

    const addHours = (time: string, hours: number): string => {
        const [h, m] = time.split(":").map(Number);
        const newH = Math.min(23, h + hours);
        return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    const formatDateTime = (datetime: string): string => {
        const date = new Date(datetime);
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                    <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                        {Icons.clock}
                    </span>
                    {t.doctorDashboard.schedulePage.title}
                </h1>
                <p className={cn("text-sm md:text-base mt-1", textMuted)}>
                    {t.doctorDashboard.schedulePage.subtitle}
                </p>
            </div>

            {/* Weekly Schedule */}
            <section className="mb-8">
                <h2 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", textPrimary)}>
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    {t.doctorDashboard.schedulePage.weeklySchedule}
                </h2>
                <p className={cn("text-sm mb-4", textMuted)}>
                    {t.doctorDashboard.schedulePage.setYourHours}
                </p>

                <div className="grid gap-4">
                    {schedule.map((day, idx) => (
                        <motion.div
                            key={day.dayOfWeek}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <GlowingCard isDark={isDark} glowColor="teal" className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Day Name */}
                                    <div className="w-full md:w-32 flex-shrink-0">
                                        <span className={cn("font-semibold", textPrimary)}>
                                            {dayNames[day.dayOfWeek]}
                                        </span>
                                    </div>

                                    {/* Time Slots */}
                                    <div className="flex-1 space-y-3">
                                        {day.slots.length === 0 ? (
                                            <span className={cn("text-sm italic", textMuted)}>
                                                {t.doctorDashboard.schedulePage.dayOff}
                                            </span>
                                        ) : (
                                            day.slots.map((slot, slotIdx) => (
                                                <div key={slotIdx} className="flex items-center gap-2 flex-wrap">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="time"
                                                            value={slot.start_time}
                                                            onChange={(e) =>
                                                                updateSlot(day.dayOfWeek, slotIdx, "start_time", e.target.value)
                                                            }
                                                            className={cn(
                                                                "px-3 py-2 rounded-lg border text-sm",
                                                                inputBg,
                                                                inputFocus,
                                                                border
                                                            )}
                                                        />
                                                        <span className={textMuted}>-</span>
                                                        <input
                                                            type="time"
                                                            value={slot.end_time}
                                                            onChange={(e) =>
                                                                updateSlot(day.dayOfWeek, slotIdx, "end_time", e.target.value)
                                                            }
                                                            className={cn(
                                                                "px-3 py-2 rounded-lg border text-sm",
                                                                inputBg,
                                                                inputFocus,
                                                                border
                                                            )}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeTimeSlot(day.dayOfWeek, slotIdx)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors",
                                                            isDark
                                                                ? "text-red-400 hover:bg-red-500/10"
                                                                : "text-red-500 hover:bg-red-50"
                                                        )}
                                                        title={t.doctorDashboard.schedulePage.removeSlot}
                                                    >
                                                        {Icons.trash}
                                                    </button>
                                                </div>
                                            ))
                                        )}

                                        {/* Add Slot Button */}
                                        <button
                                            onClick={() => addTimeSlot(day.dayOfWeek)}
                                            className={cn(
                                                "flex items-center gap-1 text-sm font-medium text-teal-500 hover:text-teal-400 transition-colors"
                                            )}
                                        >
                                            {Icons.plus}
                                            {t.doctorDashboard.schedulePage.addSlot}
                                        </button>
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={() => saveDay(day.dayOfWeek)}
                                            disabled={saving === day.dayOfWeek}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                                savedDays.has(day.dayOfWeek)
                                                    ? "bg-green-500 text-white"
                                                    : "bg-teal-500 hover:bg-teal-600 text-white"
                                            )}
                                        >
                                            {saving === day.dayOfWeek ? (
                                                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                            ) : savedDays.has(day.dayOfWeek) ? (
                                                Icons.check
                                            ) : null}
                                            {saving === day.dayOfWeek
                                                ? t.doctorDashboard.schedulePage.saving
                                                : savedDays.has(day.dayOfWeek)
                                                    ? t.doctorDashboard.schedulePage.saved
                                                    : t.doctorDashboard.schedulePage.saveChanges}
                                        </button>
                                    </div>
                                </div>
                            </GlowingCard>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Blocked Times */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className={cn("text-lg font-semibold flex items-center gap-2", textPrimary)}>
                            <span className={textMuted}>{Icons.calendar}</span>
                            {t.doctorDashboard.schedulePage.blockedTimes}
                        </h2>
                        <p className={cn("text-sm mt-1", textMuted)}>
                            {t.doctorDashboard.schedulePage.blockedTimesDesc}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowBlockedForm(!showBlockedForm)}
                        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold py-2 px-4 rounded-xl transition-all shadow-lg shadow-teal-500/20 text-sm"
                    >
                        {Icons.plus}
                        {t.doctorDashboard.schedulePage.addBlockedTime}
                    </button>
                </div>

                {/* Add Blocked Time Form */}
                {showBlockedForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                    >
                        <GlowingCard isDark={isDark} glowColor="teal" className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1", textSecondary)}>
                                        {t.doctorDashboard.schedulePage.from}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={blockedForm.start_datetime}
                                        onChange={(e) =>
                                            setBlockedForm(prev => ({ ...prev, start_datetime: e.target.value }))
                                        }
                                        className={cn(
                                            "w-full px-3 py-2 rounded-lg border text-sm",
                                            inputBg,
                                            inputFocus,
                                            border
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1", textSecondary)}>
                                        {t.doctorDashboard.schedulePage.to}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={blockedForm.end_datetime}
                                        onChange={(e) =>
                                            setBlockedForm(prev => ({ ...prev, end_datetime: e.target.value }))
                                        }
                                        className={cn(
                                            "w-full px-3 py-2 rounded-lg border text-sm",
                                            inputBg,
                                            inputFocus,
                                            border
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1", textSecondary)}>
                                        {t.doctorDashboard.schedulePage.reason}
                                    </label>
                                    <input
                                        type="text"
                                        value={blockedForm.reason}
                                        onChange={(e) =>
                                            setBlockedForm(prev => ({ ...prev, reason: e.target.value }))
                                        }
                                        placeholder={t.doctorDashboard.schedulePage.reasonPlaceholder}
                                        className={cn(
                                            "w-full px-3 py-2 rounded-lg border text-sm",
                                            inputBg,
                                            inputFocus,
                                            border
                                        )}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleAddBlockedTime}
                                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        {t.doctorDashboard.schedulePage.addBlockedTime}
                                    </button>
                                </div>
                            </div>
                        </GlowingCard>
                    </motion.div>
                )}

                {/* Blocked Times List */}
                {blockedTimes.length === 0 ? (
                    <GlowingCard isDark={isDark} glowColor="teal" className="p-8 text-center">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3", isDark ? "bg-slate-900" : "bg-gray-100", textMuted)}>
                            {Icons.calendar}
                        </div>
                        <p className={textMuted}>{t.doctorDashboard.schedulePage.noBlockedTimes}</p>
                    </GlowingCard>
                ) : (
                    <div className="space-y-2">
                        {blockedTimes.map((bt, idx) => (
                            <motion.div
                                key={bt.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <GlowingCard isDark={isDark} glowColor="teal" className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("p-2 rounded-lg", isDark ? "bg-red-500/10" : "bg-red-50")}>
                                                <div className="w-4 h-4 rounded-full bg-red-500" />
                                            </div>
                                            <div>
                                                <p className={cn("font-medium", textPrimary)}>
                                                    {formatDateTime(bt.start_datetime)} - {formatDateTime(bt.end_datetime)}
                                                </p>
                                                {bt.reason && (
                                                    <p className={cn("text-sm", textMuted)}>{bt.reason}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveBlockedTime(bt.id)}
                                            className={cn(
                                                "p-2 rounded-lg transition-colors text-sm font-medium",
                                                isDark
                                                    ? "text-red-400 hover:bg-red-500/10"
                                                    : "text-red-500 hover:bg-red-50"
                                            )}
                                        >
                                            {t.doctorDashboard.schedulePage.deleteBlockedTime}
                                        </button>
                                    </div>
                                </GlowingCard>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
