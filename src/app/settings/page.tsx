import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SettingsClient from "@/components/settings/settings-client";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    return <SettingsClient />;
}
