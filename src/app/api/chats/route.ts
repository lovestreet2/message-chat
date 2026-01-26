import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;

    const rooms = await prisma.room.findMany({
        where: { members: { some: { userId } } },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            isGroup: true,
            members: {
                select: {
                    user: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
                },
            },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    sender: { select: { displayName: true, username: true } },
                },
            },
        },
    });

    const chats = rooms.map((r) => {
        const last = r.messages[0] ?? null;

        // For 1:1 chat name fallback
        let title = r.name;
        let avatarUrl: string | null = null;

        if (!r.isGroup) {
            const other = r.members.map((m) => m.user).find((u) => u.id !== userId);
            title = other?.displayName ?? other?.username ?? "Direct";
            avatarUrl = other?.avatarUrl ?? null;
        }

        return {
            id: r.id,
            name: title,
            isGroup: r.isGroup,
            avatarUrl,
            lastMessage: last
                ? {
                    text: last.content,
                    at: last.createdAt,
                    sender: last.sender?.displayName ?? last.sender?.username ?? "",
                }
                : null,
        };
    });

    return NextResponse.json(chats);
}
