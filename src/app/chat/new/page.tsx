import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/authOptions";
import BackButton from "@/components/common/BackButton";
import NewChatClient from "@/components/chat/NewChatClient";

export default async function NewChatPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
            {/* Back button only for this page */}
            <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0f172a]/60 px-4 py-3 backdrop-blur-xl">
                <BackButton fallbackHref="/chat" label="Back" />
            </div>

            <div className="flex h-full mx-auto w-full max-w-3xl px-4 py-6">
                <NewChatClient />
            </div>
        </div>
    );
}
