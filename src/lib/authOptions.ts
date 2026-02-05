import type { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),

    session: {
        strategy: "jwt",
    },

    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                identifier: {
                    label: "Email or Username",
                    type: "text",
                },
                password: {
                    label: "Password",
                    type: "password",
                },
            },

            async authorize(credentials) {
                if (!credentials?.identifier || !credentials.password) {
                    return null;
                }

                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: credentials.identifier },
                            { username: credentials.identifier },
                        ],
                    },
                });

                if (!user || !user.password) return null;

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isValid) return null;

                // MUST match next-auth.d.ts
                return {
                    id: user.id,
                    email: user.email,
                    name: user.displayName,
                    image: user.avatarUrl,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            // Runs on sign-in
            if (user) {
                token.id = user.id;
                token.email = user.email ?? null;
                token.name = user.name ?? null;
                token.image = user.image ?? null;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                // id is optional on JWT, so guard it
                if (token.id) {
                    session.user.id = token.id;
                }

                // these are optional by design
                session.user.email = token.email ?? undefined;
                session.user.name = token.name ?? undefined;
                session.user.image = token.image ?? undefined;
            }

            return session;
        },
    },


    pages: {
        signIn: "/login",
    },
};
