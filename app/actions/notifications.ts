"use server";

import { createClient, createAdminClient, createServiceRoleClient } from "@/lib/supabase/server";

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
    type?: NotificationType;
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

    if (options?.type) {
        query = query.eq("notification_type", options.type);
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
    let adminSupabase;
    try {
        adminSupabase = await createServiceRoleClient();
    } catch {
        adminSupabase = await createAdminClient();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: notification, error } = await (adminSupabase as any)
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
    const title_en = "Appointment Confirmed ✅";
    const title_ar = "تم تأكيد موعد الاستشارة ✅";
    const body_en = `Your appointment with Dr. ${doctorName} on ${appointmentDate} has been confirmed.`;
    const body_ar = `تم تأكيد موعدك مع د. ${doctorName} بتاريخ ${appointmentDate}.`;

    return createNotification({
        profileId: patientProfileId,
        title: title_en,
        body: body_en,
        notificationType: "appointment_confirmation",
        data: {
            title_ar,
            title_en,
            body_ar,
            body_en,
            appointmentId,
        },
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
    isPatient: boolean,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    const title_en = "Appointment Cancelled ❌";
    const title_ar = "تم إلغاء الموعد ❌";
    const reasonTextAr = reason ? ` (سبب الإلغاء: ${reason})` : "";
    const reasonTextEn = reason ? ` (Reason: ${reason})` : "";

    const body_en = isPatient
        ? `Your appointment with Dr. ${otherPartyName} on ${appointmentDate} has been cancelled.${reasonTextEn}`
        : `Your appointment with patient ${otherPartyName} on ${appointmentDate} has been cancelled.${reasonTextEn}`;
    const body_ar = isPatient
        ? `تم إلغاء موعدك مع د. ${otherPartyName} بتاريخ ${appointmentDate}.${reasonTextAr}`
        : `تم إلغاء موعدك مع المريض ${otherPartyName} بتاريخ ${appointmentDate}.${reasonTextAr}`;

    return createNotification({
        profileId,
        title: title_en,
        body: body_en,
        notificationType: "appointment_cancelled",
        data: {
            title_ar,
            title_en,
            body_ar,
            body_en,
            appointmentId,
            reason,
        },
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
    const title_en = "New Appointment Booked 📅";
    const title_ar = "حجز موعد استشارة جديد 📅";
    const body_en = `New appointment with ${patientName} scheduled for ${appointmentDate}.`;
    const body_ar = `تم حجز موعد استشارة جديد مع المريض ${patientName} بتاريخ ${appointmentDate}.`;

    return createNotification({
        profileId: doctorProfileId,
        title: title_en,
        body: body_en,
        notificationType: "new_appointment",
        data: {
            title_ar,
            title_en,
            body_ar,
            body_en,
            appointmentId,
        },
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
    const title_en = "Appointment Reminder ⏰";
    const title_ar = "تذكير بموعد الاستشارة ⏰";
    const body_en = isPatient
        ? `Reminder: Your appointment with Dr. ${otherPartyName} is on ${appointmentDate}.`
        : `Reminder: Your appointment with patient ${otherPartyName} is on ${appointmentDate}.`;
    const body_ar = isPatient
        ? `تذكير: موعد استشارتك مع د. ${otherPartyName} في ${appointmentDate}.`
        : `تذكير: موعدك مع المريض ${otherPartyName} في ${appointmentDate}.`;

    return createNotification({
        profileId,
        title: title_en,
        body: body_en,
        notificationType: "appointment_reminder",
        data: {
            title_ar,
            title_en,
            body_ar,
            body_en,
            appointmentId,
        },
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
    const title_en = "New Message 💬";
    const title_ar = "رسالة جديدة 💬";
    const body_en = `You have a new message from ${senderName}.`;
    const body_ar = `لديك رسالة جديدة من ${senderName}.`;

    return createNotification({
        profileId: recipientProfileId,
        title: title_en,
        body: body_en,
        notificationType: "message",
        data: {
            title_ar,
            title_en,
            body_ar,
            body_en,
            conversationId,
        },
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
    const title_en = "New Prescription Issued 💊";
    const title_ar = "إصدار روشتة طبية جديدة 💊";
    const body_en = `Dr. ${doctorName} has prescribed ${medicationName} for you.`;
    const body_ar = `قام د. ${doctorName} بإصدار روشتة طبية تحتوي على: ${medicationName}.`;

    return createNotification({
        profileId: patientProfileId,
        title: title_en,
        body: body_en,
        notificationType: "prescription",
        data: {
            title_ar,
            title_en,
            body_ar,
            body_en,
            prescriptionId,
        },
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
    const title_en = "Prescription Renewal Request 📋";
    const title_ar = "طلب تجديد روشتة طبية 📋";
    const body_en = `${patientName} has requested a renewal for ${medicationName}.`;
    const body_ar = `طلب المريض ${patientName} تجديد روشتة ${medicationName}.`;

    return createNotification({
        profileId: doctorProfileId,
        title: title_en,
        body: body_en,
        notificationType: "prescription_renewal",
        data: {
            title_ar,
            title_en,
            body_ar,
            body_en,
            requestId,
        },
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
    const title_en = approved ? "Renewal Approved ✅" : "Renewal Denied ❌";
    const title_ar = approved ? "تمت الموافقة على تجديد الروشتة ✅" : "تم رفض تجديد الروشتة ❌";
    const body_en = approved
        ? `Your renewal request for ${medicationName} has been approved.`
        : `Your renewal request for ${medicationName} has been denied. Please schedule a follow-up consultation.`;
    const body_ar = approved
        ? `تمت الموافقة على طلب تجديد روشتة ${medicationName}.`
        : `تم رفض طلب تجديد روشتة ${medicationName}. يرجى حجز استشارة متابعة جديدة.`;

    return createNotification({
        profileId: patientProfileId,
        title: title_en,
        body: body_en,
        notificationType: "prescription_renewal",
        data: {
            title_ar,
            title_en,
            body_ar,
            body_en,
            prescriptionId,
            approved,
        },
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
    const title_en = "Payment Successful ✅";
    const title_ar = "تم سداد المبلغ بنجاح ✅";
    const body_en = `Your payment of ${amount} EGP has been processed successfully.`;
    const body_ar = `تم تأكيد سداد مبلغ ${amount} ج.م بنجاح.`;

    return createNotification({
        profileId: patientProfileId,
        title: title_en,
        body: body_en,
        notificationType: "payment_success",
        data: {
            title_ar,
            title_en,
            body_ar,
            body_en,
            transactionId,
            amount,
        },
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
    const title_en = approved ? "Verification Approved 🩺" : "Verification Update ℹ️";
    const title_ar = approved ? "تم توثيق الحساب الطبي بنجاح 🩺" : "تحديث حالة التوثيق ℹ️";
    const body_en = approved
        ? "Congratulations! Your doctor account has been verified. You can now accept appointments."
        : `Your verification status has been updated. ${reason || "Please check your dashboard for details."}`;
    const body_ar = approved
        ? "تهانينا! تم توثيق حسابك الطبي بنجاح. يمكنك الآن استقبال المرضى ومواعيد الاستشارات."
        : `تم تحديث حالة توثيق حسابك الطبي. ${reason ? `السبب: ${reason}` : "يرجى مراجعة لوحة التحكم للتفاصيل."}`;

    return createNotification({
        profileId: doctorProfileId,
        title: title_en,
        body: body_en,
        notificationType: "doctor_verification",
        data: {
            title_ar,
            title_en,
            body_ar,
            body_en,
            approved,
            reason,
        },
    });
}
