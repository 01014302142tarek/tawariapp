import { chromium, devices } from "playwright";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: ".env.local" });

class DummyWebSocket {
    constructor() {}
    close() {}
    send() {}
    addEventListener() {}
    removeEventListener() {}
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false }, realtime: { transport: DummyWebSocket as any } }
);

async function inspectMobileScreens() {
    console.log("================================================================================");
    console.log("  MOBILE VIEWPORT & RESPONSIVENESS VERIFICATION (ANDROID + IPHONE)");
    console.log("================================================================================\n");

    const testQueueId = crypto.randomUUID();

    // 1. Get Doctor & Patient profiles directly
    const { data: docs } = await supabase.from("doctor_profiles").select("id").limit(1);
    const { data: pats } = await supabase.from("patient_profiles").select("id").limit(1);

    const docId = docs && docs[0] ? docs[0].id : "21997fc7-fc95-49cc-9c41-b5439bd9b9c3";
    const patId = pats && pats[0] ? pats[0].id : "83b12fa0-e5d3-4e36-8d87-744069071c98";

    console.log("Creating active test consultation queue entry...");
    await supabase.from("consultation_queue").insert({
        id: testQueueId,
        doctor_profile_id: docId,
        patient_profile_id: patId,
        status: "in_consultation",
        payment_status: "completed",
        payment_amount: 350,
        daily_room_name: `tabibi-q-${testQueueId.slice(0, 16)}`,
        daily_room_url: `https://fairmeeting.net/tabibi-q-${testQueueId.slice(0, 16)}`,
        consultation_started_at: new Date().toISOString()
    });
    console.log(`  ✓ Queue Entry Created: ID=${testQueueId}`);

    const browser = await chromium.launch({
        channel: "chrome",
        headless: true,
        args: [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
            "--disable-web-security"
        ]
    });

    const BASE_URL = "https://tabibi-app.vercel.app";

    try {
        // --- 1. Doctor Context (Desktop) ---
        console.log("\nLogging in Doctor to provide live remote peer video feed...");
        const doctorContext = await browser.newContext({
            permissions: ["camera", "microphone"],
            viewport: { width: 1280, height: 720 }
        });
        const doctorPage = await doctorContext.newPage();
        await doctorPage.goto(`${BASE_URL}/ar/login`);
        await doctorPage.fill("input[name='email']", "doctor1@tawari.test");
        await doctorPage.fill("input[name='password']", "TawariDoctor1!2024");
        await doctorPage.click("button[type='submit']");
        await doctorPage.waitForURL(url => url.pathname.includes("/dashboard/doctor"), { timeout: 20000 });
        await doctorPage.goto(`${BASE_URL}/ar/dashboard/doctor/urgent-care/call/${testQueueId}`);
        console.log("  ✓ Doctor is in call room waiting for patient");

        // --- 2. Android Emulation (Pixel 7) ---
        console.log("\n--- Testing Android (Pixel 7) ---");
        const androidContext = await browser.newContext({
            ...devices["Pixel 7"],
            permissions: ["camera", "microphone"]
        });
        const androidPage = await androidContext.newPage();

        await androidPage.goto(`${BASE_URL}/ar/login`);
        await androidPage.fill("input[name='email']", "patient1@tawari.test");
        await androidPage.fill("input[name='password']", "TawariPatient1!2024");
        await androidPage.click("button[type='submit']");
        await androidPage.waitForURL(url => url.pathname.includes("/dashboard/patient"), { timeout: 20000 });

        console.log("Navigating Android Patient into Call Room...");
        await androidPage.goto(`${BASE_URL}/ar/dashboard/patient/urgent-care/call/${testQueueId}`);

        // Capture connecting state
        await androidPage.waitForTimeout(1000);
        const androidConnectingPath = path.join(process.cwd(), "tests", "e2e", "android-connecting-preview.png");
        await androidPage.screenshot({ path: androidConnectingPath });
        console.log(`  ✓ Saved Android Calling Lobby: ${androidConnectingPath}`);

        // Wait for WebRTC handshake and live video
        await androidPage.waitForTimeout(5000);
        const androidConnectedPath = path.join(process.cwd(), "tests", "e2e", "android-call-preview.png");
        await androidPage.screenshot({ path: androidConnectedPath });
        console.log(`  ✓ Saved Android Connected Call: ${androidConnectedPath}`);

        // Open chat drawer on Android
        const chatBtn = androidPage.locator("button[title*='محادثة'], button[title*='Chat']").first();
        if (await chatBtn.isVisible()) {
            await chatBtn.click();
            await androidPage.waitForTimeout(1000);
            const androidChatPath = path.join(process.cwd(), "tests", "e2e", "android-chat-drawer.png");
            await androidPage.screenshot({ path: androidChatPath });
            console.log(`  ✓ Saved Android Chat Drawer: ${androidChatPath}`);
        }

        // --- 3. iPhone Emulation (iPhone 14 Pro) ---
        console.log("\n--- Testing iPhone (iPhone 14 Pro) ---");
        const iphoneContext = await browser.newContext({
            ...devices["iPhone 14 Pro"],
            permissions: ["camera", "microphone"]
        });
        const iphonePage = await iphoneContext.newPage();
        await iphonePage.goto(`${BASE_URL}/ar/login`);
        await iphonePage.fill("input[name='email']", "patient1@tawari.test");
        await iphonePage.fill("input[name='password']", "TawariPatient1!2024");
        await iphonePage.click("button[type='submit']");
        await iphonePage.waitForURL(url => url.pathname.includes("/dashboard/patient"), { timeout: 20000 });

        await iphonePage.goto(`${BASE_URL}/ar/dashboard/patient/urgent-care/call/${testQueueId}`);
        await iphonePage.waitForTimeout(5000);
        const iphoneScreenshotPath = path.join(process.cwd(), "tests", "e2e", "iphone-call-preview.png");
        await iphonePage.screenshot({ path: iphoneScreenshotPath });
        console.log(`  ✓ Saved iPhone Call Screenshot: ${iphoneScreenshotPath}`);

        await doctorContext.close();
        await androidContext.close();
        await iphoneContext.close();

    } catch (err) {
        console.error("Test execution error:", err);
    } finally {
        console.log("\nCleaning up test queue entry from Supabase...");
        await supabase.from("consultation_queue").delete().eq("id", testQueueId);
        await browser.close();
        console.log("Done.");
    }
}

inspectMobileScreens().catch(console.error);
