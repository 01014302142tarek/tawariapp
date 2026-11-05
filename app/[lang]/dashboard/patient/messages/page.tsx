import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getConversations } from "@/app/actions/messages";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getDashboardUserContext } from "@/lib/supabase/context";
import PatientMessagesClient from "./PatientMessagesClient";

async function getConversationsCached() {
    const context = await getDashboardUserContext();
    if (!context) {
        return { conversations: [], error: "Not authenticated" };
    }

    const supabase = await createServiceRoleClient();
    const cached = unstable_cache(
        async (ctx: typeof context) => getConversations(supabase, ctx),
        ["patient-conversations", context.userId],
        { revalidate: 15, tags: [`conversations:${context.userId}`] }
    );
    return cached(context);
}

async function PatientMessagesData() {
    const { conversations } = await getConversationsCached();
    return <PatientMessagesClient initialConversations={conversations} initialLoaded />;
}

function PatientMessagesFallback() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin w-8 h-8 border-2 border-[#FD614B] border-t-transparent rounded-full" />
        </div>
    );
}

export default function PatientMessagesPage() {
    return (
        <Suspense fallback={<PatientMessagesFallback />}>
            <PatientMessagesData />
        </Suspense>
    );
}
