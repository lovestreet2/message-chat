"use client";

import * as React from "react";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export type Chat = {
    id: string;
    name: string;
    avatarUrl?: string | null;
    isGroup?: boolean;
};

type PresenceStatus = "online" | "offline" | "typing" | "away";

interface ChatHeaderProps {
    chat: Chat;
    onBack?: () => void;

    status?: PresenceStatus;
    subtitle?: string;

    onCall?: () => void;
    onVideoCall?: () => void;
    onMore?: () => void;

    showActions?: boolean;
}

function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("");
}

function statusText(status: PresenceStatus, isGroup?: boolean) {
    if (isGroup) return "Group chat";
    switch (status) {
        case "online":
            return "Online";
        case "away":
            return "Away";
        case "typing":
            return "Typing…";
        default:
            return "Offline";
    }
}

function statusDotClass(status: PresenceStatus) {
    switch (status) {
        case "online":
            return "bg-emerald-400";
        case "typing":
            return "bg-cyan-400";
        case "away":
            return "bg-amber-400";
        default:
            return "bg-zinc-500";
    }
}

export default function ChatHeader({
    chat,
    onBack,
    status = "online",
    subtitle,
    onCall,
    onVideoCall,
    onMore,
    showActions = true,
}: ChatHeaderProps) {
    const sub = subtitle ?? statusText(status, chat.isGroup);

    const handleBack = React.useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation(); // ✅ prevents parent click handlers from swallowing
            onBack?.();
        },
        [onBack]
    );

    return (
        <header className="sticky top-0 z-30 h-16 px-3 sm:px-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-xl">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
                {/* Back (mobile only) */}
                {onBack ? (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleBack}
                        className="md:hidden h-9 w-9 p-0 text-white/80 hover:text-white hover:bg-white/10"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                ) : null}

                {/* Avatar */}
                <div className="relative">
                    <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={chat.avatarUrl ?? undefined} alt={chat.name} />
                        <AvatarFallback className="bg-white/10 text-white">
                            {initials(chat.name)}
                        </AvatarFallback>
                    </Avatar>

                    {!chat.isGroup ? (
                        <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-[#0f172a] ${statusDotClass(
                                status
                            )}`}
                            aria-hidden="true"
                        />
                    ) : null}
                </div>

                {/* Title + subtitle */}
                <div className="min-w-0">
                    <h2 className="text-white font-semibold truncate">{chat.name}</h2>

                    <div className="flex items-center gap-2">
                        {!chat.isGroup ? (
                            <span
                                className={`h-2 w-2 rounded-full ${statusDotClass(status)}`}
                                aria-hidden="true"
                            />
                        ) : null}

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
                            {sub}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right actions */}
            {showActions ? (
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCall}
                        disabled={!onCall}
                        className="h-9 w-9 p-0 text-white/75 hover:text-white hover:bg-white/10 disabled:opacity-40"
                        aria-label="Voice call"
                    >
                        <Phone className="h-5 w-5" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onVideoCall}
                        disabled={!onVideoCall}
                        className="h-9 w-9 p-0 text-white/75 hover:text-white hover:bg-white/10 disabled:opacity-40"
                        aria-label="Video call"
                    >
                        <Video className="h-5 w-5" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onMore}
                        className="h-9 w-9 p-0 text-white/75 hover:text-white hover:bg-white/10"
                        aria-label="More options"
                    >
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            ) : null}
        </header>
    );
}
