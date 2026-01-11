-- Prevent double booking with database-level constraint
-- Migration: 00009_prevent_double_booking
--
-- Problem: Race condition between checking slot availability and inserting appointment
-- could allow two concurrent requests to book the same time slot.
--
-- Solution: Add an exclusion constraint using tstzrange to prevent overlapping
-- appointments for the same doctor at the database level.

-- ============================================================================
-- STEP 1: Enable btree_gist extension (required for exclusion constraints)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================================
-- STEP 2: Add exclusion constraint to prevent overlapping appointments
-- ============================================================================

-- This constraint prevents any two appointments for the same doctor from having
-- overlapping time ranges (scheduled_start to scheduled_end).
-- Only applies to active appointments (not cancelled or completed).

ALTER TABLE appointments
ADD CONSTRAINT no_overlapping_appointments
EXCLUDE USING gist (
    doctor_profile_id WITH =,
    tstzrange(scheduled_start, scheduled_end) WITH &&
)
WHERE (status IN ('scheduled', 'in_waiting_room', 'in_progress'));

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Test by attempting to insert overlapping appointments for the same doctor.
-- The second insert should fail with an exclusion constraint violation.
--
-- If this migration fails, the constraint already exists or there are existing
-- overlapping appointments that need to be resolved first.
