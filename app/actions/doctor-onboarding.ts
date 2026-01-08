"use server";

import { createClient } from "@/lib/supabase/server";

interface DoctorOnboardingData {
    // Step 1 - Account creation (handled separately via signUp)
    fullName: string;
    phone: string;

    // Step 2 - Professional details
    specialty: string;
    experience: string;
    licenseNumber: string;
    certifications: string;

    // Step 3 - Practice info
    clinicName: string;
    address: string;
    availableDays: string;
    workingHours: string;
    consultationFee: string;

    // Step 4 - Verification
    bio: string;
}

/**
 * Save doctor's professional details (Step 2)
 * Updates doctor_profile with license, experience, specializations
 */
export async function saveProfessionalDetails(data: {
    licenseNumber: string;
    yearsOfExperience: number;
    specialty: string;
    certifications?: string;
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

    // Update doctor_profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("doctor_profiles")
        .update({
            license_number: data.licenseNumber || null,
            years_of_experience: data.yearsOfExperience || 0,
        })
        .eq("profile_id", profile.id);

    if (error) {
        console.error("Error saving professional details:", error);
        return { success: false, error: error.message };
    }

    // Save specialty to doctor_specializations if provided
    if (data.specialty) {
        // First find the specialization ID
        const { data: specDataRaw } = await supabase
            .from("specializations")
            .select("id")
            .or(`name_en.eq.${data.specialty},name_ar.eq.${data.specialty}`)
            .single();

        const specData = specDataRaw as { id: string } | null;
        if (specData) {
            // Get doctor_profile id
            const { data: doctorProfileRaw } = await supabase
                .from("doctor_profiles")
                .select("id")
                .eq("profile_id", profile.id)
                .single();

            const doctorProfile = doctorProfileRaw as { id: string } | null;
            if (doctorProfile) {
                // Check if already exists
                const { data: existing } = await supabase
                    .from("doctor_specializations")
                    .select("id")
                    .eq("doctor_profile_id", doctorProfile.id)
                    .eq("specialization_id", specData.id)
                    .single();

                if (!existing) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase as any)
                        .from("doctor_specializations")
                        .insert({
                            doctor_profile_id: doctorProfile.id,
                            specialization_id: specData.id,
                            is_primary: true,
                        });
                }
            }
        }
    }

    return { success: true };
}

/**
 * Save doctor's practice information (Step 3)
 * Updates doctor_profile with consultation fee and bio
 */
export async function savePracticeInfo(data: {
    consultationFee: number;
    clinicName?: string;
    address?: string;
    availableDays?: string;
    workingHours?: string;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { success: false, error: "Not a doctor profile" };
    }

    // Update doctor_profile with consultation fee
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("doctor_profiles")
        .update({
            consultation_fee: data.consultationFee || null,
        })
        .eq("profile_id", profile.id);

    if (error) {
        console.error("Error saving practice info:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Save doctor's bio and submit for verification (Step 4)
 */
export async function saveBioAndSubmit(data: {
    bio: string;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { success: false, error: "Not a doctor profile" };
    }

    // Update bio and set verification status to pending
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("doctor_profiles")
        .update({
            bio: data.bio || null,
            verification_status: "pending",
        })
        .eq("profile_id", profile.id);

    if (error) {
        console.error("Error submitting for verification:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Complete onboarding - save all data at once
 * This is the main function called when the doctor completes the onboarding flow
 */
export async function completeOnboarding(data: DoctorOnboardingData): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role, full_name")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string; full_name: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { success: false, error: "Not a doctor profile" };
    }

    // Update base profile if name changed
    if (data.fullName && data.fullName !== profile.full_name) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from("profiles")
            .update({ full_name: data.fullName })
            .eq("id", profile.id);
    }

    // Parse consultation fee
    const consultationFee = data.consultationFee ? parseFloat(data.consultationFee) : null;
    const yearsExperience = data.experience ? parseInt(data.experience, 10) : 0;

    // Update doctor_profile with all data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: doctorError } = await (supabase as any)
        .from("doctor_profiles")
        .update({
            license_number: data.licenseNumber || null,
            years_of_experience: yearsExperience,
            bio: data.bio || null,
            consultation_fee: consultationFee,
            verification_status: "pending",
        })
        .eq("profile_id", profile.id);

    if (doctorError) {
        console.error("Error completing onboarding:", doctorError);
        return { success: false, error: doctorError.message };
    }

    // Save specialty if provided
    if (data.specialty) {
        const { data: specDataRaw } = await supabase
            .from("specializations")
            .select("id")
            .or(`name_en.eq.${data.specialty},name_ar.eq.${data.specialty}`)
            .single();

        const specData = specDataRaw as { id: string } | null;
        if (specData) {
            const { data: doctorProfileRaw } = await supabase
                .from("doctor_profiles")
                .select("id")
                .eq("profile_id", profile.id)
                .single();

            const doctorProfile = doctorProfileRaw as { id: string } | null;
            if (doctorProfile) {
                // Check if already exists
                const { data: existing } = await supabase
                    .from("doctor_specializations")
                    .select("id")
                    .eq("doctor_profile_id", doctorProfile.id)
                    .eq("specialization_id", specData.id)
                    .single();

                if (!existing) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase as any)
                        .from("doctor_specializations")
                        .insert({
                            doctor_profile_id: doctorProfile.id,
                            specialization_id: specData.id,
                            is_primary: true,
                        });
                }
            }
        }
    }

    return { success: true };
}

/**
 * Get current doctor's onboarding status
 */
export async function getDoctorOnboardingStatus(): Promise<{
    isComplete: boolean;
    verificationStatus: string | null;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { isComplete: false, verificationStatus: null, error: "Not authenticated" };
    }

    // Get profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { isComplete: false, verificationStatus: null, error: "Not a doctor profile" };
    }

    // Get doctor_profile
    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("verification_status, license_number, bio")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as {
        verification_status: string;
        license_number: string | null;
        bio: string | null;
    } | null;

    if (!doctorProfile) {
        return { isComplete: false, verificationStatus: null };
    }

    // Consider onboarding complete if verification_status is not null (means submitted)
    const isComplete = doctorProfile.verification_status !== "pending" ||
                       doctorProfile.license_number !== null;

    return {
        isComplete,
        verificationStatus: doctorProfile.verification_status,
    };
}
