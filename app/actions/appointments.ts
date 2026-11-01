"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { DashboardUserContext } from "@/lib/supabase/context";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { appointmentLimiter } from "@/lib/rate-limit";
import { appointmentSchema, validateInput } from "@/lib/validations";
import { notifyNewAppointment, notifyAppointmentCancelled } from "./notifications";
import { revalidateTag } from "next/cache";

// ============================================
// Types
// ============================================

export type AppointmentStatus =
    | "scheduled"
    | "in_waiting_room"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";

export interface Appointment {
    id: string;
    patient_profile_id: string;
    doctor_profile_id: string;
    scheduled_start: string;
    scheduled_end: string;
    actual_start?: string;
    actual_end?: string;
    status: AppointmentStatus;
    consultation_fee: number;
    cancellation_reason?: string;
    cancelled_by?: string;
    chief_complaint?: string;
    created_at: string;
    updated_at: string;
}

export interface AppointmentWithDetails extends Appointment {
    patient?: {
        id: string;
        full_name: string;
        avatar_url?: string;
    };
    doctor?: {
        id: string;
        full_name: string;
        avatar_url?: string;
        specialty?: string;
        consultation_fee?: number;
    };
}

export interface ConsultationSession {
    id: string;
    appointment_id: string;
    jitsi_room_id: string;
    started_at?: string;
    ended_at?: string;
    recording_consent: boolean;
}

type PatientContext = Pick<DashboardUserContext, "profileId" | "patientProfileId" | "role">;
type DoctorContext = Pick<DashboardUserContext, "profileId" | "doctorProfileId" | "role">;

// ============================================
// Cache Helpers
// ============================================

async function getUserIdByProfileId(
    supabase: SupabaseClient<Database>,
    profileId: string
): Promise<string | null> {
    const { data } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("id", profileId)
        .single();

    return (data as { user_id: string } | null)?.user_id || null;
}

async function getUserIdsForAppointment(
    supabase: SupabaseClient<Database>,
    appointmentId: string
): Promise<{ doctorUserId?: string; patientUserId?: string }> {
    const { data } = await supabase
        .from("appointments")
        .select(`
            doctor_profile_id,
            patient_profile_id,
            doctor_profiles (
                profile_id
            ),
            patient_profiles (
                profile_id
            )
        `)
        .eq("id", appointmentId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appointment = data as any;
    if (!appointment) return {};

    const doctorProfileId = appointment.doctor_profiles?.profile_id;
    const patientProfileId = appointment.patient_profiles?.profile_id;

    const [doctorUserId, patientUserId] = await Promise.all([
        doctorProfileId ? getUserIdByProfileId(supabase, doctorProfileId) : Promise.resolve(null),
        patientProfileId ? getUserIdByProfileId(supabase, patientProfileId) : Promise.resolve(null),
    ]);

    return { doctorUserId: doctorUserId || undefined, patientUserId: patientUserId || undefined };
}

function revalidateAppointmentCaches(userIds: Array<string | undefined>) {
    userIds.filter(Boolean).forEach((userId) => {
        revalidateTag(`appointments:${userId}`, "default");
        revalidateTag(`dashboard:${userId}`, "default");
    });
}

// ============================================
// Patient Actions
// ============================================

/**
 * Book a new appointment
 * Rate limited: 10 bookings per hour per user
 */
export async function bookAppointment(data: {
    doctorProfileId: string;
    scheduledStart: string;
    scheduledEnd: string;
    patientNotes?: string;
}): Promise<{ success: boolean; appointmentId?: string; error?: string; retryAfter?: number }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Validate input
    const validation = validateInput(appointmentSchema, {
        doctorProfileId: data.doctorProfileId,
        scheduledStart: data.scheduledStart,
        scheduledEnd: data.scheduledEnd,
        patientNotes: data.patientNotes,
    });
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    // Get patient profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "patient") {
        return { success: false, error: "Not a patient profile" };
    }

    // Check rate limit after auth but before DB operations
    const rateLimitKey = `appointments:${profile.id}`;
    const rateLimit = await appointmentLimiter.check(rateLimitKey);
    if (!rateLimit.allowed) {
        return {
            success: false,
            error: "Too many booking attempts. Please try again later.",
            retryAfter: rateLimit.retryAfter ?? undefined,
        };
    }

    // Get patient_profile
    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { success: false, error: "Patient profile not found" };
    }

    // Get doctor's consultation fee and profile_id for notification
    const { data: doctorData } = await supabase
        .from("doctor_profiles")
        .select("consultation_fee, profile_id")
        .eq("id", data.doctorProfileId)
        .single();

    const doctor = doctorData as { consultation_fee: number | null; profile_id: string } | null;
    const consultationFee = doctor?.consultation_fee || 0;

    // Check if slot is still available (no overlapping appointments)
    // Note: This is an optimistic check - the database has an exclusion constraint
    // (no_overlapping_appointments) that prevents race conditions at insert time.
    const { data: existingAppointments } = await supabase
        .from("appointments")
        .select("id")
        .eq("doctor_profile_id", data.doctorProfileId)
        .lt("scheduled_start", data.scheduledEnd)
        .gt("scheduled_end", data.scheduledStart)
        .in("status", ["scheduled", "in_waiting_room", "in_progress"]);

    if (existingAppointments && existingAppointments.length > 0) {
        return { success: false, error: "This time slot is no longer available" };
    }

    // Create appointment
    // The database exclusion constraint prevents double-booking even if two
    // concurrent requests pass the availability check above.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: insertedData, error } = await (supabase as any)
        .from("appointments")
        .insert({
            patient_profile_id: patientProfile.id,
            doctor_profile_id: data.doctorProfileId,
            scheduled_start: data.scheduledStart,
            scheduled_end: data.scheduledEnd,
            status: "scheduled",
            consultation_fee: consultationFee,
            chief_complaint: data.patientNotes || null,
        })
        .select("id")
        .single();

    if (error) {
        // Handle exclusion constraint violation (concurrent booking race condition)
        if (error.code === "23P01" || error.message?.includes("exclusion")) {
            return { success: false, error: "This time slot was just booked. Please select another time." };
        }
        return { success: false, error: error.message };
    }

    // Send notification to doctor about new appointment
    if (doctor?.profile_id && insertedData?.id) {
        // Get patient name for notification
        const { data: patientData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", profile.id)
            .single();

        const patientName = (patientData as { full_name: string } | null)?.full_name || "A patient";
        const appointmentDate = new Date(data.scheduledStart).toLocaleString();

        // Fire and forget - don't block on notification
        notifyNewAppointment(
            doctor.profile_id,
            patientName,
            appointmentDate,
            insertedData.id
        ).catch(err => console.error("Failed to send appointment notification:", err));
    }

    const doctorUserId = doctor?.profile_id
        ? await getUserIdByProfileId(supabase, doctor.profile_id)
        : null;
    revalidateAppointmentCaches([user.id, doctorUserId || undefined]);

    return { success: true, appointmentId: insertedData?.id };
}

