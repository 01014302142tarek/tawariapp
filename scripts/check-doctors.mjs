import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ormtltfiynmnpqzkrghb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybXRsdGZpeW5tbnBxemtyZ2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDkxOTgsImV4cCI6MjA4MzI4NTE5OH0.aId9b4Y_8ydnMMBevU4XMKcDsRhq9ChHqncomfx7w74';

const supabase = createClient(supabaseUrl, supabaseKey);

// Store doctor names for real-time updates
const doctorNames = {};

async function fetchDoctors() {
    const { data, error } = await supabase
        .from('doctor_profiles')
        .select(`
            id,
            is_online,
            verification_status,
            consultation_fee,
            went_online_at,
            profiles!doctor_profiles_profile_id_fkey (
                full_name
            )
        `);

    if (error) {
        console.error('Error:', error.message);
        return null;
    }

    // Cache doctor names
    data?.forEach(d => {
        doctorNames[d.id] = d.profiles?.full_name || 'Unknown';
    });

    return data;
}

function printReport(data) {
    console.clear();
    console.log('='.repeat(60));
    console.log('           DOCTOR STATUS REPORT (LIVE)');
    console.log('='.repeat(60));
    console.log(`Last updated: ${new Date().toLocaleTimeString()}`);
    console.log('');

    // Sort: online first, then by name
    const sorted = data?.sort((a, b) => {
        if (a.is_online && !b.is_online) return -1;
        if (!a.is_online && b.is_online) return 1;
        return (a.profiles?.full_name || '').localeCompare(b.profiles?.full_name || '');
    });

    sorted?.forEach((d, i) => {
        const status = d.is_online ? '🟢 ONLINE' : '🔴 OFFLINE';
        const verified = d.verification_status === 'verified' ? '✓ Verified' : `⚠ ${d.verification_status}`;
        const fee = d.consultation_fee ? `${d.consultation_fee} EGP` : 'No fee set';
        const onlineSince = d.went_online_at ? new Date(d.went_online_at).toLocaleTimeString() : 'N/A';

        console.log(`${i + 1}. ${d.profiles?.full_name || 'Unknown'}`);
        console.log(`   Status: ${status}`);
        console.log(`   Verification: ${verified}`);
        console.log(`   Fee: ${fee}`);
        if (d.is_online) {
            console.log(`   Online Since: ${onlineSince}`);
        }
        console.log('');
    });

    // Summary
    const online = data?.filter(d => d.is_online) || [];
    const verified = data?.filter(d => d.verification_status === 'verified') || [];
    const onlineAndVerified = data?.filter(d => d.is_online && d.verification_status === 'verified') || [];

    console.log('-'.repeat(60));
    console.log('SUMMARY:');
    console.log(`  🟢 Online doctors: ${online.length}`);
    console.log(`  ✓  Verified doctors: ${verified.length}`);
    console.log(`  ✅ Online AND Verified (visible to patients): ${onlineAndVerified.length}`);
    console.log('-'.repeat(60));
    console.log('\n👀 Watching for changes... (Press Ctrl+C to stop)\n');
}

async function watchDoctors() {
    // Initial fetch
    let data = await fetchDoctors();
    if (!data) return;

    printReport(data);

    // Subscribe to real-time changes
    const channel = supabase
        .channel('doctor-status-changes')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'doctor_profiles',
            },
            async (payload) => {
                const updated = payload.new;
                const doctorName = doctorNames[updated.id] || 'Unknown';
                const status = updated.is_online ? '🟢 ONLINE' : '�� OFFLINE';

                console.log(`\n⚡ STATUS CHANGE: ${doctorName} is now ${status}`);
                console.log(`   Time: ${new Date().toLocaleTimeString()}`);

                // Refresh full report
                data = await fetchDoctors();
                if (data) {
                    setTimeout(() => printReport(data), 500);
                }
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Connected to real-time updates\n');
            }
        });

    // Keep the script running
    process.on('SIGINT', () => {
        console.log('\n\nDisconnecting...');
        supabase.removeChannel(channel);
        process.exit(0);
    });
}

// Check command line args
const args = process.argv.slice(2);
if (args.includes('--watch') || args.includes('-w')) {
    watchDoctors();
} else {
    // One-time check
    fetchDoctors().then(data => {
        if (data) {
            console.log('='.repeat(60));
            console.log('           DOCTOR STATUS REPORT');
            console.log('='.repeat(60));
            console.log('');

            const sorted = data.sort((a, b) => {
                if (a.is_online && !b.is_online) return -1;
                if (!a.is_online && b.is_online) return 1;
                return (a.profiles?.full_name || '').localeCompare(b.profiles?.full_name || '');
            });

            sorted.forEach((d, i) => {
                const status = d.is_online ? '🟢 ONLINE' : '🔴 OFFLINE';
                const verified = d.verification_status === 'verified' ? '✓ Verified' : `⚠ ${d.verification_status}`;
                const fee = d.consultation_fee ? `${d.consultation_fee} EGP` : 'No fee set';

                console.log(`${i + 1}. ${d.profiles?.full_name || 'Unknown'}`);
                console.log(`   Status: ${status}`);
                console.log(`   Verification: ${verified}`);
                console.log(`   Fee: ${fee}`);
                console.log('');
            });

            const online = data.filter(d => d.is_online);
            const onlineAndVerified = data.filter(d => d.is_online && d.verification_status === 'verified');

            console.log('-'.repeat(60));
            console.log('SUMMARY:');
            console.log(`  🟢 Online doctors: ${online.length}`);
            console.log(`  ✅ Online AND Verified (visible to patients): ${onlineAndVerified.length}`);
            console.log('-'.repeat(60));
            console.log('\nTip: Run with --watch flag to see live updates:');
            console.log('  node scripts/check-doctors.mjs --watch');
        }
    });
}
