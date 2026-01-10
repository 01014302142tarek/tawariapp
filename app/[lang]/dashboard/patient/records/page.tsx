"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../context/useThemeStyles";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useI18n } from "@/app/i18n";
import {
    getMedicalRecords,
    getLabResults,
    getAllergies,
    getConditions,
    getHealthDataSummary,
    addMedicalRecord,
    addLabResult,
    addAllergy,
    addCondition,
    deleteMedicalRecord,
    deleteLabResult,
    deleteAllergy,
    deleteCondition,
    updateConditionStatus,
    uploadMedicalDocument,
    getMedicalDocumentSignedUrl,
    getPatientProfileId,
    addMedicalRecordAttachment,
    uploadLabResultDocument,
    getLabResultDocumentUrl,
    type MedicalRecord,
    type LabResult,
    type Allergy,
    type Condition,
    type HealthDataSummary,
    type RecordType,
    type AllergySeverity,
    type ConditionStatus,
    type MedicalDocumentType,
} from "@/app/actions/medical-records";

// Icons
const Icons = {
    folder: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
    ),
    document: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    lab: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
    ),
    heart: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    ),
    allergy: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    ),
    condition: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
    plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    trash: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
    spinner: (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    ),
    empty: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    upload: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
    ),
    paperclip: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
        </svg>
    ),
    eye: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

type TabType = "records" | "lab" | "allergies" | "conditions";

const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" }) => {
    const { isDark } = useThemeStyles();
    const variants = {
        default: isDark ? "bg-slate-700/50 text-slate-300" : "bg-gray-200 text-gray-700",
        success: "bg-teal-500/10 text-teal-500 border border-teal-500/20",
        warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant])}>
            {children}
        </span>
    );
};

