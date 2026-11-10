import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assessSymptoms } from "@/app/actions/triage";

describe("Triage Specialty Assessment", () => {
    it("matches 'عندي حبوب ف دماغي' to Dermatology, NOT Neurology", async () => {
        const result = await assessSymptoms({ message: "عندي حبوب ف دماغي" });
        assert.equal(result.primarySpecialtyEn, "Dermatology", `Expected Dermatology but got ${result.primarySpecialtyEn}`);
        assert.ok(result.primarySpecialtyAr.includes("الجلدية"), `Expected Arabic title to include الجلدية, got ${result.primarySpecialtyAr}`);
    });

    it("matches 'عندي حبوب في وشي' to Dermatology", async () => {
        const result = await assessSymptoms({ message: "عندي حبوب في وشي" });
        assert.equal(result.primarySpecialtyEn, "Dermatology");
    });

    it("matches 'عندي صداع نصفي شديد في دماغي' to Neurology", async () => {
        const result = await assessSymptoms({ message: "عندي صداع نصفي شديد في دماغي" });
        assert.equal(result.primarySpecialtyEn, "Neurology");
    });
});
