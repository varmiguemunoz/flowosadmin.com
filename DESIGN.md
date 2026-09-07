---
name: TaoFlow Admin
description: Operator control desk for the TaoFlow administration console.
colors:
  canvas: "#0b0f14"
  surface: "#111720"
  surface-raised: "#161d28"
  line: "#1f2937"
  line-strong: "#2b3644"
  ink: "#e6edf3"
  ink-muted: "#9aa7b4"
  ink-faint: "#7c8a99"
  signal: "#2dd4bf"
  signal-strong: "#14b8a6"
  signal-dim: "#0f766e"
  on-signal: "#04121a"
  danger: "#f87171"
  warning: "#fbbf24"
typography:
  display:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 4vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.14em"
rounded:
  control: "8px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-signal:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 16px"
  button-signal-hover:
    backgroundColor: "{colors.signal-strong}"
    textColor: "{colors.on-signal}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
  input-underline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    height: "40px"
---

# Design System: TaoFlow Admin

## Overview

**Creative North Star: "The Operator's Control Desk"**

TaoFlow Admin reads like instrumentation for people who run a system, not a
marketing front door. The surface is a deep slate console where structure is
drawn with hairline rules and negative space rather than boxes, and a single
flow-teal signal marks what is live the way a control panel marks an armed
channel. It is quiet, engineered, and confident: the calm of a well-labeled
bench where every reading means something.

The world is deliberately restrained because the visitor came to operate, not
to be persuaded. Personality lives in precise details, the mono microlabels,
the tabular figures, the single teal accent, the themed caret and selection,
rather than in ornament. The aesthetic rejects the centered-card-on-a-gradient
login and the generic SaaS hero outright.

Depth is conveyed by tonal layering (canvas → surface → raised) and hairlines,
not by drop shadows. Motion is minimal and purposeful.

**Key Characteristics:**
- Deep slate canvas, dark by scene (a desk-operated internal console)
- Hairline structure and generous negative space over boxes and cards
- One flow-teal signal accent reserved for the live/active state
- Workhorse sans for UI, mono for labels and status ticks

## Colors

A near-black blue-slate ground with a single saturated teal signal and a small
functional status set. Restrained strategy: neutrals plus one accent.

### Primary
- **Flow Teal** (#2dd4bf): the signal accent. Primary buttons, focus underlines
  and rings, active/live indicators, success ticks. It marks what is armed or
  actionable and appears sparingly.
- **Flow Teal Strong** (#14b8a6): pressed/hover state of the signal.
- **Flow Teal Dim** (#0f766e): faint signal used in ambient motif linework.

### Neutral
- **Slate Canvas** (#0b0f14): the page ground.
- **Slate Surface** (#111720): the signal rail and raised regions.
- **Slate Surface Raised** (#161d28): skeletons, elevated blocks.
- **Hairline** (#1f2937) / **Hairline Strong** (#2b3644): dividers, field
  underlines, drawn structure.
- **Ink** (#e6edf3): primary text. **Ink Muted** (#9aa7b4): secondary text.
  **Ink Faint** (#7c8a99): microlabels and placeholders (tuned to clear AA).

### Status
- **Danger** (#f87171): errors, denied states (403 shield tick).
- **Warning** (#fbbf24): reserved for cautionary states.

### Named Rules
**The Armed-Channel Rule.** Flow Teal only marks what is live or actionable —
the primary action, focus, an active state. It is never decoration, and never
covers a whole region. Its rarity is what makes it read as a signal.

## Typography

**Display / Body Font:** Geist Sans (with ui-sans-serif, system-ui fallback)
**Label / Mono Font:** Geist Mono (with ui-monospace fallback)

**Character:** A workhorse humanist sans for calm, legible UI, paired with a
tabular mono that carries field keys and status ticks with instrument rigor.

### Hierarchy
- **Display** (600, clamp(1.5rem–2.25rem), 1.1, -0.02em): page/screen headings
  ("Iniciar sesión", "Acceso restringido").
- **Body** (400, 0.9375rem, 1.6): descriptions and helper text; measure kept
  narrow (~24–36ch) on the auth panel.
- **Label** (400, 0.6875rem, +0.14em, uppercase): mono microlabels for field
  keys and short status lines only.

### Named Rules
**The Short-Label Rule.** Uppercase mono is for short labels and field keys
only. Any descriptive line longer than a few words drops to sentence-case mono
or body; long all-caps passages are banned.

## Layout

A full-height split shell on the auth surface: a narrow signal rail
(minmax(320px, 38%)) on the left carrying the wordmark, status, and an ambient
flow motif; the sign-in panel on the right, left-aligned in a max-w-sm column,
never centered in a floating card. Below the `lg` breakpoint the rail collapses
to a slim top bar and the panel takes the screen. Spacing rhythm groups tightly
within a field and separates generously between groups; headings carry more
space above than below.

## Elevation & Depth

No drop shadows. Depth is tonal: canvas (#0b0f14) → surface (#111720) → raised
(#161d28), separated by hairline rules. Focus is the one lifted moment — a teal
underline plus a soft ring on the control that has it.

### Named Rules
**The Drawn-Structure Rule.** Structure is drawn with 1px hairlines and space,
not with cards or shadows. Reach for a rule or a gap before a container.

## Shapes

Corners are minimal. Only small controls round (8px): buttons, focusable
blocks. Inputs are not pills — they are underlined fields on the canvas. Pills
(999px) are reserved for tiny indicators like status dots. There are no large
rounded card containers in this world.

## Components

### Buttons
- **Shape:** 8px radius, 44px tall, full-width in the auth forms.
- **Signal (primary):** Flow Teal (#2dd4bf) ground, on-signal ink (#04121a).
- **Hover / Focus:** hover → Flow Teal Strong (#14b8a6); focus-visible → 2px
  teal ring offset from the canvas. Loading shows an inline spinner and
  disables.
- **Ghost:** transparent with a hairline-strong border; used for "Continuar con
  Google", pairing a drawn 4-color Google glyph.

### Inputs / Fields
- **Style:** underlined field on the canvas (bottom border only), no fill,
  paired with a mono microlabel above.
- **Focus:** underline shifts to Flow Teal.
- **Error:** underline and message switch to Danger (#f87171), with
  `aria-invalid` and `aria-describedby` wired to the message.

### Status / Alert
- **Style:** a small colored dot marks the line (danger or signal); no filled
  banner and no colored left-border bar. `role="alert"` for errors,
  `role="status"` for success.

### Navigation / Links
- Quiet ink-muted links; hover reveals a teal underline with a 4px offset.

## Do's and Don'ts

### Do:
- **Do** reserve Flow Teal for live/actionable elements (the Armed-Channel Rule).
- **Do** draw structure with hairlines and space; layer tone for depth.
- **Do** use mono microlabels for short field keys and status only.
- **Do** theme browser surfaces (selection, caret, placeholder, scrollbars) from
  the palette.
- **Do** keep AA contrast: all ink tones clear 4.5:1 on every slate surface.

### Don't:
- **Don't** center the sign-in in a floating card on a gradient.
- **Don't** put a kicker/eyebrow label above a heading.
- **Don't** use drop shadows or ghost-card 1px-border-under-soft-shadow.
- **Don't** use a colored left-border bar on alerts, or emoji in place of drawn
  icons.
- **Don't** let Flow Teal spread into decoration or cover whole regions.
