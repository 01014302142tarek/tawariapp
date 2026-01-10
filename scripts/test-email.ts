/**
 * Test script for Resend email integration
 * Run with: npx tsx scripts/test-email.ts
 */

import { Resend } from "resend";

async function testEmail() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.error("❌ RESEND_API_KEY not found in environment");
        console.log("Make sure to run: source .env.local or set the env var");
        process.exit(1);
    }

    console.log("✓ RESEND_API_KEY found");

    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Tawari <noreply@tawariapp.com>";

    // Test email - send to Resend's test address (doesn't actually send)
    // Change to your real email to receive a test
    const testTo = "delivered@resend.dev"; // Resend's test address

    console.log(`\nSending test email...`);
    console.log(`  From: ${fromEmail}`);
    console.log(`  To: ${testTo}`);

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: testTo,
            subject: "TawariApp Email Test",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1 style="color: #0d9488;">TawariApp Email Test</h1>
                    <p>If you're seeing this, email sending is working!</p>
                    <p>Sent at: ${new Date().toISOString()}</p>
                </div>
            `,
            text: "TawariApp Email Test - If you're seeing this, email sending is working!",
        });

        if (error) {
            console.error("\n❌ Resend error:", error);

            if (error.message?.includes("domain")) {
                console.log("\n⚠️  Domain not verified. You need to:");
                console.log("   1. Go to https://resend.com/domains");
                console.log("   2. Add tawariapp.com");
                console.log("   3. Add the DNS records (DKIM, SPF, DMARC)");
                console.log("   4. Wait for verification (can take a few minutes)");
            }

            process.exit(1);
        }

        console.log("\n✓ Email sent successfully!");
        console.log(`  Message ID: ${data?.id}`);

    } catch (err) {
        console.error("\n❌ Failed to send email:", err);
        process.exit(1);
    }
}

testEmail();
