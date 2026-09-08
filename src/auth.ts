import NextAuth, { CredentialsSignin } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { loginWithCredentials, refreshAccessToken } from "@/lib/auth-api";
import { isAccessTokenValid } from "@/lib/auth-normalize";

/**
 * Auth.js surfaces `CredentialsSignin.code` to the client, so we carry the
 * API's own message through it. That makes a routing or availability failure
 * distinguishable from a genuinely wrong password.
 */
class ApiSignInError extends CredentialsSignin {
  code: string;

  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

export const authConfig: NextAuthConfig = {
  // JWT sessions: no database, tokens live in the encrypted session cookie.
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) {
          throw new ApiSignInError("Enter your email and password.");
        }

        const response = await loginWithCredentials(email, password);

        if (!response.ok) {
          throw new ApiSignInError(response.message);
        }

        const { result } = response;

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          image: result.user.image,
          role: result.user.role,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          accessTokenExpires: result.accessTokenExpires,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in: seed the token from the authorized user.
      if (user) {
        token.id = user.id ?? token.id;
        token.role = user.role ?? null;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        return token;
      }

      // Still valid → keep as-is.
      const expires =
        typeof token.accessTokenExpires === "number"
          ? token.accessTokenExpires
          : undefined;
      if (isAccessTokenValid(expires)) {
        return token;
      }

      // Expired (or missing expiry) → try to refresh.
      const refreshToken =
        typeof token.refreshToken === "string" ? token.refreshToken : "";
      if (!refreshToken) {
        token.error = "RefreshTokenError";
        return token;
      }

      const refreshed = await refreshAccessToken(refreshToken);
      if (!refreshed) {
        token.error = "RefreshTokenError";
        return token;
      }

      token.accessToken = refreshed.accessToken;
      token.refreshToken = refreshed.refreshToken;
      token.accessTokenExpires = refreshed.accessTokenExpires;
      if (refreshed.user?.role !== undefined) token.role = refreshed.user.role;
      delete token.error;
      return token;
    },

    async session({ session, token }) {
      if (typeof token.id === "string") session.user.id = token.id;
      session.user.role = (token.role as string | null | undefined) ?? null;
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;
      if (token.error === "RefreshTokenError") session.error = token.error;
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
