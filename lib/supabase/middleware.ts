import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

export type UserRole = "patient" | "doctor" | "admin";

export interface SessionUser {
    id: string;
    email?: string;
    role: UserRole;
    user_metadata?: Record<string, unknown>;
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL!,
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired - required for Server Components
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If user exists, fetch their role from the database for security
    // This prevents role manipulation via user_metadata
    let sessionUser: SessionUser | null = null;

    if (user) {
        const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("user_id", user.id)
            .single();

        const profile = profileData as { role: UserRole } | null;

        sessionUser = {
            id: user.id,
            email: user.email,
            role: profile?.role || "patient", // Fallback to patient if no profile
            user_metadata: user.user_metadata,
        };
    }

    return { supabaseResponse, user: sessionUser };
}
