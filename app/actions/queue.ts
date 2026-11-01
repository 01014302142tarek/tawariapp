"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { createNotification } from "./notifications";

// ============================================
// Types
// ============================================

export type QueueStatus =
    | "waiting"
    | "called"
    | "in_consultation"
    | "completed"
    | "cancelled"
    | "expired";

export type QueuePaymentStatus =
    | "pending"
    | "completed_mock"
    | "completed"
    | "refunded"
    | "failed";

export interface QueueEntry {
    id: string;
    doctor_profile_id: string;
    patient_profile_id: string;
    status: QueueStatus;
    position: number;
    chief_complaint?: string;
    joined_at: string;
    called_at?: string;
    consultation_started_at?: string;
    consultation_ended_at?: string;
    payment_status: QueuePaymentStatus;
    payment_amount: number;
    daily_room_name?: string;
    daily_room_url?: string;
    appointment_id?: string;
}

export interface OnlineDoctor {
    id: string;
    profile_id: string;
    full_name: string;
    avatar_url?: string | null;
    specialty: string[];
    consultation_fee: number;
    rating_average: number;
    rating_count: number;
    is_online: boolean;
    is_in_consultation: boolean;
    queue_length: number;
    estimated_wait_minutes: number;
    average_consultation_minutes: number;
}

export interface QueuePosition {
    position: number;
    estimated_wait_minutes: number;
    total_in_queue: number;
    doctor_status: "available" | "in_consultation" | "offline";
}

// ============================================
// Doctor Actions
// ============================================

/**
 * Toggle doctor's online status
 */
