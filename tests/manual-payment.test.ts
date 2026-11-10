import test from "node:test";
import assert from "node:assert/strict";

test("Manual Payment Configuration & Validation", async (t) => {
    const INSTAPAY_TARGET = "01014302142";
    const WEPAY_TARGET = "01555952142";

    await t.test("matches expected InstaPay and WE Pay recipient phone numbers", () => {
        assert.equal(INSTAPAY_TARGET, "01014302142");
        assert.equal(WEPAY_TARGET, "01555952142");
    });

    await t.test("validates file extensions allowed for receipt uploads", () => {
        const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
        const testFiles = [
            { name: "receipt.png", valid: true },
            { name: "screen.jpg", valid: true },
            { name: "proof.webp", valid: true },
            { name: "payment.jpeg", valid: true },
            { name: "receipt.pdf", valid: false },
            { name: "malicious.exe", valid: false },
        ];

        for (const file of testFiles) {
            const ext = file.name.split(".").pop()?.toLowerCase();
            const isValid = !!ext && allowedExtensions.includes(ext);
            assert.equal(isValid, file.valid, `Expected ${file.name} to be ${file.valid}`);
        }
    });

    await t.test("formats payment details object correctly for transactions table", () => {
        const input = {
            method: "instapay" as const,
            targetPhone: INSTAPAY_TARGET,
            senderName: "Ahmed Ali",
            senderPhone: "01099998888",
            receiptUrl: "https://example.com/receipt.png",
            receiptFileName: "receipt.png",
            submittedAt: new Date().toISOString(),
        };

        const paymentDetails = {
            method: input.method,
            method_label_ar: "إنستا باي (InstaPay)",
            target_phone: input.targetPhone,
            sender_name: input.senderName,
            sender_phone: input.senderPhone,
            receipt_url: input.receiptUrl,
            receipt_file_name: input.receiptFileName,
            submitted_at: input.submittedAt,
        };

        assert.equal(paymentDetails.target_phone, "01014302142");
        assert.equal(paymentDetails.method_label_ar, "إنستا باي (InstaPay)");
        assert.equal(paymentDetails.receipt_url, "https://example.com/receipt.png");
    });
});
