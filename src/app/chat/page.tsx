"use client";

import * as React from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import type { ChatItem } from "@/components/chat/ChatListItem";
import type { Message } from "@/components/chat/MessageBubble";
import {
  getSocket,
  emitOnline,
  emitOffline,
  onUserStatusChange,
  type SocketMessage,
} from "@/lib/socket";
import { usePathname } from "next/navigation";

/* ---------------- Types ---------------- */

type ApiChat = {
  id: string;
  name: string;
  isGroup?: boolean;
  avatarUrl?: string | null;
  otherUserId?: string | null;
  lastMessage?: { text: string; at: string; sender?: string } | null;
};

type ApiMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender?: { displayName?: string | null; username?: string | null } | null;
};

/* ---------------- Component ---------------- */

export default function ChatLayoutPage() {
  const [chats, setChats] = React.useState<ChatItem[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = React.useState<string | null>(null);
  const [onlineMap, setOnlineMap] = React.useState<Record<string, boolean>>({});

  /* ===================================================== */
  /* 1️⃣ SESSION                                           */
  /* ===================================================== */

  React.useEffect(() => {
    let mounted = true;

    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((s) => mounted && setSessionUserId(s?.user?.id ?? null))
      .catch(() => mounted && setSessionUserId(null));

    return () => {
      mounted = false;
    };
  }, []);

  /* ===================================================== */
  /* 2️⃣ SOCKET CONNECTION (CRITICAL FIX)                   */
  /* ===================================================== */
  // FIX (lines ~70–85): socket was never connected

  React.useEffect(() => {
    if (!sessionUserId) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [sessionUserId]);

  /* ===================================================== */
  /* 3️⃣ PRESENCE (ONLINE / OFFLINE)                        */
  /* ===================================================== */
  // FIX: do NOT emit offline on rerender / strict mode

  React.useEffect(() => {
    if (!sessionUserId) return;

    emitOnline(sessionUserId);

    const cleanup = onUserStatusChange(({ userId, online }) => {
      setOnlineMap((prev) =>
        prev[userId] === online ? prev : { ...prev, [userId]: online }
      );
    });

    return cleanup;
  }, [sessionUserId]);

  // REAL offline only on unload
  React.useEffect(() => {
    if (!sessionUserId) return;

    const handler = () => emitOffline(sessionUserId);
    window.addEventListener("beforeunload", handler);

    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [sessionUserId]);

  /* ===================================================== */
  /* 4️⃣ FETCH CHATS (ONCE)                                 */
  /* ===================================================== */
  // FIX (lines ~110–140): stop refetching on presence change

  React.useEffect(() => {
    fetch("/api/chats", { credentials: "include" })
      .then((res) => res.json())
      .then((data: ApiChat[]) => {
        setChats(
          (data ?? []).map((c) => ({
            id: c.id,
            name: c.name,
            avatarUrl: c.avatarUrl ?? null,
            isGroup: !!c.isGroup,
            userId: c.otherUserId ?? undefined,
            online: false, // merged later
            lastMessage: c.lastMessage?.text?.trim()
              ? c.lastMessage.text
              : "No messages yet",
            time: c.lastMessage?.at
              ? new Date(c.lastMessage.at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
              : "",
          }))
        );
      })
      .catch(() => setChats([]));
  }, []);

  // Merge presence → chats
  React.useEffect(() => {
    setChats((prev) =>
      prev.map((c) =>
        c.userId ? { ...c, online: !!onlineMap[c.userId] } : c
      )
    );
  }, [onlineMap]);

  /* ===================================================== */
  /* 5️⃣ FETCH MESSAGES                                    */
  /* ===================================================== */

  React.useEffect(() => {
    if (!activeChatId || !sessionUserId) return;

    fetch(`/api/chats/${activeChatId}/messages`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((apiMessages: ApiMessage[]) => {
        setMessages(
          (apiMessages ?? []).map((m) => ({
            id: m.id,
            text: m.content,
            senderName:
              m.sender?.displayName ?? m.sender?.username ?? "User",
            time: new Date(m.createdAt),
            isOwn: m.senderId === sessionUserId,
            status: m.senderId === sessionUserId ? "delivered" : undefined,
          }))
        );
      })
      .catch(() => setMessages([]));
  }, [activeChatId, sessionUserId]);

  /* ===================================================== */
  /* 6️⃣ SOCKET ROOM + REALTIME MESSAGES                    */
  /* ===================================================== */
  // FIX: wait for socket connection before join

  React.useEffect(() => {
    if (!activeChatId || !sessionUserId) return;

    const socket = getSocket();

    const join = () => socket.emit("room:join", activeChatId);
    socket.connected ? join() : socket.once("connect", join);

    const onNew = (msg: SocketMessage) => {
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

    socket.on("message:new", onNew);

    return () => {
      socket.off("message:new", onNew);
      socket.emit("room:leave", activeChatId);
    };
  }, [activeChatId, sessionUserId]);

  /* ===================================================== */
  /* 7️⃣ SEND MESSAGE (OPTIMISTIC)                          */
  /* ===================================================== */

  async function handleSendMessage(text: string) {
    if (!activeChatId || !sessionUserId) return;

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
        roomId: activeChatId,
        message: created,
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, status: "failed" } : m
        )
      );
    }
  }

  /* ===================================================== */
  /* 8️⃣ ROUTE → CHAT SYNC                                 */
  /* ===================================================== */

  const pathname = usePathname();

  React.useEffect(() => {
    if (!activeChatId) return;
    const maybeId = pathname.split("/")[2];
    if (maybeId && maybeId !== activeChatId) {
      setActiveChatId(maybeId);
    }
  }, [activeChatId, pathname]);

  /* ===================================================== */
  /* RENDER                                                */
  /* ===================================================== */

  if (!sessionUserId) return null;

  return (
    <ChatLayout
      chats={chats}
      messages={messages}
      activeChatId={activeChatId}
      sessionUserId={sessionUserId}
      onChatSelect={setActiveChatId}
      onBackToList={() => setActiveChatId(null)}
      onSendMessage={handleSendMessage}
    />
  );
}
