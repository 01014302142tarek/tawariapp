"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadAvatar, uploadCredential, saveCredentialRecord } from "@/lib/supabase/storage";
import { professionalDetailsSchema, validateInput } from "@/lib/validations";

interface DoctorOnboardingData {
    // Step 1 - Account creation (handled separately via signUp)
    fullName: string;
    phone: string;

    // Step 2 - Professional details
    specialty: string;
    experience: string;
    licenseNumber: string;

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
}): Promise<{ success: boolean; error?: string }> {
    // Validate input
    const validation = validateInput(professionalDetailsSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

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
        // Error saving professional details - returned to caller
        return { success: false, error: error.message };
    }

    // Save specialty to doctor_specializations if provided
    if (data.specialty) {
        // First find the specialization ID
        const { data: specDataRaw, error: specError } = await supabase
            .from("specializations")
            .select("id")
            .or(`name_en.eq.${data.specialty},name_ar.eq.${data.specialty}`)
            .single();

        if (specError) {
            // Specialization not found - continue without failing the whole operation
            // This allows the doctor to proceed even if specialty lookup fails
        }

        const specData = specDataRaw as { id: string } | null;
        if (specData) {
            // Get doctor_profile id
            const { data: doctorProfileRaw, error: profileError } = await supabase
                .from("doctor_profiles")
                .select("id")
                .eq("profile_id", profile.id)
                .single();

            if (profileError) {
                return { success: false, error: "Doctor profile not found" };
            }

            const doctorProfile = doctorProfileRaw as { id: string } | null;
            if (doctorProfile) {
                // Check if already exists (use maybeSingle to avoid error on no match)
                const { data: existing } = await supabase
                    .from("doctor_specializations")
                    .select("id")
                    .eq("doctor_profile_id", doctorProfile.id)
                    .eq("specialization_id", specData.id)
                    .maybeSingle();

                if (!existing) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { error: insertError } = await (supabase as any)
                        .from("doctor_specializations")
                        .insert({
                            doctor_profile_id: doctorProfile.id,
                            specialization_id: specData.id,
                            is_primary: true,
                        });

                    if (insertError) {
                        // Log but don't fail - specialty is supplementary
                    }
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
    // Validate consultation fee
    if (data.consultationFee < 0 || data.consultationFee > 10000) {
        return { success: false, error: "Consultation fee must be between 0 and 10,000 EGP" };
    }

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

    // Update doctor_profile with consultation fee and clinic info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("doctor_profiles")
        .update({
            consultation_fee: data.consultationFee || null,
            clinic_name: data.clinicName || null,
            clinic_address: data.address || null,
        })
        .eq("profile_id", profile.id);

    if (error) {
        // Error saving practice info - returned to caller
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
    // Validate bio length
    if (data.bio && data.bio.length > 2000) {
        return { success: false, error: "Bio must be less than 2000 characters" };
    }

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
        // Error submitting for verification - returned to caller
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Complete onboarding - save all data at once
 * This is the main function called when the doctor completes the onboarding flow
 */
export async function completeOnboarding(data: DoctorOnboardingData): Promise<{ success: boolean; error?: string }> {
    try {
        console.log("Starting completeOnboarding with data:", {
            hasFullName: !!data.fullName,
            hasPhone: !!data.phone,
            hasSpecialty: !!data.specialty,
            hasExperience: !!data.experience,
            hasLicenseNumber: !!data.licenseNumber,
            hasClinicName: !!data.clinicName,
            hasAddress: !!data.address,
            hasAvailableDays: !!data.availableDays,
            hasWorkingHours: !!data.workingHours,
            hasConsultationFee: !!data.consultationFee,
            hasBio: !!data.bio,
        });

        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error("completeOnboarding: Not authenticated");
            return { success: false, error: "Not authenticated" };
        }

        console.log("completeOnboarding: User authenticated:", user.id);

        // Get profile
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, role, full_name")
            .eq("user_id", user.id)
            .single();

        if (profileError) {
            console.error("completeOnboarding: Error fetching profile:", profileError);
            return { success: false, error: "Failed to fetch profile: " + profileError.message };
        }

        const profile = profileData as { id: string; role: string; full_name: string } | null;
        if (!profile || profile.role !== "doctor") {
            console.error("completeOnboarding: Not a doctor profile", { profile });
            return { success: false, error: "Not a doctor profile" };
        }

        console.log("completeOnboarding: Doctor profile found:", profile.id);

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
            clinic_name: data.clinicName || null,
            clinic_address: data.address || null,
            verification_status: "pending",
        })
            .eq("profile_id", profile.id);

        if (doctorError) {
            // Error completing onboarding - returned to caller
            return { success: false, error: doctorError.message };
        }

        // Save specialty if provided
        if (data.specialty) {
            // Use maybeSingle() to avoid throwing errors when no match is found
            const { data: specDataRaw } = await supabase
                .from("specializations")
                .select("id")
                .or(`name_en.eq.${data.specialty},name_ar.eq.${data.specialty}`)
                .maybeSingle();

            const specData = specDataRaw as { id: string } | null;
            if (specData) {
                const { data: doctorProfileRaw } = await supabase
                    .from("doctor_profiles")
                    .select("id")
                    .eq("profile_id", profile.id)
                    .maybeSingle();

                const doctorProfile = doctorProfileRaw as { id: string } | null;
                if (doctorProfile) {
                    // Check if already exists (use maybeSingle to avoid error on no match)
                    const { data: existing } = await supabase
                        .from("doctor_specializations")
                        .select("id")
                        .eq("doctor_profile_id", doctorProfile.id)
                        .eq("specialization_id", specData.id)
                        .maybeSingle();

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

        // Save availability if provided (wrapped in try-catch to prevent blocking onboarding)
        try {
            if (data.availableDays && data.availableDays.trim() && data.workingHours && data.workingHours.trim()) {
                // Get doctor_profile id
                const { data: doctorProfileRaw } = await supabase
                    .from("doctor_profiles")
                    .select("id")
                    .eq("profile_id", profile.id)
                    .maybeSingle();

                const doctorProfile = doctorProfileRaw as { id: string } | null;
                    if (doctorProfile) {
                        // Parse available days (e.g., "monday, tuesday, friday")
                        const daysArray = data.availableDays.split(",").map((d: string) => d.trim().toLowerCase());

                        // Map day names to day_of_week integers (0 = Sunday, 6 = Saturday)
                        const dayMapping: Record<string, number> = {
                            sunday: 0,
                            monday: 1,
                            tuesday: 2,
                            wednesday: 3,
                            thursday: 4,
                            friday: 5,
                            saturday: 6,
                        };

                        // Parse working hours (e.g., "9:00 AM - 5:00 PM")
                        const parseTime = (timeStr: string): string => {
                            const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                            if (!match) return "09:00:00";

                            let hours = parseInt(match[1], 10);
                            const minutes = match[2];
                            const meridiem = match[3].toUpperCase();

                            if (meridiem === "PM" && hours !== 12) hours += 12;
                            if (meridiem === "AM" && hours === 12) hours = 0;

                            return `${hours.toString().padStart(2, "0")}:${minutes}:00`;
                        };

                        const timeParts = data.workingHours.split("-").map((t: string) => t.trim());
                        const startTime = timeParts[0] ? parseTime(timeParts[0]) : "09:00:00";
                        const endTime = timeParts[1] ? parseTime(timeParts[1]) : "17:00:00";

                        // Delete existing availability for this doctor
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await (supabase as any)
                            .from("doctor_availability")
                            .delete()
                            .eq("doctor_profile_id", doctorProfile.id);

                        // Insert new availability records
                        const availabilityRecords = daysArray
                            .filter((day: string) => dayMapping[day] !== undefined)
                            .map((day: string) => ({
                                doctor_profile_id: doctorProfile.id,
                                day_of_week: dayMapping[day],
                                start_time: startTime,
                                end_time: endTime,
                                is_active: true,
                            }));

                        if (availabilityRecords.length > 0) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            await (supabase as any)
                                .from("doctor_availability")
                                .insert(availabilityRecords);
                        }
                    }
                }
        } catch (availabilityError) {
            // Log but don't fail the entire onboarding if availability saving fails
            console.error("Error saving availability:", availabilityError);
            // Continue with onboarding completion
        }

        console.log("completeOnboarding: Successfully completed onboarding");
        return { success: true };
    } catch (error) {
        console.error("completeOnboarding: Fatal error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred during onboarding"
        };
    }
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

/**
 * Upload doctor's avatar photo during onboarding
 */
export async function uploadDoctorAvatar(data: {
    photoBase64: string;
    photoFileName: string;
}): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Upload avatar to storage
    const { url, error: uploadError } = await uploadAvatar(
        user.id,
        data.photoBase64,
        data.photoFileName
    );

    if (uploadError || !url) {
        return { success: false, error: uploadError || "Failed to upload avatar" };
    }

    // Update profile with avatar URL
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from("profiles")
        .update({ avatar_url: url })
        .eq("user_id", user.id);

    if (updateError) {
        // Error updating profile avatar - returned to caller
        return { success: false, error: updateError.message };
    }

    return { success: true, avatarUrl: url };
}

/**
 * Upload doctor's credential documents (license, certificates, etc.)
 */
export async function uploadDoctorCredentials(data: {
    licenseFileBase64: string;
    licenseFileName: string;
    extraFilesBase64?: string[];
    extraFileNames?: string[];
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get profile and doctor_profile
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

    // Upload license document
    const { path: licensePath, documentName: licenseDocName, error: licenseError } = await uploadCredential(
        doctorProfile.id,
        "license",
        data.licenseFileBase64,
        data.licenseFileName
    );

    if (licenseError || !licensePath) {
        return { success: false, error: licenseError || "Failed to upload license" };
    }

    // Save license credential record
    const { error: saveError } = await saveCredentialRecord(
        doctorProfile.id,
        "license",
        licensePath,
        licenseDocName || data.licenseFileName
    );

    if (saveError) {
        return { success: false, error: saveError };
    }

    // Upload extra documents if provided
    if (data.extraFilesBase64 && data.extraFileNames) {
        for (let i = 0; i < data.extraFilesBase64.length; i++) {
            const fileBase64 = data.extraFilesBase64[i];
            const fileName = data.extraFileNames[i];

            const { path, documentName, error: extraError } = await uploadCredential(
                doctorProfile.id,
                "certification", // Valid types: license, degree, certification, id_document
                fileBase64,
                fileName
            );

            if (extraError || !path) {
                // Failed to upload extra document - continuing with other files
                continue; // Continue with other files even if one fails
            }

            await saveCredentialRecord(
                doctorProfile.id,
                "certification",
                path,
                documentName || fileName
            );
        }
    }

    return { success: true };
}
