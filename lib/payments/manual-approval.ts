import { createServiceRoleClient } from "@/lib/supabase/server";
import { calculatePlatformFee } from "./paymob";
import { notifyPaymentApproved, notifyPaymentRejected } from "@/lib/email/admin-receipt-notifications";

export interface ApprovalExecutionResult {
    success: boolean;
    alreadyProcessed?: boolean;
    error?: string;
    patientName?: string;
    doctorName?: string;
    amount?: number;
    method?: string;
    appointmentId?: string;
}

/**
 * Execute manual payment approval logic using serviceRole client.
 * Usable from Admin dashboard and One-Click email approval links.
 */
export async function executePaymentApproval(params: {
    transactionId?: string;
    appointmentId?: string;
    queueEntryId?: string;
}): Promise<ApprovalExecutionResult> {
    const serviceRole = await createServiceRoleClient();

    // 1. Locate transaction
    let query = (serviceRole as any).from("transactions").select("*, appointments(*)");
    if (params.transactionId) {
        query = query.eq("id", params.transactionId);
    } else if (params.appointmentId) {
        query = query.eq("appointment_id", params.appointmentId);
    } else if (params.queueEntryId) {
        query = query.eq("payment_details->>queue_entry_id", params.queueEntryId);
    } else {
        return { success: false, error: "معرّف المعاملة أو الموعد مفقود" };
    }

    const { data: txList, error: txError } = await query
        .order("created_at", { ascending: false })
        .limit(1);

    const tx = Array.isArray(txList) ? txList[0] : txList;
    if (txError || !tx) {
        return { success: false, error: "لم يتم العثور على المعاملة المالية المطلوبة" };
    }

    // Check if already approved
    if (tx.status === "completed" && tx.payment_details?.admin_approval === "approved") {
        return {
            success: true,
            alreadyProcessed: true,
            patientName: tx.payment_details?.sender_name || "مريض",
            amount: tx.amount || 0,
            method: tx.payment_method || "instapay",
            appointmentId: tx.appointment_id,
        };
    }

    const paymentDetails = {
        ...(tx.payment_details || {}),
        admin_approval: "approved",
        approved_at: new Date().toISOString(),
    };

    // 2. Mark transaction as completed
    await (serviceRole as any)
        .from("transactions")
        .update({
            status: "completed",
            payment_details: paymentDetails,
            updated_at: new Date().toISOString(),
        })
        .eq("id", tx.id);

    let doctorName = "طبيب معتمد";
    let patientName = tx.payment_details?.sender_name || "مريض";

    // 3. Update appointment if present
    if (tx.appointment_id) {
        await (serviceRole as any)
            .from("appointments")
            .update({
                status: tx.appointments?.status === "in_waiting_room" ? "in_waiting_room" : "scheduled",
                updated_at: new Date().toISOString(),
            })
            .eq("id", tx.appointment_id);

        // Credit doctor earnings
        try {
            const { grossAmount, platformFee, netAmount } = calculatePlatformFee(tx.amount || 0);
            await (serviceRole as any)
                .from("doctor_earnings")
                .upsert({
                    doctor_profile_id: tx.appointments?.doctor_profile_id || tx.doctor_profile_id,
                    appointment_id: tx.appointment_id,
                    transaction_id: tx.id,
                    gross_amount: grossAmount,
                    platform_fee: platformFee,
                    net_amount: netAmount,
                    status: "available",
                }, { onConflict: "appointment_id" });
        } catch (e) {
            console.warn("Could not upsert doctor earnings on approval:", e);
        }

        // Notify patient, doctor, and admin
        try {
            let patientUserProfId: string | undefined;
            if (tx.appointments?.patient_profile_id) {
                const { data: pRec } = await (serviceRole as any)
                    .from("patient_profiles")
                    .select("profile_id")
                    .eq("id", tx.appointments.patient_profile_id)
                    .single();
                patientUserProfId = pRec?.profile_id;
            }

            let doctorUserProfId: string | undefined;
            const doctorProfileId = tx.appointments?.doctor_profile_id || tx.doctor_profile_id;
            if (doctorProfileId) {
                const { data: dRec } = await (serviceRole as any)
                    .from("doctor_profiles")
                    .select("profile_id, profiles!doctor_profiles_profile_id_fkey(full_name)")
                    .eq("id", doctorProfileId)
                    .single();
                doctorUserProfId = dRec?.profile_id;
                if (dRec?.profiles?.full_name) {
                    doctorName = dRec.profiles.full_name;
                }
            }

            await notifyPaymentApproved({
                appointmentId: tx.appointment_id,
                patientProfileId: patientUserProfId,
                doctorProfileId: doctorUserProfId,
                patientName,
                doctorName,
                amount: tx.amount || 0,
                method: tx.payment_method || "instapay",
            });
        } catch (notifErr) {
            console.warn("Error notifying on approval:", notifErr);
        }
    }

    // 4. Update urgent care queue if present
    const queueEntryId = tx.payment_details?.queue_entry_id || params.queueEntryId;
    if (queueEntryId) {
        await (serviceRole as any)
            .from("consultation_queue")
            .update({ payment_status: "completed" })
            .eq("id", queueEntryId);
    }

    return {
        success: true,
        alreadyProcessed: false,
        patientName,
        doctorName,
        amount: tx.amount || 0,
        method: tx.payment_method || "instapay",
        appointmentId: tx.appointment_id,
    };
}

