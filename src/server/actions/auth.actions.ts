"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function registerUser(data: {
    email: string;
    password: string;
    username: string;
    displayName: string;
}) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            username: data.username,
            displayName: data.displayName,
        },
    });
}
