import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { egyptianPhoneSchema, appointmentSchema, validateInput, practiceInfoSchema } from "@/lib/validations";

describe("validations", () => {
    it("accepts valid Egyptian phone numbers", () => {
        const result = egyptianPhoneSchema.safeParse("+201234567890");
        assert.equal(result.success, true);
    });

    it("rejects invalid Egyptian phone numbers", () => {
        const result = egyptianPhoneSchema.safeParse("+11234567890");
        assert.equal(result.success, false);
    });

    it("validates appointment schema and reports first error", () => {
        const result = validateInput(appointmentSchema, {
            doctorProfileId: "not-a-uuid",
            scheduledStart: "invalid-date",
            scheduledEnd: "invalid-date",
        });
        assert.equal(result.success, false);
        if (!result.success) {
            assert.ok(result.error.length > 0);
        }
    });

    it("transforms practiceInfo consultationFee to number", () => {
        const parsed = practiceInfoSchema.safeParse({ consultationFee: "150" });
        assert.equal(parsed.success, true);
        if (parsed.success) {
            assert.equal(parsed.data.consultationFee, 150);
        }
    });
});