/**
 * Get patient's appointments
 */
export async function getPatientAppointments(
    filters?: {
        status?: AppointmentStatus[];
        upcoming?: boolean;
        limit?: number;
    },
    supabaseClient?: SupabaseClient<Database>,
    context?: PatientContext
): Promise<{ appointments: AppointmentWithDetails[]; error?: string }> {
    const supabase = supabaseClient ?? await createClient();

    if (context?.role && context.role !== "patient") {
        return { appointments: [], error: "Not a patient profile" };
    }

    let patientProfileId = context?.patientProfileId;

    if (!patientProfileId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { appointments: [], error: "Not authenticated" };
        }

        // Get patient profile
        const { data: profileData } = await supabase
            .from("profiles")
            .select("id, role")
            .eq("user_id", user.id)
            .single();

        const profile = profileData as { id: string; role: string } | null;
        if (!profile || profile.role !== "patient") {
            return { appointments: [], error: "Not a patient profile" };
        }

        const { data: patientProfileData } = await supabase
            .from("patient_profiles")
            .select("id")
            .eq("profile_id", profile.id)
            .single();

        const patientProfile = patientProfileData as { id: string } | null;
        if (!patientProfile) {
            return { appointments: [], error: "Patient profile not found" };
        }

        patientProfileId = patientProfile.id;
    }

    const resolvedPatientProfileId = patientProfileId as string;

    // Build query
    let query = supabase
        .from("appointments")
        .select(`
            *,
            doctor_profiles!inner (
                id,
                consultation_fee,
                profiles!doctor_profiles_profile_id_fkey (
                    id,
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq("patient_profile_id", resolvedPatientProfileId)
        .order("scheduled_start", { ascending: filters?.upcoming !== false });

    if (filters?.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
    }

    if (filters?.upcoming) {
        query = query.gte("scheduled_start", new Date().toISOString());
    }

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching appointments:", error);
        return { appointments: [], error: error.message };
    }

    // Transform the data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appointments: AppointmentWithDetails[] = (data || []).map((apt: any) => ({
        ...apt,
        doctor: {
            id: apt.doctor_profiles.id,
            full_name: apt.doctor_profiles.profiles.full_name,
            avatar_url: apt.doctor_profiles.profiles.avatar_url,
            consultation_fee: apt.doctor_profiles.consultation_fee,
        },
        doctor_profiles: undefined,
    }));

    return { appointments };
}

/**
 * Cancel an appointment (patient)
 */
export async function cancelAppointmentAsPatient(
    appointmentId: string,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Verify ownership
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; full_name: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { success: false, error: "Patient profile not found" };
    }

    // Get appointment details for validation and notification
    const { data: appointmentData } = await supabase
        .from("appointments")
        .select(`
            id,
            status,
            patient_profile_id,
            scheduled_start,
            doctor_profiles!inner (
                profile_id
            )
        `)
        .eq("id", appointmentId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appointment = appointmentData as any;

    if (!appointment) {
        return { success: false, error: "Appointment not found" };
    }

    // Verify patient owns this appointment
    if (appointment.patient_profile_id !== patientProfile.id) {
        return { success: false, error: "Not authorized to cancel this appointment" };
    }

    // Only allow cancelling scheduled appointments
    if (appointment.status !== "scheduled") {
        return { success: false, error: `Cannot cancel appointment with status: ${appointment.status}` };
    }

    // Use admin client to bypass RLS policies for the update
    const adminSupabase = await createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (adminSupabase as any)
        .from("appointments")
        .update({
            status: "cancelled",
            cancellation_reason: reason || null,
            cancelled_by: profile.id, // Use profile.id, not user.id (FK references profiles table)
        })
        .eq("id", appointmentId);

    if (error) {
        console.error("Error cancelling appointment:", error);
        return { success: false, error: error.message };
    }

    // Send notification to doctor about cancellation
    // isPatient=false because the doctor is receiving the notification (they're not the patient)
    if (appointment?.doctor_profiles?.profile_id) {
        const appointmentDate = new Date(appointment.scheduled_start).toLocaleString();
        notifyAppointmentCancelled(
            appointment.doctor_profiles.profile_id,
            profile.full_name || "A patient",
            appointmentDate,
            appointmentId,
            false
        ).catch(err => console.error("Failed to send cancellation notification:", err));
    }

    const userIds = await getUserIdsForAppointment(supabase, appointmentId);
    revalidateAppointmentCaches([user.id, userIds.doctorUserId, userIds.patientUserId]);

    return { success: true };
}

// ============================================
// Doctor Actions
// ============================================

/**
 * Get doctor's appointments
 */
export async function getDoctorAppointments(
    filters?: {
        status?: AppointmentStatus[];
        date?: string; // YYYY-MM-DD
        upcoming?: boolean;
        limit?: number;
    },
    supabaseClient?: SupabaseClient<Database>,
    context?: DoctorContext
): Promise<{ appointments: AppointmentWithDetails[]; error?: string }> {
    const supabase = supabaseClient ?? await createClient();

    if (context?.role && context.role !== "doctor") {
        return { appointments: [], error: "Not a doctor profile" };
    }

    let doctorProfileId = context?.doctorProfileId;

    if (!doctorProfileId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { appointments: [], error: "Not authenticated" };
        }

        // Get doctor profile
        const { data: profileData } = await supabase
            .from("profiles")
            .select("id, role")
            .eq("user_id", user.id)
            .single();

        const profile = profileData as { id: string; role: string } | null;
        if (!profile || profile.role !== "doctor") {
            return { appointments: [], error: "Not a doctor profile" };
        }

        const { data: doctorProfileData } = await supabase
            .from("doctor_profiles")
            .select("id")
            .eq("profile_id", profile.id)
            .single();

        const doctorProfile = doctorProfileData as { id: string } | null;
        if (!doctorProfile) {
            return { appointments: [], error: "Doctor profile not found" };
        }

        doctorProfileId = doctorProfile.id;
    }

    const resolvedDoctorProfileId = doctorProfileId as string;

    // Build query
    let query = supabase
        .from("appointments")
        .select(`
            *,
            patient_profiles!inner (
                id,
                profiles (
                    id,
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq("doctor_profile_id", resolvedDoctorProfileId)
        .order("scheduled_start", { ascending: true });

    if (filters?.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
    }

    if (filters?.date) {
        const startOfDay = `${filters.date}T00:00:00`;
        const endOfDay = `${filters.date}T23:59:59`;
        query = query.gte("scheduled_start", startOfDay).lte("scheduled_start", endOfDay);
    }

    if (filters?.upcoming) {
        query = query.gte("scheduled_start", new Date().toISOString());
    }

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching appointments:", error);
        return { appointments: [], error: error.message };
    }

    // Transform the data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appointments: AppointmentWithDetails[] = (data || []).map((apt: any) => ({
        ...apt,
        patient: apt.patient_profiles ? {
            id: apt.patient_profiles.id,
            full_name: apt.patient_profiles.profiles?.full_name || "Unknown Patient",
            avatar_url: apt.patient_profiles.profiles?.avatar_url,
        } : undefined,
        patient_profiles: undefined,
    }));

    return { appointments };
}

