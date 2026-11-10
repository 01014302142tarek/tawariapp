"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { notifyPaymentSuccess } from "./notifications";
import { uploadPaymentReceipt } from "@/lib/supabase/storage";
import {
    getAuthToken,
    createOrder,
    getPaymentKey,
    getIframeUrl,
    toPaymobCents,
    calculatePlatformFee,
    isPaymobConfigured,
    PaymobBillingData,
} from "@/lib/payments/paymob";

// Types
export interface InitiatePaymentResult {
    success: boolean;
    transactionId?: string;
    paymentUrl?: string;
    error?: string;
}

export interface PaymentStatusResult {
    success: boolean;
    status?: "pending" | "completed" | "failed" | "refunded";
    transactionId?: string;
    amount?: number;
    paidAt?: string;
    error?: string;
}

export interface TransactionRecord {
    id: string;
    amount: number;
    status: string;
    transactionType: string;
    paymentMethod: string | null;
    createdAt: string;
    appointmentId?: string;
    doctorName?: string;
}

/**
 * Initiate a payment for an appointment
 */
export async function initiateAppointmentPayment(
    appointmentId: string
): Promise<InitiatePaymentResult> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get patient profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; full_name: string; role: string } | null;
    if (!profile || profile.role !== "patient") {
        return { success: false, error: "Only patients can make payments" };
    }

    // Get patient_profile with phone number
    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id, phone")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string; phone: string | null } | null;
    if (!patientProfile) {
        return { success: false, error: "Patient profile not found" };
    }

    // Get appointment with doctor info
    const { data: appointmentData } = await supabase
        .from("appointments")
        .select(`
            id,
            consultation_fee,
            status,
            patient_profile_id,
            doctor_profile_id
        `)
        .eq("id", appointmentId)
        .single();

    const appointment = appointmentData as {
        id: string;
        consultation_fee: number;
        status: string;
        patient_profile_id: string;
        doctor_profile_id: string;
    } | null;

    if (!appointment) {
        return { success: false, error: "Appointment not found" };
    }

    if (appointment.patient_profile_id !== patientProfile.id) {
        return { success: false, error: "Unauthorized - Not your appointment" };
    }

    if (appointment.status !== "scheduled") {
        return { success: false, error: "Appointment cannot be paid for" };
    }

    // Check if already paid
    const { data: existingTransaction } = await supabase
        .from("transactions")
        .select("id, status")
        .eq("appointment_id", appointmentId)
        .eq("status", "completed")
        .single();

    if (existingTransaction) {
        return { success: false, error: "Appointment already paid" };
    }

    // Get doctor name for billing
    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("profile_id")
        .eq("id", appointment.doctor_profile_id)
        .single();

    let doctorName = "Doctor";
    if (doctorProfileData) {
        const { data: doctorData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", (doctorProfileData as { profile_id: string }).profile_id)
            .single();
        if (doctorData) {
            doctorName = (doctorData as { full_name: string }).full_name;
        }
    }

    // Create transaction record
    const amountCents = toPaymobCents(appointment.consultation_fee);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: transaction, error: txError } = await (supabase as any)
        .from("transactions")
        .insert({
            patient_profile_id: patientProfile.id,
            appointment_id: appointmentId,
            amount: appointment.consultation_fee,
            currency: "EGP",
            transaction_type: "consultation",
            status: "pending",
        })
        .select("id")
        .single();

    if (txError || !transaction) {
        // Transaction creation failed - error returned to caller
        return { success: false, error: "Failed to initiate payment" };
    }

    // If Paymob is not configured (e.g. dev or test environment), complete payment directly
    if (!isPaymobConfigured()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from("transactions")
            .update({ status: "completed", payment_method: "test_mode" })
            .eq("id", transaction.id);

        const { grossAmount, platformFee, netAmount } = calculatePlatformFee(appointment.consultation_fee);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from("doctor_earnings")
            .insert({
                doctor_profile_id: appointment.doctor_profile_id,
                appointment_id: appointmentId,
                transaction_id: transaction.id,
                gross_amount: grossAmount,
                platform_fee: platformFee,
                net_amount: netAmount,
                status: "available",
            });

        // Notify patient of payment confirmation
        notifyPaymentSuccess(
            profile.id,
            appointment.consultation_fee,
            transaction.id
        ).catch(err => console.error("Failed to notify patient of payment success:", err));

        return {
            success: true,
            transactionId: transaction.id,
            paymentUrl: `/ar/dashboard/patient/appointments?payment=success`,
        };
    }

    // Get Paymob auth token
    const { token: authToken, error: authError } = await getAuthToken();
    if (authError || !authToken) {
        return { success: false, error: authError || "Payment gateway authentication failed" };
    }

    // Create Paymob order
    const { order, error: orderError } = await createOrder(
        authToken,
        amountCents,
        transaction.id, // Use our transaction ID as merchant order ID
        [{
            name: `Consultation with ${doctorName}`,
            amount_cents: amountCents,
            quantity: 1,
        }]
    );

    if (orderError || !order) {
        // Update transaction as failed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from("transactions")
            .update({ status: "failed" })
            .eq("id", transaction.id);
        return { success: false, error: orderError || "Failed to create payment order" };
    }

    // Update transaction with Paymob order ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("transactions")
        .update({ paymob_order_id: order.id.toString() })
        .eq("id", transaction.id);

    // Validate phone number for payment
    const phoneNumber = patientProfile.phone;
    if (!phoneNumber) {
        return { success: false, error: "Phone number is required for payment. Please update your profile." };
    }

    // Validate Egyptian phone number format (+20XXXXXXXXXX)
    const egyptPhoneRegex = /^\+20[0-9]{10}$/;
    if (!egyptPhoneRegex.test(phoneNumber)) {
        return { success: false, error: "Invalid phone number format. Please use Egyptian format (+20XXXXXXXXXX)." };
    }

    // Prepare billing data
    const nameParts = profile.full_name.split(" ");
    const billingData: PaymobBillingData = {
        first_name: nameParts[0] || "Patient",
        last_name: nameParts.slice(1).join(" ") || "User",
        email: user.email || "patient@tabibi.com",
        phone_number: phoneNumber,
        city: "Cairo",
        country: "EG",
    };

    // Get payment key
    const { paymentKey, error: keyError } = await getPaymentKey(
        authToken,
        order.id,
        amountCents,
        billingData
    );

    if (keyError || !paymentKey) {
        return { success: false, error: keyError || "Failed to generate payment token" };
    }

    // Generate iframe URL
    const paymentUrl = getIframeUrl(paymentKey);

    return {
        success: true,
        transactionId: transaction.id,
        paymentUrl,
    };
}

