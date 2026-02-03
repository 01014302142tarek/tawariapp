"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { loginLimiter, passwordResetLimiter } from "@/lib/rate-limit";
import { headers } from "next/headers";

/**
 * Get client identifier for rate limiting
 * Uses email for auth endpoints to prevent account enumeration
 */
async function getClientIP(): Promise<string> {
    const headersList = await headers();
    // Check common headers for client IP (Vercel, Cloudflare, etc.)
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }
    const realIP = headersList.get("x-real-ip");
    if (realIP) {
        return realIP;
    }
    return "unknown";
}

/**
 * Sign in with email and password
 * Rate limited: 5 attempts per 15 minutes per email
 */
export async function signInWithPassword(
    email: string,
    password: string
): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
    // Normalize email for rate limiting
    const normalizedEmail = email.toLowerCase().trim();
    const rateLimitKey = `login:${normalizedEmail}`;

    // Check rate limit
    const rateLimit = await loginLimiter.check(rateLimitKey);
    if (!rateLimit.allowed) {
        return {
            success: false,
            error: "Too many login attempts. Please try again later.",
            retryAfter: rateLimit.retryAfter ?? undefined,
        };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
    });

    if (error) {
        return {
            success: false,
            error: "Invalid email or password",
        };
    }

    // Reset rate limit on successful login
    await loginLimiter.reset(rateLimitKey);

    return { success: true };
}

/**
 * Sign up with email and password (for patients - auto-confirms email)
 * Uses admin API to bypass email confirmation for patients
 * Rate limited: 5 attempts per 15 minutes per IP
 */
export async function signUpWithPassword(
    email: string,
    password: string,
    metadata?: { fullName?: string; phone?: string; role?: string }
): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
    const clientIP = await getClientIP();
    const rateLimitKey = `signup:${clientIP}`;

    // Check rate limit
    const rateLimit = await loginLimiter.check(rateLimitKey);
    if (!rateLimit.allowed) {
        return {
            success: false,
            error: "Too many signup attempts. Please try again later.",
            retryAfter: rateLimit.retryAfter ?? undefined,
        };
    }

    try {
        const adminClient = await createAdminClient();
        const normalizedEmail = email.toLowerCase().trim();

        // Create user with admin API and auto-confirm email for patients
        const { data, error: createError } = await adminClient.auth.admin.createUser({
            email: normalizedEmail,
            password,
            email_confirm: true, // Auto-confirm for patients - no email verification needed
            user_metadata: {
                full_name: metadata?.fullName,
                phone: metadata?.phone,
                role: metadata?.role || "patient",
            },
        });

        if (createError) {
            // Handle duplicate email error specifically
            if (createError.message.includes("already been registered") ||
                createError.message.includes("already exists")) {
                return {
                    success: false,
                    error: "An account with this email already exists. Please sign in instead.",
                };
            }
            return {
                success: false,
                error: createError.message,
            };
        }

        if (!data.user) {
            return {
                success: false,
                error: "Failed to create user account",
            };
        }

        // Sign in the user to establish a session
        const supabase = await createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
        });

        if (signInError) {
            return {
                success: false,
                error: "Account created but sign-in failed. Please try logging in.",
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Patient signup error:", error);
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}

/**
 * Request password reset email
 * Rate limited: 3 attempts per hour per email
 */
export async function requestPasswordReset(
    email: string,
    redirectTo: string
): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
    // Normalize email for rate limiting
    const normalizedEmail = email.toLowerCase().trim();
    const rateLimitKey = `reset:${normalizedEmail}`;

    // Check rate limit
    const rateLimit = await passwordResetLimiter.check(rateLimitKey);
    if (!rateLimit.allowed) {
        return {
            success: false,
            error: "Too many reset attempts. Please try again later.",
            retryAfter: rateLimit.retryAfter ?? undefined,
        };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo,
    });

    if (error) {
        // Don't reveal if email exists or not
        // Always return success to prevent enumeration
        return { success: true };
    }

    return { success: true };
}

