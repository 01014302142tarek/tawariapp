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
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDoctorProfiles() {
    console.log('Checking doctor profiles with full data...\n');

    // Get all doctors with their profile info
    const { data, error } = await supabase
        .from('doctor_profiles')
        .select(`
            id,
            is_online,
            verification_status,
            consultation_fee,
            profile_id,
            profiles!doctor_profiles_profile_id_fkey (
                id,
                full_name,
                avatar_url,
                role
            )
        `);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Found ${data?.length || 0} doctors:\n`);

    data?.forEach((d, i) => {
        const status = d.is_online ? '🟢 ONLINE' : '🔴 OFFLINE';
        const name = d.profiles?.full_name || '❌ NO NAME';
        const avatar = d.profiles?.avatar_url;
        const avatarStatus = avatar && avatar.trim() !== '' ? '✅ Has avatar' : '❌ No avatar';

        console.log(`${i + 1}. ${name}`);
        console.log(`   Status: ${status}`);
        console.log(`   Verification: ${d.verification_status}`);
        console.log(`   Fee: ${d.consultation_fee || 'Not set'} EGP`);
        console.log(`   Avatar: ${avatarStatus}`);
        if (avatar) {
            console.log(`   Avatar URL: ${avatar.substring(0, 50)}...`);
        }
        console.log(`   Profile ID: ${d.profile_id}`);
        console.log(`   Doctor Profile ID: ${d.id}`);
        console.log('');
    });
}

checkDoctorProfiles();
