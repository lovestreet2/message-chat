import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

type AccessResult =
    | { ok: true; userId: string }
    | { ok: false; response: NextResponse };

async function requireRoomAccess(chatId: string): Promise<AccessResult> {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }

    const userId = (session.user as any).id as string;

    const room = await prisma.room.findFirst({
        where: { id: chatId, members: { some: { userId } } },
        select: { id: true },
    });

    if (!room) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Not found" }, { status: 404 }),
        };
    }

    return { ok: true, userId };
}

export async function GET(
    _req: Request,
    context: { params: Promise<{ chatId: string }> }
) {
    const { chatId } = await context.params;

    const access = await requireRoomAccess(chatId);
    if (!access.ok) return access.response;

    const messages = await prisma.message.findMany({
        where: { roomId: chatId },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            sender: { select: { displayName: true, username: true } },
        },
    });

    return NextResponse.json(messages);
}

export async function POST(
    req: Request,
    context: { params: Promise<{ chatId: string }> }
) {
    const { chatId } = await context.params;

    const access = await requireRoomAccess(chatId);
    if (!access.ok) return access.response;

    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const text = String(body?.content ?? "").trim();
    if (!text) {
        return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const created = await prisma.message.create({
        data: {
            content: text,
            roomId: chatId,
            senderId: access.userId,
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            sender: { select: { displayName: true, username: true } },
        },
    });

    return NextResponse.json(created, { status: 201 });
}
