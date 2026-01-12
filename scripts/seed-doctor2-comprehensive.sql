-- ============================================================================
-- TawariApp Comprehensive Demo Data for Dr. Nour El-Din (Doctor 2)
-- ============================================================================
--
-- This script creates realistic test data for Dr. Nour El-Din to test
-- all dashboard features including:
-- - Today's appointments (various statuses)
-- - Past appointments with notes and reviews
-- - Future appointments
-- - Prescriptions (active, expired, renewals pending)
-- - Messages (read and unread)
-- - Transactions and earnings
-- - Notifications
--
-- Run this in Supabase SQL Editor
--
-- ============================================================================
-- UUID REFERENCE TABLE
-- ============================================================================
--
-- Profiles (profile_id):
--   Patient 1 (Ahmed):   93f3a5d7-f361-4830-9b3c-d8835fc9ec36
--   Patient 2 (Fatima):  47f0e436-e437-4a99-9172-03af9ca95a39
--   Doctor 2 (Dr. Nour): 04dc906b-a477-4f3f-82df-30e15be19332
--
-- Patient Profiles (patient_profile_id):
--   Patient 1 (Ahmed):   24cde19e-28b2-46fa-9f37-ad24cba603a7
--   Patient 2 (Fatima):  285b42d6-08e8-4db3-8dbb-195c74229e59
--
-- Doctor Profiles (doctor_profile_id):
--   Doctor 2 (Dr. Nour): db44e99b-5491-4241-b5a0-14d2668668bf
--
-- ============================================================================

-- ============================================================================
-- STEP 1: Clear existing demo data for Dr. Nour (to avoid duplicates)
-- ============================================================================

-- Delete in correct order due to foreign keys
DELETE FROM consultation_notes WHERE doctor_profile_id = 'db44e99b-5491-4241-b5a0-14d2668668bf';
DELETE FROM reviews WHERE doctor_profile_id = 'db44e99b-5491-4241-b5a0-14d2668668bf';
DELETE FROM prescriptions WHERE doctor_profile_id = 'db44e99b-5491-4241-b5a0-14d2668668bf';
DELETE FROM doctor_earnings WHERE doctor_profile_id = 'db44e99b-5491-4241-b5a0-14d2668668bf';
DELETE FROM consultation_sessions WHERE appointment_id IN (
    SELECT id FROM appointments WHERE doctor_profile_id = 'db44e99b-5491-4241-b5a0-14d2668668bf'
);
DELETE FROM transactions WHERE appointment_id IN (
    SELECT id FROM appointments WHERE doctor_profile_id = 'db44e99b-5491-4241-b5a0-14d2668668bf'
);
DELETE FROM appointments WHERE doctor_profile_id = 'db44e99b-5491-4241-b5a0-14d2668668bf';
DELETE FROM messages WHERE recipient_profile_id = '04dc906b-a477-4f3f-82df-30e15be19332'
    OR sender_profile_id = '04dc906b-a477-4f3f-82df-30e15be19332';
DELETE FROM notifications WHERE profile_id = '04dc906b-a477-4f3f-82df-30e15be19332';

-- ============================================================================
-- STEP 2: TODAY'S APPOINTMENTS (Various statuses for testing)
-- ============================================================================

-- Appointment 1: COMPLETED earlier today (Ahmed - morning appointment)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end, actual_start, actual_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000001',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7', -- Ahmed
    'db44e99b-5491-4241-b5a0-14d2668668bf', -- Dr. Nour
    (CURRENT_DATE + TIME '09:00:00')::timestamp,
    (CURRENT_DATE + TIME '09:30:00')::timestamp,
    (CURRENT_DATE + TIME '09:02:00')::timestamp,
    (CURRENT_DATE + TIME '09:25:00')::timestamp,
    'completed', 'scheduled',
    'Skin irritation on hands, redness and itching for 3 days',
    250.00
);

-- Appointment 2: COMPLETED earlier today (Fatima - mid-morning)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end, actual_start, actual_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000002',
    '285b42d6-08e8-4db3-8dbb-195c74229e59', -- Fatima
    'db44e99b-5491-4241-b5a0-14d2668668bf', -- Dr. Nour
    (CURRENT_DATE + TIME '10:30:00')::timestamp,
    (CURRENT_DATE + TIME '11:00:00')::timestamp,
    (CURRENT_DATE + TIME '10:32:00')::timestamp,
    (CURRENT_DATE + TIME '10:58:00')::timestamp,
    'completed', 'scheduled',
    'Follow-up for eczema treatment, checking medication effectiveness',
    250.00
);

-- Appointment 3: IN_WAITING_ROOM (Ahmed - current patient waiting)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000003',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7', -- Ahmed
    'db44e99b-5491-4241-b5a0-14d2668668bf', -- Dr. Nour
    (CURRENT_DATE + TIME '14:00:00')::timestamp,
    (CURRENT_DATE + TIME '14:30:00')::timestamp,
    'in_waiting_room', 'scheduled',
    'New mole appeared on back, want to get it checked',
    250.00
);

