"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PrescriptionPromptModalProps {
    isOpen: boolean;
    patientName: string;
    isDark?: boolean;
    isRTL?: boolean;
    onAddPrescription: () => void;
    onSkip: () => void;
}

const Icons = {
    prescription: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
    ),
    skip: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
    ),
    add: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
};

export function PrescriptionPromptModal({
    isOpen,
    patientName,
    isDark = true,
    isRTL = false,
    onAddPrescription,
    onSkip,
}: PrescriptionPromptModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={cn(
                            "rounded-2xl p-6 max-w-md w-full shadow-2xl",
                            isDark ? "bg-slate-800" : "bg-white",
                            isRTL && "rtl"
                        )}
                    >
                        {/* Icon */}
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                            isDark ? "bg-amber-500/10" : "bg-amber-50"
                        )}>
                            <span className="text-amber-500">{Icons.prescription}</span>
                        </div>

                        {/* Title */}
                        <h3 className={cn(
                            "text-xl font-semibold text-center mb-2",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            {isRTL ? "إضافة وصفة طبية؟" : "Add a Prescription?"}
                        </h3>

                        {/* Description */}
                        <p className={cn(
                            "text-center mb-6",
                            isDark ? "text-slate-400" : "text-slate-600"
                        )}>
                            {isRTL
                                ? `هل ترغب في إضافة وصفة طبية للمريض ${patientName}؟`
                                : `Would you like to add a prescription for ${patientName}?`}
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={onAddPrescription}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl font-medium transition-all",
                                    "bg-amber-500 text-white hover:bg-amber-600",
                                    "flex items-center justify-center gap-2",
                                    "shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
                                )}
                            >
                                {Icons.add}
                                <span>{isRTL ? "إضافة وصفة طبية" : "Add Prescription"}</span>
                            </button>
                            <button
                                onClick={onSkip}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl font-medium transition-colors",
                                    "flex items-center justify-center gap-2",
                                    isDark
                                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                )}
                            >
                                <span>{isRTL ? "تخطي (لا توجد وصفة)" : "Skip (No prescription needed)"}</span>
                                <span className={cn(isRTL && "rotate-180")}>{Icons.skip}</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default PrescriptionPromptModal;
