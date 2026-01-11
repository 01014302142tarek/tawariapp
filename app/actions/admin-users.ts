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

export interface CreateUserInput {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    phone?: string;
    // Doctor-specific fields
    license_number?: string;
    specializations?: string[];
    years_of_experience?: number;
    consultation_fee?: number;
    // Patient-specific fields
    date_of_birth?: string;
    gender?: "male" | "female";
    blood_type?: string;
    // Admin-specific fields
    admin_type?: "full_admin" | "support_agent";
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

    console.log("✅ Fetched profiles from database:", data?.length, "Total count:", count);

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

    // Fetch emails for users using admin API (requires service role)
    const userIds = users.map(u => u.user_id).filter(Boolean);
    if (userIds.length > 0) {
        try {
            // Use auth.admin.listUsers() which requires service role
            const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
            
            if (authUsers && authUsers.length > 0) {
                console.log("✅ Fetched auth users:", authUsers.length);
                const emailMap = new Map(authUsers.map(u => [u.id, u.email || ""]));
                users.forEach(user => {
                    user.email = emailMap.get(user.user_id) || "";
                });
            }
        } catch (err) {
            console.error("❌ Could not fetch user emails (requires service role):", err);
            // Continue without emails - not critical
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

    console.log("✅ Final users to return:", users.length);

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
    status?: string; // "all", "active", "inactive"
    gender?: string; // "all", "male", "female"
    bloodType?: string; // "all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
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

    // Apply gender filter if provided
    if (options?.gender && options.gender !== "all") {
        query = query.eq("gender", options.gender);
    }

    // Apply blood type filter if provided
    if (options?.bloodType && options.bloodType !== "all") {
        query = query.eq("blood_type", options.bloodType);
    }

    query = query.order("created_at", { ascending: false, foreignTable: "profiles" });

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    } else if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, count, error } = await query;

    if (error) {
        console.error("Error fetching patients:", error);
        return { patients: [], total: 0, error: error.message };
    }

    console.log("Raw patient data fetched:", data?.length, "Total count:", count);

    // Get appointment counts for each patient
    const patientIds = (data || []).map((p: { id: string }) => p.id);
    const appointmentCounts = new Map<string, number>();