/**
 * Cancel an appointment (doctor)
 */
export async function cancelAppointmentAsDoctor(
    appointmentId: string,
    reason?: string
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

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { success: false, error: "Doctor profile not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("appointments")
        .update({
            status: "cancelled",
            cancellation_reason: reason || null,
            cancelled_by: user.id,
        })
        .eq("id", appointmentId)
        .eq("doctor_profile_id", doctorProfile.id)
        .in("status", ["scheduled", "in_waiting_room"]);

    if (error) {
        console.error("Error cancelling appointment:", error);
        return { success: false, error: error.message };
    }

    const { doctorUserId, patientUserId } = await getUserIdsForAppointment(supabase, appointmentId);
    revalidateAppointmentCaches([doctorUserId || user.id, patientUserId]);

    return { success: true };
}

// ============================================
// Appointment Status Workflow
// ============================================

/**
 * Patient joins waiting room
 */
export async function joinWaitingRoom(
    appointmentId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Verify patient owns this appointment
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { success: false, error: "Patient profile not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("appointments")
        .update({ status: "in_waiting_room" })
        .eq("id", appointmentId)
        .eq("patient_profile_id", patientProfile.id)
        .eq("status", "scheduled");

    if (error) {
        console.error("Error joining waiting room:", error);
        return { success: false, error: error.message };
    }

    const { doctorUserId } = await getUserIdsForAppointment(supabase, appointmentId);
    revalidateAppointmentCaches([user.id, doctorUserId]);

    return { success: true };
}

/**
 * Doctor starts consultation
 */
export async function startConsultation(
    appointmentId: string
): Promise<{ success: boolean; roomUrl?: string; error?: string }> {
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

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { success: false, error: "Doctor profile not found" };
    }
    // Check if appointment already has an active session (allow doctor to reconnect)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingSession } = await (supabase as any)
        .from("consultation_sessions")
        .select("id, jitsi_room_id")
        .eq("appointment_id", appointmentId)
        .is("ended_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (existingSession?.jitsi_room_id) {
        const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "fairmeeting.net";
        const sessionRoom = existingSession.jitsi_room_id.replace("meet.jit.si", jitsiDomain);
        console.log("[startConsultation] Rejoining existing session:", sessionRoom);
        return { success: true, roomUrl: sessionRoom };

    }

    // Create Video room (Daily.co or high-availability WebRTC fallback)
    let roomUrl: string;
    const dailyApiKey = process.env.DAILY_API_KEY;
    const dailyDomain = process.env.NEXT_PUBLIC_DAILY_DOMAIN;

    if (!dailyApiKey || !dailyDomain) {
        // Fallback to WebRTC room (meet.jit.si) when Daily.co keys are not set
        const roomName = `tabibi-${appointmentId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}-${Date.now().toString(36)}`;
        const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "fairmeeting.net";
        roomUrl = `https://${jitsiDomain}/${roomName}`;
        console.log("[startConsultation] Using WebRTC fallback room:", roomUrl);
    } else {
        try {
            const roomName = `tabibi-${appointmentId.slice(0, 8)}-${Date.now()}`;

            const response = await fetch("https://api.daily.co/v1/rooms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${dailyApiKey}`,
                },
                body: JSON.stringify({
                    name: roomName,
                    privacy: "public",
                    properties: {
                        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
                        enable_screenshare: true,
                        enable_chat: true,
                        enable_knocking: false,
                        start_video_off: false,
                        start_audio_off: false,
                        max_participants: 4,
                        eject_at_room_exp: true,
                    },
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Daily API error:", error);
                return { success: false, error: "Failed to create video room" };
            }

            const room = await response.json();
            roomUrl = room.url;
        } catch (err) {
            console.error("Error creating Daily room:", err);
            return { success: false, error: "Failed to create video room" };
        }
    }

    // Update appointment status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from("appointments")
        .update({
            status: "in_progress",
            actual_start: new Date().toISOString(),
        })
        .eq("id", appointmentId)
        .eq("doctor_profile_id", doctorProfile.id)
        .in("status", ["scheduled", "in_waiting_room", "in_progress"]);

    if (updateError) {
        console.error("Error starting consultation:", updateError);
        return { success: false, error: updateError.message };
    }

    // Create consultation session (storing Daily room URL in jitsi_room_id field for now)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: sessionError } = await (supabase as any)
        .from("consultation_sessions")
        .insert({
            appointment_id: appointmentId,
            jitsi_room_id: roomUrl, // Stores Daily room URL
            started_at: new Date().toISOString(),
            recording_consent: false,
        });

    if (sessionError) {
        console.error("Error creating consultation session:", sessionError);
        // Don't fail the whole operation, just log
    }

    const { doctorUserId, patientUserId } = await getUserIdsForAppointment(supabase, appointmentId);
    revalidateAppointmentCaches([doctorUserId || user.id, patientUserId]);

    return { success: true, roomUrl };
}

/**
 * Reset an in-progress appointment back to scheduled status
 * This is useful when a consultation was accidentally started
 */
export async function resetAppointmentToScheduled(
    appointmentId: string
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

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { success: false, error: "Doctor profile not found" };
    }

    // Reset appointment status back to scheduled
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from("appointments")
        .update({
            status: "scheduled",
            actual_start: null,
            actual_end: null,
        })
        .eq("id", appointmentId)
        .eq("doctor_profile_id", doctorProfile.id)
        .eq("status", "in_progress");

    if (updateError) {
        console.error("Error resetting appointment:", updateError);
        return { success: false, error: updateError.message };
    }

    // Delete the consultation session if it exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("consultation_sessions")
        .delete()
        .eq("appointment_id", appointmentId);

    const { doctorUserId, patientUserId } = await getUserIdsForAppointment(supabase, appointmentId);
    revalidateAppointmentCaches([doctorUserId || user.id, patientUserId]);

    return { success: true };
}

/**
 * End consultation
 */
export async function endConsultation(
    appointmentId: string
): Promise<{ success: boolean; patientProfileId?: string; patientName?: string; error?: string }> {
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

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { success: false, error: "Doctor profile not found" };
    }

    // Get appointment details including patient info for post-call flow
    const { data: appointmentData } = await supabase
        .from("appointments")
        .select(`
            patient_profile_id,
            patient_profiles!appointments_patient_profile_id_fkey (
                profiles!patient_profiles_profile_id_fkey (
                    full_name
                )
            )
        `)
        .eq("id", appointmentId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appointment = appointmentData as any;
    const patientProfileId = appointment?.patient_profile_id;
    const patientName = appointment?.patient_profiles?.profiles?.full_name;

    // Update appointment status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from("appointments")
        .update({
            status: "completed",
            actual_end: new Date().toISOString(),
        })
        .eq("id", appointmentId)
        .eq("doctor_profile_id", doctorProfile.id)
        .eq("status", "in_progress");

    if (updateError) {
        console.error("Error ending consultation:", updateError);
        return { success: false, error: updateError.message };
    }

    // Update consultation session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("consultation_sessions")
        .update({ ended_at: new Date().toISOString() })
        .eq("appointment_id", appointmentId);

    const { doctorUserId, patientUserId } = await getUserIdsForAppointment(supabase, appointmentId);
    revalidateAppointmentCaches([doctorUserId || user.id, patientUserId]);

    return { success: true, patientProfileId, patientName };
}

/**
 * Mark patient as no-show
 */
export async function markNoShow(
    appointmentId: string
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

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { success: false, error: "Doctor profile not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("appointments")
        .update({ status: "no_show" })
        .eq("id", appointmentId)
        .eq("doctor_profile_id", doctorProfile.id)
        .in("status", ["scheduled", "in_waiting_room"]);

    if (error) {
        console.error("Error marking no-show:", error);
        return { success: false, error: error.message };
    }

    const { doctorUserId, patientUserId } = await getUserIdsForAppointment(supabase, appointmentId);
    revalidateAppointmentCaches([doctorUserId || user.id, patientUserId]);

    return { success: true };
}

// ============================================
// Consultation Session
// ============================================

/**
 * Get consultation session for an appointment
 */
export async function getConsultationSession(
    appointmentId: string
): Promise<{ session: ConsultationSession | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { session: null, error: "Not authenticated" };
    }

    const { data, error } = await supabase
        .from("consultation_sessions")
        .select("*")
        .eq("appointment_id", appointmentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== "PGRST116") { // Ignore "no rows" error
        console.error("Error fetching consultation session:", error);
        return { session: null, error: error.message };
    }

    return { session: data as ConsultationSession | null };
}

/**
 * Get current user's info for Jitsi display name
 */
export async function getConsultationUserInfo(): Promise<{
    displayName: string;
    email?: string;
    role: "doctor" | "patient";
} | null> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { full_name: string; role: string } | null;
    if (!profile) return null;

    // Add "Dr." prefix for doctors only if not already present
    let displayName = profile.full_name;
    if (profile.role === "doctor" && !profile.full_name.toLowerCase().startsWith("dr.") && !profile.full_name.toLowerCase().startsWith("dr ")) {
        displayName = `Dr. ${profile.full_name}`;
    }

    return {
        displayName,
        email: user.email,
        role: profile.role as "doctor" | "patient",
    };
}

