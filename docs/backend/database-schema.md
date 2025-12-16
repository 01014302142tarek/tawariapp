# Database Schema

**Database:** PostgreSQL 15 (via Supabase)  
**Last Updated:** December 11, 2025

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Enum Types](#enum-types)
3. [Tables](#tables)
4. [Indexes](#indexes)
5. [Row-Level Security](#row-level-security)
6. [Functions & Triggers](#functions--triggers)

---

## Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Database Schema                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌──────────┐    ┌──────────────┐               │
│  │  users  │───>│  doctors │───>│ availability │               │
│  └────┬────┘    └────┬─────┘    └──────────────┘               │
│       │              │                                          │
│       v              v                                          │
│  ┌──────────┐   ┌───────────────┐   ┌───────────────┐          │
│  │ patients │──>│ consultations │──>│ prescriptions │          │
│  └──────────┘   └───────┬───────┘   └───────────────┘          │
│                         │                                        │
│                         v                                        │
│                   ┌──────────┐                                  │
│                   │ payments │                                  │
│                   └──────────┘                                  │
│                                                                  │
│  ┌──────────────────┐   ┌─────────────────┐                    │
│  │ doctor_documents │   │ admin_actions   │                    │
│  └──────────────────┘   └─────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Enum Types

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');

-- Doctor verification status
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Consultation status lifecycle
CREATE TYPE consultation_status AS ENUM (
  'scheduled',      -- Booked and paid
  'waiting',        -- Patient in waiting room
  'in_progress',    -- Call active
  'completed',      -- Call ended successfully
  'cancelled',      -- Cancelled by patient/doctor
  'no_show'         -- Patient didn't join
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',        -- Payment initiated
  'processing',     -- In progress with gateway
  'success',        -- Payment successful
  'failed',         -- Payment failed
  'refunded'        -- Refunded to patient
);

-- Document types for doctor verification
CREATE TYPE document_type AS ENUM (
  'medical_license',    -- Egyptian Medical Syndicate license
  'national_id',        -- Egyptian National ID
  'certificate',        -- Additional certifications
  'profile_photo'       -- Professional photo
);
```

---

## Tables

### users

Base table for all users (patients, doctors, admins).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Authentication
  phone VARCHAR(20) NOT NULL UNIQUE,
  firebase_uid VARCHAR(128) UNIQUE,
  
  -- Profile
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  email VARCHAR(255),
  avatar_url TEXT,
  
  -- Role
  role user_role NOT NULL DEFAULT 'patient',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Constraints
  CONSTRAINT valid_phone CHECK (phone ~ '^\+20[0-9]{10}$')
);

-- Comments
COMMENT ON TABLE users IS 'Base table for all platform users';
COMMENT ON COLUMN users.phone IS 'Egyptian phone number with +20 prefix';
COMMENT ON COLUMN users.name_ar IS 'Name in Arabic (required)';
```

---

### patients

Extended profile for patient users.

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Demographics
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  blood_type VARCHAR(5),
  
  -- Medical
  medical_notes TEXT,
  allergies TEXT[],
  chronic_conditions TEXT[],
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_patient_user UNIQUE (user_id)
);

COMMENT ON TABLE patients IS 'Extended profile for patients';
```

---

### doctors

Extended profile for doctor users.

```sql
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Professional Info
  specialty VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) NOT NULL,
  years_experience INTEGER DEFAULT 0,
  
  -- Profile
  bio_ar TEXT NOT NULL,
  bio_en TEXT,
  consultation_fee DECIMAL(10, 2) NOT NULL,
  
  -- Verification
  verification_status verification_status NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  
  -- Ratings
  rating_avg DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  rating_count INTEGER NOT NULL DEFAULT 0,
  total_consultations INTEGER NOT NULL DEFAULT 0,
  
  -- Availability
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  is_accepting_patients BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_doctor_user UNIQUE (user_id),
  CONSTRAINT unique_license UNIQUE (license_number),
  CONSTRAINT valid_fee CHECK (consultation_fee >= 0),
  CONSTRAINT valid_rating CHECK (rating_avg >= 0 AND rating_avg <= 5)
);

COMMENT ON TABLE doctors IS 'Extended profile for doctors';
COMMENT ON COLUMN doctors.specialty IS 'Medical specialty (e.g., General Practice, Pediatrics)';
```

---

### doctor_documents

Documents uploaded for doctor verification.

```sql
CREATE TABLE doctor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  
  -- Document Info
  type document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  
  -- Verification
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  
  -- Metadata
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_doc_type_per_doctor UNIQUE (doctor_id, type)
);

COMMENT ON TABLE doctor_documents IS 'Documents for doctor verification';
```

---

### availability_slots

Doctor weekly availability schedule.

```sql
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  
  -- Schedule
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  CONSTRAINT no_overlapping_slots UNIQUE (doctor_id, day_of_week, start_time)
);

