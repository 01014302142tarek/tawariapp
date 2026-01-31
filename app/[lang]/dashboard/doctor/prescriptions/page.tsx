import { getDoctorPrescriptions, getDoctorPatients, getPendingRenewalRequests } from "@/app/actions/prescriptions";
import DoctorPrescriptionsClient from "./DoctorPrescriptionsClient";

export default async function DoctorPrescriptionsPage() {
    const [prescriptionsResult, patientsResult, renewalsResult] = await Promise.all([
        getDoctorPrescriptions(),
        getDoctorPatients(),
        getPendingRenewalRequests(),
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