    if (patientIds.length > 0) {
        // Count appointments per patient in parallel
        const appointmentPromises = patientIds.map(async (patientId) => {
            const { count: aptCount } = await supabase
                .from("appointments")
                .select("*", { count: "exact", head: true })
                .eq("patient_profile_id", patientId);
            return { patientId, count: aptCount || 0 };
        });
        
        const appointmentResults = await Promise.all(appointmentPromises);
        appointmentResults.forEach(({ patientId, count: aptCount }) => {
            appointmentCounts.set(patientId, aptCount);
        });
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

    // Apply search filter if provided
    if (options?.search) {
        const searchLower = options.search.toLowerCase();
        patients = patients.filter(p =>
            p.full_name.toLowerCase().includes(searchLower) ||
            (p.email && p.email.toLowerCase().includes(searchLower)) ||
            (p.blood_type && p.blood_type.toLowerCase().includes(searchLower))
        );
    }

    // Apply status filter (active/inactive) based on appointments
    if (options?.status && options.status !== "all") {
        if (options.status === "active") {
            patients = patients.filter(p => p.total_appointments > 0);
        } else if (options.status === "inactive") {
            patients = patients.filter(p => p.total_appointments === 0);
        }
    }

    console.log("Final patients after filters:", patients.length);

    // Return the original database count, not the filtered count
    // This is important for correct pagination
    return { patients, total: count || 0 };
}

/**
 * Create a new user (Admin only)
 */
export async function createUser(input: CreateUserInput): Promise<{ success: boolean; error?: string; userId?: string }> {
    const supabase = await createClient();

    const { isAdmin, error: authError } = await verifyAdmin(supabase);
    if (!isAdmin) {
        return { success: false, error: authError };
    }

    try {
        // Step 1: Create auth user using admin API
        const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
            email: input.email,
            password: input.password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                full_name: input.full_name,
                role: input.role,
            }
        });

        if (authCreateError || !authData.user) {
            console.error("Error creating auth user:", authCreateError);
            return { success: false, error: authCreateError?.message || "Failed to create user" };
        }

        const userId = authData.user.id;
        console.log("✅ Auth user created:", userId);

        // Step 2: Create profile (admin can insert due to RLS policy)
        const profileId = crypto.randomUUID();
        const { error: profileError } = await supabase
            .from("profiles")
            .insert({
                id: profileId,
                user_id: userId,
                role: input.role,
                full_name: input.full_name,
                phone: input.phone,
                is_active: true,
            });

        if (profileError) {
            console.error("❌ Error creating profile:", profileError);
            // Cleanup: delete auth user
            await supabase.auth.admin.deleteUser(userId);
            return { success: false, error: `Failed to create user profile: ${profileError.message}` };
        }

        console.log("✅ Profile created:", profileId);

        // Step 3: Create role-specific profile
        if (input.role === "doctor") {
            const doctorProfileId = crypto.randomUUID();
            const { error: doctorError } = await supabase
                .from("doctor_profiles")
                .insert({
                    id: doctorProfileId,
                    profile_id: profileId,
                    license_number: input.license_number,
                    years_of_experience: input.years_of_experience || 0,
                    consultation_fee: input.consultation_fee,
                    verification_status: "pending",
                    rating_average: 0,
                    rating_count: 0,
                });

            if (doctorError) {
                console.error("❌ Error creating doctor profile:", doctorError);
                await supabase.auth.admin.deleteUser(userId);
                return { success: false, error: `Failed to create doctor profile: ${doctorError.message}` };
            }

            console.log("✅ Doctor profile created:", doctorProfileId);

            // Add specializations if provided
            if (input.specializations && input.specializations.length > 0) {
                // Get specialization IDs from names
                const { data: specializations } = await supabase
                    .from("specializations")
                    .select("id, name_en")
                    .in("name_en", input.specializations);

                if (specializations && specializations.length > 0) {
                    const doctorSpecializations = specializations.map(spec => ({
                        id: crypto.randomUUID(),
                        doctor_profile_id: doctorProfileId,
                        specialization_id: spec.id,
                    }));

                    await supabase
                        .from("doctor_specializations")
                        .insert(doctorSpecializations);
                    
                    console.log("✅ Specializations added");
                }
            }

        } else if (input.role === "patient") {
            const patientProfileId = crypto.randomUUID();
            const { error: patientError } = await supabase
                .from("patient_profiles")
                .insert({
                    id: patientProfileId,
                    profile_id: profileId,
                    date_of_birth: input.date_of_birth,
                    gender: input.gender,
                    blood_type: input.blood_type,
                    verification_level: "email_verified",
                });

            if (patientError) {
                console.error("❌ Error creating patient profile:", patientError);
                await supabase.auth.admin.deleteUser(userId);
                return { success: false, error: `Failed to create patient profile: ${patientError.message}` };
            }

            console.log("✅ Patient profile created:", patientProfileId);

        } else if (input.role === "admin") {
            const adminProfileId = crypto.randomUUID();
            const { error: adminError } = await supabase
                .from("admin_profiles")
                .insert({
                    id: adminProfileId,
                    profile_id: profileId,
                    admin_type: input.admin_type || "support_agent",
                });

            if (adminError) {
                console.error("❌ Error creating admin profile:", adminError);
                await supabase.auth.admin.deleteUser(userId);
                return { success: false, error: `Failed to create admin profile: ${adminError.message}` };
            }

            console.log("✅ Admin profile created:", adminProfileId);
        }

        console.log("✅ User created successfully:", userId);
        return { success: true, userId };

    } catch (error) {
        console.error("❌ Unexpected error creating user:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
