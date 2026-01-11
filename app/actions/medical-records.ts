"use server";

import { createClient } from "@/lib/supabase/server";
import {
    uploadMedicalDocument,
    getMedicalDocumentSignedUrl,
    deleteMedicalDocument,
    type MedicalDocumentType,
} from "@/lib/supabase/storage";

// Re-export storage functions for convenience
export { uploadMedicalDocument, getMedicalDocumentSignedUrl, deleteMedicalDocument };
export type { MedicalDocumentType };

// ============================================
// Types
// ============================================

export type RecordType = "general" | "chronic_condition" | "surgical_history" | "family_history";
export type AllergySeverity = "mild" | "moderate" | "severe";
export type ConditionStatus = "active" | "managed" | "resolved";

export interface MedicalRecord {
    id: string;
    patient_profile_id: string;
    record_type: RecordType;
    title: string;
    description?: string;
    date_recorded?: string;
    recorded_by?: string;
    is_self_reported: boolean;
    attachments: string[];
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface Allergy {
    id: string;
    patient_profile_id: string;
    allergen: string;
    severity?: AllergySeverity;
    reaction?: string;
    diagnosed_date?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Condition {
    id: string;
    patient_profile_id: string;
    condition_name: string;
    icd_code?: string;
    diagnosed_date?: string;
    status: ConditionStatus;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface LabResult {
    id: string;
    patient_profile_id: string;
    test_name: string;
    test_date: string;
    lab_name?: string;
    document_url?: string;
    results_summary?: string;
    uploaded_by?: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get current patient's profile ID
 * Used for client-side file uploads
 */
export async function getPatientProfileId(): Promise<{ patientProfileId: string | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { patientProfileId: null, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "patient") {
        return { patientProfileId: null, error: "Not a patient profile" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { patientProfileId: null, error: "Patient profile not found" };
    }

    return { patientProfileId: patientProfile.id };
}

// ============================================
// Medical Records Functions
// ============================================

/**
 * Get all medical records for the patient
 */
export async function getMedicalRecords(
    recordType?: RecordType
): Promise<{ records: MedicalRecord[]; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { records: [], error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "patient") {
        return { records: [], error: "Not a patient profile" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { records: [], error: "Patient profile not found" };
    }

    let query = supabase
        .from("medical_records")
        .select("*")
        .eq("patient_profile_id", patientProfile.id)
        .eq("is_deleted", false)
        .order("date_recorded", { ascending: false, nullsFirst: false });

    if (recordType) {
        query = query.eq("record_type", recordType);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching medical records:", error);
        return { records: [], error: error.message };
    }

    return { records: (data || []) as MedicalRecord[] };
}

/**
 * Add a new medical record
 */
export async function addMedicalRecord(data: {
    recordType: RecordType;
    title: string;
    description?: string;
    dateRecorded?: string;
    attachments?: string[];
}): Promise<{ record: MedicalRecord | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { record: null, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { record: null, error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { record: null, error: "Patient profile not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: insertedData, error } = await (supabase as any)
        .from("medical_records")
        .insert({
            patient_profile_id: patientProfile.id,
            record_type: data.recordType,
            title: data.title,
            description: data.description || null,
            date_recorded: data.dateRecorded || null,
            recorded_by: profile.id,
            is_self_reported: true,
            attachments: data.attachments || [],
            is_deleted: false,
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding medical record:", error);
        return { record: null, error: error.message };
    }

    return { record: insertedData as MedicalRecord };
}

/**
 * Delete a medical record (soft delete)
 */
export async function deleteMedicalRecord(
    recordId: string
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("medical_records")
        .update({ is_deleted: true })
        .eq("id", recordId)
        .eq("patient_profile_id", patientProfile.id);

    if (error) {
        console.error("Error deleting medical record:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============================================
// Allergies Functions
// ============================================

/**
 * Get all allergies for the patient
 */
export async function getAllergies(): Promise<{ allergies: Allergy[]; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { allergies: [], error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { allergies: [], error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { allergies: [], error: "Patient profile not found" };
    }

    const { data, error } = await supabase
        .from("allergies")
        .select("*")
        .eq("patient_profile_id", patientProfile.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching allergies:", error);
        return { allergies: [], error: error.message };
    }

    return { allergies: (data || []) as Allergy[] };
}

/**
 * Add a new allergy
 */
export async function addAllergy(data: {
    allergen: string;
    severity?: AllergySeverity;
    reaction?: string;
    diagnosedDate?: string;
}): Promise<{ allergy: Allergy | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { allergy: null, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { allergy: null, error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { allergy: null, error: "Patient profile not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: insertedData, error } = await (supabase as any)
        .from("allergies")
        .insert({
            patient_profile_id: patientProfile.id,
            allergen: data.allergen,
            severity: data.severity || null,
            reaction: data.reaction || null,
            diagnosed_date: data.diagnosedDate || null,
            is_active: true,
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding allergy:", error);
        return { allergy: null, error: error.message };
    }

    return { allergy: insertedData as Allergy };
}

/**
 * Delete an allergy
 */
export async function deleteAllergy(
    allergyId: string
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("allergies")
        .delete()
        .eq("id", allergyId)
        .eq("patient_profile_id", patientProfile.id);

    if (error) {
        console.error("Error deleting allergy:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============================================
// Conditions Functions
// ============================================

/**
 * Get all conditions for the patient
 */
export async function getConditions(): Promise<{ conditions: Condition[]; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { conditions: [], error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { conditions: [], error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { conditions: [], error: "Patient profile not found" };
    }

    const { data, error } = await supabase
        .from("conditions")
        .select("*")
        .eq("patient_profile_id", patientProfile.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching conditions:", error);
        return { conditions: [], error: error.message };
    }

    return { conditions: (data || []) as Condition[] };
}

/**
 * Add a new condition
 */
export async function addCondition(data: {
    conditionName: string;
    icdCode?: string;
    diagnosedDate?: string;
    status?: ConditionStatus;
    notes?: string;
}): Promise<{ condition: Condition | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { condition: null, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { condition: null, error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { condition: null, error: "Patient profile not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: insertedData, error } = await (supabase as any)
        .from("conditions")
        .insert({
            patient_profile_id: patientProfile.id,
            condition_name: data.conditionName,
            icd_code: data.icdCode || null,
            diagnosed_date: data.diagnosedDate || null,
            status: data.status || "active",
            notes: data.notes || null,
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding condition:", error);
        return { condition: null, error: error.message };
    }

    return { condition: insertedData as Condition };
}

/**
 * Update condition status
 */
export async function updateConditionStatus(
    conditionId: string,
    status: ConditionStatus
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("conditions")
        .update({ status })
        .eq("id", conditionId)
        .eq("patient_profile_id", patientProfile.id);

    if (error) {
        console.error("Error updating condition:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Delete a condition
 */
export async function deleteCondition(
    conditionId: string
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("conditions")
        .delete()
        .eq("id", conditionId)
        .eq("patient_profile_id", patientProfile.id);

    if (error) {
        console.error("Error deleting condition:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============================================
// Lab Results Functions
// ============================================

/**
 * Get all lab results for the patient
 */
export async function getLabResults(): Promise<{ results: LabResult[]; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { results: [], error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { results: [], error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { results: [], error: "Patient profile not found" };
    }

    const { data, error } = await supabase
        .from("lab_results")
        .select("*")
        .eq("patient_profile_id", patientProfile.id)
        .eq("is_deleted", false)
        .order("test_date", { ascending: false });

    if (error) {
        console.error("Error fetching lab results:", error);
        return { results: [], error: error.message };
    }

    return { results: (data || []) as LabResult[] };
}

/**
 * Add a new lab result
 */
export async function addLabResult(data: {
    testName: string;
    testDate: string;
    labName?: string;
    documentUrl?: string;
    resultsSummary?: string;
}): Promise<{ result: LabResult | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { result: null, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { result: null, error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { result: null, error: "Patient profile not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: insertedData, error } = await (supabase as any)
        .from("lab_results")
        .insert({
            patient_profile_id: patientProfile.id,
            test_name: data.testName,
            test_date: data.testDate,
            lab_name: data.labName || null,
            document_url: data.documentUrl || null,
            results_summary: data.resultsSummary || null,
            uploaded_by: profile.id,
            is_deleted: false,
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding lab result:", error);
        return { result: null, error: error.message };
    }

    return { result: insertedData as LabResult };
}

/**
 * Delete a lab result (soft delete)
 */
export async function deleteLabResult(
    resultId: string
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("lab_results")
        .update({ is_deleted: true })
        .eq("id", resultId)
        .eq("patient_profile_id", patientProfile.id);

    if (error) {
        console.error("Error deleting lab result:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============================================
// Get all health data summary
// ============================================

export interface HealthDataSummary {
    recordsCount: number;
    allergiesCount: number;
    conditionsCount: number;
    labResultsCount: number;
    activeConditions: number;
}

/**
 * Get summary of patient's health data
 */
export async function getHealthDataSummary(): Promise<{
    summary: HealthDataSummary | null;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { summary: null, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { summary: null, error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { summary: null, error: "Patient profile not found" };
    }

    // Get counts in parallel
    const [recordsResult, allergiesResult, conditionsResult, labResult, activeConditionsResult] = await Promise.all([
        supabase
            .from("medical_records")
            .select("*", { count: "exact", head: true })
            .eq("patient_profile_id", patientProfile.id)
            .eq("is_deleted", false),
        supabase
            .from("allergies")
            .select("*", { count: "exact", head: true })
            .eq("patient_profile_id", patientProfile.id)
            .eq("is_active", true),
        supabase
            .from("conditions")
            .select("*", { count: "exact", head: true })
            .eq("patient_profile_id", patientProfile.id),
        supabase
            .from("lab_results")
            .select("*", { count: "exact", head: true })
            .eq("patient_profile_id", patientProfile.id)
            .eq("is_deleted", false),
        supabase
            .from("conditions")
            .select("*", { count: "exact", head: true })
            .eq("patient_profile_id", patientProfile.id)
            .eq("status", "active"),
    ]);

    return {
        summary: {
            recordsCount: recordsResult.count || 0,
            allergiesCount: allergiesResult.count || 0,
            conditionsCount: conditionsResult.count || 0,
            labResultsCount: labResult.count || 0,
            activeConditions: activeConditionsResult.count || 0,
        },
    };
}

// ============================================
// Lab Result Document Upload
// ============================================

/**
 * Upload a document for a lab result and update the record
 */
export async function uploadLabResultDocument(data: {
    labResultId: string;
    fileBase64: string;
    fileName: string;
}): Promise<{ documentUrl: string | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { documentUrl: null, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { documentUrl: null, error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { documentUrl: null, error: "Patient profile not found" };
    }

    // Verify the lab result belongs to this patient
    const { data: labResultData } = await supabase
        .from("lab_results")
        .select("id, patient_profile_id")
        .eq("id", data.labResultId)
        .single();

    const labResult = labResultData as { id: string; patient_profile_id: string } | null;
    if (!labResult || labResult.patient_profile_id !== patientProfile.id) {
        return { documentUrl: null, error: "Lab result not found or unauthorized" };
    }

    // Upload the document
    const uploadResult = await uploadMedicalDocument(
        patientProfile.id,
        "lab_result",
        data.fileBase64,
        data.fileName
    );

    if (uploadResult.error || !uploadResult.path) {
        return { documentUrl: null, error: uploadResult.error || "Upload failed" };
    }

    // Update the lab result with the document URL (store path for signed URL generation)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from("lab_results")
        .update({ document_url: uploadResult.path })
        .eq("id", data.labResultId);

    if (updateError) {
        // Try to clean up the uploaded file
        await deleteMedicalDocument(uploadResult.path);
        return { documentUrl: null, error: updateError.message };
    }

    return { documentUrl: uploadResult.url };
}

/**
 * Get signed URL for viewing a lab result document
 */
export async function getLabResultDocumentUrl(
    labResultId: string
): Promise<{ url: string | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { url: null, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile) {
        return { url: null, error: "Profile not found" };
    }

    // Get the lab result
    const { data: labResultData } = await supabase
        .from("lab_results")
        .select("document_url, patient_profile_id")
        .eq("id", labResultId)
        .single();

    const labResult = labResultData as { document_url: string | null; patient_profile_id: string } | null;
    if (!labResult || !labResult.document_url) {
        return { url: null, error: "Lab result not found or no document attached" };
    }

    // The getMedicalDocumentSignedUrl will handle authorization checks
    return getMedicalDocumentSignedUrl(labResult.document_url);
}

// ============================================
// Medical Record Attachments
// ============================================

/**
 * Add an attachment to a medical record
 */
export async function addMedicalRecordAttachment(data: {
    recordId: string;
    fileBase64: string;
    fileName: string;
}): Promise<{ attachmentPath: string | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { attachmentPath: null, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { attachmentPath: null, error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { attachmentPath: null, error: "Patient profile not found" };
    }

    // Verify the medical record belongs to this patient
    const { data: recordData } = await supabase
        .from("medical_records")
        .select("id, patient_profile_id, attachments")
        .eq("id", data.recordId)
        .single();

    const record = recordData as { id: string; patient_profile_id: string; attachments: string[] } | null;
    if (!record || record.patient_profile_id !== patientProfile.id) {
        return { attachmentPath: null, error: "Medical record not found or unauthorized" };
    }

    // Upload the document
    const uploadResult = await uploadMedicalDocument(
        patientProfile.id,
        "medical_record",
        data.fileBase64,
        data.fileName
    );

    if (uploadResult.error || !uploadResult.path) {
        return { attachmentPath: null, error: uploadResult.error || "Upload failed" };
    }

    // Add the path to the attachments array
    const updatedAttachments = [...(record.attachments || []), uploadResult.path];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from("medical_records")
        .update({ attachments: updatedAttachments })
        .eq("id", data.recordId);

    if (updateError) {
        // Try to clean up the uploaded file
        await deleteMedicalDocument(uploadResult.path);
        return { attachmentPath: null, error: updateError.message };
    }

    return { attachmentPath: uploadResult.path };
}

/**
 * Remove an attachment from a medical record
 */
export async function removeMedicalRecordAttachment(data: {
    recordId: string;
    attachmentPath: string;
}): Promise<{ success: boolean; error?: string }> {
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

    // Verify the medical record belongs to this patient
    const { data: recordData } = await supabase
        .from("medical_records")
        .select("id, patient_profile_id, attachments")
        .eq("id", data.recordId)
        .single();

    const record = recordData as { id: string; patient_profile_id: string; attachments: string[] } | null;
    if (!record || record.patient_profile_id !== patientProfile.id) {
        return { success: false, error: "Medical record not found or unauthorized" };
    }

    // Remove the path from the attachments array
    const updatedAttachments = (record.attachments || []).filter(
        (path) => path !== data.attachmentPath
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from("medical_records")
        .update({ attachments: updatedAttachments })
        .eq("id", data.recordId);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    // Delete the file from storage
    const deleteResult = await deleteMedicalDocument(data.attachmentPath);
    if (deleteResult.error) {
        // Log but don't fail - the record is already updated
        console.warn("Failed to delete attachment file:", deleteResult.error);
    }

    return { success: true };
}

/**
 * Get signed URL for viewing a medical record attachment
 */
export async function getMedicalRecordAttachmentUrl(
    attachmentPath: string
): Promise<{ url: string | null; error?: string }> {
    return getMedicalDocumentSignedUrl(attachmentPath);
}

// ============================================
// Doctor Access Functions
// ============================================

export interface PatientHealthSummary {
    patient: {
        id: string;
        full_name: string;
        avatar_url?: string;
        date_of_birth?: string;
        gender?: string;
    };
    allergies: Allergy[];
    conditions: Condition[];
    medicalRecordsCount: number;
    labResultsCount: number;
}

/**
 * Get patient health summary for a doctor (requires active/completed appointment)
 */
export async function getPatientHealthSummaryForDoctor(
    patientProfileId: string
): Promise<{ summary: PatientHealthSummary | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { summary: null, error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { summary: null, error: "Profile not found" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { summary: null, error: "Doctor profile not found" };
    }

    // Verify doctor has a recent appointment with this patient (within last year)
    // This prevents indefinite access to patient records
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: appointmentData } = await supabase
        .from("appointments")
        .select("id")
        .eq("doctor_profile_id", doctorProfile.id)
        .eq("patient_profile_id", patientProfileId)
        .in("status", ["scheduled", "in_waiting_room", "in_progress", "completed"])
        .gte("scheduled_start", oneYearAgo.toISOString())
        .limit(1);

    if (!appointmentData || appointmentData.length === 0) {
        return { summary: null, error: "Unauthorized - no recent appointment relationship" };
    }

    // Get patient profile info
    const { data: patientData } = await supabase
        .from("patient_profiles")
        .select(`
            id,
            profiles!inner (
                id,
                full_name,
                avatar_url,
                date_of_birth,
                gender
            )
        `)
        .eq("id", patientProfileId)
        .single();

    if (!patientData) {
        return { summary: null, error: "Patient not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patient = patientData as any;

    // Get allergies
    const { data: allergies } = await supabase
        .from("allergies")
        .select("*")
        .eq("patient_profile_id", patientProfileId)
        .eq("is_active", true)
        .order("severity", { ascending: false });

    // Get conditions
    const { data: conditions } = await supabase
        .from("conditions")
        .select("*")
        .eq("patient_profile_id", patientProfileId)
        .order("status", { ascending: true });

    // Get record counts
    const { count: recordsCount } = await supabase
        .from("medical_records")
        .select("*", { count: "exact", head: true })
        .eq("patient_profile_id", patientProfileId)
        .eq("is_deleted", false);

    const { count: labCount } = await supabase
        .from("lab_results")
        .select("*", { count: "exact", head: true })
        .eq("patient_profile_id", patientProfileId)
        .eq("is_deleted", false);

    return {
        summary: {
            patient: {
                id: patientProfileId,
                full_name: patient.profiles?.full_name || "Unknown",
                avatar_url: patient.profiles?.avatar_url,
                date_of_birth: patient.profiles?.date_of_birth,
                gender: patient.profiles?.gender,
            },
            allergies: (allergies || []) as Allergy[],
            conditions: (conditions || []) as Condition[],
            medicalRecordsCount: recordsCount || 0,
            labResultsCount: labCount || 0,
        },
    };
}

/**
 * Get patient's medical records for a doctor view
 */
export async function getPatientMedicalRecordsForDoctor(
    patientProfileId: string,
    recordType?: RecordType
): Promise<{ records: MedicalRecord[]; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { records: [], error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { records: [], error: "Profile not found" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { records: [], error: "Doctor profile not found" };
    }

    // Verify doctor has a recent appointment with this patient (within last year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: appointmentData } = await supabase
        .from("appointments")
        .select("id")
        .eq("doctor_profile_id", doctorProfile.id)
        .eq("patient_profile_id", patientProfileId)
        .in("status", ["scheduled", "in_waiting_room", "in_progress", "completed"])
        .gte("scheduled_start", oneYearAgo.toISOString())
        .limit(1);

    if (!appointmentData || appointmentData.length === 0) {
        return { records: [], error: "Unauthorized - no recent appointment relationship" };
    }

    // Build query
    let query = supabase
        .from("medical_records")
        .select("*")
        .eq("patient_profile_id", patientProfileId)
        .eq("is_deleted", false)
        .order("date_recorded", { ascending: false, nullsFirst: false });

    if (recordType) {
        query = query.eq("record_type", recordType);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching patient records:", error);
        return { records: [], error: error.message };
    }

    return { records: (data || []) as MedicalRecord[] };
}

/**
 * Get patient's lab results for a doctor view
 */
export async function getPatientLabResultsForDoctor(
    patientProfileId: string
): Promise<{ results: LabResult[]; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { results: [], error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { results: [], error: "Profile not found" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { results: [], error: "Doctor profile not found" };
    }

    // Verify doctor has an active or recent (within 1 year) appointment with this patient
    // Time-bound access prevents indefinite record access from old appointments
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: appointmentData } = await supabase
        .from("appointments")
        .select("id")
        .eq("doctor_profile_id", doctorProfile.id)
        .eq("patient_profile_id", patientProfileId)
        .in("status", ["scheduled", "in_waiting_room", "in_progress", "completed"])
        .gte("scheduled_start", oneYearAgo.toISOString())
        .limit(1);

    if (!appointmentData || appointmentData.length === 0) {
        return { results: [], error: "Unauthorized - no recent appointment relationship" };
    }

    const { data, error } = await supabase
        .from("lab_results")
        .select("*")
        .eq("patient_profile_id", patientProfileId)
        .eq("is_deleted", false)
        .order("test_date", { ascending: false, nullsFirst: false });

    if (error) {
        console.error("Error fetching patient lab results:", error);
        return { results: [], error: error.message };
    }

    return { results: (data || []) as LabResult[] };
}
