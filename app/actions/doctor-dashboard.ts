"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export interface DoctorDashboardStats {
    todayAppointments: number;
    completedToday: number;
    revenueToday: number;
    avgRating: number;
}

export interface TodayAppointment {
    id: string;
    patientName: string;
    patientAvatar?: string;
    scheduledStart: string;
    scheduledEnd: string;
    status: string;
    appointmentType: string;
    chiefComplaint?: string;
}

export interface PendingTask {
    id: string;
    type: "lab_review" | "prescription_renewal" | "follow_up" | "consultation_note";
    title: string;
    patientName: string;
    priority: "high" | "medium" | "low";
    dueDate?: string;
    appointmentId?: string;
}

export interface RecentMessage {
    id: string;
    patientName: string;
    patientAvatar?: string;
    lastMessage: string;
    timestamp: string;
    isUnread: boolean;
    conversationId?: string;
}

export interface DoctorDashboardData {
    stats: DoctorDashboardStats;
    todayAppointments: TodayAppointment[];
    pendingTasks: PendingTask[];
    recentMessages: RecentMessage[];
}

// ============================================
// Helper Functions
// ============================================

async function getDoctorProfileId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<{
    profileId: string;
    doctorProfileId: string;
} | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") return null;

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) return null;

    return {
        profileId: profile.id,
        doctorProfileId: doctorProfile.id,
    };
}

// ============================================
// Main Dashboard Data Function
// ============================================

