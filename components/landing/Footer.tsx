"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/app/i18n";

// Logo Component
const LogoFull = ({ className = "", isDark = true }: { className?: string; isDark?: boolean }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <svg className="h-10 w-10 flex-shrink-0" viewBox="0 0 100 90" fill="none">
            <defs>
                <linearGradient id="heartGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2DD4BF" />
                    <stop offset="50%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
            </defs>
            <path
                d="M50 85 C50 85 10 55 10 30 C10 15 22 5 35 5 C42 5 48 10 50 15 C52 10 58 5 65 5 C78 5 90 15 90 30 C90 55 50 85 50 85Z"
                fill="none"
                stroke="url(#heartGradientFooter)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5 45 L25 45 L35 25 L50 65 L65 35 L75 45 L95 45"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
        <span className="text-xl font-bold tracking-tight">
            <span className={isDark ? "text-white" : "text-slate-900"}>Tawari</span>
            <span className={isDark ? "text-gray-400" : "text-gray-500"}>App</span>
        </span>
    </div>
);

export default function Footer({ isDark = true }: { isDark?: boolean }) {
    const { t, language } = useI18n();

    const borderColor = isDark ? "border-white/10" : "border-gray-200";
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textSecondary = isDark ? "text-gray-300" : "text-gray-600";
    const textMuted = isDark ? "text-gray-400" : "text-gray-500";

    return (
        <footer className={`relative z-10 border-t ${borderColor} py-16 px-4 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <div className="lg:col-span-1">
                        <Link href={`/${language}`} className="block mb-6 group hover:opacity-90 transition-opacity">
                            <LogoFull isDark={isDark} />
                        </Link>
                        <p className={`${textMuted} text-sm mb-6 max-w-xs`}>{t.footer.tagline}</p>
                    </div>
                    <div>
                        <h4 className={`font-bold mb-4 ${textPrimary}`}>{t.footer.forPatients}</h4>
                        <div className="flex flex-col gap-3">
                            <Link href={`/${language}#doctors`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footer.findDoctors}</Link>
                            <Link href={`/${language}#how-it-works`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footer.howItWorks}</Link>
                            <Link href={`/${language}/faq`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footer.faq}</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className={`font-bold mb-4 ${textPrimary}`}>{t.footer.forDoctorsTitle}</h4>
                        <div className="flex flex-col gap-3">
                            <Link href={`/${language}/doctor-onboarding`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footer.joinAsDoctor}</Link>
                            <Link href={`/${language}/faq`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footer.doctorFaq}</Link>
                            <span className={`${textSecondary} text-sm hover:text-teal-500 transition-colors cursor-default`}>{t.footer.pricing}</span>
                        </div>
                    </div>
                    <div>
                        <h4 className={`font-bold mb-4 ${textPrimary}`}>{t.footer.company}</h4>
                        <div className="flex flex-col gap-3">
                            <Link href={`/${language}/about`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footer.aboutUs}</Link>
                            <Link href={`/${language}/contact`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footer.contact}</Link>
                            <Link href={`/${language}/privacy`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footer.privacy}</Link>
                            <Link href={`/${language}/terms`} className={`${textSecondary} text-sm hover:text-teal-500 transition-colors`}>{t.footer.terms}</Link>
                        </div>
                    </div>
                </div>

                <div className={`border-t ${borderColor} pt-8`}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className={`text-xs ${textMuted}`}>{t.footer.paymentMethods}</span>
                            <div className="flex gap-2">
                                <div className={`w-10 h-6 ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded flex items-center justify-center text-xs font-bold ${textSecondary}`}>VISA</div>
                                <div className={`w-10 h-6 ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded flex items-center justify-center text-xs font-bold ${textSecondary}`}>MC</div>
                                <div className={`w-10 h-6 ${isDark ? 'bg-red-500/20' : 'bg-red-100'} rounded flex items-center justify-center text-xs font-bold text-red-500`}>VC</div>
                            </div>
                        </div>
                        <p className={`text-xs ${textMuted}`}>{t.footer.copyright}</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