export interface SubmitManualPaymentInput {
    appointmentId: string;
    method: "instapay" | "wepay";
    targetPhone: string;
    senderName?: string;
    senderPhone?: string;
    receiptBase64: string;
    receiptFileName: string;
}

export interface SubmitManualPaymentResult {
    success: boolean;
    transactionId?: string;
    appointmentId?: string;
    receiptUrl?: string;
    error?: string;
}

/**
 * Submit manual transfer payment (InstaPay or WE Pay) with uploaded receipt image
 */
export async function submitManualTransferPayment(
    input: SubmitManualPaymentInput
): Promise<SubmitManualPaymentResult> {
    const supabase = await createClient();
    const serviceRole = await createServiceRoleClient();

    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // 2. Fetch patient profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; full_name: string; role: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    // 3. Fetch patient profile record
    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { success: false, error: "Patient profile not found" };
    }

    // 4. Fetch appointment
    const { data: appointmentData } = await supabase
        .from("appointments")
        .select("id, consultation_fee, status, patient_profile_id, doctor_profile_id, scheduled_start")
        .eq("id", input.appointmentId)
        .single();

    const appointment = appointmentData as {
        id: string;
        consultation_fee: number;
        status: string;
        patient_profile_id: string;
        doctor_profile_id: string;
        scheduled_start: string;
    } | null;

    if (!appointment) {
        return { success: false, error: "Appointment not found" };
    }

    if (appointment.patient_profile_id !== patientProfile.id) {
        return { success: false, error: "Unauthorized - Not your appointment" };
    }

    // 5. Upload receipt screenshot
    const uploadRes = await uploadPaymentReceipt(appointment.id, input.receiptBase64, input.receiptFileName);
    if (!uploadRes.url) {
        return { success: false, error: uploadRes.error || "Failed to upload payment receipt" };
    }
    const receiptUrl = uploadRes.url;

    // 6. Record or update transaction using serviceRole to ensure complete persistence
    const targetLabel = input.method === "instapay" ? "إنستا باي (InstaPay)" : "محفظة وي باي (WE Pay)";
    const paymentDetails = {
        method: input.method,
        method_label_ar: targetLabel,
        target_phone: input.targetPhone, // "01014302142" or "01555952142"
        sender_name: input.senderName?.trim() || profile.full_name,
        sender_phone: input.senderPhone?.trim() || null,
        receipt_url: receiptUrl,
        receipt_file_name: input.receiptFileName,
        submitted_at: new Date().toISOString(),
    };

    // Check if an existing transaction exists for this appointment
    const { data: existingTx } = await (serviceRole as any)
        .from("transactions")
        .select("id")
        .eq("appointment_id", appointment.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    let transactionId = existingTx?.id;

    if (existingTx) {
        await (serviceRole as any)
            .from("transactions")
            .update({
                status: "completed",
                payment_method: input.method,
                payment_details: paymentDetails,
                amount: appointment.consultation_fee,
                updated_at: new Date().toISOString(),
            })
            .eq("id", existingTx.id);
    } else {
        const { data: newTx, error: txError } = await (serviceRole as any)
            .from("transactions")
            .insert({
                patient_profile_id: patientProfile.id,
                appointment_id: appointment.id,
                amount: appointment.consultation_fee,
                currency: "EGP",
                transaction_type: "consultation",
                status: "completed",
                payment_method: input.method,
                payment_details: paymentDetails,
            })
            .select("id")
            .single();

        if (txError) {
            console.error("Error creating manual transaction:", txError);
            return { success: false, error: "Failed to record transaction" };
        }
        transactionId = newTx?.id;
    }

    // 7. Record doctor earnings
    const { grossAmount, platformFee, netAmount } = calculatePlatformFee(appointment.consultation_fee);
    await (serviceRole as any)
        .from("doctor_earnings")
        .upsert({
            doctor_profile_id: appointment.doctor_profile_id,
            appointment_id: appointment.id,
            transaction_id: transactionId,
            gross_amount: grossAmount,
            platform_fee: platformFee,
            net_amount: netAmount,
            status: "available",
        }, { onConflict: "appointment_id" });

    // 8. Notifications
    try {
        notifyPaymentSuccess(
            profile.id,
            appointment.consultation_fee,
            transactionId
        ).catch(() => {});
    } catch {
        // non-blocking
    }

    return {
        success: true,
        transactionId,
        appointmentId: appointment.id,
        receiptUrl,
    };
}

