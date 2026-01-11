-- ============================================================================
-- TawariApp Comprehensive Demo Data Seed Script
-- ============================================================================
-- This script adds realistic demo data for all features.
-- Run AFTER seed-comprehensive-demo.ts creates the auth users.
--
-- NOTE: This script uses placeholder UUIDs that will be replaced by the TS script.
-- If running manually, replace the placeholders with actual UUIDs from your database.
--
-- USAGE:
-- 1. Run: npx tsx scripts/seed-comprehensive-demo.ts
-- 2. Copy this SQL to Supabase SQL Editor
-- 3. Replace any remaining placeholders with actual UUIDs
-- 4. Execute the SQL
-- ============================================================================

-- ============================================================================
-- STEP 1: Get existing profile and role profile IDs
-- Run this SELECT first to get your actual UUIDs
-- ============================================================================

-- SELECT
--   p.id as profile_id,
--   u.email,
--   CASE
--     WHEN p.role = 'patient' THEN (SELECT id FROM patient_profiles WHERE profile_id = p.id)
--     WHEN p.role = 'doctor' THEN (SELECT id FROM doctor_profiles WHERE profile_id = p.id)
--     WHEN p.role = 'admin' THEN (SELECT id FROM admin_profiles WHERE profile_id = p.id)
--     WHEN p.role = 'doctor_assistant' THEN (SELECT id FROM assistant_profiles WHERE profile_id = p.id)
--   END as role_profile_id
-- FROM profiles p
-- JOIN auth.users u ON p.user_id = u.id
-- WHERE u.email LIKE '%@tawari.test';

-- ============================================================================
-- STEP 2: Doctor Credentials (for verification workflow)
-- ============================================================================

-- Dr. Hassan (pending) - license uploaded, awaiting review
INSERT INTO doctor_credentials (doctor_profile_id, credential_type, document_url, document_name, issuing_authority, issue_date, verification_status)
SELECT
  dp.id,
  'license',
  'https://storage.tawariapp.com/credentials/doctor4_license.pdf',
  'Medical License - Hassan Mahmoud',
  'Egyptian Medical Syndicate',
  '2023-06-15',
  'pending'
FROM doctor_profiles dp
JOIN profiles p ON dp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'doctor4@tawari.test'
ON CONFLICT DO NOTHING;

-- Dr. Layla (under_review) - license + degree uploaded
INSERT INTO doctor_credentials (doctor_profile_id, credential_type, document_url, document_name, issuing_authority, issue_date, verification_status)
SELECT
  dp.id,
  'license',
  'https://storage.tawariapp.com/credentials/doctor5_license.pdf',
  'Medical License - Layla Farouk',
  'Egyptian Medical Syndicate',
  '2015-09-01',
  'pending'
FROM doctor_profiles dp
JOIN profiles p ON dp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'doctor5@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO doctor_credentials (doctor_profile_id, credential_type, document_url, document_name, issuing_authority, issue_date, verification_status)
SELECT
  dp.id,
  'degree',
  'https://storage.tawariapp.com/credentials/doctor5_degree.pdf',
  'MD Degree - Cairo University',
  'Cairo University',
  '2015-05-15',
  'pending'
FROM doctor_profiles dp
JOIN profiles p ON dp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'doctor5@tawari.test'
ON CONFLICT DO NOTHING;

-- Dr. Karim (suspended) - expired license
INSERT INTO doctor_credentials (doctor_profile_id, credential_type, document_url, document_name, issuing_authority, issue_date, expiry_date, verification_status, verification_notes)
SELECT
  dp.id,
  'license',
  'https://storage.tawariapp.com/credentials/doctor6_license.pdf',
  'Medical License - Karim Youssef (EXPIRED)',
  'Egyptian Medical Syndicate',
  '2010-03-01',
  '2024-12-31',
  'pending',
  'License expired - renewal documentation required'
FROM doctor_profiles dp
JOIN profiles p ON dp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'doctor6@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 3: Doctor Blocked Times
-- ============================================================================

-- Dr. Mohamed: Blocked Jan 15-20 (vacation)
INSERT INTO doctor_blocked_times (doctor_profile_id, start_datetime, end_datetime, reason, created_by)
SELECT
  dp.id,
  '2025-01-15 00:00:00+02',
  '2025-01-20 23:59:59+02',
  'Annual vacation',
  p.id
