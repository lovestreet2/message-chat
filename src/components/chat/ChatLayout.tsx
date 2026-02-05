"use client";

import { useMemo, useState } from "react";
import Sidebar from "../Sidebar";
import ChatList from "./ChatList";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import type { ChatItem } from "./ChatListItem";
import type { Message } from "./MessageBubble";

interface ChatLayoutProps {
    chats: ChatItem[];
    messages: Message[];

    /** parent fetch messages when selected */
    onChatSelect: (chatId: string) => void;

    /** active chat id from parent (single source of truth) */
    activeChatId?: string | null;

    /** authenticated user id (REQUIRED for presence) */
    sessionUserId: string;

    /** send handler */
    onSendMessage?: (text: string) => Promise<void> | void;

    /** files handler */
    onFiles?: (files: FileList) => Promise<void> | void;

    onBackToList?: () => void;
}

export default function ChatLayout({
    chats,
    messages,
    onChatSelect,
    activeChatId = null,
    sessionUserId,
    onSendMessage,
    onFiles,
    onBackToList,
}: ChatLayoutProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    /* ✅ Always derive selected chat from latest list */
    const selected = useMemo(() => {
        const id = selectedId ?? activeChatId;
        if (!id) return null;
        return chats.find((c) => c.id === id) ?? null;
    }, [selectedId, activeChatId, chats]);

    function handleSelect(chat: ChatItem) {
        setSelectedId(chat.id);
        onChatSelect(chat.id);
    }

    const chatsWithActive = useMemo(() => {
        const currentId = selected?.id ?? activeChatId;
        return chats.map((c) => ({ ...c, active: currentId === c.id }));
    }, [chats, selected?.id, activeChatId]);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
            {/* Sidebar */}
            <aside className="hidden md:flex w-16 border-r border-white/10">
                <Sidebar />
            </aside>

            {/* Chat List */}
            <section
                className={[
                    "flex flex-col bg-white/5 backdrop-blur-lg border-r border-white/10",
                    "transition-all duration-300 overflow-hidden",
                    "w-full md:w-80",
                    selected ? "hidden md:flex" : "flex",
                ].join(" ")}
            >
                <ChatList chats={chatsWithActive} onSelect={handleSelect} />
            </section>

            {/* Chat Window */}
            <section
                className={[
                    "flex-1 flex flex-col bg-white/5 backdrop-blur-lg",
                    !selected ? "hidden md:flex" : "flex",
                ].join(" ")}
            >
                {selected ? (
                    <>
                        {/* Header (presence-aware) */}
                        <ChatHeader
                            chat={selected}
                            sessionUserId={sessionUserId}
                            onBack={() => {
                                setSelectedId(null);
                                onBackToList?.();
                            }}
                        />

                        {/* Messages */}
                        <MessageList messages={messages} />

                        {/* Input */}
                        <div className="sticky bottom-0">
                            <MessageInput
                                onSend={onSendMessage}
                                onFiles={onFiles}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-white/60 text-lg md:text-xl font-semibold">
                        Select a chat
                    </div>
                )}
            </section>
        </div>
    );
}
