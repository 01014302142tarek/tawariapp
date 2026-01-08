-- ============================================================================
-- TawariApp Additional Data Seeding Script
-- ============================================================================
--
-- This script seeds additional data (specializations, appointments, prescriptions,
-- messages, etc.) for test users created by seed-test-users.ts
--
-- Run this in Supabase SQL Editor AFTER running the TypeScript seeding script.
--
-- ============================================================================
-- UUID REFERENCE TABLE (from TypeScript seeding output)
-- ============================================================================
--
-- Profiles (profile_id):
--   Patient 1: 93f3a5d7-f361-4830-9b3c-d8835fc9ec36
--   Patient 2: 47f0e436-e437-4a99-9172-03af9ca95a39
--   Doctor 1:  21c3b0ac-fca6-4e3c-94d0-0eb55561a1f8
--   Doctor 2:  04dc906b-a477-4f3f-82df-30e15be19332
--   Admin 1:   a3e9a64b-42e4-4a1c-bf93-a5d6fbbaaf98
--   Admin 2:   79c53bf8-c47f-4cdd-8431-730c8f1fe6a4
--
-- Patient Profiles (patient_profile_id):
--   Patient 1: 24cde19e-28b2-46fa-9f37-ad24cba603a7
--   Patient 2: 285b42d6-08e8-4db3-8dbb-195c74229e59
--
-- Doctor Profiles (doctor_profile_id):
--   Doctor 1:  797b73c3-da3b-46ed-bec3-6d321052a2b6
--   Doctor 2:  db44e99b-5491-4241-b5a0-14d2668668bf
--
-- Admin Profiles (admin_profile_id):
--   Admin 1:   bedb07e3-65e4-42ea-9a6a-4084c12e20ea
--   Admin 2:   02363313-36d9-4272-a0b5-a3836e14f53f
--
-- ============================================================================

