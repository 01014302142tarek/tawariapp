import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { isNotificationSupported, getNotificationPermission } from "../lib/notifications/web-push";

describe("Audio Ringtone & Web Push Notifications Invariants", () => {
    test("isNotificationSupported gracefully returns boolean without throwing on server", () => {
        const supported = isNotificationSupported();
        assert.equal(typeof supported, "boolean");
        // In Node.js environment without window.Notification, must be false
        assert.equal(supported, false);
    });

    test("getNotificationPermission returns unsupported in non-browser Node environment", () => {
        const permission = getNotificationPermission();
        assert.equal(permission, "unsupported");
    });
});
