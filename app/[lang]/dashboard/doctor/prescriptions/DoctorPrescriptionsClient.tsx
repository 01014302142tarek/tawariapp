"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useThemeStyles } from "../context/useThemeStyles";
import { useI18n } from "@/app/i18n";
import { useToast } from "@/components/ui/toast";
import {
    getDoctorPrescriptions,
    createPrescription,
    cancelPrescription,
    getDoctorPatients,
    getPendingRenewalRequests,
    respondToRenewalRequest,
    type PrescriptionWithDetails,
    type PrescriptionMedication,
    type PatientForPrescription,
} from "@/app/actions/prescriptions";

// Local type with id for form state tracking
type MedicationFormItem = PrescriptionMedication & { _formId: string };

const createMedicationItem = (): MedicationFormItem => ({
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    _formId: `med-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
});

// Icons
const Icons = {
    prescription: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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
    x: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    trash: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
};

const Badge = ({ children, variant = "default", isDark = true }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "error"; isDark?: boolean }) => {
    const variants = {
        default: isDark ? "bg-slate-700/50 text-slate-300" : "bg-gray-200 text-gray-700",
        success: "bg-green-500/10 text-green-400 border border-green-500/20",
        warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        error: "bg-red-500/10 text-red-400 border border-red-500/20",
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", variants[variant])}>
            {children}
        </span>
    );
};

export default function PrescriptionsPage({
    initialPrescriptions = [],
    initialPatients = [],
    initialRenewalRequests = [],
    initialLoaded = false,
}: {
    initialPrescriptions?: PrescriptionWithDetails[];
    initialPatients?: PatientForPrescription[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialRenewalRequests?: any[];
    initialLoaded?: boolean;
}) {
    const { isRTL } = useI18n();
    const { showConfirm } = useToast();
    const { isDark, textPrimary, textMuted, inputBg, inputFocus, cardHover } = useThemeStyles();

    const [prescriptions, setPrescriptions] = useState<PrescriptionWithDetails[]>(initialPrescriptions);
    const [patients, setPatients] = useState<PatientForPrescription[]>(initialPatients);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [renewalRequests, setRenewalRequests] = useState<any[]>(initialRenewalRequests);
    const [loading, setLoading] = useState(!initialLoaded);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"prescriptions" | "renewals">("prescriptions");

    // Create form state
    const [selectedPatient, setSelectedPatient] = useState<string>("");
    const [medications, setMedications] = useState<MedicationFormItem[]>([
        createMedicationItem()
    ]);
    const [validUntil, setValidUntil] = useState("");
    const [creating, setCreating] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        const [prescriptionsResult, patientsResult, renewalsResult] = await Promise.all([
            getDoctorPrescriptions(),
            getDoctorPatients(),
            getPendingRenewalRequests(),
        ]);

        if (prescriptionsResult.prescriptions) {
            setPrescriptions(prescriptionsResult.prescriptions);
        }
        if (patientsResult.patients) {
            setPatients(patientsResult.patients);
        }
        if (renewalsResult.requests) {
            setRenewalRequests(renewalsResult.requests);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!initialLoaded) {
            loadData();
        }
    }, [loadData, initialLoaded]);

    const handleCreatePrescription = async () => {
        if (!selectedPatient || medications.length === 0) return;

        // Validate at least one medication has a name and strip _formId
        const validMeds = medications
            .filter(m => m.medication_name.trim())
            .map(({ _formId, ...med }) => med);
        if (validMeds.length === 0) return;

        setCreating(true);
        const result = await createPrescription({
            patientProfileId: selectedPatient,
            medications: validMeds,
            validUntil: validUntil || undefined,
        });

        if (result.success) {
            setShowCreateModal(false);
            resetForm();
            await loadData();
        }
        setCreating(false);
    };

    const handleCancelPrescription = (id: string) => {
        showConfirm(
            isRTL ? "هل أنت متأكد من إلغاء هذه الوصفة؟" : "Are you sure you want to cancel this prescription?",
            async () => {
                setActionLoading(id);
                await cancelPrescription(id);
                await loadData();
                setActionLoading(null);
            }
        );
    };

    const resetForm = () => {
        setSelectedPatient("");
        setMedications([createMedicationItem()]);
        setValidUntil("");
    };

    const addMedication = () => {
        setMedications([...medications, createMedicationItem()]);
    };

    const removeMedication = (formId: string) => {
        if (medications.length > 1) {
            setMedications(medications.filter(m => m._formId !== formId));
        }
    };

    const updateMedication = (formId: string, field: keyof PrescriptionMedication, value: string | number) => {
        setMedications(medications.map(m =>
            m._formId === formId ? { ...m, [field]: value } : m
        ));
    };

    const formatDate = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleApproveRenewal = async (requestId: string) => {
        setActionLoading(requestId);
        await respondToRenewalRequest(requestId, true);
        await loadData();
        setActionLoading(null);
    };

    const handleDenyRenewal = (requestId: string) => {
        showConfirm(
            isRTL ? "هل أنت متأكد من رفض طلب التجديد؟" : "Are you sure you want to deny this renewal request?",
            async () => {
                setActionLoading(requestId);
                await respondToRenewalRequest(requestId, false, "Request denied by doctor");
                await loadData();
                setActionLoading(null);
            }
        );
    };

    const filteredPrescriptions = prescriptions.filter(rx =>
        rx.patient?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rx.medication_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredRenewals = renewalRequests.filter((req: any) =>
        req.patient_profiles?.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.prescriptions?.medication_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className={cn("text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3", textPrimary)}>
                        <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.prescription}
                        </span>
                        {isRTL ? "الوصفات الطبية" : "Prescriptions"}
                    </h1>
                    <p className={cn("mt-1 text-sm md:text-base", textMuted)}>
                        {isRTL ? "إنشاء وإدارة الوصفات الطبية للمرضى" : "Create and manage patient prescriptions"}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold py-2 md:py-2.5 px-4 md:px-5 rounded-lg md:rounded-xl transition-all shadow-lg shadow-teal-500/20 text-sm md:text-base"
                >
                    {Icons.plus}
                    <span>{isRTL ? "وصفة جديدة" : "New Prescription"}</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab("prescriptions")}
                    className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                        activeTab === "prescriptions"
                            ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20"
                            : cn("border-transparent", isDark ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200")
                    )}
                >
                    {isRTL ? "الوصفات" : "Prescriptions"}
                </button>
                <button
                    onClick={() => setActiveTab("renewals")}
                    className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-medium transition-all border relative",
                        activeTab === "renewals"
                            ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20"
                            : cn("border-transparent", isDark ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200")
                    )}
                >
                    {isRTL ? "طلبات التجديد" : "Renewal Requests"}
                    {renewalRequests.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {renewalRequests.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <span className={cn("absolute top-1/2 -translate-y-1/2", isRTL ? "right-4" : "left-4", textMuted)}>
                    {Icons.search}
                </span>
                <input
                    type="text"
                    placeholder={isRTL ? "البحث بالاسم أو الدواء..." : "Search by name or medication..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                        "w-full py-3 rounded-xl border transition-colors outline-none",
                        isRTL ? "pr-12 pl-4" : "pl-12 pr-4",
                        inputBg, inputFocus
                    )}
                />
            </div>

            {/* Renewal Requests Tab */}
            {activeTab === "renewals" && (
                <>
                    {filteredRenewals.length === 0 ? (
                        <GlowingCard glowColor="teal" className="p-12 text-center" isDark={isDark}>
                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", isDark ? "bg-slate-900" : "bg-gray-100", textMuted)}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </div>
                            <h3 className={cn("text-lg font-medium mb-2", textPrimary)}>
                                {isRTL ? "لا توجد طلبات تجديد" : "No renewal requests"}
                            </h3>
                            <p className={textMuted}>
                                {isRTL ? "ستظهر طلبات التجديد من المرضى هنا" : "Patient renewal requests will appear here"}
                            </p>
                        </GlowingCard>
                    ) : (
                        <GlowingCard glowColor="teal" className="p-0 overflow-hidden" isDark={isDark}>
                            <div className={cn("divide-y", isDark ? "divide-white/5" : "divide-gray-100")}>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {filteredRenewals.map((request: any, idx) => (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={cn("p-4 md:p-5 transition-colors", cardHover)}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            {/* Patient Info */}
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-500/30 flex-shrink-0">
                                                    {request.patient_profiles?.profiles?.avatar_url ? (
                                                        <Image
                                                            src={request.patient_profiles.profiles.avatar_url}
                                                            alt={request.patient_profiles.profiles.full_name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="44px"
                                                        />
                                                    ) : (
                                                        <div className={cn("w-full h-full flex items-center justify-center text-lg font-bold", isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600")}>
                                                            {request.patient_profiles?.profiles?.full_name?.charAt(0) || "?"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn("font-semibold truncate", textPrimary)}>
                                                        {request.patient_profiles?.profiles?.full_name || (isRTL ? "مريض" : "Patient")}
                                                    </p>
                                                    <p className={cn("text-sm truncate", textMuted)}>
                                                        {request.prescriptions?.medication_name} {request.prescriptions?.dosage && `- ${request.prescriptions.dosage}`}
                                                    </p>
                                                    {request.request_notes && (
                                                        <p className={cn("text-xs mt-1 italic", textMuted)}>
                                                            &ldquo;{request.request_notes}&rdquo;
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {actionLoading === request.id ? (
                                                    <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full" />
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveRenewal(request.id)}
                                                            className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
                                                        >
                                                            {isRTL ? "موافقة" : "Approve"}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDenyRenewal(request.id)}
                                                            className={cn(
                                                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                                                isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"
                                                            )}
                                                        >
                                                            {isRTL ? "رفض" : "Deny"}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </GlowingCard>
                    )}
                </>
            )}

            {/* Prescriptions List */}
            {activeTab === "prescriptions" && (
            <>
            {filteredPrescriptions.length === 0 ? (
                <GlowingCard glowColor="teal" className="p-12 text-center" isDark={isDark}>
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", isDark ? "bg-slate-900" : "bg-gray-100", textMuted)}>
                        {Icons.prescription}
                    </div>
                    <h3 className={cn("text-lg font-medium mb-2", textPrimary)}>
                        {isRTL ? "لا توجد وصفات" : "No prescriptions found"}
                    </h3>
                    <p className={textMuted}>
                        {isRTL ? "ابدأ بإنشاء وصفة طبية جديدة" : "Start by creating a new prescription"}
                    </p>
                </GlowingCard>
            ) : (
                <div className="grid gap-3 md:gap-4">
                    {filteredPrescriptions.map((rx, idx) => (
                        <motion.div
                            key={rx.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <GlowingCard glowColor="teal" className={cn("p-4 transition-colors", cardHover)} isDark={isDark}>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    {/* Patient Info */}
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-teal-500/20 flex-shrink-0">
                                            {rx.patient?.avatar_url ? (
                                                <Image
                                                    src={rx.patient.avatar_url}
                                                    alt={rx.patient.full_name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="40px"
                                                />
                                            ) : (
                                                <div className={cn("w-full h-full flex items-center justify-center text-sm font-bold", isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-600")}>
                                                    {rx.patient?.full_name.charAt(0) || "?"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className={cn("font-semibold text-sm", textPrimary)}>
                                                    {rx.patient?.full_name || "Unknown Patient"}
                                                </p>
                                                <Badge
                                                    variant={rx.status === "active" ? "success" : rx.status === "cancelled" ? "error" : "default"}
                                                    isDark={isDark}
                                                >
                                                    {rx.status === "active" ? (isRTL ? "نشط" : "Active") :
                                                        rx.status === "cancelled" ? (isRTL ? "ملغي" : "Cancelled") :
                                                            (isRTL ? "مكتمل" : "Completed")}
                                                </Badge>
                                            </div>
                                            <p className={cn("text-xs", textMuted)}>
                                                {formatDate(rx.prescribed_at)}
                                                {rx.valid_until && ` • ${isRTL ? "صالح حتى" : "Valid until"}: ${formatDate(rx.valid_until)}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Medication Info */}
                                    <div className="flex-1 sm:text-center">
                                        <p className={cn("font-medium", textPrimary)}>{rx.medication_name}</p>
                                        <p className={cn("text-xs", textMuted)}>
                                            {rx.dosage} {rx.frequency && `• ${rx.frequency}`}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                                        {actionLoading === rx.id ? (
                                            <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full" />
                                        ) : (
                                            <>
                                                {rx.status === "active" && (
                                                    <button
                                                        onClick={() => handleCancelPrescription(rx.id)}
                                                        className={cn("p-2 rounded-lg transition-colors", isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50")}
                                                        title={isRTL ? "إلغاء" : "Cancel"}
                                                    >
                                                        {Icons.trash}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Instructions */}
                                {rx.instructions && (
                                    <div className={cn("mt-3 pt-3 border-t text-sm", isDark ? "border-white/5" : "border-gray-100", textMuted)}>
                                        <span className="font-medium">{isRTL ? "التعليمات:" : "Instructions:"}</span> {rx.instructions}
                                    </div>
                                )}
                            </GlowingCard>
                        </motion.div>
                    ))}
                </div>
            )}
            </>
            )}

            {/* Create Prescription Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={cn(
                                "w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border",
                                isDark ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className={cn("sticky top-0 flex items-center justify-between p-4 border-b", isDark ? "bg-slate-900 border-white/10" : "bg-white border-gray-200")}>
                                <h2 className={cn("text-lg font-semibold", textPrimary)}>
                                    {isRTL ? "وصفة طبية جديدة" : "New Prescription"}
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className={cn("p-2 rounded-lg transition-colors", isDark ? "hover:bg-white/10" : "hover:bg-gray-100")}
                                >
                                    {Icons.x}
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4 space-y-4">
                                {/* Patient Selection */}
                                <div>
                                    <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                        {isRTL ? "المريض" : "Patient"} *
                                    </label>
                                    <select
                                        value={selectedPatient}
                                        onChange={(e) => setSelectedPatient(e.target.value)}
                                        className={cn(
                                            "w-full py-3 rounded-xl border transition-colors outline-none",
                                            inputBg, inputFocus,
                                            // Add proper spacing for the dropdown arrow with more padding on the right
                                            isRTL ? "pl-4 pr-12" : "pr-12 pl-4"
                                        )}
                                    >
                                        <option value="">{isRTL ? "اختر مريض..." : "Select patient..."}</option>
                                        {patients.map((patient) => (
                                            <option key={patient.id} value={patient.id}>
                                                {patient.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Valid Until */}
                                <div>
                                    <label className={cn("block text-sm font-medium mb-2", textPrimary)}>
                                        {isRTL ? "صالح حتى" : "Valid Until"}
                                    </label>
                                    <input
                                        type="date"
                                        value={validUntil}
                                        onChange={(e) => setValidUntil(e.target.value)}
                                        className={cn(
                                            "w-full py-3 px-4 rounded-xl border transition-colors outline-none",
                                            inputBg, inputFocus,
                                            // Dark mode calendar icon styling
                                            isDark && "[color-scheme:dark]"
                                        )}
                                    />
                                </div>

                                {/* Medications */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className={cn("text-sm font-medium", textPrimary)}>
                                            {isRTL ? "الأدوية" : "Medications"} *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addMedication}
                                            className="text-teal-500 hover:text-teal-400 text-sm font-medium flex items-center gap-1"
                                        >
                                            {Icons.plus}
                                            {isRTL ? "إضافة دواء" : "Add Medication"}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {medications.map((med, index) => (
                                            <div
                                                key={med._formId}
                                                className={cn(
                                                    "p-4 rounded-xl border",
                                                    isDark ? "bg-slate-800/50 border-white/5" : "bg-gray-50 border-gray-200"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={cn("text-sm font-medium", textPrimary)}>
                                                        {isRTL ? `دواء ${index + 1}` : `Medication ${index + 1}`}
                                                    </span>
                                                    {medications.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMedication(med._formId)}
                                                            className={cn("p-1.5 rounded-lg transition-colors", isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50")}
                                                        >
                                                            {Icons.trash}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder={isRTL ? "اسم الدواء *" : "Medication name *"}
                                                        value={med.medication_name}
                                                        onChange={(e) => updateMedication(med._formId, "medication_name", e.target.value)}
                                                        className={cn(
                                                            "w-full py-2.5 px-3 rounded-lg border text-sm transition-colors outline-none",
                                                            inputBg, inputFocus
                                                        )}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder={isRTL ? "الجرعة (مثال: 500mg)" : "Dosage (e.g., 500mg)"}
                                                        value={med.dosage}
                                                        onChange={(e) => updateMedication(med._formId, "dosage", e.target.value)}
                                                        className={cn(
                                                            "w-full py-2.5 px-3 rounded-lg border text-sm transition-colors outline-none",
                                                            inputBg, inputFocus
                                                        )}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder={isRTL ? "التكرار (مثال: 3 مرات يومياً)" : "Frequency (e.g., 3x daily)"}
                                                        value={med.frequency}
                                                        onChange={(e) => updateMedication(med._formId, "frequency", e.target.value)}
                                                        className={cn(
                                                            "w-full py-2.5 px-3 rounded-lg border text-sm transition-colors outline-none",
                                                            inputBg, inputFocus
                                                        )}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder={isRTL ? "المدة (مثال: 7 أيام)" : "Duration (e.g., 7 days)"}
                                                        value={med.duration}
                                                        onChange={(e) => updateMedication(med._formId, "duration", e.target.value)}
                                                        className={cn(
                                                            "w-full py-2.5 px-3 rounded-lg border text-sm transition-colors outline-none",
                                                            inputBg, inputFocus
                                                        )}
                                                    />
                                                </div>
                                                <textarea
                                                    placeholder={isRTL ? "التعليمات (اختياري)" : "Instructions (optional)"}
                                                    value={med.instructions || ""}
                                                    onChange={(e) => updateMedication(med._formId, "instructions", e.target.value)}
                                                    rows={2}
                                                    className={cn(
                                                        "w-full mt-3 py-2.5 px-3 rounded-lg border text-sm transition-colors outline-none resize-none",
                                                        inputBg, inputFocus
                                                    )}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className={cn("sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t", isDark ? "bg-slate-900 border-white/10" : "bg-white border-gray-200")}>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl font-medium transition-colors",
                                        isDark ? "text-gray-400 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"
                                    )}
                                >
                                    {isRTL ? "إلغاء" : "Cancel"}
                                </button>
                                <button
                                    onClick={handleCreatePrescription}
                                    disabled={!selectedPatient || !medications.some(m => m.medication_name.trim()) || creating}
                                    className="px-5 py-2.5 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {isRTL ? "جاري الإنشاء..." : "Creating..."}
                                        </>
                                    ) : (
                                        isRTL ? "إنشاء الوصفة" : "Create Prescription"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
