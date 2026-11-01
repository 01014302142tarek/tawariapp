import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Configure allowed dev origins for network access (LAN testing on mobile)
    allowedDevOrigins: [
        "localhost",
        "localhost:3000",
        "127.0.0.1",
        "127.0.0.1:3000",
        "192.168.1.6",
        "192.168.1.6:3000",
    ],

    // Experimental settings including Server Actions allowed origins
    experimental: {
        serverActions: {
            allowedOrigins: [
                "localhost:3000",
                "127.0.0.1:3000",
                "192.168.1.6:3000",
                "192.168.1.6",
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
                    // Note: 'unsafe-inline' is needed for Next.js inline styles
                    // 'unsafe-eval' is needed for some React hydration in development
                    {
                        key: "Content-Security-Policy",
                        value: [
                            // Default sources
                            "default-src 'self'",
                            // Scripts - self + inline for Next.js + Daily.co for video calls
                            `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://*.daily.co https://*.pluot.blue`,
                            // Styles - self + inline for Tailwind
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            // Fonts
                            "font-src 'self' https://fonts.gstatic.com",
                            // Images - allow data: for base64, blob: for uploads, and specific sources
                            "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://images.unsplash.com https://*.daily.co https://*.pluot.blue",
                            // Connect - API calls + Daily.co for video calls + Sentry for Daily's error reporting
                            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://vitals.vercel-insights.com https://*.daily.co https://*.pluot.blue wss://*.daily.co wss://*.pluot.blue https://api.daily.co https://*.ingest.sentry.io https://fairmeeting.net https://*.fairmeeting.net wss://fairmeeting.net wss://*.fairmeeting.net",
                            // Frames - for video calls (Daily.co / Jitsi Meet fallback)
                            "frame-src 'self' https://*.daily.co https://*.pluot.blue https://meet.jit.si https://fairmeeting.net https://*.fairmeeting.net https://*.8x8.vc",
                            // Workers for Daily
                            "worker-src 'self' blob: https://*.daily.co https://*.pluot.blue",
                            // Child frames
                            "child-src 'self' blob: https://*.daily.co https://*.pluot.blue https://meet.jit.si https://fairmeeting.net https://*.fairmeeting.net https://*.8x8.vc",
                            // Media - allow Daily media streams
                            "media-src 'self' blob: https://*.daily.co https://*.pluot.blue",
                            // Objects - disable plugins
                            "object-src 'none'",
                            // Base URI
                            "base-uri 'self'",
                            // Form actions
                            "form-action 'self'",
                            // Frame ancestors - prevent clickjacking
                            "frame-ancestors 'self'",
                            // Upgrade insecure requests in production
                            process.env.NODE_ENV === "production" ? "upgrade-insecure-requests" : "",
                        ].filter(Boolean).join("; ").trim(),
                    },
                    // Prevent XSS attacks
                    {
                        key: "X-XSS-Protection",
                        value: "1; mode=block",
                    },
                    // Prevent MIME type sniffing
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    // Prevent clickjacking
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    // Referrer policy - send referrer only to same origin
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    // Permissions Policy - restrict browser features
                    // Note: camera/microphone need to allow Daily.co iframe domains
                    {
                        key: "Permissions-Policy",
                        value: [
                            'camera=(self "https://*.daily.co" "https://*.pluot.blue" "https://meet.jit.si" "https://fairmeeting.net" "https://*.fairmeeting.net")',  // Allow camera for video calls
                            'microphone=(self "https://*.daily.co" "https://*.pluot.blue" "https://meet.jit.si" "https://fairmeeting.net" "https://*.fairmeeting.net")', // Allow microphone for video calls
                            'display-capture=(self "https://meet.jit.si" "https://fairmeeting.net" "https://*.fairmeeting.net")', // Allow screen sharing
                            "geolocation=()",        // Disable geolocation
                            "payment=()",            // Disable Payment Request API (using Paymob redirect)
                            "usb=()",                // Disable USB
                            "magnetometer=()",       // Disable magnetometer
                            "gyroscope=()",          // Disable gyroscope
                            "accelerometer=()",      // Disable accelerometer
                        ].join(", "),
                    },
                    // Strict Transport Security - force HTTPS
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=31536000; includeSubDomains",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
