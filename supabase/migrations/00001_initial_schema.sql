-- TawariApp Initial Database Schema
-- Migration: 00001_initial_schema
-- Description: Creates all tables, enums, indexes, triggers, and RLS policies
-- Run this in Supabase SQL Editor or via Supabase CLI

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM (
    'patient',
    'doctor',
    'admin',
    'doctor_assistant',
    'admin_assistant'
);

-- Doctor verification status
CREATE TYPE verification_status AS ENUM (
    'pending',
    'under_review',
    'verified',
    'suspended',
    'rejected'
);

-- Appointment status
CREATE TYPE appointment_status AS ENUM (
    'scheduled',
    'in_waiting_room',
    'in_progress',
    'completed',
    'cancelled',
    'no_show'
);

-- Transaction status
CREATE TYPE transaction_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);

-- Support ticket status
CREATE TYPE ticket_status AS ENUM (
    'open',
    'in_progress',
    'waiting_response',
    'resolved',
    'closed'
);

-- Assistant assignment status
CREATE TYPE assignment_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'revoked'
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_number = 'TKT-' || to_char(now(), 'YYYYMMDD') || '-' ||
        lpad(nextval('ticket_number_seq')::text, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.invoice_number = 'INV-' || to_char(now(), 'YYYYMMDD') || '-' ||
        lpad(nextval('invoice_number_seq')::text, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequences for auto-generated numbers
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- ============================================================================
-- USER MANAGEMENT TABLES
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'patient',
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    preferred_language VARCHAR(5) DEFAULT 'ar',
    timezone VARCHAR(50) DEFAULT 'Africa/Cairo',
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Patient profiles
CREATE TABLE patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    blood_type VARCHAR(5) CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    national_id VARCHAR(20),
    national_id_verified BOOLEAN DEFAULT false,
    verification_level VARCHAR(20) DEFAULT 'email_only' CHECK (verification_level IN ('email_only', 'phone_verified', 'id_verified')),
    late_cancellation_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Doctor profiles
CREATE TABLE doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE,
    years_of_experience INTEGER DEFAULT 0,
    bio TEXT,
    consultation_fee DECIMAL(10,2),
    verification_status verification_status DEFAULT 'pending',
    verification_notes TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    is_available_now BOOLEAN DEFAULT false,
    rating_average DECIMAL(3,2) DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
    rating_count INTEGER DEFAULT 0,
    total_consultations INTEGER DEFAULT 0,
    max_assistants INTEGER DEFAULT 5,
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin profiles
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    trust_level VARCHAR(20) DEFAULT 'support_agent' CHECK (trust_level IN ('support_agent', 'moderator', 'full_admin', 'super_admin')),
    department VARCHAR(50) CHECK (department IN ('support', 'verification', 'billing', 'general')),
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assistant profiles
CREATE TABLE assistant_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assistant_type VARCHAR(20) NOT NULL CHECK (assistant_type IN ('doctor_assistant', 'admin_assistant')),
    department VARCHAR(50) CHECK (department IN ('support', 'verification', 'billing')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- DOCTOR CREDENTIAL TABLES
-- ============================================================================

-- Doctor credentials/documents
CREATE TABLE doctor_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    credential_type VARCHAR(50) NOT NULL CHECK (credential_type IN ('license', 'degree', 'certification', 'id_document')),
    document_url TEXT NOT NULL,
    document_name VARCHAR(255),
    issuing_authority VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    verification_status verification_status DEFAULT 'pending',
    verification_notes TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Specializations master list
CREATE TABLE specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('general', 'specialist', 'sub_specialist')),
    min_fee DECIMAL(10,2),
    max_fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Doctor specializations (many-to-many)
CREATE TABLE doctor_specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    specialization_id UUID NOT NULL REFERENCES specializations(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(doctor_profile_id, specialization_id)
);

-- ============================================================================
-- ASSISTANT ASSIGNMENT TABLES
-- ============================================================================

-- Doctor-Assistant assignments
CREATE TABLE doctor_assistant_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    assistant_profile_id UUID NOT NULL REFERENCES assistant_profiles(id) ON DELETE CASCADE,
    status assignment_status DEFAULT 'pending',
    permissions JSONB DEFAULT '{}',
    can_manage_availability BOOLEAN DEFAULT true,
    can_reschedule_appointments BOOLEAN DEFAULT true,
    can_view_patient_records BOOLEAN DEFAULT true,
    can_send_messages BOOLEAN DEFAULT true,
    can_observe_consultations BOOLEAN DEFAULT false,
    invited_at TIMESTAMPTZ DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(doctor_profile_id, assistant_profile_id)
);

-- Admin-Assistant assignments
CREATE TABLE admin_assistant_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_profile_id UUID REFERENCES admin_profiles(id) ON DELETE CASCADE,
    assistant_profile_id UUID NOT NULL REFERENCES assistant_profiles(id) ON DELETE CASCADE,
    status assignment_status DEFAULT 'pending',
    scope VARCHAR(50) CHECK (scope IN ('support', 'verification', 'billing', 'general')),
    is_pool_assignment BOOLEAN DEFAULT false,
    permissions JSONB DEFAULT '{}',
    can_triage_tickets BOOLEAN DEFAULT true,
    can_respond_tickets BOOLEAN DEFAULT true,
    can_prepare_verification BOOLEAN DEFAULT true,
    can_view_transactions BOOLEAN DEFAULT true,
    can_view_basic_analytics BOOLEAN DEFAULT true,
    invited_at TIMESTAMPTZ DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assistant action logs
CREATE TABLE assistant_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assistant_profile_id UUID NOT NULL REFERENCES assistant_profiles(id),
    principal_profile_id UUID NOT NULL REFERENCES profiles(id),
    action_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    action_details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- MEDICAL DATA TABLES
-- ============================================================================

-- Medical records
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('general', 'chronic_condition', 'surgical_history', 'family_history')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date_recorded DATE,
    recorded_by UUID REFERENCES profiles(id),
    is_self_reported BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]',
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allergies
CREATE TABLE allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    allergen VARCHAR(255) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe')),
    reaction TEXT,
    diagnosed_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conditions
