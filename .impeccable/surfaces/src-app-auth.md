---
version: 1
slug: "src-app-auth"
primary_target: "src/app/auth"
related_targets: ["src/app/403","src/app/loading.tsx"]
---

Scope: the `/auth/*` surface (login, recover password) and the shared operator
shell that also covers the 403 gate and loading states. Visitor mode: Operate.

Audience: a small, trusted group of TaoFlow administrators signing in to a
private back office from known locations. Job: authenticate quickly and get to
work managing the knowledge base. Action: sign in (email/password or Google),
or request a password reset. Constraints: Spanish UI copy; the site is IP-gated
before auth; no public sign-up; secrets stay server-side.

## Direction contract

THESIS: An operator's control desk — a calm, precise sign-in that reads as
instrumentation for people who run a system, not a marketing front door. It
refuses the centered-card-on-a-gradient login and the SaaS hero.

OWN-WORLD: Deep slate canvas (near-black blue-slate), structure drawn in
hairline rules and generous negative space rather than boxes. One restrained
signal accent — a flow teal-cyan — used as the live/active state the way a
console marks an armed channel, never as decoration. Workhorse humanist sans
for UI; tabular, slightly wider mono for labels, field keys, and status ticks.
Inputs are underlined fields on the canvas, not filled pills. Focus is a
crisp accent underline + ring. Recognizable with content removed by its
hairline grid, mono microlabels, and single teal signal on slate.

STORY: The admin understands this is a restricted operator console, trusts it
because it feels engineered and quiet, and signs in without friction.

FIRST VIEWPORT: Full-height split. Left (desktop): a narrow signal rail on
slate — the TaoFlow Admin wordmark top-left, a faint status line ("Consola
restringida") and a hairline-drawn ambient signal motif low. Right: the sign-in
panel left-aligned, not centered — heading "Iniciar sesión", email + password
underline fields, primary "Entrar" button in teal, a hairline "o" divider, then
"Continuar con Google", and a quiet "¿Olvidaste tu contraseña?" link. On mobile
the rail collapses to a slim top bar; the panel takes the screen.

FORM: Operator control desk, direction #5 of my grounded list. Seed key
38eb9cc0 (concept-seed --scope direction --mode operate); challengers declined —
they obscure an Operate auth task. Kept from the declined oscilloscope card: its
discipline of measuring everything against a graticule → our hairline baseline
grid and tabular mono microlabels carry that instrument rigor.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
