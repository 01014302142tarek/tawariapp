"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export interface DoctorAvailability {
    id: string;
    doctor_profile_id: string;
    day_of_week: number; // 0 = Sunday, 6 = Saturday
    start_time: string; // HH:MM format
    end_time: string;
    is_active: boolean;
}

export interface BlockedTime {
    id: string;
    doctor_profile_id: string;
    start_datetime: string;
    end_datetime: string;
    reason?: string;
}

export interface AvailableSlot {
    start: string; // ISO datetime
    end: string;
}

// ============================================
// Doctor Availability Management
// ============================================

/**
 * Get doctor's weekly availability schedule
 */
export async function getDoctorAvailability(
    doctorProfileId?: string
): Promise<{ availability: DoctorAvailability[]; error?: string }> {
    const supabase = await createClient();

    let targetDoctorId = doctorProfileId;

    // If no doctorProfileId provided, get current user's doctor profile
    if (!targetDoctorId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { availability: [], error: "Not authenticated" };
        }

        const { data: profileData } = await supabase
            .from("profiles")
            .select("id, role")
            .eq("user_id", user.id)
            .single();

        const profile = profileData as { id: string; role: string } | null;
        if (!profile || profile.role !== "doctor") {
            return { availability: [], error: "Not a doctor profile" };
        }

        const { data: doctorProfileData } = await supabase
            .from("doctor_profiles")
            .select("id")
            .eq("profile_id", profile.id)
            .single();

        const doctorProfile = doctorProfileData as { id: string } | null;
        if (!doctorProfile) {
            return { availability: [], error: "Doctor profile not found" };
        }

        targetDoctorId = doctorProfile.id;
    }

    const { data, error } = await supabase
        .from("doctor_availability")
        .select("*")
        .eq("doctor_profile_id", targetDoctorId)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

    if (error) {
        console.error("Error fetching availability:", error);
        return { availability: [], error: error.message };
    }

    return { availability: (data as DoctorAvailability[]) || [] };
}

/**
 * Set doctor's availability for a specific day
 * Replaces existing availability for that day
 */