CREATE TABLE conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    condition_name VARCHAR(255) NOT NULL,
    icd_code VARCHAR(20),
    diagnosed_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'managed', 'resolved')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lab results
CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL,
    lab_name VARCHAR(255),
    document_url TEXT,
    results_summary TEXT,
    uploaded_by UUID REFERENCES profiles(id),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Family access grants
CREATE TABLE family_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    granted_to_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    access_level VARCHAR(20) NOT NULL CHECK (access_level IN ('view_only', 'full', 'emergency')),
    relationship VARCHAR(50) CHECK (relationship IN ('parent', 'child', 'spouse', 'sibling', 'other')),
    granted_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(patient_profile_id, granted_to_profile_id)
);

-- ============================================================================
-- SCHEDULING TABLES
-- ============================================================================

-- Doctor availability (weekly schedule)
CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Doctor blocked times
CREATE TABLE doctor_blocked_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    reason VARCHAR(255),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_blocked_range CHECK (start_datetime < end_datetime)
);

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id),
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id),
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status appointment_status DEFAULT 'scheduled',
    appointment_type VARCHAR(20) DEFAULT 'scheduled' CHECK (appointment_type IN ('scheduled', 'on_demand')),
    is_urgent BOOLEAN DEFAULT false,
    chief_complaint TEXT,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES profiles(id),
    cancelled_at TIMESTAMPTZ,
    refund_amount DECIMAL(10,2),
    refund_status VARCHAR(20) CHECK (refund_status IN ('pending', 'processed', 'denied')),
    booked_by UUID REFERENCES profiles(id),
    consultation_fee DECIMAL(10,2) NOT NULL,
    patient_joined_waiting_room_at TIMESTAMPTZ,
    assistant_observer_id UUID REFERENCES assistant_profiles(id),
    patient_consented_to_observer BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consultation sessions (video calls)
CREATE TABLE consultation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    jitsi_room_id VARCHAR(255),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    patient_joined_at TIMESTAMPTZ,
    doctor_joined_at TIMESTAMPTZ,
    assistant_joined_at TIMESTAMPTZ,
    recording_consent BOOLEAN DEFAULT false,
    recording_url TEXT,
    connection_quality VARCHAR(20) CHECK (connection_quality IN ('good', 'fair', 'poor')),
    technical_issues JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prescriptions
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id),
    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id),
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id),
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    quantity INTEGER,
    refills_allowed INTEGER DEFAULT 0,
    refills_used INTEGER DEFAULT 0,
    is_controlled_substance BOOLEAN DEFAULT false,
    prescribed_at TIMESTAMPTZ DEFAULT now(),
    valid_until DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions (moved here because prescription_renewal_requests references it)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id),
    appointment_id UUID REFERENCES appointments(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EGP',
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('consultation', 'renewal', 'refund')),
    status transaction_status DEFAULT 'pending',
    paymob_order_id VARCHAR(100),
    paymob_transaction_id VARCHAR(100),
    payment_method VARCHAR(50),
    payment_details JSONB,
    refund_reason TEXT,
    refunded_amount DECIMAL(10,2),
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prescription renewal requests
CREATE TABLE prescription_renewal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_prescription_id UUID NOT NULL REFERENCES prescriptions(id),
    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id),
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id),
    request_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'requires_consultation')),
    doctor_response TEXT,
    responded_at TIMESTAMPTZ,
    new_prescription_id UUID REFERENCES prescriptions(id),
    fee_amount DECIMAL(10,2),
    transaction_id UUID REFERENCES transactions(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consultation notes
CREATE TABLE consultation_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id),
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    private_notes TEXT,
    follow_up_recommended BOOLEAN DEFAULT false,
    follow_up_timeframe VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PAYMENT TABLES
-- ============================================================================

-- Note: transactions table was moved earlier (before prescription_renewal_requests)

-- Doctor earnings
CREATE TABLE doctor_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id),
    appointment_id UUID REFERENCES appointments(id),
    transaction_id UUID REFERENCES transactions(id),
    gross_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'paid_out')),
    available_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Doctor payouts
CREATE TABLE doctor_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    bank_account_details JSONB,
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES profiles(id),
    reference_number VARCHAR(100),
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id),
    doctor_name VARCHAR(255),
    service_description TEXT,
    subtotal DECIMAL(10,2),
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2),
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- COMMUNICATION TABLES
-- ============================================================================

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender_profile_id UUID NOT NULL REFERENCES profiles(id),
    recipient_profile_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
    attachment_url TEXT,
    attachment_type VARCHAR(20) CHECK (attachment_type IN ('image', 'document', 'audio', 'video')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    sent_on_behalf_of UUID REFERENCES profiles(id),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    notification_type VARCHAR(50) NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_pushed BOOLEAN DEFAULT false,
    pushed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Support tickets
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    submitted_by UUID NOT NULL REFERENCES profiles(id),
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'billing', 'doctor_complaint', 'other')),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status ticket_status DEFAULT 'open',
    assigned_to UUID REFERENCES profiles(id),
    related_appointment_id UUID REFERENCES appointments(id),
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Support ticket messages
CREATE TABLE support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_profile_id UUID NOT NULL REFERENCES profiles(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- REVIEW TABLES
-- ============================================================================

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id),
    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id),
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    hidden_reason TEXT,
    doctor_response TEXT,
    doctor_responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PLATFORM ADMINISTRATION TABLES
