import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),

    session: {
        strategy: "jwt",
    },

    pages: {
        signIn: "/login",
    },

    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                identifier: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                if (!credentials) return null;

                const identifier = credentials.identifier?.trim();
                const password = credentials.password;

                if (!identifier || !password) return null;

                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: { equals: identifier, mode: "insensitive" } },
                            { username: { equals: identifier, mode: "insensitive" } },
                        ],
                    },
                });

                if (!user) return null;

                const valid = await bcrypt.compare(password, user.password);
                if (!valid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.displayName ?? user.username,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: { id: string } }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },

        async session({
            session,
            token,
        }: {
            session: Session;
            token: JWT;
        }) {
            if (session.user && token.id) {
                session.user.id = token.id;
            }
            return session;
        },
    },
};
