import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type RegisterBody = {
    username?: string;
    email?: string;
    password?: string;
};

export async function POST(req: Request) {
    try {
        const body: RegisterBody = await req.json();

        const username = body.username?.trim();
        const email = body.email?.trim();
        const password = body.password;

        if (!username || !email || !password) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        const exists = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
            select: { id: true },
        });

        if (exists) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                username,
                email,
                displayName: username, // ✅ required field
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            { message: "User registered successfully" },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error("REGISTER ERROR:", error);

        const message =
            error instanceof Error ? error.message : "Server error";

        return NextResponse.json(
            { message },
            { status: 500 }
        );
    }
}
