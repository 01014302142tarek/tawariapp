import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getPatientAppointments } from "@/app/actions/appointments";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getDashboardUserContext } from "@/lib/supabase/context";
import PatientAppointmentsClient from "./PatientAppointmentsClient";

async function getAppointmentsCached() {
    const context = await getDashboardUserContext();
    if (!context || context.role !== "patient" || !context.patientProfileId) {
        return { appointments: [], error: "Not authenticated or not a patient" };
    }

    const supabase = await createServiceRoleClient();
    const cached = unstable_cache(
        async (ctx: typeof context) => getPatientAppointments(undefined, supabase, ctx),
        ["patient-appointments", context.userId],
        { revalidate: 30, tags: [`appointments:${context.userId}`] }
    );
    return cached(context);
}

async function PatientAppointmentsData() {
    const { appointments } = await getAppointmentsCached();
    return <PatientAppointmentsClient initialAppointments={appointments} initialLoaded />;
}

function PatientAppointmentsFallback() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin w-8 h-8 border-2 border-[#FD614B] border-t-transparent rounded-full" />
        </div>
    );
}

export default function PatientAppointmentsPage() {
    return (
        <Suspense fallback={<PatientAppointmentsFallback />}>
            <PatientAppointmentsData />
        </Suspense>
    );
}
