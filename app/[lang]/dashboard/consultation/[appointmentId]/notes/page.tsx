"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { GlowingCard } from "@/components/ui/glowing-card";
import { saveConsultationNotes, getConsultationNotes } from "@/app/actions/consultation-notes";

// Icons
const Icons = {
    notes: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
    ),
    save: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    back: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    ),
    prescription: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
};

interface NotesForm {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    privateNotes: string;
    followUpRecommended: boolean;
    followUpTimeframe: string;
}

export default function ConsultationNotesPage() {
    const params = useParams();
    const router = useRouter();
    const { isRTL, language } = useI18n();
    const appointmentId = params.appointmentId as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<NotesForm>({
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
        privateNotes: "",
        followUpRecommended: false,
        followUpTimeframe: "",
    });

    // Load existing notes
    useEffect(() => {
        async function loadNotes() {
            setLoading(true);
            try {
                const { note, error: noteError } = await getConsultationNotes(appointmentId);
                if (noteError) {
                    console.error("Error loading notes:", noteError);
                }
                if (note) {
                    setForm({
                        subjective: note.subjective || "",
                        objective: note.objective || "",
                        assessment: note.assessment || "",
                        plan: note.plan || "",
                        privateNotes: note.private_notes || "",
                        followUpRecommended: note.follow_up_recommended,
                        followUpTimeframe: note.follow_up_timeframe || "",
                    });
                }
            } catch (err) {
                console.error("Error loading notes:", err);
            } finally {
                setLoading(false);
            }
        }

        if (appointmentId) {
            loadNotes();
        }
    }, [appointmentId]);

    // Handle form changes
    const handleChange = (field: keyof NotesForm, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    // Save notes
    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const result = await saveConsultationNotes(appointmentId, form);
            if (result.success) {
                setSaved(true);
            } else {
                setError(result.error || "Failed to save notes");
            }
        } catch (err) {
            console.error("Error saving notes:", err);
            setError("Failed to save notes");
        } finally {
            setSaving(false);
        }
    };

    // Go to prescriptions
    const handlePrescription = () => {
        router.push(`/${language}/dashboard/doctor/prescriptions/new?appointmentId=${appointmentId}`);
    };

    // Go back to appointments
    const handleBack = () => {
        router.push(`/${language}/dashboard/doctor/appointments`);
    };

    const followUpOptions = [
        { value: "", label: isRTL ? "غير محدد" : "Not specified" },
        { value: "1_week", label: isRTL ? "أسبوع واحد" : "1 Week" },
        { value: "2_weeks", label: isRTL ? "أسبوعين" : "2 Weeks" },
        { value: "1_month", label: isRTL ? "شهر واحد" : "1 Month" },
        { value: "3_months", label: isRTL ? "3 أشهر" : "3 Months" },
        { value: "6_months", label: isRTL ? "6 أشهر" : "6 Months" },
        { value: "1_year", label: isRTL ? "سنة واحدة" : "1 Year" },
        { value: "as_needed", label: isRTL ? "حسب الحاجة" : "As Needed" },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">{isRTL ? "جاري التحميل..." : "Loading..."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen bg-slate-950", isRTL && "rtl")}>
            {/* Header */}
            <header className="h-14 bg-slate-900/80 backdrop-blur border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-10">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <span className={isRTL ? "rotate-180" : ""}>{Icons.back}</span>
                    <span>{isRTL ? "رجوع" : "Back"}</span>
                </button>
                <h1 className="text-white font-medium flex items-center gap-2">
                    {Icons.notes}
                    {isRTL ? "ملاحظات الاستشارة" : "Consultation Notes"}
                </h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrescription}
                        className="px-3 py-1.5 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/30 transition-colors text-sm font-medium flex items-center gap-1.5"
                    >
                        {Icons.prescription}
                        <span className="hidden sm:inline">{isRTL ? "وصفة طبية" : "Prescription"}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-6">
                {/* Error message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Success message */}
                {saved && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2"
                    >
                        {Icons.save}
                        {isRTL ? "تم حفظ الملاحظات بنجاح" : "Notes saved successfully"}
                    </motion.div>
                )}

                {/* SOAP Notes */}
                <div className="space-y-4">
                    {/* Subjective */}
                    <GlowingCard glowColor="teal" className="p-4" isDark>
                        <label className="block">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">S</span>
                                <span className="text-white font-medium">
                                    {isRTL ? "الشكوى الذاتية" : "Subjective"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                                {isRTL
                                    ? "ما يصفه المريض من أعراض وشكاوى"
                                    : "Patient's description of symptoms and complaints"}
                            </p>
                            <textarea
                                value={form.subjective}
                                onChange={(e) => handleChange("subjective", e.target.value)}
                                rows={4}
                                placeholder={isRTL ? "أدخل شكوى المريض..." : "Enter patient's complaints..."}
                                className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-teal-500/50 focus:outline-none resize-none"
                            />
                        </label>
                    </GlowingCard>

                    {/* Objective */}
                    <GlowingCard glowColor="teal" className="p-4" isDark>
                        <label className="block">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center font-bold">O</span>
                                <span className="text-white font-medium">
                                    {isRTL ? "الفحص الموضوعي" : "Objective"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                                {isRTL
                                    ? "نتائج الفحص والملاحظات السريرية"
                                    : "Examination findings and clinical observations"}
                            </p>
                            <textarea
                                value={form.objective}
                                onChange={(e) => handleChange("objective", e.target.value)}
                                rows={4}
                                placeholder={isRTL ? "أدخل نتائج الفحص..." : "Enter examination findings..."}
                                className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-teal-500/50 focus:outline-none resize-none"
                            />
                        </label>
                    </GlowingCard>

                    {/* Assessment */}
                    <GlowingCard glowColor="teal" className="p-4" isDark>
                        <label className="block">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">A</span>
                                <span className="text-white font-medium">
                                    {isRTL ? "التقييم" : "Assessment"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                                {isRTL
                                    ? "التشخيص أو التشخيص التفريقي"
                                    : "Diagnosis or differential diagnosis"}
                            </p>
                            <textarea
                                value={form.assessment}
                                onChange={(e) => handleChange("assessment", e.target.value)}
                                rows={4}
                                placeholder={isRTL ? "أدخل التشخيص..." : "Enter diagnosis..."}
                                className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-teal-500/50 focus:outline-none resize-none"
                            />
                        </label>
                    </GlowingCard>

                    {/* Plan */}
                    <GlowingCard glowColor="teal" className="p-4" isDark>
                        <label className="block">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">P</span>
                                <span className="text-white font-medium">
                                    {isRTL ? "الخطة العلاجية" : "Plan"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                                {isRTL
                                    ? "خطة العلاج والتوصيات"
                                    : "Treatment plan and recommendations"}
                            </p>
                            <textarea
                                value={form.plan}
                                onChange={(e) => handleChange("plan", e.target.value)}
                                rows={4}
                                placeholder={isRTL ? "أدخل خطة العلاج..." : "Enter treatment plan..."}
                                className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-teal-500/50 focus:outline-none resize-none"
                            />
                        </label>
                    </GlowingCard>

                    {/* Private Notes */}
                    <GlowingCard glowColor="amber" className="p-4" isDark>
                        <label className="block">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <span className="text-white font-medium">
                                    {isRTL ? "ملاحظات خاصة" : "Private Notes"}
                                </span>
                                <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                    {isRTL ? "للطبيب فقط" : "Doctor only"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                                {isRTL
                                    ? "ملاحظات شخصية لن تظهر للمريض"
                                    : "Personal notes that won't be visible to the patient"}
                            </p>
                            <textarea
                                value={form.privateNotes}
                                onChange={(e) => handleChange("privateNotes", e.target.value)}
                                rows={3}
                                placeholder={isRTL ? "أدخل ملاحظات خاصة..." : "Enter private notes..."}
                                className="w-full p-3 bg-slate-800/50 border border-amber-500/20 rounded-xl text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none resize-none"
                            />
                        </label>
                    </GlowingCard>

                    {/* Follow-up */}
                    <GlowingCard glowColor="teal" className="p-4" isDark>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                <span className="text-white font-medium">
                                    {isRTL ? "المتابعة" : "Follow-up"}
                                </span>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.followUpRecommended}
                                    onChange={(e) => handleChange("followUpRecommended", e.target.checked)}
                                    className="w-5 h-5 rounded border-white/20 bg-slate-800 text-teal-500 focus:ring-teal-500/50"
                                />
                                <span className="text-sm text-gray-400">
                                    {isRTL ? "يوصى بالمتابعة" : "Follow-up recommended"}
                                </span>
                            </label>
                        </div>

                        {form.followUpRecommended && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <label className="block">
                                    <span className="text-sm text-gray-400 mb-2 block">
                                        {isRTL ? "موعد المتابعة" : "Follow-up timeframe"}
                                    </span>
                                    <select
                                        value={form.followUpTimeframe}
                                        onChange={(e) => handleChange("followUpTimeframe", e.target.value)}
                                        className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:border-teal-500/50 focus:outline-none"
                                    >
                                        {followUpOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </motion.div>
                        )}
                    </GlowingCard>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleBack}
                            className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
                        >
                            {isRTL ? "إلغاء" : "Cancel"}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {isRTL ? "جاري الحفظ..." : "Saving..."}
                                </>
                            ) : (
                                <>
                                    {Icons.save}
                                    {isRTL ? "حفظ الملاحظات" : "Save Notes"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
