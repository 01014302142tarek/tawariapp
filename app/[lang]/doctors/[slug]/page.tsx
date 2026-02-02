import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDoctorById } from "@/app/actions/appointments";
import { siteConfig } from "@/lib/seo/config";
import { DoctorJsonLd } from "@/components/seo/JsonLd";
import DoctorProfileClient from "./DoctorProfileClient";

const BASE_URL = siteConfig.url;

type Props = {
    params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang, slug } = await params;
    const { doctor } = await getDoctorById(slug);

    if (!doctor) {
        return {
            title: "Doctor Not Found",
        };
    }

    const isArabic = lang === "ar";
    const specialty = doctor.specializations[0] || "Doctor";
    const title = isArabic
        ? `د. ${doctor.full_name} - ${specialty}`
        : `Dr. ${doctor.full_name} - ${specialty}`;

    const description = isArabic
        ? `احجز استشارة فيديو مع د. ${doctor.full_name}، ${specialty} مع ${doctor.years_of_experience || 0} سنوات خبرة. تقييم ${doctor.rating_average?.toFixed(1) || "N/A"}/5 من ${doctor.rating_count || 0} مريض.`
        : `Book a video consultation with Dr. ${doctor.full_name}, ${specialty} with ${doctor.years_of_experience || 0} years of experience. Rated ${doctor.rating_average?.toFixed(1) || "N/A"}/5 by ${doctor.rating_count || 0} patients.`;

    const doctorSlug = doctor.slug;

    return {
        title,
        description,
        alternates: {
            canonical: `${BASE_URL}/${lang}/doctors/${doctorSlug}`,
            languages: {
                en: `${BASE_URL}/en/doctors/${doctorSlug}`,
                ar: `${BASE_URL}/ar/doctors/${doctorSlug}`,
            },
        },
        openGraph: {
            title: `${title} | ${siteConfig.name}`,
            description,
            url: `${BASE_URL}/${lang}/doctors/${doctorSlug}`,
            locale: isArabic ? "ar_EG" : "en_US",
            type: "profile",
            images: doctor.avatar_url
                ? [{ url: doctor.avatar_url, alt: doctor.full_name }]
                : undefined,
        },
    };
}

export default async function DoctorProfilePage({ params }: Props) {
    const { lang, slug } = await params;

    // Debug: log the doctor slug being requested
    console.log("[DoctorProfile] Fetching doctor with slug:", slug);

    const { doctor, error } = await getDoctorById(slug);

    // Debug: log the result
    console.log("[DoctorProfile] Result:", { doctor: doctor?.full_name, error });

    if (error || !doctor) {
        console.error("[DoctorProfile] Doctor not found or error:", error);
        notFound();
    }

    const specialty = doctor.specializations[0] || "General Practice";

    return (
        <>
            <DoctorJsonLd
                name={`Dr. ${doctor.full_name}`}
                specialty={specialty}
                image={doctor.avatar_url}
                rating={doctor.rating_average || undefined}
                reviewCount={doctor.rating_count || undefined}
                description={doctor.bio || undefined}
                url={`${BASE_URL}/${lang}/doctors/${doctor.slug}`}
            />
            <DoctorProfileClient doctor={doctor} lang={lang} />
        </>
    );
}
