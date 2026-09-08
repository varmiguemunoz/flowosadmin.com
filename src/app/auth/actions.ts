"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn } from "@/auth";
import { requestPasswordReset, resetPassword } from "@/lib/auth-api";
import { loginSchema, recoverSchema, resetSchema } from "@/lib/auth-schemas";

export interface LoginState {
  errors?: { email?: string[]; password?: string[] };
  message?: string;
}

export interface RecoverState {
  errors?: { email?: string[] };
  message?: string;
  ok?: boolean;
}

export interface ResetState {
  errors?: {
    email?: string[];
    token?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string;
  ok?: boolean;
}

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
    // `signIn` throws a redirect on success — Next.js uses it for navigation,
    // so it must propagate untouched.
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      // `ApiSignInError` puts the API's own message on `code`, so a 404 or an
      // unreachable service reads differently from a wrong password.
      const apiMessage =
        "code" in error && typeof error.code === "string" ? error.code : "";

      return {
        message:
          apiMessage && apiMessage !== "credentials"
            ? apiMessage
            : "Invalid credentials. Check them and try again.",
      };
    }

    throw error;
  }

  return {};
}

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

  // Always send the user to the code screen, whether or not the address is
  // registered. Branching here would reveal which emails have accounts.
  redirect(`/auth/reset?email=${encodeURIComponent(parsed.data.email)}`);
}

/**
 * Complete a password reset. Unlike `recoverAction` this one does surface
 * failures: the user is acting on a link they already hold, so an expired
 * token or a rejected password has to be visible or they cannot recover.
 */
export async function resetAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = resetSchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const result = await resetPassword({
      email: parsed.data.email,
      token: parsed.data.token,
      newPassword: parsed.data.password,
    });

    if (!result.ok) {
      return { message: result.message };
    }
  } catch {
    return { message: "We could not reach the service. Try again." };
  }

  return { ok: true };
}
