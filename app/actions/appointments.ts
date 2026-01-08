"use server";

import { createClient } from "@/lib/supabase/server";

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
    patient_notes?: string;
    created_at: string;
    updated_at: string;
}

export interface AppointmentWithDetails extends Appointment {
    patient?: {
        id: string;
        full_name: string;
        avatar_url?: string;
        phone?: string;
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

// ============================================
// Patient Actions
// ============================================

/**
 * Book a new appointment
 */
export async function bookAppointment(data: {
    doctorProfileId: string;
    scheduledStart: string;
    scheduledEnd: string;
    patientNotes?: string;
}): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
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

    // Get doctor's consultation fee
    const { data: doctorData } = await supabase
        .from("doctor_profiles")
        .select("consultation_fee")
        .eq("id", data.doctorProfileId)
        .single();

    const doctor = doctorData as { consultation_fee: number | null } | null;
    const consultationFee = doctor?.consultation_fee || 0;

    // Check if slot is still available (no overlapping appointments)
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
            patient_notes: data.patientNotes || null,
        })
        .select("id")
        .single();

    if (error) {
        console.error("Error booking appointment:", error);
        return { success: false, error: error.message };
    }

    return { success: true, appointmentId: insertedData?.id };
}

/**
 * Get patient's appointments
 */
export async function getPatientAppointments(filters?: {
    status?: AppointmentStatus[];
    upcoming?: boolean;
    limit?: number;
}): Promise<{ appointments: AppointmentWithDetails[]; error?: string }> {
    const supabase = await createClient();

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

    // Build query
    let query = supabase
        .from("appointments")
        .select(`
            *,
            doctor_profiles!inner (
                id,
                consultation_fee,
                profiles!inner (
                    id,
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq("patient_profile_id", patientProfile.id)
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

    // Update appointment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("appointments")
        .update({
            status: "cancelled",
            cancellation_reason: reason || null,
            cancelled_by: user.id,
        })
        .eq("id", appointmentId)
        .eq("patient_profile_id", patientProfile.id)
        .in("status", ["scheduled"]); // Can only cancel scheduled appointments

    if (error) {
        console.error("Error cancelling appointment:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============================================
// Doctor Actions
// ============================================

/**
 * Get doctor's appointments
 */
export async function getDoctorAppointments(filters?: {
    status?: AppointmentStatus[];
    date?: string; // YYYY-MM-DD
    upcoming?: boolean;
    limit?: number;
}): Promise<{ appointments: AppointmentWithDetails[]; error?: string }> {
    const supabase = await createClient();

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

    // Build query
    let query = supabase
        .from("appointments")
        .select(`
            *,
            patient_profiles!inner (
                id,
                profiles!inner (
                    id,
                    full_name,
                    avatar_url,
                    phone
                )
            )
        `)
        .eq("doctor_profile_id", doctorProfile.id)
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
        patient: {
            id: apt.patient_profiles.id,
            full_name: apt.patient_profiles.profiles.full_name,
            avatar_url: apt.patient_profiles.profiles.avatar_url,
            phone: apt.patient_profiles.profiles.phone,
        },
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

    return { success: true };
}

/**
 * Doctor starts consultation
 */
export async function startConsultation(
    appointmentId: string
): Promise<{ success: boolean; jitsiRoomId?: string; error?: string }> {
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

    // Generate unique Jitsi room ID
    const jitsiRoomId = `tawari-${appointmentId.slice(0, 8)}-${Date.now()}`;

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
        .in("status", ["scheduled", "in_waiting_room"]);

    if (updateError) {
        console.error("Error starting consultation:", updateError);
        return { success: false, error: updateError.message };
    }

    // Create consultation session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: sessionError } = await (supabase as any)
        .from("consultation_sessions")
        .insert({
            appointment_id: appointmentId,
            jitsi_room_id: jitsiRoomId,
            started_at: new Date().toISOString(),
            recording_consent: false,
        });

    if (sessionError) {
        console.error("Error creating consultation session:", sessionError);
        // Don't fail the whole operation, just log
    }

    return { success: true, jitsiRoomId };
}

/**
 * End consultation
 */
export async function endConsultation(
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

    return { success: true };
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

// ============================================
// Doctor Listing (for patients to book)
// ============================================

export interface DoctorForBooking {
    id: string;
    profile_id: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    years_of_experience?: number;
    consultation_fee?: number;
    specializations: string[];
    rating?: number;
}

/**
 * Get list of verified doctors available for booking
 */
export async function getAvailableDoctors(filters?: {
    specialization?: string;
    search?: string;
    limit?: number;
    offset?: number;
}): Promise<{ doctors: DoctorForBooking[]; total: number; error?: string }> {
    const supabase = await createClient();

    // Build query
    let query = supabase
        .from("doctor_profiles")
        .select(`
            id,
            profile_id,
            bio,
            years_of_experience,
            consultation_fee,
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
        `, { count: "exact" })
        .eq("verification_status", "verified");

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, count, error } = await query;

    if (error) {
        console.error("Error fetching doctors:", error);
        return { doctors: [], total: 0, error: error.message };
    }

    // Transform the data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let doctors: DoctorForBooking[] = (data || []).map((doc: any) => ({
        id: doc.id,
        profile_id: doc.profile_id,
        full_name: doc.profiles.full_name,
        avatar_url: doc.profiles.avatar_url,
        bio: doc.bio,
        years_of_experience: doc.years_of_experience,
        consultation_fee: doc.consultation_fee,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        specializations: (doc.doctor_specializations || []).map((ds: any) =>
            ds.specializations?.name_en || ""
        ).filter(Boolean),
    }));

    // Filter by search if provided
    if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        doctors = doctors.filter(doc =>
            doc.full_name.toLowerCase().includes(searchLower) ||
            doc.specializations.some(s => s.toLowerCase().includes(searchLower))
        );
    }

    // Filter by specialization if provided
    if (filters?.specialization) {
        const specLower = filters.specialization.toLowerCase();
        doctors = doctors.filter(doc =>
            doc.specializations.some(s => s.toLowerCase() === specLower)
        );
    }

    return { doctors, total: count || 0 };
}
