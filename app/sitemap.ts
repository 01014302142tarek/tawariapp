import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tabibi.com";

export default function sitemap(): MetadataRoute.Sitemap {
    const locales = ["en", "ar"];
    const currentDate = new Date().toISOString();

    // Public pages that should be indexed
    const publicPages = [
        { path: "", priority: 1.0, changeFreq: "daily" as const },
        { path: "/about", priority: 0.8, changeFreq: "monthly" as const },
        { path: "/contact", priority: 0.7, changeFreq: "monthly" as const },
        { path: "/terms", priority: 0.5, changeFreq: "yearly" as const },
        { path: "/privacy", priority: 0.5, changeFreq: "yearly" as const },
        { path: "/login", priority: 0.6, changeFreq: "monthly" as const },
        { path: "/register", priority: 0.7, changeFreq: "monthly" as const },
    ];

    // Generate URLs for each locale
    const urls: MetadataRoute.Sitemap = [];

    for (const locale of locales) {
        for (const page of publicPages) {
            urls.push({
                url: `${BASE_URL}/${locale}${page.path}`,
                lastModified: currentDate,
                changeFrequency: page.changeFreq,
                priority: page.priority,
                alternates: {
                    languages: {
                        en: `${BASE_URL}/en${page.path}`,
                        ar: `${BASE_URL}/ar${page.path}`,
                    },
                },
            });
        }
    }

    return urls;
}
