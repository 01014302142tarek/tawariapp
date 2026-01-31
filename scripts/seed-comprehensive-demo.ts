/**
 * TawariApp Comprehensive Demo Data Seeding Script
 *
 * This script creates realistic demo data for all TawariApp features.
 * It builds on the existing 6 test users and adds 10 more accounts with
 * comprehensive data for testing all platform features.
 *
 * USAGE:
 * 1. Make sure existing test users are seeded: npx tsx scripts/seed-test-users.ts
 * 2. Run: npx tsx scripts/seed-comprehensive-demo.ts
 *
 * NEW TEST ACCOUNTS ADDED:
 * - patient3@tawari.test / TawariPatient3!2024 - Omar Khalil (young adult)
 * - patient4@tawari.test / TawariPatient4!2024 - Mariam Saeed (elderly)
 * - patient5@tawari.test / TawariPatient5!2024 - Youssef Nasser (child)
 * - patient6@tawari.test / TawariPatient6!2024 - Nadia Mostafa (pregnant)
 * - doctor3@tawari.test / TawariDoctor3!2024 - Dr. Sara Ahmed (GP, verified)
 * - doctor4@tawari.test / TawariDoctor4!2024 - Dr. Hassan Mahmoud (Pediatrics, pending)
 * - doctor5@tawari.test / TawariDoctor5!2024 - Dr. Layla Farouk (Internal Med, under_review)
 * - doctor6@tawari.test / TawariDoctor6!2024 - Dr. Karim Youssef (Psychiatry, suspended)
 * - admin3@tawari.test / TawariAdmin3!2024 - Khaled Support (verification team)
 * - assistant1@tawari.test / TawariAssistant1!2024 - Heba Assistant (for Dr. Mohamed)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables.');
  console.error('Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Store created user IDs for later reference
interface UserIds {
  [email: string]: {
    userId: string;
    profileId: string;
    roleProfileId: string;
  };
}

const userIds: UserIds = {};

// New test users to create
const newTestUsers = [
  // New Patients
  {
    email: 'patient3@tawari.test',
    password: 'TawariPatient3!2024',
    role: 'patient',
    fullName: 'Omar Khalil',
    preferredLanguage: 'ar',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    patientData: {
      dateOfBirth: '1995-03-15',
      gender: 'male',
      bloodType: 'B+',
      emergencyContactName: 'Khalid Khalil',
      emergencyContactPhone: '+201001234567',
      nationalId: '29503151234567',
      verificationLevel: 'phone_verified'
    }
  },
  {
    email: 'patient4@tawari.test',
    password: 'TawariPatient4!2024',
    role: 'patient',
    fullName: 'Mariam Saeed',
    preferredLanguage: 'ar',
    avatarUrl: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=200&h=200&fit=crop&crop=face',
    patientData: {
      dateOfBirth: '1958-07-22',
      gender: 'female',
      bloodType: 'A-',
      emergencyContactName: 'Ahmed Saeed',
      emergencyContactPhone: '+201112345678',
      nationalId: '25807221234567',
      verificationLevel: 'id_verified'
    }
  },
  {
    email: 'patient5@tawari.test',
    password: 'TawariPatient5!2024',
    role: 'patient',
    fullName: 'Youssef Nasser',
    preferredLanguage: 'ar',
    avatarUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=200&h=200&fit=crop&crop=face',
    patientData: {
      dateOfBirth: '2016-11-08',
      gender: 'male',
      bloodType: 'O+',
      emergencyContactName: 'Nasser Family',
      emergencyContactPhone: '+201223456789',
      nationalId: null,
      verificationLevel: 'email_only'
    }
  },
  {
    email: 'patient6@tawari.test',
    password: 'TawariPatient6!2024',
    role: 'patient',
    fullName: 'Nadia Mostafa',
    preferredLanguage: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    patientData: {
      dateOfBirth: '1990-04-18',
      gender: 'female',
      bloodType: 'AB+',
      emergencyContactName: 'Mostafa Ahmed',
      emergencyContactPhone: '+201334567890',
      nationalId: '29004181234567',
      verificationLevel: 'id_verified'
    }
  },
  // New Doctors
  {
    email: 'doctor3@tawari.test',
    password: 'TawariDoctor3!2024',
    role: 'doctor',
    fullName: 'Dr. Sara Ahmed',
    preferredLanguage: 'ar',
    avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
    doctorData: {
      licenseNumber: 'EG-GP-2019-4521',
      yearsOfExperience: 5,
      bio: 'Family medicine specialist with focus on preventive care and wellness. Graduated from Ain Shams University. Passionate about holistic patient care.',
      consultationFee: 200.00,
      verificationStatus: 'verified',
      isAvailableNow: true,
      ratingAverage: 4.5,
      ratingCount: 45,
      totalConsultations: 98,
      specializations: ['General Practice']
    }
  },
  {
    email: 'doctor4@tawari.test',
    password: 'TawariDoctor4!2024',
    role: 'doctor',
    fullName: 'Dr. Hassan Mahmoud',
    preferredLanguage: 'ar',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
    doctorData: {
      licenseNumber: 'EG-PED-2023-8901',
      yearsOfExperience: 1,
      bio: 'Recently licensed pediatrician specializing in child development and preventive pediatric care. Graduate of Cairo University Medical School.',
      consultationFee: 300.00,
      verificationStatus: 'pending',
      isAvailableNow: false,
      ratingAverage: 0,
      ratingCount: 0,
      totalConsultations: 0,
      specializations: ['Pediatrics']
    }
  },
  {
    email: 'doctor5@tawari.test',
    password: 'TawariDoctor5!2024',
    role: 'doctor',
    fullName: 'Dr. Layla Farouk',
    preferredLanguage: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    doctorData: {
      licenseNumber: 'EG-IM-2015-3344',
      yearsOfExperience: 9,
      bio: 'Specialist in diabetes management and thyroid disorders. Board certified in Internal Medicine and Endocrinology. Fellowship trained at Johns Hopkins.',
      consultationFee: 400.00,
      verificationStatus: 'under_review',
      isAvailableNow: false,
      ratingAverage: 0,
      ratingCount: 0,
      totalConsultations: 0,
      specializations: ['Internal Medicine']
    }
  },
  {
    email: 'doctor6@tawari.test',
    password: 'TawariDoctor6!2024',
    role: 'doctor',
    fullName: 'Dr. Karim Youssef',
    preferredLanguage: 'ar',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
    doctorData: {
      licenseNumber: 'EG-PSY-2010-1122',
      yearsOfExperience: 14,
      bio: 'Mental health specialist with expertise in anxiety, depression, and stress management. Account currently suspended pending license renewal verification.',
      consultationFee: 500.00,
      verificationStatus: 'suspended',
      verificationNotes: 'License expired - pending renewal documentation',
      isAvailableNow: false,
      ratingAverage: 4.7,
      ratingCount: 156,
      totalConsultations: 312,
      specializations: ['Psychiatry']
    }
  },
  // New Admin
  {
    email: 'admin3@tawari.test',
    password: 'TawariAdmin3!2024',
    role: 'admin',
    fullName: 'Khaled Support',
    preferredLanguage: 'ar',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    adminData: {
      trustLevel: 'support_agent',
      department: 'verification',
      twoFactorEnabled: true
    }
  },
  // Doctor Assistant
  {
    email: 'assistant1@tawari.test',
    password: 'TawariAssistant1!2024',
    role: 'doctor_assistant',
    fullName: 'Heba Assistant',
    preferredLanguage: 'ar',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    assistantData: {
      assistantType: 'doctor_assistant',
      department: null
    }
  }
];

// Additional specializations to add
const additionalSpecializations = [
  { name_en: 'Psychiatry', name_ar: 'الطب النفسي', category: 'specialist', min_fee: 300.00, max_fee: 600.00 },
  { name_en: 'Obstetrics & Gynecology', name_ar: 'النساء والتوليد', category: 'specialist', min_fee: 200.00, max_fee: 500.00 },
  { name_en: 'Endocrinology', name_ar: 'الغدد الصماء', category: 'sub_specialist', min_fee: 250.00, max_fee: 550.00 },
];

async function getExistingUserIds() {
  console.log('Fetching existing user IDs...\n');

  const existingEmails = [
    'patient1@tawari.test',
    'patient2@tawari.test',
    'doctor1@tawari.test',
    'doctor2@tawari.test',
    'admin1@tawari.test',
    'admin2@tawari.test'
  ];

  const { data: users } = await supabase.auth.admin.listUsers();

  for (const email of existingEmails) {
    const authUser = users?.users.find(u => u.email === email);
    if (!authUser) {
      console.log(`  Warning: ${email} not found - run seed-test-users.ts first`);
      continue;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', authUser.id)
      .single();

    if (!profile) continue;

    let roleProfileId = '';

    if (profile.role === 'patient') {
      const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('profile_id', profile.id)
        .single();
      roleProfileId = patientProfile?.id || '';
    } else if (profile.role === 'doctor') {
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('profile_id', profile.id)
        .single();
      roleProfileId = doctorProfile?.id || '';
    } else if (profile.role === 'admin') {
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('profile_id', profile.id)
        .single();
      roleProfileId = adminProfile?.id || '';
    }

    userIds[email] = {
      userId: authUser.id,
      profileId: profile.id,
      roleProfileId
    };

    console.log(`  ✓ ${email}: ${profile.id}`);
  }

  console.log('\n');
}

async function createNewUsers() {
  console.log('Creating new test users...\n');

  for (const user of newTestUsers) {
    try {
      // Check if user already exists
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users.find(u => u.email === user.email);

      if (existingUser) {
        console.log(`  ${user.email} already exists, fetching IDs...`);

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', existingUser.id)
          .single();

        if (profile) {
          let roleProfileId = '';

          if (user.role === 'patient') {
            const { data: rp } = await supabase.from('patient_profiles').select('id').eq('profile_id', profile.id).single();
            roleProfileId = rp?.id || '';
          } else if (user.role === 'doctor') {
            const { data: rp } = await supabase.from('doctor_profiles').select('id').eq('profile_id', profile.id).single();
            roleProfileId = rp?.id || '';
          } else if (user.role === 'admin') {
            const { data: rp } = await supabase.from('admin_profiles').select('id').eq('profile_id', profile.id).single();
            roleProfileId = rp?.id || '';
          } else if (user.role === 'doctor_assistant') {
            const { data: rp } = await supabase.from('assistant_profiles').select('id').eq('profile_id', profile.id).single();
            roleProfileId = rp?.id || '';
          }

          userIds[user.email] = {
            userId: existingUser.id,
            profileId: profile.id,
            roleProfileId
          };
        }
        continue;
      }

      // Create auth user
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
        console.error(`  Error creating ${user.email}: ${authError.message}`);
        continue;
      }

      const userId = authData.user.id;

      // Get auto-created profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        console.error(`  Profile not auto-created for ${user.email}`);
        continue;
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({
          role: user.role,
          full_name: user.fullName,
          avatar_url: user.avatarUrl,
          preferred_language: user.preferredLanguage,
          is_active: true
        })
        .eq('id', profile.id);

      let roleProfileId = '';

      // Update role-specific profile
      if (user.role === 'patient' && user.patientData) {
        const { data: patientProfile } = await supabase
          .from('patient_profiles')
          .select('id')
          .eq('profile_id', profile.id)
          .single();

        if (patientProfile) {
          await supabase
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
            .eq('id', patientProfile.id);
          roleProfileId = patientProfile.id;
        }
      }

      if (user.role === 'doctor' && user.doctorData) {
        const { data: doctorProfile } = await supabase
          .from('doctor_profiles')
          .select('id')
          .eq('profile_id', profile.id)
          .single();

        if (doctorProfile) {
          await supabase
            .from('doctor_profiles')
            .update({
              license_number: user.doctorData.licenseNumber,
              years_of_experience: user.doctorData.yearsOfExperience,
              bio: user.doctorData.bio,
              consultation_fee: user.doctorData.consultationFee,
              verification_status: user.doctorData.verificationStatus,
              verification_notes: user.doctorData.verificationNotes || null,
              verified_at: user.doctorData.verificationStatus === 'verified' ? new Date().toISOString() : null,
              is_available_now: user.doctorData.isAvailableNow,
              rating_average: user.doctorData.ratingAverage,
              rating_count: user.doctorData.ratingCount,
              total_consultations: user.doctorData.totalConsultations
            })
            .eq('id', doctorProfile.id);
          roleProfileId = doctorProfile.id;
        }
      }

      if (user.role === 'admin' && user.adminData) {
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('id')
          .eq('profile_id', profile.id)
          .single();

        if (adminProfile) {
          await supabase
            .from('admin_profiles')
            .update({
              trust_level: user.adminData.trustLevel,
              department: user.adminData.department,
              two_factor_enabled: user.adminData.twoFactorEnabled
            })
            .eq('id', adminProfile.id);
          roleProfileId = adminProfile.id;
        }
      }

      if (user.role === 'doctor_assistant' && user.assistantData) {
        const { data: assistantProfile } = await supabase
          .from('assistant_profiles')
          .select('id')
          .eq('profile_id', profile.id)
          .single();

        if (assistantProfile) {
          await supabase
            .from('assistant_profiles')
            .update({
              assistant_type: user.assistantData.assistantType,
              department: user.assistantData.department
            })
            .eq('id', assistantProfile.id);
          roleProfileId = assistantProfile.id;
        }
      }

      userIds[user.email] = {
        userId,
        profileId: profile.id,
        roleProfileId
      };

      console.log(`  ✓ ${user.email} created`);

    } catch (error) {
      console.error(`  Error with ${user.email}:`, error);
    }
  }

  console.log('\n');
}

async function seedAdditionalSpecializations() {
  console.log('Seeding additional specializations...\n');

  for (const spec of additionalSpecializations) {
    const { data: existing } = await supabase
      .from('specializations')
      .select('id')
      .eq('name_en', spec.name_en)
      .single();

    if (existing) {
      console.log(`  ✓ ${spec.name_en} (already exists)`);
      continue;
    }

    const { error } = await supabase.from('specializations').insert(spec);
    if (error) {
      console.error(`  Error: ${spec.name_en} - ${error.message}`);
    } else {
      console.log(`  ✓ ${spec.name_en}`);
    }
  }

  console.log('\n');
}

async function linkNewDoctorSpecializations() {
  console.log('Linking new doctor specializations...\n');

  const { data: specs } = await supabase.from('specializations').select('id, name_en');
  if (!specs) return;

  const specMap = new Map(specs.map(s => [s.name_en, s.id]));

  const doctorSpecs = [
    { email: 'doctor3@tawari.test', specs: [{ name: 'General Practice', primary: true }] },
    { email: 'doctor4@tawari.test', specs: [{ name: 'Pediatrics', primary: true }] },
    { email: 'doctor5@tawari.test', specs: [{ name: 'Internal Medicine', primary: true }, { name: 'Endocrinology', primary: false }] },
    { email: 'doctor6@tawari.test', specs: [{ name: 'Psychiatry', primary: true }] },
  ];

  for (const doc of doctorSpecs) {
    const ids = userIds[doc.email];
    if (!ids?.roleProfileId) continue;

    for (const spec of doc.specs) {
      const specId = specMap.get(spec.name);
      if (!specId) continue;

      const { data: existing } = await supabase
        .from('doctor_specializations')
        .select('id')
        .eq('doctor_profile_id', ids.roleProfileId)
        .eq('specialization_id', specId)
        .single();

      if (existing) continue;

      await supabase.from('doctor_specializations').insert({
        doctor_profile_id: ids.roleProfileId,
        specialization_id: specId,
        is_primary: spec.primary
      });
    }

    console.log(`  ✓ ${doc.email}`);
  }

  console.log('\n');
}

async function seedDoctorAvailability() {
  console.log('Seeding doctor availability for new doctors...\n');

  // Dr. Sara: Sun-Thu 8AM-4PM
  const doctor3 = userIds['doctor3@tawari.test'];
  if (doctor3?.roleProfileId) {
    for (const day of [0, 1, 2, 3, 4]) {
      const { data: existing } = await supabase
        .from('doctor_availability')
        .select('id')
        .eq('doctor_profile_id', doctor3.roleProfileId)
        .eq('day_of_week', day)
        .single();

      if (!existing) {
        await supabase.from('doctor_availability').insert({
          doctor_profile_id: doctor3.roleProfileId,
          day_of_week: day,
          start_time: '08:00',
          end_time: '16:00',
          is_active: true
        });
      }
    }
    console.log('  ✓ Dr. Sara: Sun-Thu 8AM-4PM');
  }

  // Dr. Layla: Sat-Wed 10AM-6PM
  const doctor5 = userIds['doctor5@tawari.test'];
  if (doctor5?.roleProfileId) {
    for (const day of [6, 0, 1, 2, 3]) {
      const { data: existing } = await supabase
        .from('doctor_availability')
        .select('id')
        .eq('doctor_profile_id', doctor5.roleProfileId)
        .eq('day_of_week', day)
        .single();

      if (!existing) {
        await supabase.from('doctor_availability').insert({
          doctor_profile_id: doctor5.roleProfileId,
          day_of_week: day,
          start_time: '10:00',
          end_time: '18:00',
          is_active: true
        });
      }
    }
    console.log('  ✓ Dr. Layla: Sat-Wed 10AM-6PM');
  }

  console.log('\n');
}

async function seedDoctorAssistantAssignment() {
  console.log('Seeding doctor assistant assignment...\n');

  const assistant = userIds['assistant1@tawari.test'];
  const doctor1 = userIds['doctor1@tawari.test'];

  if (assistant?.roleProfileId && doctor1?.roleProfileId) {
    const { data: existing } = await supabase
      .from('doctor_assistant_assignments')
      .select('id')
      .eq('doctor_profile_id', doctor1.roleProfileId)
      .eq('assistant_profile_id', assistant.roleProfileId)
      .single();

    if (!existing) {
      await supabase.from('doctor_assistant_assignments').insert({
        doctor_profile_id: doctor1.roleProfileId,
        assistant_profile_id: assistant.roleProfileId,
        status: 'active',
        can_manage_availability: true,
        can_reschedule_appointments: true,
        can_view_patient_records: true,
        can_send_messages: true,
        can_observe_consultations: false,
        invited_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        accepted_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString() // 29 days ago
      });
      console.log('  ✓ Heba assigned to Dr. Mohamed');
    } else {
      console.log('  ✓ Assignment already exists');
    }
  }

  console.log('\n');
}

async function runSqlSeedFile() {
  console.log('Running SQL seed file...\n');

  const sqlPath = path.join(__dirname, 'seed-comprehensive-demo.sql');

  if (!fs.existsSync(sqlPath)) {
    console.log('  SQL seed file not found, skipping SQL seeding.');
    console.log('  Create scripts/seed-comprehensive-demo.sql for additional data.\n');
    return;
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Replace placeholders with actual UUIDs
  let processedSql = sql;

  for (const [email, ids] of Object.entries(userIds)) {
    const placeholder = email.replace('@', '_').replace('.', '_').toUpperCase();
    processedSql = processedSql.replace(new RegExp(`\\$\\{${placeholder}_PROFILE_ID\\}`, 'g'), ids.profileId);
    processedSql = processedSql.replace(new RegExp(`\\$\\{${placeholder}_ROLE_PROFILE_ID\\}`, 'g'), ids.roleProfileId);
    processedSql = processedSql.replace(new RegExp(`\\$\\{${placeholder}_USER_ID\\}`, 'g'), ids.userId);
  }

  // Split SQL into individual statements and execute
  const statements = processedSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      if (error) {
        // Try direct query for simple statements
        const { error: directError } = await supabase.from('_temp').select('*').limit(0);
        if (directError) {
          errorCount++;
        }
      } else {
        successCount++;
      }
    } catch {
      // Ignore errors for now, SQL will be run manually
    }
  }

  console.log(`  Executed ${successCount} statements with ${errorCount} errors`);
  console.log(`  Processed ${statements.length} SQL statements`);
  console.log(`  Note: Run the SQL file directly in Supabase SQL Editor for best results\n`);
}

async function printSummary() {
  console.log('\n========================================');
  console.log('COMPREHENSIVE DEMO SEEDING COMPLETE');
  console.log('========================================\n');

  console.log('Created/Updated Users:');
  console.log('----------------------------------------');

  for (const [email, ids] of Object.entries(userIds)) {
    console.log(`${email}`);
    console.log(`  profile_id: ${ids.profileId}`);
    console.log(`  role_profile_id: ${ids.roleProfileId}`);
    console.log('');
  }

  console.log('\nNEXT STEPS:');
  console.log('----------------------------------------');
  console.log('1. Run the SQL seed file in Supabase SQL Editor:');
  console.log('   scripts/seed-comprehensive-demo.sql');
  console.log('');
  console.log('2. Test logins:');
  console.log('   - patient3@tawari.test / TawariPatient3!2024');
  console.log('   - doctor3@tawari.test / TawariDoctor3!2024');
  console.log('   - assistant1@tawari.test / TawariAssistant1!2024');
  console.log('');
}

async function main() {
  try {
    // Step 1: Get existing user IDs
    await getExistingUserIds();

    // Step 2: Create new users
    await createNewUsers();

    // Step 3: Seed additional specializations
    await seedAdditionalSpecializations();

    // Step 4: Link new doctors to specializations
    await linkNewDoctorSpecializations();

    // Step 5: Seed doctor availability
    await seedDoctorAvailability();

    // Step 6: Seed doctor assistant assignment
    await seedDoctorAssistantAssignment();

    // Step 7: Try to run SQL seed file (optional)
    await runSqlSeedFile();

    // Print summary
    await printSummary();

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
