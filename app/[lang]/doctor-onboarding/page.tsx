"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MultiSelectDays } from "@/components/ui/multi-select-days";
import { useI18n } from "@/app/i18n";
import { useAuth } from "@/app/context/AuthContext";
import { completeOnboarding, getDoctorOnboardingStatus, uploadDoctorAvatar, uploadDoctorCredentials } from "@/app/actions/doctor-onboarding";
import { validatePhoneNumber, sendPhoneOTP, verifyPhoneOTP } from "@/app/actions/phone-verification";

// Helper to convert File to base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });
};

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
        <svg className="w-5 h-5 animate-spin rtl:-scale-x-100" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    ),
    home: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
    ),
    eye: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    eyeOff: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    ),
    trash: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
    phone: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
    ),
    checkCircle: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    xCircle: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

// Step configuration - will be translated in component
const stepKeys = [
    { id: 1, key: "welcome", icon: Icons.user },
    { id: 2, key: "professional", icon: Icons.briefcase },
    { id: 3, key: "practice", icon: Icons.building },
    { id: 4, key: "verification", icon: Icons.document },
    { id: 5, key: "complete", icon: Icons.check },
];

// Medical specialties - bilingual
const specialtiesData = {
    en: ["Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", "General Practice", "Neurology", "Oncology", "Ophthalmology", "Orthopedics", "Pediatrics", "Psychiatry", "Pulmonology", "Radiology", "Rheumatology", "Urology", "Other"],
    ar: ["قلب", "جلدية", "غدد صماء", "جهاز هضمي", "طب عام", "أعصاب", "أورام", "عيون", "عظام", "أطفال", "طب نفسي", "رئة", "أشعة", "روماتيزم", "مسالك بولية", "أخرى"]
};

// Onboarding translations
const onboardingTranslations = {
    en: {
        steps: { welcome: "Welcome", professional: "Professional", practice: "Practice", verification: "Verification", complete: "Complete" },
        step1: {
            title: "Welcome, Doctor!",
            subtitle: "Let's set up your profile to get started",
            fullName: "Full Name",
            namePlaceholder: "Dr. Ahmed Hassan",
            email: "Email Address",
            emailPlaceholder: "ahmed.hassan@email.com",
            password: "Password",
            passwordPlaceholder: "Enter your password",
            showPassword: "Show password",
            hidePassword: "Hide password",
            passwordReq: "Password must have:",
            passwordMinLength: "At least 8 characters",
            passwordUppercase: "One uppercase letter",
            passwordLowercase: "One lowercase letter",
            passwordNumber: "One number",
            passwordSpecial: "One special character (!@#$%^&*)",
            phone: "Phone Number",
            phonePlaceholder: "01xxxxxxxxx",
            phoneHint: "Egyptian mobile number (01x xxx xxxx)",
            phoneInvalid: "Invalid phone format. Use: 01xxxxxxxxx",
            phoneExists: "This phone is already registered",
            phoneValid: "Valid phone number",
            verifyPhone: "Verify Phone",
            sendOtp: "Send Code",
            otpSent: "Verification code sent!",
            otpTitle: "Verify Your Phone",
            otpSubtitle: "Enter the 6-digit code sent to",
            otpPlaceholder: "Enter 6-digit code",
            otpVerify: "Verify",
            otpResend: "Resend Code",
            otpSecurityWait: "For security purposes, you can only request this after",
            otpSeconds: "seconds",
            phoneVerified: "Phone verified",
            uploadPhoto: "Upload photo",
            clickToChange: "Click to change"
        },
        step2: {
            title: "Professional Details",
            subtitle: "Tell us about your medical expertise",
            specialty: "Medical Specialty",
            experience: "Years of Experience",
            license: "License Number",
            licensePlaceholder: "ML-12345-EG"
        },
        step3: {
            title: "Practice Information",
            subtitle: "Where do you practice medicine?",
            clinicName: "Clinic/Hospital Name",
            clinicPlaceholder: "Cairo Medical Center",
            fee: "Consultation Fee (EGP)",
            feePlaceholder: "500",
            address: "Work Address",
            addressPlaceholder: "123 Medical Street, Cairo, Egypt",
            days: "Available Days",
            daysPlaceholder: "Sun - Thu",
            hours: "Working Hours",
            hoursPlaceholder: "9 AM - 5 PM",
            weekdays: {
                sunday: "Sunday",
                monday: "Monday",
                tuesday: "Tuesday",
                wednesday: "Wednesday",
                thursday: "Thursday",
                friday: "Friday",
                saturday: "Saturday"
            }
        },
        step4: {
            title: "Verification",
            subtitle: "Upload credentials (optional)",
            licenseDoc: "Medical License Document",
            additionalDocs: "Additional Documents (Optional)",
            addDocument: "Add another document",
            bio: "Professional Bio",
            bioPlaceholder: "Brief description about yourself...",
            terms: "I agree to the",
            termsLink: "Terms",
            and: "and",
            privacyLink: "Privacy Policy",
            dragDrop: "Click to upload or drag and drop"
        },
        step5: {
            welcomeAboard: "Welcome Aboard",
            submitted: "Your profile has been submitted successfully",
            redirecting: "Redirecting to Dashboard...",
            waiting: "Waiting for Admin Approval",
            summary: "Profile Summary",
            specialty: "Specialty",
            experience: "Experience",
            years: "years",
            clinic: "Clinic",
            fee: "Fee",
            notSpecified: "Not specified"
        },
        nav: { back: "Back", continue: "Continue", home: "Home", select: "Select" }
    },
    ar: {
        steps: { welcome: "مرحباً", professional: "المهني", practice: "العمل", verification: "التحقق", complete: "اكتمال" },
        step1: {
            title: "مرحباً دكتور!",
            subtitle: "دعنا نقوم بإعداد ملفك الشخصي للبدء",
            fullName: "الاسم الكامل",
            namePlaceholder: "د. أحمد حسن",
            email: "البريد الإلكتروني",
            emailPlaceholder: "ahmed.hassan@email.com",
            password: "كلمة المرور",
            passwordPlaceholder: "أدخل كلمة المرور",
            showPassword: "إظهار كلمة المرور",
            hidePassword: "إخفاء كلمة المرور",
            passwordReq: "كلمة المرور يجب أن تحتوي على:",
            passwordMinLength: "8 أحرف على الأقل",
            passwordUppercase: "حرف كبير واحد",
            passwordLowercase: "حرف صغير واحد",
            passwordNumber: "رقم واحد",
            passwordSpecial: "رمز خاص (!@#$%^&*)",
            phone: "رقم الهاتف",
            phonePlaceholder: "01xxxxxxxxx",
            phoneHint: "رقم موبايل مصري (01x xxx xxxx)",
            phoneInvalid: "صيغة الهاتف غير صحيحة. استخدم: 01xxxxxxxxx",
            phoneExists: "هذا الرقم مسجل بالفعل",
            phoneValid: "رقم هاتف صحيح",
            verifyPhone: "تحقق من الهاتف",
            sendOtp: "إرسال الكود",
            otpSent: "تم إرسال كود التحقق!",
            otpTitle: "تحقق من هاتفك",
            otpSubtitle: "أدخل الكود المكون من 6 أرقام المرسل إلى",
            otpPlaceholder: "أدخل الكود المكون من 6 أرقام",
            otpVerify: "تحقق",
            otpResend: "إعادة إرسال الكود",
            otpSecurityWait: "لأسباب أمنية، يمكنك طلب ذلك بعد",
            otpSeconds: "ثانية",
            phoneVerified: "تم التحقق من الهاتف",
            uploadPhoto: "رفع صورة",
            clickToChange: "انقر للتغيير"
        },
        step2: {
            title: "التفاصيل المهنية",
            subtitle: "أخبرنا عن خبرتك الطبية",
            specialty: "التخصص الطبي",
            experience: "سنوات الخبرة",
            license: "رقم الترخيص",
            licensePlaceholder: "ML-12345-EG"
        },
        step3: {
            title: "معلومات العيادة",
            subtitle: "أين تمارس الطب؟",
            clinicName: "اسم العيادة/المستشفى",
            clinicPlaceholder: "مركز القاهرة الطبي",
            fee: "رسوم الاستشارة (ج.م)",
            feePlaceholder: "٥٠٠",
            address: "عنوان العمل",
            addressPlaceholder: "١٢٣ شارع الطبي، القاهرة، مصر",
            days: "أيام العمل",
            daysPlaceholder: "الأحد - الخميس",
            hours: "ساعات العمل",
            hoursPlaceholder: "٩ ص - ٥ م",
            weekdays: {
                sunday: "الأحد",
                monday: "الإثنين",
                tuesday: "الثلاثاء",
                wednesday: "الأربعاء",
                thursday: "الخميس",
                friday: "الجمعة",
                saturday: "السبت"
            }
        },
        step4: {
            title: "التحقق",
            subtitle: "رفع الوثائق (اختياري)",
            licenseDoc: "وثيقة الترخيص الطبي",
            additionalDocs: "وثائق إضافية (اختياري)",
            addDocument: "إضافة وثيقة أخرى",
            bio: "السيرة الذاتية المهنية",
            bioPlaceholder: "وصف موجز عن نفسك...",
            terms: "أوافق على",
            termsLink: "الشروط",
            and: "و",
            privacyLink: "سياسة الخصوصية",
            dragDrop: "انقر للرفع أو اسحب وأفلت"
        },
        step5: {
            welcomeAboard: "مرحباً بك",
            submitted: "تم تقديم ملفك الشخصي بنجاح",
            redirecting: "جاري التوجيه إلى لوحة التحكم...",
            waiting: "في انتظار موافقة المدير",
            summary: "ملخص الملف الشخصي",
            specialty: "التخصص",
            experience: "الخبرة",
            years: "سنوات",
            clinic: "العيادة",
            fee: "الرسوم",
            notSpecified: "غير محدد"
        },
        nav: { back: "رجوع", continue: "متابعة", home: "الرئيسية", select: "اختر" }
    }
};

