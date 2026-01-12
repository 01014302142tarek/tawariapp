"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Toast types
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Icons for toast types
const Icons = {
    success: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    info: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    close: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

const typeStyles: Record<ToastType, { bg: string; icon: string; border: string }> = {
    success: {
        bg: "bg-emerald-500/10",
        icon: "text-emerald-500",
        border: "border-emerald-500/20",
    },
    error: {
        bg: "bg-red-500/10",
        icon: "text-red-500",
        border: "border-red-500/20",
    },
    warning: {
        bg: "bg-amber-500/10",
        icon: "text-amber-500",
        border: "border-amber-500/20",
    },
    info: {
        bg: "bg-teal-500/10",
        icon: "text-teal-500",
        border: "border-teal-500/20",
    },
};

// Confirm dialog state
interface ConfirmState {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmState, setConfirmState] = useState<ConfirmState>({
        isOpen: false,
        message: "",
        onConfirm: () => {},
    });
    const [isDark, setIsDark] = useState(false);

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains("dark"));
        };
        
        checkDarkMode();
        
        // Watch for dark mode changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        
        return () => observer.disconnect();
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = "info", duration: number = 4000) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const newToast: Toast = { id, message, type, duration };

            setToasts((prev) => [...prev, newToast]);

            if (duration > 0) {
                setTimeout(() => removeToast(id), duration);
            }
        },
        [removeToast]
    );

    // Convenience helpers for common toast types
    const showSuccess = useCallback(
        (message: string, duration?: number) => showToast(message, "success", duration),
        [showToast]
    );

    const showError = useCallback(
        (message: string, duration?: number) => showToast(message, "error", duration),
        [showToast]
    );

    const showWarning = useCallback(
        (message: string, duration?: number) => showToast(message, "warning", duration),
        [showToast]
    );

    const showInfo = useCallback(
        (message: string, duration?: number) => showToast(message, "info", duration),
        [showToast]
    );

    const showConfirm = useCallback(
        (message: string, onConfirm: () => void, onCancel?: () => void) => {
            setConfirmState({
                isOpen: true,
                message,
                onConfirm,
                onCancel,
            });
        },
        []
    );

    const handleConfirm = () => {
        confirmState.onConfirm();
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        confirmState.onCancel?.();
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
    };

    return (
        <ToastContext.Provider value={{ toasts, showToast, showSuccess, showError, showWarning, showInfo, showConfirm, removeToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg",
                                typeStyles[toast.type].bg,
                                typeStyles[toast.type].border
                            )}
                        >
                            <span className={typeStyles[toast.type].icon}>
                                {Icons[toast.type]}
                            </span>
                            <p className="text-sm text-white flex-1">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                {Icons.close}
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Confirm Dialog */}
            <AnimatePresence>
                {confirmState.isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[101]"
                            onClick={handleCancel}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[102] w-full max-w-sm mx-4"
                        >
                            <div className={cn(
                                "rounded-2xl p-6 shadow-2xl border",
                                isDark ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"
                            )}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        {Icons.warning}
                                    </div>
                                    <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                        Confirm Action
                                    </h3>
                                </div>
                                <p className={cn("mb-6", isDark ? "text-gray-300" : "text-gray-700")}>
                                    {confirmState.message}
                                </p>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={handleCancel}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isDark 
                                                ? "text-gray-400 hover:text-white hover:bg-white/5" 
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                        )}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
