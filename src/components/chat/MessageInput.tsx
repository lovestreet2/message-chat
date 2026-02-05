"use client";

import * as React from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "../ui/input";

interface MessageInputProps {
    onSend?: (text: string) => Promise<void> | void;
    onFiles?: (files: FileList) => Promise<void> | void;

    /** Typing indicator hooks */
    onTypingStart?: () => void;
    onTypingStop?: () => void;

    placeholder?: string;
    disabled?: boolean;
    accept?: string;
    multiple?: boolean;
}

const QUICK_EMOJIS = ["😀", "😂", "😍", "🥹", "😎", "🤝", "🔥", "🎉", "👍", "❤️"];

export default function MessageInput({
    onSend,
    onFiles,
    onTypingStart,
    onTypingStop,
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
    const typingTimeout = React.useRef<NodeJS.Timeout | null>(null);

    const canSend = value.trim().length > 0 && !disabled && !sending;

    /* ----------------------------------
       Auto-grow textarea
    ----------------------------------- */
    React.useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "0px";
        el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }, [value]);

    /* ----------------------------------
       Typing indicator (debounced)
    ----------------------------------- */
    function handleTyping() {
        onTypingStart?.();

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
            onTypingStop?.();
        }, 800);
    }

    /* ----------------------------------
       Send message
    ----------------------------------- */
    async function handleSend() {
        if (!canSend || !onSend) {
            setValue("");
            return;
        }

        const text = value.trim();
        setSending(true);
        onTypingStop?.();

        try {
            await onSend(text);
            setValue("");
        } finally {
            setSending(false);
            textareaRef.current?.focus();
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
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
            e.target.value = "";
            textareaRef.current?.focus();
        }
    }

    function insertEmoji(emoji: string) {
        setValue((prev) => prev + emoji);
        setEmojiOpen(false);
        textareaRef.current?.focus();
        handleTyping();
    }

    return (
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl p-2 sm:p-3">
            <div className="relative w-full">
                {/* Hidden file input */}
                <Input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={onFileChange}
                />

                {/* Left icons */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={openFilePicker}
                        disabled={disabled || sending || !onFiles}
                        className="h-9 w-9 p-0 text-white/70 hover:bg-white/10"
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>

                    <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={disabled || sending}
                                className="h-9 w-9 p-0 text-white/70 hover:bg-white/10"
                            >
                                <Smile className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent
                            side="top"
                            align="start"
                            className="w-64 border-white/10 bg-[#0f172a]/95 text-white"
                        >
                            <div className="grid grid-cols-5 gap-2">
                                {QUICK_EMOJIS.map((e) => (
                                    <button
                                        key={e}
                                        type="button"
                                        onClick={() => insertEmoji(e)}
                                        className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 hover:bg-white/10"
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
                    onChange={(e) => {
                        setValue(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || sending}
                    rows={1}
                    className="
            w-full resize-none rounded-2xl border border-white/10 bg-white/10
            text-white placeholder:text-white/40
            focus:ring-2 focus:ring-cyan-400/40
            py-3 pl-[92px] pr-[56px]
          "
                />

                {/* Send */}
                <Button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={!canSend}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950"
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>

            <div className="mt-1 text-[11px] text-white/40">
                Enter to send • Shift+Enter for new line
            </div>
        </div>
    );
}
