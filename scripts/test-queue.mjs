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

async function checkQueueEntries() {
    console.log('Checking all queue entries...\n');

    const { data: queueData, error } = await supabase
        .from('consultation_queue')
        .select(`
            id,
            status,
            position,
            payment_status,
            joined_at,
            doctor_profile_id,
            patient_profile_id
        `)
        .order('joined_at', { ascending: false });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Total queue entries: ${queueData?.length || 0}\n`);

    queueData?.forEach((entry, i) => {
        console.log(`${i + 1}. Status: ${entry.status}`);
        console.log(`   Position: ${entry.position}`);
        console.log(`   Payment: ${entry.payment_status}`);
        console.log(`   Joined: ${new Date(entry.joined_at).toLocaleString()}`);
        console.log('');
    });

    // Count by status
    const statusCounts = {};
    queueData?.forEach(e => {
        statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
    });

    console.log('By status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
    });
}

checkQueueEntries();