-- ============================================================================

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_profile_id UUID REFERENCES profiles(id),
    actor_role VARCHAR(20),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    body_en TEXT,
    body_ar TEXT,
    target_roles user_role[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Patient profiles
CREATE INDEX idx_patient_profiles_profile_id ON patient_profiles(profile_id);

-- Doctor profiles
CREATE INDEX idx_doctor_profiles_profile_id ON doctor_profiles(profile_id);
CREATE INDEX idx_doctor_profiles_verification_status ON doctor_profiles(verification_status);
CREATE INDEX idx_doctor_profiles_is_available ON doctor_profiles(is_available_now) WHERE is_available_now = true;

-- Doctor credentials
CREATE INDEX idx_doctor_credentials_doctor_id ON doctor_credentials(doctor_profile_id);

-- Doctor specializations
CREATE INDEX idx_doctor_specializations_doctor_id ON doctor_specializations(doctor_profile_id);
CREATE INDEX idx_doctor_specializations_spec_id ON doctor_specializations(specialization_id);

-- Assistant assignments
CREATE INDEX idx_doctor_assistant_assignments_doctor ON doctor_assistant_assignments(doctor_profile_id);
CREATE INDEX idx_doctor_assistant_assignments_assistant ON doctor_assistant_assignments(assistant_profile_id);
CREATE INDEX idx_admin_assistant_assignments_admin ON admin_assistant_assignments(admin_profile_id);
CREATE INDEX idx_admin_assistant_assignments_assistant ON admin_assistant_assignments(assistant_profile_id);

-- Assistant action logs
CREATE INDEX idx_assistant_action_logs_assistant ON assistant_action_logs(assistant_profile_id);
CREATE INDEX idx_assistant_action_logs_principal ON assistant_action_logs(principal_profile_id);
CREATE INDEX idx_assistant_action_logs_created ON assistant_action_logs(created_at DESC);

-- Medical data
CREATE INDEX idx_medical_records_patient ON medical_records(patient_profile_id);
CREATE INDEX idx_allergies_patient ON allergies(patient_profile_id);
CREATE INDEX idx_conditions_patient ON conditions(patient_profile_id);
CREATE INDEX idx_lab_results_patient ON lab_results(patient_profile_id);

-- Family access
CREATE INDEX idx_family_access_patient ON family_access_grants(patient_profile_id);
CREATE INDEX idx_family_access_granted_to ON family_access_grants(granted_to_profile_id);

-- Availability
CREATE INDEX idx_doctor_availability_doctor ON doctor_availability(doctor_profile_id);
CREATE INDEX idx_doctor_blocked_times_doctor ON doctor_blocked_times(doctor_profile_id);

-- Appointments
CREATE INDEX idx_appointments_patient ON appointments(patient_profile_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_profile_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_start);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_doctor_schedule ON appointments(doctor_profile_id, scheduled_start);
CREATE INDEX idx_appointments_patient_schedule ON appointments(patient_profile_id, scheduled_start);

-- Consultation sessions
CREATE INDEX idx_consultation_sessions_appointment ON consultation_sessions(appointment_id);

-- Prescriptions
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_profile_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_profile_id);
CREATE INDEX idx_prescriptions_appointment ON prescriptions(appointment_id);

-- Prescription renewals
CREATE INDEX idx_prescription_renewals_patient ON prescription_renewal_requests(patient_profile_id);
CREATE INDEX idx_prescription_renewals_doctor ON prescription_renewal_requests(doctor_profile_id);

