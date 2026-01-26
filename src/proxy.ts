import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Protect routes using NextAuth JWT
export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Only protect /chat and /dashboard
    if (pathname.startsWith("/chat") || pathname.startsWith("/dashboard")) {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/chat/:path*", "/dashboard/:path*"],
};
