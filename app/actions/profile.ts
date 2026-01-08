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
 */
export async function getCurrentUserProfile(): Promise<FullProfile | null> {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return null;
    }

    // Get base profile
    const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        return null;
    }

    // Type assertion for profile
    const profile = profileData as unknown as Profile;

    // Get role-specific profile based on role
    switch (profile.role) {
        case "patient": {
            const { data: patientProfileData } = await supabase
                .from("patient_profiles")
                .select("*")
                .eq("profile_id", profile.id)
                .single();

            if (patientProfileData) {
                const patientProfile = patientProfileData as unknown as PatientProfile;
                return { profile, patientProfile };
            }
            break;
        }
        case "doctor": {
            const { data: doctorProfileData } = await supabase
                .from("doctor_profiles")
                .select("*")
                .eq("profile_id", profile.id)
                .single();

            if (doctorProfileData) {
                const doctorProfile = doctorProfileData as unknown as DoctorProfile;
                return { profile, doctorProfile };
            }
            break;
        }
        case "admin": {
            const { data: adminProfileData } = await supabase
                .from("admin_profiles")
                .select("*")
                .eq("profile_id", profile.id)
                .single();

            if (adminProfileData) {
                const adminProfile = adminProfileData as unknown as AdminProfile;
                return { profile, adminProfile };
            }
            break;
        }
        case "doctor_assistant":
        case "admin_assistant": {
            const { data: assistantProfileData } = await supabase
                .from("assistant_profiles")
                .select("*")
                .eq("profile_id", profile.id)
                .single();

            if (assistantProfileData) {
                const assistantProfile = assistantProfileData as unknown as AssistantProfile;
                return { profile, assistantProfile };
            }
            break;
        }
    }

    // Fallback: return just the base profile wrapped appropriately
    // This shouldn't happen if triggers are working correctly
    return null;
}

/**
 * Update base profile fields (name, language, timezone)
 */
export async function updateProfile(data: {
    full_name?: string;
    preferred_language?: string;
    timezone?: string;
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