export async function getDoctorDashboardData(): Promise<{
    data: DoctorDashboardData | null;
    error?: string;
}> {
    const supabase = await createClient();

    const ids = await getDoctorProfileId(supabase);
    if (!ids) {
        return { data: null, error: "Not authenticated or not a doctor" };
    }

    const { profileId, doctorProfileId } = ids;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch all data in parallel
    const [
        todayAppointmentsResult,
        completedTodayResult,
        revenueResult,
        ratingResult,
        messagesResult,
    ] = await Promise.all([
        // Get today's appointments
        supabase
            .from("appointments")
            .select(`
                id,
                scheduled_start,
                scheduled_end,
                status,
                appointment_type,
                chief_complaint,
                patient_profiles!inner (
                    id,
                    profiles!inner (
                        id,
                        full_name,
                        avatar_url
                    )
                )
            `)
            .eq("doctor_profile_id", doctorProfileId)
            .gte("scheduled_start", today.toISOString())
            .lt("scheduled_start", tomorrow.toISOString())
            .order("scheduled_start", { ascending: true }),

        // Get completed today count
        supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .eq("doctor_profile_id", doctorProfileId)
            .eq("status", "completed")
            .gte("scheduled_start", today.toISOString())
            .lt("scheduled_start", tomorrow.toISOString()),

        // Get today's revenue
        supabase
            .from("appointments")
            .select("consultation_fee")
            .eq("doctor_profile_id", doctorProfileId)
            .eq("status", "completed")
            .gte("scheduled_start", today.toISOString())
            .lt("scheduled_start", tomorrow.toISOString()),

        // Get doctor rating
        supabase
            .from("doctor_profiles")
            .select("rating_average")
            .eq("id", doctorProfileId)
            .single(),

        // Get recent messages
        supabase
            .from("messages")
            .select(`
                id,
                content,
                created_at,
                is_read,
                conversation_id,
                sender:profiles!messages_sender_profile_id_fkey (
                    id,
                    full_name,
                    avatar_url,
                    role
                )
            `)
            .eq("recipient_profile_id", profileId)
            .order("created_at", { ascending: false })
            .limit(5),
    ]);

    // Process today's appointments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todayAppointments: TodayAppointment[] = (todayAppointmentsResult.data || []).map((apt: any) => ({
        id: apt.id,
        patientName: apt.patient_profiles.profiles.full_name,
        patientAvatar: apt.patient_profiles.profiles.avatar_url,
        scheduledStart: apt.scheduled_start,
        scheduledEnd: apt.scheduled_end,
        status: apt.status,
        appointmentType: apt.appointment_type || "scheduled",
        chiefComplaint: apt.chief_complaint,
    }));

    // Calculate today's revenue
    const revenueToday = (revenueResult.data || []).reduce(
        (sum: number, apt: { consultation_fee: number }) => sum + apt.consultation_fee,
        0
    );

    // Get doctor rating
    const doctor = ratingResult.data as { rating_average: number } | null;
    const avgRating = doctor?.rating_average || 0;

    // Process recent messages - filter to show only patient messages
    const recentMessages: RecentMessage[] = (messagesResult.data || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((msg: any) => msg.sender?.role === "patient")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((msg: any) => ({
            id: msg.id,
            patientName: msg.sender?.full_name || "Unknown Patient",
            patientAvatar: msg.sender?.avatar_url,
            lastMessage: msg.content?.substring(0, 80) || "",
            timestamp: msg.created_at,
            isUnread: !msg.is_read,
            conversationId: msg.conversation_id,
        }))
        .slice(0, 3);

    // Get pending tasks (appointments without consultation notes)
    const { data: appointmentsWithoutNotes } = await supabase
        .from("appointments")
        .select(`
            id,
            scheduled_start,
            chief_complaint,
            patient_profiles!inner (
                profiles!inner (
                    full_name
                )
            )
        `)
        .eq("doctor_profile_id", doctorProfileId)
        .eq("status", "completed")
        .lt("scheduled_start", new Date().toISOString())
        .limit(10);

    // Check which appointments don't have consultation notes - single batch query instead of N queries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appointmentIds = (appointmentsWithoutNotes || []).map((apt: any) => apt.id);

    // Single query to get all existing notes for these appointments
    let appointmentsWithNotes = new Set<string>();
    if (appointmentIds.length > 0) {
        const { data: existingNotes } = await supabase
            .from("consultation_notes")
            .select("appointment_id")
            .in("appointment_id", appointmentIds);

        // Create a Set of appointment IDs that already have notes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        appointmentsWithNotes = new Set((existingNotes || []).map((n: any) => n.appointment_id));
    }

    // Filter appointments that don't have notes (no additional network calls)
    const appointmentsNeedingNotes = (appointmentsWithoutNotes || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((apt: any) => !appointmentsWithNotes.has(apt.id));

    const pendingTasks: PendingTask[] = appointmentsNeedingNotes
        .filter(apt => apt !== null)
        .slice(0, 4)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((apt: any) => ({
            id: `note-${apt.id}`,
            type: "consultation_note" as const,
            title: "Complete consultation notes",
            patientName: apt.patient_profiles.profiles.full_name,
            priority: "high" as const,
            dueDate: apt.scheduled_start,
            appointmentId: apt.id,
        }));

    // Calculate stats
    const stats: DoctorDashboardStats = {
        todayAppointments: todayAppointments.length,
        completedToday: completedTodayResult.count || 0,
        revenueToday,
        avgRating,
    };

    return {
        data: {
            stats,
            todayAppointments,
            pendingTasks,
            recentMessages,
        },
    };
}

/**
 * Get quick stats only (lighter query)
 */
export async function getDoctorDashboardStats(): Promise<{
    stats: DoctorDashboardStats | null;
    error?: string;
}> {
    const supabase = await createClient();

    const ids = await getDoctorProfileId(supabase);
    if (!ids) {
        return { stats: null, error: "Not authenticated or not a doctor" };
    }

    const { doctorProfileId } = ids;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [appointmentsCount, completedCount, revenueResult, ratingResult] = await Promise.all([
        supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .eq("doctor_profile_id", doctorProfileId)
            .gte("scheduled_start", today.toISOString())
            .lt("scheduled_start", tomorrow.toISOString()),

        supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .eq("doctor_profile_id", doctorProfileId)
            .eq("status", "completed")
            .gte("scheduled_start", today.toISOString())
            .lt("scheduled_start", tomorrow.toISOString()),

        supabase
            .from("appointments")
            .select("consultation_fee")
            .eq("doctor_profile_id", doctorProfileId)
            .eq("status", "completed")
            .gte("scheduled_start", today.toISOString())
            .lt("scheduled_start", tomorrow.toISOString()),

        supabase
            .from("doctor_profiles")
            .select("rating_average")
            .eq("id", doctorProfileId)
            .single(),
    ]);

    const revenueToday = (revenueResult.data || []).reduce(
        (sum: number, apt: { consultation_fee: number }) => sum + apt.consultation_fee,
        0
    );

    const doctor = ratingResult.data as { rating_average: number } | null;

    return {
        stats: {
            todayAppointments: appointmentsCount.count || 0,
            completedToday: completedCount.count || 0,
            revenueToday,
            avgRating: doctor?.rating_average || 0,
        },
    };
}
