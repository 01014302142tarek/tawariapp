"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export type UserRole = "patient" | "doctor" | "admin";
export type UserStatus = "active" | "pending" | "inactive" | "suspended";

export interface AdminUser {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    role: UserRole;
    status: UserStatus;
    created_at: string;
    phone?: string;
}

export interface AdminUserStats {
    total_users: number;
    doctors: number;
    patients: number;
    admins: number;
}

// ============================================
// Helper to check if caller is admin
// ============================================

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>): Promise<{ isAdmin: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { isAdmin: false, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { role: string } | null;
    if (!profile || profile.role !== "admin") {
        return { isAdmin: false, error: "Unauthorized - Admin access required" };
    }

    return { isAdmin: true };
}

// ============================================
// User Management Actions
// ============================================

/**
 * Get all users with filtering and search
 */
export async function getAdminUsers(options?: {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
    limit?: number;
    offset?: number;
}): Promise<{ users: AdminUser[]; total: number; error?: string }> {
    const supabase = await createClient();

    const { isAdmin, error: authError } = await verifyAdmin(supabase);
    if (!isAdmin) {
        return { users: [], total: 0, error: authError };
    }

    // Build query
    let query = supabase
        .from("profiles")
        .select("id, user_id, full_name, avatar_url, role, phone, created_at", { count: "exact" });

    // Apply filters
    if (options?.role) {
        query = query.eq("role", options.role);
    }

    if (options?.search) {
        query = query.or(`full_name.ilike.%${options.search}%`);
    }

    // Order and pagination
    query = query.order("created_at", { ascending: false });

    if (options?.limit) {
        query = query.limit(options.limit);
    }
    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, count, error } = await query;

    if (error) {
        console.error("Error fetching users:", error);
        return { users: [], total: 0, error: error.message };
    }

    // Get user emails from auth.users via admin API
    // For now, we'll fetch emails separately if needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users: AdminUser[] = (data || []).map((profile: any) => {
        // Determine status based on role-specific profile status
        let status: UserStatus = "active";

        return {
            id: profile.id,
            user_id: profile.user_id,
            full_name: profile.full_name || "Unknown",
            email: "", // Will be populated below
            avatar_url: profile.avatar_url,
            role: profile.role as UserRole,
            status,
            created_at: profile.created_at,
            phone: profile.phone,
        };
    });

    // Fetch emails for users (via auth.users if using service role)
    // For now we'll use a workaround - get emails from auth.users table
    const userIds = users.map(u => u.user_id).filter(Boolean);
    if (userIds.length > 0) {
        // Try to get emails - this requires service role
        const { data: authUsers } = await supabase
            .from("auth.users")
            .select("id, email")
            .in("id", userIds);

        if (authUsers) {
            const emailMap = new Map(authUsers.map((u: { id: string; email: string }) => [u.id, u.email]));
            users.forEach(user => {
                user.email = emailMap.get(user.user_id) || "";
            });
        }
    }

    // For doctor status, check verification_status
    const doctorIds = users.filter(u => u.role === "doctor").map(u => u.id);
    if (doctorIds.length > 0) {
        const { data: doctorProfiles } = await supabase
            .from("doctor_profiles")
            .select("profile_id, verification_status")
            .in("profile_id", doctorIds);

        if (doctorProfiles) {
            const statusMap = new Map(doctorProfiles.map((d: { profile_id: string; verification_status: string }) => [d.profile_id, d.verification_status]));
            users.forEach(user => {
                if (user.role === "doctor") {
                    const docStatus = statusMap.get(user.id);
                    if (docStatus === "pending") {
                        user.status = "pending";
                    } else if (docStatus === "rejected") {
                        user.status = "inactive";
                    }
                }
            });
        }
    }

    return { users, total: count || 0 };
}

/**
 * Get user statistics for admin dashboard
 */
