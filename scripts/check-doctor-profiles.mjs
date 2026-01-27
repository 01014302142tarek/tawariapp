import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=["']?(.*?)["']?$/);
    if (match) {
        envVars[match[1].trim()] = match[2].replace(/["']$/, '');
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_TawariAppSUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDoctorProfiles() {
    console.log('='.repeat(60));
    console.log('DOCTOR PROFILE DATA CHECK');
    console.log('='.repeat(60));
    console.log('');

    // Get all doctors with their profile data
    const { data: doctors, error } = await supabase
        .from('doctor_profiles')
        .select(`
            id,
            profile_id,
            verification_status,
            is_online,
            consultation_fee,
            rating_average,
            rating_count,
            profiles!doctor_profiles_profile_id_fkey (
                id,
                user_id,
                full_name,
                avatar_url,
                role
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching doctors:', error.message);
        return;
    }

    console.log(`Found ${doctors?.length || 0} doctor profiles:\n`);

    doctors?.forEach((doc, i) => {
        const profile = doc.profiles;
        const hasName = profile?.full_name && profile.full_name.trim() !== '';
        const hasAvatar = profile?.avatar_url && profile.avatar_url.trim() !== '';

        console.log(`${i + 1}. Doctor Profile ID: ${doc.id}`);
        console.log(`   Profile ID: ${doc.profile_id}`);
        console.log(`   User ID: ${profile?.user_id || '❌ MISSING'}`);
        console.log(`   Full Name: ${hasName ? `✅ ${profile.full_name}` : '❌ MISSING or EMPTY'}`);
        console.log(`   Avatar URL: ${hasAvatar ? '✅ Present' : '⚠️ Not set'}`);
        if (hasAvatar) {
            console.log(`      URL: ${profile.avatar_url.substring(0, 60)}...`);
        }
        console.log(`   Role in DB: ${profile?.role || '❌ MISSING'}`);
        console.log(`   Verification: ${doc.verification_status}`);
        console.log(`   Online: ${doc.is_online ? '🟢 Yes' : '🔴 No'}`);
        console.log(`   Fee: ${doc.consultation_fee || '⚠️ Not set'} EGP`);
        console.log(`   Rating: ${doc.rating_average || 0} (${doc.rating_count || 0} reviews)`);

        // Issues summary
        const issues = [];
        if (!hasName) issues.push('Missing name');
        if (!doc.consultation_fee || doc.consultation_fee <= 0) issues.push('Missing fee');
        if (doc.verification_status !== 'verified') issues.push('Not verified');

        if (issues.length > 0) {
            console.log(`   ⚠️ Issues: ${issues.join(', ')}`);
        } else {
            console.log(`   ✅ Ready for urgent care`);
        }
        console.log('');
    });

    // Summary
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));

    const verified = doctors?.filter(d => d.verification_status === 'verified').length || 0;
    const online = doctors?.filter(d => d.is_online).length || 0;
    const withName = doctors?.filter(d => d.profiles?.full_name?.trim()).length || 0;
    const withFee = doctors?.filter(d => d.consultation_fee > 0).length || 0;
    const readyForUrgent = doctors?.filter(d =>
        d.verification_status === 'verified' &&
        d.profiles?.full_name?.trim() &&
        d.consultation_fee > 0
    ).length || 0;

    console.log(`Total doctors: ${doctors?.length || 0}`);
    console.log(`With name set: ${withName}`);
    console.log(`With fee set: ${withFee}`);
    console.log(`Verified: ${verified}`);
    console.log(`Currently online: ${online}`);
    console.log(`Ready for urgent care: ${readyForUrgent}`);
}

checkDoctorProfiles();
