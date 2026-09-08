"use client";

import { useActionState } from "react";
import Link from "next/link";

import { recoverAction, type RecoverState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";

const initialState: RecoverState = {};

export function RecoverForm({ email = "" }: { email?: string }) {
  const [state, action, pending] = useActionState(recoverAction, initialState);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Reset password
        </h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          Enter your email and we&apos;ll send you an 8-digit code to set a new
          password.
        </p>
      </header>

      <form action={action} noValidate className="flex flex-col gap-5">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@taoflow.com"
          defaultValue={email}
          error={state.errors?.email?.[0]}
          autoFocus
        />

        {state.message ? <Alert tone="danger">{state.message}</Alert> : null}

        <div className="pt-1">
          <Button type="submit" loading={pending}>
            {pending ? "Sending…" : "Send code"}
          </Button>
        </div>
      </form>

      <Link
        href="/auth/login"
        className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-signal hover:underline"
      >
        Back to sign in
      </Link>
    </div>
  );
}
