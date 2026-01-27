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

// The queue entry ID from the debug output
const QUEUE_ENTRY_ID = '221f4f7b-c89f-49a5-b1f6-5931eec29494';

async function testQueueEntryLookup() {
    console.log('Testing getQueueEntryForCall query...\n');
    console.log('Queue Entry ID:', QUEUE_ENTRY_ID);
    console.log('');

    // This is the same query used in getQueueEntryForCall (with FK disambiguation)
    const { data: queueData, error } = await supabase
        .from('consultation_queue')
        .select(`
            *,
            doctor_profiles!consultation_queue_doctor_profile_id_fkey (
                id,
                profiles!doctor_profiles_profile_id_fkey (
                    full_name,
                    avatar_url
                ),
                doctor_specializations (
                    specializations (
                        name_en
                    )
                )
            ),
            patient_profiles!consultation_queue_patient_profile_id_fkey (
                id,
                profiles!patient_profiles_profile_id_fkey (
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq('id', QUEUE_ENTRY_ID)
        .single();

    if (error) {
        console.log('❌ ERROR:', error.message);
        console.log('   Code:', error.code);
        console.log('   Details:', error.details);
        console.log('   Hint:', error.hint);
    } else {
        console.log('✅ SUCCESS!');
        console.log('');
        console.log('Queue Entry:');
        console.log('   ID:', queueData.id);
        console.log('   Status:', queueData.status);
        console.log('   Doctor:', queueData.doctor_profiles?.profiles?.full_name);
        console.log('   Patient:', queueData.patient_profiles?.profiles?.full_name);
        console.log('   Daily Room URL:', queueData.daily_room_url || 'NOT SET');
    }
}

testQueueEntryLookup();
