"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyPrescriptionIssued } from "./notifications";

// ============================================
// Types
// ============================================

export type PrescriptionStatus = "active" | "completed" | "cancelled";

export interface Prescription {
    id: string;
    appointment_id?: string;
    patient_profile_id: string;
    doctor_profile_id: string;
    medication_name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
    quantity?: number;
    refills_allowed: number;
    refills_used: number;
    is_controlled_substance: boolean;
    prescribed_at: string;
    valid_until?: string;
    status: PrescriptionStatus;
    created_at: string;
    updated_at: string;
}

export interface PrescriptionWithDetails extends Prescription {
    patient?: {
        id: string;
        full_name: string;
        avatar_url?: string;
    };
    doctor?: {
        id: string;
        full_name: string;
        avatar_url?: string;
        specialty?: string;
    };
    appointment?: {
        id: string;
        scheduled_start: string;
    };
}

export interface PrescriptionMedication {
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity?: number;
    refills_allowed?: number;
    is_controlled_substance?: boolean;
}

// ============================================
// Doctor Actions
// ============================================

/**
 * Create a new prescription
 */
export async function createPrescription(data: {
    patientProfileId: string;
    appointmentId?: string;
    medications: PrescriptionMedication[];
    validUntil?: string;
}): Promise<{ success: boolean; prescriptionIds?: string[]; error?: string }> {
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
        .select("id, verification_status")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string; verification_status: string } | null;
    if (!doctorProfile) {
        return { success: false, error: "Doctor profile not found" };
    }

    if (doctorProfile.verification_status !== "verified") {
        return { success: false, error: "Doctor not verified" };
    }

    // Get patient's base profile_id for notification
    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("profile_id")
        .eq("id", data.patientProfileId)
        .single();

    const patientProfile = patientProfileData as { profile_id: string } | null;

    // Get doctor name for notification
    const { data: doctorNameData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", profile.id)
        .single();

    const doctorName = (doctorNameData as { full_name: string } | null)?.full_name || "Your doctor";

    // Create prescriptions for each medication
    const prescriptionIds: string[] = [];
    const medicationNames: string[] = [];

    for (const med of data.medications) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: insertedData, error } = await (supabase as any)
            .from("prescriptions")
            .insert({
                patient_profile_id: data.patientProfileId,
                doctor_profile_id: doctorProfile.id,
                appointment_id: data.appointmentId || null,
                medication_name: med.medication_name,
                dosage: med.dosage || null,
                frequency: med.frequency || null,
                duration: med.duration || null,
                instructions: med.instructions || null,
                quantity: med.quantity || null,
                refills_allowed: med.refills_allowed || 0,
                refills_used: 0,
                is_controlled_substance: med.is_controlled_substance || false,
                prescribed_at: new Date().toISOString(),
                valid_until: data.validUntil || null,
                status: "active",
            })
            .select("id")
            .single();

        if (error) {
            console.error("Error creating prescription:", error);
            return { success: false, error: error.message };
        }

        if (insertedData?.id) {
            prescriptionIds.push(insertedData.id);
            medicationNames.push(med.medication_name);
        }
    }

    // Send notification to patient about new prescription(s)
    if (patientProfile?.profile_id && prescriptionIds.length > 0) {
        const medicationList = medicationNames.join(", ");
        notifyPrescriptionIssued(
            patientProfile.profile_id,
            doctorName,
            medicationList,
            prescriptionIds[0] // Link to first prescription
        ).catch(err => console.error("Failed to send prescription notification:", err));
    }

    return { success: true, prescriptionIds };
}

/**
 * Get prescriptions created by the doctor
 */
export async function getDoctorPrescriptions(filters?: {
    patientProfileId?: string;
    status?: PrescriptionStatus[];
    limit?: number;
}): Promise<{ prescriptions: PrescriptionWithDetails[]; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { prescriptions: [], error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { prescriptions: [], error: "Not a doctor profile" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { prescriptions: [], error: "Doctor profile not found" };
    }

    // Build query
    let query = supabase
        .from("prescriptions")
        .select(`
            *,
            patient_profiles (
                id,
                profiles (
                    id,
                    full_name,
                    avatar_url
                )
            ),
            appointments (
                id,
                scheduled_start
            )
        `)
        .eq("doctor_profile_id", doctorProfile.id)
        .order("prescribed_at", { ascending: false });

    if (filters?.patientProfileId) {
        query = query.eq("patient_profile_id", filters.patientProfileId);
    }

    if (filters?.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
    }

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching prescriptions:", error);
        return { prescriptions: [], error: error.message };
    }

    // Transform the data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prescriptions: PrescriptionWithDetails[] = (data || []).map((rx: any) => ({
        ...rx,
        patient: {
            id: rx.patient_profiles.id,
            full_name: rx.patient_profiles.profiles.full_name,
            avatar_url: rx.patient_profiles.profiles.avatar_url,
        },
        appointment: rx.appointments ? {
            id: rx.appointments.id,
            scheduled_start: rx.appointments.scheduled_start,
        } : undefined,
        patient_profiles: undefined,
        appointments: undefined,
    }));

    return { prescriptions };
}

