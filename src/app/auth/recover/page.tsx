import type { Metadata } from "next";

import { RecoverForm } from "@/components/auth/recoverForm";

export const metadata: Metadata = {
  title: "Reset password · TaoFlow Admin",
};

/**
 * `?email=` is set when the user comes back from the code screen to request a
 * new code, so they do not have to retype the address.
 */
export default async function RecoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.email;
  const email = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");

  return <RecoverForm email={email} />;
}
