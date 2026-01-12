import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function checkMessages() {
    // Get all messages for Dr. Nour (doctor2)
    const drNourProfileId = "04dc906b-a477-4f3f-82df-30e15be19332";

    console.log("Checking messages for Dr. Nour...\n");

    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_profile_id.eq.${drNourProfileId},recipient_profile_id.eq.${drNourProfileId}`)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    console.log(`Found ${data?.length || 0} messages for Dr. Nour:\n`);

    data?.forEach((msg) => {
        const isSender = msg.sender_profile_id === drNourProfileId;
        console.log(`ID: ${msg.id}`);
        console.log(`Conversation: ${msg.conversation_id}`);
        console.log(`Direction: ${isSender ? "SENT" : "RECEIVED"}`);
        console.log(`Content: ${msg.content.substring(0, 60)}...`);
        console.log(`Read: ${msg.is_read}`);
        console.log("---");
    });
}

checkMessages().catch(console.error);
