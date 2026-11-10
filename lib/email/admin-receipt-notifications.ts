import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail } from "./service";
import { createNotification } from "@/app/actions/notifications";
import { generateReceiptActionToken } from "@/lib/security/receipt-token";

const ADMIN_EMAIL = "tbakr373@gmail.com";

function getBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    }
    if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
        return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
    }
    return (process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

const SITE_URL = getBaseUrl();

export interface NewReceiptNotificationPayload {
    transactionId?: string | null;
    appointmentId?: string | null;
    queueEntryId?: string | null;
    patientProfileId?: string | null;
    doctorProfileId?: string | null;
    doctorDbId?: string | null;
    patientName?: string;
    patientPhone?: string;
    doctorName?: string;
    amount: number;
    method: "instapay" | "wepay" | string;
    targetPhone?: string;
    receiptUrl?: string;
    isUrgent?: boolean;
}

/**
 * Notify Admin, Doctor, and Patient whenever a patient submits a payment receipt
 * (Both In-App and Email with Arabic and English bilingual fields).
 */
export async function notifyAdminNewPaymentReceipt(payload: NewReceiptNotificationPayload) {
    try {
        const methodLabelAr = payload.method === "instapay" ? "إنستا باي (InstaPay)" : payload.method === "wepay" ? "وي باي (WE Pay)" : payload.method;
        const methodLabelEn = payload.method === "instapay" ? "InstaPay" : payload.method === "wepay" ? "WE Pay" : payload.method;
        const patientName = payload.patientName || "مريض / Patient";
        const doctorName = payload.doctorName || "طبيب معتمد / Verified Doctor";

        const serviceRole = await createServiceRoleClient();

        // 1. Notify ALL Admins (In-App)
        try {
            const { data: adminProfiles } = await (serviceRole as any)
                .from("profiles")
                .select("id")
                .eq("role", "admin");

            if (adminProfiles && adminProfiles.length > 0) {
                const title_ar = payload.isUrgent
                    ? "🚨 إيصال استشارة عاجلة بانتظار المراجعة"
                    : "إيصال دفع جديد بانتظار المراجعة 📋";
                const title_en = payload.isUrgent
                    ? "🚨 Urgent Care Payment Receipt Pending Review"
                    : "New Payment Receipt Pending Review 📋";

                const body_ar = `قام المريض (${patientName}) برفع إيصال تحويل ${methodLabelAr} بمبلغ ${payload.amount} ج.م مع ${doctorName}. اضغط هنا للمراجعة والاعتماد.`;
                const body_en = `Patient (${patientName}) uploaded a ${methodLabelEn} receipt for ${payload.amount} EGP with ${doctorName}. Click to review and approve.`;

                await Promise.all(
                    adminProfiles.map((adm: { id: string }) =>
                        createNotification({
                            profileId: adm.id,
                            title: title_en,
                            body: body_en,
                            notificationType: "new_appointment",
                            data: {
                                title_ar,
                                title_en,
                                body_ar,
                                body_en,
                                link: "/dashboard/admin/appointments",
                                appointmentId: payload.appointmentId,
                                queueEntryId: payload.queueEntryId,
                                amount: payload.amount,
                                method: payload.method,
                            },
                        }).catch((e) => console.warn("Failed admin in-app notification:", e))
                    )
                );
            }
        } catch (inAppErr) {
            console.warn("Could not dispatch in-app admin notification:", inAppErr);
        }

        // 2. Notify Doctor (In-App)
        try {
            let targetDoctorProfileId = payload.doctorProfileId;
            if (!targetDoctorProfileId && payload.doctorDbId) {
                const { data: docData } = await (serviceRole as any)
                    .from("doctor_profiles")
                    .select("profile_id")
                    .eq("id", payload.doctorDbId)
                    .single();
                targetDoctorProfileId = docData?.profile_id;
            }

            if (targetDoctorProfileId) {
                const docTitleAr = payload.isUrgent
                    ? "🚨 مريض جديد في قائمة الطوارئ (قيد مراجعة الدفع)"
                    : "حجز موعد استشارة جديد (قيد مراجعة الإيصال) 📅";
                const docTitleEn = payload.isUrgent
                    ? "🚨 New Urgent Care Patient (Pending Payment Review)"
                    : "New Appointment Booked (Pending Payment Review) 📅";

                const docBodyAr = payload.isUrgent
                    ? `انضم المريض (${patientName}) لقائمة الانتظار العاجلة بمبلغ ${payload.amount} ج.م، وإيصال الدفع قيد مراجعة الإدارة حالياً.`
                    : `قام المريض (${patientName}) بحجز موعد استشارة بمبلغ ${payload.amount} ج.م، وإيصال التحويل قيد مراجعة الإدارة حالياً.`;
                const docBodyEn = payload.isUrgent
                    ? `Patient (${patientName}) joined your urgent care queue (${payload.amount} EGP). Payment receipt is currently under admin review.`
                    : `Patient (${patientName}) booked an appointment (${payload.amount} EGP). Transfer receipt is currently under admin review.`;

                await createNotification({
                    profileId: targetDoctorProfileId,
                    title: docTitleEn,
                    body: docBodyEn,
                    notificationType: "new_appointment",
                    data: {
                        title_ar: docTitleAr,
                        title_en: docTitleEn,
                        body_ar: docBodyAr,
                        body_en: docBodyEn,
                        appointmentId: payload.appointmentId,
                        queueEntryId: payload.queueEntryId,
                    },
                }).catch((e) => console.warn("Failed doctor in-app notification:", e));
            }
        } catch (docErr) {
            console.warn("Could not notify doctor on new receipt:", docErr);
        }

        // 3. Notify Patient (In-App Confirmation)
        if (payload.patientProfileId) {
            try {
                const patTitleAr = "تم استلام إيصال التحويل بنجاح ⏳";
                const patTitleEn = "Payment Receipt Received Successfully ⏳";
                const patBodyAr = `تم استلام إيصال التحويل الخاص بك لموعدك مع ${doctorName}. يقوم فريق الإدارة بالتحقق منه حالياً وسيتم تحويلك وتأكيد الموعد فور الاعتماد.`;
                const patBodyEn = `Your transfer receipt for your consultation with ${doctorName} has been received. Our admin team is verifying it and will confirm your appointment shortly.`;

                await createNotification({
                    profileId: payload.patientProfileId,
                    title: patTitleEn,
                    body: patBodyEn,
                    notificationType: "appointment_confirmation",
                    data: {
                        title_ar: patTitleAr,
                        title_en: patTitleEn,
                        body_ar: patBodyAr,
                        body_en: patBodyEn,
                        appointmentId: payload.appointmentId,
                        queueEntryId: payload.queueEntryId,
                    },
                }).catch((e) => console.warn("Failed patient receipt confirmation notification:", e));
            } catch (patErr) {
                console.warn("Could not notify patient on receipt submission:", patErr);
            }
        }

        // 4. Generate One-Click Action Tokens for Direct Email Approval & Rejection
        let txId = payload.transactionId;
        if (!txId && (payload.appointmentId || payload.queueEntryId)) {
            try {
                let q = (serviceRole as any).from("transactions").select("id");
                if (payload.appointmentId) q = q.eq("appointment_id", payload.appointmentId);
                else if (payload.queueEntryId) q = q.eq("payment_details->>queue_entry_id", payload.queueEntryId);
                const { data: foundTx } = await q.order("created_at", { ascending: false }).limit(1).single();
                txId = foundTx?.id;
            } catch (txLookupErr) {
                console.warn("Could not find transaction id for quick token:", txLookupErr);
            }
        }

        const approveToken = generateReceiptActionToken({
            transactionId: txId || undefined,
            appointmentId: payload.appointmentId || undefined,
            queueEntryId: payload.queueEntryId || undefined,
            action: "approve",
        });

        const rejectToken = generateReceiptActionToken({
            transactionId: txId || undefined,
            appointmentId: payload.appointmentId || undefined,
            queueEntryId: payload.queueEntryId || undefined,
            action: "reject",
        });

        const baseUrl = getBaseUrl();
        const quickApproveUrl = `${baseUrl}/api/admin/receipts/quick-action?token=${approveToken}&action=approve`;
        const quickRejectUrl = `${baseUrl}/api/admin/receipts/quick-action?token=${rejectToken}&action=reject`;
        const reviewUrl = `${baseUrl}/ar/dashboard/admin/appointments`;

        // 5. Send Bilingual HTML Email to tbakr373@gmail.com
        const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #0b1526; color: #ffffff; padding: 20px; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #031326; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #044C87, #FD614B); padding: 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: bold; }
        .header p { margin: 4px 0 0 0; color: rgba(255,255,255,0.85); font-size: 13px; }
        .content { padding: 24px; }
        .badge { display: inline-block; background: rgba(253,97,75,0.15); color: #FD614B; padding: 6px 14px; border-radius: 999px; font-weight: bold; font-size: 13px; margin-bottom: 16px; border: 1px solid rgba(253,97,75,0.3); }
        .info-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin: 16px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .info-row:last-child { border-bottom: none; }
        .label { color: #94a3b8; font-size: 14px; }
        .value { color: #ffffff; font-weight: bold; font-size: 14px; }
        .footer { text-align: center; color: #64748b; font-size: 12px; padding: 16px; border-top: 1px solid rgba(255,255,255,0.05); }
        .receipt-preview { text-align: center; margin: 16px 0; }
        .receipt-preview img { max-width: 100%; max-height: 350px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>منصة طبيبي — استلام إيصال دفع جديد</h1>
            <p>Tabibi Platform — New Payment Receipt Received</p>
        </div>
        <div class="content">
            <div style="text-align: center;">
                <span class="badge">⏳ في انتظار مراجعة الإدارة / Pending Admin Review</span>
            </div>
            <p style="font-size: 14px; color: #cbd5e1; text-align: center;">
                قام مريض برفع إيصال تحويل جديد لحجز استشارة ${payload.isUrgent ? "طوارئ عاجلة" : "طبية"}. يرجى مراجعة الإيصال والتأكد من استلام المبلغ في الحساب.
            </p>

            <div class="info-card">
                <div class="info-row">
                    <span class="label">اسم المريض / Patient:</span>
                    <span class="value">${patientName}</span>
                </div>
                ${payload.patientPhone ? `
                <div class="info-row">
                    <span class="label">هاتف المحوّل / Phone:</span>
                    <span class="value" dir="ltr">${payload.patientPhone}</span>
                </div>` : ""}
                <div class="info-row">
                    <span class="label">الطبيب / Doctor:</span>
                    <span class="value">${doctorName}</span>
                </div>
                <div class="info-row">
                    <span class="label">طريقة التحويل / Method:</span>
                    <span class="value" style="color: #FD614B;">${methodLabelAr}</span>
                </div>
                ${payload.targetPhone ? `
                <div class="info-row">
                    <span class="label">الرقم المحوّل إليه / Target:</span>
                    <span class="value" dir="ltr">${payload.targetPhone}</span>
                </div>` : ""}
                <div class="info-row">
                    <span class="label">المبلغ المطلوب / Amount:</span>
                    <span class="value" style="color: #10b981; font-size: 16px;">${payload.amount} ج.م (EGP)</span>
                </div>
            </div>

            ${payload.receiptUrl ? `
            <div class="receipt-preview">
                <p style="color: #94a3b8; font-size: 13px; margin-bottom: 8px;">صورة الإيصال المرفقة / Receipt Image Preview:</p>
                ${payload.receiptUrl.startsWith("http") ? `
                <a href="${payload.receiptUrl}" target="_blank" style="display: block; margin-bottom: 8px;">
                    <img src="${payload.receiptUrl}" alt="إيصال التحويل" style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);" />
                </a>
                <p><a href="${payload.receiptUrl}" target="_blank" style="color: #FD614B; text-decoration: underline; font-weight: bold; font-size: 13px;">🔍 فتح صورة الإيصال بحجمها الكامل / View Full Image</a></p>
                ` : `
                <p style="color: #10b981; font-size: 13px;">(تم إرفاق صورة الإيصال كملف في أسفل هذا الإيميل / Attached below as an image file)</p>
                `}
            </div>` : ""}

            <!-- زر الموافقة الفوري المباشر من داخل الإيميل -->
            <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="${quickApproveUrl}" target="_blank" style="display: block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff !important; padding: 18px 24px; border-radius: 14px; font-weight: bold; font-size: 18px; text-decoration: none; box-shadow: 0 6px 20px rgba(16,185,129,0.35); border: 1px solid #34d399;">
                    ✓ موافقة واعتماد الدفع فوراً بضغطة واحدة<br/>
                    <span style="font-size: 13px; font-weight: normal; opacity: 0.95;">One-Click Instant Approval (No Login Required)</span>
                </a>
            </div>

            <p style="text-align: center; color: #10b981; font-size: 13px; margin: 0 0 20px 0; background: rgba(16,185,129,0.08); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(16,185,129,0.2);">
                ⚡ بمجرد الضغط على الزر الأخضر أعلاه، سيتم تأكيد الدفع فوراً وإشعار المريض والطبيب وفتح المكالمة مباشرة دون الحاجة لتسجيل الدخول للوحة الإدارة.
            </p>

            <!-- خيارات إضافية: رفض الإيصال أو فتح لوحة التحكم -->
            <div style="text-align: center; margin-bottom: 24px;">
                <a href="${quickRejectUrl}" target="_blank" style="display: inline-block; background: rgba(239,68,68,0.15); color: #f87171 !important; border: 1px solid rgba(239,68,68,0.4); padding: 10px 20px; border-radius: 10px; font-weight: bold; font-size: 13px; text-decoration: none; margin: 4px;">
                    ✕ رفض الإيصال (Reject)
                </a>
                <a href="${reviewUrl}" target="_blank" style="display: inline-block; background: rgba(255,255,255,0.05); color: #94a3b8 !important; border: 1px solid rgba(255,255,255,0.15); padding: 10px 20px; border-radius: 10px; font-weight: bold; font-size: 13px; text-decoration: none; margin: 4px;">
                    فتح لوحة التحكم (Dashboard)
                </a>
            </div>
        </div>
        <div class="footer">
            هذه الرسالة مرسلة تلقائياً إلى إدارة منصة طبيبي (${ADMIN_EMAIL})<br/>
            Automated notification to Tabibi Administration
        </div>
    </div>
</body>
</html>
        `;

        const attachments: any[] = [];
        if (payload.receiptUrl) {
            try {
                if (payload.receiptUrl.startsWith("data:")) {
                    const match = payload.receiptUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
                    if (match) {
                        const rawExt = match[1].toLowerCase();
                        const ext = rawExt.includes("jpeg") || rawExt.includes("jpg") ? "jpg" : "png";
                        attachments.push({
                            filename: `payment-receipt-${Date.now()}.${ext}`,
                            content: Buffer.from(match[2], "base64"),
                            contentType: `image/${ext === "jpg" ? "jpeg" : "png"}`,
                        });
                    }
                } else if (payload.receiptUrl.startsWith("http")) {
                    attachments.push({
                        filename: `payment-receipt-${Date.now()}.png`,
                        path: payload.receiptUrl,
                    });
                }
            } catch (attErr) {
                console.warn("Failed to prepare receipt email attachment:", attErr);
            }
        }

        await sendEmail({
            to: ADMIN_EMAIL,
            subject: `[طبيبي / Tabibi] إيصال دفع جديد بانتظار المراجعة - ${patientName} (${payload.amount} ج.م)`,
            html: emailHtml,
            text: `إيصال دفع جديد بانتظار المراجعة من ${patientName} بمبلغ ${payload.amount} ج.م عبر ${methodLabelAr}. رابط الاعتماد الفوري بضغطة واحدة: ${quickApproveUrl}`,
            attachments: attachments.length > 0 ? attachments : undefined,
        });
    } catch (err) {
        console.error("Error in notifyAdminNewPaymentReceipt:", err);
    }
}

/**
 * Notify Admin, Patient, and Doctor when a manual payment is APPROVED
 */
export async function notifyPaymentApproved(payload: {
    appointmentId?: string;
    patientProfileId?: string;
    doctorProfileId?: string;
    patientName: string;
    doctorName?: string;
    amount: number;
    method: string;
}) {
    try {
        const methodLabelAr = payload.method === "instapay" ? "إنستا باي (InstaPay)" : payload.method === "wepay" ? "وي باي (WE Pay)" : payload.method;
        const patientName = payload.patientName || "مريض / Patient";
        const doctorName = payload.doctorName || "طبيب معتمد / Verified Doctor";

        // 1. Notify Patient (In-App)
        if (payload.patientProfileId) {
            try {
                const title_ar = "تم اعتماد إيصال الدفع بنجاح ✅";
                const title_en = "Payment Approved Successfully ✅";
                const body_ar = `تمت مراجعة إيصال التحويل الخاص بك واعتماده من قِبل الإدارة. استشارتك مع ${doctorName} مؤكدة وجاهزة، يمكنك الانضمام الآن.`;
                const body_en = `Your transfer receipt was verified and approved by administration. Your consultation with ${doctorName} is confirmed and ready to join now.`;

                await createNotification({
                    profileId: payload.patientProfileId,
                    title: title_en,
                    body: body_en,
                    notificationType: "appointment_confirmation",
                    data: {
                        title_ar,
                        title_en,
                        body_ar,
                        body_en,
                        link: payload.appointmentId ? `/dashboard/consultation/${payload.appointmentId}/waiting-room` : "/dashboard/patient/appointments",
                    },
                });
            } catch (e) {
                console.warn("Could not notify patient in-app on approval:", e);
            }
        }

        // 2. Notify Doctor (In-App)
        if (payload.doctorProfileId) {
            try {
                const title_ar = "تم تأكيد دفع المريض بنجاح ✅";
                const title_en = "Patient Payment Confirmed ✅";
                const body_ar = `تم اعتماد إيصال تحويل المريض (${patientName}) بمبلغ ${payload.amount} ج.م لموعد الاستشارة. المريض جاهز الآن في غرفة الانتظار.`;
                const body_en = `Admin approved the transfer receipt for patient (${patientName}) (${payload.amount} EGP). Patient is ready in the waiting room.`;

                await createNotification({
                    profileId: payload.doctorProfileId,
                    title: title_en,
                    body: body_en,
                    notificationType: "appointment_confirmation",
                    data: {
                        title_ar,
                        title_en,
                        body_ar,
                        body_en,
                        appointmentId: payload.appointmentId,
                    },
                });
            } catch (e) {
                console.warn("Could not notify doctor in-app on approval:", e);
            }
        }

        // 3. Notify Admin via Bilingual Email to tbakr373@gmail.com
        const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #0b1526; color: #ffffff; padding: 20px; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #031326; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; text-align: center; }
        .badge { display: inline-block; background: rgba(16,185,129,0.15); color: #10b981; padding: 8px 18px; border-radius: 999px; font-weight: bold; font-size: 14px; margin-bottom: 16px; border: 1px solid rgba(16,185,129,0.3); }
        .btn { display: inline-block; background: linear-gradient(135deg, #044C87, #0C67B3); color: #ffffff !important; padding: 12px 24px; border-radius: 10px; font-weight: bold; text-decoration: none; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <span class="badge">✓ تم تأكيد واستلام المبلغ / Payment Verified</span>
        <h2 style="color: #ffffff; margin-top: 0;">تم تأكيد استلام الدفع بنجاح</h2>
        <p style="color: #cbd5e1;">
            تم اعتماد تحويل المريض <strong>${patientName}</strong> بمبلغ <strong>${payload.amount} ج.م</strong> (${methodLabelAr}) مع <strong>${doctorName}</strong>، وتم فتح إمكانية المكالمة للمريض والطبيب بنجاح.
        </p>
        <p style="color: #94a3b8; font-size: 13px;">
            Payment for patient <strong>${patientName}</strong> (${payload.amount} EGP) has been approved. The consultation link is now active.
        </p>
        <a href="${SITE_URL}/ar/dashboard/admin/appointments" class="btn">عرض المواعيد في لوحة الأدمن / View Appointments</a>
    </div>
</body>
</html>
        `;

        await sendEmail({
            to: ADMIN_EMAIL,
            subject: `[طبيبي] تم تأكيد واستلام المبلغ بنجاح - ${patientName} (${payload.amount} ج.م)`,
            html: emailHtml,
            text: `تم اعتماد إيصال تحويل ${patientName} بمبلغ ${payload.amount} ج.م (${methodLabelAr}) وتم فتح الاستشارة بنجاح.`,
        });
    } catch (err) {
        console.error("Error in notifyPaymentApproved:", err);
    }
}

/**
 * Notify Admin, Patient, and Doctor when a manual payment is REJECTED
 */
export async function notifyPaymentRejected(payload: {
    appointmentId?: string;
    patientProfileId?: string;
    doctorProfileId?: string;
    patientName: string;
    doctorName?: string;
    amount: number;
    method: string;
    reason: string;
}) {
    try {
        const methodLabelAr = payload.method === "instapay" ? "إنستا باي (InstaPay)" : payload.method === "wepay" ? "وي باي (WE Pay)" : payload.method;
        const patientName = payload.patientName || "مريض / Patient";
        const doctorName = payload.doctorName || "طبيب معتمد / Verified Doctor";

        // 1. Notify Patient In-App with the exact reason (Bilingual)
        if (payload.patientProfileId) {
            try {
                const title_ar = "تعذر اعتماد إيصال التحويل ❌";
                const title_en = "Payment Receipt Rejected ❌";
                const body_ar = `تمت مراجعة إيصال التحويل من قِبل الإدارة ولم يتم اعتماده للسبب التالي: ${payload.reason}. يمكنك إعادة المحاولة برفع إيصال صحيح.`;
                const body_en = `Your payment receipt was reviewed and could not be verified. Reason: ${payload.reason}. Please retry by uploading a valid receipt.`;

                await createNotification({
                    profileId: payload.patientProfileId,
                    title: title_en,
                    body: body_en,
                    notificationType: "appointment_cancelled",
                    data: {
                        title_ar,
                        title_en,
                        body_ar,
                        body_en,
                        link: "/dashboard/patient/appointments",
                        reason: payload.reason,
                    },
                });
            } catch (e) {
                console.warn("Could not notify patient in-app on rejection:", e);
            }
        }

        // 2. Notify Doctor In-App (Bilingual)
        if (payload.doctorProfileId) {
            try {
                const title_ar = "إلغاء حجز بسبب إيصال الدفع ❌";
                const title_en = "Appointment Cancelled (Payment Rejected) ❌";
                const body_ar = `تم رفض إيصال تحويل المريض (${patientName}) لموعد الاستشارة بسبب: ${payload.reason}. تم إلغاء الحجز تلقائياً.`;
                const body_en = `The payment receipt for patient (${patientName}) was rejected due to: ${payload.reason}. The appointment has been cancelled.`;

                await createNotification({
                    profileId: payload.doctorProfileId,
                    title: title_en,
                    body: body_en,
                    notificationType: "appointment_cancelled",
                    data: {
                        title_ar,
                        title_en,
                        body_ar,
                        body_en,
                        appointmentId: payload.appointmentId,
                        reason: payload.reason,
                    },
                });
            } catch (e) {
                console.warn("Could not notify doctor in-app on rejection:", e);
            }
        }

        // 3. Notify Admin via Bilingual Email to tbakr373@gmail.com
        const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #0b1526; color: #ffffff; padding: 20px; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #031326; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; text-align: center; }
        .badge { display: inline-block; background: rgba(239,68,68,0.15); color: #ef4444; padding: 8px 18px; border-radius: 999px; font-weight: bold; font-size: 14px; margin-bottom: 16px; border: 1px solid rgba(239,68,68,0.3); }
        .reason-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 12px; margin: 16px 0; color: #fca5a5; font-size: 14px; text-align: start; }
    </style>
</head>
<body>
    <div class="container">
        <span class="badge">✕ تم رفض إيصال التحويل / Receipt Rejected</span>
        <h2 style="color: #ffffff; margin-top: 0;">تم رفض إيصال الدفع وإلغاء الموعد</h2>
        <p style="color: #cbd5e1;">
            تم رفض إيصال التحويل للمريض <strong>${patientName}</strong> بمبلغ <strong>${payload.amount} ج.م</strong> (${methodLabelAr}) مع <strong>${doctorName}</strong>.
        </p>
        <div class="reason-box">
            <strong>سبب الرفض المسجل / Rejection Reason:</strong><br/>
            ${payload.reason}
        </div>
        <p style="color: #94a3b8; font-size: 13px;">تم إخطار المريض والطبيب بالسبب تلقائياً.</p>
    </div>
</body>
</html>
        `;

        await sendEmail({
            to: ADMIN_EMAIL,
            subject: `[طبيبي / Tabibi] تم رفض إيصال التحويل - ${patientName} (${payload.reason})`,
            html: emailHtml,
            text: `تم رفض إيصال التحويل للمريض ${patientName} بمبلغ ${payload.amount} ج.م (${methodLabelAr}). سبب الرفض: ${payload.reason}`,
        });
    } catch (err) {
        console.error("Error in notifyPaymentRejected:", err);
    }
}

/**
 * Notify all parties (Admin, Doctor, Patient) when an appointment is CANCELLED
 */
export async function notifyAppointmentCancelledAllParties(payload: {
    appointmentId: string;
    cancelledByRole: "patient" | "doctor" | "admin";
    cancellerName: string;
    doctorUserProfId?: string;
    patientUserProfId?: string;
    doctorName?: string;
    patientName?: string;
    appointmentDate?: string;
    reason?: string;
}) {
    try {
        const serviceRole = await createServiceRoleClient();
        const dateStr = payload.appointmentDate || "الموعد المحدد";
        const reasonText = payload.reason ? ` (السبب: ${payload.reason})` : "";
        const reasonTextEn = payload.reason ? ` (Reason: ${payload.reason})` : "";

        // 1. Notify Patient if cancelled by doctor or admin
        if (payload.patientUserProfId && payload.cancelledByRole !== "patient") {
            const title_ar = "تم إلغاء موعد الاستشارة ❌";
            const title_en = "Appointment Cancelled ❌";
            const body_ar = `اعتذر ${payload.cancellerName} عن موعد الاستشارة بتاريخ ${dateStr}.${reasonText}`;
            const body_en = `${payload.cancellerName} has cancelled the appointment on ${dateStr}.${reasonTextEn}`;

            await createNotification({
                profileId: payload.patientUserProfId,
                title: title_en,
                body: body_en,
                notificationType: "appointment_cancelled",
                data: {
                    title_ar,
                    title_en,
                    body_ar,
                    body_en,
                    appointmentId: payload.appointmentId,
                },
            }).catch((e) => console.warn("Failed notifying patient of cancellation:", e));
        }

        // 2. Notify Doctor if cancelled by patient or admin
        if (payload.doctorUserProfId && payload.cancelledByRole !== "doctor") {
            const title_ar = "إلغاء موعد استشارة ❌";
            const title_en = "Appointment Cancelled ❌";
            const body_ar = `قام ${payload.cancellerName} بإلغاء موعد الاستشارة بتاريخ ${dateStr}.${reasonText}`;
            const body_en = `${payload.cancellerName} cancelled the appointment scheduled on ${dateStr}.${reasonTextEn}`;

            await createNotification({
                profileId: payload.doctorUserProfId,
                title: title_en,
                body: body_en,
                notificationType: "appointment_cancelled",
                data: {
                    title_ar,
                    title_en,
                    body_ar,
                    body_en,
                    appointmentId: payload.appointmentId,
                },
            }).catch((e) => console.warn("Failed notifying doctor of cancellation:", e));
        }

        // 3. Notify Admins (In-App)
        const { data: adminProfiles } = await (serviceRole as any)
            .from("profiles")
            .select("id")
            .eq("role", "admin");

        if (adminProfiles && adminProfiles.length > 0) {
            const title_ar = "إلغاء موعد في المنصة ℹ️";
            const title_en = "Appointment Cancelled ℹ️";
            const body_ar = `قام ${payload.cancellerName} (${payload.cancelledByRole === "doctor" ? "طبيب" : "مريض"}) بإلغاء موعد الاستشارة بتاريخ ${dateStr}.${reasonText}`;
            const body_en = `${payload.cancellerName} (${payload.cancelledByRole}) has cancelled the appointment on ${dateStr}.${reasonTextEn}`;

            await Promise.all(
                adminProfiles.map((adm: { id: string }) =>
                    createNotification({
                        profileId: adm.id,
                        title: title_en,
                        body: body_en,
                        notificationType: "appointment_cancelled",
                        data: {
                            title_ar,
                            title_en,
                            body_ar,
                            body_en,
                            appointmentId: payload.appointmentId,
                        },
                    }).catch((e) => console.warn("Failed notifying admin of cancellation:", e))
                )
            );
        }
    } catch (err) {
        console.error("Error in notifyAppointmentCancelledAllParties:", err);
    }
}
