import { getDoctorAppointments } from "@/app/actions/appointments";
import DoctorAppointmentsClient from "./DoctorAppointmentsClient";

export default async function DoctorAppointmentsPage() {
    const { appointments } = await getDoctorAppointments();

    return <DoctorAppointmentsClient initialAppointments={appointments} initialLoaded={true} />;
}
