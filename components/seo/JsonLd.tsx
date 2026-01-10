/**
 * JSON-LD Structured Data Component
 * Renders schema.org structured data for SEO
 */

interface JsonLdProps {
    data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

/**
 * Organization Schema for the company
 */
export function OrganizationJsonLd() {
    const data = {
        "@context": "https://schema.org",
        "@type": "MedicalOrganization",
        name: "TawariApp",
        alternateName: "تواري",
        url: "https://www.tawariapp.com",
        logo: "https://www.tawariapp.com/logo.png",
        description:
            "Connect with licensed doctors in Egypt for video consultations. Get medical advice, prescriptions, and follow-up care from the comfort of your home.",
        address: {
            "@type": "PostalAddress",
            addressCountry: "EG",
        },
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: ["English", "Arabic"],
        },
    };

    return <JsonLd data={data} />;
}

/**
 * Medical Service Schema
 */
export function MedicalServiceJsonLd() {
    const data = {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        name: "TawariApp",
        description:
            "Telemedicine platform connecting patients with licensed doctors in Egypt for online video consultations.",
        url: "https://www.tawariapp.com",
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
    };

    return <JsonLd data={data} />;
}

/**
 * Website Schema with search action
 */
export function WebsiteJsonLd() {
    const data = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "TawariApp",
        url: "https://www.tawariapp.com",
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate:
                    "https://www.tawariapp.com/en/dashboard/patient/doctors?search={search_term_string}",
            },
            "query-input": "required name=search_term_string",
        },
    };

    return <JsonLd data={data} />;
}

/**
 * Doctor Profile Schema
 */
export function DoctorJsonLd({
    name,
    specialty,
    image,
    rating,
    reviewCount,
    description,
    url,
}: {
    name: string;
    specialty: string;
    image?: string;
    rating?: number;
    reviewCount?: number;
    description?: string;
    url?: string;
}) {
    const data: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Physician",
        name,
        medicalSpecialty: specialty,
        description,
        url,
        availableService: {
            "@type": "MedicalProcedure",
            name: "Video Consultation",
        },
    };

    if (image) {
        data.image = image;
    }

    if (rating && reviewCount) {
        data.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount: reviewCount,
            bestRating: 5,
            worstRating: 1,
        };
    }

    return <JsonLd data={data} />;
}

/**
 * FAQ Schema
 */
export function FaqJsonLd({
    questions,
}: {
    questions: Array<{ question: string; answer: string }>;
}) {
    const data = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
            "@type": "Question",
            name: q.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: q.answer,
            },
        })),
    };

    return <JsonLd data={data} />;
}

/**
 * Breadcrumb Schema
 */
export function BreadcrumbJsonLd({
    items,
}: {
    items: Array<{ name: string; url: string }>;
}) {
    const data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return <JsonLd data={data} />;
}

/**
 * Local Business Schema for Egypt
 */
export function LocalBusinessJsonLd() {
    const data = {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        "@id": "https://www.tawariapp.com/#organization",
        name: "TawariApp",
        alternateName: "تواري",
        description:
            "Egypt's leading telemedicine platform connecting patients with licensed doctors for video consultations.",
        url: "https://www.tawariapp.com",
        logo: "https://www.tawariapp.com/logo.png",
        image: "https://www.tawariapp.com/og-image.png",
        priceRange: "$$",
        currenciesAccepted: "EGP",
        paymentAccepted: "Credit Card, Debit Card, Vodafone Cash",
        areaServed: {
            "@type": "Country",
            name: "Egypt",
            "@id": "https://www.wikidata.org/wiki/Q79",
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: "30.0444",
            longitude: "31.2357",
        },
        address: {
            "@type": "PostalAddress",
            addressCountry: "EG",
            addressLocality: "Cairo",
        },
        openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ],
            opens: "00:00",
            closes: "23:59",
        },
        contactPoint: [
            {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: ["English", "Arabic"],
                areaServed: "EG",
            },
        ],
        sameAs: [
            // Add social media URLs when available
            // "https://facebook.com/tawariapp",
            // "https://twitter.com/tawariapp",
            // "https://instagram.com/tawariapp",
        ],
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Medical Services",
            itemListElement: [
                {
                    "@type": "Offer",
                    itemOffered: {
                        "@type": "MedicalProcedure",
                        name: "Video Consultation",
                        description: "Online video consultation with licensed Egyptian doctors",
                    },
                },
                {
                    "@type": "Offer",
                    itemOffered: {
                        "@type": "MedicalProcedure",
                        name: "Digital Prescription",
                        description: "Electronic prescriptions issued by licensed doctors",
                    },
                },
            ],
        },
    };

    return <JsonLd data={data} />;
}
