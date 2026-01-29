import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/daily/token
 * Generate a meeting token for a queue entry
 *
 * Request body:
 * - queueEntryId: string - The queue entry ID to generate a token for
 *
 * Returns:
 * - token: string - The Daily.co meeting token
 * - roomUrl: string - The room URL to join
 */
export async function POST(request: NextRequest) {
    try {
        const { queueEntryId } = await request.json();

        if (!queueEntryId) {
            return NextResponse.json(
                { error: "queueEntryId is required" },
                { status: 400 }
            );
        }

        // Get Supabase client
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Get user's profile and role
        const { data: profileData } = await supabase
            .from("profiles")
            .select("id, role, full_name")
            .eq("user_id", user.id)
            .single();

        if (!profileData) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
        }

        const profile = profileData as { id: string; role: string; full_name: string };

        // Get queue entry
        const { data: queueData, error: queueError } = await supabase
            .from("consultation_queue")
            .select("*, daily_room_name, daily_room_url, doctor_profile_id, patient_profile_id, status")
            .eq("id", queueEntryId)
            .single();

        if (queueError || !queueData) {
            return NextResponse.json(
                { error: "Queue entry not found" },
                { status: 404 }
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queueEntry = queueData as any;

        // Verify queue entry is in valid state
        if (!["called", "in_consultation"].includes(queueEntry.status)) {
            return NextResponse.json(
                { error: "Consultation has not started yet" },
                { status: 400 }
            );
        }

        // Verify room exists
        if (!queueEntry.daily_room_name || !queueEntry.daily_room_url) {
            return NextResponse.json(
                { error: "Video room not created yet" },
                { status: 400 }
            );
        }

        // Verify user is authorized (either the doctor or the patient)
        let isOwner = false;
        let userName = profile.full_name || "Participant";

        if (profile.role === "doctor") {
            const { data: doctorData } = await supabase
                .from("doctor_profiles")
                .select("id")
                .eq("profile_id", profile.id)
                .single();

            if (!doctorData || (doctorData as { id: string }).id !== queueEntry.doctor_profile_id) {
                return NextResponse.json(
                    { error: "Not authorized to join this consultation" },
                    { status: 403 }
                );
            }
            isOwner = true; // Doctor gets owner privileges
            userName = profile.full_name || "Doctor";
        } else if (profile.role === "patient") {
            const { data: patientData, error: patientError } = await supabase
                .from("patient_profiles")
                .select("id")
                .eq("profile_id", profile.id)
                .single();

            console.log("[Token API] Patient profile lookup:", {
                profileId: profile.id,
                patientData,
                patientError,
                queuePatientId: queueEntry.patient_profile_id
            });

            const patientProfile = patientData as { id: string } | null;
            if (!patientProfile || patientProfile.id !== queueEntry.patient_profile_id) {
                console.error("[Token API] Patient authorization failed:", {
                    patientProfileId: patientProfile?.id,
                    expectedPatientId: queueEntry.patient_profile_id,
                });
                return NextResponse.json(
                    { error: "Not authorized to join this consultation" },
                    { status: 403 }
                );
            }
            userName = profile.full_name || "Patient";
        } else {
            return NextResponse.json(
                { error: "Invalid user role" },
                { status: 403 }
            );
        }

        // Generate Daily.co meeting token
        const dailyApiKey = process.env.DAILY_API_KEY;
        if (!dailyApiKey) {
            return NextResponse.json(
                { error: "Video service not configured" },
                { status: 500 }
            );
        }

        // CRITICAL: Verify the room still exists on Daily.co before generating token
        // Rooms expire after 1 hour, but database still has the old room URL
        try {
            const roomCheckResponse = await fetch(
                `https://api.daily.co/v1/rooms/${queueEntry.daily_room_name}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${dailyApiKey}`,
                    },
                }
            );

            if (!roomCheckResponse.ok) {
                console.error("[Token API] Room no longer exists on Daily.co:", {
                    roomName: queueEntry.daily_room_name,
                    status: roomCheckResponse.status,
                });

                // Return a specific error so the client can show appropriate message
                return NextResponse.json(
                    {
                        error: "Video room has expired",
                        code: "ROOM_EXPIRED",
                        message: profile.role === "patient"
                            ? "The video room has expired. Please wait for the doctor to restart the call."
                            : "The video room has expired. Please start the call again."
                    },
                    { status: 410 } // 410 Gone - room no longer exists
                );
            }

            console.log("[Token API] Room verified to exist:", queueEntry.daily_room_name);
        } catch (roomCheckError) {
            console.error("[Token API] Error checking room existence:", roomCheckError);
            // Continue anyway - let Daily.co handle the error during join
        }

        // Create meeting token
        const tokenResponse = await fetch("https://api.daily.co/v1/meeting-tokens", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${dailyApiKey}`,
            },
            body: JSON.stringify({
                properties: {
                    room_name: queueEntry.daily_room_name,
                    user_id: user.id,
                    user_name: userName,
                    is_owner: isOwner,
                    enable_screenshare: true,
                    start_video_off: false,
                    start_audio_off: false,
                    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
                },
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("Daily API error:", errorData);
            return NextResponse.json(
                { error: "Failed to generate meeting token" },
                { status: 500 }
            );
        }

        const tokenData = await tokenResponse.json();

        return NextResponse.json({
            token: tokenData.token,
            roomUrl: queueEntry.daily_room_url,
            roomName: queueEntry.daily_room_name,
            isOwner,
            userName,
        });
    } catch (error) {
        console.error("Error generating token:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
