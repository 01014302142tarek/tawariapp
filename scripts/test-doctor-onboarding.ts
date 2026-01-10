/**
 * TawariApp Doctor Onboarding Integration Test Script
 *
 * This script tests the complete doctor onboarding flow including:
 * 1. Avatar upload to storage
 * 2. Credential document upload to storage
 * 3. Credential record saving to database
 * 4. Complete onboarding profile data saving
 *
 * USAGE:
 * npx tsx scripts/test-doctor-onboarding.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables.');
    console.error('Required: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
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

// Create a simple test image as base64 (1x1 pixel PNG)
function createTestImageBase64(): string {
    // Minimal valid PNG (1x1 transparent pixel)
    const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
        0x42, 0x60, 0x82
    ]);
    return `data:image/png;base64,${pngData.toString('base64')}`;
}

// Create a simple test PDF as base64
function createTestPdfBase64(): string {
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer
<< /Size 4 /Root 1 0 R >>
startxref
196
%%EOF`;
    return `data:application/pdf;base64,${Buffer.from(pdfContent).toString('base64')}`;
}

async function testStorageBuckets() {
    console.log('\n1. Testing Storage Buckets...');

    // Test avatars bucket exists
    const { error: avatarsError } = await supabase.storage.getBucket('avatars');
    logTest('Avatars bucket exists', !avatarsError, avatarsError?.message);

    // Test credentials bucket exists
    const { error: credentialsError } = await supabase.storage.getBucket('credentials');
    logTest('Credentials bucket exists', !credentialsError, credentialsError?.message);

    return !avatarsError && !credentialsError;
}

async function testAvatarUpload(userId: string) {
    console.log('\n2. Testing Avatar Upload...');

    const testImage = createTestImageBase64();
    const base64Data = testImage.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = `${userId}/avatar.png`;

    // Upload test avatar
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, buffer, {
            contentType: 'image/png',
            upsert: true
        });

    logTest('Avatar upload succeeds', !uploadError, uploadError?.message);

    if (uploadError) return false;

    // Verify file exists
    const { data: files } = await supabase.storage.from('avatars').list(userId);
    const avatarExists = files?.some(f => f.name === 'avatar.png');
    logTest('Avatar file exists in storage', !!avatarExists, 'File not found');

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    logTest('Avatar public URL generated', !!publicUrl, 'No URL');

    // Clean up
    await supabase.storage.from('avatars').remove([filePath]);

    return true;
}

async function testCredentialUpload(doctorProfileId: string) {
    console.log('\n3. Testing Credential Upload...');

    const testPdf = createTestPdfBase64();
    const base64Data = testPdf.replace(/^data:application\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const timestamp = Date.now();
    const filePath = `${doctorProfileId}/license/${timestamp}_test_license.pdf`;

    // Upload test credential
    const { error: uploadError } = await supabase.storage
        .from('credentials')
        .upload(filePath, buffer, {
            contentType: 'application/pdf',
            upsert: false
        });

    logTest('Credential upload succeeds', !uploadError, uploadError?.message);

    if (uploadError) return { success: false, path: '' };

    // Verify file exists
    const { data: files } = await supabase.storage.from('credentials').list(`${doctorProfileId}/license`);
    const credentialExists = files?.some(f => f.name.includes('test_license.pdf'));
    logTest('Credential file exists in storage', !!credentialExists, 'File not found');

    // Clean up
    await supabase.storage.from('credentials').remove([filePath]);

    return { success: true, path: filePath };
}

async function testCredentialRecordSaving(doctorProfileId: string) {
    console.log('\n4. Testing Credential Record Saving...');

    const testRecord = {
        doctor_profile_id: doctorProfileId,
        credential_type: 'license', // Valid values: license, degree, certification, id_document
        document_url: 'test/path/to/document.pdf',
        document_name: 'test_document.pdf',
        verification_status: 'pending'
    };

    // Insert test record
    const { data, error: insertError } = await supabase
        .from('doctor_credentials')
        .insert(testRecord)
        .select('id')
        .single();

    logTest('Credential record insert succeeds', !insertError, insertError?.message);

    if (insertError) return false;

    // Verify record exists
    const { data: fetchedRecord, error: fetchError } = await supabase
        .from('doctor_credentials')
        .select('*')
        .eq('id', data.id)
        .single();

    logTest('Credential record can be fetched', !fetchError && !!fetchedRecord, fetchError?.message);
    logTest('Credential record has correct type', fetchedRecord?.credential_type === 'license', 'Wrong type');
    logTest('Credential record has pending status', fetchedRecord?.verification_status === 'pending', 'Wrong status');

    // Clean up
    await supabase.from('doctor_credentials').delete().eq('id', data.id);

    return true;
}

async function testProfileAvatarUpdate(profileId: string) {
    console.log('\n5. Testing Profile Avatar URL Update...');

    const testAvatarUrl = 'https://example.com/test-avatar.png';

    // Get current avatar URL
    const { data: beforeProfile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', profileId)
        .single();

    const originalAvatarUrl = beforeProfile?.avatar_url;

    // Update avatar URL
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: testAvatarUrl })
        .eq('id', profileId);

    logTest('Profile avatar_url update succeeds', !updateError, updateError?.message);

    // Verify update
    const { data: afterProfile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', profileId)
        .single();

    logTest('Profile avatar_url is updated correctly', afterProfile?.avatar_url === testAvatarUrl, 'URL mismatch');

    // Restore original value
    await supabase
        .from('profiles')
        .update({ avatar_url: originalAvatarUrl })
        .eq('id', profileId);

    return !updateError;
}

async function testDoctorProfileUpdate(doctorProfileId: string) {
    console.log('\n6. Testing Doctor Profile Update (Onboarding Data)...');

    // Get current values
    const { data: beforeProfile } = await supabase
        .from('doctor_profiles')
        .select('license_number, years_of_experience, bio, consultation_fee, verification_status')
        .eq('id', doctorProfileId)
        .single();

    const originalData = { ...beforeProfile };

    // Test update with onboarding data
    const testData = {
        license_number: 'TEST-LICENSE-12345',
        years_of_experience: 10,
        bio: 'Test bio for doctor onboarding',
        consultation_fee: 250.00,
        verification_status: 'pending'
    };

    const { error: updateError } = await supabase
        .from('doctor_profiles')
        .update(testData)
        .eq('id', doctorProfileId);

    logTest('Doctor profile update succeeds', !updateError, updateError?.message);

    // Verify update
    const { data: afterProfile } = await supabase
        .from('doctor_profiles')
        .select('license_number, years_of_experience, bio, consultation_fee, verification_status')
        .eq('id', doctorProfileId)
        .single();

    logTest('License number updated', afterProfile?.license_number === testData.license_number, 'Mismatch');
    logTest('Years of experience updated', afterProfile?.years_of_experience === testData.years_of_experience, 'Mismatch');
    logTest('Bio updated', afterProfile?.bio === testData.bio, 'Mismatch');
    logTest('Consultation fee updated', Number(afterProfile?.consultation_fee) === testData.consultation_fee, 'Mismatch');
    logTest('Verification status set to pending', afterProfile?.verification_status === 'pending', 'Mismatch');

    // Restore original values
    await supabase
        .from('doctor_profiles')
        .update(originalData)
        .eq('id', doctorProfileId);

    return !updateError;
}

async function testSpecializationLinking(doctorProfileId: string) {
    console.log('\n7. Testing Specialization Linking...');

    // Get a specialization
    const { data: specs } = await supabase
        .from('specializations')
        .select('id, name_en')
        .limit(1);

    if (!specs || specs.length === 0) {
        logTest('Specialization exists for testing', false, 'No specializations in database');
        return false;
    }

    const specId = specs[0].id;
    const specName = specs[0].name_en;

    // Check if link already exists
    const { data: existingLink } = await supabase
        .from('doctor_specializations')
        .select('id')
        .eq('doctor_profile_id', doctorProfileId)
        .eq('specialization_id', specId)
        .single();

    if (existingLink) {
        logTest(`Doctor already linked to ${specName}`, true);
        return true;
    }

    // Create link
    const { error: linkError } = await supabase
        .from('doctor_specializations')
        .insert({
            doctor_profile_id: doctorProfileId,
            specialization_id: specId,
            is_primary: false
        });

    logTest(`Specialization link created (${specName})`, !linkError, linkError?.message);

    // Clean up - remove the test link
    if (!linkError) {
        await supabase
            .from('doctor_specializations')
            .delete()
            .eq('doctor_profile_id', doctorProfileId)
            .eq('specialization_id', specId)
            .eq('is_primary', false);
    }

    return !linkError;
}

async function testFullOnboardingFlow() {
    console.log('\n8. Testing Full Onboarding Flow Integration...');

    // This test simulates the complete flow
    // Find an existing test doctor
    const { data: users } = await supabase.auth.admin.listUsers();
    const testDoctor = users?.users.find(u => u.email === 'doctor1@tawari.test');

    if (!testDoctor) {
        logTest('Test doctor exists', false, 'Run seed-test-users.ts first');
        return false;
    }

    // Get their profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', testDoctor.id)
        .single();

    if (!profile) {
        logTest('Doctor profile exists', false, 'Profile not found');
        return false;
    }

    // Get doctor_profile
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

    if (!doctorProfile) {
        logTest('Doctor profile (extended) exists', false, 'Doctor profile not found');
        return false;
    }

    logTest('Test doctor found with complete profile structure', true);

    // Test the flow components
    const avatarOk = await testAvatarUpload(testDoctor.id);
    const credUploadOk = await testCredentialUpload(doctorProfile.id);
    const credRecordOk = await testCredentialRecordSaving(doctorProfile.id);
    const avatarUrlOk = await testProfileAvatarUpdate(profile.id);
    const doctorUpdateOk = await testDoctorProfileUpdate(doctorProfile.id);
    const specLinkOk = await testSpecializationLinking(doctorProfile.id);

    return avatarOk && credUploadOk.success && credRecordOk && avatarUrlOk && doctorUpdateOk && specLinkOk;
}

async function main() {
    console.log('========================================');
    console.log('Doctor Onboarding Integration Tests');
    console.log('========================================');

    // Test 1: Storage buckets exist
    const bucketsOk = await testStorageBuckets();
    if (!bucketsOk) {
        console.log('\n⚠️  Storage buckets not configured. Please create:');
        console.log('   - avatars (public bucket)');
        console.log('   - credentials (private bucket)');
        console.log('\nRun these in Supabase SQL Editor or Dashboard:');
        console.log('   INSERT INTO storage.buckets (id, name, public) VALUES (\'avatars\', \'avatars\', true);');
        console.log('   INSERT INTO storage.buckets (id, name, public) VALUES (\'credentials\', \'credentials\', false);');
    }

    // Run full integration test
    await testFullOnboardingFlow();

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
        console.log('All tests passed! Doctor onboarding is ready.');
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
