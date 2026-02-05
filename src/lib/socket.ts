import { io, type Socket } from "socket.io-client";

/* ------------------------------------------------------------------ */
/* Singleton                                                          */
/* ------------------------------------------------------------------ */

let socket: Socket | null = null;
let connected = false;

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type SocketSender = {
    displayName?: string | null;
    username?: string | null;
};

export type SocketMessage = {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    sender?: SocketSender | null;
};

export type UserStatusPayload = {
    userId: string;
    online: boolean;
    lastSeen?: number;
};

export type TypingPayload = {
    fromUserId: string;
    typing: boolean;
};

/* ------------------------------------------------------------------ */
/* Socket Init (CLIENT ONLY)                                          */
/* ------------------------------------------------------------------ */

export function getSocket(): Socket {
    if (typeof window === "undefined") {
        throw new Error("Socket.IO client called on the server");
    }

    if (!socket) {
        const url =
            process.env.NEXT_PUBLIC_SOCKET_URL ?? window.location.origin;

        socket = io(url, {
            path: "/socket.io",
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        /* -------------------------
           Connection flags
        -------------------------- */
        socket.on("connect", () => {
            connected = true;
            console.log("🟢 socket connected:", socket?.id);
        });

        socket.on("disconnect", () => {
            connected = false;
            console.log("🔴 socket disconnected");
        });
    }

    return socket;
}

/* ------------------------------------------------------------------ */
/* Explicit Connect / Disconnect                                     */
/* ------------------------------------------------------------------ */

export function connectSocket() {
    const s = getSocket();
    if (!s.connected) s.connect();
}

export function disconnectSocket() {
    if (!socket) return;
    socket.disconnect();
    connected = false;
}

/* ------------------------------------------------------------------ */
/* Presence (ONLINE / OFFLINE)                                        */
/* ------------------------------------------------------------------ */

export function emitOnline(userId: string) {
    const s = getSocket();
    connectSocket();

    if (s.connected) {
        s.emit("user:online", { userId });
    } else {
        s.once("connect", () => {
            s.emit("user:online", { userId });
        });
    }

    /* browser close / refresh */
    window.addEventListener("beforeunload", () => {
        s.emit("user:offline", {
            userId,
            lastSeen: Date.now(),
        });
    });
}

export function emitOffline(userId: string) {
    if (!socket || !connected) return;

    socket.emit("user:offline", {
        userId,
        lastSeen: Date.now(),
    });
}

/* ------------------------------------------------------------------ */
/* Presence Listener                                                  */
/* ------------------------------------------------------------------ */

export function onUserStatusChange(
    callback: (payload: UserStatusPayload) => void
) {
    const s = getSocket();
    connectSocket();

    s.on("user:status", callback);

    return () => {
        s.off("user:status", callback);
    };
}

/* ------------------------------------------------------------------ */
/* Typing Indicator                                                   */
/* ------------------------------------------------------------------ */

export function emitTyping(
    fromUserId: string,
    toUserId: string,
    typing: boolean
) {
    const s = getSocket();
    connectSocket();

    s.emit("user:typing", {
        fromUserId,
        toUserId,
        typing,
    });
}

export function onTyping(
    callback: (payload: TypingPayload) => void
) {
    const s = getSocket();
    connectSocket();

    s.on("user:typing", callback);

    return () => {
        s.off("user:typing", callback);
    };
}