// ============================================
// Doctor Listing (for patients to book)
// ============================================

export interface DoctorForBooking {
    id: string;
    profile_id: string;
    slug: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    years_of_experience?: number;
    consultation_fee?: number;
    specializations: string[];
    rating_average?: number;
    rating_count?: number;
    is_available_now?: boolean;
}

/**
 * Get list of verified doctors available for booking
 */
export async function getAvailableDoctors(filters?: {
    specialization?: string;
    search?: string;
    minFee?: number;
    maxFee?: number;
    availableNow?: boolean;
    sortBy?: "rating" | "fee_low" | "fee_high" | "experience";
    limit?: number;
    offset?: number;
}): Promise<{ doctors: DoctorForBooking[]; total: number; error?: string }> {
    const supabase = await createClient();

    // Build query - use explicit FK reference (profile_id) to avoid ambiguity with verified_by
    let query = supabase
        .from("doctor_profiles")
        .select(`
            id,
            profile_id,
            slug,
            bio,
            years_of_experience,
            consultation_fee,
            rating_average,
            rating_count,
            is_available_now,
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
        `, { count: "exact" })
        .eq("verification_status", "verified");

    // Filter by availability
    if (filters?.availableNow) {
        query = query.eq("is_available_now", true);
    }

    // Filter by fee range
    if (filters?.minFee !== undefined) {
        query = query.gte("consultation_fee", filters.minFee);
    }
    if (filters?.maxFee !== undefined) {
        query = query.lte("consultation_fee", filters.maxFee);
    }

    // Sorting
    if (filters?.sortBy === "rating") {
        query = query.order("rating_average", { ascending: false, nullsFirst: false });
    } else if (filters?.sortBy === "fee_low") {
        query = query.order("consultation_fee", { ascending: true, nullsFirst: false });
    } else if (filters?.sortBy === "fee_high") {
        query = query.order("consultation_fee", { ascending: false, nullsFirst: false });
    } else if (filters?.sortBy === "experience") {
        query = query.order("years_of_experience", { ascending: false, nullsFirst: false });
    } else {
        // Default: sort by rating
        query = query.order("rating_average", { ascending: false, nullsFirst: false });
    }

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, count, error } = await query;

    if (error) {
        return { doctors: [], total: 0, error: error.message };
    }

    // Transform the data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let doctors: DoctorForBooking[] = (data || []).map((doc: any) => {
        // Extract specializations and remove duplicates
        const specNames = (doc.doctor_specializations || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase returns dynamic nested types
            .map((ds: any) => ds.specializations?.name_en || "")
            .filter(Boolean);
        
        // Remove duplicates using Set - explicitly typed as string[]
        const uniqueSpecializations: string[] = Array.from(new Set(specNames));
        
        return {
        id: doc.id,
        profile_id: doc.profile_id,
        slug: doc.slug,
        full_name: doc.profiles.full_name,
        avatar_url: doc.profiles.avatar_url,
        bio: doc.bio,
        years_of_experience: doc.years_of_experience,
        consultation_fee: doc.consultation_fee,
        rating_average: doc.rating_average,
        rating_count: doc.rating_count,
        is_available_now: doc.is_available_now,
            specializations: uniqueSpecializations,
        };
    });

    // Filter by search if provided (client-side for now due to nested data)
    if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        doctors = doctors.filter(doc =>
            doc.full_name.toLowerCase().includes(searchLower) ||
            doc.specializations.some(s => s.toLowerCase().includes(searchLower)) ||
            (doc.bio && doc.bio.toLowerCase().includes(searchLower))
        );
    }

    // Filter by specialization if provided
    if (filters?.specialization && filters.specialization !== "all") {
        const specLower = filters.specialization.toLowerCase().trim();
        doctors = doctors.filter(doc =>
            doc.specializations.some(s => {
                const sLower = s.toLowerCase();
                if (sLower === specLower) return true;
                if (sLower.includes(specLower) || specLower.includes(sLower)) return true;
                // Aliases from landing page and URL params
                if (specLower === "general" && sLower.includes("general")) return true;
                if (specLower === "mental" && (sLower.includes("psych") || sLower.includes("mental"))) return true;
                if (specLower === "nutrition" && sLower.includes("nutrition")) return true;
                if (specLower === "obgyn" && (sLower.includes("obstetric") || sLower.includes("gynecol"))) return true;
                if (specLower === "ent" && sLower.includes("ent")) return true;
                if (specLower === "orthopedics" && sLower.includes("orthopedic")) return true;
                return false;
            })
        );
    }

    return { doctors, total: count || 0 };
}

