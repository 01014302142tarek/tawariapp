"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export type AppointmentStatus = "scheduled" | "in_waiting_room" | "in_progress" | "completed" | "cancelled" | "no_show";

export interface AdminAppointment {
    id: string;
    status: AppointmentStatus;
    scheduled_start: string;
    scheduled_end: string;
    consultation_fee: number;
    cancellation_reason?: string;
    cancelled_by?: string;
    cancelled_by_name?: string;
    created_at: string;
    patient: {
        id: string;
        full_name: string;
        avatar_url?: string;
    };
    doctor: {
        id: string;
        full_name: string;
        avatar_url?: string;
        specialty?: string;
    };
}

export interface AppointmentStats {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    no_show: number;
}

// ============================================
// Helper to check if caller is admin
// ============================================

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>): Promise<{ isAdmin: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { isAdmin: false, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { role: string } | null;
    if (!profile || profile.role !== "admin") {
        return { isAdmin: false, error: "Unauthorized - Admin access required" };
    }

    return { isAdmin: true };
}

// ============================================
// Appointment Management Actions
// ============================================

/**
 * Get all appointments for admin with filtering
 */
export async function getAdminAppointments(options?: {
    status?: AppointmentStatus | "all";
    search?: string;
    limit?: number;
    offset?: number;
    dateFrom?: string;
    dateTo?: string;
}): Promise<{ appointments: AdminAppointment[]; total: number; error?: string }> {
    const supabase = await createClient();

    const { isAdmin, error: authError } = await verifyAdmin(supabase);
    if (!isAdmin) {
        return { appointments: [], total: 0, error: authError };
    }

    // Build query - use left joins to ensure we get appointments even if related data is missing
    let query = supabase
        .from("appointments")
        .select(`
            id,
            status,
            scheduled_start,
            scheduled_end,
            consultation_fee,
            cancellation_reason,
            cancelled_by,
            created_at,
            patient_profile_id,
            doctor_profile_id
        `, { count: "exact" });

    // Apply status filter
    if (options?.status && options.status !== "all") {
        query = query.eq("status", options.status);
    }

    // Apply date filters
    if (options?.dateFrom) {
        query = query.gte("scheduled_start", options.dateFrom);
    }
    if (options?.dateTo) {
        query = query.lte("scheduled_start", options.dateTo);
    }

    // Order by most recent first
    query = query.order("scheduled_start", { ascending: false });

    // Pagination
    if (options?.offset !== undefined && options?.limit) {
        query = query.range(options.offset, options.offset + options.limit - 1);
    } else if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, count, error } = await query;

    if (error) {
        console.error("Error fetching appointments:", error);
        return { appointments: [], total: 0, error: error.message };
    }

    if (!data || data.length === 0) {
        return { appointments: [], total: count || 0 };
    }

    // Collect all profile IDs we need to fetch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase returns dynamic types
    const patientProfileIds = [...new Set((data || []).map((apt: any) => apt.patient_profile_id).filter(Boolean))];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase returns dynamic types
    const doctorProfileIds = [...new Set((data || []).map((apt: any) => apt.doctor_profile_id).filter(Boolean))];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase returns dynamic types
    const cancelledByIds = [...new Set((data || []).filter((apt: any) => apt.cancelled_by).map((apt: any) => apt.cancelled_by))];

    // Fetch patient profiles with their profile info
    const patientProfiles = new Map<string, { id: string; full_name: string; avatar_url?: string }>();
    if (patientProfileIds.length > 0) {
        const { data: patientData } = await supabase
            .from("patient_profiles")
            .select(`
                id,
                profiles (
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .in("id", patientProfileIds);

        if (patientData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase returns dynamic types
            patientData.forEach((p: any) => {
                patientProfiles.set(p.id, {
                    id: p.id,
                    full_name: p.profiles?.full_name || "Unknown Patient",
                    avatar_url: p.profiles?.avatar_url,
                });
            });
        }
    }

    // Fetch doctor profiles with their profile info
    const doctorProfiles = new Map<string, { id: string; full_name: string; avatar_url?: string }>();
    if (doctorProfileIds.length > 0) {
        const { data: doctorData } = await supabase
            .from("doctor_profiles")
            .select(`
                id,
                profiles (
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .in("id", doctorProfileIds);

        if (doctorData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase returns dynamic types
            doctorData.forEach((d: any) => {
                doctorProfiles.set(d.id, {
                    id: d.id,
                    full_name: d.profiles?.full_name || "Unknown Doctor",
                    avatar_url: d.profiles?.avatar_url,
                });
            });
        }
    }

    // Fetch cancelled_by profile names
    const cancelledByNames = new Map<string, string>();
    if (cancelledByIds.length > 0) {
        const { data: cancelledByProfiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", cancelledByIds);

        if (cancelledByProfiles) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase returns dynamic types
            cancelledByProfiles.forEach((p: any) => {
                cancelledByNames.set(p.id, p.full_name);
            });
        }
    }

    // Get doctor specialties
    const doctorSpecialties = new Map<string, string>();
    if (doctorProfileIds.length > 0) {
        const { data: specData } = await supabase
            .from("doctor_specializations")
            .select(`
                doctor_profile_id,
                specializations (
                    name_en
                )
            `)
            .in("doctor_profile_id", doctorProfileIds);

        if (specData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase returns dynamic types
            specData.forEach((s: any) => {
                if (s.specializations?.name_en && !doctorSpecialties.has(s.doctor_profile_id)) {
                    doctorSpecialties.set(s.doctor_profile_id, s.specializations.name_en);
                }
            });
        }
    }

    // Build appointments with all the data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let appointments: AdminAppointment[] = (data || []).map((apt: any) => {
        const patientProfile = patientProfiles.get(apt.patient_profile_id);
        const doctorProfile = doctorProfiles.get(apt.doctor_profile_id);

        return {
            id: apt.id,
            status: apt.status as AppointmentStatus,
            scheduled_start: apt.scheduled_start,
            scheduled_end: apt.scheduled_end,
            consultation_fee: apt.consultation_fee || 0,
            cancellation_reason: apt.cancellation_reason,
            cancelled_by: apt.cancelled_by,
            cancelled_by_name: apt.cancelled_by ? cancelledByNames.get(apt.cancelled_by) : undefined,
            created_at: apt.created_at,
            patient: {
                id: patientProfile?.id || apt.patient_profile_id,
                full_name: patientProfile?.full_name || "Unknown Patient",
                avatar_url: patientProfile?.avatar_url,
            },
            doctor: {
                id: doctorProfile?.id || apt.doctor_profile_id,
                full_name: doctorProfile?.full_name || "Unknown Doctor",
                avatar_url: doctorProfile?.avatar_url,
                specialty: doctorSpecialties.get(apt.doctor_profile_id) || undefined,
            },
        };
    });

    // Apply search filter (client-side for names)
    if (options?.search) {
        const searchLower = options.search.toLowerCase();
        appointments = appointments.filter(apt =>
            apt.patient.full_name.toLowerCase().includes(searchLower) ||
            apt.doctor.full_name.toLowerCase().includes(searchLower) ||
            (apt.cancellation_reason && apt.cancellation_reason.toLowerCase().includes(searchLower))
        );
    }

    return { appointments, total: count || 0 };
}

/**
 * Get appointment statistics for admin dashboard
 */
export async function getAppointmentStats(): Promise<{ stats: AppointmentStats; error?: string }> {
    const supabase = await createClient();

    const { isAdmin, error: authError } = await verifyAdmin(supabase);
    if (!isAdmin) {
        return {
            stats: { total: 0, scheduled: 0, completed: 0, cancelled: 0, no_show: 0 },
            error: authError
        };
    }

    // Get counts by status
    const { count: totalCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

    const { count: scheduledCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "scheduled");

    const { count: completedCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

    const { count: cancelledCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "cancelled");

    const { count: noShowCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "no_show");

    return {
        stats: {
            total: totalCount || 0,
            scheduled: scheduledCount || 0,
            completed: completedCount || 0,
            cancelled: cancelledCount || 0,
            no_show: noShowCount || 0,
        }
    };
}
