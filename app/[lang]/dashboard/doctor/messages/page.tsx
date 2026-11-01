import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getConversations } from "@/app/actions/messages";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getDashboardUserContext } from "@/lib/supabase/context";
import DoctorMessagesClient from "./DoctorMessagesClient";

async function getConversationsCached() {
    const context = await getDashboardUserContext();
    if (!context) {
        return { conversations: [], error: "Not authenticated" };
    }

    const supabase = await createServiceRoleClient();
    const cached = unstable_cache(
        async (ctx: typeof context) => getConversations(supabase, ctx),
        ["doctor-conversations", context.userId],
        { revalidate: 15, tags: [`conversations:${context.userId}`] }
    );
    return cached(context);
}

async function DoctorMessagesData() {
    const { conversations } = await getConversationsCached();
    return <DoctorMessagesClient initialConversations={conversations} initialLoaded />;
}

function DoctorMessagesFallback() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
    );
}

export default function DoctorMessagesPage() {
    return (
        <Suspense fallback={<DoctorMessagesFallback />}>
            <DoctorMessagesData />
        </Suspense>
    );
}
