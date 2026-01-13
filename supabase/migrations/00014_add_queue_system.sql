-- TawariApp Queue-Based Video Call System
-- Migration: 00014_add_queue_system
-- Description: Adds consultation queue table and updates doctor_profiles for real-time queue system

-- ============================================================================
-- NEW ENUM TYPES
-- ============================================================================

-- Queue entry status
CREATE TYPE queue_status AS ENUM (
    'waiting',           -- Patient is waiting in queue
    'called',            -- Doctor has called the patient (transitioning)
    'in_consultation',   -- Active video call
    'completed',         -- Consultation finished
    'cancelled',         -- Patient left queue or cancelled
    'expired'            -- Queue entry expired (doctor went offline, etc.)
);

-- Payment status for queue entries
CREATE TYPE queue_payment_status AS ENUM (
    'pending',           -- Payment not yet processed
    'completed_mock',    -- Mock payment (dev/testing)
    'completed',         -- Real payment completed (Paymob)
    'refunded',          -- Payment refunded
    'failed'             -- Payment failed
);

-- ============================================================================
-- NEW TABLE: consultation_queue
-- ============================================================================

CREATE TABLE consultation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,

    -- Queue position and status
    status queue_status NOT NULL DEFAULT 'waiting',
    position INTEGER NOT NULL DEFAULT 1,

    -- Patient input
    chief_complaint TEXT,

    -- Timestamps for tracking
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    called_at TIMESTAMPTZ,
    consultation_started_at TIMESTAMPTZ,
    consultation_ended_at TIMESTAMPTZ,

    -- Payment tracking
    payment_status queue_payment_status NOT NULL DEFAULT 'pending',
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_reference TEXT,  -- For future Paymob transaction ID

    -- Video call (Daily.co)
    daily_room_name TEXT,
    daily_room_url TEXT,

    -- Consultation metrics
    consultation_duration_minutes INTEGER,

    -- Link to appointment (created when consultation starts, for notes/prescriptions)
    appointment_id UUID REFERENCES appointments(id),

    -- Standard timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- UPDATE doctor_profiles TABLE
-- ============================================================================

-- Add new columns for online status and queue management
ALTER TABLE doctor_profiles
    ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS went_online_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS current_queue_entry_id UUID REFERENCES consultation_queue(id),
    ADD COLUMN IF NOT EXISTS average_consultation_minutes INTEGER DEFAULT 15,
    ADD COLUMN IF NOT EXISTS max_queue_size INTEGER DEFAULT 10;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Queue lookups
CREATE INDEX idx_queue_doctor_status ON consultation_queue(doctor_profile_id, status);
CREATE INDEX idx_queue_patient_status ON consultation_queue(patient_profile_id, status);
CREATE INDEX idx_queue_doctor_position ON consultation_queue(doctor_profile_id, position) WHERE status = 'waiting';
CREATE INDEX idx_queue_joined_at ON consultation_queue(joined_at DESC);
CREATE INDEX idx_queue_status ON consultation_queue(status);

-- Doctor online status lookups
CREATE INDEX idx_doctor_is_online ON doctor_profiles(is_online) WHERE is_online = true;
CREATE INDEX idx_doctor_online_verified ON doctor_profiles(is_online, verification_status)
    WHERE is_online = true AND verification_status = 'verified';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at for consultation_queue
CREATE TRIGGER update_consultation_queue_updated_at
    BEFORE UPDATE ON consultation_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get next queue position for a doctor
CREATE OR REPLACE FUNCTION get_next_queue_position(p_doctor_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    next_pos INTEGER;
BEGIN
    SELECT COALESCE(MAX(position), 0) + 1
    INTO next_pos
    FROM consultation_queue
    WHERE doctor_profile_id = p_doctor_profile_id
    AND status = 'waiting';

    RETURN next_pos;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate queue positions after a patient leaves or is called
CREATE OR REPLACE FUNCTION recalculate_queue_positions(p_doctor_profile_id UUID)
RETURNS void AS $$
BEGIN
    WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY joined_at ASC) as new_position
        FROM consultation_queue
        WHERE doctor_profile_id = p_doctor_profile_id
        AND status = 'waiting'
    )
    UPDATE consultation_queue q
    SET position = r.new_position
    FROM ranked r
    WHERE q.id = r.id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate estimated wait time
CREATE OR REPLACE FUNCTION get_estimated_wait_minutes(p_doctor_profile_id UUID, p_position INTEGER)
RETURNS INTEGER AS $$
DECLARE
    avg_minutes INTEGER;
