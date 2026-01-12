import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function checkInProgress() {
    const drNourDoctorProfileId = "db44e99b-5491-4241-b5a0-14d2668668bf";

    console.log("Checking all appointments for Dr. Nour...\n");

    const { data, error } = await supabase
        .from("appointments")
        .select("id, status, scheduled_start")
        .eq("doctor_profile_id", drNourDoctorProfileId)
        .order("scheduled_start", { ascending: false });

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    console.log(`Found ${data?.length || 0} appointments:\n`);

    // Group by status
    const byStatus: Record<string, typeof data> = {};
    data?.forEach(apt => {
        if (!byStatus[apt.status]) byStatus[apt.status] = [];
        byStatus[apt.status].push(apt);
    });

    Object.entries(byStatus).forEach(([status, appointments]) => {
        console.log(`=== ${status.toUpperCase()} (${appointments.length}) ===`);
        appointments.forEach(apt => {
            const date = new Date(apt.scheduled_start);
            console.log(`  ${apt.id.substring(0, 8)}... - ${date.toLocaleString()}`);
        });
        console.log("");
    });

    // Check for in_progress specifically
    const inProgress = data?.filter(apt => apt.status === "in_progress") || [];
    if (inProgress.length > 0) {
        console.log("\n*** IN-PROGRESS APPOINTMENTS TO RESET ***");
        inProgress.forEach(apt => {
            console.log(`ID: ${apt.id}`);
        });

        // Reset them
        console.log("\nResetting in-progress appointments to scheduled...");
        for (const apt of inProgress) {
            const { error: updateError } = await supabase
                .from("appointments")
                .update({
                    status: "scheduled",
                    actual_start: null,
                    actual_end: null,
                })
                .eq("id", apt.id);

            if (updateError) {
                console.error(`  Error resetting ${apt.id}: ${updateError.message}`);
            } else {
                console.log(`  ✓ Reset ${apt.id}`);
            }

            // Also delete consultation session
            await supabase
                .from("consultation_sessions")
                .delete()
                .eq("appointment_id", apt.id);
        }
        console.log("\nDone!");
    } else {
        console.log("No in-progress appointments found.");
    }
}

checkInProgress().catch(console.error);
