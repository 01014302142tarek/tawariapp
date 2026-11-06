import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    devIndicators: false,

    // Configure allowed dev origins for network access (LAN testing on mobile & AI Studio Cloud Run)
    allowedDevOrigins: [
        "localhost",
        "localhost:3000",
        "127.0.0.1",
        "127.0.0.1:3000",
        "192.168.1.6",
        "192.168.1.6:3000",
        "*.run.app",
    ],

    // Experimental settings including Server Actions allowed origins
    experimental: {
        serverActions: {
            allowedOrigins: [
                "localhost:3000",
                "127.0.0.1:3000",
                "192.168.1.6:3000",
                "192.168.1.6",
                "*.run.app",
            ],
        },
    },

    // Configure external image domains for next/image
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "*.supabase.co",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },

    // Security headers
    async headers() {
        return [
            {
                // Apply these headers to all routes
                source: "/:path*",
                headers: [
                    // Content Security Policy
                    {
                        key: "Content-Security-Policy",
                        value: [
                            "default-src 'self'",
                            `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://*.daily.co https://*.pluot.blue`,
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com",
                            "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://images.unsplash.com https://*.daily.co https://*.pluot.blue",
                            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://vitals.vercel-insights.com https://*.daily.co https://*.pluot.blue wss://*.daily.co wss://*.pluot.blue https://api.daily.co https://*.ingest.sentry.io https://fairmeeting.net https://*.fairmeeting.net wss://fairmeeting.net wss://*.fairmeeting.net",
                            "frame-src 'self' https://*.daily.co https://*.pluot.blue https://meet.jit.si https://fairmeeting.net https://*.fairmeeting.net https://*.8x8.vc",
                            "worker-src 'self' blob: https://*.daily.co https://*.pluot.blue",
                            "child-src 'self' blob: https://*.daily.co https://*.pluot.blue https://meet.jit.si https://fairmeeting.net https://*.fairmeeting.net https://*.8x8.vc",
                            "media-src 'self' blob: https://*.daily.co https://*.pluot.blue",
                            "object-src 'none'",
                            "base-uri 'self'",
                            "form-action 'self'",
                            "frame-ancestors *",
                        ].filter(Boolean).join("; ").trim(),
                    },
                    {
                        key: "X-XSS-Protection",
                        value: "1; mode=block",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: [
                            'camera=(self "https://*.daily.co" "https://*.pluot.blue" "https://meet.jit.si" "https://fairmeeting.net" "https://*.fairmeeting.net")',
                            'microphone=(self "https://*.daily.co" "https://*.pluot.blue" "https://meet.jit.si" "https://fairmeeting.net" "https://*.fairmeeting.net")',
                            'display-capture=(self "https://meet.jit.si" "https://fairmeeting.net" "https://*.fairmeeting.net")',
                            "geolocation=()",
                            "payment=()",
                            "usb=()",
                            "magnetometer=()",
                            "gyroscope=()",
                            "accelerometer=()",
                        ].join(", "),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
