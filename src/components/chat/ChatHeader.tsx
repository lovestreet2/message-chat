"use client";

import * as React from "react";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    onUserStatusChange,
    onTyping,
    emitOnline,
    emitOffline,
    type UserStatusPayload,
    getSocket,
} from "@/lib/socket";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type Chat = {
    id: string;
    name: string;
    avatarUrl?: string | null;
    isGroup?: boolean;
    userId?: string; // other user (1:1 only)
};

type PresenceStatus = "online" | "offline" | "typing";

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */

function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("");
}

function timeAgo(ts: number) {
    const diff = Math.floor((Date.now() - ts) / 1000);

    if (diff < 10) return "just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

interface ChatHeaderProps {
    chat: Chat;
    sessionUserId: string;
    onBack?: () => void;
    showActions?: boolean;
}

export default function ChatHeader({
    chat,
    sessionUserId,
    onBack,
    showActions = true,
}: ChatHeaderProps) {
    const [status, setStatus] = React.useState<PresenceStatus>("offline");
    const [lastSeen, setLastSeen] = React.useState<number | null>(null);

    /* --------------------------------------------------
       Emit OWN online/offline (once per session)
    --------------------------------------------------- */
    React.useEffect(() => {
        if (!sessionUserId) return;

        const socket = getSocket();

        if (socket.connected) {
            emitOnline(sessionUserId);
        } else {
            socket.once("connect", () => emitOnline(sessionUserId));
        }

        return () => {
            emitOffline(sessionUserId);
        };
    }, [sessionUserId]);


    /* --------------------------------------------------
       Presence (online / offline)
    --------------------------------------------------- */
    React.useEffect(() => {
        if (chat.isGroup || !chat.userId) return;

        return onUserStatusChange(
            ({ userId, online, lastSeen }: UserStatusPayload) => {
                if (userId !== chat.userId) return;

                setStatus(online ? "online" : "offline");
                if (!online && lastSeen) setLastSeen(lastSeen);
            }
        );
    }, [chat.isGroup, chat.userId]);

    /* --------------------------------------------------
       Typing indicator
    --------------------------------------------------- */
    React.useEffect(() => {
        if (chat.isGroup || !chat.userId) return;

        return onTyping(({ fromUserId, typing }) => {
            if (fromUserId !== chat.userId) return;
            setStatus(typing ? "typing" : "online");
        });
    }, [chat.isGroup, chat.userId]);

    /* --------------------------------------------------
       Subtitle text
    --------------------------------------------------- */
    const subtitle = chat.isGroup
        ? "Group chat"
        : status === "typing"
            ? "Typing…"
            : status === "online"
                ? "Online"
                : lastSeen
                    ? `Last seen ${timeAgo(lastSeen)}`
                    : "Offline";

    /* --------------------------------------------------
       UI
    --------------------------------------------------- */
    return (
        <header className="sticky top-0 z-30 h-16 px-3 sm:px-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-xl">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
                {onBack && (
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="md:hidden h-9 w-9 p-0 text-white/80 hover:text-white hover:bg-white/10"
                        aria-label="Back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}

                {/* Avatar */}
                <div className="relative">
                    <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={chat.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-white/10 text-white">
                            {initials(chat.name)}
                        </AvatarFallback>
                    </Avatar>

                    {!chat.isGroup && (
                        <span
                            className={[
                                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-[#0f172a]",
                                status === "online"
                                    ? "bg-emerald-400"
                                    : status === "typing"
                                        ? "bg-cyan-400"
                                        : "bg-zinc-500",
                            ].join(" ")}
                        />
                    )}
                </div>

                {/* Title */}
                <div className="min-w-0">
                    <h2 className="font-semibold truncate">{chat.name}</h2>
                    <p
                        className={[
                            "text-xs truncate",
                            status === "typing"
                                ? "text-cyan-300"
                                : status === "online"
                                    ? "text-emerald-300"
                                    : "text-white/60",
                        ].join(" ")}
                    >
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Right actions */}
            {showActions && (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" className="h-9 w-9 p-0">
                        <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" className="h-9 w-9 p-0">
                        <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" className="h-9 w-9 p-0">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </header>
    );
}
