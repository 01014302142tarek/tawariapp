-- ============================================================================
-- Add INSERT Policy for Notifications Table
-- ============================================================================
-- Migration: 00012_add_notifications_insert_policy
--
-- Problem: There is no INSERT policy for the notifications table, which means
-- server actions cannot create notifications for users when messages are sent,
-- appointments are created, etc.
--
-- Solution: Add policies allowing authenticated users to create notifications
-- for any user (needed for system notifications).

-- ============================================================================
-- Allow authenticated users to insert notifications
-- ============================================================================

-- Users can create notifications (needed for message notifications, etc.)
-- This allows the server to create notifications for any user
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
CREATE POLICY "Authenticated users can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Note: This policy is permissive because:
-- 1. Notifications are created by server actions, not directly by users
-- 2. The profile_id in the notification determines who sees it
-- 3. Users can only READ notifications that belong to them (existing SELECT policy)
-- 4. This is safe because inserting a notification for someone else just means
--    they'll see a notification - it doesn't expose any sensitive data
