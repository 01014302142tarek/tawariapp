"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export type NotificationType =
    | "appointment_reminder"
    | "appointment_confirmation"
    | "appointment_cancelled"
    | "appointment_rescheduled"
    | "new_appointment"
    | "prescription"
    | "prescription_renewal"
    | "message"
    | "new_patient_message"
    | "doctor_verification"
    | "payment_success"
    | "payment_failed"
    | "system";

export interface Notification {
    id: string;
    profile_id: string;
    title: string;
    body: string;
    notification_type: NotificationType;
    data: Record<string, unknown>;
    is_read: boolean;
    read_at?: string;
    is_pushed: boolean;
    pushed_at?: string;
    created_at: string;
}

export interface NotificationWithMeta extends Notification {
    time_ago: string; // Computed field for display
}

// ============================================
// Query Functions
// ============================================

/**
 * Get notifications for the current user
 */
export async function getNotifications(options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
}): Promise<{ notifications: Notification[]; total: number; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { notifications: [], total: 0, error: "Not authenticated" };
    }

    // Get profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { notifications: [], total: 0, error: "Profile not found" };
    }

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    // Build query
    let query = supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (options?.unreadOnly) {
        query = query.eq("is_read", false);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching notifications:", error);
        return { notifications: [], total: 0, error: error.message };
    }

    return {
        notifications: (data || []) as Notification[],
        total: count || 0,
    };
}

/**
 * Get unread notification count for the current user
 */
export async function getUnreadCount(): Promise<{ count: number; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { count: 0, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { count: 0, error: "Profile not found" };
    }

    const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profile.id)
        .eq("is_read", false);

    if (error) {
        console.error("Error getting unread count:", error);
        return { count: 0, error: error.message };
    }

    return { count: count || 0 };
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Mark a single notification as read
 */
