"use server";

import { createClient } from "@/lib/supabase/server";
import {
    sendEmail,
    getDoctorApprovalEmailHtml,
    getDoctorApprovalEmailText,
    getDoctorRejectionEmailHtml,
    getDoctorRejectionEmailText,
} from "@/lib/email/service";

interface PendingDoctor {
    id: string;
    profileId: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    licenseNumber: string | null;
    yearsOfExperience: number;
    bio: string | null;
    consultationFee: number | null;
    verificationStatus: string;
    createdAt: string;
    specialty: string | null;
}

interface DoctorApplicationDetails extends PendingDoctor {
    phone: string | null;
    credentials: Array<{
        id: string;
        credentialType: string;
        documentUrl: string;
        documentName: string | null;
        verificationStatus: string;
    }>;
}

/**
 * Get count of pending doctor verifications
 */
export async function getPendingDoctorCount(): Promise<number> {
    const supabase = await createClient();

    const { count, error } = await supabase
        .from("doctor_profiles")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "pending");

    if (error) {
        console.error("Error fetching pending count:", error);
        return 0;
    }

    return count || 0;
}

/**
 * Get list of doctors (optionally filtered by verification status)
 * Defaults to "pending" if no status is provided
 */
export async function getPendingDoctors(status: string = "pending"): Promise<{ doctors: PendingDoctor[]; error?: string }> {
    const supabase = await createClient();

    // First verify the caller is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { doctors: [], error: "Not authenticated" };
    }

    const { data: callerProfileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const callerProfile = callerProfileData as { role: string } | null;
    if (!callerProfile || callerProfile.role !== "admin") {
        return { doctors: [], error: "Unauthorized - Admin access required" };
    }

    // Define types for the query results
    type DoctorProfileRow = {
        id: string;
        profile_id: string;
        license_number: string | null;
        years_of_experience: number;
        bio: string | null;
        consultation_fee: number | null;
        verification_status: string;
        created_at: string;
    };

    type ProfileRow = {
        id: string;
        full_name: string;
        avatar_url: string | null;
        user_id: string;
    };

    // Get doctors with their profile info (filtered by status if provided)
    let query = supabase
        .from("doctor_profiles")
        .select(`
            id,
            profile_id,
            license_number,
            years_of_experience,
            bio,
            consultation_fee,
            verification_status,
            created_at
        `);

    // Apply status filter if provided and not "all"
    if (status && status !== "all") {
        query = query.eq("verification_status", status);
    }

    const { data: doctorProfilesData, error } = await query.order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching pending doctors:", error);
        return { doctors: [], error: error.message };
    }

    const doctorProfiles = doctorProfilesData as DoctorProfileRow[] | null;
    if (!doctorProfiles || doctorProfiles.length === 0) {
        return { doctors: [] };
    }

    // Get profile details for each doctor
    const profileIds = doctorProfiles.map(dp => dp.profile_id);
    const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, user_id")
        .in("id", profileIds);

    const profiles = profilesData as ProfileRow[] | null;

    // Get user emails (using service role)
    // Note: auth.admin.listUsers requires service role
    let userEmails = new Map<string, string>();
    try {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        userEmails = new Map(users?.map(u => [u.id, u.email || ""]) || []);
    } catch {
        // If admin API fails, continue without emails
        console.warn("Could not fetch user emails - admin API not available");
    }

    // Get specializations
    const doctorProfileIds = doctorProfiles.map(dp => dp.id);
    const { data: specializations } = await supabase
        .from("doctor_specializations")
        .select(`
            doctor_profile_id,
            specialization:specializations(name_en)
        `)
        .in("doctor_profile_id", doctorProfileIds)
        .eq("is_primary", true);

    const specMap = new Map(
        (specializations as Array<{ doctor_profile_id: string; specialization: { name_en: string } | null }> | null)?.map(s => [
            s.doctor_profile_id,
            s.specialization?.name_en || null
        ]) || []
    );

    // Combine data
    const doctors: PendingDoctor[] = doctorProfiles.map(dp => {
        const profile = profiles?.find(p => p.id === dp.profile_id);
        return {
            id: dp.id,
            profileId: dp.profile_id,
            fullName: profile?.full_name || "Unknown",
            email: userEmails.get(profile?.user_id || "") || "",
            avatarUrl: profile?.avatar_url || null,
            licenseNumber: dp.license_number,
            yearsOfExperience: dp.years_of_experience,
            bio: dp.bio,
            consultationFee: dp.consultation_fee,
            verificationStatus: dp.verification_status,
            createdAt: dp.created_at,
            specialty: specMap.get(dp.id) || null,
        };
    });

    return { doctors };
}

