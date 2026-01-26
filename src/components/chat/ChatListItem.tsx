"use client";

import React from "react";

export type ChatItem = {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    unread?: number;
    avatarUrl?: string | null; // ✅ rename from avatar
    isGroup?: boolean;
    active?: boolean; // ✅ to highlight selected chat
};

interface ChatListItemProps {
    chat: ChatItem;
    onClick: () => void;
}

function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("");
}

export default function ChatListItem({ chat, onClick }: ChatListItemProps) {
    return (
        <button
            onClick={onClick}
            className={[
                "group w-full p-3 sm:p-4 flex gap-3 text-left border-b border-white/10",
                "transition-all duration-200",
                chat.active ? "bg-white/10" : "hover:bg-white/10",
            ].join(" ")}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                <div
                    className="h-11 w-11 sm:h-12 sm:w-12 overflow-hidden rounded-full border border-white/10
          bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center
          text-slate-950 font-bold transition-transform group-hover:scale-[1.03]"
                >
                    {chat.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={chat.avatarUrl}
                            alt={chat.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-white">{initials(chat.name)}</span>
                    )}
                </div>

                {/* Unread badge */}
                {typeof chat.unread === "number" && chat.unread > 0 ? (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-cyan-300 text-[11px] flex items-center justify-center text-slate-950">
                        {chat.unread > 99 ? "99+" : chat.unread}
                    </span>
                ) : null}
            </div>

            {/* Chat info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                    <h3 className="text-white font-semibold truncate">{chat.name}</h3>
                    <span className="text-[11px] sm:text-xs text-white/50 shrink-0">
                        {chat.time}
                    </span>
                </div>

                {/* ✅ Preview line */}
                <p className="text-xs sm:text-sm text-white/60 truncate">
                    {chat.lastMessage?.trim() ? chat.lastMessage : "No messages yet"}
                </p>
            </div>
        </button>
    );
}