-- First, create specializations if they don't exist
INSERT INTO specializations (id, name_en, name_ar, category, min_fee, max_fee, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111101', 'Cardiology', 'أمراض القلب', 'specialist', 200.00, 500.00, true),
    ('11111111-1111-1111-1111-111111111102', 'Dermatology', 'الأمراض الجلدية', 'specialist', 150.00, 400.00, true),
    ('11111111-1111-1111-1111-111111111103', 'General Practice', 'الطب العام', 'general', 100.00, 250.00, true),
    ('11111111-1111-1111-1111-111111111104', 'Pediatrics', 'طب الأطفال', 'specialist', 150.00, 350.00, true),
    ('11111111-1111-1111-1111-111111111105', 'Internal Medicine', 'الطب الباطني', 'specialist', 180.00, 450.00, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 1: Add Doctor Specializations
-- ============================================================================

-- Dr. Mohamed Ibrahim - Cardiology (primary) and Internal Medicine
INSERT INTO doctor_specializations (id, doctor_profile_id, specialization_id, is_primary)
VALUES
    ('99999999-1111-1111-1111-111111110001', '797b73c3-da3b-46ed-bec3-6d321052a2b6', '11111111-1111-1111-1111-111111111101', true),
    ('99999999-1111-1111-1111-111111110002', '797b73c3-da3b-46ed-bec3-6d321052a2b6', '11111111-1111-1111-1111-111111111105', false)
ON CONFLICT (doctor_profile_id, specialization_id) DO NOTHING;

-- Dr. Nour El-Din - Dermatology (primary)
INSERT INTO doctor_specializations (id, doctor_profile_id, specialization_id, is_primary)
VALUES
    ('99999999-1111-1111-1111-111111110003', 'db44e99b-5491-4241-b5a0-14d2668668bf', '11111111-1111-1111-1111-111111111102', true)
ON CONFLICT (doctor_profile_id, specialization_id) DO NOTHING;

-- ============================================================================
-- STEP 2: Add Doctor Availability
-- ============================================================================

-- Dr. Mohamed Ibrahim - Sunday to Thursday, 9 AM - 5 PM
INSERT INTO doctor_availability (id, doctor_profile_id, day_of_week, start_time, end_time, is_active)
VALUES
    ('aaaaaaaa-1111-1111-1111-111111110001', '797b73c3-da3b-46ed-bec3-6d321052a2b6', 0, '09:00', '17:00', true), -- Sunday
    ('aaaaaaaa-1111-1111-1111-111111110002', '797b73c3-da3b-46ed-bec3-6d321052a2b6', 1, '09:00', '17:00', true), -- Monday
    ('aaaaaaaa-1111-1111-1111-111111110003', '797b73c3-da3b-46ed-bec3-6d321052a2b6', 2, '09:00', '17:00', true), -- Tuesday
    ('aaaaaaaa-1111-1111-1111-111111110004', '797b73c3-da3b-46ed-bec3-6d321052a2b6', 3, '09:00', '17:00', true), -- Wednesday
    ('aaaaaaaa-1111-1111-1111-111111110005', '797b73c3-da3b-46ed-bec3-6d321052a2b6', 4, '09:00', '17:00', true)  -- Thursday
ON CONFLICT (id) DO NOTHING;

-- Dr. Nour El-Din - Saturday to Wednesday, 10 AM - 6 PM
INSERT INTO doctor_availability (id, doctor_profile_id, day_of_week, start_time, end_time, is_active)
VALUES
    ('aaaaaaaa-1111-1111-1111-111111110006', 'db44e99b-5491-4241-b5a0-14d2668668bf', 6, '10:00', '18:00', true), -- Saturday
    ('aaaaaaaa-1111-1111-1111-111111110007', 'db44e99b-5491-4241-b5a0-14d2668668bf', 0, '10:00', '18:00', true), -- Sunday
    ('aaaaaaaa-1111-1111-1111-111111110008', 'db44e99b-5491-4241-b5a0-14d2668668bf', 1, '10:00', '18:00', true), -- Monday
    ('aaaaaaaa-1111-1111-1111-111111110009', 'db44e99b-5491-4241-b5a0-14d2668668bf', 2, '10:00', '18:00', true), -- Tuesday
    ('aaaaaaaa-1111-1111-1111-111111110010', 'db44e99b-5491-4241-b5a0-14d2668668bf', 3, '10:00', '18:00', true)  -- Wednesday
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 3: Add Medical Records for Patients
-- ============================================================================

-- Patient 1 (Ahmed) - Has hypertension and diabetes history
INSERT INTO medical_records (id, patient_profile_id, record_type, title, description, date_recorded, recorded_by, is_self_reported)
VALUES
    ('77777777-7777-7777-7777-777777770101', '24cde19e-28b2-46fa-9f37-ad24cba603a7', 'chronic_condition', 'Hypertension Diagnosis', 'Diagnosed with essential hypertension. Started on ACE inhibitors.', '2020-05-15', '21c3b0ac-fca6-4e3c-94d0-0eb55561a1f8', false),
    ('77777777-7777-7777-7777-777777770102', '24cde19e-28b2-46fa-9f37-ad24cba603a7', 'general', 'Annual Health Checkup 2023', 'Comprehensive health checkup. All vitals stable. Blood pressure controlled.', '2023-11-20', '21c3b0ac-fca6-4e3c-94d0-0eb55561a1f8', false),
    ('77777777-7777-7777-7777-777777770103', '24cde19e-28b2-46fa-9f37-ad24cba603a7', 'family_history', 'Family Heart Disease History', 'Father had coronary artery disease. Maternal grandfather had stroke.', '2020-05-15', '93f3a5d7-f361-4830-9b3c-d8835fc9ec36', true)
ON CONFLICT (id) DO NOTHING;

-- Patient 2 (Fatima) - Generally healthy, some records
INSERT INTO medical_records (id, patient_profile_id, record_type, title, description, date_recorded, recorded_by, is_self_reported)
VALUES
    ('77777777-7777-7777-7777-777777770201', '285b42d6-08e8-4db3-8dbb-195c74229e59', 'general', 'Pre-employment Medical Exam', 'All tests normal. Fit for work certification issued.', '2022-03-10', '04dc906b-a477-4f3f-82df-30e15be19332', false),
    ('77777777-7777-7777-7777-777777770202', '285b42d6-08e8-4db3-8dbb-195c74229e59', 'surgical_history', 'Appendectomy', 'Laparoscopic appendectomy performed successfully. No complications.', '2019-08-22', '04dc906b-a477-4f3f-82df-30e15be19332', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 4: Add Allergies
-- ============================================================================

-- Patient 1 (Ahmed) allergies
INSERT INTO allergies (id, patient_profile_id, allergen, severity, reaction, is_active)
VALUES
    ('88888888-8888-8888-8888-888888880101', '24cde19e-28b2-46fa-9f37-ad24cba603a7', 'Penicillin', 'severe', 'Anaphylaxis - requires epinephrine. Avoid all penicillin-class antibiotics.', true),
    ('88888888-8888-8888-8888-888888880102', '24cde19e-28b2-46fa-9f37-ad24cba603a7', 'Shellfish', 'moderate', 'Hives and swelling. Can take antihistamines.', true)
ON CONFLICT (id) DO NOTHING;

-- Patient 2 (Fatima) allergies
INSERT INTO allergies (id, patient_profile_id, allergen, severity, reaction, is_active)
VALUES
    ('88888888-8888-8888-8888-888888880201', '285b42d6-08e8-4db3-8dbb-195c74229e59', 'Pollen', 'mild', 'Seasonal rhinitis. Managed with OTC antihistamines.', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 5: Add Conditions
-- ============================================================================

-- Patient 1 (Ahmed) conditions
INSERT INTO conditions (id, patient_profile_id, condition_name, diagnosed_date, status, notes)
VALUES
    ('99999999-9999-9999-9999-999999990101', '24cde19e-28b2-46fa-9f37-ad24cba603a7', 'Essential Hypertension', '2020-05-15', 'managed', 'Well controlled on Lisinopril 10mg daily. BP target: <140/90'),
    ('99999999-9999-9999-9999-999999990102', '24cde19e-28b2-46fa-9f37-ad24cba603a7', 'Hypercholesterolemia', '2021-02-10', 'active', 'LDL elevated. Started on Atorvastatin 20mg. Dietary modifications advised.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 6: Add Lab Results
-- ============================================================================

-- Patient 1 (Ahmed) lab results
INSERT INTO lab_results (id, patient_profile_id, test_name, test_date, lab_name, results_summary)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa101', '24cde19e-28b2-46fa-9f37-ad24cba603a7', 'Complete Blood Count (CBC)', '2024-01-05', 'Al-Borg Laboratory', 'All values within normal range. Hemoglobin: 14.2 g/dL'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa102', '24cde19e-28b2-46fa-9f37-ad24cba603a7', 'Lipid Profile', '2024-01-05', 'Al-Borg Laboratory', 'Total Cholesterol: 210 mg/dL (borderline high), LDL: 145 mg/dL (borderline high), HDL: 45 mg/dL, Triglycerides: 150 mg/dL'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa103', '24cde19e-28b2-46fa-9f37-ad24cba603a7', 'HbA1c', '2024-01-05', 'Al-Borg Laboratory', 'HbA1c: 5.8% (normal, no diabetes)')
ON CONFLICT (id) DO NOTHING;

-- Patient 2 (Fatima) lab results
INSERT INTO lab_results (id, patient_profile_id, test_name, test_date, lab_name, results_summary)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa201', '285b42d6-08e8-4db3-8dbb-195c74229e59', 'Complete Blood Count (CBC)', '2024-02-15', 'Scan Laboratory', 'All values normal. No anemia detected.'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa202', '285b42d6-08e8-4db3-8dbb-195c74229e59', 'Thyroid Function Test', '2024-02-15', 'Scan Laboratory', 'TSH: 2.1 mIU/L (normal), T4: 1.2 ng/dL (normal)')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 7: Add Appointments (Past and Upcoming)
-- ============================================================================

-- Past appointments
INSERT INTO appointments (id, patient_profile_id, doctor_profile_id, scheduled_start, scheduled_end, actual_start, actual_end, status, appointment_type, chief_complaint, consultation_fee)
VALUES
    -- Ahmed with Dr. Mohamed (Cardiologist) - Completed
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0101', '24cde19e-28b2-46fa-9f37-ad24cba603a7', '797b73c3-da3b-46ed-bec3-6d321052a2b6',
     now() - interval '14 days' + interval '10 hours',
     now() - interval '14 days' + interval '10 hours 30 minutes',
     now() - interval '14 days' + interval '10 hours 2 minutes',
     now() - interval '14 days' + interval '10 hours 28 minutes',
     'completed', 'scheduled', 'Follow-up for hypertension management. Experiencing occasional headaches.', 350.00),

    -- Ahmed with Dr. Mohamed - Completed (older)
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0102', '24cde19e-28b2-46fa-9f37-ad24cba603a7', '797b73c3-da3b-46ed-bec3-6d321052a2b6',
     now() - interval '45 days' + interval '14 hours',
     now() - interval '45 days' + interval '14 hours 30 minutes',
     now() - interval '45 days' + interval '14 hours 5 minutes',
     now() - interval '45 days' + interval '14 hours 32 minutes',
     'completed', 'scheduled', 'Initial consultation for heart palpitations and chest discomfort.', 350.00),

    -- Fatima with Dr. Nour (Dermatologist) - Completed
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201', '285b42d6-08e8-4db3-8dbb-195c74229e59', 'db44e99b-5491-4241-b5a0-14d2668668bf',
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
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0103', '24cde19e-28b2-46fa-9f37-ad24cba603a7', '797b73c3-da3b-46ed-bec3-6d321052a2b6',
     now() + interval '1 day' + interval '10 hours',
     now() + interval '1 day' + interval '10 hours 30 minutes',
     'scheduled', 'scheduled', 'Quarterly checkup for blood pressure and cholesterol review.', 350.00),

    -- Fatima with Dr. Nour - Scheduled for 3 days from now
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0202', '285b42d6-08e8-4db3-8dbb-195c74229e59', 'db44e99b-5491-4241-b5a0-14d2668668bf',
     now() + interval '3 days' + interval '15 hours',
     now() + interval '3 days' + interval '15 hours 30 minutes',
     'scheduled', 'scheduled', 'Follow-up for skin rash treatment.', 250.00),

    -- Ahmed with Dr. Nour (cross-specialty) - Scheduled for 5 days
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0104', '24cde19e-28b2-46fa-9f37-ad24cba603a7', 'db44e99b-5491-4241-b5a0-14d2668668bf',
     now() + interval '5 days' + interval '12 hours',
     now() + interval '5 days' + interval '12 hours 30 minutes',
     'scheduled', 'scheduled', 'Small mole on back, want to get it checked.', 250.00)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 8: Add Prescriptions
