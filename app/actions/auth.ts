"use server";

import { createClient } from "@/lib/supabase/server";
import { loginLimiter, passwordResetLimiter, rateLimitResponse } from "@/lib/rate-limit";
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
 * Sign up with email and password
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

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
            data: {
                full_name: metadata?.fullName,
                phone: metadata?.phone,
                role: metadata?.role || "patient",
            },
        },
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
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    return { success: true };
}
