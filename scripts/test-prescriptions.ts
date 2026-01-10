/**
 * TawariApp Prescription Management Test Script
 *
 * This script tests the prescription system including:
 * 1. Prescription creation
 * 2. Prescription status management
 * 3. Renewal request workflow
 * 4. Doctor-patient prescription queries
 *
 * USAGE:
 * npx tsx scripts/test-prescriptions.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Test results tracking
const testResults: { name: string; passed: boolean; error?: string }[] = [];

function logTest(name: string, passed: boolean, error?: string) {
    testResults.push({ name, passed, error });
    if (passed) {
        console.log(`  ✓ ${name}`);
    } else {
        console.log(`  ✗ ${name}: ${error}`);
    }
}

// ============================================
// Test Functions
// ============================================

async function testPrescriptionsTable() {
    console.log('\n1. Testing Prescriptions Table...');

    const { data, error } = await supabase
        .from('prescriptions')
        .select('id, medication_name, dosage, status')
        .limit(10);

    logTest('Can query prescriptions table', !error, error?.message);

    if (data) {
        console.log(`    Found ${data.length} prescription(s)`);
    }

    return !error;
}

async function testRenewalRequestsTable() {
    console.log('\n2. Testing Prescription Renewal Requests Table...');

    const { data, error } = await supabase
        .from('prescription_renewal_requests')
        .select('id, status, created_at')
        .limit(10);

    logTest('Can query prescription_renewal_requests table', !error, error?.message);

    if (data) {
        console.log(`    Found ${data.length} renewal request(s)`);
    }

    return !error;
}

async function testPrescriptionCreation() {
    console.log('\n3. Testing Prescription Creation...');

    // Get a doctor and patient profile
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1)
        .single();

    const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!doctorProfile || !patientProfile) {
        logTest('Doctor and patient profiles exist', false, 'Missing profiles');
        return false;
    }

    // Create prescription
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 3); // Valid for 3 months

    const { data: prescription, error: createError } = await supabase
        .from('prescriptions')
        .insert({
            doctor_profile_id: doctorProfile.id,
            patient_profile_id: patientProfile.id,
            medication_name: 'Test Medication',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '30 days',
            instructions: 'Take with food',
            quantity: 60,
            refills_allowed: 2,
            refills_used: 0,
            is_controlled_substance: false,
            prescribed_at: new Date().toISOString(),
            valid_until: validUntil.toISOString(),
            status: 'active'
        })
        .select('id, medication_name, dosage, status')
        .single();

    logTest('Can create prescription', !createError, createError?.message);

    if (!prescription) {
        return false;
    }

    console.log(`    Created prescription: ${prescription.medication_name} (${prescription.dosage})`);

    // Verify all fields
    logTest('Prescription status is active',
        (prescription as { status: string }).status === 'active',
        `Expected 'active', got '${(prescription as { status: string }).status}'`);

    // Clean up
    await supabase.from('prescriptions').delete().eq('id', prescription.id);
    console.log('    Cleaned up test prescription');

    return !createError;
}

async function testPrescriptionStatusUpdate() {
    console.log('\n4. Testing Prescription Status Updates...');

    // Get profiles
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1)
        .single();

    const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!doctorProfile || !patientProfile) {
        logTest('Profiles exist for status test', false, 'Missing profiles');
        return false;
    }

    // Create prescription
    const { data: prescription, error: createError } = await supabase
        .from('prescriptions')
        .insert({
            doctor_profile_id: doctorProfile.id,
            patient_profile_id: patientProfile.id,
            medication_name: 'Status Test Med',
            dosage: '100mg',
            frequency: 'Daily',
            duration: '14 days',
            status: 'active'
        })
        .select('id')
        .single();

    if (createError || !prescription) {
        logTest('Can create prescription for status test', false, createError?.message);
        return false;
    }

    // Test status transitions
    const statuses = ['completed', 'cancelled'];
    let allUpdatesSuccessful = true;

    for (const status of statuses) {
        const { error: updateError } = await supabase
            .from('prescriptions')
            .update({ status })
            .eq('id', prescription.id);

        logTest(`Can update status to ${status}`, !updateError, updateError?.message);

        if (updateError) {
            allUpdatesSuccessful = false;
        }

        // Verify
        const { data: updated } = await supabase
            .from('prescriptions')
            .select('status')
            .eq('id', prescription.id)
            .single();

        if ((updated as { status: string } | null)?.status !== status) {
            logTest(`Status is ${status}`, false, `Got ${(updated as { status: string } | null)?.status}`);
            allUpdatesSuccessful = false;
        }
    }

    // Clean up
    await supabase.from('prescriptions').delete().eq('id', prescription.id);
    console.log('    Cleaned up test prescription');

    return allUpdatesSuccessful;
}

async function testRenewalRequestCreation() {
    console.log('\n5. Testing Renewal Request Creation...');

    // Get profiles
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1)
        .single();

    const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!doctorProfile || !patientProfile) {
        logTest('Profiles exist for renewal test', false, 'Missing profiles');
        return false;
    }

    // Create prescription first
    const { data: prescription, error: rxError } = await supabase
        .from('prescriptions')
        .insert({
            doctor_profile_id: doctorProfile.id,
            patient_profile_id: patientProfile.id,
            medication_name: 'Renewal Test Med',
            dosage: '250mg',
            frequency: 'Daily',
            status: 'active'
        })
        .select('id')
        .single();

    if (rxError || !prescription) {
        logTest('Can create prescription for renewal', false, rxError?.message);
        return false;
    }

    // Create renewal request
    const { data: request, error: createError } = await supabase
        .from('prescription_renewal_requests')
        .insert({
            original_prescription_id: prescription.id,
            patient_profile_id: patientProfile.id,
            doctor_profile_id: doctorProfile.id,
            request_notes: 'Need refill - running low',
            status: 'pending'
        })
        .select('id, status')
        .single();

    logTest('Can create renewal request', !createError, createError?.message);

    if (!request) {
        await supabase.from('prescriptions').delete().eq('id', prescription.id);
        return false;
    }

    logTest('Renewal request status is pending',
        (request as { status: string }).status === 'pending',
        `Expected 'pending', got '${(request as { status: string }).status}'`);

    console.log(`    Created renewal request: ${request.id.slice(0, 8)}...`);

    // Clean up (order matters due to FK)
    await supabase.from('prescription_renewal_requests').delete().eq('id', request.id);
    await supabase.from('prescriptions').delete().eq('id', prescription.id);
    console.log('    Cleaned up test renewal request and prescription');

    return !createError;
}

async function testRenewalRequestApproval() {
    console.log('\n6. Testing Renewal Request Approval...');

    // Get profiles
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1)
        .single();

    const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!doctorProfile || !patientProfile) {
        logTest('Profiles exist for approval test', false, 'Missing profiles');
        return false;
    }

    // Create prescription
    const { data: prescription, error: rxError } = await supabase
        .from('prescriptions')
        .insert({
            doctor_profile_id: doctorProfile.id,
            patient_profile_id: patientProfile.id,
            medication_name: 'Approval Test Med',
            dosage: '100mg',
            frequency: 'Daily',
            status: 'active'
        })
        .select('id')
        .single();

    if (rxError || !prescription) {
        logTest('Can create prescription', false, rxError?.message);
        return false;
    }

    // Create renewal request
    const { data: request, error: reqError } = await supabase
        .from('prescription_renewal_requests')
        .insert({
            original_prescription_id: prescription.id,
            patient_profile_id: patientProfile.id,
            doctor_profile_id: doctorProfile.id,
            status: 'pending'
        })
        .select('id')
        .single();

    if (reqError || !request) {
        await supabase.from('prescriptions').delete().eq('id', prescription.id);
        logTest('Can create renewal request', false, reqError?.message);
        return false;
    }

    // Approve the request
    const { error: approveError } = await supabase
        .from('prescription_renewal_requests')
        .update({
            status: 'approved',
            doctor_response: 'Approved for 3 more months',
            responded_at: new Date().toISOString()
        })
        .eq('id', request.id);

    logTest('Can approve renewal request', !approveError, approveError?.message);

    // Verify status
    const { data: approved } = await supabase
        .from('prescription_renewal_requests')
        .select('status, doctor_response')
        .eq('id', request.id)
        .single();

    logTest('Renewal status is approved',
        (approved as { status: string } | null)?.status === 'approved',
        `Got ${(approved as { status: string } | null)?.status}`);

    logTest('Doctor response saved',
        !!(approved as { doctor_response: string } | null)?.doctor_response,
        'Response not saved');

    // Clean up
    await supabase.from('prescription_renewal_requests').delete().eq('id', request.id);
    await supabase.from('prescriptions').delete().eq('id', prescription.id);
    console.log('    Cleaned up test data');

    return !approveError;
}

async function testRenewalRequestDenial() {
    console.log('\n7. Testing Renewal Request Denial...');

    // Get profiles
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1)
        .single();

    const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!doctorProfile || !patientProfile) {
        logTest('Profiles exist', false, 'Missing profiles');
        return false;
    }

    // Create prescription and renewal request
    const { data: prescription } = await supabase
        .from('prescriptions')
        .insert({
            doctor_profile_id: doctorProfile.id,
            patient_profile_id: patientProfile.id,
            medication_name: 'Denial Test Med',
            dosage: '50mg',
            status: 'active'
        })
        .select('id')
        .single();

    if (!prescription) {
        return false;
    }

    const { data: request } = await supabase
        .from('prescription_renewal_requests')
        .insert({
            original_prescription_id: prescription.id,
            patient_profile_id: patientProfile.id,
            doctor_profile_id: doctorProfile.id,
            status: 'pending'
        })
        .select('id')
        .single();

    if (!request) {
        await supabase.from('prescriptions').delete().eq('id', prescription.id);
        return false;
    }

    // Deny the request
    const { error: denyError } = await supabase
        .from('prescription_renewal_requests')
        .update({
            status: 'denied',
            doctor_response: 'Please schedule a follow-up consultation',
            responded_at: new Date().toISOString()
        })
        .eq('id', request.id);

    logTest('Can deny renewal request', !denyError, denyError?.message);

    // Verify
    const { data: denied } = await supabase
        .from('prescription_renewal_requests')
        .select('status')
        .eq('id', request.id)
        .single();

    logTest('Renewal status is denied',
        (denied as { status: string } | null)?.status === 'denied',
        `Got ${(denied as { status: string } | null)?.status}`);

    // Clean up
    await supabase.from('prescription_renewal_requests').delete().eq('id', request.id);
    await supabase.from('prescriptions').delete().eq('id', prescription.id);
    console.log('    Cleaned up test data');

    return !denyError;
}

async function testControlledSubstanceFlag() {
    console.log('\n8. Testing Controlled Substance Tracking...');

    // Get profiles
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1)
        .single();

    const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!doctorProfile || !patientProfile) {
        logTest('Profiles exist', false, 'Missing profiles');
        return false;
    }

    // Create controlled substance prescription
    const { data: prescription, error: createError } = await supabase
        .from('prescriptions')
        .insert({
            doctor_profile_id: doctorProfile.id,
            patient_profile_id: patientProfile.id,
            medication_name: 'Controlled Test Med',
            dosage: '10mg',
            is_controlled_substance: true,
            refills_allowed: 0, // No refills for controlled substances
            status: 'active'
        })
        .select('id, is_controlled_substance, refills_allowed')
        .single();

    logTest('Can create controlled substance prescription', !createError, createError?.message);

    if (prescription) {
        logTest('Controlled substance flag is true',
            (prescription as { is_controlled_substance: boolean }).is_controlled_substance === true,
            'Flag not set correctly');

        logTest('No refills allowed for controlled substance',
            (prescription as { refills_allowed: number }).refills_allowed === 0,
            'Refills should be 0');

        console.log(`    Created controlled substance prescription: ${prescription.id.slice(0, 8)}...`);

        // Clean up
        await supabase.from('prescriptions').delete().eq('id', prescription.id);
        console.log('    Cleaned up test prescription');
    }

    return !createError;
}

async function testRefillTracking() {
    console.log('\n9. Testing Refill Tracking...');

    // Get profiles
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1)
        .single();

    const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!doctorProfile || !patientProfile) {
        logTest('Profiles exist', false, 'Missing profiles');
        return false;
    }

    // Create prescription with refills
    const { data: prescription, error: createError } = await supabase
        .from('prescriptions')
        .insert({
            doctor_profile_id: doctorProfile.id,
            patient_profile_id: patientProfile.id,
            medication_name: 'Refill Test Med',
            dosage: '100mg',
            refills_allowed: 3,
            refills_used: 0,
            status: 'active'
        })
        .select('id')
        .single();

    if (createError || !prescription) {
        logTest('Can create prescription with refills', false, createError?.message);
        return false;
    }

    // Simulate using a refill
    const { error: updateError } = await supabase
        .from('prescriptions')
        .update({ refills_used: 1 })
        .eq('id', prescription.id);

    logTest('Can increment refills_used', !updateError, updateError?.message);

    // Verify
    const { data: updated } = await supabase
        .from('prescriptions')
        .select('refills_used, refills_allowed')
        .eq('id', prescription.id)
        .single();

    logTest('Refills_used incremented correctly',
        (updated as { refills_used: number } | null)?.refills_used === 1,
        `Expected 1, got ${(updated as { refills_used: number } | null)?.refills_used}`);

    const remaining = ((updated as { refills_allowed: number }).refills_allowed) -
                      ((updated as { refills_used: number }).refills_used);
    console.log(`    Refills remaining: ${remaining} of ${(updated as { refills_allowed: number }).refills_allowed}`);

    // Clean up
    await supabase.from('prescriptions').delete().eq('id', prescription.id);
    console.log('    Cleaned up test prescription');

    return !updateError;
}

async function testPrescriptionQueries() {
    console.log('\n10. Testing Prescription Queries...');

    // Get a doctor profile
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!doctorProfile) {
        logTest('Doctor profile exists', false, 'No doctor profiles found');
        return false;
    }

    // Query prescriptions by doctor
    const { data: doctorRx, error: doctorError } = await supabase
        .from('prescriptions')
        .select('id, medication_name, status')
        .eq('doctor_profile_id', doctorProfile.id)
        .limit(5);

    logTest('Can query prescriptions by doctor', !doctorError, doctorError?.message);
    console.log(`    Found ${doctorRx?.length || 0} prescriptions for doctor`);

    // Query active prescriptions
    const { data: activeRx, error: activeError } = await supabase
        .from('prescriptions')
        .select('id, medication_name')
        .eq('status', 'active')
        .limit(5);

    logTest('Can query active prescriptions', !activeError, activeError?.message);
    console.log(`    Found ${activeRx?.length || 0} active prescriptions`);

    // Query with joins
    const { data: joinedRx, error: joinError } = await supabase
        .from('prescriptions')
        .select(`
            id,
            medication_name,
            patient_profiles!inner (
                id,
                profiles!inner (
                    full_name
                )
            )
        `)
        .limit(3);

    logTest('Can query prescriptions with patient join', !joinError, joinError?.message);

    if (joinedRx && joinedRx.length > 0) {
        console.log(`    Sample prescription with patient name loaded successfully`);
    }

    return !doctorError && !activeError && !joinError;
}

// ============================================
// Main Test Runner
// ============================================

async function main() {
    console.log('========================================');
    console.log('Prescription Management System Tests');
    console.log('========================================');

    await testPrescriptionsTable();
    await testRenewalRequestsTable();
    await testPrescriptionCreation();
    await testPrescriptionStatusUpdate();
    await testRenewalRequestCreation();
    await testRenewalRequestApproval();
    await testRenewalRequestDenial();
    await testControlledSubstanceFlag();
    await testRefillTracking();
    await testPrescriptionQueries();

    // Summary
    console.log('\n========================================');
    console.log('Test Summary');
    console.log('========================================');

    const passed = testResults.filter(t => t.passed).length;
    const failed = testResults.filter(t => !t.passed).length;
    const total = testResults.length;

    console.log(`\nTotal: ${total} tests`);
    console.log(`Passed: ${passed} ✓`);
    console.log(`Failed: ${failed} ✗`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
        console.log('\nFailed Tests:');
        testResults.filter(t => !t.passed).forEach(t => {
            console.log(`  - ${t.name}: ${t.error}`);
        });
    }

    console.log('\n========================================');
    if (failed === 0) {
        console.log('All tests passed! Prescription system is working correctly.');
    } else {
        console.log('Some tests failed. Please review the errors above.');
    }
    console.log('========================================');

    process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
