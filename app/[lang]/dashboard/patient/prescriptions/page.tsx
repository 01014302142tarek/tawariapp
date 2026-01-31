import { getPatientPrescriptions } from "@/app/actions/prescriptions";
import PatientPrescriptionsClient from "./PatientPrescriptionsClient";

export default async function PatientPrescriptionsPage() {
    const { prescriptions } = await getPatientPrescriptions();

    return <PatientPrescriptionsClient initialPrescriptions={prescriptions} initialLoaded />;
}
