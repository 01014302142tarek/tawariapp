import { getPatientDashboardData } from "@/app/actions/patient-dashboard";
import PatientDashboardClient from "./PatientDashboardClient";

export default async function PatientDashboardPage() {
    const { data } = await getPatientDashboardData();

    return <PatientDashboardClient initialData={data} />;
}