/**
 * Get payment status for a transaction
 */
export async function getPaymentStatus(
    transactionId: string
): Promise<PaymentStatusResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: transaction, error } = await supabase
        .from("transactions")
        .select("id, amount, status, created_at, patient_profile_id")
        .eq("id", transactionId)
        .single();

    if (error || !transaction) {
        return { success: false, error: "Transaction not found" };
    }

    // Verify ownership
    const { data: patientProfile } = await supabase
        .from("patient_profiles")
        .select("profile_id")
        .eq("id", (transaction as { patient_profile_id: string }).patient_profile_id)
        .single();

    if (patientProfile) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("id", (patientProfile as { profile_id: string }).profile_id)
            .single();

        if (!profile || (profile as { user_id: string }).user_id !== user.id) {
            return { success: false, error: "Unauthorized - Not your transaction" };
        }
    }

    const tx = transaction as { id: string; amount: number; status: string; created_at: string };
    return {
        success: true,
        status: tx.status as "pending" | "completed" | "failed" | "refunded",
        transactionId: tx.id,
        amount: tx.amount,
        paidAt: tx.status === "completed" ? tx.created_at : undefined,
    };
}

/**
 * Get patient's transaction history
 */
export async function getPatientTransactions(): Promise<{
    success: boolean;
    transactions?: TransactionRecord[];
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get patient profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!profileData) {
        return { success: false, error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", (profileData as { id: string }).id)
        .single();

    if (!patientProfileData) {
        return { success: false, error: "Patient profile not found" };
    }

    // Get transactions with appointment/doctor info
    const { data: transactions, error } = await supabase
        .from("transactions")
        .select(`
            id,
            amount,
            status,
            transaction_type,
            payment_method,
            created_at,
            appointment_id
        `)
        .eq("patient_profile_id", (patientProfileData as { id: string }).id)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        // Query error - return empty array to caller
        return { success: false, error: "Failed to fetch transactions" };
    }

    // Map transactions with doctor names
    const transactionRecords: TransactionRecord[] = [];

    type TransactionRow = {
        id: string;
        amount: number;
        status: string;
        transaction_type: string;
        payment_method: string | null;
        created_at: string;
        appointment_id: string | null;
    };

    for (const tx of ((transactions || []) as TransactionRow[])) {
        const record: TransactionRecord = {
            id: tx.id,
            amount: tx.amount,
            status: tx.status,
            transactionType: tx.transaction_type,
            paymentMethod: tx.payment_method,
            createdAt: tx.created_at,
            appointmentId: tx.appointment_id || undefined,
        };

        // Get doctor name if appointment exists
        if (tx.appointment_id) {
            const { data: appointment } = await supabase
                .from("appointments")
                .select("doctor_profile_id")
                .eq("id", tx.appointment_id)
                .single();

            if (appointment) {
                const { data: doctorProfile } = await supabase
                    .from("doctor_profiles")
                    .select("profile_id")
                    .eq("id", (appointment as { doctor_profile_id: string }).doctor_profile_id)
                    .single();

                if (doctorProfile) {
                    const { data: doctor } = await supabase
                        .from("profiles")
                        .select("full_name")
                        .eq("id", (doctorProfile as { profile_id: string }).profile_id)
                        .single();

                    if (doctor) {
                        record.doctorName = (doctor as { full_name: string }).full_name;
                    }
                }
            }
        }

        transactionRecords.push(record);
    }

    return { success: true, transactions: transactionRecords };
}

