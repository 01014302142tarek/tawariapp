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
    queueEntryId?: string;
}

/**
 * Helper to resolve doctor and patient information for an appointment, queue entry, or transaction
 */
async function resolveDoctorAndPatient(
    serviceRole: any,
    tx: any,
    params: { appointmentId?: string; queueEntryId?: string }
) {
    const queueEntryId = tx.payment_details?.queue_entry_id || params.queueEntryId;
    let queueDocProfileId: string | null = null;
    let queuePatProfileId: string | null = null;
    let queueAptId: string | null = null;

    if (queueEntryId) {
        const { data: qRec } = await (serviceRole as any)
            .from("consultation_queue")
            .select("doctor_profile_id, patient_profile_id, appointment_id")
            .eq("id", queueEntryId)
            .single();
        if (qRec) {
            queueDocProfileId = qRec.doctor_profile_id;
            queuePatProfileId = qRec.patient_profile_id;
            queueAptId = qRec.appointment_id;
        }
    }

    const effectiveAppointmentId = tx.appointment_id || queueAptId || params.appointmentId;
    let apptDocProfileId: string | null = null;
    let apptPatProfileId: string | null = null;
    let apptStatus: string | null = null;

    if (effectiveAppointmentId) {
        const { data: aptData } = await (serviceRole as any)
            .from("appointments")
            .select("doctor_profile_id, patient_profile_id, status")
            .eq("id", effectiveAppointmentId)
            .single();
        if (aptData) {
            apptDocProfileId = aptData.doctor_profile_id;
            apptPatProfileId = aptData.patient_profile_id;
            apptStatus = aptData.status;
        }
    }

    // 1. Resolve Doctor
    const targetDoctorId = apptDocProfileId || queueDocProfileId || tx.doctor_profile_id;
    let doctorUserProfId: string | undefined;
    let doctorName = "طبيب معتمد";

    if (targetDoctorId) {
        const { data: dRec } = await (serviceRole as any)
            .from("doctor_profiles")
            .select("profile_id, profiles!doctor_profiles_profile_id_fkey(full_name)")
            .eq("id", targetDoctorId)
            .single();

        if (dRec) {
            doctorUserProfId = dRec.profile_id;
            if (dRec.profiles?.full_name) {
                doctorName = dRec.profiles.full_name;
            }
        } else {
            const { data: directDoc } = await (serviceRole as any)
                .from("profiles")
                .select("id, full_name")
                .eq("id", targetDoctorId)
                .single();
            if (directDoc?.full_name) {
                doctorName = directDoc.full_name;
                doctorUserProfId = directDoc.id;
            }
        }
    }

    // 2. Resolve Patient
    const targetPatientId = apptPatProfileId || queuePatProfileId || tx.patient_profile_id;
    let patientUserProfId: string | undefined;
    let patientName = tx.payment_details?.sender_name?.trim() || "";

    if (targetPatientId) {
        const { data: pRec } = await (serviceRole as any)
            .from("patient_profiles")
            .select("profile_id, profiles!patient_profiles_profile_id_fkey(full_name)")
            .eq("id", targetPatientId)
            .single();

        if (pRec) {
            patientUserProfId = pRec.profile_id;
            if (!patientName && pRec.profiles?.full_name) {
                patientName = pRec.profiles.full_name;
            }
        } else {
            const { data: directPat } = await (serviceRole as any)
                .from("profiles")
                .select("id, full_name")
                .eq("id", targetPatientId)
                .single();
            if (directPat) {
                patientUserProfId = directPat.id;
                if (!patientName && directPat.full_name) {
                    patientName = directPat.full_name;
                }
            }
        }
    }

    if (!patientName) {
        patientName = "مريض";
    }

    return {
        queueEntryId,
        effectiveAppointmentId,
        apptStatus,
        targetDoctorId,
        doctorUserProfId,
        doctorName,
        targetPatientId,
        patientUserProfId,
        patientName,
    };
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

    // Resolve doctor and patient details first
    const resolved = await resolveDoctorAndPatient(serviceRole, tx, params);

    // Check if already approved
    if (tx.status === "completed" && tx.payment_details?.admin_approval === "approved") {
        return {
            success: true,
            alreadyProcessed: true,
            patientName: resolved.patientName,
            doctorName: resolved.doctorName,
            amount: tx.amount || 0,
            method: tx.payment_method || "instapay",
            appointmentId: resolved.effectiveAppointmentId || undefined,
            queueEntryId: resolved.queueEntryId || undefined,
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

    // 3. Update appointment if present
    if (resolved.effectiveAppointmentId) {
        await (serviceRole as any)
            .from("appointments")
            .update({
                status: (resolved.apptStatus === "in_waiting_room" || resolved.queueEntryId) ? "in_waiting_room" : "scheduled",
                updated_at: new Date().toISOString(),
            })
            .eq("id", resolved.effectiveAppointmentId);

        // Credit doctor earnings
        try {
            const { grossAmount, platformFee, netAmount } = calculatePlatformFee(tx.amount || 0);
            await (serviceRole as any)
                .from("doctor_earnings")
                .upsert({
                    doctor_profile_id: resolved.targetDoctorId,
                    appointment_id: resolved.effectiveAppointmentId,
                    transaction_id: tx.id,
                    gross_amount: grossAmount,
                    platform_fee: platformFee,
                    net_amount: netAmount,
                    status: "available",
                }, { onConflict: "appointment_id" });
        } catch (e) {
            console.warn("Could not upsert doctor earnings on approval:", e);
        }
    }

    // 4. Update urgent care queue if present
    if (resolved.queueEntryId) {
        await (serviceRole as any)
            .from("consultation_queue")
            .update({
                payment_status: "completed",
                ...(resolved.effectiveAppointmentId ? { appointment_id: resolved.effectiveAppointmentId } : {}),
            })
            .eq("id", resolved.queueEntryId);
    }

    // 5. Notify BOTH Doctor and Patient (In-App notifications + Direct Emails)
    try {
        await notifyPaymentApproved({
            appointmentId: resolved.effectiveAppointmentId || undefined,
            queueEntryId: resolved.queueEntryId || undefined,
            patientProfileId: resolved.patientUserProfId,
            doctorProfileId: resolved.doctorUserProfId,
            patientName: resolved.patientName,
            doctorName: resolved.doctorName,
            amount: tx.amount || 0,
            method: tx.payment_method || "instapay",
            isUrgent: !!resolved.queueEntryId,
        });
    } catch (notifErr) {
        console.warn("Error notifying on approval:", notifErr);
    }

    return {
        success: true,
        alreadyProcessed: false,
        patientName: resolved.patientName,
        doctorName: resolved.doctorName,
        amount: tx.amount || 0,
        method: tx.payment_method || "instapay",
        appointmentId: resolved.effectiveAppointmentId || undefined,
        queueEntryId: resolved.queueEntryId || undefined,
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

    const resolved = await resolveDoctorAndPatient(serviceRole, tx, params);

    // Check if already rejected
    if (tx.status === "failed" && tx.payment_details?.admin_approval === "rejected") {
        return {
            success: true,
            alreadyProcessed: true,
            patientName: resolved.patientName,
            doctorName: resolved.doctorName,
            amount: tx.amount || 0,
            method: tx.payment_method || "instapay",
            appointmentId: resolved.effectiveAppointmentId || undefined,
            queueEntryId: resolved.queueEntryId || undefined,
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

    // 2. Mark appointment as cancelled
    if (resolved.effectiveAppointmentId) {
        await (serviceRole as any)
            .from("appointments")
            .update({
                status: "cancelled",
                cancellation_reason: `تم رفض إيصال التحويل من قِبل الإدارة: ${rejectionReason}`,
                updated_at: new Date().toISOString(),
            })
            .eq("id", resolved.effectiveAppointmentId);
    }

    // 3. If urgent care queue entry is linked, cancel it
    if (resolved.queueEntryId) {
        await (serviceRole as any)
            .from("consultation_queue")
            .update({
                status: "cancelled",
                payment_status: "failed",
            })
            .eq("id", resolved.queueEntryId);
    }

    // 4. Notify both Doctor and Patient of rejection
    try {
        await notifyPaymentRejected({
            appointmentId: resolved.effectiveAppointmentId || undefined,
            queueEntryId: resolved.queueEntryId || undefined,
            patientProfileId: resolved.patientUserProfId,
            doctorProfileId: resolved.doctorUserProfId,
            patientName: resolved.patientName,
            doctorName: resolved.doctorName,
            amount: tx.amount || 0,
            method: tx.payment_method || "instapay",
            reason: rejectionReason,
        });
    } catch (notifErr) {
        console.warn("Error notifying on rejection:", notifErr);
    }

    return {
        success: true,
        alreadyProcessed: false,
        patientName: resolved.patientName,
        doctorName: resolved.doctorName,
        amount: tx.amount || 0,
        method: tx.payment_method || "instapay",
        appointmentId: resolved.effectiveAppointmentId || undefined,
        queueEntryId: resolved.queueEntryId || undefined,
    };
}
