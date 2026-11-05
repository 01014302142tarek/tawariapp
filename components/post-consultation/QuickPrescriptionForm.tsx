"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createPrescription, type PrescriptionMedication } from "@/app/actions/prescriptions";

interface QuickPrescriptionFormProps {
    isOpen: boolean;
    patientProfileId: string;
    patientName: string;
    appointmentId?: string;
    isDark?: boolean;
    isRTL?: boolean;
    onSuccess: () => void;
    onCancel: () => void;
}

interface MedicationEntry {
    id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

const emptyMedication = (): MedicationEntry => ({
    id: crypto.randomUUID(),
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
});

const Icons = {
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    add: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    remove: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    save: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    loading: (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    ),
};

export function QuickPrescriptionForm({
    isOpen,
    patientProfileId,
    patientName,
    appointmentId,
    isDark = true,
    isRTL = false,
    onSuccess,
    onCancel,
}: QuickPrescriptionFormProps) {
    const [medications, setMedications] = useState<MedicationEntry[]>([emptyMedication()]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addMedication = () => {
        setMedications([...medications, emptyMedication()]);
    };

    const removeMedication = (id: string) => {
        if (medications.length > 1) {
            setMedications(medications.filter((m) => m.id !== id));
        }
    };

    const updateMedication = (id: string, field: keyof MedicationEntry, value: string) => {
        setMedications(
            medications.map((m) =>
                m.id === id ? { ...m, [field]: value } : m
            )
        );
    };

    const handleSave = async () => {
        // Validate
        const validMedications = medications.filter((m) => m.medication_name.trim());
        if (validMedications.length === 0) {
            setError(isRTL ? "يرجى إدخال اسم دواء واحد على الأقل" : "Please enter at least one medication name");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const medicationData: PrescriptionMedication[] = validMedications.map((m) => ({
                medication_name: m.medication_name.trim(),
                dosage: m.dosage.trim() || "",
                frequency: m.frequency.trim() || "",
                duration: m.duration.trim() || "",
                instructions: m.instructions.trim() || undefined,
            }));

            const result = await createPrescription({
                patientProfileId,
                appointmentId,
                medications: medicationData,
            });

            if (result.success) {
                onSuccess();
            } else if (result.requiresClinicInfo) {
                setError(isRTL
                    ? "يرجى إكمال معلومات العيادة في الإعدادات قبل إنشاء الوصفات الطبية"
                    : "Please complete your clinic information in settings before creating prescriptions");
            } else {
                setError(result.error || (isRTL ? "فشل في حفظ الوصفة الطبية" : "Failed to save prescription"));
            }
        } catch (err) {
            console.error("Error saving prescription:", err);
            setError(isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
        } finally {
            setSaving(false);
        }
    };

    const inputClasses = cn(
        "w-full px-3 py-2 rounded-lg border transition-colors text-sm",
        isDark
            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-[#FD614B]"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#FD614B]",
        "focus:outline-none focus:ring-2 focus:ring-amber-500/20"
    );

    const labelClasses = cn(
        "block text-xs font-medium mb-1",
        isDark ? "text-slate-400" : "text-gray-500"
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={cn(
                            "rounded-2xl shadow-2xl max-w-2xl w-full my-8",
                            isDark ? "bg-[#0D2C4F]" : "bg-white",
                            isRTL && "rtl"
                        )}
                    >
                        {/* Header */}
                        <div className={cn(
                            "flex items-center justify-between p-4 border-b",
                            isDark ? "border-[#044C87]/30" : "border-gray-200"
                        )}>
                            <div>
                                <h3 className={cn(
                                    "text-lg font-semibold",
                                    isDark ? "text-white" : "text-slate-900"
                                )}>
                                    {isRTL ? "وصفة طبية جديدة" : "New Prescription"}
                                </h3>
                                <p className={cn(
                                    "text-sm",
                                    isDark ? "text-slate-400" : "text-slate-600"
                                )}>
                                    {isRTL ? `للمريض: ${patientName}` : `For: ${patientName}`}
                                </p>
                            </div>
                            <button
                                onClick={onCancel}
                                disabled={saving}
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-100 text-gray-500"
                                )}
                            >
                                {Icons.close}
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Medications */}
                            <div className="space-y-4">
                                {medications.map((med, index) => (
                                    <div
                                        key={med.id}
                                        className={cn(
                                            "p-4 rounded-xl border",
                                            isDark ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-200"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={cn(
                                                "text-sm font-medium",
                                                isDark ? "text-[#FD614B]" : "text-[#E84D37]"
                                            )}>
                                                {isRTL ? `الدواء ${index + 1}` : `Medication ${index + 1}`}
                                            </span>
                                            {medications.length > 1 && (
                                                <button
                                                    onClick={() => removeMedication(med.id)}
                                                    className="p-1 text-red-400 hover:text-red-500 transition-colors"
                                                >
                                                    {Icons.remove}
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* Medication Name */}
                                            <div className="sm:col-span-2">
                                                <label className={labelClasses}>
                                                    {isRTL ? "اسم الدواء *" : "Medication Name *"}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={med.medication_name}
                                                    onChange={(e) => updateMedication(med.id, "medication_name", e.target.value)}
                                                    placeholder={isRTL ? "مثال: باراسيتامول" : "e.g., Paracetamol"}
                                                    className={inputClasses}
                                                />
                                            </div>

                                            {/* Dosage */}
                                            <div>
                                                <label className={labelClasses}>
                                                    {isRTL ? "الجرعة" : "Dosage"}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={med.dosage}
                                                    onChange={(e) => updateMedication(med.id, "dosage", e.target.value)}
                                                    placeholder={isRTL ? "مثال: 500mg" : "e.g., 500mg"}
                                                    className={inputClasses}
                                                />
                                            </div>

                                            {/* Frequency */}
                                            <div>
                                                <label className={labelClasses}>
                                                    {isRTL ? "التكرار" : "Frequency"}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={med.frequency}
                                                    onChange={(e) => updateMedication(med.id, "frequency", e.target.value)}
                                                    placeholder={isRTL ? "مثال: مرتين يومياً" : "e.g., Twice daily"}
                                                    className={inputClasses}
                                                />
                                            </div>

                                            {/* Duration */}
                                            <div className="sm:col-span-2">
                                                <label className={labelClasses}>
                                                    {isRTL ? "المدة" : "Duration"}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={med.duration}
                                                    onChange={(e) => updateMedication(med.id, "duration", e.target.value)}
                                                    placeholder={isRTL ? "مثال: 7 أيام" : "e.g., 7 days"}
                                                    className={inputClasses}
                                                />
                                            </div>

                                            {/* Instructions */}
                                            <div className="sm:col-span-2">
                                                <label className={labelClasses}>
                                                    {isRTL ? "تعليمات خاصة" : "Special Instructions"}
                                                </label>
                                                <textarea
                                                    value={med.instructions}
                                                    onChange={(e) => updateMedication(med.id, "instructions", e.target.value)}
                                                    placeholder={isRTL ? "مثال: تؤخذ بعد الأكل" : "e.g., Take after meals"}
                                                    rows={2}
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Medication Button */}
                            <button
                                onClick={addMedication}
                                className={cn(
                                    "w-full mt-4 px-4 py-2 rounded-lg border-2 border-dashed transition-colors",
                                    "flex items-center justify-center gap-2 text-sm",
                                    isDark
                                        ? "border-slate-600 text-slate-400 hover:border-[#FD614B] hover:text-[#FD614B]"
                                        : "border-gray-300 text-gray-500 hover:border-[#FD614B] hover:text-[#E84D37]"
                                )}
                            >
                                {Icons.add}
                                <span>{isRTL ? "إضافة دواء آخر" : "Add Another Medication"}</span>
                            </button>
                        </div>

                        {/* Footer */}
                        <div className={cn(
                            "flex items-center justify-end gap-3 p-4 border-t",
                            isDark ? "border-[#044C87]/30" : "border-gray-200"
                        )}>
                            <button
                                onClick={onCancel}
                                disabled={saving}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-medium transition-colors",
                                    isDark
                                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                )}
                            >
                                {isRTL ? "إلغاء" : "Cancel"}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={cn(
                                    "px-6 py-2 rounded-lg font-medium transition-all",
                                    "bg-[#FD614B] text-white hover:bg-[#E84D37]",
                                    "flex items-center gap-2",
                                    "shadow-lg shadow-amber-500/20",
                                    saving && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {saving ? Icons.loading : Icons.save}
                                <span>{isRTL ? "حفظ الوصفة" : "Save Prescription"}</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default QuickPrescriptionForm;