COMMENT ON TABLE availability_slots IS 'Weekly recurring availability slots';
COMMENT ON COLUMN availability_slots.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';
```

---

### consultations

Medical consultations between patients and doctors.

```sql
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  
  -- Status
  status consultation_status NOT NULL DEFAULT 'scheduled',
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Video Call
  jitsi_room_id VARCHAR(100) NOT NULL,
  
  -- Financial
  consultation_fee DECIMAL(10, 2) NOT NULL,
  
  -- Notes
  doctor_notes TEXT,
  patient_complaint TEXT,
  
  -- Ratings
  patient_rating INTEGER CHECK (patient_rating BETWEEN 1 AND 5),
  patient_review TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Constraints
  CONSTRAINT valid_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

COMMENT ON TABLE consultations IS 'Medical consultations';
```

---

### prescriptions

Digital prescriptions issued during consultations.

```sql
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  consultation_id UUID NOT NULL REFERENCES consultations(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  
  -- Content
  medications JSONB NOT NULL DEFAULT '[]',
  notes_ar TEXT,
  diagnosis_ar TEXT,
  
  -- Verification
  signature_url TEXT,
  qr_code_data TEXT,
  
  -- Status
  is_dispensed BOOLEAN NOT NULL DEFAULT FALSE,
  dispensed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_prescription_per_consultation UNIQUE (consultation_id)
);

COMMENT ON TABLE prescriptions IS 'Digital prescriptions';
COMMENT ON COLUMN prescriptions.medications IS 'JSON array of medications with dosage info';

-- Medications JSONB structure:
-- [
--   {
--     "name_ar": "باراسيتامول",
--     "name_en": "Paracetamol",
--     "dosage": "500mg",
--     "frequency": "3 times daily",
--     "duration": "5 days",
--     "instructions_ar": "بعد الأكل"
--   }
-- ]
```

---

### payments

Payment transactions.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  consultation_id UUID NOT NULL REFERENCES consultations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  
  -- Amounts (in EGP)
  amount DECIMAL(10, 2) NOT NULL,
  vat DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Gateway Info
  gateway VARCHAR(20) NOT NULL DEFAULT 'paymob',
  gateway_order_id VARCHAR(100),
  gateway_transaction_id VARCHAR(100),
  gateway_reference VARCHAR(100),
  
  -- Status
  status payment_status NOT NULL DEFAULT 'pending',
  
  -- Timestamps
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_payment_per_consultation UNIQUE (consultation_id),
  CONSTRAINT valid_amounts CHECK (amount >= 0 AND vat >= 0 AND total >= 0)
);

COMMENT ON TABLE payments IS 'Payment transactions';
COMMENT ON COLUMN payments.vat IS '14% VAT on consultation fee';
```

---

### admin_actions

Audit log for admin actions.

```sql
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor
  admin_id UUID NOT NULL REFERENCES users(id),
  
  -- Action Details
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  
  -- Context
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE admin_actions IS 'Audit log for admin actions';
-- action_type examples: 'doctor_approved', 'doctor_rejected', 'user_suspended', 'refund_processed'
-- target_type examples: 'doctor', 'user', 'payment'
```

---

## Indexes

