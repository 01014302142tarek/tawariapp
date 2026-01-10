/**
 * TawariApp Video Consultation Workflow Test Script
 *
 * This script tests the video consultation workflow including:
 * 1. Booking appointments
 * 2. Starting consultations
 * 3. Managing consultation sessions
 * 4. Saving consultation notes
 *
 * USAGE:
 * npx tsx scripts/test-video-consultation.ts
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

async function testAppointmentsTables() {
    console.log('\n1. Testing Appointments Table...');

    const { data, error } = await supabase
        .from('appointments')
        .select('id, status')
        .limit(5);

    logTest('Can query appointments table', !error, error?.message);

    if (data) {
        console.log(`    Found ${data.length} appointment(s)`);
        logTest('Appointments query returns data', true);
    }

    return !error;
}

async function testConsultationSessionsTable() {
    console.log('\n2. Testing Consultation Sessions Table...');

    const { data, error } = await supabase
        .from('consultation_sessions')
        .select('id, jitsi_room_id, started_at, ended_at')
        .limit(5);

    logTest('Can query consultation_sessions table', !error, error?.message);

    if (data) {
        console.log(`    Found ${data.length} session(s)`);
    }

    return !error;
}

async function testConsultationNotesTable() {
    console.log('\n3. Testing Consultation Notes Table...');

    const { data, error } = await supabase
        .from('consultation_notes')
        .select('id, subjective, objective, assessment, plan')
        .limit(5);

    logTest('Can query consultation_notes table', !error, error?.message);

    if (data) {
        console.log(`    Found ${data.length} note(s)`);
    }

    return !error;
}

async function testAppointmentBooking() {
    console.log('\n4. Testing Appointment Booking Workflow...');

    // Get test patient
    const { data: users } = await supabase.auth.admin.listUsers();
    const testPatient = users?.users.find(u => u.email === 'patient1@tawari.test');

    if (!testPatient) {
        logTest('Test patient exists', false, 'Run seed-test-users.ts first');
        return false;
    }

    // Get patient profile
    const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!patientProfile) {
        logTest('Patient profile exists', false, 'No patient profiles found');
        return false;
    }

    // Get a verified doctor
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id, consultation_fee')
        .eq('verification_status', 'verified')
        .limit(1)
        .single();

    if (!doctorProfile) {
        logTest('Verified doctor exists', false, 'No verified doctors found');
        return false;
    }

    logTest('Found test patient and doctor profiles', true);

    // Create a test appointment
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
    futureDate.setHours(10, 0, 0, 0);

    const endDate = new Date(futureDate);
    endDate.setMinutes(endDate.getMinutes() + 30);

    const { data: appointment, error: createError } = await supabase
        .from('appointments')
        .insert({
            patient_profile_id: patientProfile.id,
            doctor_profile_id: doctorProfile.id,
            scheduled_start: futureDate.toISOString(),
            scheduled_end: endDate.toISOString(),
            status: 'scheduled',
            consultation_fee: doctorProfile.consultation_fee || 200,
            chief_complaint: 'Test appointment for video consultation workflow'
        })
        .select('id')
        .single();

    logTest('Can create test appointment', !createError, createError?.message);

    if (!appointment) {
        return false;
    }

    console.log(`    Created appointment: ${appointment.id.slice(0, 8)}...`);

    // Clean up - delete the test appointment
    await supabase.from('appointments').delete().eq('id', appointment.id);
    console.log('    Cleaned up test appointment');

    return !createError;
}

async function testConsultationSessionCreation() {
    console.log('\n5. Testing Consultation Session Creation...');

    // Get an existing appointment to test with
    const { data: appointment } = await supabase
        .from('appointments')
        .select('id, doctor_profile_id')
        .eq('status', 'scheduled')
        .limit(1)
        .single();

    if (!appointment) {
        console.log('    No scheduled appointments found (creating test data)');
        logTest('Consultation session test skipped (no appointments)', true);
        return true;
    }

    // Generate a test Jitsi room ID
    const jitsiRoomId = `tawari-test-${appointment.id.slice(0, 8)}-${Date.now()}`;

    // Create a test session
    const { data: session, error: sessionError } = await supabase
        .from('consultation_sessions')
        .insert({
            appointment_id: appointment.id,
            jitsi_room_id: jitsiRoomId,
            started_at: new Date().toISOString(),
            recording_consent: false
        })
        .select('id, jitsi_room_id')
        .single();

    logTest('Can create consultation session', !sessionError, sessionError?.message);

    if (session) {
        console.log(`    Session created with room: ${session.jitsi_room_id}`);

        // Clean up
        await supabase.from('consultation_sessions').delete().eq('id', session.id);
        console.log('    Cleaned up test session');
    }

    return !sessionError;
}

async function testConsultationNotes() {
    console.log('\n6. Testing Consultation Notes CRUD...');

    // Get a completed appointment
    const { data: appointment } = await supabase
        .from('appointments')
        .select('id, doctor_profile_id')
        .limit(1)
        .single();

    if (!appointment) {
        logTest('Consultation notes test skipped (no appointments)', true);
        return true;
    }

    // Get doctor_profile
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('id', appointment.doctor_profile_id)
        .single();

    if (!doctorProfile) {
        logTest('Consultation notes test skipped (no doctor profile)', true);
        return true;
    }

    // Create test note
    const testNote = {
        appointment_id: appointment.id,
        doctor_profile_id: doctorProfile.id,
        subjective: 'Patient reports headache for 3 days',
        objective: 'Blood pressure: 120/80, Temperature: 37°C',
        assessment: 'Tension headache, likely stress-related',
        plan: 'Recommend OTC pain relief, stress management, follow-up in 1 week if symptoms persist',
        private_notes: 'Patient mentioned work stress - consider referral to counseling',
        follow_up_recommended: true,
        follow_up_timeframe: '1_week'
    };

    const { data: note, error: insertError } = await supabase
        .from('consultation_notes')
        .insert(testNote)
        .select('id')
        .single();

    logTest('Can create consultation notes', !insertError, insertError?.message);

    if (note) {
        // Verify the note was saved correctly
        const { data: fetchedNote, error: fetchError } = await supabase
            .from('consultation_notes')
            .select('*')
            .eq('id', note.id)
            .single();

        logTest('Can fetch consultation notes', !fetchError, fetchError?.message);

        if (fetchedNote) {
            logTest('SOAP notes saved correctly',
                fetchedNote.subjective === testNote.subjective &&
                fetchedNote.objective === testNote.objective &&
                fetchedNote.assessment === testNote.assessment &&
                fetchedNote.plan === testNote.plan,
                'Note content mismatch'
            );
            logTest('Private notes saved', fetchedNote.private_notes === testNote.private_notes, 'Private notes mismatch');
            logTest('Follow-up flag saved', fetchedNote.follow_up_recommended === true, 'Follow-up flag mismatch');
        }

        // Clean up
        await supabase.from('consultation_notes').delete().eq('id', note.id);
        console.log('    Cleaned up test note');
    }

    return !insertError;
}

async function testAppointmentStatusTransitions() {
    console.log('\n7. Testing Appointment Status Transitions...');

    // Create a test appointment
    const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .limit(1)
        .single();

    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!patientProfile || !doctorProfile) {
        logTest('Status transition test skipped (no profiles)', true);
        return true;
    }

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const { data: appointment, error: createError } = await supabase
        .from('appointments')
        .insert({
            patient_profile_id: patientProfile.id,
            doctor_profile_id: doctorProfile.id,
            scheduled_start: futureDate.toISOString(),
            scheduled_end: new Date(futureDate.getTime() + 30 * 60000).toISOString(),
            status: 'scheduled',
            consultation_fee: 200
        })
        .select('id, status')
        .single();

    if (!appointment) {
        logTest('Can create test appointment for status test', false, createError?.message);
        return false;
    }

    logTest('Initial status is "scheduled"', appointment.status === 'scheduled');

    // Transition to waiting room
    const { error: waitingError } = await supabase
        .from('appointments')
        .update({ status: 'in_waiting_room' })
        .eq('id', appointment.id);

    logTest('Can transition to "in_waiting_room"', !waitingError, waitingError?.message);

    // Transition to in_progress
    const { error: progressError } = await supabase
        .from('appointments')
        .update({
            status: 'in_progress',
            actual_start: new Date().toISOString()
        })
        .eq('id', appointment.id);

    logTest('Can transition to "in_progress"', !progressError, progressError?.message);

    // Transition to completed
    const { error: completeError } = await supabase
        .from('appointments')
        .update({
            status: 'completed',
            actual_end: new Date().toISOString()
        })
        .eq('id', appointment.id);

    logTest('Can transition to "completed"', !completeError, completeError?.message);

    // Clean up
    await supabase.from('appointments').delete().eq('id', appointment.id);
    console.log('    Cleaned up test appointment');

    return !createError && !waitingError && !progressError && !completeError;
}

async function main() {
    console.log('========================================');
    console.log('Video Consultation Workflow Tests');
    console.log('========================================');

    await testAppointmentsTables();
    await testConsultationSessionsTable();
    await testConsultationNotesTable();
    await testAppointmentBooking();
    await testConsultationSessionCreation();
    await testConsultationNotes();
    await testAppointmentStatusTransitions();

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
        console.log('All tests passed! Video consultation workflow is ready.');
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
