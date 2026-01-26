import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const username: string = body.username;
        const email: string = body.email;
        const password: string = body.password;

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
        });

        if (exists) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 🔥 THIS LINE IS REQUIRED
        await prisma.user.create({
            data: {
                username,
                email,
                displayName: username, // ✅ REQUIRED FIELD
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            { message: "User registered successfully" },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("REGISTER ERROR:", error);
        return NextResponse.json(
            { message: error.message || "Server error" },
            { status: 500 }
        );
    }
}
