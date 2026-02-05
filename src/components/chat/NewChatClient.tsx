"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrGetDirectRoom } from "@/server/actions/room.actions";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserResult = {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
};

function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("");
}

export default function NewChatClient() {
    const router = useRouter();
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<UserResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    const canSearch = useMemo(() => q.trim().length >= 2, [q]);

    useEffect(() => {
        let ignore = false;

        async function run() {
            setError(null);
            if (!canSearch) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(q.trim())}`);
                if (!res.ok) throw new Error("Search failed");
                const data = (await res.json()) as UserResult[];
                if (!ignore) setResults(data);
            } catch (e: unknown) {
                if (ignore) return;

                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("Something went wrong");
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        const t = setTimeout(run, 300);
        return () => {
            ignore = true;
            clearTimeout(t);
        };
    }, [q, canSearch]);

    async function startChat(userId: string) {
        setError(null);
        try {
            const roomId = await createOrGetDirectRoom(userId);
            router.push(`/chat/${roomId}`);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Unable to start chat");
        }

    }


    return (
        <div className="w-full bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
            {/* Subtle overlay effects */}
            <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(1200px_circle_at_20%_10%,rgba(56,189,248,0.20),transparent_40%),radial-gradient(900px_circle_at_90%_30%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(1000px_circle_at_50%_100%,rgba(99,102,241,0.12),transparent_55%)]" />

            <div className="relative mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        New Message
                    </h1>
                    <p className="mt-1 text-sm text-white/70 sm:text-base">
                        Search people and start a conversation instantly.
                    </p>
                </div>

                {/* Glass card */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-lg sm:text-xl text-white">
                            Start a new conversation
                        </CardTitle>
                        <p className="text-sm text-white/70">
                            Type at least 2 characters to search.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {/* Search */}
                        <div className="space-y-2">
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search by name, username, or email…"
                                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                            />

                            {error ? (
                                <p className="text-sm text-rose-300">{error}</p>
                            ) : (
                                <p className="text-sm text-white/60">
                                    {loading
                                        ? "Searching…"
                                        : canSearch
                                            ? "Results below"
                                            : "Type at least 2 characters"}
                                </p>
                            )}
                        </div>

                        {/* Results */}
                        <div className="space-y-3">
                            {results.length === 0 && canSearch && !loading ? (
                                <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                                    No users found.
                                </div>
                            ) : null}

                            {results.map((u) => (
                                <div
                                    key={u.id}
                                    className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-white/10">
                                            <AvatarImage src={u.avatarUrl ?? undefined} />
                                            <AvatarFallback className="bg-white/10 text-white">
                                                {initials(u.displayName)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0">
                                            <div className="truncate font-medium text-white">
                                                {u.displayName}
                                            </div>
                                            <div className="truncate text-sm text-white/60">
                                                @{u.username}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => startChat(u.id)}
                                        className="h-10 w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:opacity-90 sm:w-auto"
                                    >
                                        Message
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Footer hint */}
                <div className="mt-6 text-xs text-white/50">
                    Tip: Use <span className="text-white/70">@username</span> for faster search.
                </div>
            </div>
        </div>
    );
}
