"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export interface PatientDashboardStats {
    upcomingAppointments: number;
    activePrescriptions: number;
    unreadMessages: number;
    healthScore: number; // Placeholder for future health score calculation
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
// Health Score Calculation
// ============================================

/**
 * Calculate patient health score based on engagement metrics
 * Score ranges from 0-100:
 * - Appointment adherence: up to 35 points
 * - Recent checkups: up to 25 points
 * - Active prescriptions (following treatment): up to 20 points
 * - Medical record completeness: up to 20 points
 */
async function calculateHealthScore(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: any,
    patientProfileId: string
): Promise<number> {
    let score = 0;

    // 1. Appointment adherence (35 points max)
    // Completed appointments vs total scheduled (excluding future ones)
    const { data: allAppointments } = await supabase
        .from("appointments")
        .select("status, scheduled_start")
        .eq("patient_profile_id", patientProfileId)
        .lt("scheduled_start", new Date().toISOString());

    if (allAppointments && allAppointments.length > 0) {
        const completed = allAppointments.filter(
            (a: { status: string }) => a.status === "completed"
        ).length;
        const total = allAppointments.length;
        const adherenceRate = completed / total;
        score += Math.round(adherenceRate * 35);
    } else {
        // No appointment history - give base points for new patients
        score += 20;
    }

    // 2. Recent checkups (25 points max)
    // Full points if seen within 30 days, decreasing over time
    const { data: recentAppointment } = await supabase
        .from("appointments")
        .select("scheduled_start")
        .eq("patient_profile_id", patientProfileId)
        .eq("status", "completed")
        .order("scheduled_start", { ascending: false })
        .limit(1)
        .single();

    if (recentAppointment) {
        const daysSinceLastVisit = Math.floor(
            (Date.now() - new Date(recentAppointment.scheduled_start).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastVisit <= 30) {
            score += 25;
        } else if (daysSinceLastVisit <= 60) {
            score += 20;
        } else if (daysSinceLastVisit <= 90) {
            score += 15;
        } else if (daysSinceLastVisit <= 180) {
            score += 10;
        } else if (daysSinceLastVisit <= 365) {
            score += 5;
        }
        // Over a year = 0 points for this category
    } else {
        // Never visited - give some base points for new patients
        score += 10;
    }

    // 3. Active prescriptions - following treatment (20 points max)
    // Having active prescriptions shows engagement with treatment
    const { count: activePrescriptionCount } = await supabase
        .from("prescriptions")
        .select("id", { count: "exact", head: true })
        .eq("patient_profile_id", patientProfileId)
        .eq("status", "active");

    if (activePrescriptionCount !== null) {
        if (activePrescriptionCount === 0) {
            // No active prescriptions could mean healthy or not following treatment
            // Check if they had any prescriptions that are now completed
            const { count: completedPrescriptions } = await supabase
                .from("prescriptions")
                .select("id", { count: "exact", head: true })
                .eq("patient_profile_id", patientProfileId)
                .eq("status", "completed");

            if (completedPrescriptions && completedPrescriptions > 0) {
                // Had prescriptions and completed them - good!
                score += 20;
            } else {
                // Never had prescriptions - might be healthy, give base points
                score += 15;
            }
        } else {
            // Has active prescriptions - following treatment
            score += 20;
        }
    } else {
        score += 15; // Default for new patients
    }

    // 4. Medical record completeness (20 points max)
    const { count: recordCount } = await supabase
        .from("medical_records")
        .select("id", { count: "exact", head: true })
        .eq("patient_profile_id", patientProfileId);

    if (recordCount !== null) {
        if (recordCount >= 5) {
            score += 20; // Comprehensive records
        } else if (recordCount >= 3) {
            score += 15;
        } else if (recordCount >= 1) {
            score += 10;
        } else {
            score += 5; // No records but that's okay for new patients
        }
    } else {
        score += 5;
    }

    // Ensure score is between 0 and 100
    return Math.min(100, Math.max(0, score));
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

    // Fetch all data in parallel
    const [
        appointmentsResult,
        prescriptionsResult,
        messagesResult,
        activityResult,
        healthScore,
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
                    profiles!inner (
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
                doctor_profiles!inner (
                    profiles!inner (
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

        // Get recent activity (last 10 items from various sources)
        getRecentActivityForPatient(supabase, patientProfile.id, profile.id),

        // Calculate health score
        calculateHealthScore(supabase, patientProfile.id),
    ]);

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
        healthScore,
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
 * Helper function to get recent activity for patient
 */
async function getRecentActivityForPatient(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: any,
    patientProfileId: string,
    profileId: string
): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Get recent completed appointments
    const { data: appointments } = await supabase
        .from("appointments")
        .select(`
            id,
            status,
            actual_end,
            doctor_profiles!inner (
                profiles!inner (
                    full_name
                )
            )
        `)
        .eq("patient_profile_id", patientProfileId)
        .eq("status", "completed")
        .order("actual_end", { ascending: false })
        .limit(3);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (appointments || []).forEach((apt: any) => {
        activities.push({
            id: `apt-${apt.id}`,
            type: "appointment",
            title: `Appointment with ${apt.doctor_profiles.profiles.full_name}`,
            timestamp: apt.actual_end,
            relatedId: apt.id,
        });
    });

    // Get recent prescriptions
    const { data: prescriptions } = await supabase
        .from("prescriptions")
        .select(`
            id,
            medication_name,
            prescribed_at,
            doctor_profiles!inner (
                profiles!inner (
                    full_name
                )
            )
        `)
        .eq("patient_profile_id", patientProfileId)
        .order("prescribed_at", { ascending: false })
        .limit(3);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prescriptions || []).forEach((rx: any) => {
        activities.push({
            id: `rx-${rx.id}`,
            type: "prescription",
            title: `Prescription: ${rx.medication_name}`,
            description: `Prescribed by ${rx.doctor_profiles.profiles.full_name}`,
            timestamp: rx.prescribed_at,
            relatedId: rx.id,
        });
    });

    // Get recent messages received
    const { data: messages } = await supabase
        .from("messages")
        .select(`
            id,
            content,
            created_at,
            sender:profiles!messages_sender_profile_id_fkey (
                full_name
            )
        `)
        .eq("recipient_profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(3);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (messages || []).forEach((msg: any) => {
        activities.push({
            id: `msg-${msg.id}`,
            type: "message",
            title: `Message from ${msg.sender?.full_name || "Unknown"}`,
            description: msg.content?.substring(0, 50) + (msg.content?.length > 50 ? "..." : ""),
            timestamp: msg.created_at,
            relatedId: msg.id,
        });
    });

    // Get recent medical records
    const { data: records } = await supabase
        .from("medical_records")
        .select("id, title, record_type, created_at")
        .eq("patient_profile_id", patientProfileId)
        .order("created_at", { ascending: false })
        .limit(2);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (records || []).forEach((rec: any) => {
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
    const [appointmentsCount, prescriptionsCount, messagesCount, healthScore] = await Promise.all([
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

        calculateHealthScore(supabase, patientProfile.id),
    ]);

    return {
        stats: {
            upcomingAppointments: appointmentsCount.count || 0,
            activePrescriptions: prescriptionsCount.count || 0,
            unreadMessages: messagesCount.count || 0,
            healthScore,
        },
    };
}