export async function markAsRead(
    notificationId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("notifications")
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("profile_id", profile.id);

    if (error) {
        console.error("Error marking notification as read:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllAsRead(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("notifications")
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq("profile_id", profile.id)
        .eq("is_read", false);

    if (error) {
        console.error("Error marking all notifications as read:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Delete a notification
 */
export async function deleteNotification(
    notificationId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("profile_id", profile.id);

    if (error) {
        console.error("Error deleting notification:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============================================
// Internal Creation Functions
// ============================================

/**
 * Create a notification for a user (internal use)
 * This function bypasses RLS by using service role key when needed
 */
export async function createNotification(data: {
    profileId: string;
    title: string;
    body: string;
    notificationType: NotificationType;
    data?: Record<string, unknown>;
}): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: notification, error } = await (supabase as any)
        .from("notifications")
        .insert({
            profile_id: data.profileId,
            title: data.title,
            body: data.body,
            notification_type: data.notificationType,
            data: data.data || {},
            is_read: false,
            is_pushed: false,
        })
        .select("id")
        .single();

    if (error) {
        console.error("Error creating notification:", error);
        return { success: false, error: error.message };
    }

    return { success: true, notificationId: notification?.id };
}

// ============================================
// Helper Functions for Specific Notification Types
// ============================================

/**
 * Notify about appointment confirmation
 */
export async function notifyAppointmentConfirmed(
    patientProfileId: string,
    doctorName: string,
    appointmentDate: string,
    appointmentId: string
): Promise<{ success: boolean; error?: string }> {
    return createNotification({
        profileId: patientProfileId,
        title: "Appointment Confirmed",
        body: `Your appointment with ${doctorName} on ${appointmentDate} has been confirmed.`,
        notificationType: "appointment_confirmation",
        data: { appointmentId },
    });
}

/**
 * Notify about appointment cancellation
 */
export async function notifyAppointmentCancelled(
    profileId: string,
    otherPartyName: string,
    appointmentDate: string,
    appointmentId: string,
    isPatient: boolean
): Promise<{ success: boolean; error?: string }> {
    const title = "Appointment Cancelled";
    const body = isPatient
        ? `Your appointment with ${otherPartyName} on ${appointmentDate} has been cancelled.`
        : `Your appointment with patient ${otherPartyName} on ${appointmentDate} has been cancelled.`;

    return createNotification({
        profileId,
        title,
        body,
        notificationType: "appointment_cancelled",
        data: { appointmentId },
    });
}

/**
 * Notify about new appointment (for doctors)
 */
export async function notifyNewAppointment(
    doctorProfileId: string,
    patientName: string,
    appointmentDate: string,
    appointmentId: string
): Promise<{ success: boolean; error?: string }> {
    return createNotification({
        profileId: doctorProfileId,
        title: "New Appointment",
        body: `New appointment with ${patientName} scheduled for ${appointmentDate}.`,
        notificationType: "new_appointment",
        data: { appointmentId },
    });
}

/**
 * Notify about appointment reminder
 */
export async function notifyAppointmentReminder(
    profileId: string,
    otherPartyName: string,
    appointmentDate: string,
    appointmentId: string,
    isPatient: boolean
): Promise<{ success: boolean; error?: string }> {
    const title = "Appointment Reminder";
    const body = isPatient
        ? `Reminder: Your appointment with ${otherPartyName} is on ${appointmentDate}.`
        : `Reminder: Your appointment with patient ${otherPartyName} is on ${appointmentDate}.`;

    return createNotification({
        profileId,
        title,
        body,
        notificationType: "appointment_reminder",
        data: { appointmentId },
    });
}

/**
 * Notify about new message
 */
export async function notifyNewMessage(
    recipientProfileId: string,
    senderName: string,
    conversationId: string
): Promise<{ success: boolean; error?: string }> {
    return createNotification({
        profileId: recipientProfileId,
        title: "New Message",
        body: `You have a new message from ${senderName}.`,
        notificationType: "message",
        data: { conversationId },
    });
}

/**
 * Notify about prescription
 */
export async function notifyPrescriptionIssued(
    patientProfileId: string,
    doctorName: string,
    medicationName: string,
    prescriptionId: string
): Promise<{ success: boolean; error?: string }> {
    return createNotification({
        profileId: patientProfileId,
        title: "New Prescription",
        body: `${doctorName} has prescribed ${medicationName} for you.`,
        notificationType: "prescription",
        data: { prescriptionId },
    });
}

/**
 * Notify about prescription renewal request
 */
export async function notifyRenewalRequest(
    doctorProfileId: string,
    patientName: string,
    medicationName: string,
    requestId: string
): Promise<{ success: boolean; error?: string }> {
    return createNotification({
        profileId: doctorProfileId,
        title: "Prescription Renewal Request",
        body: `${patientName} has requested a renewal for ${medicationName}.`,
        notificationType: "prescription_renewal",
        data: { requestId },
    });
}

/**
 * Notify about prescription renewal response
 */
export async function notifyRenewalResponse(
    patientProfileId: string,
    medicationName: string,
    approved: boolean,
    prescriptionId?: string
): Promise<{ success: boolean; error?: string }> {
    const title = approved ? "Renewal Approved" : "Renewal Denied";
    const body = approved
        ? `Your renewal request for ${medicationName} has been approved.`
        : `Your renewal request for ${medicationName} has been denied. Please schedule a follow-up consultation.`;

    return createNotification({
        profileId: patientProfileId,
        title,
        body,
        notificationType: "prescription_renewal",
        data: { prescriptionId, approved },
    });
}

/**
 * Notify about payment success
 */
export async function notifyPaymentSuccess(
    patientProfileId: string,
    amount: number,
    transactionId: string
): Promise<{ success: boolean; error?: string }> {
    return createNotification({
        profileId: patientProfileId,
        title: "Payment Successful",
        body: `Your payment of ${amount} EGP has been processed successfully.`,
        notificationType: "payment_success",
        data: { transactionId, amount },
    });
}

/**
 * Notify about doctor verification status change
 */
export async function notifyVerificationStatus(
    doctorProfileId: string,
    approved: boolean,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    const title = approved ? "Verification Approved" : "Verification Update";
    const body = approved
        ? "Congratulations! Your account has been verified. You can now accept appointments."
        : `Your verification status has been updated. ${reason || "Please check your dashboard for details."}`;

    return createNotification({
        profileId: doctorProfileId,
        title,
        body,
        notificationType: "doctor_verification",
        data: { approved, reason },
    });
}
