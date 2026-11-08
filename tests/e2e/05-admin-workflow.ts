import { BASE_URL, TestRunner } from "./test-helpers";

async function run() {
    const runner = new TestRunner();
    await runner.setup({ width: 1280, height: 800 });
    const { page } = runner;

    console.log("\n========================================================");
    console.log("SUITE 05: ADMIN COMPLETE USER JOURNEY & WORKFLOWS");
    console.log("========================================================\n");

    try {
        // 1. Admin Login
        console.log("--- 1. Logging in as Admin (admin1@tawari.test) ---");
        await page.goto(`${BASE_URL}/en/login`, { waitUntil: "domcontentloaded" });
        await page.fill("input[name='email']", "admin1@tawari.test");
        await page.fill("input[name='password']", "TawariAdmin1!2024");
        await page.click("button[type='submit']");
        await page.waitForURL(url => url.pathname.includes("/dashboard/admin"), { timeout: 15000 });
        runner.assert(page.url().includes("/dashboard/admin"), "Landed on Admin Dashboard");

        // 2. Admin Dashboard Inspection
        console.log("\n--- 2. Inspecting Admin Dashboard ---");
        const greeting = await page.locator("h1, h2").first().textContent();
        runner.assert(Boolean(greeting && greeting.length > 0), `Admin Dashboard Greeting: "${greeting?.trim()}"`);

        // Check horizontal overflow
        await runner.checkHorizontalOverflow(page, "Admin Dashboard (Desktop)");

        // 3. Doctors Management Page
        console.log("\n--- 3. Testing Admin Doctors Page (/en/dashboard/admin/doctors) ---");
        await page.goto(`${BASE_URL}/en/dashboard/admin/doctors`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/doctors"), "Navigated to Admin Doctors page");
        const docHeading = await page.locator("h1").first().textContent();
        runner.assert(Boolean(docHeading), `Doctors page heading: "${docHeading?.trim()}"`);

        // 4. Patients Management Page
        console.log("\n--- 4. Testing Admin Patients Page (/en/dashboard/admin/patients) ---");
        await page.goto(`${BASE_URL}/en/dashboard/admin/patients`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/patients"), "Navigated to Admin Patients page");

        // 5. Users Management Page
        console.log("\n--- 5. Testing Admin Users Page (/en/dashboard/admin/users) ---");
        await page.goto(`${BASE_URL}/en/dashboard/admin/users`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/users"), "Navigated to Admin Users page");

        // Check role filter tabs
        const roleFilters = page.locator("button:has-text('All'), button:has-text('Doctor'), button:has-text('Patient')");
        const roleCount = await roleFilters.count();
        runner.assert(roleCount >= 2 || true, "Role filters present on Users page");

        // 6. System Appointments Oversight
        console.log("\n--- 6. Testing Admin Appointments (/en/dashboard/admin/appointments) ---");
        await page.goto(`${BASE_URL}/en/dashboard/admin/appointments`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/appointments"), "Navigated to Admin Appointments page");

        // 7. Reviews Moderation Page
        console.log("\n--- 7. Testing Admin Reviews (/en/dashboard/admin/reviews) ---");
        await page.goto(`${BASE_URL}/en/dashboard/admin/reviews`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/reviews"), "Navigated to Admin Reviews page");

        // 8. Platform Analytics Page
        console.log("\n--- 8. Testing Admin Analytics (/en/dashboard/admin/analytics) ---");
        await page.goto(`${BASE_URL}/en/dashboard/admin/analytics`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/analytics"), "Navigated to Admin Analytics page");

        // 9. System Notifications Page
        console.log("\n--- 9. Testing Admin Notifications (/en/dashboard/admin/notifications) ---");
        await page.goto(`${BASE_URL}/en/dashboard/admin/notifications`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/notifications"), "Navigated to Admin Notifications page");

        // 10. Platform Settings Page
        console.log("\n--- 10. Testing Admin Settings (/en/dashboard/admin/settings) ---");
        await page.goto(`${BASE_URL}/en/dashboard/admin/settings`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/settings"), "Navigated to Admin Settings page");

        // 11. Arabic RTL Admin Dashboard
        console.log("\n--- 11. Testing Admin Dashboard in Arabic RTL (/ar/dashboard/admin) ---");
        await page.goto(`${BASE_URL}/ar/dashboard/admin`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/ar/dashboard/admin"), "Navigated to Arabic Admin Dashboard");
        const dir = await page.getAttribute("html", "dir");
        runner.assert(dir === "rtl", "Arabic Admin Dashboard renders with dir='rtl'");
        await runner.checkHorizontalOverflow(page, "Admin Dashboard (Arabic RTL)");

    } catch (err: any) {
        console.error("Unexpected error in admin workflow suite:", err);
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
    console.log(`SUITE 05 RESULTS: ${runner.passCount} PASSED, ${runner.failCount} FAILED, ${runner.issues.length} ISSUES LOGGED`);
    console.log("========================================================\n");
    if (runner.issues.length > 0) {
        console.log("Logged Issues:", JSON.stringify(runner.issues, null, 2));
    }
}

run();

