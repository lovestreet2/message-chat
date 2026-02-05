import { createServer } from "http";
import next from "next";
import { Server, Socket } from "socket.io";
import type { SocketMessage } from "@/lib/socket";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = Number(process.env.PORT || 3000);

/**
 * socket.id → userId
 */
const onlineUsers = new Map<string, string>();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => handle(req, res));

    const io = new Server(httpServer, {
        path: "/socket.io",
        cors: {
            origin: dev ? "http://localhost:3000" : undefined,
            credentials: true,
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log("🔌 socket connected:", socket.id);

        /* -------------------------------------------------- */
        /* Presence                                            */
        /* -------------------------------------------------- */

        socket.on("user:online", ({ userId }: { userId: string }) => {
            onlineUsers.set(socket.id, userId);

            socket.broadcast.emit("user:status", {
                userId,
                online: true,
            });
        });

        socket.on("user:offline", ({ userId, lastSeen }: { userId: string; lastSeen: number }) => {
            onlineUsers.delete(socket.id);

            socket.broadcast.emit("user:status", {
                userId,
                online: false,
                lastSeen,
            });
        }
        );


        socket.on("disconnect", () => {
            const userId = onlineUsers.get(socket.id);

            if (userId) {
                socket.broadcast.emit("user:status", {
                    userId,
                    online: false,
                    lastSeen: Date.now(),
                });

                onlineUsers.delete(socket.id);
            }

            console.log("❌ socket disconnected:", socket.id);
        });

        /* -------------------------------------------------- */
        /* Rooms                                               */
        /* -------------------------------------------------- */

        socket.on("room:join", (roomId: string) => {
            socket.join(roomId);
        });

        socket.on("room:leave", (roomId: string) => {
            socket.leave(roomId);
        });

        /* -------------------------------------------------- */
        /* Messages                                            */
        /* -------------------------------------------------- */

        socket.on(
            "message:send",
            (payload: { roomId: string; message: SocketMessage }) => {
                io.to(payload.roomId).emit("message:new", payload.message);
            }
        );

        /* -------------------------------------------------- */
        /* Typing indicator                                    */
        /* -------------------------------------------------- */

        socket.on(
            "user:typing",
            ({
                fromUserId,
                toUserId,
                typing,
            }: {
                fromUserId: string;
                toUserId: string;
                typing: boolean;
            }) => {
                socket.to(toUserId).emit("user:typing", {
                    fromUserId,
                    typing,
                });
            }
        );
    });

    httpServer.listen(PORT, () => {
        console.log(
            `✅ Next.js + Socket.IO running on http://localhost:${PORT}`
        );
    });
});
