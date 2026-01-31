-- ============================================================================
-- Fix: update_doctor_average_consultation_time trigger function
--
-- The original query incorrectly used ORDER BY with LIMIT alongside an
-- aggregate function (AVG), which caused a PostgreSQL error:
-- "column must appear in the GROUP BY clause or be used in an aggregate function"
--
-- This migration fixes the function to use a proper subquery.
-- ============================================================================

CREATE OR REPLACE FUNCTION update_doctor_average_consultation_time()
RETURNS TRIGGER AS $$
DECLARE
    new_avg INTEGER;
BEGIN
    -- Only calculate when consultation ends
    IF NEW.status = 'completed' AND NEW.consultation_duration_minutes IS NOT NULL THEN
        -- Calculate average of last 20 completed consultations
        -- Must use subquery to apply ORDER BY and LIMIT before AVG
        SELECT ROUND(AVG(duration))::INTEGER
        INTO new_avg
        FROM (
            SELECT consultation_duration_minutes as duration
            FROM consultation_queue
            WHERE doctor_profile_id = NEW.doctor_profile_id
            AND status = 'completed'
            AND consultation_duration_minutes IS NOT NULL
            ORDER BY consultation_ended_at DESC
            LIMIT 20
        ) last_20_consultations;

        IF new_avg IS NOT NULL THEN
            UPDATE doctor_profiles
            SET average_consultation_minutes = new_avg
            WHERE id = NEW.doctor_profile_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: The trigger itself doesn't need to be recreated since we're just
-- replacing the function it calls with CREATE OR REPLACE
