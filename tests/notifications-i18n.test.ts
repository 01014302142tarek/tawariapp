import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getLocalizedNotificationText } from "@/lib/utils/notification-i18n";

describe("Bilingual Notification Localization Engine", () => {
    describe("Arabic Display (isRTL = true)", () => {
        it("returns data.title_ar and data.body_ar when provided", () => {
            const notif = {
                title: "English Title",
                body: "English Body",
                data: {
                    title_ar: "تم تأكيد الدفع بنجاح ✅",
                    title_en: "Payment Approved Successfully ✅",
                    body_ar: "تمت مراجعة إيصال التحويل الخاص بك واعتماده.",
                    body_en: "Your payment receipt was verified and approved.",
                },
            };
            const result = getLocalizedNotificationText(notif, true);
            assert.equal(result.title, "تم تأكيد الدفع بنجاح ✅");
            assert.equal(result.body, "تمت مراجعة إيصال التحويل الخاص بك واعتماده.");
        });

        it("translates legacy English 'Appointment Confirmed' to Arabic", () => {
            const notif = {
                title: "Appointment Confirmed",
                body: "Your appointment with Dr. Tarek on Monday has been confirmed.",
                data: {},
            };
            const result = getLocalizedNotificationText(notif, true);
            assert.equal(result.title, "تم تأكيد موعد الاستشارة ✅");
            assert.match(result.body, /تم تأكيد موعدك مع Dr\. Tarek بتاريخ Monday\./);
        });

        it("translates legacy English 'Appointment Cancelled' to Arabic", () => {
            const notif = {
                title: "Appointment Cancelled",
                body: "Your appointment with patient Ahmed on Tuesday has been cancelled.",
                data: {},
            };
            const result = getLocalizedNotificationText(notif, true);
            assert.equal(result.title, "تم إلغاء الموعد ❌");
            assert.match(result.body, /تم إلغاء موعدك مع المريض Ahmed بتاريخ Tuesday\./);
        });

        it("translates legacy English 'New Appointment' to Arabic", () => {
            const notif = {
                title: "New Appointment",
                body: "New appointment with Sara scheduled for Wednesday.",
                data: {},
            };
            const result = getLocalizedNotificationText(notif, true);
            assert.equal(result.title, "موعد جديد 📅");
            assert.match(result.body, /تم حجز موعد جديد مع Sara بتاريخ Wednesday\./);
        });

        it("translates legacy English 'New Prescription' to Arabic", () => {
            const notif = {
                title: "New Prescription",
                body: "Dr. Ahmed has prescribed Panadol for you.",
                data: {},
            };
            const result = getLocalizedNotificationText(notif, true);
            assert.equal(result.title, "روشتة طبية جديدة 💊");
            assert.match(result.body, /قام Dr\. Ahmed بإصدار روشتة طبية لك تحتوي على: Panadol\./);
        });
    });

    describe("English Display (isRTL = false)", () => {
        it("returns data.title_en and data.body_en when provided", () => {
            const notif = {
                title: "تم تأكيد الدفع بنجاح ✅",
                body: "تمت مراجعة إيصال التحويل الخاص بك واعتماده.",
                data: {
                    title_ar: "تم تأكيد الدفع بنجاح ✅",
                    title_en: "Payment Approved Successfully ✅",
                    body_ar: "تمت مراجعة إيصال التحويل الخاص بك واعتماده.",
                    body_en: "Your payment receipt was verified and approved.",
                },
            };
            const result = getLocalizedNotificationText(notif, false);
            assert.equal(result.title, "Payment Approved Successfully ✅");
            assert.equal(result.body, "Your payment receipt was verified and approved.");
        });

        it("translates Arabic 'تم اعتماد إيصال الدفع' to English", () => {
            const notif = {
                title: "تم اعتماد إيصال الدفع بنجاح ✅",
                body: "استشارتك مع الطبيب مؤكدة وجاهزة، يمكنك الانضمام الآن.",
                data: {},
            };
            const result = getLocalizedNotificationText(notif, false);
            assert.equal(result.title, "Payment Approved Successfully ✅");
            assert.match(result.body, /Your consultation is ready to join/i);
        });

        it("translates Arabic 'تعذر اعتماد إيصال' with reason to English", () => {
            const notif = {
                title: "تعذر اعتماد إيصال التحويل ❌",
                body: "تمت مراجعة إيصال التحويل من قِبل الإدارة ولم يتم اعتماده للسبب التالي: الصورة غير واضحة.",
                data: {},
            };
            const result = getLocalizedNotificationText(notif, false);
            assert.equal(result.title, "Payment Receipt Rejected ❌");
            assert.match(result.body, /الصورة غير واضحة/);
        });

        it("translates Arabic urgent turn alert to English", () => {
            const notif = {
                title: "حان دورك في الكشف العاجل! 📹",
                body: "الطبيب بانتظارك الآن في غرفة الكشف. اضغط للدخول.",
                data: {},
            };
            const result = getLocalizedNotificationText(notif, false);
            assert.equal(result.title, "It's your turn for consultation! 📹");
            assert.match(result.body, /The doctor is waiting for you now/);
        });
    });
});