-- Transactions
CREATE INDEX idx_transactions_patient ON transactions(patient_profile_id);
CREATE INDEX idx_transactions_appointment ON transactions(appointment_id);
CREATE INDEX idx_transactions_paymob_order ON transactions(paymob_order_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Doctor earnings
CREATE INDEX idx_doctor_earnings_doctor ON doctor_earnings(doctor_profile_id);
CREATE INDEX idx_doctor_earnings_status ON doctor_earnings(status);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_recipient_unread ON messages(recipient_profile_id, is_read) WHERE is_read = false;

-- Notifications
CREATE INDEX idx_notifications_profile ON notifications(profile_id);
CREATE INDEX idx_notifications_unread ON notifications(profile_id, is_read, created_at DESC) WHERE is_read = false;

-- Support tickets
CREATE INDEX idx_support_tickets_submitted_by ON support_tickets(submitted_by);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- Reviews
CREATE INDEX idx_reviews_doctor ON reviews(doctor_profile_id, created_at DESC);
CREATE INDEX idx_reviews_patient ON reviews(patient_profile_id);

-- Audit logs
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_profile_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON patient_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assistant_profiles_updated_at BEFORE UPDATE ON assistant_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_credentials_updated_at BEFORE UPDATE ON doctor_credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_assistant_assignments_updated_at BEFORE UPDATE ON doctor_assistant_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_assistant_assignments_updated_at BEFORE UPDATE ON admin_assistant_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_allergies_updated_at BEFORE UPDATE ON allergies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conditions_updated_at BEFORE UPDATE ON conditions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_results_updated_at BEFORE UPDATE ON lab_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_access_grants_updated_at BEFORE UPDATE ON family_access_grants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_availability_updated_at BEFORE UPDATE ON doctor_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescription_renewal_requests_updated_at BEFORE UPDATE ON prescription_renewal_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultation_notes_updated_at BEFORE UPDATE ON consultation_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_payouts_updated_at BEFORE UPDATE ON doctor_payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate ticket numbers
CREATE TRIGGER generate_ticket_number_trigger BEFORE INSERT ON support_tickets FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Auto-generate invoice numbers
CREATE TRIGGER generate_invoice_number_trigger BEFORE INSERT ON invoices FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- ============================================================================
-- DOCTOR RATING CALCULATION TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_doctor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE doctor_profiles
    SET
        rating_average = (
            SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
            FROM reviews
            WHERE doctor_profile_id = NEW.doctor_profile_id
            AND is_visible = true
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE doctor_profile_id = NEW.doctor_profile_id
            AND is_visible = true
        )
    WHERE id = NEW.doctor_profile_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_doctor_rating_on_review
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_doctor_rating();

-- ============================================================================
-- DOCTOR CONSULTATION COUNT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_doctor_consultation_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE doctor_profiles
        SET total_consultations = total_consultations + 1
        WHERE id = NEW.doctor_profile_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consultation_count
    AFTER UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_doctor_consultation_count();

-- ============================================================================
-- AUTO-CREATE PROFILE ON AUTH USER CREATION
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'fullName', NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::public.user_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- AUTO-CREATE ROLE-SPECIFIC PROFILE
-- ============================================================================

CREATE OR REPLACE FUNCTION create_role_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'patient' THEN
        INSERT INTO public.patient_profiles (profile_id) VALUES (NEW.id);
    ELSIF NEW.role = 'doctor' THEN
        INSERT INTO public.doctor_profiles (profile_id) VALUES (NEW.id);
    ELSIF NEW.role = 'admin' THEN
        INSERT INTO public.admin_profiles (profile_id) VALUES (NEW.id);
    ELSIF NEW.role IN ('doctor_assistant', 'admin_assistant') THEN
        INSERT INTO public.assistant_profiles (profile_id, assistant_type) VALUES (NEW.id, NEW.role);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_created
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION create_role_profile();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_assistant_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_assistant_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_renewal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Helper function to get current user's profile
CREATE OR REPLACE FUNCTION get_current_profile_id()
RETURNS UUID AS $$
    SELECT id FROM profiles WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (user_id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
    ON profiles FOR SELECT
    USING (is_admin());

-- Public can read basic doctor profiles (for listings)
CREATE POLICY "Public can read verified doctors"
    ON profiles FOR SELECT
    USING (
        role = 'doctor'
        AND EXISTS (
            SELECT 1 FROM doctor_profiles dp
            WHERE dp.profile_id = profiles.id
            AND dp.verification_status = 'verified'
        )
    );

-- ============================================================================
-- PATIENT PROFILES POLICIES
-- ============================================================================

-- Patients can read their own patient profile
CREATE POLICY "Patients can read own patient profile"
    ON patient_profiles FOR SELECT
    USING (profile_id = get_current_profile_id());

-- Patients can update their own patient profile
CREATE POLICY "Patients can update own patient profile"
    ON patient_profiles FOR UPDATE
    USING (profile_id = get_current_profile_id());

-- Doctors can read patient profiles during consultations
CREATE POLICY "Doctors can read patient profiles during consultations"
    ON patient_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN doctor_profiles dp ON dp.id = a.doctor_profile_id
            WHERE a.patient_profile_id = patient_profiles.id
            AND dp.profile_id = get_current_profile_id()
            AND a.status IN ('scheduled', 'in_waiting_room', 'in_progress', 'completed')
        )
    );

-- Admins can read all patient profiles
CREATE POLICY "Admins can read all patient profiles"
    ON patient_profiles FOR SELECT
    USING (is_admin());

-- ============================================================================
-- DOCTOR PROFILES POLICIES
-- ============================================================================

-- Anyone can read verified doctor profiles
CREATE POLICY "Public can read verified doctor profiles"
    ON doctor_profiles FOR SELECT
    USING (verification_status = 'verified');

-- Doctors can read their own profile
CREATE POLICY "Doctors can read own doctor profile"
    ON doctor_profiles FOR SELECT
    USING (profile_id = get_current_profile_id());

-- Doctors can update their own profile
CREATE POLICY "Doctors can update own doctor profile"
    ON doctor_profiles FOR UPDATE
    USING (profile_id = get_current_profile_id());

-- Admins can read all doctor profiles
CREATE POLICY "Admins can read all doctor profiles"
    ON doctor_profiles FOR SELECT
    USING (is_admin());

-- Admins can update doctor profiles (for verification)
CREATE POLICY "Admins can update doctor profiles"
    ON doctor_profiles FOR UPDATE
    USING (is_admin());

-- ============================================================================
-- APPOINTMENTS POLICIES
-- ============================================================================

