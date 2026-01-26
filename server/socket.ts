import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = Number(process.env.PORT || 3000);

app.prepare().then(() => {
    const httpServer = createServer((req, res) => handle(req, res));

    const io = new Server(httpServer, {
        cors: {
            origin: dev ? "http://localhost:3000" : undefined,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        // Join room (chat room)
        socket.on("room:join", (roomId: string) => {
            socket.join(roomId);
        });

        socket.on("room:leave", (roomId: string) => {
            socket.leave(roomId);
        });

        // Broadcast message to room
        socket.on("message:send", (payload: { roomId: string; message: any }) => {
            io.to(payload.roomId).emit("message:new", payload.message);
        });
    });

    httpServer.listen(PORT, () => {
        console.log(`✅ Socket server running on http://localhost:${PORT}`);
    });
});