FROM doctor_profiles dp
JOIN profiles p ON dp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'doctor1@tawari.test'
ON CONFLICT DO NOTHING;

-- Dr. Nour: Blocked next Friday (conference)
INSERT INTO doctor_blocked_times (doctor_profile_id, start_datetime, end_datetime, reason, created_by)
SELECT
  dp.id,
  (date_trunc('week', CURRENT_DATE) + INTERVAL '4 days' + INTERVAL '8 hours')::timestamptz,
  (date_trunc('week', CURRENT_DATE) + INTERVAL '4 days' + INTERVAL '20 hours')::timestamptz,
  'Medical conference',
  p.id
FROM doctor_profiles dp
JOIN profiles p ON dp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'doctor2@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 4: Patient Medical Data - Allergies
-- ============================================================================

-- Ahmed Hassan (patient1) allergies
INSERT INTO allergies (patient_profile_id, allergen, severity, reaction, diagnosed_date, is_active)
SELECT pp.id, 'Penicillin', 'severe', 'Anaphylaxis, difficulty breathing', '2010-05-15', true
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO allergies (patient_profile_id, allergen, severity, reaction, diagnosed_date, is_active)
SELECT pp.id, 'Shellfish', 'moderate', 'Hives, swelling', '2015-08-20', true
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO allergies (patient_profile_id, allergen, severity, reaction, diagnosed_date, is_active)
SELECT pp.id, 'Dust mites', 'mild', 'Sneezing, runny nose', '2018-03-10', true
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

-- Fatima Ali (patient2) allergies
INSERT INTO allergies (patient_profile_id, allergen, severity, reaction, diagnosed_date, is_active)
SELECT pp.id, 'Pollen', 'mild', 'Seasonal allergies, congestion', '2012-04-01', true
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient2@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO allergies (patient_profile_id, allergen, severity, reaction, diagnosed_date, is_active)
SELECT pp.id, 'Latex', 'moderate', 'Skin irritation, rash', '2019-11-15', true
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient2@tawari.test'
ON CONFLICT DO NOTHING;

-- Mariam Saeed (patient4) allergies - elderly with multiple
INSERT INTO allergies (patient_profile_id, allergen, severity, reaction, diagnosed_date, is_active)
SELECT pp.id, 'Aspirin', 'severe', 'GI bleeding risk, severe stomach pain', '2005-02-28', true
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient4@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO allergies (patient_profile_id, allergen, severity, reaction, diagnosed_date, is_active)
SELECT pp.id, 'Sulfa drugs', 'moderate', 'Skin rash, fever', '2010-07-15', true
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient4@tawari.test'
ON CONFLICT DO NOTHING;

-- Youssef (patient5 - child) allergies
INSERT INTO allergies (patient_profile_id, allergen, severity, reaction, diagnosed_date, is_active)
SELECT pp.id, 'Peanuts', 'severe', 'Anaphylaxis risk - carries EpiPen', '2020-09-01', true
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient5@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 5: Patient Medical Data - Conditions
-- ============================================================================

-- Ahmed Hassan conditions
INSERT INTO conditions (patient_profile_id, condition_name, icd_code, diagnosed_date, status, notes)
SELECT pp.id, 'Essential Hypertension', 'I10', '2018-06-15', 'active', 'Controlled with Lisinopril 10mg daily'
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO conditions (patient_profile_id, condition_name, icd_code, diagnosed_date, status, notes)
SELECT pp.id, 'Hyperlipidemia', 'E78.5', '2019-02-20', 'managed', 'On Atorvastatin 20mg, LDL at target'
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO conditions (patient_profile_id, condition_name, icd_code, diagnosed_date, status, notes)
SELECT pp.id, 'Prediabetes', 'R73.03', '2023-01-10', 'active', 'HbA1c 6.2%, lifestyle modifications recommended'
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

-- Fatima Ali conditions
INSERT INTO conditions (patient_profile_id, condition_name, icd_code, diagnosed_date, status, notes)
SELECT pp.id, 'Atopic Dermatitis (Eczema)', 'L20.9', '2015-08-10', 'active', 'Flares with stress, managed with topical steroids'
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient2@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO conditions (patient_profile_id, condition_name, icd_code, diagnosed_date, status, notes)
SELECT pp.id, 'Generalized Anxiety Disorder', 'F41.1', '2020-03-15', 'managed', 'Stable on current management, therapy helping'
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient2@tawari.test'
ON CONFLICT DO NOTHING;

