-- ============================================================================
-- TawariApp Test Users Seeding Script
-- ============================================================================
--
-- This script creates 6 test users (2 patients, 2 doctors, 2 admins) with
-- comprehensive dummy data for testing all features of the application.
--
-- ============================================================================
-- HOW TO USE THIS SCRIPT
-- ============================================================================
--
-- OPTION A: Using Supabase Dashboard (RECOMMENDED)
-- ------------------------------------------------
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Create each user with the credentials below using "Create new user"
-- 3. Note the generated UUIDs for each user
-- 4. Update the UUIDs in this script's STEP 1 section OR
--    Skip STEP 1 entirely and run from STEP 2 onwards using your UUIDs
-- 5. Run the remaining script in SQL Editor
--
-- OPTION B: Direct SQL Insert (May not work on all Supabase projects)
-- -------------------------------------------------------------------
-- Run this entire script in Supabase SQL Editor.
-- Note: Direct inserts to auth.users may fail due to Supabase's auth architecture.
-- If STEP 1 fails, use Option A above.
--
-- ============================================================================
-- TEST ACCOUNT CREDENTIALS
-- ============================================================================
--
-- PATIENTS:
--   1. patient1@tawari.test / TawariPatient1!2024
--      user_id: 22222222-2222-2222-2222-222222222201
--   2. patient2@tawari.test / TawariPatient2!2024
--      user_id: 22222222-2222-2222-2222-222222222202
--
-- DOCTORS:
--   1. doctor1@tawari.test / TawariDoctor1!2024
--      user_id: 22222222-2222-2222-2222-222222222301
--   2. doctor2@tawari.test / TawariDoctor2!2024
--      user_id: 22222222-2222-2222-2222-222222222302
--
-- ADMINS:
--   1. admin1@tawari.test / TawariAdmin1!2024
--      user_id: 22222222-2222-2222-2222-222222222401
--   2. admin2@tawari.test / TawariAdmin2!2024
--      user_id: 22222222-2222-2222-2222-222222222402
--
-- ============================================================================
-- UUID REFERENCE TABLE
-- ============================================================================
--
-- Auth Users (user_id) - referenced by profiles.user_id:
--   Patient 1: 22222222-2222-2222-2222-222222222201
--   Patient 2: 22222222-2222-2222-2222-222222222202
--   Doctor 1:  22222222-2222-2222-2222-222222222301
--   Doctor 2:  22222222-2222-2222-2222-222222222302
--   Admin 1:   22222222-2222-2222-2222-222222222401
--   Admin 2:   22222222-2222-2222-2222-222222222402
--
-- Profiles (profile_id) - base profile for all users:
--   Patient 1: 33333333-3333-3333-3333-333333333201
--   Patient 2: 33333333-3333-3333-3333-333333333202
--   Doctor 1:  33333333-3333-3333-3333-333333333301
--   Doctor 2:  33333333-3333-3333-3333-333333333302
--   Admin 1:   33333333-3333-3333-3333-333333333401
--   Admin 2:   33333333-3333-3333-3333-333333333402
--
-- Patient Profiles (patient_profile_id) - extended patient data:
--   Patient 1: 44444444-4444-4444-4444-444444444201
--   Patient 2: 44444444-4444-4444-4444-444444444202
--
-- Doctor Profiles (doctor_profile_id) - extended doctor data:
--   Doctor 1:  55555555-5555-5555-5555-555555555301
--   Doctor 2:  55555555-5555-5555-5555-555555555302
--
-- Admin Profiles (admin_profile_id) - extended admin data:
--   Admin 1:   66666666-6666-6666-6666-666666666401
--   Admin 2:   66666666-6666-6666-6666-666666666402
--
-- ============================================================================
-- EXECUTION ORDER NOTES
-- ============================================================================
--
-- The script is ordered to respect foreign key constraints:
-- 1. Specializations (no dependencies)
-- 2. Auth users (no dependencies)
-- 3. Profiles (depends on auth.users)
-- 4. Admin profiles (depends on profiles) - BEFORE doctor_profiles
-- 5. Patient profiles (depends on profiles)
-- 6. Doctor profiles (depends on profiles, admin_profiles for verified_by)
-- 7. Doctor specializations (depends on doctor_profiles, specializations)
-- 8. Doctor availability (depends on doctor_profiles)
-- 9. Medical records (depends on patient_profiles, profiles for recorded_by)
-- 10-17. Remaining data...
--
-- ============================================================================

