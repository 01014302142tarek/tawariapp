import { createClient, createAdminClient } from "@/lib/supabase/server";
import { signInWithGoogleAccount } from "@/app/actions/auth";
import { getGoogleOAuthRedirectUri, getPublicOrigin } from "@/lib/env";
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
    return ALLOWED_REDIRECT_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function buildSuccessCompletionResponse(redirectPath: string, fullRedirectUrl: string) {
    const safePath = JSON.stringify(redirectPath);
    const safeFullUrl = JSON.stringify(fullRedirectUrl);
    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>جاري تسجيل الدخول عبر Google...</title>
  </head>
  <body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #0f172a;">
    <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
      <p style="font-size: 1rem; font-weight: 600; margin: 0 0 0.5rem;">تم تسجيل الدخول بنجاح عبر Google</p>
      <p style="font-size: 0.875rem; color: #64748b; margin: 0;">جاري تحويلك تلقائياً...</p>
    </div>
    <script>
      (function() {
        var nextPath = ${safePath};
        var fallbackUrl = ${safeFullUrl};
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', redirectUrl: nextPath }, '*');
            window.close();
            return;
          } catch (e) {}
        }
        window.location.replace(fallbackUrl);
      })();
    </script>
  </body>
</html>`;

    return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    let requestedNext = searchParams.get("next");
    const stateParam = searchParams.get("state");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    let directGoogle = false;
    let preferredRole: "patient" | "doctor" = "patient";

    if (stateParam) {
        try {
            const parsedState = JSON.parse(
                Buffer.from(stateParam, "base64url").toString("utf-8")
            );
            if (parsedState && typeof parsedState === "object") {
                if (typeof parsedState.next === "string" && !requestedNext) {
                    requestedNext = parsedState.next;
                }
                if (parsedState.role === "doctor") {
                    preferredRole = "doctor";
                }
                if (parsedState.directGoogle === true) {
                    directGoogle = true;
                }
            }
        } catch {
            // Ignore malformed state parameter
        }
    }

    // If OAuth provider returned an explicit error (e.g., user denied access)
    if (errorParam) {
        console.error("[AuthCallback] OAuth provider returned error:", errorParam, errorDescription);
        const errUrl = new URL(`${origin}/ar/auth-code-error`);
        if (errorDescription) {
            errUrl.searchParams.set("error_description", errorDescription);
        }
        return NextResponse.redirect(errUrl);
    }

    // Validate and sanitize redirect URL
    const next =
        requestedNext && isValidRedirectUrl(requestedNext)
            ? requestedNext
            : DEFAULT_REDIRECT;

    const resolvedOrigin = getPublicOrigin(request);

    if (code && directGoogle) {
        const googleClientId =
            process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID || "";
        const googleClientSecret =
            process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET || "";
        const errorLang = next.startsWith("/en/") ? "en" : "ar";
        const fail = (message: string) => {
            const errUrl = new URL(`${resolvedOrigin}/${errorLang}/auth-code-error`);
            errUrl.searchParams.set(
                "error_description",
                message.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
            );
            return NextResponse.redirect(errUrl);
        };

        if (!googleClientId || !googleClientSecret) {
            return fail("Google OAuth is not configured on the server.");
        }

        try {
            const redirectUri = getGoogleOAuthRedirectUri();
            const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    code,
                    client_id: googleClientId.trim(),
                    client_secret: googleClientSecret.trim(),
                    redirect_uri: redirectUri,
                    grant_type: "authorization_code",
                }),
            });
            const tokenPayload = await tokenRes.json().catch(() => ({}));
            if (!tokenRes.ok || !tokenPayload.access_token) {
                const lastTokenError =
                    tokenPayload.error_description ||
                    tokenPayload.error ||
                    `Google token HTTP ${tokenRes.status}`;
                console.error(
                    "[AuthCallback] Google token exchange failed:",
                    redirectUri,
                    lastTokenError
                );
                return fail(String(lastTokenError));
            }
            const tokens = tokenPayload as { access_token: string };

            const userRes = await fetch(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                {
                    headers: {
                        Authorization: `Bearer ${tokens.access_token}`,
                    },
                }
            );
            if (!userRes.ok) {
                return fail("Could not load the Google account profile.");
            }

            const googleUser = await userRes.json();
            if (!googleUser?.email) {
                return fail("Google did not return an email address.");
            }

            const result = await signInWithGoogleAccount({
                email: googleUser.email,
                fullName: googleUser.name,
                avatarUrl: googleUser.picture,
                role: preferredRole,
            });
            if (result.success) {
                return buildSuccessCompletionResponse(
                    next,
                    `${resolvedOrigin}${next}`
                );
            }

            return fail(result.error || "Could not create a local session for this Google account.");
        } catch (directErr) {
            console.error("[AuthCallback] Direct Google OAuth exchange error:", directErr);
            return fail("Google sign-in failed unexpectedly. Please try again.");
        }
    }

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
                const fullName = (
                    meta.full_name ||
                    meta.name ||
                    meta.fullName ||
                    user.email?.split("@")[0] ||
                    "User"
                ).trim();
                const avatarUrl = meta.avatar_url || meta.picture || null;

                if (!existingProfile) {
                    // Create base profile
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { data: newProfile, error: profileError } = await (adminClient as any)
                        .from("profiles")
                        .insert({
                            user_id: user.id,
                            full_name: fullName,
                            role: preferredRole,
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
                            full_name:
                                existingProfile.full_name === "New User"
                                    ? fullName
                                    : existingProfile.full_name,
                            avatar_url: existingProfile.avatar_url || avatarUrl,
                        })
                        .eq("id", existingProfile.id);
                }
            } catch (profileSyncErr) {
                console.error("[AuthCallback] Profile sync fallback warning:", profileSyncErr);
                // Continue with login even if profile sync encountered an issue
            }

            return buildSuccessCompletionResponse(next, `${resolvedOrigin}${next}`);
        } else if (error) {
            console.error("[AuthCallback] exchangeCodeForSession failed:", error.message);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${resolvedOrigin}/ar/auth-code-error`);
}