// Note: specialties are retrieved dynamically in the component based on language

// Input Component
const Input = ({ label, placeholder, value, onChange, type = "text", isDark, required = false, dir }: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    isDark: boolean;
    required?: boolean;
    dir?: "ltr" | "rtl";
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
            dir={dir}
            className={cn(
                "w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all",
                isDark
                    ? "bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
                    : "bg-white border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
            )}
        />
    </div>
);

// Password validation helper
const validatePassword = (password: string) => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
});

const isPasswordValid = (password: string) => {
    const v = validatePassword(password);
    return v.minLength && v.hasUppercase && v.hasLowercase && v.hasNumber && v.hasSpecial;
};

// Password requirement item (extracted to avoid creating during render)
const RequirementItem = ({ met, text, isDark }: { met: boolean; text: string; isDark: boolean }) => (
    <div className={cn("flex items-center gap-1.5 text-xs", met ? "text-teal-500" : (isDark ? "text-gray-500" : "text-gray-400"))}>
        {met ? Icons.checkCircle : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
            </svg>
        )}
        <span>{text}</span>
    </div>
);

// Password Input Component with show/hide toggle and requirements
const PasswordInput = ({ label, placeholder, value, onChange, isDark, required = false, showPasswordLabel, hidePasswordLabel, requirementsText }: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    isDark: boolean;
    required?: boolean;
    showPasswordLabel?: string;
    hidePasswordLabel?: string;
    requirementsText?: {
        title: string;
        minLength: string;
        uppercase: string;
        lowercase: string;
        number: string;
        special: string;
    };
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);
    const validation = validatePassword(value);
    const allValid = isPasswordValid(value);

    return (
        <div className="space-y-1">
            <label className={cn("block text-xs font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                {label} {required && <span className="text-teal-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setShowRequirements(true)}
                    onBlur={() => setTimeout(() => setShowRequirements(false), 200)}
                    className={cn(
                        "w-full px-3 py-2 pr-10 text-sm rounded-lg border outline-none transition-all",
                        value && (allValid ? (isDark ? "border-teal-500/50" : "border-teal-500") : (isDark ? "border-amber-500/50" : "border-amber-500")),
                        !value && (isDark ? "border-white/10" : "border-gray-200"),
                        isDark
                            ? "bg-slate-800/50 text-white placeholder-gray-500 focus:ring-1 focus:ring-teal-500/20"
                            : "bg-white text-slate-900 placeholder-gray-400 focus:ring-1 focus:ring-teal-500/20"
                    )}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors",
                        isDark
                            ? "text-gray-400 hover:text-teal-400"
                            : "text-gray-500 hover:text-teal-500"
                    )}
                    title={showPassword ? (hidePasswordLabel || "Hide password") : (showPasswordLabel || "Show password")}
                >
                    {showPassword ? Icons.eyeOff : Icons.eye}
                </button>
            </div>
            {/* Password requirements - show when focused or has value but not valid */}
            {requirementsText && (showRequirements || (value && !allValid)) && (
                <div className={cn(
                    "mt-2 p-2 rounded-lg text-xs",
                    isDark ? "bg-slate-800/50 border border-white/5" : "bg-gray-50 border border-gray-200"
                )}>
                    <p className={cn("font-medium mb-1.5", isDark ? "text-gray-300" : "text-gray-600")}>
                        {requirementsText.title}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                        <RequirementItem met={validation.minLength} text={requirementsText.minLength} isDark={isDark} />
                        <RequirementItem met={validation.hasUppercase} text={requirementsText.uppercase} isDark={isDark} />
                        <RequirementItem met={validation.hasLowercase} text={requirementsText.lowercase} isDark={isDark} />
                        <RequirementItem met={validation.hasNumber} text={requirementsText.number} isDark={isDark} />
                        <RequirementItem met={validation.hasSpecial} text={requirementsText.special} isDark={isDark} />
                    </div>
                </div>
            )}
        </div>
    );
};

