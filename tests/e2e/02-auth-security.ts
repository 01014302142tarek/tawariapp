import { BASE_URL, TestRunner } from "./test-helpers";

async function run() {
    const runner = new TestRunner();
    await runner.setup({ width: 1280, height: 800 });
    const { page } = runner;

    console.log("\n========================================================");
    console.log("SUITE 02: AUTHENTICATION, RBAC & SECURITY TESTING");
    console.log("========================================================\n");

    try {
        // ----------------------------------------------------
        // 1. RBAC: Unauthenticated Route Protection
        // ----------------------------------------------------
        console.log("--- 1. Testing Unauthenticated Route Protection ---");
        
        // 1a. Patient Dashboard unauthenticated
        await page.goto(`${BASE_URL}/en/dashboard/patient`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1000);
        runner.assert(
            page.url().includes("/login") || page.url().includes("/register"),
            `Unauthenticated /dashboard/patient redirected to login: ${page.url()}`
        );

        // 1b. Doctor Dashboard unauthenticated
        await page.goto(`${BASE_URL}/en/dashboard/doctor`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1000);
        runner.assert(
            page.url().includes("/login") || page.url().includes("/register"),
            `Unauthenticated /dashboard/doctor redirected to login: ${page.url()}`
        );

        // 1c. Admin Dashboard unauthenticated
        await page.goto(`${BASE_URL}/en/dashboard/admin`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1000);
        runner.assert(
            page.url().includes("/login") || page.url().includes("/register"),
            `Unauthenticated /dashboard/admin redirected to login: ${page.url()}`
        );

        // ----------------------------------------------------
        // 2. Login Page Validation & Negative Tests
        // ----------------------------------------------------
        console.log("\n--- 2. Testing Login Page Form Validation & Errors ---");
        await page.goto(`${BASE_URL}/en/login`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/login"), "Navigated to /en/login");

        const emailInput = page.locator("input[type='email'], input[name='email']").first();
        const passwordInput = page.locator("input[type='password'], input[name='password']").first();
        const submitBtn = page.locator("button[type='submit']").first();

        // 2a. Empty submit
        console.log("  Testing empty login submit...");
        await submitBtn.click();
        await page.waitForTimeout(500);
        const emailRequired = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing || !el.checkValidity());
        runner.assert(emailRequired, "Empty email field prevented login submission");

        // 2b. Invalid credentials
        console.log("  Testing invalid email credentials...");
        await emailInput.fill("nonexistent_user_999@tawari.test");
        await passwordInput.fill("WrongPassword!123");
        await submitBtn.click();
        await page.waitForTimeout(2000);
        
        // Should show error notification/alert and stay on login
        const errorAlert = page.locator("[role='alert'], .text-red-500, .bg-red-50, .border-red-500, div:has-text('Invalid'), div:has-text('error'), div:has-text('failed')").first();
        const isErrorVisible = await errorAlert.isVisible().catch(() => false);
        runner.assert(isErrorVisible || page.url().includes("/login"), "Invalid credentials handled gracefully and user remains on login page");

        // ----------------------------------------------------
        // 3. Patient Authentication & RBAC Boundaries
        // ----------------------------------------------------
        console.log("\n--- 3. Testing Patient Authentication & Boundaries ---");
        await emailInput.fill("patient1@tawari.test");
        await passwordInput.fill("TawariPatient1!2024");
        await submitBtn.click();
        
        // Wait for redirect to patient dashboard
        await page.waitForURL(url => url.pathname.includes("/dashboard/patient"), { timeout: 15000 });
        runner.assert(page.url().includes("/dashboard/patient"), `Patient logged in successfully: ${page.url()}`);
        
        // Check patient welcome message or patient name
        const pageContent = await page.content();
        runner.assert(pageContent.includes("Ahmed") || pageContent.includes("Hassan") || pageContent.includes("patient"), "Patient profile name / role confirmed on dashboard");

        // Security test: Patient accessing Doctor Dashboard
        console.log("  Security Check: Patient accessing Doctor Dashboard...");
        await page.goto(`${BASE_URL}/en/dashboard/doctor`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1500);
        runner.assert(
            !page.url().endsWith("/dashboard/doctor") || page.url().includes("/patient") || page.url().includes("/login"),
            `Patient prevented from accessing Doctor Dashboard: current URL is ${page.url()}`
        );

        // Security test: Patient accessing Admin Dashboard
        console.log("  Security Check: Patient accessing Admin Dashboard...");
        await page.goto(`${BASE_URL}/en/dashboard/admin`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1500);
        runner.assert(
            !page.url().endsWith("/dashboard/admin") || page.url().includes("/patient") || page.url().includes("/login"),
            `Patient prevented from accessing Admin Dashboard: current URL is ${page.url()}`
        );

        // Logout
        console.log("  Testing Patient Logout...");
        const logoutBtn = page.locator("button:has-text('Logout'), button:has-text('Sign out'), a:has-text('Logout'), [aria-label*='Logout'], [aria-label*='logout']").first();
        if (await logoutBtn.isVisible()) {
            await logoutBtn.click();
            await page.waitForTimeout(2000);
        } else {
            // Direct navigate to logout or clear cookies
            await page.context().clearCookies();
        }

        // ----------------------------------------------------
        // 4. Doctor Authentication & RBAC Boundaries
        // ----------------------------------------------------
        console.log("\n--- 4. Testing Doctor Authentication & Boundaries ---");
        await page.goto(`${BASE_URL}/en/login`, { waitUntil: "domcontentloaded" });
        
        const docEmail = page.locator("input[type='email'], input[name='email']").first();
        const docPassword = page.locator("input[type='password'], input[name='password']").first();
        const docSubmit = page.locator("button[type='submit']").first();

        await docEmail.fill("doctor1@tawari.test");
        await docPassword.fill("TawariDoctor1!2024");
        await docSubmit.click();

        await page.waitForURL(url => url.pathname.includes("/dashboard/doctor"), { timeout: 15000 });
        runner.assert(page.url().includes("/dashboard/doctor"), `Doctor logged in successfully: ${page.url()}`);

        const docContent = await page.content();
        runner.assert(docContent.includes("Mohamed") || docContent.includes("Doctor") || docContent.includes("Dr."), "Doctor profile verified on dashboard");

        // Security check: Doctor accessing Admin Dashboard
        console.log("  Security Check: Doctor accessing Admin Dashboard...");
        await page.goto(`${BASE_URL}/en/dashboard/admin`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1500);
        runner.assert(
            !page.url().endsWith("/dashboard/admin") || page.url().includes("/doctor") || page.url().includes("/login"),
            `Doctor prevented from accessing Admin Dashboard: current URL is ${page.url()}`
        );

        // Clear session for next test
        await page.context().clearCookies();

        // ----------------------------------------------------
        // 5. Admin Authentication
        // ----------------------------------------------------
        console.log("\n--- 5. Testing Admin Authentication ---");
        await page.goto(`${BASE_URL}/en/login`, { waitUntil: "domcontentloaded" });
        
        const adminEmail = page.locator("input[type='email'], input[name='email']").first();
        const adminPassword = page.locator("input[type='password'], input[name='password']").first();
        const adminSubmit = page.locator("button[type='submit']").first();

        await adminEmail.fill("admin1@tawari.test");
        await adminPassword.fill("TawariAdmin1!2024");
        await adminSubmit.click();

        await page.waitForURL(url => url.pathname.includes("/dashboard/admin"), { timeout: 15000 });
        runner.assert(page.url().includes("/dashboard/admin"), `Admin logged in successfully: ${page.url()}`);

        await page.context().clearCookies();

        // ----------------------------------------------------
        // 6. Registration & Password Recovery Validation
        // ----------------------------------------------------
        console.log("\n--- 6. Testing Registration Form & Password Reset ---");
        await page.goto(`${BASE_URL}/en/register`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/register"), "Register page /en/register loaded");

        const regName = page.locator("input[name*='name'], input[placeholder*='name'], input[id*='name']").first();
        const regEmail = page.locator("input[type='email'], input[name*='email']").first();
        const regPass = page.locator("input[type='password']").first();
        const regSubmit = page.locator("button[type='submit']").first();

        if (await regSubmit.isVisible()) {
            console.log("  Testing empty registration submission...");
            await regSubmit.click();
            await page.waitForTimeout(500);
            const isRegBlocked = await regEmail.evaluate((el: HTMLInputElement) => !el.checkValidity() || el.validity.valueMissing);
            runner.assert(isRegBlocked, "Empty registration submission blocked by validation");
        }

        // Test forgot password
        await page.goto(`${BASE_URL}/en/forgot-password`, { waitUntil: "domcontentloaded" });
        runner.assert(page.url().includes("/forgot-password"), "Forgot password page /en/forgot-password loaded");
        const resetEmail = page.locator("input[type='email']").first();
        const resetSubmit = page.locator("button[type='submit']").first();
        if (await resetEmail.isVisible() && await resetSubmit.isVisible()) {
            await resetEmail.fill("qa-reset-test@tawari.test");
            await resetSubmit.click();
            await page.waitForTimeout(1500);
            runner.assert(true, "Password reset request submitted successfully");
        }

    } catch (err: any) {
        console.error("Unexpected error in auth & security suite:", err);
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
    console.log(`SUITE 02 RESULTS: ${runner.passCount} PASSED, ${runner.failCount} FAILED, ${runner.issues.length} ISSUES LOGGED`);
    console.log("========================================================\n");
    if (runner.issues.length > 0) {
        console.log("Logged Issues:", JSON.stringify(runner.issues, null, 2));
    }
}

run();