export async function setDayAvailability(
    dayOfWeek: number,
    slots: { start_time: string; end_time: string }[]
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get doctor profile
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

    // Delete existing availability for this day
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("doctor_availability")
        .delete()
        .eq("doctor_profile_id", doctorProfile.id)
        .eq("day_of_week", dayOfWeek);

    // Insert new slots
    if (slots.length > 0) {
        const insertData = slots.map(slot => ({
            doctor_profile_id: doctorProfile.id,
            day_of_week: dayOfWeek,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_active: true,
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from("doctor_availability")
            .insert(insertData);

        if (error) {
            console.error("Error setting availability:", error);
            return { success: false, error: error.message };
        }
    }

    return { success: true };
}

/**
 * Toggle availability slot active status
 */
export async function toggleAvailabilitySlot(
    slotId: string,
    isActive: boolean
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Verify ownership through profile check
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
        .from("doctor_availability")
        .update({ is_active: isActive })
        .eq("id", slotId);

    if (error) {
        console.error("Error toggling availability:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============================================
// Blocked Times Management
// ============================================

/**
 * Get doctor's blocked time periods
 */
export async function getBlockedTimes(
    doctorProfileId?: string
): Promise<{ blockedTimes: BlockedTime[]; error?: string }> {
    const supabase = await createClient();

    let targetDoctorId = doctorProfileId;

    if (!targetDoctorId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { blockedTimes: [], error: "Not authenticated" };
        }

        const { data: profileData } = await supabase
            .from("profiles")
            .select("id, role")
            .eq("user_id", user.id)
            .single();

        const profile = profileData as { id: string; role: string } | null;
        if (!profile || profile.role !== "doctor") {
            return { blockedTimes: [], error: "Not a doctor profile" };
        }

        const { data: doctorProfileData } = await supabase
            .from("doctor_profiles")
            .select("id")
            .eq("profile_id", profile.id)
            .single();

        const doctorProfile = doctorProfileData as { id: string } | null;
        if (!doctorProfile) {
            return { blockedTimes: [], error: "Doctor profile not found" };
        }

        targetDoctorId = doctorProfile.id;
    }

    const { data, error } = await supabase
        .from("doctor_blocked_times")
        .select("*")
        .eq("doctor_profile_id", targetDoctorId)
        .gte("end_datetime", new Date().toISOString())
        .order("start_datetime", { ascending: true });

    if (error) {
        console.error("Error fetching blocked times:", error);
        return { blockedTimes: [], error: error.message };
    }

    return { blockedTimes: (data as BlockedTime[]) || [] };
}

/**
 * Add a blocked time period
 */
export async function addBlockedTime(data: {
    start_datetime: string;
    end_datetime: string;
    reason?: string;
}): Promise<{ success: boolean; blockedTimeId?: string; error?: string }> {
    const supabase = await createClient();

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: insertedData, error } = await (supabase as any)
        .from("doctor_blocked_times")
        .insert({
            doctor_profile_id: doctorProfile.id,
            start_datetime: data.start_datetime,
            end_datetime: data.end_datetime,
            reason: data.reason || null,
        })
        .select("id")
        .single();

    if (error) {
        console.error("Error adding blocked time:", error);
        return { success: false, error: error.message };
    }

    return { success: true, blockedTimeId: insertedData?.id };
}

/**
 * Remove a blocked time period
 */
export async function removeBlockedTime(
    blockedTimeId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("doctor_blocked_times")
        .delete()
        .eq("id", blockedTimeId);

    if (error) {
        console.error("Error removing blocked time:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============================================
// Available Slots Calculation
// ============================================

/**
 * Get available appointment slots for a doctor on a specific date
 * Takes into account: weekly availability, blocked times, and existing appointments
 */
export async function getAvailableSlots(
    doctorProfileId: string,
    date: string, // YYYY-MM-DD format
    slotDurationMinutes: number = 30
): Promise<{ slots: AvailableSlot[]; error?: string }> {
    const supabase = await createClient();

    // Get the day of week for the requested date
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Fetch doctor's availability for this day
    const { data: availabilityData, error: availError } = await supabase
        .from("doctor_availability")
        .select("*")
        .eq("doctor_profile_id", doctorProfileId)
        .eq("day_of_week", dayOfWeek)
        .eq("is_active", true);

    if (availError) {
        console.error("Error fetching availability:", availError);
        return { slots: [], error: availError.message };
    }

    const availability = availabilityData as DoctorAvailability[] | null;
    if (!availability || availability.length === 0) {
        return { slots: [] }; // Doctor doesn't work on this day
    }

    // Get blocked times for this date
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data: blockedData } = await supabase
        .from("doctor_blocked_times")
        .select("*")
        .eq("doctor_profile_id", doctorProfileId)
        .lte("start_datetime", endOfDay)
        .gte("end_datetime", startOfDay);

    const blockedTimes = blockedData as BlockedTime[] | null || [];

    // Get existing appointments for this date
    const { data: appointmentsData } = await supabase
        .from("appointments")
        .select("scheduled_start, scheduled_end, status")
        .eq("doctor_profile_id", doctorProfileId)
        .gte("scheduled_start", startOfDay)
        .lte("scheduled_start", endOfDay)
        .in("status", ["scheduled", "in_waiting_room", "in_progress"]);

    const appointments = appointmentsData as { scheduled_start: string; scheduled_end: string; status: string }[] || [];

    // Generate all possible slots from availability windows
    const allSlots: AvailableSlot[] = [];

    for (const avail of availability) {
        const [startHour, startMin] = avail.start_time.split(":").map(Number);
        const [endHour, endMin] = avail.end_time.split(":").map(Number);

        let currentSlotStart = new Date(date);
        currentSlotStart.setHours(startHour, startMin, 0, 0);

        const windowEnd = new Date(date);
        windowEnd.setHours(endHour, endMin, 0, 0);

        while (currentSlotStart.getTime() + slotDurationMinutes * 60000 <= windowEnd.getTime()) {
            const slotEnd = new Date(currentSlotStart.getTime() + slotDurationMinutes * 60000);

            allSlots.push({
                start: currentSlotStart.toISOString(),
                end: slotEnd.toISOString(),
            });

            currentSlotStart = slotEnd;
        }
    }

    // Filter out slots that overlap with blocked times or existing appointments
    const availableSlots = allSlots.filter(slot => {
        const slotStart = new Date(slot.start).getTime();
        const slotEnd = new Date(slot.end).getTime();

        // Check blocked times
        for (const blocked of blockedTimes) {
            const blockedStart = new Date(blocked.start_datetime).getTime();
            const blockedEnd = new Date(blocked.end_datetime).getTime();
            if (slotStart < blockedEnd && slotEnd > blockedStart) {
                return false; // Overlaps with blocked time
            }
        }

        // Check existing appointments
        for (const apt of appointments) {
            const aptStart = new Date(apt.scheduled_start).getTime();
            const aptEnd = new Date(apt.scheduled_end).getTime();
            if (slotStart < aptEnd && slotEnd > aptStart) {
                return false; // Overlaps with existing appointment
            }
        }

        // Check if slot is in the past
        if (slotStart < Date.now()) {
            return false;
        }

        return true;
    });

    return { slots: availableSlots };
}
