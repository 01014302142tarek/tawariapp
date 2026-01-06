"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL!,
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_ANON_KEY!
    );
}
