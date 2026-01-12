import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function fixAppointmentIds() {
    const drNourDoctorProfileId = "db44e99b-5491-4241-b5a0-14d2668668bf";

    console.log("Fixing appointment IDs to proper UUID v4 format...\n");

    // Get all appointments for Dr. Nour
    const { data: appointments, error } = await supabase
        .from("appointments")
        .select("id, status")
        .eq("doctor_profile_id", drNourDoctorProfileId);

    if (error) {
        console.error("Error fetching appointments:", error.message);
        return;
    }

    console.log(`Found ${appointments?.length || 0} appointments to fix.\n`);

    // For each appointment, we need to:
    // 1. Create a new appointment with a proper UUID
    // 2. Update all related records (transactions, reviews, consultation_sessions, etc.)
    // 3. Delete the old appointment

    // Since this is complex with foreign keys, let's use a different approach:
    // Just regenerate the appointment IDs directly where possible

    for (const apt of appointments || []) {
        const oldId = apt.id;
        const newId = randomUUID();

        console.log(`Updating ${oldId} -> ${newId} (${apt.status})`);

        // First, update all related tables that reference this appointment
        // consultation_sessions
        await supabase
            .from("consultation_sessions")
            .update({ appointment_id: newId })
            .eq("appointment_id", oldId);

        // consultation_notes
        await supabase
            .from("consultation_notes")
            .update({ appointment_id: newId })
            .eq("appointment_id", oldId);

        // transactions
        await supabase
            .from("transactions")
            .update({ appointment_id: newId })
            .eq("appointment_id", oldId);

        // reviews
        await supabase
            .from("reviews")
            .update({ appointment_id: newId })
            .eq("appointment_id", oldId);

        // prescriptions
        await supabase
            .from("prescriptions")
            .update({ appointment_id: newId })
            .eq("appointment_id", oldId);

        // doctor_earnings
        await supabase
            .from("doctor_earnings")
            .update({ appointment_id: newId })
            .eq("appointment_id", oldId);

        // invoices
        await supabase
            .from("invoices")
            .update({ appointment_id: newId })
            .eq("appointment_id", oldId);

        // Now update the appointment itself
        // We can't update the primary key directly, so we need to:
        // 1. Insert a new row with the new ID
        // 2. Delete the old row

        // Get the full appointment data
        const { data: fullApt } = await supabase
            .from("appointments")
            .select("*")
            .eq("id", oldId)
            .single();

        if (fullApt) {
            // Insert new appointment with new ID
            const newApt = { ...fullApt, id: newId };
            const { error: insertError } = await supabase
                .from("appointments")
                .insert(newApt);

            if (insertError) {
                console.error(`  Error inserting new appointment: ${insertError.message}`);
                continue;
            }

            // Delete old appointment
            const { error: deleteError } = await supabase
                .from("appointments")
                .delete()
                .eq("id", oldId);

            if (deleteError) {
                console.error(`  Error deleting old appointment: ${deleteError.message}`);
                // Try to rollback by deleting the new one
                await supabase.from("appointments").delete().eq("id", newId);
                continue;
            }

            console.log(`  ✓ Updated successfully`);
        }
    }

    console.log("\nDone! Verifying...\n");

    // Verify
    const { data: updated } = await supabase
        .from("appointments")
        .select("id, status")
        .eq("doctor_profile_id", drNourDoctorProfileId)
        .order("scheduled_start", { ascending: false });

    console.log("Updated appointments:");
    updated?.forEach(apt => {
        console.log(`  - ${apt.id} (${apt.status})`);
    });
}

fixAppointmentIds().catch(console.error);
