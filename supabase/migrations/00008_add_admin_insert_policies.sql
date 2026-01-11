-- Migration: Add INSERT policies for admins to create users
-- This allows admins to create new users through the admin panel

-- ============================================================================
-- PROFILES TABLE - Allow admins to insert new profiles
-- ============================================================================

CREATE POLICY "Admins can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (is_admin());

-- ============================================================================
-- PATIENT_PROFILES TABLE - Allow admins to insert patient profiles
-- ============================================================================

CREATE POLICY "Admins can insert patient profiles"
    ON patient_profiles FOR INSERT
    WITH CHECK (is_admin());

-- ============================================================================
-- DOCTOR_PROFILES TABLE - Allow admins to insert doctor profiles
-- ============================================================================

CREATE POLICY "Admins can insert doctor profiles"
    ON doctor_profiles FOR INSERT
    WITH CHECK (is_admin());

-- ============================================================================
-- ADMIN_PROFILES TABLE - Allow admins to insert admin profiles
-- ============================================================================

CREATE POLICY "Admins can insert admin profiles"
    ON admin_profiles FOR INSERT
    WITH CHECK (is_admin());

-- ============================================================================
-- DOCTOR_SPECIALIZATIONS TABLE - Allow admins to insert specializations
-- ============================================================================

CREATE POLICY "Admins can insert doctor specializations"
    ON doctor_specializations FOR INSERT
    WITH CHECK (is_admin());
