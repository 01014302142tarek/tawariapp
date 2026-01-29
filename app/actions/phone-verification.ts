"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// Phone Number Validation
// ============================================

/**
 * Egyptian phone number formats:
 * - Mobile: 01xxxxxxxxx (11 digits starting with 01)
 * - With country code: +201xxxxxxxxx or 00201xxxxxxxxx
 * - Operators: 010, 011, 012, 015 (Vodafone, Etisalat, Orange, WE)
 */

// Regex for Egyptian phone numbers
const EGYPT_PHONE_REGEX = /^(?:\+20|0020|0)?1[0125]\d{8}$/;

/**
 * Validates and normalizes an Egyptian phone number
 * Returns the normalized format (+201xxxxxxxxx) or null if invalid
 */
export async function validateEgyptianPhone(phone: string): Promise<{ valid: boolean; normalized: string | null; error?: string }> {
    // Remove all spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");

    if (!cleaned) {
        return { valid: false, normalized: null, error: "Phone number is required" };
    }

    // Check if it matches Egyptian format
    if (!EGYPT_PHONE_REGEX.test(cleaned)) {
        return {
            valid: false,
            normalized: null,
            error: "Invalid Egyptian phone number. Use format: 01xxxxxxxxx or +201xxxxxxxxx"
        };
    }

    // Normalize to +20 format
    let normalized = cleaned;
    if (normalized.startsWith("0020")) {
        normalized = "+" + normalized.slice(2);
    } else if (normalized.startsWith("0")) {
        normalized = "+2" + normalized;
    } else if (!normalized.startsWith("+")) {
        normalized = "+20" + normalized;
    }

    return { valid: true, normalized };
}

/**
 * Check if phone number is already registered
 */
export async function checkPhoneExists(phone: string): Promise<{ exists: boolean; error?: string }> {
    const { valid, normalized, error: validationError } = await validateEgyptianPhone(phone);

    if (!valid || !normalized) {
        return { exists: false, error: validationError };
    }

    const supabase = await createClient();

    // Check in profiles table
    const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", normalized)
        .maybeSingle();

    if (error) {
        console.error("Error checking phone:", error);
        return { exists: false, error: "Failed to check phone number" };
    }

    return { exists: !!data };
}

// ============================================
// OTP Verification
// ============================================

/**
 * Send OTP to phone number using Supabase phone auth
 */
export async function sendPhoneOTP(phone: string): Promise<{ success: boolean; error?: string }> {
    const { valid, normalized, error: validationError } = await validateEgyptianPhone(phone);

    if (!valid || !normalized) {
        return { success: false, error: validationError };
    }

    const supabase = await createClient();

    try {
        const { error } = await supabase.auth.signInWithOtp({
            phone: normalized,
            options: {
                // Don't create a user, just send OTP for verification
                shouldCreateUser: false,
            }
        });

        if (error) {
            // If error is about user not existing, that's expected for verification-only
            if (error.message.includes("User not found") || error.message.includes("not found")) {
                // Try alternative: use the signUp flow for OTP
                const { error: signUpError } = await supabase.auth.signInWithOtp({
                    phone: normalized,
                });

                if (signUpError) {
                    console.error("Error sending OTP:", signUpError);
                    return {
                        success: false,
                        error: signUpError.message || "Failed to send verification code"
                    };
                }
            } else {
                console.error("Error sending OTP:", error);
                return { success: false, error: error.message || "Failed to send verification code" };
            }
        }

        return { success: true };
    } catch (err) {
        console.error("Error in sendPhoneOTP:", err);
        return { success: false, error: "Failed to send verification code. Please try again." };
    }
}

/**
 * Verify OTP code for phone number
 */
export async function verifyPhoneOTP(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
    const { valid, normalized, error: validationError } = await validateEgyptianPhone(phone);

    if (!valid || !normalized) {
        return { success: false, error: validationError };
    }

    if (!code || code.length !== 6) {
        return { success: false, error: "Please enter a valid 6-digit code" };
    }

    const supabase = await createClient();

    try {
        const { error } = await supabase.auth.verifyOtp({
            phone: normalized,
            token: code,
            type: "sms"
        });

        if (error) {
            console.error("Error verifying OTP:", error);
            if (error.message.includes("expired")) {
                return { success: false, error: "Code has expired. Please request a new one." };
            }
            if (error.message.includes("invalid")) {
                return { success: false, error: "Invalid code. Please check and try again." };
            }
            return { success: false, error: error.message || "Verification failed" };
        }

        return { success: true };
    } catch (err) {
        console.error("Error in verifyPhoneOTP:", err);
        return { success: false, error: "Verification failed. Please try again." };
    }
}

/**
 * Simple validation check (no OTP, just format validation)
 * Use this for cases where full OTP verification isn't required
 */
export async function validatePhoneNumber(phone: string): Promise<{
    valid: boolean;
    normalized: string | null;
    error?: string;
    alreadyExists?: boolean;
}> {
    const validation = await validateEgyptianPhone(phone);

    if (!validation.valid) {
        return validation;
    }

    // Check if phone already exists
    const existsCheck = await checkPhoneExists(phone);

    if (existsCheck.exists) {
        return {
            valid: false,
            normalized: validation.normalized,
            error: "This phone number is already registered",
            alreadyExists: true
        };
    }

    return validation;
}
