import { BASE_URL, TestRunner } from "./test-helpers";

interface ViewportConfig {
    name: string;
    width: number;
    height: number;
    isMobile?: boolean;
}

const VIEWPORTS: ViewportConfig[] = [
    { name: "Mobile (iPhone 375x812)", width: 375, height: 812, isMobile: true },
    { name: "Mobile (iPhone 390x844)", width: 390, height: 844, isMobile: true },
    { name: "Tablet (iPad 768x1024)", width: 768, height: 1024 },
    { name: "Laptop (1280x800)", width: 1280, height: 800 },
    { name: "Desktop (1920x1080)", width: 1920, height: 1080 },
];

async function run() {
    const runner = new TestRunner();
    await runner.setup({ width: 1280, height: 800 });
    const { page } = runner;

    console.log("\n========================================================");
    console.log("SUITE 06: RESPONSIVE DESIGN & MOBILE UX TESTING");
    console.log("========================================================\n");

    try {
        for (const vp of VIEWPORTS) {
            console.log(`\n--- Testing Viewport: ${vp.name} ---`);
            await page.setViewportSize({ width: vp.width, height: vp.height });

            // 1. Landing Page (English & Arabic)
            await page.goto(`${BASE_URL}/en`, { waitUntil: "domcontentloaded" });
            await runner.checkHorizontalOverflow(page, `Landing Page EN (${vp.name})`);

            await page.goto(`${BASE_URL}/ar`, { waitUntil: "domcontentloaded" });
            await runner.checkHorizontalOverflow(page, `Landing Page AR (${vp.name})`);

            // Mobile-specific hamburger test
            if (vp.isMobile) {
                console.log(`  Testing mobile hamburger menu on ${vp.name}...`);
                await page.goto(`${BASE_URL}/en`, { waitUntil: "domcontentloaded" });
                const menuBtn = page.locator("button[data-testid='mobile-menu-button'], button[aria-label='Toggle mobile menu']").first();
                if (await menuBtn.isVisible()) {
                    await menuBtn.click();
                    await page.waitForTimeout(500);
                    const mobileNav = page.locator("[data-testid='mobile-menu-drawer']");
                    runner.assert(await mobileNav.isVisible(), `Mobile nav drawer opened on ${vp.name}`);
                    // Close menu
                    await menuBtn.click();
                    await page.waitForTimeout(300);
                }
            }

            // 2. Auth Pages
            await page.goto(`${BASE_URL}/en/login`, { waitUntil: "domcontentloaded" });
            await runner.checkHorizontalOverflow(page, `Login Page (${vp.name})`);

            await page.goto(`${BASE_URL}/en/register`, { waitUntil: "domcontentloaded" });
            await runner.checkHorizontalOverflow(page, `Register Page (${vp.name})`);

            // 3. Public directory
            await page.goto(`${BASE_URL}/en/doctors`, { waitUntil: "domcontentloaded" });
            await runner.checkHorizontalOverflow(page, `Doctors Directory (${vp.name})`);
        }

    } catch (err: any) {
        console.error("Unexpected error in responsive suite:", err);
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
    console.log(`SUITE 06 RESULTS: ${runner.passCount} PASSED, ${runner.failCount} FAILED, ${runner.issues.length} ISSUES LOGGED`);
    console.log("========================================================\n");
    if (runner.issues.length > 0) {
        console.log("Logged Issues:", JSON.stringify(runner.issues, null, 2));
    }
}

run();
