import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getPatientPrescriptions } from "@/app/actions/prescriptions";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getDashboardUserContext } from "@/lib/supabase/context";
import PatientPrescriptionsClient from "./PatientPrescriptionsClient";

async function getPrescriptionsCached() {
    const context = await getDashboardUserContext();
    if (!context || context.role !== "patient" || !context.patientProfileId) {
        return { prescriptions: [], error: "Not authenticated or not a patient" };
    }

    const supabase = await createServiceRoleClient();
    const cached = unstable_cache(
        async (ctx: typeof context) => getPatientPrescriptions(undefined, supabase, ctx),
        ["patient-prescriptions", context.userId],
        { revalidate: 30, tags: [`prescriptions:${context.userId}`] }
    );
    return cached(context);
}

async function PatientPrescriptionsData() {
    const { prescriptions } = await getPrescriptionsCached();
    return <PatientPrescriptionsClient initialPrescriptions={prescriptions} initialLoaded />;
}

function PatientPrescriptionsFallback() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
    );
}

export default function PatientPrescriptionsPage() {
    return (
        <Suspense fallback={<PatientPrescriptionsFallback />}>
            <PatientPrescriptionsData />
        </Suspense>
    );
}
