import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tawariapp.com";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/auth/",
                    "/*/dashboard/",
                    "/*/checkout",
                    "/*/verify-email",
                    "/*/reset-password",
                    "/*/doctor-onboarding/",
                ],
            },
            {
                userAgent: "GPTBot",
                disallow: ["/"],
            },
            {
                userAgent: "ChatGPT-User",
                disallow: ["/"],
            },
            {
                userAgent: "CCBot",
                disallow: ["/"],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
