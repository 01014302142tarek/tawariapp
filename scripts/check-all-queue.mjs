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

async function checkAllQueueEntries() {
    console.log('='.repeat(60));
    console.log('ALL QUEUE ENTRIES (Last 10)');
    console.log('='.repeat(60));
    console.log('');

    // Get ALL queue entries
    const { data, error } = await supabase
        .from('consultation_queue')
        .select(`
            id,
            status,
            doctor_profile_id,
            patient_profile_id,
            joined_at,
            position,
            patient_profiles!consultation_queue_patient_profile_id_fkey (
                id,
                profiles!patient_profiles_profile_id_fkey (
                    full_name
                )
            )
        `)
        .order('joined_at', { ascending: false })
        .limit(10);

    if (error) {
        console.log('Error:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No queue entries found');
        return;
    }

    data.forEach((e, i) => {
        const patientName = e.patient_profiles?.profiles?.full_name || 'Unknown';
        console.log(`${i + 1}. Queue Entry: ${e.id}`);
        console.log(`   Status: ${e.status}`);
        console.log(`   Patient: ${patientName}`);
        console.log(`   Position: ${e.position}`);
        console.log(`   Joined: ${new Date(e.joined_at).toLocaleString()}`);
        console.log('');
    });
}

checkAllQueueEntries();
