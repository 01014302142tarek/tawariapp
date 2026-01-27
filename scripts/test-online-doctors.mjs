import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=["']?(.*)["']?$/);
    if (match) {
        envVars[match[1].trim()] = match[2].replace(/["']$/, '');
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_TawariAppSUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_TawariAppSUPABASE_ANON_KEY;

// Use anon key to simulate what the app uses
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testGetOnlineDoctors() {
    console.log('Testing getOnlineDoctors query (as anon user)...\n');

    const { data, error } = await supabase
        .from('doctor_profiles')
        .select(`
            id,
            profile_id,
            consultation_fee,
            rating_average,
            rating_count,
            is_online,
            current_queue_entry_id,
            average_consultation_minutes,
            profiles!doctor_profiles_profile_id_fkey (
                full_name,
                avatar_url
            ),
            doctor_specializations (
                specializations (
                    name_en
                )
            )
        `)
        .eq('is_online', true)
        .eq('verification_status', 'verified');

    if (error) {
        console.error('❌ Query Error:', error.message);
        return;
    }

    console.log('✅ Query successful!');
    console.log(`Found ${data?.length || 0} online verified doctors:\n`);

    data?.forEach((doc, i) => {
        console.log(`${i + 1}. Doctor Profile ID: ${doc.id}`);
        console.log(`   Profile Data:`, doc.profiles);
        console.log(`   Name: ${doc.profiles?.full_name || '❌ MISSING'}`);
        console.log(`   Avatar: ${doc.profiles?.avatar_url ? '✅ Present' : '❌ Missing'}`);
        console.log(`   Fee: ${doc.consultation_fee} EGP`);
        console.log(`   Specializations:`, doc.doctor_specializations);
        console.log('');
    });
}

testGetOnlineDoctors();
