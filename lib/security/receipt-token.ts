import crypto from "crypto";

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.RESEND_API_KEY || "tabibi-quick-receipt-secret-key-2026";

export interface ReceiptTokenData {
    transactionId?: string;
    appointmentId?: string;
    queueEntryId?: string;
    action: "approve" | "reject";
    exp: number;
}

/**
 * Generate a cryptographically signed one-click action token for email links
 */
export function generateReceiptActionToken(payload: {
    transactionId?: string;
    appointmentId?: string;
    queueEntryId?: string;
    action: "approve" | "reject";
    expiresInDays?: number;
}): string {
    const exp = Math.floor(Date.now() / 1000) + (payload.expiresInDays || 7) * 24 * 3600;
    const data: ReceiptTokenData = {
        transactionId: payload.transactionId,
        appointmentId: payload.appointmentId,
        queueEntryId: payload.queueEntryId,
        action: payload.action,
        exp,
    };

    const encodedData = Buffer.from(JSON.stringify(data)).toString("base64url");
    const signature = crypto.createHmac("sha256", SECRET).update(encodedData).digest("base64url");
    return `${encodedData}.${signature}`;
}

/**
 * Verify and decode an action token
 */
export function verifyReceiptActionToken(token: string): {
    valid: boolean;
    data?: ReceiptTokenData;
    error?: string;
} {
    if (!token || typeof token !== "string") {
        return { valid: false, error: "رمز العملية مفقود (Missing token)" };
    }

    const parts = token.split(".");
    if (parts.length !== 2) {
        return { valid: false, error: "تنسيق الرمز غير صالح (Invalid token format)" };
    }

    const [encodedData, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", SECRET).update(encodedData).digest("base64url");

    // Timing-safe comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        return { valid: false, error: "توقيع الرمز غير صالح أو تم التلاعب به (Invalid signature)" };
    }

    try {
        const jsonStr = Buffer.from(encodedData, "base64url").toString("utf-8");
        const data = JSON.parse(jsonStr) as ReceiptTokenData;

        const now = Math.floor(Date.now() / 1000);
        if (data.exp && data.exp < now) {
            return { valid: false, error: "عذراً، انتهت صلاحية هذا الرابط (Token expired)" };
        }

        return { valid: true, data };
    } catch (e) {
        return { valid: false, error: "فشل فك تشفير بيانات الرمز (Failed to decode payload)" };
    }
}
