-- ============================================================================
-- Security Hardening Migration
-- ============================================================================
-- Migration: 00019_security_hardening
--
-- 1. Restrict notification insertion to prevent arbitrary notification injection/phishing
-- 2. Restrict consultation_notes to protect doctor private notes
-- ============================================================================

-- 1. Restrict notification INSERT: Only allow users to create notifications for themselves,
--    or if they are admins. System notifications are inserted using the service role client.
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own or admin notifications" ON notifications;

CREATE POLICY "Users can insert own or admin notifications"
    ON notifications FOR INSERT
    WITH CHECK (
        profile_id = get_current_profile_id()
        OR is_admin()
    );

-- 2. Ensure consultation_notes private_notes cannot be updated by patients
DROP POLICY IF EXISTS "Patients cannot update consultation notes" ON consultation_notes;
CREATE POLICY "Patients cannot update consultation notes"
    ON consultation_notes FOR UPDATE
    USING (false);
