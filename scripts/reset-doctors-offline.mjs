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

if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetAllDoctorsOffline() {
    console.log('Resetting all doctors to OFFLINE...\n');

    // Get current online doctors
    const { data: onlineDoctors, error: fetchError } = await supabase
        .from('doctor_profiles')
        .select(`
            id,
            profiles!doctor_profiles_profile_id_fkey (full_name)
        `)
        .eq('is_online', true);

    if (fetchError) {
        console.error('Error fetching doctors:', fetchError.message);
        return;
    }

    if (!onlineDoctors || onlineDoctors.length === 0) {
        console.log('✅ No doctors are currently online. Nothing to reset.');
        return;
    }

    console.log(`Found ${onlineDoctors.length} online doctor(s):`);
    onlineDoctors.forEach(d => {
        console.log(`  - ${d.profiles?.full_name || 'Unknown'}`);
    });

    // Reset all to offline (both is_online and is_available_now)
    const { error } = await supabase
        .from('doctor_profiles')
        .update({
            is_online: false,
            is_available_now: false,
            went_online_at: null
        })
        .eq('is_online', true);

    if (error) {
        console.error('\n❌ Error:', error.message);
        return;
    }

    // Verify
    const { data: verifyData } = await supabase
        .from('doctor_profiles')
        .select('id, is_online')
        .in('id', onlineDoctors.map(d => d.id));

    const stillOnline = verifyData?.filter(d => d.is_online).length || 0;

    if (stillOnline === 0) {
        console.log('\n✅ All doctors have been set to OFFLINE');
    } else {
        console.log(`\n⚠️ ${stillOnline} doctor(s) are still online`);
    }
}

resetAllDoctorsOffline();