-- Patients can read their own appointments
CREATE POLICY "Patients can read own appointments"
    ON appointments FOR SELECT
    USING (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Patients can create appointments
CREATE POLICY "Patients can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Patients can update their own appointments (for cancellation)
CREATE POLICY "Patients can update own appointments"
    ON appointments FOR UPDATE
    USING (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can read their assigned appointments
CREATE POLICY "Doctors can read assigned appointments"
    ON appointments FOR SELECT
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can update their assigned appointments
CREATE POLICY "Doctors can update assigned appointments"
    ON appointments FOR UPDATE
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Admins can read all appointments
CREATE POLICY "Admins can read all appointments"
    ON appointments FOR SELECT
    USING (is_admin());

-- ============================================================================
-- MEDICAL RECORDS POLICIES
-- ============================================================================

-- Patients can read their own medical records
CREATE POLICY "Patients can read own medical records"
    ON medical_records FOR SELECT
    USING (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Patients can create their own medical records
CREATE POLICY "Patients can create own medical records"
    ON medical_records FOR INSERT
    WITH CHECK (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Patients can update their own medical records
CREATE POLICY "Patients can update own medical records"
    ON medical_records FOR UPDATE
    USING (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can read patient medical records during consultations
CREATE POLICY "Doctors can read patient medical records during consultations"
    ON medical_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN doctor_profiles dp ON dp.id = a.doctor_profile_id
            WHERE a.patient_profile_id = medical_records.patient_profile_id
            AND dp.profile_id = get_current_profile_id()
            AND a.status IN ('scheduled', 'in_waiting_room', 'in_progress', 'completed')
        )
    );

-- ============================================================================
-- PRESCRIPTIONS POLICIES
-- ============================================================================

-- Patients can read their own prescriptions
CREATE POLICY "Patients can read own prescriptions"
    ON prescriptions FOR SELECT
    USING (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can read their own prescriptions
CREATE POLICY "Doctors can read own prescriptions"
    ON prescriptions FOR SELECT
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can create prescriptions
CREATE POLICY "Doctors can create prescriptions"
    ON prescriptions FOR INSERT
    WITH CHECK (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can update their own prescriptions
CREATE POLICY "Doctors can update own prescriptions"
    ON prescriptions FOR UPDATE
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- ============================================================================
-- TRANSACTIONS POLICIES
-- ============================================================================

-- Patients can read their own transactions
CREATE POLICY "Patients can read own transactions"
    ON transactions FOR SELECT
    USING (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Admins can read all transactions
CREATE POLICY "Admins can read all transactions"
    ON transactions FOR SELECT
    USING (is_admin());

-- ============================================================================
-- REVIEWS POLICIES
-- ============================================================================

-- Anyone can read visible reviews
CREATE POLICY "Public can read visible reviews"
    ON reviews FOR SELECT
    USING (is_visible = true);

-- Patients can create reviews for their completed appointments
CREATE POLICY "Patients can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
        AND EXISTS (
            SELECT 1 FROM appointments
            WHERE id = appointment_id
            AND status = 'completed'
        )
    );

-- Patients can update their own reviews
CREATE POLICY "Patients can update own reviews"
    ON reviews FOR UPDATE
    USING (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can respond to reviews about them
CREATE POLICY "Doctors can respond to reviews"
    ON reviews FOR UPDATE
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
    ON notifications FOR SELECT
    USING (profile_id = get_current_profile_id());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (profile_id = get_current_profile_id());

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Users can read messages they sent or received
CREATE POLICY "Users can read own messages"
    ON messages FOR SELECT
    USING (
        sender_profile_id = get_current_profile_id()
        OR recipient_profile_id = get_current_profile_id()
    );

-- Users can create messages
CREATE POLICY "Users can create messages"
    ON messages FOR INSERT
    WITH CHECK (sender_profile_id = get_current_profile_id());

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages"
    ON messages FOR UPDATE
    USING (recipient_profile_id = get_current_profile_id());

-- ============================================================================
-- SUPPORT TICKETS POLICIES
-- ============================================================================

-- Users can read their own support tickets
CREATE POLICY "Users can read own support tickets"
    ON support_tickets FOR SELECT
    USING (submitted_by = get_current_profile_id());

-- Users can create support tickets
CREATE POLICY "Users can create support tickets"
    ON support_tickets FOR INSERT
    WITH CHECK (submitted_by = get_current_profile_id());

-- Admins can read all support tickets
CREATE POLICY "Admins can read all support tickets"
    ON support_tickets FOR SELECT
    USING (is_admin());

-- Admins can update support tickets
CREATE POLICY "Admins can update support tickets"
    ON support_tickets FOR UPDATE
    USING (is_admin());

-- ============================================================================
-- SPECIALIZATIONS POLICIES (PUBLIC READ)
-- ============================================================================

CREATE POLICY "Public can read specializations"
    ON specializations FOR SELECT
    USING (is_active = true);

-- ============================================================================
-- DOCTOR AVAILABILITY POLICIES
-- ============================================================================

-- Anyone can read doctor availability
CREATE POLICY "Public can read doctor availability"
    ON doctor_availability FOR SELECT
    USING (is_active = true);

-- Doctors can manage their own availability
CREATE POLICY "Doctors can manage own availability"
    ON doctor_availability FOR ALL
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- ============================================================================
-- ANNOUNCEMENTS POLICIES
-- ============================================================================

-- Users can read active announcements targeted at their role
CREATE POLICY "Users can read targeted announcements"
    ON announcements FOR SELECT
    USING (
        is_active = true
        AND (starts_at IS NULL OR starts_at <= now())
        AND (ends_at IS NULL OR ends_at >= now())
        AND (
            target_roles = '{}'
            OR get_current_user_role() = ANY(target_roles)
        )
    );

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements"
    ON announcements FOR ALL
    USING (is_admin());

-- ============================================================================
-- ADDITIONAL RLS POLICIES (MISSING FROM INITIAL)
-- ============================================================================

-- Helper function to check if user is a doctor assistant for a specific doctor
CREATE OR REPLACE FUNCTION is_doctor_assistant_for(doctor_prof_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM doctor_assistant_assignments daa
        JOIN assistant_profiles ap ON ap.id = daa.assistant_profile_id
        WHERE daa.doctor_profile_id = doctor_prof_id
        AND ap.profile_id = get_current_profile_id()
        AND daa.status = 'active'
    )
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user has family access to a patient
CREATE OR REPLACE FUNCTION has_family_access_to(patient_prof_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM family_access_grants fag
        JOIN patient_profiles pp ON pp.id = fag.granted_to_profile_id
        WHERE fag.patient_profile_id = patient_prof_id
        AND pp.profile_id = get_current_profile_id()
        AND fag.revoked_at IS NULL
        AND (fag.expires_at IS NULL OR fag.expires_at > now())
    )
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- DOCTOR CREDENTIALS POLICIES
-- ============================================================================

-- Doctors can read their own credentials
CREATE POLICY "Doctors can read own credentials"
    ON doctor_credentials FOR SELECT
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can create their own credentials
CREATE POLICY "Doctors can create own credentials"
    ON doctor_credentials FOR INSERT
    WITH CHECK (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can update their own credentials
CREATE POLICY "Doctors can update own credentials"
    ON doctor_credentials FOR UPDATE
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Admins can read all credentials
CREATE POLICY "Admins can read all credentials"
    ON doctor_credentials FOR SELECT
    USING (is_admin());

-- Admins can update credentials (for verification)
CREATE POLICY "Admins can update credentials"
    ON doctor_credentials FOR UPDATE
    USING (is_admin());

-- ============================================================================
-- DOCTOR SPECIALIZATIONS POLICIES
-- ============================================================================

-- Public can read doctor specializations
CREATE POLICY "Public can read doctor specializations"
    ON doctor_specializations FOR SELECT
    USING (true);

-- Doctors can manage their own specializations
CREATE POLICY "Doctors can manage own specializations"
    ON doctor_specializations FOR ALL
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- ============================================================================
-- DOCTOR BLOCKED TIMES POLICIES
-- ============================================================================

-- Public can read blocked times (for booking)
CREATE POLICY "Public can read blocked times"
    ON doctor_blocked_times FOR SELECT
    USING (true);

-- Doctors can manage their own blocked times
CREATE POLICY "Doctors can manage own blocked times"
    ON doctor_blocked_times FOR ALL
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctor assistants can manage blocked times
CREATE POLICY "Assistants can manage doctor blocked times"
    ON doctor_blocked_times FOR ALL
    USING (is_doctor_assistant_for(doctor_profile_id));

-- ============================================================================
-- CONSULTATION SESSIONS POLICIES
-- ============================================================================

-- Patients can read their consultation sessions
CREATE POLICY "Patients can read own consultation sessions"
    ON consultation_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.id = consultation_sessions.appointment_id
            AND a.patient_profile_id IN (
                SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
            )
        )
    );

-- Doctors can read their consultation sessions
CREATE POLICY "Doctors can read own consultation sessions"
    ON consultation_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.id = consultation_sessions.appointment_id
            AND a.doctor_profile_id IN (
                SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
            )
        )
    );

-- Doctors can create/update consultation sessions
CREATE POLICY "Doctors can manage consultation sessions"
    ON consultation_sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.id = consultation_sessions.appointment_id
            AND a.doctor_profile_id IN (
                SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
            )
        )
    );

-- ============================================================================
-- CONSULTATION NOTES POLICIES
-- ============================================================================

-- Doctors can manage their own consultation notes
CREATE POLICY "Doctors can manage own consultation notes"
    ON consultation_notes FOR ALL
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Patients can read consultation notes (excluding private_notes)
CREATE POLICY "Patients can read consultation notes"
    ON consultation_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.id = consultation_notes.appointment_id
            AND a.patient_profile_id IN (
                SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
            )
        )
    );