/**
 * Update an existing prescription
 * Only the prescribing doctor can update their own prescriptions
 */
export async function updatePrescription(data: {
    prescriptionId: string;
    medicationName?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
    quantity?: number;
    refillsAllowed?: number;
    validUntil?: string;
    status?: PrescriptionStatus;
}): Promise<{ success: boolean; error?: string }> {
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

    // Verify the prescription belongs to this doctor and get current data
    const { data: existingPrescription } = await supabase
        .from("prescriptions")
        .select("id, doctor_profile_id, status")
        .eq("id", data.prescriptionId)
        .single();

    const prescription = existingPrescription as { id: string; doctor_profile_id: string; status: string } | null;
    if (!prescription) {
        return { success: false, error: "Prescription not found" };
    }

    if (prescription.doctor_profile_id !== doctorProfile.id) {
        return { success: false, error: "You can only edit your own prescriptions" };
    }

    // Don't allow editing cancelled prescriptions
    if (prescription.status === "cancelled") {
        return { success: false, error: "Cannot edit a cancelled prescription" };
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (data.medicationName !== undefined) {
        updateData.medication_name = data.medicationName;
    }
    if (data.dosage !== undefined) {
        updateData.dosage = data.dosage || null;
    }
    if (data.frequency !== undefined) {
        updateData.frequency = data.frequency || null;
    }
    if (data.duration !== undefined) {
        updateData.duration = data.duration || null;
    }
    if (data.instructions !== undefined) {
        updateData.instructions = data.instructions || null;
    }
    if (data.quantity !== undefined) {
        updateData.quantity = data.quantity || null;
    }
    if (data.refillsAllowed !== undefined) {
        updateData.refills_allowed = data.refillsAllowed;
    }
    if (data.validUntil !== undefined) {
        updateData.valid_until = data.validUntil || null;
    }
    if (data.status !== undefined) {
        updateData.status = data.status;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("prescriptions")
        .update(updateData)
        .eq("id", data.prescriptionId)
        .eq("doctor_profile_id", doctorProfile.id);

    if (error) {
        console.error("Error updating prescription:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Cancel a prescription
 */
export async function cancelPrescription(
    prescriptionId: string
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
        .from("prescriptions")
        .update({ status: "cancelled" })
        .eq("id", prescriptionId)
        .eq("doctor_profile_id", doctorProfile.id);

    if (error) {
        console.error("Error cancelling prescription:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============================================
// Patient Actions
// ============================================

/**
 * Get patient's prescriptions
 */
export async function getPatientPrescriptions(filters?: {
    status?: PrescriptionStatus[];
    activeOnly?: boolean;
    limit?: number;
}): Promise<{ prescriptions: PrescriptionWithDetails[]; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { prescriptions: [], error: "Not authenticated" };
    }

    // Get patient profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "patient") {
        return { prescriptions: [], error: "Not a patient profile" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { prescriptions: [], error: "Patient profile not found" };
    }

    // Build query
    let query = supabase
        .from("prescriptions")
        .select(`
            *,
            doctor_profiles (
                id,
                profiles (
                    id,
                    full_name,
                    avatar_url
                )
            ),
            appointments (
                id,
                scheduled_start
            )
        `)
        .eq("patient_profile_id", patientProfile.id)
        .order("prescribed_at", { ascending: false });

    if (filters?.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
    }

    if (filters?.activeOnly) {
        query = query.eq("status", "active");
    }

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching prescriptions:", error);
        return { prescriptions: [], error: error.message };
    }

    // Transform the data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prescriptions: PrescriptionWithDetails[] = (data || []).map((rx: any) => ({
        ...rx,
        doctor: {
            id: rx.doctor_profiles.id,
            full_name: rx.doctor_profiles.profiles.full_name,
            avatar_url: rx.doctor_profiles.profiles.avatar_url,
        },
        appointment: rx.appointments ? {
            id: rx.appointments.id,
            scheduled_start: rx.appointments.scheduled_start,
        } : undefined,
        doctor_profiles: undefined,
        appointments: undefined,
    }));

    return { prescriptions };
}

/**
 * Get a single prescription by ID
 */
export async function getPrescriptionById(
    prescriptionId: string
): Promise<{ prescription: PrescriptionWithDetails | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { prescription: null, error: "Not authenticated" };
    }

    const { data, error } = await supabase
        .from("prescriptions")
        .select(`
            *,
            doctor_profiles (
                id,
                license_number,
                profiles (
                    id,
                    full_name,
                    avatar_url,
                    phone
                )
            ),
            patient_profiles (
                id,
                date_of_birth,
                profiles (
                    id,
                    full_name,
                    avatar_url
                )
            ),
            appointments (
                id,
                scheduled_start
            )
        `)
        .eq("id", prescriptionId)
        .single();

    if (error) {
        console.error("Error fetching prescription:", error);
        return { prescription: null, error: error.message };
    }

    if (!data) {
        return { prescription: null, error: "Prescription not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rx = data as any;
    const prescription: PrescriptionWithDetails = {
        ...rx,
        doctor: {
            id: rx.doctor_profiles.id,
            full_name: rx.doctor_profiles.profiles.full_name,
            avatar_url: rx.doctor_profiles.profiles.avatar_url,
        },
        patient: {
            id: rx.patient_profiles.id,
            full_name: rx.patient_profiles.profiles.full_name,
            avatar_url: rx.patient_profiles.profiles.avatar_url,
        },
        appointment: rx.appointments ? {
            id: rx.appointments.id,
            scheduled_start: rx.appointments.scheduled_start,
        } : undefined,
        doctor_profiles: undefined,
        patient_profiles: undefined,
        appointments: undefined,
    };

    return { prescription };
}

// ============================================
// Prescription Renewal
// ============================================

/**
 * Request prescription renewal (patient)
 */
export async function requestPrescriptionRenewal(
    prescriptionId: string,
    notes?: string
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

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { success: false, error: "Patient profile not found" };
    }

    // Get the prescription
    const { data: prescriptionData } = await supabase
        .from("prescriptions")
        .select("id, doctor_profile_id, patient_profile_id")
        .eq("id", prescriptionId)
        .eq("patient_profile_id", patientProfile.id)
        .single();

    const prescription = prescriptionData as { id: string; doctor_profile_id: string; patient_profile_id: string } | null;
    if (!prescription) {
        return { success: false, error: "Prescription not found" };
    }

    // Create renewal request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("prescription_renewal_requests")
        .insert({
            original_prescription_id: prescriptionId,
            patient_profile_id: patientProfile.id,
            doctor_profile_id: prescription.doctor_profile_id,
            request_notes: notes || null,
            status: "pending",
        });

    if (error) {
        console.error("Error requesting renewal:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get pending renewal requests (doctor)
 */
export async function getPendingRenewalRequests(): Promise<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requests: any[];
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { requests: [], error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { requests: [], error: "Profile not found" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { requests: [], error: "Doctor profile not found" };
    }

    const { data, error } = await supabase
        .from("prescription_renewal_requests")
        .select(`
            *,
            prescriptions!prescription_renewal_requests_original_prescription_id_fkey (
                id,
                medication_name,
                dosage,
                frequency
            ),
            patient_profiles (
                id,
                profiles (
                    id,
                    full_name
                )
            )
        `)
        .eq("doctor_profile_id", doctorProfile.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching renewal requests:", error);
        return { requests: [], error: error.message };
    }

    return { requests: data || [] };
}

/**
 * Respond to renewal request (doctor)
 */
export async function respondToRenewalRequest(
    requestId: string,
    approved: boolean,
    response?: string,
    newValidUntil?: string
): Promise<{ success: boolean; newPrescriptionId?: string; error?: string }> {
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

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { success: false, error: "Doctor profile not found" };
    }

    // Get the renewal request
    const { data: requestData } = await supabase
        .from("prescription_renewal_requests")
        .select(`
            *,
            prescriptions!prescription_renewal_requests_original_prescription_id_fkey (*)
        `)
        .eq("id", requestId)
        .eq("doctor_profile_id", doctorProfile.id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request = requestData as any;
    if (!request) {
        return { success: false, error: "Request not found" };
    }

    let newPrescriptionId: string | undefined;

    if (approved) {
        // Create a new prescription based on the original
        const originalRx = request.prescriptions;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newRx, error: createError } = await (supabase as any)
            .from("prescriptions")
            .insert({
                patient_profile_id: request.patient_profile_id,
                doctor_profile_id: doctorProfile.id,
                medication_name: originalRx.medication_name,
                dosage: originalRx.dosage,
                frequency: originalRx.frequency,
                duration: originalRx.duration,
                instructions: originalRx.instructions,
                quantity: originalRx.quantity,
                refills_allowed: originalRx.refills_allowed,
                refills_used: 0,
                is_controlled_substance: originalRx.is_controlled_substance,
                prescribed_at: new Date().toISOString(),
                valid_until: newValidUntil || null,
                status: "active",
            })
            .select("id")
            .single();

        if (createError) {
            console.error("Error creating renewal prescription:", createError);
            return { success: false, error: createError.message };
        }

        newPrescriptionId = newRx?.id;

        // Update the renewal request
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from("prescription_renewal_requests")
            .update({
                status: "approved",
                doctor_response: response || null,
                responded_at: new Date().toISOString(),
                new_prescription_id: newPrescriptionId,
            })
            .eq("id", requestId);

        // Mark original as completed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from("prescriptions")
            .update({ status: "completed" })
            .eq("id", request.original_prescription_id);
    } else {
        // Deny the request
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from("prescription_renewal_requests")
            .update({
                status: "denied",
                doctor_response: response || null,
                responded_at: new Date().toISOString(),
            })
            .eq("id", requestId);
    }

    return { success: true, newPrescriptionId };
}

// ============================================
// Patient Renewal Request Tracking
// ============================================

export type RenewalRequestStatus = "pending" | "approved" | "denied" | "requires_consultation";

export interface RenewalRequest {
    id: string;
    original_prescription_id: string;
    patient_profile_id: string;
    doctor_profile_id: string;
    request_notes?: string;
    status: RenewalRequestStatus;
    doctor_response?: string;
    responded_at?: string;
    new_prescription_id?: string;
    created_at: string;
    prescription?: {
        medication_name: string;
        dosage?: string;
        frequency?: string;
    };
    doctor?: {
        full_name: string;
    };
}

/**
 * Get patient's renewal requests
 */
export async function getPatientRenewalRequests(): Promise<{
    requests: RenewalRequest[];
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { requests: [], error: "Not authenticated" };
    }

    // Get patient profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { requests: [], error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { requests: [], error: "Patient profile not found" };
    }

    const { data, error } = await supabase
        .from("prescription_renewal_requests")
        .select(`
            id,
            original_prescription_id,
            patient_profile_id,
            doctor_profile_id,
            request_notes,
            status,
            doctor_response,
            responded_at,
            new_prescription_id,
            created_at,
            prescriptions!prescription_renewal_requests_original_prescription_id_fkey (
                medication_name,
                dosage,
                frequency
            ),
            doctor_profiles (
                profiles (
                    full_name
                )
            )
        `)
        .eq("patient_profile_id", patientProfile.id)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching patient renewal requests:", error);
        return { requests: [], error: error.message };
    }

    // Transform the data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests: RenewalRequest[] = (data || []).map((req: any) => ({
        id: req.id,
        original_prescription_id: req.original_prescription_id,
        patient_profile_id: req.patient_profile_id,
        doctor_profile_id: req.doctor_profile_id,
        request_notes: req.request_notes,
        status: req.status,
        doctor_response: req.doctor_response,
        responded_at: req.responded_at,
        new_prescription_id: req.new_prescription_id,
        created_at: req.created_at,
        prescription: {
            medication_name: req.prescriptions.medication_name,
            dosage: req.prescriptions.dosage,
            frequency: req.prescriptions.frequency,
        },
        doctor: {
            full_name: req.doctor_profiles.profiles.full_name,
        },
    }));

    return { requests };
}