/**
 * Execute manual payment rejection logic using serviceRole client.
 */
export async function executePaymentRejection(params: {
    transactionId?: string;
    appointmentId?: string;
    queueEntryId?: string;
    reason?: string;
}): Promise<ApprovalExecutionResult> {
    const serviceRole = await createServiceRoleClient();

    let query = (serviceRole as any).from("transactions").select("*, appointments(*)");
    if (params.transactionId) {
        query = query.eq("id", params.transactionId);
    } else if (params.appointmentId) {
        query = query.eq("appointment_id", params.appointmentId);
    } else if (params.queueEntryId) {
        query = query.eq("payment_details->>queue_entry_id", params.queueEntryId);
    } else {
        return { success: false, error: "معرّف المعاملة أو الموعد مفقود" };
    }

    const { data: txList, error: txError } = await query
        .order("created_at", { ascending: false })
        .limit(1);

    const tx = Array.isArray(txList) ? txList[0] : txList;
    if (txError || !tx) {
        return { success: false, error: "لم يتم العثور على المعاملة المالية المطلوبة" };
    }

    // Check if already rejected
    if (tx.status === "failed" && tx.payment_details?.admin_approval === "rejected") {
        return {
            success: true,
            alreadyProcessed: true,
            patientName: tx.payment_details?.sender_name || "مريض",
            amount: tx.amount || 0,
            method: tx.payment_method || "instapay",
            appointmentId: tx.appointment_id,
        };
    }

    const rejectionReason = (params.reason && params.reason.trim()) || "لم يتم استلام المبلغ في الحساب أو الإيصال غير مطابق";
    const paymentDetails = {
        ...(tx.payment_details || {}),
        admin_approval: "rejected",
        rejection_reason: rejectionReason,
        rejected_at: new Date().toISOString(),
    };

    // 1. Mark transaction as failed
    await (serviceRole as any)
        .from("transactions")
        .update({
            status: "failed",
            payment_details: paymentDetails,
            updated_at: new Date().toISOString(),
        })
        .eq("id", tx.id);

    let doctorName = "طبيب معتمد";
    let patientName = tx.payment_details?.sender_name || "مريض";

    // 2. Mark appointment as cancelled
    if (tx.appointment_id) {
        await (serviceRole as any)
            .from("appointments")
            .update({
                status: "cancelled",
                cancellation_reason: `تم رفض إيصال التحويل من قِبل الإدارة: ${rejectionReason}`,
                updated_at: new Date().toISOString(),
            })
            .eq("id", tx.appointment_id);

        // Notify patient, doctor, and admin
        try {
            let patientUserProfId: string | undefined;
            if (tx.appointments?.patient_profile_id) {
                const { data: pRec } = await (serviceRole as any)
                    .from("patient_profiles")
                    .select("profile_id")
                    .eq("id", tx.appointments.patient_profile_id)
                    .single();
                patientUserProfId = pRec?.profile_id;
            }

            let doctorUserProfId: string | undefined;
            const doctorProfileId = tx.appointments?.doctor_profile_id || tx.doctor_profile_id;
            if (doctorProfileId) {
                const { data: dRec } = await (serviceRole as any)
                    .from("doctor_profiles")
                    .select("profile_id, profiles!doctor_profiles_profile_id_fkey(full_name)")
                    .eq("id", doctorProfileId)
                    .single();
                doctorUserProfId = dRec?.profile_id;
                if (dRec?.profiles?.full_name) {
                    doctorName = dRec.profiles.full_name;
                }
            }

            await notifyPaymentRejected({
                appointmentId: tx.appointment_id,
                patientProfileId: patientUserProfId,
                doctorProfileId: doctorUserProfId,
                patientName,
                doctorName,
                amount: tx.amount || 0,
                method: tx.payment_method || "instapay",
                reason: rejectionReason,
            });
        } catch (notifErr) {
            console.warn("Error notifying on rejection:", notifErr);
        }
    }

    // 3. Update urgent care queue if present
    const queueEntryId = tx.payment_details?.queue_entry_id || params.queueEntryId;
    if (queueEntryId) {
        await (serviceRole as any)
            .from("consultation_queue")
            .update({
                status: "cancelled",
                payment_status: "failed",
            })
            .eq("id", queueEntryId);
    }

    return {
        success: true,
        alreadyProcessed: false,
        patientName,
        doctorName,
        amount: tx.amount || 0,
        method: tx.payment_method || "instapay",
        appointmentId: tx.appointment_id,
    };
}
