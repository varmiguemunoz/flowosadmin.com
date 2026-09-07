import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/loginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión · TaoFlow Admin",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-40 rounded bg-surface-raised" />
        <div className="h-4 w-56 rounded bg-surface-raised" />
      </div>
      <div className="flex flex-col gap-5">
        <div className="h-10 rounded bg-surface-raised" />
        <div className="h-10 rounded bg-surface-raised" />
        <div className="h-11 rounded bg-surface-raised" />
      </div>
    </div>
  );
}
