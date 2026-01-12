-- ============================================================================
-- Additional Demo Data for Patient3 (Omar Khalil) - Fixed Schema
-- ============================================================================
-- This script uses correct column names based on actual schema.
-- ============================================================================

-- ============================================================================
-- STEP 1: Prescriptions for patient3 (correct schema)
-- prescribed_at instead of prescribed_date, valid_until instead of expiry_date
-- ============================================================================

-- Prescription 1: Beta blocker from cardiac appointment (active)
INSERT INTO prescriptions (
  patient_profile_id, doctor_profile_id, appointment_id, medication_name,
  dosage, frequency, duration, instructions, status, prescribed_at, valid_until
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
  NOW() - INTERVAL '14 days',
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
  dosage, frequency, duration, instructions, status, prescribed_at, valid_until
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
  NOW() - INTERVAL '7 days',
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
  dosage, frequency, duration, instructions, status, prescribed_at, valid_until
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
  NOW() - INTERVAL '90 days',
  (NOW() - INTERVAL '30 days')::date
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 2: Doctor earnings (correct schema - no currency, no processed_at)
-- ============================================================================

INSERT INTO doctor_earnings (
  doctor_profile_id, appointment_id, gross_amount, platform_fee, net_amount, status, available_at
)
SELECT
  a.doctor_profile_id,
  a.id,
  a.consultation_fee,
  a.consultation_fee * 0.10,
  a.consultation_fee * 0.90,
  'available',
  a.actual_end + INTERVAL '1 day'
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test'
  AND a.status = 'completed'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 3: Notifications (correct schema - profile_id, notification_type, body)
-- ============================================================================

-- Get patient3 profile_id
WITH patient3_profile AS (
  SELECT p.id as profile_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'patient3@tawari.test'
)
-- Notification for upcoming appointment
INSERT INTO notifications (
  profile_id, notification_type, title, body, data, is_read
)
SELECT
  profile_id,
  'appointment_reminder',
  'Upcoming Appointment',
  'You have a follow-up cardiac checkup with Dr. Mohamed Ibrahim in 3 days.',
  jsonb_build_object('appointment_date', (CURRENT_DATE + INTERVAL '3 days')::text),
  false
FROM patient3_profile
ON CONFLICT DO NOTHING;

-- Notification for prescription (read)
WITH patient3_profile AS (
  SELECT p.id as profile_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'patient3@tawari.test'
)
INSERT INTO notifications (
  profile_id, notification_type, title, body, data, is_read, created_at
)
SELECT
  profile_id,
  'prescription_issued',
  'New Prescription',
  'Dr. Mohamed Ibrahim has prescribed Bisoprolol 2.5mg for you.',
  jsonb_build_object('medication', 'Bisoprolol 2.5mg'),
  true,
  NOW() - INTERVAL '14 days'
FROM patient3_profile
ON CONFLICT DO NOTHING;

-- Notification for new message (unread)
WITH patient3_profile AS (
  SELECT p.id as profile_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'patient3@tawari.test'
)
INSERT INTO notifications (
  profile_id, notification_type, title, body, data, is_read, created_at
)
SELECT
  profile_id,
  'new_message',
  'New Message from Dr. Mohamed',
  'You have a new message regarding your upcoming appointment.',
  jsonb_build_object('from', 'Dr. Mohamed Ibrahim'),
  false,
  NOW() - INTERVAL '6 hours'
FROM patient3_profile
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 4: Messages - Need to check how conversations work
-- Messages require conversation_id, let's create proper conversations
-- ============================================================================

-- First, check if there's a conversation table or messages are direct
-- Looking at messages schema: needs conversation_id which references what?

-- Create a direct message conversation between patient3 and doctor1
-- We need to handle this through the app or find the conversation pattern

-- For now, let's insert messages after creating a conversation record
-- First check if there's a way to create conversations

-- Query to find any existing conversation patterns
DO $$
DECLARE
  patient3_profile_id uuid;
  doctor1_profile_id uuid;
  conv_id uuid;
BEGIN
  -- Get patient3 profile_id
  SELECT p.id INTO patient3_profile_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'patient3@tawari.test';

  -- Get doctor1 profile_id
  SELECT p.id INTO doctor1_profile_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'doctor1@tawari.test';

  -- Generate a conversation ID (in the format used by the app)
  conv_id := gen_random_uuid();

  -- Insert messages with the conversation_id
  -- Message 1: Patient asks about medication
  INSERT INTO messages (conversation_id, sender_profile_id, recipient_profile_id, content, message_type, is_read, read_at, created_at)
  VALUES (
    conv_id,
    patient3_profile_id,
    doctor1_profile_id,
    'Hello Dr. Mohamed, I wanted to follow up on my appointment. Should I continue with the beta blocker even though I feel fine now?',
    'text',
    true,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '3 days'
  ) ON CONFLICT DO NOTHING;

  -- Message 2: Doctor replies
  INSERT INTO messages (conversation_id, sender_profile_id, recipient_profile_id, content, message_type, is_read, read_at, created_at)
  VALUES (
    conv_id,
    doctor1_profile_id,
    patient3_profile_id,
    'Hello Omar, yes please continue the medication as prescribed. The fact that you feel fine is a good sign that it''s working. We''ll evaluate during your follow-up appointment.',
    'text',
    true,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '2 days'
  ) ON CONFLICT DO NOTHING;

  -- Message 3: Patient thanks
  INSERT INTO messages (conversation_id, sender_profile_id, recipient_profile_id, content, message_type, is_read, read_at, created_at)
  VALUES (
    conv_id,
    patient3_profile_id,
    doctor1_profile_id,
    'Thank you doctor! I will see you at the appointment.',
    'text',
    true,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' - INTERVAL '2 hours'
  ) ON CONFLICT DO NOTHING;

  -- Message 4: Doctor reminder (unread by patient)
  INSERT INTO messages (conversation_id, sender_profile_id, recipient_profile_id, content, message_type, is_read, created_at)
  VALUES (
    conv_id,
    doctor1_profile_id,
    patient3_profile_id,
    'Reminder: Your follow-up appointment is scheduled for 3 days from now. Please have your blood pressure readings ready if you''ve been monitoring at home.',
    'text',
    false,
    NOW() - INTERVAL '6 hours'
  ) ON CONFLICT DO NOTHING;

END $$;

-- ============================================================================
-- Verification queries
-- ============================================================================

SELECT 'Appointments for patient3:' as check_type, count(*) as count
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test';

SELECT 'Prescriptions for patient3:' as check_type, count(*) as count
FROM prescriptions pr
JOIN patient_profiles pp ON pr.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test';

SELECT 'Messages for patient3:' as check_type, count(*) as count
FROM messages m
JOIN profiles p ON (m.sender_profile_id = p.id OR m.recipient_profile_id = p.id)
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test';

SELECT 'Notifications for patient3:' as check_type, count(*) as count
FROM notifications n
JOIN profiles p ON n.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient3@tawari.test';

SELECT 'Patient3 data seeding V2 completed!' as result;
