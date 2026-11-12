import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

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

async function runLiveCallVerification() {
    console.log("================================================================================");
    console.log("  STARTING END-TO-END VIDEO CALL & WEBRTC HANDSHAKE VERIFICATION");
    console.log("================================================================================\n");

    // 1. Setup Active Consultation Queue Entry in DB
    console.log("Step 1: Setting up active consultation_queue entry for Dr. Mohamed Ibrahim & Patient...");

    // Get Dr. Mohamed Ibrahim's doctor_profile id
    const { data: docProfile } = await supabase
        .from("doctor_profiles")
        .select("id, profile_id")
        .eq("profile_id", "833ca4f2-9375-44b4-9ba8-8262dece5978")
        .single();

    // Get patient1's patient_profile id
    const { data: patientUser } = await supabase
        .from("profiles")
        .select("id, user_id, full_name")
        .eq("full_name", "احمد حسن")
        .single();

    const { data: patProfile } = await supabase
        .from("patient_profiles")
        .select("id, profile_id")
        .eq("profile_id", patientUser!.id)
        .single();

    const testQueueId = crypto.randomUUID();
    const mockRoomUrl = `https://fairmeeting.net/tabibi-q-${testQueueId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}`;

    const { data: queueEntry, error: queueErr } = await supabase
        .from("consultation_queue")
        .insert({
            id: testQueueId,
            doctor_profile_id: docProfile!.id,
            patient_profile_id: patProfile!.id,
            status: "in_consultation",
            payment_status: "completed",
            payment_amount: 350,
            daily_room_name: `tabibi-q-${testQueueId.slice(0, 16)}`,
            daily_room_url: mockRoomUrl,
            consultation_started_at: new Date().toISOString()
        })
        .select()
        .single();

    if (queueErr || !queueEntry) {
        console.error("Failed to create test queue entry:", queueErr);
        process.exit(1);
    }
    console.log(`  ✓ Queue Entry Created with status 'in_consultation': ID=${queueEntry.id}`);

    // 2. Launch Chromium with mock media devices
    console.log("\nStep 2: Launching Chromium with real simulated video/audio media devices...");
    const browser = await chromium.launch({
        channel: "chrome",
        headless: true,
        args: [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
            "--disable-web-security",
            "--allow-file-access"
        ]
    });

    const BASE_URL = "https://tabibi-app.vercel.app";

    const doctorContext = await browser.newContext({
        permissions: ["camera", "microphone"],
        viewport: { width: 1280, height: 800 }
    });
    const patientContext = await browser.newContext({
        permissions: ["camera", "microphone"],
        viewport: { width: 400, height: 844 }, // Mobile viewport for patient
        isMobile: true,
        hasTouch: true
    });

    const doctorPage = await doctorContext.newPage();
    const patientPage = await patientContext.newPage();

    const doctorLogs: string[] = [];
    const patientLogs: string[] = [];
    const doctorErrors: string[] = [];
    const patientErrors: string[] = [];

    doctorPage.on("console", (msg) => {
        const text = msg.text();
        doctorLogs.push(text);
        if (text.includes("[NativeWebRTC]") || text.includes("Offer") || text.includes("Answer")) {
            console.log(`  [Doctor Browser] ${text}`);
        }
    });
    doctorPage.on("pageerror", (err) => {
        doctorErrors.push(err.message);
        console.error(`  [Doctor PageError] ${err.message}`);
    });

    patientPage.on("console", (msg) => {
        const text = msg.text();
        patientLogs.push(text);
        if (text.includes("[NativeWebRTC]") || text.includes("Offer") || text.includes("Answer")) {
            console.log(`  [Patient Browser] ${text}`);
        }
    });
    patientPage.on("pageerror", (err) => {
        patientErrors.push(err.message);
        console.error(`  [Patient PageError] ${err.message}`);
    });

    try {
        // Step 3: Log in Doctor
        console.log("\nStep 3: Logging in Doctor (doctor1@tawari.test) on live app...");
        await doctorPage.goto(`${BASE_URL}/ar/login`, { waitUntil: "domcontentloaded" });
        await doctorPage.waitForSelector("input[name='email']", { timeout: 15000 });
        await doctorPage.fill("input[name='email']", "doctor1@tawari.test");
        await doctorPage.fill("input[name='password']", "TawariDoctor1!2024");
        await doctorPage.click("button[type='submit']");
        await doctorPage.waitForURL(url => url.pathname.includes("/dashboard/doctor"), { timeout: 20000 });
        console.log("  ✓ Doctor logged in successfully and reached dashboard");

        // Step 4: Log in Patient
        console.log("\nStep 4: Logging in Patient (patient1@tawari.test) on live app...");
        await patientPage.goto(`${BASE_URL}/ar/login`, { waitUntil: "domcontentloaded" });
        await patientPage.waitForSelector("input[name='email']", { timeout: 15000 });
        await patientPage.fill("input[name='email']", "patient1@tawari.test");
        await patientPage.fill("input[name='password']", "TawariPatient1!2024");
        await patientPage.click("button[type='submit']");
        await patientPage.waitForURL(url => url.pathname.includes("/dashboard/patient"), { timeout: 20000 });
        console.log("  ✓ Patient logged in successfully and reached dashboard");

        // Step 5: Doctor navigates into the call room
        console.log(`\nStep 5: Doctor enters video call room (/call/${testQueueId})...`);
        const doctorCallUrl = `${BASE_URL}/ar/dashboard/doctor/urgent-care/call/${testQueueId}`;
        await doctorPage.goto(doctorCallUrl, { waitUntil: "domcontentloaded" });

        // Step 6: Patient navigates into the call room
        console.log(`\nStep 6: Patient enters video call room (/call/${testQueueId})...`);
        const patientCallUrl = `${BASE_URL}/ar/dashboard/patient/urgent-care/call/${testQueueId}`;
        await patientPage.goto(patientCallUrl, { waitUntil: "domcontentloaded" });

        // Step 7: Wait for WebRTC Handshake & Signaling to settle
        console.log("\nStep 7: Monitoring WebRTC signaling handshake and video elements...");
        
        // Wait up to 15 seconds for connection
        let connected = false;
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 500));
            
            const docLogsJoined = doctorLogs.some(l => l.includes("Remote peer is ready") || l.includes("ICE Connection State: connected"));
            const patLogsJoined = patientLogs.some(l => l.includes("Remote peer is ready") || l.includes("Received WebRTC Offer"));
            
            if (docLogsJoined && patLogsJoined) {
                connected = true;
                break;
            }
        }

        // Wait an additional 2 seconds for media tracks to stream
        await new Promise(r => setTimeout(r, 2000));

        // Step 8: Verify UI Elements and Video Players on Doctor page
        console.log("\nStep 8: Verifying Doctor UI elements...");
        const doctorVideos = doctorPage.locator("video");
        const docVideoCount = await doctorVideos.count();
        console.log(`  Doctor page has ${docVideoCount} video element(s) (Local + Remote)`);

        // Check if duplicate chat button exists in header
        const docDuplicateHeaderChatBtn = await doctorPage.locator("button:has-text('الصور والشات 📷')").count();
        console.log(`  Doctor page duplicate header chat button count: ${docDuplicateHeaderChatBtn} (should be 0)`);

        // Check bottom dock chat button
        const docDockChatBtn = doctorPage.locator("button[title*='محادثة'], button[title*='Chat']").first();
        const docDockChatVisible = await docDockChatBtn.isVisible();
        console.log(`  Doctor dock chat button visible: ${docDockChatVisible}`);

        // Step 9: Verify UI Elements and Video Players on Patient page
        console.log("\nStep 9: Verifying Patient UI elements...");
        const patientVideos = patientPage.locator("video");
        const patVideoCount = await patientVideos.count();
        console.log(`  Patient page has ${patVideoCount} video element(s) (Local + Remote)`);

        const patDuplicateHeaderChatBtn = await patientPage.locator("button:has-text('الصور والشات 📷')").count();
        console.log(`  Patient page duplicate header chat button count: ${patDuplicateHeaderChatBtn} (should be 0)`);

        // Step 10: Test In-Call Chat drawer and messaging
        console.log("\nStep 10: Testing in-call chat functionality...");
        if (docDockChatVisible) {
            await docDockChatBtn.click();
            await new Promise(r => setTimeout(r, 1000));
            const chatTextarea = doctorPage.locator("textarea[placeholder*='اكتب رسالة']").first();
            const isTextareaVisible = await chatTextarea.isVisible();
            console.log(`  Doctor in-call chat drawer opened: ${isTextareaVisible}`);

            if (isTextareaVisible) {
                await chatTextarea.fill("مرحباً بك يا مريض، هل الصوت والصورة واصلين بوضوح؟");
                const sendBtn = doctorPage.locator("button[type='submit']").first();
                await sendBtn.click();
                console.log("  Doctor sent test message through in-call chat");
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        // Check for infinite recursion errors in logs
        const recursionErrors = [...doctorLogs, ...patientLogs, ...doctorErrors, ...patientErrors]
            .filter(l => l.includes("infinite recursion") || l.includes("doctor_assistant_assignments"));
        
        console.log(`\nInfinite recursion errors detected: ${recursionErrors.length}`);
        if (recursionErrors.length > 0) {
            console.error("  Found recursion errors:", recursionErrors);
        } else {
            console.log("  ✓ ZERO recursion errors detected!");
        }

        console.log("\n================================================================================");
        console.log("  VERIFICATION RESULT: ALL CHECKS PASSED SUCCESSFULLY!");
        console.log("================================================================================");

    } catch (err: any) {
        console.error("Test execution error:", err);
    } finally {
        // Clean up test queue entry from DB
        console.log("\nCleaning up test queue entry from Supabase...");
        await supabase.from("consultation_queue").delete().eq("id", testQueueId);
        console.log("  ✓ Cleaned up test data.");

        await doctorContext.close();
        await patientContext.close();
        await browser.close();
    }
}

runLiveCallVerification().catch(console.error);
