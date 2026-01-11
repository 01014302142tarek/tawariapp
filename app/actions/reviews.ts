"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export interface Review {
    id: string;
    appointment_id: string;
    patient_profile_id: string;
    doctor_profile_id: string;
    rating: number;
    comment?: string;
    is_anonymous: boolean;
    is_visible: boolean;
    hidden_reason?: string;
    doctor_response?: string;
    doctor_responded_at?: string;
    created_at: string;
    updated_at: string;
}

export interface ReviewWithDetails extends Review {
    patient?: {
        id: string;
        profile: {
            full_name: string;
            avatar_url?: string;
        };
    };
    doctor?: {
        id: string;
        profile: {
            full_name: string;
            avatar_url?: string;
        };
        specializations?: { name: string }[];
    };
    appointment?: {
        scheduled_start: string;
    };
}

export interface DoctorRating {
    rating_average: number;
    rating_count: number;
}

// ============================================
// Query Functions
// ============================================

/**
 * Get all reviews for a specific doctor
 */
export async function getReviewsForDoctor(
    doctorProfileId: string,
    options?: {
        limit?: number;
        offset?: number;
        sortBy?: "newest" | "oldest" | "highest" | "lowest";
        minRating?: number;
    }
): Promise<{ reviews: ReviewWithDetails[]; total: number; error?: string }> {
    const supabase = await createClient();

    const limit = options?.limit || 10;
    const offset = options?.offset || 0;

    let query = supabase
        .from("reviews")
        .select(`
            *,
            patient:patient_profiles!patient_profile_id (
                id,
                profile:profiles!profile_id (
                    full_name,
                    avatar_url
                )
            ),
            appointment:appointments!appointment_id (
                scheduled_start
            )
        `, { count: "exact" })
        .eq("doctor_profile_id", doctorProfileId)
        .eq("is_visible", true);

    // Apply rating filter
    if (options?.minRating) {
        query = query.gte("rating", options.minRating);
    }

    // Apply sorting
    switch (options?.sortBy) {
        case "oldest":
            query = query.order("created_at", { ascending: true });
            break;
        case "highest":
            query = query.order("rating", { ascending: false });
            break;
        case "lowest":
            query = query.order("rating", { ascending: true });
            break;
        default: // newest
            query = query.order("created_at", { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching reviews:", error);
        return { reviews: [], total: 0, error: error.message };
    }

    return {
        reviews: (data || []) as ReviewWithDetails[],
        total: count || 0,
    };
}

/**
 * Get reviews submitted by the current patient
 */
export async function getMyReviews(): Promise<{ reviews: ReviewWithDetails[]; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { reviews: [], error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { reviews: [], error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { reviews: [], error: "Patient profile not found" };
    }

    const { data, error } = await supabase
        .from("reviews")
        .select(`
            *,
            doctor:doctor_profiles!doctor_profile_id (
                id,
                profile:profiles!profile_id (
                    full_name,
                    avatar_url
                )
            ),
            appointment:appointments!appointment_id (
                scheduled_start
            )
        `)
        .eq("patient_profile_id", patientProfile.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching my reviews:", error);
        return { reviews: [], error: error.message };
    }

    return { reviews: (data || []) as ReviewWithDetails[] };
}

/**
 * Get a single review by ID
 */
export async function getReviewById(
    reviewId: string
): Promise<{ review: ReviewWithDetails | null; error?: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("reviews")
        .select(`
            *,
            patient:patient_profiles!patient_profile_id (
                id,
                profile:profiles!profile_id (
                    full_name,
                    avatar_url
                )
            ),
            doctor:doctor_profiles!doctor_profile_id (
                id,
                profile:profiles!profile_id (
                    full_name,
                    avatar_url
                )
            ),
            appointment:appointments!appointment_id (
                scheduled_start
            )
        `)
        .eq("id", reviewId)
        .single();

    if (error) {
        console.error("Error fetching review:", error);
        return { review: null, error: error.message };
    }

    return { review: data as ReviewWithDetails };
}

/**
 * Check if patient can review a specific appointment
 */
export async function canReviewAppointment(
    appointmentId: string
): Promise<{ canReview: boolean; reason?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { canReview: false, reason: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { canReview: false, reason: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { canReview: false, reason: "Not a patient" };
    }

    // Check if appointment exists and is completed
    const { data: appointmentData } = await supabase
        .from("appointments")
        .select("id, patient_profile_id, status")
        .eq("id", appointmentId)
        .single();

    const appointment = appointmentData as { id: string; patient_profile_id: string; status: string } | null;
    if (!appointment) {
        return { canReview: false, reason: "Appointment not found" };
    }

    if (appointment.patient_profile_id !== patientProfile.id) {
        return { canReview: false, reason: "Not your appointment" };
    }

    if (appointment.status !== "completed") {
        return { canReview: false, reason: "Appointment not completed" };
    }

    // Check if already reviewed
    const { count } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("appointment_id", appointmentId);

    if (count && count > 0) {
        return { canReview: false, reason: "Already reviewed" };
    }

    return { canReview: true };
}

/**
 * Get appointments that can be reviewed (completed, not yet reviewed)
 */
export async function getPendingReviewAppointments(): Promise<{
    appointments: Array<{
        id: string;
        scheduled_start: string;
        doctor: {
            id: string;
            full_name: string;
            avatar_url?: string;
            specialization?: string;
        };
    }>;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { appointments: [], error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { appointments: [], error: "Profile not found" };
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

    // Get completed appointments without reviews
    const { data, error } = await supabase
        .from("appointments")
        .select(`
            id,
            scheduled_start,
            doctor_profile:doctor_profiles!doctor_profile_id (
                id,
                profile:profiles!profile_id (
                    full_name,
                    avatar_url
                ),
                doctor_specializations (
                    specialization:specializations!specialization_id (
                        name
                    )
                )
            )
        `)
        .eq("patient_profile_id", patientProfile.id)
        .eq("status", "completed")
        .order("scheduled_start", { ascending: false });

    if (error) {
        console.error("Error fetching pending review appointments:", error);
        return { appointments: [], error: error.message };
    }

    interface AppointmentWithDoctor {
        id: string;
        scheduled_start: string;
        doctor_profile: {
            id: string;
            profile: {
                full_name: string;
                avatar_url?: string;
            };
            doctor_specializations?: Array<{
                specialization: {
                    name: string;
                };
            }>;
        };
    }

    const appointments = (data || []) as AppointmentWithDoctor[];

    // Filter out already reviewed appointments
    const appointmentIds = appointments.map(a => a.id);

    if (appointmentIds.length === 0) {
        return { appointments: [] };
    }

    const { data: existingReviews } = await supabase
        .from("reviews")
        .select("appointment_id")
        .in("appointment_id", appointmentIds);

    const reviews = (existingReviews || []) as { appointment_id: string }[];
    const reviewedIds = new Set(reviews.map(r => r.appointment_id));

    const pendingAppointments = appointments
        .filter(a => !reviewedIds.has(a.id))
        .map((a) => ({
            id: a.id,
            scheduled_start: a.scheduled_start,
            doctor: {
                id: a.doctor_profile?.id || "",
                full_name: a.doctor_profile?.profile?.full_name || "Unknown",
                avatar_url: a.doctor_profile?.profile?.avatar_url,
                specialization: a.doctor_profile?.doctor_specializations?.[0]?.specialization?.name,
            },
        }));

    return { appointments: pendingAppointments };
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Submit a new review for a completed appointment
 */
export async function submitReview(data: {
    appointmentId: string;
    rating: number;
    comment?: string;
    isAnonymous?: boolean;
}): Promise<{ review: Review | null; error?: string }> {
    const supabase = await createClient();

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
        return { review: null, error: "Rating must be between 1 and 5" };
    }

    // Validate comment length
    if (data.comment && data.comment.length > 2000) {
        return { review: null, error: "Comment must be less than 2000 characters" };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { review: null, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { review: null, error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { review: null, error: "Patient profile not found" };
    }

    // Verify the appointment exists, belongs to this patient, and is completed
    const { data: appointmentData } = await supabase
        .from("appointments")
        .select("id, patient_profile_id, doctor_profile_id, status")
        .eq("id", data.appointmentId)
        .single();

    const appointment = appointmentData as {
        id: string;
        patient_profile_id: string;
        doctor_profile_id: string;
        status: string;
    } | null;

    if (!appointment) {
        return { review: null, error: "Appointment not found" };
    }

    if (appointment.patient_profile_id !== patientProfile.id) {
        return { review: null, error: "Not your appointment" };
    }

    if (appointment.status !== "completed") {
        return { review: null, error: "Can only review completed appointments" };
    }

    // Check if already reviewed
    const { count } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("appointment_id", data.appointmentId);

    if (count && count > 0) {
        return { review: null, error: "Already reviewed this appointment" };
    }

    // Create the review
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: review, error } = await (supabase as any)
        .from("reviews")
        .insert({
            appointment_id: data.appointmentId,
            patient_profile_id: patientProfile.id,
            doctor_profile_id: appointment.doctor_profile_id,
            rating: data.rating,
            comment: data.comment?.trim() || null,
            is_anonymous: data.isAnonymous || false,
            is_visible: true,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating review:", error);
        return { review: null, error: error.message };
    }

    return { review: review as Review };
}

/**
 * Update own review
 */
export async function updateReview(data: {
    reviewId: string;
    rating?: number;
    comment?: string;
    isAnonymous?: boolean;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Validate rating if provided
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
        return { success: false, error: "Rating must be between 1 and 5" };
    }

    // Validate comment length if provided
    if (data.comment && data.comment.length > 2000) {
        return { success: false, error: "Comment must be less than 2000 characters" };
    }

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

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { success: false, error: "Patient profile not found" };
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment.trim() || null;
    if (data.isAnonymous !== undefined) updateData.is_anonymous = data.isAnonymous;

    if (Object.keys(updateData).length === 0) {
        return { success: false, error: "No changes provided" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("reviews")
        .update(updateData)
        .eq("id", data.reviewId)
        .eq("patient_profile_id", patientProfile.id);

    if (error) {
        console.error("Error updating review:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Delete own review
 */
export async function deleteReview(
    reviewId: string
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

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { success: false, error: "Patient profile not found" };
    }

    const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq("patient_profile_id", patientProfile.id);

    if (error) {
        console.error("Error deleting review:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============================================
// Doctor Functions
// ============================================

/**
 * Get reviews for the current doctor
 */
export async function getDoctorReviews(options?: {
    limit?: number;
    offset?: number;
    sortBy?: "newest" | "oldest" | "highest" | "lowest";
    hasResponse?: boolean;
}): Promise<{ reviews: ReviewWithDetails[]; total: number; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { reviews: [], total: 0, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { reviews: [], total: 0, error: "Not a doctor" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { reviews: [], total: 0, error: "Doctor profile not found" };
    }

    const limit = options?.limit || 10;
    const offset = options?.offset || 0;

    let query = supabase
        .from("reviews")
        .select(`
            *,
            patient:patient_profiles!patient_profile_id (
                id,
                profile:profiles!profile_id (
                    full_name,
                    avatar_url
                )
            ),
            appointment:appointments!appointment_id (
                scheduled_start
            )
        `, { count: "exact" })
        .eq("doctor_profile_id", doctorProfile.id)
        .eq("is_visible", true);

    // Filter by response status
    if (options?.hasResponse === true) {
        query = query.not("doctor_response", "is", null);
    } else if (options?.hasResponse === false) {
        query = query.is("doctor_response", null);
    }

    // Apply sorting
    switch (options?.sortBy) {
        case "oldest":
            query = query.order("created_at", { ascending: true });
            break;
        case "highest":
            query = query.order("rating", { ascending: false });
            break;
        case "lowest":
            query = query.order("rating", { ascending: true });
            break;
        default:
            query = query.order("created_at", { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching doctor reviews:", error);
        return { reviews: [], total: 0, error: error.message };
    }

    return {
        reviews: (data || []) as ReviewWithDetails[],
        total: count || 0,
    };
}

/**
 * Doctor responds to a review
 */
export async function respondToReview(data: {
    reviewId: string;
    response: string;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Validate response length
    if (!data.response || data.response.trim().length === 0) {
        return { success: false, error: "Response cannot be empty" };
    }

    if (data.response.length > 1000) {
        return { success: false, error: "Response must be less than 1000 characters" };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { success: false, error: "Not a doctor" };
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
        .from("reviews")
        .update({
            doctor_response: data.response.trim(),
            doctor_responded_at: new Date().toISOString(),
        })
        .eq("id", data.reviewId)
        .eq("doctor_profile_id", doctorProfile.id);

    if (error) {
        console.error("Error responding to review:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get doctor's rating stats
 */
export async function getDoctorRatingStats(
    doctorProfileId?: string
): Promise<{ stats: DoctorRating | null; error?: string }> {
    const supabase = await createClient();

    let targetDoctorProfileId = doctorProfileId;

    // If no doctorProfileId provided, get current user's doctor profile
    if (!targetDoctorProfileId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { stats: null, error: "Not authenticated" };
        }

        const { data: profileData } = await supabase
            .from("profiles")
            .select("id, role")
            .eq("user_id", user.id)
            .single();

        const profile = profileData as { id: string; role: string } | null;
        if (!profile || profile.role !== "doctor") {
            return { stats: null, error: "Not a doctor" };
        }

        const { data: doctorProfileData } = await supabase
            .from("doctor_profiles")
            .select("id")
            .eq("profile_id", profile.id)
            .single();

        const doctorProfile = doctorProfileData as { id: string } | null;
        if (!doctorProfile) {
            return { stats: null, error: "Doctor profile not found" };
        }

        targetDoctorProfileId = doctorProfile.id;
    }

    const { data, error } = await supabase
        .from("doctor_profiles")
        .select("rating_average, rating_count")
        .eq("id", targetDoctorProfileId)
        .single();

    if (error) {
        console.error("Error fetching doctor rating stats:", error);
        return { stats: null, error: error.message };
    }

    const doctorStats = data as { rating_average: number | null; rating_count: number | null } | null;

    return {
        stats: {
            rating_average: doctorStats?.rating_average || 0,
            rating_count: doctorStats?.rating_count || 0,
        },
    };
}

// ============================================
// Admin Functions
// ============================================

/**
 * Hide a review (admin only)
 */
export async function hideReview(data: {
    reviewId: string;
    reason: string;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { role: string } | null;
    if (!profile || profile.role !== "admin") {
        return { success: false, error: "Unauthorized - Admin access required" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("reviews")
        .update({
            is_visible: false,
            hidden_reason: data.reason,
        })
        .eq("id", data.reviewId);

    if (error) {
        console.error("Error hiding review:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Unhide a review (admin only)
 */
export async function unhideReview(
    reviewId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { role: string } | null;
    if (!profile || profile.role !== "admin") {
        return { success: false, error: "Unauthorized - Admin access required" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("reviews")
        .update({
            is_visible: true,
            hidden_reason: null,
        })
        .eq("id", reviewId);

    if (error) {
        console.error("Error unhiding review:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get all reviews for admin moderation
 */
export async function getReviewsForModeration(options?: {
    limit?: number;
    offset?: number;
    visibleOnly?: boolean;
}): Promise<{ reviews: ReviewWithDetails[]; total: number; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { reviews: [], total: 0, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { role: string } | null;
    if (!profile || profile.role !== "admin") {
        return { reviews: [], total: 0, error: "Unauthorized - Admin access required" };
    }

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    let query = supabase
        .from("reviews")
        .select(`
            *,
            patient:patient_profiles!patient_profile_id (
                id,
                profile:profiles!profile_id (
                    full_name,
                    avatar_url
                )
            ),
            doctor:doctor_profiles!doctor_profile_id (
                id,
                profile:profiles!profile_id (
                    full_name
                )
            )
        `, { count: "exact" })
        .order("created_at", { ascending: false });

    if (options?.visibleOnly) {
        query = query.eq("is_visible", true);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching reviews for moderation:", error);
        return { reviews: [], total: 0, error: error.message };
    }

    return {
        reviews: (data || []) as ReviewWithDetails[],
        total: count || 0,
    };
}
