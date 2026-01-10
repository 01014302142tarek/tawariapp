/**
 * One-time migration script to sync user roles from profiles table to user_metadata
 *
 * This fixes existing users who were created before user_metadata.role was set during signup.
 * After running this, all users should have their role in user_metadata, which the middleware
 * uses for role-based dashboard redirects.
 *
 * USAGE:
 * npx tsx scripts/fix-user-metadata.ts
 *
 * This script is idempotent - safe to run multiple times.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables.');
    console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function fixUserMetadata() {
    console.log('Syncing user roles from profiles to user_metadata...\n');

    // Get all users
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError.message);
        process.exit(1);
    }

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const authUser of authUsers.users) {
        // Skip if user already has role in metadata
        if (authUser.user_metadata?.role) {
            console.log(`  ✓ ${authUser.email} - already has role: ${authUser.user_metadata.role}`);
            skipped++;
            continue;
        }

        // Get role from profiles table
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('user_id', authUser.id)
            .single();

        if (profileError || !profileData) {
            console.log(`  ⚠ ${authUser.email} - no profile found`);
            skipped++;
            continue;
        }

        // Update user_metadata with role
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            authUser.id,
            {
                user_metadata: {
                    ...authUser.user_metadata,
                    role: profileData.role,
                    full_name: profileData.full_name || authUser.user_metadata?.full_name
                }
            }
        );

        if (updateError) {
            console.error(`  ✗ ${authUser.email} - error: ${updateError.message}`);
            errors++;
        } else {
            console.log(`  ✓ ${authUser.email} - updated role to: ${profileData.role}`);
            updated++;
        }
    }

    console.log('\n========================================');
    console.log('MIGRATION COMPLETE');
    console.log('========================================');
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped: ${skipped} (already had role or no profile)`);
    console.log(`  Errors:  ${errors}`);
}

fixUserMetadata()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
