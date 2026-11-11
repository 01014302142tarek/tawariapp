"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { GlowingCard } from "@/components/ui/glowing-card";
import { initiateAppointmentPayment, submitManualTransferPayment } from "@/app/actions/payments";
import { getAppointmentById } from "@/app/actions/appointments";
import { isValidFullName, isValidEgyptianPhone } from "@/lib/validations/payment";
import { compressImageFile } from "@/lib/utils/image-compression";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "../dashboard/patient/context/ThemeContext";

// Target accounts specified by the user
const INSTAPAY_NUMBER = "01014302142";
const WEPAY_NUMBER = "01555952142";

// Icons
const Icons = {
    card: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    ),
    wallet: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    instapay: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    lock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    ),
    doctor: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    clock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    warning: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    back: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    ),
    copy: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    upload: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
    ),
    trash: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    sparkles: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" />
        </svg>
    ),
};

type PaymentMethodType = "instapay" | "wepay" | "card";

interface AppointmentDetails {
    id: string;
    doctorName: string;
    specialty: string;
    scheduledStart: string;
    consultationFee: number;
}

function CheckoutPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isRTL, language } = useI18n();
    const { isDark } = useTheme();

    const appointmentId = searchParams.get("appointment");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("instapay");

    // Transfer fields
    const [senderName, setSenderName] = useState("");
    const [senderPhone, setSenderPhone] = useState("");
    const [nameTouched, setNameTouched] = useState(false);
    const [phoneTouched, setPhoneTouched] = useState(false);
    const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
    const [receiptFileName, setReceiptFileName] = useState<string>("");
    const [isCompressing, setIsCompressing] = useState(false);
    const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
    const [successBooking, setSuccessBooking] = useState(false);
    const [paymentApprovalStatus, setPaymentApprovalStatus] = useState<"pending" | "approved" | "rejected">("pending");
    const [paymentRejectionReason, setPaymentRejectionReason] = useState<string | null>(null);

    // Poll appointment approval status after receipt submission
    useEffect(() => {
        if (!successBooking || !appointment?.id) return;

        let isMounted = true;
        const checkApproval = async () => {
            try {
                const res = await getAppointmentById(appointment.id);
                if (!isMounted || !res.appointment) return;
                const status = res.appointment.paymentApproval || "approved";
                setPaymentApprovalStatus(status);
                if (res.appointment.paymentRejectionReason) {
                    setPaymentRejectionReason(res.appointment.paymentRejectionReason);
                }
            } catch (err) {
                console.error("Error polling approval:", err);
            }
        };

        checkApproval();
        const interval = setInterval(checkApproval, 2500);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [successBooking, appointment?.id]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load appointment details
    useEffect(() => {
        async function loadAppointment() {
            if (!appointmentId) {
                setError(isRTL ? "لم يتم تحديد موعد للدفع" : "No appointment specified");
                setLoading(false);
                return;
            }

            const supabase = createClient();

            // Get appointment with doctor info
            const { data: appointmentData, error: fetchError } = await supabase
                .from("appointments")
                .select(`
                    id,
                    scheduled_start,
                    consultation_fee,
                    doctor_profile_id
                `)
                .eq("id", appointmentId)
                .single();

            if (fetchError || !appointmentData) {
                setError(isRTL ? "لم يتم العثور على الموعد" : "Appointment not found");
                setLoading(false);
                return;
            }

            const appointment = appointmentData as {
                id: string;
                scheduled_start: string;
                consultation_fee: number;
                doctor_profile_id: string;
            };

            // Get doctor info
            const { data: doctorProfile } = await supabase
                .from("doctor_profiles")
                .select("profile_id")
                .eq("id", appointment.doctor_profile_id)
                .single();

            let doctorName = isRTL ? "طبيب متخصص" : "Doctor";
            if (doctorProfile) {
                const { data: doctor } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", (doctorProfile as { profile_id: string }).profile_id)
                    .single();

                if (doctor) {
                    doctorName = (doctor as { full_name: string }).full_name;
                }
            }

            // Get specialty
            const { data: specialization } = await supabase
                .from("doctor_specializations")
                .select("specialization:specializations(name_en, name_ar)")
                .eq("doctor_profile_id", appointment.doctor_profile_id)
                .eq("is_primary", true)
                .single();

            let specialty = isRTL ? "استشارة طبية" : "Medical Consultation";
            if (specialization) {
                const specData = specialization as { specialization: { name_en: string; name_ar: string } | null };
                if (specData.specialization) {
                    specialty = isRTL ? specData.specialization.name_ar : specData.specialization.name_en;
                }
            }

            setAppointment({
                id: appointment.id,
                doctorName,
                specialty,
                scheduledStart: appointment.scheduled_start,
                consultationFee: appointment.consultation_fee,
            });
            setLoading(false);
        }

        loadAppointment();
    }, [appointmentId, isRTL]);

    // Handle copying phone number to clipboard
    const handleCopy = (number: string) => {
        navigator.clipboard.writeText(number);
        setCopiedNumber(number);
        setTimeout(() => {
            setCopiedNumber(null);
        }, 2500);
    };

    // Handle file selection with client compression
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            setError(isRTL ? "يرجى رفع صورة بصيغة JPG أو PNG أو WebP فقط" : "Please upload a valid JPG, PNG, or WebP image");
            return;
        }

        // Validate size (max 15MB)
        if (file.size > 15 * 1024 * 1024) {
            setError(isRTL ? "حجم الصورة كبير جداً، الحد الأقصى 15 ميجابايت" : "Image size is too large (max 15MB)");
            return;
        }

        setError(null);
        setIsCompressing(true);

        try {
            const compressed = await compressImageFile(file, 1600, 0.82);
            setReceiptBase64(compressed.base64);
            setReceiptFileName(compressed.fileName);
        } catch (compErr) {
            console.warn("Client compression failed, falling back to FileReader:", compErr);
            const reader = new FileReader();
            reader.onload = () => {
                setReceiptBase64(reader.result as string);
                setReceiptFileName(file.name);
            };
            reader.readAsDataURL(file);
        } finally {
            setIsCompressing(false);
        }
    };

    // Handle removing uploaded image
    const handleRemoveImage = () => {
        setReceiptBase64(null);
        setReceiptFileName("");
        setIsCompressing(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Validation state
    const isNameValid = isValidFullName(senderName);
    const isPhoneValid = isValidEgyptianPhone(senderPhone);
    const canSubmit = Boolean(receiptBase64 && isNameValid && isPhoneValid && !isCompressing);

    // Submit manual transfer payment (InstaPay or WE Pay)
    const handleManualSubmit = async () => {
        if (!appointment) return;

        if (isCompressing) {
            setError(
                isRTL
                    ? "جاري تجهيز وضغط صورة الإيصال، يرجى الانتظار ثانية..."
                    : "Processing image receipt, please wait a moment..."
            );
            return;
        }

        setNameTouched(true);
        setPhoneTouched(true);

        if (!receiptBase64) {
            setError(
                isRTL
                    ? "يرجى إرفاق صورة إيصال الدفع أو لقطة شاشة التحويل لتأكيد الحجز"
                    : "Please upload the payment receipt screenshot to confirm your booking"
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

        const targetPhone = paymentMethod === "instapay" ? INSTAPAY_NUMBER : WEPAY_NUMBER;

        setSubmitting(true);
        setError(null);

        try {
            const res = await submitManualTransferPayment({
                appointmentId: appointment.id,
                method: paymentMethod as "instapay" | "wepay",
                targetPhone,
                senderName: senderName.trim(),
                senderPhone: senderPhone.trim(),
                receiptBase64,
                receiptFileName: receiptFileName || `receipt-${Date.now()}.png`,
            });

            if (res.success) {
                setSuccessBooking(true);
            } else {
                setError(res.error || (isRTL ? "فشل تأكيد عملية الدفع" : "Failed to confirm payment"));
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("Manual payment error:", message);
            setError(isRTL ? "حدث خطأ غير متوقع أثناء إرسال الإيصال" : "An unexpected error occurred while submitting receipt");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle legacy card payment fallback
    const handleCardPayment = async () => {
        if (!appointment) return;

        setSubmitting(true);
        setError(null);

        try {
            const result = await initiateAppointmentPayment(appointment.id);
            if (result.success && result.paymentUrl) {
                window.location.href = result.paymentUrl;
            } else {
                setError(result.error || (isRTL ? "فشل في بدء الدفع بالبطاقة" : "Failed to initiate card payment"));
            }
        } catch (err) {
            console.error("Payment error:", err);
            setError(isRTL ? "حدث خطأ أثناء الاتصال ببوابة الدفع" : "An error occurred with payment gateway");
        } finally {
            setSubmitting(false);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className={cn("min-h-screen flex items-center justify-center", isDark ? "bg-[#031326]" : "bg-[#F4F8FC]")}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#FD614B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className={cn("text-lg", isDark ? "text-[#FEFDFE]" : "text-slate-900")}>
                        {isRTL ? "جاري تحميل تفاصيل الدفع..." : "Loading payment details..."}
                    </p>
                </div>
            </div>
        );
    }

    // Success Screen after uploading receipt - with Live Status & Polling
    if (successBooking) {
        return (
            <div className={cn("min-h-screen flex items-center justify-center p-4", isDark ? "bg-[#031326]" : "bg-[#F4F8FC]")}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full"
                >
                    {paymentApprovalStatus === "approved" ? (
                        <GlowingCard glowColor="teal" className="p-8 text-center" isDark={isDark}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-5 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/30"
                            >
                                {Icons.check}
                            </motion.div>
                            <h2 className={cn("text-2xl font-bold mb-2", isDark ? "text-white" : "text-slate-900")}>
                                {isRTL ? "تم اعتماد الدفع وتأكيد الحجز! 🎉" : "Payment Approved & Confirmed! 🎉"}
                            </h2>
                            <p className={cn("text-sm mb-6 leading-relaxed", isDark ? "text-gray-300" : "text-gray-600")}>
                                {isRTL
                                    ? "تم التحقق من إيصال التحويل واعتماده بنجاح بواسطة الإدارة. موعدك الآن مؤكد وجاهز للدخول."
                                    : "Your transfer receipt has been verified and approved by administration. Your appointment is confirmed and ready."}
                            </p>

                            <div className={cn("p-4 rounded-xl mb-6 text-start space-y-2.5 border", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                                <div className="flex justify-between text-sm">
                                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>{isRTL ? "الطبيب:" : "Doctor:"}</span>
                                    <span className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>{appointment?.doctorName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>{isRTL ? "التخصص:" : "Specialty:"}</span>
                                    <span className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>{appointment?.specialty}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>{isRTL ? "طريقة الدفع:" : "Method:"}</span>
                                    <span className="font-semibold text-emerald-500 flex items-center gap-1">
                                        <span>✓</span>
                                        <span>{paymentMethod === "instapay" ? "إنستا باي (InstaPay)" : "محفظة وي باي (WE Pay)"}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => router.push(`/${language}/dashboard/consultation/${appointment?.id}/waiting-room`)}
                                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all font-bold text-sm"
                                >
                                    {isRTL ? "الانضمام إلى غرفة الانتظار / الاستشارة 📹" : "Enter Consultation Waiting Room 📹"}
                                </button>
                                <button
                                    onClick={() => router.push(`/${language}/dashboard/patient/appointments`)}
                                    className={cn(
                                        "w-full py-3 rounded-xl border transition-all text-sm font-medium",
                                        isDark ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-100"
                                    )}
                                >
                                    {isRTL ? "الانتقال إلى قائمة مواعيدي" : "View My Appointments"}
                                </button>
                            </div>
                        </GlowingCard>
                    ) : paymentApprovalStatus === "rejected" ? (
                        <GlowingCard glowColor="coral" className="p-8 text-center" isDark={isDark}>
                            <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-5 border-2 border-red-500/50 shadow-lg shadow-red-500/30">
                                {Icons.warning}
                            </div>
                            <h2 className={cn("text-2xl font-bold mb-2 text-red-500")}>
                                {isRTL ? "تعذر اعتماد إيصال الدفع ❌" : "Payment Receipt Rejected ❌"}
                            </h2>
                            <p className={cn("text-sm mb-4 leading-relaxed", isDark ? "text-gray-300" : "text-gray-600")}>
                                {isRTL
                                    ? "عذراً، لم تتمكن الإدارة من مطابقة أو اعتماد إيصال التحويل المرسل."
                                    : "Sorry, administration could not verify the submitted transfer receipt."}
                            </p>

                            {paymentRejectionReason && (
                                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 text-start mb-6">
                                    <span className="font-bold">{isRTL ? "سبب الرفض: " : "Reason: "}</span>
                                    {paymentRejectionReason}
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setSuccessBooking(false);
                                        setReceiptBase64(null);
                                        setReceiptFileName("");
                                        setPaymentApprovalStatus("pending");
                                    }}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white rounded-xl shadow-lg shadow-[#FD614B]/30 transition-all font-bold text-sm"
                                >
                                    {isRTL ? "إعادة رفع الإيصال والمحاولة مرة أخرى" : "Re-upload Receipt & Try Again"}
                                </button>
                                <button
                                    onClick={() => router.push(`/${language}/dashboard/patient`)}
                                    className={cn(
                                        "w-full py-3 rounded-xl border transition-all text-sm font-medium",
                                        isDark ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-100"
                                    )}
                                >
                                    {isRTL ? "العودة للوحة التحكم" : "Back to Dashboard"}
                                </button>
                            </div>
                        </GlowingCard>
                    ) : (
                        <GlowingCard glowColor="coral" className="p-8 text-center relative overflow-hidden" isDark={isDark}>
                            {/* Animated Pulse Radar */}
                            <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-[#FD614B]/40"
                                    animate={{ scale: [1, 1.8, 2.2], opacity: [0.6, 0.2, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                                />
                                <motion.div
                                    className="absolute inset-2 rounded-full border border-[#FD614B]/30"
                                    animate={{ scale: [1, 1.5, 1.9], opacity: [0.5, 0.15, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
                                />
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FD614B]/20 to-[#FD614B]/10 border-2 border-[#FD614B] flex items-center justify-center shadow-lg shadow-[#FD614B]/20">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        className="text-[#FD614B]"
                                    >
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Status Pill */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FD614B]/10 border border-[#FD614B]/30 mb-4">
                                <span className="w-2 h-2 rounded-full bg-[#FD614B] animate-ping" />
                                <span className="text-xs font-bold text-[#FD614B]">
                                    {isRTL ? "جاري مراجعة إيصال التحويل..." : "Verifying Payment Receipt..."}
                                </span>
                            </div>

                            <h2 className={cn("text-xl sm:text-2xl font-bold mb-2", isDark ? "text-white" : "text-slate-900")}>
                                {isRTL ? "يرجى الانتظار، جاري المراجعة" : "Please Wait, Verification in Progress"}
                            </h2>
                            <p className={cn("text-xs sm:text-sm mb-6 leading-relaxed", isDark ? "text-gray-300" : "text-gray-600")}>
                                {isRTL
                                    ? "تم استلام الإيصال وبيانات التحويل بنجاح، ويقوم فريق الإدارة بمراجعته حالياً. سيتم تحويلك وتأكيد الموعد تلقائياً فور الاعتماد."
                                    : "Your receipt has been submitted and is currently being reviewed by administration. Your appointment will be confirmed automatically upon approval."}
                            </p>

                            <div className={cn("p-4 rounded-xl mb-6 text-start space-y-2 border", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>{isRTL ? "الطبيب:" : "Doctor:"}</span>
                                    <span className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>{appointment?.doctorName}</span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>{isRTL ? "التخصص:" : "Specialty:"}</span>
                                    <span className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>{appointment?.specialty}</span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>{isRTL ? "طريقة التحويل:" : "Method:"}</span>
                                    <span className="font-semibold text-[#FD614B]">
                                        {paymentMethod === "instapay" ? "إنستا باي (InstaPay)" : "محفظة وي باي (WE Pay)"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>{isRTL ? "المبلغ المحوّل:" : "Amount:"}</span>
                                    <span className="font-bold text-[#FD614B]">{appointment?.consultationFee} ج.م</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => router.push(`/${language}/dashboard/patient/appointments`)}
                                    className="w-full py-3 bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white rounded-xl shadow-lg shadow-[#FD614B]/20 transition-all font-semibold text-xs sm:text-sm"
                                >
                                    {isRTL ? "الانتقال إلى قائمة مواعيدي" : "View My Appointments"}
                                </button>
                                <button
                                    onClick={() => router.push(`/${language}/dashboard/patient`)}
                                    className={cn(
                                        "w-full py-2.5 rounded-xl border transition-all text-xs sm:text-sm font-medium",
                                        isDark ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-100"
                                    )}
                                >
                                    {isRTL ? "العودة للوحة التحكم" : "Back to Dashboard"}
                                </button>
                            </div>
                        </GlowingCard>
                    )}
                </motion.div>
            </div>
        );
    }

    // Error state (no appointment)
    if (!appointment) {
        return (
            <div className={cn("min-h-screen flex items-center justify-center p-4", isDark ? "bg-[#031326]" : "bg-[#F4F8FC]")}>
                <div className="text-center max-w-md">
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", isDark ? "bg-[#FD614B]/20" : "bg-red-100")}>
                        <span className={cn(isDark ? "text-[#FD614B]" : "text-red-600")}>{Icons.warning}</span>
                    </div>
                    <h2 className={cn("text-xl font-semibold mb-2", isDark ? "text-[#FEFDFE]" : "text-slate-900")}>
                        {isRTL ? "خطأ" : "Error"}
                    </h2>
                    <p className={cn("mb-6", isDark ? "text-gray-400" : "text-gray-600")}>{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white rounded-xl shadow-lg shadow-[#FD614B]/30 transition-all font-semibold"
                    >
                        {isRTL ? "العودة" : "Go Back"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen py-8 px-4", isDark ? "bg-[#031326]" : "bg-[#F4F8FC]", isRTL && "rtl")}>
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className={cn("flex items-center gap-2 transition-colors mb-3 text-sm font-medium", isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}
                    >
                        <span className={isRTL ? "rotate-180" : ""}>{Icons.back}</span>
                        <span>{isRTL ? "العودة" : "Back"}</span>
                    </button>
                    <h1 className={cn("text-2xl font-bold tracking-tight", isDark ? "text-[#FEFDFE]" : "text-slate-900")}>
                        {isRTL ? "إتمام الدفع وتأكيد الحجز" : "Complete Payment & Confirm Booking"}
                    </h1>
                    <p className={cn("mt-1 text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                        {isRTL
                            ? "ادفع رسوم الاستشارة عبر إنستا باي أو وي باي وارفع إيصال التحويل لتأكيد موعدك فوراً"
                            : "Transfer the consultation fee via InstaPay or WE Pay and upload your receipt to confirm"}
                    </p>
                </div>

                {/* Appointment Summary */}
                <GlowingCard glowColor="blue" className="p-5 mb-6" isDark={isDark}>
                    <h3 className={cn("text-base font-semibold mb-3 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                        <span className="text-[#FD614B]">{Icons.doctor}</span>
                        {isRTL ? "تفاصيل الكشف والموعد" : "Appointment Details"}
                    </h3>

                    <div className="flex items-start gap-4 mb-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md bg-gradient-to-br from-[#044C87] to-[#0C67B3]")}>
                            {appointment.doctorName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={cn("font-bold text-base truncate", isDark ? "text-[#FEFDFE]" : "text-slate-900")}>{appointment.doctorName}</h4>
                            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{appointment.specialty}</p>
                        </div>
                        <div className="text-end">
                            <div className="text-xl font-black text-[#FD614B]">
                                {appointment.consultationFee.toFixed(0)} {isRTL ? "ج.م" : "EGP"}
                            </div>
                            <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                                {isRTL ? "رسوم الاستشارة" : "Consultation Fee"}
                            </span>
                        </div>
                    </div>

                    <div className={cn("grid grid-cols-2 gap-3 pt-3 border-t", isDark ? "border-white/10" : "border-gray-200")}>
                        <div className={cn("flex items-center gap-2 text-sm", isDark ? "text-gray-300" : "text-gray-700")}>
                            <span className="text-[#FD614B]">{Icons.calendar}</span>
                            <span className="truncate">{formatDate(appointment.scheduledStart)}</span>
                        </div>
                        <div className={cn("flex items-center gap-2 text-sm", isDark ? "text-gray-300" : "text-gray-700")}>
                            <span className="text-[#FD614B]">{Icons.clock}</span>
                            <span>{formatTime(appointment.scheduledStart)}</span>
                        </div>
                    </div>
                </GlowingCard>

                {/* Payment Method Selector */}
                <GlowingCard glowColor="coral" className="p-5 mb-6" isDark={isDark}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={cn("text-base font-bold", isDark ? "text-[#FEFDFE]" : "text-slate-900")}>
                            {isRTL ? "طرق الدفع المتاحة" : "Available Payment Methods"}
                        </h3>
                        <span className="text-xs bg-[#FD614B]/15 text-[#FD614B] font-semibold px-2.5 py-1 rounded-full border border-[#FD614B]/30">
                            {isRTL ? "تحويل مباشر" : "Direct Transfer"}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                        {/* InstaPay Option */}
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("instapay")}
                            className={cn(
                                "flex flex-col p-4 rounded-xl border text-start transition-all relative overflow-hidden",
                                paymentMethod === "instapay"
                                    ? "border-[#FD614B] bg-[#FD614B]/10 shadow-[0_0_15px_rgba(253,97,75,0.25)] ring-1 ring-[#FD614B]"
                                    : isDark
                                        ? "border-white/10 bg-white/5 hover:border-white/20"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-sm text-[#FD614B] flex items-center gap-1.5">
                                    {Icons.instapay}
                                    {isRTL ? "إنستا باي (InstaPay)" : "InstaPay"}
                                </span>
                                {paymentMethod === "instapay" && (
                                    <span className="text-[#FD614B]">{Icons.check}</span>
                                )}
                            </div>
                            <span className={cn("text-xs mb-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                {isRTL ? "متاح على رقم:" : "Available on:"}
                            </span>
                            <span className={cn("font-mono font-bold text-base tracking-wider", isDark ? "text-white" : "text-slate-900")}>
                                {INSTAPAY_NUMBER}
                            </span>
                        </button>

                        {/* WE Pay Option */}
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("wepay")}
                            className={cn(
                                "flex flex-col p-4 rounded-xl border text-start transition-all relative overflow-hidden",
                                paymentMethod === "wepay"
                                    ? "border-[#0C67B3] bg-[#0C67B3]/10 shadow-[0_0_15px_rgba(12,103,179,0.25)] ring-1 ring-[#0C67B3]"
                                    : isDark
                                        ? "border-white/10 bg-white/5 hover:border-white/20"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-sm text-[#0C67B3] flex items-center gap-1.5">
                                    {Icons.wallet}
                                    {isRTL ? "محفظة وي باي (WE Pay)" : "WE Pay Wallet"}
                                </span>
                                {paymentMethod === "wepay" && (
                                    <span className="text-[#0C67B3]">{Icons.check}</span>
                                )}
                            </div>
                            <span className={cn("text-xs mb-1", isDark ? "text-gray-400" : "text-gray-600")}>
                                {isRTL ? "متاح على رقم:" : "Available on:"}
                            </span>
                            <span className={cn("font-mono font-bold text-base tracking-wider", isDark ? "text-white" : "text-slate-900")}>
                                {WEPAY_NUMBER}
                            </span>
                        </button>
                    </div>

                    {/* Step-by-Step Payment Instructions */}
                    <div className={cn(
                        "p-4 rounded-xl border mb-5",
                        paymentMethod === "instapay"
                            ? isDark ? "bg-[#FD614B]/5 border-[#FD614B]/20" : "bg-orange-50/50 border-orange-200"
                            : isDark ? "bg-[#0C67B3]/5 border-[#0C67B3]/20" : "bg-blue-50/50 border-blue-200"
                    )}>
                        <div className="flex items-center justify-between mb-3">
                            <span className={cn("text-xs font-semibold uppercase tracking-wider", paymentMethod === "instapay" ? "text-[#FD614B]" : "text-[#0C67B3]")}>
                                {paymentMethod === "instapay"
                                    ? (isRTL ? "خطوات التحويل عبر إنستا باي" : "InstaPay Transfer Steps")
                                    : (isRTL ? "خطوات التحويل عبر محفظة وي باي" : "WE Pay Transfer Steps")}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleCopy(paymentMethod === "instapay" ? INSTAPAY_NUMBER : WEPAY_NUMBER)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all",
                                    copiedNumber === (paymentMethod === "instapay" ? INSTAPAY_NUMBER : WEPAY_NUMBER)
                                        ? "bg-emerald-500 text-white"
                                        : "bg-white/10 hover:bg-white/20 text-current border border-white/20"
                                )}
                            >
                                {copiedNumber === (paymentMethod === "instapay" ? INSTAPAY_NUMBER : WEPAY_NUMBER) ? (
                                    <>
                                        {Icons.check}
                                        <span>{isRTL ? "تم نسخ الرقم!" : "Copied!"}</span>
                                    </>
                                ) : (
                                    <>
                                        {Icons.copy}
                                        <span>{isRTL ? "نسخ الرقم" : "Copy Number"}</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="space-y-2 text-xs leading-relaxed">
                            <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                                <strong>1. </strong>
                                {paymentMethod === "instapay"
                                    ? (isRTL ? "افتح تطبيق إنستا باي (InstaPay) على هاتفك." : "Open the InstaPay app on your phone.")
                                    : (isRTL ? "افتح تطبيق محفظة وي باي (WE Pay) أو استخدم كود المحفظة." : "Open your WE Pay wallet app or USSD code.")}
                            </p>
                            <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                                <strong>2. </strong>
                                {isRTL
                                    ? `حوّل المبلغ المطلوب (${appointment.consultationFee.toFixed(0)} ج.م) إلى الرقم: `
                                    : `Transfer the exact amount (${appointment.consultationFee.toFixed(0)} EGP) to: `}
                                <span className="font-mono font-bold text-sm underline px-1 text-[#FD614B]">
                                    {paymentMethod === "instapay" ? INSTAPAY_NUMBER : WEPAY_NUMBER}
                                </span>
                            </p>
                            <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                                <strong>3. </strong>
                                {isRTL
                                    ? "التقط لقطة شاشة لإشعار تأكيد التحويل الناجح أو إيصال السداد."
                                    : "Take a screenshot of the successful transfer or transaction receipt."}
                            </p>
                            <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                                <strong>4. </strong>
                                {isRTL
                                    ? "ارفع صورة الإيصال في الخانة أدناه واضغط 'تأكيد الدفع وإتمام الحجز'."
                                    : "Upload the screenshot below and click 'Confirm Payment & Complete Booking'."}
                            </p>
                        </div>
                    </div>

                    {/* Receipt Image Upload Area */}
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

                        {isCompressing ? (
                            <div className={cn("p-4 rounded-xl border flex items-center justify-center gap-2.5", isDark ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-amber-300 bg-amber-50 text-amber-700")}>
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                <span className="text-xs font-semibold">
                                    {isRTL ? "جاري تحسين وضغط الصورة تمهيداً للإرسال السريع..." : "Optimizing image for fast upload..."}
                                </span>
                            </div>
                        ) : receiptBase64 ? (
                            <div className={cn("relative p-3 rounded-xl border flex items-center gap-3", isDark ? "border-emerald-500/40 bg-emerald-500/10" : "border-emerald-300 bg-emerald-50")}>
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-500/30 flex-shrink-0 bg-black/20">
                                    <Image
                                        src={receiptBase64}
                                        alt="Receipt preview"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-sm font-semibold truncate", isDark ? "text-white" : "text-slate-900")}>
                                        {receiptFileName || "receipt.jpg"}
                                    </p>
                                    <p className="text-xs text-emerald-500 font-medium flex items-center gap-1 mt-0.5">
                                        {Icons.check}
                                        {isRTL ? "تم تجهيز وإرفاق الصورة بنجاح" : "Receipt image ready to submit"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    title={isRTL ? "حذف الصورة" : "Remove receipt"}
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    {Icons.trash}
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2",
                                    isDark
                                        ? "border-white/15 bg-white/5 hover:border-[#FD614B]/60 hover:bg-[#FD614B]/5"
                                        : "border-slate-300 bg-slate-50 hover:border-[#FD614B] hover:bg-orange-50/30"
                                )}
                            >
                                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", isDark ? "bg-[#FD614B]/15 text-[#FD614B]" : "bg-orange-100 text-[#FD614B]")}>
                                    {Icons.upload}
                                </div>
                                <div className="text-center">
                                    <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                        {isRTL ? "اضغط هنا لرفع صورة إيصال التحويل" : "Click to upload transfer receipt"}
                                    </p>
                                    <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                                        {isRTL ? "يدعم JPG, PNG, WebP (يتم ضغطها تلقائياً لأقصى سرعة)" : "Supports JPG, PNG, WebP (auto-compressed)"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sender Details (Required for Verification) */}
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
                </GlowingCard>

                {/* Error Banner */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("mb-6 p-4 rounded-xl", isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200")}
                    >
                        <div className="flex gap-3 items-center">
                            <span className={cn(isDark ? "text-red-500" : "text-red-600")}>{Icons.warning}</span>
                            <p className={cn("text-sm font-medium", isDark ? "text-red-400" : "text-red-700")}>{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* Submit Action Button */}
                <motion.button
                    onClick={handleManualSubmit}
                    disabled={submitting || !canSubmit}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        "w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 text-base shadow-lg",
                        submitting || !canSubmit
                            ? "bg-gray-500/50 cursor-not-allowed opacity-70"
                            : "bg-gradient-to-r from-[#FD614B] via-[#E84D37] to-[#FD614B] hover:brightness-110 shadow-[#FD614B]/30"
                    )}
                >
                    {submitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{isRTL ? "جاري رفع الإيصال وتأكيد الحجز..." : "Submitting receipt & confirming..."}</span>
                        </>
                    ) : (
                        <>
                            <span>{Icons.check}</span>
                            <span>
                                {isRTL
                                    ? `تأكيد الدفع وإتمام الحجز (${appointment.consultationFee.toFixed(0)} ج.م)`
                                    : `Confirm Payment & Complete Booking (${appointment.consultationFee.toFixed(0)} EGP)`}
                            </span>
                        </>
                    )}
                </motion.button>

                {!canSubmit && (
                    <p className={cn("text-center text-xs mt-2.5", isDark ? "text-gray-400" : "text-gray-500")}>
                        {isRTL
                            ? "💡 يرجى رفع صورة إيصال التحويل، وكتابة اسم المحوّل ورقم هاتفه بشكل صحيح لتأكيد الحجز"
                            : "💡 Please upload the transfer receipt and enter valid sender name and phone to confirm booking"}
                    </p>
                )}

                {/* Alternative: Pay with Credit Card */}
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className={cn("text-xs mb-3", isDark ? "text-gray-400" : "text-gray-500")}>
                        {isRTL ? "أو يمكنك الدفع مباشرة بالبطاقة البنكية:" : "Or pay directly with debit/credit card:"}
                    </p>
                    <button
                        type="button"
                        onClick={handleCardPayment}
                        disabled={submitting}
                        className={cn(
                            "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-semibold transition-all",
                            isDark
                                ? "border-white/15 bg-white/5 text-gray-300 hover:bg-white/10"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        {Icons.card}
                        <span>{isRTL ? "الدفع بالفيزا / ماستركارد أونلاين" : "Pay with Visa / Mastercard"}</span>
                    </button>
                </div>

                {/* Security Note */}
                <p className={cn("text-center text-xs mt-6 flex items-center justify-center gap-1.5", isDark ? "text-gray-500" : "text-gray-500")}>
                    {Icons.lock}
                    <span>
                        {isRTL
                            ? "جميع التحويلات والبيانات مشفرة ومحمية بالكامل"
                            : "All transactions and data are fully encrypted and secure"}
                    </span>
                </p>
            </div>
        </div>
    );
}

// Loading fallback
function CheckoutLoading() {
    const { isDark } = useTheme();
    return (
        <div className={cn("min-h-screen flex items-center justify-center", isDark ? "bg-[#031326]" : "bg-[#F4F8FC]")}>
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#FD614B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className={cn("text-lg", isDark ? "text-[#FEFDFE]" : "text-slate-900")}>Loading...</p>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<CheckoutLoading />}>
            <CheckoutPageContent />
        </Suspense>
    );
}
