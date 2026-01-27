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

// Dr. Hassan Mahmoud's user_id from the database check
const DR_HASSAN_USER_ID = '70221aba-b6a9-4b29-9813-ba76b6f0d825';

async function testProfileLoad() {
    console.log('='.repeat(60));
    console.log('TESTING PROFILE LOAD FOR DR. HASSAN MAHMOUD');
    console.log('='.repeat(60));
    console.log('');

    // Step 1: Check auth.users for user_metadata
    console.log('1. Checking auth.users metadata...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(DR_HASSAN_USER_ID);

    if (authError) {
        console.log('   Error fetching auth user:', authError.message);
    } else {
        console.log('   User ID:', authUser.user?.id);
        console.log('   Email:', authUser.user?.email);
        console.log('   user_metadata.role:', authUser.user?.user_metadata?.role || '❌ NOT SET');
        console.log('   user_metadata.fullName:', authUser.user?.user_metadata?.fullName || '❌ NOT SET');
    }
    console.log('');

    // Step 2: Check profiles table
    console.log('2. Checking profiles table...');
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', DR_HASSAN_USER_ID)
        .single();

    if (profileError) {
        console.log('   Error fetching profile:', profileError.message);
    } else {
        console.log('   Profile ID:', profile.id);
        console.log('   full_name:', profile.full_name || '❌ EMPTY');
        console.log('   avatar_url:', profile.avatar_url ? '✅ Present' : '❌ EMPTY');
        console.log('   role:', profile.role);
    }
    console.log('');

    // Step 3: Simulate getCurrentUserProfile logic
    console.log('3. Simulating getCurrentUserProfile...');
    const userRole = authUser.user?.user_metadata?.role;
    console.log('   user_metadata.role =', userRole || 'undefined');

    if (userRole === 'doctor') {
        console.log('   → Taking optimized path (role in metadata)');
        // Must specify FK because doctor_profiles has two FKs to profiles
        const { data, error } = await supabase
            .from('profiles')
            .select('*, doctor_profiles!doctor_profiles_profile_id_fkey(*)')
            .eq('user_id', DR_HASSAN_USER_ID)
            .single();

        if (error) {
            console.log('   Error:', error.message);
        } else {
            console.log('   Result:', JSON.stringify(data, null, 2));
        }
    } else {
        console.log('   → Taking fallback path (role not in metadata)');
        // This is what happens when user_metadata.role is not set
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', DR_HASSAN_USER_ID)
            .single();

        console.log('   Profile from DB:');
        console.log('     full_name:', profileData?.full_name || '❌ EMPTY');
        console.log('     avatar_url:', profileData?.avatar_url ? '✅ Present' : '❌ EMPTY');
        console.log('     role:', profileData?.role);

        if (profileData?.role === 'doctor') {
            const { data: doctorData } = await supabase
                .from('doctor_profiles')
                .select('*')
                .eq('profile_id', profileData.id)
                .single();

            console.log('   Doctor profile loaded:', doctorData ? '✅ Yes' : '❌ No');
        }

        // This is what would be returned
        console.log('');
        console.log('   Final result that would be returned:');
        console.log('   { profile: { full_name:', profileData?.full_name, ', avatar_url:', profileData?.avatar_url ? 'present' : 'null', '} }');
    }
}

testProfileLoad();
