import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import UsersClient from "@/components/users/users-client";

export default async function UsersPage() {
    const session = await getServerSession(authOptions);

    // ✅ Only auth check (no roles)
    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020b2d] to-[#0a3cff] text-white">
            <UsersClient />
        </div>
    );
}
