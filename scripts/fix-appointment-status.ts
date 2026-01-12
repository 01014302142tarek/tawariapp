import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function fixAppointmentStatus() {
    const drNourDoctorProfileId = "db44e99b-5491-4241-b5a0-14d2668668bf";

    console.log("Finding recently completed appointments for Dr. Nour...\n");

    // Get completed appointments ordered by most recent
    const { data, error } = await supabase
        .from("appointments")
        .select("id, status, scheduled_start, actual_start, actual_end, patient_profile_id")
        .eq("doctor_profile_id", drNourDoctorProfileId)
        .eq("status", "completed")
        .order("actual_end", { ascending: false, nullsFirst: false })
        .limit(5);

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    console.log("Recently completed appointments:\n");
    data?.forEach((apt, i) => {
        const scheduledDate = new Date(apt.scheduled_start);
        const endedAt = apt.actual_end ? new Date(apt.actual_end) : null;
        console.log(`${i + 1}. ID: ${apt.id}`);
        console.log(`   Scheduled: ${scheduledDate.toLocaleString()}`);
        console.log(`   Ended at: ${endedAt?.toLocaleString() || "N/A"}`);
        console.log("");
    });

    // Find the most recently ended one (likely the accidental one)
    const mostRecent = data?.[0];
    if (!mostRecent) {
        console.log("No completed appointments found.");
        return;
    }

    console.log(`\nResetting appointment ${mostRecent.id} to 'scheduled' status...`);

    // Reset to scheduled
    const { error: updateError } = await supabase
        .from("appointments")
        .update({
            status: "scheduled",
            actual_start: null,
            actual_end: null,
        })
        .eq("id", mostRecent.id);

    if (updateError) {
        console.error("Error updating:", updateError.message);
        return;
    }

    // Also delete any consultation session for this appointment
    const { error: deleteSessionError } = await supabase
        .from("consultation_sessions")
        .delete()
        .eq("appointment_id", mostRecent.id);

    if (deleteSessionError) {
        console.log("Note: Could not delete consultation session:", deleteSessionError.message);
    } else {
        console.log("Deleted associated consultation session.");
    }

    console.log("\n✓ Appointment reset to 'scheduled' status!");
    console.log("You can now click 'Start Meeting' again.");
}

fixAppointmentStatus().catch(console.error);
