"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import ChatListItem, { ChatItem } from "./ChatListItem";

interface ChatListProps {
    chats: ChatItem[];
    onSelect: (chat: ChatItem) => void;
}

export default function ChatList({ chats, onSelect }: ChatListProps) {
    const [search, setSearch] = useState("");

    const filteredChats = chats.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            {/* Search */}
            <div className="p-6 border-b border-white/20">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search chats..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    />
                </div>
            </div>

            {/* Chats */}
            <div className="flex-1 overflow-y-auto">
                {filteredChats.map((chat) => (
                    <ChatListItem
                        key={chat.id}
                        chat={chat}
                        onClick={() => onSelect(chat)}
                    />
                ))}
            </div>
        </div>
    );
}
