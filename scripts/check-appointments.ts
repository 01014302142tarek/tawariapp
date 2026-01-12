import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const uuidSchema = z.string().uuid();

async function checkAppointments() {
    const drNourDoctorProfileId = "db44e99b-5491-4241-b5a0-14d2668668bf";

    console.log("Checking appointments for Dr. Nour...\n");

    const { data, error } = await supabase
        .from("appointments")
        .select("id, status, scheduled_start, patient_profile_id")
        .eq("doctor_profile_id", drNourDoctorProfileId)
        .order("scheduled_start", { ascending: false });

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    console.log(`Found ${data?.length || 0} appointments:\n`);

    data?.forEach((apt) => {
        const isValidUUID = uuidSchema.safeParse(apt.id).success;
        const date = new Date(apt.scheduled_start);
        console.log(`ID: ${apt.id}`);
        console.log(`  Status: ${apt.status}`);
        console.log(`  Date: ${date.toLocaleString()}`);
        console.log(`  Valid UUID: ${isValidUUID ? "✓" : "✗ INVALID"}`);
        console.log("");
    });

    // Find appointments that can start (scheduled or in_waiting_room)
    const startable = data?.filter(apt =>
        apt.status === "scheduled" || apt.status === "in_waiting_room"
    );

    console.log(`\n${startable?.length || 0} appointments can start a consultation:`);
    startable?.forEach(apt => {
        const isValidUUID = uuidSchema.safeParse(apt.id).success;
        console.log(`  - ${apt.id} (${apt.status}) - UUID: ${isValidUUID ? "✓" : "✗"}`);
    });
}

checkAppointments().catch(console.error);
