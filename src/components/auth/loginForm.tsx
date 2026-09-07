"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { loginAction, type LoginState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { GoogleGlyph } from "@/components/auth/google-glyph";

const initialState: LoginState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Iniciar sesión
        </h1>
        <p className="text-sm text-ink-muted">
          Accede al panel de administración de TaoFlow.
        </p>
      </header>

      <form action={action} noValidate className="flex flex-col gap-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <Field
          label="Correo"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@taoflow.com"
          error={state.errors?.email?.[0]}
          autoFocus
        />
        <Field
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={state.errors?.password?.[0]}
        />

        {state.message ? <Alert tone="danger">{state.message}</Alert> : null}

        <div className="flex flex-col gap-4 pt-1">
          <Button type="submit" loading={pending}>
            {pending ? "Entrando…" : "Entrar"}
          </Button>

          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="microlabel">o</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => signIn("google", { callbackUrl })}
          >
            <GoogleGlyph />
            Continuar con Google
          </Button>
        </div>
      </form>

      <Link
        href="/auth/recover"
        className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-signal hover:underline"
      >
        ¿Olvidaste tu contraseña?
      </Link>
    </div>
  );
}
