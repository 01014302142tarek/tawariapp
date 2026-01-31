import { getConversations } from "@/app/actions/messages";
import DoctorMessagesClient from "./DoctorMessagesClient";

export default async function DoctorMessagesPage() {
    const { conversations } = await getConversations();

    return <DoctorMessagesClient initialConversations={conversations} initialLoaded />;
}
