import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    // If already logged in, go to dashboard
    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted px-4">
            <div className="w-full max-w-md rounded-lg bg-background p-6 shadow">
                {children}
            </div>
        </div>
    );
}