-- Appointment 4: SCHEDULED (Fatima - upcoming today)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000004',
    '285b42d6-08e8-4db3-8dbb-195c74229e59', -- Fatima
    'db44e99b-5491-4241-b5a0-14d2668668bf', -- Dr. Nour
    (CURRENT_DATE + TIME '16:00:00')::timestamp,
    (CURRENT_DATE + TIME '16:30:00')::timestamp,
    'scheduled', 'scheduled',
    'Acne consultation - breakout on forehead',
    250.00
);

-- Appointment 5: SCHEDULED (Ahmed - late today)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000005',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7', -- Ahmed
    'db44e99b-5491-4241-b5a0-14d2668668bf', -- Dr. Nour
    (CURRENT_DATE + TIME '17:30:00')::timestamp,
    (CURRENT_DATE + TIME '18:00:00')::timestamp,
    'scheduled', 'scheduled',
    'Hair loss concerns, thinning on crown area',
    250.00
);

-- ============================================================================
-- STEP 3: PAST APPOINTMENTS (Last 30 days - various outcomes)
-- ============================================================================

-- Past 1: Completed 3 days ago (Fatima)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end, actual_start, actual_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000010',
    '285b42d6-08e8-4db3-8dbb-195c74229e59',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    (CURRENT_DATE - INTERVAL '3 days' + TIME '11:00:00')::timestamp,
    (CURRENT_DATE - INTERVAL '3 days' + TIME '11:30:00')::timestamp,
    (CURRENT_DATE - INTERVAL '3 days' + TIME '11:03:00')::timestamp,
    (CURRENT_DATE - INTERVAL '3 days' + TIME '11:28:00')::timestamp,
    'completed', 'scheduled',
    'Dry skin patches on legs, worsening in winter',
    250.00
);

-- Past 2: Completed 5 days ago (Ahmed)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end, actual_start, actual_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000011',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    (CURRENT_DATE - INTERVAL '5 days' + TIME '14:00:00')::timestamp,
    (CURRENT_DATE - INTERVAL '5 days' + TIME '14:30:00')::timestamp,
    (CURRENT_DATE - INTERVAL '5 days' + TIME '14:05:00')::timestamp,
    (CURRENT_DATE - INTERVAL '5 days' + TIME '14:32:00')::timestamp,
    'completed', 'scheduled',
    'Allergic reaction to new soap, face swelling',
    250.00
);

-- Past 3: Completed 1 week ago (Fatima)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end, actual_start, actual_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000012',
    '285b42d6-08e8-4db3-8dbb-195c74229e59',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    (CURRENT_DATE - INTERVAL '7 days' + TIME '10:00:00')::timestamp,
    (CURRENT_DATE - INTERVAL '7 days' + TIME '10:30:00')::timestamp,
    (CURRENT_DATE - INTERVAL '7 days' + TIME '10:01:00')::timestamp,
    (CURRENT_DATE - INTERVAL '7 days' + TIME '10:26:00')::timestamp,
    'completed', 'scheduled',
    'Initial consultation for recurring eczema',
    250.00
);

-- Past 4: CANCELLED by patient 2 days ago (Ahmed)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end,
    status, appointment_type, chief_complaint, consultation_fee,
    cancellation_reason
) VALUES (
    'aaaa0001-0001-0001-0001-000000000013',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    (CURRENT_DATE - INTERVAL '2 days' + TIME '15:00:00')::timestamp,
    (CURRENT_DATE - INTERVAL '2 days' + TIME '15:30:00')::timestamp,
    'cancelled', 'scheduled',
    'Skin tag removal consultation',
    250.00,
    'Patient requested cancellation - scheduling conflict'
);

-- Past 5: NO_SHOW yesterday (Fatima)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000014',
    '285b42d6-08e8-4db3-8dbb-195c74229e59',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    (CURRENT_DATE - INTERVAL '1 day' + TIME '12:00:00')::timestamp,
    (CURRENT_DATE - INTERVAL '1 day' + TIME '12:30:00')::timestamp,
    'no_show', 'scheduled',
    'Follow-up appointment',
    250.00
);

-- Past 6: Completed 2 weeks ago (Ahmed)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end, actual_start, actual_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000015',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    (CURRENT_DATE - INTERVAL '14 days' + TIME '11:00:00')::timestamp,
    (CURRENT_DATE - INTERVAL '14 days' + TIME '11:30:00')::timestamp,
    (CURRENT_DATE - INTERVAL '14 days' + TIME '11:02:00')::timestamp,
    (CURRENT_DATE - INTERVAL '14 days' + TIME '11:29:00')::timestamp,
    'completed', 'scheduled',
    'Psoriasis flare-up on elbows',
    250.00
);

