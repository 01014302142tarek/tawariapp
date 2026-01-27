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

async function resetConsultation() {
    console.log('Resetting active consultations...\n');

    // Get all active entries
    const { data: active } = await supabase
        .from('consultation_queue')
        .select('id, status')
        .in('status', ['waiting', 'called', 'in_consultation']);

    if (!active || active.length === 0) {
        console.log('No active consultations to reset.');
        return;
    }

    console.log(`Found ${active.length} active entries. Marking as cancelled...`);

    // Mark them as cancelled
    const { error } = await supabase
        .from('consultation_queue')
        .update({ status: 'cancelled' })
        .in('status', ['waiting', 'called', 'in_consultation']);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('✅ All active consultations have been cancelled.');
        console.log('\nYou can now test the full flow:');
        console.log('1. Doctor goes online');
        console.log('2. Patient joins queue');
        console.log('3. Doctor calls patient');
        console.log('4. Doctor starts video call');
        console.log('5. Patient should be redirected to call page');
    }
}

resetConsultation();