/**
 * Get invoice details
 */
export async function getInvoice(invoiceId: string): Promise<{
    success: boolean;
    invoice?: {
        id: string;
        invoiceNumber: string;
        subtotal: number;
        taxAmount: number;
        totalAmount: number;
        status: string;
        createdAt: string;
        doctorName?: string;
        patientName?: string;
        appointmentDate?: string;
    };
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: invoiceData, error } = await supabase
        .from("invoices")
        .select(`
            id,
            invoice_number,
            subtotal,
            tax_amount,
            total_amount,
            status,
            created_at,
            appointment_id,
            patient_profile_id
        `)
        .eq("id", invoiceId)
        .single();

    if (error || !invoiceData) {
        return { success: false, error: "Invoice not found" };
    }

    const invoice = invoiceData as {
        id: string;
        invoice_number: string;
        subtotal: number;
        tax_amount: number;
        total_amount: number;
        status: string;
        created_at: string;
        appointment_id: string;
        patient_profile_id: string;
    };

    // Get additional details
    let doctorName: string | undefined;
    let patientName: string | undefined;
    let appointmentDate: string | undefined;

    if (invoice.appointment_id) {
        const { data: appointment } = await supabase
            .from("appointments")
            .select("scheduled_start, doctor_profile_id")
            .eq("id", invoice.appointment_id)
            .single();

        if (appointment) {
            const appt = appointment as { scheduled_start: string; doctor_profile_id: string };
            appointmentDate = appt.scheduled_start;

            const { data: doctorProfile } = await supabase
                .from("doctor_profiles")
                .select("profile_id")
                .eq("id", appt.doctor_profile_id)
                .single();

            if (doctorProfile) {
                const { data: doctor } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", (doctorProfile as { profile_id: string }).profile_id)
                    .single();

                if (doctor) {
                    doctorName = (doctor as { full_name: string }).full_name;
                }
            }
        }
    }

    // Get patient name
    const { data: patientProfile } = await supabase
        .from("patient_profiles")
        .select("profile_id")
        .eq("id", invoice.patient_profile_id)
        .single();

    if (patientProfile) {
        const { data: patient } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", (patientProfile as { profile_id: string }).profile_id)
            .single();

        if (patient) {
            patientName = (patient as { full_name: string }).full_name;
        }
    }

    return {
        success: true,
        invoice: {
            id: invoice.id,
            invoiceNumber: invoice.invoice_number,
            subtotal: invoice.subtotal,
            taxAmount: invoice.tax_amount,
            totalAmount: invoice.total_amount,
            status: invoice.status,
            createdAt: invoice.created_at,
            doctorName,
            patientName,
            appointmentDate,
        },
    };
}