```sql
-- Users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_role ON users(role);

-- Doctors
CREATE INDEX idx_doctors_specialty ON doctors(specialty);
CREATE INDEX idx_doctors_verification ON doctors(verification_status);
CREATE INDEX idx_doctors_verified ON doctors(verification_status) 
  WHERE verification_status = 'approved';
CREATE INDEX idx_doctors_online ON doctors(is_online) 
  WHERE is_online = TRUE AND verification_status = 'approved';

-- Availability
CREATE INDEX idx_availability_doctor ON availability_slots(doctor_id, is_active);
CREATE INDEX idx_availability_day ON availability_slots(day_of_week, is_active);

-- Consultations
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_scheduled ON consultations(scheduled_at) 
  WHERE status = 'scheduled';

-- Payments
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_doctor ON payments(doctor_id);

-- Admin Actions
CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_created ON admin_actions(created_at DESC);
```

---

## Row-Level Security

### Enable RLS on All Tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
```

### User Policies

```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = firebase_uid);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = firebase_uid);
```

### Patient Policies

```sql
-- Patients can read their own data
CREATE POLICY "Patients can read own data"
  ON patients FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE firebase_uid = auth.uid()::text
    )
  );

-- Patients can update their own data
CREATE POLICY "Patients can update own data"
  ON patients FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users WHERE firebase_uid = auth.uid()::text
    )
  );
```

### Doctor Policies

```sql
-- Anyone can view approved doctors
CREATE POLICY "Public can view approved doctors"
  ON doctors FOR SELECT
  USING (verification_status = 'approved' AND is_accepting_patients = TRUE);

-- Doctors can view their own profile
CREATE POLICY "Doctors can read own profile"
  ON doctors FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE firebase_uid = auth.uid()::text
    )
  );

-- Doctors can update their own profile
CREATE POLICY "Doctors can update own profile"
  ON doctors FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users WHERE firebase_uid = auth.uid()::text
    )
  );
```

### Consultation Policies

```sql
-- Patients can view their own consultations
CREATE POLICY "Patients view own consultations"
  ON consultations FOR SELECT
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN users u ON u.id = p.user_id
      WHERE u.firebase_uid = auth.uid()::text
    )
  );

-- Doctors can view their assigned consultations
CREATE POLICY "Doctors view assigned consultations"
  ON consultations FOR SELECT
  USING (
    doctor_id IN (
      SELECT d.id FROM doctors d
      JOIN users u ON u.id = d.user_id
      WHERE u.firebase_uid = auth.uid()::text
    )
  );
```

### Admin Policies

```sql
-- Admins can read all data
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE firebase_uid = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- (Similar policies for other tables...)
```

---

## Functions & Triggers

### Updated At Trigger

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- (Similar for other tables...)
```

### Consultation Duration Calculator

```sql
-- Function to calculate consultation duration
CREATE OR REPLACE FUNCTION calculate_consultation_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_duration
  BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION calculate_consultation_duration();
```

### Doctor Rating Update

```sql
-- Function to update doctor rating after consultation
CREATE OR REPLACE FUNCTION update_doctor_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.patient_rating IS NOT NULL AND OLD.patient_rating IS NULL THEN
    UPDATE doctors 
    SET 
      rating_avg = (
        SELECT AVG(patient_rating)::DECIMAL(3,2) 
        FROM consultations 
        WHERE doctor_id = NEW.doctor_id 
        AND patient_rating IS NOT NULL
      ),
      rating_count = (
        SELECT COUNT(*) 
        FROM consultations 
        WHERE doctor_id = NEW.doctor_id 
        AND patient_rating IS NOT NULL
      ),
      total_consultations = total_consultations + 1
    WHERE id = NEW.doctor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
  AFTER UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION update_doctor_rating();
```

---

## Migration Script

Use Supabase migrations or run this complete SQL:

```bash
# Via Supabase CLI
supabase migration new initial_schema
# Then paste the SQL above into the migration file
supabase db push
```

---

*This schema provides a solid foundation for TawariApp's MVP with room for growth.*
