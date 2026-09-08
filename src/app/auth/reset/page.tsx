import type { Metadata } from "next";

import { ResetForm } from "@/components/auth/resetForm";

export const metadata: Metadata = {
  title: "Enter your code · TaoFlow Admin",
};

/**
 * The API emails an 8-digit one-time code, not a link, so there is no token in
 * the URL. `?email=` is carried over from the recover step purely to prefill
 * the field; the user types the code here.
 */
export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.email;
  const email = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");

  return <ResetForm email={email} />;
}
