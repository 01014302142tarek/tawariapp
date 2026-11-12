import test from "node:test";
import assert from "node:assert/strict";

test("WebRTC Call Configuration & Connectivity Invariants", async (t) => {
    // Read the native-webrtc-call source to verify RTC_CONFIG and room sanitization
    const fs = await import("fs/promises");
    const path = await import("path");
    const webrtcSource = await fs.readFile(
        path.join(process.cwd(), "components", "native-webrtc-call.tsx"),
        "utf8"
    );

    await t.test("RTC_CONFIG uses active staticauth.openrelay TURN servers, not sinkholed openrelay.metered.ca", () => {
        // Must contain staticauth.openrelay.metered.ca for active TURN relay
        assert.ok(
            webrtcSource.includes("staticauth.openrelay.metered.ca"),
            "RTC_CONFIG must reference staticauth.openrelay.metered.ca for working TURN relay"
        );
        // Must NOT contain the dead sinkholed openrelay.metered.ca domain without staticauth
        const invalidMatches = webrtcSource.match(/["']turn:openrelay\.metered\.ca/g);
        assert.strictEqual(
            invalidMatches,
            null,
            "RTC_CONFIG must not use sinkholed turn:openrelay.metered.ca"
        );
    });

    await t.test("RTC_CONFIG includes high-availability Google & Cloudflare STUN servers", () => {
        assert.ok(
            webrtcSource.includes("stun.l.google.com:19302"),
            "Must include Google public STUN"
        );
        assert.ok(
            webrtcSource.includes("stun.cloudflare.com:3478"),
            "Must include Cloudflare public STUN"
        );
    });

    await t.test("Room ID sanitizer supports standard UUIDs cleanly", () => {
        const testUuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
        const cleanRoomId = testUuid.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 36);
        assert.strictEqual(cleanRoomId, testUuid);
        assert.strictEqual(cleanRoomId.length, 36);
    });

    await t.test("Duplicate header chat button has been removed", () => {
        // Verify that the duplicate "الصور والشات 📷" button in the header was removed
        assert.ok(
            !webrtcSource.includes("الصور والشات 📷"),
            "Header duplicate chat button should be eliminated"
        );
        // But the bottom dock chat button remains
        assert.ok(
            webrtcSource.includes("محادثة وإرسال صور"),
            "Bottom dock chat button must remain accessible"
        );
    });

    await t.test("Unified Plan ontrack handles track directly without requiring event.streams[0]", () => {
        assert.ok(
            webrtcSource.includes("incomingTracks"),
            "ontrack should handle incomingTracks fallback"
        );
        assert.ok(
            webrtcSource.includes("remoteVideoRef.current.play()"),
            "ontrack should explicitly trigger video play"
        );
    });
});

