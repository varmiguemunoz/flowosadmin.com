import { z } from "zod";

/** Login form schema — shared by the client form and server action. */
export const loginSchema = z.object({
  email: z.email({ error: "Ingresa un correo válido." }).trim(),
  password: z
    .string({ error: "Ingresa tu contraseña." })
    .min(1, { error: "Ingresa tu contraseña." }),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Recover-password form schema. */
export const recoverSchema = z.object({
  email: z.email({ error: "Ingresa un correo válido." }).trim(),
});

export type RecoverInput = z.infer<typeof recoverSchema>;