BEGIN
    SELECT COALESCE(average_consultation_minutes, 15)
    INTO avg_minutes
    FROM doctor_profiles
    WHERE id = p_doctor_profile_id;

    -- Estimate: position * average consultation time
    -- Position 1 means you're next, so wait time could be 0 to avg_minutes
    RETURN (p_position - 1) * avg_minutes;
END;
$$ LANGUAGE plpgsql;

-- Function to update doctor's average consultation time
CREATE OR REPLACE FUNCTION update_doctor_average_consultation_time()
RETURNS TRIGGER AS $$
DECLARE
    new_avg INTEGER;
BEGIN
    -- Only calculate when consultation ends
    IF NEW.status = 'completed' AND NEW.consultation_duration_minutes IS NOT NULL THEN
        SELECT ROUND(AVG(consultation_duration_minutes))::INTEGER
        INTO new_avg
        FROM consultation_queue
        WHERE doctor_profile_id = NEW.doctor_profile_id
        AND status = 'completed'
        AND consultation_duration_minutes IS NOT NULL
        ORDER BY consultation_ended_at DESC
        LIMIT 20;  -- Use last 20 consultations for average

        IF new_avg IS NOT NULL THEN
            UPDATE doctor_profiles
            SET average_consultation_minutes = new_avg
            WHERE id = NEW.doctor_profile_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update average consultation time
CREATE TRIGGER update_avg_consultation_time
    AFTER UPDATE ON consultation_queue
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_doctor_average_consultation_time();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE consultation_queue ENABLE ROW LEVEL SECURITY;

-- Patients can view their own queue entries
CREATE POLICY "Patients can view own queue entries"
    ON consultation_queue FOR SELECT
    USING (
        patient_profile_id IN (
            SELECT pp.id FROM patient_profiles pp
            JOIN profiles p ON pp.profile_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Patients can create queue entries (join queue)
CREATE POLICY "Patients can join queue"
    ON consultation_queue FOR INSERT
    WITH CHECK (
        patient_profile_id IN (
            SELECT pp.id FROM patient_profiles pp
            JOIN profiles p ON pp.profile_id = p.id
            WHERE p.user_id = auth.uid()
        )
        AND payment_status IN ('completed_mock', 'completed')  -- Must have paid
    );

-- Patients can update their own queue entries (leave queue)
CREATE POLICY "Patients can leave queue"
    ON consultation_queue FOR UPDATE
    USING (
        patient_profile_id IN (
            SELECT pp.id FROM patient_profiles pp
            JOIN profiles p ON pp.profile_id = p.id
            WHERE p.user_id = auth.uid()
        )
    )
    WITH CHECK (
        -- Can only change status to cancelled
        status = 'cancelled'
    );

-- Doctors can view queue entries for their queue
CREATE POLICY "Doctors can view their queue"
    ON consultation_queue FOR SELECT
    USING (
        doctor_profile_id IN (
            SELECT dp.id FROM doctor_profiles dp
            JOIN profiles p ON dp.profile_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Doctors can update queue entries (call patient, complete consultation)
CREATE POLICY "Doctors can manage their queue"
    ON consultation_queue FOR UPDATE
    USING (
        doctor_profile_id IN (
            SELECT dp.id FROM doctor_profiles dp
            JOIN profiles p ON dp.profile_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================

-- Enable realtime for queue updates
ALTER PUBLICATION supabase_realtime ADD TABLE consultation_queue;

-- Ensure doctor_profiles realtime is enabled for online status
-- (may already be enabled, so we use IF NOT EXISTS pattern via DO block)
DO $$
BEGIN
    -- Check if doctor_profiles is already in the publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'doctor_profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE doctor_profiles;
    END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE consultation_queue IS 'Real-time queue for on-demand video consultations';
COMMENT ON COLUMN consultation_queue.position IS 'Queue position (1 = next to be seen)';
COMMENT ON COLUMN consultation_queue.payment_status IS 'completed_mock for development, completed for real Paymob payments';
COMMENT ON COLUMN consultation_queue.daily_room_name IS 'Daily.co room identifier for video call';
COMMENT ON COLUMN consultation_queue.appointment_id IS 'Linked appointment created when consultation starts (for notes/prescriptions)';
COMMENT ON COLUMN doctor_profiles.is_online IS 'True when doctor is accepting queue patients';
COMMENT ON COLUMN doctor_profiles.current_queue_entry_id IS 'Currently active consultation queue entry';
COMMENT ON COLUMN doctor_profiles.average_consultation_minutes IS 'Rolling average for wait time estimation';
