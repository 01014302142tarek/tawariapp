import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getDoctorDashboardData } from "@/app/actions/doctor-dashboard";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getDashboardUserContext } from "@/lib/supabase/context";
import DoctorDashboardClient from "./DoctorDashboardClient";

async function getDashboardCached() {
    const context = await getDashboardUserContext();
    if (!context || context.role !== "doctor" || !context.doctorProfileId) {
        return { data: null, error: "Not authenticated or not a doctor" };
    }

    const supabase = await createServiceRoleClient();
    const cached = unstable_cache(
        async (ctx: typeof context) => getDoctorDashboardData(supabase, ctx),
        ["doctor-dashboard", context.userId],
        { revalidate: 30, tags: [`dashboard:${context.userId}`] }
    );
    return cached(context);
}

async function DoctorDashboardData() {
    const { data } = await getDashboardCached();
    return <DoctorDashboardClient initialData={data} />;
}

function DoctorDashboardFallback() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin w-8 h-8 border-2 border-[#FD614B] border-t-transparent rounded-full" />
        </div>
    );
}

export default function DoctorDashboardPage() {
    return (
        <Suspense fallback={<DoctorDashboardFallback />}>
            <DoctorDashboardData />
        </Suspense>
    );
}