export async function toggleDoctorOnline(
    goOnline: boolean
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
        return { success: false, error: "Not a doctor" };
    }

    const { data: doctorData } = await supabase
        .from("doctor_profiles")
        .select("id, verification_status, consultation_fee")
        .eq("profile_id", profile.id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doctor = doctorData as any;
    if (!doctor) {
        return { success: false, error: "Doctor profile not found" };
    }

    // Only verified doctors can go online
    if (goOnline && doctor.verification_status !== "verified") {
        return { success: false, error: "Only verified doctors can go online" };
    }

    // Must have consultation fee set
    if (goOnline && (!doctor.consultation_fee || doctor.consultation_fee <= 0)) {
        return { success: false, error: "Please set your consultation fee before going online" };
    }

    // Update online status (both is_online and is_available_now)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("doctor_profiles")
        .update({
            is_online: goOnline,
            is_available_now: goOnline,
            went_online_at: goOnline ? new Date().toISOString() : null,
            current_queue_entry_id: goOnline ? doctor.current_queue_entry_id : null,
        })
        .eq("id", doctor.id);

    if (error) {
        console.error("Error toggling online status:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get doctor's current online status and queue info
 */
export async function getDoctorQueueStatus(): Promise<{
    isOnline: boolean;
    doctorProfileId: string | null;
    doctorMessagingProfileId: string | null;
    currentPatient: (QueueEntry & { patient_messaging_profile_id?: string; patient_name?: string; patient_avatar?: string }) | null;
    waitingPatients: Array<QueueEntry & { patient_name: string; patient_avatar?: string; patient_messaging_profile_id?: string }>;
    todayStats: { completed: number; earnings: number };
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { isOnline: false, doctorProfileId: null, doctorMessagingProfileId: null, currentPatient: null, waitingPatients: [], todayStats: { completed: 0, earnings: 0 }, error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { isOnline: false, doctorProfileId: null, doctorMessagingProfileId: null, currentPatient: null, waitingPatients: [], todayStats: { completed: 0, earnings: 0 }, error: "Profile not found" };
    }

    const { data: doctorData } = await supabase
        .from("doctor_profiles")
        .select("id, is_online, current_queue_entry_id")
        .eq("profile_id", profile.id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doctor = doctorData as any;
    if (!doctor) {
        return { isOnline: false, doctorProfileId: null, doctorMessagingProfileId: null, currentPatient: null, waitingPatients: [], todayStats: { completed: 0, earnings: 0 }, error: "Doctor profile not found" };
    }

    // Get current patient if any (including profile_id for messaging)
    let currentPatient: (QueueEntry & { patient_messaging_profile_id?: string; patient_name?: string; patient_avatar?: string }) | null = null;
    if (doctor.current_queue_entry_id) {
        const { data: currentData } = await supabase
            .from("consultation_queue")
            .select(`
                *,
                patient_profiles!consultation_queue_patient_profile_id_fkey (
                    id,
                    profile_id,
                    profiles!patient_profiles_profile_id_fkey (
                        id,
                        full_name,
                        avatar_url
                    )
                )
            `)
            .eq("id", doctor.current_queue_entry_id)
            .single();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawCurrent = currentData as any;
        const isActive = rawCurrent && ["called", "in_consultation"].includes(rawCurrent.status);

        if (isActive) {
            currentPatient = {
                ...rawCurrent,
                patient_name: rawCurrent.patient_profiles?.profiles?.full_name || "Patient",
                patient_avatar: rawCurrent.patient_profiles?.profiles?.avatar_url,
                patient_messaging_profile_id: rawCurrent.patient_profiles?.profiles?.id,
                patient_profiles: undefined,
            };
        } else {
            // Clear stale current queue entry reference to allow calling next patient
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from("doctor_profiles")
                .update({ current_queue_entry_id: null })
                .eq("id", doctor.id)
                .eq("current_queue_entry_id", doctor.current_queue_entry_id);
        }
    }

    // Get waiting patients
    // Note: Must specify FK for both patient_profiles and profiles due to multiple relationships
    const { data: waitingData } = await supabase
        .from("consultation_queue")
        .select(`
            *,
            patient_profiles!consultation_queue_patient_profile_id_fkey (
                id,
                profile_id,
                profiles!patient_profiles_profile_id_fkey (
                    id,
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq("doctor_profile_id", doctor.id)
        .eq("status", "waiting")
        .order("position", { ascending: true });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const waitingPatients = (waitingData || []).map((entry: any) => ({
        ...entry,
        patient_name: entry.patient_profiles?.profiles?.full_name || "Patient",
        patient_avatar: entry.patient_profiles?.profiles?.avatar_url,
        // Include profile_id for messaging
        patient_messaging_profile_id: entry.patient_profiles?.profiles?.id,
        patient_profiles: undefined,
    }));

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: todayData } = await supabase
        .from("consultation_queue")
        .select("payment_amount")
        .eq("doctor_profile_id", doctor.id)
        .eq("status", "completed")
        .gte("consultation_ended_at", today.toISOString());

    const todayStats = {
        completed: todayData?.length || 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        earnings: (todayData || []).reduce((sum: number, e: any) => sum + (parseFloat(e.payment_amount) || 0), 0),
    };

    return {
        isOnline: doctor.is_online || false,
        doctorProfileId: doctor.id,
        doctorMessagingProfileId: profile.id,
        currentPatient,
        waitingPatients,
        todayStats,
    };
}

/**
 * Doctor calls next patient in queue
 */
export async function callNextPatient(): Promise<{
    success: boolean;
    queueEntry?: QueueEntry;
    roomUrl?: string;
    error?: string;
}> {
    const supabase = await createClient();
    const adminSupabase: any = await createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await adminSupabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    const { data: doctorData } = await adminSupabase
        .from("doctor_profiles")
        .select("id, is_online, current_queue_entry_id")
        .eq("profile_id", profile.id)
        .single();

    const doctor = doctorData as any;
    if (!doctor) {
        return { success: false, error: "Doctor profile not found" };
    }

    // Ensure doctor is online
    if (!doctor.is_online) {
        await adminSupabase
            .from("doctor_profiles")
            .update({ is_online: true, is_available_now: true })
            .eq("id", doctor.id);
    }

    // Get next patient in queue
    const { data: nextPatient } = await adminSupabase
        .from("consultation_queue")
        .select("*")
        .eq("doctor_profile_id", doctor.id)
        .eq("status", "waiting")
        .order("position", { ascending: true })
        .limit(1)
        .single();

    if (!nextPatient) {
        return { success: false, error: "No patients in queue" };
    }

    const queueEntry = nextPatient as QueueEntry;

    // Immediately generate video room so both doctor and patient enter without waiting
    const dailyApiKey = process.env.DAILY_API_KEY;
    const dailyDomain = process.env.NEXT_PUBLIC_DAILY_DOMAIN;
    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "fairmeeting.net";
    let roomUrl: string;
    let roomName: string;

    if (!dailyApiKey || !dailyDomain) {
        roomName = `tabibi-q-${queueEntry.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}-${Date.now().toString(36)}`;
        roomUrl = `https://${jitsiDomain}/${roomName}`;
    } else {
        try {
            roomName = `tabibi-q-${queueEntry.id.slice(0, 8)}-${Date.now()}`;
            const response = await fetch("https://api.daily.co/v1/rooms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${dailyApiKey}`,
                },
                body: JSON.stringify({
                    name: roomName,
                    privacy: "private",
                    properties: {
                        exp: Math.floor(Date.now() / 1000) + 3600,
                        enable_screenshare: true,
                        enable_chat: true,
                        enable_knocking: false,
                        start_video_off: false,
                        start_audio_off: false,
                        max_participants: 2,
                        eject_at_room_exp: true,
                    },
                }),
            });
            if (response.ok) {
                const room = await response.json();
                roomUrl = room.url;
            } else {
                roomName = `tabibi-q-${queueEntry.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}-${Date.now().toString(36)}`;
                roomUrl = `https://${jitsiDomain}/${roomName}`;
            }
        } catch {
            roomName = `tabibi-q-${queueEntry.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}-${Date.now().toString(36)}`;
            roomUrl = `https://${jitsiDomain}/${roomName}`;
        }
    }

    const nowIso = new Date().toISOString();

    // Update queue entry directly to in_consultation with room URL
    const { error: updateError } = await adminSupabase
        .from("consultation_queue")
        .update({
            status: "in_consultation",
            called_at: nowIso,
            consultation_started_at: nowIso,
            daily_room_name: roomName,
            daily_room_url: roomUrl,
        })
        .eq("id", queueEntry.id);

    if (updateError) {
        console.error("Error calling patient:", updateError);
        return { success: false, error: updateError.message };
    }

    // Update doctor's current queue entry
    await adminSupabase
        .from("doctor_profiles")
        .update({ current_queue_entry_id: queueEntry.id })
        .eq("id", doctor.id);

    // Notify patient that doctor is calling them into consultation
    try {
        const { data: patientProfileData } = await adminSupabase
            .from("patient_profiles")
            .select("profile_id")
            .eq("id", queueEntry.patient_profile_id)
            .single();

        if (patientProfileData?.profile_id) {
            const { data: doctorUserData } = await adminSupabase
                .from("profiles")
                .select("full_name")
                .eq("id", profile.id)
                .single();
            const doctorName = (doctorUserData as { full_name?: string } | null)?.full_name || "الطبيب";

            createNotification({
                profileId: patientProfileData.profile_id,
                title: "حان دورك في الكشف العاجل!",
                body: `${doctorName} بانتظارك الآن في غرفة الكشف. اضغط للدخول إلى مكالمة الفيديو.`,
                notificationType: "system",
                data: {
                    queueEntryId: queueEntry.id,
                    roomUrl,
                    action: "urgent_call",
                },
            }).catch(err => console.error("Failed to notify patient of urgent call:", err));
        }
    } catch (e) {
        console.error("Error sending urgent call notification:", e);
    }

    return {
        success: true,
        queueEntry: {
            ...queueEntry,
            status: "in_consultation",
            called_at: nowIso,
            consultation_started_at: nowIso,
            daily_room_name: roomName,
            daily_room_url: roomUrl,
        },
        roomUrl,
    };
}

/**
 * Start consultation (creates Daily room, updates status)
 */
export async function startQueueConsultation(
    queueEntryId: string
): Promise<{ success: boolean; roomUrl?: string; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Verify doctor owns this queue entry
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    const { data: doctorData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctor = doctorData as { id: string } | null;
    if (!doctor) {
        return { success: false, error: "Doctor profile not found" };
    }

    // Get queue entry
    const { data: queueData } = await supabase
        .from("consultation_queue")
        .select("*")
        .eq("id", queueEntryId)
        .eq("doctor_profile_id", doctor.id)
        .single();

    const queueEntry = queueData as QueueEntry | null;
    if (!queueEntry) {
        return { success: false, error: "Queue entry not found" };
    }

    // Create Daily.co room configuration
    const dailyApiKey = process.env.DAILY_API_KEY;
    const dailyDomain = process.env.NEXT_PUBLIC_DAILY_DOMAIN;
    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "fairmeeting.net";

    // Allow rejoining if already in_consultation with existing room
    if (queueEntry.status === "in_consultation" && queueEntry.daily_room_url) {
        let existingUrl = queueEntry.daily_room_url;
        if (existingUrl.includes("meet.jit.si")) {
            existingUrl = existingUrl.replace("meet.jit.si", jitsiDomain);
            const adminSupabase: any = createServiceRoleClient();
            await adminSupabase
                .from("consultation_queue")
                .update({ daily_room_url: existingUrl })
                .eq("id", queueEntry.id);
        }
        if (!dailyApiKey || !existingUrl.includes("daily.co")) {
            console.log("[startQueueConsultation] Rejoining existing WebRTC room:", existingUrl);
            return { success: true, roomUrl: existingUrl };
        }
        // Check if the room still exists on Daily.co
        try {
            const checkResponse = await fetch(`https://api.daily.co/v1/rooms/${queueEntry.daily_room_name}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${dailyApiKey}`,
                },
            });

            if (checkResponse.ok) {
                // Room still exists - return existing URL for rejoin
                console.log("[startQueueConsultation] Rejoining existing room:", queueEntry.daily_room_name);
                return { success: true, roomUrl: existingUrl };
            } else {
                // Room expired or deleted - will create a new one below
                console.log("[startQueueConsultation] Existing room expired, creating new one");
            }
        } catch (err) {
            console.warn("[startQueueConsultation] Error checking room existence:", err);
            // Continue to create new room
        }
    }

    if (queueEntry.status !== "called" && queueEntry.status !== "in_consultation") {
        return { success: false, error: "Patient must be called first" };
    }

    let roomUrl: string;
    let roomName: string;

    if (!dailyApiKey || !dailyDomain) {
        // Fallback to WebRTC room (meet.jit.si) when Daily.co keys are not set
        roomName = `tabibi-q-${queueEntryId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}-${Date.now().toString(36)}`;
        roomUrl = `https://${jitsiDomain}/${roomName}`;
        console.log("[startQueueConsultation] Using WebRTC fallback room:", roomUrl);
    } else {
        try {
            roomName = `tabibi-q-${queueEntryId.slice(0, 8)}-${Date.now()}`;

            const response = await fetch("https://api.daily.co/v1/rooms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${dailyApiKey}`,
                },
                body: JSON.stringify({
                    name: roomName,
                    privacy: "private",  // Private room - requires token
                    properties: {
                        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
                        enable_screenshare: true,
                        enable_chat: true,
                        enable_knocking: false,  // No knocking since we use tokens
                        start_video_off: false,
                        start_audio_off: false,
                        max_participants: 2,  // Only doctor and patient
                        eject_at_room_exp: true,
                    },
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Daily API error:", error);
                return { success: false, error: "Failed to create video room" };
            }

            const room = await response.json();
            roomUrl = room.url;
        } catch (err) {
            console.error("Error creating Daily room:", err);
            return { success: false, error: "Failed to create video room" };
        }
    }

    // Update queue entry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from("consultation_queue")
        .update({
            status: "in_consultation",
            consultation_started_at: new Date().toISOString(),
            daily_room_name: roomName,
            daily_room_url: roomUrl,
        })
        .eq("id", queueEntryId);

    if (updateError) {
        console.error("Error starting consultation:", updateError);
        return { success: false, error: updateError.message };
    }

    return { success: true, roomUrl };
}

/**
 * End consultation
 */
export async function endQueueConsultation(
    queueEntryId: string
): Promise<{ success: boolean; appointmentId?: string; patientProfileId?: string; error?: string }> {
    const supabase = await createClient();
    const adminSupabase = (await createServiceRoleClient()) as any;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    const { data: doctorData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctor = doctorData as { id: string } | null;
    if (!doctor) {
        return { success: false, error: "Doctor profile not found" };
    }

    // Get queue entry
    const { data: queueData } = await supabase
        .from("consultation_queue")
        .select("*")
        .eq("id", queueEntryId)
        .eq("doctor_profile_id", doctor.id)
        .single();

    const queueEntry = queueData as QueueEntry | null;
    if (!queueEntry) {
        return { success: false, error: "Queue entry not found" };
    }

    // Calculate duration
    const startedAt = queueEntry.consultation_started_at ? new Date(queueEntry.consultation_started_at) : new Date();
    const endedAt = new Date();
    const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

    // Create an appointment record FIRST for this urgent care consultation
    // This enables reviews, prescription linking, and consultation history
    // We do this BEFORE updating status so patient polling gets appointment_id with "completed" status
    let appointmentId: string | null = null;
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: appointmentData, error: appointmentError } = await (adminSupabase as any)
            .from("appointments")
            .insert({
                patient_profile_id: queueEntry.patient_profile_id,
                doctor_profile_id: queueEntry.doctor_profile_id,
                // For urgent care, scheduled times are when patient was called/consultation started
                scheduled_start: queueEntry.called_at || queueEntry.joined_at,
                scheduled_end: endedAt.toISOString(), // Required NOT NULL field
                actual_start: queueEntry.consultation_started_at,
                actual_end: endedAt.toISOString(),
                status: "completed",
                // appointment_type only accepts 'scheduled' or 'on_demand', use on_demand for urgent care
                appointment_type: "on_demand",
                is_urgent: true, // Mark as urgent care
                consultation_fee: queueEntry.payment_amount || 0, // Required NOT NULL field
                chief_complaint: queueEntry.chief_complaint || null,
            })
            .select("id")
            .single();

        if (appointmentError) {
            console.error("Error creating appointment for urgent care:", appointmentError);
            // Don't fail the whole operation, just log the error
        } else {
            appointmentId = (appointmentData as { id: string })?.id;
            console.log("Created appointment for urgent care:", appointmentId);
        }
    } catch (err) {
        console.error("Exception creating appointment for urgent care:", err);
    }

    // Update queue entry with status AND appointment_id together to avoid race condition
    // Patient polling will see both "completed" status and appointment_id at the same time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (adminSupabase as any)
        .from("consultation_queue")
        .update({
            status: "completed",
            consultation_ended_at: endedAt.toISOString(),
            consultation_duration_minutes: durationMinutes,
            appointment_id: appointmentId, // Include appointment_id in same update
        })
        .eq("id", queueEntryId);

    if (updateError) {
        console.error("Error ending consultation:", updateError);
        return { success: false, error: updateError.message };
    }

    // Clear doctor's current queue entry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminSupabase as any)
        .from("doctor_profiles")
        .update({ current_queue_entry_id: null })
        .eq("id", doctor.id);

    // Recalculate queue positions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminSupabase as any).rpc("recalculate_queue_positions", { p_doctor_profile_id: doctor.id });

    return {
        success: true,
        appointmentId: appointmentId || undefined,
        patientProfileId: queueEntry.patient_profile_id,
    };
}

// ============================================
// Patient Actions
// ============================================

/**
 * Get all online doctors with queue info
 */
export async function getOnlineDoctors(): Promise<{
    doctors: OnlineDoctor[];
    error?: string;
}> {
    const supabase = await createClient();

    // Get all online, verified doctors
    // Note: Must specify FK because doctor_profiles has two FKs to profiles (profile_id and verified_by)
    const { data, error } = await supabase
        .from("doctor_profiles")
        .select(`
            id,
            profile_id,
            consultation_fee,
            rating_average,
            rating_count,
            is_online,
            current_queue_entry_id,
            average_consultation_minutes,
            profiles!doctor_profiles_profile_id_fkey (
                full_name,
                avatar_url
            ),
            doctor_specializations (
                specializations (
                    name_en
                )
            )
        `)
        .eq("is_online", true)
        .eq("verification_status", "verified");

    if (error) {
        console.error("Error fetching online doctors:", error);
        return { doctors: [], error: error.message };
    }

    type OnlineDoctorRow = {
        id: string;
        profile_id: string;
        consultation_fee: number | string | null;
        rating_average: number | string | null;
        rating_count: number | null;
        is_online: boolean;
        current_queue_entry_id: string | null;
        average_consultation_minutes: number | null;
        profiles: {
            full_name: string;
            avatar_url: string | null;
        };
        doctor_specializations: Array<{
            specializations?: { name_en?: string | null } | null;
        }> | null;
    };

    const doctorRows = (data as OnlineDoctorRow[] | null) || [];

    // Get queue counts for each doctor
    const doctorIds = doctorRows.map((d) => d.id);

    const { data: queueData } = await supabase
        .from("consultation_queue")
        .select("doctor_profile_id")
        .in("doctor_profile_id", doctorIds)
        .eq("status", "waiting");

    // Count queues per doctor
    const queueCounts: Record<string, number> = {};
    (queueData || []).forEach((q: { doctor_profile_id: string }) => {
        queueCounts[q.doctor_profile_id] = (queueCounts[q.doctor_profile_id] || 0) + 1;
    });

    // Transform data
    const doctors: OnlineDoctor[] = doctorRows.map((doc) => {
        const queueLength = queueCounts[doc.id] || 0;
        const avgMinutes = doc.average_consultation_minutes || 15;

        const specialties = (doc.doctor_specializations || [])
            .map((ds) => ds.specializations?.name_en)
            .filter((name): name is string => Boolean(name));

        const consultationFee = Number(doc.consultation_fee ?? 0);
        const ratingAverage = Number(doc.rating_average ?? 0);
        const ratingCount = Number(doc.rating_count ?? 0);

        return {
            id: doc.id,
            profile_id: doc.profile_id,
            full_name: doc.profiles.full_name,
            avatar_url: doc.profiles.avatar_url,
            specialty: specialties,
            consultation_fee: Number.isFinite(consultationFee) ? consultationFee : 0,
            rating_average: Number.isFinite(ratingAverage) ? ratingAverage : 0,
            rating_count: Number.isFinite(ratingCount) ? ratingCount : 0,
            is_online: doc.is_online,
            is_in_consultation: !!doc.current_queue_entry_id,
            queue_length: queueLength,
            estimated_wait_minutes: queueLength * avgMinutes,
            average_consultation_minutes: avgMinutes,
        };
    });

    return { doctors };
}

/**
 * Join a doctor's queue (after payment)
 */
export async function joinDoctorQueue(data: {
    doctorProfileId: string;
    chiefComplaint?: string;
    paymentAmount: number;
}): Promise<{ success: boolean; queueEntryId?: string; position?: number; error?: string }> {
    try {
        const supabase = await createClient();
        const adminSupabase: any = await createServiceRoleClient();

        // 1. Identify or fallback patient profile
        let patientProfileId: string | null = null;
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Get user's profile
            const { data: profileData } = await adminSupabase
                .from("profiles")
                .select("id, role")
                .eq("user_id", user.id)
                .single();

            const profile = profileData as { id: string; role: string } | null;
            if (profile) {
                // Find existing patient profile
                const { data: patientData } = await adminSupabase
                    .from("patient_profiles")
                    .select("id")
                    .eq("profile_id", profile.id)
                    .single();

                if (patientData?.id) {
                    patientProfileId = patientData.id;
                } else {
                    // Create a patient profile record for this user so testing works regardless of role
                    const { data: newPatient } = await adminSupabase
                        .from("patient_profiles")
                        .insert({ profile_id: profile.id })
                        .select("id")
                        .single();
                    if (newPatient?.id) {
                        patientProfileId = newPatient.id;
                    }
                }
            }
        }

        // If still no patient profile, fallback to the first available patient profile in database
        if (!patientProfileId) {
            const { data: fallbackPatient } = await adminSupabase
                .from("patient_profiles")
                .select("id")
                .limit(1)
                .single();
            if (fallbackPatient?.id) {
                patientProfileId = fallbackPatient.id;
            }
        }

        if (!patientProfileId) {
            return { success: false, error: "Patient profile not found" };
        }

        // 2. Ensure doctor exists and is online
        const { data: doctorData } = await adminSupabase
            .from("doctor_profiles")
            .select("id, is_online, max_queue_size")
            .eq("id", data.doctorProfileId)
            .single();

        const doctor = doctorData as any;
        if (!doctor) {
            return { success: false, error: "Doctor profile not found" };
        }

        // Auto-bring doctor online so patients can join and the doctor immediately sees the queue
        if (!doctor.is_online) {
            await (adminSupabase as any)
                .from("doctor_profiles")
                .update({
                    is_online: true,
                    is_available_now: true,
                    went_online_at: new Date().toISOString(),
                })
                .eq("id", data.doctorProfileId);
        }

        // 3. Handle existing queue entry for this patient
        const { data: existingQueue } = await adminSupabase
            .from("consultation_queue")
            .select("id, doctor_profile_id, status, position")
            .eq("patient_profile_id", patientProfileId)
            .in("status", ["waiting", "called", "in_consultation"])
            .order("joined_at", { ascending: false })
            .limit(1);

        if (existingQueue && existingQueue.length > 0) {
            const currentEntry = existingQueue[0];
            // If already in queue for this exact doctor, update and reuse it
            if (currentEntry.doctor_profile_id === data.doctorProfileId) {
                await (adminSupabase as any)
                    .from("consultation_queue")
                    .update({
                        payment_status: "completed_mock",
                        payment_amount: data.paymentAmount,
                        chief_complaint: data.chiefComplaint || null,
                    })
                    .eq("id", currentEntry.id);

                return {
                    success: true,
                    queueEntryId: currentEntry.id,
                    position: currentEntry.position || 1,
                };
            } else {
                // If in queue for another doctor, cancel the previous one
                await (adminSupabase as any)
                    .from("consultation_queue")
                    .update({ status: "cancelled" })
                    .eq("id", currentEntry.id);
            }
        }

        // 4. Get next queue position
        const { data: positionData } = await (adminSupabase as any)
            .rpc("get_next_queue_position", { p_doctor_profile_id: data.doctorProfileId });

        const position = positionData || 1;

        // 5. Create queue entry with admin client (bypasses RLS)
        const { data: insertData, error: insertError } = await (adminSupabase as any)
            .from("consultation_queue")
            .insert({
                doctor_profile_id: data.doctorProfileId,
                patient_profile_id: patientProfileId,
                chief_complaint: data.chiefComplaint || null,
                status: "waiting",
                position: position,
                payment_status: "completed_mock",
                payment_amount: data.paymentAmount,
            })
            .select("id")
            .single();

        if (insertError) {
            console.error("Error joining queue:", insertError);
            return { success: false, error: insertError.message };
        }

        // Notify doctor of new patient joining urgent queue
        try {
            const { data: docRecord } = await (adminSupabase as any)
                .from("doctor_profiles")
                .select("profile_id")
                .eq("id", data.doctorProfileId)
                .single();

            if (docRecord?.profile_id) {
                let patientName = "مريض";
                if (patientProfileId) {
                    const { data: pRec } = await (adminSupabase as any)
                        .from("patient_profiles")
                        .select("profile_id")
                        .eq("id", patientProfileId)
                        .single();
                    if (pRec?.profile_id) {
                        const { data: pUser } = await (adminSupabase as any)
                            .from("profiles")
                            .select("full_name")
                            .eq("id", pRec.profile_id)
                            .single();
                        if (pUser?.full_name) patientName = pUser.full_name;
                    }
                }

                createNotification({
                    profileId: docRecord.profile_id,
                    title: "مريض جديد في قائمة الانتظار",
                    body: `انضم ${patientName} إلى قائمة انتظارك (الترتيب: #${position}).`,
                    notificationType: "new_appointment",
                    data: {
                        queueEntryId: insertData.id,
                        position,
                    },
                }).catch(err => console.error("Failed to notify doctor of queue join:", err));
            }
        } catch (e) {
            console.error("Error sending queue join notification to doctor:", e);
        }

        return {
            success: true,
            queueEntryId: insertData.id,
            position: position,
        };
    } catch (err: any) {
        console.error("Unhandled error in joinDoctorQueue:", err);
        return { success: false, error: err?.message || "Failed to join queue" };
    }
}