// ============================================
// Get patients for doctor (for prescription creation)
// ============================================

export interface PatientForPrescription {
    id: string;
    profile_id: string;
    full_name: string;
    avatar_url?: string;
    date_of_birth?: string;
}

/**
 * Get list of patients who have had appointments with this doctor
 */
export async function getDoctorPatients(): Promise<{
    patients: PatientForPrescription[];
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { patients: [], error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { patients: [], error: "Profile not found" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { patients: [], error: "Doctor profile not found" };
    }

    // Get unique patients from completed appointments
    const { data, error } = await supabase
        .from("appointments")
        .select(`
            patient_profiles (
                id,
                profile_id,
                date_of_birth,
                profiles (
                    id,
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq("doctor_profile_id", doctorProfile.id)
        .in("status", ["completed", "in_progress"]);

    if (error) {
        console.error("Error fetching patients:", error);
        return { patients: [], error: error.message };
    }

    // De-duplicate patients
    const patientMap = new Map<string, PatientForPrescription>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data || []).forEach((apt: any) => {
        const pp = apt.patient_profiles;
        if (!patientMap.has(pp.id)) {
            patientMap.set(pp.id, {
                id: pp.id,
                profile_id: pp.profile_id,
                full_name: pp.profiles.full_name,
                avatar_url: pp.profiles.avatar_url,
                date_of_birth: pp.date_of_birth,
            });
        }
    });

    return { patients: Array.from(patientMap.values()) };
}
