import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic"; // ✅ REQUIRED

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const userId = session.user.id;

    const rooms = await prisma.room.findMany({
        where: {
            members: {
                some: { userId },
            },
        },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            isGroup: true,
            members: {
                select: {
                    user: {
                        select: {
                            id: true,
                            displayName: true,
                            username: true,
                            avatarUrl: true,
                        },
                    },
                },
            },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    sender: {
                        select: {
                            displayName: true,
                            username: true,
                        },
                    },
                },
            },
        },
    });

    const chats = rooms.map((room) => {
        const last = room.messages[0] ?? null;

        let title = room.name;
        let avatarUrl: string | null = null;
        let otherUserId: string | null = null;

        if (!room.isGroup) {
            const otherUser = room.members
                .map((m) => m.user)
                .find((u) => u.id !== userId);

            title =
                otherUser?.displayName ??
                otherUser?.username ??
                "Direct";

            avatarUrl = otherUser?.avatarUrl ?? null;
            otherUserId = otherUser?.id ?? null;
        }

        return {
            id: room.id,
            name: title,
            isGroup: room.isGroup,
            avatarUrl,
            otherUserId, // ✅ used by Socket.IO presence
            lastMessage: last
                ? {
                    text: last.content,
                    at: last.createdAt,
                    sender:
                        last.sender?.displayName ??
                        last.sender?.username ??
                        "",
                }
                : null,
        };
    });

    return NextResponse.json(chats);
}
