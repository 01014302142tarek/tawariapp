import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthRedirectUri, getPublicOrigin } from "@/lib/env";
import { isSupabaseConfigured } from "@/lib/supabase/mock";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const next = searchParams.get("next") || "/ar/dashboard";
    const role = searchParams.get("role") === "doctor" ? "doctor" : "patient";

    const googleClientId =
        process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID || "";
    const googleClientSecret =
        process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET || "";

    const origin = getPublicOrigin(request);

    if (
        googleClientId.trim() &&
        googleClientSecret.trim() &&
        !googleClientId.includes("YOUR_")
    ) {
        const redirectUri = getGoogleOAuthRedirectUri(request);
        const statePayload = JSON.stringify({
            next,
            role,
            directGoogle: true,
        });
        const params = new URLSearchParams({
            client_id: googleClientId.trim(),
            redirect_uri: redirectUri,
            response_type: "code",
            scope: "openid email profile",
            access_type: "online",
            prompt: "select_account",
            state: Buffer.from(statePayload, "utf-8").toString("base64url"),
        });

        return NextResponse.json({
            mode: "google_oauth",
            url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
            callbackUrl: redirectUri,
        });
    }

    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL;
    const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_ANON_KEY;

    if (isSupabaseConfigured(supabaseUrl, supabaseAnonKey)) {
        return NextResponse.json({
            mode: "supabase_oauth",
            callbackUrl: `${origin}/auth/callback`,
        });
    }

    return NextResponse.json({
        mode: "interactive_chooser",
        callbackUrl: `${origin}/auth/callback`,
    });
}