-- ============================================================================

-- Prescriptions from Dr. Mohamed to Ahmed
INSERT INTO prescriptions (id, appointment_id, patient_profile_id, doctor_profile_id, medication_name, dosage, frequency, duration, instructions, quantity, status, valid_until)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccc0101', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0101', '24cde19e-28b2-46fa-9f37-ad24cba603a7', '797b73c3-da3b-46ed-bec3-6d321052a2b6',
     'Lisinopril', '10mg', 'Once daily', '3 months', 'Take in the morning with or without food. Monitor blood pressure weekly.', 90, 'active', (now() + interval '3 months')::date),

    ('cccccccc-cccc-cccc-cccc-cccccccc0102', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0101', '24cde19e-28b2-46fa-9f37-ad24cba603a7', '797b73c3-da3b-46ed-bec3-6d321052a2b6',
     'Atorvastatin', '20mg', 'Once daily at bedtime', '3 months', 'Take at bedtime. Avoid grapefruit juice.', 90, 'active', (now() + interval '3 months')::date),

    ('cccccccc-cccc-cccc-cccc-cccccccc0103', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0102', '24cde19e-28b2-46fa-9f37-ad24cba603a7', '797b73c3-da3b-46ed-bec3-6d321052a2b6',
     'Aspirin', '81mg', 'Once daily', '6 months', 'Low-dose aspirin for cardiovascular protection. Take with food.', 180, 'active', (now() + interval '4 months')::date)
