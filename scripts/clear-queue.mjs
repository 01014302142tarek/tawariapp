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

async function clearQueue() {
    console.log('Clearing all non-completed queue entries...\n');

    // Cancel all waiting and in_consultation entries
    const { data, error } = await supabase
        .from('consultation_queue')
        .update({ status: 'cancelled' })
        .in('status', ['waiting', 'called', 'in_consultation'])
        .select('id');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`✅ Cancelled ${data?.length || 0} queue entries`);
    console.log('\nPatients can now join the queue fresh.');
}

clearQueue();
