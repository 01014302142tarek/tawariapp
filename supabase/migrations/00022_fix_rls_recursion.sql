-- Migration: 00022_fix_rls_recursion.sql
-- Fix PostgreSQL infinite recursion detected in policy for relation "doctor_assistant_assignments" and "profiles"
--
-- Problem: Helper functions used inside RLS policies (e.g. get_current_profile_id, assistant_has_patient_profile)
-- executed without row_security = off. When a query touched profiles or messages, the RLS policy checked
-- doctor_assistant_assignments, which checked get_current_profile_id(), which checked profiles, resulting in
-- "infinite recursion detected in policy for relation 'doctor_assistant_assignments'".
--
-- Solution:
-- 1. Redefine security helper functions with SECURITY DEFINER, SET search_path = public, and SET row_security = off.
-- 2. Guard assistant and doctor policies with quick role checks so they short-circuit immediately.

-- ============================================================================
-- 1. Core Profile / Auth Helper Functions with row_security = off
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_profile_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
    SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
    SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    );
$$;

-- ============================================================================
-- 2. Doctor / Assistant Check Functions with row_security = off & Role Guards
-- ============================================================================

CREATE OR REPLACE FUNCTION doctor_has_patient_profile(
    p_profile_id UUID,
    p_doctor_profile_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
BEGIN
    IF p_doctor_profile_id IS NULL OR p_profile_id IS NULL THEN
        RETURN FALSE;
    END IF;

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
$$;

CREATE OR REPLACE FUNCTION assistant_has_patient_profile(
    p_profile_id UUID,
    p_assistant_profile_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
BEGIN
    IF p_assistant_profile_id IS NULL OR p_profile_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Fast-exit if caller is not an assistant
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = p_assistant_profile_id
        AND role IN ('doctor_assistant', 'admin_assistant')
    ) THEN
        RETURN FALSE;
    END IF;

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
$$;

CREATE OR REPLACE FUNCTION doctor_has_patient_appointment(
    p_patient_profile_id UUID,
    p_doctor_profile_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
BEGIN
    IF p_doctor_profile_id IS NULL OR p_patient_profile_id IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM appointments a
        JOIN doctor_profiles dp ON dp.id = a.doctor_profile_id
        WHERE a.patient_profile_id = p_patient_profile_id
        AND dp.profile_id = p_doctor_profile_id
        AND a.status IN ('scheduled', 'in_waiting_room', 'in_progress', 'completed')
    );
END;
$$;

CREATE OR REPLACE FUNCTION assistant_has_patient_appointment(
    p_patient_profile_id UUID,
    p_assistant_profile_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
BEGIN
    IF p_assistant_profile_id IS NULL OR p_patient_profile_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Fast-exit if caller is not an assistant
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = p_assistant_profile_id
        AND role IN ('doctor_assistant', 'admin_assistant')
    ) THEN
        RETURN FALSE;
    END IF;

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
$$;

-- ============================================================================
-- 3. Update Profiles Policies with Guarded Conditions
-- ============================================================================

DROP POLICY IF EXISTS "Doctors can read patient profiles for appointments" ON profiles;
CREATE POLICY "Doctors can read patient profiles for appointments"
    ON profiles FOR SELECT
    USING (
        get_current_user_role() = 'doctor'
        AND doctor_has_patient_profile(id, get_current_profile_id())
    );

DROP POLICY IF EXISTS "Assistants can read patient profiles for appointments" ON profiles;
CREATE POLICY "Assistants can read patient profiles for appointments"
    ON profiles FOR SELECT
    USING (
        get_current_user_role() IN ('doctor_assistant', 'admin_assistant')
        AND assistant_has_patient_profile(id, get_current_profile_id())
    );

DROP POLICY IF EXISTS "Doctors can read patient profiles during consultations" ON patient_profiles;
CREATE POLICY "Doctors can read patient profiles during consultations"
    ON patient_profiles FOR SELECT
    USING (
        get_current_user_role() = 'doctor'
        AND doctor_has_patient_appointment(id, get_current_profile_id())
    );

DROP POLICY IF EXISTS "Assistants can read patient profiles during consultations" ON patient_profiles;
CREATE POLICY "Assistants can read patient profiles during consultations"
    ON patient_profiles FOR SELECT
    USING (
        get_current_user_role() IN ('doctor_assistant', 'admin_assistant')
        AND assistant_has_patient_appointment(id, get_current_profile_id())
    );

-- ============================================================================
-- 4. Guard Messages INSERT Policy for Assistants
-- ============================================================================

DROP POLICY IF EXISTS "Assistants can send messages for doctor" ON messages;
CREATE POLICY "Assistants can send messages for doctor"
    ON messages FOR INSERT
    WITH CHECK (
        get_current_user_role() IN ('doctor_assistant', 'admin_assistant')
        AND EXISTS (
            SELECT 1 FROM doctor_assistant_assignments daa
            JOIN assistant_profiles ap ON ap.id = daa.assistant_profile_id
            JOIN doctor_profiles dp ON dp.id = daa.doctor_profile_id
            WHERE ap.profile_id = get_current_profile_id()
            AND dp.profile_id = sent_on_behalf_of
            AND daa.status = 'active'
            AND daa.can_send_messages = true
        )
    );


