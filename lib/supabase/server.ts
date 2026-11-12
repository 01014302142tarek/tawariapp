import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import {
    createMockSupabaseClient,
    isSupabaseConfigured,
    MOCK_SESSION_COOKIE,
} from "@/lib/supabase/mock";

async function isHttpsRequest(): Promise<boolean> {
    try {
        const hdrs = await headers();
        const proto = hdrs.get("x-forwarded-proto");
        if (proto) {
            return proto.split(",")[0].trim() === "https";
        }
    } catch {
        // Ignore if headers() is unavailable in context
    }
    return Boolean(process.env.APP_URL?.startsWith("https://"));
}

export async function createClient() {
    const cookieStore = await cookies();
    const isHttps = await isHttpsRequest();
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL;
    const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_ANON_KEY;

    if (!isSupabaseConfigured(supabaseUrl, supabaseAnonKey)) {
        return createMockSupabaseClient({
            getSessionEmail: () => cookieStore.get(MOCK_SESSION_COOKIE)?.value ?? null,
            setSessionEmail: (email) => {
                try {
                    if (email) {
                        cookieStore.set(MOCK_SESSION_COOKIE, email, {
                            path: "/",
                            maxAge: 60 * 60 * 24 * 7,
                            sameSite: isHttps ? "none" : "lax",
                            secure: isHttps,
                        });
                    } else {
                        cookieStore.delete(MOCK_SESSION_COOKIE);
                    }
                } catch {
                    // Ignore when called from a Server Component
                }
            },
        });
    }

    return createServerClient<Database>(
        supabaseUrl!,
        supabaseAnonKey!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, {
                                ...options,
                                ...(isHttps ? { sameSite: "none", secure: true } : {}),
                            })
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

// Admin client with service role for server-side operations that bypass RLS
export async function createAdminClient() {
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!isSupabaseConfigured(supabaseUrl, serviceRoleKey)) {
        const cookieStore = await cookies();
        return createMockSupabaseClient({
            getSessionEmail: () => cookieStore.get(MOCK_SESSION_COOKIE)?.value ?? null,
        });
    }

    // Do NOT pass cookies here: passing user session cookies causes @supabase/ssr
    // to attach the user's JWT, which evaluates user RLS instead of the service role!
    return createServerClient<Database>(
        supabaseUrl!,
        serviceRoleKey!,
        {
            cookies: {
                getAll() {
                    return [];
                },
                setAll() {
                    // No-op for admin client
                },
            },
        }
    );
}

// Service-role client without cookies (safe to use inside cached functions)
export async function createServiceRoleClient() {
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!isSupabaseConfigured(supabaseUrl, serviceRoleKey)) {
        return createMockSupabaseClient();
    }

    return createServerClient<Database>(
        supabaseUrl!,
        serviceRoleKey!,
        {
            cookies: {
                getAll() {
                    return [];
                },
                setAll(cookiesToSet) {
                    // No-op: avoid touching request cookies in cached scopes
                    void cookiesToSet;
                },
            },
        }
    );
}
