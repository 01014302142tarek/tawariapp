import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Allowed redirect paths to prevent open redirect attacks
const ALLOWED_REDIRECT_PREFIXES = [
    "/en/dashboard",
    "/ar/dashboard",
    "/en/",
    "/ar/",
];

// Default to generic /dashboard - middleware will redirect to role-specific dashboard
const DEFAULT_REDIRECT = "/en/dashboard";

/**
 * Validates redirect URL to prevent open redirect attacks
 * Only allows relative paths that start with allowed prefixes
 */
function isValidRedirectUrl(url: string): boolean {
    // Must be a relative path starting with /
    if (!url.startsWith("/")) return false;

    // Block protocol-relative URLs (//evil.com)
    if (url.startsWith("//")) return false;

    // Block URLs with encoded characters that could bypass checks
    if (url.includes("%") || url.includes("\\")) return false;

    // Must start with an allowed prefix
    return ALLOWED_REDIRECT_PREFIXES.some(prefix => url.startsWith(prefix));
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const requestedNext = searchParams.get("next");

    // Validate and sanitize redirect URL
    const next = requestedNext && isValidRedirectUrl(requestedNext)
        ? requestedNext
        : DEFAULT_REDIRECT;

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            const forwardedHost = request.headers.get("x-forwarded-host");
            const isLocalEnv = process.env.NODE_ENV === "development";
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