/**
 * Update password (for reset flow)
 * Rate limited by session - user must be authenticated
 */
export async function updatePassword(
    newPassword: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    return { success: true };
}

/**
 * Sign out the current user
 * For doctors: automatically sets is_available_now to false
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        // Get current user before signing out
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Check if user is a doctor and set availability to false
            const { data: profileData } = await supabase
                .from("profiles")
                .select("id, role")
                .eq("user_id", user.id)
                .single();

            const profile = profileData as { id: string; role: string } | null;

            if (profile && profile.role === "doctor") {
                // Get doctor profile
                const { data: doctorProfileData } = await supabase
                    .from("doctor_profiles")
                    .select("id")
                    .eq("profile_id", profile.id)
                    .single();

                const doctorProfile = doctorProfileData as { id: string } | null;

                if (doctorProfile) {
                    // Set doctor as unavailable before logout
                    console.log("[Auth] Setting doctor unavailable on logout:", doctorProfile.id);

                    try {
                        // Use regular client - the user is still authenticated at this point
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const { error: updateError } = await (supabase as any)
                            .from("doctor_profiles")
                            .update({ is_available_now: false })
                            .eq("id", doctorProfile.id);

                        if (updateError) {
                            console.error("[Auth] Error setting doctor unavailable:", updateError);
                            // Continue with logout even if update fails
                        } else {
                            console.log("[Auth] Doctor set to unavailable successfully");
                        }
                    } catch (updateErr) {
                        console.error("[Auth] Error updating doctor availability:", updateErr);
                        // Continue with logout even if update fails
                    }
                }
            }
        }

        // Proceed with sign out
        const { error } = await supabase.auth.signOut();

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return { success: true };
    } catch (error) {
        console.error("[Auth] Unexpected error during signOut:", error);
        return {
            success: false,
            error: "An unexpected error occurred during sign out",
        };
    }
}

/**
 * Sign up a doctor with email and password (auto-confirms for onboarding flow)
 * Uses admin API with email_confirm: true to auto-confirm, then signs in the user
 * This allows doctors to proceed through the onboarding flow immediately
 * Rate limited: 5 attempts per 15 minutes per IP
 */
export async function signUpDoctor(
    email: string,
    password: string,
    metadata?: { fullName?: string; phone?: string }
): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
    const clientIP = await getClientIP();
    const rateLimitKey = `signup:${clientIP}`;

    // Check rate limit
    const rateLimit = await loginLimiter.check(rateLimitKey);
    if (!rateLimit.allowed) {
        return {
            success: false,
            error: "Too many signup attempts. Please try again later.",
            retryAfter: rateLimit.retryAfter ?? undefined,
        };
    }

    try {
        const adminClient = await createAdminClient();
        const normalizedEmail = email.toLowerCase().trim();

        // Create user with admin API and auto-confirm email for doctors
        // This allows the onboarding flow to proceed immediately after signup
        const { data, error: createError } = await adminClient.auth.admin.createUser({
            email: normalizedEmail,
            password,
            email_confirm: true, // Auto-confirm for doctors - enables immediate onboarding
            user_metadata: {
                full_name: metadata?.fullName,
                phone: metadata?.phone,
                role: "doctor",
            },
        });

        if (createError) {
            // Handle duplicate email error specifically
            if (createError.message.includes("already been registered") ||
                createError.message.includes("already exists")) {
                return {
                    success: false,
                    error: "An account with this email already exists. Please sign in instead.",
                };
            }
            return {
                success: false,
                error: createError.message,
            };
        }

        if (!data.user) {
            return {
                success: false,
                error: "Failed to create user account",
            };
        }

        // Sign in the user to establish a session
        // This is required for the onboarding flow to proceed to steps 2-4
        const supabase = await createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
        });

        if (signInError) {
            return {
                success: false,
                error: "Account created but sign-in failed. Please try logging in.",
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Doctor signup error:", error);
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}
