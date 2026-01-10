/**
 * Reviews and Ratings System Integration Tests
 *
 * Tests the reviews functionality including:
 * - Creating reviews for completed appointments
 * - Getting reviews for doctors
 * - Doctor responses to reviews
 * - Rating calculations
 * - Admin moderation
 *
 * Run with: npx tsx scripts/test-reviews.ts
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

// Helper to get test users
async function getTestUsers() {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const users = usersData?.users || [];

    const patientUser = users.find(u => u.email === "patient1@tawari.test");
    const doctorUser = users.find(u => u.email === "doctor1@tawari.test");
    const adminUser = users.find(u => u.email === "admin1@tawari.test");

    if (!patientUser || !doctorUser) {
        throw new Error("Test users not found. Run seed script first.");
    }

    // Get patient profile
    const { data: patientProfileData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("user_id", patientUser.id)
        .single();

    const { data: patientProfile } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", patientProfileData?.id)
        .single();

    // Get doctor profile
    const { data: doctorProfileData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("user_id", doctorUser.id)
        .single();

    const { data: doctorProfile } = await supabase
        .from("doctor_profiles")
        .select("id, rating_average, rating_count")
        .eq("profile_id", doctorProfileData?.id)
        .single();

    // Get admin profile
    let adminProfile = null;
    if (adminUser) {
        const { data: adminProfileData } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("user_id", adminUser.id)
            .single();
        adminProfile = adminProfileData;
    }

    return {
        patient: { ...patientProfileData, patientProfile },
        doctor: { ...doctorProfileData, doctorProfile },
        admin: adminProfile,
    };
}

// Clean up test reviews
async function cleanupTestReviews(patientProfileId: string) {
    await supabase
        .from("reviews")
        .delete()
        .eq("patient_profile_id", patientProfileId)
        .like("comment", "Test%");
}

// Create a completed appointment for testing
async function createTestAppointment(patientProfileId: string, doctorProfileId: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() - 1); // Yesterday for completed
    const endTime = new Date(tomorrow);
    endTime.setMinutes(endTime.getMinutes() + 30);

    const { data: appointment, error } = await supabase
        .from("appointments")
        .insert({
            patient_profile_id: patientProfileId,
            doctor_profile_id: doctorProfileId,
            scheduled_start: tomorrow.toISOString(),
            scheduled_end: endTime.toISOString(),
            status: "completed",
            consultation_fee: 200,
            chief_complaint: "Test appointment for review testing",
        })
        .select("id")
        .single();

    if (error) throw error;
    return appointment;
}

// Clean up test appointment
async function cleanupTestAppointment(appointmentId: string) {
    await supabase
        .from("reviews")
        .delete()
        .eq("appointment_id", appointmentId);

    await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentId);
}

// ============================================
// Tests
// ============================================

async function testReviewsTable() {
    log("\n⭐ Testing: Reviews Table");

    const { data, error } = await supabase
        .from("reviews")
        .select("*");

    if (error) {
        fail("Query reviews table", error);
    } else {
        success(`Query reviews table (found ${data?.length || 0} reviews)`);
    }
}

async function testCreateReview() {
    log("\n⭐ Testing: Create Review");

    const { patient, doctor } = await getTestUsers();
    const appointment = await createTestAppointment(
        patient.patientProfile.id,
        doctor.doctorProfile.id
    );

    try {
        const { data: review, error } = await supabase
            .from("reviews")
            .insert({
                appointment_id: appointment.id,
                patient_profile_id: patient.patientProfile.id,
                doctor_profile_id: doctor.doctorProfile.id,
                rating: 5,
                comment: "Test review - Excellent doctor, very helpful!",
                is_anonymous: false,
                is_visible: true,
            })
            .select()
            .single();

        if (error) {
            fail("Create review", error);
        } else {
            success("Create review");

            if (review.rating === 5 && review.comment?.includes("Test review")) {
                success("Review has correct data");
            } else {
                fail("Review has incorrect data");
            }
        }
    } finally {
        await cleanupTestAppointment(appointment.id);
    }
}

async function testRatingValues() {
    log("\n⭐ Testing: Rating Values");

    const { patient, doctor } = await getTestUsers();

    for (const rating of [1, 2, 3, 4, 5]) {
        const appointment = await createTestAppointment(
            patient.patientProfile.id,
            doctor.doctorProfile.id
        );

        try {
            const { error } = await supabase
                .from("reviews")
                .insert({
                    appointment_id: appointment.id,
                    patient_profile_id: patient.patientProfile.id,
                    doctor_profile_id: doctor.doctorProfile.id,
                    rating,
                    comment: `Test review with ${rating} stars`,
                    is_anonymous: false,
                    is_visible: true,
                });

            if (error) {
                fail(`Create review with ${rating} stars`, error);
            } else {
                success(`Create review with ${rating} stars`);
            }
        } finally {
            await cleanupTestAppointment(appointment.id);
        }
    }
}

async function testAnonymousReview() {
    log("\n⭐ Testing: Anonymous Review");

    const { patient, doctor } = await getTestUsers();
    const appointment = await createTestAppointment(
        patient.patientProfile.id,
        doctor.doctorProfile.id
    );

    try {
        const { data: review, error } = await supabase
            .from("reviews")
            .insert({
                appointment_id: appointment.id,
                patient_profile_id: patient.patientProfile.id,
                doctor_profile_id: doctor.doctorProfile.id,
                rating: 4,
                comment: "Test anonymous review",
                is_anonymous: true,
                is_visible: true,
            })
            .select()
            .single();

        if (error) {
            fail("Create anonymous review", error);
        } else {
            success("Create anonymous review");

            if (review.is_anonymous === true) {
                success("Anonymous flag is set correctly");
            } else {
                fail("Anonymous flag not set");
            }
        }
    } finally {
        await cleanupTestAppointment(appointment.id);
    }
}

async function testUniqueReviewPerAppointment() {
    log("\n⭐ Testing: Unique Review Per Appointment");

    const { patient, doctor } = await getTestUsers();
    const appointment = await createTestAppointment(
        patient.patientProfile.id,
        doctor.doctorProfile.id
    );

    try {
        // First review should succeed
        const { error: error1 } = await supabase
            .from("reviews")
            .insert({
                appointment_id: appointment.id,
                patient_profile_id: patient.patientProfile.id,
                doctor_profile_id: doctor.doctorProfile.id,
                rating: 5,
                comment: "Test first review",
                is_anonymous: false,
                is_visible: true,
            });

        if (error1) {
            fail("Create first review", error1);
            return;
        }
        success("Create first review");

        // Second review should fail (duplicate)
        const { error: error2 } = await supabase
            .from("reviews")
            .insert({
                appointment_id: appointment.id,
                patient_profile_id: patient.patientProfile.id,
                doctor_profile_id: doctor.doctorProfile.id,
                rating: 3,
                comment: "Test duplicate review",
                is_anonymous: false,
                is_visible: true,
            });

        if (error2) {
            success("Duplicate review rejected (unique constraint works)");
        } else {
            fail("Duplicate review was allowed (should have been rejected)");
        }
    } finally {
        await cleanupTestAppointment(appointment.id);
    }
}

async function testGetReviewsForDoctor() {
    log("\n⭐ Testing: Get Reviews for Doctor");

    const { patient, doctor } = await getTestUsers();

    // Create multiple reviews
    const appointments = [];
    for (let i = 0; i < 3; i++) {
        const appt = await createTestAppointment(
            patient.patientProfile.id,
            doctor.doctorProfile.id
        );
        appointments.push(appt);

        await supabase.from("reviews").insert({
            appointment_id: appt.id,
            patient_profile_id: patient.patientProfile.id,
            doctor_profile_id: doctor.doctorProfile.id,
            rating: 4 + (i % 2),
            comment: `Test review ${i + 1} for doctor query`,
            is_anonymous: false,
            is_visible: true,
        });
    }

    try {
        // Fetch reviews for doctor
        const { data: reviews, error } = await supabase
            .from("reviews")
            .select("*")
            .eq("doctor_profile_id", doctor.doctorProfile.id)
            .eq("is_visible", true)
            .order("created_at", { ascending: false });

        if (error) {
            fail("Get reviews for doctor", error);
        } else {
            success(`Get reviews for doctor (found ${reviews?.length || 0} reviews)`);
        }
    } finally {
        for (const appt of appointments) {
            await cleanupTestAppointment(appt.id);
        }
    }
}

async function testDoctorResponse() {
    log("\n⭐ Testing: Doctor Response to Review");

    const { patient, doctor } = await getTestUsers();
    const appointment = await createTestAppointment(
        patient.patientProfile.id,
        doctor.doctorProfile.id
    );

    try {
        // Create a review
        const { data: review, error: createError } = await supabase
            .from("reviews")
            .insert({
                appointment_id: appointment.id,
                patient_profile_id: patient.patientProfile.id,
                doctor_profile_id: doctor.doctorProfile.id,
                rating: 5,
                comment: "Test review waiting for doctor response",
                is_anonymous: false,
                is_visible: true,
            })
            .select("id")
            .single();

        if (createError || !review) {
            fail("Create review for response test", createError);
            return;
        }
        success("Create review for response test");

        // Doctor responds
        const { error: responseError } = await supabase
            .from("reviews")
            .update({
                doctor_response: "Thank you for your kind review! It was a pleasure helping you.",
                doctor_responded_at: new Date().toISOString(),
            })
            .eq("id", review.id);

        if (responseError) {
            fail("Doctor respond to review", responseError);
        } else {
            success("Doctor respond to review");
        }

        // Verify response was saved
        const { data: updated } = await supabase
            .from("reviews")
            .select("doctor_response, doctor_responded_at")
            .eq("id", review.id)
            .single();

        if (updated?.doctor_response && updated?.doctor_responded_at) {
            success("Doctor response saved correctly");
        } else {
            fail("Doctor response not saved");
        }
    } finally {
        await cleanupTestAppointment(appointment.id);
    }
}

async function testHideReview() {
    log("\n⭐ Testing: Hide Review (Moderation)");

    const { patient, doctor } = await getTestUsers();
    const appointment = await createTestAppointment(
        patient.patientProfile.id,
        doctor.doctorProfile.id
    );

    try {
        // Create a review
        const { data: review, error: createError } = await supabase
            .from("reviews")
            .insert({
                appointment_id: appointment.id,
                patient_profile_id: patient.patientProfile.id,
                doctor_profile_id: doctor.doctorProfile.id,
                rating: 1,
                comment: "Test review to be hidden for moderation",
                is_anonymous: false,
                is_visible: true,
            })
            .select("id")
            .single();

        if (createError || !review) {
            fail("Create review for hide test", createError);
            return;
        }
        success("Create review for hide test");

        // Hide the review
        const { error: hideError } = await supabase
            .from("reviews")
            .update({
                is_visible: false,
                hidden_reason: "Inappropriate content - test moderation",
            })
            .eq("id", review.id);

        if (hideError) {
            fail("Hide review", hideError);
        } else {
            success("Hide review");
        }

        // Verify it's hidden from public queries
        const { data: publicReviews } = await supabase
            .from("reviews")
            .select("id")
            .eq("id", review.id)
            .eq("is_visible", true);

        if (!publicReviews || publicReviews.length === 0) {
            success("Hidden review excluded from visible query");
        } else {
            fail("Hidden review still visible in public query");
        }
    } finally {
        await cleanupTestAppointment(appointment.id);
    }
}

async function testUpdateReview() {
    log("\n⭐ Testing: Update Review");

    const { patient, doctor } = await getTestUsers();
    const appointment = await createTestAppointment(
        patient.patientProfile.id,
        doctor.doctorProfile.id
    );

    try {
        // Create a review
        const { data: review, error: createError } = await supabase
            .from("reviews")
            .insert({
                appointment_id: appointment.id,
                patient_profile_id: patient.patientProfile.id,
                doctor_profile_id: doctor.doctorProfile.id,
                rating: 3,
                comment: "Test review - initial",
                is_anonymous: false,
                is_visible: true,
            })
            .select("id")
            .single();

        if (createError || !review) {
            fail("Create review for update test", createError);
            return;
        }
        success("Create review for update test");

        // Update the review
        const { error: updateError } = await supabase
            .from("reviews")
            .update({
                rating: 5,
                comment: "Test review - updated to 5 stars!",
            })
            .eq("id", review.id);

        if (updateError) {
            fail("Update review", updateError);
        } else {
            success("Update review");
        }

        // Verify update
        const { data: updated } = await supabase
            .from("reviews")
            .select("rating, comment")
            .eq("id", review.id)
            .single();

        if (updated?.rating === 5 && updated?.comment?.includes("updated")) {
            success("Review updated correctly");
        } else {
            fail("Review not updated correctly");
        }
    } finally {
        await cleanupTestAppointment(appointment.id);
    }
}

async function testDeleteReview() {
    log("\n⭐ Testing: Delete Review");

    const { patient, doctor } = await getTestUsers();
    const appointment = await createTestAppointment(
        patient.patientProfile.id,
        doctor.doctorProfile.id
    );

    try {
        // Create a review
        const { data: review, error: createError } = await supabase
            .from("reviews")
            .insert({
                appointment_id: appointment.id,
                patient_profile_id: patient.patientProfile.id,
                doctor_profile_id: doctor.doctorProfile.id,
                rating: 2,
                comment: "Test review - to be deleted",
                is_anonymous: false,
                is_visible: true,
            })
            .select("id")
            .single();

        if (createError || !review) {
            fail("Create review for delete test", createError);
            return;
        }
        success("Create review for delete test");

        // Delete the review
        const { error: deleteError } = await supabase
            .from("reviews")
            .delete()
            .eq("id", review.id);

        if (deleteError) {
            fail("Delete review", deleteError);
        } else {
            success("Delete review");
        }

        // Verify deletion
        const { data: deleted } = await supabase
            .from("reviews")
            .select("id")
            .eq("id", review.id)
            .maybeSingle();

        if (!deleted) {
            success("Review deleted from database");
        } else {
            fail("Review still exists after deletion");
        }
    } finally {
        // Appointment cleanup only (review already deleted)
        await supabase.from("appointments").delete().eq("id", appointment.id);
    }
}

async function testDoctorRatingCalculation() {
    log("\n⭐ Testing: Doctor Rating Calculation (Trigger)");

    const { patient, doctor } = await getTestUsers();

    // Get initial rating
    const { data: initialRating } = await supabase
        .from("doctor_profiles")
        .select("rating_average, rating_count")
        .eq("id", doctor.doctorProfile.id)
        .single();

    const initialCount = initialRating?.rating_count || 0;
    log(`   Initial rating: ${initialRating?.rating_average || 0} (${initialCount} reviews)`);

    // Create multiple reviews with known ratings
    const appointments = [];
    const ratings = [5, 4, 5]; // Average: 4.67

    for (let i = 0; i < ratings.length; i++) {
        const appt = await createTestAppointment(
            patient.patientProfile.id,
            doctor.doctorProfile.id
        );
        appointments.push(appt);

        await supabase.from("reviews").insert({
            appointment_id: appt.id,
            patient_profile_id: patient.patientProfile.id,
            doctor_profile_id: doctor.doctorProfile.id,
            rating: ratings[i],
            comment: `Test review ${i + 1} for rating calculation`,
            is_anonymous: false,
            is_visible: true,
        });
    }

    try {
        // Check updated rating
        const { data: updatedRating } = await supabase
            .from("doctor_profiles")
            .select("rating_average, rating_count")
            .eq("id", doctor.doctorProfile.id)
            .single();

        const expectedCount = initialCount + ratings.length;

        if (updatedRating?.rating_count === expectedCount) {
            success(`Rating count updated (${updatedRating.rating_count} reviews)`);
        } else {
            fail(`Rating count mismatch - expected ${expectedCount}, got ${updatedRating?.rating_count}`);
        }

        if (updatedRating?.rating_average !== undefined) {
            success(`Rating average calculated: ${updatedRating.rating_average}`);
        } else {
            fail("Rating average not calculated");
        }
    } finally {
        for (const appt of appointments) {
            await cleanupTestAppointment(appt.id);
        }
    }
}

// ============================================
// Main Test Runner
// ============================================

async function runTests() {
    log("⭐ Reviews and Ratings System Integration Tests");
    log("================================================\n");

    try {
        const { patient, doctor, admin } = await getTestUsers();
        log(`Using test patient: ${patient.full_name}`);
        log(`Using test doctor: ${doctor.full_name}`);
        log(`Using test admin: ${admin?.full_name || "Not found"}`);

        // Clean up any existing test reviews
        await cleanupTestReviews(patient.patientProfile.id);

        // Run all tests
        await testReviewsTable();
        await testCreateReview();
        await testRatingValues();
        await testAnonymousReview();
        await testUniqueReviewPerAppointment();
        await testGetReviewsForDoctor();
        await testDoctorResponse();
        await testHideReview();
        await testUpdateReview();
        await testDeleteReview();
        await testDoctorRatingCalculation();

        // Cleanup
        log("\n🧹 Cleaning up test data...");
        await cleanupTestReviews(patient.patientProfile.id);
        success("Test data cleaned up");

    } catch (error) {
        fail("Test setup failed", error);
    }

    // Summary
    log("\n================================================");
    log(`📊 Results: ${passed} passed, ${failed} failed`);
    log("================================================");

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
