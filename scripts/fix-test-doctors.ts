/**
 * TawariApp Fix Test Doctors Script
 *
 * This script adds missing specializations and availability data for existing test doctors.
 * Run this after the test users have been created.
 *
 * USAGE:
 * npx tsx scripts/fix-test-doctors.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('Fixing test doctors data...\n');

  // 1. Ensure specializations exist
  console.log('1. Checking specializations...');
  const specializations = [
    { name_en: 'Cardiology', name_ar: 'أمراض القلب', category: 'specialist', min_fee: 200.00, max_fee: 500.00 },
    { name_en: 'Dermatology', name_ar: 'الأمراض الجلدية', category: 'specialist', min_fee: 150.00, max_fee: 400.00 },
    { name_en: 'General Practice', name_ar: 'الطب العام', category: 'general', min_fee: 100.00, max_fee: 250.00 },
    { name_en: 'Pediatrics', name_ar: 'طب الأطفال', category: 'specialist', min_fee: 150.00, max_fee: 350.00 },
    { name_en: 'Internal Medicine', name_ar: 'الطب الباطني', category: 'specialist', min_fee: 180.00, max_fee: 450.00 },
  ];

  for (const spec of specializations) {
    const { data: existing } = await supabase
      .from('specializations')
      .select('id')
      .eq('name_en', spec.name_en)
      .single();

    if (!existing) {
      const { error } = await supabase.from('specializations').insert(spec);
      if (error) {
        console.error(`  Error inserting ${spec.name_en}: ${error.message}`);
      } else {
        console.log(`  ✓ Added ${spec.name_en}`);
      }
    } else {
      console.log(`  ✓ ${spec.name_en} exists`);
    }
  }

  // 2. Get doctor profiles by email
  console.log('\n2. Finding doctor profiles...');

  const doctorEmails = ['doctor1@tawari.test', 'doctor2@tawari.test'];
  const doctors: { email: string; profileId: string; doctorProfileId: string }[] = [];

  for (const email of doctorEmails) {
    // Find user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users.find(u => u.email === email);

    if (!user) {
      console.log(`  ✗ ${email} not found`);
      continue;
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      console.log(`  ✗ Profile not found for ${email}`);
      continue;
    }

    // Get doctor_profile
    const { data: doctorProfile } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!doctorProfile) {
      console.log(`  ✗ Doctor profile not found for ${email}`);
      continue;
    }

    doctors.push({
      email,
      profileId: profile.id,
      doctorProfileId: doctorProfile.id
    });
    console.log(`  ✓ Found ${email}: doctor_profile_id = ${doctorProfile.id}`);
  }

  if (doctors.length === 0) {
    console.log('\nNo doctors found. Please run the seed script first.');
    return;
  }

  // 3. Get specialization IDs
  console.log('\n3. Getting specialization IDs...');
  const { data: specs } = await supabase.from('specializations').select('id, name_en');
  if (!specs) {
    console.error('  Could not fetch specializations');
    return;
  }
  const specMap = new Map(specs.map(s => [s.name_en, s.id]));
  console.log(`  Found ${specs.length} specializations`);

  // 4. Link doctor specializations
  console.log('\n4. Linking doctor specializations...');

  const doctor1 = doctors.find(d => d.email === 'doctor1@tawari.test');
  const doctor2 = doctors.find(d => d.email === 'doctor2@tawari.test');

  async function linkSpec(doctorProfileId: string, specName: string, isPrimary: boolean, doctorName: string) {
    const specId = specMap.get(specName);
    if (!specId) {
      console.log(`  ✗ Specialization not found: ${specName}`);
      return;
    }

    const { data: existing } = await supabase
      .from('doctor_specializations')
      .select('id')
      .eq('doctor_profile_id', doctorProfileId)
      .eq('specialization_id', specId)
      .single();

    if (existing) {
      console.log(`  ✓ ${doctorName}: ${specName} (already linked)`);
      return;
    }

    const { error } = await supabase
      .from('doctor_specializations')
      .insert({ doctor_profile_id: doctorProfileId, specialization_id: specId, is_primary: isPrimary });

    if (error) {
      console.error(`  ✗ Error linking ${doctorName} to ${specName}: ${error.message}`);
    } else {
      console.log(`  ✓ ${doctorName}: ${specName}${isPrimary ? ' (primary)' : ''}`);
    }
  }

  if (doctor1) {
    await linkSpec(doctor1.doctorProfileId, 'Cardiology', true, 'Dr. Mohamed');
    await linkSpec(doctor1.doctorProfileId, 'Internal Medicine', false, 'Dr. Mohamed');
  }

  if (doctor2) {
    await linkSpec(doctor2.doctorProfileId, 'Dermatology', true, 'Dr. Nour');
  }

  // 5. Add doctor availability
  console.log('\n5. Adding doctor availability...');

  async function addAvailability(doctorProfileId: string, day: number, startTime: string, endTime: string) {
    const { data: existing } = await supabase
      .from('doctor_availability')
      .select('id, start_time, end_time')
      .eq('doctor_profile_id', doctorProfileId)
      .eq('day_of_week', day)
      .single();

    if (existing) {
      // Update existing entry to 24/7 if not already
      if (existing.start_time !== startTime || existing.end_time !== endTime) {
        await supabase
          .from('doctor_availability')
          .update({ start_time: startTime, end_time: endTime, is_active: true })
          .eq('id', existing.id);
        return 'updated';
      }
      return 'exists';
    }

    const { error } = await supabase
      .from('doctor_availability')
      .insert({
        doctor_profile_id: doctorProfileId,
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        is_active: true
      });

    return error ? 'error' : 'added';
  }

  // Both doctors available 24/7 (all 7 days)
  const allDays = [0, 1, 2, 3, 4, 5, 6]; // Sunday=0 through Saturday=6

  if (doctor1) {
    let added = 0, existed = 0, updated = 0;
    for (const day of allDays) {
      const result = await addAvailability(doctor1.doctorProfileId, day, '00:00', '23:59');
      if (result === 'added') added++;
      if (result === 'exists') existed++;
      if (result === 'updated') updated++;
    }
    console.log(`  ✓ Dr. Mohamed: 24/7 availability (${added} added, ${updated} updated, ${existed} existed)`);
  }

  if (doctor2) {
    let added = 0, existed = 0, updated = 0;
    for (const day of allDays) {
      const result = await addAvailability(doctor2.doctorProfileId, day, '00:00', '23:59');
      if (result === 'added') added++;
      if (result === 'exists') existed++;
      if (result === 'updated') updated++;
    }
    console.log(`  ✓ Dr. Nour: 24/7 availability (${added} added, ${updated} updated, ${existed} existed)`);
  }

  // 6. Verify doctors are verified and set is_available_now = true
  console.log('\n6. Verifying doctor verification status and availability...');
  for (const doc of doctors) {
    const { data: dp } = await supabase
      .from('doctor_profiles')
      .select('verification_status, is_available_now')
      .eq('id', doc.doctorProfileId)
      .single();

    const updates: Record<string, unknown> = {};

    if (dp?.verification_status !== 'verified') {
      updates.verification_status = 'verified';
      updates.verified_at = new Date().toISOString();
    }

    if (!dp?.is_available_now) {
      updates.is_available_now = true;
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('doctor_profiles')
        .update(updates)
        .eq('id', doc.doctorProfileId);
      console.log(`  ✓ ${doc.email}: updated (verified: true, is_available_now: true)`);
    } else {
      console.log(`  ✓ ${doc.email}: already verified and available`);
    }
  }

  console.log('\n========================================');
  console.log('DONE! Doctors should now be visible.');
  console.log('========================================');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
