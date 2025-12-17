"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../context/useThemeStyles";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useI18n } from "@/app/i18n";

// Icons
const Icons = {
    prescription: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    pill: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
    ),
    clock: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    refresh: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
    ),
    upload: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
};


const Badge = ({ variant, children }: { variant: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        "refill-needed": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        expired: "bg-red-500/10 text-red-400 border border-red-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant] || variants.active)}>
            {children}
        </span>
    );
};

// File Upload Component
const FileUpload = ({ label, fileName, onFileChange, isDark, accept = "*", filePreview, placeholder }: {
    label: string;
    fileName: string;
    onFileChange: (file: File) => void;
    isDark: boolean;
    accept?: string;
    filePreview?: string;
    placeholder?: string;
}) => {
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert("File size must be less than 10MB");
                return;
            }
            onFileChange(file);
        }
    };

    return (
        <div className="space-y-1">
            <label className={cn("block text-xs font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                {label}
            </label>
            <label
                className={cn(
                    "flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-all",
                    fileName
                        ? "border-teal-500/50 bg-teal-500/5"
                        : isDark
                            ? "border-white/10 bg-slate-800/30 hover:border-teal-500/30 hover:bg-slate-800/50"
                            : "border-gray-200 bg-gray-50 hover:border-teal-500/30 hover:bg-gray-100"
                )}
            >
                <div className="flex flex-col items-center justify-center py-2">
                    {filePreview && fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <div className="relative w-16 h-16 mb-2 rounded overflow-hidden">
                            <Image src={filePreview} alt="Preview" fill className="object-cover" />
                        </div>
                    ) : (
                        <div className={cn("mb-2", fileName ? "text-teal-500" : isDark ? "text-gray-400" : "text-gray-500")}>
                            {fileName ? Icons.check : Icons.upload}
                        </div>
                    )}
                    <p className={cn("text-xs text-center px-2", fileName ? "text-teal-500 font-medium" : isDark ? "text-gray-400" : "text-gray-500")}>
                        {fileName || placeholder || "Click to upload"}
                    </p>
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileSelect}
                />
            </label>
        </div>
    );
};