-- Past 7: Completed 3 weeks ago (Fatima)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end, actual_start, actual_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000016',
    '285b42d6-08e8-4db3-8dbb-195c74229e59',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    (CURRENT_DATE - INTERVAL '21 days' + TIME '15:00:00')::timestamp,
    (CURRENT_DATE - INTERVAL '21 days' + TIME '15:30:00')::timestamp,
    (CURRENT_DATE - INTERVAL '21 days' + TIME '15:04:00')::timestamp,
    (CURRENT_DATE - INTERVAL '21 days' + TIME '15:31:00')::timestamp,
    'completed', 'scheduled',
    'Sunburn treatment and skin check',
    250.00
);

-- ============================================================================
-- STEP 4: FUTURE APPOINTMENTS (Upcoming)
-- ============================================================================

-- Future 1: Tomorrow (Ahmed)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000020',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    (CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00')::timestamp,
    (CURRENT_DATE + INTERVAL '1 day' + TIME '10:30:00')::timestamp,
    'scheduled', 'scheduled',
    'Follow-up for allergic reaction treatment',
    250.00
);

-- Future 2: In 3 days (Fatima)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000021',
    '285b42d6-08e8-4db3-8dbb-195c74229e59',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    (CURRENT_DATE + INTERVAL '3 days' + TIME '14:00:00')::timestamp,
    (CURRENT_DATE + INTERVAL '3 days' + TIME '14:30:00')::timestamp,
    'scheduled', 'scheduled',
    'Monthly eczema check-up',
    250.00
);

-- Future 3: In 1 week (Ahmed)
INSERT INTO appointments (
    id, patient_profile_id, doctor_profile_id,
    scheduled_start, scheduled_end,
    status, appointment_type, chief_complaint, consultation_fee
) VALUES (
    'aaaa0001-0001-0001-0001-000000000022',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    (CURRENT_DATE + INTERVAL '7 days' + TIME '11:00:00')::timestamp,
    (CURRENT_DATE + INTERVAL '7 days' + TIME '11:30:00')::timestamp,
    'scheduled', 'scheduled',
    'Mole mapping and skin cancer screening',
    250.00
);

-- ============================================================================
-- STEP 5: CONSULTATION NOTES (For completed appointments)
-- ============================================================================

-- Notes for today's completed appointment 1
INSERT INTO consultation_notes (
    id, appointment_id, doctor_profile_id,
    subjective, objective, assessment, plan,
    follow_up_recommended, follow_up_timeframe
) VALUES (
    'cccc0001-0001-0001-0001-000000000001',
    'aaaa0001-0001-0001-0001-000000000001',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    'Patient reports skin irritation on both hands for 3 days. Describes redness, itching, and mild burning sensation. Started after using new cleaning products at work. No fever or systemic symptoms.',
    'Erythematous patches on dorsal aspects of both hands. Mild vesiculation present. No secondary infection. Nails appear normal.',
    'Contact dermatitis, likely irritant type from occupational exposure to cleaning chemicals.',
    '1. Hydrocortisone cream 1% applied twice daily for 7 days
2. Emollient (moisturizer) after each hand wash
3. Avoid contact with irritant - recommend using protective gloves
4. Antihistamine (Cetirizine 10mg) at night if itching severe',
    true, '1 week'
);

-- Notes for today's completed appointment 2
INSERT INTO consultation_notes (
    id, appointment_id, doctor_profile_id,
    subjective, objective, assessment, plan,
    follow_up_recommended, follow_up_timeframe
) VALUES (
    'cccc0001-0001-0001-0001-000000000002',
    'aaaa0001-0001-0001-0001-000000000002',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    'Follow-up visit for eczema. Patient reports significant improvement with prescribed treatment. Itching reduced by 80%. Sleep quality improved. Compliant with moisturizer regimen.',
    'Skin examination shows marked improvement. Previous erythematous patches now faded. No active lesions. Skin hydration improved.',
    'Atopic dermatitis - responding well to treatment. Currently in remission.',
    '1. Continue current moisturizer regimen
2. Reduce hydrocortisone to once daily for 3 more days, then stop
3. Keep Cetirizine as needed for flares
4. Patient education on trigger avoidance completed',
    true, '1 month'
);

-- Notes for past appointment (3 days ago)
INSERT INTO consultation_notes (
    id, appointment_id, doctor_profile_id,
    subjective, objective, assessment, plan,
    follow_up_recommended, follow_up_timeframe
) VALUES (
    'cccc0001-0001-0001-0001-000000000010',
    'aaaa0001-0001-0001-0001-000000000010',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    'Patient presents with dry, scaly patches on both legs. Symptoms worse in winter. No itching. Using regular soap.',
    'Bilateral lower extremity xerosis. Fine scaling present. No inflammation or infection.',
    'Xerosis (dry skin), seasonal exacerbation.',
    '1. Switch to gentle, fragrance-free cleanser
2. Apply thick emollient cream immediately after bathing
3. Consider using humidifier at home
4. Avoid hot water - use lukewarm',
    false, NULL
);

