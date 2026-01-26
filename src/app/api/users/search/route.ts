import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
        return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
        where: {
            id: { not: session.user.id },
            OR: [
                { displayName: { contains: q, mode: "insensitive" } },
                { username: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
            ],
        },
        select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
        },
        take: 10,
    });

    return NextResponse.json(users);
}
