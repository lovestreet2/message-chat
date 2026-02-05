"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type UserRow = {
    id: string;
    displayName: string;
    username: string;
    email: string;
    role: string;
    isDeleted: boolean;
    avatarUrl: string | null;
    createdAt: string;
};

type UsersResponse = {
    items: UserRow[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("");
}

export default function UsersClient() {
    const router = useRouter();
    const sp = useSearchParams();

    const [q, setQ] = React.useState(sp.get("q") ?? "");
    const [status, setStatus] = React.useState(sp.get("status") ?? "active"); // active | deleted | all
    const [page, setPage] = React.useState(Number(sp.get("page") ?? "1"));
    const pageSize = 12;

    const [data, setData] = React.useState<UsersResponse | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState<string | null>(null);

    function syncUrl(next: { q?: string; status?: string; page?: number }) {
        const params = new URLSearchParams(sp.toString());
        if (next.q !== undefined) params.set("q", next.q);
        if (next.status !== undefined) params.set("status", next.status);
        if (next.page !== undefined) params.set("page", String(next.page));
        router.push(`/users?${params.toString()}`);
    }

    async function load() {
        setLoading(true);
        setErr(null);
        try {
            const params = new URLSearchParams();
            params.set("q", q.trim());
            params.set("status", status);
            params.set("page", String(page));
            params.set("pageSize", String(pageSize));

            const res = await fetch(`/api/users?${params.toString()}`, {
                credentials: "include",
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error ?? "Failed to load users");
            setData(json);
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

    React.useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, status, page]);

    function onSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPage(1);
        syncUrl({ q, status, page: 1 });
    }

    async function restoreUser(id: string) {
        setErr(null);
        try {
            const res = await fetch(`/api/users/${id}/restore`, {
                method: "POST",
                credentials: "include",
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error ?? "Restore failed");
            await load();
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Restore failed");
        }

    }

    async function softDeleteUser(id: string) {
        setErr(null);
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error ?? "Delete failed");
            await load();
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Delete failed");
        }
    }

    return (
        <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mx-auto mb-6 max-w-6xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#0a3cff] via-[#00c6ff] to-[#0a3cff] py-3 px-5 rounded-xl shadow-lg w-fit">
                        Users
                    </h1>

                    <div className="flex gap-2">
                        <Link
                            href="/users/add"
                            className="bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-2 rounded-lg shadow-lg text-white hover:bg-white/20 transition"
                        >
                            Add User
                        </Link>

                        <Link
                            href="/dashboard"
                            className="bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-2 rounded-lg shadow-lg text-white hover:bg-white/20 transition"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <form onSubmit={onSearchSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search name, username, email…"
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                    />

                    <select
                        aria-label="Filter users by status"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                            syncUrl({ status: e.target.value, page: 1 });
                        }}
                        className="h-10 rounded-md border border-white/20 bg-white/10 px-3 text-white"
                    >

                        <option value="active">Active</option>
                        <option value="deleted">Deleted</option>
                        <option value="all">All</option>
                    </select>

                    <Button type="submit" className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black">
                        Search
                    </Button>
                </form>

                {err ? <p className="mt-3 text-sm text-red-300">{err}</p> : null}
            </div>

            {/* Content */}
            <div className="mx-auto max-w-6xl">
                {loading ? (
                    <div className="text-white/70">Loading…</div>
                ) : !data ? (
                    <div className="text-white/70">No data</div>
                ) : (
                    <>
                        {/* Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {data.items.map((u) => (
                                <div
                                    key={u.id}
                                    className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl hover:scale-[1.02] transition cursor-pointer"
                                    onClick={() => router.push(`/users/${u.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold">
                                            {u.avatarUrl ? (
                                                <img
                                                    src={u.avatarUrl}
                                                    alt={u.displayName || u.username}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span>{initials(u.displayName || u.username)}</span>
                                            )}

                                        </div>

                                        <div className="min-w-0">
                                            <h2 className="text-lg font-semibold truncate">{u.displayName}</h2>
                                            <p className="text-xs text-white/60 truncate">@{u.username}</p>
                                        </div>
                                    </div>

                                    <p className="mt-3 text-sm text-white/70 truncate">{u.email}</p>
                                    <p className="mt-1 text-xs text-white/50">Role: {u.role}</p>

                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/users/${u.id}`);
                                            }}
                                        >
                                            View Profile
                                        </Button>

                                        {u.isDeleted ? (
                                            <Button
                                                variant="secondary"
                                                className="w-full"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    restoreUser(u.id);
                                                }}
                                            >
                                                Restore
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="destructive"
                                                className="w-full"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    softDeleteUser(u.id);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-8 flex items-center justify-between">
                            <div className="text-sm text-white/60">
                                Page {data.page} of {data.totalPages} • Total {data.total}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    disabled={data.page <= 1}
                                    onClick={() => {
                                        const next = Math.max(1, page - 1);
                                        setPage(next);
                                        syncUrl({ page: next });
                                    }}
                                >
                                    Prev
                                </Button>

                                <Button
                                    variant="secondary"
                                    disabled={data.page >= data.totalPages}
                                    onClick={() => {
                                        const next = Math.min(data.totalPages, page + 1);
                                        setPage(next);
                                        syncUrl({ page: next });
                                    }}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