/**
 * Get detailed information about a specific doctor application
 */
export async function getDoctorApplicationDetails(doctorProfileId: string): Promise<{
    doctor: DoctorApplicationDetails | null;
    error?: string;
}> {
    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { doctor: null, error: "Not authenticated" };
    }

    const { data: callerProfileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const callerProfile = callerProfileData as { role: string } | null;
    if (!callerProfile || callerProfile.role !== "admin") {
        return { doctor: null, error: "Unauthorized - Admin access required" };
    }

    // Type definitions
    type DoctorProfileFull = {
        id: string;
        profile_id: string;
        license_number: string | null;
        years_of_experience: number;
        bio: string | null;
        consultation_fee: number | null;
        verification_status: string;
        created_at: string;
    };

    type ProfileFull = {
        id: string;
        full_name: string;
        avatar_url: string | null;
        user_id: string;
    };

    type CredentialRow = {
        id: string;
        credential_type: string;
        document_url: string;
        document_name: string | null;
        verification_status: string;
    };

    // Get doctor profile
    const { data: doctorProfileData, error } = await supabase
        .from("doctor_profiles")
        .select("id, profile_id, license_number, years_of_experience, bio, consultation_fee, verification_status, created_at")
        .eq("id", doctorProfileId)
        .single();

    const doctorProfile = doctorProfileData as DoctorProfileFull | null;
    if (error || !doctorProfile) {
        return { doctor: null, error: "Doctor not found" };
    }

    // Get base profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, user_id")
        .eq("id", doctorProfile.profile_id)
        .single();

    const profile = profileData as ProfileFull | null;
    if (!profile) {
        return { doctor: null, error: "Profile not found" };
    }

    // Get user email
    let doctorEmail = "";
    try {
        const { data: { user: doctorUser } } = await supabase.auth.admin.getUserById(profile.user_id);
        doctorEmail = doctorUser?.email || "";
    } catch {
        console.warn("Could not fetch user email - admin API not available");
    }

    // Get credentials
    const { data: credentialsData } = await supabase
        .from("doctor_credentials")
        .select("id, credential_type, document_url, document_name, verification_status")
        .eq("doctor_profile_id", doctorProfileId);

    const credentials = credentialsData as CredentialRow[] | null;

    // Get primary specialty
    const { data: specializationData } = await supabase
        .from("doctor_specializations")
        .select(`
            specialization:specializations(name_en)
        `)
        .eq("doctor_profile_id", doctorProfileId)
        .eq("is_primary", true)
        .single();

    const specialization = specializationData as { specialization: { name_en: string } | null } | null;

    const doctor: DoctorApplicationDetails = {
        id: doctorProfile.id,
        profileId: doctorProfile.profile_id,
        fullName: profile.full_name,
        email: doctorEmail,
        phone: null, // Would need to store this in profile
        avatarUrl: profile.avatar_url,
        licenseNumber: doctorProfile.license_number,
        yearsOfExperience: doctorProfile.years_of_experience,
        bio: doctorProfile.bio,
        consultationFee: doctorProfile.consultation_fee,
        verificationStatus: doctorProfile.verification_status,
        createdAt: doctorProfile.created_at,
        specialty: specialization?.specialization?.name_en || null,
        credentials: credentials?.map(c => ({
            id: c.id,
            credentialType: c.credential_type,
            documentUrl: c.document_url,
            documentName: c.document_name,
            verificationStatus: c.verification_status,
        })) || [],
    };

    return { doctor };
}

/**
 * Approve a doctor's application
 */
