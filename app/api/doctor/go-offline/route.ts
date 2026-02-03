import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Parse the beacon data
        const text = await request.text();
        let doctorProfileId: string | undefined;

        try {
            const data = JSON.parse(text);
            doctorProfileId = data.doctorProfileId;
        } catch {
            // If JSON parsing fails, the request body might be empty
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        if (!doctorProfileId) {
            return NextResponse.json({ error: "Missing doctorProfileId" }, { status: 400 });
        }

        // Get user's profile
        const { data: profileData } = await supabase
            .from("profiles")
            .select("id, role")
            .eq("user_id", user.id)
            .single();

        if (!profileData || profileData.role !== "doctor") {
            return NextResponse.json(
                { error: "Not authorized" },
                { status: 403 }
            );
        }

        // Get doctor's profile to verify ownership
        const { data: doctorData } = await supabase
            .from("doctor_profiles")
            .select("id")
            .eq("profile_id", profileData.id)
            .single();

        if (!doctorData || doctorData.id !== doctorProfileId) {
            return NextResponse.json(
                { error: "Not authorized to update this doctor profile" },
                { status: 403 }
            );
        }

        // Update doctor status to offline (both is_online and is_available_now)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from("doctor_profiles")
            .update({
                is_online: false,
                is_available_now: false,
                went_online_at: null,
            })
            .eq("id", doctorProfileId);

        if (error) {
            console.error("Error setting doctor offline:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`Doctor ${doctorProfileId} set to offline via beacon`);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Error in go-offline endpoint:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
