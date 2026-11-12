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
    console.log("Setting up test call in DB...");
    const testQueueId = crypto.randomUUID();

    const { data: doc } = await supabase
        .from("doctor_profiles")
        .select("id")
        .limit(1)
        .single();

    const { data: pat } = await supabase
        .from("patient_profiles")
        .select("id")
        .limit(1)
        .single();

    await supabase.from("consultation_queue").insert({
        id: testQueueId,
        doctor_profile_id: doc!.id,
        patient_profile_id: pat!.id,
        status: "in_consultation",
        payment_status: "completed",
        payment_amount: 350,
        daily_room_name: `tabibi-q-${testQueueId.slice(0, 16)}`,
        daily_room_url: `https://fairmeeting.net/tabibi-q-${testQueueId.slice(0, 16)}`,
        consultation_started_at: new Date().toISOString()
    });

    const browser = await chromium.launch({
        channel: "chrome",
        headless: true,
        args: [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream"
        ]
    });

    const BASE_URL = "https://tabibi-app.vercel.app";

    // 1. Android Phone Emulation (Pixel 7)
    console.log("1. Testing on Android (Pixel 7)...");
    const androidContext = await browser.newContext({
        ...devices["Pixel 7"],
        permissions: ["camera", "microphone"]
    });
    const androidPage = await androidContext.newPage();

    // Log in patient
    await androidPage.goto(`${BASE_URL}/ar/login`);
    await androidPage.fill("input[name='email']", "patient1@tawari.test");
    await androidPage.fill("input[name='password']", "TawariPatient1!2024");
    await androidPage.click("button[type='submit']");
    await androidPage.waitForURL(url => url.pathname.includes("/dashboard/patient"), { timeout: 15000 });

    // Open call page on Android
    await androidPage.goto(`${BASE_URL}/ar/dashboard/patient/urgent-care/call/${testQueueId}`);
    await androidPage.waitForTimeout(4000);

    const androidScreenshotPath = path.join(process.cwd(), "tests", "e2e", "android-call-preview.png");
    await androidPage.screenshot({ path: androidScreenshotPath });
    console.log(`Saved Android screenshot to: ${androidScreenshotPath}`);

    // Clean up
    await supabase.from("consultation_queue").delete().eq("id", testQueueId);
    await browser.close();
}

inspectMobileScreens().catch(console.error);
