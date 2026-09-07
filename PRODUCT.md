# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Internal administrators of TaoFlow (a guided meditation platform). Small, trusted
group operating from known locations. They sign in to a private back office; the
site is not open to the public and is reachable only from an allowlisted set of IP
addresses. Their primary near-term job is to manage the knowledge base that grounds
the product's AI coach and meditation generation (uploading and curating documents).

## Product Purpose

TaoFlow Admin is the administrative console for the TaoFlow product. It gives the
team a secure place to authenticate and operate back-office tasks. The first
delivered capability is authentication; the console is built so the knowledge-base
management surface (upload, list, reindex, delete, search documents) can be added
next without rework.

## Positioning

A locked-down internal console: access is gated at the network edge by IP allowlist
before authentication, so unauthorized visitors never see the application at all
(they receive a dedicated "Acceso restringido" 403 page). This defense-in-depth
posture — IP gate first, then authenticated session — is a deliberate product
constraint, not a styling choice.

## Operating Context

- Deployed on Vercel. Client IP is read from `x-forwarded-for` (first value), with
  `x-real-ip` as fallback.
- Authentication is delegated to an existing NestJS API under `/api/v1/auth/*`
  (`login`, `google`, `forgot-password`, `refresh-token`, `validate`, `logout`).
  The API issues JWT access + refresh tokens.
- Protected API calls flow through Next.js Route Handlers (BFF). The server injects
  the JWT and an `x-admin-api-key` header; the admin key never reaches the browser.
- Admins use the console from desktop primarily, but it must remain usable on mobile.

## Capabilities and Constraints

- Auth screens in this delivery: login (email/password + "Continue with Google") and
  recover password. No dashboard or knowledge screens yet — those are wired for later.
- Stack: Next.js 16 (App Router) + React 19, Auth.js v5 (NextAuth) for sessions,
  TanStack Query for client data fetching, Zustand for client UI state, Tailwind v4.
- The "middleware" layer is Next 16's Proxy (`src/proxy.ts`): a single file composes
  the IP allowlist gate with the NextAuth session handling.
- IP allowlist is configured via environment variable (comma-separated list).
- Terminology: "Proxy" (Next 16's renamed middleware), "BFF" (Route Handlers that
  proxy to the NestJS API), "knowledge base" (the RAG documents the admin curates).

## Brand Commitments

- Product name shown in the UI: **TaoFlow Admin**.
- No formal brand identity (logo, palette, typography) exists yet. The visual
  direction is delegated: a sober, professional internal-tool aesthetic (Operate
  mode) is appropriate. No binding colors, logo, or fonts were provided.

## Evidence on Hand

- Backend architecture reference and API surface were provided by the user
  (NestJS `/api/v1`, Supabase Postgres + Auth, Stripe, RAG knowledge endpoints).
- No real logo, brand assets, testimonials, or marketing copy exist. Future work
  must not fabricate brand assets or claims.

## Product Principles

1. Closed by default: unauthorized IPs and unauthenticated users get nothing useful.
2. Secrets stay on the server: the admin API key and refresh tokens never ship to
   the client.
3. Built to extend: auth-only today, but the infrastructure anticipates the
   knowledge-base surface next.
4. Operate over impress: clarity, scanability, and consistency outrank expression;
   brand lives in precise details.

## Accessibility & Inclusion

No product-specific standard was mandated. Follow baseline WCAG-minded practice
(labels, focus states, contrast, keyboard operability) as a floor for an internal tool.
