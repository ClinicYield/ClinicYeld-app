import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
    providers: [
        // We leave this empty or with basic settings for the middleware.
        // The actual authorization logic will stay in the main auth file.
        Credentials({}),
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAuthPage = nextUrl.pathname.startsWith("/login");
            const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

            if (isApiAuth) return true;

            if (isAuthPage) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/", nextUrl));
                }
                return true;
            }

            if (!isLoggedIn) {
                return false; // This will redirect to the login page automatically if defined in 'pages'
            }

            return true;
        },
    },
    pages: {
        signIn: "/login",
    },
} satisfies NextAuthConfig;
