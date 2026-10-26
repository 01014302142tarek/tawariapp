-- Migration: Add INSERT policies for admins to create users
-- This allows admins to create new users through the admin panel

-- ============================================================================
-- PROFILES TABLE - Allow admins to insert new profiles
-- ============================================================================

DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
CREATE POLICY "Admins can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (is_admin());

-- ============================================================================
-- PATIENT_PROFILES TABLE - Allow admins to insert patient profiles
-- ============================================================================

DROP POLICY IF EXISTS "Admins can insert patient profiles" ON patient_profiles;
CREATE POLICY "Admins can insert patient profiles"
    ON patient_profiles FOR INSERT
    WITH CHECK (is_admin());

-- ============================================================================
-- DOCTOR_PROFILES TABLE - Allow admins to insert doctor profiles
-- ============================================================================

DROP POLICY IF EXISTS "Admins can insert doctor profiles" ON doctor_profiles;
CREATE POLICY "Admins can insert doctor profiles"
    ON doctor_profiles FOR INSERT
    WITH CHECK (is_admin());

-- ============================================================================
-- ADMIN_PROFILES TABLE - Allow admins to insert admin profiles
-- ============================================================================

DROP POLICY IF EXISTS "Admins can insert admin profiles" ON admin_profiles;
CREATE POLICY "Admins can insert admin profiles"
    ON admin_profiles FOR INSERT
    WITH CHECK (is_admin());

-- ============================================================================
-- DOCTOR_SPECIALIZATIONS TABLE - Allow admins to insert specializations
-- ============================================================================

DROP POLICY IF EXISTS "Admins can insert doctor specializations" ON doctor_specializations;
CREATE POLICY "Admins can insert doctor specializations"
    ON doctor_specializations FOR INSERT
    WITH CHECK (is_admin());