/**
 * Leave queue (cancel) - works for waiting, called, or in_consultation
 */
export async function leaveQueue(
    queueEntryId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get patient profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    const { data: patientData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patient = patientData as { id: string } | null;
    if (!patient) {
        return { success: false, error: "Patient profile not found" };
    }

    // Get queue entry
    const { data: queueData } = await supabase
        .from("consultation_queue")
        .select("*")
        .eq("id", queueEntryId)
        .eq("patient_profile_id", patient.id)
        .single();

    const queueEntry = queueData as QueueEntry | null;
    if (!queueEntry) {
        return { success: false, error: "Queue entry not found" };
    }

    // Allow leaving from waiting, called, or in_consultation status
    if (!["waiting", "called", "in_consultation"].includes(queueEntry.status)) {
        return { success: false, error: `Cannot leave queue at this stage (status: ${queueEntry.status})` };
    }

    // Patient-initiated leave is always 'cancelled' (RLS only allows patients to set status to 'cancelled')
    // Doctor-initiated end uses endQueueConsultation() which sets status to 'completed'
    const finalStatus = "cancelled";

    // Calculate duration if was in consultation
    const endedAt = new Date();
    const updateData: Record<string, unknown> = { status: finalStatus };

    if (queueEntry.status === "in_consultation" && queueEntry.consultation_started_at) {
        const startedAt = new Date(queueEntry.consultation_started_at);
        const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);
        updateData.consultation_ended_at = endedAt.toISOString();
        updateData.consultation_duration_minutes = durationMinutes;
    }

    // Update queue entry - include patient_profile_id check for RLS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updateResult, error: updateError } = await (supabase as any)
        .from("consultation_queue")
        .update(updateData)
        .eq("id", queueEntryId)
        .eq("patient_profile_id", patient.id)
        .select();

    if (updateError) {
        console.error("Error leaving queue:", updateError);
        return { success: false, error: updateError.message };
    }

    // Check if any rows were actually updated
    if (!updateResult || updateResult.length === 0) {
        return { success: false, error: "Failed to update queue entry - please try again" };
    }

    // If was in_consultation, also clear doctor's current_queue_entry_id
    if (queueEntry.status === "in_consultation") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from("doctor_profiles")
            .update({ current_queue_entry_id: null })
            .eq("id", queueEntry.doctor_profile_id)
            .eq("current_queue_entry_id", queueEntryId); // Only clear if it's still this entry
    }

    // Recalculate positions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc("recalculate_queue_positions", {
        p_doctor_profile_id: queueEntry.doctor_profile_id
    });

    return { success: true };
}

