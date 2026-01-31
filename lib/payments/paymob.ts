/**
 * Paymob Payment Gateway Client
 *
 * Egypt's leading payment gateway integration for TawariApp
 * Supports: Credit/Debit cards, Mobile wallets, Bank transfers
 *
 * Documentation: https://docs.paymob.com/docs/accept-standard-redirect
 */

// Paymob API endpoints
const PAYMOB_API_BASE = "https://accept.paymob.com/api";

// Environment variables (to be configured when credentials are available)
const getPaymobConfig = () => ({
    apiKey: process.env.PAYMOB_API_KEY || "",
    integrationId: process.env.PAYMOB_INTEGRATION_ID || "",
    iframeId: process.env.PAYMOB_IFRAME_ID || "",
    hmacSecret: process.env.PAYMOB_HMAC_SECRET || "",
});

// Types
export interface PaymobBillingData {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    apartment?: string;
    floor?: string;
    street?: string;
    building?: string;
    shipping_method?: string;
    postal_code?: string;
    city?: string;
    country?: string;
    state?: string;
}

export interface PaymobOrderItem {
    name: string;
    amount_cents: number;
    description?: string;
    quantity: number;
}

export interface PaymobAuthResponse {
    token: string;
}

export interface PaymobOrderResponse {
    id: number;
    created_at: string;
    delivery_needed: boolean;
    merchant: {
        id: number;
        created_at: string;
        phones: string[];
        company_emails: string[];
        company_name: string;
        state: string;
        country: string;
        city: string;
        postal_code: string;
        street: string;
    };
    collector: null | object;
    amount_cents: number;
    shipping_data: null | object;
    currency: string;
    is_payment_locked: boolean;
    is_return: boolean;
    is_cancel: boolean;
    is_returned: boolean;
    is_canceled: boolean;
    merchant_order_id: string | null;
    wallet_notification: null | object;
    paid_amount_cents: number;
    notify_user_with_email: boolean;
    items: PaymobOrderItem[];
    order_url: string;
    commission_fees: number;
    delivery_fees_cents: number;
    delivery_vat_cents: number;
    payment_method: string;
    merchant_staff_tag: null | string;
    api_source: string;
    data: object;
}

export interface PaymobPaymentKeyResponse {
    token: string;
}

export interface PaymobTransactionCallback {
    obj: {
        id: number;
        pending: boolean;
        amount_cents: number;
        success: boolean;
        is_auth: boolean;
        is_capture: boolean;
        is_standalone_payment: boolean;
        is_voided: boolean;
        is_refunded: boolean;
        is_3d_secure: boolean;
        integration_id: number;
        profile_id: number;
        has_parent_transaction: boolean;
        order: {
            id: number;
            created_at: string;
            delivery_needed: boolean;
            merchant: object;
            collector: null | object;
            amount_cents: number;
            shipping_data: null | object;
            currency: string;
            is_payment_locked: boolean;
            merchant_order_id: string | null;
            wallet_notification: null | object;
            paid_amount_cents: number;
        };
        created_at: string;
        transaction_processed_callback_responses: string[];
        currency: string;
        source_data: {
            type: string;
            pan: string;
            sub_type: string;
        };
        api_source: string;
        terminal_id: null | number;
        merchant_commission: number;
        installment: null | object;
        discount_details: object[];
        is_void: boolean;
        is_refund: boolean;
        data: {
            message: string;
            klass: string;
            gateway_integration_pk: number;
            order_info: string;
            created_at: string;
            migs_order: object;
            txn_response_code: string;
            acq_response_code: string;
            migs_transaction: object;
            merchant: string;
        };
        is_hidden: boolean;
        payment_key_claims: {
            exp: number;
            integration_id: number;
            billing_data: PaymobBillingData;
            order_id: number;
            amount_cents: number;
            currency: string;
            lock_order_when_paid: boolean;
        };
        error_occured: boolean;
        is_live: boolean;
        other_endpoint_reference: null | string;
        refunded_amount_cents: number;
        source_id: number;
        is_captured: boolean;
        captured_amount: number;
        merchant_staff_tag: null | string;
        updated_at: string;
        owner: number;
        parent_transaction: null | number;
    };
    type: string;
}

export interface PaymobError {
    message?: string;
    detail?: string;
}

/**
 * Get authentication token from Paymob
 */
export async function getAuthToken(): Promise<{ token: string; error?: string }> {
    const config = getPaymobConfig();

    if (!config.apiKey) {
        return { token: "", error: "Paymob API key not configured" };
    }

    try {
        const response = await fetch(`${PAYMOB_API_BASE}/auth/tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: config.apiKey,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json() as PaymobError;
            return { token: "", error: errorData.message || errorData.detail || "Authentication failed" };
        }

        const data = await response.json() as PaymobAuthResponse;
        return { token: data.token };
    } catch (error) {
        console.error("Paymob auth error:", error);
        return { token: "", error: "Failed to authenticate with Paymob" };
    }
}

/**
 * Create an order in Paymob
 */
export async function createOrder(
    authToken: string,
    amountCents: number,
    merchantOrderId: string,
    items: PaymobOrderItem[] = [],
    currency: string = "EGP"
): Promise<{ order: PaymobOrderResponse | null; error?: string }> {
    try {
        const response = await fetch(`${PAYMOB_API_BASE}/ecommerce/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                auth_token: authToken,
                delivery_needed: false,
                amount_cents: amountCents,
                currency,
                merchant_order_id: merchantOrderId,
                items: items.length > 0 ? items : [{
                    name: "Consultation",
                    amount_cents: amountCents,
                    quantity: 1,
                }],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json() as PaymobError;
            return { order: null, error: errorData.message || errorData.detail || "Failed to create order" };
        }

        const data = await response.json() as PaymobOrderResponse;
        return { order: data };
    } catch (error) {
        console.error("Paymob create order error:", error);
        return { order: null, error: "Failed to create Paymob order" };
    }
}

