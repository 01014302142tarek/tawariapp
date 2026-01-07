-- TawariApp Seed Data
-- Migration: 00002_seed_data
-- Description: Initial seed data for specializations and system settings
-- Run this after 00001_initial_schema.sql

-- ============================================================================
-- MEDICAL SPECIALIZATIONS
-- ============================================================================

INSERT INTO specializations (name_en, name_ar, category, min_fee, max_fee, is_active) VALUES
-- General Practice
('General Practice', 'طب عام', 'general', 100.00, 300.00, true),
('Family Medicine', 'طب الأسرة', 'general', 100.00, 300.00, true),

-- Internal Medicine Specialties
('Internal Medicine', 'الطب الباطني', 'specialist', 150.00, 400.00, true),
('Cardiology', 'أمراض القلب', 'specialist', 200.00, 500.00, true),
('Pulmonology', 'أمراض الصدر والرئة', 'specialist', 200.00, 450.00, true),
('Gastroenterology', 'أمراض الجهاز الهضمي', 'specialist', 200.00, 450.00, true),
('Endocrinology', 'الغدد الصماء والسكري', 'specialist', 200.00, 450.00, true),
('Nephrology', 'أمراض الكلى', 'specialist', 200.00, 450.00, true),
('Rheumatology', 'أمراض الروماتيزم', 'specialist', 200.00, 450.00, true),
('Infectious Diseases', 'الأمراض المعدية', 'specialist', 200.00, 450.00, true),

-- Surgical Specialties
('General Surgery', 'الجراحة العامة', 'specialist', 200.00, 500.00, true),
('Orthopedic Surgery', 'جراحة العظام', 'specialist', 250.00, 600.00, true),
('Urology', 'جراحة المسالك البولية', 'specialist', 200.00, 500.00, true),
('ENT (Otolaryngology)', 'أنف وأذن وحنجرة', 'specialist', 200.00, 450.00, true),

-- Women & Children
('Obstetrics & Gynecology', 'النساء والتوليد', 'specialist', 200.00, 500.00, true),
('Pediatrics', 'طب الأطفال', 'specialist', 150.00, 400.00, true),

-- Mental Health
('Psychiatry', 'الطب النفسي', 'specialist', 250.00, 600.00, true),
('Psychology', 'علم النفس', 'specialist', 200.00, 500.00, true),

-- Other Specialties
('Dermatology', 'الأمراض الجلدية', 'specialist', 200.00, 450.00, true),
('Ophthalmology', 'طب العيون', 'specialist', 200.00, 500.00, true),
('Neurology', 'أمراض الأعصاب', 'specialist', 250.00, 550.00, true),
('Oncology', 'علاج الأورام', 'sub_specialist', 300.00, 700.00, true),
('Allergy & Immunology', 'الحساسية والمناعة', 'sub_specialist', 250.00, 550.00, true),
('Nutrition & Dietetics', 'التغذية العلاجية', 'specialist', 150.00, 350.00, true);

-- ============================================================================
-- SYSTEM SETTINGS
-- ============================================================================

INSERT INTO system_settings (key, value, description) VALUES
-- Platform Fees
('platform_fee_percentage', '15', 'Percentage fee taken from each consultation'),
('renewal_fee_percentage', '25', 'Percentage of consultation fee for prescription renewals'),

-- Cancellation Policy
('cancellation_policy', '{
    "full_refund_hours": 24,
    "partial_refund_75_hours": 12,
    "partial_refund_50_hours": 2,
    "no_refund_hours": 0,
    "doctor_cancel_refund": 100,
    "technical_issue_refund": 100,
    "free_late_cancels_per_quarter": 1
}', 'Cancellation and refund policy configuration'),

-- Appointment Settings
('appointment_settings', '{
    "default_duration_minutes": 30,
    "buffer_between_appointments_minutes": 5,
    "max_advance_booking_days": 30,
    "min_advance_booking_hours": 1,
    "waiting_room_open_before_minutes": 10
}', 'Appointment scheduling configuration'),

-- Doctor Verification
('doctor_verification', '{
    "required_documents": ["license", "degree", "id_document"],
    "optional_documents": ["certification"],
    "auto_suspend_on_license_expiry": true,
    "license_expiry_warning_days": 30
}', 'Doctor verification requirements'),

-- Assistant Limits
('assistant_limits', '{
    "default_max_per_doctor": 5,
    "max_requestable": 10,
    "requires_admin_approval_above": 5
}', 'Assistant assignment limits'),

-- Notification Settings
('notification_settings', '{
    "appointment_reminder_hours": [24, 2],
    "prescription_expiry_warning_days": 7,
    "payment_receipt_enabled": true,
    "marketing_enabled": false
}', 'Notification timing and preferences'),

-- Prescription Settings
('prescription_settings', '{
    "renewal_allowed_within_days": 30,
    "controlled_substance_requires_consultation": true,
    "max_refills_per_prescription": 3,
    "annual_consultation_required": true
}', 'Prescription and renewal rules'),

-- Video Consultation
('video_consultation', '{
    "provider": "jitsi",
    "domain": "meet.jit.si",
    "max_duration_minutes": 60,
    "recording_enabled": false,
    "observer_requires_consent": true
}', 'Video consultation configuration'),

-- Payout Settings
('payout_settings', '{
    "minimum_payout_amount": 100,
    "payout_processing_days": 3,
    "earnings_available_after_hours": 24
}', 'Doctor payout configuration'),

-- Support Settings
('support_settings', '{
    "auto_assign_enabled": false,
    "response_sla_hours": 24,
    "escalation_after_hours": 48,
    "categories": ["technical", "billing", "doctor_complaint", "other"]
}', 'Support ticket configuration');

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
