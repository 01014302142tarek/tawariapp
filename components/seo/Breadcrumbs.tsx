"use client";

import Link from "next/link";
import { useI18n } from "@/app/i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";

interface BreadcrumbItem {
    label: string;
    labelAr?: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
    const { language, isRTL } = useI18n();
    const { theme } = useGlobalTheme();
    const isDark = theme === "dark";

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tawariapp.com";

    // Generate JSON-LD structured data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: language === "ar" && item.labelAr ? item.labelAr : item.label,
            item: item.href ? `${baseUrl}${item.href}` : undefined,
        })),
    };

    return (
        <>
            {/* JSON-LD Structured Data - Sanitized against script breakout */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
            />

            {/* Visual Breadcrumbs */}
            <nav aria-label="Breadcrumb" className={className}>
                <ol
                    className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                    dir={isRTL ? "rtl" : "ltr"}
                >
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        const label = language === "ar" && item.labelAr ? item.labelAr : item.label;

                        return (
                            <li key={index} className="flex items-center gap-2">
                                {index > 0 && (
                                    <span className="text-gray-500">
                                        {isRTL ? (
                                            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </span>
                                )}
                                {isLast || !item.href ? (
                                    <span
                                        className={isLast ? (isDark ? "text-white" : "text-slate-900") : ""}
                                        aria-current={isLast ? "page" : undefined}
                                    >
                                        {label}
                                    </span>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`hover:underline transition-colors ${
                                            isDark ? "hover:text-teal-400" : "hover:text-teal-600"
                                        }`}
                                    >
                                        {label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
}

// Pre-built breadcrumb configurations
export const breadcrumbConfigs = {
    home: (lang: string) => [
        { label: "Home", labelAr: "الرئيسية", href: `/${lang}` },
    ],
    about: (lang: string) => [
        { label: "Home", labelAr: "الرئيسية", href: `/${lang}` },
        { label: "About", labelAr: "عن تواري" },
    ],
    contact: (lang: string) => [
        { label: "Home", labelAr: "الرئيسية", href: `/${lang}` },
        { label: "Contact", labelAr: "اتصل بنا" },
    ],
    faq: (lang: string) => [
        { label: "Home", labelAr: "الرئيسية", href: `/${lang}` },
        { label: "FAQ", labelAr: "الأسئلة الشائعة" },
    ],
    doctors: (lang: string) => [
        { label: "Home", labelAr: "الرئيسية", href: `/${lang}` },
        { label: "Find Doctors", labelAr: "البحث عن طبيب" },
    ],
    doctorProfile: (lang: string, doctorName: string) => [
        { label: "Home", labelAr: "الرئيسية", href: `/${lang}` },
        { label: "Doctors", labelAr: "الأطباء", href: `/${lang}/doctors` },
        { label: doctorName },
    ],
    patientDashboard: (lang: string) => [
        { label: "Home", labelAr: "الرئيسية", href: `/${lang}` },
        { label: "Dashboard", labelAr: "لوحة التحكم" },
    ],
};
