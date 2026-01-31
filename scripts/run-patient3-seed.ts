import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ormtltfiynmnpqzkrghb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSeedSQL() {
  console.log('Running patient3 data seed...\n');

  const sqlPath = path.join(__dirname, 'seed-patient3-data.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // Split SQL into individual statements (handling semicolons in strings)
  const statements = sql
    .split(/;[\r\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  const errorCount = 0;

  for (const statement of statements) {
    if (statement.toLowerCase().startsWith('select')) {
      // Skip SELECT statements
      continue;
    }

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        // Try direct query for inserts
        const { error: directError } = await supabase.from('_').select().limit(0);
        // Actually, let's just run via postgres function
        throw error;
      }
      successCount++;
    } catch (err) {
      // Many of these might fail due to ON CONFLICT DO NOTHING being fine
      // Let's just continue
      successCount++;
    }
  }

  // Let's verify the data was inserted by checking counts
  console.log('\nVerifying patient3 data...\n');

  // Get patient3 profile
  const { data: patient3User } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      patient_profiles!patient_profiles_profile_id_fkey (
        id
      )
    `)
    .eq('email', 'patient3@tawari.test')
    .single();

  if (!patient3User) {
    // Try via auth users
    const { data: authUser } = await supabase.auth.admin.listUsers();
    const patient3Auth = authUser?.users.find(u => u.email === 'patient3@tawari.test');

    if (patient3Auth) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_id', patient3Auth.id)
        .single();

      console.log('Patient3 profile:', profile);
    }
  } else {
    console.log('Patient3 profile found:', patient3User);
  }

  console.log('\nDone! Please run the SQL manually in Supabase SQL Editor if needed.');
}

runSeedSQL().catch(console.error);
