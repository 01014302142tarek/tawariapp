import { NextRequest, NextResponse } from "next/server";
import { joinDoctorQueue } from "@/app/actions/queue";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { doctorProfileId, chiefComplaint, paymentAmount } = body;

        if (!doctorProfileId) {
            return NextResponse.json(
                { success: false, error: "Missing doctorProfileId" },
                { status: 400 }
            );
        }

        const result = await joinDoctorQueue({
            doctorProfileId,
            chiefComplaint,
            paymentAmount: Number(paymentAmount) || 0,
        });

        const status = result.success ? 200 : (result.error === "Not authenticated" ? 401 : 400);
        return NextResponse.json(result, { status });
    } catch (err: any) {
        console.error("Error in /api/queue/join endpoint:", err);
        return NextResponse.json(
            { success: false, error: err?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
