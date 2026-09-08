"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { loginAction, type LoginState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";

const initialState: LoginState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Sign in
        </h1>
        <p className="text-sm text-ink-muted">
          Access the TaoFlow admin console.
        </p>
      </header>

      <form action={action} noValidate className="flex flex-col gap-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@taoflow.com"
          error={state.errors?.email?.[0]}
          autoFocus
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={state.errors?.password?.[0]}
        />

        {state.message ? <Alert tone="danger">{state.message}</Alert> : null}

        <div className="flex flex-col gap-4 pt-1">
          <Button type="submit" loading={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </form>

      <Link
        href="/auth/recover"
        className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-signal hover:underline"
      >
        Forgot your password?
      </Link>
    </div>
  );
}
