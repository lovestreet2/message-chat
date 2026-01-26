"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            const data = await res.json();
            setLoading(false);

            if (!res.ok) {
                setError(data.message || "Registration failed");
                return;
            }

            // Success → go to login
            router.push("/login");
        } catch (err) {
            setLoading(false);
            setError("Unexpected error occurred. Try again later.");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center 
                        bg-gradient-to-br from-[#020617] via-[#020b2d] to-[#0a3cff] p-4">

            {/* Header */}
            <h1 className="w-full text-center text-3xl font-bold py-2
                           bg-gradient-to-r from-[#0a3cff] via-[#00c6ff] to-[#0a3cff]
                           text-white shadow-md">
                Create Message Account
            </h1>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 max-w-md w-full mx-auto mt-10
                           bg-white/10 backdrop-blur-lg
                           border border-white/20
                           p-6 rounded-2xl shadow-xl text-white"
            >
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-transparent border border-white/30 p-2 rounded
                               text-white placeholder-gray-300
                               focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    className="bg-gradient-to-r from-cyan-400 to-blue-500
                               text-black p-2 rounded font-semibold
                               hover:scale-105 transition cursor-pointer
                               disabled:opacity-50"
                >
                    {loading ? "Creating account..." : "Register"}
                </button>

                {/* Login Redirect */}
                <div className="text-center mt-4">
                    <p className="text-sm text-white mb-2">
                        Already have an account?
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="text-cyan-400 font-semibold hover:underline cursor-pointer"
                    >
                        Login instead
                    </button>
                </div>
            </form>
        </div>
    );
}