-- Mariam Saeed conditions (elderly - multiple)
INSERT INTO conditions (patient_profile_id, condition_name, icd_code, diagnosed_date, status, notes)
SELECT pp.id, 'Type 2 Diabetes Mellitus', 'E11.9', '2005-04-20', 'active', 'On Metformin 1000mg BID + Glimepiride 2mg'
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient4@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO conditions (patient_profile_id, condition_name, icd_code, diagnosed_date, status, notes)
SELECT pp.id, 'Osteoarthritis', 'M19.90', '2012-09-15', 'active', 'Bilateral knee OA, uses walker for long distances'
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient4@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO conditions (patient_profile_id, condition_name, icd_code, diagnosed_date, status, notes)
SELECT pp.id, 'Essential Hypertension', 'I10', '2000-11-08', 'managed', 'Well controlled on Amlodipine 5mg'
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient4@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO conditions (patient_profile_id, condition_name, icd_code, diagnosed_date, status, notes)
SELECT pp.id, 'Osteoporosis', 'M81.0', '2018-06-01', 'active', 'On Alendronate weekly, calcium + vitamin D supplements'
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient4@tawari.test'
ON CONFLICT DO NOTHING;

-- Youssef (child) conditions
INSERT INTO conditions (patient_profile_id, condition_name, icd_code, diagnosed_date, status, notes)
SELECT pp.id, 'Mild Intermittent Asthma', 'J45.20', '2020-11-20', 'active', 'Uses albuterol inhaler PRN, no daily controller needed'
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient5@tawari.test'
ON CONFLICT DO NOTHING;

-- Nadia (pregnant) conditions
INSERT INTO conditions (patient_profile_id, condition_name, icd_code, diagnosed_date, status, notes)
SELECT pp.id, 'Pregnancy', 'Z33.1', CURRENT_DATE - INTERVAL '28 weeks', 'active', '28 weeks gestation, due date in 12 weeks'
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient6@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO conditions (patient_profile_id, condition_name, icd_code, diagnosed_date, status, notes)
SELECT pp.id, 'Gestational Diabetes', 'O24.4', CURRENT_DATE - INTERVAL '8 weeks', 'active', 'Diet controlled, monitoring blood glucose 4x daily'
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient6@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 6: Lab Results
-- ============================================================================

-- Ahmed Hassan lab results
INSERT INTO lab_results (patient_profile_id, test_name, test_date, lab_name, results_summary, uploaded_by)
SELECT pp.id, 'Complete Blood Count (CBC)', CURRENT_DATE - INTERVAL '7 days', 'Al-Borg Laboratory',
  'WBC: 7.2 (normal), RBC: 4.8 (normal), Hemoglobin: 14.5 (normal), Platelets: 250 (normal)',
  p.id
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO lab_results (patient_profile_id, test_name, test_date, lab_name, results_summary, uploaded_by)
SELECT pp.id, 'Lipid Panel', CURRENT_DATE - INTERVAL '14 days', 'Al-Borg Laboratory',
  'Total Cholesterol: 185, LDL: 98 (at target), HDL: 52, Triglycerides: 140',
  p.id
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO lab_results (patient_profile_id, test_name, test_date, lab_name, results_summary, uploaded_by)
SELECT pp.id, 'HbA1c', CURRENT_DATE - INTERVAL '30 days', 'Al-Mokhtabar',
  'HbA1c: 6.2% (prediabetic range, improved from 6.4%)',
  p.id
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

-- Mariam lab results (elderly)
INSERT INTO lab_results (patient_profile_id, test_name, test_date, lab_name, results_summary, uploaded_by)
SELECT pp.id, 'Comprehensive Metabolic Panel', CURRENT_DATE - INTERVAL '21 days', 'Cairo Labs',
  'Glucose: 142 (elevated), Creatinine: 1.1 (normal), eGFR: 68 (mild decrease)',
  p.id
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient4@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO lab_results (patient_profile_id, test_name, test_date, lab_name, results_summary, uploaded_by)
SELECT pp.id, 'HbA1c', CURRENT_DATE - INTERVAL '45 days', 'Cairo Labs',
  'HbA1c: 7.4% (above target of 7.0%, medication adjustment recommended)',
  p.id
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient4@tawari.test'
ON CONFLICT DO NOTHING;