/**
 * Get list of specializations for filtering
 */
export async function getSpecializations(): Promise<{
    specializations: { id: string; name_en: string; name_ar: string }[];
    error?: string;
}> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("specializations")
        .select("id, name_en, name_ar")
        .eq("is_active", true)
        .order("name_en");

    if (error) {
        console.error("Error fetching specializations:", error);
        return { specializations: [], error: error.message };
    }

    return { specializations: data || [] };
}

// ============================================
// Rescheduling Actions
// ============================================

/**
 * Reschedule an appointment (doctor or patient)
 */
export async function rescheduleAppointment(data: {
    appointmentId: string;
    newScheduledStart: string;
    newScheduledEnd: string;
    reason?: string;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get user profile and role
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    // Get the appointment
    const { data: appointmentData, error: fetchError } = await supabase
        .from("appointments")
        .select("id, doctor_profile_id, patient_profile_id, status")
        .eq("id", data.appointmentId)
        .single();

    if (fetchError || !appointmentData) {
        return { success: false, error: "Appointment not found" };
    }

    const appointment = appointmentData as {
        id: string;
        doctor_profile_id: string;
        patient_profile_id: string;
        status: string;
    };

    // Verify the user is either the doctor or the patient
    let isAuthorized = false;

    if (profile.role === "doctor") {
        const { data: doctorProfile } = await supabase
            .from("doctor_profiles")
            .select("id")
            .eq("profile_id", profile.id)
            .single();

        if (doctorProfile && (doctorProfile as { id: string }).id === appointment.doctor_profile_id) {
            isAuthorized = true;
        }
    } else if (profile.role === "patient") {
        const { data: patientProfile } = await supabase
            .from("patient_profiles")
            .select("id")
            .eq("profile_id", profile.id)
            .single();

        if (patientProfile && (patientProfile as { id: string }).id === appointment.patient_profile_id) {
            isAuthorized = true;
        }
    }

    if (!isAuthorized) {
        return { success: false, error: "Not authorized to reschedule this appointment" };
    }

    // Only scheduled appointments can be rescheduled
    if (!["scheduled"].includes(appointment.status)) {
        return { success: false, error: "Only scheduled appointments can be rescheduled" };
    }

    // Check if the new slot is available (no overlapping appointments for the doctor)
    const { data: existingAppointments } = await supabase
        .from("appointments")
        .select("id")
        .eq("doctor_profile_id", appointment.doctor_profile_id)
        .neq("id", data.appointmentId) // Exclude current appointment
        .lt("scheduled_start", data.newScheduledEnd)
        .gt("scheduled_end", data.newScheduledStart)
        .in("status", ["scheduled", "in_waiting_room", "in_progress"]);

    if (existingAppointments && existingAppointments.length > 0) {
        return { success: false, error: "The new time slot is not available" };
    }

    // Update the appointment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from("appointments")
        .update({
            scheduled_start: data.newScheduledStart,
            scheduled_end: data.newScheduledEnd,
            rescheduled_at: new Date().toISOString(),
            rescheduled_by: user.id,
            rescheduled_reason: data.reason || null,
        })
        .eq("id", data.appointmentId);

    if (updateError) {
        console.error("Error rescheduling appointment:", updateError);
        return { success: false, error: updateError.message };
    }

    const { doctorUserId, patientUserId } = await getUserIdsForAppointment(supabase, data.appointmentId);
    revalidateAppointmentCaches([doctorUserId, patientUserId]);

    return { success: true };
}

/**
 * Get a single appointment by ID
 */
export async function getAppointmentById(
    appointmentId: string
): Promise<{ appointment: AppointmentWithDetails | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { appointment: null, error: "Not authenticated" };
    }

    const { data, error } = await supabase
        .from("appointments")
        .select(`
            *,
            doctor_profiles (
                id,
                consultation_fee,
                profiles (
                    id,
                    full_name,
                    avatar_url
                )
            ),
            patient_profiles (
                id,
                profiles (
                    id,
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq("id", appointmentId)
        .single();

    if (error) {
        console.error("getAppointmentById error:", error);
        return { appointment: null, error: error.message };
    }

    if (!data) {
        return { appointment: null, error: "Appointment not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apt = data as any;
    const appointment: AppointmentWithDetails = {
        ...apt,
        doctor: apt.doctor_profiles ? {
            id: apt.doctor_profiles.id,
            full_name: apt.doctor_profiles.profiles?.full_name || "Unknown Doctor",
            avatar_url: apt.doctor_profiles.profiles?.avatar_url,
            consultation_fee: apt.doctor_profiles.consultation_fee,
        } : undefined,
        patient: apt.patient_profiles ? {
            id: apt.patient_profiles.id,
            full_name: apt.patient_profiles.profiles?.full_name || "Unknown Patient",
            avatar_url: apt.patient_profiles.profiles?.avatar_url,
        } : undefined,
        doctor_profiles: undefined,
        patient_profiles: undefined,
    };

    return { appointment };
}

// ============================================
// Doctor Profile (for patient viewing)
// ============================================

export interface DoctorProfileDetail extends DoctorForBooking {
    languages?: string[];
    education?: string;
    certifications?: string[];
    hospital?: string;
    working_hours_summary?: string;
    reviews_preview: Array<{
        id: string;
        rating: number;
        comment?: string;
        patient_name: string;
        created_at: string;
    }>;
}

/**
 * Get detailed doctor profile for patients to view before booking
 */
export async function getDoctorById(
    doctorIdOrSlug: string
): Promise<{ doctor: DoctorProfileDetail | null; error?: string }> {
    const supabase = await createClient();

    // Determine if input is UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doctorIdOrSlug);
    const filterField = isUUID ? "id" : "slug";

    // Get doctor profile with all details - use explicit FK to avoid ambiguity
    // Note: only selecting columns that exist in the current database schema
    const { data, error } = await supabase
        .from("doctor_profiles")
        .select(`
            id,
            profile_id,
            slug,
            bio,
            years_of_experience,
            consultation_fee,
            rating_average,
            rating_count,
            is_available_now,
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
        `)
        .eq(filterField, doctorIdOrSlug)
        .eq("verification_status", "verified")
        .single();

    if (error || !data) {
        return { doctor: null, error: error?.message || "Doctor not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = data as any;

    // Get recent reviews (top 5)
    const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
            id,
            rating,
            comment,
            created_at,
            patient_profiles (
                profiles (
                    full_name
                )
            )
        `)
        .eq("doctor_profile_id", doc.id)
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(5);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviews = (reviewsData || []).map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        patient_name: r.patient_profiles?.profiles?.full_name || "Patient",
        created_at: r.created_at,
    }));

    // Build specializations array and remove duplicates
    const specNames = (doc.doctor_specializations || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase returns dynamic nested types
        .map((ds: any) => ds.specializations?.name_en || "")
        .filter(Boolean);
    
    // Remove duplicates using Set - explicitly typed as string[]
    const specializations: string[] = Array.from(new Set(specNames));

    return {
        doctor: {
            id: doc.id,
            profile_id: doc.profile_id,
            slug: doc.slug,
            full_name: doc.profiles?.full_name || "",
            avatar_url: doc.profiles?.avatar_url,
            bio: doc.bio,
            years_of_experience: doc.years_of_experience,
            consultation_fee: doc.consultation_fee,
            rating_average: doc.rating_average,
            rating_count: doc.rating_count,
            is_available_now: doc.is_available_now,
            specializations,
            languages: [], // column doesn't exist in current schema
            education: undefined, // column doesn't exist in current schema
            hospital: undefined, // column doesn't exist in current schema
            reviews_preview: reviews,
        },
    };
}

