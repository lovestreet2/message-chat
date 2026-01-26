import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import AddUserForm from "@/components/users/AddUserForm";

export default async function AddUserPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
            <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(1200px_circle_at_20%_10%,rgba(56,189,248,0.20),transparent_40%),radial-gradient(900px_circle_at_90%_30%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(1000px_circle_at_50%_100%,rgba(99,102,241,0.12),transparent_55%)]" />

            <div className="relative mx-auto w-full max-w-3xl px-4 py-10">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Users
                    </h1>
                    <p className="mt-1 text-sm text-white/70">
                        Add a user to your system.
                    </p>
                </div>

                <AddUserForm />
            </div>
        </div>
    );
}
