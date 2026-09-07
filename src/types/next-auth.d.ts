import type { DefaultSession } from "next-auth";

/**
 * The user object our NestJS API returns on login. Kept minimal and free of
 * sensitive fields. Extend as the API surface grows.
 */
export interface ApiUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string | null;
}

declare module "next-auth" {
  /**
   * Returned by `authorize` (Credentials) and available in callbacks.
   * Carries the API tokens so the JWT callback can persist them.
   */
  interface User {
    id?: string;
    role?: string | null;
    accessToken?: string;
    refreshToken?: string;
    /** Access token expiry as epoch milliseconds. */
    accessTokenExpires?: number;
  }

  interface Session {
    user: {
      id: string;
      role?: string | null;
    } & DefaultSession["user"];
    /** API access token, exposed server-side for BFF calls. */
    accessToken?: string;
    /** Present when token refresh failed; forces re-authentication. */
    error?: "RefreshTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: "RefreshTokenError";
  }
}
