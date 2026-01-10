/**
 * Email Service
 *
 * This module provides email notification functionality.
 * Currently uses console logging as a placeholder.
 *
 * To integrate with an email provider:
 * 1. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD to .env.local
 * 2. Or use a service like Resend, SendGrid, or AWS SES
 * 3. Update the sendEmail function to use the provider's API
 */

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Send an email
 * Currently logs to console - replace with actual email provider
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
    // In development/production without email config, log the email
    console.log("[EMAIL SERVICE] Sending email:");
    console.log(`  To: ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    console.log(`  Body Preview: ${options.text?.substring(0, 100) || options.html.substring(0, 100)}...`);

    // TODO: Integrate with email provider
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const { data, error } = await resend.emails.send({
    //     from: 'Tawari <noreply@www.tawariapp.com>',
    //     to: options.to,
    //     subject: options.subject,
    //     html: options.html,
    // });

    // For now, simulate success
    return {
        success: true,
        messageId: `mock-${Date.now()}`,
    };
}

/**
 * Email template for doctor verification approval
 */
export function getDoctorApprovalEmailHtml(doctorName: string, language: "en" | "ar" = "en"): string {
    if (language === "ar") {
        return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>تهانينا! تم اعتماد حسابك</h1>
        </div>
        <div class="content">
            <p>مرحباً دكتور ${doctorName}،</p>
            <p>يسعدنا إبلاغك بأنه تم <strong>اعتماد طلبك</strong> للانضمام إلى منصة تواري كطبيب معتمد.</p>
            <p>يمكنك الآن:</p>
            <ul>
                <li>تحديد مواعيد الاستشارات الخاصة بك</li>
                <li>استقبال حجوزات المرضى</li>
                <li>إجراء استشارات فيديو مع المرضى</li>
                <li>إدارة ملفك الشخصي والأرباح</li>
            </ul>
            <p style="text-align: center;">
                <a href="https://www.tawariapp.com/ar/login" class="button">تسجيل الدخول الآن</a>
            </p>
            <p>شكراً لانضمامك إلى تواري!</p>
        </div>
        <div class="footer">
            <p>فريق تواري</p>
            <p>هذه رسالة آلية، يرجى عدم الرد عليها.</p>
        </div>
    </div>
</body>
</html>
        `.trim();
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Congratulations! You're Verified</h1>
        </div>
        <div class="content">
            <p>Dear Dr. ${doctorName},</p>
            <p>We're pleased to inform you that your application has been <strong>approved</strong> to join Tawari as a verified doctor.</p>
            <p>You can now:</p>
            <ul>
                <li>Set your consultation availability</li>
                <li>Receive patient bookings</li>
                <li>Conduct video consultations</li>
                <li>Manage your profile and earnings</li>
            </ul>
            <p style="text-align: center;">
                <a href="https://www.tawariapp.com/en/login" class="button">Login Now</a>
            </p>
            <p>Thank you for joining Tawari!</p>
        </div>
        <div class="footer">
            <p>The Tawari Team</p>
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Email template for doctor verification rejection
 */
export function getDoctorRejectionEmailHtml(
    doctorName: string,
    reason: string,
    language: "en" | "ar" = "en"
): string {
    if (language === "ar") {
        return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f1f5f9; color: #475569; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; border-bottom: 3px solid #e2e8f0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .reason-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>تحديث بخصوص طلبك</h1>
        </div>
        <div class="content">
            <p>مرحباً دكتور ${doctorName}،</p>
            <p>نشكرك على اهتمامك بالانضمام إلى منصة تواري. بعد مراجعة طلبك، لم نتمكن من الموافقة عليه في الوقت الحالي.</p>
            <div class="reason-box">
                <strong>السبب:</strong>
                <p>${reason}</p>
            </div>
            <p>يمكنك تحديث معلوماتك وإعادة التقديم. إذا كانت لديك أي أسئلة، يرجى التواصل مع فريق الدعم.</p>
            <p style="text-align: center;">
                <a href="https://www.tawariapp.com/ar/contact" class="button">تواصل معنا</a>
            </p>
        </div>
        <div class="footer">
            <p>فريق تواري</p>
            <p>هذه رسالة آلية، يرجى عدم الرد عليها.</p>
        </div>
    </div>
</body>
</html>
        `.trim();
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f1f5f9; color: #475569; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; border-bottom: 3px solid #e2e8f0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .reason-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Update on Your Application</h1>
        </div>
        <div class="content">
            <p>Dear Dr. ${doctorName},</p>
            <p>Thank you for your interest in joining Tawari. After reviewing your application, we were unable to approve it at this time.</p>
            <div class="reason-box">
                <strong>Reason:</strong>
                <p>${reason}</p>
            </div>
            <p>You can update your information and reapply. If you have any questions, please contact our support team.</p>
            <p style="text-align: center;">
                <a href="https://www.tawariapp.com/en/contact" class="button">Contact Us</a>
            </p>
        </div>
        <div class="footer">
            <p>The Tawari Team</p>
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Get plain text version of approval email
 */
export function getDoctorApprovalEmailText(doctorName: string, language: "en" | "ar" = "en"): string {
    if (language === "ar") {
        return `
تهانينا! تم اعتماد حسابك

مرحباً دكتور ${doctorName}،

يسعدنا إبلاغك بأنه تم اعتماد طلبك للانضمام إلى منصة تواري كطبيب معتمد.

يمكنك الآن:
- تحديد مواعيد الاستشارات الخاصة بك
- استقبال حجوزات المرضى
- إجراء استشارات فيديو مع المرضى
- إدارة ملفك الشخصي والأرباح

قم بتسجيل الدخول الآن: https://www.tawariapp.com/ar/login

شكراً لانضمامك إلى تواري!

فريق تواري
        `.trim();
    }

    return `
Congratulations! You're Verified

Dear Dr. ${doctorName},

We're pleased to inform you that your application has been approved to join Tawari as a verified doctor.

You can now:
- Set your consultation availability
- Receive patient bookings
- Conduct video consultations
- Manage your profile and earnings

Login now: https://www.tawariapp.com/en/login

Thank you for joining Tawari!

The Tawari Team
    `.trim();
}

/**
 * Get plain text version of rejection email
 */
export function getDoctorRejectionEmailText(
    doctorName: string,
    reason: string,
    language: "en" | "ar" = "en"
): string {
    if (language === "ar") {
        return `
تحديث بخصوص طلبك

مرحباً دكتور ${doctorName}،

نشكرك على اهتمامك بالانضمام إلى منصة تواري. بعد مراجعة طلبك، لم نتمكن من الموافقة عليه في الوقت الحالي.

السبب: ${reason}

يمكنك تحديث معلوماتك وإعادة التقديم. إذا كانت لديك أي أسئلة، يرجى التواصل مع فريق الدعم.

تواصل معنا: https://www.tawariapp.com/ar/contact

فريق تواري
        `.trim();
    }

    return `
Update on Your Application

Dear Dr. ${doctorName},

Thank you for your interest in joining Tawari. After reviewing your application, we were unable to approve it at this time.

Reason: ${reason}

You can update your information and reapply. If you have any questions, please contact our support team.

Contact us: https://www.tawariapp.com/en/contact

The Tawari Team
    `.trim();
}