/**
 * Get doctor's earnings summary
 */
export async function getDoctorEarnings(): Promise<{
    success: boolean;
    earnings?: {
        totalEarnings: number;
        pendingEarnings: number;
        availableForPayout: number;
        paidOut: number;
        recentEarnings: Array<{
            id: string;
            amount: number;
            status: string;
            createdAt: string;
            patientName?: string;
        }>;
    };
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { success: false, error: "Only doctors can view earnings" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    if (!doctorProfileData) {
        return { success: false, error: "Doctor profile not found" };
    }

    const doctorProfile = doctorProfileData as { id: string };

    // Get earnings summary
    const { data: earnings } = await supabase
        .from("doctor_earnings")
        .select("net_amount, status, created_at, appointment_id, id")
        .eq("doctor_profile_id", doctorProfile.id)
        .order("created_at", { ascending: false });

    const earningsList = (earnings || []) as Array<{
        id: string;
        net_amount: number;
        status: string;
        created_at: string;
        appointment_id: string;
    }>;

    let totalEarnings = 0;
    let pendingEarnings = 0;
    let availableForPayout = 0;
    let paidOut = 0;

    const recentEarnings: Array<{
        id: string;
        amount: number;
        status: string;
        createdAt: string;
        patientName?: string;
    }> = [];

    for (const earning of earningsList) {
        totalEarnings += earning.net_amount;

        switch (earning.status) {
            case "pending":
                pendingEarnings += earning.net_amount;
                break;
            case "available":
                availableForPayout += earning.net_amount;
                break;
            case "paid_out":
                paidOut += earning.net_amount;
                break;
        }

        // Get patient name for recent earnings
        if (recentEarnings.length < 10 && earning.appointment_id) {
            let patientName: string | undefined;

            const { data: appointment } = await supabase
                .from("appointments")
                .select("patient_profile_id")
                .eq("id", earning.appointment_id)
                .single();

            if (appointment) {
                const { data: patientProfile } = await supabase
                    .from("patient_profiles")
                    .select("profile_id")
                    .eq("id", (appointment as { patient_profile_id: string }).patient_profile_id)
                    .single();

                if (patientProfile) {
                    const { data: patient } = await supabase
                        .from("profiles")
                        .select("full_name")
                        .eq("id", (patientProfile as { profile_id: string }).profile_id)
                        .single();

                    if (patient) {
                        patientName = (patient as { full_name: string }).full_name;
                    }
                }
            }

            recentEarnings.push({
                id: earning.id,
                amount: earning.net_amount,
                status: earning.status,
                createdAt: earning.created_at,
                patientName,
            });
        }
    }

    return {
        success: true,
        earnings: {
            totalEarnings: Math.round(totalEarnings * 100) / 100,
            pendingEarnings: Math.round(pendingEarnings * 100) / 100,
            availableForPayout: Math.round(availableForPayout * 100) / 100,
            paidOut: Math.round(paidOut * 100) / 100,
            recentEarnings,
        },
    };
}

/**
 * Request a payout for available earnings
 */
export async function requestPayout(bankDetails: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
}): Promise<{
    success: boolean;
    payoutId?: string;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Validate bank details
    if (!bankDetails.bankName || bankDetails.bankName.trim().length < 2) {
        return { success: false, error: "Bank name is required" };
    }
    if (!bankDetails.accountNumber || bankDetails.accountNumber.trim().length < 10) {
        return { success: false, error: "Valid account number is required" };
    }
    if (!bankDetails.accountHolderName || bankDetails.accountHolderName.trim().length < 2) {
        return { success: false, error: "Account holder name is required" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { success: false, error: "Only doctors can request payouts" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    if (!doctorProfileData) {
        return { success: false, error: "Doctor profile not found" };
    }

    const doctorProfile = doctorProfileData as { id: string };

    // Get available earnings
    const { data: availableEarnings } = await supabase
        .from("doctor_earnings")
        .select("id, net_amount")
        .eq("doctor_profile_id", doctorProfile.id)
        .eq("status", "available");

    const earnings = (availableEarnings || []) as Array<{ id: string; net_amount: number }>;

    if (earnings.length === 0) {
        return { success: false, error: "No available earnings for payout" };
    }

    // Calculate total available amount
    const totalAmount = earnings.reduce((sum, e) => sum + e.net_amount, 0);

    // Minimum payout threshold (100 EGP)
    const MIN_PAYOUT = 100;
    if (totalAmount < MIN_PAYOUT) {
        return { success: false, error: `Minimum payout amount is ${MIN_PAYOUT} EGP` };
    }

    // Check for pending payout requests
    const { data: pendingPayout } = await supabase
        .from("doctor_payouts")
        .select("id")
        .eq("doctor_profile_id", doctorProfile.id)
        .in("status", ["pending", "processing"])
        .single();

    if (pendingPayout) {
        return { success: false, error: "You already have a pending payout request" };
    }

    // Create payout request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: payout, error: payoutError } = await (supabase as any)
        .from("doctor_payouts")
        .insert({
            doctor_profile_id: doctorProfile.id,
            amount: Math.round(totalAmount * 100) / 100,
            currency: "EGP",
            status: "pending",
            bank_account_details: {
                bank_name: bankDetails.bankName.trim(),
                account_number: bankDetails.accountNumber.trim(),
                account_holder_name: bankDetails.accountHolderName.trim(),
            },
        })
        .select("id")
        .single();

    if (payoutError || !payout) {
        return { success: false, error: "Failed to create payout request" };
    }

    // Update earnings status to 'processing'
    const earningIds = earnings.map(e => e.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("doctor_earnings")
        .update({ status: "processing" })
        .in("id", earningIds);

    return {
        success: true,
        payoutId: payout.id,
    };
}

/**
 * Get doctor's payout history
 */
export async function getDoctorPayouts(): Promise<{
    success: boolean;
    payouts?: Array<{
        id: string;
        amount: number;
        status: string;
        createdAt: string;
        processedAt?: string;
        referenceNumber?: string;
    }>;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Get doctor profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { success: false, error: "Only doctors can view payouts" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    if (!doctorProfileData) {
        return { success: false, error: "Doctor profile not found" };
    }

    const doctorProfile = doctorProfileData as { id: string };

    // Get payouts
    const { data: payouts, error } = await supabase
        .from("doctor_payouts")
        .select("id, amount, status, created_at, processed_at, reference_number")
        .eq("doctor_profile_id", doctorProfile.id)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        return { success: false, error: "Failed to fetch payouts" };
    }

    type PayoutRow = {
        id: string;
        amount: number;
        status: string;
        created_at: string;
        processed_at: string | null;
        reference_number: string | null;
    };

    return {
        success: true,
        payouts: ((payouts || []) as PayoutRow[]).map(p => ({
            id: p.id,
            amount: p.amount,
            status: p.status,
            createdAt: p.created_at,
            processedAt: p.processed_at || undefined,
            referenceNumber: p.reference_number || undefined,
        })),
    };
}