-- ============================================================================
-- PRESCRIPTION RENEWAL REQUESTS POLICIES
-- ============================================================================

-- Patients can read their own renewal requests
CREATE POLICY "Patients can read own renewal requests"
    ON prescription_renewal_requests FOR SELECT
    USING (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Patients can create renewal requests
CREATE POLICY "Patients can create renewal requests"
    ON prescription_renewal_requests FOR INSERT
    WITH CHECK (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can read renewal requests assigned to them
CREATE POLICY "Doctors can read assigned renewal requests"
    ON prescription_renewal_requests FOR SELECT
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can update renewal requests (respond)
CREATE POLICY "Doctors can update renewal requests"
    ON prescription_renewal_requests FOR UPDATE
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- ============================================================================
-- DOCTOR EARNINGS POLICIES
-- ============================================================================

-- Doctors can read their own earnings
CREATE POLICY "Doctors can read own earnings"
    ON doctor_earnings FOR SELECT
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Admins can read all earnings
CREATE POLICY "Admins can read all earnings"
    ON doctor_earnings FOR SELECT
    USING (is_admin());

-- ============================================================================
-- DOCTOR PAYOUTS POLICIES
-- ============================================================================

-- Doctors can read their own payouts
CREATE POLICY "Doctors can read own payouts"
    ON doctor_payouts FOR SELECT
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can request payouts
CREATE POLICY "Doctors can create payout requests"
    ON doctor_payouts FOR INSERT
    WITH CHECK (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Admins can manage all payouts
CREATE POLICY "Admins can manage payouts"
    ON doctor_payouts FOR ALL
    USING (is_admin());

-- ============================================================================
-- INVOICES POLICIES
-- ============================================================================

-- Patients can read their own invoices
CREATE POLICY "Patients can read own invoices"
    ON invoices FOR SELECT
    USING (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Admins can read all invoices
CREATE POLICY "Admins can read all invoices"
    ON invoices FOR SELECT
    USING (is_admin());

-- ============================================================================
-- ADMIN PROFILES POLICIES
-- ============================================================================

-- Admins can read their own admin profile
CREATE POLICY "Admins can read own admin profile"
    ON admin_profiles FOR SELECT
    USING (profile_id = get_current_profile_id());

-- Admins can update their own admin profile
CREATE POLICY "Admins can update own admin profile"
    ON admin_profiles FOR UPDATE
    USING (profile_id = get_current_profile_id());

-- Super admins can read all admin profiles
CREATE POLICY "Super admins can read all admin profiles"
    ON admin_profiles FOR SELECT
    USING (is_admin());

-- ============================================================================
-- ASSISTANT PROFILES POLICIES
-- ============================================================================

-- Assistants can read their own profile
CREATE POLICY "Assistants can read own assistant profile"
    ON assistant_profiles FOR SELECT
    USING (profile_id = get_current_profile_id());

-- Assistants can update their own profile
CREATE POLICY "Assistants can update own assistant profile"
    ON assistant_profiles FOR UPDATE
    USING (profile_id = get_current_profile_id());

-- Doctors can read their assistants' profiles
CREATE POLICY "Doctors can read assigned assistant profiles"
    ON assistant_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM doctor_assistant_assignments daa
            JOIN doctor_profiles dp ON dp.id = daa.doctor_profile_id
            WHERE daa.assistant_profile_id = assistant_profiles.id
            AND dp.profile_id = get_current_profile_id()
        )
    );

-- Admins can read all assistant profiles
CREATE POLICY "Admins can read all assistant profiles"
    ON assistant_profiles FOR SELECT
    USING (is_admin());

-- ============================================================================
-- DOCTOR ASSISTANT ASSIGNMENTS POLICIES
-- ============================================================================

-- Doctors can read their own assistant assignments
CREATE POLICY "Doctors can read own assistant assignments"
    ON doctor_assistant_assignments FOR SELECT
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can manage their own assistant assignments
CREATE POLICY "Doctors can manage own assistant assignments"
    ON doctor_assistant_assignments FOR ALL
    USING (
        doctor_profile_id IN (
            SELECT id FROM doctor_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Assistants can read their own assignments
CREATE POLICY "Assistants can read own doctor assignments"
    ON doctor_assistant_assignments FOR SELECT
    USING (
        assistant_profile_id IN (
            SELECT id FROM assistant_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Assistants can update their own assignments (accept invitation)
CREATE POLICY "Assistants can accept doctor assignments"
    ON doctor_assistant_assignments FOR UPDATE
    USING (
        assistant_profile_id IN (
            SELECT id FROM assistant_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- ============================================================================
-- ADMIN ASSISTANT ASSIGNMENTS POLICIES
-- ============================================================================

-- Admins can manage admin assistant assignments
CREATE POLICY "Admins can manage admin assistant assignments"
    ON admin_assistant_assignments FOR ALL
    USING (is_admin());

-- Assistants can read their own admin assignments
CREATE POLICY "Assistants can read own admin assignments"
    ON admin_assistant_assignments FOR SELECT
    USING (
        assistant_profile_id IN (
            SELECT id FROM assistant_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Assistants can update their own assignments (accept invitation)
CREATE POLICY "Assistants can accept admin assignments"
    ON admin_assistant_assignments FOR UPDATE
    USING (
        assistant_profile_id IN (
            SELECT id FROM assistant_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- ============================================================================
-- ASSISTANT ACTION LOGS POLICIES
-- ============================================================================

-- Assistants can read their own action logs
CREATE POLICY "Assistants can read own action logs"
    ON assistant_action_logs FOR SELECT
    USING (
        assistant_profile_id IN (
            SELECT id FROM assistant_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Principals can read their assistants' action logs
CREATE POLICY "Principals can read assistant action logs"
    ON assistant_action_logs FOR SELECT
    USING (principal_profile_id = get_current_profile_id());

-- Admins can read all action logs
CREATE POLICY "Admins can read all action logs"
    ON assistant_action_logs FOR SELECT
    USING (is_admin());

-- ============================================================================
-- ALLERGIES POLICIES
-- ============================================================================

-- Patients can manage their own allergies
CREATE POLICY "Patients can manage own allergies"
    ON allergies FOR ALL
    USING (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can read patient allergies during consultations
CREATE POLICY "Doctors can read allergies during consultations"
    ON allergies FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN doctor_profiles dp ON dp.id = a.doctor_profile_id
            WHERE a.patient_profile_id = allergies.patient_profile_id
            AND dp.profile_id = get_current_profile_id()
            AND a.status IN ('scheduled', 'in_waiting_room', 'in_progress', 'completed')
        )
    );

-- Family members can read allergies
CREATE POLICY "Family can read allergies"
    ON allergies FOR SELECT
    USING (has_family_access_to(patient_profile_id));

-- ============================================================================
-- CONDITIONS POLICIES
-- ============================================================================

-- Patients can manage their own conditions
CREATE POLICY "Patients can manage own conditions"
    ON conditions FOR ALL
    USING (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can read patient conditions during consultations
CREATE POLICY "Doctors can read conditions during consultations"
    ON conditions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN doctor_profiles dp ON dp.id = a.doctor_profile_id
            WHERE a.patient_profile_id = conditions.patient_profile_id
            AND dp.profile_id = get_current_profile_id()
            AND a.status IN ('scheduled', 'in_waiting_room', 'in_progress', 'completed')
        )
    );

-- Family members can read conditions
CREATE POLICY "Family can read conditions"
    ON conditions FOR SELECT
    USING (has_family_access_to(patient_profile_id));

-- ============================================================================
-- LAB RESULTS POLICIES
-- ============================================================================

-- Patients can manage their own lab results
CREATE POLICY "Patients can manage own lab results"
    ON lab_results FOR ALL
    USING (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Doctors can read patient lab results during consultations
CREATE POLICY "Doctors can read lab results during consultations"
    ON lab_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN doctor_profiles dp ON dp.id = a.doctor_profile_id
            WHERE a.patient_profile_id = lab_results.patient_profile_id
            AND dp.profile_id = get_current_profile_id()
            AND a.status IN ('scheduled', 'in_waiting_room', 'in_progress', 'completed')
        )
    );

-- Family members can read lab results
CREATE POLICY "Family can read lab results"
    ON lab_results FOR SELECT
    USING (has_family_access_to(patient_profile_id));

-- ============================================================================
-- FAMILY ACCESS GRANTS POLICIES
-- ============================================================================

-- Patients can manage their own family access grants
CREATE POLICY "Patients can manage own family access grants"
    ON family_access_grants FOR ALL
    USING (
        patient_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- Users can read grants where they are the grantee
CREATE POLICY "Users can read grants to them"
    ON family_access_grants FOR SELECT
    USING (
        granted_to_profile_id IN (
            SELECT id FROM patient_profiles WHERE profile_id = get_current_profile_id()
        )
    );

-- ============================================================================
-- SUPPORT TICKET MESSAGES POLICIES
-- ============================================================================

-- Users can read messages on their tickets
CREATE POLICY "Users can read own ticket messages"
    ON support_ticket_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets st
            WHERE st.id = support_ticket_messages.ticket_id
            AND st.submitted_by = get_current_profile_id()
        )
    );

-- Users can create messages on their tickets
CREATE POLICY "Users can create ticket messages"
    ON support_ticket_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets st
            WHERE st.id = ticket_id
            AND st.submitted_by = get_current_profile_id()
        )
    );

-- Admins can manage all ticket messages
CREATE POLICY "Admins can manage ticket messages"
    ON support_ticket_messages FOR ALL
    USING (is_admin());

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Admins can read all audit logs
CREATE POLICY "Admins can read audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin());

-- ============================================================================
-- SYSTEM SETTINGS POLICIES
-- ============================================================================

-- Admins can manage system settings
CREATE POLICY "Admins can manage system settings"
    ON system_settings FOR ALL
    USING (is_admin());

-- ============================================================================
-- DOCTOR ASSISTANT DELEGATION POLICIES
-- ============================================================================

-- Doctor assistants can manage doctor availability
CREATE POLICY "Assistants can manage doctor availability"
    ON doctor_availability FOR ALL
    USING (is_doctor_assistant_for(doctor_profile_id));

-- Doctor assistants can read doctor appointments
CREATE POLICY "Assistants can read doctor appointments"
    ON appointments FOR SELECT
    USING (is_doctor_assistant_for(doctor_profile_id));

-- Doctor assistants can update doctor appointments (reschedule)
CREATE POLICY "Assistants can update doctor appointments"
    ON appointments FOR UPDATE
    USING (is_doctor_assistant_for(doctor_profile_id));

-- Doctor assistants can read patient profiles during consultations
CREATE POLICY "Assistants can read patient profiles during consultations"
    ON patient_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.patient_profile_id = patient_profiles.id
            AND is_doctor_assistant_for(a.doctor_profile_id)
            AND a.status IN ('scheduled', 'in_waiting_room', 'in_progress', 'completed')
        )
    );

-- Doctor assistants can read patient medical records during consultations
CREATE POLICY "Assistants can read medical records during consultations"
    ON medical_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.patient_profile_id = medical_records.patient_profile_id
            AND is_doctor_assistant_for(a.doctor_profile_id)
            AND a.status IN ('scheduled', 'in_waiting_room', 'in_progress', 'completed')
        )
    );

-- Doctor assistants can send messages on behalf of doctor
CREATE POLICY "Assistants can send messages for doctor"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM doctor_assistant_assignments daa
            JOIN assistant_profiles ap ON ap.id = daa.assistant_profile_id
            JOIN doctor_profiles dp ON dp.id = daa.doctor_profile_id
            WHERE ap.profile_id = get_current_profile_id()
            AND dp.profile_id = sent_on_behalf_of
            AND daa.status = 'active'
            AND daa.can_send_messages = true
        )
    );

-- ============================================================================
-- FAMILY ACCESS TO MEDICAL RECORDS POLICY
-- ============================================================================

-- Family members can read medical records they have access to
CREATE POLICY "Family can read medical records"
    ON medical_records FOR SELECT
    USING (has_family_access_to(patient_profile_id));

-- Family members with full access can book appointments
CREATE POLICY "Family with full access can book appointments"
    ON appointments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM family_access_grants fag
            JOIN patient_profiles pp ON pp.id = fag.granted_to_profile_id
            WHERE fag.patient_profile_id = patient_profile_id
            AND pp.profile_id = get_current_profile_id()
            AND fag.access_level = 'full'
            AND fag.revoked_at IS NULL
            AND (fag.expires_at IS NULL OR fag.expires_at > now())
        )
    );

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
