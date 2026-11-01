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

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || envVars.NEXT_PUBLIC_TawariAppSUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkActiveCalls() {
    console.log('='.repeat(60));
    console.log('ACTIVE CONSULTATION CHECK');
    console.log('='.repeat(60));
    console.log('');

    // Get entries that are in_consultation or called
    const { data, error } = await supabase
        .from('consultation_queue')
        .select('*')
        .in('status', ['in_consultation', 'called', 'waiting'])
        .order('joined_at', { ascending: false });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Found ${data?.length || 0} active entries:\n`);

    data?.forEach((entry, i) => {
        console.log(`${i + 1}. ID: ${entry.id}`);
        console.log(`   Status: ${entry.status}`);
        console.log(`   Position: ${entry.position}`);
        console.log(`   Payment: ${entry.payment_status}`);
        console.log(`   Daily Room Name: ${entry.daily_room_name || '❌ NOT SET'}`);
        console.log(`   Daily Room URL: ${entry.daily_room_url || '❌ NOT SET'}`);
        console.log(`   Joined: ${new Date(entry.joined_at).toLocaleString()}`);
        if (entry.called_at) {
            console.log(`   Called: ${new Date(entry.called_at).toLocaleString()}`);
        }
        if (entry.consultation_started_at) {
            console.log(`   Consultation Started: ${new Date(entry.consultation_started_at).toLocaleString()}`);
        }
        console.log('');
    });
}

checkActiveCalls();