-- Nadia lab results (pregnant)
INSERT INTO lab_results (patient_profile_id, test_name, test_date, lab_name, results_summary, uploaded_by)
SELECT pp.id, 'Prenatal Panel', CURRENT_DATE - INTERVAL '60 days', 'Dar Al-Fouad Lab',
  'Blood type: AB+, Rh positive, HIV/Hep B negative, Rubella immune',
  p.id
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient6@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO lab_results (patient_profile_id, test_name, test_date, lab_name, results_summary, uploaded_by)
SELECT pp.id, 'Glucose Tolerance Test (GTT)', CURRENT_DATE - INTERVAL '56 days', 'Dar Al-Fouad Lab',
  'Fasting: 105, 1-hour: 195, 2-hour: 165 - Gestational diabetes diagnosed',
  p.id
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient6@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 7: Medical Records
-- ============================================================================

-- Ahmed Hassan medical records
INSERT INTO medical_records (patient_profile_id, record_type, title, description, date_recorded, is_self_reported)
SELECT pp.id, 'surgical_history', 'Appendectomy', 'Laparoscopic appendectomy for acute appendicitis. Uncomplicated recovery.', '2015-03-20', false
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO medical_records (patient_profile_id, record_type, title, description, date_recorded, is_self_reported)
SELECT pp.id, 'family_history', 'Family History of Heart Disease', 'Father had MI at age 58, paternal grandfather died of heart disease at 65.', '2018-06-15', true
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

-- Mariam medical records (elderly)
INSERT INTO medical_records (patient_profile_id, record_type, title, description, date_recorded, is_self_reported)
SELECT pp.id, 'surgical_history', 'Total Hip Replacement (Right)', 'Right total hip arthroplasty for severe osteoarthritis. Good post-op recovery.', '2020-08-15', false
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient4@tawari.test'
ON CONFLICT DO NOTHING;

INSERT INTO medical_records (patient_profile_id, record_type, title, description, date_recorded, is_self_reported)
SELECT pp.id, 'surgical_history', 'Cataract Surgery (Both Eyes)', 'Bilateral cataract extraction with IOL implantation. Vision restored to 20/30.', '2022-04-10', false
FROM patient_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient4@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 8: Appointments (Various Statuses)
-- ============================================================================

-- Note: We'll create appointments with various statuses for testing

-- Completed appointment: Ahmed + Dr. Mohamed (2 weeks ago)
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
  NOW() - INTERVAL '14 days' + TIME '10:27',
  'completed',
  'scheduled',
  'Follow-up for hypertension management, blood pressure monitoring',
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
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

