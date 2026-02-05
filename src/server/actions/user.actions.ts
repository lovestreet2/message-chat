"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma } from "generated/prisma/client";

type AddUserInput = {
    email: string;
    password: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
};

type AddUserResult =
    | { ok: true }
    | { ok: false; message: string };

export async function addUser(data: AddUserInput): Promise<AddUserResult> {
    const email = data.email.trim().toLowerCase();
    const username = data.username.trim();

    try {
        // 🔎 Pre-check (better UX)
        const exists = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
            select: { email: true, username: true },
        });

        if (exists?.email === email) {
            return { ok: false, message: "Email already exists. Please use another email." };
        }

        if (exists?.username === username) {
            return { ok: false, message: "Username already exists. Please use another username." };
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
            },
        });

        return { ok: true };
    } catch (err: unknown) {
        // ✅ Prisma unique constraint fallback
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
        ) {
            const target = Array.isArray(err.meta?.target)
                ? err.meta?.target
                : [];

            if (target.includes("email")) {
                return { ok: false, message: "Email already exists. Try a different email." };
            }

            if (target.includes("username")) {
                return { ok: false, message: "Username already exists. Try a different username." };
            }

            return { ok: false, message: "Duplicate value. Please try different details." };
        }

        // ✅ Generic error fallback
        if (err instanceof Error) {
            return { ok: false, message: err.message };
        }

        return { ok: false, message: "Failed to add user." };
    }
}
