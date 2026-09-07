import type { ReactNode } from "react";

type Tone = "danger" | "success";

const tones: Record<Tone, { text: string; dot: string }> = {
  danger: { text: "text-danger", dot: "bg-danger" },
  success: { text: "text-signal", dot: "bg-signal" },
};

export function Alert({
  tone = "danger",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  const t = tones[tone];
  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={`flex items-start gap-2.5 text-sm ${t.text}`}
    >
      <span
        aria-hidden="true"
        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${t.dot}`}
      />
      <span>{children}</span>
    </p>
  );
}
