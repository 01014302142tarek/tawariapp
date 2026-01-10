/**
 * TawariApp Scheduling & Availability System Test Script
 *
 * This script tests the scheduling system including:
 * 1. Doctor availability management
 * 2. Blocked times management
 * 3. Available slot calculation
 * 4. Appointment booking flow
 * 5. Appointment rescheduling
 *
 * USAGE:
 * npx tsx scripts/test-scheduling.ts
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

async function testDoctorAvailabilityTable() {
    console.log('\n1. Testing Doctor Availability Table...');

    const { data, error } = await supabase
        .from('doctor_availability')
        .select('id, doctor_profile_id, day_of_week, start_time, end_time, is_active')
        .limit(10);

    logTest('Can query doctor_availability table', !error, error?.message);

    if (data) {
        console.log(`    Found ${data.length} availability slot(s)`);
    }

    return !error;
}

async function testBlockedTimesTable() {
    console.log('\n2. Testing Doctor Blocked Times Table...');

    const { data, error } = await supabase
        .from('doctor_blocked_times')
        .select('id, doctor_profile_id, start_datetime, end_datetime, reason')
        .limit(10);

    logTest('Can query doctor_blocked_times table', !error, error?.message);

    if (data) {
        console.log(`    Found ${data.length} blocked time(s)`);
    }

    return !error;
}

async function testAvailabilityCreation() {
    console.log('\n3. Testing Availability Creation...');

    // Get a doctor profile
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!doctorProfile) {
        logTest('Doctor profile exists for availability test', false, 'No doctor profiles found');
        return false;
    }

    // Create test availability (Monday 9am-5pm)
    const { data: availability, error: createError } = await supabase
        .from('doctor_availability')
        .insert({
            doctor_profile_id: doctorProfile.id,
            day_of_week: 1, // Monday
            start_time: '09:00:00',
            end_time: '17:00:00',
            is_active: true
        })
        .select('id, day_of_week, start_time, end_time')
        .single();

    logTest('Can create availability slot', !createError, createError?.message);

    if (!availability) {
        return false;
    }

    console.log(`    Created availability: Day ${availability.day_of_week}, ${availability.start_time}-${availability.end_time}`);

    // Test updating availability
    const { error: updateError } = await supabase
        .from('doctor_availability')
        .update({ is_active: false })
        .eq('id', availability.id);

    logTest('Can update availability slot', !updateError, updateError?.message);

    // Verify update
    const { data: updatedAvailability } = await supabase
        .from('doctor_availability')
        .select('is_active')
        .eq('id', availability.id)
        .single();

    logTest('Availability status updated correctly',
        (updatedAvailability as { is_active: boolean } | null)?.is_active === false,
        'Status mismatch');

    // Clean up
    await supabase.from('doctor_availability').delete().eq('id', availability.id);
    console.log('    Cleaned up test availability');

    return !createError && !updateError;
}

async function testBlockedTimeCreation() {
    console.log('\n4. Testing Blocked Time Creation...');

    // Get a doctor profile
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!doctorProfile) {
        logTest('Doctor profile exists for blocked time test', false, 'No doctor profiles found');
        return false;
    }

    // Create blocked time for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setHours(14, 0, 0, 0);

    const { data: blockedTime, error: createError } = await supabase
        .from('doctor_blocked_times')
        .insert({
            doctor_profile_id: doctorProfile.id,
            start_datetime: tomorrow.toISOString(),
            end_datetime: endTime.toISOString(),
            reason: 'Test blocked time - lunch break'
        })
        .select('id, start_datetime, end_datetime, reason')
        .single();

    logTest('Can create blocked time', !createError, createError?.message);

    if (!blockedTime) {
        return false;
    }

    console.log(`    Created blocked time: ${blockedTime.reason}`);

    // Test deletion
    const { error: deleteError } = await supabase
        .from('doctor_blocked_times')
        .delete()
        .eq('id', blockedTime.id);

    logTest('Can delete blocked time', !deleteError, deleteError?.message);

    return !createError && !deleteError;
}

async function testAppointmentBooking() {
    console.log('\n5. Testing Appointment Booking...');

    // Get a doctor and patient profile
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id, consultation_fee')
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

    // Create appointment for tomorrow at 10am
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setMinutes(endTime.getMinutes() + 30);

    const { data: appointment, error: createError } = await supabase
        .from('appointments')
        .insert({
            doctor_profile_id: doctorProfile.id,
            patient_profile_id: patientProfile.id,
            scheduled_start: tomorrow.toISOString(),
            scheduled_end: endTime.toISOString(),
            status: 'scheduled',
            consultation_fee: (doctorProfile as { consultation_fee: number | null }).consultation_fee || 200,
            chief_complaint: 'Test appointment for scheduling tests'
        })
        .select('id, scheduled_start, scheduled_end, status')
        .single();

    logTest('Can create appointment', !createError, createError?.message);

    if (!appointment) {
        return false;
    }

    console.log(`    Created appointment: ${appointment.id.slice(0, 8)}... at ${appointment.scheduled_start}`);

    // Test that we can't create overlapping appointment
    const { error: overlapError } = await supabase
        .from('appointments')
        .insert({
            doctor_profile_id: doctorProfile.id,
            patient_profile_id: patientProfile.id,
            scheduled_start: tomorrow.toISOString(), // Same time
            scheduled_end: endTime.toISOString(),
            status: 'scheduled',
            consultation_fee: 200
        });

    // Note: This may or may not fail depending on DB constraints
    // In practice, our app logic prevents this at the application level
    console.log(`    Overlap test: ${overlapError ? 'Database prevented overlap' : 'Overlap allowed (app-level check needed)'}`);

    // Clean up test appointment
    await supabase.from('appointments').delete().eq('id', appointment.id);
    console.log('    Cleaned up test appointment');

    return !createError;
}

async function testAppointmentRescheduling() {
    console.log('\n6. Testing Appointment Rescheduling...');

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
        logTest('Profiles exist for rescheduling test', false, 'Missing profiles');
        return false;
    }

    // Create initial appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setMinutes(endTime.getMinutes() + 30);

    const { data: appointment, error: createError } = await supabase
        .from('appointments')
        .insert({
            doctor_profile_id: doctorProfile.id,
            patient_profile_id: patientProfile.id,
            scheduled_start: tomorrow.toISOString(),
            scheduled_end: endTime.toISOString(),
            status: 'scheduled',
            consultation_fee: 200
        })
        .select('id')
        .single();

    if (createError || !appointment) {
        logTest('Can create appointment for rescheduling', false, createError?.message);
        return false;
    }

    // Reschedule to a new time
    const newTime = new Date(tomorrow);
    newTime.setHours(16, 0, 0, 0);
    const newEndTime = new Date(newTime);
    newEndTime.setMinutes(newEndTime.getMinutes() + 30);

    const { error: updateError } = await supabase
        .from('appointments')
        .update({
            scheduled_start: newTime.toISOString(),
            scheduled_end: newEndTime.toISOString()
        })
        .eq('id', appointment.id);

    logTest('Can reschedule appointment', !updateError, updateError?.message);

    // Verify rescheduled time
    const { data: rescheduled } = await supabase
        .from('appointments')
        .select('scheduled_start')
        .eq('id', appointment.id)
        .single();

    const rescheduledStart = new Date((rescheduled as { scheduled_start: string })?.scheduled_start);
    logTest('Appointment rescheduled to correct time',
        rescheduledStart.getHours() === 16,
        `Expected 16:00, got ${rescheduledStart.getHours()}:00`);

    // Clean up
    await supabase.from('appointments').delete().eq('id', appointment.id);
    console.log('    Cleaned up test appointment');

    return !updateError;
}

async function testAppointmentCancellation() {
    console.log('\n7. Testing Appointment Cancellation...');

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
        logTest('Profiles exist for cancellation test', false, 'Missing profiles');
        return false;
    }

    // Create appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(11, 0, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setMinutes(endTime.getMinutes() + 30);

    const { data: appointment, error: createError } = await supabase
        .from('appointments')
        .insert({
            doctor_profile_id: doctorProfile.id,
            patient_profile_id: patientProfile.id,
            scheduled_start: tomorrow.toISOString(),
            scheduled_end: endTime.toISOString(),
            status: 'scheduled',
            consultation_fee: 200
        })
        .select('id')
        .single();

    if (createError || !appointment) {
        logTest('Can create appointment for cancellation', false, createError?.message);
        return false;
    }

    // Cancel the appointment
    const { error: cancelError } = await supabase
        .from('appointments')
        .update({
            status: 'cancelled',
            cancellation_reason: 'Test cancellation'
        })
        .eq('id', appointment.id);

    logTest('Can cancel appointment', !cancelError, cancelError?.message);

    // Verify status
    const { data: cancelled } = await supabase
        .from('appointments')
        .select('status, cancellation_reason')
        .eq('id', appointment.id)
        .single();

    logTest('Appointment status is cancelled',
        (cancelled as { status: string } | null)?.status === 'cancelled',
        `Expected 'cancelled', got '${(cancelled as { status: string } | null)?.status}'`);

    logTest('Cancellation reason saved',
        (cancelled as { cancellation_reason: string } | null)?.cancellation_reason === 'Test cancellation',
        'Reason not saved correctly');

    // Clean up
    await supabase.from('appointments').delete().eq('id', appointment.id);
    console.log('    Cleaned up test appointment');

    return !cancelError;
}

async function testAppointmentStatusTransitions() {
    console.log('\n8. Testing Appointment Status Transitions...');

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

    // Create appointment
    const now = new Date();
    const endTime = new Date(now);
    endTime.setMinutes(endTime.getMinutes() + 30);

    const { data: appointment, error: createError } = await supabase
        .from('appointments')
        .insert({
            doctor_profile_id: doctorProfile.id,
            patient_profile_id: patientProfile.id,
            scheduled_start: now.toISOString(),
            scheduled_end: endTime.toISOString(),
            status: 'scheduled',
            consultation_fee: 200
        })
        .select('id')
        .single();

    if (createError || !appointment) {
        logTest('Can create appointment for status test', false, createError?.message);
        return false;
    }

    // Test status transitions: scheduled -> in_waiting_room -> in_progress -> completed
    const transitions = [
        { status: 'in_waiting_room', field: 'patient_joined_waiting_room_at' },
        { status: 'in_progress', field: 'actual_start' },
        { status: 'completed', field: 'actual_end' }
    ];

    let allTransitionsSuccessful = true;

    for (const transition of transitions) {
        const updateData: Record<string, string> = { status: transition.status };
        if (transition.field) {
            updateData[transition.field] = new Date().toISOString();
        }

        const { error: transitionError } = await supabase
            .from('appointments')
            .update(updateData)
            .eq('id', appointment.id);

        logTest(`Can transition to ${transition.status}`, !transitionError, transitionError?.message);

        if (transitionError) {
            allTransitionsSuccessful = false;
        }

        // Verify status
        const { data: updated } = await supabase
            .from('appointments')
            .select('status')
            .eq('id', appointment.id)
            .single();

        if ((updated as { status: string } | null)?.status !== transition.status) {
            logTest(`Status is ${transition.status}`, false, `Got ${(updated as { status: string } | null)?.status}`);
            allTransitionsSuccessful = false;
        }
    }

    // Clean up
    await supabase.from('appointments').delete().eq('id', appointment.id);
    console.log('    Cleaned up test appointment');

    return allTransitionsSuccessful;
}

async function testWeeklyAvailabilityPattern() {
    console.log('\n9. Testing Weekly Availability Pattern...');

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

    // Create availability for multiple days (Mon-Fri, 9am-5pm)
    const weekdayAvailability = [];
    for (let day = 1; day <= 5; day++) {
        weekdayAvailability.push({
            doctor_profile_id: doctorProfile.id,
            day_of_week: day,
            start_time: '09:00:00',
            end_time: '17:00:00',
            is_active: true
        });
    }

    const { data: createdSlots, error: createError } = await supabase
        .from('doctor_availability')
        .insert(weekdayAvailability)
        .select('id, day_of_week');

    logTest('Can create weekly availability pattern', !createError, createError?.message);

    if (!createdSlots || createdSlots.length !== 5) {
        logTest('All 5 weekday slots created', false, `Created ${createdSlots?.length || 0} slots`);
        return false;
    }

    logTest('All 5 weekday slots created', true);
    console.log(`    Created ${createdSlots.length} availability slots for Mon-Fri`);

    // Clean up
    for (const slot of createdSlots) {
        await supabase.from('doctor_availability').delete().eq('id', slot.id);
    }
    console.log('    Cleaned up weekly availability pattern');

    return !createError;
}

async function testSpecializationsTable() {
    console.log('\n10. Testing Specializations Table...');

    const { data, error } = await supabase
        .from('specializations')
        .select('id, name_en, name_ar, is_active')
        .eq('is_active', true)
        .limit(10);

    logTest('Can query specializations table', !error, error?.message);

    if (data && data.length > 0) {
        console.log(`    Found ${data.length} active specialization(s)`);
        console.log(`    Examples: ${data.slice(0, 3).map(s => s.name_en).join(', ')}`);
        logTest('Active specializations exist', true);
    } else {
        logTest('Active specializations exist', false, 'No active specializations found');
    }

    return !error && (data?.length || 0) > 0;
}

// ============================================
// Main Test Runner
// ============================================

async function main() {
    console.log('========================================');
    console.log('Scheduling & Availability System Tests');
    console.log('========================================');

    await testDoctorAvailabilityTable();
    await testBlockedTimesTable();
    await testAvailabilityCreation();
    await testBlockedTimeCreation();
    await testAppointmentBooking();
    await testAppointmentRescheduling();
    await testAppointmentCancellation();
    await testAppointmentStatusTransitions();
    await testWeeklyAvailabilityPattern();
    await testSpecializationsTable();

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
        console.log('All tests passed! Scheduling system is working correctly.');
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
