"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { requestPasswordReset } from "@/lib/auth-api";
import { loginSchema, recoverSchema } from "@/lib/auth-schemas";

export interface LoginState {
  errors?: { email?: string[]; password?: string[] };
  message?: string;
}

export interface RecoverState {
  errors?: { email?: string[] };
  message?: string;
  ok?: boolean;
}

/**
 * Credentials login. On success, NextAuth redirects to `redirectTo` (which
 * throws a redirect we must let bubble). On failure, return a generic message
 * — never reveal whether the email or the password was wrong.
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const callbackUrl =
    (formData.get("callbackUrl") as string | null) || "/admin";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    // Only AuthError means bad credentials. Any other throw (notably the
    // redirect signIn raises on success) must bubble up untouched.
    if (error instanceof AuthError) {
      return { message: "Credenciales inválidas. Verifica e intenta de nuevo." };
    }
    throw error;
  }

  return {};
}

/**
 * Request a password reset. Always report success to the user regardless of
 * whether the email exists, to avoid account enumeration.
 */
export async function recoverAction(
  _prev: RecoverState,
  formData: FormData,
): Promise<RecoverState> {
  const parsed = recoverSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await requestPasswordReset(parsed.data.email);
  } catch {
    // Swallow — see note above; we don't leak existence or backend errors.
  }

  return { ok: true };
}
