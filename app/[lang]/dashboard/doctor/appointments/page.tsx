import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getDoctorAppointments } from "@/app/actions/appointments";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getDashboardUserContext } from "@/lib/supabase/context";
import DoctorAppointmentsClient from "./DoctorAppointmentsClient";

async function getAppointmentsCached() {
    const context = await getDashboardUserContext();
    if (!context || context.role !== "doctor" || !context.doctorProfileId) {
        return { appointments: [], error: "Not authenticated or not a doctor" };
    }

    const supabase = await createServiceRoleClient();
    const cached = unstable_cache(
        async (ctx: typeof context) => getDoctorAppointments(undefined, supabase, ctx),
        ["doctor-appointments", context.userId],
        { revalidate: 30, tags: [`appointments:${context.userId}`] }
    );
    return cached(context);
}

async function DoctorAppointmentsData() {
    const { appointments } = await getAppointmentsCached();
    return <DoctorAppointmentsClient initialAppointments={appointments} initialLoaded />;
}

function DoctorAppointmentsFallback() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
    );
}

export default function DoctorAppointmentsPage() {
    return (
        <Suspense fallback={<DoctorAppointmentsFallback />}>
            <DoctorAppointmentsData />
        </Suspense>
    );
}
