/**
 * TawariApp - Run Clinic Fields Migration
 *
 * This script adds clinic_name, clinic_address, clinic_phone, phone_number columns
 * to doctor_profiles table, and PDF fields to prescriptions table.
 *
 * USAGE:
 * npx tsx scripts/run-clinic-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Try multiple variable names for compatibility
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables.');
  console.error('Looking for: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('Running clinic fields migration...\n');

  // SQL statements to run
  const statements = [
    // 1. Add clinic fields to doctor_profiles
    `ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS clinic_name VARCHAR(255);`,
    `ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS clinic_address TEXT;`,
    `ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS clinic_phone VARCHAR(20);`,
    `ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);`,

    // 2. Add PDF storage fields to prescriptions
    `ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pdf_path TEXT;`,
    `ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ;`,

    // 3. Add urgent care link to appointments
    `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'scheduled';`,
    `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS consultation_queue_id UUID;`,
  ];

  for (const sql of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        // If exec_sql doesn't exist, we'll get an error - that's expected
        // The admin client might not have this function
        console.log(`  Note: ${error.message}`);
      } else {
        console.log(`  ✓ Executed: ${sql.substring(0, 60)}...`);
      }
    } catch {
      console.log(`  Could not execute via RPC: ${sql.substring(0, 50)}...`);
    }
  }

  console.log('\n');
  console.log('========================================');
  console.log('MIGRATION NOTE');
  console.log('========================================');
  console.log('\nIf the above commands failed, run the migration manually:');
  console.log('\n1. Go to Supabase Dashboard > SQL Editor');
  console.log('2. Paste and run the following SQL:\n');
  console.log('----------------------------------------');
  console.log(`
-- Add clinic fields to doctor_profiles
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS clinic_name VARCHAR(255);
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS clinic_address TEXT;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS clinic_phone VARCHAR(20);
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Add PDF storage fields to prescriptions
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pdf_path TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ;

-- Add urgent care link to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'scheduled';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS consultation_queue_id UUID;
  `);
  console.log('----------------------------------------');
  console.log('\nAfter running the migration, run:');
  console.log('npx tsx scripts/seed-doctor-clinic-data.ts');
}

// Run the migration
runMigration()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
