import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cn } from "@/lib/utils";

describe("cn", () => {
    it("merges class names and filters falsy values", () => {
        assert.equal(cn("a", false && "b", "c"), "a c");
    });

    it("dedupes tailwind classes", () => {
        assert.equal(cn("p-2", "p-4"), "p-4");
    });
});
