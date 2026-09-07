import type { Metadata } from "next";

import { RecoverForm } from "@/components/auth/recoverForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña · TaoFlow Admin",
};

export default function RecoverPage() {
  return <RecoverForm />;
}
