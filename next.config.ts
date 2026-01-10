import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
                            // Scripts - self + inline for Next.js
                            `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com`,
                            // Styles - self + inline for Tailwind
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            // Fonts
                            "font-src 'self' https://fonts.gstatic.com",
                            // Images - allow data: for base64, blob: for uploads, and specific sources
                            "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://images.unsplash.com",
                            // Connect - API calls
                            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://vitals.vercel-insights.com",
                            // Frames - for video calls (Jitsi)
                            "frame-src 'self' https://meet.jit.si https://*.jitsi.net",
                            // Media
                            "media-src 'self' blob:",
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
                    {
                        key: "Permissions-Policy",
                        value: [
                            "camera=(self)",         // Allow camera for video calls
                            "microphone=(self)",     // Allow microphone for video calls
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
