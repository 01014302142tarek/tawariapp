-- ============================================================================
-- Fix Missing Patient Profiles
-- ============================================================================
-- This script ensures all users with role='patient' have a patient_profile record

-- Create patient_profiles for any patient who doesn't have one
INSERT INTO patient_profiles (
    profile_id,
    date_of_birth,
    gender,
    verification_level
)
SELECT 
    p.id as profile_id,
    '1990-01-01' as date_of_birth,  -- Default placeholder
    'other' as gender,               -- Default placeholder
    'unverified' as verification_level
FROM profiles p
WHERE p.role = 'patient'
AND NOT EXISTS (
    SELECT 1 FROM patient_profiles pp 
    WHERE pp.profile_id = p.id
)
ON CONFLICT (profile_id) DO NOTHING;

-- Verify the fix
SELECT 
    p.id as profile_id,
    p.user_id,
    p.full_name,
    p.email,
    pp.id as patient_profile_id,
    CASE 
        WHEN pp.id IS NULL THEN '❌ MISSING'
        ELSE '✅ EXISTS'
    END as status
FROM profiles p
LEFT JOIN patient_profiles pp ON pp.profile_id = p.id
WHERE p.role = 'patient'
ORDER BY p.created_at DESC;
