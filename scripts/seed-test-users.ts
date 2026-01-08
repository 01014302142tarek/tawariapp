/**
 * TawariApp Test Users Seeding Script (TypeScript/Supabase Admin API)
 *
 * This script creates 6 test users with proper Supabase Auth integration.
 * Use this instead of the SQL script if direct auth.users inserts fail.
 *
 * USAGE:
 * 1. Set your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * 2. Run: npx tsx scripts/seed-test-users.ts
 *
 * TEST CREDENTIALS:
 * - patient1@tawari.test / TawariPatient1!2024
 * - patient2@tawari.test / TawariPatient2!2024
 * - doctor1@tawari.test / TawariDoctor1!2024
 * - doctor2@tawari.test / TawariDoctor2!2024
 * - admin1@tawari.test / TawariAdmin1!2024
 * - admin2@tawari.test / TawariAdmin2!2024
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
  console.error('Make sure these are set in your .env.local file');
  console.error(`\nFound SUPABASE_URL: ${supabaseUrl ? 'Yes' : 'No'}`);
  console.error(`Found SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceRoleKey ? 'Yes' : 'No'}`);
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test user emails for cleanup
const testEmails = [
  'patient1@tawari.test',
  'patient2@tawari.test',
  'doctor1@tawari.test',
  'doctor2@tawari.test',
  'admin1@tawari.test',
  'admin2@tawari.test'
];

async function cleanupExistingTestUsers() {
  console.log('Cleaning up existing test users...\n');

  for (const email of testEmails) {
    try {
      // Find user by email
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();

      if (listError) {
        console.error(`  Error listing users: ${listError.message}`);
        continue;
      }

      const existingUser = users.users.find(u => u.email === email);

      if (existingUser) {
        // Delete the user (cascades to profiles via triggers/RLS)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);

        if (deleteError) {
          console.error(`  Error deleting ${email}: ${deleteError.message}`);
        } else {
          console.log(`  Deleted: ${email}`);
        }
      } else {
        console.log(`  Not found: ${email}`);
      }
    } catch (error) {
      console.error(`  Unexpected error for ${email}:`, error);
    }
  }

  console.log('\nCleanup complete.\n');
}

// Test user definitions
const testUsers = [
  {
    email: 'patient1@tawari.test',
    password: 'TawariPatient1!2024',
    role: 'patient',
    fullName: 'Ahmed Hassan',
    preferredLanguage: 'ar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    patientData: {
      dateOfBirth: '1989-03-15',
      gender: 'male',
      bloodType: 'A+',
      emergencyContactName: 'Mona Hassan',
      emergencyContactPhone: '+201012345678',
      nationalId: '28903150123456',
      verificationLevel: 'phone_verified'
    }
  },
  {
    email: 'patient2@tawari.test',
    password: 'TawariPatient2!2024',
    role: 'patient',
    fullName: 'Fatima Ali',
    preferredLanguage: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    patientData: {
      dateOfBirth: '1996-07-22',
      gender: 'female',
      bloodType: 'O+',
      emergencyContactName: 'Khaled Ali',
      emergencyContactPhone: '+201098765432',
      nationalId: '29607220654321',
      verificationLevel: 'id_verified'
    }
  },
  {
    email: 'doctor1@tawari.test',
    password: 'TawariDoctor1!2024',
    role: 'doctor',
    fullName: 'Dr. Mohamed Ibrahim',
    preferredLanguage: 'ar',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    doctorData: {
      licenseNumber: 'EG-MED-2009-12345',
      yearsOfExperience: 15,
      bio: 'Consultant Cardiologist with over 15 years of experience in treating heart conditions. Graduated from Cairo University Medical School. Specialized in interventional cardiology and heart failure management.',
      consultationFee: 350.00,
      verificationStatus: 'verified',
      isAvailableNow: true,
      ratingAverage: 4.8,
      ratingCount: 127,
      totalConsultations: 243,
      specializations: ['Cardiology', 'Internal Medicine']
    }
  },
  {
    email: 'doctor2@tawari.test',
    password: 'TawariDoctor2!2024',
    role: 'doctor',
    fullName: 'Dr. Nour El-Din',
    preferredLanguage: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    doctorData: {
      licenseNumber: 'EG-MED-2016-67890',
      yearsOfExperience: 8,
      bio: 'Board-certified Dermatologist specializing in clinical and cosmetic dermatology. Expert in treating acne, eczema, psoriasis, and skin cancer screening. Trained at Alexandria University Hospital.',
      consultationFee: 250.00,
      verificationStatus: 'verified',
      isAvailableNow: false,
      ratingAverage: 4.6,
      ratingCount: 89,
      totalConsultations: 156,
      specializations: ['Dermatology']
    }
  },
  {
    email: 'admin1@tawari.test',
    password: 'TawariAdmin1!2024',
    role: 'admin',
    fullName: 'Sarah Admin',
    preferredLanguage: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    adminData: {
      trustLevel: 'full_admin',
      department: 'general',
      twoFactorEnabled: true
    }
  },
  {
    email: 'admin2@tawari.test',
    password: 'TawariAdmin2!2024',
    role: 'admin',
    fullName: 'Omar Admin',
    preferredLanguage: 'ar',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    adminData: {
      trustLevel: 'support_agent',
      department: 'support',
      twoFactorEnabled: false
    }
  }
];

async function seedTestUsers() {
  console.log('Starting test user seeding...\n');

  const createdUsers: { email: string; userId: string; profileId: string; roleProfileId: string }[] = [];

  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email}...`);

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
          role: user.role
        }
      });

      if (authError) {
        console.error(`  Error creating auth user: ${authError.message}`);
        continue;
      }

      const userId = authData.user.id;
      console.log(`  Auth user created: ${userId}`);

      // 2. Update base profile (auto-created by Supabase trigger)
      // First, get the auto-created profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error(`  Error fetching profile: ${fetchError.message}`);
        continue;
      }

      const profileId = existingProfile.id;

      // Update the profile with full data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: user.role,
          full_name: user.fullName,
          avatar_url: user.avatarUrl,
          preferred_language: user.preferredLanguage,
          is_active: true
        })
        .eq('id', profileId);

      if (profileError) {
        console.error(`  Error updating profile: ${profileError.message}`);
        continue;
      }

      console.log(`  Profile updated: ${profileId}`);

      let roleProfileId = '';

      // 3. Update role-specific profile (auto-created by Supabase trigger)
      if (user.role === 'patient' && user.patientData) {
        // Get existing patient profile
        const { data: existingPatient } = await supabase
          .from('patient_profiles')
          .select('id')
          .eq('profile_id', profileId)
          .single();

        if (existingPatient) {
          const { error: patientError } = await supabase
            .from('patient_profiles')
            .update({
              date_of_birth: user.patientData.dateOfBirth,
              gender: user.patientData.gender,
              blood_type: user.patientData.bloodType,
              emergency_contact_name: user.patientData.emergencyContactName,
              emergency_contact_phone: user.patientData.emergencyContactPhone,
              national_id: user.patientData.nationalId,
              verification_level: user.patientData.verificationLevel
            })
            .eq('id', existingPatient.id);

          if (patientError) {
            console.error(`  Error updating patient profile: ${patientError.message}`);
          } else {
            roleProfileId = existingPatient.id;
            console.log(`  Patient profile updated: ${roleProfileId}`);
          }
        }
      }

      if (user.role === 'doctor' && user.doctorData) {
        // Get existing doctor profile
        const { data: existingDoctor } = await supabase
          .from('doctor_profiles')
          .select('id')
          .eq('profile_id', profileId)
          .single();

        if (existingDoctor) {
          const { error: doctorError } = await supabase
            .from('doctor_profiles')
            .update({
              license_number: user.doctorData.licenseNumber,
              years_of_experience: user.doctorData.yearsOfExperience,
              bio: user.doctorData.bio,
              consultation_fee: user.doctorData.consultationFee,
              verification_status: user.doctorData.verificationStatus,
              verified_at: new Date().toISOString(),
              is_available_now: user.doctorData.isAvailableNow,
              rating_average: user.doctorData.ratingAverage,
              rating_count: user.doctorData.ratingCount,
              total_consultations: user.doctorData.totalConsultations
            })
            .eq('id', existingDoctor.id);

          if (doctorError) {
            console.error(`  Error updating doctor profile: ${doctorError.message}`);
          } else {
            roleProfileId = existingDoctor.id;
            console.log(`  Doctor profile updated: ${roleProfileId}`);
          }
        }
      }

      if (user.role === 'admin' && user.adminData) {
        // Get existing admin profile
        const { data: existingAdmin } = await supabase
          .from('admin_profiles')
          .select('id')
          .eq('profile_id', profileId)
          .single();

        if (existingAdmin) {
          const { error: adminError } = await supabase
            .from('admin_profiles')
            .update({
              trust_level: user.adminData.trustLevel,
              department: user.adminData.department,
              two_factor_enabled: user.adminData.twoFactorEnabled
            })
            .eq('id', existingAdmin.id);

          if (adminError) {
            console.error(`  Error updating admin profile: ${adminError.message}`);
          } else {
            roleProfileId = existingAdmin.id;
            console.log(`  Admin profile updated: ${roleProfileId}`);
          }
        }
      }

      createdUsers.push({
        email: user.email,
        userId,
        profileId,
        roleProfileId
      });

      console.log(`  ✓ ${user.email} created successfully\n`);

    } catch (error) {
      console.error(`  Unexpected error for ${user.email}:`, error);
    }
  }

  // Print summary
  console.log('\n========================================');
  console.log('SEEDING COMPLETE');
  console.log('========================================\n');
  console.log('Created users:');
  console.log('----------------------------------------');

  for (const user of createdUsers) {
    console.log(`${user.email}`);
    console.log(`  user_id: ${user.userId}`);
    console.log(`  profile_id: ${user.profileId}`);
    console.log(`  role_profile_id: ${user.roleProfileId}`);
    console.log('');
  }

  console.log('\nIMPORTANT: To seed additional data (appointments, prescriptions, messages, etc.):');
  console.log('1. Copy the UUIDs printed above');
  console.log('2. Open scripts/seed-test-users.sql');
  console.log('3. Update the UUID Reference Table with your new UUIDs');
  console.log('4. Run the SQL script from STEP 6 onwards (skip auth users and profiles)');
  console.log('\nNote: The doctor profiles created do NOT have verified_by set.');
  console.log('You can update this manually or run an UPDATE query after creating an admin.');
}

// Run the seeding
async function main() {
  // First cleanup existing test users
  await cleanupExistingTestUsers();

  // Then seed fresh test users
  await seedTestUsers();

  console.log('Done!');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
