"use client";

import * as React from "react";
import clsx from "clsx";

export type DeliveryStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export type Message = {
    id: string;
    text: string;
    senderName?: string;
    time?: string | Date;
    isOwn: boolean;
    status?: DeliveryStatus;
    edited?: boolean;

    // ✅ optional retry hook (only used when failed)
    onRetry?: () => void;
};

interface MessageBubbleProps {
    message: Message;
    showSender?: boolean;
    dense?: boolean;
}

function formatTime(t: string | Date | undefined) {
    if (!t) return "";
    if (typeof t === "string") return t;
    try {
        return new Intl.DateTimeFormat(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        }).format(t);
    } catch {
        return "";
    }
}

function SendingDots() {
    return (
        <span className="inline-flex items-center gap-1" aria-label="Sending">
            <span className="h-1 w-1 rounded-full bg-current opacity-70 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1 w-1 rounded-full bg-current opacity-70 animate-bounce [animation-delay:-0.05s]" />
            <span className="h-1 w-1 rounded-full bg-current opacity-70 animate-bounce" />
        </span>
    );
}

function ticks(status?: DeliveryStatus) {
    if (!status) return null;

    if (status === "sending") return <SendingDots />;

    if (status === "sent") return <span aria-label="Sent">✓</span>;

    if (status === "delivered") return <span aria-label="Delivered">✓✓</span>;

    if (status === "read") {
        return (
            <span aria-label="Read" className="text-cyan-300">
                ✓✓
            </span>
        );
    }

    if (status === "failed") {
        return (
            <span aria-label="Failed" className="text-rose-300 font-semibold">
                !
            </span>
        );
    }

    return null;
}

export default function MessageBubble({
    message,
    showSender = false,
    dense = false,
}: MessageBubbleProps) {
    const {
        text,
        senderName,
        time,
        isOwn,
        status = isOwn ? "sent" : undefined,
        edited,
        onRetry,
    } = message;

    const safeText = text ?? "";
    const timeLabel = formatTime(time);

    const showMeta = Boolean(timeLabel || isOwn || edited || status);

    return (
        <div
            className={clsx(
                "flex w-full",
                dense ? "my-0.5" : "my-1.5",
                isOwn ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={clsx(
                    "relative max-w-[92%] sm:max-w-[78%] md:max-w-[68%]",
                    "px-4 py-2 rounded-2xl",
                    "break-words whitespace-pre-wrap",
                    "shadow-sm border",
                    "animate-[fadeIn_0.18s_ease-out]",
                    isOwn
                        ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 border-white/0 rounded-br-sm"
                        : "bg-white/10 text-white border-white/10 rounded-bl-sm"
                )}
                role="group"
                aria-label={isOwn ? "Your message" : "Message"}
            >
                {/* Sender label (group chat) */}
                {!isOwn && (showSender || !!senderName) && senderName ? (
                    <p className="mb-0.5 text-[11px] font-semibold text-cyan-300/90">
                        {senderName}
                    </p>
                ) : null}

                {/* Text */}
                <p className="text-sm leading-relaxed">{safeText}</p>

                {/* Meta row */}
                {showMeta ? (
                    <div className="mt-1 flex items-center justify-end gap-2 text-[10px] opacity-70">
                        {edited ? <span className="opacity-80">edited</span> : null}
                        {timeLabel ? <span>{timeLabel}</span> : null}

                        {isOwn ? (
                            <span className="inline-flex items-center gap-2">
                                <span>{ticks(status)}</span>

                                {/* ✅ Retry for failed */}
                                {status === "failed" && onRetry ? (
                                    <button
                                        type="button"
                                        onClick={onRetry}
                                        className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-rose-200 hover:bg-white/10"
                                    >
                                        Retry
                                    </button>
                                ) : null}
                            </span>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
