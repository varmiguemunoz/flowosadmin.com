import NextAuth, { CredentialsSignin } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import {
  loginWithCredentials,
  exchangeGoogleToken,
  refreshAccessToken,
} from "@/lib/auth-api";
import { isAccessTokenValid } from "@/lib/auth-normalize";

class InvalidCredentials extends CredentialsSignin {
  code = "invalid_credentials";
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
          throw new InvalidCredentials();
        }

        const result = await loginWithCredentials(email, password);
        if (!result) {
          throw new InvalidCredentials();
        }

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
    Google({
      // Ask for an id_token we can exchange server-side with our API.
      authorization: {
        params: { prompt: "select_account", access_type: "offline" },
      },
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    /**
     * For Google sign-in, exchange the Google identity for our API's tokens.
     * If the exchange fails, deny the sign-in.
     */
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") return true;

      const exchanged = await exchangeGoogleToken({
        idToken: account.id_token,
        accessToken: account.access_token,
        email: profile?.email ?? user?.email ?? null,
      });
      if (!exchanged) return false;

      // Stash the exchanged tokens on `user` so the jwt callback can persist
      // them (account/profile are only available on the first call).
      user.id = exchanged.user.id;
      user.role = exchanged.user.role;
      user.accessToken = exchanged.accessToken;
      user.refreshToken = exchanged.refreshToken;
      user.accessTokenExpires = exchanged.accessTokenExpires;
      return true;
    },

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
