"use client";

import * as React from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import type { ChatItem } from "@/components/chat/ChatListItem";
import type { Message } from "@/components/chat/MessageBubble";
import { getSocket } from "@/lib/socket"; // ✅ ADD THIS

type ApiChat = {
  id: string;
  name: string;
  isGroup?: boolean;
  avatarUrl?: string | null;
  lastMessage?: { text: string; at: string; sender?: string } | null;
};

type ApiMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender?: { displayName?: string | null; username?: string | null } | null;
};

export default function ChatLayoutPage() {
  const [chats, setChats] = React.useState<ChatItem[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = React.useState<string | null>(null);

  // ✅ session user id
  React.useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((s) => setSessionUserId(s?.user?.id ?? null))
      .catch(() => setSessionUserId(null));
  }, []);

  // ✅ fetch chats
  React.useEffect(() => {
    fetch("/api/chats", { credentials: "include" })
      .then((res) => res.json())
      .then((data: ApiChat[]) => {
        const mapped: ChatItem[] = (data ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          avatarUrl: c.avatarUrl ?? null,
          isGroup: !!c.isGroup,
          lastMessage: c.lastMessage?.text?.trim()
            ? c.lastMessage.text
            : "No messages yet",
          time: c.lastMessage?.at
            ? new Date(c.lastMessage.at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "",
        }));

        setChats(mapped);
        if (mapped.length > 0) setActiveChatId(mapped[0].id);
      })
      .catch(() => setChats([]));
  }, []);

  // ✅ fetch messages when chat changes
  React.useEffect(() => {
    if (!activeChatId || !sessionUserId) return;

    fetch(`/api/chats/${activeChatId}/messages`, { credentials: "include" })
      .then((res) => res.json())
      .then((apiMessages: ApiMessage[]) => {
        const uiMessages: Message[] = (apiMessages ?? []).map((m) => ({
          id: m.id,
          text: m.content,
          senderName: m.sender?.displayName ?? m.sender?.username ?? "User",
          time: new Date(m.createdAt),
          isOwn: m.senderId === sessionUserId,
          status: m.senderId === sessionUserId ? "delivered" : undefined,
        }));

        setMessages(uiMessages);
      })
      .catch(() => setMessages([]));
  }, [activeChatId, sessionUserId]);

  // ✅ SOCKET: join active chat room + receive realtime messages
  React.useEffect(() => {
    if (!activeChatId || !sessionUserId) return;

    const s = getSocket();

    // join room
    s.emit("room:join", activeChatId);

    const onNew = (msg: any) => {
      // ✅ prevent duplicates (if you also refetch)
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;

        return [
          ...prev,
          {
            id: msg.id,
            text: msg.content,
            senderName:
              msg.sender?.displayName ?? msg.sender?.username ?? "User",
            time: new Date(msg.createdAt),
            isOwn: msg.senderId === sessionUserId,
            status: msg.senderId === sessionUserId ? "delivered" : undefined,
          },
        ];
      });
    };

    s.on("message:new", onNew);

    return () => {
      s.off("message:new", onNew);
      s.emit("room:leave", activeChatId);
    };
  }, [activeChatId, sessionUserId]);

  async function handleSendMessage(text: string) {
    if (!activeChatId || !sessionUserId) return;

    const tempId = crypto.randomUUID();

    // ✅ optimistic message
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        text,
        senderName: "You",
        time: new Date(),
        isOwn: true,
        status: "sending",
        onRetry: () => handleSendMessage(text),
      },
    ]);

    try {
      const res = await fetch(`/api/chats/${activeChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      });

      const created = await res.json();
      if (!res.ok) throw new Error(created?.error ?? "Send failed");

      // ✅ replace temp with real
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

      // ✅ broadcast to room (others will get instantly)
      const s = getSocket();
      s.emit("message:send", {
        roomId: activeChatId,
        message: created,
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, status: "failed", onRetry: () => handleSendMessage(text) }
            : m
        )
      );
    }
  }

  return (
    <ChatLayout
      chats={chats}
      messages={messages}
      activeChatId={activeChatId}
      onChatSelect={setActiveChatId}
      onBackToList={() => setActiveChatId(null)}
      onSendMessage={handleSendMessage}
    />
  );
}
