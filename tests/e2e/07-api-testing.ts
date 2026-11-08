import { BASE_URL, TestRunner } from "./test-helpers";

async function run() {
    const runner = new TestRunner();
    await runner.setup({ width: 1280, height: 800 });
    const { page } = runner;

    console.log("==================================================");
    console.log("  SUITE 07: BACKEND, API ENDPOINTS & CONSULTATION");
    console.log("==================================================");

    try {
        // --- Test 1: GET /api/auth/google/url defaults ---
        console.log("\n--- 1. Testing GET /api/auth/google/url defaults ---");
        let res = await page.request.get(`${BASE_URL}/api/auth/google/url`);
        runner.assert(res.status() === 200, `API: GET /api/auth/google/url returns 200 OK (got ${res.status()})`);
        let data = await res.json();
        runner.assert(Boolean(data.mode && data.callbackUrl), `Returns valid mode: "${data.mode}" and callback: "${data.callbackUrl}"`);

        // --- Test 2: GET /api/auth/google/url with custom params ---
        console.log("\n--- 2. Testing GET /api/auth/google/url with doctor role ---");
        res = await page.request.get(
            `${BASE_URL}/api/auth/google/url?role=doctor&next=/en/dashboard/doctor`
        );
        runner.assert(res.status() === 200, `API: GET with role=doctor returns 200 OK`);
        data = await res.json();
        runner.assert(Boolean(data.mode), `Mode received: ${data.mode}`);

        // --- Test 3: POST /api/queue/join unauthenticated ---
        console.log("\n--- 3. Testing POST /api/queue/join unauthenticated ---");
        res = await page.request.post(`${BASE_URL}/api/queue/join`, {
            data: {
                doctorProfileId: "00000000-0000-0000-0000-000000000000",
                chiefComplaint: "Headache",
                paymentAmount: 100,
            },
        });
        runner.assert(res.status() === 401, `API: POST /api/queue/join rejects unauthenticated call with 401 (got ${res.status()})`);
        data = await res.json();
        runner.assert(data.success === false, `Response success is false: ${data.error}`);

        // --- Test 4: POST /api/queue/join missing doctorProfileId ---
        console.log("\n--- 4. Testing POST /api/queue/join missing doctorProfileId ---");
        res = await page.request.post(`${BASE_URL}/api/queue/join`, {
            data: {
                chiefComplaint: "Headache",
            },
        });
        runner.assert([400, 401].includes(res.status()), `API: POST /api/queue/join returns 400 or 401 for invalid body (got ${res.status()})`);

        // --- Test 5: POST /api/doctor/go-offline unauthenticated ---
        console.log("\n--- 5. Testing POST /api/doctor/go-offline unauthenticated ---");
        res = await page.request.post(`${BASE_URL}/api/doctor/go-offline`, {
            data: JSON.stringify({ doctorProfileId: "dummy-id" }),
        });
        runner.assert(res.status() === 401, `API: POST /api/doctor/go-offline rejects unauthenticated call with 401 (got ${res.status()})`);

        // --- Test 6: POST /api/daily/token missing queueEntryId ---
        console.log("\n--- 6. Testing POST /api/daily/token missing queueEntryId ---");
        res = await page.request.post(`${BASE_URL}/api/daily/token`, {
            data: {},
        });
        runner.assert(res.status() === 400, `API: POST /api/daily/token rejects missing queueEntryId with 400 (got ${res.status()})`);

        // --- Test 7: POST /api/daily/token unauthenticated ---
        console.log("\n--- 7. Testing POST /api/daily/token unauthenticated ---");
        res = await page.request.post(`${BASE_URL}/api/daily/token`, {
            data: { queueEntryId: "00000000-0000-0000-0000-000000000000" },
        });
        runner.assert(res.status() === 401, `API: POST /api/daily/token rejects unauthenticated call with 401 (got ${res.status()})`);

        // --- Test 8: POST /api/webhooks/paymob invalid HMAC ---
        console.log("\n--- 8. Testing POST /api/webhooks/paymob invalid HMAC ---");
        res = await page.request.post(`${BASE_URL}/api/webhooks/paymob?hmac=fake-signature-12345`, {
            data: JSON.stringify({ obj: { id: 12345 } }),
            headers: { "Content-Type": "application/json" },
        });
        runner.assert(res.status() === 200, `API: POST /api/webhooks/paymob handles invalid signature safely with 200 (got ${res.status()})`);
        data = await res.json();
        runner.assert(data.valid === false, `Webhook signature verified as invalid: valid = ${data.valid}`);

        // --- Test 9: GET /api/prescriptions/[id]/pdf unauthenticated/non-existent ---
        console.log("\n--- 9. Testing GET /api/prescriptions/[id]/pdf unauthenticated ---");
        res = await page.request.get(
            `${BASE_URL}/api/prescriptions/00000000-0000-0000-0000-000000000000/pdf`
        );
        runner.assert([401, 404].includes(res.status()), `API: GET prescription PDF rejects unauthorized request (got ${res.status()})`);

        // --- Test 10: GET /auth/callback handles error params safely ---
        console.log("\n--- 10. Testing GET /auth/callback error handling ---");
        res = await page.request.get(
            `${BASE_URL}/auth/callback?error=access_denied&error_description=User+cancelled`,
            { maxRedirects: 0 }
        );
        runner.assert([302, 303, 307].includes(res.status()), `Auth Callback: redirects safely without 500 (got ${res.status()})`);
        const location = res.headers()["location"] || "";
        runner.assert(location.includes("login") || location.includes("auth") || location.includes("error"), 
            `Auth Callback redirects to safe location: "${location}"`);

        // --- Test 11: GET /auth/callback open redirect defense ---
        console.log("\n--- 11. Testing GET /auth/callback open redirect defense ---");
        res = await page.request.get(
            `${BASE_URL}/auth/callback?next=https://evil-phishing.com/steal-creds&error=access_denied`,
            { maxRedirects: 0 }
        );
        const openRedirectLoc = res.headers()["location"] || "";
        runner.assert(!openRedirectLoc.includes("evil-phishing.com"), 
            `Auth Callback blocks malicious external redirect (routed to "${openRedirectLoc}")`);

        // --- Test 12: Consultation Pre-Call Page rendering & Device Check ---
        console.log("\n--- 12. Testing Consultation Pre-Call Page (Patient UI) ---");
        await page.goto(`${BASE_URL}/en/login`, { waitUntil: "domcontentloaded" });
        await page.fill("input[name='email']", "patient1@tawari.test");
        await page.fill("input[name='password']", "TawariPatient1!2024");
        await page.click("button[type='submit']");
        await page.waitForURL(url => url.pathname.includes("/dashboard/patient"), { timeout: 15000 });

        let navRes = await page.goto(`${BASE_URL}/en/dashboard/consultation/test-call-123/pre-call`, {
            waitUntil: "domcontentloaded",
        });
        runner.assert(navRes?.status() === 200, "Consultation pre-call page returns 200 OK");
        await page.waitForTimeout(1000);
        const content = await page.content();
        runner.assert(
            content.includes("Camera") || content.includes("Device Status") || content.includes("Microphone"),
            "Pre-call hardware verification interface renders successfully"
        );
        const joinBtn = page.locator("button:has-text('Join Call'), button:has-text('Checking devices')").first();
        runner.assert(await joinBtn.isVisible(), "Join Call / Checking devices action button is rendered");

        // --- Test 13: Consultation Waiting Room Page ---
        console.log("\n--- 13. Testing Consultation Waiting Room Page ---");
        navRes = await page.goto(`${BASE_URL}/en/dashboard/consultation/test-call-123/waiting-room`, {
            waitUntil: "domcontentloaded",
        });
        runner.assert(navRes?.status() === 200, "Consultation waiting room page returns 200 OK");
        await page.waitForTimeout(1000);
        const bodyText = await page.locator("body").innerText();
        runner.assert(bodyText.length > 30, "Waiting room content displays cleanly without unhandled runtime crashes");

        // --- Test 14: Arabic RTL Consultation Pre-Call Page ---
        console.log("\n--- 14. Testing Arabic RTL Consultation Pre-Call Page ---");
        await page.goto(`${BASE_URL}/ar/dashboard/consultation/test-call-123/pre-call`, {
            waitUntil: "domcontentloaded",
        });
        await page.waitForTimeout(1000);
        const dir = await page.locator("html").getAttribute("dir");
        runner.assert(dir === "rtl", "Arabic pre-call has dir='rtl'");
        const arContent = await page.content();
        runner.assert(
            arContent.includes("الكاميرا") || arContent.includes("الميكروفون") || arContent.includes("الأجهزة"),
            "Arabic device test strings render properly"
        );

        console.log("\n========================================================");
        console.log(`SUITE 07 COMPLETE: ${runner.passCount} passed, ${runner.failCount} failed`);
        console.log("========================================================\n");
    } finally {
        await runner.teardown();
    }
}

run().catch((err) => {
    console.error("Test Suite 07 Fatal Error:", err);
    process.exit(1);
});
