-- Migration: Add clinic fields to doctor_profiles and PDF fields to prescriptions
-- This migration supports:
-- 1. Doctor clinic information for prescription headers
-- 2. PDF storage path for generated prescription PDFs
-- 3. Linking urgent care consultations to appointments for reviews

-- ============================================
-- 1. Add Clinic Fields to doctor_profiles
-- ============================================

ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS clinic_name VARCHAR(255);
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS clinic_address TEXT;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS clinic_phone VARCHAR(20);
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

COMMENT ON COLUMN doctor_profiles.clinic_name IS 'Name of the clinic or medical practice';
COMMENT ON COLUMN doctor_profiles.clinic_address IS 'Full address of the clinic';
COMMENT ON COLUMN doctor_profiles.clinic_phone IS 'Clinic reception phone number';
COMMENT ON COLUMN doctor_profiles.phone_number IS 'Doctor personal/professional phone number';

-- ============================================
-- 2. Add PDF Storage Fields to prescriptions
-- ============================================

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pdf_path TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ;

COMMENT ON COLUMN prescriptions.pdf_path IS 'Storage path for generated prescription PDF';
COMMENT ON COLUMN prescriptions.pdf_generated_at IS 'Timestamp when PDF was last generated';

-- ============================================
-- 3. Add Urgent Care Link to appointments
-- ============================================

-- Add type column to distinguish scheduled vs urgent care appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'scheduled';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS consultation_queue_id UUID REFERENCES consultation_queue(id);

COMMENT ON COLUMN appointments.type IS 'Type of appointment: scheduled or urgent_care';
COMMENT ON COLUMN appointments.consultation_queue_id IS 'Link to consultation_queue for urgent care appointments';

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_appointments_consultation_queue_id ON appointments(consultation_queue_id);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(type);

-- ============================================
-- 4. Update RLS Policies for new columns
-- ============================================

-- Doctors can update their own clinic info
DROP POLICY IF EXISTS "doctors_can_update_clinic_info" ON doctor_profiles;
CREATE POLICY "doctors_can_update_clinic_info"
ON doctor_profiles
FOR UPDATE
USING (
    profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    )
);

-- ============================================
-- 5. Create storage bucket for prescription PDFs (if not exists)
-- ============================================

-- Note: This needs to be run via Supabase dashboard or storage API
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('prescription-pdfs', 'prescription-pdfs', false)
-- ON CONFLICT (id) DO NOTHING;

-- The bucket should have RLS policies that allow:
-- - Doctors to upload PDFs for their prescriptions
-- - Patients to download PDFs for their prescriptions
