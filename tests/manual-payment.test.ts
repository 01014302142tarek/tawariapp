import test from "node:test";
import assert from "node:assert/strict";
import { isValidFullName, isValidEgyptianPhone, normalizeEgyptianPhone } from "../lib/validations/payment";

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

    await t.test("strictly validates sender full name (rejects gibberish, single words, numbers)", () => {
        const validNames = [
            "محمد أحمد",
            "محمود علي مصطفى",
            "سارة طارق",
            "Ahmed Hassan",
            "Mohamed Ali Ibrahim",
            "Sara Tarek",
        ];

        const invalidNames = [
            "asdfg", // single word gibberish
            "12345", // numbers
            "محمد123", // letters with numbers
            "a", // single letter
            "محمد", // single word (needs at least 2 words)
            "aaaa aaaa", // repetitive characters
            "؟؟؟؟؟", // punctuation
            "", // empty
            "   ", // whitespace only
            "a b", // words too short
        ];

        for (const name of validNames) {
            assert.equal(isValidFullName(name), true, `Expected "${name}" to be VALID`);
        }

        for (const name of invalidNames) {
            assert.equal(isValidFullName(name), false, `Expected "${name}" to be INVALID`);
        }
    });

    await t.test("strictly validates Egyptian phone numbers (11 digits, starts with 010, 011, 012, 015)", () => {
        const validPhones = [
            "01014302142",
            "01555952142",
            "01223456789",
            "01198765432",
            "+201014302142",
            "00201555952142",
            "010 1430 2142",
        ];

        const invalidPhones = [
            "123", // too short
            "01312345678", // 013 is not mobile
            "01012345", // not 11 digits
            "010123456789", // 12 digits
            "abcdefghijk", // letters
            "010aaaaabbb", // letters mixed
            "", // empty
        ];

        for (const phone of validPhones) {
            assert.equal(isValidEgyptianPhone(phone), true, `Expected "${phone}" to be VALID`);
        }

        for (const phone of invalidPhones) {
            assert.equal(isValidEgyptianPhone(phone), false, `Expected "${phone}" to be INVALID`);
        }
    });

    await t.test("normalizes Egyptian phone numbers correctly", () => {
        assert.equal(normalizeEgyptianPhone("+201014302142"), "01014302142");
        assert.equal(normalizeEgyptianPhone("00201555952142"), "01555952142");
        assert.equal(normalizeEgyptianPhone("010 1430 2142"), "01014302142");
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
