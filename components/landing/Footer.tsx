"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/app/i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { Logo } from "@/components/ui/Logo";

export default function Footer({ isDark: isDarkProp }: { isDark?: boolean }) {
    const { t, language } = useI18n();
    const { isDark: isDarkContext } = useGlobalTheme();
    const isDark = isDarkProp !== undefined ? isDarkProp : isDarkContext;

    const borderColor = isDark ? "border-[#044C87]/30" : "border-[#D0E1F0]";
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textSecondary = isDark ? "text-gray-300" : "text-gray-600";
    const textMuted = isDark ? "text-gray-400" : "text-gray-500";

    return (
        <footer className={`relative z-10 border-t ${borderColor} py-16 px-4 transition-colors duration-300 ${isDark ? 'bg-[#020B16]' : 'bg-[#F4F8FC]'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <div className="lg:col-span-1">
                        <Link href={`/${language}`} className="block mb-6 group hover:opacity-90 transition-opacity">
                            <Logo isDark={isDark} />
                        </Link>
                        <p className={`${textMuted} text-sm mb-6 max-w-xs`}>{t.footer.tagline}</p>
                    </div>
                    <div>
                        <h4 className={`font-bold mb-4 ${textPrimary}`}>{t.footer.forPatients}</h4>
                        <div className="flex flex-col gap-3">
                            <Link href={`/${language}#doctors`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.findDoctors}</Link>
                            <Link href={`/${language}#how-it-works`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.howItWorks}</Link>
                            <Link href={`/${language}/faq`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.faq}</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className={`font-bold mb-4 ${textPrimary}`}>{t.footer.forDoctorsTitle}</h4>
                        <div className="flex flex-col gap-3">
                            <Link href={`/${language}/doctor-onboarding`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.joinAsDoctor}</Link>
                            <Link href={`/${language}/faq`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.doctorFaq}</Link>
                            <span className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors cursor-default`}>{t.footer.pricing}</span>
                        </div>
                    </div>
                    <div>
                        <h4 className={`font-bold mb-4 ${textPrimary}`}>{t.footer.company}</h4>
                        <div className="flex flex-col gap-3">
                            <Link href={`/${language}/about`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.aboutUs}</Link>
                            <Link href={`/${language}/contact`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.contact}</Link>
                            <Link href={`/${language}/privacy`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.privacy}</Link>
                            <Link href={`/${language}/terms`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.terms}</Link>
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
                                <div className={`w-10 h-6 ${isDark ? 'bg-[#FD614B]/20' : 'bg-red-100'} rounded flex items-center justify-center text-xs font-bold text-[#FD614B]`}>VC</div>
                            </div>
                        </div>
                        <p className={`text-xs ${textMuted}`}>{t.footer.copyright}</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