-- Notes for past appointment (5 days ago) - Ahmed allergic reaction
INSERT INTO consultation_notes (
    id, appointment_id, doctor_profile_id,
    subjective, objective, assessment, plan,
    follow_up_recommended, follow_up_timeframe
) VALUES (
    'cccc0001-0001-0001-0001-000000000011',
    'aaaa0001-0001-0001-0001-000000000011',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    'Patient developed facial swelling and redness after using new soap 2 days ago. Mild periorbital edema. No respiratory symptoms. No previous history of similar reactions.',
    'Moderate periorbital edema bilaterally. Erythematous rash on cheeks and forehead. No urticaria. No angioedema of lips/tongue. Vital signs stable.',
    'Acute allergic contact dermatitis - facial, secondary to soap allergen.',
    '1. Discontinue offending soap immediately
2. Prednisolone 20mg daily for 5 days
3. Cetirizine 10mg twice daily for 7 days
4. Cool compresses to face
5. Follow-up in 1 week to assess response
6. Consider patch testing if recurs',
    true, '1 week'
);

-- Notes for past appointment (1 week ago) - Fatima initial eczema
INSERT INTO consultation_notes (
    id, appointment_id, doctor_profile_id,
    subjective, objective, assessment, plan,
    follow_up_recommended, follow_up_timeframe
) VALUES (
    'cccc0001-0001-0001-0001-000000000012',
    'aaaa0001-0001-0001-0001-000000000012',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    'Patient presents with itchy, red patches on arms and behind knees. Symptoms started 2 weeks ago. History of childhood eczema. Recently moved to new apartment. Stress at work.',
    'Bilateral antecubital fossae show erythematous, lichenified patches. Similar findings in popliteal fossae. Some excoriation marks from scratching.',
    'Atopic dermatitis (eczema), moderate severity, likely triggered by environmental change and stress.',
    '1. Hydrocortisone 1% cream to affected areas twice daily for 2 weeks
2. Cetirizine 10mg at bedtime for itch control
3. Fragrance-free moisturizer minimum 3 times daily
4. Short, lukewarm showers only
5. Cotton clothing recommended
6. Stress management discussed',
    true, '2 weeks'
);

-- ============================================================================
-- STEP 6: PRESCRIPTIONS (Active and past)
-- ============================================================================

-- Active prescription from today (Ahmed - hand dermatitis)
INSERT INTO prescriptions (
    id, appointment_id, patient_profile_id, doctor_profile_id,
    medication_name, dosage, frequency, duration, instructions,
    quantity, status, valid_until
) VALUES (
    'pppp0001-0001-0001-0001-000000000001',
    'aaaa0001-0001-0001-0001-000000000001',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    'Hydrocortisone Cream 1%', 'Apply thin layer', 'Twice daily', '7 days',
    'Apply to affected areas on hands only. Do not use on face. Wash hands before application.',
    1, 'active', (CURRENT_DATE + INTERVAL '7 days')::date
);

INSERT INTO prescriptions (
    id, appointment_id, patient_profile_id, doctor_profile_id,
    medication_name, dosage, frequency, duration, instructions,
    quantity, status, valid_until
) VALUES (
    'pppp0001-0001-0001-0001-000000000002',
    'aaaa0001-0001-0001-0001-000000000001',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    'Cetirizine', '10mg', 'Once daily at bedtime', '7 days',
    'Take at night. May cause drowsiness.',
    7, 'active', (CURRENT_DATE + INTERVAL '7 days')::date
);

-- Active prescription from today (Fatima - eczema maintenance)
INSERT INTO prescriptions (
    id, appointment_id, patient_profile_id, doctor_profile_id,
    medication_name, dosage, frequency, duration, instructions,
    quantity, status, valid_until
) VALUES (
    'pppp0001-0001-0001-0001-000000000003',
    'aaaa0001-0001-0001-0001-000000000002',
    '285b42d6-08e8-4db3-8dbb-195c74229e59',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    'Hydrocortisone Cream 1%', 'Apply thin layer', 'Once daily', '3 days',
    'Apply to previously affected areas for final 3 days, then discontinue.',
    1, 'active', (CURRENT_DATE + INTERVAL '3 days')::date
);

-- Past prescription from 5 days ago (Ahmed - allergic reaction)
INSERT INTO prescriptions (
    id, appointment_id, patient_profile_id, doctor_profile_id,
    medication_name, dosage, frequency, duration, instructions,
    quantity, status, valid_until
) VALUES (
    'pppp0001-0001-0001-0001-000000000004',
    'aaaa0001-0001-0001-0001-000000000011',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    'Prednisolone', '20mg', 'Once daily in morning', '5 days',
    'Take with food. Complete full course. Do not stop abruptly.',
    5, 'completed', (CURRENT_DATE - INTERVAL '0 days')::date
);

INSERT INTO prescriptions (
    id, appointment_id, patient_profile_id, doctor_profile_id,
    medication_name, dosage, frequency, duration, instructions,
    quantity, status, valid_until
) VALUES (
    'pppp0001-0001-0001-0001-000000000005',
    'aaaa0001-0001-0001-0001-000000000011',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    'Cetirizine', '10mg', 'Twice daily', '7 days',
    'Morning and evening. May cause drowsiness.',
    14, 'completed', (CURRENT_DATE + INTERVAL '2 days')::date
);

