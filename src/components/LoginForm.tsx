"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                identifier,
                password,
                redirect: false,
            });


            setLoading(false);

            if (!res) {
                setError("Something went wrong. Please try again.");
                return;
            }

            if (res.error) {
                setError(res.error); // NextAuth returns user-friendly error
                return;
            }

            // Success → redirect
            router.push("/dashboard");
        } catch (err) {
            setLoading(false);
            setError("Unexpected error occurred. Try again later.");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#020617] via-[#020b2d] to-[#0a3cff] p-4">
            {/* Header */}
            <h1 className="w-full text-center text-3xl font-bold py-6 
                   bg-gradient-to-r from-[#0a3cff] via-[#00c6ff] to-[#0a3cff] 
                   text-white shadow-md">
                Message App Login
            </h1>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 max-w-md w-full mx-auto mt-10 
                   bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl text-white"
            >
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <input
                    type="text"
                    placeholder="Email or Username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="bg-transparent border border-white/30 p-2 rounded
             text-white placeholder-gray-300
             focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border border-white/30 p-2 rounded
             text-white placeholder-gray-300
             focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black p-2 rounded fount-semibold
                       hover:scale-105 transition cursor-pointer "
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                {/* Register Section */}
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 mb-2 text-white">
                        Don’t have an account?
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push("/register")}
                        className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                    >
                        Create an account
                    </button>
                </div>
            </form>
        </div>

    );
} 