import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function searchUser(searchEmail: string) {
  console.log(`\n🔍 Searching for user with email containing: ${searchEmail}`);

  try {
    // Search in auth.users
    console.log('\n--- Auth Users ---');
    const { data: users } = await supabase.auth.admin.listUsers();
    const matchingAuthUsers = users?.users.filter((u) =>
      u.email?.toLowerCase().includes(searchEmail.toLowerCase())
    );

    if (matchingAuthUsers && matchingAuthUsers.length > 0) {
      matchingAuthUsers.forEach((user) => {
        console.log(`  ✓ ${user.email} (ID: ${user.id}, Created: ${user.created_at})`);
      });
    } else {
      console.log('  No matching users found in auth.users');
    }

    // Search in profiles
    console.log('\n--- Profiles ---');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', `%${searchEmail}%`);

    if (profiles && profiles.length > 0) {
      profiles.forEach((profile) => {
        console.log(`  ✓ ${profile.email} (ID: ${profile.id})`);
        console.log(`    Name: ${profile.full_name || 'N/A'}`);
        console.log(`    Role: ${profile.role || 'N/A'}`);
        console.log(`    Phone: ${profile.phone_number || 'N/A'}`);
      });
    } else {
      console.log('  No matching profiles found');
    }

    // Also list all users if search is empty
    if (!searchEmail || searchEmail.trim() === '') {
      console.log('\n--- All Users (first 20) ---');
      const { data: allUsers } = await supabase.auth.admin.listUsers();
      allUsers?.users.slice(0, 20).forEach((user) => {
        console.log(`  ${user.email} (ID: ${user.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

const searchTerm = process.argv[2] || 'Abanoub';

searchUser(searchTerm)
  .then(() => {
    console.log('\n✓ Search completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