export async function getAdminUserStats(): Promise<{ stats: AdminUserStats; error?: string }> {
    const supabase = await createClient();

    const { isAdmin, error: authError } = await verifyAdmin(supabase);
    if (!isAdmin) {
        return {
            stats: { total_users: 0, doctors: 0, patients: 0, admins: 0 },
            error: authError
        };
    }

    // Get counts by role
    const { count: totalCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

    const { count: doctorCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "doctor");

    const { count: patientCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "patient");

    const { count: adminCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

    return {
        stats: {
            total_users: totalCount || 0,
            doctors: doctorCount || 0,
            patients: patientCount || 0,
            admins: adminCount || 0,
        }
    };
}

/**
 * Update user status (suspend, activate, etc.)
 */
export async function updateUserStatus(
    profileId: string,
    status: UserStatus
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { isAdmin, error: authError } = await verifyAdmin(supabase);
    if (!isAdmin) {
        return { success: false, error: authError };
    }

    // Get profile to determine role
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role, is_active")
        .eq("id", profileId)
        .single();

    const profile = profileData as { id: string; role: string; is_active: boolean } | null;
    if (!profile) {
        return { success: false, error: "User not found" };
    }

    // Prevent admins from deactivating themselves
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }
    const { data: currentAdminProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (currentAdminProfile && (currentAdminProfile as { id: string }).id === profileId && status === "suspended") {
        return { success: false, error: "Cannot suspend your own account" };
    }

    // Update profile is_active based on status
    const isActive = status === "active";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from("profiles")
        .update({ is_active: isActive })
        .eq("id", profileId);

    if (updateError) {
        console.error("Error updating user status:", updateError);
        return { success: false, error: "Failed to update user status" };
    }

    // If user is a doctor, also update verification_status if suspending
    if (profile.role === "doctor" && status === "suspended") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from("doctor_profiles")
            .update({ verification_status: "suspended" })
            .eq("profile_id", profileId);
    } else if (profile.role === "doctor" && status === "active") {
        // Restore to verified if reactivating a doctor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from("doctor_profiles")
            .update({ verification_status: "verified" })
            .eq("profile_id", profileId);
    }

    return { success: true };
}

// ============================================
// Patient Management
// ============================================

export interface AdminPatient {
    id: string;
    profile_id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    date_of_birth?: string;
    gender?: string;
    blood_type?: string;
    total_appointments: number;
    created_at: string;
}

/**
 * Get all patients for admin management
 */
export async function getAdminPatients(options?: {
    search?: string;
    limit?: number;
    offset?: number;
}): Promise<{ patients: AdminPatient[]; total: number; error?: string }> {
    const supabase = await createClient();

    const { isAdmin, error: authError } = await verifyAdmin(supabase);
    if (!isAdmin) {
        return { patients: [], total: 0, error: authError };
    }

    // Build query for patient profiles
    let query = supabase
        .from("patient_profiles")
        .select(`
            id,
            profile_id,
            date_of_birth,
            gender,
            blood_type,
            profiles!inner (
                id,
                full_name,
                avatar_url,
                created_at
            )
        `, { count: "exact" });

    // Apply search on profiles.full_name if provided
    // Note: search on joined table requires different approach

    query = query.order("created_at", { ascending: false, foreignTable: "profiles" });

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, count, error } = await query;

    if (error) {
        console.error("Error fetching patients:", error);
        return { patients: [], total: 0, error: error.message };
    }

    // Get appointment counts for each patient
    const patientIds = (data || []).map((p: { id: string }) => p.id);
    const appointmentCounts = new Map<string, number>();

    if (patientIds.length > 0) {
        // Count appointments per patient
        for (const patientId of patientIds) {
            const { count: aptCount } = await supabase
                .from("appointments")
                .select("*", { count: "exact", head: true })
                .eq("patient_profile_id", patientId);
            appointmentCounts.set(patientId, aptCount || 0);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let patients: AdminPatient[] = (data || []).map((p: any) => ({
        id: p.id,
        profile_id: p.profile_id,
        full_name: p.profiles?.full_name || "Unknown",
        email: "", // Would need to join with auth.users
        avatar_url: p.profiles?.avatar_url,
        date_of_birth: p.date_of_birth,
        gender: p.gender,
        blood_type: p.blood_type,
        total_appointments: appointmentCounts.get(p.id) || 0,
        created_at: p.profiles?.created_at || p.created_at,
    }));

    // Apply search filter client-side if provided
    if (options?.search) {
        const searchLower = options.search.toLowerCase();
        patients = patients.filter(p =>
            p.full_name.toLowerCase().includes(searchLower)
        );
    }

    return { patients, total: count || 0 };
}
