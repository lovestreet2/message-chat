"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function createOrGetDirectRoom(otherUserId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    const me = session.user.id;

    if (!otherUserId || otherUserId === me) throw new Error("Invalid user");

    // Find an existing direct room that has exactly these two members.
    // (Simple approach: find rooms where me is a member, then check other member)
    const existing = await prisma.room.findFirst({
        where: {
            isGroup: false,
            members: {
                some: { userId: me },
            },
            AND: [
                { members: { some: { userId: otherUserId } } },
            ],
        },
        select: { id: true },
    });

    if (existing) return existing.id;

    const room = await prisma.room.create({
        data: {
            name: "Direct",
            isGroup: false,
            members: {
                create: [
                    { userId: me, role: "MEMBER" },
                    { userId: otherUserId, role: "MEMBER" },
                ],
            },
        },
        select: { id: true },
    });

    return room.id;
}
