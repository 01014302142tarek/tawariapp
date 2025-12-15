"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useRouter } from "next/navigation";
import { useI18n } from "@/app/i18n";

// ============================================
// ICONS
// ============================================
const Icons = {
    user: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    briefcase: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
    ),
    building: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
    ),
    document: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    check: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    arrowLeft: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    ),
    arrowRight: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
    ),
    upload: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
    ),
    camera: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
    ),
    sparkles: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    ),
    wave: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318V4.575" />
        </svg>
    ),
    clock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    spinner: (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    ),
    home: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
    ),
    trash: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
};

// Step configuration
const steps = [
    { id: 1, title: "Welcome", icon: Icons.user },
    { id: 2, title: "Professional", icon: Icons.briefcase },
    { id: 3, title: "Practice", icon: Icons.building },
    { id: 4, title: "Verification", icon: Icons.document },
    { id: 5, title: "Complete", icon: Icons.check },
];

// Medical specialties
const specialties = [
    "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
    "General Practice", "Neurology", "Oncology", "Ophthalmology",
    "Orthopedics", "Pediatrics", "Psychiatry", "Pulmonology",
    "Radiology", "Rheumatology", "Urology", "Other"
];

// Input Component
const Input = ({ label, placeholder, value, onChange, type = "text", isDark, required = false }: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    isDark: boolean;
    required?: boolean;
}) => (
    <div className="space-y-1">
        <label className={cn("block text-xs font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
            {label} {required && <span className="text-teal-500">*</span>}
        </label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                "w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all",
                isDark
                    ? "bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
                    : "bg-white border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
            )}
        />
    </div>
);

