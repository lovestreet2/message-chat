"use client";

import * as React from "react";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import type { Message } from "@/components/chat/MessageBubble";
import { getSocket } from "@/lib/socket"; // ✅ SOCKET IMPORT

type ApiMessage = {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    sender?: { displayName?: string | null; username?: string | null } | null;
};

export default function ChatRoomClient({
    roomId,
    chatName,
    sessionUserId,
    onBack,
}: {
    roomId: string;
    chatName: string;
    sessionUserId: string;
    onBack?: () => void;
}) {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [loading, setLoading] = React.useState(true);

    async function loadMessages() {
        setLoading(true);
        try {
            const res = await fetch(`/api/chats/${roomId}/messages`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to load messages");
            const apiMessages = (await res.json()) as ApiMessage[];

            const uiMessages: Message[] = apiMessages.map((m) => ({
                id: m.id,
                text: m.content,
                senderName: m.sender?.displayName ?? m.sender?.username ?? "User",
                time: new Date(m.createdAt),
                isOwn: m.senderId === sessionUserId,
                status: m.senderId === sessionUserId ? "delivered" : undefined,
            }));

            setMessages(uiMessages);
        } finally {
            setLoading(false);
        }
    }

    // ✅ initial fetch
    React.useEffect(() => {
        void loadMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId]);

    // ✅ SOCKET: join room + receive realtime messages
    React.useEffect(() => {
        const s = getSocket();

        s.emit("room:join", roomId);

        const onNew = (msg: any) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: msg.id,
                    text: msg.content,
                    senderName: msg.sender?.displayName ?? msg.sender?.username ?? "User",
                    time: new Date(msg.createdAt),
                    isOwn: msg.senderId === sessionUserId,
                    status: msg.senderId === sessionUserId ? "delivered" : undefined,
                },
            ]);
        };

        s.on("message:new", onNew);

        return () => {
            s.off("message:new", onNew);
            s.emit("room:leave", roomId);
        };
    }, [roomId, sessionUserId]);

    async function handleSend(text: string) {
        // ✅ optimistic
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
            if (!res.ok) throw new Error(created?.error ?? "Send failed");

            // ✅ replace optimistic with real message
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
                            onRetry: undefined,
                        }
                        : m
                )
            );

            // ✅ broadcast to others in room
            const s = getSocket();
            s.emit("message:send", { roomId, message: created });
        } catch {
            // mark failed
            setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? { ...m, status: "failed", onRetry: () => handleSend(text), } : m))
            );
        }
    }

    return (
        <div className="flex h-[calc(100vh-0px)] w-full flex-col overflow-hidden">
            <ChatHeader
                chat={{ id: roomId, name: chatName }}
                onBack={onBack}
                status="online"
                showActions
            />

            {loading ? (
                <div className="flex-1 px-4 py-6 text-white/70">
                    Loading messages…
                </div>
            ) : (
                <MessageList messages={messages} />
            )}

            <MessageInput
                onSend={handleSend}
                onFiles={async (files) => {
                    console.log("files selected", files);
                }}
            />
        </div>
    );
}
