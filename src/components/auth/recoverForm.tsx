"use client";

import { useActionState } from "react";
import Link from "next/link";

import { recoverAction, type RecoverState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";

const initialState: RecoverState = {};

export function RecoverForm() {
  const [state, action, pending] = useActionState(recoverAction, initialState);

  if (state.ok) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Revisa tu correo
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            Si el correo pertenece a una cuenta autorizada, te enviamos un
            enlace para restablecer tu contraseña. Puede tardar unos minutos.
          </p>
        </header>
        <Alert tone="success">Solicitud enviada.</Alert>
        <Link
          href="/auth/login"
          className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-signal hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Recuperar contraseña
        </h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>
      </header>

      <form action={action} noValidate className="flex flex-col gap-5">
        <Field
          label="Correo"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@taoflow.com"
          error={state.errors?.email?.[0]}
          autoFocus
        />

        {state.message ? <Alert tone="danger">{state.message}</Alert> : null}

        <div className="pt-1">
          <Button type="submit" loading={pending}>
            {pending ? "Enviando…" : "Enviar enlace"}
          </Button>
        </div>
      </form>

      <Link
        href="/auth/login"
        className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-signal hover:underline"
      >
        Volver a iniciar sesión
      </Link>
    </div>
  );
}
