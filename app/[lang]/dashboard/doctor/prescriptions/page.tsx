import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getDoctorPrescriptions, getDoctorPatients, getPendingRenewalRequests } from "@/app/actions/prescriptions";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getDashboardUserContext } from "@/lib/supabase/context";
import DoctorPrescriptionsClient from "./DoctorPrescriptionsClient";

async function DoctorPrescriptionsData() {
    const context = await getDashboardUserContext();
    if (!context || context.role !== "doctor" || !context.doctorProfileId) {
        return (
            <DoctorPrescriptionsClient
                initialPrescriptions={[]}
                initialPatients={[]}
                initialRenewalRequests={[]}
                initialLoaded
            />
        );
    }

    const supabase = await createServiceRoleClient();

    const [prescriptionsResult, patientsResult, renewalsResult] = await Promise.all([
        unstable_cache(
            async (ctx: typeof context) => getDoctorPrescriptions(undefined, supabase, ctx),
            ["doctor-prescriptions", context.userId],
            { revalidate: 30, tags: [`prescriptions:${context.userId}`] }
        )(context),
        unstable_cache(
            async (ctx: typeof context) => getDoctorPatients(supabase, ctx),
            ["doctor-prescription-patients", context.userId],
            { revalidate: 30, tags: [`prescriptions:${context.userId}`] }
        )(context),
        unstable_cache(
            async (ctx: typeof context) => getPendingRenewalRequests(supabase, ctx),
            ["doctor-prescription-renewals", context.userId],
            { revalidate: 30, tags: [`prescriptions:${context.userId}`] }
        )(context),
    ]);

    return (
        <DoctorPrescriptionsClient
            initialPrescriptions={prescriptionsResult.prescriptions}
            initialPatients={patientsResult.patients}
            initialRenewalRequests={renewalsResult.requests}
            initialLoaded
        />
    );
}

function DoctorPrescriptionsFallback() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin w-8 h-8 border-2 border-[#FD614B] border-t-transparent rounded-full" />
        </div>
    );
}

export default function DoctorPrescriptionsPage() {
    return (
        <Suspense fallback={<DoctorPrescriptionsFallback />}>
            <DoctorPrescriptionsData />
        </Suspense>
    );
}