// Select Component
const Select = ({ label, value, onChange, options, isDark, required = false }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    isDark: boolean;
    required?: boolean;
}) => (
    <div className="space-y-1">
        <label className={cn("block text-xs font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
            {label} {required && <span className="text-teal-500">*</span>}
        </label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                "w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all appearance-none cursor-pointer",
                isDark
                    ? "bg-slate-800/50 border-white/10 text-white focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
                    : "bg-white border-gray-200 text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
            )}
        >
            <option value="">Select</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

// Textarea Component
const Textarea = ({ label, placeholder, value, onChange, isDark, rows = 4 }: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    isDark: boolean;
    rows?: number;
}) => (
    <div className="space-y-1">
        <label className={cn("block text-xs font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
            {label}
        </label>
        <textarea
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className={cn(
                "w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all resize-none",
                isDark
                    ? "bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
                    : "bg-white border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
            )}
        />
    </div>
);

// File Upload Component
const FileUpload = ({ label, fileName, onFileChange, isDark, accept = "*", filePreview }: {
    label: string;
    fileName: string;
    onFileChange: (name: string, file?: File) => void;
    isDark: boolean;
    accept?: string;
    filePreview?: string;
}) => {
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                alert("File size must be less than 10MB");
                return;
            }
            onFileChange(file.name, file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                alert("File size must be less than 10MB");
                return;
            }
            // Validate file type
            const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
            const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
            if (accept !== "*" && !acceptedTypes.includes(fileExt)) {
                alert(`Please upload a valid file type: ${accept}`);
                return;
            }
            onFileChange(file.name, file);
        }
    };

    return (
        <div className="space-y-1">
            <label className={cn("block text-xs font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                {label}
            </label>
            <label
                className={cn(
                    "flex flex-col items-center justify-center w-full h-20 rounded-lg border-2 border-dashed cursor-pointer transition-all",
                    fileName
                        ? "border-teal-500/50 bg-teal-500/5"
                        : isDark
                            ? "border-white/10 bg-slate-800/30 hover:border-teal-500/30 hover:bg-slate-800/50"
                            : "border-gray-200 bg-gray-50 hover:border-teal-500/30 hover:bg-gray-100"
                )}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center py-2">
                    {filePreview && fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <div className="relative w-10 h-10 mb-1 rounded overflow-hidden">
                            <Image src={filePreview} alt="Preview" fill className="object-cover" />
                        </div>
                    ) : (
                        <div className={cn("mb-1", fileName ? "text-teal-500" : isDark ? "text-gray-400" : "text-gray-500")}>
                            {fileName ? Icons.check : Icons.upload}
                        </div>
                    )}
                    <p className={cn("text-xs text-center px-2", fileName ? "text-teal-500 font-medium" : isDark ? "text-gray-400" : "text-gray-500")}>
                        {fileName || "Click to upload or drag and drop"}
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

// ============================================
// STEP COMPONENTS
// ============================================

// Step 1: Welcome & Personal Info
const Step1Welcome = ({ formData, setFormData, isDark, onPhotoUpload }: { formData: FormData; setFormData: (data: FormData) => void; isDark: boolean; onPhotoUpload?: (file: File) => void }) => {
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB max for profile photo)
            if (file.size > 5 * 1024 * 1024) {
                alert("Profile photo must be less than 5MB");
                return;
            }
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert("Please upload a valid image file");
                return;
            }
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setFormData({ ...formData, photoUrl: previewUrl });
            if (onPhotoUpload) {
                onPhotoUpload(file);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-2 text-teal-500">
                    {Icons.wave}
                </div>
                <h2 className={cn("text-xl font-bold mb-1", isDark ? "text-white" : "text-slate-900")}>Welcome, Doctor!</h2>
                <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                    Let&apos;s set up your profile to get started
                </p>
            </div>

            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center mb-4">
                <label className={cn(
                    "w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden",
                    formData.photoUrl
                        ? "border-teal-500"
                        : isDark ? "border-white/20 hover:border-teal-500/50" : "border-gray-300 hover:border-teal-500/50"
                )}>
                    {formData.photoUrl ? (
                        <Image src={formData.photoUrl} alt="Profile" width={64} height={64} className="object-cover w-full h-full" />
                    ) : (
                        <div className={cn("text-center", isDark ? "text-gray-400" : "text-gray-500")}>
                            {Icons.camera}
                        </div>
                    )}
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoChange}
                    />
                </label>
                <p className={cn("mt-1 text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                    {formData.photoUrl ? "Click to change" : "Upload photo"}
                </p>
            </div>

            <Input
                label="Full Name"
                placeholder="Dr. Ahmed Hassan"
                value={formData.fullName}
                onChange={(val) => setFormData({ ...formData, fullName: val })}
                isDark={isDark}
            />
            <Input
                label="Email Address"
                placeholder="ahmed.hassan@email.com"
                value={formData.email}
                onChange={(val) => setFormData({ ...formData, email: val })}
                type="email"
                isDark={isDark}
            />
            <Input
                label="Phone Number"
                placeholder="+20 123 456 7890"
                value={formData.phone}
                onChange={(val) => setFormData({ ...formData, phone: val })}
                type="tel"
                isDark={isDark}
            />
        </div>
    );
};

// Step 2: Professional Details
const Step2Professional = ({ formData, setFormData, isDark }: { formData: FormData; setFormData: (data: FormData) => void; isDark: boolean }) => (
    <div className="space-y-4">
        <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-2 text-teal-500">
                {Icons.briefcase}
            </div>
            <h2 className={cn("text-xl font-bold mb-1", isDark ? "text-white" : "text-slate-900")}>Professional Details</h2>
            <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                Tell us about your medical expertise
            </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <Select
                label="Medical Specialty"
                value={formData.specialty}
                onChange={(val) => setFormData({ ...formData, specialty: val })}
                options={specialties}
                isDark={isDark}
            />
            <Input
                label="Years of Experience"
                placeholder="10"
                value={formData.experience}
                onChange={(val) => setFormData({ ...formData, experience: val })}
                type="number"
                isDark={isDark}
            />
        </div>
        <div className="grid grid-cols-2 gap-3">
            <Input
                label="License Number"
                placeholder="ML-12345-EG"
                value={formData.licenseNumber}
                onChange={(val) => setFormData({ ...formData, licenseNumber: val })}
                isDark={isDark}
            />
            <Input
                label="Certifications"
                placeholder="Board certifications..."
                value={formData.certifications}
                onChange={(val) => setFormData({ ...formData, certifications: val })}
                isDark={isDark}
            />
        </div>
    </div>
);

// Step 3: Practice Information
const Step3Practice = ({ formData, setFormData, isDark }: { formData: FormData; setFormData: (data: FormData) => void; isDark: boolean }) => (
    <div className="space-y-4">
        <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-2 text-teal-500">
                {Icons.building}
            </div>
            <h2 className={cn("text-xl font-bold mb-1", isDark ? "text-white" : "text-slate-900")}>Practice Information</h2>
            <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                Where do you practice medicine?
            </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <Input
                label="Clinic/Hospital Name"
                placeholder="Cairo Medical Center"
                value={formData.clinicName}
                onChange={(val) => setFormData({ ...formData, clinicName: val })}
                isDark={isDark}
            />
            <Input
                label="Consultation Fee (EGP)"
                placeholder="500"
                value={formData.consultationFee}
                onChange={(val) => setFormData({ ...formData, consultationFee: val })}
                type="number"
                isDark={isDark}
            />
        </div>
        <Input
            label="Work Address"
            placeholder="123 Medical Street, Cairo, Egypt"
            value={formData.address}
            onChange={(val) => setFormData({ ...formData, address: val })}
            isDark={isDark}
        />
        <div className="grid grid-cols-2 gap-3">
            <Input
                label="Available Days"
                placeholder="Sun - Thu"
                value={formData.availableDays}
                onChange={(val) => setFormData({ ...formData, availableDays: val })}
                isDark={isDark}
            />
            <Input
                label="Working Hours"
                placeholder="9 AM - 5 PM"
                value={formData.workingHours}
                onChange={(val) => setFormData({ ...formData, workingHours: val })}
                isDark={isDark}
            />
        </div>
    </div>
);

// Step 4: Verification & Bio
const Step4Verification = ({ formData, setFormData, isDark, licensePreview, onLicenseUpload, onExtraUpload }: { formData: FormData; setFormData: (data: FormData) => void; isDark: boolean; licensePreview?: string; onLicenseUpload?: (name: string, file?: File) => void; onExtraUpload?: (file: File) => void }) => {

    const handleRemoveExtra = (index: number) => {
        const newDocs = [...formData.extraDocuments];
        newDocs.splice(index, 1);
        setFormData({ ...formData, extraDocuments: newDocs });
    };

    return (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-2 text-teal-500">
                    {Icons.document}
                </div>
                <h2 className={cn("text-xl font-bold mb-1", isDark ? "text-white" : "text-slate-900")}>Verification</h2>
                <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                    Upload credentials (optional)
                </p>
            </div>

            <FileUpload
                label="Medical License Document"
                fileName={formData.licenseDocument}
                onFileChange={(name, file) => {
                    setFormData({ ...formData, licenseDocument: name });
                    if (onLicenseUpload) {
                        onLicenseUpload(name, file);
                    }
                }}
                isDark={isDark}
                accept=".pdf,.jpg,.jpeg,.png"
                filePreview={licensePreview}
            />

            <div className="space-y-2">
                <label className={cn("block text-xs font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                    Additional Documents (Optional)
                </label>

                {/* List of uploaded files */}
                {formData.extraDocuments.length > 0 && (
                    <div className="space-y-2 mb-3">
                        {formData.extraDocuments.map((doc, idx) => (
                            <div key={idx} className={cn(
                                "flex items-center justify-between p-2 rounded-lg border text-sm",
                                isDark ? "bg-slate-800/50 border-white/10" : "bg-white border-gray-200"
                            )}>
                                <div className="flex items-center gap-2 truncate">
                                    <span className="text-teal-500">{Icons.document}</span>
                                    <span className={cn("truncate", isDark ? "text-gray-300" : "text-gray-700")}>{doc}</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveExtra(idx)}
                                    className="text-red-500 hover:text-red-400 p-1 rounded transition-colors"
                                >
                                    {Icons.trash}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <label
                    className={cn(
                        "flex items-center justify-center gap-2 w-full p-3 rounded-lg border border-dashed cursor-pointer transition-all",
                        isDark
                            ? "border-white/20 hover:border-teal-500/50 hover:bg-slate-800/50 text-gray-400 hover:text-teal-500"
                            : "border-gray-300 hover:border-teal-500/50 hover:bg-gray-50 text-gray-500 hover:text-teal-500"
                    )}
                >
                    <div className="w-5 h-5">{Icons.upload}</div>
                    <span className="text-xs font-medium">Add another document</span>
                    <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const newDocs = [...formData.extraDocuments, file.name];
                                setFormData({ ...formData, extraDocuments: newDocs });
                                if (onExtraUpload) onExtraUpload(file);
                            }
                        }}
                    />
                </label>
            </div>

            <Textarea
                label="Professional Bio"
                placeholder="Brief description about yourself..."
                value={formData.bio}
                onChange={(val) => setFormData({ ...formData, bio: val })}
                isDark={isDark}
                rows={2}
            />

            <div className={cn("p-3 rounded-xl border", isDark ? "bg-slate-800/30 border-white/5" : "bg-gray-50 border-gray-200")}>
                <label className="flex items-start gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                    />
                    <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>
                        I agree to the <span className="text-teal-500">Terms</span> and <span className="text-teal-500">Privacy Policy</span>
                    </span>
                </label>
            </div>
        </div>
    );
};

// Step 5: Completion
const Step5Complete = ({ formData, isDark, isApproved = false }: { formData: FormData; isDark: boolean; isApproved?: boolean }) => (
    <div className="text-center py-4">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-4 text-teal-500"
        >
            {Icons.sparkles}
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <h2 className={cn("text-xl font-bold mb-1", isDark ? "text-white" : "text-slate-900")}>
                Welcome Aboard{formData.fullName ? `, Dr. ${formData.fullName.split(" ").pop()}` : ""}!
            </h2>
            <p className={cn("text-xs mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
                Your profile has been submitted successfully
            </p>
        </motion.div>

        {/* Status - shows either Waiting for Approval OR Redirecting based on isApproved */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={cn("p-3 rounded-xl border mb-4 flex items-center justify-center gap-2",
                isApproved
                    ? (isDark ? "bg-teal-500/10 border-teal-500/20" : "bg-teal-50 border-teal-200")
                    : (isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200")
            )}
        >
            {isApproved ? (
                <>
                    <div className="text-teal-500">
                        {Icons.spinner}
                    </div>
                    <span className={cn("text-sm font-medium", isDark ? "text-teal-400" : "text-teal-600")}>
                        Redirecting to Dashboard...
                    </span>
                </>
            ) : (
                <>
                    <div className="text-amber-500">
                        {Icons.clock}
                    </div>
                    <span className={cn("text-sm font-medium", isDark ? "text-amber-400" : "text-amber-600")}>
                        Waiting for Admin Approval
                    </span>
                </>
            )}
        </motion.div>

        {/* Profile Summary */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={cn("p-4 rounded-xl border text-left", isDark ? "bg-slate-800/30 border-white/5" : "bg-gray-50 border-gray-200")}
        >
            <h3 className={cn("font-semibold text-sm mb-3", isDark ? "text-white" : "text-slate-900")}>Profile Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                    <p className={isDark ? "text-gray-500" : "text-gray-500"}>Specialty</p>
                    <p className={isDark ? "text-white" : "text-slate-900"}>{formData.specialty || "Not specified"}</p>
                </div>
                <div>
                    <p className={isDark ? "text-gray-500" : "text-gray-500"}>Experience</p>
                    <p className={isDark ? "text-white" : "text-slate-900"}>{formData.experience ? `${formData.experience} years` : "Not specified"}</p>
                </div>
                <div>
                    <p className={isDark ? "text-gray-500" : "text-gray-500"}>Clinic</p>
                    <p className={isDark ? "text-white" : "text-slate-900"}>{formData.clinicName || "Not specified"}</p>
                </div>
                <div>
                    <p className={isDark ? "text-gray-500" : "text-gray-500"}>Fee</p>
                    <p className={isDark ? "text-white" : "text-slate-900"}>{formData.consultationFee ? `${formData.consultationFee} EGP` : "Not specified"}</p>
                </div>
            </div>
        </motion.div>
    </div>
);

// ============================================
// FORM DATA TYPE
// ============================================
interface FormData {
    // Step 1
    fullName: string;
    email: string;
    phone: string;
    photoUrl: string;
    // Step 2
    specialty: string;
    experience: string;
    licenseNumber: string;
    certifications: string;
    // Step 3
    clinicName: string;
    address: string;
    availableDays: string;
    workingHours: string;
    consultationFee: string;
    // Step 4
    licenseDocument: string;
    extraDocuments: string[];
    bio: string;
    termsAccepted: boolean;
}

const initialFormData: FormData = {
    fullName: "",
    email: "",
    phone: "",
    photoUrl: "",
    specialty: "",
    experience: "",
    licenseNumber: "",
    certifications: "",
    clinicName: "",
    address: "",
    availableDays: "",
    workingHours: "",
    consultationFee: "",
    licenseDocument: "",
    extraDocuments: [],
    bio: "",
    termsAccepted: false,
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function DoctorOnboarding() {
    const { theme } = useTheme();
    const { language } = useI18n();
    const isDark = theme === "dark";
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);

    const progress = (currentStep / steps.length) * 100;

    // File state for actual file objects
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [licensePreview, setLicensePreview] = useState<string>("");

    // Allow proceeding without data - validation is optional
    const canProceed = () => {
        // Always allow proceeding through the onboarding flow
        return true;
    };

    // Handle license file upload with preview
    const handleLicenseUpload = (name: string, file?: File) => {
        if (file) {
            setLicenseFile(file);
            // Create preview for images
            if (file.type.startsWith('image/')) {
                setLicensePreview(URL.createObjectURL(file));
            } else {
                setLicensePreview("");
            }
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        router.push(`/${language}/dashboard/doctor`);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1Welcome formData={formData} setFormData={setFormData} isDark={isDark} onPhotoUpload={(file) => setPhotoFile(file)} />;
            case 2:
                return <Step2Professional formData={formData} setFormData={setFormData} isDark={isDark} />;
            case 3:
                return <Step3Practice formData={formData} setFormData={setFormData} isDark={isDark} />;
            case 4:
                return <Step4Verification formData={formData} setFormData={setFormData} isDark={isDark} licensePreview={licensePreview} onLicenseUpload={handleLicenseUpload} />;
            case 5:
                return <Step5Complete formData={formData} isDark={isDark} />;
            default:
                return null;
        }
    };

    return (
        <>
            <GlowingCard glowColor="teal" className="p-4 md:p-5" isDark={isDark}>
                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex items-center gap-2">
                        <div className={cn("flex-1 h-1.5 rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-gray-200")}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                                className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full"
                            />
                        </div>
                        <span className={cn("text-xs font-medium min-w-[32px]", isDark ? "text-gray-400" : "text-gray-600")}>
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons - only show for steps 1-4 */}
                {currentStep < 5 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                        {currentStep > 1 ? (
                            <button
                                onClick={handleBack}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isDark
                                        ? "text-gray-400 hover:text-white hover:bg-white/5"
                                        : "text-gray-600 hover:text-slate-900 hover:bg-gray-100"
                                )}
                            >
                                {Icons.arrowLeft}
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                canProceed()
                                    ? "bg-teal-500 hover:bg-teal-600 text-white"
                                    : isDark
                                        ? "bg-slate-800 text-gray-500 cursor-not-allowed"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            Continue
                            {Icons.arrowRight}
                        </button>
                    </div>
                )}
            </GlowingCard>

            {/* Home button - only show on step 5 */}
            {currentStep === 5 && (
                <div className="mt-4 flex justify-start">
                    <button
                        onClick={() => router.push("/")}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isDark
                                ? "text-gray-400 hover:text-white hover:bg-white/5"
                                : "text-gray-600 hover:text-slate-900 hover:bg-gray-100"
                        )}
                    >
                        {Icons.arrowLeft}
                        Home
                    </button>
                </div>
            )}
        </>
    );
}