export async function approveDoctor(doctorProfileId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: callerProfileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const callerProfile = callerProfileData as { id: string; role: string } | null;
    if (!callerProfile || callerProfile.role !== "admin") {
        return { success: false, error: "Unauthorized - Admin access required" };
    }

    // Get doctor info before updating
    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("profile_id")
        .eq("id", doctorProfileId)
        .single();

    const doctorProfile = doctorProfileData as { profile_id: string } | null;
    if (!doctorProfile) {
        return { success: false, error: "Doctor profile not found" };
    }

    // Get doctor's profile for name
    const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, user_id")
        .eq("id", doctorProfile.profile_id)
        .single();

    const profile = profileData as { full_name: string; user_id: string } | null;

    // Update doctor profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("doctor_profiles")
        .update({
            verification_status: "verified",
            verified_at: new Date().toISOString(),
            verified_by: callerProfile.id,
        })
        .eq("id", doctorProfileId);

    if (error) {
        console.error("Error approving doctor:", error);
        return { success: false, error: error.message };
    }

    // Send notification email to doctor
    if (profile) {
        let doctorEmail = "";
        try {
            const { data: { user: doctorUser } } = await supabase.auth.admin.getUserById(profile.user_id);
            doctorEmail = doctorUser?.email || "";
        } catch {
            console.warn("Could not fetch doctor email");
        }

        if (doctorEmail) {
            const doctorName = profile.full_name || "Doctor";
            await sendEmail({
                to: doctorEmail,
                subject: "Your Tabibi Account is Verified! | تم اعتماد حسابك في طبيبي",
                html: getDoctorApprovalEmailHtml(doctorName, "en"),
                text: getDoctorApprovalEmailText(doctorName, "en"),
            });
        }
    }

    return { success: true };
}

/**
 * Reject a doctor's application
 */
export async function rejectDoctor(
    doctorProfileId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: callerProfileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const callerProfile = callerProfileData as { id: string; role: string } | null;
    if (!callerProfile || callerProfile.role !== "admin") {
        return { success: false, error: "Unauthorized - Admin access required" };
    }

    // Get doctor info before updating
    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("profile_id")
        .eq("id", doctorProfileId)
        .single();

    const doctorProfile = doctorProfileData as { profile_id: string } | null;
    if (!doctorProfile) {
        return { success: false, error: "Doctor profile not found" };
    }

    // Get doctor's profile for name
    const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, user_id")
        .eq("id", doctorProfile.profile_id)
        .single();

    const profile = profileData as { full_name: string; user_id: string } | null;

    // Update doctor profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("doctor_profiles")
        .update({
            verification_status: "rejected",
            verification_notes: reason,
            verified_at: new Date().toISOString(),
            verified_by: callerProfile.id,
        })
        .eq("id", doctorProfileId);

    if (error) {
        console.error("Error rejecting doctor:", error);
        return { success: false, error: error.message };
    }

    // Send notification email to doctor with rejection reason
    if (profile) {
        let doctorEmail = "";
        try {
            const { data: { user: doctorUser } } = await supabase.auth.admin.getUserById(profile.user_id);
            doctorEmail = doctorUser?.email || "";
        } catch {
            console.warn("Could not fetch doctor email");
        }

        if (doctorEmail) {
            const doctorName = profile.full_name || "Doctor";
            await sendEmail({
                to: doctorEmail,
                subject: "Update on Your Tabibi Application | تحديث بخصوص طلبك في طبيبي",
                html: getDoctorRejectionEmailHtml(doctorName, reason, "en"),
                text: getDoctorRejectionEmailText(doctorName, reason, "en"),
            });
        }
    }

    return { success: true };
}

/**
 * Get a signed URL to view a credential document (admin only)
 * The URL expires after 1 hour for security
 */
export async function getCredentialViewUrl(documentPath: string): Promise<{
    url: string | null;
    error?: string;
}> {
    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { url: null, error: "Not authenticated" };
    }

    const { data: callerProfileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const callerProfile = callerProfileData as { role: string } | null;
    if (!callerProfile || callerProfile.role !== "admin") {
        return { url: null, error: "Unauthorized - Admin access required" };
    }

    // Generate signed URL (expires in 1 hour)
    const { data, error } = await supabase.storage
        .from("credentials")
        .createSignedUrl(documentPath, 3600);

    if (error) {
        console.error("Error creating signed URL:", error);
        return { url: null, error: error.message };
    }

    return { url: data.signedUrl };
}

/**
 * Get verification statistics for admin dashboard
 */
