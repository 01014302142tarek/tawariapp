-- ============================================================================
-- Fix Consultation Sessions INSERT Policy
-- ============================================================================
-- Migration: 00013_fix_consultation_sessions_insert
--
-- Problem: The existing "Doctors can manage consultation sessions" policy uses
-- USING clause which works for SELECT/UPDATE/DELETE but for INSERT we need
-- WITH CHECK to validate the new row being inserted.
--
-- Solution: Add a separate INSERT policy with WITH CHECK clause.

-- ============================================================================
-- Add INSERT policy for doctors to create consultation sessions
-- ============================================================================

-- Drop the ALL policy and create separate policies for better control
DROP POLICY IF EXISTS "Doctors can manage consultation sessions" ON consultation_sessions;

-- Policy for SELECT (keep as is)
CREATE POLICY "Doctors can read consultation sessions"
    ON consultation_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.id = consultation_sessions.appointment_id
            AND a.doctor_profile_id IN (
                SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
            )
        )
    );

-- Policy for INSERT with WITH CHECK
CREATE POLICY "Doctors can create consultation sessions"
    ON consultation_sessions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.id = appointment_id  -- Reference the new row's appointment_id
            AND a.doctor_profile_id IN (
                SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
            )
        )
    );

-- Policy for UPDATE
CREATE POLICY "Doctors can update consultation sessions"
    ON consultation_sessions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.id = consultation_sessions.appointment_id
            AND a.doctor_profile_id IN (
                SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
            )
        )
    );

-- Policy for DELETE
CREATE POLICY "Doctors can delete consultation sessions"
    ON consultation_sessions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.id = consultation_sessions.appointment_id
            AND a.doctor_profile_id IN (
                SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
            )
        )
    );
