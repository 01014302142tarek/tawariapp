"use server";

import { createClient } from "@/lib/supabase/server";

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
