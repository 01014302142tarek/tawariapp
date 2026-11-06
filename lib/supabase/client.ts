"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import {
    createMockSupabaseClient,
    isSupabaseConfigured,
    MOCK_SESSION_COOKIE,
} from "@/lib/supabase/mock";

let browserMockClient: ReturnType<typeof createMockSupabaseClient> | null = null;

function readBrowserSessionCookie(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${MOCK_SESSION_COOKIE}=`));
    return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function writeBrowserSessionCookie(email: string | null) {
    if (typeof document === "undefined") return;
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const sameSiteAttr = isHttps ? "samesite=none; secure" : "samesite=lax";
    if (email) {
        document.cookie = `${MOCK_SESSION_COOKIE}=${encodeURIComponent(email)}; path=/; max-age=${60 * 60 * 24 * 7}; ${sameSiteAttr}`;
    } else {
        document.cookie = `${MOCK_SESSION_COOKIE}=; path=/; max-age=0; ${sameSiteAttr}`;
    }
}

export function createClient() {
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL;
    const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_ANON_KEY;

    if (!isSupabaseConfigured(supabaseUrl, supabaseAnonKey)) {
        if (!browserMockClient) {
            browserMockClient = createMockSupabaseClient({
                getSessionEmail: readBrowserSessionCookie,
                setSessionEmail: writeBrowserSessionCookie,
            });
        }
        return browserMockClient;
    }

    return createBrowserClient<Database>(
        supabaseUrl!,
        supabaseAnonKey!
    );
}