-- First, let's create specializations if they don't exist
INSERT INTO specializations (id, name_en, name_ar, category, min_fee, max_fee, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111101', 'Cardiology', 'أمراض القلب', 'specialist', 200.00, 500.00, true),
    ('11111111-1111-1111-1111-111111111102', 'Dermatology', 'الأمراض الجلدية', 'specialist', 150.00, 400.00, true),
    ('11111111-1111-1111-1111-111111111103', 'General Practice', 'الطب العام', 'general', 100.00, 250.00, true),
    ('11111111-1111-1111-1111-111111111104', 'Pediatrics', 'طب الأطفال', 'specialist', 150.00, 350.00, true),
    ('11111111-1111-1111-1111-111111111105', 'Internal Medicine', 'الطب الباطني', 'specialist', 180.00, 450.00, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 1: Create Auth Users
-- ============================================================================
-- Note: In Supabase, you typically create users via the Auth API.
-- For seeding, we'll insert directly into auth.users
-- The passwords here are hashed versions of the actual passwords

-- Patient 1: Ahmed Hassan
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
) VALUES (
    '22222222-2222-2222-2222-222222222201',
    '00000000-0000-0000-0000-000000000000',
    'patient1@tawari.test',
    crypt('TawariPatient1!2024', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Ahmed Hassan", "role": "patient"}'::jsonb,
    false,
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Patient 2: Fatima Ali
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
) VALUES (
    '22222222-2222-2222-2222-222222222202',
    '00000000-0000-0000-0000-000000000000',
    'patient2@tawari.test',
    crypt('TawariPatient2!2024', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Fatima Ali", "role": "patient"}'::jsonb,
    false,
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Doctor 1: Dr. Mohamed Ibrahim
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
) VALUES (
    '22222222-2222-2222-2222-222222222301',
    '00000000-0000-0000-0000-000000000000',
    'doctor1@tawari.test',
    crypt('TawariDoctor1!2024', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Dr. Mohamed Ibrahim", "role": "doctor"}'::jsonb,
    false,
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Doctor 2: Dr. Nour El-Din
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
) VALUES (
    '22222222-2222-2222-2222-222222222302',
    '00000000-0000-0000-0000-000000000000',
    'doctor2@tawari.test',
    crypt('TawariDoctor2!2024', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Dr. Nour El-Din", "role": "doctor"}'::jsonb,
    false,
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Admin 1: Sarah Admin
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
) VALUES (
    '22222222-2222-2222-2222-222222222401',
    '00000000-0000-0000-0000-000000000000',
    'admin1@tawari.test',
    crypt('TawariAdmin1!2024', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Sarah Admin", "role": "admin"}'::jsonb,
    false,
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Admin 2: Omar Admin
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
) VALUES (
    '22222222-2222-2222-2222-222222222402',
    '00000000-0000-0000-0000-000000000000',
    'admin2@tawari.test',
    crypt('TawariAdmin2!2024', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Omar Admin", "role": "admin"}'::jsonb,
    false,
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2: Create Base Profiles
-- ============================================================================

-- Patient 1 Profile
INSERT INTO profiles (id, user_id, role, full_name, avatar_url, preferred_language, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333201',
    '22222222-2222-2222-2222-222222222201',
    'patient',
    'Ahmed Hassan',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    'ar',
    true
) ON CONFLICT (user_id) DO NOTHING;

-- Patient 2 Profile
INSERT INTO profiles (id, user_id, role, full_name, avatar_url, preferred_language, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333202',
    '22222222-2222-2222-2222-222222222202',
    'patient',
    'Fatima Ali',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    'en',
    true
) ON CONFLICT (user_id) DO NOTHING;

-- Doctor 1 Profile
INSERT INTO profiles (id, user_id, role, full_name, avatar_url, preferred_language, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333301',
    '22222222-2222-2222-2222-222222222301',
    'doctor',
    'Dr. Mohamed Ibrahim',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    'ar',
    true
) ON CONFLICT (user_id) DO NOTHING;

-- Doctor 2 Profile
INSERT INTO profiles (id, user_id, role, full_name, avatar_url, preferred_language, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333302',
    '22222222-2222-2222-2222-222222222302',
    'doctor',
    'Dr. Nour El-Din',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    'en',
    true
) ON CONFLICT (user_id) DO NOTHING;

-- Admin 1 Profile
INSERT INTO profiles (id, user_id, role, full_name, avatar_url, preferred_language, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333401',
    '22222222-2222-2222-2222-222222222401',
    'admin',
    'Sarah Admin',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    'en',
    true
) ON CONFLICT (user_id) DO NOTHING;

-- Admin 2 Profile
INSERT INTO profiles (id, user_id, role, full_name, avatar_url, preferred_language, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333402',
    '22222222-2222-2222-2222-222222222402',
    'admin',
    'Omar Admin',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    'ar',
    true
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- STEP 3: Create Admin Profiles (MUST be created BEFORE doctor_profiles due to verified_by FK)
-- ============================================================================

-- Admin 1: Sarah - Full Admin
INSERT INTO admin_profiles (id, profile_id, trust_level, department, two_factor_enabled)
VALUES (
    '66666666-6666-6666-6666-666666666401',
    '33333333-3333-3333-3333-333333333401',
    'full_admin',
    'general',
    true
) ON CONFLICT (profile_id) DO NOTHING;

-- Admin 2: Omar - Support Agent
INSERT INTO admin_profiles (id, profile_id, trust_level, department, two_factor_enabled)
VALUES (
    '66666666-6666-6666-6666-666666666402',
    '33333333-3333-3333-3333-333333333402',
    'support_agent',
    'support',
    false
) ON CONFLICT (profile_id) DO NOTHING;

-- ============================================================================
-- STEP 4: Create Patient Profiles
-- ============================================================================

-- Patient 1: Ahmed Hassan - 35 years old, male, has some health conditions
INSERT INTO patient_profiles (id, profile_id, date_of_birth, gender, blood_type, emergency_contact_name, emergency_contact_phone, national_id, verification_level)
VALUES (
    '44444444-4444-4444-4444-444444444201',
    '33333333-3333-3333-3333-333333333201',
    '1989-03-15',
    'male',
    'A+',
    'Mona Hassan',
    '+201012345678',
    '28903150123456',
    'phone_verified'
) ON CONFLICT (profile_id) DO NOTHING;

-- Patient 2: Fatima Ali - 28 years old, female, generally healthy
INSERT INTO patient_profiles (id, profile_id, date_of_birth, gender, blood_type, emergency_contact_name, emergency_contact_phone, national_id, verification_level)
VALUES (
    '44444444-4444-4444-4444-444444444202',
    '33333333-3333-3333-3333-333333333202',
    '1996-07-22',
    'female',
    'O+',
    'Khaled Ali',
    '+201098765432',
    '29607220654321',
    'id_verified'
) ON CONFLICT (profile_id) DO NOTHING;

-- ============================================================================
-- STEP 5: Create Doctor Profiles (after admin_profiles due to verified_by FK)
-- ============================================================================

-- Doctor 1: Dr. Mohamed Ibrahim - Cardiologist, 15 years experience
-- verified_by references Admin 1's profile_id
INSERT INTO doctor_profiles (id, profile_id, license_number, years_of_experience, bio, consultation_fee, verification_status, verified_at, verified_by, is_available_now, rating_average, rating_count, total_consultations)
VALUES (
    '55555555-5555-5555-5555-555555555301',
    '33333333-3333-3333-3333-333333333301',
    'EG-MED-2009-12345',
    15,
    'Consultant Cardiologist with over 15 years of experience in treating heart conditions. Graduated from Cairo University Medical School. Specialized in interventional cardiology and heart failure management.',
    350.00,
    'verified',
    now() - interval '30 days',
    '33333333-3333-3333-3333-333333333401',  -- Admin 1 verified this doctor
    true,
    4.8,
    127,
    243
) ON CONFLICT (profile_id) DO NOTHING;

-- Doctor 2: Dr. Nour El-Din - Dermatologist, 8 years experience
-- verified_by references Admin 1's profile_id
INSERT INTO doctor_profiles (id, profile_id, license_number, years_of_experience, bio, consultation_fee, verification_status, verified_at, verified_by, is_available_now, rating_average, rating_count, total_consultations)
VALUES (
    '55555555-5555-5555-5555-555555555302',
    '33333333-3333-3333-3333-333333333302',
    'EG-MED-2016-67890',
    8,
    'Board-certified Dermatologist specializing in clinical and cosmetic dermatology. Expert in treating acne, eczema, psoriasis, and skin cancer screening. Trained at Alexandria University Hospital.',
    250.00,
    'verified',
    now() - interval '45 days',
    '33333333-3333-3333-3333-333333333401',  -- Admin 1 verified this doctor
    false,
    4.6,
    89,
    156
) ON CONFLICT (profile_id) DO NOTHING;

-- ============================================================================
-- STEP 6: Add Doctor Specializations
-- ============================================================================

-- Dr. Mohamed Ibrahim - Cardiology (primary) and Internal Medicine
INSERT INTO doctor_specializations (id, doctor_profile_id, specialization_id, is_primary)
VALUES
    ('99999999-1111-1111-1111-111111110001', '55555555-5555-5555-5555-555555555301', '11111111-1111-1111-1111-111111111101', true),
    ('99999999-1111-1111-1111-111111110002', '55555555-5555-5555-5555-555555555301', '11111111-1111-1111-1111-111111111105', false)
ON CONFLICT (doctor_profile_id, specialization_id) DO NOTHING;

-- Dr. Nour El-Din - Dermatology (primary)
INSERT INTO doctor_specializations (id, doctor_profile_id, specialization_id, is_primary)
VALUES
    ('99999999-1111-1111-1111-111111110003', '55555555-5555-5555-5555-555555555302', '11111111-1111-1111-1111-111111111102', true)
ON CONFLICT (doctor_profile_id, specialization_id) DO NOTHING;

-- ============================================================================
-- STEP 7: Add Doctor Availability
-- ============================================================================

-- Dr. Mohamed Ibrahim - Sunday to Thursday, 9 AM - 5 PM
INSERT INTO doctor_availability (id, doctor_profile_id, day_of_week, start_time, end_time, is_active)
VALUES
    ('aaaaaaaa-1111-1111-1111-111111110001', '55555555-5555-5555-5555-555555555301', 0, '09:00', '17:00', true), -- Sunday
    ('aaaaaaaa-1111-1111-1111-111111110002', '55555555-5555-5555-5555-555555555301', 1, '09:00', '17:00', true), -- Monday
    ('aaaaaaaa-1111-1111-1111-111111110003', '55555555-5555-5555-5555-555555555301', 2, '09:00', '17:00', true), -- Tuesday
    ('aaaaaaaa-1111-1111-1111-111111110004', '55555555-5555-5555-5555-555555555301', 3, '09:00', '17:00', true), -- Wednesday
    ('aaaaaaaa-1111-1111-1111-111111110005', '55555555-5555-5555-5555-555555555301', 4, '09:00', '17:00', true)  -- Thursday
ON CONFLICT (id) DO NOTHING;

-- Dr. Nour El-Din - Saturday to Wednesday, 10 AM - 6 PM
INSERT INTO doctor_availability (id, doctor_profile_id, day_of_week, start_time, end_time, is_active)
VALUES
    ('aaaaaaaa-1111-1111-1111-111111110006', '55555555-5555-5555-5555-555555555302', 6, '10:00', '18:00', true), -- Saturday
    ('aaaaaaaa-1111-1111-1111-111111110007', '55555555-5555-5555-5555-555555555302', 0, '10:00', '18:00', true), -- Sunday
    ('aaaaaaaa-1111-1111-1111-111111110008', '55555555-5555-5555-5555-555555555302', 1, '10:00', '18:00', true), -- Monday
    ('aaaaaaaa-1111-1111-1111-111111110009', '55555555-5555-5555-5555-555555555302', 2, '10:00', '18:00', true), -- Tuesday
    ('aaaaaaaa-1111-1111-1111-111111110010', '55555555-5555-5555-5555-555555555302', 3, '10:00', '18:00', true)  -- Wednesday
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 8: Add Medical Records for Patients
-- ============================================================================

-- Patient 1 (Ahmed) - Has hypertension and diabetes history
-- recorded_by references the doctor's profile_id for non-self-reported records
INSERT INTO medical_records (id, patient_profile_id, record_type, title, description, date_recorded, recorded_by, is_self_reported)
VALUES
    ('77777777-7777-7777-7777-777777770101', '44444444-4444-4444-4444-444444444201', 'chronic_condition', 'Hypertension Diagnosis', 'Diagnosed with essential hypertension. Started on ACE inhibitors.', '2020-05-15', '33333333-3333-3333-3333-333333333301', false),  -- Recorded by Dr. Mohamed
    ('77777777-7777-7777-7777-777777770102', '44444444-4444-4444-4444-444444444201', 'general', 'Annual Health Checkup 2023', 'Comprehensive health checkup. All vitals stable. Blood pressure controlled.', '2023-11-20', '33333333-3333-3333-3333-333333333301', false),  -- Recorded by Dr. Mohamed
    ('77777777-7777-7777-7777-777777770103', '44444444-4444-4444-4444-444444444201', 'family_history', 'Family Heart Disease History', 'Father had coronary artery disease. Maternal grandfather had stroke.', '2020-05-15', '33333333-3333-3333-3333-333333333201', true)  -- Self-reported by Ahmed
ON CONFLICT (id) DO NOTHING;

-- Patient 2 (Fatima) - Generally healthy, some records
INSERT INTO medical_records (id, patient_profile_id, record_type, title, description, date_recorded, recorded_by, is_self_reported)
VALUES
    ('77777777-7777-7777-7777-777777770201', '44444444-4444-4444-4444-444444444202', 'general', 'Pre-employment Medical Exam', 'All tests normal. Fit for work certification issued.', '2022-03-10', '33333333-3333-3333-3333-333333333302', false),  -- Recorded by Dr. Nour
    ('77777777-7777-7777-7777-777777770202', '44444444-4444-4444-4444-444444444202', 'surgical_history', 'Appendectomy', 'Laparoscopic appendectomy performed successfully. No complications.', '2019-08-22', '33333333-3333-3333-3333-333333333302', false)  -- Recorded by Dr. Nour
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 9: Add Allergies
-- ============================================================================

-- Patient 1 (Ahmed) allergies
INSERT INTO allergies (id, patient_profile_id, allergen, severity, reaction, is_active)
VALUES
    ('88888888-8888-8888-8888-888888880101', '44444444-4444-4444-4444-444444444201', 'Penicillin', 'severe', 'Anaphylaxis - requires epinephrine. Avoid all penicillin-class antibiotics.', true),
    ('88888888-8888-8888-8888-888888880102', '44444444-4444-4444-4444-444444444201', 'Shellfish', 'moderate', 'Hives and swelling. Can take antihistamines.', true)
ON CONFLICT (id) DO NOTHING;

-- Patient 2 (Fatima) allergies
INSERT INTO allergies (id, patient_profile_id, allergen, severity, reaction, is_active)
VALUES
    ('88888888-8888-8888-8888-888888880201', '44444444-4444-4444-4444-444444444202', 'Pollen', 'mild', 'Seasonal rhinitis. Managed with OTC antihistamines.', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 10: Add Conditions
-- ============================================================================

-- Patient 1 (Ahmed) conditions
INSERT INTO conditions (id, patient_profile_id, condition_name, diagnosed_date, status, notes)
VALUES
    ('99999999-9999-9999-9999-999999990101', '44444444-4444-4444-4444-444444444201', 'Essential Hypertension', '2020-05-15', 'managed', 'Well controlled on Lisinopril 10mg daily. BP target: <140/90'),
    ('99999999-9999-9999-9999-999999990102', '44444444-4444-4444-4444-444444444201', 'Hypercholesterolemia', '2021-02-10', 'active', 'LDL elevated. Started on Atorvastatin 20mg. Dietary modifications advised.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 11: Add Lab Results
-- ============================================================================

-- Patient 1 (Ahmed) lab results
INSERT INTO lab_results (id, patient_profile_id, test_name, test_date, lab_name, results_summary)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa101', '44444444-4444-4444-4444-444444444201', 'Complete Blood Count (CBC)', '2024-01-05', 'Al-Borg Laboratory', 'All values within normal range. Hemoglobin: 14.2 g/dL'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa102', '44444444-4444-4444-4444-444444444201', 'Lipid Profile', '2024-01-05', 'Al-Borg Laboratory', 'Total Cholesterol: 210 mg/dL (borderline high), LDL: 145 mg/dL (borderline high), HDL: 45 mg/dL, Triglycerides: 150 mg/dL'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa103', '44444444-4444-4444-4444-444444444201', 'HbA1c', '2024-01-05', 'Al-Borg Laboratory', 'HbA1c: 5.8% (normal, no diabetes)')
ON CONFLICT (id) DO NOTHING;

-- Patient 2 (Fatima) lab results
INSERT INTO lab_results (id, patient_profile_id, test_name, test_date, lab_name, results_summary)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa201', '44444444-4444-4444-4444-444444444202', 'Complete Blood Count (CBC)', '2024-02-15', 'Scan Laboratory', 'All values normal. No anemia detected.'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa202', '44444444-4444-4444-4444-444444444202', 'Thyroid Function Test', '2024-02-15', 'Scan Laboratory', 'TSH: 2.1 mIU/L (normal), T4: 1.2 ng/dL (normal)')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 12: Add Appointments (Past and Upcoming)
-- ============================================================================

-- Past appointments
INSERT INTO appointments (id, patient_profile_id, doctor_profile_id, scheduled_start, scheduled_end, actual_start, actual_end, status, appointment_type, chief_complaint, consultation_fee)
VALUES
    -- Ahmed with Dr. Mohamed (Cardiologist) - Completed
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0101', '44444444-4444-4444-4444-444444444201', '55555555-5555-5555-5555-555555555301',
     now() - interval '14 days' + interval '10 hours',
     now() - interval '14 days' + interval '10 hours 30 minutes',
     now() - interval '14 days' + interval '10 hours 2 minutes',
     now() - interval '14 days' + interval '10 hours 28 minutes',
     'completed', 'scheduled', 'Follow-up for hypertension management. Experiencing occasional headaches.', 350.00),

    -- Ahmed with Dr. Mohamed - Completed (older)
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0102', '44444444-4444-4444-4444-444444444201', '55555555-5555-5555-5555-555555555301',
     now() - interval '45 days' + interval '14 hours',
     now() - interval '45 days' + interval '14 hours 30 minutes',
     now() - interval '45 days' + interval '14 hours 5 minutes',
     now() - interval '45 days' + interval '14 hours 32 minutes',
     'completed', 'scheduled', 'Initial consultation for heart palpitations and chest discomfort.', 350.00),

    -- Fatima with Dr. Nour (Dermatologist) - Completed
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201', '44444444-4444-4444-4444-444444444202', '55555555-5555-5555-5555-555555555302',
     now() - interval '7 days' + interval '11 hours',
     now() - interval '7 days' + interval '11 hours 30 minutes',
     now() - interval '7 days' + interval '11 hours 1 minute',
     now() - interval '7 days' + interval '11 hours 25 minutes',
     'completed', 'scheduled', 'Skin rash on arms, appeared 2 weeks ago. Mild itching.', 250.00)
ON CONFLICT (id) DO NOTHING;

-- Upcoming appointments
INSERT INTO appointments (id, patient_profile_id, doctor_profile_id, scheduled_start, scheduled_end, status, appointment_type, chief_complaint, consultation_fee)
VALUES
    -- Ahmed with Dr. Mohamed - Scheduled for tomorrow
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0103', '44444444-4444-4444-4444-444444444201', '55555555-5555-5555-5555-555555555301',
     now() + interval '1 day' + interval '10 hours',
     now() + interval '1 day' + interval '10 hours 30 minutes',
     'scheduled', 'scheduled', 'Quarterly checkup for blood pressure and cholesterol review.', 350.00),

    -- Fatima with Dr. Nour - Scheduled for 3 days from now
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0202', '44444444-4444-4444-4444-444444444202', '55555555-5555-5555-5555-555555555302',
     now() + interval '3 days' + interval '15 hours',
     now() + interval '3 days' + interval '15 hours 30 minutes',
     'scheduled', 'scheduled', 'Follow-up for skin rash treatment.', 250.00),

    -- Ahmed with Dr. Nour (cross-specialty) - Scheduled for 5 days
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0104', '44444444-4444-4444-4444-444444444201', '55555555-5555-5555-5555-555555555302',
     now() + interval '5 days' + interval '12 hours',
     now() + interval '5 days' + interval '12 hours 30 minutes',
     'scheduled', 'scheduled', 'Small mole on back, want to get it checked.', 250.00)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 13: Add Prescriptions
-- ============================================================================

-- Prescriptions from Dr. Mohamed to Ahmed
INSERT INTO prescriptions (id, appointment_id, patient_profile_id, doctor_profile_id, medication_name, dosage, frequency, duration, instructions, quantity, status, valid_until)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccc0101', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0101', '44444444-4444-4444-4444-444444444201', '55555555-5555-5555-5555-555555555301',
     'Lisinopril', '10mg', 'Once daily', '3 months', 'Take in the morning with or without food. Monitor blood pressure weekly.', 90, 'active', (now() + interval '3 months')::date),

    ('cccccccc-cccc-cccc-cccc-cccccccc0102', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0101', '44444444-4444-4444-4444-444444444201', '55555555-5555-5555-5555-555555555301',
     'Atorvastatin', '20mg', 'Once daily at bedtime', '3 months', 'Take at bedtime. Avoid grapefruit juice.', 90, 'active', (now() + interval '3 months')::date),

    ('cccccccc-cccc-cccc-cccc-cccccccc0103', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0102', '44444444-4444-4444-4444-444444444201', '55555555-5555-5555-5555-555555555301',
     'Aspirin', '81mg', 'Once daily', '6 months', 'Low-dose aspirin for cardiovascular protection. Take with food.', 180, 'active', (now() + interval '4 months')::date)
ON CONFLICT (id) DO NOTHING;

-- Prescriptions from Dr. Nour to Fatima
INSERT INTO prescriptions (id, appointment_id, patient_profile_id, doctor_profile_id, medication_name, dosage, frequency, duration, instructions, quantity, status, valid_until)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccc0201', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201', '44444444-4444-4444-4444-444444444202', '55555555-5555-5555-5555-555555555302',
     'Hydrocortisone Cream 1%', 'Apply thin layer', 'Twice daily', '2 weeks', 'Apply to affected areas only. Do not use on face. Wash hands after application.', 1, 'active', (now() + interval '2 weeks')::date),

    ('cccccccc-cccc-cccc-cccc-cccccccc0202', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201', '44444444-4444-4444-4444-444444444202', '55555555-5555-5555-5555-555555555302',
     'Cetirizine', '10mg', 'Once daily', '1 month', 'Take in the evening. May cause drowsiness.', 30, 'active', (now() + interval '1 month')::date)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 14: Add Messages (Conversations)
-- ============================================================================
-- IMPORTANT: sender_profile_id and recipient_profile_id reference profiles.id (33333333-... UUIDs)
-- NOT patient_profile_id or doctor_profile_id

-- Conversation between Ahmed (patient) and Dr. Mohamed (doctor)
-- Ahmed's profile_id: 33333333-3333-3333-3333-333333333201
-- Dr. Mohamed's profile_id: 33333333-3333-3333-3333-333333333301
INSERT INTO messages (id, conversation_id, sender_profile_id, recipient_profile_id, content, message_type, is_read, created_at)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddd0101', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0101', '33333333-3333-3333-3333-333333333201', '33333333-3333-3333-3333-333333333301',
     'Good morning Dr. Mohamed. I have been taking the blood pressure medication as prescribed. My readings have been around 135/85. Is this acceptable?', 'text', true, now() - interval '5 days'),

    ('dddddddd-dddd-dddd-dddd-dddddddd0102', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0101', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333201',
     'Good morning Ahmed. Those readings are good - you are making progress! We want to get you below 130/80 ideally. Continue the medication and try to reduce salt intake. See you at your next appointment.', 'text', true, now() - interval '5 days' + interval '2 hours'),

    ('dddddddd-dddd-dddd-dddd-dddddddd0103', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0101', '33333333-3333-3333-3333-333333333201', '33333333-3333-3333-3333-333333333301',
     'Thank you doctor! I will follow your advice. See you soon.', 'text', true, now() - interval '5 days' + interval '3 hours')
ON CONFLICT (id) DO NOTHING;

-- Conversation between Fatima (patient) and Dr. Nour (doctor)
-- Fatima's profile_id: 33333333-3333-3333-3333-333333333202
-- Dr. Nour's profile_id: 33333333-3333-3333-3333-333333333302
INSERT INTO messages (id, conversation_id, sender_profile_id, recipient_profile_id, content, message_type, is_read, created_at)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddd0201', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0102', '33333333-3333-3333-3333-333333333202', '33333333-3333-3333-3333-333333333302',
     'Hello Dr. Nour. The rash is getting better after using the cream. Should I continue until the follow-up appointment?', 'text', true, now() - interval '3 days'),

    ('dddddddd-dddd-dddd-dddd-dddddddd0202', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0102', '33333333-3333-3333-3333-333333333302', '33333333-3333-3333-3333-333333333202',
     'That is great news Fatima! Yes, please continue the cream until our follow-up. If any irritation occurs, stop and let me know immediately.', 'text', true, now() - interval '3 days' + interval '4 hours'),

    ('dddddddd-dddd-dddd-dddd-dddddddd0203', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0102', '33333333-3333-3333-3333-333333333202', '33333333-3333-3333-3333-333333333302',
     'Perfect, thank you doctor!', 'text', false, now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 15: Add Consultation Notes (from completed appointments)
-- ============================================================================

INSERT INTO consultation_notes (id, appointment_id, doctor_profile_id, subjective, objective, assessment, plan, follow_up_recommended, follow_up_timeframe)
VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffff0101', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0101', '55555555-5555-5555-5555-555555555301',
     'Patient reports occasional mild headaches, typically in the morning. Blood pressure controlled on current medication. No chest pain or palpitations.',
     'BP: 138/88 mmHg. HR: 72 bpm. Weight: 82 kg. BMI: 26.4. No peripheral edema. Heart sounds normal.',
     'Essential hypertension - reasonably controlled. Borderline elevated cholesterol.',
     '1. Continue Lisinopril 10mg daily\n2. Start Atorvastatin 20mg at bedtime\n3. Dietary modification: reduce salt and saturated fats\n4. Increase physical activity to 30 min/day',
     true, '3 months'),

    ('ffffffff-ffff-ffff-ffff-ffffffff0201', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201', '55555555-5555-5555-5555-555555555302',
     'Patient presents with erythematous rash on both forearms, started 2 weeks ago. Mild pruritus. No fever or systemic symptoms. No new medications, detergents, or known exposures.',
     'Bilateral forearm erythematous papular rash, approximately 5cm x 8cm on each arm. No vesicles. No facial involvement. No lymphadenopathy.',
     'Contact dermatitis, likely allergic etiology.',
     '1. Hydrocortisone 1% cream BID x 2 weeks\n2. Cetirizine 10mg daily for itching\n3. Avoid potential irritants (new soaps, detergents)\n4. Cotton clothing recommended',
     true, '2 weeks')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 16: Add Reviews
