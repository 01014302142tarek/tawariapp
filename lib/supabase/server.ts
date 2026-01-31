import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

export async function createClient() {
    const cookieStore = await cookies();
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL;
    const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables");
    }

    return createServerClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
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
    const cookieStore = await cookies();
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Missing Supabase environment variables");
    }

    return createServerClient<Database>(
        supabaseUrl,
        serviceRoleKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Ignore - called from Server Component
                    }
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

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Missing Supabase environment variables");
    }

    return createServerClient<Database>(
        supabaseUrl,
        serviceRoleKey,
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