-- Scheduled appointment: Ahmed + Dr. Mohamed (tomorrow)
INSERT INTO appointments (
  patient_profile_id, doctor_profile_id, scheduled_start, scheduled_end,
  status, appointment_type, chief_complaint, consultation_fee
)
SELECT
  pp.id,
  dp.id,
  (CURRENT_DATE + INTERVAL '1 day' + TIME '14:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '1 day' + TIME '14:30')::timestamptz,
  'scheduled',
  'scheduled',
  'Routine blood pressure check, discuss recent lab results',
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
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

-- Cancelled appointment: Omar + Dr. Sara
INSERT INTO appointments (
  patient_profile_id, doctor_profile_id, scheduled_start, scheduled_end,
  status, appointment_type, chief_complaint, consultation_fee,
  cancellation_reason, cancelled_at
)
SELECT
  pp.id,
  dp.id,
  NOW() - INTERVAL '3 days' + TIME '11:00',
  NOW() - INTERVAL '3 days' + TIME '11:30',
  'cancelled',
  'scheduled',
  'General health checkup',
  200.00,
  'Patient requested cancellation - scheduling conflict',
  NOW() - INTERVAL '4 days'
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

-- Completed appointments for Mariam (elderly) - multiple doctors
INSERT INTO appointments (
  patient_profile_id, doctor_profile_id, scheduled_start, scheduled_end,
  actual_start, actual_end, status, appointment_type, chief_complaint, consultation_fee
)
SELECT
  pp.id,
  dp.id,
  NOW() - INTERVAL '30 days' + TIME '09:00',
  NOW() - INTERVAL '30 days' + TIME '09:45',
  NOW() - INTERVAL '30 days' + TIME '09:05',
  NOW() - INTERVAL '30 days' + TIME '09:40',
  'completed',
  'scheduled',
  'Diabetes management review, HbA1c elevated',
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
WHERE u.email = 'patient4@tawari.test'
ON CONFLICT DO NOTHING;

-- Nadia (pregnant) appointment with Dr. Sara (GP)
INSERT INTO appointments (
  patient_profile_id, doctor_profile_id, scheduled_start, scheduled_end,
  status, appointment_type, chief_complaint, consultation_fee
)
SELECT
  pp.id,
  dp.id,
  (CURRENT_DATE + INTERVAL '3 days' + TIME '10:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '3 days' + TIME '10:30')::timestamptz,
  'scheduled',
  'scheduled',
  'Prenatal checkup, gestational diabetes monitoring',
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
WHERE u.email = 'patient6@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 9: Transactions for completed appointments
-- ============================================================================

-- Transaction for Ahmed's completed appointment
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
  '{"card_last_four": "4242", "brand": "visa"}'::jsonb
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
  AND a.status = 'completed'
  AND a.scheduled_start > NOW() - INTERVAL '30 days'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 10: Doctor Earnings
-- ============================================================================

-- Earnings for completed appointments (10% platform fee)
INSERT INTO doctor_earnings (
  doctor_profile_id, appointment_id, transaction_id,
  gross_amount, platform_fee, net_amount, status, available_at
)
SELECT
  a.doctor_profile_id,
  a.id,
  t.id,
  t.amount,
  t.amount * 0.10,
  t.amount * 0.90,
  'available',
  t.created_at + INTERVAL '7 days'
FROM appointments a
JOIN transactions t ON t.appointment_id = a.id
WHERE a.status = 'completed'
  AND t.status = 'completed'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 11: Consultation Sessions (Video Call Data)
-- ============================================================================

-- Session for Ahmed's completed appointment
INSERT INTO consultation_sessions (
  appointment_id, jitsi_room_id, started_at, ended_at, duration_seconds,
  patient_joined_at, doctor_joined_at, connection_quality
)
SELECT
  a.id,
  'tawari-' || REPLACE(a.id::text, '-', ''),
  a.actual_start,
  a.actual_end,
  EXTRACT(EPOCH FROM (a.actual_end - a.actual_start))::integer,
  a.actual_start + INTERVAL '30 seconds',
  a.actual_start,
  'good'
FROM appointments a
WHERE a.status = 'completed'
  AND a.actual_start IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 12: Consultation Notes (SOAP Format)
-- ============================================================================

-- Notes for Ahmed's appointment
INSERT INTO consultation_notes (
  appointment_id, doctor_profile_id, subjective, objective, assessment, plan,
  private_notes, follow_up_recommended, follow_up_timeframe
)
SELECT
  a.id,
  a.doctor_profile_id,
  'Patient reports feeling well. Blood pressure readings at home have been stable around 125/80. No headaches, dizziness, or chest pain. Compliant with Lisinopril 10mg daily.',
  'BP: 122/78 mmHg, HR: 72 bpm, Weight: 85kg (stable). General appearance: well, no distress. Cardiac: regular rhythm, no murmurs.',
  'Essential hypertension - well controlled on current medication. Prediabetes - stable, continue lifestyle modifications.',
  '1. Continue Lisinopril 10mg daily. 2. Continue lifestyle modifications (low sodium diet, exercise). 3. Repeat HbA1c in 3 months. 4. Follow up in 1 month.',
  'Patient motivated to improve diet. Discussed Mediterranean diet resources. Family history concerning - monitor closely.',
  true,
  '1 month'
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
  AND a.status = 'completed'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 13: Messages (Patient-Doctor Conversations)
-- ============================================================================

-- Conversation between Ahmed and Dr. Mohamed
-- Generate a conversation_id for this pair
DO $$
DECLARE
  v_patient_sender_profile_id uuid;
  v_doctor_profile_id uuid;
  v_conversation_id uuid;
BEGIN
  -- Get patient profile ID
  SELECT p.id INTO v_patient_sender_profile_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'patient1@tawari.test';

  -- Get doctor profile ID (we need the profile_id, not doctor_profile_id for messages)
  SELECT p.id INTO v_doctor_profile_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = 'doctor1@tawari.test';

  -- Generate conversation ID
  v_conversation_id := gen_random_uuid();

  -- Insert messages
  INSERT INTO messages (conversation_id, sender_profile_id, recipient_profile_id, content, message_type, is_read, read_at, created_at)
  VALUES
    (v_conversation_id, v_patient_sender_profile_id, v_doctor_profile_id,
     'Good morning Dr. Mohamed, I wanted to ask about my recent blood pressure readings. They have been around 130/85 at home. Is this okay?',
     'text', true, NOW() - INTERVAL '13 days', NOW() - INTERVAL '14 days'),

    (v_conversation_id, v_doctor_profile_id, v_patient_sender_profile_id,
     'Good morning Ahmed. Those readings are slightly elevated but acceptable. Are you taking your Lisinopril consistently? Please continue monitoring and bring your log to our appointment.',
     'text', true, NOW() - INTERVAL '13 days' + INTERVAL '2 hours', NOW() - INTERVAL '13 days' + INTERVAL '2 hours'),

    (v_conversation_id, v_patient_sender_profile_id, v_doctor_profile_id,
     'Yes doctor, I take it every morning. I will bring my log. Thank you for the quick response.',
     'text', true, NOW() - INTERVAL '13 days' + INTERVAL '3 hours', NOW() - INTERVAL '13 days' + INTERVAL '3 hours'),

    (v_conversation_id, v_patient_sender_profile_id, v_doctor_profile_id,
     'Dr. Mohamed, I just got my lab results. My cholesterol seems to be improving. Should I bring the report to our next appointment?',
     'text', true, NOW() - INTERVAL '7 days', NOW() - INTERVAL '8 days'),

    (v_conversation_id, v_doctor_profile_id, v_patient_sender_profile_id,
     'Excellent news Ahmed! Yes, please bring all your recent lab work. We will review everything together during our appointment tomorrow.',
     'text', true, NOW() - INTERVAL '6 days', NOW() - INTERVAL '7 days' + INTERVAL '4 hours');
END $$;

-- ============================================================================
-- STEP 14: Reviews
-- ============================================================================

-- Review from Ahmed for Dr. Mohamed
INSERT INTO reviews (
  appointment_id, patient_profile_id, doctor_profile_id,
  rating, comment, is_anonymous, is_visible
)
SELECT
  a.id,
  a.patient_profile_id,
  a.doctor_profile_id,
  5,
  'Dr. Mohamed is an excellent cardiologist. He takes time to explain everything clearly and answers all my questions. The video consultation was smooth and professional. Highly recommended!',
  false,
  true
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
  AND a.status = 'completed'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 15: Prescriptions
-- ============================================================================

-- Prescription from Ahmed's appointment
INSERT INTO prescriptions (
  appointment_id, patient_profile_id, doctor_profile_id,
  medication_name, dosage, frequency, duration, instructions,
  quantity, refills_allowed, is_controlled_substance, status, valid_until
)
SELECT
  a.id,
  a.patient_profile_id,
  a.doctor_profile_id,
  'Lisinopril',
  '10mg',
  'Once daily in the morning',
  '3 months',
  'Take with or without food. Monitor blood pressure regularly. Report any persistent cough or swelling.',
  90,
  2,
  false,
  'active',
  CURRENT_DATE + INTERVAL '3 months'
FROM appointments a
JOIN patient_profiles pp ON a.patient_profile_id = pp.id
JOIN profiles p ON pp.profile_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
  AND a.status = 'completed'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 16: Support Tickets
-- ============================================================================

-- Billing issue ticket from Ahmed
INSERT INTO support_tickets (
  ticket_number, submitted_by, category, subject, description, priority, status
)
SELECT
  'TKT-' || to_char(NOW(), 'YYYYMMDD') || '-0001',
  p.id,
  'billing',
  'Question about consultation fee',
  'I was charged 350 EGP for my appointment but I thought there was a discount for returning patients. Can you please clarify the pricing?',
  'normal',
  'open'
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

-- Technical issue ticket (resolved)
INSERT INTO support_tickets (
  ticket_number, submitted_by, category, subject, description, priority, status,
  resolution, resolved_at
)
SELECT
  'TKT-' || to_char(NOW() - INTERVAL '5 days', 'YYYYMMDD') || '-0002',
  p.id,
  'technical',
  'Video call quality issues',
  'During my last consultation, the video was freezing frequently. My internet connection was stable. Is there anything I can do to improve this?',
  'normal',
  'resolved',
  'We have optimized our video servers. Please try using Chrome browser for best results. Contact us if issues persist.',
  NOW() - INTERVAL '3 days'
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient2@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 17: Notifications
-- ============================================================================

-- Appointment reminder for Ahmed
INSERT INTO notifications (profile_id, title, body, notification_type, data, is_read)
SELECT
  p.id,
  'Appointment Reminder',
  'Your appointment with Dr. Mohamed Ibrahim is tomorrow at 2:00 PM. Please join the waiting room 5 minutes before.',
  'appointment_reminder',
  '{"appointment_id": null, "doctor_name": "Dr. Mohamed Ibrahim"}'::jsonb,
  false
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

-- Prescription notification
INSERT INTO notifications (profile_id, title, body, notification_type, data, is_read, read_at, created_at)
SELECT
  p.id,
  'New Prescription Available',
  'Dr. Mohamed Ibrahim has issued a new prescription for Lisinopril. You can view and download it from your medical records.',
  'prescription_issued',
  '{"prescription_id": null, "medication": "Lisinopril"}'::jsonb,
  true,
  NOW() - INTERVAL '13 days',
  NOW() - INTERVAL '14 days'
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'patient1@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 18: Announcements
-- ============================================================================

INSERT INTO announcements (title_en, title_ar, body_en, body_ar, target_roles, is_active, starts_at, ends_at)
VALUES
  ('Video Consultation Quality Improvements',
   'تحسينات جودة الاستشارة المرئية',
   'We have upgraded our video infrastructure for better call quality. Enjoy smoother consultations!',
   'قمنا بترقية البنية التحتية للفيديو لجودة مكالمات أفضل. استمتع باستشارات أكثر سلاسة!',
   ARRAY['patient', 'doctor']::user_role[],
   true,
   NOW() - INTERVAL '7 days',
   NOW() + INTERVAL '30 days'),

  ('Doctor Verification Updates',
   'تحديثات التحقق من الأطباء',
   'We have streamlined our doctor verification process. New doctors can now get verified within 24-48 hours.',
   'قمنا بتبسيط عملية التحقق من الأطباء. يمكن للأطباء الجدد الآن الحصول على التحقق خلال 24-48 ساعة.',
   ARRAY['doctor']::user_role[],
   true,
   NOW() - INTERVAL '3 days',
   NOW() + INTERVAL '60 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 19: Contact Form Submissions
-- ============================================================================

INSERT INTO contact_submissions (name, email, subject, message, status, created_at)
VALUES
  ('Dr. Ahmed Fathy',
   'ahmed.fathy@doctor.eg',
   'Interested in joining as a doctor',
   'I am a dermatologist with 10 years of experience. I am interested in joining Tawari to offer telemedicine consultations. How can I apply?',
   'new',
   NOW() - INTERVAL '2 days'),

  ('Pharma Solutions Co.',
   'partnerships@pharmasolutions.eg',
   'Partnership Inquiry',
   'We are a pharmaceutical distribution company in Egypt. We would like to discuss potential partnership opportunities for prescription delivery services.',
   'read',
   NOW() - INTERVAL '5 days'),

  ('Mohamed Patient',
   'mohamed@example.com',
   'Bug Report - Payment Page',
   'I tried to make a payment but the page shows an error. I have attached a screenshot. Please help.',
   'responded',
   NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 20: Audit Logs
-- ============================================================================

-- Sample audit logs for admin actions
INSERT INTO audit_logs (actor_profile_id, actor_role, action, resource_type, resource_id, new_values, metadata)
SELECT
  p.id,
  'admin',
  'doctor_verification_approved',
  'doctor_profiles',
  (SELECT dp2.id FROM doctor_profiles dp2 JOIN profiles p2 ON dp2.profile_id = p2.id JOIN auth.users u2 ON p2.user_id = u2.id WHERE u2.email = 'doctor3@tawari.test'),
  '{"verification_status": "verified"}'::jsonb,
  '{"reason": "All credentials verified successfully"}'::jsonb
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'admin1@tawari.test'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLETE!
-- ============================================================================

-- Verify the data was inserted
SELECT
  'Users' as entity, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Doctors', COUNT(*) FROM doctor_profiles
UNION ALL
SELECT 'Patients', COUNT(*) FROM patient_profiles
UNION ALL
SELECT 'Appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Messages', COUNT(*) FROM messages
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'Prescriptions', COUNT(*) FROM prescriptions
UNION ALL
SELECT 'Allergies', COUNT(*) FROM allergies
UNION ALL
SELECT 'Conditions', COUNT(*) FROM conditions
UNION ALL
SELECT 'Support Tickets', COUNT(*) FROM support_tickets
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;