/**
 * Get payment key for iframe/redirect
 */
export async function getPaymentKey(
    authToken: string,
    orderId: number,
    amountCents: number,
    billingData: PaymobBillingData,
    currency: string = "EGP",
    expirationSeconds: number = 3600
): Promise<{ paymentKey: string; error?: string }> {
    const config = getPaymobConfig();

    if (!config.integrationId) {
        return { paymentKey: "", error: "Paymob integration ID not configured" };
    }

    try {
        const response = await fetch(`${PAYMOB_API_BASE}/acceptance/payment_keys`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                auth_token: authToken,
                amount_cents: amountCents,
                expiration: expirationSeconds,
                order_id: orderId,
                billing_data: {
                    apartment: billingData.apartment || "NA",
                    email: billingData.email,
                    floor: billingData.floor || "NA",
                    first_name: billingData.first_name,
                    street: billingData.street || "NA",
                    building: billingData.building || "NA",
                    phone_number: billingData.phone_number,
                    shipping_method: billingData.shipping_method || "NA",
                    postal_code: billingData.postal_code || "NA",
                    city: billingData.city || "Cairo",
                    country: billingData.country || "EG",
                    last_name: billingData.last_name,
                    state: billingData.state || "NA",
                },
                currency,
                integration_id: parseInt(config.integrationId, 10),
                lock_order_when_paid: true,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json() as PaymobError;
            return { paymentKey: "", error: errorData.message || errorData.detail || "Failed to get payment key" };
        }

        const data = await response.json() as PaymobPaymentKeyResponse;
        return { paymentKey: data.token };
    } catch (error) {
        console.error("Paymob payment key error:", error);
        return { paymentKey: "", error: "Failed to get payment key" };
    }
}

/**
 * Generate the iframe URL for card payments
 */
export function getIframeUrl(paymentKey: string): string {
    const config = getPaymobConfig();
    return `https://accept.paymob.com/api/acceptance/iframes/${config.iframeId}?payment_token=${paymentKey}`;
}

/**
 * Verify webhook signature using HMAC
 */
export function verifyWebhookSignature(
    requestBody: string,
    receivedHmac: string
): boolean {
    const config = getPaymobConfig();

    if (!config.hmacSecret) {
        console.warn("Paymob HMAC secret not configured");
        return false;
    }

    // Paymob HMAC verification
    // The signature is calculated from concatenated sorted keys
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- Dynamic import inside function scope
    const crypto = require("crypto");

    try {
        const parsedBody = JSON.parse(requestBody);
        const obj = parsedBody.obj;

        // Paymob specifies which fields to include in HMAC calculation
        const hmacFields = [
            obj.amount_cents,
            obj.created_at,
            obj.currency,
            obj.error_occured,
            obj.has_parent_transaction,
            obj.id,
            obj.integration_id,
            obj.is_3d_secure,
            obj.is_auth,
            obj.is_capture,
            obj.is_refunded,
            obj.is_standalone_payment,
            obj.is_voided,
            obj.order?.id,
            obj.owner,
            obj.pending,
            obj.source_data?.pan,
            obj.source_data?.sub_type,
            obj.source_data?.type,
            obj.success,
        ];

        const concatenatedString = hmacFields.join("");
        const calculatedHmac = crypto
            .createHmac("sha512", config.hmacSecret)
            .update(concatenatedString)
            .digest("hex");

        return calculatedHmac === receivedHmac;
    } catch (error) {
        console.error("HMAC verification error:", error);
        return false;
    }
}

/**
 * Calculate platform fee (2.75% + 3 EGP)
 */
export function calculatePlatformFee(amountEGP: number): {
    grossAmount: number;
    platformFee: number;
    netAmount: number;
} {
    const platformFee = (amountEGP * 0.0275) + 3;
    const netAmount = amountEGP - platformFee;

    return {
        grossAmount: amountEGP,
        platformFee: Math.round(platformFee * 100) / 100,
        netAmount: Math.round(netAmount * 100) / 100,
    };
}

/**
 * Convert EGP to cents (Paymob uses cents)
 */
export function toPaymobCents(amountEGP: number): number {
    return Math.round(amountEGP * 100);
}

/**
 * Convert cents to EGP
 */
export function fromPaymobCents(amountCents: number): number {
    return amountCents / 100;
}

/**
 * Check if Paymob is configured
 */
export function isPaymobConfigured(): boolean {
    const config = getPaymobConfig();
    return !!(config.apiKey && config.integrationId && config.iframeId);
}
