import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
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

        // Use admin client to bypass RLS
        const supabase = await createAdminClient();

        // Update doctor status to offline
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from("doctor_profiles")
            .update({
                is_online: false,
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
