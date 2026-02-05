"use client";

import * as React from "react";
import { Camera, Save, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type MeResponse = {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
};

function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("");
}

export default function SettingsClient() {
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);
    const [ok, setOk] = React.useState<string | null>(null);

    const [me, setMe] = React.useState<MeResponse | null>(null);

    const [form, setForm] = React.useState({
        displayName: "",
        username: "",
        avatarUrl: "",
        bio: "",
    });

    async function load() {
        setErr(null);
        setLoading(true);
        try {
            const res = await fetch("/api/me", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to load profile");
            const data = (await res.json()) as MeResponse;
            setMe(data);
            setForm({
                displayName: data.displayName ?? "",
                username: data.username ?? "",
                avatarUrl: data.avatarUrl ?? "",
                bio: data.bio ?? "",
            });
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
    }, []);

    async function onSave() {
        setErr(null);
        setOk(null);
        setSaving(true);
        try {
            const res = await fetch("/api/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    displayName: form.displayName.trim(),
                    username: form.username.trim(),
                    avatarUrl: form.avatarUrl.trim() || null,
                    bio: form.bio.trim() || null,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error ?? "Failed to save");

            setOk("Saved!");
            await load();
            setTimeout(() => setOk(null), 1500);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Failed to save");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
                <div className="mx-auto max-w-4xl px-4 py-8 text-white/70">Loading settings…</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
            {/* glow overlay */}
            <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(1200px_circle_at_20%_10%,rgba(56,189,248,0.20),transparent_40%),radial-gradient(900px_circle_at_90%_30%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(1000px_circle_at_50%_100%,rgba(99,102,241,0.12),transparent_55%)]" />

            <div className="relative mx-auto w-full max-w-4xl px-4 py-6 sm:py-10">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Settings</h1>
                        <p className="text-sm text-white/60">Manage your profile and preferences</p>
                    </div>

                    <Button
                        onClick={onSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Profile card */}
                    <Card className="border-white/10 bg-white/5 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-cyan-300" />
                                Profile
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border border-white/10">
                                    <AvatarImage src={form.avatarUrl || undefined} />
                                    <AvatarFallback className="bg-white/10 text-white">
                                        {initials(form.displayName || me?.username || "U")}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0">
                                    <div className="text-sm text-white/60">Signed in as</div>
                                    <div className="truncate font-medium">{me?.email}</div>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
                                        <Camera className="h-4 w-4" />
                                        Paste an avatar URL below
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-white/10" />

                            <div className="grid gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-white/60">Display name</label>
                                    <Input
                                        value={form.displayName}
                                        onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                                        placeholder="Your name"
                                        className="border-white/10 bg-white/10 text-white placeholder:text-white/40"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs text-white/60">Username</label>
                                    <Input
                                        value={form.username}
                                        onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                                        placeholder="your_username"
                                        className="border-white/10 bg-white/10 text-white placeholder:text-white/40"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs text-white/60">Avatar URL</label>
                                    <Input
                                        value={form.avatarUrl}
                                        onChange={(e) => setForm((p) => ({ ...p, avatarUrl: e.target.value }))}
                                        placeholder="https://…"
                                        className="border-white/10 bg-white/10 text-white placeholder:text-white/40"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs text-white/60">Bio</label>
                                    <Textarea
                                        value={form.bio}
                                        onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                                        placeholder="A short bio…"
                                        className="min-h-[100px] border-white/10 bg-white/10 text-white placeholder:text-white/40"
                                    />
                                </div>
                            </div>

                            {err ? <p className="text-sm text-red-300">{err}</p> : null}
                            {ok ? <p className="text-sm text-emerald-300">{ok}</p> : null}
                        </CardContent>
                    </Card>

                    {/* Security card */}
                    <Card className="border-white/10 bg-white/5 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-cyan-300" />
                                Security
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="font-medium">Password</div>
                                <p className="text-sm text-white/60 mt-1">
                                    For now, change password from the admin/user edit page.
                                    (We can add reset/change password UI next.)
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="font-medium">Session</div>
                                <p className="text-sm text-white/60 mt-1">
                                    You’re currently signed in. If you want, I can add a “Sign out” button here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