ON CONFLICT (id) DO NOTHING;

-- Prescriptions from Dr. Nour to Fatima
INSERT INTO prescriptions (id, appointment_id, patient_profile_id, doctor_profile_id, medication_name, dosage, frequency, duration, instructions, quantity, status, valid_until)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccc0201', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201', '285b42d6-08e8-4db3-8dbb-195c74229e59', 'db44e99b-5491-4241-b5a0-14d2668668bf',
     'Hydrocortisone Cream 1%', 'Apply thin layer', 'Twice daily', '2 weeks', 'Apply to affected areas only. Do not use on face. Wash hands after application.', 1, 'active', (now() + interval '2 weeks')::date),

    ('cccccccc-cccc-cccc-cccc-cccccccc0202', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201', '285b42d6-08e8-4db3-8dbb-195c74229e59', 'db44e99b-5491-4241-b5a0-14d2668668bf',
     'Cetirizine', '10mg', 'Once daily', '1 month', 'Take in the evening. May cause drowsiness.', 30, 'active', (now() + interval '1 month')::date)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 9: Add Messages (Conversations)
-- ============================================================================
-- sender_profile_id and recipient_profile_id reference profiles.id

-- Conversation between Ahmed (patient) and Dr. Mohamed (doctor)
INSERT INTO messages (id, conversation_id, sender_profile_id, recipient_profile_id, content, message_type, is_read, created_at)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddd0101', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0101', '93f3a5d7-f361-4830-9b3c-d8835fc9ec36', '21c3b0ac-fca6-4e3c-94d0-0eb55561a1f8',
     'Good morning Dr. Mohamed. I have been taking the blood pressure medication as prescribed. My readings have been around 135/85. Is this acceptable?', 'text', true, now() - interval '5 days'),

    ('dddddddd-dddd-dddd-dddd-dddddddd0102', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0101', '21c3b0ac-fca6-4e3c-94d0-0eb55561a1f8', '93f3a5d7-f361-4830-9b3c-d8835fc9ec36',
     'Good morning Ahmed. Those readings are good - you are making progress! We want to get you below 130/80 ideally. Continue the medication and try to reduce salt intake. See you at your next appointment.', 'text', true, now() - interval '5 days' + interval '2 hours'),

    ('dddddddd-dddd-dddd-dddd-dddddddd0103', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0101', '93f3a5d7-f361-4830-9b3c-d8835fc9ec36', '21c3b0ac-fca6-4e3c-94d0-0eb55561a1f8',
     'Thank you doctor! I will follow your advice. See you soon.', 'text', true, now() - interval '5 days' + interval '3 hours')
