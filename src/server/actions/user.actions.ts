"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma } from "generated/prisma/client";

export async function addUser(data: {
    email: string;
    password: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
}) {
    const email = data.email.trim().toLowerCase();
    const username = data.username.trim();

    try {
        // Optional pre-check (nicer UX)
        const exists = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
            select: { email: true, username: true },
        });


        if (exists?.email === email) {
            throw new Error("Email already exists. Please use another email.");
        }
        if (exists?.username === username) {
            throw new Error("Username already exists. Please use another username.");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username,
                displayName: data.displayName.trim(),
                avatarUrl: data.avatarUrl?.trim() || null,
                bio: data.bio?.trim() || null,
                // role: "USER", // if you have roles
            },
        });

        return { ok: true };
    } catch (err: any) {
        // Prisma unique constraint (fallback)
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            const target = (err.meta?.target as string[] | undefined) ?? [];
            if (target.includes("email")) {
                return { ok: false, message: "Email already exists. Try a different email." };
            }
            if (target.includes("username")) {
                return { ok: false, message: "Username already exists. Try a different username." };
            }
            return { ok: false, message: "Duplicate value. Please try different details." };
        }

        return { ok: false, message: err?.message ?? "Failed to add user." };
    }
}
