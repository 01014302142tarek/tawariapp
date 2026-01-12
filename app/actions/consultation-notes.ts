"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export interface ConsultationNote {
    id: string;
    appointment_id: string;
    doctor_profile_id: string;
    subjective: string | null;
    objective: string | null;
    assessment: string | null;
    plan: string | null;
    private_notes: string | null;
    follow_up_recommended: boolean;
    follow_up_timeframe: string | null;
    created_at: string;
    updated_at: string;
}

export interface ConsultationNoteInput {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    privateNotes?: string;
    followUpRecommended?: boolean;
    followUpTimeframe?: string;
}

// ============================================
// Server Actions
// ============================================

/**
 * Save consultation notes for an appointment (doctor only)
 */
export async function saveConsultationNotes(
    appointmentId: string,
    notes: ConsultationNoteInput
): Promise<{ success: boolean; noteId?: string; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { success: false, error: "Not a doctor profile" };
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

    // Verify this appointment belongs to the doctor
    const { data: appointmentData } = await supabase
        .from("appointments")
        .select("id, doctor_profile_id, status")
        .eq("id", appointmentId)
        .single();

    const appointment = appointmentData as { id: string; doctor_profile_id: string; status: string } | null;
    if (!appointment || appointment.doctor_profile_id !== doctorProfile.id) {
        return { success: false, error: "Appointment not found or unauthorized" };
    }

    // Check if notes already exist
    const { data: existingNoteData } = await supabase
        .from("consultation_notes")
        .select("id")
        .eq("appointment_id", appointmentId)
        .single();

    const existingNote = existingNoteData as { id: string } | null;

    const noteData = {
        subjective: notes.subjective || null,
        objective: notes.objective || null,
        assessment: notes.assessment || null,
        plan: notes.plan || null,
        private_notes: notes.privateNotes || null,
        follow_up_recommended: notes.followUpRecommended || false,
        follow_up_timeframe: notes.followUpTimeframe || null,
    };

    if (existingNote) {
        // Update existing note
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from("consultation_notes")
            .update(noteData)
            .eq("id", existingNote.id);

        if (error) {
            console.error("Error updating consultation notes:", error);
            return { success: false, error: error.message };
        }

        return { success: true, noteId: existingNote.id };
    } else {
        // Create new note
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from("consultation_notes")
            .insert({
                appointment_id: appointmentId,
                doctor_profile_id: doctorProfile.id,
                ...noteData,
            })
            .select("id")
            .single();

        if (error) {
            console.error("Error creating consultation notes:", error);
            return { success: false, error: error.message };
        }

        return { success: true, noteId: data?.id };
    }
}

/**
 * Get consultation notes for an appointment
 */
export async function getConsultationNotes(
    appointmentId: string
): Promise<{ note: ConsultationNote | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { note: null, error: "Not authenticated" };
    }

    // Get profile to check role
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile) {
        return { note: null, error: "Profile not found" };
    }

    // Get the notes
    const { data, error } = await supabase
        .from("consultation_notes")
        .select("*")
        .eq("appointment_id", appointmentId)
        .single();

    if (error && error.code !== "PGRST116") { // Ignore "no rows" error
        console.error("Error fetching consultation notes:", error);
        return { note: null, error: error.message };
    }

    const note = data as ConsultationNote | null;

    // If user is a patient, hide private notes
    if (note && profile.role === "patient") {
        return {
            note: {
                ...note,
                private_notes: null, // Hide private notes from patients
            },
        };
    }

    return { note };
}

/**
 * Get all consultation notes for a doctor's appointments
 */
export async function getDoctorConsultationNotes(filters?: {
    limit?: number;
    offset?: number;
}): Promise<{ notes: (ConsultationNote & { patientName: string; appointmentDate: string })[]; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { notes: [], error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { notes: [], error: "Not a doctor profile" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { notes: [], error: "Doctor profile not found" };
    }

    // Build query
    let query = supabase
        .from("consultation_notes")
        .select(`
            *,
            appointments!inner (
                scheduled_start,
                patient_profiles (
                    profiles (
                        full_name
                    )
                )
            )
        `)
        .eq("doctor_profile_id", doctorProfile.id)
        .order("created_at", { ascending: false });

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching doctor consultation notes:", error);
        return { notes: [], error: error.message };
    }

    // Transform data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notes = (data || []).map((note: any) => ({
        ...note,
        patientName: note.appointments?.patient_profiles?.profiles?.full_name || "Unknown",
        appointmentDate: note.appointments?.scheduled_start || "",
        appointments: undefined,
    }));

    return { notes };
}

/**
 * Get consultation notes for a patient's appointments
 */
export async function getPatientConsultationNotes(filters?: {
    limit?: number;
    offset?: number;
}): Promise<{ notes: (ConsultationNote & { doctorName: string; appointmentDate: string })[]; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { notes: [], error: "Not authenticated" };
    }

    // Get patient profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "patient") {
        return { notes: [], error: "Not a patient profile" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { notes: [], error: "Patient profile not found" };
    }

    // Build query
    let query = supabase
        .from("consultation_notes")
        .select(`
            *,
            appointments!inner (
                scheduled_start,
                patient_profile_id,
                doctor_profiles (
                    profiles (
                        full_name
                    )
                )
            )
        `)
        .eq("appointments.patient_profile_id", patientProfile.id)
        .order("created_at", { ascending: false });

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching patient consultation notes:", error);
        return { notes: [], error: error.message };
    }

    // Transform data - hide private notes from patients
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notes = (data || []).map((note: any) => ({
        ...note,
        private_notes: null, // Hide private notes
        doctorName: note.appointments?.doctor_profiles?.profiles?.full_name || "Unknown",
        appointmentDate: note.appointments?.scheduled_start || "",
        appointments: undefined,
    }));

    return { notes };
}
