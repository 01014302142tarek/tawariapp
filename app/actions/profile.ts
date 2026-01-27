"use server";

import { createClient } from "@/lib/supabase/server";
import type {
    FullProfile,
    Profile,
    PatientProfile,
    DoctorProfile,
    AdminProfile,
    AssistantProfile,
} from "@/lib/types/profile";

// Re-export types for convenience
export type {
    Profile,
    PatientProfile,
    DoctorProfile,
    AdminProfile,
    AssistantProfile,
    FullPatientProfile,
    FullDoctorProfile,
    FullAdminProfile,
    FullAssistantProfile,
    FullProfile,
} from "@/lib/types/profile";

/**
 * Get the current authenticated user's complete profile
 * Includes role-specific data (patient_profiles, doctor_profiles, etc.)
 * Optimized: Uses single query with embedded selects for most roles
 * Exception: assistant_profiles uses two-step approach to avoid RLS recursion
 */
export async function getCurrentUserProfile(): Promise<FullProfile | null> {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return null;
    }

    // Get user's role from metadata to determine which embedded select to use
    const userRole = user.user_metadata?.role as string | undefined;

    // Optimized: Single query with embedded select based on role
    // This reduces 2 sequential queries to 1 combined query
    if (userRole === "patient") {
        const { data, error } = await supabase
            .from("profiles")
            .select(`*, patient_profiles(*)`)
            .eq("user_id", user.id)
            .single();

        if (error || !data) {
            console.error("Error fetching patient profile:", error);
            return null;
        }

        const { patient_profiles, ...profileData } = data as Record<string, unknown>;
        const profile = profileData as unknown as Profile;
        const patientProfile = Array.isArray(patient_profiles)
            ? patient_profiles[0] as PatientProfile | undefined
            : patient_profiles as PatientProfile | undefined;
        return { profile, patientProfile } as FullProfile;
    }

    if (userRole === "doctor") {
        // Note: Must specify FK because doctor_profiles has two FKs to profiles (profile_id and verified_by)
        const { data, error } = await supabase
            .from("profiles")
            .select(`*, doctor_profiles!doctor_profiles_profile_id_fkey(*)`)
            .eq("user_id", user.id)
            .single();

        if (error || !data) {
            console.error("Error fetching doctor profile:", error);
            return null;
        }

        const { doctor_profiles, ...profileData } = data as Record<string, unknown>;
        const profile = profileData as unknown as Profile;
        const doctorProfile = Array.isArray(doctor_profiles)
            ? doctor_profiles[0] as DoctorProfile | undefined
            : doctor_profiles as DoctorProfile | undefined;
        return { profile, doctorProfile } as FullProfile;
    }

    if (userRole === "admin") {
        const { data, error } = await supabase
            .from("profiles")
            .select(`*, admin_profiles(*)`)
            .eq("user_id", user.id)
            .single();

        if (error || !data) {
            console.error("Error fetching admin profile:", error);
            return null;
        }

        const { admin_profiles, ...profileData } = data as Record<string, unknown>;
        const profile = profileData as unknown as Profile;
        const adminProfile = Array.isArray(admin_profiles)
            ? admin_profiles[0] as AdminProfile | undefined
            : admin_profiles as AdminProfile | undefined;
        return { profile, adminProfile } as FullProfile;
    }

    // For unknown roles or missing metadata, fetch base profile first then role-specific data
    const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        return null;
    }

    const profile = profileData as unknown as Profile;

    // Fetch role-specific profile based on database role (fallback when user_metadata.role is missing)
    if (profile.role === "doctor") {
        const { data: doctorData } = await supabase
            .from("doctor_profiles")
            .select("*")
            .eq("profile_id", profile.id)
            .single();
        const doctorProfile = doctorData as unknown as DoctorProfile | null;
        return { profile, doctorProfile: doctorProfile || undefined } as FullProfile;
    }

    if (profile.role === "patient") {
        const { data: patientData } = await supabase
            .from("patient_profiles")
            .select("*")
            .eq("profile_id", profile.id)
            .single();
        const patientProfile = patientData as unknown as PatientProfile | null;
        return { profile, patientProfile: patientProfile || undefined } as FullProfile;
    }

    if (profile.role === "admin") {
        const { data: adminData } = await supabase
            .from("admin_profiles")
            .select("*")
            .eq("profile_id", profile.id)
            .single();
        const adminProfile = adminData as unknown as AdminProfile | null;
        return { profile, adminProfile: adminProfile || undefined } as FullProfile;
    }

    // Fetch assistant profile if applicable
    if (profile.role === "doctor_assistant" || profile.role === "admin_assistant") {
        const { data: assistantData } = await supabase
            .from("assistant_profiles")
            .select("*")
            .eq("profile_id", profile.id)
            .single();
        const assistantProfile = assistantData as unknown as AssistantProfile | null;
        return { profile, assistantProfile: assistantProfile || undefined } as FullProfile;
    }

    // Fallback: return just the base profile
    return { profile } as FullProfile;
}

/**
 * Update base profile fields (name, language, timezone, notification preferences)
 */
export async function updateProfile(data: {
    full_name?: string;
    preferred_language?: string;
    timezone?: string;
    notify_email?: boolean;
    notify_sms?: boolean;
    notify_appointments?: boolean;
    notify_prescriptions?: boolean;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("profiles")
        .update(data)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Update patient-specific profile fields
 */
export async function updatePatientProfile(data: {
    date_of_birth?: string;
    gender?: string;
    blood_type?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get profile to find patient_profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "patient") {
        return { success: false, error: "Not a patient profile" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("patient_profiles")
        .update(data)
        .eq("profile_id", profile.id);

    if (error) {
        console.error("Error updating patient profile:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Update doctor-specific profile fields
 */
export async function updateDoctorProfile(data: {
    bio?: string;
    consultation_fee?: number;
    is_available_now?: boolean;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get profile to find doctor_profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { success: false, error: "Not a doctor profile" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("doctor_profiles")
        .update(data)
        .eq("profile_id", profile.id);

    if (error) {
        console.error("Error updating doctor profile:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
