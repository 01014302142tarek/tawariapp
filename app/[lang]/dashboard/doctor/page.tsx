import { getDoctorDashboardData } from "@/app/actions/doctor-dashboard";
import DoctorDashboardClient from "./DoctorDashboardClient";

export default async function DoctorDashboardPage() {
    const { data } = await getDoctorDashboardData();

    return <DoctorDashboardClient initialData={data} />;
}
