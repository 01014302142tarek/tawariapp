-- ============================================================================
-- Migration: Fix handle_new_user to support Google OAuth provider
-- Google OAuth sends name/avatar_url in raw_user_meta_data, not fullName
-- Also ensures patient_profile is created for Google sign-in users
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
    v_role      public.user_role;
    v_avatar    TEXT;
BEGIN
    -- Extract full name: support Google OAuth ('name'), email signup ('fullName'/'full_name')
    v_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'fullName'), ''),
        split_part(NEW.email, '@', 1)
    );

    -- Extract role: Strictly restrict self-signup to 'patient' or 'doctor'.
    -- Privileged roles ('admin', etc.) can NEVER be self-assigned via user metadata.
    IF LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'role', 'patient'))) = 'doctor' THEN
        v_role := 'doctor'::public.user_role;
    ELSE
        v_role := 'patient'::public.user_role;
    END IF;

    -- Extract avatar (Google provides picture)
    v_avatar := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture'
    );

    -- Insert base profile
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

-- Re-create trigger (DROP first to avoid duplicate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

