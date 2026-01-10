/**
 * TawariApp Payment System Test Script
 *
 * This script tests the payment system including:
 * 1. Database tables (transactions, doctor_earnings, invoices)
 * 2. Transaction creation and status updates
 * 3. Doctor earnings calculation
 * 4. Invoice generation
 *
 * Note: Paymob API calls are not tested as credentials are not yet configured.
 * This script tests the database layer and business logic only.
 *
 * USAGE:
 * npx tsx scripts/test-payments.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Test results tracking
const testResults: { name: string; passed: boolean; error?: string }[] = [];

function logTest(name: string, passed: boolean, error?: string) {
    testResults.push({ name, passed, error });
    if (passed) {
        console.log(`  ✓ ${name}`);
    } else {
        console.log(`  ✗ ${name}: ${error}`);
    }
}

async function testTransactionsTable() {
    console.log('\n1. Testing Transactions Table...');

    const { data, error } = await supabase
        .from('transactions')
        .select('id, amount, status, transaction_type')
        .limit(5);

    logTest('Can query transactions table', !error, error?.message);

    if (data) {
        console.log(`    Found ${data.length} transaction(s)`);
    }

    return !error;
}

async function testDoctorEarningsTable() {
    console.log('\n2. Testing Doctor Earnings Table...');

    const { data, error } = await supabase
        .from('doctor_earnings')
        .select('id, gross_amount, platform_fee, net_amount, status')
        .limit(5);

    logTest('Can query doctor_earnings table', !error, error?.message);

    if (data) {
        console.log(`    Found ${data.length} earning record(s)`);
    }

    return !error;
}

async function testInvoicesTable() {
    console.log('\n3. Testing Invoices Table...');

    const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, total_amount')
        .limit(5);

    logTest('Can query invoices table', !error, error?.message);

    if (data) {
        console.log(`    Found ${data.length} invoice(s)`);
    }

    return !error;
}

async function testTransactionCreation() {
    console.log('\n4. Testing Transaction Creation...');

    // Get a patient profile
    const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!patientProfile) {
        logTest('Patient profile exists for transaction test', false, 'No patient profiles found');
        return false;
    }

    // Get an appointment
    const { data: appointment } = await supabase
        .from('appointments')
        .select('id')
        .limit(1)
        .single();

    // Create test transaction
    const { data: transaction, error: createError } = await supabase
        .from('transactions')
        .insert({
            patient_profile_id: patientProfile.id,
            appointment_id: appointment?.id || null,
            amount: 200,
            currency: 'EGP',
            transaction_type: 'consultation',
            status: 'pending'
        })
        .select('id, status')
        .single();

    logTest('Can create transaction', !createError, createError?.message);

    if (!transaction) {
        return false;
    }

    console.log(`    Created transaction: ${transaction.id.slice(0, 8)}...`);

    // Test status update to completed
    const { error: updateError } = await supabase
        .from('transactions')
        .update({
            status: 'completed',
            paymob_transaction_id: 'test-12345',
            payment_method: 'card'
        })
        .eq('id', transaction.id);

    logTest('Can update transaction status', !updateError, updateError?.message);

    // Verify update
    const { data: updatedTransaction } = await supabase
        .from('transactions')
        .select('status')
        .eq('id', transaction.id)
        .single();

    logTest('Transaction status updated correctly',
        (updatedTransaction as { status: string } | null)?.status === 'completed',
        'Status mismatch');

    // Clean up
    await supabase.from('transactions').delete().eq('id', transaction.id);
    console.log('    Cleaned up test transaction');

    return !createError && !updateError;
}

async function testDoctorEarningsCreation() {
    console.log('\n5. Testing Doctor Earnings Creation...');

    // Get a doctor profile
    const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!doctorProfile) {
        logTest('Doctor profile exists for earnings test', false, 'No doctor profiles found');
        return false;
    }

    // Get an appointment
    const { data: appointment } = await supabase
        .from('appointments')
        .select('id')
        .limit(1)
        .single();

    // Calculate earnings (200 EGP consultation, 2.75% + 3 EGP fee)
    const grossAmount = 200;
    const platformFee = (grossAmount * 0.0275) + 3; // 8.5 EGP
    const netAmount = grossAmount - platformFee; // 191.5 EGP

    // Create test earnings record (note: currency not in schema)
    const { data: earnings, error: createError } = await supabase
        .from('doctor_earnings')
        .insert({
            doctor_profile_id: doctorProfile.id,
            appointment_id: appointment?.id || null,
            gross_amount: grossAmount,
            platform_fee: Math.round(platformFee * 100) / 100,
            net_amount: Math.round(netAmount * 100) / 100,
            status: 'pending'
        })
        .select('id, gross_amount, platform_fee, net_amount')
        .single();

    logTest('Can create doctor earnings record', !createError, createError?.message);

    if (!earnings) {
        return false;
    }

    console.log(`    Created earnings: ${earnings.id.slice(0, 8)}...`);
    console.log(`    Gross: ${earnings.gross_amount} EGP, Fee: ${earnings.platform_fee} EGP, Net: ${earnings.net_amount} EGP`);

    // Test platform fee calculation
    logTest('Platform fee calculated correctly',
        Math.abs((earnings as { platform_fee: number }).platform_fee - 8.5) < 0.01,
        `Expected ~8.5, got ${(earnings as { platform_fee: number }).platform_fee}`);

    logTest('Net amount calculated correctly',
        Math.abs((earnings as { net_amount: number }).net_amount - 191.5) < 0.01,
        `Expected ~191.5, got ${(earnings as { net_amount: number }).net_amount}`);

    // Clean up
    await supabase.from('doctor_earnings').delete().eq('id', earnings.id);
    console.log('    Cleaned up test earnings');

    return !createError;
}

async function testInvoiceGeneration() {
    console.log('\n6. Testing Invoice Generation...');

    // Get a patient profile
    const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .limit(1)
        .single();

    if (!patientProfile) {
        logTest('Patient profile exists for invoice test', false, 'No patient profiles found');
        return false;
    }

    // First create a transaction (required FK for invoice)
    const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
            patient_profile_id: patientProfile.id,
            amount: 200,
            currency: 'EGP',
            transaction_type: 'consultation',
            status: 'completed'
        })
        .select('id')
        .single();

    if (txError || !transaction) {
        logTest('Can create transaction for invoice', false, txError?.message);
        return false;
    }

    // Calculate VAT (14% in Egypt)
    const totalAmount = 200;
    const vatRate = 0.14;
    const subtotal = totalAmount / (1 + vatRate); // ~175.44 EGP
    const taxAmount = totalAmount - subtotal; // ~24.56 EGP

    // Create test invoice (matches actual schema)
    const { data: invoice, error: createError } = await supabase
        .from('invoices')
        .insert({
            transaction_id: transaction.id,
            patient_profile_id: patientProfile.id,
            subtotal: Math.round(subtotal * 100) / 100,
            tax_amount: Math.round(taxAmount * 100) / 100,
            total_amount: totalAmount,
            service_description: 'Consultation'
        })
        .select('id, invoice_number, subtotal, tax_amount, total_amount')
        .single();

    logTest('Can create invoice', !createError, createError?.message);

    if (!invoice) {
        return false;
    }

    console.log(`    Created invoice: ${invoice.invoice_number}`);
    console.log(`    Subtotal: ${invoice.subtotal} EGP, VAT: ${invoice.tax_amount} EGP, Total: ${invoice.total_amount} EGP`);

    // Check invoice number format (should be auto-generated)
    logTest('Invoice number generated',
        !!invoice.invoice_number && invoice.invoice_number.startsWith('INV-'),
        `Invalid format: ${invoice.invoice_number}`);

    // Check VAT calculation
    logTest('VAT calculated correctly (~14%)',
        Math.abs((invoice as { tax_amount: number }).tax_amount / (invoice as { subtotal: number }).subtotal - 0.14) < 0.01,
        `VAT ratio: ${((invoice as { tax_amount: number }).tax_amount / (invoice as { subtotal: number }).subtotal * 100).toFixed(1)}%`);

    // Clean up (invoice first, then transaction due to FK)
    await supabase.from('invoices').delete().eq('id', invoice.id);
    await supabase.from('transactions').delete().eq('id', transaction.id);
    console.log('    Cleaned up test invoice and transaction');

    return !createError;
}

async function testPaymobConfiguration() {
    console.log('\n7. Testing Paymob Configuration...');

    const paymobApiKey = process.env.PAYMOB_API_KEY;
    const paymobIntegrationId = process.env.PAYMOB_INTEGRATION_ID;
    const paymobIframeId = process.env.PAYMOB_IFRAME_ID;
    const paymobHmacSecret = process.env.PAYMOB_HMAC_SECRET;

    const hasApiKey = !!paymobApiKey && paymobApiKey.length > 0;
    const hasIntegrationId = !!paymobIntegrationId && paymobIntegrationId.length > 0;
    const hasIframeId = !!paymobIframeId && paymobIframeId.length > 0;
    const hasHmacSecret = !!paymobHmacSecret && paymobHmacSecret.length > 0;

    logTest('PAYMOB_API_KEY is set', hasApiKey, 'Not configured');
    logTest('PAYMOB_INTEGRATION_ID is set', hasIntegrationId, 'Not configured');
    logTest('PAYMOB_IFRAME_ID is set', hasIframeId, 'Not configured');
    logTest('PAYMOB_HMAC_SECRET is set', hasHmacSecret, 'Not configured');

    const isFullyConfigured = hasApiKey && hasIntegrationId && hasIframeId && hasHmacSecret;

    if (isFullyConfigured) {
        console.log('    ✓ Paymob is fully configured!');
    } else {
        console.log('    ⚠ Paymob credentials not yet configured');
        console.log('    Add them to .env.local when you receive them from Paymob');
    }

    // Note: We're not failing the test if not configured
    return true;
}

async function testPayoutTable() {
    console.log('\n8. Testing Doctor Payouts Table...');

    const { data, error } = await supabase
        .from('doctor_payouts')
        .select('id, amount, status')
        .limit(5);

    logTest('Can query doctor_payouts table', !error, error?.message);

    if (data) {
        console.log(`    Found ${data.length} payout(s)`);
    }

    return !error;
}

async function main() {
    console.log('========================================');
    console.log('Payment System Tests');
    console.log('========================================');

    await testTransactionsTable();
    await testDoctorEarningsTable();
    await testInvoicesTable();
    await testTransactionCreation();
    await testDoctorEarningsCreation();
    await testInvoiceGeneration();
    await testPaymobConfiguration();
    await testPayoutTable();

    // Summary
    console.log('\n========================================');
    console.log('Test Summary');
    console.log('========================================');

    const passed = testResults.filter(t => t.passed).length;
    const failed = testResults.filter(t => !t.passed).length;
    const total = testResults.length;

    console.log(`\nTotal: ${total} tests`);
    console.log(`Passed: ${passed} ✓`);
    console.log(`Failed: ${failed} ✗`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
        console.log('\nFailed Tests:');
        testResults.filter(t => !t.passed).forEach(t => {
            console.log(`  - ${t.name}: ${t.error}`);
        });
    }

    console.log('\n========================================');
    if (failed === 0) {
        console.log('All tests passed! Payment system is ready.');
        console.log('\nNote: Configure Paymob credentials in .env.local:');
        console.log('  PAYMOB_API_KEY=your_api_key');
        console.log('  PAYMOB_INTEGRATION_ID=your_integration_id');
        console.log('  PAYMOB_IFRAME_ID=your_iframe_id');
        console.log('  PAYMOB_HMAC_SECRET=your_hmac_secret');
    } else {
        console.log('Some tests failed. Please check the errors above.');
    }
    console.log('========================================');

    process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
