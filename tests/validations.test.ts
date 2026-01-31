import { describe, expect, it } from "vitest";
import { egyptianPhoneSchema, appointmentSchema, validateInput, practiceInfoSchema } from "@/lib/validations";

describe("validations", () => {
    it("accepts valid Egyptian phone numbers", () => {
        const result = egyptianPhoneSchema.safeParse("+201234567890");
        expect(result.success).toBe(true);
    });

    it("rejects invalid Egyptian phone numbers", () => {
        const result = egyptianPhoneSchema.safeParse("+11234567890");
        expect(result.success).toBe(false);
    });

    it("validates appointment schema and reports first error", () => {
        const result = validateInput(appointmentSchema, {
            doctorProfileId: "not-a-uuid",
            scheduledStart: "invalid-date",
            scheduledEnd: "invalid-date",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.length).toBeGreaterThan(0);
        }
    });

    it("transforms practiceInfo consultationFee to number", () => {
        const parsed = practiceInfoSchema.safeParse({ consultationFee: "150" });
        expect(parsed.success).toBe(true);
        if (parsed.success) {
            expect(parsed.data.consultationFee).toBe(150);
        }
    });
});