-- Past prescription from 1 week ago (Fatima - initial eczema)
INSERT INTO prescriptions (
    id, appointment_id, patient_profile_id, doctor_profile_id,
    medication_name, dosage, frequency, duration, instructions,
    quantity, status, valid_until
) VALUES (
    'pppp0001-0001-0001-0001-000000000006',
    'aaaa0001-0001-0001-0001-000000000012',
    '285b42d6-08e8-4db3-8dbb-195c74229e59',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    'Hydrocortisone Cream 1%', 'Apply thin layer', 'Twice daily', '2 weeks',
    'Apply to affected areas. Stop if irritation occurs.',
    2, 'active', (CURRENT_DATE + INTERVAL '7 days')::date
);

-- ============================================================================
-- STEP 7: REVIEWS (From patients)
-- ============================================================================

-- Review from Ahmed (5 days ago appointment)
INSERT INTO reviews (
    id, appointment_id, patient_profile_id, doctor_profile_id,
    rating, comment, is_anonymous, is_visible, created_at
) VALUES (
    'rrrr0001-0001-0001-0001-000000000001',
    'aaaa0001-0001-0001-0001-000000000011',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    5, 'Dr. Nour was excellent! She quickly identified my allergic reaction and the treatment worked perfectly. Very professional and caring.',
    false, true, CURRENT_TIMESTAMP - INTERVAL '4 days'
);

-- Review from Fatima (1 week ago appointment)
INSERT INTO reviews (
    id, appointment_id, patient_profile_id, doctor_profile_id,
    rating, comment, is_anonymous, is_visible, created_at
) VALUES (
    'rrrr0001-0001-0001-0001-000000000002',
    'aaaa0001-0001-0001-0001-000000000012',
    '285b42d6-08e8-4db3-8dbb-195c74229e59',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    5, 'Very thorough consultation. Dr. Nour explained my eczema condition clearly and gave me a comprehensive treatment plan. Highly recommend!',
    false, true, CURRENT_TIMESTAMP - INTERVAL '6 days'
);

-- Review from Fatima (3 weeks ago appointment)
INSERT INTO reviews (
    id, appointment_id, patient_profile_id, doctor_profile_id,
    rating, comment, is_anonymous, is_visible, created_at
) VALUES (
    'rrrr0001-0001-0001-0001-000000000003',
    'aaaa0001-0001-0001-0001-000000000016',
    '285b42d6-08e8-4db3-8dbb-195c74229e59',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    4, 'Good experience overall. The doctor was professional and the video call quality was excellent. Only minor delay in starting.',
    false, true, CURRENT_TIMESTAMP - INTERVAL '20 days'
);

-- Review from Ahmed (2 weeks ago appointment)
INSERT INTO reviews (
    id, appointment_id, patient_profile_id, doctor_profile_id,
    rating, comment, is_anonymous, is_visible, created_at
) VALUES (
    'rrrr0001-0001-0001-0001-000000000004',
    'aaaa0001-0001-0001-0001-000000000015',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    5, 'Dr. Nour is very knowledgeable about skin conditions. My psoriasis improved significantly with her treatment plan.',
    false, true, CURRENT_TIMESTAMP - INTERVAL '13 days'
);

-- Update doctor's rating average based on reviews
UPDATE doctor_profiles
SET rating_average = 4.75, rating_count = 4
WHERE id = 'db44e99b-5491-4241-b5a0-14d2668668bf';

-- ============================================================================
-- STEP 8: MESSAGES (Patient-Doctor conversations)
-- ============================================================================

-- Conversation 1: Ahmed asking about today's appointment
INSERT INTO messages (id, conversation_id, sender_profile_id, recipient_profile_id, content, message_type, is_read, created_at)
VALUES
    ('a0a00001-0001-0001-0001-000000000001', 'c0ff0001-0001-0001-0001-000000000001',
     '93f3a5d7-f361-4830-9b3c-d8835fc9ec36', '04dc906b-a477-4f3f-82df-30e15be19332',
     'Good morning Dr. Nour! Just confirming my 2 PM appointment today. Should I have anything ready?',
     'text', false, CURRENT_TIMESTAMP - INTERVAL '2 hours'),

    ('a0a00001-0001-0001-0001-000000000002', 'c0ff0001-0001-0001-0001-000000000001',
     '93f3a5d7-f361-4830-9b3c-d8835fc9ec36', '04dc906b-a477-4f3f-82df-30e15be19332',
     'Also, the mole I mentioned has not changed in size but I wanted to get it checked just to be safe.',
     'text', false, CURRENT_TIMESTAMP - INTERVAL '1 hour 55 minutes');

