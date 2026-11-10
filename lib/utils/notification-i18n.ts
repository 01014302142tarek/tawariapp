/**
 * Bilingual Notification Localization Engine
 * Provides localized (Arabic / English) title and body for all notifications
 * based on the active UI language (isRTL).
 */

export interface LocalizableNotification {
    title: string;
    body: string;
    notification_type?: string;
    data?: Record<string, unknown> | null;
}

export function getLocalizedNotificationText(
    notification: LocalizableNotification,
    isRTL: boolean
): { title: string; body: string } {
    const data = (notification.data || {}) as Record<string, unknown>;

    // 1. Direct match if bilingual fields are present in data
    if (isRTL) {
        if (typeof data.title_ar === "string" && data.title_ar.trim().length > 0) {
            return {
                title: data.title_ar,
                body: typeof data.body_ar === "string" && data.body_ar.trim().length > 0 ? data.body_ar : notification.body,
            };
        }
    } else {
        if (typeof data.title_en === "string" && data.title_en.trim().length > 0) {
            return {
                title: data.title_en,
                body: typeof data.body_en === "string" && data.body_en.trim().length > 0 ? data.body_en : notification.body,
            };
        }
    }

    const rawTitle = (notification.title || "").trim();
    const rawBody = (notification.body || "").trim();

    // 2. Fallback translations when notification was recorded in only one language
    if (isRTL) {
        // --- ARABIC MODE: Translate English notifications to Arabic ---
        if (/Appointment Confirmed/i.test(rawTitle)) {
            return {
                title: "تم تأكيد موعد الاستشارة ✅",
                body: rawBody.replace(/Your appointment with (.*?) on (.*?) has been confirmed\./i, "تم تأكيد موعدك مع $1 بتاريخ $2."),
            };
        }
        if (/Appointment Cancelled|Appointment Canceled/i.test(rawTitle)) {
            return {
                title: "تم إلغاء الموعد ❌",
                body: rawBody
                    .replace(/Your appointment with patient (.*?) on (.*?) has been cancelled\./i, "تم إلغاء موعدك مع المريض $1 بتاريخ $2.")
                    .replace(/Your appointment with (.*?) on (.*?) has been cancelled\./i, "تم إلغاء موعدك مع $1 بتاريخ $2."),
            };
        }
        if (/New Appointment/i.test(rawTitle)) {
            return {
                title: "موعد جديد 📅",
                body: rawBody.replace(/New appointment (?:booked )?with (.*?) (?:scheduled for|on) (.*?)\./i, "تم حجز موعد جديد مع $1 بتاريخ $2."),
            };
        }
        if (/Appointment Reminder/i.test(rawTitle)) {
            return {
                title: "تذكير بموعد الاستشارة ⏰",
                body: rawBody.replace(/Reminder: Your appointment with (?:patient )?(.*?) is on (.*?)\./i, "تذكير: موعدك مع $1 في $2."),
            };
        }
        if (/New Prescription/i.test(rawTitle)) {
            return {
                title: "روشتة طبية جديدة 💊",
                body: rawBody.replace(/(.*?) has prescribed (.*?) for you\./i, "قام $1 بإصدار روشتة طبية لك تحتوي على: $2."),
            };
        }
        if (/Prescription Renewal/i.test(rawTitle)) {
            return {
                title: "تجديد روشتة طبية 📋",
                body: rawBody
                    .replace(/(.*?) has requested a renewal for (.*?)\./i, "طلب $1 تجديد الروشتة لـ $2.")
                    .replace(/Your renewal request for (.*?) has been approved\./i, "تمت الموافقة على طلب تجديد $1.")
                    .replace(/Your renewal request for (.*?) has been denied\./i, "تعذر قبول طلب تجديد $1."),
            };
        }
        if (/New Message/i.test(rawTitle)) {
            return {
                title: "رسالة جديدة 💬",
                body: rawBody.replace(/You have a new message from (.*?)\./i, "لديك رسالة جديدة من $1."),
            };
        }
        if (/Payment Successful|Payment Success/i.test(rawTitle)) {
            return {
                title: "تم الدفع بنجاح ✅",
                body: rawBody.replace(/Your payment of (.*?) has been processed successfully\./i, "تم سداد مبلغ $1 بنجاح."),
            };
        }
        if (/Verification Approved|Doctor Verification/i.test(rawTitle)) {
            return {
                title: "تم توثيق الحساب بنجاح 🩺",
                body: "تهانينا! تم توثيق حسابك الطبي بنجاح. يمكنك الآن استقبال المرضى ومواعيد الاستشارات.",
            };
        }
        return { title: rawTitle, body: rawBody };
    } else {
        // --- ENGLISH MODE: Translate Arabic notifications to English ---
        if (/تم اعتماد إيصال الدفع|تم اعتماد الدفع|تم تأكيد دفع/i.test(rawTitle)) {
            return {
                title: "Payment Approved Successfully ✅",
                body: rawBody.includes("استشارتك")
                    ? "Your transfer receipt was verified and approved. Your consultation is ready to join."
                    : "The transfer receipt has been verified and approved by administration.",
            };
        }
        if (/تعذر اعتماد إيصال|تم رفض إيصال|إلغاء حجز بسبب إيصال/i.test(rawTitle)) {
            const reasonMatch = rawBody.match(/(?:سبب الرفض|للسبب التالي|بسبب)(?: المسجل)?:?\s*(.*?)(?:\.|$)/i);
            const reason = reasonMatch ? reasonMatch[1] : "";
            return {
                title: "Payment Receipt Rejected ❌",
                body: reason ? `Payment receipt was rejected. Reason: ${reason}` : "Your payment receipt could not be verified by administration.",
            };
        }
        if (/إيصال دفع جديد|إيصال استشارة عاجلة/i.test(rawTitle)) {
            return {
                title: "New Payment Receipt Pending Review 📋",
                body: "A new payment receipt has been submitted and is currently under review by administration.",
            };
        }
        if (/تم استلام إيصال|طلب استشارة عاجلة/i.test(rawTitle)) {
            return {
                title: "Payment Receipt Received ⏳",
                body: "Your transfer receipt was received and is being verified by administration.",
            };
        }
        if (/حان دورك في الكشف/i.test(rawTitle)) {
            return {
                title: "It's your turn for consultation! 📹",
                body: "The doctor is waiting for you now in the video consultation room. Click to join.",
            };
        }
        if (/مريض جديد في قائمة|مريض جديد في الطوارئ/i.test(rawTitle)) {
            return {
                title: "New Patient in Queue 👥",
                body: "A new patient has joined your consultation queue.",
            };
        }
        if (/تم تغيير موعد الكشف/i.test(rawTitle)) {
            return {
                title: "Appointment Rescheduled 📅",
                body: "The consultation appointment has been rescheduled.",
            };
        }
        if (/تم إلغاء الموعد|إلغاء موعد/i.test(rawTitle)) {
            return {
                title: "Appointment Cancelled ❌",
                body: "The consultation appointment has been cancelled.",
            };
        }
        if (/تم تأكيد موعد/i.test(rawTitle)) {
            return {
                title: "Appointment Confirmed ✅",
                body: "Your consultation appointment has been confirmed.",
            };
        }
        return { title: rawTitle, body: rawBody };
    }
}
