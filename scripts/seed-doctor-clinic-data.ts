/**
 * TawariApp - Seed Doctor Clinic Data
 *
 * This script adds clinic information to test doctor profiles.
 * Run AFTER the migration that adds clinic_name, clinic_address, etc. columns.
 *
 * USAGE:
 * 1. First run the migration:
 *    psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/00016_prescription_pdf_and_clinic_fields.sql
 *
 * 2. Then run this script:
 *    npx tsx scripts/seed-doctor-clinic-data.ts
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

// Test doctor clinic data
const doctorClinicData = [
  {
    email: 'doctor1@tawari.test',
    clinicData: {
      clinic_name: 'Cairo Heart Center',
      clinic_address: '15 Tahrir Square, Downtown Cairo, Egypt',
      clinic_phone: '+20223456789',
      phone_number: '+201001234567'
    }
  },
  {
    email: 'doctor2@tawari.test',
    clinicData: {
      clinic_name: 'Alexandria Skin Care Clinic',
      clinic_address: '42 Corniche Road, Alexandria, Egypt',
      clinic_phone: '+20334567890',
      phone_number: '+201112345678'
    }
  },
  {
    email: 'doctor3@tawari.test',
    clinicData: {
      clinic_name: 'Tawari Family Medicine',
      clinic_address: '88 Ramses Street, Heliopolis, Cairo',
      clinic_phone: '+20224567890',
      phone_number: '+201223456789'
    }
  },
  {
    email: 'doctor4@tawari.test',
    clinicData: {
      clinic_name: 'Happy Kids Pediatric Clinic',
      clinic_address: '25 El-Nasr Road, Nasr City, Cairo',
      clinic_phone: '+20225678901',
      phone_number: '+201334567890'
    }
  },
  {
    email: 'doctor5@tawari.test',
    clinicData: {
      clinic_name: 'Internal Medicine Associates',
      clinic_address: '110 October Street, Giza',
      clinic_phone: '+20236789012',
      phone_number: '+201445678901'
    }
  },
  {
    email: 'doctor6@tawari.test',
    clinicData: {
      clinic_name: 'Mind & Wellness Center',
      clinic_address: '33 Garden City, Cairo',
      clinic_phone: '+20237890123',
      phone_number: '+201556789012'
    }
  }
];

async function seedDoctorClinicData() {
  console.log('Seeding doctor clinic data...\n');

  for (const doctor of doctorClinicData) {
    try {
      // Find user by email
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();

      if (listError) {
        console.error(`  Error listing users: ${listError.message}`);
        continue;
      }

      const user = users.users.find(u => u.email === doctor.email);

      if (!user) {
        console.log(`  Skipping ${doctor.email} - user not found`);
        continue;
      }

      // Get the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.log(`  Skipping ${doctor.email} - profile not found`);
        continue;
      }

      // Update doctor profile with clinic data
      const { error: updateError } = await supabase
        .from('doctor_profiles')
        .update(doctor.clinicData)
        .eq('profile_id', profile.id);

      if (updateError) {
        console.error(`  Error updating ${doctor.email}: ${updateError.message}`);
      } else {
        console.log(`  ✓ ${doctor.email} - ${doctor.clinicData.clinic_name}`);
      }

    } catch (error) {
      console.error(`  Unexpected error for ${doctor.email}:`, error);
    }
  }

  console.log('\nClinic data seeding complete.');
}

// Run the seeding
seedDoctorClinicData()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
