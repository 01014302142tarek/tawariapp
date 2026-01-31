"use server";

import { createClient } from "@/lib/supabase/server";

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
    avatar_url?: string;
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

    // Update online status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("doctor_profiles")
        .update({
            is_online: goOnline,
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
        if (rawCurrent) {
            currentPatient = {
                ...rawCurrent,
                patient_name: rawCurrent.patient_profiles?.profiles?.full_name || "Patient",
                patient_avatar: rawCurrent.patient_profiles?.profiles?.avatar_url,
                patient_messaging_profile_id: rawCurrent.patient_profiles?.profiles?.id,
                patient_profiles: undefined,
            };
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
    error?: string
}> {
    const supabase = await createClient();

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
        .select("id, is_online, current_queue_entry_id")
        .eq("profile_id", profile.id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doctor = doctorData as any;
    if (!doctor) {
        return { success: false, error: "Doctor profile not found" };
    }

    if (!doctor.is_online) {
        return { success: false, error: "You must be online to call patients" };
    }

    if (doctor.current_queue_entry_id) {
        return { success: false, error: "You already have an active consultation" };
    }

    // Get next patient in queue
    const { data: nextPatient } = await supabase
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

    // Update queue entry to "called"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from("consultation_queue")
        .update({
            status: "called",
            called_at: new Date().toISOString(),
        })
        .eq("id", queueEntry.id);

    if (updateError) {
        console.error("Error calling patient:", updateError);
        return { success: false, error: updateError.message };
    }

    // Update doctor's current queue entry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("doctor_profiles")
        .update({ current_queue_entry_id: queueEntry.id })
        .eq("id", doctor.id);

    return {
        success: true,
        queueEntry: { ...queueEntry, status: "called", called_at: new Date().toISOString() }
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

    if (!dailyApiKey || !dailyDomain) {
        return { success: false, error: "Video service not configured" };
    }

    // Allow rejoining if already in_consultation with existing room
    if (queueEntry.status === "in_consultation" && queueEntry.daily_room_url && queueEntry.daily_room_name) {
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
                return { success: true, roomUrl: queueEntry.daily_room_url };
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

    try {
        roomName = `tawari-q-${queueEntryId.slice(0, 8)}-${Date.now()}`;

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

    // Update queue entry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from("consultation_queue")
        .update({
            status: "completed",
            consultation_ended_at: endedAt.toISOString(),
            consultation_duration_minutes: durationMinutes,
        })
        .eq("id", queueEntryId);

    if (updateError) {
        console.error("Error ending consultation:", updateError);
        return { success: false, error: updateError.message };
    }

    // Create an appointment record for this urgent care consultation
    // This enables reviews, prescription linking, and consultation history
    let appointmentId: string | null = null;
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: appointmentData, error: appointmentError } = await (supabase as any)
            .from("appointments")
            .insert({
                patient_profile_id: queueEntry.patient_profile_id,
                doctor_profile_id: queueEntry.doctor_profile_id,
                scheduled_start: queueEntry.called_at || queueEntry.joined_at,
                actual_start: queueEntry.consultation_started_at,
                actual_end: endedAt.toISOString(),
                status: "completed",
                type: "urgent_care",
                consultation_queue_id: queueEntryId,
                payment_status: queueEntry.payment_status === "completed_mock" ? "completed" : queueEntry.payment_status,
                amount: queueEntry.payment_amount,
                notes: queueEntry.chief_complaint || null,
            })
            .select("id")
            .single();

        if (appointmentError) {
            console.error("Error creating appointment for urgent care:", appointmentError);
            // Don't fail the whole operation, just log the error
        } else {
            appointmentId = (appointmentData as { id: string })?.id;
            console.log("Created appointment for urgent care:", appointmentId);

            // Update queue entry with the appointment ID so patient can find it
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from("consultation_queue")
                .update({ appointment_id: appointmentId })
                .eq("id", queueEntryId);
        }
    } catch (err) {
        console.error("Exception creating appointment for urgent care:", err);
    }

    // Clear doctor's current queue entry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("doctor_profiles")
        .update({ current_queue_entry_id: null })
        .eq("id", doctor.id);

    // Recalculate queue positions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc("recalculate_queue_positions", { p_doctor_profile_id: doctor.id });

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

    // Get queue counts for each doctor
    const doctorIds = (data || []).map((d: { id: string }) => d.id);

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doctors: OnlineDoctor[] = (data || []).map((doc: any) => {
        const queueLength = queueCounts[doc.id] || 0;
        const avgMinutes = doc.average_consultation_minutes || 15;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const specialties = (doc.doctor_specializations || [])
            .map((ds: { specializations?: { name_en?: string } }) => ds.specializations?.name_en)
            .filter(Boolean);

        return {
            id: doc.id,
            profile_id: doc.profile_id,
            full_name: doc.profiles.full_name,
            avatar_url: doc.profiles.avatar_url,
            specialty: specialties,
            consultation_fee: parseFloat(doc.consultation_fee) || 0,
            rating_average: parseFloat(doc.rating_average) || 0,
            rating_count: doc.rating_count || 0,
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
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get patient profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "patient") {
        return { success: false, error: "Not a patient" };
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

    // Check if patient is already in a queue
    const { data: existingQueue } = await supabase
        .from("consultation_queue")
        .select("id")
        .eq("patient_profile_id", patient.id)
        .in("status", ["waiting", "called", "in_consultation"])
        .limit(1);

    if (existingQueue && existingQueue.length > 0) {
        return { success: false, error: "You are already in a queue" };
    }

    // Verify doctor is online
    const { data: doctorData } = await supabase
        .from("doctor_profiles")
        .select("id, is_online, max_queue_size")
        .eq("id", data.doctorProfileId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doctor = doctorData as any;
    if (!doctor || !doctor.is_online) {
        return { success: false, error: "Doctor is not available" };
    }

    // Check queue size
    const { data: queueCount } = await supabase
        .from("consultation_queue")
        .select("id", { count: "exact" })
        .eq("doctor_profile_id", data.doctorProfileId)
        .eq("status", "waiting");

    const currentQueueSize = queueCount?.length || 0;
    if (currentQueueSize >= (doctor.max_queue_size || 10)) {
        return { success: false, error: "Doctor's queue is full" };
    }

    // Get next position
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: positionData } = await (supabase as any)
        .rpc("get_next_queue_position", { p_doctor_profile_id: data.doctorProfileId });

    const position = positionData || 1;

    // Create queue entry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: insertData, error: insertError } = await (supabase as any)
        .from("consultation_queue")
        .insert({
            doctor_profile_id: data.doctorProfileId,
            patient_profile_id: patient.id,
            chief_complaint: data.chiefComplaint || null,
            status: "waiting",  // Explicitly set status
            position: position,
            payment_status: "completed_mock",  // Mock payment for now
            payment_amount: data.paymentAmount,
        })
        .select("id")
        .single();

    if (insertError) {
        console.error("Error joining queue:", insertError);
        return { success: false, error: insertError.message };
    }

    return {
        success: true,
        queueEntryId: insertData.id,
        position: position,
    };
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
        daily_room_url: data.daily_room_url,
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
