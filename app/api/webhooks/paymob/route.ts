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

        // Security check: Verify payment amount and currency match the recorded transaction
        const expectedAmountCents = Math.round(transaction.amount * 100);
        const isAmountValid = obj.amount_cents === expectedAmountCents && obj.currency === "EGP";

        if (success && !isAmountValid) {
            console.error("SECURITY ALERT: Paymob payment amount or currency mismatch:", {
                expectedCents: expectedAmountCents,
                receivedCents: obj.amount_cents,
                currency: obj.currency,
                transactionId: transaction.id,
            });

            await supabase
                .from("transactions")
                .update({
                    paymob_transaction_id: paymobTransactionId,
                    status: "failed",
                    payment_method: paymentMethod,
                })
                .eq("id", transaction.id);

            return NextResponse.json({ received: true, error: "Amount or currency mismatch" }, { status: 400 });
        }

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

        // If payment failed, notify patient
        if (!success) {
            await supabase
                .from("notifications")
                .insert({
                    profile_id: transaction.patient_profile_id,
                    title: "Payment Failed",
                    body: "Your payment could not be processed. Please try again or use a different payment method.",
                    notification_type: "payment_failed",
                    data: {
                        transactionId: transaction.id,
                        appointmentId: transaction.appointment_id,
                    },
                    is_read: false,
                    is_pushed: false,
                });
        }

        // If payment successful, update appointment and create doctor earnings
        if (success && transaction.appointment_id) {
            // Payment confirmed - appointment remains "scheduled" until patient joins waiting room
            // No status update needed here as "scheduled" is already the correct status

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

            // Create notification for patient (payment success)
            await supabase
                .from("notifications")
                .insert({
                    profile_id: transaction.patient_profile_id,
                    title: "Payment Successful",
                    body: `Your payment of ${transaction.amount} EGP has been confirmed. Your appointment is now scheduled.`,
                    notification_type: "payment_success",
                    data: {
                        transactionId: transaction.id,
                        appointmentId: transaction.appointment_id,
                        amount: transaction.amount,
                    },
                    is_read: false,
                    is_pushed: false,
                });

            // Get patient info for doctor notification
            const { data: patientProfile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", transaction.patient_profile_id)
                .single();

            // Get appointment details for doctor notification
            const { data: appointmentDetails } = await supabase
                .from("appointments")
                .select("doctor_profile_id, scheduled_start")
                .eq("id", transaction.appointment_id)
                .single();

            if (appointmentDetails && patientProfile) {
                const apptDetails = appointmentDetails as { doctor_profile_id: string; scheduled_start: string };
                const patient = patientProfile as { full_name: string };
                const appointmentDate = new Date(apptDetails.scheduled_start).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                });

                // Create notification for doctor (new appointment)
                await supabase
                    .from("notifications")
                    .insert({
                        profile_id: apptDetails.doctor_profile_id,
                        title: "New Appointment Booked",
                        body: `${patient.full_name} has booked an appointment for ${appointmentDate}.`,
                        notification_type: "new_appointment",
                        data: {
                            appointmentId: transaction.appointment_id,
                            patientName: patient.full_name,
                        },
                        is_read: false,
                        is_pushed: false,
                    });
            }

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
