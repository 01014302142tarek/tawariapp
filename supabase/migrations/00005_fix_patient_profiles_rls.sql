-- Fix infinite recursion in patient_profiles RLS policies
-- Migration: 00005_fix_patient_profiles_rls
--
-- Problem: The policy "Doctors can read patient profiles during consultations"
-- references patient_profiles.id inside a policy ON patient_profiles, causing
-- infinite recursion when PostgreSQL tries to check row-level security.
--
-- Solution: Create a helper function that bypasses RLS (SECURITY DEFINER) to
-- check if a doctor has appointments with a patient.

-- ============================================================================
-- STEP 1: Create helper function to break the recursion
-- ============================================================================

-- This function checks if a doctor (identified by their profile_id) has any
-- appointments with a specific patient_profile_id. It uses SECURITY DEFINER
-- to bypass RLS and prevent infinite recursion.
CREATE OR REPLACE FUNCTION doctor_has_patient_appointment(
    p_patient_profile_id UUID,
    p_doctor_profile_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM appointments a
        JOIN doctor_profiles dp ON dp.id = a.doctor_profile_id
        WHERE a.patient_profile_id = p_patient_profile_id
        AND dp.profile_id = p_doctor_profile_id
        AND a.status IN ('scheduled', 'in_waiting_room', 'in_progress', 'completed')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- STEP 2: Drop the problematic policy
-- ============================================================================

DROP POLICY IF EXISTS "Doctors can read patient profiles during consultations" ON patient_profiles;

-- ============================================================================
-- STEP 3: Recreate the policy using the helper function
-- ============================================================================

-- The new policy uses the helper function instead of a direct subquery,
-- which prevents the infinite recursion.
CREATE POLICY "Doctors can read patient profiles during consultations"
    ON patient_profiles FOR SELECT
    USING (
        doctor_has_patient_appointment(id, get_current_profile_id())
    );

-- ============================================================================
-- STEP 4: Also fix the assistant policy that has the same issue
-- ============================================================================

DROP POLICY IF EXISTS "Assistants can read patient profiles during consultations" ON patient_profiles;

-- Create helper function for assistants
CREATE OR REPLACE FUNCTION assistant_has_patient_appointment(
    p_patient_profile_id UUID,
    p_assistant_profile_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM appointments a
        JOIN doctor_assistant_assignments daa ON daa.doctor_profile_id = a.doctor_profile_id
        JOIN assistant_profiles ap ON ap.id = daa.assistant_profile_id
        WHERE a.patient_profile_id = p_patient_profile_id
        AND ap.profile_id = p_assistant_profile_id
        AND daa.status = 'active'
        AND a.status IN ('scheduled', 'in_waiting_room', 'in_progress', 'completed')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate the assistant policy
CREATE POLICY "Assistants can read patient profiles during consultations"
    ON patient_profiles FOR SELECT
    USING (
        assistant_has_patient_appointment(id, get_current_profile_id())
    );

-- ============================================================================
-- VERIFICATION: Test the policies work without recursion
-- ============================================================================

-- You can test by running:
-- SELECT * FROM patient_profiles LIMIT 1;
-- If this completes without "infinite recursion detected" error, the fix works.
