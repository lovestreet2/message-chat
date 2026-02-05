import "next-auth";
import "next-auth/jwt";

/* =========================
   NEXT-AUTH SESSION TYPES
========================= */
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email?: string | null;
            name?: string | null;
            image?: string | null;
        };
    }

    interface User {
        id: string;
        email?: string | null;
        name?: string | null;
        image?: string | null;
    }
}

/* =========================
   JWT TYPES
========================= */
declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        email?: string | null;
        name?: string | null;
        image?: string | null;
    }
}

export { }; // ✅ required for TS module scope