/**
 * Get patient's current queue position
 */
export async function getMyQueuePosition(): Promise<{
    inQueue: boolean;
    queueEntry?: QueueEntry & { doctor_name: string; doctor_avatar?: string };
    position?: QueuePosition;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { inQueue: false, error: "Not authenticated" };
    }

    // Get patient profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { inQueue: false, error: "Profile not found" };
    }

    const { data: patientData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patient = patientData as { id: string } | null;
    if (!patient) {
        return { inQueue: false, error: "Patient profile not found" };
    }

    // Get active queue entry
    // Note: Must specify FK for both doctor_profiles and profiles due to multiple relationships
    const { data: queueData } = await supabase
        .from("consultation_queue")
        .select(`
            *,
            doctor_profiles!consultation_queue_doctor_profile_id_fkey (
                id,
                is_online,
                current_queue_entry_id,
                average_consultation_minutes,
                profiles!doctor_profiles_profile_id_fkey (
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq("patient_profile_id", patient.id)
        .in("status", ["waiting", "called", "in_consultation"])
        .order("joined_at", { ascending: false })
        .limit(1)
        .single();

    if (!queueData) {
        return { inQueue: false };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entry = queueData as any;

    // Get total queue length
    const { data: queueCount } = await supabase
        .from("consultation_queue")
        .select("id", { count: "exact" })
        .eq("doctor_profile_id", entry.doctor_profile_id)
        .eq("status", "waiting");

    const totalInQueue = queueCount?.length || 0;
    const avgMinutes = entry.doctor_profiles?.average_consultation_minutes || 15;

    // Determine doctor status
    let doctorStatus: "available" | "in_consultation" | "offline" = "available";
    if (!entry.doctor_profiles?.is_online) {
        doctorStatus = "offline";
    } else if (entry.doctor_profiles?.current_queue_entry_id) {
        doctorStatus = "in_consultation";
    }

    return {
        inQueue: true,
        queueEntry: {
            ...entry,
            doctor_name: entry.doctor_profiles?.profiles?.full_name || "Doctor",
            doctor_avatar: entry.doctor_profiles?.profiles?.avatar_url,
            doctor_profiles: undefined,
        },
        position: {
            position: entry.position,
            estimated_wait_minutes: (entry.position - 1) * avgMinutes,
            total_in_queue: totalInQueue,
            doctor_status: doctorStatus,
        },
    };
}

/**
 * Get queue entry details (for video call page and waiting room)
 */
export async function getQueueEntryForCall(
    queueEntryId: string
): Promise<{
    success: boolean;
    entry?: QueueEntry;
    userRole?: "doctor" | "patient";
    userMessagingProfileId?: string;
    doctor?: { full_name: string; avatar_url?: string; specialty: string[]; messaging_profile_id?: string };
    patient?: { full_name: string; avatar_url?: string; messaging_profile_id?: string };
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get user's profile and role
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    // Get queue entry with related data
    // Note: Must specify FK for both doctor_profiles and profiles due to multiple relationships
    // - consultation_queue has two FKs to doctor_profiles (doctor_profile_id and via current_queue_entry_id reverse)
    // - doctor_profiles has two FKs to profiles (profile_id and verified_by)
    const { data: queueData, error } = await supabase
        .from("consultation_queue")
        .select(`
            *,
            doctor_profiles!consultation_queue_doctor_profile_id_fkey (
                id,
                profiles!doctor_profiles_profile_id_fkey (
                    id,
                    full_name,
                    avatar_url
                ),
                doctor_specializations (
                    specializations (
                        name_en
                    )
                )
            ),
            patient_profiles!consultation_queue_patient_profile_id_fkey (
                id,
                profiles!patient_profiles_profile_id_fkey (
                    id,
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq("id", queueEntryId)
        .single();

    if (error || !queueData) {
        console.error("[getQueueEntryForCall] Error fetching queue entry:", error?.message, { queueEntryId });
        return { success: false, error: "Queue entry not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = queueData as any;

    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "fairmeeting.net";
    let activeRoomUrl = data.daily_room_url;
    if (activeRoomUrl && activeRoomUrl.includes("meet.jit.si")) {
        activeRoomUrl = activeRoomUrl.replace("meet.jit.si", jitsiDomain);
        const adminSupabase: any = createServiceRoleClient();
        adminSupabase
            .from("consultation_queue")
            .update({ daily_room_url: activeRoomUrl })
            .eq("id", queueEntryId)
            .then(() => {});
    }

    const entry: QueueEntry = {
        id: data.id,
        doctor_profile_id: data.doctor_profile_id,
        patient_profile_id: data.patient_profile_id,
        status: data.status,
        position: data.position,
        chief_complaint: data.chief_complaint,
        joined_at: data.joined_at,
        called_at: data.called_at,
        consultation_started_at: data.consultation_started_at,
        consultation_ended_at: data.consultation_ended_at,
        payment_status: data.payment_status,
        payment_amount: data.payment_amount,
        daily_room_name: data.daily_room_name,
        daily_room_url: activeRoomUrl,
        appointment_id: data.appointment_id,
    };

    // Extract doctor and patient info
    const doctorSpecialties = (data.doctor_profiles?.doctor_specializations || [])
        .map((ds: { specializations?: { name_en?: string } }) => ds.specializations?.name_en)
        .filter(Boolean);

    const doctorInfo = {
        full_name: data.doctor_profiles?.profiles?.full_name || "Doctor",
        avatar_url: data.doctor_profiles?.profiles?.avatar_url,
        specialty: doctorSpecialties,
        messaging_profile_id: data.doctor_profiles?.profiles?.id,
    };

    const patientInfo = {
        full_name: data.patient_profiles?.profiles?.full_name || "Patient",
        avatar_url: data.patient_profiles?.profiles?.avatar_url,
        messaging_profile_id: data.patient_profiles?.profiles?.id,
    };

    // Verify user is authorized (either the doctor or the patient)
    if (profile.role === "doctor") {
        const { data: doctorData } = await supabase
            .from("doctor_profiles")
            .select("id")
            .eq("profile_id", profile.id)
            .single();

        if (!doctorData || (doctorData as { id: string }).id !== entry.doctor_profile_id) {
            return { success: false, error: "Not authorized" };
        }
        return { success: true, entry, userRole: "doctor", userMessagingProfileId: profile.id, doctor: doctorInfo, patient: patientInfo };
    } else if (profile.role === "patient") {
        const { data: patientData } = await supabase
            .from("patient_profiles")
            .select("id")
            .eq("profile_id", profile.id)
            .single();

        if (!patientData || (patientData as { id: string }).id !== entry.patient_profile_id) {
            return { success: false, error: "Not authorized" };
        }
        return { success: true, entry, userRole: "patient", userMessagingProfileId: profile.id, doctor: doctorInfo, patient: patientInfo };
    }

    return { success: false, error: "Not authorized" };
}
