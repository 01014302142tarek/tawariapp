-- ============================================================================
-- Additional Demo Data for Patient3 (Omar Khalil)
-- ============================================================================
-- Patient3 only had a cancelled appointment. This script adds:
-- - 2 completed appointments with consultation notes
-- - 1 upcoming scheduled appointment
-- - 3 prescriptions (2 active, 1 completed)
-- - Messages with doctor
-- - Transactions for completed appointments
-- ============================================================================

-- ============================================================================
-- STEP 1: Add allergies for patient3 (Omar has no documented allergies but add one mild one)
-- ============================================================================
INSERT INTO allergies (patient_profile_id, allergen, severity, reaction, diagnosed_date, is_active)
SELECT pp.id, 'Pollen', 'mild', 'Seasonal allergies, mild congestion', '2020-03-15', true
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 2: Completed appointment 1 - 2 weeks ago with Dr. Mohamed (Cardiology)
-- ============================================================================
INSERT INTO appointments (
  patient_profile_id, doctor_profile_id, scheduled_start, scheduled_end,
  actual_start, actual_end, status, appointment_type, chief_complaint, consultation_fee
)
SELECT
  pp.id,
  dp.id,
  NOW() - INTERVAL '14 days' + TIME '10:00',
  NOW() - INTERVAL '14 days' + TIME '10:30',
  NOW() - INTERVAL '14 days' + TIME '10:02',
  NOW() - INTERVAL '14 days' + TIME '10:28',
  'completed',
  'scheduled',
  'Routine heart checkup, occasional chest discomfort',
  350.00
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
CROSS JOIN (
  SELECT dp.id FROM doctor_profiles dp
  JOIN profiles p2 ON dp.profile_id = p2.id
  JOIN auth.users u2 ON p2.user_id = u2.id
  WHERE u2.email = 'doctor1@tawari.test'
) dp
WHERE u.email = 'patient3@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 3: Completed appointment 2 - 1 week ago with Dr. Sara (General Practice)
-- ============================================================================
INSERT INTO appointments (
  patient_profile_id, doctor_profile_id, scheduled_start, scheduled_end,
  actual_start, actual_end, status, appointment_type, chief_complaint, consultation_fee
)
SELECT
  pp.id,
  dp.id,
  NOW() - INTERVAL '7 days' + TIME '14:00',
  NOW() - INTERVAL '7 days' + TIME '14:30',
  NOW() - INTERVAL '7 days' + TIME '14:05',
  NOW() - INTERVAL '7 days' + TIME '14:32',
  'completed',
  'scheduled',
  'Follow-up for mild flu symptoms',
  200.00
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
CROSS JOIN (
  SELECT dp.id FROM doctor_profiles dp
  JOIN profiles p2 ON dp.profile_id = p2.id
  JOIN auth.users u2 ON p2.user_id = u2.id
  WHERE u2.email = 'doctor3@tawari.test'
) dp
WHERE u.email = 'patient3@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 4: Upcoming appointment - 3 days from now with Dr. Mohamed (Cardiology)
-- ============================================================================
INSERT INTO appointments (
  patient_profile_id, doctor_profile_id, scheduled_start, scheduled_end,
  status, appointment_type, chief_complaint, consultation_fee
)
SELECT
  pp.id,
  dp.id,
  (CURRENT_DATE + INTERVAL '3 days' + TIME '11:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '3 days' + TIME '11:30')::timestamptz,
  'scheduled',
  'scheduled',
  'Follow-up cardiac checkup',
  350.00
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
CROSS JOIN (
  SELECT dp.id FROM doctor_profiles dp
  JOIN profiles p2 ON dp.profile_id = p2.id
  JOIN auth.users u2 ON p2.user_id = u2.id
  WHERE u2.email = 'doctor1@tawari.test'
) dp
WHERE u.email = 'patient3@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 5: Consultation notes for completed appointments
-- ============================================================================

-- Consultation note for cardiac checkup (2 weeks ago)
INSERT INTO consultation_notes (
  appointment_id, doctor_profile_id, subjective, objective, assessment, plan
)
SELECT
  a.id,
  a.doctor_profile_id,
  'Patient reports occasional chest discomfort during exercise, lasting 2-3 minutes, resolving with rest. No shortness of breath at rest. Denies palpitations. Non-smoker, exercises 3x/week.',
  'BP: 125/80 mmHg. HR: 72 bpm regular. BMI: 24.2. Heart sounds normal, no murmurs. Lungs clear.',
  'Atypical chest pain, likely musculoskeletal. Low cardiovascular risk profile. ECG normal sinus rhythm.',
  'Recommend stress test if symptoms persist. Continue current exercise routine. Return in 2 weeks for follow-up. Consider lifestyle modifications for stress management.'
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test'
  AND a.status = 'completed'
  AND a.chief_complaint LIKE '%heart%'
ON CONFLICT DO NOTHING;

-- Consultation note for flu follow-up (1 week ago)
INSERT INTO consultation_notes (
  appointment_id, doctor_profile_id, subjective, objective, assessment, plan
)
SELECT
  a.id,
  a.doctor_profile_id,
  'Patient presenting for follow-up after flu symptoms 1 week ago. Reports significant improvement. Mild residual cough. No fever for 5 days. Energy levels returning to normal.',
  'Temp: 37.0°C. Throat slightly pink, no exudate. Lungs clear bilaterally. No lymphadenopathy.',
  'Resolving viral upper respiratory infection. Recovery progressing well.',
  'Continue supportive care. Stay hydrated. Rest as needed. No antibiotics required. Return if symptoms worsen or new symptoms develop.'
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test'
  AND a.status = 'completed'
  AND a.chief_complaint LIKE '%flu%'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 6: Transactions for completed appointments
-- ============================================================================

-- Transaction for cardiac checkup
INSERT INTO transactions (
  patient_profile_id, appointment_id, amount, currency, transaction_type,
  status, payment_method, payment_details
)
SELECT
  a.patient_profile_id,
  a.id,
  a.consultation_fee,
  'EGP',
  'consultation',
  'completed',
  'card',
  '{"card_last_four": "5678", "brand": "mastercard"}'::jsonb
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test'
  AND a.status = 'completed'
  AND a.chief_complaint LIKE '%heart%'
ON CONFLICT DO NOTHING;

-- Transaction for flu follow-up
INSERT INTO transactions (
  patient_profile_id, appointment_id, amount, currency, transaction_type,
  status, payment_method, payment_details
)
SELECT
  a.patient_profile_id,
  a.id,
  a.consultation_fee,
  'EGP',
  'consultation',
  'completed',
  'wallet',
  '{"wallet_provider": "vodafone_cash"}'::jsonb
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test'
  AND a.status = 'completed'
  AND a.chief_complaint LIKE '%flu%'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 7: Doctor earnings for completed appointments
-- ============================================================================

INSERT INTO doctor_earnings (
  doctor_profile_id, appointment_id, gross_amount, platform_fee, net_amount,
  currency, status, processed_at
)
SELECT
  a.doctor_profile_id,
  a.id,
  a.consultation_fee,
  a.consultation_fee * 0.10,
  a.consultation_fee * 0.90,
  'EGP',
  'paid',
  a.actual_end + INTERVAL '1 day'
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test'
  AND a.status = 'completed'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 8: Prescriptions for patient3
-- ============================================================================

-- Prescription 1: Beta blocker from cardiac appointment (active)
INSERT INTO prescriptions (
  patient_profile_id, doctor_profile_id, appointment_id, medication_name,
  dosage, frequency, duration, instructions, status, prescribed_date, expiry_date
)
SELECT
  pp.id,
  a.doctor_profile_id,
  a.id,
  'Bisoprolol 2.5mg',
  '2.5mg',
  'Once daily in the morning',
  '30 days',
  'Take with food. Monitor heart rate. Do not stop abruptly.',
  'active',
  (NOW() - INTERVAL '14 days')::date,
  (NOW() + INTERVAL '16 days')::date
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test'
  AND a.status = 'completed'
  AND a.chief_complaint LIKE '%heart%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Prescription 2: Cough suppressant from flu follow-up (active)
INSERT INTO prescriptions (
  patient_profile_id, doctor_profile_id, appointment_id, medication_name,
  dosage, frequency, duration, instructions, status, prescribed_date, expiry_date
)
SELECT
  pp.id,
  a.doctor_profile_id,
  a.id,
  'Dextromethorphan Syrup',
  '10ml',
  'Every 6-8 hours as needed',
  '7 days',
  'Take for dry cough only. Do not exceed 4 doses per day.',
  'active',
  (NOW() - INTERVAL '7 days')::date,
  (NOW())::date
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test'
  AND a.status = 'completed'
  AND a.chief_complaint LIKE '%flu%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Prescription 3: Vitamin D (completed - from older visit)
INSERT INTO prescriptions (
  patient_profile_id, doctor_profile_id, medication_name,
  dosage, frequency, duration, instructions, status, prescribed_date, expiry_date
)
SELECT
  pp.id,
  (SELECT dp.id FROM doctor_profiles dp
   JOIN profiles p2 ON dp.profile_id = p2.id
   JOIN auth.users u2 ON p2.user_id = u2.id
   WHERE u2.email = 'doctor3@tawari.test'),
  'Vitamin D3 1000 IU',
  '1000 IU',
  'Once daily with meal',
  '60 days',
  'Take with a meal containing fat for better absorption.',
  'completed',
  (NOW() - INTERVAL '90 days')::date,
  (NOW() - INTERVAL '30 days')::date
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 9: Messages between patient3 and doctors
-- ============================================================================

-- Get conversation or create one between patient3 and doctor1
WITH patient3_profile AS (
  SELECT p.id as profile_id, pp.id as patient_profile_id
  FROM patient_profiles pp
  JOIN profiles p ON pp.profile_id = p.id
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'patient3@tawari.test'
),
doctor1_profile AS (
  SELECT p.id as profile_id, dp.id as doctor_profile_id
  FROM doctor_profiles dp
  JOIN profiles p ON dp.profile_id = p.id
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'doctor1@tawari.test'
)
INSERT INTO messages (sender_id, recipient_id, content, message_type, read_at)
SELECT
  p.profile_id,
  d.profile_id,
  'Hello Dr. Mohamed, I wanted to follow up on my appointment. Should I continue with the beta blocker even though I feel fine now?',
  'text',
  NULL
FROM patient3_profile p, doctor1_profile d
ON CONFLICT DO NOTHING;

-- Doctor reply (read)
WITH patient3_profile AS (
  SELECT p.id as profile_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'patient3@tawari.test'
),
doctor1_profile AS (
  SELECT p.id as profile_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'doctor1@tawari.test'
)
INSERT INTO messages (sender_id, recipient_id, content, message_type, read_at, created_at)
SELECT
  d.profile_id,
  p.profile_id,
  'Hello Omar, yes please continue the medication as prescribed. The fact that you feel fine is a good sign that it''s working. We''ll evaluate during your follow-up appointment.',
  'text',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '2 days'
FROM patient3_profile p, doctor1_profile d
ON CONFLICT DO NOTHING;

-- Patient thank you message (read)
WITH patient3_profile AS (
  SELECT p.id as profile_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'patient3@tawari.test'
),
doctor1_profile AS (
  SELECT p.id as profile_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'doctor1@tawari.test'
)
INSERT INTO messages (sender_id, recipient_id, content, message_type, read_at, created_at)
SELECT
  p.profile_id,
  d.profile_id,
  'Thank you doctor! I will see you at the appointment.',
  'text',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day' - INTERVAL '2 hours'
FROM patient3_profile p, doctor1_profile d
ON CONFLICT DO NOTHING;

-- New unread message from doctor (appointment reminder)
WITH patient3_profile AS (
  SELECT p.id as profile_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'patient3@tawari.test'
),
doctor1_profile AS (
  SELECT p.id as profile_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'doctor1@tawari.test'
)
INSERT INTO messages (sender_id, recipient_id, content, message_type, read_at, created_at)
SELECT
  d.profile_id,
  p.profile_id,
  'Reminder: Your follow-up appointment is scheduled for 3 days from now. Please have your blood pressure readings ready if you''ve been monitoring at home.',
  'text',
  NULL,
  NOW() - INTERVAL '6 hours'
FROM patient3_profile p, doctor1_profile d
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 10: Review from patient3 for Dr. Mohamed
-- ============================================================================

INSERT INTO reviews (
  patient_profile_id, doctor_profile_id, appointment_id, rating, comment, is_anonymous
)
SELECT
  a.patient_profile_id,
  a.doctor_profile_id,
  a.id,
  5,
  'Dr. Mohamed was very thorough and took the time to explain everything clearly. Highly recommend for cardiac care.',
  false
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test'
  AND a.status = 'completed'
  AND a.chief_complaint LIKE '%heart%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 11: Notifications for patient3
-- ============================================================================

-- Notification for upcoming appointment
INSERT INTO notifications (
  user_id, type, title, message, data, is_read
)
SELECT
  u.id,
  'appointment_reminder',
  'Upcoming Appointment',
  'You have a follow-up cardiac checkup with Dr. Mohamed Ibrahim in 3 days.',
  jsonb_build_object('appointment_date', (CURRENT_DATE + INTERVAL '3 days')::text),
  false
FROM auth.users u
WHERE u.email = 'patient3@tawari.test'
ON CONFLICT DO NOTHING;

-- Notification for prescription
INSERT INTO notifications (
  user_id, type, title, message, data, is_read, created_at
)
SELECT
  u.id,
  'prescription_issued',
  'New Prescription',
  'Dr. Mohamed Ibrahim has prescribed Bisoprolol 2.5mg for you.',
  jsonb_build_object('medication', 'Bisoprolol 2.5mg'),
  true,
  NOW() - INTERVAL '14 days'
FROM auth.users u
WHERE u.email = 'patient3@tawari.test'
ON CONFLICT DO NOTHING;

-- Notification for unread message
INSERT INTO notifications (
  user_id, type, title, message, data, is_read, created_at
)
SELECT
  u.id,
  'new_message',
  'New Message from Dr. Mohamed',
  'You have a new message regarding your upcoming appointment.',
  jsonb_build_object('from', 'Dr. Mohamed Ibrahim'),
  false,
  NOW() - INTERVAL '6 hours'
FROM auth.users u
WHERE u.email = 'patient3@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Done! Patient3 now has:
-- - 1 allergy
-- - 2 completed appointments + 1 upcoming
-- - 2 consultation notes
-- - 2 transactions
-- - 2 doctor earnings records
-- - 3 prescriptions (2 active, 1 completed)
-- - 4 messages (1 unread)
-- - 1 review
-- - 3 notifications (1 unread)
-- ============================================================================

SELECT 'Patient3 data seeding completed successfully!' as result;
