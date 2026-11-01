"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { GlowingCard } from "@/components/ui/glowing-card";
import { initiateAppointmentPayment } from "@/app/actions/payments";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "../dashboard/patient/context/ThemeContext";

// Icons
const Icons = {
    card: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    ),
    wallet: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
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
};

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
    const { isRTL } = useI18n();
    const { isDark } = useTheme();

    const appointmentId = searchParams.get("appointment");

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet">("card");

    // Load appointment details
    useEffect(() => {
        async function loadAppointment() {
            if (!appointmentId) {
                setError(isRTL ? "لم يتم تحديد موعد" : "No appointment specified");
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

            let doctorName = isRTL ? "طبيب" : "Doctor";
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

            let specialty = isRTL ? "طب عام" : "General Medicine";
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

    // Handle payment
    const handlePayment = async () => {
        if (!appointment) return;

        setProcessing(true);
        setError(null);

        try {
            const result = await initiateAppointmentPayment(appointment.id);

            if (result.success && result.paymentUrl) {
                // Redirect to Paymob payment page
                window.location.href = result.paymentUrl;
            } else {
                setError(result.error || (isRTL ? "فشل في بدء الدفع" : "Failed to initiate payment"));
            }
        } catch (err) {
            console.error("Payment error:", err);
            setError(isRTL ? "حدث خطأ أثناء الدفع" : "An error occurred during payment");
        } finally {
            setProcessing(false);
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
            <div className={cn("min-h-screen flex items-center justify-center", isDark ? "bg-slate-950" : "bg-gray-50")}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className={cn("text-lg", isDark ? "text-white" : "text-gray-900")}>
                        {isRTL ? "جاري التحميل..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    // Error state (no appointment)
    if (!appointment) {
        return (
            <div className={cn("min-h-screen flex items-center justify-center p-4", isDark ? "bg-slate-950" : "bg-gray-50")}>
                <div className="text-center max-w-md">
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", isDark ? "bg-red-500/20" : "bg-red-100")}>
                        <span className={cn(isDark ? "text-red-500" : "text-red-600")}>{Icons.warning}</span>
                    </div>
                    <h2 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-gray-900")}>
                        {isRTL ? "خطأ" : "Error"}
                    </h2>
                    <p className={cn("mb-6", isDark ? "text-gray-400" : "text-gray-600")}>{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                    >
                        {isRTL ? "العودة" : "Go Back"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen py-8 px-4", isDark ? "bg-slate-950" : "bg-gray-50", isRTL && "rtl")}>
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className={cn("flex items-center gap-2 transition-colors mb-4", isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}
                    >
                        <span className={isRTL ? "rotate-180" : ""}>{Icons.back}</span>
                        <span>{isRTL ? "العودة" : "Back"}</span>
                    </button>
                    <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                        {isRTL ? "إتمام الدفع" : "Complete Payment"}
                    </h1>
                    <p className={cn("mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                        {isRTL ? "ادفع لتأكيد موعدك" : "Pay to confirm your appointment"}
                    </p>
                </div>

                {/* Appointment Summary */}
                <GlowingCard glowColor="blue" className="p-5 mb-6" isDark={isDark}>
                    <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
                        {isRTL ? "تفاصيل الموعد" : "Appointment Details"}
                    </h3>

                    <div className="flex items-start gap-4 mb-4">
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", isDark ? "bg-blue-500/20 text-blue-400" : "bg-amber-100 text-amber-600")}>
                            {Icons.doctor}
                        </div>
                        <div>
                            <h4 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{appointment.doctorName}</h4>
                            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{appointment.specialty}</p>
                        </div>
                    </div>

                    <div className={cn("space-y-3 pt-4 border-t", isDark ? "border-white/10" : "border-gray-200")}>
                        <div className={cn("flex items-center gap-3", isDark ? "text-gray-300" : "text-gray-700")}>
                            <span className="text-amber-400">{Icons.calendar}</span>
                            <span>{formatDate(appointment.scheduledStart)}</span>
                        </div>
                        <div className={cn("flex items-center gap-3", isDark ? "text-gray-300" : "text-gray-700")}>
                            <span className="text-amber-400">{Icons.clock}</span>
                            <span>{formatTime(appointment.scheduledStart)}</span>
                        </div>
                    </div>
                </GlowingCard>

                {/* Payment Method Selection */}
                <GlowingCard glowColor="blue" className="p-5 mb-6" isDark={isDark}>
                    <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
                        {isRTL ? "طريقة الدفع" : "Payment Method"}
                    </h3>

                    <div className="space-y-3">
                        {/* Credit/Debit Card */}
                        <button
                            onClick={() => setPaymentMethod("card")}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                                paymentMethod === "card"
                                    ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                                    : isDark 
                                        ? "border-white/10 bg-white/5 hover:border-blue-500/40"
                                        : "border-slate-200 bg-slate-50 hover:border-blue-300"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                paymentMethod === "card" 
                                    ? "bg-blue-500/20 text-blue-400" 
                                    : isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-600"
                            )}>
                                {Icons.card}
                            </div>
                            <div className="flex-1 text-start">
                                <p className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                                    {isRTL ? "بطاقة ائتمان/خصم" : "Credit/Debit Card"}
                                </p>
                                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                    Visa, Mastercard, Meeza
                                </p>
                            </div>
                            {paymentMethod === "card" && (
                                <span className="text-amber-400">{Icons.check}</span>
                            )}
                        </button>

                        {/* Mobile Wallet */}
                        <button
                            onClick={() => setPaymentMethod("wallet")}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                                paymentMethod === "wallet"
                                    ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                                    : isDark
                                        ? "border-white/10 bg-white/5 hover:border-blue-500/40"
                                        : "border-slate-200 bg-slate-50 hover:border-blue-300"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                paymentMethod === "wallet" 
                                    ? "bg-blue-500/20 text-blue-400" 
                                    : isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-600"
                            )}>
                                {Icons.wallet}
                            </div>
                            <div className="flex-1 text-start">
                                <p className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                                    {isRTL ? "محفظة إلكترونية" : "Mobile Wallet"}
                                </p>
                                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                    Vodafone Cash, Orange Money, Etisalat Cash
                                </p>
                            </div>
                            {paymentMethod === "wallet" && (
                                <span className="text-amber-400">{Icons.check}</span>
                            )}
                        </button>
                    </div>
                </GlowingCard>

                {/* Order Summary */}
                <GlowingCard glowColor="blue" className="p-5 mb-6" isDark={isDark}>
                    <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
                        {isRTL ? "ملخص الطلب" : "Order Summary"}
                    </h3>

                    <div className="space-y-3">
                        <div className={cn("flex justify-between", isDark ? "text-gray-300" : "text-gray-700")}>
                            <span>{isRTL ? "رسوم الاستشارة" : "Consultation Fee"}</span>
                            <span>
                                {appointment.consultationFee.toFixed(2)} {isRTL ? "ج.م" : "EGP"}
                            </span>
                        </div>
                        <div className={cn("flex justify-between text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                            <span>{isRTL ? "ضريبة القيمة المضافة (14%)" : "VAT (14%)"}</span>
                            <span>
                                {isRTL ? "مشمول" : "Included"}
                            </span>
                        </div>
                        <div className={cn("border-t pt-3 flex justify-between", isDark ? "border-white/10" : "border-gray-200")}>
                            <span className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                                {isRTL ? "الإجمالي" : "Total"}
                            </span>
                            <span className="text-amber-400 font-bold text-lg">
                                {appointment.consultationFee.toFixed(2)} {isRTL ? "ج.م" : "EGP"}
                            </span>
                        </div>
                    </div>
                </GlowingCard>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("mb-6 p-4 rounded-xl", isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200")}
                    >
                        <div className="flex gap-3 items-start">
                            <span className={cn(isDark ? "text-red-500" : "text-red-600")}>{Icons.warning}</span>
                            <p className={cn(isDark ? "text-red-400" : "text-red-700")}>{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* Pay Button */}
                <motion.button
                    onClick={handlePayment}
                    disabled={processing}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        "w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-3",
                        processing
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 text-white shadow-lg shadow-blue-500/25"
                    )}
                >
                    {processing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{isRTL ? "جاري المعالجة..." : "Processing..."}</span>
                        </>
                    ) : (
                        <>
                            <span>{Icons.lock}</span>
                            <span>
                                {isRTL ? "ادفع الآن" : "Pay Now"} - {appointment.consultationFee.toFixed(2)} {isRTL ? "ج.م" : "EGP"}
                            </span>
                        </>
                    )}
                </motion.button>

                {/* Security Note */}
                <p className={cn("text-center text-sm mt-4 flex items-center justify-center gap-2", isDark ? "text-gray-500" : "text-gray-600")}>
                    {Icons.lock}
                    <span>
                        {isRTL
                            ? "مدفوعات آمنة مشفرة بواسطة Paymob"
                            : "Secure encrypted payments powered by Paymob"}
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
        <div className={cn("min-h-screen flex items-center justify-center", isDark ? "bg-slate-950" : "bg-gray-50")}>
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className={cn("text-lg", isDark ? "text-white" : "text-gray-900")}>Loading...</p>
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
