import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function fixConversationIds() {
    console.log("Fixing conversation IDs to use proper UUID v4 format...\n");

    // Get all unique conversation IDs for Dr. Nour's messages
    const drNourProfileId = "04dc906b-a477-4f3f-82df-30e15be19332";

    const { data: messages, error } = await supabase
        .from("messages")
        .select("conversation_id")
        .or(`sender_profile_id.eq.${drNourProfileId},recipient_profile_id.eq.${drNourProfileId}`);

    if (error) {
        console.error("Error fetching messages:", error.message);
        return;
    }

    // Get unique conversation IDs
    const uniqueConvIds = [...new Set(messages?.map((m) => m.conversation_id))];
    console.log(`Found ${uniqueConvIds.length} unique conversations:`, uniqueConvIds);

    // Generate new proper UUIDs for each conversation
    const conversationMapping: Record<string, string> = {};

    for (const oldId of uniqueConvIds) {
        // Generate a proper UUID v4
        const newId = randomUUID();
        conversationMapping[oldId] = newId;

        console.log(`\nUpdating conversation: ${oldId} -> ${newId}`);

        const { error: updateError } = await supabase
            .from("messages")
            .update({ conversation_id: newId })
            .eq("conversation_id", oldId);

        if (updateError) {
            console.error(`  Error: ${updateError.message}`);
        } else {
            console.log(`  Success!`);
        }
    }

    // Verify the updates
    console.log("\n\nVerifying updates...\n");

    const { data: updatedMessages, error: verifyError } = await supabase
        .from("messages")
        .select("id, conversation_id, content")
        .or(`sender_profile_id.eq.${drNourProfileId},recipient_profile_id.eq.${drNourProfileId}`)
        .order("conversation_id")
        .order("created_at");

    if (verifyError) {
        console.error("Error verifying:", verifyError.message);
    } else {
        console.log(`Found ${updatedMessages?.length || 0} messages:\n`);

        // Group by conversation
        const byConversation = new Map<string, typeof updatedMessages>();
        updatedMessages?.forEach((msg) => {
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

    console.log("Done! Conversation IDs have been updated to proper UUID v4 format.");
}

fixConversationIds().catch(console.error);
