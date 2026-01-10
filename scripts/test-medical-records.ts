/**
 * Medical Records System Integration Tests
 *
 * Tests the medical records functionality including:
 * - Medical records CRUD
 * - Allergies CRUD
 * - Conditions CRUD
 * - Lab results CRUD
 * - Health data summary
 *
 * Run with: npx tsx scripts/test-medical-records.ts
 */

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key for testing
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl) {
    console.error("❌ SUPABASE_URL environment variable is required");
    process.exit(1);
}

if (!supabaseServiceKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test results tracking
let passed = 0;
let failed = 0;

function log(message: string) {
    console.log(message);
}

function success(test: string) {
    passed++;
    log(`  ✅ ${test}`);
}

function fail(test: string, error?: unknown) {
    failed++;
    log(`  ❌ ${test}`);
    if (error) {
        log(`     Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Helper to get test patient
async function getTestPatient() {
    const { data: patientAuth } = await supabase.auth.admin.listUsers();
    const patientUser = patientAuth?.users?.find(u => u.email === "patient1@tawari.test");

    if (!patientUser) {
        throw new Error("Test patient not found. Run seed script first.");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("user_id", patientUser.id)
        .single();

    if (!profile) {
        throw new Error("Patient profile not found.");
    }

    const { data: patientProfile } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    if (!patientProfile) {
        throw new Error("Patient profile record not found.");
    }

    return { profile, patientProfile };
}

// Clean up test data
async function cleanupTestData(patientProfileId: string) {
    // Clean up medical records
    await supabase
        .from("medical_records")
        .delete()
        .eq("patient_profile_id", patientProfileId)
        .like("title", "Test%");

    // Clean up allergies
    await supabase
        .from("allergies")
        .delete()
        .eq("patient_profile_id", patientProfileId)
        .like("allergen", "Test%");

    // Clean up conditions
    await supabase
        .from("conditions")
        .delete()
        .eq("patient_profile_id", patientProfileId)
        .like("condition_name", "Test%");

    // Clean up lab results
    await supabase
        .from("lab_results")
        .delete()
        .eq("patient_profile_id", patientProfileId)
        .like("test_name", "Test%");
}

// ============================================
// Medical Records Tests
// ============================================

async function testMedicalRecordsTable() {
    log("\n📋 Testing: Medical Records Table");

    const { patientProfile } = await getTestPatient();

    const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .eq("patient_profile_id", patientProfile.id);

    if (error) {
        fail("Query medical_records table", error);
    } else {
        success(`Query medical_records table (found ${data?.length || 0} records)`);
    }
}

async function testCreateMedicalRecord() {
    log("\n📋 Testing: Create Medical Record");

    const { profile, patientProfile } = await getTestPatient();

    // Create a general medical record
    const { data: record, error: createError } = await supabase
        .from("medical_records")
        .insert({
            patient_profile_id: patientProfile.id,
            record_type: "general",
            title: "Test Medical Record",
            description: "This is a test medical record for integration testing.",
            date_recorded: new Date().toISOString().split("T")[0],
            recorded_by: profile.id,
            is_self_reported: true,
            attachments: [],
            is_deleted: false,
        })
        .select()
        .single();

    if (createError) {
        fail("Create medical record", createError);
        return;
    }
    success("Create medical record");

    // Verify the record was created correctly
    if (record.record_type === "general" && record.title === "Test Medical Record") {
        success("Medical record has correct data");
    } else {
        fail("Medical record has incorrect data");
    }
}

async function testMedicalRecordTypes() {
    log("\n📋 Testing: Medical Record Types");

    const { profile, patientProfile } = await getTestPatient();

    const recordTypes = [
        { type: "chronic_condition", title: "Test Chronic Condition" },
        { type: "surgical_history", title: "Test Surgical History" },
        { type: "family_history", title: "Test Family History" },
    ];

    for (const { type, title } of recordTypes) {
        const { error } = await supabase
            .from("medical_records")
            .insert({
                patient_profile_id: patientProfile.id,
                record_type: type,
                title,
                recorded_by: profile.id,
                is_self_reported: true,
                attachments: [],
                is_deleted: false,
            });

        if (error) {
            fail(`Create ${type} record`, error);
        } else {
            success(`Create ${type} record`);
        }
    }
}

async function testSoftDeleteMedicalRecord() {
    log("\n📋 Testing: Soft Delete Medical Record");

    const { profile, patientProfile } = await getTestPatient();

    // Create a record to delete
    const { data: record, error: createError } = await supabase
        .from("medical_records")
        .insert({
            patient_profile_id: patientProfile.id,
            record_type: "general",
            title: "Test Record for Deletion",
            recorded_by: profile.id,
            is_self_reported: true,
            attachments: [],
            is_deleted: false,
        })
        .select("id")
        .single();

    if (createError || !record) {
        fail("Create record for deletion test", createError);
        return;
    }

    // Soft delete
    const { error: deleteError } = await supabase
        .from("medical_records")
        .update({ is_deleted: true })
        .eq("id", record.id);

    if (deleteError) {
        fail("Soft delete medical record", deleteError);
        return;
    }
    success("Soft delete medical record");

    // Verify it's excluded from active records query
    const { data: activeRecords } = await supabase
        .from("medical_records")
        .select("id")
        .eq("patient_profile_id", patientProfile.id)
        .eq("is_deleted", false)
        .eq("id", record.id);

    if (!activeRecords || activeRecords.length === 0) {
        success("Deleted record excluded from active query");
    } else {
        fail("Deleted record still appears in active query");
    }
}

// ============================================
// Allergies Tests
// ============================================

async function testAllergiesTable() {
    log("\n🤧 Testing: Allergies Table");

    const { patientProfile } = await getTestPatient();

    const { data, error } = await supabase
        .from("allergies")
        .select("*")
        .eq("patient_profile_id", patientProfile.id);

    if (error) {
        fail("Query allergies table", error);
    } else {
        success(`Query allergies table (found ${data?.length || 0} allergies)`);
    }
}

async function testCreateAllergy() {
    log("\n🤧 Testing: Create Allergy");

    const { patientProfile } = await getTestPatient();

    const { data: allergy, error: createError } = await supabase
        .from("allergies")
        .insert({
            patient_profile_id: patientProfile.id,
            allergen: "Test Penicillin",
            severity: "severe",
            reaction: "Anaphylaxis",
            diagnosed_date: "2020-01-15",
            is_active: true,
        })
        .select()
        .single();

    if (createError) {
        fail("Create allergy", createError);
        return;
    }
    success("Create allergy");

    if (allergy.severity === "severe" && allergy.allergen === "Test Penicillin") {
        success("Allergy has correct data");
    } else {
        fail("Allergy has incorrect data");
    }
}

async function testAllergySeverityLevels() {
    log("\n🤧 Testing: Allergy Severity Levels");

    const { patientProfile } = await getTestPatient();

    const severities = ["mild", "moderate", "severe"];

    for (const severity of severities) {
        const { error } = await supabase
            .from("allergies")
            .insert({
                patient_profile_id: patientProfile.id,
                allergen: `Test ${severity} Allergy`,
                severity,
                is_active: true,
            });

        if (error) {
            fail(`Create ${severity} severity allergy`, error);
        } else {
            success(`Create ${severity} severity allergy`);
        }
    }
}

async function testDeactivateAllergy() {
    log("\n🤧 Testing: Deactivate Allergy");

    const { patientProfile } = await getTestPatient();

    // Create an active allergy
    const { data: allergy, error: createError } = await supabase
        .from("allergies")
        .insert({
            patient_profile_id: patientProfile.id,
            allergen: "Test Allergy to Deactivate",
            is_active: true,
        })
        .select("id")
        .single();

    if (createError || !allergy) {
        fail("Create allergy for deactivation test", createError);
        return;
    }

    // Deactivate
    const { error: updateError } = await supabase
        .from("allergies")
        .update({ is_active: false })
        .eq("id", allergy.id);

    if (updateError) {
        fail("Deactivate allergy", updateError);
        return;
    }
    success("Deactivate allergy");

    // Verify
    const { data: updated } = await supabase
        .from("allergies")
        .select("is_active")
        .eq("id", allergy.id)
        .single();

    if (updated && !updated.is_active) {
        success("Allergy is_active flag updated correctly");
    } else {
        fail("Allergy is_active flag not updated");
    }
}

// ============================================
// Conditions Tests
// ============================================

async function testConditionsTable() {
    log("\n💊 Testing: Conditions Table");

    const { patientProfile } = await getTestPatient();

    const { data, error } = await supabase
        .from("conditions")
        .select("*")
        .eq("patient_profile_id", patientProfile.id);

    if (error) {
        fail("Query conditions table", error);
    } else {
        success(`Query conditions table (found ${data?.length || 0} conditions)`);
    }
}

async function testCreateCondition() {
    log("\n💊 Testing: Create Condition");

    const { patientProfile } = await getTestPatient();

    const { data: condition, error: createError } = await supabase
        .from("conditions")
        .insert({
            patient_profile_id: patientProfile.id,
            condition_name: "Test Hypertension",
            icd_code: "I10",
            diagnosed_date: "2022-06-15",
            status: "active",
            notes: "Managed with medication",
        })
        .select()
        .single();

    if (createError) {
        fail("Create condition", createError);
        return;
    }
    success("Create condition");

    if (condition.condition_name === "Test Hypertension" && condition.icd_code === "I10") {
        success("Condition has correct data with ICD code");
    } else {
        fail("Condition has incorrect data");
    }
}

async function testConditionStatusTransitions() {
    log("\n💊 Testing: Condition Status Transitions");

    const { patientProfile } = await getTestPatient();

    // Create an active condition
    const { data: condition, error: createError } = await supabase
        .from("conditions")
        .insert({
            patient_profile_id: patientProfile.id,
            condition_name: "Test Condition for Status Test",
            status: "active",
        })
        .select("id")
        .single();

    if (createError || !condition) {
        fail("Create condition for status test", createError);
        return;
    }

    // Transition to managed
    const { error: managedError } = await supabase
        .from("conditions")
        .update({ status: "managed" })
        .eq("id", condition.id);

    if (managedError) {
        fail("Transition to managed status", managedError);
    } else {
        success("Transition to managed status");
    }

    // Transition to resolved
    const { error: resolvedError } = await supabase
        .from("conditions")
        .update({ status: "resolved" })
        .eq("id", condition.id);

    if (resolvedError) {
        fail("Transition to resolved status", resolvedError);
    } else {
        success("Transition to resolved status");
    }
}

async function testActiveConditionsCount() {
    log("\n💊 Testing: Active Conditions Count");

    const { patientProfile } = await getTestPatient();

    // Create multiple conditions with different statuses
    await supabase.from("conditions").insert([
        { patient_profile_id: patientProfile.id, condition_name: "Test Active 1", status: "active" },
        { patient_profile_id: patientProfile.id, condition_name: "Test Active 2", status: "active" },
        { patient_profile_id: patientProfile.id, condition_name: "Test Managed", status: "managed" },
        { patient_profile_id: patientProfile.id, condition_name: "Test Resolved", status: "resolved" },
    ]);

    // Count active conditions
    const { count, error } = await supabase
        .from("conditions")
        .select("*", { count: "exact", head: true })
        .eq("patient_profile_id", patientProfile.id)
        .eq("status", "active")
        .like("condition_name", "Test%");

    if (error) {
        fail("Count active conditions", error);
    } else if (count && count >= 2) {
        success(`Count active conditions (found ${count} active)`);
    } else {
        fail(`Count active conditions - expected at least 2, got ${count}`);
    }
}

// ============================================
// Lab Results Tests
// ============================================

async function testLabResultsTable() {
    log("\n🧪 Testing: Lab Results Table");

    const { patientProfile } = await getTestPatient();

    const { data, error } = await supabase
        .from("lab_results")
        .select("*")
        .eq("patient_profile_id", patientProfile.id);

    if (error) {
        fail("Query lab_results table", error);
    } else {
        success(`Query lab_results table (found ${data?.length || 0} results)`);
    }
}

async function testCreateLabResult() {
    log("\n🧪 Testing: Create Lab Result");

    const { profile, patientProfile } = await getTestPatient();

    const { data: labResult, error: createError } = await supabase
        .from("lab_results")
        .insert({
            patient_profile_id: patientProfile.id,
            test_name: "Test Complete Blood Count",
            test_date: "2024-01-10",
            lab_name: "Test Lab Cairo",
            results_summary: "WBC: 7.5, RBC: 4.8, Hgb: 14.2",
            uploaded_by: profile.id,
            is_deleted: false,
        })
        .select()
        .single();

    if (createError) {
        fail("Create lab result", createError);
        return;
    }
    success("Create lab result");

    if (labResult.test_name === "Test Complete Blood Count" && labResult.lab_name === "Test Lab Cairo") {
        success("Lab result has correct data");
    } else {
        fail("Lab result has incorrect data");
    }
}

async function testLabResultWithDocument() {
    log("\n🧪 Testing: Lab Result with Document URL");

    const { profile, patientProfile } = await getTestPatient();

    const { data: labResult, error: createError } = await supabase
        .from("lab_results")
        .insert({
            patient_profile_id: patientProfile.id,
            test_name: "Test Blood Test with Document",
            test_date: "2024-01-15",
            document_url: "medical_documents/test/blood_test.pdf",
            uploaded_by: profile.id,
            is_deleted: false,
        })
        .select()
        .single();

    if (createError) {
        fail("Create lab result with document URL", createError);
        return;
    }
    success("Create lab result with document URL");

    if (labResult.document_url) {
        success("Document URL is stored");
    } else {
        fail("Document URL not stored");
    }
}

async function testSoftDeleteLabResult() {
    log("\n🧪 Testing: Soft Delete Lab Result");

    const { profile, patientProfile } = await getTestPatient();

    // Create a lab result to delete
    const { data: labResult, error: createError } = await supabase
        .from("lab_results")
        .insert({
            patient_profile_id: patientProfile.id,
            test_name: "Test Lab Result for Deletion",
            test_date: "2024-01-20",
            uploaded_by: profile.id,
            is_deleted: false,
        })
        .select("id")
        .single();

    if (createError || !labResult) {
        fail("Create lab result for deletion test", createError);
        return;
    }

    // Soft delete
    const { error: deleteError } = await supabase
        .from("lab_results")
        .update({ is_deleted: true })
        .eq("id", labResult.id);

    if (deleteError) {
        fail("Soft delete lab result", deleteError);
        return;
    }
    success("Soft delete lab result");

    // Verify it's excluded
    const { data: activeResults } = await supabase
        .from("lab_results")
        .select("id")
        .eq("patient_profile_id", patientProfile.id)
        .eq("is_deleted", false)
        .eq("id", labResult.id);

    if (!activeResults || activeResults.length === 0) {
        success("Deleted lab result excluded from active query");
    } else {
        fail("Deleted lab result still appears in active query");
    }
}

// ============================================
// Health Data Summary Tests
// ============================================

async function testHealthDataSummary() {
    log("\n📊 Testing: Health Data Summary");

    const { patientProfile } = await getTestPatient();

    // Get counts in parallel
    const [recordsResult, allergiesResult, conditionsResult, labResult] = await Promise.all([
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
    ]);

    if (recordsResult.error || allergiesResult.error || conditionsResult.error || labResult.error) {
        fail("Get health data summary counts");
    } else {
        success("Get health data summary counts");
        log(`     Records: ${recordsResult.count}, Allergies: ${allergiesResult.count}, Conditions: ${conditionsResult.count}, Lab Results: ${labResult.count}`);
    }
}

// ============================================
// Main Test Runner
// ============================================

async function runTests() {
    log("🏥 Medical Records System Integration Tests");
    log("============================================\n");

    try {
        const { profile, patientProfile } = await getTestPatient();
        log(`Using test patient: ${profile.full_name} (${patientProfile.id})`);

        // Clean up any existing test data
        await cleanupTestData(patientProfile.id);

        // Run all tests
        await testMedicalRecordsTable();
        await testCreateMedicalRecord();
        await testMedicalRecordTypes();
        await testSoftDeleteMedicalRecord();

        await testAllergiesTable();
        await testCreateAllergy();
        await testAllergySeverityLevels();
        await testDeactivateAllergy();

        await testConditionsTable();
        await testCreateCondition();
        await testConditionStatusTransitions();
        await testActiveConditionsCount();

        await testLabResultsTable();
        await testCreateLabResult();
        await testLabResultWithDocument();
        await testSoftDeleteLabResult();

        await testHealthDataSummary();

        // Cleanup
        log("\n🧹 Cleaning up test data...");
        await cleanupTestData(patientProfile.id);
        success("Test data cleaned up");

    } catch (error) {
        fail("Test setup failed", error);
    }

    // Summary
    log("\n============================================");
    log(`📊 Results: ${passed} passed, ${failed} failed`);
    log("============================================");

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