-- Conversation 2: Fatima follow-up question
INSERT INTO messages (id, conversation_id, sender_profile_id, recipient_profile_id, content, message_type, is_read, created_at)
VALUES
    ('a0a00001-0001-0001-0001-000000000010', 'c0ff0001-0001-0001-0001-000000000002',
     '47f0e436-e437-4a99-9172-03af9ca95a39', '04dc906b-a477-4f3f-82df-30e15be19332',
     'Hi Dr. Nour, thank you for the consultation today. Quick question - can I use the moisturizer before or after the steroid cream?',
     'text', false, CURRENT_TIMESTAMP - INTERVAL '3 hours'),

    ('a0a00001-0001-0001-0001-000000000011', 'c0ff0001-0001-0001-0001-000000000002',
     '04dc906b-a477-4f3f-82df-30e15be19332', '47f0e436-e437-4a99-9172-03af9ca95a39',
     'Hi Fatima! Great question. Apply the steroid cream first, wait about 15-20 minutes, then apply the moisturizer on top. This helps the medication absorb better.',
     'text', true, CURRENT_TIMESTAMP - INTERVAL '2 hours 30 minutes'),

    ('a0a00001-0001-0001-0001-000000000012', 'c0ff0001-0001-0001-0001-000000000002',
     '47f0e436-e437-4a99-9172-03af9ca95a39', '04dc906b-a477-4f3f-82df-30e15be19332',
     'Perfect, thank you so much! That makes sense. I will do that.',
     'text', true, CURRENT_TIMESTAMP - INTERVAL '2 hours 15 minutes');

-- Older conversation from last week (Ahmed asking about prescription)
INSERT INTO messages (id, conversation_id, sender_profile_id, recipient_profile_id, content, message_type, is_read, created_at)
VALUES
    ('a0a00001-0001-0001-0001-000000000020', 'c0ff0001-0001-0001-0001-000000000003',
     '93f3a5d7-f361-4830-9b3c-d8835fc9ec36', '04dc906b-a477-4f3f-82df-30e15be19332',
     'Dr. Nour, my facial swelling has gone down significantly after 3 days of the Prednisolone. Should I continue the full 5 days?',
     'text', true, CURRENT_TIMESTAMP - INTERVAL '3 days'),

    ('a0a00001-0001-0001-0001-000000000021', 'c0ff0001-0001-0001-0001-000000000003',
     '04dc906b-a477-4f3f-82df-30e15be19332', '93f3a5d7-f361-4830-9b3c-d8835fc9ec36',
     'That is great news Ahmed! Yes, please complete the full 5-day course. Stopping steroids early can cause the reaction to return. The medication needs to fully suppress the allergic response.',
     'text', true, CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '2 hours'),

    ('a0a00001-0001-0001-0001-000000000022', 'c0ff0001-0001-0001-0001-000000000003',
     '93f3a5d7-f361-4830-9b3c-d8835fc9ec36', '04dc906b-a477-4f3f-82df-30e15be19332',
     'Understood, I will complete the course. Thank you for the quick response!',
     'text', true, CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '3 hours');

-- ============================================================================
-- STEP 9: CONSULTATION SESSIONS (For video calls)
-- ============================================================================

-- Session for today's completed appointment 1
INSERT INTO consultation_sessions (
    id, appointment_id, jitsi_room_id, started_at, ended_at, duration_seconds
) VALUES (
    'ssss0001-0001-0001-0001-000000000001',
    'aaaa0001-0001-0001-0001-000000000001',
    'tawari-aaaa0001-0001-0001-0001-000000000001',
    (CURRENT_DATE + TIME '09:02:00')::timestamp,
    (CURRENT_DATE + TIME '09:25:00')::timestamp,
    1380  -- 23 minutes in seconds
);

-- Session for today's completed appointment 2
INSERT INTO consultation_sessions (
    id, appointment_id, jitsi_room_id, started_at, ended_at, duration_seconds
) VALUES (
    'ssss0001-0001-0001-0001-000000000002',
    'aaaa0001-0001-0001-0001-000000000002',
    'tawari-aaaa0001-0001-0001-0001-000000000002',
    (CURRENT_DATE + TIME '10:32:00')::timestamp,
    (CURRENT_DATE + TIME '10:58:00')::timestamp,
    1560  -- 26 minutes in seconds
);

-- ============================================================================
-- STEP 10: TRANSACTIONS (Payments for completed appointments)
-- ============================================================================
-- Note: Schema uses transaction_type ENUM and doesn't have doctor_profile_id directly

-- Transaction for today's appointment 1
INSERT INTO transactions (
    id, appointment_id, patient_profile_id,
    amount, currency, transaction_type,
    status, payment_method
) VALUES (
    'tttt0001-0001-0001-0001-000000000001',
    'aaaa0001-0001-0001-0001-000000000001',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    250.00, 'EGP', 'consultation',
    'completed', 'card'
);

-- Transaction for today's appointment 2
INSERT INTO transactions (
    id, appointment_id, patient_profile_id,
    amount, currency, transaction_type,
    status, payment_method
) VALUES (
    'tttt0001-0001-0001-0001-000000000002',
    'aaaa0001-0001-0001-0001-000000000002',
    '285b42d6-08e8-4db3-8dbb-195c74229e59',
    250.00, 'EGP', 'consultation',
    'completed', 'card'
);