export default function RecordsPage() {
    const { t, isRTL, formatDate } = useI18n();
    const { isDark, textPrimary, textMuted, inputBg, inputFocus } = useThemeStyles();

    // State
    const [activeTab, setActiveTab] = useState<TabType>("records");
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [labResults, setLabResults] = useState<LabResult[]>([]);
    const [allergies, setAllergies] = useState<Allergy[]>([]);
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [summary, setSummary] = useState<HealthDataSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addingItem, setAddingItem] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Medical record fields
        recordType: "general" as RecordType,
        title: "",
        description: "",
        dateRecorded: "",
        // Lab result fields
        testName: "",
        testDate: "",
        labName: "",
        resultsSummary: "",
        // Allergy fields
        allergen: "",
        severity: "mild" as AllergySeverity,
        reaction: "",
        // Condition fields
        conditionName: "",
        diagnosedDate: "",
        status: "active" as ConditionStatus,
        notes: "",
    });

    // File upload state
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [patientProfileId, setPatientProfileId] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        const [recordsRes, labRes, allergiesRes, conditionsRes, summaryRes, profileIdRes] = await Promise.all([
            getMedicalRecords(),
            getLabResults(),
            getAllergies(),
            getConditions(),
            getHealthDataSummary(),
            getPatientProfileId(),
        ]);

        setRecords(recordsRes.records);
        setLabResults(labRes.results);
        setAllergies(allergiesRes.allergies);
        setConditions(conditionsRes.conditions);
        setSummary(summaryRes.summary);
        if (profileIdRes.patientProfileId) {
            setPatientProfileId(profileIdRes.patientProfileId);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Helper to convert File to base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });
    };

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            const ext = file.name.split('.').pop()?.toLowerCase();
            const validExts = ['jpg', 'jpeg', 'png', 'pdf', 'webp'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (!ext || !validExts.includes(ext)) {
                alert(isRTL ? 'نوع ملف غير صالح' : 'Invalid file type');
                return false;
            }
            if (file.size > maxSize) {
                alert(isRTL ? 'الملف كبير جداً (الحد الأقصى 10MB)' : 'File too large (max 10MB)');
                return false;
            }
            return true;
        });
        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    // Remove selected file
    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const tabs = [
        { id: "records" as TabType, label: isRTL ? "السجلات الطبية" : "Medical Records", count: summary?.recordsCount || 0 },
        { id: "lab" as TabType, label: isRTL ? "نتائج المختبر" : "Lab Results", count: summary?.labResultsCount || 0 },
        { id: "allergies" as TabType, label: isRTL ? "الحساسية" : "Allergies", count: summary?.allergiesCount || 0 },
        { id: "conditions" as TabType, label: isRTL ? "الحالات الصحية" : "Conditions", count: summary?.conditionsCount || 0 },
    ];

    const handleAddItem = async () => {
        setAddingItem(true);
        setUploadProgress(null);

        try {
            switch (activeTab) {
                case "records": {
                    // First upload files if any
                    const attachmentPaths: string[] = [];
                    if (selectedFiles.length > 0 && patientProfileId) {
                        setUploadProgress(isRTL ? 'جاري رفع الملفات...' : 'Uploading files...');
                        for (let i = 0; i < selectedFiles.length; i++) {
                            const file = selectedFiles[i];
                            setUploadProgress(isRTL
                                ? `جاري رفع الملف ${i + 1} من ${selectedFiles.length}...`
                                : `Uploading file ${i + 1} of ${selectedFiles.length}...`
                            );
                            const base64 = await fileToBase64(file);
                            const docType: MedicalDocumentType = formData.recordType === 'general' ? 'medical_record' : 'medical_record';
                            const result = await uploadMedicalDocument(patientProfileId, docType, base64, file.name);
                            if (result.path) {
                                attachmentPaths.push(result.path);
                            } else if (result.error) {
                                console.error('Upload error:', result.error);
                            }
                        }
                    }

                    setUploadProgress(isRTL ? 'جاري الحفظ...' : 'Saving...');
                    const { record } = await addMedicalRecord({
                        recordType: formData.recordType,
                        title: formData.title,
                        description: formData.description || undefined,
                        dateRecorded: formData.dateRecorded || undefined,
                        attachments: attachmentPaths.length > 0 ? attachmentPaths : undefined,
                    });
                    if (record) {
                        setRecords(prev => [record, ...prev]);
                        setSummary(prev => prev ? { ...prev, recordsCount: prev.recordsCount + 1 } : null);
                    }
                    break;
                }
                case "lab": {
                    // First create the lab result
                    setUploadProgress(isRTL ? 'جاري الحفظ...' : 'Saving...');
                    const { result } = await addLabResult({
                        testName: formData.testName,
                        testDate: formData.testDate,
                        labName: formData.labName || undefined,
                        resultsSummary: formData.resultsSummary || undefined,
                    });

                    if (result) {
                        // Then upload file if any (only one file for lab results)
                        let updatedResult = result;
                        if (selectedFiles.length > 0) {
                            setUploadProgress(isRTL ? 'جاري رفع الملف...' : 'Uploading file...');
                            const file = selectedFiles[0];
                            const base64 = await fileToBase64(file);
                            const uploadRes = await uploadLabResultDocument({
                                labResultId: result.id,
                                fileBase64: base64,
                                fileName: file.name,
                            });
                            if (uploadRes.documentUrl) {
                                updatedResult = { ...result, document_url: uploadRes.documentUrl };
                            }
                        }
                        setLabResults(prev => [updatedResult, ...prev]);
                        setSummary(prev => prev ? { ...prev, labResultsCount: prev.labResultsCount + 1 } : null);
                    }
                    break;
                }
                case "allergies": {
                    const { allergy } = await addAllergy({
                        allergen: formData.allergen,
                        severity: formData.severity,
                        reaction: formData.reaction || undefined,
                    });
                    if (allergy) {
                        setAllergies(prev => [allergy, ...prev]);
                        setSummary(prev => prev ? { ...prev, allergiesCount: prev.allergiesCount + 1 } : null);
                    }
                    break;
                }
                case "conditions": {
                    const { condition } = await addCondition({
                        conditionName: formData.conditionName,
                        diagnosedDate: formData.diagnosedDate || undefined,
                        status: formData.status,
                        notes: formData.notes || undefined,
                    });
                    if (condition) {
                        setConditions(prev => [condition, ...prev]);
                        setSummary(prev => prev ? { ...prev, conditionsCount: prev.conditionsCount + 1, activeConditions: formData.status === "active" ? prev.activeConditions + 1 : prev.activeConditions } : null);
                    }
                    break;
                }
            }

            // Reset form and close modal
            setFormData({
                recordType: "general",
                title: "",
                description: "",
                dateRecorded: "",
                testName: "",
                testDate: "",
                labName: "",
                resultsSummary: "",
                allergen: "",
                severity: "mild",
                reaction: "",
                conditionName: "",
                diagnosedDate: "",
                status: "active",
                notes: "",
            });
            setSelectedFiles([]);
            setUploadProgress(null);
            setShowAddModal(false);
        } catch (error) {
            console.error("Error adding item:", error);
            setUploadProgress(null);
        }

        setAddingItem(false);
    };

    const handleDeleteRecord = async (id: string) => {
        const { success } = await deleteMedicalRecord(id);
        if (success) {
            setRecords(prev => prev.filter(r => r.id !== id));
            setSummary(prev => prev ? { ...prev, recordsCount: prev.recordsCount - 1 } : null);
        }
    };

    const handleDeleteLabResult = async (id: string) => {
        const { success } = await deleteLabResult(id);
        if (success) {
            setLabResults(prev => prev.filter(r => r.id !== id));
            setSummary(prev => prev ? { ...prev, labResultsCount: prev.labResultsCount - 1 } : null);
        }
    };

    const handleDeleteAllergy = async (id: string) => {
        const { success } = await deleteAllergy(id);
        if (success) {
            setAllergies(prev => prev.filter(a => a.id !== id));
            setSummary(prev => prev ? { ...prev, allergiesCount: prev.allergiesCount - 1 } : null);
        }
    };

    const handleDeleteCondition = async (id: string) => {
        const condition = conditions.find(c => c.id === id);
        const { success } = await deleteCondition(id);
        if (success) {
            setConditions(prev => prev.filter(c => c.id !== id));
            setSummary(prev => prev ? {
                ...prev,
                conditionsCount: prev.conditionsCount - 1,
                activeConditions: condition?.status === "active" ? prev.activeConditions - 1 : prev.activeConditions
            } : null);
        }
    };

    const handleUpdateConditionStatus = async (id: string, status: ConditionStatus) => {
        const condition = conditions.find(c => c.id === id);
        const { success } = await updateConditionStatus(id, status);
        if (success) {
            setConditions(prev => prev.map(c => c.id === id ? { ...c, status } : c));
            setSummary(prev => {
                if (!prev || !condition) return prev;
                const wasActive = condition.status === "active";
                const isNowActive = status === "active";
                return {
                    ...prev,
                    activeConditions: prev.activeConditions + (isNowActive ? 1 : 0) - (wasActive ? 1 : 0)
                };
            });
        }
    };

    const getRecordTypeLabel = (type: RecordType) => {
        const labels: Record<RecordType, string> = {
            general: isRTL ? "عام" : "General",
            chronic_condition: isRTL ? "حالة مزمنة" : "Chronic Condition",
            surgical_history: isRTL ? "تاريخ جراحي" : "Surgical History",
            family_history: isRTL ? "تاريخ عائلي" : "Family History",
        };
        return labels[type];
    };

    const getSeverityVariant = (severity?: AllergySeverity): "default" | "success" | "warning" | "danger" => {
        if (!severity) return "default";
        const variants: Record<AllergySeverity, "default" | "success" | "warning" | "danger"> = {
            mild: "success",
            moderate: "warning",
            severe: "danger",
        };
        return variants[severity];
    };

    const getStatusVariant = (status: ConditionStatus): "default" | "success" | "warning" | "danger" => {
        const variants: Record<ConditionStatus, "default" | "success" | "warning" | "danger"> = {
            active: "warning",
            managed: "success",
            resolved: "default",
        };
        return variants[status];
    };

    const renderModalForm = () => {
        switch (activeTab) {
            case "records":
                return (
                    <>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "نوع السجل" : "Record Type"} *
                            </label>
                            <select
                                value={formData.recordType}
                                onChange={(e) => setFormData({ ...formData, recordType: e.target.value as RecordType })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                            >
                                <option value="general">{isRTL ? "عام" : "General"}</option>
                                <option value="chronic_condition">{isRTL ? "حالة مزمنة" : "Chronic Condition"}</option>
                                <option value="surgical_history">{isRTL ? "تاريخ جراحي" : "Surgical History"}</option>
                                <option value="family_history">{isRTL ? "تاريخ عائلي" : "Family History"}</option>
                            </select>
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "العنوان" : "Title"} *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                                placeholder={isRTL ? "مثال: فحص طبي سنوي" : "e.g., Annual Physical Exam"}
                            />
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "الوصف" : "Description"}
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors min-h-[100px]", inputBg, inputFocus)}
                                placeholder={isRTL ? "تفاصيل إضافية..." : "Additional details..."}
                            />
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "التاريخ" : "Date"}
                            </label>
                            <input
                                type="date"
                                value={formData.dateRecorded}
                                onChange={(e) => setFormData({ ...formData, dateRecorded: e.target.value })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                            />
                        </div>
                        {/* File Upload Section */}
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "المرفقات" : "Attachments"}
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors",
                                    isDark ? "border-gray-600 hover:border-teal-500" : "border-gray-300 hover:border-teal-500"
                                )}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.pdf,.webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-teal-500">{Icons.upload}</span>
                                    <span className={cn("text-sm", textMuted)}>
                                        {isRTL ? "اضغط لرفع الملفات (PDF, صور)" : "Click to upload files (PDF, Images)"}
                                    </span>
                                    <span className={cn("text-xs", textMuted)}>
                                        {isRTL ? "الحد الأقصى: 10MB لكل ملف" : "Max: 10MB per file"}
                                    </span>
                                </div>
                            </div>
                            {/* Selected Files List */}
                            {selectedFiles.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {selectedFiles.map((file, idx) => (
                                        <div key={idx} className={cn(
                                            "flex items-center justify-between px-3 py-2 rounded-lg",
                                            isDark ? "bg-white/5" : "bg-gray-100"
                                        )}>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-teal-500">{Icons.paperclip}</span>
                                                <span className={cn("text-sm truncate", textPrimary)}>{file.name}</span>
                                                <span className={cn("text-xs flex-shrink-0", textMuted)}>
                                                    ({(file.size / 1024 / 1024).toFixed(1)}MB)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(idx)}
                                                className="p-1 hover:bg-red-500/10 rounded text-red-500"
                                            >
                                                {Icons.close}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                );

            case "lab":
                return (
                    <>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "اسم الفحص" : "Test Name"} *
                            </label>
                            <input
                                type="text"
                                value={formData.testName}
                                onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                                placeholder={isRTL ? "مثال: صورة دم كاملة" : "e.g., Complete Blood Count"}
                            />
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "تاريخ الفحص" : "Test Date"} *
                            </label>
                            <input
                                type="date"
                                value={formData.testDate}
                                onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                            />
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "اسم المختبر" : "Lab Name"}
                            </label>
                            <input
                                type="text"
                                value={formData.labName}
                                onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                                placeholder={isRTL ? "مثال: معمل البرج" : "e.g., Al Borg Lab"}
                            />
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "ملخص النتائج" : "Results Summary"}
                            </label>
                            <textarea
                                value={formData.resultsSummary}
                                onChange={(e) => setFormData({ ...formData, resultsSummary: e.target.value })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors min-h-[100px]", inputBg, inputFocus)}
                                placeholder={isRTL ? "ملخص نتائج الفحص..." : "Summary of test results..."}
                            />
                        </div>
                        {/* File Upload Section for Lab Results */}
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "نتيجة المختبر (ملف)" : "Lab Report Document"}
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors",
                                    isDark ? "border-gray-600 hover:border-blue-500" : "border-gray-300 hover:border-blue-500"
                                )}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf,.webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-blue-500">{Icons.upload}</span>
                                    <span className={cn("text-sm", textMuted)}>
                                        {isRTL ? "اضغط لرفع ملف النتيجة" : "Click to upload lab report"}
                                    </span>
                                    <span className={cn("text-xs", textMuted)}>
                                        {isRTL ? "PDF أو صورة (الحد الأقصى: 10MB)" : "PDF or Image (Max: 10MB)"}
                                    </span>
                                </div>
                            </div>
                            {/* Selected File */}
                            {selectedFiles.length > 0 && (
                                <div className="mt-3">
                                    <div className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-lg",
                                        isDark ? "bg-white/5" : "bg-gray-100"
                                    )}>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-blue-500">{Icons.paperclip}</span>
                                            <span className={cn("text-sm truncate", textPrimary)}>{selectedFiles[0].name}</span>
                                            <span className={cn("text-xs flex-shrink-0", textMuted)}>
                                                ({(selectedFiles[0].size / 1024 / 1024).toFixed(1)}MB)
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(0)}
                                            className="p-1 hover:bg-red-500/10 rounded text-red-500"
                                        >
                                            {Icons.close}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                );

            case "allergies":
                return (
                    <>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "مسبب الحساسية" : "Allergen"} *
                            </label>
                            <input
                                type="text"
                                value={formData.allergen}
                                onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                                placeholder={isRTL ? "مثال: البنسلين" : "e.g., Penicillin"}
                            />
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "الشدة" : "Severity"}
                            </label>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value as AllergySeverity })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                            >
                                <option value="mild">{isRTL ? "خفيفة" : "Mild"}</option>
                                <option value="moderate">{isRTL ? "متوسطة" : "Moderate"}</option>
                                <option value="severe">{isRTL ? "شديدة" : "Severe"}</option>
                            </select>
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "رد الفعل" : "Reaction"}
                            </label>
                            <textarea
                                value={formData.reaction}
                                onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors min-h-[80px]", inputBg, inputFocus)}
                                placeholder={isRTL ? "مثال: طفح جلدي، صعوبة في التنفس" : "e.g., Skin rash, difficulty breathing"}
                            />
                        </div>
                    </>
                );

            case "conditions":
                return (
                    <>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "اسم الحالة" : "Condition Name"} *
                            </label>
                            <input
                                type="text"
                                value={formData.conditionName}
                                onChange={(e) => setFormData({ ...formData, conditionName: e.target.value })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                                placeholder={isRTL ? "مثال: ارتفاع ضغط الدم" : "e.g., Hypertension"}
                            />
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "الحالة" : "Status"}
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as ConditionStatus })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                            >
                                <option value="active">{isRTL ? "نشطة" : "Active"}</option>
                                <option value="managed">{isRTL ? "مُدارة" : "Managed"}</option>
                                <option value="resolved">{isRTL ? "تم علاجها" : "Resolved"}</option>
                            </select>
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "تاريخ التشخيص" : "Diagnosed Date"}
                            </label>
                            <input
                                type="date"
                                value={formData.diagnosedDate}
                                onChange={(e) => setFormData({ ...formData, diagnosedDate: e.target.value })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                            />
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                {isRTL ? "ملاحظات" : "Notes"}
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className={cn("w-full px-4 py-3 rounded-xl border transition-colors min-h-[80px]", inputBg, inputFocus)}
                                placeholder={isRTL ? "ملاحظات إضافية..." : "Additional notes..."}
                            />
                        </div>
                    </>
                );
        }
    };

    const isFormValid = () => {
        switch (activeTab) {
            case "records":
                return formData.title.trim() !== "";
            case "lab":
                return formData.testName.trim() !== "" && formData.testDate !== "";
            case "allergies":
                return formData.allergen.trim() !== "";
            case "conditions":
                return formData.conditionName.trim() !== "";
            default:
                return false;
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                        <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.folder}
                        </span>
                        {t.patientDashboard.recordsPage.title}
                    </h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
                    >
                        {Icons.plus}
                        <span className="hidden sm:inline">{isRTL ? "إضافة" : "Add"}</span>
                    </button>
                </div>
                <p className={cn("mt-1 text-sm md:text-base", textMuted)}>{t.patientDashboard.recordsPage.subtitle}</p>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    {[
                        { label: isRTL ? "السجلات" : "Records", value: summary.recordsCount, icon: Icons.document },
                        { label: isRTL ? "المختبر" : "Lab Results", value: summary.labResultsCount, icon: Icons.lab },
                        { label: isRTL ? "الحساسية" : "Allergies", value: summary.allergiesCount, icon: Icons.allergy },
                        { label: isRTL ? "الحالات" : "Conditions", value: summary.conditionsCount, icon: Icons.condition },
                    ].map((stat, idx) => (
                        <GlowingCard key={idx} glowColor="teal" className="p-3 md:p-4" isDark={isDark}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 flex-shrink-0">
                                    <span className="[&>svg]:w-5 [&>svg]:h-5">{stat.icon}</span>
                                </div>
                                <div>
                                    <p className={cn("text-xs", textMuted)}>{stat.label}</p>
                                    <p className={cn("text-xl font-bold", textPrimary)}>{stat.value}</p>
                                </div>
                            </div>
                        </GlowingCard>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 md:gap-2 whitespace-nowrap flex-shrink-0",
                            activeTab === tab.id
                                ? "bg-teal-500 text-white"
                                : isDark
                                    ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {tab.label}
                        <span className={cn(
                            "w-4 h-4 md:w-5 md:h-5 rounded-full text-[10px] md:text-xs flex items-center justify-center",
                            activeTab === tab.id
                                ? "bg-white/20"
                                : isDark ? "bg-white/10" : "bg-gray-200"
                        )}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <span className="text-teal-500">{Icons.spinner}</span>
                </div>
            ) : (
                <div className="space-y-2 md:space-y-3">
                    {/* Records Tab */}
                    {activeTab === "records" && (
                        records.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <span className={textMuted}>{Icons.empty}</span>
                                <p className={cn("text-sm mt-2", textMuted)}>
                                    {isRTL ? "لا توجد سجلات طبية" : "No medical records yet"}
                                </p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="mt-4 text-teal-500 hover:underline"
                                >
                                    {isRTL ? "إضافة سجل جديد" : "Add your first record"}
                                </button>
                            </div>
                        ) : (
                            records.map((record, idx) => (
                                <motion.div
                                    key={record.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <GlowingCard glowColor="teal" className="p-3 md:p-4" isDark={isDark}>
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center bg-teal-500/10 text-teal-500 flex-shrink-0">
                                                <span className="[&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6">
                                                    {Icons.document}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                                                    <h3 className={cn("font-medium text-sm md:text-base truncate", textPrimary)}>{record.title}</h3>
                                                    <Badge>{getRecordTypeLabel(record.record_type)}</Badge>
                                                    {record.attachments && record.attachments.length > 0 && (
                                                        <span className="flex items-center gap-1 text-xs text-teal-500">
                                                            {Icons.paperclip}
                                                            {record.attachments.length}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={cn("text-xs md:text-sm truncate", textMuted)}>
                                                    {record.description || (isRTL ? "لا يوجد وصف" : "No description")}
                                                </p>
                                                {record.date_recorded && (
                                                    <p className={cn("text-xs mt-1", textMuted)}>
                                                        {formatDate(record.date_recorded)}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteRecord(record.id)}
                                                className={cn(
                                                    "p-1.5 md:p-2 rounded-lg transition-colors flex-shrink-0",
                                                    isDark ? "hover:bg-white/10 text-gray-400 hover:text-red-400" : "hover:bg-gray-100 text-gray-600 hover:text-red-500"
                                                )}
                                            >
                                                {Icons.trash}
                                            </button>
                                        </div>
                                    </GlowingCard>
                                </motion.div>
                            ))
                        )
                    )}

                    {/* Lab Results Tab */}
                    {activeTab === "lab" && (
                        labResults.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <span className={textMuted}>{Icons.empty}</span>
                                <p className={cn("text-sm mt-2", textMuted)}>
                                    {isRTL ? "لا توجد نتائج مختبر" : "No lab results yet"}
                                </p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="mt-4 text-teal-500 hover:underline"
                                >
                                    {isRTL ? "إضافة نتيجة جديدة" : "Add your first lab result"}
                                </button>
                            </div>
                        ) : (
                            labResults.map((result, idx) => (
                                <motion.div
                                    key={result.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <GlowingCard glowColor="teal" className="p-3 md:p-4" isDark={isDark}>
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 flex-shrink-0">
                                                <span className="[&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6">
                                                    {Icons.lab}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={cn("font-medium text-sm md:text-base truncate", textPrimary)}>{result.test_name}</h3>
                                                    {result.document_url && (
                                                        <span className="flex items-center text-xs text-blue-500">
                                                            {Icons.paperclip}
                                                        </span>
                                                    )}
                                                </div>
                                                {result.lab_name && (
                                                    <p className={cn("text-xs md:text-sm truncate", textMuted)}>
                                                        {result.lab_name}
                                                    </p>
                                                )}
                                                <p className={cn("text-xs mt-1", textMuted)}>
                                                    {formatDate(result.test_date)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {result.document_url && (
                                                    <button
                                                        onClick={async () => {
                                                            const { url } = await getLabResultDocumentUrl(result.id);
                                                            if (url) window.open(url, '_blank');
                                                        }}
                                                        className={cn(
                                                            "p-1.5 md:p-2 rounded-lg transition-colors flex-shrink-0",
                                                            isDark ? "hover:bg-white/10 text-blue-400" : "hover:bg-gray-100 text-blue-500"
                                                        )}
                                                        title={isRTL ? "عرض الملف" : "View document"}
                                                    >
                                                        {Icons.eye}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteLabResult(result.id)}
                                                    className={cn(
                                                        "p-1.5 md:p-2 rounded-lg transition-colors flex-shrink-0",
                                                        isDark ? "hover:bg-white/10 text-gray-400 hover:text-red-400" : "hover:bg-gray-100 text-gray-600 hover:text-red-500"
                                                    )}
                                                >
                                                    {Icons.trash}
                                                </button>
                                            </div>
                                        </div>
                                    </GlowingCard>
                                </motion.div>
                            ))
                        )
                    )}

                    {/* Allergies Tab */}
                    {activeTab === "allergies" && (
                        allergies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <span className={textMuted}>{Icons.empty}</span>
                                <p className={cn("text-sm mt-2", textMuted)}>
                                    {isRTL ? "لا توجد حساسية مسجلة" : "No allergies recorded"}
                                </p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="mt-4 text-teal-500 hover:underline"
                                >
                                    {isRTL ? "إضافة حساسية" : "Add an allergy"}
                                </button>
                            </div>
                        ) : (
                            allergies.map((allergy, idx) => (
                                <motion.div
                                    key={allergy.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <GlowingCard glowColor="teal" className="p-3 md:p-4" isDark={isDark}>
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500 flex-shrink-0">
                                                <span className="[&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6">
                                                    {Icons.allergy}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                                                    <h3 className={cn("font-medium text-sm md:text-base truncate", textPrimary)}>{allergy.allergen}</h3>
                                                    {allergy.severity && (
                                                        <Badge variant={getSeverityVariant(allergy.severity)}>
                                                            {allergy.severity === "mild" ? (isRTL ? "خفيفة" : "Mild") :
                                                                allergy.severity === "moderate" ? (isRTL ? "متوسطة" : "Moderate") :
                                                                    (isRTL ? "شديدة" : "Severe")}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {allergy.reaction && (
                                                    <p className={cn("text-xs md:text-sm truncate", textMuted)}>
                                                        {allergy.reaction}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAllergy(allergy.id)}
                                                className={cn(
                                                    "p-1.5 md:p-2 rounded-lg transition-colors flex-shrink-0",
                                                    isDark ? "hover:bg-white/10 text-gray-400 hover:text-red-400" : "hover:bg-gray-100 text-gray-600 hover:text-red-500"
                                                )}
                                            >
                                                {Icons.trash}
                                            </button>
                                        </div>
                                    </GlowingCard>
                                </motion.div>
                            ))
                        )
                    )}

                    {/* Conditions Tab */}
                    {activeTab === "conditions" && (
                        conditions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <span className={textMuted}>{Icons.empty}</span>
                                <p className={cn("text-sm mt-2", textMuted)}>
                                    {isRTL ? "لا توجد حالات صحية مسجلة" : "No conditions recorded"}
                                </p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="mt-4 text-teal-500 hover:underline"
                                >
                                    {isRTL ? "إضافة حالة صحية" : "Add a condition"}
                                </button>
                            </div>
                        ) : (
                            conditions.map((condition, idx) => (
                                <motion.div
                                    key={condition.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <GlowingCard glowColor="teal" className="p-3 md:p-4" isDark={isDark}>
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-500 flex-shrink-0">
                                                <span className="[&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6">
                                                    {Icons.condition}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                                                    <h3 className={cn("font-medium text-sm md:text-base truncate", textPrimary)}>{condition.condition_name}</h3>
                                                    <Badge variant={getStatusVariant(condition.status)}>
                                                        {condition.status === "active" ? (isRTL ? "نشطة" : "Active") :
                                                            condition.status === "managed" ? (isRTL ? "مُدارة" : "Managed") :
                                                                (isRTL ? "تم علاجها" : "Resolved")}
                                                    </Badge>
                                                </div>
                                                {condition.notes && (
                                                    <p className={cn("text-xs md:text-sm truncate", textMuted)}>
                                                        {condition.notes}
                                                    </p>
                                                )}
                                                {condition.diagnosed_date && (
                                                    <p className={cn("text-xs mt-1", textMuted)}>
                                                        {isRTL ? "تم التشخيص:" : "Diagnosed:"} {formatDate(condition.diagnosed_date)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <select
                                                    value={condition.status}
                                                    onChange={(e) => handleUpdateConditionStatus(condition.id, e.target.value as ConditionStatus)}
                                                    className={cn(
                                                        "text-xs px-2 py-1 rounded-lg border",
                                                        inputBg, inputFocus
                                                    )}
                                                >
                                                    <option value="active">{isRTL ? "نشطة" : "Active"}</option>
                                                    <option value="managed">{isRTL ? "مُدارة" : "Managed"}</option>
                                                    <option value="resolved">{isRTL ? "تم علاجها" : "Resolved"}</option>
                                                </select>
                                                <button
                                                    onClick={() => handleDeleteCondition(condition.id)}
                                                    className={cn(
                                                        "p-1.5 md:p-2 rounded-lg transition-colors flex-shrink-0",
                                                        isDark ? "hover:bg-white/10 text-gray-400 hover:text-red-400" : "hover:bg-gray-100 text-gray-600 hover:text-red-500"
                                                    )}
                                                >
                                                    {Icons.trash}
                                                </button>
                                            </div>
                                        </div>
                                    </GlowingCard>
                                </motion.div>
                            ))
                        )
                    )}
                </div>
            )}

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={cn(
                                "w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto",
                                isDark ? "bg-slate-900" : "bg-white"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={cn("text-lg font-semibold", textPrimary)}>
                                    {activeTab === "records" ? (isRTL ? "إضافة سجل طبي" : "Add Medical Record") :
                                        activeTab === "lab" ? (isRTL ? "إضافة نتيجة مختبر" : "Add Lab Result") :
                                            activeTab === "allergies" ? (isRTL ? "إضافة حساسية" : "Add Allergy") :
                                                (isRTL ? "إضافة حالة صحية" : "Add Condition")}
                                </h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className={cn("p-2 rounded-lg transition-colors", isDark ? "hover:bg-white/10" : "hover:bg-gray-100")}
                                >
                                    {Icons.close}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {renderModalForm()}
                            </div>

                            {/* Upload progress indicator */}
                            {uploadProgress && (
                                <div className={cn("mt-4 text-center text-sm py-2", textMuted)}>
                                    <div className="flex items-center justify-center gap-2">
                                        {Icons.spinner}
                                        <span>{uploadProgress}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setSelectedFiles([]);
                                    }}
                                    disabled={addingItem}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl font-medium transition-colors",
                                        addingItem
                                            ? "opacity-50 cursor-not-allowed"
                                            : isDark ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    )}
                                >
                                    {isRTL ? "إلغاء" : "Cancel"}
                                </button>
                                <button
                                    onClick={handleAddItem}
                                    disabled={!isFormValid() || addingItem}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2",
                                        isFormValid() && !addingItem
                                            ? "bg-teal-500 hover:bg-teal-600 text-white"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    )}
                                >
                                    {addingItem && Icons.spinner}
                                    {addingItem
                                        ? (isRTL ? "جاري الإضافة..." : "Adding...")
                                        : (isRTL ? "إضافة" : "Add")}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
