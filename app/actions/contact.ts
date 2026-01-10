"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface ContactSubmissionResult {
    success: boolean;
    error?: string;
}

// ============================================
// Contact Form Actions
// ============================================

/**
 * Submit a contact form message
 * This stores the message in the contact_submissions table
 * and can be used by both authenticated and unauthenticated users
 */
export async function submitContactForm(
    data: ContactFormData
): Promise<ContactSubmissionResult> {
    // Validate input
    if (!data.name || data.name.trim().length < 2) {
        return { success: false, error: "Name must be at least 2 characters" };
    }

    if (!data.email || !isValidEmail(data.email)) {
        return { success: false, error: "Please provide a valid email address" };
    }

    if (!data.subject || data.subject.trim().length < 3) {
        return { success: false, error: "Subject must be at least 3 characters" };
    }

    if (!data.message || data.message.trim().length < 10) {
        return { success: false, error: "Message must be at least 10 characters" };
    }

    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Insert into contact_submissions table
    // Note: Table is created via migration 00004_contact_submissions.sql
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("contact_submissions")
        .insert({
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            subject: data.subject.trim(),
            message: data.message.trim(),
            user_id: user?.id || null,
            status: "new",
        });

    if (error) {
        console.error("Error submitting contact form:", error);
        return { success: false, error: "Failed to submit message. Please try again later." };
    }

    return { success: true };
}

// ============================================
// Helper Functions
// ============================================

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
