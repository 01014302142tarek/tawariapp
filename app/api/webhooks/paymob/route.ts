import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, PaymobTransactionCallback } from "@/lib/payments/paymob";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client lazily inside the handler
function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error("Missing Supabase environment variables");
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey);
}

/**
 * Paymob Transaction Processed Callback
 * This endpoint receives payment status updates from Paymob
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabaseAdmin();
        const body = await request.text();
        const hmac = request.nextUrl.searchParams.get("hmac") || "";

        // Verify HMAC signature
        const isValid = verifyWebhookSignature(body, hmac);

        if (!isValid) {
            console.error("Invalid Paymob webhook signature");
            // Still return 200 to prevent Paymob from retrying
            // Log this for investigation
            return NextResponse.json({ received: true, valid: false }, { status: 200 });
        }

        const callback: PaymobTransactionCallback = JSON.parse(body);
        const { obj } = callback;

        // Extract relevant data
        const paymobTransactionId = obj.id.toString();
        const paymobOrderId = obj.order?.id?.toString() || "";
        const success = obj.success && !obj.error_occured;
        const amountCents = obj.amount_cents;
        const paymentMethod = obj.source_data?.type || "card";

        // Log webhook receipt (transaction ID only, no sensitive data)
        if (process.env.NODE_ENV === "development") {
            console.log("Paymob webhook received for order:", paymobOrderId);
        }

        // Find transaction by Paymob order ID
        const { data: transactionData, error: findError } = await supabase
            .from("transactions")
            .select("id, appointment_id, patient_profile_id, amount")
            .eq("paymob_order_id", paymobOrderId)
            .single();

        if (findError || !transactionData) {
            console.error("Transaction not found for Paymob order:", paymobOrderId);
            return NextResponse.json({ received: true, processed: false }, { status: 200 });
        }

        const transaction = transactionData as {
            id: string;
            appointment_id: string;
            patient_profile_id: string;
            amount: number;
        };

        const newStatus = success ? "completed" : "failed";

        // Update transaction
        const { error: updateError } = await supabase
            .from("transactions")
            .update({
                paymob_transaction_id: paymobTransactionId,
                status: newStatus,
                payment_method: paymentMethod,
            })
            .eq("id", transaction.id);

        if (updateError) {
            console.error("Failed to update transaction:", updateError);
            return NextResponse.json({ received: true, processed: false }, { status: 200 });
        }

        // If payment successful, update appointment and create doctor earnings
        if (success && transaction.appointment_id) {
            // Update appointment status to confirmed
            await supabase
                .from("appointments")
                .update({ status: "confirmed" })
                .eq("id", transaction.appointment_id);

            // Get doctor profile ID from appointment
            const { data: appointment } = await supabase
                .from("appointments")
                .select("doctor_profile_id, consultation_fee")
                .eq("id", transaction.appointment_id)
                .single();

            if (appointment) {
                const appt = appointment as { doctor_profile_id: string; consultation_fee: number };

                // Calculate earnings (2.75% + 3 EGP platform fee)
                const platformFee = (appt.consultation_fee * 0.0275) + 3;
                const netAmount = appt.consultation_fee - platformFee;

                // Create doctor earnings record
                await supabase
                    .from("doctor_earnings")
                    .insert({
                        doctor_profile_id: appt.doctor_profile_id,
                        appointment_id: transaction.appointment_id,
                        transaction_id: transaction.id,
                        gross_amount: appt.consultation_fee,
                        platform_fee: Math.round(platformFee * 100) / 100,
                        net_amount: Math.round(netAmount * 100) / 100,
                        currency: "EGP",
                        status: "pending",
                    });
            }

            // Generate invoice
            const vatRate = 0.14;
            const subtotal = transaction.amount / (1 + vatRate);
            const vatAmount = transaction.amount - subtotal;

            await supabase
                .from("invoices")
                .insert({
                    transaction_id: transaction.id,
                    patient_profile_id: transaction.patient_profile_id,
                    appointment_id: transaction.appointment_id,
                    subtotal: Math.round(subtotal * 100) / 100,
                    tax_amount: Math.round(vatAmount * 100) / 100,
                    total_amount: transaction.amount,
                    currency: "EGP",
                    status: "issued",
                });

            // Log success in development only
            if (process.env.NODE_ENV === "development") {
                console.log("Payment processed for transaction:", transaction.id);
            }
        }

        return NextResponse.json({ received: true, processed: true }, { status: 200 });
    } catch (error) {
        console.error("Paymob webhook error:", error);
        // Return 200 to prevent retries, log for investigation
        return NextResponse.json({ received: true, error: true }, { status: 200 });
    }
}

/**
 * Handle Paymob redirect callback (GET)
 * User is redirected here after payment
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const success = searchParams.get("success") === "true";
    const transactionId = searchParams.get("id");
    const orderId = searchParams.get("order");

    // Redirect to appropriate page based on success
    const lang = "en"; // Could extract from cookie or header
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (success) {
        return NextResponse.redirect(`${baseUrl}/${lang}/dashboard/patient/payments/success?transaction=${transactionId}`);
    } else {
        return NextResponse.redirect(`${baseUrl}/${lang}/dashboard/patient/payments/failed?order=${orderId}`);
    }
}
