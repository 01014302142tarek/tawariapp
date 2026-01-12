-- Fix RLS policy on profiles table to allow doctors to see patient profiles
-- Migration: 00011_fix_profiles_rls_for_doctors
--
-- Problem: Doctors cannot see patient names when querying appointments because
-- the RLS policy on the 'profiles' table doesn't allow doctors to read the base
-- profile of patients they have appointments with. The patient_profiles table
-- has a policy allowing this, but the inner join to 'profiles' fails.
--
-- Solution: Add a policy allowing doctors to read profiles of patients they have
-- appointments with.

-- ============================================================================
-- Helper function to check if a doctor has appointments with a profile
-- ============================================================================

CREATE OR REPLACE FUNCTION doctor_has_patient_profile(
    p_profile_id UUID,
    p_doctor_profile_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM appointments a
        JOIN patient_profiles pp ON pp.id = a.patient_profile_id
        JOIN doctor_profiles dp ON dp.id = a.doctor_profile_id
        WHERE pp.profile_id = p_profile_id
        AND dp.profile_id = p_doctor_profile_id
        AND a.status IN ('scheduled', 'in_waiting_room', 'in_progress', 'completed')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- Add policy for doctors to read patient profiles
-- ============================================================================

CREATE POLICY "Doctors can read patient profiles for appointments"
    ON profiles FOR SELECT
    USING (
        -- Allow doctors to read profiles of patients they have appointments with
        doctor_has_patient_profile(id, get_current_profile_id())
    );

-- ============================================================================
-- Also add policy for assistants to read patient profiles
-- ============================================================================

CREATE OR REPLACE FUNCTION assistant_has_patient_profile(
    p_profile_id UUID,
    p_assistant_profile_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM appointments a
        JOIN patient_profiles pp ON pp.id = a.patient_profile_id
        JOIN doctor_assistant_assignments daa ON daa.doctor_profile_id = a.doctor_profile_id
        JOIN assistant_profiles ap ON ap.id = daa.assistant_profile_id
        WHERE pp.profile_id = p_profile_id
        AND ap.profile_id = p_assistant_profile_id
        AND daa.status = 'active'
        AND a.status IN ('scheduled', 'in_waiting_room', 'in_progress', 'completed')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE POLICY "Assistants can read patient profiles for appointments"
    ON profiles FOR SELECT
    USING (
        assistant_has_patient_profile(id, get_current_profile_id())
    );
