-- ============================================================================
-- Add RLS Policies for Messages Table
-- ============================================================================
-- This migration adds Row Level Security policies for the messages table
-- to allow users to send and receive messages

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Users can read messages where they are sender or recipient
CREATE POLICY "Users can read own messages"
    ON messages FOR SELECT
    USING (
        sender_profile_id = get_current_profile_id()
        OR recipient_profile_id = get_current_profile_id()
    );

-- Users can insert messages as sender
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (sender_profile_id = get_current_profile_id());

-- Users can update their own sent messages (for editing/deleting)
CREATE POLICY "Users can update own sent messages"
    ON messages FOR UPDATE
    USING (sender_profile_id = get_current_profile_id());

-- Users can mark messages as read if they are the recipient
CREATE POLICY "Users can mark received messages as read"
    ON messages FOR UPDATE
    USING (recipient_profile_id = get_current_profile_id());
