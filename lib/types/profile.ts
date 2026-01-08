import type { Database } from "@/lib/supabase/types";

// Type aliases for cleaner code
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PatientProfile = Database["public"]["Tables"]["patient_profiles"]["Row"];
export type DoctorProfile = Database["public"]["Tables"]["doctor_profiles"]["Row"];
export type AdminProfile = Database["public"]["Tables"]["admin_profiles"]["Row"];
export type AssistantProfile = Database["public"]["Tables"]["assistant_profiles"]["Row"];

// Combined profile types
export interface FullPatientProfile {
    profile: Profile;
    patientProfile: PatientProfile;
}

export interface FullDoctorProfile {
    profile: Profile;
    doctorProfile: DoctorProfile;
}

export interface FullAdminProfile {
    profile: Profile;
    adminProfile: AdminProfile;
}

export interface FullAssistantProfile {
    profile: Profile;
    assistantProfile: AssistantProfile;
}

export type FullProfile =
    | FullPatientProfile
    | FullDoctorProfile
    | FullAdminProfile
    | FullAssistantProfile;

// Type guards for profile types
export function isPatientProfile(profile: FullProfile): profile is FullPatientProfile {
    return "patientProfile" in profile;
}

export function isDoctorProfile(profile: FullProfile): profile is FullDoctorProfile {
    return "doctorProfile" in profile;
}

export function isAdminProfile(profile: FullProfile): profile is FullAdminProfile {
    return "adminProfile" in profile;
}

export function isAssistantProfile(profile: FullProfile): profile is FullAssistantProfile {
    return "assistantProfile" in profile;
}
