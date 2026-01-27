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

async function debugDoctorQueue() {
    console.log('='.repeat(60));
    console.log('DEBUG: DOCTOR QUEUE STATUS');
    console.log('='.repeat(60));
    console.log('');

    // Get Dr. Hassan's profile
    const { data: doctorProfile, error: doctorError } = await supabase
        .from('doctor_profiles')
        .select(`
            id,
            is_online,
            current_queue_entry_id,
            profiles!doctor_profiles_profile_id_fkey (
                full_name
            )
        `)
        .eq('verification_status', 'verified')
        .eq('is_online', true);

    console.log('1. ONLINE DOCTORS:');
    if (doctorError) {
        console.log('   Error:', doctorError.message);
    } else if (!doctorProfile || doctorProfile.length === 0) {
        console.log('   ❌ No doctors online');
    } else {
        doctorProfile.forEach(d => {
            console.log(`   ✅ ${d.profiles?.full_name} (ID: ${d.id})`);
            console.log(`      is_online: ${d.is_online}`);
            console.log(`      current_queue_entry_id: ${d.current_queue_entry_id || 'null'}`);
        });
    }
    console.log('');

    // Get all queue entries with status "waiting"
    const { data: waitingQueue, error: queueError } = await supabase
        .from('consultation_queue')
        .select(`
            id,
            status,
            position,
            doctor_profile_id,
            patient_profile_id,
            joined_at,
            patient_profiles!inner (
                id,
                profiles (
                    full_name
                )
            )
        `)
        .eq('status', 'waiting')
        .order('joined_at', { ascending: true });

    console.log('2. WAITING QUEUE ENTRIES:');
    if (queueError) {
        console.log('   Error:', queueError.message);
    } else if (!waitingQueue || waitingQueue.length === 0) {
        console.log('   ❌ No patients waiting');
    } else {
        waitingQueue.forEach((e, i) => {
            console.log(`   ${i + 1}. Queue Entry ID: ${e.id}`);
            console.log(`      Patient: ${e.patient_profiles?.profiles?.full_name || 'Unknown'}`);
            console.log(`      Doctor Profile ID: ${e.doctor_profile_id}`);
            console.log(`      Status: ${e.status}`);
            console.log(`      Position: ${e.position}`);
            console.log(`      Joined: ${new Date(e.joined_at).toLocaleString()}`);
        });
    }
    console.log('');

    // Get all active queue entries (any status except completed/cancelled)
    const { data: allActive, error: activeError } = await supabase
        .from('consultation_queue')
        .select('id, status, doctor_profile_id, patient_profile_id')
        .not('status', 'in', '("completed","cancelled","expired")')
        .order('joined_at', { ascending: false });

    console.log('3. ALL ACTIVE QUEUE ENTRIES (not completed/cancelled):');
    if (activeError) {
        console.log('   Error:', activeError.message);
    } else if (!allActive || allActive.length === 0) {
        console.log('   ❌ No active entries');
    } else {
        allActive.forEach((e, i) => {
            console.log(`   ${i + 1}. ID: ${e.id}, Status: ${e.status}, Doctor: ${e.doctor_profile_id}`);
        });
    }
}

debugDoctorQueue();