// Upload Modal Component
const UploadModal = ({ isOpen, onClose, onUpload, isDark, translations }: {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => void;
    isDark: boolean;
    translations: {
        modalTitle: string;
        documentLabel: string;
        placeholder: string;
        cancel: string;
        submit: string;
        success: string;
    };
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");

    const handleFileChange = (newFile: File) => {
        setFile(newFile);
        if (newFile.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(newFile);
        } else {
            setPreview("");
        }
    };

    const handleSubmit = () => {
        if (file) {
            onUpload(file);
            setFile(null);
            setPreview("");
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            "fixed inset-0 m-auto w-full max-w-md h-fit p-6 rounded-2xl shadow-2xl z-50 px-6",
                            isDark ? "bg-slate-900 border border-white/10" : "bg-white"
                        )}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>
                                {translations.modalTitle}
                            </h3>
                            <button
                                onClick={onClose}
                                className={cn("p-1.5 rounded-lg transition-colors", isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500")}
                            >
                                {Icons.close}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <FileUpload
                                label={translations.documentLabel}
                                fileName={file?.name || ""}
                                onFileChange={handleFileChange}
                                isDark={isDark}
                                accept=".jpg,.jpeg,.png,.pdf"
                                filePreview={preview}
                                placeholder={translations.placeholder}
                            />

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className={cn(
                                        "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                                        isDark
                                            ? "border-white/10 text-gray-300 hover:bg-white/5"
                                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    {translations.cancel}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!file}
                                    className={cn(
                                        "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        file
                                            ? "bg-teal-500 text-white hover:bg-teal-600"
                                            : isDark
                                                ? "bg-slate-800 text-gray-500 cursor-not-allowed"
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    )}
                                >
                                    {translations.submit}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default function PrescriptionsPage() {
    const { t, formatNumber, formatDate } = useI18n();
    const [activeFilter, setActiveFilter] = useState("All");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const { isDark, textPrimary, textMuted } = useThemeStyles();

    const handleUpload = (file: File) => {
        // Here you would typically send the file to your backend
        console.log("Uploading file:", file);
        // Simulating success
        alert(t.patientDashboard.prescriptionsPage.upload.success);
    };

    // Mock Data
    const prescriptions = [
        {
            id: 1,
            name: "Lisinopril",
            dosage: formatNumber("10mg"),
            frequency: t.patientDashboard.prescriptionsPage.frequency.daily.replace("{n}", formatNumber(1)),
            prescribedBy: t.common.demoNames.drAhmedHassan,
            startDate: formatDate("Nov 15, 2024"),
            refillDate: formatDate("Dec 28, 2024"),
            pillsRemaining: 18,
            status: "active",
            instructions: t.patientDashboard.prescriptionsPage.instructions.morningWater
        },
        {
            id: 2,
            name: "Metformin",
            dosage: formatNumber("500mg"),
            frequency: t.patientDashboard.prescriptionsPage.frequency.daily.replace("{n}", formatNumber(2)), // Assuming I have a flexible key or just formatting "2 tablets daily"
            prescribedBy: t.common.demoNames.drFatimaKhaled,
            startDate: formatDate("Oct 20, 2024"),
            refillDate: formatDate("Jan 5, 2025"),
            pillsRemaining: 45,
            status: "active",
            instructions: t.patientDashboard.prescriptionsPage.instructions.withMeals
        },
        {
            id: 3,
            name: "Atorvastatin",
            dosage: formatNumber("20mg"),
            frequency: t.patientDashboard.prescriptionsPage.frequency.bedtime,
            prescribedBy: t.common.demoNames.drAhmedHassan,
            startDate: formatDate("Sep 10, 2024"),
            refillDate: formatDate("Dec 20, 2024"),
            pillsRemaining: 5,
            status: "refill-needed",
            instructions: t.patientDashboard.prescriptionsPage.instructions.beforeSleep
        },
        {
            id: 4,
            name: "Omeprazole",
            dosage: formatNumber("20mg"),
            frequency: t.patientDashboard.prescriptionsPage.frequency.beforeBreakfast,
            prescribedBy: t.common.demoNames.drFatimaKhaled,
            startDate: formatDate("Aug 5, 2024"),
            refillDate: formatDate("Dec 15, 2024"),
            pillsRemaining: 0,
            status: "expired",
            instructions: t.patientDashboard.prescriptionsPage.instructions.beforeEating
        },
    ];

    const filters = [
        { key: "All", label: t.patientDashboard.prescriptionsPage.filters.all },
        { key: "Active", label: t.patientDashboard.prescriptionsPage.filters.active },
        { key: "Refill Needed", label: t.patientDashboard.prescriptionsPage.filters.refillNeeded },
        { key: "Expired", label: t.patientDashboard.prescriptionsPage.filters.expired },
    ];

    const filteredPrescriptions = prescriptions.filter(rx => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Active") return rx.status === "active";
        if (activeFilter === "Refill Needed") return rx.status === "refill-needed";
        if (activeFilter === "Expired") return rx.status === "expired";
        return true;
    });

    const getStatusText = (status: string) => {
        switch (status) {
            case "active": return t.patientDashboard.prescriptionsPage.status.active;
            case "refill-needed": return t.patientDashboard.prescriptionsPage.status.refillNeeded;
            case "expired": return t.patientDashboard.prescriptionsPage.status.expired;
            default: return status;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active": return <Badge variant="success">{getStatusText(status)}</Badge>;
            case "refill-needed": return <Badge variant="warning">{getStatusText(status)}</Badge>;
            case "expired": return <Badge variant="danger">{getStatusText(status)}</Badge>;
            default: return <Badge variant="default">{status}</Badge>;
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                        <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </span>
                        {t.patientDashboard.prescriptionsPage.title}
                    </h1>
                    <p className={cn("mt-1 text-sm md:text-base", textMuted)}>{t.patientDashboard.prescriptionsPage.subtitle}</p>
                </div>

                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-teal-500/20 w-full md:w-auto justify-center"
                >
                    {Icons.upload}
                    {t.patientDashboard.prescriptionsPage.upload.button}
                </button>
            </div>

            {/* Filters - Scrollable on mobile */}
            <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide">
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className={cn(
                            "px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
                            activeFilter === filter.key
                                ? "bg-teal-500 text-white"
                                : isDark
                                    ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Prescriptions List */}
            <div className="grid gap-3 md:gap-4">
                {filteredPrescriptions.map((rx, idx) => (
                    <motion.div
                        key={rx.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <GlowingCard glowColor="teal" className="p-4 md:p-5" isDark={isDark}>
                            {/* Mobile Layout */}
                            <div className="md:hidden">
                                {/* Header: Icon + Name + Badge */}
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={cn(
                                        "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                                        rx.status === "active" ? "bg-teal-500/10 text-teal-500" :
                                            rx.status === "refill-needed" ? "bg-amber-500/10 text-amber-500" :
                                                "bg-red-500/10 text-red-500"
                                    )}>
                                        {Icons.pill}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h3 className={cn("text-base font-semibold truncate", textPrimary)}>
                                                {rx.name}
                                            </h3>
                                            {getStatusBadge(rx.status)}
                                        </div>
                                        <p className={cn("text-sm", textMuted)}>
                                            {rx.dosage} · {rx.frequency}
                                        </p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className={cn(
                                    "grid grid-cols-2 gap-3 py-3 mb-3 border-y",
                                    isDark ? "border-white/5" : "border-gray-100"
                                )}>
                                    <div>
                                        <p className={cn("text-[10px] uppercase tracking-wide mb-0.5", textMuted)}>{t.patientDashboard.prescriptionsPage.labels.prescribedBy}</p>
                                        <p className={cn("text-xs font-medium truncate", textPrimary)}>{rx.prescribedBy}</p>
                                    </div>
                                    <div>
                                        <p className={cn("text-[10px] uppercase tracking-wide mb-0.5", textMuted)}>{t.patientDashboard.prescriptionsPage.labels.refillDate}</p>
                                        <p className={cn("text-xs font-medium", textPrimary)}>{rx.refillDate}</p>
                                    </div>
                                    <div>
                                        <p className={cn("text-[10px] uppercase tracking-wide mb-0.5", textMuted)}>{t.patientDashboard.prescriptionsPage.labels.pillsRemaining}</p>
                                        <p className={cn(
                                            "text-xs font-bold",
                                            rx.pillsRemaining <= 5 ? "text-amber-500" : "text-teal-500"
                                        )}>
                                            {rx.pillsRemaining} {t.patientDashboard.prescriptionsPage.labels.pills}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={cn("text-[10px] uppercase tracking-wide mb-0.5", textMuted)}>{t.patientDashboard.prescriptionsPage.labels.started}</p>
                                        <p className={cn("text-xs font-medium", textPrimary)}>{rx.startDate}</p>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className={cn("flex items-start gap-2 text-xs mb-3", textMuted)}>
                                    <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                    </svg>
                                    <p className="italic leading-relaxed">{rx.instructions}</p>
                                </div>

                                {/* Action Button */}
                                {rx.status === "refill-needed" ? (
                                    <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-teal-500/20">
                                        {Icons.refresh}
                                        {t.patientDashboard.prescriptionsPage.actions.requestRefill}
                                    </button>
                                ) : (
                                    <button className={cn(
                                        "w-full px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors",
                                        isDark
                                            ? "border-white/10 text-gray-400 hover:bg-white/5"
                                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                    )}>
                                        {t.patientDashboard.prescriptionsPage.actions.viewDetails}
                                    </button>
                                )}
                            </div>

                            {/* Desktop/Medium Layout - Grid */}
                            <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:items-center">
                                {/* Icon + Name - 4 cols */}
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                        rx.status === "active" ? "bg-teal-500/10 text-teal-500" :
                                            rx.status === "refill-needed" ? "bg-amber-500/10 text-amber-500" :
                                                "bg-red-500/10 text-red-500"
                                    )}>
                                        {Icons.pill}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className={cn("text-base font-semibold truncate", textPrimary)}>
                                                {rx.name}
                                            </h3>
                                            <span className={cn("text-sm", textMuted)}>{rx.dosage}</span>
                                        </div>
                                        <p className={cn("text-sm", textMuted)}>{rx.frequency}</p>
                                    </div>
                                </div>

                                {/* Prescribed By - 2 cols */}
                                <div className="col-span-2">
                                    <p className={cn("text-xs uppercase tracking-wide mb-0.5", textMuted)}>{t.patientDashboard.prescriptionsPage.labels.prescribedBy}</p>
                                    <p className={cn("text-sm font-medium truncate", isDark ? "text-gray-300" : "text-gray-700")}>{rx.prescribedBy}</p>
                                </div>

                                {/* Refill Date - 2 cols */}
                                <div className="col-span-2">
                                    <p className={cn("text-xs uppercase tracking-wide mb-0.5", textMuted)}>{t.patientDashboard.prescriptionsPage.labels.refillDate}</p>
                                    <p className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>{rx.refillDate}</p>
                                </div>

                                {/* Pills Remaining - 1 col */}
                                <div className="col-span-1 text-center">
                                    <p className={cn("text-xs uppercase tracking-wide mb-0.5", textMuted)}>{t.patientDashboard.prescriptionsPage.labels.left}</p>
                                    <p className={cn(
                                        "text-sm font-bold",
                                        rx.pillsRemaining <= 5 ? "text-amber-500" : "text-teal-500"
                                    )}>
                                        {rx.pillsRemaining}
                                    </p>
                                </div>

                                {/* Status + Action - 3 cols */}
                                <div className="col-span-3 flex items-center justify-end gap-3">
                                    {getStatusBadge(rx.status)}
                                    {rx.status === "refill-needed" ? (
                                        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-teal-500/20">
                                            {Icons.refresh}
                                            {t.patientDashboard.prescriptionsPage.actions.refill}
                                        </button>
                                    ) : (
                                        <button className={cn(
                                            "px-4 py-2 text-sm font-medium rounded-lg border transition-colors",
                                            isDark
                                                ? "border-white/10 text-gray-400 hover:bg-white/5"
                                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        )}>
                                            {t.patientDashboard.prescriptionsPage.actions.details}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Instructions - Desktop (shown below grid) */}
                            <div className="hidden md:block mt-3 pt-3 border-t border-white/5">
                                <p className={cn("text-xs italic flex items-center gap-1.5", textMuted)}>
                                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                    </svg>
                                    {rx.instructions}
                                </p>
                            </div>
                        </GlowingCard>
                    </motion.div>
                ))}
            </div>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
                isDark={isDark}
                translations={t.patientDashboard.prescriptionsPage.upload}
            />
        </div>
    );
}
