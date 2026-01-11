import { createClient } from "@/lib/supabase/server";

async function testPatientsQuery() {
    const supabase = await createClient();

    console.log("Testing patient profiles query...");

    // Test 1: Check if patient_profiles table exists and has data
    const { data: profiles, error: profilesError, count } = await supabase
        .from("patient_profiles")
        .select("*", { count: "exact" });

    console.log("\n=== Test 1: Raw patient_profiles ===");
    console.log("Count:", count);
    console.log("Error:", profilesError);
    console.log("Data:", profiles);

    // Test 2: Check the join with profiles table
    const { data: joinData, error: joinError } = await supabase
        .from("patient_profiles")
        .select(`
            id,
            profile_id,
            date_of_birth,
            gender,
            blood_type,
            profiles!inner (
                id,
                full_name,
                avatar_url,
                created_at
            )
        `);

    console.log("\n=== Test 2: Patient profiles with join ===");
    console.log("Error:", joinError);
    console.log("Data:", joinData);

    // Test 3: Check profiles table
    const { data: baseProfiles, error: baseError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "patient");

    console.log("\n=== Test 3: Base profiles with role=patient ===");
    console.log("Error:", baseError);
    console.log("Data:", baseProfiles);
}

testPatientsQuery().catch(console.error);
