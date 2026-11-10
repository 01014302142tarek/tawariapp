"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { getOnlineDoctors, type OnlineDoctor } from "@/app/actions/queue";
import { submitUrgentCareManualPayment } from "@/app/actions/payments";
import { isValidFullName, isValidEgyptianPhone } from "@/lib/validations/payment";

const INSTAPAY_NUMBER = "01014302142";
const WEPAY_NUMBER = "01555952142";

// ============================================
// Icons
// ============================================
const Icons = {
    back: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    ),
    star: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    ),
    clock: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    creditCard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    users: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    loading: (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    ),
    instapay: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    wallet: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    copy: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    upload: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
    ),
    trash: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
};

// ============================================
// Helper Functions
// ============================================
const getInitials = (name: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatWaitTime = (minutes: number, isRTL: boolean = true): string => {
    if (minutes === 0) return isRTL ? "متاح الآن" : "Available now";
    if (minutes < 60) return isRTL ? `~${minutes} دقيقة انتظار` : `~${minutes} min wait`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return isRTL ? `~${hours} س و ${mins} د` : `~${hours}h ${mins}m`;
};

// ============================================
// Main Page Component
// ============================================
export default function PaymentPage() {
    const router = useRouter();
    const params = useParams();
    const { isRTL, language } = useI18n();
    const { isDark } = useGlobalTheme();

    const doctorId = params.doctorId as string;

    const [doctor, setDoctor] = useState<OnlineDoctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chiefComplaint, setChiefComplaint] = useState("");

    // Payment method state
    const [paymentMethod, setPaymentMethod] = useState<"instapay" | "wepay">("instapay");
    const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

    // Sender verification fields
    const [senderName, setSenderName] = useState("");
    const [senderPhone, setSenderPhone] = useState("");
    const [nameTouched, setNameTouched] = useState(false);
    const [phoneTouched, setPhoneTouched] = useState(false);

    // Receipt upload state
    const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
    const [receiptFileName, setReceiptFileName] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Service fee (platform fee)
    const serviceFee = 10; // EGP
    const totalAmount = doctor ? doctor.consultation_fee + serviceFee : 0;

    // Validation checks
    const isNameValid = isValidFullName(senderName);
    const isPhoneValid = isValidEgyptianPhone(senderPhone);
    const canSubmit = Boolean(receiptBase64 && isNameValid && isPhoneValid);

    // Load doctor details
    useEffect(() => {
        const loadDoctor = async () => {
            setLoading(true);
            try {
                const result = await getOnlineDoctors();
                if (result.doctors) {
                    const foundDoctor = result.doctors.find(d => d.id === doctorId);
                    if (foundDoctor) {
                        setDoctor(foundDoctor);
                    } else {
                        setError(isRTL ? "الطبيب غير متاح حالياً" : "Doctor not available");
                    }
                }
            } catch (err) {
                console.error("Error loading doctor:", err);
                setError(isRTL ? "حدث خطأ في تحميل البيانات" : "Error loading doctor data");
            } finally {
                setLoading(false);
            }
        };

        loadDoctor();
    }, [doctorId, isRTL]);

    // Copy phone number
    const handleCopy = (number: string) => {
        navigator.clipboard.writeText(number);
        setCopiedNumber(number);
        setTimeout(() => setCopiedNumber(null), 2500);
    };

    // Handle receipt file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            setError(isRTL ? "يرجى رفع صورة بصيغة JPG أو PNG أو WebP فقط" : "Please upload a valid JPG, PNG, or WebP image");
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            setError(isRTL ? "حجم الصورة كبير جداً، الحد الأقصى 8 ميجابايت" : "Image size is too large (max 8MB)");
            return;
        }

        setError(null);
        setReceiptFileName(file.name);

        const reader = new FileReader();
        reader.onload = () => {
            setReceiptBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setReceiptBase64(null);
        setReceiptFileName("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Submit payment & join queue
    const handleCompletePayment = async () => {
        if (!doctor) return;

        setNameTouched(true);
        setPhoneTouched(true);

        if (!receiptBase64) {
            setError(
                isRTL
                    ? "يرجى إرفاق صورة إيصال الدفع أو لقطة شاشة التحويل لتأكيد الحجز"
                    : "Please upload the payment receipt screenshot to confirm"
            );
            return;
        }

        if (!isNameValid) {
            setError(
                isRTL
                    ? "يرجى كتابة اسم ثنائي أو ثلاثي صحيح لصاحب الحساب المحوّل منه (حروف فقط بدون أرقام أو رموز)"
                    : "Please enter a valid full name (letters only, at least 2 words)"
            );
            return;
        }

        if (!isPhoneValid) {
            setError(
                isRTL
                    ? "يرجى إدخال رقم هاتف محمول مصري صحيح مكون من 11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015"
                    : "Please enter a valid 11-digit Egyptian mobile number starting with 010, 011, 012, or 015"
            );
            return;
        }

        setProcessing(true);
        setError(null);

        const targetPhone = paymentMethod === "instapay" ? INSTAPAY_NUMBER : WEPAY_NUMBER;

        try {
            const result = await submitUrgentCareManualPayment({
                doctorProfileId: doctor.id,
                chiefComplaint: chiefComplaint.trim() || undefined,
                method: paymentMethod,
                targetPhone,
                senderName: senderName.trim(),
                senderPhone: senderPhone.trim(),
                receiptBase64,
                receiptFileName: receiptFileName || `urgent-receipt-${Date.now()}.png`,
            });

            if (result.success && result.queueEntryId) {
                router.push(`/${language}/dashboard/patient/urgent-care/waiting/${result.queueEntryId}`);
            } else {
                setError(result.error || (isRTL ? "حدث خطأ في تأكيد الدفع، يرجى المحاولة مرة أخرى" : "An error occurred"));
            }
        } catch (err: unknown) {
            console.error("Error completing urgent care payment:", err);
            const errMessage = err instanceof Error ? err.message : "";
            setError(errMessage || (isRTL ? "حدث خطأ في المعالجة" : "Error processing payment"));
        } finally {
            setProcessing(false);
        }
    };

    // Handle back navigation
    const handleBack = () => {
        router.push(`/${language}/dashboard/patient/urgent-care`);
    };

    // Loading state
    if (loading) {
        return (
            <div className={cn("min-h-screen p-4 sm:p-6 flex items-center justify-center", isRTL && "rtl")}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#FD614B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                        {isRTL ? "جاري التحميل..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    // Error state (doctor not found or offline)
    if (!doctor) {
        return (
            <div className={cn("min-h-screen p-4 sm:p-6 max-w-full overflow-x-hidden", isRTL && "rtl")}>
                <button
                    onClick={handleBack}
                    className={cn(
                        "flex items-center gap-2 mb-8 transition-colors",
                        isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                    )}
                >
                    <span className={cn(isRTL && "rotate-180")}>{Icons.back}</span>
                    <span>{isRTL ? "العودة" : "Back"}</span>
                </button>

                <div className="max-w-md mx-auto text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h2 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                        {isRTL ? "الطبيب غير متاح" : "Doctor Not Available"}
                    </h2>
                    <p className={cn("mb-6", isDark ? "text-slate-400" : "text-slate-600")}>
                        {error || (isRTL ? "الطبيب غير متصل حالياً" : "This doctor is currently offline")}
                    </p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-[#FD614B] text-white rounded-lg font-medium hover:bg-[#E84D37] transition-colors shadow-sm"
                    >
                        {isRTL ? "اختر طبيباً آخر" : "Choose Another Doctor"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen p-4 sm:p-6", isRTL && "rtl")}>
            {/* Back Button */}
            <button
                onClick={handleBack}
                className={cn(
                    "flex items-center gap-2 mb-6 sm:mb-8 transition-colors",
                    isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                )}
            >
                <span className={cn(isRTL && "rotate-180")}>{Icons.back}</span>
                <span>{isRTL ? "العودة" : "Back"}</span>
            </button>

            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className={cn("text-2xl sm:text-3xl font-bold mb-2", isDark ? "text-white" : "text-slate-900")}>
                        {isRTL ? "تأكيد الدفع للاستشارة العاجلة" : "Confirm Urgent Care Payment"}
                    </h1>
                    <p className={cn("text-sm sm:text-base", isDark ? "text-slate-400" : "text-slate-600")}>
                        {isRTL
                            ? "ادفع الرسوم عبر إنستا باي أو وي باي وارفع إيصال السداد للانضمام فوراً لقائمة الطبيب"
                            : "Transfer the fee via InstaPay or WE Pay and upload your receipt to join the queue"}
                    </p>
                </div>

                {/* Doctor Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "rounded-2xl p-4 sm:p-6 mb-6 border",
                        isDark ? "bg-[#0D2C4F]/50 border-white/10" : "bg-white border-slate-200 shadow-sm"
                    )}
                >
                    <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                            {doctor.avatar_url ? (
                                <Image
                                    src={doctor.avatar_url}
                                    alt={doctor.full_name}
                                    width={72}
                                    height={72}
                                    className="w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-full bg-gradient-to-br from-[#044C87] to-[#FD614B] flex items-center justify-center text-white font-semibold text-lg sm:text-xl">
                                    {getInitials(doctor.full_name)}
                                </div>
                            )}
                            <div className={cn(
                                "absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 bg-green-500",
                                isDark ? "border-[#044C87]/30" : "border-white"
                            )} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className={cn("font-semibold text-base sm:text-lg truncate", isDark ? "text-white" : "text-slate-900")}>
                                {doctor.full_name}
                            </h3>
                            <p className={cn("text-sm truncate", isDark ? "text-slate-400" : "text-slate-600")}>
                                {doctor.specialty.length > 0 ? doctor.specialty.join(", ") : "General Practice"}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-sm">
                                <div className="flex items-center gap-1 text-[#FD614B] font-medium">
                                    {Icons.star}
                                    <span>{doctor.rating_average.toFixed(1)}</span>
                                    <span className={isDark ? "text-slate-500" : "text-slate-400"}>({doctor.rating_count})</span>
                                </div>
                                <div className={cn("flex items-center gap-1", isDark ? "text-slate-400" : "text-slate-500")}>
                                    {Icons.clock}
                                    <span>{formatWaitTime(doctor.estimated_wait_minutes, isRTL)}</span>
                                </div>
                                {doctor.queue_length > 0 && (
                                    <div className={cn("flex items-center gap-1", isDark ? "text-slate-400" : "text-slate-600")}>
                                        {Icons.users}
                                        <span>{doctor.queue_length} {isRTL ? "ينتظرون" : "waiting"}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Chief Complaint Input */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                        "rounded-2xl p-4 sm:p-6 mb-6 border",
                        isDark ? "bg-[#0D2C4F]/50 border-white/10" : "bg-white border-slate-200 shadow-sm"
                    )}
                >
                    <label className={cn("block font-semibold mb-2 text-sm", isDark ? "text-white" : "text-slate-900")}>
                        {isRTL ? "ما هي شكواك الرئيسية؟" : "What's your chief complaint?"}
                        <span className={cn("text-xs font-normal ms-2", isDark ? "text-slate-500" : "text-slate-400")}>
                            ({isRTL ? "اختياري" : "Optional"})
                        </span>
                    </label>
                    <textarea
                        value={chiefComplaint}
                        onChange={(e) => setChiefComplaint(e.target.value)}
                        placeholder={isRTL ? "صف مشكلتك الصحية بإيجاز لطبيب الطوارئ..." : "Briefly describe your health concern..."}
                        className={cn(
                            "w-full rounded-xl p-3.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#044C87]/50 border transition-colors",
                            isDark
                                ? "bg-[#08213D]/50 border-white/10 text-white placeholder-slate-500"
                                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                        )}
                        rows={2}
                        maxLength={500}
                    />
                </motion.div>

                {/* Payment Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={cn(
                        "rounded-2xl p-4 sm:p-6 mb-6 border",
                        isDark ? "bg-[#0D2C4F]/50 border-white/10" : "bg-white border-slate-200 shadow-sm"
                    )}
                >
                    <h3 className={cn("font-bold mb-3 flex items-center gap-2 text-sm", isDark ? "text-white" : "text-slate-900")}>
                        {Icons.creditCard}
                        {isRTL ? "ملخص الرسوم" : "Payment Summary"}
                    </h3>

                    <div className="space-y-2.5 text-sm">
                        <div className={cn("flex justify-between", isDark ? "text-slate-400" : "text-slate-600")}>
                            <span>{isRTL ? "رسوم استشارة الطوارئ" : "Urgent Care Fee"}</span>
                            <span className="font-medium">{doctor.consultation_fee} EGP</span>
                        </div>
                        <div className={cn("flex justify-between", isDark ? "text-slate-400" : "text-slate-600")}>
                            <span>{isRTL ? "رسوم الخدمة" : "Service Fee"}</span>
                            <span className="font-medium">{serviceFee} EGP</span>
                        </div>
                        <div className={cn("border-t pt-2.5 flex justify-between font-bold text-base", isDark ? "border-white/10 text-white" : "border-slate-200 text-slate-900")}>
                            <span>{isRTL ? "الإجمالي المطلوب تحويله" : "Total to Transfer"}</span>
                            <span className="text-[#FD614B] font-black text-lg">{totalAmount} EGP</span>
                        </div>
                    </div>
                </motion.div>

                {/* Transfer Methods & Receipt Upload */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn(
                        "rounded-2xl p-4 sm:p-6 mb-6 border",
                        isDark ? "bg-[#0D2C4F]/50 border-white/10" : "bg-white border-slate-200 shadow-sm"
                    )}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={cn("font-bold text-sm", isDark ? "text-white" : "text-slate-900")}>
                            {isRTL ? "طرق الدفع المتاحة" : "Available Transfer Methods"}
                        </h3>
                        <span className="text-xs bg-[#FD614B]/15 text-[#FD614B] font-semibold px-2.5 py-1 rounded-full border border-[#FD614B]/30">
                            {isRTL ? "تحويل مباشر" : "Direct Transfer"}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {/* InstaPay */}
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("instapay")}
                            className={cn(
                                "flex flex-col p-3.5 rounded-xl border text-start transition-all relative",
                                paymentMethod === "instapay"
                                    ? "border-[#FD614B] bg-[#FD614B]/10 shadow-[0_0_15px_rgba(253,97,75,0.25)] ring-1 ring-[#FD614B]"
                                    : isDark
                                        ? "border-white/10 bg-white/5 hover:border-white/20"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                            )}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-xs text-[#FD614B] flex items-center gap-1.5">
                                    {Icons.instapay}
                                    {isRTL ? "إنستا باي (InstaPay)" : "InstaPay"}
                                </span>
                                {paymentMethod === "instapay" && (
                                    <span className="text-[#FD614B]">{Icons.check}</span>
                                )}
                            </div>
                            <span className={cn("text-[11px] mb-0.5", isDark ? "text-gray-400" : "text-gray-600")}>
                                {isRTL ? "متاح على رقم:" : "Available on:"}
                            </span>
                            <span className={cn("font-mono font-bold text-base tracking-wider", isDark ? "text-white" : "text-slate-900")}>
                                {INSTAPAY_NUMBER}
                            </span>
                        </button>

                        {/* WE Pay */}
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("wepay")}
                            className={cn(
                                "flex flex-col p-3.5 rounded-xl border text-start transition-all relative",
                                paymentMethod === "wepay"
                                    ? "border-[#0C67B3] bg-[#0C67B3]/10 shadow-[0_0_15px_rgba(12,103,179,0.25)] ring-1 ring-[#0C67B3]"
                                    : isDark
                                        ? "border-white/10 bg-white/5 hover:border-white/20"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                            )}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-xs text-[#0C67B3] flex items-center gap-1.5">
                                    {Icons.wallet}
                                    {isRTL ? "محفظة وي باي (WE Pay)" : "WE Pay Wallet"}
                                </span>
                                {paymentMethod === "wepay" && (
                                    <span className="text-[#0C67B3]">{Icons.check}</span>
                                )}
                            </div>
                            <span className={cn("text-[11px] mb-0.5", isDark ? "text-gray-400" : "text-gray-600")}>
                                {isRTL ? "متاح على رقم:" : "Available on:"}
                            </span>
                            <span className={cn("font-mono font-bold text-base tracking-wider", isDark ? "text-white" : "text-slate-900")}>
                                {WEPAY_NUMBER}
                            </span>
                        </button>
                    </div>

                    {/* Step Instructions */}
                    <div className={cn(
                        "p-3.5 rounded-xl border mb-5 text-xs space-y-1.5 leading-relaxed",
                        paymentMethod === "instapay"
                            ? isDark ? "bg-[#FD614B]/5 border-[#FD614B]/20" : "bg-orange-50/60 border-orange-200"
                            : isDark ? "bg-[#0C67B3]/5 border-[#0C67B3]/20" : "bg-blue-50/60 border-blue-200"
                    )}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={cn("font-bold", paymentMethod === "instapay" ? "text-[#FD614B]" : "text-[#0C67B3]")}>
                                {paymentMethod === "instapay"
                                    ? (isRTL ? "تعليمات التحويل عبر إنستا باي" : "InstaPay Transfer Instructions")
                                    : (isRTL ? "تعليمات التحويل عبر محفظة وي باي" : "WE Pay Transfer Instructions")}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleCopy(paymentMethod === "instapay" ? INSTAPAY_NUMBER : WEPAY_NUMBER)}
                                className={cn(
                                    "flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all",
                                    copiedNumber === (paymentMethod === "instapay" ? INSTAPAY_NUMBER : WEPAY_NUMBER)
                                        ? "bg-emerald-500 text-white"
                                        : "bg-white/10 hover:bg-white/20 text-current border border-white/20"
                                )}
                            >
                                {copiedNumber === (paymentMethod === "instapay" ? INSTAPAY_NUMBER : WEPAY_NUMBER) ? (
                                    <>
                                        {Icons.check}
                                        <span>{isRTL ? "تم النسخ!" : "Copied!"}</span>
                                    </>
                                ) : (
                                    <>
                                        {Icons.copy}
                                        <span>{isRTL ? "نسخ الرقم" : "Copy"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                            {isRTL ? (
                                <>1. حوّل المبلغ المحدد (<strong className="text-[#FD614B]">{totalAmount} ج.م</strong>) إلى الرقم: <span className="font-mono font-bold underline">{paymentMethod === "instapay" ? INSTAPAY_NUMBER : WEPAY_NUMBER}</span></>
                            ) : (
                                <>1. Transfer the exact amount (<strong className="text-[#FD614B]">{totalAmount} EGP</strong>) to: <span className="font-mono font-bold underline">{paymentMethod === "instapay" ? INSTAPAY_NUMBER : WEPAY_NUMBER}</span></>
                            )}
                        </p>
                        <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                            {isRTL
                                ? "2. التقط لقطة شاشة لإشعار تأكيد التحويل الناجح."
                                : "2. Take a screenshot of the successful transfer confirmation."}
                        </p>
                        <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                            {isRTL
                                ? "3. ارفع الصورة واكتب اسمك ورقم هاتفك واضغط زر الدخول لقائمة الانتظار."
                                : "3. Upload the receipt screenshot, enter your name & phone number, and click join queue."}
                        </p>
                    </div>

                    {/* Receipt Upload */}
                    <div className="mb-4">
                        <label className={cn("block text-xs font-semibold mb-2", isDark ? "text-gray-300" : "text-slate-800")}>
                            {isRTL ? "صورة إيصال التحويل (مطلوبة) *" : "Payment Receipt Screenshot (Required) *"}
                        </label>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {receiptBase64 ? (
                            <div className={cn("p-3 rounded-xl border flex items-center gap-3", isDark ? "border-emerald-500/40 bg-emerald-500/10" : "border-emerald-300 bg-emerald-50")}>
                                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-500/30 flex-shrink-0 bg-black/20">
                                    <Image
                                        src={receiptBase64}
                                        alt="Receipt preview"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-xs font-semibold truncate", isDark ? "text-white" : "text-slate-900")}>
                                        {receiptFileName || "receipt.png"}
                                    </p>
                                    <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1 mt-0.5">
                                        {Icons.check}
                                        {isRTL ? "تم إرفاق الإيصال بنجاح" : "Receipt attached"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    {Icons.trash}
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2",
                                    isDark
                                        ? "border-white/15 bg-white/5 hover:border-[#FD614B]/60 hover:bg-[#FD614B]/5"
                                        : "border-slate-300 bg-slate-50 hover:border-[#FD614B] hover:bg-orange-50/30"
                                )}
                            >
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", isDark ? "bg-[#FD614B]/15 text-[#FD614B]" : "bg-orange-100 text-[#FD614B]")}>
                                    {Icons.upload}
                                </div>
                                <div className="text-center">
                                    <p className={cn("text-xs font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                        {isRTL ? "اضغط هنا لرفع صورة إيصال التحويل" : "Click to upload transfer receipt"}
                                    </p>
                                    <p className={cn("text-[11px] mt-0.5", isDark ? "text-gray-400" : "text-gray-500")}>
                                        {isRTL ? "يدعم JPG, PNG, WebP (بحد أقصى 8 ميجابايت)" : "Supports JPG, PNG, WebP (max 8MB)"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sender Details Fields with Strict Validation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                        <div>
                            <label className={cn("block text-xs font-semibold mb-1.5", isDark ? "text-gray-300" : "text-slate-800")}>
                                {isRTL ? "اسم صاحب الحساب المحوّل منه (مطلوب) *" : "Sender Full Name (Required) *"}
                            </label>
                            <input
                                type="text"
                                value={senderName}
                                onBlur={() => setNameTouched(true)}
                                onChange={(e) => {
                                    setSenderName(e.target.value);
                                    if (!nameTouched) setNameTouched(true);
                                }}
                                placeholder={isRTL ? "مثال: محمد أحمد علي" : "e.g. Mohamed Ahmed"}
                                className={cn(
                                    "w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors",
                                    nameTouched && !isNameValid
                                        ? "border-red-500 bg-red-500/5 focus:border-red-500 text-red-500 placeholder-red-300"
                                        : isDark
                                            ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#FD614B]/60"
                                            : "bg-white border-slate-200 text-slate-900 placeholder-gray-400 focus:border-[#FD614B]"
                                )}
                            />
                            {nameTouched && !isNameValid && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {isRTL ? "يرجى كتابة اسم ثنائي أو ثلاثي صحيح (حروف فقط بدون أرقام أو رموز)" : "Please enter a valid full name (letters only, min 2 words)"}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={cn("block text-xs font-semibold mb-1.5", isDark ? "text-gray-300" : "text-slate-800")}>
                                {isRTL ? "رقم الهاتف المحوّل منه (مطلوب) *" : "Sender Phone Number (Required) *"}
                            </label>
                            <input
                                type="tel"
                                value={senderPhone}
                                onBlur={() => setPhoneTouched(true)}
                                onChange={(e) => {
                                    setSenderPhone(e.target.value);
                                    if (!phoneTouched) setPhoneTouched(true);
                                }}
                                placeholder="01xxxxxxxxx"
                                className={cn(
                                    "w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors font-mono",
                                    phoneTouched && !isPhoneValid
                                        ? "border-red-500 bg-red-500/5 focus:border-red-500 text-red-500 placeholder-red-300"
                                        : isDark
                                            ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#FD614B]/60"
                                            : "bg-white border-slate-200 text-slate-900 placeholder-gray-400 focus:border-[#FD614B]"
                                )}
                            />
                            {phoneTouched && !isPhoneValid && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {isRTL ? "يرجى إدخال رقم هاتف مصري صحيح (11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015)" : "Valid 11-digit Egyptian phone starting with 010, 011, 012, or 015 required"}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-2 text-red-500 text-sm font-medium"
                    >
                        <span>{Icons.warning}</span>
                        <p>{error}</p>
                    </motion.div>
                )}

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <button
                        onClick={handleBack}
                        disabled={processing}
                        className={cn(
                            "flex-1 px-6 py-3.5 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm",
                            isDark ? "bg-[#0D2C4F] text-white hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                        )}
                    >
                        {isRTL ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                        onClick={handleCompletePayment}
                        disabled={processing || !canSubmit}
                        className={cn(
                            "flex-1 px-6 py-3.5 rounded-xl font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg text-sm text-white",
                            processing || !canSubmit
                                ? "bg-gray-500/60 cursor-not-allowed"
                                : "bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 shadow-[#FD614B]/30"
                        )}
                    >
                        {processing ? (
                            <>
                                {Icons.loading}
                                <span>{isRTL ? "جاري رفع الإيصال والانضمام للقائمة..." : "Submitting..."}</span>
                            </>
                        ) : (
                            <>
                                {Icons.check}
                                <span>
                                    {isRTL
                                        ? `تأكيد الدفع والدخول لقائمة الانتظار (${totalAmount} ج.م)`
                                        : `Confirm Payment & Join Queue (${totalAmount} EGP)`}
                                </span>
                            </>
                        )}
                    </button>
                </motion.div>

                {!canSubmit && (
                    <p className={cn("text-center text-xs mt-3", isDark ? "text-slate-400" : "text-slate-500")}>
                        {isRTL
                            ? "💡 يرجى إرفاق صورة إيصال التحويل، وكتابة اسم المحوّل ورقم هاتفه بشكل صحيح لتأكيد الدخول لقائمة الانتظار"
                            : "💡 Please upload your receipt and enter valid sender name and phone to join queue"}
                    </p>
                )}
            </div>
        </div>
    );
}
