import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id as string;

    const me = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
        },
    });

    return NextResponse.json(me);
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id as string;

    const body = await req.json();

    const displayName = String(body?.displayName ?? "").trim();
    const username = String(body?.username ?? "").trim();
    const avatarUrl = body?.avatarUrl ? String(body.avatarUrl).trim() : null;
    const bio = body?.bio ? String(body.bio).trim() : null;

    if (!displayName || !username) {
        return NextResponse.json({ error: "Display name and username are required" }, { status: 400 });
    }

    // username unique check
    const existing = await prisma.user.findFirst({
        where: { username, NOT: { id: userId } },
        select: { id: true },
    });
    if (existing) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { displayName, username, avatarUrl, bio },
        select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
        },
    });

    return NextResponse.json(updated);
}
