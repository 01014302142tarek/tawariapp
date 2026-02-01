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

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function deleteUserByEmail(email: string) {
  console.log(`\n🔍 Looking for user with email: ${email}`);

  try {
    // Find user by email
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      return;
    }

    const user = users?.users.find((u) => u.email === email);

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    console.log(`✓ Found user: ${user.email} (ID: ${user.id})`);

    // Check for associated data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      console.log(`  Profile: ${profile.full_name || 'N/A'} (Role: ${profile.role})`);
    }

    // Count associated records
    const { count: appointmentsCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`);

    const { count: messagesCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', user.id);

    console.log(`  Associated data:`);
    console.log(`    - Appointments: ${appointmentsCount || 0}`);
    console.log(`    - Messages: ${messagesCount || 0}`);

    // Delete the user (this should cascade to related tables)
    console.log(`\n🗑️  Deleting user...`);

    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('❌ Error deleting user:', deleteError);
      return;
    }

    console.log(`✅ Successfully deleted user: ${email}`);

    // Verify deletion
    const { data: deletedProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!deletedProfile) {
      console.log(`✓ Profile data also removed`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Get email from command line argument or use default
const emailToDelete = process.argv[2] || 'Abanoubmaher304@gmail.com';

deleteUserByEmail(emailToDelete)
  .then(() => {
    console.log('\n✓ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
