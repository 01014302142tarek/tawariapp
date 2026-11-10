import { describe, it } from "node:test";
import assert from "node:assert";
import { generateReceiptActionToken, verifyReceiptActionToken } from "../lib/security/receipt-token";

describe("Receipt Action Token - Cryptographic Security", () => {
    it("generates and verifies a valid approval token", () => {
        const token = generateReceiptActionToken({
            transactionId: "tx-12345",
            appointmentId: "appt-67890",
            action: "approve",
        });

        assert.ok(token);
        assert.strictEqual(typeof token, "string");
        assert.ok(token.includes("."));

        const verified = verifyReceiptActionToken(token);
        assert.strictEqual(verified.valid, true);
        assert.strictEqual(verified.data?.transactionId, "tx-12345");
        assert.strictEqual(verified.data?.appointmentId, "appt-67890");
        assert.strictEqual(verified.data?.action, "approve");
        assert.ok(verified.data?.exp && verified.data.exp > Math.floor(Date.now() / 1000));
    });

    it("generates and verifies a valid rejection token", () => {
        const token = generateReceiptActionToken({
            transactionId: "tx-999",
            action: "reject",
        });

        const verified = verifyReceiptActionToken(token);
        assert.strictEqual(verified.valid, true);
        assert.strictEqual(verified.data?.transactionId, "tx-999");
        assert.strictEqual(verified.data?.action, "reject");
    });

    it("rejects a tampered signature", () => {
        const token = generateReceiptActionToken({
            transactionId: "tx-123",
            action: "approve",
        });

        const [payload] = token.split(".");
        const forgedToken = `${payload}.forgedSignature1234567890`;

        const verified = verifyReceiptActionToken(forgedToken);
        assert.strictEqual(verified.valid, false);
        assert.ok(verified.error?.includes("غير صالح"));
    });

    it("rejects an expired token", () => {
        // Token expired 10 seconds ago
        const token = generateReceiptActionToken({
            transactionId: "tx-expired",
            action: "approve",
            expiresInDays: -1,
        });

        const verified = verifyReceiptActionToken(token);
        assert.strictEqual(verified.valid, false);
        assert.ok(verified.error?.includes("انتهت صلاحية"));
    });

    it("rejects malformed token strings", () => {
        assert.strictEqual(verifyReceiptActionToken("").valid, false);
        assert.strictEqual(verifyReceiptActionToken("no-dots-here").valid, false);
        assert.strictEqual(verifyReceiptActionToken("too.many.dots.here").valid, false);
    });
});
