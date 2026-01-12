-- Migration: Add notification preferences to profiles table
-- This allows users to control their notification settings

-- Add notification preference columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_sms BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_appointments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_prescriptions BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.notify_email IS 'User preference for receiving email notifications';
COMMENT ON COLUMN profiles.notify_sms IS 'User preference for receiving SMS notifications';
COMMENT ON COLUMN profiles.notify_appointments IS 'User preference for receiving appointment reminder notifications';
COMMENT ON COLUMN profiles.notify_prescriptions IS 'User preference for receiving prescription update notifications';
