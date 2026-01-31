import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

// Create admin client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function fixConversationIds() {
    console.log("Fixing invalid conversation IDs in messages table...\n");

    // Fix conversation 1
    const { error: error1 } = await supabase
        .from("messages")
        .update({ conversation_id: "c0ff0001-0001-0001-0001-000000000001" })
        .eq("conversation_id", "conv0001-0001-0001-0001-000000000001");

    if (error1) {
        console.error("Error fixing conversation 1:", error1.message);
    } else {
        console.log("✓ Fixed conversation 1 (Ahmed's today appointment messages)");
    }

    // Fix conversation 2
    const { error: error2 } = await supabase
        .from("messages")
        .update({ conversation_id: "c0ff0001-0001-0001-0001-000000000002" })
        .eq("conversation_id", "conv0001-0001-0001-0001-000000000002");

    if (error2) {
        console.error("Error fixing conversation 2:", error2.message);
    } else {
        console.log("✓ Fixed conversation 2 (Fatima's follow-up messages)");
    }

    // Fix conversation 3
    const { error: error3 } = await supabase
        .from("messages")
        .update({ conversation_id: "c0ff0001-0001-0001-0001-000000000003" })
        .eq("conversation_id", "conv0001-0001-0001-0001-000000000003");

    if (error3) {
        console.error("Error fixing conversation 3:", error3.message);
    } else {
        console.log("✓ Fixed conversation 3 (Ahmed's prescription messages)");
    }

    // Verify the updates
    console.log("\nVerifying updates...\n");

    const { data: messages, error: verifyError } = await supabase
        .from("messages")
        .select("id, conversation_id, content, sender_profile_id, recipient_profile_id")
        .order("conversation_id")
        .order("created_at");

    if (verifyError) {
        console.error("Error verifying:", verifyError.message);
    } else {
        console.log(`Found ${messages?.length || 0} messages total:\n`);

        // Group by conversation
        const byConversation = new Map<string, typeof messages>();
        messages?.forEach((msg) => {
            const convId = msg.conversation_id;
            if (!byConversation.has(convId)) {
                byConversation.set(convId, []);
            }
            byConversation.get(convId)!.push(msg);
        });

        byConversation.forEach((msgs, convId) => {
            console.log(`Conversation: ${convId}`);
            console.log(`  Messages: ${msgs.length}`);
            msgs.forEach((msg) => {
                const preview = msg.content.substring(0, 50) + (msg.content.length > 50 ? "..." : "");
                console.log(`    - ${preview}`);
            });
            console.log("");
        });
    }

    console.log("Done!");
}

fixConversationIds().catch(console.error);
