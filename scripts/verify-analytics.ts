import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function verifyAnalytics() {
    const drNourDoctorProfileId = "db44e99b-5491-4241-b5a0-14d2668668bf";

    console.log("=== Verifying Analytics Data for Dr. Nour ===\n");

    // 1. Total Patients (unique patients with appointments)
    const { data: patients, error: patientsError } = await supabase
        .from("appointments")
        .select("patient_profile_id")
        .eq("doctor_profile_id", drNourDoctorProfileId);

    if (patientsError) {
        console.error("Error fetching patients:", patientsError.message);
    }

    const uniquePatients = new Set(patients?.map(p => p.patient_profile_id));
    console.log(`1. TOTAL PATIENTS: ${uniquePatients.size}`);
    console.log(`   Dashboard shows: 2`);
    console.log(`   ${uniquePatients.size === 2 ? "✓ MATCH" : "✗ MISMATCH"}\n`);

    // 2. Total Consultations (completed appointments)
    const { data: consultations, error: consultationsError } = await supabase
        .from("appointments")
        .select("id, status, scheduled_start")
        .eq("doctor_profile_id", drNourDoctorProfileId);

    if (consultationsError) {
        console.error("Error fetching consultations:", consultationsError.message);
    }

    const completedConsultations = consultations?.filter(c => c.status === "completed") || [];
    console.log(`2. TOTAL CONSULTATIONS (completed): ${completedConsultations.length}`);
    console.log(`   All appointments: ${consultations?.length || 0}`);
    consultations?.forEach(c => {
        console.log(`   - ${c.id.substring(0, 8)}... | Status: ${c.status} | Date: ${new Date(c.scheduled_start).toLocaleDateString()}`);
    });
    console.log(`   Dashboard shows: 7`);
    console.log(`   ${completedConsultations.length === 7 ? "✓ MATCH" : "✗ MISMATCH"}\n`);

    // 3. Revenue (from transactions)
    const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("amount, status, appointment_id")
        .in("appointment_id", consultations?.map(c => c.id) || []);

    if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError.message);
    }

    const completedTransactions = transactions?.filter(t => t.status === "completed") || [];
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    console.log(`3. REVENUE: ${totalRevenue} EGP`);
    console.log(`   Completed transactions: ${completedTransactions.length}`);
    transactions?.forEach(t => {
        console.log(`   - Amount: ${t.amount} EGP | Status: ${t.status}`);
    });
    console.log(`   Dashboard shows: 1750 EGP`);
    console.log(`   ${totalRevenue === 1750 ? "✓ MATCH" : "✗ MISMATCH"}\n`);

    // 4. Average Rating
    const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("rating, comment")
        .eq("doctor_profile_id", drNourDoctorProfileId);

    if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError.message);
    }

    const avgRating = reviews?.length
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "N/A";
    console.log(`4. AVERAGE RATING: ${avgRating} (from ${reviews?.length || 0} reviews)`);
    reviews?.forEach(r => {
        console.log(`   - Rating: ${r.rating}/5 | "${r.comment?.substring(0, 40)}..."`);
    });
    console.log(`   Dashboard shows: 4.8`);
    console.log(`   ${avgRating === "4.8" ? "✓ MATCH" : "✗ MISMATCH"}\n`);

    // 5. This Week's Consultations
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekConsultations = consultations?.filter(c => {
        const date = new Date(c.scheduled_start);
        return date >= startOfWeek && c.status === "completed";
    }) || [];

    console.log(`5. THIS WEEK'S CONSULTATIONS: ${thisWeekConsultations.length}`);
    console.log(`   Week starting: ${startOfWeek.toDateString()}`);
    thisWeekConsultations.forEach(c => {
        const date = new Date(c.scheduled_start);
        console.log(`   - ${date.toDateString()} (${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]})`);
    });
    console.log(`   Dashboard shows: 2 (Mon: 2)`);
    console.log(`   ${thisWeekConsultations.length === 2 ? "✓ MATCH" : "✗ MISMATCH"}\n`);

    // 6. Doctor Profile Stats
    const { data: doctorProfile, error: dpError } = await supabase
        .from("doctor_profiles")
        .select("rating_average, rating_count, total_consultations")
        .eq("id", drNourDoctorProfileId)
        .single();

    if (dpError) {
        console.error("Error fetching doctor profile:", dpError.message);
    }

    console.log(`6. DOCTOR PROFILE STATS:`);
    console.log(`   Rating Average: ${doctorProfile?.rating_average}`);
    console.log(`   Rating Count: ${doctorProfile?.rating_count}`);
    console.log(`   Total Consultations: ${doctorProfile?.total_consultations}\n`);

    console.log("=== End of Verification ===");
}

verifyAnalytics().catch(console.error);
