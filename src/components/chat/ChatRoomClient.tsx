"use client";

import * as React from "react";
import Sidebar from "../Sidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import type { Message } from "@/components/chat/MessageBubble";
import { getSocket, type SocketMessage } from "@/lib/socket";

/* ----------------------------- */
/* Types                         */
/* ----------------------------- */

type ApiMessage = {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    sender?: {
        displayName?: string | null;
        username?: string | null;
    } | null;
};

interface ChatRoomClientProps {
    roomId: string;
    chatName: string;
    sessionUserId: string;
    onBack?: () => void;
}

/* ----------------------------- */
/* Component                     */
/* ----------------------------- */

export default function ChatRoomClient({
    roomId,
    chatName,
    sessionUserId,
    onBack,
}: ChatRoomClientProps) {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [loading, setLoading] = React.useState(true);

    /* ----------------------------- */
    /* Load messages (HTTP)          */
    /* ----------------------------- */

    const loadMessages = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/chats/${roomId}/messages`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to load messages");

            const data = (await res.json()) as ApiMessage[];

            setMessages(
                data.map((m) => ({
                    id: m.id,
                    text: m.content,
                    senderName:
                        m.sender?.displayName ??
                        m.sender?.username ??
                        "User",
                    time: new Date(m.createdAt),
                    isOwn: m.senderId === sessionUserId,
                    status:
                        m.senderId === sessionUserId ? "delivered" : undefined,
                }))
            );
        } finally {
            setLoading(false);
        }
    }, [roomId, sessionUserId]);

    /* ----------------------------- */
    /* Initial fetch                 */
    /* ----------------------------- */

    React.useEffect(() => {
        void loadMessages();
    }, [loadMessages]);

    /* ----------------------------- */
    /* Socket connection             */
    /* ----------------------------- */

    React.useEffect(() => {
        const socket = getSocket();

        if (!socket.connected) {
            socket.connect(); // ✅ REQUIRED
        }

        socket.emit("room:join", roomId);

        const onNewMessage = (msg: SocketMessage) => {
            setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;

                return [
                    ...prev,
                    {
                        id: msg.id,
                        text: msg.content,
                        senderName:
                            msg.sender?.displayName ??
                            msg.sender?.username ??
                            "User",
                        time: new Date(msg.createdAt),
                        isOwn: msg.senderId === sessionUserId,
                        status:
                            msg.senderId === sessionUserId ? "delivered" : undefined,
                    },
                ];
            });
        };

        socket.on("message:new", onNewMessage);

        return () => {
            socket.off("message:new", onNewMessage);
            socket.emit("room:leave", roomId);
        };
    }, [roomId, sessionUserId]);

    /* ----------------------------- */
    /* Send message                  */
    /* ----------------------------- */

    async function handleSend(text: string) {
        const tempId = crypto.randomUUID();

        setMessages((prev) => [
            ...prev,
            {
                id: tempId,
                text,
                senderName: "You",
                time: new Date(),
                isOwn: true,
                status: "sending",
                onRetry: () => handleSend(text),
            },
        ]);

        try {
            const res = await fetch(`/api/chats/${roomId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content: text }),
            });

            const created = await res.json();
            if (!res.ok) throw new Error();

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === tempId
                        ? {
                            id: created.id,
                            text: created.content,
                            senderName:
                                created.sender?.displayName ??
                                created.sender?.username ??
                                "You",
                            time: new Date(created.createdAt),
                            isOwn: true,
                            status: "sent",
                        }
                        : m
                )
            );

            getSocket().emit("message:send", {
                roomId,
                message: created,
            });
        } catch {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === tempId
                        ? {
                            ...m,
                            status: "failed",
                            onRetry: () => handleSend(text),
                        }
                        : m
                )
            );
        }
    }

    /* ----------------------------- */
    /* UI                            */
    /* ----------------------------- */

    return (
        <div className="flex h-dvh w-full overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] text-white">
            {/* Sidebar */}
            <aside className="hidden md:flex w-16 border-r border-white/10">
                <Sidebar />
            </aside>

            {/* Chat column */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <ChatHeader
                    chat={{ id: roomId, name: chatName }}
                    sessionUserId={sessionUserId}
                    onBack={onBack}
                    showActions
                />

                <div className="flex-1 overflow-y-auto px-2 sm:px-4">
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-white/60">
                            Loading messages…
                        </div>
                    ) : (
                        <MessageList messages={messages} />
                    )}
                </div>

                <div className="border-t border-white/10 bg-black/20 backdrop-blur">
                    <MessageInput onSend={handleSend} />
                </div>
            </div>
        </div>
    );
}