// Phone Input Component with validation
const PhoneInput = ({
    label,
    placeholder,
    value,
    onChange,
    isDark,
    required = false,
    hint,
    validMessage,
    invalidMessage,
    existsMessage,
    isValidating,
    validationStatus,
    isVerified,
    verifiedMessage,
    onVerify,
    verifyButtonText,
}: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    isDark: boolean;
    required?: boolean;
    hint?: string;
    validMessage?: string;
    invalidMessage?: string;
    existsMessage?: string;
    isValidating?: boolean;
    validationStatus?: "idle" | "valid" | "invalid" | "exists";
    isVerified?: boolean;
    verifiedMessage?: string;
    onVerify?: () => void;
    verifyButtonText?: string;
}) => {
    const getStatusColor = () => {
        if (isVerified) return "text-teal-500";
        if (validationStatus === "valid") return "text-teal-500";
        if (validationStatus === "invalid" || validationStatus === "exists") return "text-red-500";
        return isDark ? "text-gray-500" : "text-gray-400";
    };

    const getStatusMessage = () => {
        if (isVerified) return verifiedMessage || "Verified";
        if (validationStatus === "valid") return validMessage;
        if (validationStatus === "invalid") return invalidMessage;
        if (validationStatus === "exists") return existsMessage;
        return hint;
    };

    const getStatusIcon = () => {
        if (isValidating) return Icons.spinner;
        if (isVerified) return Icons.checkCircle;
        if (validationStatus === "valid") return Icons.checkCircle;
        if (validationStatus === "invalid" || validationStatus === "exists") return Icons.xCircle;
        return null;
    };

    const getBorderColor = () => {
        if (isVerified) return isDark ? "border-teal-500/50" : "border-teal-500";
        if (validationStatus === "valid") return isDark ? "border-teal-500/50" : "border-teal-500";
        if (validationStatus === "invalid" || validationStatus === "exists") return isDark ? "border-red-500/50" : "border-red-500";
        return isDark ? "border-white/10" : "border-gray-200";
    };

    return (
        <div className="space-y-1">
            <label className={cn("block text-xs font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                {label} {required && <span className="text-teal-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type="tel"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={isVerified}
                    dir="ltr"
                    className={cn(
                        "w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all",
                        isVerified ? "pr-10" : (validationStatus === "valid" && onVerify) ? "pr-24" : "pr-10",
                        getBorderColor(),
                        isDark
                            ? "bg-slate-800/50 text-white placeholder-gray-500 focus:ring-1 focus:ring-teal-500/20"
                            : "bg-white text-slate-900 placeholder-gray-400 focus:ring-1 focus:ring-teal-500/20",
                        isVerified && "opacity-75 cursor-not-allowed"
                    )}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {/* Status icon */}
                    {getStatusIcon() && (
                        <span className={cn("p-0.5", getStatusColor())}>
                            {getStatusIcon()}
                        </span>
                    )}
                    {/* Verify button - only show when valid and not verified */}
                    {validationStatus === "valid" && !isVerified && onVerify && (
                        <button
                            type="button"
                            onClick={onVerify}
                            className="px-2 py-1 text-xs font-medium rounded bg-teal-500 hover:bg-teal-600 text-white transition-colors"
                        >
                            {verifyButtonText || "Verify"}
                        </button>
                    )}
                </div>
            </div>
            {/* Status message */}
            {getStatusMessage() && (
                <p className={cn("text-xs mt-1", getStatusColor())}>
                    {getStatusMessage()}
                </p>
            )}
        </div>
    );
};

// OTP Verification Dialog Component
const OTPDialog = ({
    isOpen,
    onClose,
    phone,
    isDark,
    text,
    onVerifySuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    phone: string;
    isDark: boolean;
    text: {
        otpTitle: string;
        otpSubtitle: string;
        otpPlaceholder: string;
        otpVerify: string;
        otpResend: string;
        otpSecurityWait: string;
        otpSeconds: string;
    };
    onVerifySuccess: () => void;
}) => {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Countdown timer for resend
    useEffect(() => {
        if (!isOpen) return;

        // Send OTP when dialog opens
        const sendInitialOTP = async () => {
            setIsSending(true);
            const result = await sendPhoneOTP(phone);
            setIsSending(false);
            if (!result.success) {
                setError(result.error || "Failed to send code");
            }
        };
        sendInitialOTP();

        // Start countdown
        setResendTimer(25);
        setCanResend(false);
        const interval = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, phone]);

    const handleResend = async () => {
        if (!canResend) return;
        setIsSending(true);
        setError(null);
        const result = await sendPhoneOTP(phone);
        setIsSending(false);

        if (result.success) {
            setResendTimer(25);
            setCanResend(false);
            const interval = setInterval(() => {
                setResendTimer(prev => {
                    if (prev <= 1) {
                        setCanResend(true);
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setError(result.error || "Failed to send code");
        }
    };

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError("Please enter a 6-digit code");
            return;
        }

        setIsVerifying(true);
        setError(null);

        const result = await verifyPhoneOTP(phone, otp);
        setIsVerifying(false);

        if (result.success) {
            onVerifySuccess();
            onClose();
        } else {
            setError(result.error || "Verification failed");
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[101]"
                onClick={onClose}
            />
            {/* Dialog */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[102] w-full max-w-sm mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={cn(
                    "rounded-2xl p-6 shadow-2xl border",
                    isDark ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"
                )}>
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-3 text-teal-500">
                            {Icons.phone}
                        </div>
                        <h3 className={cn("text-lg font-semibold mb-1", isDark ? "text-white" : "text-slate-900")}>
                            {text.otpTitle}
                        </h3>
                        <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                            {text.otpSubtitle}
                        </p>
                        <p className={cn("text-sm font-medium mt-1", isDark ? "text-teal-400" : "text-teal-600")} dir="ltr">
                            {phone}
                        </p>
                    </div>

                    {/* OTP Input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder={text.otpPlaceholder}
                            className={cn(
                                "w-full px-4 py-3 text-center text-xl font-mono tracking-[0.5em] rounded-lg border outline-none transition-all",
                                isDark
                                    ? "bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50"
                                    : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500"
                            )}
                            dir="ltr"
                        />
                    </div>

                    {/* Error message */}
                    {error && (
                        <p className="text-red-500 text-sm text-center mb-4">{error}</p>
                    )}

                    {/* Buttons */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={handleVerify}
                            disabled={otp.length !== 6 || isVerifying}
                            className={cn(
                                "w-full py-2.5 rounded-lg font-medium transition-all",
                                otp.length === 6 && !isVerifying
                                    ? "bg-teal-500 hover:bg-teal-600 text-white"
                                    : isDark
                                        ? "bg-slate-800 text-gray-500 cursor-not-allowed"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            {isVerifying ? Icons.spinner : text.otpVerify}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={!canResend || isSending}
                            className={cn(
                                "w-full py-2 text-sm font-medium transition-colors",
                                canResend && !isSending
                                    ? (isDark ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-500")
                                    : (isDark ? "text-gray-500" : "text-gray-400")
                            )}
                        >
                            {isSending ? Icons.spinner : canResend ? text.otpResend : `${text.otpSecurityWait} ${resendTimer} ${text.otpSeconds}`}
                        </button>
                    </div>

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className={cn(
                            "absolute top-3 right-3 p-1 rounded-full transition-colors",
                            isDark ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        )}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </motion.div>
        </>
    );
};

// Select Component
const Select = ({ label, value, onChange, options, isDark, required = false, selectLabel = "Select" }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    isDark: boolean;
    required?: boolean;
    selectLabel?: string;
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
            <option value="">{selectLabel}</option>
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
const FileUpload = ({ label, fileName, onFileChange, isDark, accept = "*", filePreview, placeholder = "Click to upload or drag and drop" }: {
    label: string;
    fileName: string;
    onFileChange: (name: string, file?: File) => void;
    isDark: boolean;
    accept?: string;
    filePreview?: string;
    placeholder?: string;
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
                        {fileName || placeholder}
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

// Onboarding text type for step components
type OnboardingText = typeof onboardingTranslations.en;

// Step 1: Welcome & Personal Info
const Step1Welcome = ({
    formData,
    setFormData,
    isDark,
    text,
    onPhotoUpload,
    phoneValidation,
    onPhoneChange,
    onVerifyPhone,
    isPhoneVerified,
    showOtpDialog,
    onCloseOtpDialog,
    onPhoneVerified,
}: {
    formData: FormData;
    setFormData: (data: FormData) => void;
    isDark: boolean;
    text: OnboardingText;
    onPhotoUpload?: (file: File) => void;
    phoneValidation: { status: "idle" | "valid" | "invalid" | "exists"; isValidating: boolean };
    onPhoneChange: (phone: string) => void;
    onVerifyPhone: () => void;
    isPhoneVerified: boolean;
    showOtpDialog: boolean;
    onCloseOtpDialog: () => void;
    onPhoneVerified: () => void;
}) => {
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
                <h2 className={cn("text-xl font-bold mb-1", isDark ? "text-white" : "text-slate-900")}>{text.step1.title}</h2>
                <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                    {text.step1.subtitle}
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
                    {formData.photoUrl ? text.step1.clickToChange : text.step1.uploadPhoto}
                </p>
            </div>

            <Input
                label={text.step1.fullName}
                placeholder={text.step1.namePlaceholder}
                value={formData.fullName}
                onChange={(val) => setFormData({ ...formData, fullName: val })}
                isDark={isDark}
                required
            />
            <Input
                label={text.step1.email}
                placeholder={text.step1.emailPlaceholder}
                value={formData.email}
                onChange={(val) => setFormData({ ...formData, email: val })}
                type="email"
                isDark={isDark}
                required
            />
            <PasswordInput
                label={text.step1.password}
                placeholder={text.step1.passwordPlaceholder}
                value={formData.password}
                onChange={(val) => setFormData({ ...formData, password: val })}
                isDark={isDark}
                required
                showPasswordLabel={text.step1.showPassword}
                hidePasswordLabel={text.step1.hidePassword}
                requirementsText={{
                    title: text.step1.passwordReq,
                    minLength: text.step1.passwordMinLength,
                    uppercase: text.step1.passwordUppercase,
                    lowercase: text.step1.passwordLowercase,
                    number: text.step1.passwordNumber,
                    special: text.step1.passwordSpecial,
                }}
            />
            <PhoneInput
                label={text.step1.phone}
                placeholder={text.step1.phonePlaceholder}
                value={formData.phone}
                onChange={onPhoneChange}
                isDark={isDark}
                required
                hint={text.step1.phoneHint}
                validMessage={text.step1.phoneValid}
                invalidMessage={text.step1.phoneInvalid}
                existsMessage={text.step1.phoneExists}
                isValidating={phoneValidation.isValidating}
                validationStatus={phoneValidation.status}
                isVerified={isPhoneVerified}
                verifiedMessage={text.step1.phoneVerified}
                onVerify={onVerifyPhone}
                verifyButtonText={text.step1.verifyPhone}
            />

            {/* OTP Dialog */}
            <AnimatePresence>
                {showOtpDialog && (
                    <OTPDialog
                        isOpen={showOtpDialog}
                        onClose={onCloseOtpDialog}
                        phone={formData.phone}
                        isDark={isDark}
                        text={{
                            otpTitle: text.step1.otpTitle,
                            otpSubtitle: text.step1.otpSubtitle,
                            otpPlaceholder: text.step1.otpPlaceholder,
                            otpVerify: text.step1.otpVerify,
                            otpResend: text.step1.otpResend,
                            otpSecurityWait: text.step1.otpSecurityWait,
                            otpSeconds: text.step1.otpSeconds,
                        }}
                        onVerifySuccess={onPhoneVerified}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Step 2: Professional Details
const Step2Professional = ({ formData, setFormData, isDark, text, specialties }: { formData: FormData; setFormData: (data: FormData) => void; isDark: boolean; text: OnboardingText; specialties: string[] }) => (
    <div className="space-y-4">
        <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-2 text-teal-500">
                {Icons.briefcase}
            </div>
            <h2 className={cn("text-xl font-bold mb-1", isDark ? "text-white" : "text-slate-900")}>{text.step2.title}</h2>
            <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                {text.step2.subtitle}
            </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <Select
                label={text.step2.specialty}
                value={formData.specialty}
                onChange={(val) => setFormData({ ...formData, specialty: val })}
                options={specialties}
                isDark={isDark}
                selectLabel={text.nav.select}
                required
            />
            <Input
                label={text.step2.experience}
                placeholder="10"
                value={formData.experience}
                onChange={(val) => setFormData({ ...formData, experience: val })}
                type="number"
                isDark={isDark}
                required
            />
        </div>
        <div className="grid grid-cols-2 gap-3">
            <Input
                label={text.step2.license}
                placeholder={text.step2.licensePlaceholder}
                value={formData.licenseNumber}
                onChange={(val) => setFormData({ ...formData, licenseNumber: val })}
                isDark={isDark}
                required
            />
        </div>
    </div>
);

// Working Hours Dropdown Component
const WorkingHoursDropdown = ({ formData, setFormData, isDark, text }: { formData: FormData; setFormData: (data: FormData) => void; isDark: boolean; text: OnboardingText }) => {
    const [isHoursOpen, setIsHoursOpen] = useState(false);

    // Generate all possible working hours (6 AM to 11 PM with various end times)
    const workingHoursPresets = [
        // Early morning shifts
        "6:00 AM - 12:00 PM",
        "6:00 AM - 2:00 PM",
        "6:00 AM - 4:00 PM",
        "7:00 AM - 1:00 PM",
        "7:00 AM - 3:00 PM",
        "7:00 AM - 5:00 PM",
        // Standard morning shifts
        "8:00 AM - 12:00 PM",
        "8:00 AM - 2:00 PM",
        "8:00 AM - 4:00 PM",
        "8:00 AM - 6:00 PM",
        "8:00 AM - 8:00 PM",
        // Mid-morning shifts
        "9:00 AM - 1:00 PM",
        "9:00 AM - 3:00 PM",
        "9:00 AM - 5:00 PM",
        "9:00 AM - 7:00 PM",
        "9:00 AM - 9:00 PM",
        // Late morning shifts
        "10:00 AM - 2:00 PM",
        "10:00 AM - 4:00 PM",
        "10:00 AM - 6:00 PM",
        "10:00 AM - 8:00 PM",
        "10:00 AM - 10:00 PM",
        // Afternoon shifts
        "12:00 PM - 4:00 PM",
        "12:00 PM - 6:00 PM",
        "12:00 PM - 8:00 PM",
        "12:00 PM - 10:00 PM",
        "1:00 PM - 5:00 PM",
        "1:00 PM - 7:00 PM",
        "1:00 PM - 9:00 PM",
        "1:00 PM - 11:00 PM",
        // Evening shifts
        "2:00 PM - 6:00 PM",
        "2:00 PM - 8:00 PM",
        "2:00 PM - 10:00 PM",
        "3:00 PM - 7:00 PM",
        "3:00 PM - 9:00 PM",
        "3:00 PM - 11:00 PM",
        "4:00 PM - 8:00 PM",
        "4:00 PM - 10:00 PM",
        "4:00 PM - 12:00 AM",
        // Night shifts
        "5:00 PM - 9:00 PM",
        "5:00 PM - 11:00 PM",
        "5:00 PM - 1:00 AM",
        "6:00 PM - 10:00 PM",
        "6:00 PM - 12:00 AM",
        "6:00 PM - 2:00 AM",
        // Extended hours
        "24/7 Available",
        "On-Call"
    ];

    return (
        <div className="relative">
            <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-300" : "text-gray-700")}>
                {text.step3.hours}
            </label>
                <button
                    type="button"
                    onClick={() => setIsHoursOpen(!isHoursOpen)}
                    className={cn(
                        "w-full px-3 py-2 rounded-lg border text-left flex items-center justify-between transition-all",
                        isDark
                            ? "bg-slate-800/50 border-slate-700 text-gray-200 hover:border-slate-600"
                            : "bg-white border-gray-300 text-gray-900 hover:border-gray-400",
                        isHoursOpen && "ring-2 ring-teal-500/50"
                    )}
                >
                    <span className={cn("text-sm", !formData.workingHours && (isDark ? "text-gray-500" : "text-gray-400"))}>
                        {formData.workingHours || text.step3.hoursPlaceholder}
                    </span>
                    <svg
                        className={cn("w-4 h-4 transition-transform", isHoursOpen && "rotate-180")}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown Menu for Working Hours */}
                {isHoursOpen && (
                    <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-[90]" onClick={() => setIsHoursOpen(false)} />

                        {/* Dropdown content */}
                        <div
                            className={cn(
                                "absolute z-[100] w-full mt-1 rounded-lg border shadow-xl max-h-64 overflow-y-auto",
                                isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-300"
                            )}
                            style={{ position: 'absolute' }}
                        >
                            {workingHoursPresets.map((preset) => (
                                <div
                                    key={preset}
                                    onClick={() => {
                                        setFormData({ ...formData, workingHours: preset });
                                        setIsHoursOpen(false);
                                    }}
                                    className={cn(
                                        "px-3 py-2.5 cursor-pointer transition-colors text-sm",
                                        isDark
                                            ? "hover:bg-slate-700/50 text-gray-200"
                                            : "hover:bg-gray-50 text-gray-700",
                                        formData.workingHours === preset && (isDark ? "bg-teal-500/10" : "bg-teal-50")
                                    )}
                                >
                                    {preset}
                                </div>
                            ))}
                        </div>
                    </>
                )}
        </div>
    );
};

// Step 3: Practice Information
const Step3Practice = ({ formData, setFormData, isDark, text }: { formData: FormData; setFormData: (data: FormData) => void; isDark: boolean; text: OnboardingText }) => (
    <div className="space-y-4">
        <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-2 text-teal-500">
                {Icons.building}
            </div>
            <h2 className={cn("text-xl font-bold mb-1", isDark ? "text-white" : "text-slate-900")}>{text.step3.title}</h2>
            <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                {text.step3.subtitle}
            </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <Input
                label={text.step3.clinicName}
                placeholder={text.step3.clinicPlaceholder}
                value={formData.clinicName}
                onChange={(val) => setFormData({ ...formData, clinicName: val })}
                isDark={isDark}
                required
            />
            <Input
                label={text.step3.fee}
                placeholder={text.step3.feePlaceholder}
                value={formData.consultationFee}
                onChange={(val) => setFormData({ ...formData, consultationFee: val })}
                type="number"
                isDark={isDark}
                required
            />
        </div>
        <Input
            label={text.step3.address}
            placeholder={text.step3.addressPlaceholder}
            value={formData.address}
            onChange={(val) => setFormData({ ...formData, address: val })}
            isDark={isDark}
        />

        {/* Available Days & Working Hours - Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Available Days Multi-Select */}
            <MultiSelectDays
                value={formData.availableDays}
                onChange={(days) => setFormData({ ...formData, availableDays: days })}
                placeholder={text.step3.daysPlaceholder}
                isDark={isDark}
                label={text.step3.days}
            />

            {/* Working Hours Dropdown */}
            <WorkingHoursDropdown
                formData={formData}
                setFormData={setFormData}
                isDark={isDark}
                text={text}
            />
        </div>
    </div>
);

// Step 4: Verification & Bio
const Step4Verification = ({ formData, setFormData, isDark, text, language, licensePreview, onLicenseUpload, onExtraUpload, onExtraRemove }: { formData: FormData; setFormData: (data: FormData) => void; isDark: boolean; text: OnboardingText; language: string; licensePreview?: string; onLicenseUpload?: (name: string, file?: File) => void; onExtraUpload?: (file: File) => void; onExtraRemove?: (docName: string) => void }) => {

    const handleRemoveExtra = (docName: string) => {
        const newDocs = formData.extraDocuments.filter(d => d !== docName);
        setFormData({ ...formData, extraDocuments: newDocs });
        if (onExtraRemove) onExtraRemove(docName);
    };

    return (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-2 text-teal-500">
                    {Icons.document}
                </div>
                <h2 className={cn("text-xl font-bold mb-1", isDark ? "text-white" : "text-slate-900")}>{text.step4.title}</h2>
                <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                    {text.step4.subtitle}
                </p>
            </div>

            <FileUpload
                label={text.step4.licenseDoc}
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
                placeholder={text.step4.dragDrop}
            />

            <div className="space-y-2">
                <label className={cn("block text-xs font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                    {text.step4.additionalDocs}
                </label>

                {/* List of uploaded files */}
                {formData.extraDocuments.length > 0 && (
                    <div className="space-y-2 mb-3">
                        {formData.extraDocuments.map((doc) => (
                            <div key={doc} className={cn(
                                "flex items-center justify-between p-2 rounded-lg border text-sm",
                                isDark ? "bg-slate-800/50 border-white/10" : "bg-white border-gray-200"
                            )}>
                                <div className="flex items-center gap-2 truncate">
                                    <span className="text-teal-500">{Icons.document}</span>
                                    <span className={cn("truncate", isDark ? "text-gray-300" : "text-gray-700")}>{doc}</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveExtra(doc)}
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
                    <span className="text-xs font-medium">{text.step4.addDocument}</span>
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
                label={text.step4.bio}
                placeholder={text.step4.bioPlaceholder}
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
                        {text.step4.terms}{" "}
                        <Link href={`/${language}/terms`} target="_blank" className="text-teal-500 hover:text-teal-400 underline">
                            {text.step4.termsLink}
                        </Link>{" "}
                        {text.step4.and}{" "}
                        <Link href={`/${language}/privacy`} target="_blank" className="text-teal-500 hover:text-teal-400 underline">
                            {text.step4.privacyLink}
                        </Link>
                    </span>
                </label>
            </div>
        </div>
    );
};

// Step 5: Completion
const Step5Complete = ({ formData, isDark, text, isApproved = false }: { formData: FormData; isDark: boolean; text: OnboardingText; isApproved?: boolean }) => (
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
                {text.step5.welcomeAboard}{formData.fullName ? `, ${formData.fullName.split(" ")[0]}` : ""}!
            </h2>
            <p className={cn("text-xs mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
                {text.step5.submitted}
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
                        {text.step5.redirecting}
                    </span>
                </>
            ) : (
                <>
                    <div className="text-amber-500">
                        {Icons.clock}
                    </div>
                    <span className={cn("text-sm font-medium", isDark ? "text-amber-400" : "text-amber-600")}>
                        {text.step5.waiting}
                    </span>
                </>
            )}
        </motion.div>

        {/* Profile Summary */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={cn("p-4 rounded-xl border text-start", isDark ? "bg-slate-800/30 border-white/5" : "bg-gray-50 border-gray-200")}
        >
            <h3 className={cn("font-semibold text-sm mb-3", isDark ? "text-white" : "text-slate-900")}>{text.step5.summary}</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                    <p className={isDark ? "text-gray-500" : "text-gray-500"}>{text.step5.specialty}</p>
                    <p className={isDark ? "text-white" : "text-slate-900"}>{formData.specialty || text.step5.notSpecified}</p>
                </div>
                <div>
                    <p className={isDark ? "text-gray-500" : "text-gray-500"}>{text.step5.experience}</p>
                    <p className={isDark ? "text-white" : "text-slate-900"}>{formData.experience ? `${formData.experience} ${text.step5.years}` : text.step5.notSpecified}</p>
                </div>
                <div>
                    <p className={isDark ? "text-gray-500" : "text-gray-500"}>{text.step5.clinic}</p>
                    <p className={isDark ? "text-white" : "text-slate-900"}>{formData.clinicName || text.step5.notSpecified}</p>
                </div>
                <div>
                    <p className={isDark ? "text-gray-500" : "text-gray-500"}>{text.step5.fee}</p>
                    <p className={isDark ? "text-white" : "text-slate-900"}>{formData.consultationFee ? `${formData.consultationFee} EGP` : text.step5.notSpecified}</p>
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
    password: string;
    phone: string;
    photoUrl: string;
    // Step 2
    specialty: string;
    experience: string;
    licenseNumber: string;
    // Step 3
    clinicName: string;
    address: string;
    availableDays: string[];
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
    password: "",
    phone: "",
    photoUrl: "",
    specialty: "",
    experience: "",
    licenseNumber: "",
    clinicName: "",
    address: "",
    availableDays: [],
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
    const { isDark } = useGlobalTheme();
    const { language, isRTL, formatNumber } = useI18n();
    const router = useRouter();
    const { user, signUp, profile } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    // Verification status is tracked for future use (e.g., showing pending approval status)
    const [, setVerificationStatus] = useState<string | null>(null);

    // Get translations based on language
    const text = onboardingTranslations[language as keyof typeof onboardingTranslations] || onboardingTranslations.en;
    const specialties = specialtiesData[language as keyof typeof specialtiesData] || specialtiesData.en;
    const steps = stepKeys.map(s => ({ ...s, title: text.steps[s.key as keyof typeof text.steps] }));

    const progress = (currentStep / steps.length) * 100;

    // File state for actual file objects
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [licensePreview, setLicensePreview] = useState<string>("");
    const [extraFiles, setExtraFiles] = useState<File[]>([]);

    // Phone validation state
    const [phoneValidation, setPhoneValidation] = useState<{ status: "idle" | "valid" | "invalid" | "exists"; isValidating: boolean }>({
        status: "idle",
        isValidating: false,
    });
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const phoneValidationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Phone change handler with debounced validation
    const handlePhoneChange = (phone: string) => {
        setFormData(prev => ({ ...prev, phone }));

        // Reset verification if phone changes after being verified
        if (isPhoneVerified) {
            setIsPhoneVerified(false);
        }

        // Clear previous timeout
        if (phoneValidationTimeoutRef.current) {
            clearTimeout(phoneValidationTimeoutRef.current);
        }

        // Reset to idle if phone is empty
        if (!phone || phone.length < 10) {
            setPhoneValidation({ status: "idle", isValidating: false });
            return;
        }

        // Set validating state
        setPhoneValidation(prev => ({ ...prev, isValidating: true }));

        // Debounce validation
        phoneValidationTimeoutRef.current = setTimeout(async () => {
            const result = await validatePhoneNumber(phone);
            if (result.alreadyExists) {
                setPhoneValidation({ status: "exists", isValidating: false });
            } else if (result.valid) {
                setPhoneValidation({ status: "valid", isValidating: false });
            } else {
                setPhoneValidation({ status: "invalid", isValidating: false });
            }
        }, 500);
    };

    // Open OTP dialog to verify phone
    const handleVerifyPhone = () => {
        if (phoneValidation.status === "valid" && !isPhoneVerified) {
            setShowOtpDialog(true);
        }
    };

    // Phone verified callback
    const handlePhoneVerified = () => {
        setIsPhoneVerified(true);
        setShowOtpDialog(false);
    };

    // Pre-fill form with user data if logged in
    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                fullName: profile.profile.full_name || prev.fullName,
                email: user?.email || prev.email,
            }));
            // If doctor is already verified, redirect to dashboard
            if (profile.profile.role === "doctor") {
                getDoctorOnboardingStatus().then(status => {
                    if (status.verificationStatus === "verified") {
                        router.push(`/${language}/dashboard/doctor`);
                    }
                    setVerificationStatus(status.verificationStatus);
                });
            }
        }
    }, [profile, user, language, router]);

    // Validation for each step
    const canProceed = () => {
        if (currentStep === 1) {
            // If user is already logged in, only require full name
            if (user) {
                return formData.fullName.trim().length > 0;
            }
            // Otherwise require full name, email, password, and phone
            const hasFullName = formData.fullName.trim().length > 0;
            const hasValidEmail = formData.email.length > 0 && formData.email.includes("@");
            const hasValidPassword = isPasswordValid(formData.password);
            const hasPhone = formData.phone.length >= 10;
            return hasFullName && hasValidEmail && hasValidPassword && hasPhone;
            // TODO: Re-enable phone verification for production:
            // return hasFullName && hasValidEmail && hasValidPassword && isPhoneVerified;
        }
        if (currentStep === 2) {
            // Require specialty, experience, and license number
            const hasSpecialty = formData.specialty.length > 0;
            const hasExperience = formData.experience.length > 0;
            const hasLicense = formData.licenseNumber.trim().length > 0;
            return hasSpecialty && hasExperience && hasLicense;
        }
        if (currentStep === 3) {
            // Require clinic name, consultation fee, and at least one available day
            const hasClinicName = formData.clinicName.trim().length > 0;
            const hasFee = formData.consultationFee.length > 0 && parseInt(formData.consultationFee) > 0;
            const hasAvailableDays = formData.availableDays.length > 0;
            return hasClinicName && hasFee && hasAvailableDays;
        }
        if (currentStep === 4) {
            // Require terms acceptance on verification step
            return formData.termsAccepted;
        }
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

    const handleNext = async () => {
        setSubmitError(null);

        // Step 1: Create account if not logged in
        if (currentStep === 1 && !user) {
            setIsSubmitting(true);
            try {
                const { error } = await signUp(formData.email, formData.password, {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    role: "doctor",
                });
                if (error) {
                    setSubmitError(error.message);
                    setIsSubmitting(false);
                    return;
                }
            } catch {
                setSubmitError("Failed to create account");
                setIsSubmitting(false);
                return;
            }
            setIsSubmitting(false);
        }

        // Step 4: Save all data, upload files, and submit for verification
        if (currentStep === 4) {
            setIsSubmitting(true);
            try {
                // 1. Upload avatar if provided
                if (photoFile) {
                    const photoBase64 = await fileToBase64(photoFile);
                    const avatarResult = await uploadDoctorAvatar({
                        photoBase64,
                        photoFileName: photoFile.name
                    });
                    if (!avatarResult.success) {
                        setSubmitError(avatarResult.error || "Failed to upload avatar");
                        setIsSubmitting(false);
                        return;
                    }
                }

                // 2. Upload credential documents if provided
                if (licenseFile) {
                    const licenseBase64 = await fileToBase64(licenseFile);

                    // Convert extra files to base64
                    const extraFilesBase64: string[] = [];
                    const extraFileNames: string[] = [];
                    for (const file of extraFiles) {
                        extraFilesBase64.push(await fileToBase64(file));
                        extraFileNames.push(file.name);
                    }

                    const credResult = await uploadDoctorCredentials({
                        licenseFileBase64: licenseBase64,
                        licenseFileName: licenseFile.name,
                        extraFilesBase64: extraFilesBase64.length > 0 ? extraFilesBase64 : undefined,
                        extraFileNames: extraFileNames.length > 0 ? extraFileNames : undefined,
                    });
                    if (!credResult.success) {
                        setSubmitError(credResult.error || "Failed to upload credentials");
                        setIsSubmitting(false);
                        return;
                    }
                }

                // 3. Complete onboarding with profile data
                const result = await completeOnboarding({
                    fullName: formData.fullName,
                    phone: formData.phone,
                    specialty: formData.specialty,
                    experience: formData.experience,
                    licenseNumber: formData.licenseNumber,
                    clinicName: formData.clinicName,
                    address: formData.address,
                    availableDays: formData.availableDays.join(", "),
                    workingHours: formData.workingHours,
                    consultationFee: formData.consultationFee,
                    bio: formData.bio,
                });
                if (!result.success) {
                    setSubmitError(result.error || "Failed to save profile");
                    setIsSubmitting(false);
                    return;
                }
            } catch (err) {
                console.error("Error submitting application:", err);
                setSubmitError(err instanceof Error ? err.message : "Failed to submit application");
                setIsSubmitting(false);
                return;
            }
            setIsSubmitting(false);
        }

        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1Welcome
                        formData={formData}
                        setFormData={setFormData}
                        isDark={isDark}
                        text={text}
                        onPhotoUpload={(file) => setPhotoFile(file)}
                        phoneValidation={phoneValidation}
                        onPhoneChange={handlePhoneChange}
                        onVerifyPhone={handleVerifyPhone}
                        isPhoneVerified={isPhoneVerified}
                        showOtpDialog={showOtpDialog}
                        onCloseOtpDialog={() => setShowOtpDialog(false)}
                        onPhoneVerified={handlePhoneVerified}
                    />
                );
            case 2:
                return <Step2Professional formData={formData} setFormData={setFormData} isDark={isDark} text={text} specialties={specialties} />;
            case 3:
                return <Step3Practice formData={formData} setFormData={setFormData} isDark={isDark} text={text} />;
            case 4:
                return <Step4Verification
                    formData={formData}
                    setFormData={setFormData}
                    isDark={isDark}
                    text={text}
                    language={language}
                    licensePreview={licensePreview}
                    onLicenseUpload={handleLicenseUpload}
                    onExtraUpload={(file) => setExtraFiles(prev => [...prev, file])}
                    onExtraRemove={(docName) => setExtraFiles(prev => prev.filter(f => f.name !== docName))}
                />;
            case 5:
                return <Step5Complete formData={formData} isDark={isDark} text={text} />;
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
                            {formatNumber(Math.round(progress))}%
                        </span>
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>

                {/* Error Message */}
                {submitError && (
                    <div className={cn(
                        "mt-4 p-3 rounded-lg text-sm",
                        isDark ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-200"
                    )}>
                        {submitError}
                    </div>
                )}

                {/* Navigation Buttons - only show for steps 1-4 */}
                {currentStep < 5 && (
                    <div className={cn("flex items-center justify-between mt-4 pt-4 border-t", isDark ? "border-white/5" : "border-teal-100")}>
                        {currentStep > 1 ? (
                            <button
                                onClick={handleBack}
                                disabled={isSubmitting}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isDark
                                        ? "text-gray-400 hover:text-white hover:bg-white/5"
                                        : "text-gray-600 hover:text-slate-900 hover:bg-gray-100",
                                    isSubmitting && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isRTL ? Icons.arrowRight : Icons.arrowLeft}
                                {text.nav.back}
                            </button>
                        ) : (
                            <div />
                        )}

                        <button
                            onClick={handleNext}
                            disabled={!canProceed() || isSubmitting}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                canProceed() && !isSubmitting
                                    ? "bg-teal-500 hover:bg-teal-600 text-white"
                                    : isDark
                                        ? "bg-slate-800 text-gray-500 cursor-not-allowed"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            {isSubmitting ? Icons.spinner : (
                                <>
                                    {text.nav.continue}
                                    {isRTL ? Icons.arrowLeft : Icons.arrowRight}
                                </>
                            )}
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
                        {isRTL ? Icons.arrowRight : Icons.arrowLeft}
                        {text.nav.home}
                    </button>
                </div>
            )}
        </>
    );
}
