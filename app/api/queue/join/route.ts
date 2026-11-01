import { NextRequest, NextResponse } from "next/server";
import { joinDoctorQueue } from "@/app/actions/queue";

export async function POST(request: NextRequest) {
    try {
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

        return NextResponse.json(result);
    } catch (err: any) {
        console.error("Error in /api/queue/join endpoint:", err);
        return NextResponse.json(
            { success: false, error: err?.message || "Internal server error" },
            { status: 500 }
        );
    }
}