-- Transaction for past appointment (3 days ago)
INSERT INTO transactions (
    id, appointment_id, patient_profile_id,
    amount, currency, transaction_type,
    status, payment_method
) VALUES (
    'tttt0001-0001-0001-0001-000000000010',
    'aaaa0001-0001-0001-0001-000000000010',
    '285b42d6-08e8-4db3-8dbb-195c74229e59',
    250.00, 'EGP', 'consultation',
    'completed', 'card'
);

-- Transaction for past appointment (5 days ago)
INSERT INTO transactions (
    id, appointment_id, patient_profile_id,
    amount, currency, transaction_type,
    status, payment_method
) VALUES (
    'tttt0001-0001-0001-0001-000000000011',
    'aaaa0001-0001-0001-0001-000000000011',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    250.00, 'EGP', 'consultation',
    'completed', 'card'
);

-- Transaction for past appointment (1 week ago)
INSERT INTO transactions (
    id, appointment_id, patient_profile_id,
    amount, currency, transaction_type,
    status, payment_method
) VALUES (
    'tttt0001-0001-0001-0001-000000000012',
    'aaaa0001-0001-0001-0001-000000000012',
    '285b42d6-08e8-4db3-8dbb-195c74229e59',
    250.00, 'EGP', 'consultation',
    'completed', 'card'
);

-- Transaction for past appointment (2 weeks ago)
INSERT INTO transactions (
    id, appointment_id, patient_profile_id,
    amount, currency, transaction_type,
    status, payment_method
) VALUES (
    'tttt0001-0001-0001-0001-000000000015',
    'aaaa0001-0001-0001-0001-000000000015',
    '24cde19e-28b2-46fa-9f37-ad24cba603a7',
    250.00, 'EGP', 'consultation',
    'completed', 'card'
);

-- Transaction for past appointment (3 weeks ago)
INSERT INTO transactions (
    id, appointment_id, patient_profile_id,
    amount, currency, transaction_type,
    status, payment_method
) VALUES (
    'tttt0001-0001-0001-0001-000000000016',
    'aaaa0001-0001-0001-0001-000000000016',
    '285b42d6-08e8-4db3-8dbb-195c74229e59',
    250.00, 'EGP', 'consultation',
    'completed', 'card'
);

-- ============================================================================
-- STEP 10b: DOCTOR EARNINGS (Separate table for earnings tracking)
-- ============================================================================

-- Earnings for today's appointment 1
INSERT INTO doctor_earnings (
    id, doctor_profile_id, appointment_id, transaction_id,
    gross_amount, platform_fee, net_amount, status, available_at
) VALUES (
    'eeee0001-0001-0001-0001-000000000001',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    'aaaa0001-0001-0001-0001-000000000001',
    'tttt0001-0001-0001-0001-000000000001',
    250.00, 25.00, 225.00, 'available', CURRENT_TIMESTAMP
);

-- Earnings for today's appointment 2
INSERT INTO doctor_earnings (
    id, doctor_profile_id, appointment_id, transaction_id,
    gross_amount, platform_fee, net_amount, status, available_at
) VALUES (
    'eeee0001-0001-0001-0001-000000000002',
    'db44e99b-5491-4241-b5a0-14d2668668bf',
    'aaaa0001-0001-0001-0001-000000000002',
    'tttt0001-0001-0001-0001-000000000002',
    250.00, 25.00, 225.00, 'available', CURRENT_TIMESTAMP
);

