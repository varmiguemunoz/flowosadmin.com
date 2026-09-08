"use client";

import { useActionState } from "react";
import Link from "next/link";

import { resetAction, type ResetState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { OTP_LENGTH } from "@/lib/otp";

const initialState: ResetState = {};

export function ResetForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(resetAction, initialState);

  if (state.ok) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Password updated
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            You can now sign in with your new password.
          </p>
        </header>
        <Alert tone="success">Password changed.</Alert>
        <Link
          href="/auth/login"
          className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-signal hover:underline"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  // Prefilled from the recover step. If someone opens this page directly the
  // field stays editable rather than blocking them.
  const recoverHref = email
    ? `/auth/recover?email=${encodeURIComponent(email)}`
    : "/auth/recover";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Enter your code
        </h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          {email
            ? `We sent an ${OTP_LENGTH}-digit code to ${email}. Enter it below with your new password.`
            : `Enter the ${OTP_LENGTH}-digit code we emailed you, along with your new password.`}
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
        />
        <Field
          label="Verification code"
          name="token"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="8 digits"
          maxLength={20}
          error={state.errors?.token?.[0]}
          autoFocus
        />
        <Field
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={state.errors?.password?.[0]}
        />
        <Field
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={state.errors?.confirmPassword?.[0]}
        />

        {state.message ? (
          <div className="flex flex-col gap-2">
            <Alert tone="danger">{state.message}</Alert>
            <Link
              href={recoverHref}
              className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-signal hover:underline"
            >
              Request a new code
            </Link>
          </div>
        ) : null}

        <div className="pt-1">
          <Button type="submit" loading={pending}>
            {pending ? "Saving…" : "Save new password"}
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-2">
        <Link
          href={recoverHref}
          className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-signal hover:underline"
        >
          Didn&apos;t get a code? Send another
        </Link>
        <Link
          href="/auth/login"
          className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-signal hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
