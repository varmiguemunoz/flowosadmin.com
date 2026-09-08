import { z } from "zod";

import { normalizeOtp, OTP_LENGTH } from "@/lib/otp";

/** Login form schema — shared by the client form and server action. */
export const loginSchema = z.object({
  email: z.email({ error: "Enter a valid email." }).trim(),
  password: z
    .string({ error: "Enter your password." })
    .min(1, { error: "Enter your password." }),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Recover-password form schema. */
export const recoverSchema = z.object({
  email: z.email({ error: "Enter a valid email." }).trim(),
});

export type RecoverInput = z.infer<typeof recoverSchema>;

/**
 * Reset-password form schema.
 *
 * The API emails an 8-digit one-time code rather than a link, so the user
 * types it here alongside the new password. The code is normalized to digits
 * before validation so a pasted "8816 8564" is accepted.
 */
export const resetSchema = z
  .object({
    email: z.email({ error: "Enter the email you requested the code for." }),
    token: z
      .string({ error: "Enter the 8-digit code." })
      .transform(normalizeOtp)
      .refine((value) => value.length === OTP_LENGTH, {
        error: `The code is ${OTP_LENGTH} digits.`,
      }),
    password: z
      .string({ error: "Enter a new password." })
      .min(8, { error: "Use at least 8 characters." }),
    confirmPassword: z
      .string({ error: "Confirm your new password." })
      .min(1, { error: "Confirm your new password." }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetInput = z.infer<typeof resetSchema>;
