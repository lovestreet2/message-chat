"use client";

import * as React from "react";
import { Send, Paperclip, Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface MessageInputProps {
    onSend?: (text: string) => Promise<void> | void;

    /** Called when user picks files */
    onFiles?: (files: FileList) => Promise<void> | void;

    placeholder?: string;
    disabled?: boolean;

    /** Limit for files */
    accept?: string; // e.g. "image/*,video/*"
    multiple?: boolean;
}

const QUICK_EMOJIS = ["😀", "😂", "😍", "🥹", "😎", "🤝", "🔥", "🎉", "👍", "❤️"];

export default function MessageInput({
    onSend,
    onFiles,
    placeholder = "Type a message…",
    disabled = false,
    accept = "image/*,video/*,application/pdf",
    multiple = true,
}: MessageInputProps) {
    const [value, setValue] = React.useState("");
    const [sending, setSending] = React.useState(false);
    const [emojiOpen, setEmojiOpen] = React.useState(false);

    const fileRef = React.useRef<HTMLInputElement | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    const canSend = value.trim().length > 0 && !disabled && !sending;

    // Auto-grow textarea
    React.useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "0px";
        el.style.height = Math.min(el.scrollHeight, 160) + "px"; // cap height
    }, [value]);

    async function handleSend() {
        if (!canSend || !onSend) {
            setValue("");
            return;
        }

        const text = value.trim();
        setSending(true);

        try {
            await onSend(text);
            setValue("");
        } finally {
            setSending(false);
            textareaRef.current?.focus();
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        // Enter sends, Shift+Enter adds newline
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
        }
    }

    function openFilePicker() {
        if (!onFiles || disabled || sending) return;
        fileRef.current?.click();
    }

    async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            await onFiles?.(files);
        } finally {
            // allow re-selecting the same file
            e.target.value = "";
            textareaRef.current?.focus();
        }
    }

    function insertEmoji(emoji: string) {
        setValue((prev) => prev + emoji);
        setEmojiOpen(false);
        textareaRef.current?.focus();
    }

    return (
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl p-2 sm:p-3">
            {/* Input shell */}
            <div className="relative w-full">
                {/* Hidden file input */}
                <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={onFileChange}
                />

                {/* Left inside icons */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={openFilePicker}
                        disabled={disabled || sending || !onFiles}
                        className="h-9 w-9 p-0 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-40"
                        aria-label="Attach file"
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>

                    <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={disabled || sending}
                                className="h-9 w-9 p-0 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-40"
                                aria-label="Emoji"
                            >
                                <Smile className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent
                            side="top"
                            align="start"
                            className="w-64 border-white/10 bg-[#0f172a]/95 text-white shadow-xl"
                        >
                            <div className="text-xs text-white/60 mb-2">Quick emojis</div>
                            <div className="grid grid-cols-5 gap-2">
                                {QUICK_EMOJIS.map((e) => (
                                    <button
                                        key={e}
                                        type="button"
                                        onClick={() => insertEmoji(e)}
                                        className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-lg hover:bg-white/10"
                                        aria-label={`Insert ${e}`}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || sending}
                    rows={1}
                    className="
            w-full resize-none rounded-2xl border border-white/10 bg-white/10
            text-white placeholder:text-white/40
            focus:outline-none focus:ring-2 focus:ring-cyan-400/40
            py-3
            pl-[92px] pr-[56px]
            leading-5
          "
                />

                {/* Send button inside right */}
                <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={!canSend}
                    className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 transition hover:opacity-90 disabled:opacity-40"
                    aria-label="Send message"
                >
                    <Send className="h-5 w-5" />
                </button>
            </div>

            {/* Hint */}
            <div className="mt-1 px-1 text-[11px] text-white/40">
                Press <span className="text-white/60">Enter</span> to send •{" "}
                <span className="text-white/60">Shift+Enter</span> for new line
            </div>
        </div>
    );
}
