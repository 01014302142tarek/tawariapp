/**
 * SEO Configuration for Tabibi
 * Centralized SEO settings for the entire application
 */

export const siteConfig = {
    name: "Tabibi",
    nameAr: "طبيبي",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.tabibi.com",
    description: {
        en: "Connect with licensed doctors in Egypt for video consultations. Get medical advice, prescriptions, and follow-up care from the comfort of your home.",
        ar: "تواصل مع أطباء مرخصين في مصر للاستشارات عبر الفيديو. احصل على المشورة الطبية والوصفات الطبية ومتابعة الرعاية من راحة منزلك.",
    },
    shortDescription: {
        en: "Telemedicine platform connecting patients with doctors in Egypt",
        ar: "منصة الطب عن بعد تربط المرضى بالأطباء في مصر",
    },
    keywords: {
        en: [
            "telemedicine Egypt",
            "online doctor consultation",
            "video call doctor",
            "Egyptian doctors",
            "medical consultation online",
            "healthcare Egypt",
            "doctor appointment",
            "virtual healthcare",
            "online prescription",
            "Tabibi",
        ],
        ar: [
            "طب عن بعد مصر",
            "استشارة طبيب اونلاين",
            "مكالمة فيديو طبيب",
            "أطباء مصريين",
            "استشارة طبية اونلاين",
            "رعاية صحية مصر",
            "حجز موعد طبيب",
            "رعاية صحية افتراضية",
            "وصفة طبية اونلاين",
            "طبيبي",
        ],
    },
    creator: "Tabibi",
    ogImage: "/og-image.png",
    twitterHandle: "@tabibiapp",
    locale: {
        default: "en",
        available: ["en", "ar"] as const,
    },
    themeColor: "#D97706", // Gold
};

export type Locale = (typeof siteConfig.locale.available)[number];

/**
 * Generate metadata for a page
 */
export function generatePageMetadata({
    title,
    titleAr,
    description,
    descriptionAr,
    path,
    lang = "en",
    noIndex = false,
    ogImage,
}: {
    title: string;
    titleAr?: string;
    description: string;
    descriptionAr?: string;
    path: string;
    lang?: Locale;
    noIndex?: boolean;
    ogImage?: string;
}) {
    const isArabic = lang === "ar";
    const pageTitle = isArabic && titleAr ? titleAr : title;
    const pageDescription = isArabic && descriptionAr ? descriptionAr : description;
    const fullTitle = `${pageTitle} | ${isArabic ? siteConfig.nameAr : siteConfig.name}`;
    const canonicalUrl = `${siteConfig.url}/${lang}${path}`;
    const alternateEn = `${siteConfig.url}/en${path}`;
    const alternateAr = `${siteConfig.url}/ar${path}`;

    return {
        title: fullTitle,
        description: pageDescription,
        keywords: siteConfig.keywords[lang],
        authors: [{ name: siteConfig.creator }],
        creator: siteConfig.creator,
        metadataBase: new URL(siteConfig.url),
        alternates: {
            canonical: canonicalUrl,
            languages: {
                en: alternateEn,
                ar: alternateAr,
                "x-default": alternateEn,
            },
        },
        openGraph: {
            type: "website",
            locale: isArabic ? "ar_EG" : "en_US",
            url: canonicalUrl,
            title: fullTitle,
            description: pageDescription,
            siteName: siteConfig.name,
            images: [
                {
                    url: ogImage || siteConfig.ogImage,
                    width: 1200,
                    height: 630,
                    alt: pageTitle,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description: pageDescription,
            site: siteConfig.twitterHandle,
            images: [ogImage || siteConfig.ogImage],
        },
        robots: noIndex
            ? { index: false, follow: false }
            : { index: true, follow: true },
        other: {
            "theme-color": siteConfig.themeColor,
        },
    };
}

/**
 * Structured data types
 */
export const structuredData = {
    organization: {
        "@context": "https://schema.org",
        "@type": "MedicalOrganization",
        name: siteConfig.name,
        alternateName: siteConfig.nameAr,
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo.png`,
        description: siteConfig.description.en,
        address: {
            "@type": "PostalAddress",
            addressCountry: "EG",
        },
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: ["English", "Arabic"],
        },
        sameAs: [
            // Add social media URLs when available
        ],
    },
    medicalService: {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        name: siteConfig.name,
        description: siteConfig.description.en,
        url: siteConfig.url,
        priceRange: "$$",
        medicalSpecialty: [
            "GeneralPractice",
            "Cardiology",
            "Dermatology",
            "Pediatrics",
            "Psychiatry",
            "InternalMedicine",
        ],
        availableService: {
            "@type": "MedicalProcedure",
            name: "Video Consultation",
            description: "Online video consultation with licensed doctors",
        },
        areaServed: {
            "@type": "Country",
            name: "Egypt",
        },
    },
    website: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteConfig.url}/en/dashboard/patient/doctors?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    },
};

/**
 * Generate Doctor structured data
 */
export function generateDoctorSchema(doctor: {
    name: string;
    specialty: string;
    image?: string;
    rating?: number;
    reviewCount?: number;
    description?: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Physician",
        name: doctor.name,
        medicalSpecialty: doctor.specialty,
        image: doctor.image,
        description: doctor.description,
        aggregateRating: doctor.rating
            ? {
                  "@type": "AggregateRating",
                  ratingValue: doctor.rating,
                  reviewCount: doctor.reviewCount || 0,
                  bestRating: 5,
                  worstRating: 1,
              }
            : undefined,
        availableService: {
            "@type": "MedicalProcedure",
            name: "Video Consultation",
        },
    };
}

/**
 * Generate Review structured data
 */
export function generateReviewSchema(review: {
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
    doctorName: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Review",
        author: {
            "@type": "Person",
            name: review.author,
        },
        reviewRating: {
            "@type": "Rating",
            ratingValue: review.rating,
            bestRating: 5,
            worstRating: 1,
        },
        reviewBody: review.reviewBody,
        datePublished: review.datePublished,
        itemReviewed: {
            "@type": "Physician",
            name: review.doctorName,
        },
    };
}
