import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                identifier: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const identifier = String(credentials?.identifier ?? "").trim();
                const password = String(credentials?.password ?? "");
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

                const ok = await bcrypt.compare(password, user.password);
                if (!ok) return null;

                return { id: user.id, email: user.email, name: user.displayName ?? user.username };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) token.id = user.id;
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) (session.user as any).id = token.id;
            return session;
        },
    },
};
