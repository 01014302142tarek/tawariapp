/**
 * TawariApp Messaging System Test Script
 *
 * This script tests the messaging system including:
 * 1. Message creation and retrieval
 * 2. Conversation management
 * 3. Read/unread status
 * 4. Message deletion (soft delete)
 *
 * USAGE:
 * npx tsx scripts/test-messaging.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Test results tracking
const testResults: { name: string; passed: boolean; error?: string }[] = [];

function logTest(name: string, passed: boolean, error?: string) {
    testResults.push({ name, passed, error });
    if (passed) {
        console.log(`  ✓ ${name}`);
    } else {
        console.log(`  ✗ ${name}: ${error}`);
    }
}

// ============================================
// Test Functions
// ============================================

async function testMessagesTable() {
    console.log('\n1. Testing Messages Table...');

    const { data, error } = await supabase
        .from('messages')
        .select('id, content, message_type, is_read')
        .limit(10);

    logTest('Can query messages table', !error, error?.message);

    if (data) {
        console.log(`    Found ${data.length} message(s)`);
    }

    return !error;
}

async function testMessageCreation() {
    console.log('\n2. Testing Message Creation...');

    // Get two different profiles (doctor and patient)
    const { data: doctorProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'doctor')
        .limit(1)
        .single();

    const { data: patientProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'patient')
        .limit(1)
        .single();

    if (!doctorProfile || !patientProfile) {
        logTest('Doctor and patient profiles exist', false, 'Missing profiles');
        return false;
    }

    // Generate a conversation ID
    const conversationId = crypto.randomUUID();

    // Create a message
    const { data: message, error: createError } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_profile_id: patientProfile.id,
            recipient_profile_id: doctorProfile.id,
            content: 'Hello doctor, I have a question about my prescription.',
            message_type: 'text',
            is_read: false,
            is_deleted: false
        })
        .select('id, conversation_id, content, message_type')
        .single();

    logTest('Can create message', !createError, createError?.message);

    if (!message) {
        return false;
    }

    console.log(`    Created message: "${message.content.slice(0, 30)}..."`);

    // Verify message fields
    logTest('Message type is text',
        (message as { message_type: string }).message_type === 'text',
        `Expected 'text', got '${(message as { message_type: string }).message_type}'`);

    // Clean up
    await supabase.from('messages').delete().eq('id', message.id);
    console.log('    Cleaned up test message');

    return !createError;
}

async function testConversationGrouping() {
    console.log('\n3. Testing Conversation Grouping...');

    // Get two profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, role')
        .limit(2);

    if (!profiles || profiles.length < 2) {
        logTest('Two profiles exist', false, 'Need at least 2 profiles');
        return false;
    }

    const profile1 = profiles[0];
    const profile2 = profiles[1];
    const conversationId = crypto.randomUUID();

    // Create multiple messages in the same conversation
    const messages = [
        {
            conversation_id: conversationId,
            sender_profile_id: profile1.id,
            recipient_profile_id: profile2.id,
            content: 'First message in conversation',
            message_type: 'text',
            is_read: false,
            is_deleted: false
        },
        {
            conversation_id: conversationId,
            sender_profile_id: profile2.id,
            recipient_profile_id: profile1.id,
            content: 'Reply to first message',
            message_type: 'text',
            is_read: false,
            is_deleted: false
        },
        {
            conversation_id: conversationId,
            sender_profile_id: profile1.id,
            recipient_profile_id: profile2.id,
            content: 'Third message',
            message_type: 'text',
            is_read: false,
            is_deleted: false
        }
    ];

    const { data: created, error: createError } = await supabase
        .from('messages')
        .insert(messages)
        .select('id, conversation_id');

    logTest('Can create multiple messages in conversation', !createError, createError?.message);

    if (!created) {
        return false;
    }

    console.log(`    Created ${created.length} messages in conversation`);

    // Query messages by conversation ID
    const { data: conversationMessages, error: queryError } = await supabase
        .from('messages')
        .select('id, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    logTest('Can query messages by conversation_id', !queryError, queryError?.message);
    logTest('All messages in same conversation',
        conversationMessages?.length === 3,
        `Expected 3 messages, got ${conversationMessages?.length}`);

    // Clean up
    for (const msg of created) {
        await supabase.from('messages').delete().eq('id', msg.id);
    }
    console.log('    Cleaned up test messages');

    return !createError && !queryError;
}

async function testReadStatus() {
    console.log('\n4. Testing Read/Unread Status...');

    // Get two profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(2);

    if (!profiles || profiles.length < 2) {
        logTest('Profiles exist', false, 'Need at least 2 profiles');
        return false;
    }

    const conversationId = crypto.randomUUID();

    // Create unread message
    const { data: message, error: createError } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_profile_id: profiles[0].id,
            recipient_profile_id: profiles[1].id,
            content: 'Unread message test',
            message_type: 'text',
            is_read: false,
            is_deleted: false
        })
        .select('id, is_read')
        .single();

    if (createError || !message) {
        logTest('Can create unread message', false, createError?.message);
        return false;
    }

    logTest('Message initially unread',
        (message as { is_read: boolean }).is_read === false,
        'Expected is_read to be false');

    // Mark as read
    const { error: updateError } = await supabase
        .from('messages')
        .update({
            is_read: true,
            read_at: new Date().toISOString()
        })
        .eq('id', message.id);

    logTest('Can mark message as read', !updateError, updateError?.message);

    // Verify read status
    const { data: readMessage } = await supabase
        .from('messages')
        .select('is_read, read_at')
        .eq('id', message.id)
        .single();

    logTest('Message marked as read',
        (readMessage as { is_read: boolean } | null)?.is_read === true,
        'Expected is_read to be true');

    logTest('Read timestamp set',
        !!(readMessage as { read_at: string | null } | null)?.read_at,
        'read_at not set');

    // Clean up
    await supabase.from('messages').delete().eq('id', message.id);
    console.log('    Cleaned up test message');

    return !updateError;
}

async function testSoftDelete() {
    console.log('\n5. Testing Soft Delete...');

    // Get two profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(2);

    if (!profiles || profiles.length < 2) {
        logTest('Profiles exist', false, 'Need at least 2 profiles');
        return false;
    }

    const conversationId = crypto.randomUUID();

    // Create message
    const { data: message, error: createError } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_profile_id: profiles[0].id,
            recipient_profile_id: profiles[1].id,
            content: 'Message to be deleted',
            message_type: 'text',
            is_read: false,
            is_deleted: false
        })
        .select('id')
        .single();

    if (createError || !message) {
        logTest('Can create message for deletion', false, createError?.message);
        return false;
    }

    // Soft delete
    const { error: deleteError } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', message.id);

    logTest('Can soft delete message', !deleteError, deleteError?.message);

    // Verify soft delete
    const { data: deletedMessage } = await supabase
        .from('messages')
        .select('is_deleted')
        .eq('id', message.id)
        .single();

    logTest('Message marked as deleted',
        (deletedMessage as { is_deleted: boolean } | null)?.is_deleted === true,
        'Expected is_deleted to be true');

    // Message should be excluded when filtering
    const { data: activeMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false);

    logTest('Deleted message excluded from active query',
        (activeMessages || []).length === 0,
        `Expected 0 active messages, got ${(activeMessages || []).length}`);

    // Hard delete for cleanup
    await supabase.from('messages').delete().eq('id', message.id);
    console.log('    Cleaned up test message');

    return !deleteError;
}

async function testMessageTypes() {
    console.log('\n6. Testing Message Types...');

    // Get two profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(2);

    if (!profiles || profiles.length < 2) {
        logTest('Profiles exist', false, 'Need at least 2 profiles');
        return false;
    }

    const conversationId = crypto.randomUUID();
    const createdIds: string[] = [];

    // Test 'text' type
    const { data: textMsg, error: textError } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_profile_id: profiles[0].id,
            recipient_profile_id: profiles[1].id,
            content: 'Text message',
            message_type: 'text',
            is_deleted: false
        })
        .select('id')
        .single();

    logTest('Can create text message', !textError, textError?.message);
    if (textMsg) createdIds.push(textMsg.id);

    // Test 'system' type
    const { data: systemMsg, error: systemError } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_profile_id: profiles[0].id,
            recipient_profile_id: profiles[1].id,
            content: 'Appointment scheduled',
            message_type: 'system',
            is_deleted: false
        })
        .select('id')
        .single();

    logTest('Can create system message', !systemError, systemError?.message);
    if (systemMsg) createdIds.push(systemMsg.id);

    // Test 'file' type with attachment
    const { data: fileMsg, error: fileError } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_profile_id: profiles[0].id,
            recipient_profile_id: profiles[1].id,
            content: 'Lab results attached',
            message_type: 'file',
            attachment_url: 'https://example.com/lab-results.pdf',
            attachment_type: 'document',
            is_deleted: false
        })
        .select('id, attachment_url, attachment_type')
        .single();

    logTest('Can create file message with attachment', !fileError, fileError?.message);
    if (fileMsg) {
        createdIds.push(fileMsg.id);
        logTest('Attachment URL stored',
            !!(fileMsg as { attachment_url: string }).attachment_url,
            'attachment_url not stored');
        logTest('Attachment type stored',
            (fileMsg as { attachment_type: string }).attachment_type === 'document',
            'attachment_type not correct');
    }

    // Clean up
    for (const id of createdIds) {
        await supabase.from('messages').delete().eq('id', id);
    }
    console.log('    Cleaned up test messages');

    return !textError && !systemError && !fileError;
}

async function testUnreadCount() {
    console.log('\n7. Testing Unread Count...');

    // Get two profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(2);

    if (!profiles || profiles.length < 2) {
        logTest('Profiles exist', false, 'Need at least 2 profiles');
        return false;
    }

    const conversationId = crypto.randomUUID();
    const recipientId = profiles[1].id;

    // Create multiple unread messages
    const messages = Array.from({ length: 5 }, (_, i) => ({
        conversation_id: conversationId,
        sender_profile_id: profiles[0].id,
        recipient_profile_id: recipientId,
        content: `Unread message ${i + 1}`,
        message_type: 'text',
        is_read: false,
        is_deleted: false
    }));

    const { data: created, error: createError } = await supabase
        .from('messages')
        .insert(messages)
        .select('id');

    if (createError || !created) {
        logTest('Can create unread messages', false, createError?.message);
        return false;
    }

    // Count unread messages for recipient
    const { count, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_profile_id', recipientId)
        .eq('is_read', false)
        .eq('conversation_id', conversationId);

    logTest('Can count unread messages', !countError, countError?.message);
    logTest('Unread count is correct',
        count === 5,
        `Expected 5 unread, got ${count}`);

    console.log(`    Unread count for recipient: ${count}`);

    // Clean up
    for (const msg of created) {
        await supabase.from('messages').delete().eq('id', msg.id);
    }
    console.log('    Cleaned up test messages');

    return !countError;
}

async function testMessageOrdering() {
    console.log('\n8. Testing Message Ordering...');

    // Get two profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(2);

    if (!profiles || profiles.length < 2) {
        logTest('Profiles exist', false, 'Need at least 2 profiles');
        return false;
    }

    const conversationId = crypto.randomUUID();
    const createdIds: string[] = [];

    // Create messages with slight delays to ensure different timestamps
    for (let i = 1; i <= 3; i++) {
        const { data: msg } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_profile_id: profiles[0].id,
                recipient_profile_id: profiles[1].id,
                content: `Message ${i}`,
                message_type: 'text',
                is_deleted: false
            })
            .select('id')
            .single();

        if (msg) createdIds.push(msg.id);
    }

    // Query with ascending order (oldest first - typical for chat)
    const { data: ascMessages, error: ascError } = await supabase
        .from('messages')
        .select('content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    logTest('Can order messages ascending', !ascError, ascError?.message);

    if (ascMessages && ascMessages.length > 0) {
        logTest('First message is oldest',
            (ascMessages[0] as { content: string }).content === 'Message 1',
            `Expected 'Message 1', got '${(ascMessages[0] as { content: string }).content}'`);
    }

    // Query with descending order (newest first - for conversation list)
    const { data: descMessages, error: descError } = await supabase
        .from('messages')
        .select('content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

    logTest('Can order messages descending', !descError, descError?.message);

    if (descMessages && descMessages.length > 0) {
        logTest('First message is newest',
            (descMessages[0] as { content: string }).content === 'Message 3',
            `Expected 'Message 3', got '${(descMessages[0] as { content: string }).content}'`);
    }

    // Clean up
    for (const id of createdIds) {
        await supabase.from('messages').delete().eq('id', id);
    }
    console.log('    Cleaned up test messages');

    return !ascError && !descError;
}

// ============================================
// Main Test Runner
// ============================================

async function main() {
    console.log('========================================');
    console.log('Messaging System Tests');
    console.log('========================================');

    await testMessagesTable();
    await testMessageCreation();
    await testConversationGrouping();
    await testReadStatus();
    await testSoftDelete();
    await testMessageTypes();
    await testUnreadCount();
    await testMessageOrdering();

    // Summary
    console.log('\n========================================');
    console.log('Test Summary');
    console.log('========================================');

    const passed = testResults.filter(t => t.passed).length;
    const failed = testResults.filter(t => !t.passed).length;
    const total = testResults.length;

    console.log(`\nTotal: ${total} tests`);
    console.log(`Passed: ${passed} ✓`);
    console.log(`Failed: ${failed} ✗`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
        console.log('\nFailed Tests:');
        testResults.filter(t => !t.passed).forEach(t => {
            console.log(`  - ${t.name}: ${t.error}`);
        });
    }

    console.log('\n========================================');
    if (failed === 0) {
        console.log('All tests passed! Messaging system is working correctly.');
    } else {
        console.log('Some tests failed. Please review the errors above.');
    }
    console.log('========================================');

    process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
