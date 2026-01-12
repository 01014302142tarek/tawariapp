"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export interface PatientDashboardStats {
    upcomingAppointments: number;
    activePrescriptions: number;
    unreadMessages: number;
}

export interface UpcomingAppointment {
    id: string;
    doctorName: string;
    doctorAvatar?: string;
    specialty?: string;
    scheduledStart: string;
    scheduledEnd: string;
    status: string;
    consultationFee: number;
}

export interface ActivePrescription {
    id: string;
    medicationName: string;
    dosage?: string;
    frequency?: string;
    validUntil?: string;
    status: string;
    doctorName: string;
}

export interface RecentActivity {
    id: string;
    type: "appointment" | "prescription" | "message" | "record";
    title: string;
    description?: string;
    timestamp: string;
    relatedId?: string;
}

export interface PatientDashboardData {
    stats: PatientDashboardStats;
    nextAppointment: UpcomingAppointment | null;
    upcomingAppointments: UpcomingAppointment[];
    activePrescriptions: ActivePrescription[];
    recentActivity: RecentActivity[];
}

// ============================================
// Dashboard Data Functions
// ============================================

/**
 * Get comprehensive patient dashboard data
 */
export async function getPatientDashboardData(): Promise<{
    data: PatientDashboardData | null;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: "Not authenticated" };
    }

    // Get patient profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "patient") {
        return { data: null, error: "Not a patient profile" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { data: null, error: "Patient profile not found" };
    }

    // Fetch all data in parallel (optimized - all queries run concurrently)
    const [
        appointmentsResult,
        prescriptionsResult,
        messagesResult,
        recentAppointmentsResult,
        recentPrescriptionsResult,
        recentMessagesResult,
        recentRecordsResult,
    ] = await Promise.all([
        // Get upcoming appointments
        supabase
            .from("appointments")
            .select(`
                id,
                scheduled_start,
                scheduled_end,
                status,
                consultation_fee,
                chief_complaint,
                doctor_profiles!inner (
                    id,
                    profiles!doctor_profiles_profile_id_fkey (
                        id,
                        full_name,
                        avatar_url
                    ),
                    doctor_specializations (
                        specializations (
                            name_en,
                            name_ar
                        )
                    )
                )
            `)
            .eq("patient_profile_id", patientProfile.id)
            .in("status", ["scheduled", "in_waiting_room"])
            .gte("scheduled_start", new Date().toISOString())
            .order("scheduled_start", { ascending: true })
            .limit(5),

        // Get active prescriptions
        supabase
            .from("prescriptions")
            .select(`
                id,
                medication_name,
                dosage,
                frequency,
                valid_until,
                status,
                doctor_profiles (
                    profiles!doctor_profiles_profile_id_fkey (
                        full_name
                    )
                )
            `)
            .eq("patient_profile_id", patientProfile.id)
            .eq("status", "active")
            .order("prescribed_at", { ascending: false })
            .limit(5),

        // Get unread message count
        supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("recipient_profile_id", profile.id)
            .eq("is_read", false),

        // Recent activity queries - all in parallel
        // Recent completed appointments
        supabase
            .from("appointments")
            .select(`
                id,
                status,
                actual_end,
                doctor_profiles!inner (
                    profiles!doctor_profiles_profile_id_fkey (
                        full_name
                    )
                )
            `)
            .eq("patient_profile_id", patientProfile.id)
            .eq("status", "completed")
            .order("actual_end", { ascending: false })
            .limit(3),

        // Recent prescriptions
        supabase
            .from("prescriptions")
            .select(`
                id,
                medication_name,
                prescribed_at,
                doctor_profiles (
                    profiles!doctor_profiles_profile_id_fkey (
                        full_name
                    )
                )
            `)
            .eq("patient_profile_id", patientProfile.id)
            .order("prescribed_at", { ascending: false })
            .limit(3),

        // Recent messages received
        supabase
            .from("messages")
            .select(`
                id,
                content,
                created_at,
                sender:profiles!messages_sender_profile_id_fkey (
                    full_name
                )
            `)
            .eq("recipient_profile_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(3),

        // Recent medical records
        supabase
            .from("medical_records")
            .select("id, title, record_type, created_at")
            .eq("patient_profile_id", patientProfile.id)
            .order("created_at", { ascending: false })
            .limit(2),
    ]);

    // Build recent activity from parallel query results
    const activityResult = buildRecentActivity(
        recentAppointmentsResult.data,
        recentPrescriptionsResult.data,
        recentMessagesResult.data,
        recentRecordsResult.data
    );

    // Process appointments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const upcomingAppointments: UpcomingAppointment[] = (appointmentsResult.data || []).map((apt: any) => ({
        id: apt.id,
        doctorName: apt.doctor_profiles.profiles.full_name,
        doctorAvatar: apt.doctor_profiles.profiles.avatar_url,
        specialty: apt.doctor_profiles.doctor_specializations?.[0]?.specializations?.name_en || undefined,
        scheduledStart: apt.scheduled_start,
        scheduledEnd: apt.scheduled_end,
        status: apt.status,
        consultationFee: apt.consultation_fee,
    }));

    // Process prescriptions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activePrescriptions: ActivePrescription[] = (prescriptionsResult.data || []).map((rx: any) => ({
        id: rx.id,
        medicationName: rx.medication_name,
        dosage: rx.dosage,
        frequency: rx.frequency,
        validUntil: rx.valid_until,
        status: rx.status,
        doctorName: rx.doctor_profiles.profiles.full_name,
    }));

    // Calculate stats
    const stats: PatientDashboardStats = {
        upcomingAppointments: upcomingAppointments.length,
        activePrescriptions: activePrescriptions.length,
        unreadMessages: messagesResult.count || 0,
    };

    return {
        data: {
            stats,
            nextAppointment: upcomingAppointments.length > 0 ? upcomingAppointments[0] : null,
            upcomingAppointments,
            activePrescriptions,
            recentActivity: activityResult,
        },
    };
}

