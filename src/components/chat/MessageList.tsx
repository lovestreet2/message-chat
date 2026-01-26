"use client";

import * as React from "react";
import MessageBubble, { Message } from "./MessageBubble";

interface MessageListProps {
    messages: Message[];
    /** optional: when new messages arrive, scroll to bottom */
    autoScroll?: boolean;
}

export default function MessageList({ messages, autoScroll = true }: MessageListProps) {
    const endRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!autoScroll) return;
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, autoScroll]);

    if (!messages || messages.length === 0) {
        return (
            <div className="flex-1 overflow-y-auto px-3 py-6 sm:px-4 sm:py-8">
                <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-white/70">
                    No messages yet. Say hi 👋
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:gap-4">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
}
