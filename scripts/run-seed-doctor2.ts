import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

// UUIDs from seed script
const DOCTOR_PROFILE_ID = "db44e99b-5491-4241-b5a0-14d2668668bf";
const DOCTOR_PROFILE_PROFILE_ID = "04dc906b-a477-4f3f-82df-30e15be19332";
const PATIENT1_PROFILE_ID = "93f3a5d7-f361-4830-9b3c-d8835fc9ec36";
const PATIENT2_PROFILE_ID = "47f0e436-e437-4a99-9172-03af9ca95a39";
const PATIENT1_PATIENT_PROFILE_ID = "24cde19e-28b2-46fa-9f37-ad24cba603a7";
const PATIENT2_PATIENT_PROFILE_ID = "285b42d6-08e8-4db3-8dbb-195c74229e59";

// Helper to get today's date with time
function todayAt(time: string): string {
    const today = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    today.setHours(hours, minutes, 0, 0);
    return today.toISOString();
}

// Helper to get date relative to today
function daysAgo(days: number, time: string): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const [hours, minutes] = time.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
}

function daysFromNow(days: number, time: string): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const [hours, minutes] = time.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
}

async function runSeed() {
    console.log("🌱 Running seed script for Dr. Nour (doctor2)...\n");

    // Step 1: Clean up existing data
    console.log("🧹 Cleaning up existing data...");

    await supabase.from("consultation_notes").delete().eq("doctor_profile_id", DOCTOR_PROFILE_ID);
    await supabase.from("reviews").delete().eq("doctor_profile_id", DOCTOR_PROFILE_ID);
    await supabase.from("prescriptions").delete().eq("doctor_profile_id", DOCTOR_PROFILE_ID);
    await supabase.from("doctor_earnings").delete().eq("doctor_profile_id", DOCTOR_PROFILE_ID);

    // Get appointment IDs first
    const { data: existingAppts } = await supabase
        .from("appointments")
        .select("id")
        .eq("doctor_profile_id", DOCTOR_PROFILE_ID);

    if (existingAppts && existingAppts.length > 0) {
        const apptIds = existingAppts.map((a) => a.id);
        await supabase.from("consultation_sessions").delete().in("appointment_id", apptIds);
        await supabase.from("transactions").delete().in("appointment_id", apptIds);
    }

    await supabase.from("appointments").delete().eq("doctor_profile_id", DOCTOR_PROFILE_ID);
    await supabase.from("messages").delete().eq("recipient_profile_id", DOCTOR_PROFILE_PROFILE_ID);
    await supabase.from("messages").delete().eq("sender_profile_id", DOCTOR_PROFILE_PROFILE_ID);
    await supabase.from("notifications").delete().eq("profile_id", DOCTOR_PROFILE_PROFILE_ID);

    console.log("✅ Cleanup complete\n");

    // Step 2: Insert today's appointments
    console.log("📅 Inserting today's appointments...");

    const todayAppointments = [
        {
            id: "aaaa0001-0001-0001-0001-000000000001",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: todayAt("09:00"),
            scheduled_end: todayAt("09:30"),
            actual_start: todayAt("09:02"),
            actual_end: todayAt("09:25"),
            status: "completed",
            appointment_type: "scheduled",
            chief_complaint: "Skin irritation on hands, redness and itching for 3 days",
            consultation_fee: 250.0,
        },
        {
            id: "aaaa0001-0001-0001-0001-000000000002",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: todayAt("10:30"),
            scheduled_end: todayAt("11:00"),
            actual_start: todayAt("10:32"),
            actual_end: todayAt("10:58"),
            status: "completed",
            appointment_type: "scheduled",
            chief_complaint: "Follow-up for eczema treatment, checking medication effectiveness",
            consultation_fee: 250.0,
        },
        {
            id: "aaaa0001-0001-0001-0001-000000000003",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: todayAt("14:00"),
            scheduled_end: todayAt("14:30"),
            status: "in_waiting_room",
            appointment_type: "scheduled",
            chief_complaint: "New mole appeared on back, want to get it checked",
            consultation_fee: 250.0,
        },
        {
            id: "aaaa0001-0001-0001-0001-000000000004",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: todayAt("16:00"),
            scheduled_end: todayAt("16:30"),
            status: "scheduled",
            appointment_type: "scheduled",
            chief_complaint: "Acne consultation - breakout on forehead",
            consultation_fee: 250.0,
        },
        {
            id: "aaaa0001-0001-0001-0001-000000000005",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: todayAt("17:30"),
            scheduled_end: todayAt("18:00"),
            status: "scheduled",
            appointment_type: "scheduled",
            chief_complaint: "Hair loss concerns, thinning on crown area",
            consultation_fee: 250.0,
        },
    ];

    const { error: todayApptError } = await supabase.from("appointments").insert(todayAppointments);
    if (todayApptError) {
        console.error("❌ Error inserting today's appointments:", todayApptError);
    } else {
        console.log(`✅ Inserted ${todayAppointments.length} today's appointments`);
    }

    // Step 3: Insert past appointments
    console.log("📅 Inserting past appointments...");

    const pastAppointments = [
        {
            id: "aaaa0001-0001-0001-0001-000000000010",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: daysAgo(3, "11:00"),
            scheduled_end: daysAgo(3, "11:30"),
            actual_start: daysAgo(3, "11:03"),
            actual_end: daysAgo(3, "11:28"),
            status: "completed",
            appointment_type: "scheduled",
            chief_complaint: "Dry skin patches on legs, worsening in winter",
            consultation_fee: 250.0,
        },
        {
            id: "aaaa0001-0001-0001-0001-000000000011",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: daysAgo(5, "14:00"),
            scheduled_end: daysAgo(5, "14:30"),
            actual_start: daysAgo(5, "14:05"),
            actual_end: daysAgo(5, "14:32"),
            status: "completed",
            appointment_type: "scheduled",
            chief_complaint: "Allergic reaction to new soap, face swelling",
            consultation_fee: 250.0,
        },
        {
            id: "aaaa0001-0001-0001-0001-000000000012",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: daysAgo(7, "10:00"),
            scheduled_end: daysAgo(7, "10:30"),
            actual_start: daysAgo(7, "10:01"),
            actual_end: daysAgo(7, "10:26"),
            status: "completed",
            appointment_type: "scheduled",
            chief_complaint: "Initial consultation for recurring eczema",
            consultation_fee: 250.0,
        },
        {
            id: "aaaa0001-0001-0001-0001-000000000013",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: daysAgo(2, "15:00"),
            scheduled_end: daysAgo(2, "15:30"),
            status: "cancelled",
            appointment_type: "scheduled",
            chief_complaint: "Skin tag removal consultation",
            consultation_fee: 250.0,
            cancellation_reason: "Patient requested cancellation - scheduling conflict",
        },
        {
            id: "aaaa0001-0001-0001-0001-000000000014",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: daysAgo(1, "12:00"),
            scheduled_end: daysAgo(1, "12:30"),
            status: "no_show",
            appointment_type: "scheduled",
            chief_complaint: "Follow-up appointment",
            consultation_fee: 250.0,
        },
        {
            id: "aaaa0001-0001-0001-0001-000000000015",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: daysAgo(14, "11:00"),
            scheduled_end: daysAgo(14, "11:30"),
            actual_start: daysAgo(14, "11:02"),
            actual_end: daysAgo(14, "11:29"),
            status: "completed",
            appointment_type: "scheduled",
            chief_complaint: "Psoriasis flare-up on elbows",
            consultation_fee: 250.0,
        },
        {
            id: "aaaa0001-0001-0001-0001-000000000016",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: daysAgo(21, "15:00"),
            scheduled_end: daysAgo(21, "15:30"),
            actual_start: daysAgo(21, "15:04"),
            actual_end: daysAgo(21, "15:31"),
            status: "completed",
            appointment_type: "scheduled",
            chief_complaint: "Sunburn treatment and skin check",
            consultation_fee: 250.0,
        },
    ];

    const { error: pastApptError } = await supabase.from("appointments").insert(pastAppointments);
    if (pastApptError) {
        console.error("❌ Error inserting past appointments:", pastApptError);
    } else {
        console.log(`✅ Inserted ${pastAppointments.length} past appointments`);
    }

    // Step 4: Insert future appointments
    console.log("📅 Inserting future appointments...");

    const futureAppointments = [
        {
            id: "aaaa0001-0001-0001-0001-000000000020",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: daysFromNow(1, "10:00"),
            scheduled_end: daysFromNow(1, "10:30"),
            status: "scheduled",
            appointment_type: "scheduled",
            chief_complaint: "Follow-up for allergic reaction treatment",
            consultation_fee: 250.0,
        },
        {
            id: "aaaa0001-0001-0001-0001-000000000021",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: daysFromNow(3, "14:00"),
            scheduled_end: daysFromNow(3, "14:30"),
            status: "scheduled",
            appointment_type: "scheduled",
            chief_complaint: "Monthly eczema check-up",
            consultation_fee: 250.0,
        },
        {
            id: "aaaa0001-0001-0001-0001-000000000022",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            scheduled_start: daysFromNow(7, "11:00"),
            scheduled_end: daysFromNow(7, "11:30"),
            status: "scheduled",
            appointment_type: "scheduled",
            chief_complaint: "Mole mapping and skin cancer screening",
            consultation_fee: 250.0,
        },
    ];

    const { error: futureApptError } = await supabase.from("appointments").insert(futureAppointments);
    if (futureApptError) {
        console.error("❌ Error inserting future appointments:", futureApptError);
    } else {
        console.log(`✅ Inserted ${futureAppointments.length} future appointments`);
    }

    // Step 5: Insert consultation notes
    console.log("📝 Inserting consultation notes...");

    const consultationNotes = [
        {
            id: "cccc0001-0001-0001-0001-000000000001",
            appointment_id: "aaaa0001-0001-0001-0001-000000000001",
            doctor_profile_id: DOCTOR_PROFILE_ID,
            subjective:
                "Patient reports skin irritation on both hands for 3 days. Describes redness, itching, and mild burning sensation. Started after using new cleaning products at work.",
            objective:
                "Erythematous patches on dorsal aspects of both hands. Mild vesiculation present. No secondary infection. Nails appear normal.",
            assessment: "Contact dermatitis, likely irritant type from occupational exposure to cleaning chemicals.",
            plan: "1. Hydrocortisone cream 1% applied twice daily for 7 days\n2. Emollient after each hand wash\n3. Avoid contact with irritant\n4. Antihistamine at night if itching severe",
            follow_up_recommended: true,
            follow_up_timeframe: "1 week",
        },
        {
            id: "cccc0001-0001-0001-0001-000000000002",
            appointment_id: "aaaa0001-0001-0001-0001-000000000002",
            doctor_profile_id: DOCTOR_PROFILE_ID,
            subjective:
                "Follow-up for eczema. Patient reports significant improvement. Itching reduced by 80%. Sleep quality improved.",
            objective: "Skin examination shows marked improvement. Previous erythematous patches now faded. No active lesions.",
            assessment: "Atopic dermatitis - responding well to treatment. Currently in remission.",
            plan: "1. Continue moisturizer\n2. Reduce hydrocortisone to once daily for 3 more days\n3. Keep Cetirizine as needed",
            follow_up_recommended: true,
            follow_up_timeframe: "1 month",
        },
        {
            id: "cccc0001-0001-0001-0001-000000000010",
            appointment_id: "aaaa0001-0001-0001-0001-000000000010",
            doctor_profile_id: DOCTOR_PROFILE_ID,
            subjective: "Dry, scaly patches on both legs. Symptoms worse in winter. No itching.",
            objective: "Bilateral lower extremity xerosis. Fine scaling present. No inflammation.",
            assessment: "Xerosis (dry skin), seasonal exacerbation.",
            plan: "1. Gentle cleanser\n2. Thick emollient cream after bathing\n3. Use humidifier\n4. Avoid hot water",
            follow_up_recommended: false,
        },
        {
            id: "cccc0001-0001-0001-0001-000000000011",
            appointment_id: "aaaa0001-0001-0001-0001-000000000011",
            doctor_profile_id: DOCTOR_PROFILE_ID,
            subjective: "Facial swelling and redness after using new soap. Mild periorbital edema. No respiratory symptoms.",
            objective:
                "Moderate periorbital edema bilaterally. Erythematous rash on cheeks and forehead. No urticaria. Vital signs stable.",
            assessment: "Acute allergic contact dermatitis - facial, secondary to soap allergen.",
            plan: "1. Discontinue soap\n2. Prednisolone 20mg daily for 5 days\n3. Cetirizine 10mg twice daily\n4. Cool compresses",
            follow_up_recommended: true,
            follow_up_timeframe: "1 week",
        },
        {
            id: "cccc0001-0001-0001-0001-000000000012",
            appointment_id: "aaaa0001-0001-0001-0001-000000000012",
            doctor_profile_id: DOCTOR_PROFILE_ID,
            subjective: "Itchy, red patches on arms and behind knees. History of childhood eczema. Recently moved apartments.",
            objective: "Bilateral antecubital fossae show erythematous, lichenified patches. Some excoriation marks.",
            assessment: "Atopic dermatitis (eczema), moderate severity.",
            plan: "1. Hydrocortisone 1% cream twice daily for 2 weeks\n2. Cetirizine 10mg at bedtime\n3. Fragrance-free moisturizer\n4. Short lukewarm showers",
            follow_up_recommended: true,
            follow_up_timeframe: "2 weeks",
        },
    ];

    const { error: notesError } = await supabase.from("consultation_notes").insert(consultationNotes);
    if (notesError) {
        console.error("❌ Error inserting consultation notes:", notesError);
    } else {
        console.log(`✅ Inserted ${consultationNotes.length} consultation notes`);
    }

    // Step 6: Insert prescriptions
    console.log("💊 Inserting prescriptions...");

    const today = new Date();
    const prescriptions = [
        {
            id: "00000001-0001-0001-0001-000000000001",
            appointment_id: "aaaa0001-0001-0001-0001-000000000001",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            medication_name: "Hydrocortisone Cream 1%",
            dosage: "Apply thin layer",
            frequency: "Twice daily",
            duration: "7 days",
            instructions: "Apply to affected areas on hands only. Do not use on face.",
            quantity: 1,
            status: "active",
            valid_until: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
        {
            id: "00000001-0001-0001-0001-000000000002",
            appointment_id: "aaaa0001-0001-0001-0001-000000000001",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            medication_name: "Cetirizine",
            dosage: "10mg",
            frequency: "Once daily at bedtime",
            duration: "7 days",
            instructions: "Take at night. May cause drowsiness.",
            quantity: 7,
            status: "active",
            valid_until: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
        {
            id: "00000001-0001-0001-0001-000000000003",
            appointment_id: "aaaa0001-0001-0001-0001-000000000002",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            medication_name: "Hydrocortisone Cream 1%",
            dosage: "Apply thin layer",
            frequency: "Once daily",
            duration: "3 days",
            instructions: "Apply to previously affected areas for final 3 days, then discontinue.",
            quantity: 1,
            status: "active",
            valid_until: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
        {
            id: "00000001-0001-0001-0001-000000000004",
            appointment_id: "aaaa0001-0001-0001-0001-000000000011",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            medication_name: "Prednisolone",
            dosage: "20mg",
            frequency: "Once daily in morning",
            duration: "5 days",
            instructions: "Take with food. Complete full course.",
            quantity: 5,
            status: "completed",
            valid_until: today.toISOString().split("T")[0],
        },
        {
            id: "00000001-0001-0001-0001-000000000005",
            appointment_id: "aaaa0001-0001-0001-0001-000000000011",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            medication_name: "Cetirizine",
            dosage: "10mg",
            frequency: "Twice daily",
            duration: "7 days",
            instructions: "Morning and evening. May cause drowsiness.",
            quantity: 14,
            status: "completed",
            valid_until: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
        {
            id: "00000001-0001-0001-0001-000000000006",
            appointment_id: "aaaa0001-0001-0001-0001-000000000012",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            medication_name: "Hydrocortisone Cream 1%",
            dosage: "Apply thin layer",
            frequency: "Twice daily",
            duration: "2 weeks",
            instructions: "Apply to affected areas. Stop if irritation occurs.",
            quantity: 2,
            status: "active",
            valid_until: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
    ];

    const { error: prescError } = await supabase.from("prescriptions").insert(prescriptions);
    if (prescError) {
        console.error("❌ Error inserting prescriptions:", prescError);
    } else {
        console.log(`✅ Inserted ${prescriptions.length} prescriptions`);
    }

    // Step 7: Insert reviews
    console.log("⭐ Inserting reviews...");

    const reviews = [
        {
            id: "00000002-0001-0001-0001-000000000001",
            appointment_id: "aaaa0001-0001-0001-0001-000000000011",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            rating: 5,
            comment: "Dr. Nour was excellent! She quickly identified my allergic reaction and the treatment worked perfectly.",
            is_anonymous: false,
            is_visible: true,
        },
        {
            id: "00000002-0001-0001-0001-000000000002",
            appointment_id: "aaaa0001-0001-0001-0001-000000000012",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            rating: 5,
            comment: "Very thorough consultation. Dr. Nour explained my eczema condition clearly. Highly recommend!",
            is_anonymous: false,
            is_visible: true,
        },
        {
            id: "00000002-0001-0001-0001-000000000003",
            appointment_id: "aaaa0001-0001-0001-0001-000000000016",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            rating: 4,
            comment: "Good experience overall. The doctor was professional and the video call quality was excellent.",
            is_anonymous: false,
            is_visible: true,
        },
        {
            id: "00000002-0001-0001-0001-000000000004",
            appointment_id: "aaaa0001-0001-0001-0001-000000000015",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            doctor_profile_id: DOCTOR_PROFILE_ID,
            rating: 5,
            comment: "Dr. Nour is very knowledgeable about skin conditions. My psoriasis improved significantly.",
            is_anonymous: false,
            is_visible: true,
        },
    ];

    const { error: reviewError } = await supabase.from("reviews").insert(reviews);
    if (reviewError) {
        console.error("❌ Error inserting reviews:", reviewError);
    } else {
        console.log(`✅ Inserted ${reviews.length} reviews`);
    }

    // Step 8: Insert messages
    console.log("💬 Inserting messages...");

    const messages = [
        {
            id: "00000003-0001-0001-0001-000000000001",
            conversation_id: "00000004-0001-0001-0001-000000000001",
            sender_profile_id: PATIENT1_PROFILE_ID,
            recipient_profile_id: DOCTOR_PROFILE_PROFILE_ID,
            content: "Good morning Dr. Nour! Just confirming my 2 PM appointment today. Should I have anything ready?",
            message_type: "text",
            is_read: false,
        },
        {
            id: "00000003-0001-0001-0001-000000000002",
            conversation_id: "00000004-0001-0001-0001-000000000001",
            sender_profile_id: PATIENT1_PROFILE_ID,
            recipient_profile_id: DOCTOR_PROFILE_PROFILE_ID,
            content: "Also, the mole I mentioned has not changed in size but I wanted to get it checked just to be safe.",
            message_type: "text",
            is_read: false,
        },
        {
            id: "00000003-0001-0001-0001-000000000010",
            conversation_id: "00000004-0001-0001-0001-000000000002",
            sender_profile_id: PATIENT2_PROFILE_ID,
            recipient_profile_id: DOCTOR_PROFILE_PROFILE_ID,
            content:
                "Hi Dr. Nour, thank you for the consultation today. Quick question - can I use the moisturizer before or after the steroid cream?",
            message_type: "text",
            is_read: false,
        },
        {
            id: "00000003-0001-0001-0001-000000000011",
            conversation_id: "00000004-0001-0001-0001-000000000002",
            sender_profile_id: DOCTOR_PROFILE_PROFILE_ID,
            recipient_profile_id: PATIENT2_PROFILE_ID,
            content:
                "Hi Fatima! Great question. Apply the steroid cream first, wait about 15-20 minutes, then apply the moisturizer on top.",
            message_type: "text",
            is_read: true,
        },
        {
            id: "00000003-0001-0001-0001-000000000012",
            conversation_id: "00000004-0001-0001-0001-000000000002",
            sender_profile_id: PATIENT2_PROFILE_ID,
            recipient_profile_id: DOCTOR_PROFILE_PROFILE_ID,
            content: "Perfect, thank you so much! That makes sense. I will do that.",
            message_type: "text",
            is_read: true,
        },
    ];

    const { error: msgError } = await supabase.from("messages").insert(messages);
    if (msgError) {
        console.error("❌ Error inserting messages:", msgError);
    } else {
        console.log(`✅ Inserted ${messages.length} messages`);
    }

    // Step 9: Insert consultation sessions
    console.log("📹 Inserting consultation sessions...");

    const sessions = [
        {
            id: "00000005-0001-0001-0001-000000000001",
            appointment_id: "aaaa0001-0001-0001-0001-000000000001",
            jitsi_room_id: "tawari-aaaa0001-0001-0001-0001-000000000001",
            started_at: todayAt("09:02"),
            ended_at: todayAt("09:25"),
            duration_seconds: 1380,
        },
        {
            id: "00000005-0001-0001-0001-000000000002",
            appointment_id: "aaaa0001-0001-0001-0001-000000000002",
            jitsi_room_id: "tawari-aaaa0001-0001-0001-0001-000000000002",
            started_at: todayAt("10:32"),
            ended_at: todayAt("10:58"),
            duration_seconds: 1560,
        },
    ];

    const { error: sessionError } = await supabase.from("consultation_sessions").insert(sessions);
    if (sessionError) {
        console.error("❌ Error inserting consultation sessions:", sessionError);
    } else {
        console.log(`✅ Inserted ${sessions.length} consultation sessions`);
    }

    // Step 10: Insert transactions
    console.log("💰 Inserting transactions...");

    const transactions = [
        {
            id: "00000006-0001-0001-0001-000000000001",
            appointment_id: "aaaa0001-0001-0001-0001-000000000001",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            amount: 250.0,
            currency: "EGP",
            transaction_type: "consultation",
            status: "completed",
            payment_method: "card",
        },
        {
            id: "00000006-0001-0001-0001-000000000002",
            appointment_id: "aaaa0001-0001-0001-0001-000000000002",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            amount: 250.0,
            currency: "EGP",
            transaction_type: "consultation",
            status: "completed",
            payment_method: "card",
        },
        {
            id: "00000006-0001-0001-0001-000000000010",
            appointment_id: "aaaa0001-0001-0001-0001-000000000010",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            amount: 250.0,
            currency: "EGP",
            transaction_type: "consultation",
            status: "completed",
            payment_method: "card",
        },
        {
            id: "00000006-0001-0001-0001-000000000011",
            appointment_id: "aaaa0001-0001-0001-0001-000000000011",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            amount: 250.0,
            currency: "EGP",
            transaction_type: "consultation",
            status: "completed",
            payment_method: "card",
        },
        {
            id: "00000006-0001-0001-0001-000000000012",
            appointment_id: "aaaa0001-0001-0001-0001-000000000012",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            amount: 250.0,
            currency: "EGP",
            transaction_type: "consultation",
            status: "completed",
            payment_method: "card",
        },
        {
            id: "00000006-0001-0001-0001-000000000015",
            appointment_id: "aaaa0001-0001-0001-0001-000000000015",
            patient_profile_id: PATIENT1_PATIENT_PROFILE_ID,
            amount: 250.0,
            currency: "EGP",
            transaction_type: "consultation",
            status: "completed",
            payment_method: "card",
        },
        {
            id: "00000006-0001-0001-0001-000000000016",
            appointment_id: "aaaa0001-0001-0001-0001-000000000016",
            patient_profile_id: PATIENT2_PATIENT_PROFILE_ID,
            amount: 250.0,
            currency: "EGP",
            transaction_type: "consultation",
            status: "completed",
            payment_method: "card",
        },
    ];

    const { error: txError } = await supabase.from("transactions").insert(transactions);
    if (txError) {
        console.error("❌ Error inserting transactions:", txError);
    } else {
        console.log(`✅ Inserted ${transactions.length} transactions`);
    }

    // Step 11: Insert doctor earnings
    console.log("💵 Inserting doctor earnings...");

    const earnings = [
        {
            id: "00000007-0001-0001-0001-000000000001",
            doctor_profile_id: DOCTOR_PROFILE_ID,
            appointment_id: "aaaa0001-0001-0001-0001-000000000001",
            transaction_id: "00000006-0001-0001-0001-000000000001",
            gross_amount: 250.0,
            platform_fee: 25.0,
            net_amount: 225.0,
            status: "available",
            available_at: new Date().toISOString(),
        },
        {
            id: "00000007-0001-0001-0001-000000000002",
            doctor_profile_id: DOCTOR_PROFILE_ID,
            appointment_id: "aaaa0001-0001-0001-0001-000000000002",
            transaction_id: "00000006-0001-0001-0001-000000000002",
            gross_amount: 250.0,
            platform_fee: 25.0,
            net_amount: 225.0,
            status: "available",
            available_at: new Date().toISOString(),
        },
        {
            id: "00000007-0001-0001-0001-000000000010",
            doctor_profile_id: DOCTOR_PROFILE_ID,
            appointment_id: "aaaa0001-0001-0001-0001-000000000010",
            transaction_id: "00000006-0001-0001-0001-000000000010",
            gross_amount: 250.0,
            platform_fee: 25.0,
            net_amount: 225.0,
            status: "available",
            available_at: daysAgo(3, "12:00"),
        },
        {
            id: "00000007-0001-0001-0001-000000000011",
            doctor_profile_id: DOCTOR_PROFILE_ID,
            appointment_id: "aaaa0001-0001-0001-0001-000000000011",
            transaction_id: "00000006-0001-0001-0001-000000000011",
            gross_amount: 250.0,
            platform_fee: 25.0,
            net_amount: 225.0,
            status: "available",
            available_at: daysAgo(5, "15:00"),
        },
        {
            id: "00000007-0001-0001-0001-000000000012",
            doctor_profile_id: DOCTOR_PROFILE_ID,
            appointment_id: "aaaa0001-0001-0001-0001-000000000012",
            transaction_id: "00000006-0001-0001-0001-000000000012",
            gross_amount: 250.0,
            platform_fee: 25.0,
            net_amount: 225.0,
            status: "available",
            available_at: daysAgo(7, "11:00"),
        },
        {
            id: "00000007-0001-0001-0001-000000000015",
            doctor_profile_id: DOCTOR_PROFILE_ID,
            appointment_id: "aaaa0001-0001-0001-0001-000000000015",
            transaction_id: "00000006-0001-0001-0001-000000000015",
            gross_amount: 250.0,
            platform_fee: 25.0,
            net_amount: 225.0,
            status: "paid_out",
            available_at: daysAgo(14, "12:00"),
        },
        {
            id: "00000007-0001-0001-0001-000000000016",
            doctor_profile_id: DOCTOR_PROFILE_ID,
            appointment_id: "aaaa0001-0001-0001-0001-000000000016",
            transaction_id: "00000006-0001-0001-0001-000000000016",
            gross_amount: 250.0,
            platform_fee: 25.0,
            net_amount: 225.0,
            status: "paid_out",
            available_at: daysAgo(21, "16:00"),
        },
    ];

    const { error: earnError } = await supabase.from("doctor_earnings").insert(earnings);
    if (earnError) {
        console.error("❌ Error inserting doctor earnings:", earnError);
    } else {
        console.log(`✅ Inserted ${earnings.length} doctor earnings`);
    }

    // Step 12: Insert notifications
    console.log("🔔 Inserting notifications...");

    const notifications = [
        {
            id: "00000008-0001-0001-0001-000000000001",
            profile_id: DOCTOR_PROFILE_PROFILE_ID,
            title: "New Appointment",
            body: "Ahmed Hassan has booked an appointment for today at 2:00 PM.",
            notification_type: "new_appointment",
            data: { appointment_id: "aaaa0001-0001-0001-0001-000000000003" },
            is_read: false,
        },
        {
            id: "00000008-0001-0001-0001-000000000002",
            profile_id: DOCTOR_PROFILE_PROFILE_ID,
            title: "Patient in Waiting Room",
            body: "Ahmed Hassan is waiting for your consultation.",
            notification_type: "patient_waiting",
            data: { appointment_id: "aaaa0001-0001-0001-0001-000000000003" },
            is_read: false,
        },
        {
            id: "00000008-0001-0001-0001-000000000003",
            profile_id: DOCTOR_PROFILE_PROFILE_ID,
            title: "New Message",
            body: "You have a new message from Ahmed Hassan.",
            notification_type: "message",
            data: { conversation_id: "00000004-0001-0001-0001-000000000001" },
            is_read: false,
        },
        {
            id: "00000008-0001-0001-0001-000000000004",
            profile_id: DOCTOR_PROFILE_PROFILE_ID,
            title: "New Review",
            body: "Ahmed Hassan left you a 5-star review.",
            notification_type: "review",
            data: { review_id: "00000002-0001-0001-0001-000000000001" },
            is_read: true,
        },
        {
            id: "00000008-0001-0001-0001-000000000005",
            profile_id: DOCTOR_PROFILE_PROFILE_ID,
            title: "Appointment Tomorrow",
            body: "Reminder: You have an appointment with Ahmed Hassan tomorrow at 10:00 AM.",
            notification_type: "appointment_reminder",
            data: { appointment_id: "aaaa0001-0001-0001-0001-000000000020" },
            is_read: false,
        },
        {
            id: "00000008-0001-0001-0001-000000000006",
            profile_id: DOCTOR_PROFILE_PROFILE_ID,
            title: "Patient No-Show",
            body: "Fatima Ali did not attend the scheduled appointment yesterday.",
            notification_type: "no_show",
            data: { appointment_id: "aaaa0001-0001-0001-0001-000000000014" },
            is_read: true,
        },
    ];

    const { error: notifError } = await supabase.from("notifications").insert(notifications);
    if (notifError) {
        console.error("❌ Error inserting notifications:", notifError);
    } else {
        console.log(`✅ Inserted ${notifications.length} notifications`);
    }

    // Step 13: Update doctor profile stats
    console.log("📊 Updating doctor profile stats...");

    const { error: updateError } = await supabase
        .from("doctor_profiles")
        .update({
            rating_average: 4.75,
            rating_count: 4,
            total_consultations: 8,
        })
        .eq("id", DOCTOR_PROFILE_ID);

    if (updateError) {
        console.error("❌ Error updating doctor profile:", updateError);
    } else {
        console.log("✅ Updated doctor profile stats");
    }

    console.log("\n✨ Seed complete! Login as doctor2@tawari.test to see the data.");
}

runSeed().catch(console.error);