ON CONFLICT (id) DO NOTHING;

-- Conversation between Fatima (patient) and Dr. Nour (doctor)
INSERT INTO messages (id, conversation_id, sender_profile_id, recipient_profile_id, content, message_type, is_read, created_at)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddd0201', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0102', '47f0e436-e437-4a99-9172-03af9ca95a39', '04dc906b-a477-4f3f-82df-30e15be19332',
     'Hello Dr. Nour. The rash is getting better after using the cream. Should I continue until the follow-up appointment?', 'text', true, now() - interval '3 days'),

    ('dddddddd-dddd-dddd-dddd-dddddddd0202', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0102', '04dc906b-a477-4f3f-82df-30e15be19332', '47f0e436-e437-4a99-9172-03af9ca95a39',
     'That is great news Fatima! Yes, please continue the cream until our follow-up. If any irritation occurs, stop and let me know immediately.', 'text', true, now() - interval '3 days' + interval '4 hours'),

    ('dddddddd-dddd-dddd-dddd-dddddddd0203', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0102', '47f0e436-e437-4a99-9172-03af9ca95a39', '04dc906b-a477-4f3f-82df-30e15be19332',
     'Perfect, thank you doctor!', 'text', false, now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 10: Add Consultation Notes (from completed appointments)
-- ============================================================================

INSERT INTO consultation_notes (id, appointment_id, doctor_profile_id, subjective, objective, assessment, plan, follow_up_recommended, follow_up_timeframe)
VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffff0101', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0101', '797b73c3-da3b-46ed-bec3-6d321052a2b6',
     'Patient reports occasional mild headaches, typically in the morning. Blood pressure controlled on current medication. No chest pain or palpitations.',
     'BP: 138/88 mmHg. HR: 72 bpm. Weight: 82 kg. BMI: 26.4. No peripheral edema. Heart sounds normal.',
     'Essential hypertension - reasonably controlled. Borderline elevated cholesterol.',
     '1. Continue Lisinopril 10mg daily\n2. Start Atorvastatin 20mg at bedtime\n3. Dietary modification: reduce salt and saturated fats\n4. Increase physical activity to 30 min/day',
     true, '3 months'),

    ('ffffffff-ffff-ffff-ffff-ffffffff0201', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201', 'db44e99b-5491-4241-b5a0-14d2668668bf',
     'Patient presents with erythematous rash on both forearms, started 2 weeks ago. Mild pruritus. No fever or systemic symptoms. No new medications, detergents, or known exposures.',
     'Bilateral forearm erythematous papular rash, approximately 5cm x 8cm on each arm. No vesicles. No facial involvement. No lymphadenopathy.',
     'Contact dermatitis, likely allergic etiology.',
     '1. Hydrocortisone 1% cream BID x 2 weeks\n2. Cetirizine 10mg daily for itching\n3. Avoid potential irritants (new soaps, detergents)\n4. Cotton clothing recommended',
     true, '2 weeks')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 11: Add Reviews
