"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Debug function to check current user's profile and patient_profile
 */
export async function debugUserProfile() {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        return {
            error: "Not authenticated",
            user: null,
            profile: null,
            patientProfile: null
        };
    }

    // Get profile
    const { data: profile, error: profileError } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // Get patient profile if profile exists
    let patientProfile = null;
    if (profile) {
        const { data, error: ppError } = await (supabase as any)
            .from("patient_profiles")
            .select("*")
            .eq("profile_id", profile.id)
            .single();
        
        if (!ppError) {
            patientProfile = data;
        }
    }

    return {
        user: {
            id: user.id,
            email: user.email,
        },
        profile,
        patientProfile,
        profileError: profileError?.message,
    };
}
