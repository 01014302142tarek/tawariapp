"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/app/i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import type { DoctorProfileDetail } from "@/app/actions/appointments";

// Icons
const Icons = {
    star: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    ),
    clock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    location: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
    ),
    video: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
    ),
    checkBadge: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
    ),
    arrowLeft: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    ),
};

interface DoctorProfileClientProps {
    doctor: DoctorProfileDetail;
    lang: string;
}

export default function DoctorProfileClient({ doctor, lang }: DoctorProfileClientProps) {
    const { isRTL } = useI18n();
    const { theme } = useGlobalTheme();
    const isDark = theme === "dark";

    const translations = {
        en: {
            backToDoctors: "Back to Doctors",
            yearsExp: "years experience",
            verified: "Verified Doctor",
            bookConsultation: "Book Video Consultation",
            aboutDoctor: "About",
            specializations: "Specializations",
            education: "Education",
            hospital: "Hospital",
            languages: "Languages",
            consultationFee: "Consultation Fee",
            reviews: "Patient Reviews",
            noReviews: "No reviews yet",
            availableNow: "Available Now",
            perSession: "per session",
        },
        ar: {
            backToDoctors: "العودة للأطباء",
            yearsExp: "سنوات خبرة",
            verified: "طبيب موثق",
            bookConsultation: "احجز استشارة فيديو",
            aboutDoctor: "نبذة",
            specializations: "التخصصات",
            education: "التعليم",
            hospital: "المستشفى",
            languages: "اللغات",
            consultationFee: "رسوم الاستشارة",
            reviews: "تقييمات المرضى",
            noReviews: "لا توجد تقييمات بعد",
            availableNow: "متاح الآن",
            perSession: "للجلسة",
        },
    };

    const t = translations[lang as keyof typeof translations] || translations.en;

    return (
        <div
            className={`min-h-screen ${isRTL ? "font-cairo" : ""} ${
                isDark ? "bg-[#0F172A] text-white" : "bg-gray-50 text-slate-900"
            }`}
            dir={isRTL ? "rtl" : "ltr"}
        >
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className={`absolute inset-0 ${
                        isDark
                            ? "bg-gradient-to-br from-teal-900/20 via-[#0F172A] to-[#0F172A]"
                            : "bg-gradient-to-br from-teal-50 via-white to-white"
                    }`}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Link
                    href={`/${lang}/dashboard/patient/doctors`}
                    className={`inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${
                        isDark
                            ? "text-gray-400 hover:text-teal-400"
                            : "text-gray-600 hover:text-teal-600"
                    }`}
                >
                    {isRTL ? (
                        <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    ) : (
                        Icons.arrowLeft
                    )}
                    {t.backToDoctors}
                </Link>

                {/* Doctor Header Card */}
                <div
                    className={`rounded-2xl p-6 md:p-8 mb-6 ${
                        isDark
                            ? "bg-slate-800/50 border border-white/10"
                            : "bg-white border border-gray-200 shadow-lg"
                    }`}
                >
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto md:mx-0">
                                {doctor.avatar_url ? (
                                    <Image
                                        src={doctor.avatar_url}
                                        alt={doctor.full_name}
                                        fill
                                        className="rounded-2xl object-cover"
                                        sizes="(max-width: 768px) 128px, 160px"
                                        priority
                                    />
                                ) : (
                                    <div
                                        className={`w-full h-full rounded-2xl flex items-center justify-center text-4xl font-bold ${
                                            isDark ? "bg-teal-500/20 text-teal-400" : "bg-teal-100 text-teal-600"
                                        }`}
                                    >
                                        {doctor.full_name.charAt(0)}
                                    </div>
                                )}
                                {doctor.is_available_now && (
                                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                                        {t.availableNow}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-start">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold">
                                    Dr. {doctor.full_name}
                                </h1>
                                <span className="text-teal-500">{Icons.checkBadge}</span>
                            </div>

                            {/* Specializations */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                {doctor.specializations.map((spec, idx) => (
                                    <span
                                        key={idx}
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            isDark
                                                ? "bg-teal-500/20 text-teal-300"
                                                : "bg-teal-100 text-teal-700"
                                        }`}
                                    >
                                        {spec}
                                    </span>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                                {/* Rating */}
                                <div className="flex items-center gap-1">
                                    <span className="text-amber-400">{Icons.star}</span>
                                    <span className="font-semibold">
                                        {doctor.rating_average?.toFixed(1) || "N/A"}
                                    </span>
                                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                                        ({doctor.rating_count || 0})
                                    </span>
                                </div>

                                {/* Experience */}
                                <div className="flex items-center gap-1">
                                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                                        {Icons.clock}
                                    </span>
                                    <span>
                                        {doctor.years_of_experience || 0} {t.yearsExp}
                                    </span>
                                </div>

                                {/* Hospital */}
                                {doctor.hospital && (
                                    <div className="flex items-center gap-1">
                                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                                            {Icons.location}
                                        </span>
                                        <span>{doctor.hospital}</span>
                                    </div>
                                )}
                            </div>

                            {/* Price & Book */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                                <div className={`text-center sm:text-start ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    <span className="text-sm">{t.consultationFee}</span>
                                    <div className="text-2xl font-bold text-teal-500">
                                        {doctor.consultation_fee} EGP
                                        <span className={`text-sm font-normal ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                            {" "}/{t.perSession}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href={`/${lang}/dashboard/patient/doctors?book=${doctor.id}`}
                                    className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-teal-500/25"
                                >
                                    {Icons.video}
                                    {t.bookConsultation}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                {doctor.bio && (
                    <div
                        className={`rounded-2xl p-6 mb-6 ${
                            isDark
                                ? "bg-slate-800/50 border border-white/10"
                                : "bg-white border border-gray-200 shadow-sm"
                        }`}
                    >
                        <h2 className="text-xl font-bold mb-4">{t.aboutDoctor}</h2>
                        <p className={`leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            {doctor.bio}
                        </p>
                    </div>
                )}

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Education */}
                    {doctor.education && (
                        <div
                            className={`rounded-2xl p-6 ${
                                isDark
                                    ? "bg-slate-800/50 border border-white/10"
                                    : "bg-white border border-gray-200 shadow-sm"
                            }`}
                        >
                            <h3 className="text-lg font-bold mb-3">{t.education}</h3>
                            <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                                {doctor.education}
                            </p>
                        </div>
                    )}

                    {/* Languages */}
                    {doctor.languages && doctor.languages.length > 0 && (
                        <div
                            className={`rounded-2xl p-6 ${
                                isDark
                                    ? "bg-slate-800/50 border border-white/10"
                                    : "bg-white border border-gray-200 shadow-sm"
                            }`}
                        >
                            <h3 className="text-lg font-bold mb-3">{t.languages}</h3>
                            <div className="flex flex-wrap gap-2">
                                {doctor.languages.map((lang, idx) => (
                                    <span
                                        key={idx}
                                        className={`px-3 py-1 rounded-full text-sm ${
                                            isDark
                                                ? "bg-slate-700 text-gray-300"
                                                : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div
                    className={`rounded-2xl p-6 ${
                        isDark
                            ? "bg-slate-800/50 border border-white/10"
                            : "bg-white border border-gray-200 shadow-sm"
                    }`}
                >
                    <h2 className="text-xl font-bold mb-4">{t.reviews}</h2>
                    {doctor.reviews_preview && doctor.reviews_preview.length > 0 ? (
                        <div className="space-y-4">
                            {doctor.reviews_preview.map((review) => (
                                <div
                                    key={review.id}
                                    className={`p-4 rounded-xl ${
                                        isDark ? "bg-slate-700/50" : "bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{review.patient_name}</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-amber-400">{Icons.star}</span>
                                            <span>{review.rating}/5</span>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                                            {review.comment}
                                        </p>
                                    )}
                                    <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                        {new Date(review.created_at).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={isDark ? "text-gray-400" : "text-gray-500"}>{t.noReviews}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