export async function getVerificationStats(): Promise<{
    pending: number;
    verified: number;
    rejected: number;
    total: number;
}> {
    const supabase = await createClient();

    const { data: rawData, error } = await supabase
        .from("doctor_profiles")
        .select("verification_status");

    if (error || !rawData) {
        return { pending: 0, verified: 0, rejected: 0, total: 0 };
    }

    const data = rawData as Array<{ verification_status: string }>;

    const stats = {
        pending: data.filter(d => d.verification_status === "pending").length,
        verified: data.filter(d => d.verification_status === "verified").length,
        rejected: data.filter(d => d.verification_status === "rejected").length,
        total: data.length,
    };

    return stats;
}

// ============================================
// Recent Activity Types
// ============================================

export interface AdminActivityItem {
    id: string;
    action: string;
    actionType: "registration" | "payment" | "appointment" | "approval" | "message";
    name: string;
    timestamp: string;
}

/**
 * Get recent platform activity for admin dashboard
 * Aggregates recent events from multiple sources
 */
export async function getRecentActivity(): Promise<AdminActivityItem[]> {
    const supabase = await createClient();
    const activities: AdminActivityItem[] = [];

    // Get recent user registrations (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    type ProfileRegistration = { id: string; full_name: string; role: string; created_at: string };
    const { data: recentRegistrations } = await supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .gte("created_at", oneDayAgo)
        .order("created_at", { ascending: false })
        .limit(5);

    (recentRegistrations as ProfileRegistration[] || []).forEach((reg) => {
        activities.push({
            id: `reg-${reg.id}`,
            action: reg.role === "doctor" ? "New doctor registration" : "New patient registration",
            actionType: "registration",
            name: reg.full_name || "Unknown",
            timestamp: reg.created_at,
        });
    });

    // Get recent payments (completed appointments with fees)
    type PaymentRecord = { id: string; consultation_fee: number; actual_end: string };
    const { data: recentPayments } = await supabase
        .from("appointments")
        .select("id, consultation_fee, actual_end")
        .eq("status", "completed")
        .not("consultation_fee", "is", null)
        .gte("actual_end", oneDayAgo)
        .order("actual_end", { ascending: false })
        .limit(5);

    (recentPayments as PaymentRecord[] || []).forEach((payment) => {
        activities.push({
            id: `pay-${payment.id}`,
            action: "Payment received",
            actionType: "payment",
            name: `EGP ${payment.consultation_fee}`,
            timestamp: payment.actual_end,
        });
    });

    // Get recent scheduled appointments
    type AppointmentRecord = {
        id: string;
        scheduled_start: string;
        patient_profiles: { profiles: { full_name: string } } | null;
    };
    const { data: recentAppointments } = await supabase
        .from("appointments")
        .select(`
            id,
            scheduled_start,
            patient_profiles (
                profiles (
                    full_name
                )
            )
        `)
        .eq("status", "scheduled")
        .gte("created_at", oneDayAgo)
        .order("created_at", { ascending: false })
        .limit(5);

    (recentAppointments as AppointmentRecord[] || []).forEach((apt) => {
        const patientName = apt.patient_profiles?.profiles?.full_name || "Patient";
        activities.push({
            id: `apt-${apt.id}`,
            action: "Appointment booked",
            actionType: "appointment",
            name: patientName,
            timestamp: apt.scheduled_start,
        });
    });

    // Get recent doctor approvals
    type ApprovalRecord = {
        id: string;
        verified_at: string;
        profiles: { full_name: string } | null;
    };
    const { data: recentApprovals } = await supabase
        .from("doctor_profiles")
        .select(`
            id,
            verified_at,
            profiles (
                full_name
            )
        `)
        .eq("verification_status", "verified")
        .not("verified_at", "is", null)
        .gte("verified_at", oneDayAgo)
        .order("verified_at", { ascending: false })
        .limit(5);

    (recentApprovals as ApprovalRecord[] || []).forEach((approval) => {
        const doctorName = approval.profiles?.full_name || "Doctor";
        activities.push({
            id: `apv-${approval.id}`,
            action: "Doctor approved",
            actionType: "approval",
            name: `Dr. ${doctorName}`,
            timestamp: approval.verified_at,
        });
    });

    // Sort all activities by timestamp (most recent first) and return top 6
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activities.slice(0, 6);
}
