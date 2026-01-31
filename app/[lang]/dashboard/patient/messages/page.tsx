import { getConversations } from "@/app/actions/messages";
import PatientMessagesClient from "./PatientMessagesClient";

export default async function PatientMessagesPage() {
    const { conversations } = await getConversations();

    return <PatientMessagesClient initialConversations={conversations} initialLoaded />;
}
