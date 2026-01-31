import { createClient } from "@/lib/supabase/server";

export type DashboardUserContext = {
    userId: string;
    profileId: string;
    role: "doctor" | "patient";
    doctorProfileId?: string;
    patientProfileId?: string;
};

export async function getDashboardUserContext(): Promise<DashboardUserContext | null> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return null;
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || (profile.role !== "doctor" && profile.role !== "patient")) {
        return null;
    }

    const context: DashboardUserContext = {
        userId: user.id,
        profileId: profile.id,
        role: profile.role as "doctor" | "patient",
    };

    if (profile.role === "doctor") {
        const { data: doctorProfileData } = await supabase
            .from("doctor_profiles")
            .select("id")
            .eq("profile_id", profile.id)
            .single();

        const doctorProfile = doctorProfileData as { id: string } | null;
        if (!doctorProfile) {
            return null;
        }

        context.doctorProfileId = doctorProfile.id;
    }

    if (profile.role === "patient") {
        const { data: patientProfileData } = await supabase
            .from("patient_profiles")
            .select("id")
            .eq("profile_id", profile.id)
            .single();

        const patientProfile = patientProfileData as { id: string } | null;
        if (!patientProfile) {
            return null;
        }

        context.patientProfileId = patientProfile.id;
    }

    return context;
}
