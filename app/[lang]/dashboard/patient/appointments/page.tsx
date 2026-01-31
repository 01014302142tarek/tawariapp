import { getPatientAppointments } from "@/app/actions/appointments";
import PatientAppointmentsClient from "./PatientAppointmentsClient";

export default async function PatientAppointmentsPage() {
    const { appointments } = await getPatientAppointments();

    return <PatientAppointmentsClient initialAppointments={appointments} initialLoaded />;
}
