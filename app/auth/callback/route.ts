import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Allowed redirect paths to prevent open redirect attacks
const ALLOWED_REDIRECT_PREFIXES = [
    "/en/dashboard",
    "/ar/dashboard",
    "/en/",
    "/ar/",
];

// Default to generic /dashboard - proxy/middleware will redirect to role-specific dashboard
const DEFAULT_REDIRECT = "/ar/dashboard";

/**
 * Validates redirect URL to prevent open redirect attacks
 * Only allows relative paths that start with allowed prefixes
 */
function isValidRedirectUrl(url: string): boolean {
    if (!url.startsWith("/")) return false;
    if (url.startsWith("//")) return false;
    if (url.includes("%") || url.includes("\\")) return false;
    return ALLOWED_REDIRECT_PREFIXES.some(prefix => url.startsWith(prefix));
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const requestedNext = searchParams.get("next");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // If OAuth provider returned an explicit error (e.g., user denied access)
    if (errorParam) {
        console.error("[AuthCallback] OAuth provider returned error:", errorParam, errorDescription);
        const errUrl = new URL(`${origin}/auth/auth-code-error`);
        if (errorDescription) {
            errUrl.searchParams.set("error_description", errorDescription);
        }
        return NextResponse.redirect(errUrl);
    }

    // Validate and sanitize redirect URL
    const next = requestedNext && isValidRedirectUrl(requestedNext)
        ? requestedNext
        : DEFAULT_REDIRECT;

    if (code) {
        const supabase = await createClient();
        const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && sessionData?.user) {
            const user = sessionData.user;

            // Ensure profile exists in database (fallback in case DB trigger didn't run or needs sync)
            try {
                const adminClient = await createAdminClient();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: existingProfile } = await (adminClient as any)
                    .from("profiles")
                    .select("id, role, full_name, avatar_url")
                    .eq("user_id", user.id)
                    .maybeSingle();

                const meta = user.user_metadata || {};
                const fullName = (meta.full_name || meta.name || meta.fullName || user.email?.split("@")[0] || "User").trim();
                const avatarUrl = meta.avatar_url || meta.picture || null;

                if (!existingProfile) {
                    // Create base profile
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { data: newProfile, error: profileError } = await (adminClient as any)
                        .from("profiles")
                        .insert({
                            user_id: user.id,
                            full_name: fullName,
                            role: "patient",
                            avatar_url: avatarUrl,
                        })
                        .select("id")
                        .single();

                    if (!profileError && newProfile) {
                        // Create patient profile
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await (adminClient as any)
                            .from("patient_profiles")
                            .insert({ profile_id: newProfile.id })
                            .maybeSingle();
                    }
                } else if (
                    (!existingProfile.avatar_url && avatarUrl) ||
                    (existingProfile.full_name === "New User" && fullName !== "New User")
                ) {
                    // Update profile with fresh metadata from Google
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (adminClient as any)
                        .from("profiles")
                        .update({
                            full_name: existingProfile.full_name === "New User" ? fullName : existingProfile.full_name,
                            avatar_url: existingProfile.avatar_url || avatarUrl,
                        })
                        .eq("id", existingProfile.id);
                }
            } catch (profileSyncErr) {
                console.error("[AuthCallback] Profile sync fallback warning:", profileSyncErr);
                // Continue with login even if profile sync encountered an issue
            }

            const forwardedHost = request.headers.get("x-forwarded-host");
            const isLocalEnv = process.env.NODE_ENV === "development";
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        } else if (error) {
            console.error("[AuthCallback] exchangeCodeForSession failed:", error.message);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