// ============================================
// Doctor's Patients
// ============================================

export interface DoctorPatient {
    id: string;
    profile_id: string;
    full_name: string;
    avatar_url?: string;
    age?: number;
    last_visit?: string;
    last_condition?: string;
    total_visits: number;
    status: "active" | "inactive";
}

/**
 * Get list of patients who have had appointments with this doctor
 * Includes last visit date, condition, and visit count
 */
export async function getDoctorPatientsWithDetails(): Promise<{
    patients: DoctorPatient[];
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { patients: [], error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { patients: [], error: "Not a doctor profile" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { patients: [], error: "Doctor profile not found" };
    }

    // Get all appointments for this doctor with patient details
    const { data, error } = await supabase
        .from("appointments")
        .select(`
            id,
            scheduled_start,
            status,
            chief_complaint,
            patient_profiles!inner (
                id,
                profile_id,
                date_of_birth,
                profiles (
                    id,
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq("doctor_profile_id", doctorProfile.id)
        .in("status", ["completed", "in_progress", "scheduled", "in_waiting_room"])
        .order("scheduled_start", { ascending: false });

    if (error) {
        console.error("Error fetching doctor's patients:", error);
        return { patients: [], error: error.message };
    }

    // Process and deduplicate patients, keeping track of visit counts and last visit
    const patientMap = new Map<string, DoctorPatient>();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data || []).forEach((apt: any) => {
        const pp = apt.patient_profiles;
        const patientId = pp.id;

        // Calculate age from date of birth
        let age: number | undefined;
        if (pp.date_of_birth) {
            const birthDate = new Date(pp.date_of_birth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }

        const existing = patientMap.get(patientId);
        if (!existing) {
            // Determine if patient is active (had appointment in last 30 days)
            const lastVisitDate = new Date(apt.scheduled_start);
            const isActive = lastVisitDate >= thirtyDaysAgo;

            patientMap.set(patientId, {
                id: patientId,
                profile_id: pp.profile_id,
                full_name: pp.profiles.full_name,
                avatar_url: pp.profiles.avatar_url,
                age,
                last_visit: apt.scheduled_start,
                last_condition: apt.chief_complaint || undefined,
                total_visits: 1,
                status: isActive ? "active" : "inactive",
            });
        } else {
            // Update visit count
            existing.total_visits += 1;
        }
    });

    return { patients: Array.from(patientMap.values()) };
}

// ============================================
// Consultation History
// ============================================

export interface ConsultationHistoryItem {
    id: string;
    appointment_id: string;
    patient_name: string;
    patient_avatar?: string;
    consultation_type?: string;
    duration_minutes?: number;
    scheduled_start: string;
    actual_start?: string;
    actual_end?: string;
    status: AppointmentStatus;
}

/**
 * Get consultation history for a doctor
 * Returns both active/in-progress and completed consultations
 */
export async function getDoctorConsultations(options?: {
    status?: "active" | "history" | "all";
    limit?: number;
}): Promise<{
    active: ConsultationHistoryItem[];
    history: ConsultationHistoryItem[];
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { active: [], history: [], error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { active: [], history: [], error: "Not a doctor profile" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { active: [], history: [], error: "Doctor profile not found" };
    }

    // Get appointments with patient details
    let query = supabase
        .from("appointments")
        .select(`
            id,
            scheduled_start,
            actual_start,
            actual_end,
            status,
            chief_complaint,
            patient_profiles!inner (
                id,
                profiles (
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq("doctor_profile_id", doctorProfile.id)
        .order("scheduled_start", { ascending: false });

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching consultations:", error);
        return { active: [], history: [], error: error.message };
    }

    const active: ConsultationHistoryItem[] = [];
    const history: ConsultationHistoryItem[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data || []).forEach((apt: any) => {
        // Calculate duration in minutes
        let durationMinutes: number | undefined;
        if (apt.actual_start && apt.actual_end) {
            const start = new Date(apt.actual_start);
            const end = new Date(apt.actual_end);
            durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
        }

        const item: ConsultationHistoryItem = {
            id: apt.id,
            appointment_id: apt.id,
            patient_name: apt.patient_profiles?.profiles?.full_name || "Unknown",
            patient_avatar: apt.patient_profiles?.profiles?.avatar_url,
            consultation_type: apt.chief_complaint || undefined,
            duration_minutes: durationMinutes,
            scheduled_start: apt.scheduled_start,
            actual_start: apt.actual_start,
            actual_end: apt.actual_end,
            status: apt.status,
        };

        if (apt.status === "in_progress" || apt.status === "in_waiting_room") {
            active.push(item);
        } else if (apt.status === "completed") {
            history.push(item);
        }
    });

    return { active, history };
}
