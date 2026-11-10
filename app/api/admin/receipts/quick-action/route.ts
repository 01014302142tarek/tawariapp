import { NextRequest, NextResponse } from "next/server";
import { verifyReceiptActionToken } from "@/lib/security/receipt-token";
import { executePaymentApproval, executePaymentRejection } from "@/lib/payments/manual-approval";

export const dynamic = "force-dynamic";

function renderHtmlResponse(params: {
    status: "success" | "already" | "error" | "reject_confirm";
    title: string;
    message: string;
    details?: {
        patient?: string;
        doctor?: string;
        amount?: number;
        method?: string;
        reason?: string;
    };
    token?: string;
}) {
    const isSuccess = params.status === "success" || params.status === "already";
    const statusColor = isSuccess ? "#10b981" : params.status === "reject_confirm" ? "#f59e0b" : "#ef4444";
    const statusBadge = params.status === "success"
        ? "✓ تم الاعتماد بنجاح وتأكيد الاستشارة"
        : params.status === "already"
        ? "✓ معتمد مسبقاً ومفعل حالياً"
        : params.status === "reject_confirm"
        ? "تأكيد رفض الإيصال"
        : "تعذر تنفيذ العملية";

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${params.title} — منصة طبيبي</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            background-color: #031326;
            color: #ffffff;
            margin: 0;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .card {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            max-width: 550px;
            width: 100%;
            padding: 36px 28px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            backdrop-filter: blur(10px);
        }
        .icon-circle {
            width: 76px;
            height: 76px;
            border-radius: 50%;
            background: ${statusColor}1A;
            border: 2px solid ${statusColor};
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 34px;
        }
        .badge {
            display: inline-block;
            background: ${statusColor}22;
            color: ${statusColor};
            border: 1px solid ${statusColor}55;
            padding: 6px 16px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 16px;
        }
        h1 {
            color: #ffffff;
            font-size: 22px;
            margin: 0 0 12px 0;
            font-weight: 800;
        }
        p.msg {
            color: #cbd5e1;
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 24px 0;
        }
        .info-box {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 12px;
            padding: 16px;
            margin: 20px 0;
            text-align: right;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            font-size: 14px;
        }
        .info-row:last-child { border-bottom: none; }
        .label { color: #94a3b8; }
        .value { color: #ffffff; font-weight: bold; }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #044C87, #0C67B3);
            color: #ffffff !important;
            padding: 12px 28px;
            border-radius: 10px;
            font-weight: bold;
            text-decoration: none;
            margin-top: 20px;
            font-size: 14px;
        }
        .btn-danger {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            border: none;
            color: #fff;
            padding: 12px 28px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 15px;
            cursor: pointer;
            margin-top: 15px;
            width: 100%;
        }
        .form-group {
            text-align: right;
            margin: 16px 0;
        }
        .form-group label {
            display: block;
            color: #94a3b8;
            font-size: 13px;
            margin-bottom: 6px;
        }
        .form-group select, .form-group textarea {
            width: 100%;
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 8px;
            padding: 10px;
            color: #fff;
            font-family: inherit;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-circle">
            ${isSuccess ? "✓" : params.status === "reject_confirm" ? "⚠️" : "✕"}
        </div>
        <span class="badge">${statusBadge}</span>
        <h1>${params.title}</h1>
        <p class="msg">${params.message}</p>

        ${params.details ? `
        <div class="info-box">
            ${params.details.patient ? `<div class="info-row"><span class="label">المريض:</span><span class="value">${params.details.patient}</span></div>` : ""}
            ${params.details.doctor ? `<div class="info-row"><span class="label">الطبيب:</span><span class="value">${params.details.doctor}</span></div>` : ""}
            ${params.details.amount ? `<div class="info-row"><span class="label">المبلغ:</span><span class="value" style="color: #10b981;">${params.details.amount} ج.م</span></div>` : ""}
            ${params.details.method ? `<div class="info-row"><span class="label">طريقة الدفع:</span><span class="value">${params.details.method === "instapay" ? "إنستا باي" : params.details.method === "wepay" ? "وي باي" : params.details.method}</span></div>` : ""}
            ${params.details.reason ? `<div class="info-row"><span class="label">سبب الرفض:</span><span class="value" style="color: #ef4444;">${params.details.reason}</span></div>` : ""}
        </div>
        ` : ""}

        ${params.status === "reject_confirm" ? `
        <form method="POST" action="/api/admin/receipts/quick-action">
            <input type="hidden" name="token" value="${params.token}" />
            <input type="hidden" name="action" value="reject" />
            <input type="hidden" name="confirm" value="1" />
            <div class="form-group">
                <label>سبب الرفض الذي سيظهر للمريض في الإشعار:</label>
                <select name="reason_preset" onchange="document.getElementById('customReason').value = this.value;">
                    <option value="لم يتم استلام المبلغ في الحساب أو المحفظة">لم يتم استلام المبلغ في الحساب أو المحفظة</option>
                    <option value="صورة إيصال التحويل غير واضحة أو ناقصة">صورة إيصال التحويل غير واضحة أو ناقصة</option>
                    <option value="المبلغ المحوّل غير مطابق للرسوم المقررة">المبلغ المحوّل غير مطابق للرسوم المقررة</option>
                    <option value="اسم المحوّل أو البيانات غير مطابقة">اسم المحوّل أو البيانات غير مطابقة</option>
                </select>
            </div>
            <div class="form-group">
                <label>أو اكتب سبباً مخصصاً:</label>
                <textarea id="customReason" name="reason" rows="2" placeholder="اكتب سبباً إضافياً إن رغبت...">لم يتم استلام المبلغ في الحساب أو المحفظة</textarea>
            </div>
            <button type="submit" class="btn-danger">تأكيد رفض الإيصال وإشعار المريض الآن</button>
        </form>
        ` : `
        <a href="/ar/dashboard/admin/appointments" class="btn">الانتقال للوحة تحكم الإدارة</a>
        `}
    </div>
</body>
</html>`;

    return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const requestedAction = url.searchParams.get("action");
    const confirm = url.searchParams.get("confirm");
    const reasonParam = url.searchParams.get("reason");

    if (!token) {
        return renderHtmlResponse({
            status: "error",
            title: "رمز غير موجود",
            message: "الرابط المطلوب يفتقر إلى رمز التحقق الأمني المخصص.",
        });
    }

    const verification = verifyReceiptActionToken(token);
    if (!verification.valid || !verification.data) {
        return renderHtmlResponse({
            status: "error",
            title: "رابط غير صالح",
            message: verification.error || "عذراً، هذا الرابط غير صالح أو انتهت صلاحيته.",
        });
    }

    const { transactionId, appointmentId, queueEntryId, action: tokenAction } = verification.data;
    const action = requestedAction || tokenAction;

    // === ACTION: APPROVE ===
    if (action === "approve") {
        const result = await executePaymentApproval({
            transactionId,
            appointmentId,
            queueEntryId,
        });

        if (!result.success) {
            return renderHtmlResponse({
                status: "error",
                title: "فشل اعتماد الدفع",
                message: result.error || "حدث خطأ أثناء محاولة اعتماد الدفع في قاعدة البيانات.",
            });
        }

        if (result.alreadyProcessed) {
            return renderHtmlResponse({
                status: "already",
                title: "الموعد معتمد مسبقاً",
                message: "تم اعتماد هذا الإيصال وتأكيد الاستشارة من قبل بالفعل، والخدمة مفعلة للمريض والطبيب.",
                details: {
                    patient: result.patientName,
                    doctor: result.doctorName,
                    amount: result.amount,
                    method: result.method,
                },
            });
        }

        return renderHtmlResponse({
            status: "success",
            title: "تم اعتماد الدفع وتأكيد الموعد بنجاح! 🎉",
            message: `تم اعتماد إيصال المريض وتأكيد الموعد بنجاح تام. تم إشعار المريض (${result.patientName}) والدكتور (${result.doctorName}) فورياً، وأصبح بإمكانهما الانضمام للاستشارة وإجراء المكالمة الآن.`,
            details: {
                patient: result.patientName,
                doctor: result.doctorName,
                amount: result.amount,
                method: result.method,
            },
        });
    }

    // === ACTION: REJECT ===
    if (action === "reject") {
        if (confirm !== "1") {
            // Show confirmation form
            return renderHtmlResponse({
                status: "reject_confirm",
                title: "هل ترغب في رفض إيصال التحويل؟",
                message: "يرجى اختيار سبب الرفض لتأكيد العملية وإخطار المريض فورياً.",
                token,
            });
        }

        const reason = reasonParam || "لم يتم استلام المبلغ في الحساب أو الإيصال غير مطابق";
        const result = await executePaymentRejection({
            transactionId,
            appointmentId,
            queueEntryId,
            reason,
        });

        if (!result.success) {
            return renderHtmlResponse({
                status: "error",
                title: "فشل رفض الإيصال",
                message: result.error || "حدث خطأ أثناء محاولة رفض الإيصال.",
            });
        }

        return renderHtmlResponse({
            status: "success",
            title: "تم رفض الإيصال بنجاح",
            message: `تم رفض الإيصال وإلغاء الموعد. تم إشعار المريض بالسبب: (${reason}).`,
            details: {
                patient: result.patientName,
                doctor: result.doctorName,
                amount: result.amount,
                method: result.method,
                reason,
            },
        });
    }

    return renderHtmlResponse({
        status: "error",
        title: "إجراء غير معروف",
        message: "نوع العملية المطلوبة غير معرّف.",
    });
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const token = formData.get("token") as string;
        const action = formData.get("action") as string;
        const reason = (formData.get("reason") as string) || (formData.get("reason_preset") as string) || "لم يتم استلام المبلغ في الحساب أو الإيصال غير مطابق";

        if (!token) {
            return renderHtmlResponse({
                status: "error",
                title: "رمز غير موجود",
                message: "البيانات المرسلة تفتقر إلى رمز التحقق الأمني.",
            });
        }

        const verification = verifyReceiptActionToken(token);
        if (!verification.valid || !verification.data) {
            return renderHtmlResponse({
                status: "error",
                title: "رابط غير صالح",
                message: verification.error || "عذراً، هذا الرمز غير صالح أو منتهي الصلاحية.",
            });
        }

        const { transactionId, appointmentId, queueEntryId } = verification.data;

        if (action === "reject") {
            const result = await executePaymentRejection({
                transactionId,
                appointmentId,
                queueEntryId,
                reason,
            });

            if (!result.success) {
                return renderHtmlResponse({
                    status: "error",
                    title: "فشل رفض الإيصال",
                    message: result.error || "حدث خطأ أثناء محاولة رفض الإيصال.",
                });
            }

            return renderHtmlResponse({
                status: "success",
                title: "تم رفض الإيصال بنجاح",
                message: `تم رفض الإيصال وإلغاء الموعد. تم إشعار المريض والدكتور فورياً بالسبب: (${reason}).`,
                details: {
                    patient: result.patientName,
                    doctor: result.doctorName,
                    amount: result.amount,
                    method: result.method,
                    reason,
                },
            });
        }

        return renderHtmlResponse({
            status: "error",
            title: "إجراء غير مدعوم",
            message: "العملية المطلوبة غير صالحة.",
        });
    } catch (e: any) {
        return renderHtmlResponse({
            status: "error",
            title: "خطأ غير متوقع",
            message: e?.message || "حدث خطأ أثناء معالجة الطلب.",
        });
    }
}
