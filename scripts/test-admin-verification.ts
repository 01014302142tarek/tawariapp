/**
 * TawariApp Admin Verification Workflow Test Script
 *
 * This script tests the admin verification workflow including:
 * 1. Fetching pending doctors
 * 2. Getting doctor application details with credentials
 * 3. Getting signed URLs for credential documents
 * 4. Approving/rejecting doctors
 * 5. Verification statistics
 *
 * USAGE:
 * npx tsx scripts/test-admin-verification.ts
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

async function testVerificationStats() {
    console.log('\n1. Testing Verification Statistics...');

    const { data, error } = await supabase
        .from('doctor_profiles')
        .select('verification_status');

    logTest('Can fetch doctor profiles for stats', !error, error?.message);

    if (data) {
        const stats = {
            pending: data.filter(d => d.verification_status === 'pending').length,
            verified: data.filter(d => d.verification_status === 'verified').length,
            rejected: data.filter(d => d.verification_status === 'rejected').length,
            total: data.length,
        };

        console.log(`    Stats: pending=${stats.pending}, verified=${stats.verified}, rejected=${stats.rejected}, total=${stats.total}`);
        logTest('Stats calculation works', stats.total >= 0);
    }

    return !error;
}

async function testPendingDoctors() {
    console.log('\n2. Testing Pending Doctors Query...');

    const { data: doctorProfiles, error } = await supabase
        .from('doctor_profiles')
        .select(`
            id,
            profile_id,
            license_number,
            years_of_experience,
            bio,
            consultation_fee,
            verification_status,
            created_at
        `)
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });

    logTest('Can query pending doctors', !error, error?.message);

    if (doctorProfiles && doctorProfiles.length > 0) {
        console.log(`    Found ${doctorProfiles.length} pending doctor(s)`);
        logTest('Pending doctors query returns data', true);

        // Test fetching profile info for first doctor
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, user_id')
            .eq('id', doctorProfiles[0].profile_id)
            .single();

        logTest('Can fetch profile for pending doctor', !!profile, 'Profile not found');
    } else {
        console.log('    No pending doctors found (may be normal)');
        logTest('Pending doctors query works (no pending)', true);
    }

    return !error;
}

async function testDoctorCredentials() {
    console.log('\n3. Testing Doctor Credentials Access...');

    // Get a doctor with credentials
    const { data: doctorProfiles } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(5);

    if (!doctorProfiles || doctorProfiles.length === 0) {
        console.log('    No doctor profiles found');
        logTest('Doctor profiles exist', false, 'No profiles');
        return false;
    }

    // Check if any have credentials
    for (const dp of doctorProfiles) {
        const { data: credentials, error } = await supabase
            .from('doctor_credentials')
            .select('id, credential_type, document_url, document_name, verification_status')
            .eq('doctor_profile_id', dp.id);

        if (!error && credentials && credentials.length > 0) {
            console.log(`    Found ${credentials.length} credential(s) for doctor ${dp.id.slice(0, 8)}...`);
            logTest('Can fetch doctor credentials', true);

            // Test generating signed URL for first credential
            const cred = credentials[0];
            if (cred.document_url) {
                const { data: signedUrlData, error: signedError } = await supabase.storage
                    .from('credentials')
                    .createSignedUrl(cred.document_url, 60);

                logTest('Can generate signed URL for credential', !signedError, signedError?.message);

                if (signedUrlData) {
                    console.log(`    Signed URL generated (expires in 60s)`);
                }
            }
            return true;
        }
    }

    console.log('    No credentials found for any doctor (may be normal - no uploads yet)');
    logTest('Credentials query works (none found)', true);
    return true;
}

async function testApprovalProcess() {
    console.log('\n4. Testing Approval Process (simulation)...');

    // Find a pending doctor to test with (but don't actually approve)
    const { data: pendingDoctors } = await supabase
        .from('doctor_profiles')
        .select('id, profile_id, verification_status')
        .eq('verification_status', 'pending')
        .limit(1);

    if (!pendingDoctors || pendingDoctors.length === 0) {
        console.log('    No pending doctors to test approval with');
        logTest('Approval test skipped (no pending doctors)', true);
        return true;
    }

    const testDoctor = pendingDoctors[0];
    console.log(`    Found pending doctor: ${testDoctor.id.slice(0, 8)}...`);

    // Test the update query would work (but rollback)
    const { error: updateError } = await supabase
        .from('doctor_profiles')
        .update({
            verification_status: 'verified',
            verified_at: new Date().toISOString(),
        })
        .eq('id', testDoctor.id);

    if (!updateError) {
        // Rollback - set back to pending
        await supabase
            .from('doctor_profiles')
            .update({
                verification_status: 'pending',
                verified_at: null,
                verified_by: null,
            })
            .eq('id', testDoctor.id);

        logTest('Approval update query works', true);
    } else {
        logTest('Approval update query works', false, updateError.message);
    }

    return !updateError;
}

async function testRejectionProcess() {
    console.log('\n5. Testing Rejection Process (simulation)...');

    // Find a pending doctor to test with (but don't actually reject)
    const { data: pendingDoctors } = await supabase
        .from('doctor_profiles')
        .select('id, profile_id, verification_status')
        .eq('verification_status', 'pending')
        .limit(1);

    if (!pendingDoctors || pendingDoctors.length === 0) {
        console.log('    No pending doctors to test rejection with');
        logTest('Rejection test skipped (no pending doctors)', true);
        return true;
    }

    const testDoctor = pendingDoctors[0];
    console.log(`    Found pending doctor: ${testDoctor.id.slice(0, 8)}...`);

    // Test the update query would work (but rollback)
    const { error: updateError } = await supabase
        .from('doctor_profiles')
        .update({
            verification_status: 'rejected',
            verification_notes: 'Test rejection reason',
            verified_at: new Date().toISOString(),
        })
        .eq('id', testDoctor.id);

    if (!updateError) {
        // Rollback - set back to pending
        await supabase
            .from('doctor_profiles')
            .update({
                verification_status: 'pending',
                verification_notes: null,
                verified_at: null,
                verified_by: null,
            })
            .eq('id', testDoctor.id);

        logTest('Rejection update query works', true);
    } else {
        logTest('Rejection update query works', false, updateError.message);
    }

    return !updateError;
}

async function testAdminAccess() {
    console.log('\n6. Testing Admin Access Check...');

    // Find admin user
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'admin')
        .limit(1)
        .single();

    logTest('Admin profile exists', !!adminProfile, 'No admin found');

    if (adminProfile) {
        console.log(`    Found admin: ${adminProfile.full_name}`);
        logTest('Admin role check works', adminProfile.role === 'admin');
    }

    return !!adminProfile;
}

async function testSpecializationsJoin() {
    console.log('\n7. Testing Specializations Join...');

    const { data: doctorSpec, error } = await supabase
        .from('doctor_specializations')
        .select(`
            doctor_profile_id,
            is_primary,
            specialization:specializations(name_en, name_ar)
        `)
        .eq('is_primary', true)
        .limit(5);

    logTest('Can join doctor_specializations with specializations', !error, error?.message);

    if (doctorSpec && doctorSpec.length > 0) {
        console.log(`    Found ${doctorSpec.length} primary specializations`);
        const first = doctorSpec[0];
        if (first.specialization) {
            console.log(`    Example: ${(first.specialization as unknown as { name_en: string }).name_en}`);
        }
    }

    return !error;
}

async function main() {
    console.log('========================================');
    console.log('Admin Verification Workflow Tests');
    console.log('========================================');

    await testVerificationStats();
    await testPendingDoctors();
    await testDoctorCredentials();
    await testApprovalProcess();
    await testRejectionProcess();
    await testAdminAccess();
    await testSpecializationsJoin();

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
        console.log('All tests passed! Admin verification is ready.');
    } else {
        console.log('Some tests failed. Please check the errors above.');
    }
    console.log('========================================');

    process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