-- ============================================================================

INSERT INTO reviews (id, appointment_id, patient_profile_id, doctor_profile_id, rating, comment, is_anonymous, is_visible)
VALUES
    ('11111111-aaaa-aaaa-aaaa-aaaaaaaaa101', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0102', '24cde19e-28b2-46fa-9f37-ad24cba603a7', '797b73c3-da3b-46ed-bec3-6d321052a2b6',
     5, 'Dr. Mohamed is an excellent cardiologist. He explained my condition thoroughly and made me feel at ease. Highly recommend!', false, true),

    ('11111111-aaaa-aaaa-aaaa-aaaaaaaaa201', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201', '285b42d6-08e8-4db3-8dbb-195c74229e59', 'db44e99b-5491-4241-b5a0-14d2668668bf',
     4, 'Dr. Nour was very professional and the video consultation worked smoothly. The treatment she prescribed is working well.', false, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 12: Add Notifications
-- ============================================================================

-- Notifications for Ahmed
INSERT INTO notifications (id, profile_id, title, body, notification_type, data, is_read)
VALUES
    ('22222222-aaaa-aaaa-aaaa-aaaaaaaaa101', '93f3a5d7-f361-4830-9b3c-d8835fc9ec36',
     'Appointment Reminder', 'Your appointment with Dr. Mohamed Ibrahim is tomorrow at 10:00 AM.',
     'appointment_reminder', '{"appointment_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0103"}'::jsonb, false),

    ('22222222-aaaa-aaaa-aaaa-aaaaaaaaa102', '93f3a5d7-f361-4830-9b3c-d8835fc9ec36',
     'Prescription Renewal', 'Your Lisinopril prescription will expire in 30 days. Consider scheduling a follow-up.',
     'prescription', '{"prescription_id": "cccccccc-cccc-cccc-cccc-cccccccc0101"}'::jsonb, false)
ON CONFLICT (id) DO NOTHING;

-- Notifications for Fatima
INSERT INTO notifications (id, profile_id, title, body, notification_type, data, is_read)
VALUES
    ('22222222-aaaa-aaaa-aaaa-aaaaaaaaa201', '47f0e436-e437-4a99-9172-03af9ca95a39',
     'Appointment Scheduled', 'Your follow-up appointment with Dr. Nour El-Din has been confirmed for 3 days from now.',
     'appointment_confirmation', '{"appointment_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0202"}'::jsonb, true),

    ('22222222-aaaa-aaaa-aaaa-aaaaaaaaa202', '47f0e436-e437-4a99-9172-03af9ca95a39',
     'New Message', 'You have a new message from Dr. Nour El-Din.',
     'message', '{"conversation_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeee0102"}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

-- Notifications for Doctors
INSERT INTO notifications (id, profile_id, title, body, notification_type, data, is_read)
VALUES
    ('22222222-aaaa-aaaa-aaaa-aaaaaaaaa301', '21c3b0ac-fca6-4e3c-94d0-0eb55561a1f8',
     'New Appointment', 'Ahmed Hassan has booked an appointment for tomorrow at 10:00 AM.',
     'new_appointment', '{"appointment_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0103"}'::jsonb, false),

    ('22222222-aaaa-aaaa-aaaa-aaaaaaaaa302', '04dc906b-a477-4f3f-82df-30e15be19332',
     'New Patient Message', 'You have a new message from Fatima Ali.',
     'message', '{"conversation_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeee0102"}'::jsonb, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 13: Update doctor verified_by to admin profile_id
-- ============================================================================

UPDATE doctor_profiles
SET verified_by = 'a3e9a64b-42e4-4a1c-bf93-a5d6fbbaaf98'
WHERE id IN ('797b73c3-da3b-46ed-bec3-6d321052a2b6', 'db44e99b-5491-4241-b5a0-14d2668668bf');

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

-- Check doctor data with specializations
-- SELECT p.full_name, dp.license_number, dp.consultation_fee, s.name_en as specialization
-- FROM profiles p
-- JOIN doctor_profiles dp ON dp.profile_id = p.id
-- JOIN doctor_specializations ds ON ds.doctor_profile_id = dp.id
-- JOIN specializations s ON s.id = ds.specialization_id
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