/**
 * Build recent activity from pre-fetched query results (runs after parallel queries)
 */
function buildRecentActivity(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appointments: any[] | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prescriptions: any[] | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: any[] | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    records: any[] | null
): RecentActivity[] {
    const activities: RecentActivity[] = [];

    // Process appointments
    (appointments || []).forEach((apt) => {
        activities.push({
            id: `apt-${apt.id}`,
            type: "appointment",
            title: `Appointment with ${apt.doctor_profiles.profiles.full_name}`,
            timestamp: apt.actual_end,
            relatedId: apt.id,
        });
    });

    // Process prescriptions
    (prescriptions || []).forEach((rx) => {
        activities.push({
            id: `rx-${rx.id}`,
            type: "prescription",
            title: `Prescription: ${rx.medication_name}`,
            description: `Prescribed by ${rx.doctor_profiles.profiles.full_name}`,
            timestamp: rx.prescribed_at,
            relatedId: rx.id,
        });
    });

    // Process messages
    (messages || []).forEach((msg) => {
        activities.push({
            id: `msg-${msg.id}`,
            type: "message",
            title: `Message from ${msg.sender?.full_name || "Unknown"}`,
            description: msg.content?.substring(0, 50) + (msg.content?.length > 50 ? "..." : ""),
            timestamp: msg.created_at,
            relatedId: msg.id,
        });
    });

    // Process records
    (records || []).forEach((rec) => {
        activities.push({
            id: `rec-${rec.id}`,
            type: "record",
            title: rec.title || "Medical Record",
            description: rec.record_type,
            timestamp: rec.created_at,
            relatedId: rec.id,
        });
    });

    // Sort by timestamp and return top 6
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activities.slice(0, 6);
}

/**
 * Get patient dashboard stats only (lighter query)
 */
export async function getPatientDashboardStats(): Promise<{
    stats: PatientDashboardStats | null;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { stats: null, error: "Not authenticated" };
    }

    // Get patient profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "patient") {
        return { stats: null, error: "Not a patient profile" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { stats: null, error: "Patient profile not found" };
    }

    // Fetch counts in parallel
    const [appointmentsCount, prescriptionsCount, messagesCount] = await Promise.all([
        supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .eq("patient_profile_id", patientProfile.id)
            .in("status", ["scheduled", "in_waiting_room"])
            .gte("scheduled_start", new Date().toISOString()),

        supabase
            .from("prescriptions")
            .select("id", { count: "exact", head: true })
            .eq("patient_profile_id", patientProfile.id)
            .eq("status", "active"),

        supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("recipient_profile_id", profile.id)
            .eq("is_read", false),
    ]);

    return {
        stats: {
            upcomingAppointments: appointmentsCount.count || 0,
            activePrescriptions: prescriptionsCount.count || 0,
            unreadMessages: messagesCount.count || 0,
        },
    };
}
