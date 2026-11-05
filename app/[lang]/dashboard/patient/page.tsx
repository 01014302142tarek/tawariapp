import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getPatientDashboardData } from "@/app/actions/patient-dashboard";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getDashboardUserContext } from "@/lib/supabase/context";
import PatientDashboardClient from "./PatientDashboardClient";

async function getDashboardCached() {
    const context = await getDashboardUserContext();
    if (!context || context.role !== "patient" || !context.patientProfileId) {
        return { data: null, error: "Not authenticated or not a patient" };
    }

    const supabase = await createServiceRoleClient();
    const cached = unstable_cache(
        async (ctx: typeof context) => getPatientDashboardData(supabase, ctx),
        ["patient-dashboard", context.userId],
        { revalidate: 30, tags: [`dashboard:${context.userId}`] }
    );
    return cached(context);
}

async function PatientDashboardData() {
    const { data } = await getDashboardCached();
    return <PatientDashboardClient initialData={data} />;
}

function PatientDashboardFallback() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin w-8 h-8 border-2 border-[#FD614B] border-t-transparent rounded-full" />
        </div>
    );
}

export default function PatientDashboardPage() {
    return (
        <Suspense fallback={<PatientDashboardFallback />}>
            <PatientDashboardData />
        </Suspense>
    );
}
