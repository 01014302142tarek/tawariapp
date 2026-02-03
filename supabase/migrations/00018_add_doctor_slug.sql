-- Migration: Add slug field to doctor_profiles for SEO-friendly URLs
-- Description: Adds slug column and auto-generates unique slugs from doctor names

-- Add slug column to doctor_profiles
ALTER TABLE doctor_profiles
ADD COLUMN slug VARCHAR(255) UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX idx_doctor_profiles_slug ON doctor_profiles(slug);

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens
    slug := lower(trim(name));
    -- Remove "Dr." or "Dr " prefix
    slug := regexp_replace(slug, '^(dr\.?|د\.?)\s*', '', 'gi');
    -- Replace spaces and special characters with hyphens
    slug := regexp_replace(slug, '[^a-z0-9\u0600-\u06FF]+', '-', 'g');
    -- Remove leading/trailing hyphens
    slug := regexp_replace(slug, '^-+|-+$', '', 'g');
    -- Limit length to 200 chars
    slug := substring(slug for 200);

    RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate unique slug with number suffix if needed
CREATE OR REPLACE FUNCTION generate_unique_doctor_slug(doctor_profile_id UUID, doctor_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 2;
BEGIN
    -- Generate base slug from name
    base_slug := generate_slug(doctor_name);
    final_slug := base_slug;

    -- Check if slug exists for other doctors
    WHILE EXISTS (
        SELECT 1 FROM doctor_profiles
        WHERE slug = final_slug
        AND id != doctor_profile_id
    ) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION set_doctor_slug()
RETURNS TRIGGER AS $$
DECLARE
    doctor_name TEXT;
BEGIN
    -- Get the doctor's full name from profiles table
    SELECT full_name INTO doctor_name
    FROM profiles
    WHERE id = NEW.profile_id;

    -- Generate unique slug
    NEW.slug := generate_unique_doctor_slug(NEW.id, doctor_name);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new doctors
CREATE TRIGGER trigger_set_doctor_slug
    BEFORE INSERT OR UPDATE OF profile_id
    ON doctor_profiles
    FOR EACH ROW
    WHEN (NEW.slug IS NULL)
    EXECUTE FUNCTION set_doctor_slug();

-- Populate slugs for existing doctors
DO $$
DECLARE
    doc RECORD;
    new_slug TEXT;
BEGIN
    FOR doc IN
        SELECT dp.id, dp.profile_id, p.full_name
        FROM doctor_profiles dp
        JOIN profiles p ON p.id = dp.profile_id
        WHERE dp.slug IS NULL
    LOOP
        new_slug := generate_unique_doctor_slug(doc.id, doc.full_name);
        UPDATE doctor_profiles
        SET slug = new_slug
        WHERE id = doc.id;
    END LOOP;
END $$;

-- Make slug NOT NULL after populating existing records
ALTER TABLE doctor_profiles
ALTER COLUMN slug SET NOT NULL;

-- Add comment
COMMENT ON COLUMN doctor_profiles.slug IS 'URL-friendly slug generated from doctor name, unique across all doctors';
