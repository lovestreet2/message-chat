"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addUser } from "@/server/actions/user.actions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AddUserForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [form, setForm] = useState({
        email: "",
        password: "",
        username: "",
        displayName: "",
        avatarUrl: "",
        bio: "",
    });

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        try {
            const res = await addUser({
                email: form.email.trim(),
                password: form.password,
                username: form.username.trim(),
                displayName: form.displayName.trim(),
                avatarUrl: form.avatarUrl.trim() || undefined,
                bio: form.bio.trim() || undefined,
            });

            if (!res?.ok) {
                setErr(res?.message || "Failed to add user");
                return;
            }

            router.push("/users"); // ✅ go to users list after success
            router.refresh();
        } catch (e: unknown) {
            if (e instanceof Error) {
                setErr(e.message);
            } else {
                setErr("Something went wrong");
            }
        } finally {
            setLoading(false);
        }

    }


    return (
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-white">Add New User</CardTitle>
                <p className="text-sm text-white/70">
                    Create a new user account manually.
                </p>
            </CardHeader>

            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    {err ? <p className="text-sm text-rose-300">{err}</p> : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                            className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/40"
                            placeholder="Display name"
                            value={form.displayName}
                            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                        />
                        <Input
                            className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/40"
                            placeholder="Username"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                        />
                    </div>

                    <Input
                        className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/40"
                        placeholder="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />

                    <Input
                        className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/40"
                        placeholder="Password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />

                    <Input
                        className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/40"
                        placeholder="Avatar URL (optional)"
                        value={form.avatarUrl}
                        onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                    />

                    <Textarea
                        className="min-h-[100px] border-white/10 bg-white/5 text-white placeholder:text-white/40"
                        placeholder="Bio (optional)"
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    />

                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-11 w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:opacity-90"
                    >
                        {loading ? "Creating..." : "Create User"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
