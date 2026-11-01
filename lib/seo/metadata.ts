import { Metadata } from "next";
import { siteConfig } from "./config";

type Locale = "en" | "ar";

const BASE_URL = siteConfig.url;

/**
 * Generate metadata for the landing page
 */
export function generateLandingMetadata(lang: Locale): Metadata {
    const isArabic = lang === "ar";

    return {
        title: isArabic
            ? "طبيبي - الرعاية الصحية في متناول يدك"
            : "Tabibi - Healthcare at Your Fingertips",
        description: isArabic ? siteConfig.description.ar : siteConfig.description.en,
        keywords: isArabic ? siteConfig.keywords.ar : siteConfig.keywords.en,
        alternates: {
            canonical: `${BASE_URL}/${lang}`,
            languages: {
                en: `${BASE_URL}/en`,
                ar: `${BASE_URL}/ar`,
                "x-default": `${BASE_URL}/en`,
            },
        },
        openGraph: {
            title: isArabic
                ? "طبيبي - الرعاية الصحية في متناول يدك"
                : "Tabibi - Healthcare at Your Fingertips",
            description: isArabic ? siteConfig.description.ar : siteConfig.description.en,
            url: `${BASE_URL}/${lang}`,
            locale: isArabic ? "ar_EG" : "en_US",
        },
    };
}

/**
 * Generate metadata for the About page
 */
export function generateAboutMetadata(lang: Locale): Metadata {
    const isArabic = lang === "ar";

    const title = isArabic ? "عن طبيبي" : "About Tabibi";
    const description = isArabic
        ? "تعرف على مهمتنا لتحويل الرعاية الصحية في مصر. نربط المرضى بأطباء مرخصين عبر استشارات فيديو آمنة."
        : "Learn about our mission to transform healthcare in Egypt. We connect patients with licensed doctors through secure video consultations.";

    return {
        title,
        description,
        alternates: {
            canonical: `${BASE_URL}/${lang}/about`,
            languages: {
                en: `${BASE_URL}/en/about`,
                ar: `${BASE_URL}/ar/about`,
            },
        },
        openGraph: {
            title: `${title} | ${siteConfig.name}`,
            description,
            url: `${BASE_URL}/${lang}/about`,
            locale: isArabic ? "ar_EG" : "en_US",
        },
    };
}

/**
 * Generate metadata for the Contact page
 */
export function generateContactMetadata(lang: Locale): Metadata {
    const isArabic = lang === "ar";

    const title = isArabic ? "اتصل بنا" : "Contact Us";
    const description = isArabic
        ? "تواصل مع فريق دعم طبيبي. نحن هنا للمساعدة في أي أسئلة حول خدمات الطب عن بعد."
        : "Get in touch with Tabibi support team. We're here to help with any questions about our telemedicine services.";

    return {
        title,
        description,
        alternates: {
            canonical: `${BASE_URL}/${lang}/contact`,
            languages: {
                en: `${BASE_URL}/en/contact`,
                ar: `${BASE_URL}/ar/contact`,
            },
        },
        openGraph: {
            title: `${title} | ${siteConfig.name}`,
            description,
            url: `${BASE_URL}/${lang}/contact`,
            locale: isArabic ? "ar_EG" : "en_US",
        },
    };
}

/**
 * Generate metadata for Terms of Service page
 */
export function generateTermsMetadata(lang: Locale): Metadata {
    const isArabic = lang === "ar";

    const title = isArabic ? "شروط الخدمة" : "Terms of Service";
    const description = isArabic
        ? "اقرأ شروط خدمة طبيبي. فهم حقوقك ومسؤولياتك عند استخدام منصة الطب عن بعد."
        : "Read Tabibi's terms of service. Understand your rights and responsibilities when using our telemedicine platform.";

    return {
        title,
        description,
        alternates: {
            canonical: `${BASE_URL}/${lang}/terms`,
            languages: {
                en: `${BASE_URL}/en/terms`,
                ar: `${BASE_URL}/ar/terms`,
            },
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

/**
 * Generate metadata for Privacy Policy page
 */
export function generatePrivacyMetadata(lang: Locale): Metadata {
    const isArabic = lang === "ar";

    const title = isArabic ? "سياسة الخصوصية" : "Privacy Policy";
    const description = isArabic
        ? "تعرف على كيفية حماية طبيبي لخصوصيتك وبياناتك الصحية. التزامنا بأمان البيانات والامتثال لـ HIPAA."
        : "Learn how Tabibi protects your privacy and health data. Our commitment to data security and HIPAA compliance.";

    return {
        title,
        description,
        alternates: {
            canonical: `${BASE_URL}/${lang}/privacy`,
            languages: {
                en: `${BASE_URL}/en/privacy`,
                ar: `${BASE_URL}/ar/privacy`,
            },
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

/**
 * Generate metadata for Login page
 */
export function generateLoginMetadata(lang: Locale): Metadata {
    const isArabic = lang === "ar";

    const title = isArabic ? "تسجيل الدخول" : "Login";
    const description = isArabic
        ? "سجل الدخول إلى حسابك في طبيبي للوصول إلى استشارات الأطباء والوصفات الطبية."
        : "Sign in to your Tabibi account to access doctor consultations and prescriptions.";

    return {
        title,
        description,
        alternates: {
            canonical: `${BASE_URL}/${lang}/login`,
            languages: {
                en: `${BASE_URL}/en/login`,
                ar: `${BASE_URL}/ar/login`,
            },
        },
        robots: {
            index: false,
            follow: true,
        },
    };
}

/**
 * Generate metadata for Register page
 */
export function generateRegisterMetadata(lang: Locale): Metadata {
    const isArabic = lang === "ar";

    const title = isArabic ? "إنشاء حساب" : "Create Account";
    const description = isArabic
        ? "انضم إلى طبيبي اليوم. سجل للوصول إلى استشارات الأطباء المرخصين عبر الفيديو في مصر."
        : "Join Tabibi today. Sign up to access video consultations with licensed doctors in Egypt.";

    return {
        title,
        description,
        alternates: {
            canonical: `${BASE_URL}/${lang}/register`,
            languages: {
                en: `${BASE_URL}/en/register`,
                ar: `${BASE_URL}/ar/register`,
            },
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

/**
 * Generate metadata for dashboard pages (noindex)
 */
export function generateDashboardMetadata(
    title: string
): Metadata {
    return {
        title,
        robots: {
            index: false,
            follow: false,
        },
    };
}
