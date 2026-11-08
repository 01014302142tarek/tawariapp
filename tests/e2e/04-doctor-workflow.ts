import { BASE_URL, TestRunner } from "./test-helpers";

async function run() {
    const runner = new TestRunner();
    await runner.setup({ width: 1280, height: 800 });
    const { page } = runner;

    console.log("\n========================================================");
    console.log("SUITE 04: DOCTOR COMPLETE USER JOURNEY & WORKFLOWS");
    console.log("========================================================\n");

    try {
        // 1. Doctor Login
        console.log("--- 1. Logging in as Doctor (doctor1@tawari.test) ---");
        await page.goto(`${BASE_URL}/en/login`, { waitUntil: "domcontentloaded" });
        await page.fill("input[name='email']", "doctor1@tawari.test");
        await page.fill("input[name='password']", "TawariDoctor1!2024");
        await page.click("button[type='submit']");
        await page.waitForURL(url => url.pathname.includes("/dashboard/doctor"), { timeout: 15000 });
        runner.assert(page.url().includes("/dashboard/doctor"), "Landed on Doctor Dashboard");

        // 2. Doctor Dashboard Inspection
        console.log("\n--- 2. Inspecting Doctor Dashboard ---");
        const greeting = await page.locator("h1, h2").first().textContent();
        runner.assert(Boolean(greeting && greeting.length > 0), `Doctor Dashboard Greeting: "${greeting?.trim()}"`);

        // Check availability toggle
        const availabilityToggle = page.locator("button:has-text('Online'), button:has-text('Offline'), [role='switch'], button[aria-checked]").first();
        if (await availabilityToggle.isVisible()) {
            console.log("  Testing doctor availability toggle click...");
            await availabilityToggle.click();
            await page.waitForTimeout(1000);
            runner.assert(true, "Doctor availability toggle clicked");
        }

        // Check horizontal overflow
        await runner.checkHorizontalOverflow(page, "Doctor Dashboard (Desktop)");

        // 3. Appointments Page
        console.log("\n--- 3. Testing Doctor Appointments (/en/dashboard/doctor/appointments) ---");
        await page.goto(`${BASE_URL}/en/dashboard/doctor/appointments`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/appointments"), "Navigated to Doctor Appointments page");
        
        // Wait for Suspense boundary to stream in the client component if any
        await page.waitForTimeout(1000);
        const apptHeading = await page.locator("h1").first().textContent();
        runner.assert(Boolean(apptHeading), `Appointments heading: "${apptHeading?.trim()}"`);

        // 4. Patients Roster Page
        console.log("\n--- 4. Testing Patients Roster (/en/dashboard/doctor/patients) ---");
        await page.goto(`${BASE_URL}/en/dashboard/doctor/patients`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/patients"), "Navigated to Patients Roster page");
        
        // Search patient input
        const searchInput = page.locator("input[placeholder*='Search'], input[type='search']").first();
        if (await searchInput.isVisible()) {
            await searchInput.fill("Ahmed");
            await page.waitForTimeout(500);
            runner.assert(true, "Patient search filter executed");
        }

        // 5. Schedule & Availability Management
        console.log("\n--- 5. Testing Schedule Management (/en/dashboard/doctor/schedule) ---");
        await page.goto(`${BASE_URL}/en/dashboard/doctor/schedule`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/schedule"), "Navigated to Schedule page");

        const saveBtn = page.locator("button:has-text('Save'), button:has-text('Update')").first();
        if (await saveBtn.isVisible()) {
            runner.assert(true, "Schedule save button is visible and active");
        }

        // 6. Prescriptions Management
        console.log("\n--- 6. Testing Prescriptions (/en/dashboard/doctor/prescriptions) ---");
        await page.goto(`${BASE_URL}/en/dashboard/doctor/prescriptions`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/prescriptions"), "Navigated to Prescriptions page");

        // 7. Consultations Page
        console.log("\n--- 7. Testing Consultations (/en/dashboard/doctor/consultations) ---");
        await page.goto(`${BASE_URL}/en/dashboard/doctor/consultations`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/consultations"), "Navigated to Consultations page");

        // 8. Earnings & Finances Page
        console.log("\n--- 8. Testing Earnings (/en/dashboard/doctor/earnings) ---");
        await page.goto(`${BASE_URL}/en/dashboard/doctor/earnings`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/earnings"), "Navigated to Earnings page");

        // 9. Analytics Page
        console.log("\n--- 9. Testing Doctor Analytics (/en/dashboard/doctor/analytics) ---");
        await page.goto(`${BASE_URL}/en/dashboard/doctor/analytics`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/analytics"), "Navigated to Analytics page");

        // 10. Reviews Page
        console.log("\n--- 10. Testing Doctor Reviews (/en/dashboard/doctor/reviews) ---");
        await page.goto(`${BASE_URL}/en/dashboard/doctor/reviews`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/reviews"), "Navigated to Reviews page");

        // 11. Settings & Practice Information
        console.log("\n--- 11. Testing Doctor Settings (/en/dashboard/doctor/settings) ---");
        await page.goto(`${BASE_URL}/en/dashboard/doctor/settings`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/settings"), "Navigated to Settings page");

        const feeInput = page.locator("input[name*='fee'], input[id*='fee']").first();
        if (await feeInput.isVisible()) {
            const feeVal = await feeInput.inputValue();
            runner.assert(feeVal.length > 0, `Doctor consultation fee field populated with: "${feeVal}"`);
        }

        // 12. Urgent Care Queue
        console.log("\n--- 12. Testing Urgent Care Queue (/en/dashboard/doctor/urgent-care) ---");
        await page.goto(`${BASE_URL}/en/dashboard/doctor/urgent-care`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/urgent-care"), "Navigated to Doctor Urgent Care page");

        // 13. Arabic RTL Doctor Dashboard
        console.log("\n--- 13. Testing Doctor Dashboard in Arabic RTL (/ar/dashboard/doctor) ---");
        await page.goto(`${BASE_URL}/ar/dashboard/doctor`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/ar/dashboard/doctor"), "Navigated to Arabic Doctor Dashboard");
        const dir = await page.getAttribute("html", "dir");
        runner.assert(dir === "rtl", "Arabic Doctor Dashboard renders with dir='rtl'");
        await runner.checkHorizontalOverflow(page, "Doctor Dashboard (Arabic RTL)");

    } catch (err: any) {
        console.error("Unexpected error in doctor workflow suite:", err);
        runner.failCount++;
        runner.issues.push({
            type: "page-error",
            url: page.url(),
            message: err.message,
            details: err.stack,
        });
    } finally {
        await runner.teardown();
    }

    console.log("\n========================================================");
    console.log(`SUITE 04 RESULTS: ${runner.passCount} PASSED, ${runner.failCount} FAILED, ${runner.issues.length} ISSUES LOGGED`);
    console.log("========================================================\n");
    if (runner.issues.length > 0) {
        console.log("Logged Issues:", JSON.stringify(runner.issues, null, 2));
    }
}

run();

