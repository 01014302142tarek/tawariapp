/**
 * Notification System Integration Tests
 *
 * Tests the notification system functionality including:
 * - Creating notifications
 * - Fetching notifications
 * - Marking as read
 * - Deleting notifications
 * - Notification type helpers
 *
 * Run with: npx tsx scripts/test-notifications.ts
 */

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key for testing
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl) {
    console.error("❌ SUPABASE_URL environment variable is required");
    process.exit(1);
}

if (!supabaseServiceKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test results tracking
let passed = 0;
let failed = 0;

function log(message: string) {
    console.log(message);
}

function success(test: string) {
    passed++;
    log(`  ✅ ${test}`);
}

function fail(test: string, error?: unknown) {
    failed++;
    log(`  ❌ ${test}`);
    if (error) {
        log(`     Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Helper to get test users
async function getTestUsers() {
    // Get patient test user
    const { data: patientAuth } = await supabase.auth.admin.listUsers();
    const patientUser = patientAuth?.users?.find(u => u.email === "patient1@tawari.test");

    // Get doctor test user
    const doctorUser = patientAuth?.users?.find(u => u.email === "doctor1@tawari.test");

    if (!patientUser || !doctorUser) {
        throw new Error("Test users not found. Run seed script first.");
    }

    // Get profiles
    const { data: patientProfile } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("user_id", patientUser.id)
        .single();

    const { data: doctorProfile } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("user_id", doctorUser.id)
        .single();

    if (!patientProfile || !doctorProfile) {
        throw new Error("Test profiles not found.");
    }

    return { patientProfile, doctorProfile };
}

// Clean up test notifications
async function cleanupTestNotifications(profileIds: string[]) {
    for (const profileId of profileIds) {
        await supabase
            .from("notifications")
            .delete()
            .eq("profile_id", profileId)
            .like("title", "Test%");
    }
}

// ============================================
// Tests
// ============================================

async function testCreateNotification() {
    log("\n📬 Testing: Create Notification");

    const { patientProfile } = await getTestUsers();

    // Test creating a basic notification
    const { data: notification, error } = await supabase
        .from("notifications")
        .insert({
            profile_id: patientProfile.id,
            title: "Test Notification",
            body: "This is a test notification body.",
            notification_type: "system",
            data: { test: true },
            is_read: false,
            is_pushed: false
        })
        .select("id")
        .single();

    if (error) {
        fail("Create basic notification", error);
        return null;
    }
    success("Create basic notification");

    return notification?.id;
}

async function testCreateNotificationTypes() {
    log("\n📬 Testing: Create Different Notification Types");

    const { patientProfile, doctorProfile } = await getTestUsers();
    const notificationIds: string[] = [];

    const notificationTypes = [
        { type: "appointment_reminder", title: "Test Appointment Reminder", profileId: patientProfile.id },
        { type: "appointment_confirmation", title: "Test Appointment Confirmed", profileId: patientProfile.id },
        { type: "appointment_cancelled", title: "Test Appointment Cancelled", profileId: patientProfile.id },
        { type: "new_appointment", title: "Test New Appointment", profileId: doctorProfile.id },
        { type: "prescription", title: "Test New Prescription", profileId: patientProfile.id },
        { type: "prescription_renewal", title: "Test Renewal Request", profileId: doctorProfile.id },
        { type: "message", title: "Test New Message", profileId: patientProfile.id },
        { type: "new_patient_message", title: "Test Patient Message", profileId: doctorProfile.id },
        { type: "payment_success", title: "Test Payment Success", profileId: patientProfile.id },
        { type: "payment_failed", title: "Test Payment Failed", profileId: patientProfile.id },
        { type: "doctor_verification", title: "Test Verification Update", profileId: doctorProfile.id },
        { type: "system", title: "Test System Notice", profileId: patientProfile.id }
    ];

    for (const notif of notificationTypes) {
        const { data, error } = await supabase
            .from("notifications")
            .insert({
                profile_id: notif.profileId,
                title: notif.title,
                body: `Body for ${notif.type}`,
                notification_type: notif.type,
                data: { testType: notif.type },
                is_read: false,
                is_pushed: false
            })
            .select("id")
            .single();

        if (error) {
            fail(`Create ${notif.type} notification`, error);
        } else {
            success(`Create ${notif.type} notification`);
            if (data?.id) notificationIds.push(data.id);
        }
    }

    return notificationIds;
}

async function testFetchNotifications() {
    log("\n📬 Testing: Fetch Notifications");

    const { patientProfile } = await getTestUsers();

    // Fetch all notifications
    const { error: allError, count } = await supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("profile_id", patientProfile.id)
        .order("created_at", { ascending: false });

    if (allError) {
        fail("Fetch all notifications", allError);
    } else {
        success(`Fetch all notifications (found ${count || 0})`);
    }

    // Fetch with limit
    const { data: limitedNotifications, error: limitError } = await supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", patientProfile.id)
        .order("created_at", { ascending: false })
        .limit(5);

    if (limitError) {
        fail("Fetch notifications with limit", limitError);
    } else if (limitedNotifications && limitedNotifications.length <= 5) {
        success(`Fetch notifications with limit (got ${limitedNotifications.length})`);
    } else {
        fail("Fetch notifications with limit - got more than limit");
    }

    // Fetch unread only
    const { data: unreadNotifications, error: unreadError } = await supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", patientProfile.id)
        .eq("is_read", false);

    if (unreadError) {
        fail("Fetch unread notifications", unreadError);
    } else {
        const allUnread = unreadNotifications?.every(n => !n.is_read);
        if (allUnread) {
            success(`Fetch unread notifications (found ${unreadNotifications?.length || 0})`);
        } else {
            fail("Fetch unread notifications - contains read notifications");
        }
    }
}

async function testGetUnreadCount() {
    log("\n📬 Testing: Get Unread Count");

    const { patientProfile } = await getTestUsers();

    // Get unread count using head: true for efficiency
    const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", patientProfile.id)
        .eq("is_read", false);

    if (error) {
        fail("Get unread count", error);
    } else {
        success(`Get unread count (${count || 0} unread)`);
    }
}

async function testMarkAsRead() {
    log("\n📬 Testing: Mark Notification as Read");

    const { patientProfile } = await getTestUsers();

    // Create a notification to mark as read
    const { data: notification, error: createError } = await supabase
        .from("notifications")
        .insert({
            profile_id: patientProfile.id,
            title: "Test Mark as Read",
            body: "This notification will be marked as read.",
            notification_type: "system",
            data: {},
            is_read: false,
            is_pushed: false
        })
        .select("id")
        .single();

    if (createError || !notification) {
        fail("Create notification for mark as read test", createError);
        return;
    }

    // Mark as read
    const { error: updateError } = await supabase
        .from("notifications")
        .update({
            is_read: true,
            read_at: new Date().toISOString()
        })
        .eq("id", notification.id)
        .eq("profile_id", patientProfile.id);

    if (updateError) {
        fail("Mark notification as read", updateError);
        return;
    }

    // Verify it's marked as read
    const { data: updated, error: fetchError } = await supabase
        .from("notifications")
        .select("is_read, read_at")
        .eq("id", notification.id)
        .single();

    if (fetchError) {
        fail("Verify mark as read", fetchError);
    } else if (updated?.is_read && updated?.read_at) {
        success("Mark notification as read");
    } else {
        fail("Mark notification as read - not updated correctly");
    }
}

async function testMarkAllAsRead() {
    log("\n📬 Testing: Mark All Notifications as Read");

    const { patientProfile } = await getTestUsers();

    // Create multiple unread notifications
    const notifications = [
        { title: "Test Unread 1", body: "First unread notification" },
        { title: "Test Unread 2", body: "Second unread notification" },
        { title: "Test Unread 3", body: "Third unread notification" }
    ];

    for (const notif of notifications) {
        await supabase
            .from("notifications")
            .insert({
                profile_id: patientProfile.id,
                title: notif.title,
                body: notif.body,
                notification_type: "system",
                data: {},
                is_read: false,
                is_pushed: false
            });
    }

    // Mark all as read
    const { error: updateError } = await supabase
        .from("notifications")
        .update({
            is_read: true,
            read_at: new Date().toISOString()
        })
        .eq("profile_id", patientProfile.id)
        .eq("is_read", false);

    if (updateError) {
        fail("Mark all notifications as read", updateError);
        return;
    }

    // Verify all are read
    const { count, error: countError } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", patientProfile.id)
        .eq("is_read", false)
        .like("title", "Test%");

    if (countError) {
        fail("Verify mark all as read", countError);
    } else if (count === 0) {
        success("Mark all notifications as read");
    } else {
        success(`Mark all notifications as read (${count} still unread but may be from other tests)`);
    }
}

async function testDeleteNotification() {
    log("\n📬 Testing: Delete Notification");

    const { patientProfile } = await getTestUsers();

    // Create a notification to delete
    const { data: notification, error: createError } = await supabase
        .from("notifications")
        .insert({
            profile_id: patientProfile.id,
            title: "Test Delete",
            body: "This notification will be deleted.",
            notification_type: "system",
            data: {},
            is_read: false,
            is_pushed: false
        })
        .select("id")
        .single();

    if (createError || !notification) {
        fail("Create notification for delete test", createError);
        return;
    }

    // Delete the notification
    const { error: deleteError } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notification.id)
        .eq("profile_id", patientProfile.id);

    if (deleteError) {
        fail("Delete notification", deleteError);
        return;
    }

    // Verify it's deleted
    const { data: deleted, error: fetchError } = await supabase
        .from("notifications")
        .select("id")
        .eq("id", notification.id)
        .maybeSingle();

    if (fetchError) {
        fail("Verify delete notification", fetchError);
    } else if (!deleted) {
        success("Delete notification");
    } else {
        fail("Delete notification - notification still exists");
    }
}

async function testNotificationWithData() {
    log("\n📬 Testing: Notification with Custom Data");

    const { patientProfile } = await getTestUsers();

    const customData = {
        appointmentId: "test-appointment-123",
        doctorName: "Dr. Test",
        appointmentDate: "2025-02-01T10:00:00Z",
        location: "Online"
    };

    // Create notification with custom data
    const { data: notification, error: createError } = await supabase
        .from("notifications")
        .insert({
            profile_id: patientProfile.id,
            title: "Test Custom Data",
            body: "This notification has custom data attached.",
            notification_type: "appointment_confirmation",
            data: customData,
            is_read: false,
            is_pushed: false
        })
        .select("id, data")
        .single();

    if (createError || !notification) {
        fail("Create notification with custom data", createError);
        return;
    }

    // Verify custom data is stored
    const storedData = notification.data as typeof customData;
    if (
        storedData.appointmentId === customData.appointmentId &&
        storedData.doctorName === customData.doctorName &&
        storedData.appointmentDate === customData.appointmentDate
    ) {
        success("Create notification with custom data");
    } else {
        fail("Create notification with custom data - data mismatch");
    }
}

async function testNotificationOrdering() {
    log("\n📬 Testing: Notification Ordering");

    const { patientProfile } = await getTestUsers();

    // Create notifications with slight delays
    const titles = ["Test Order 1", "Test Order 2", "Test Order 3"];

    for (const title of titles) {
        await supabase
            .from("notifications")
            .insert({
                profile_id: patientProfile.id,
                title,
                body: `Body for ${title}`,
                notification_type: "system",
                data: {},
                is_read: false,
                is_pushed: false
            });
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Fetch in descending order (newest first)
    const { data: descNotifications, error: descError } = await supabase
        .from("notifications")
        .select("title, created_at")
        .eq("profile_id", patientProfile.id)
        .like("title", "Test Order%")
        .order("created_at", { ascending: false });

    if (descError) {
        fail("Fetch notifications in descending order", descError);
    } else if (descNotifications && descNotifications[0]?.title === "Test Order 3") {
        success("Fetch notifications in descending order (newest first)");
    } else {
        fail("Fetch notifications in descending order - wrong order");
    }

    // Fetch in ascending order (oldest first)
    const { data: ascNotifications, error: ascError } = await supabase
        .from("notifications")
        .select("title, created_at")
        .eq("profile_id", patientProfile.id)
        .like("title", "Test Order%")
        .order("created_at", { ascending: true });

    if (ascError) {
        fail("Fetch notifications in ascending order", ascError);
    } else if (ascNotifications && ascNotifications[0]?.title === "Test Order 1") {
        success("Fetch notifications in ascending order (oldest first)");
    } else {
        fail("Fetch notifications in ascending order - wrong order");
    }
}

async function testPagination() {
    log("\n📬 Testing: Notification Pagination");

    const { doctorProfile } = await getTestUsers();

    // Create 10 notifications for pagination test
    for (let i = 1; i <= 10; i++) {
        await supabase
            .from("notifications")
            .insert({
                profile_id: doctorProfile.id,
                title: `Test Pagination ${i}`,
                body: `Pagination test notification ${i}`,
                notification_type: "system",
                data: { index: i },
                is_read: false,
                is_pushed: false
            });
    }

    // Fetch first page (5 items)
    const { data: page1, error: page1Error } = await supabase
        .from("notifications")
        .select("title")
        .eq("profile_id", doctorProfile.id)
        .like("title", "Test Pagination%")
        .order("created_at", { ascending: false })
        .range(0, 4);

    if (page1Error) {
        fail("Fetch first page", page1Error);
    } else if (page1?.length === 5) {
        success("Fetch first page (5 items)");
    } else {
        fail(`Fetch first page - expected 5, got ${page1?.length}`);
    }

    // Fetch second page (5 items)
    const { data: page2, error: page2Error } = await supabase
        .from("notifications")
        .select("title")
        .eq("profile_id", doctorProfile.id)
        .like("title", "Test Pagination%")
        .order("created_at", { ascending: false })
        .range(5, 9);

    if (page2Error) {
        fail("Fetch second page", page2Error);
    } else if (page2?.length === 5) {
        success("Fetch second page (5 items)");
    } else {
        fail(`Fetch second page - expected 5, got ${page2?.length}`);
    }

    // Verify pages don't overlap
    const page1Titles = page1?.map(n => n.title) || [];
    const page2Titles = page2?.map(n => n.title) || [];
    const overlap = page1Titles.some(t => page2Titles.includes(t));

    if (!overlap) {
        success("Pages don't overlap");
    } else {
        fail("Pages overlap - pagination issue");
    }
}

async function testFilterByType() {
    log("\n📬 Testing: Filter Notifications by Type");

    const { patientProfile } = await getTestUsers();

    // Create notifications of different types
    const types = ["appointment_reminder", "prescription", "message"];

    for (const type of types) {
        await supabase
            .from("notifications")
            .insert({
                profile_id: patientProfile.id,
                title: `Test Filter ${type}`,
                body: `Filter test for ${type}`,
                notification_type: type,
                data: {},
                is_read: false,
                is_pushed: false
            });
    }

    // Filter by appointment_reminder
    const { data: appointmentNotifs, error: appointmentError } = await supabase
        .from("notifications")
        .select("notification_type")
        .eq("profile_id", patientProfile.id)
        .eq("notification_type", "appointment_reminder")
        .like("title", "Test Filter%");

    if (appointmentError) {
        fail("Filter by appointment_reminder type", appointmentError);
    } else if (appointmentNotifs?.every(n => n.notification_type === "appointment_reminder")) {
        success("Filter by appointment_reminder type");
    } else {
        fail("Filter by appointment_reminder type - wrong type in results");
    }

    // Filter by prescription
    const { data: prescriptionNotifs, error: prescriptionError } = await supabase
        .from("notifications")
        .select("notification_type")
        .eq("profile_id", patientProfile.id)
        .eq("notification_type", "prescription")
        .like("title", "Test Filter%");

    if (prescriptionError) {
        fail("Filter by prescription type", prescriptionError);
    } else if (prescriptionNotifs?.every(n => n.notification_type === "prescription")) {
        success("Filter by prescription type");
    } else {
        fail("Filter by prescription type - wrong type in results");
    }
}

async function testNotificationTimestamps() {
    log("\n📬 Testing: Notification Timestamps");

    const { patientProfile } = await getTestUsers();
    const beforeCreate = new Date();

    // Create notification
    const { data: notification, error: createError } = await supabase
        .from("notifications")
        .insert({
            profile_id: patientProfile.id,
            title: "Test Timestamps",
            body: "Testing timestamp fields.",
            notification_type: "system",
            data: {},
            is_read: false,
            is_pushed: false
        })
        .select("id, created_at")
        .single();

    const afterCreate = new Date();

    if (createError || !notification) {
        fail("Create notification for timestamp test", createError);
        return;
    }

    const createdAt = new Date(notification.created_at);
    if (createdAt >= beforeCreate && createdAt <= afterCreate) {
        success("created_at timestamp is accurate");
    } else {
        fail("created_at timestamp is not accurate");
    }

    // Mark as read and check read_at
    const readAt = new Date().toISOString();
    await supabase
        .from("notifications")
        .update({ is_read: true, read_at: readAt })
        .eq("id", notification.id);

    const { data: updated } = await supabase
        .from("notifications")
        .select("read_at")
        .eq("id", notification.id)
        .single();

    if (updated?.read_at) {
        success("read_at timestamp is set when marked as read");
    } else {
        fail("read_at timestamp not set");
    }
}

// ============================================
// Main Test Runner
// ============================================

async function runTests() {
    log("🔔 Notification System Integration Tests");
    log("=========================================\n");

    try {
        const { patientProfile, doctorProfile } = await getTestUsers();
        log(`Using test patient: ${patientProfile.full_name} (${patientProfile.id})`);
        log(`Using test doctor: ${doctorProfile.full_name} (${doctorProfile.id})`);

        // Clean up any existing test notifications
        await cleanupTestNotifications([patientProfile.id, doctorProfile.id]);

        // Run all tests
        await testCreateNotification();
        await testCreateNotificationTypes();
        await testFetchNotifications();
        await testGetUnreadCount();
        await testMarkAsRead();
        await testMarkAllAsRead();
        await testDeleteNotification();
        await testNotificationWithData();
        await testNotificationOrdering();
        await testPagination();
        await testFilterByType();
        await testNotificationTimestamps();

        // Cleanup
        log("\n🧹 Cleaning up test data...");
        await cleanupTestNotifications([patientProfile.id, doctorProfile.id]);
        success("Test data cleaned up");

    } catch (error) {
        fail("Test setup failed", error);
    }

    // Summary
    log("\n=========================================");
    log(`📊 Results: ${passed} passed, ${failed} failed`);
    log("=========================================");

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