-- Earnings for past appointments
INSERT INTO doctor_earnings (
    id, doctor_profile_id, appointment_id, transaction_id,
    gross_amount, platform_fee, net_amount, status, available_at
) VALUES
    ('eeee0001-0001-0001-0001-000000000010', 'db44e99b-5491-4241-b5a0-14d2668668bf',
     'aaaa0001-0001-0001-0001-000000000010', 'tttt0001-0001-0001-0001-000000000010',
     250.00, 25.00, 225.00, 'available', CURRENT_TIMESTAMP - INTERVAL '3 days'),
    ('eeee0001-0001-0001-0001-000000000011', 'db44e99b-5491-4241-b5a0-14d2668668bf',
     'aaaa0001-0001-0001-0001-000000000011', 'tttt0001-0001-0001-0001-000000000011',
     250.00, 25.00, 225.00, 'available', CURRENT_TIMESTAMP - INTERVAL '5 days'),
    ('eeee0001-0001-0001-0001-000000000012', 'db44e99b-5491-4241-b5a0-14d2668668bf',
     'aaaa0001-0001-0001-0001-000000000012', 'tttt0001-0001-0001-0001-000000000012',
     250.00, 25.00, 225.00, 'available', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    ('eeee0001-0001-0001-0001-000000000015', 'db44e99b-5491-4241-b5a0-14d2668668bf',
     'aaaa0001-0001-0001-0001-000000000015', 'tttt0001-0001-0001-0001-000000000015',
     250.00, 25.00, 225.00, 'paid_out', CURRENT_TIMESTAMP - INTERVAL '14 days'),
    ('eeee0001-0001-0001-0001-000000000016', 'db44e99b-5491-4241-b5a0-14d2668668bf',
     'aaaa0001-0001-0001-0001-000000000016', 'tttt0001-0001-0001-0001-000000000016',
     250.00, 25.00, 225.00, 'paid_out', CURRENT_TIMESTAMP - INTERVAL '21 days');

-- ============================================================================
-- STEP 11: NOTIFICATIONS (For doctor)
-- ============================================================================

-- Notification: New appointment booked
INSERT INTO notifications (id, profile_id, title, body, notification_type, data, is_read, created_at)
VALUES
    ('nnnn0001-0001-0001-0001-000000000001', '04dc906b-a477-4f3f-82df-30e15be19332',
     'New Appointment', 'Ahmed Hassan has booked an appointment for today at 2:00 PM.',
     'new_appointment', '{"appointment_id": "aaaa0001-0001-0001-0001-000000000003"}'::jsonb,
     false, CURRENT_TIMESTAMP - INTERVAL '1 day'),

    ('nnnn0001-0001-0001-0001-000000000002', '04dc906b-a477-4f3f-82df-30e15be19332',
     'Patient in Waiting Room', 'Ahmed Hassan is waiting for your consultation.',
     'patient_waiting', '{"appointment_id": "aaaa0001-0001-0001-0001-000000000003"}'::jsonb,
     false, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),

    ('nnnn0001-0001-0001-0001-000000000003', '04dc906b-a477-4f3f-82df-30e15be19332',
     'New Message', 'You have a new message from Ahmed Hassan.',
     'message', '{"conversation_id": "c0ff0001-0001-0001-0001-000000000001"}'::jsonb,
     false, CURRENT_TIMESTAMP - INTERVAL '2 hours'),

    ('nnnn0001-0001-0001-0001-000000000004', '04dc906b-a477-4f3f-82df-30e15be19332',
     'New Review', 'Ahmed Hassan left you a 5-star review.',
     'review', '{"review_id": "rrrr0001-0001-0001-0001-000000000001"}'::jsonb,
     true, CURRENT_TIMESTAMP - INTERVAL '4 days'),

    ('nnnn0001-0001-0001-0001-000000000005', '04dc906b-a477-4f3f-82df-30e15be19332',
     'Appointment Tomorrow', 'Reminder: You have an appointment with Ahmed Hassan tomorrow at 10:00 AM.',
     'appointment_reminder', '{"appointment_id": "aaaa0001-0001-0001-0001-000000000020"}'::jsonb,
     false, CURRENT_TIMESTAMP - INTERVAL '6 hours'),

    ('nnnn0001-0001-0001-0001-000000000006', '04dc906b-a477-4f3f-82df-30e15be19332',
     'Patient No-Show', 'Fatima Ali did not attend the scheduled appointment yesterday.',
     'no_show', '{"appointment_id": "aaaa0001-0001-0001-0001-000000000014"}'::jsonb,
     true, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- ============================================================================
-- STEP 12: Update doctor's total consultations count
-- ============================================================================

UPDATE doctor_profiles
SET total_consultations = (
    SELECT COUNT(*) FROM appointments
    WHERE doctor_profile_id = 'db44e99b-5491-4241-b5a0-14d2668668bf'
    AND status = 'completed'
)
WHERE id = 'db44e99b-5491-4241-b5a0-14d2668668bf';

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify data)
-- ============================================================================

-- Check today's appointments for Dr. Nour
-- SELECT id, status, scheduled_start, chief_complaint
-- FROM appointments
-- WHERE doctor_profile_id = 'db44e99b-5491-4241-b5a0-14d2668668bf'
-- AND DATE(scheduled_start) = CURRENT_DATE
-- ORDER BY scheduled_start;

-- Check all appointments count by status
-- SELECT status, COUNT(*)
-- FROM appointments
-- WHERE doctor_profile_id = 'db44e99b-5491-4241-b5a0-14d2668668bf'
-- GROUP BY status;

-- Check prescriptions
-- SELECT medication_name, status, valid_until
-- FROM prescriptions
-- WHERE doctor_profile_id = 'db44e99b-5491-4241-b5a0-14d2668668bf';

-- Check reviews
-- SELECT rating, comment, created_at
-- FROM reviews
-- WHERE doctor_profile_id = 'db44e99b-5491-4241-b5a0-14d2668668bf'
-- ORDER BY created_at DESC;

-- Check unread messages
-- SELECT content, created_at, is_read
-- FROM messages
-- WHERE recipient_profile_id = '04dc906b-a477-4f3f-82df-30e15be19332'
-- ORDER BY created_at DESC;

-- Check doctor stats
-- SELECT rating_average, rating_count, total_consultations
-- FROM doctor_profiles
-- WHERE id = 'db44e99b-5491-4241-b5a0-14d2668668bf';

-- ============================================================================
-- END OF SEEDING SCRIPT
-- ============================================================================
