/**
 * Performance optimization utilities
 */

/**
 * Preload critical resources
 * Add these to the <head> of your layout for critical resources
 */
export const preloadLinks = [
    // Preload fonts
    {
        rel: "preload",
        href: "/fonts/geist.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
    },
];

/**
 * DNS prefetch for external resources
 */
export const dnsPrefetchLinks = [
    // Supabase
    { rel: "dns-prefetch", href: "https://supabase.co" },
    // Google Fonts (if using)
    { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
    { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
    // Vercel Analytics
    { rel: "dns-prefetch", href: "https://vitals.vercel-insights.com" },
];

/**
 * Image optimization defaults
 */
export const imageDefaults = {
    // Quality for Next.js Image
    quality: 80,

    // Sizes for responsive images
    sizes: {
        avatar: "(max-width: 768px) 64px, 96px",
        thumbnail: "(max-width: 768px) 150px, 200px",
        hero: "(max-width: 768px) 100vw, 50vw",
        card: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    },

    // Placeholder for blur
    placeholder: "blur" as const,
};

/**
 * Loading priorities for images
 * - priority: true for above-the-fold (LCP) images
 * - loading="lazy" for below-the-fold images
 */
export const imagePriorities = {
    // These should have priority={true}
    aboveTheFold: [
        "hero-image",
        "logo",
        "user-avatar-header",
    ],

    // These should have loading="lazy"
    belowTheFold: [
        "doctor-card-image",
        "review-avatar",
        "gallery-image",
    ],
};

/**
 * Resource hints for faster navigation
 */
export const resourceHints = {
    // Preconnect to critical origins
    preconnect: [
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
    ],

    // Prefetch likely navigation targets
    prefetch: [
        "/en/dashboard/patient",
        "/en/dashboard/doctor",
    ],
};

/**
 * Web Vitals thresholds
 * Use these to monitor performance
 */
export const webVitalsThresholds = {
    // Largest Contentful Paint
    LCP: {
        good: 2500,
        needsImprovement: 4000,
    },
    // First Input Delay
    FID: {
        good: 100,
        needsImprovement: 300,
    },
    // Cumulative Layout Shift
    CLS: {
        good: 0.1,
        needsImprovement: 0.25,
    },
    // First Contentful Paint
    FCP: {
        good: 1800,
        needsImprovement: 3000,
    },
    // Time to First Byte
    TTFB: {
        good: 800,
        needsImprovement: 1800,
    },
};
