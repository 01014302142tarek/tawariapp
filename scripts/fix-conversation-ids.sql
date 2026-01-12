-- ============================================================================
-- Fix Invalid Conversation IDs in Messages Table
-- ============================================================================
-- Problem: The seeded conversation IDs are not valid UUIDs.
-- 'conv0001-0001-0001-0001-000000000001' contains 'o', 'n', 'v' which are not hex digits.
-- This causes validation errors when trying to send messages via the app.
--
-- Solution: Update to valid UUID format using all hex digits (0-9, a-f).
-- Using 'c0ff0001' as prefix (valid hex) instead of 'conv0001' (invalid).
--
-- RUN THIS IN THE SUPABASE SQL EDITOR TO FIX EXISTING DATA
-- ============================================================================

-- Update conversation 1: Ahmed's messages about today's appointment
UPDATE messages
SET conversation_id = 'c0ff0001-0001-0001-0001-000000000001'
WHERE conversation_id = 'conv0001-0001-0001-0001-000000000001';

-- Update conversation 2: Fatima's follow-up question
UPDATE messages
SET conversation_id = 'c0ff0001-0001-0001-0001-000000000002'
WHERE conversation_id = 'conv0001-0001-0001-0001-000000000002';

-- Update conversation 3: Ahmed's older prescription question
UPDATE messages
SET conversation_id = 'c0ff0001-0001-0001-0001-000000000003'
WHERE conversation_id = 'conv0001-0001-0001-0001-000000000003';

-- Also fix message IDs (mmmm -> a0a0) for consistency
-- The message IDs are stored but rarely validated, but let's fix them anyway
UPDATE messages
SET id = REPLACE(id::text, 'mmmm', 'a0a0')::uuid
WHERE id::text LIKE 'mmmm%';

-- Verify the updates
SELECT
    id,
    conversation_id,
    LEFT(content, 50) as content_preview,
    sender_profile_id,
    recipient_profile_id
FROM messages
ORDER BY conversation_id, created_at;
