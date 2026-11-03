-- ============================================================================
-- Migration: 00021_secure_handle_new_user
-- Security Patch: Prevent Privilege Escalation via User Metadata
--
-- Restricts self-signup roles:
-- Only 'patient' and 'doctor' are allowed during self-registration.
-- 'admin', 'admin_assistant', 'doctor_assistant' cannot be self-assigned.
-- Any unknown or privileged role defaults strictly to 'patient'.
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
    v_raw_role  TEXT;
    v_role      public.user_role;
    v_avatar    TEXT;
BEGIN
    -- 1. Extract full name (support Google OAuth 'name', email signup 'fullName'/'full_name')
    v_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'fullName'), ''),
        split_part(NEW.email, '@', 1)
    );

    -- 2. Strictly validate role:
    -- Administrative roles ('admin', 'admin_assistant', 'doctor_assistant') must NEVER
    -- be granted via self-registration raw_user_meta_data.
    v_raw_role := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'role', 'patient')));

    IF v_raw_role = 'doctor' THEN
        v_role := 'doctor'::public.user_role;
    ELSE
        -- Default all other requests (including 'admin', tampered values, or null) to 'patient'
        v_role := 'patient'::public.user_role;
    END IF;

    -- 3. Extract avatar
    v_avatar := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture'
    );

    -- 4. Insert or update base profile
    INSERT INTO public.profiles (user_id, full_name, role, avatar_url)
    VALUES (NEW.id, v_full_name, v_role, v_avatar)
    ON CONFLICT (user_id) DO UPDATE
        SET
            full_name  = EXCLUDED.full_name,
            avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
            updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