-- ============================================================================

INSERT INTO reviews (id, appointment_id, patient_profile_id, doctor_profile_id, rating, comment, is_anonymous, is_visible)
VALUES
    ('11111111-aaaa-aaaa-aaaa-aaaaaaaaa101', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0102', '44444444-4444-4444-4444-444444444201', '55555555-5555-5555-5555-555555555301',
     5, 'Dr. Mohamed is an excellent cardiologist. He explained my condition thoroughly and made me feel at ease. Highly recommend!', false, true),

    ('11111111-aaaa-aaaa-aaaa-aaaaaaaaa201', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201', '44444444-4444-4444-4444-444444444202', '55555555-5555-5555-5555-555555555302',
     4, 'Dr. Nour was very professional and the video consultation worked smoothly. The treatment she prescribed is working well.', false, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 17: Add Notifications
-- ============================================================================

-- Notifications for Ahmed
INSERT INTO notifications (id, profile_id, title, body, notification_type, data, is_read)
VALUES
    ('22222222-aaaa-aaaa-aaaa-aaaaaaaaa101', '33333333-3333-3333-3333-333333333201',
     'Appointment Reminder', 'Your appointment with Dr. Mohamed Ibrahim is tomorrow at 10:00 AM.',
     'appointment_reminder', '{"appointment_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0103"}'::jsonb, false),

    ('22222222-aaaa-aaaa-aaaa-aaaaaaaaa102', '33333333-3333-3333-3333-333333333201',
     'Prescription Renewal', 'Your Lisinopril prescription will expire in 30 days. Consider scheduling a follow-up.',
     'prescription', '{"prescription_id": "cccccccc-cccc-cccc-cccc-cccccccc0101"}'::jsonb, false)
ON CONFLICT (id) DO NOTHING;

-- Notifications for Fatima
INSERT INTO notifications (id, profile_id, title, body, notification_type, data, is_read)
VALUES
    ('22222222-aaaa-aaaa-aaaa-aaaaaaaaa201', '33333333-3333-3333-3333-333333333202',
     'Appointment Scheduled', 'Your follow-up appointment with Dr. Nour El-Din has been confirmed for 3 days from now.',
     'appointment_confirmation', '{"appointment_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0202"}'::jsonb, true),

    ('22222222-aaaa-aaaa-aaaa-aaaaaaaaa202', '33333333-3333-3333-3333-333333333202',
     'New Message', 'You have a new message from Dr. Nour El-Din.',
     'message', '{"conversation_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeee0102"}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

-- Notifications for Doctors
INSERT INTO notifications (id, profile_id, title, body, notification_type, data, is_read)
VALUES
    ('22222222-aaaa-aaaa-aaaa-aaaaaaaaa301', '33333333-3333-3333-3333-333333333301',
     'New Appointment', 'Ahmed Hassan has booked an appointment for tomorrow at 10:00 AM.',
     'new_appointment', '{"appointment_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0103"}'::jsonb, false),

    ('22222222-aaaa-aaaa-aaaa-aaaaaaaaa302', '33333333-3333-3333-3333-333333333302',
     'New Patient Message', 'You have a new message from Fatima Ali.',
     'message', '{"conversation_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeee0102"}'::jsonb, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify the data was inserted correctly:

-- Check users count
-- SELECT role, COUNT(*) FROM profiles GROUP BY role;

-- Check patient data
-- SELECT p.full_name, pp.gender, pp.blood_type
-- FROM profiles p
-- JOIN patient_profiles pp ON pp.profile_id = p.id
-- WHERE p.role = 'patient';

-- Check doctor data
-- SELECT p.full_name, dp.license_number, dp.consultation_fee, dp.rating_average
-- FROM profiles p
-- JOIN doctor_profiles dp ON dp.profile_id = p.id
-- WHERE p.role = 'doctor';

-- Check appointments
-- SELECT
--     pat.full_name as patient,
--     doc.full_name as doctor,
--     a.scheduled_start,
--     a.status
-- FROM appointments a
-- JOIN patient_profiles pp ON pp.id = a.patient_profile_id
-- JOIN profiles pat ON pat.id = pp.profile_id
-- JOIN doctor_profiles dp ON dp.id = a.doctor_profile_id
-- JOIN profiles doc ON doc.id = dp.profile_id
-- ORDER BY a.scheduled_start;

-- ============================================================================
-- END OF SEEDING SCRIPT
-- ============================================================================
