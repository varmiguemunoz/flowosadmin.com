# TaoFlow Admin

Consola de administración privada de TaoFlow. Next.js 16 (App Router) + React 19.
El sitio **no es público**: solo IPs autorizadas pueden acceder; el resto recibe
una página 403. La autenticación se delega a la API NestJS existente.

Esta primera entrega cubre **autenticación** (login con credenciales, login con
Google, recuperar contraseña) y deja cableada la infraestructura (Zustand,
TanStack Query, BFF, Proxy) para la futura pantalla de gestión de la base de
conocimiento.

## Stack

- **Next.js 16** (App Router, Turbopack, React Compiler)
- **Auth.js v5** (`next-auth@beta`) — sesiones JWT que envuelven la API NestJS
- **TanStack Query** — data fetching en el cliente (contra los Route Handlers BFF)
- **Zustand** — estado de UI en el cliente
- **Tailwind v4** — sistema de diseño (ver `DESIGN.md`)
- **Zod** — validación de formularios

## Requisitos

- Node.js 22+ (los tests usan `node --experimental-strip-types`)
- La API NestJS de TaoFlow accesible en `API_BASE_URL`

## Configuración

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
| --- | --- |
| `AUTH_SECRET` | Secreto de Auth.js. Genéralo con `npx auth secret`. |
| `AUTH_TRUST_HOST` | `true` (requerido detrás del proxy de Vercel). |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Credenciales OAuth de Google. Redirect URI: `<site-url>/api/auth/callback/google`. |
| `API_BASE_URL` | URL base de la API NestJS (sin `/api/v1` ni slash final). |
| `ADMIN_API_KEY` | Clave admin server-only enviada como `x-admin-api-key` desde el BFF. **Nunca** se expone al navegador. |
| `ALLOWED_IPS` | Lista de IPs permitidas separadas por comas. Vacío = abierto (solo para desarrollo). |

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción
npm run lint
npm test         # node --test (lógica pura: auth, IP allowlist, BFF headers, store)
```

## Arquitectura

```
Request
  └─ src/proxy.ts (Proxy de Next 16, ex "middleware")
       1. ¿IP en ALLOWED_IPS?  no → reescribe a /403 "Acceso restringido"
       2. sesión de Auth.js:   ruta privada sin sesión → /auth/login
  └─ App
       cliente → TanStack Query → /api/bff/* (Route Handler)
                                    └─ inyecta JWT + x-admin-api-key (server)
                                        └─ API NestJS /api/v1/*
```

### Gating por IP

Solo puede existir **un** `proxy.ts` en Next 16, así que compone dos puertas: el
allowlist de IP (primero) y la sesión de Auth.js. La IP se lee de
`x-forwarded-for` (primer valor) con fallback a `x-real-ip` (comportamiento de
Vercel). La lógica pura vive en `src/lib/ip-allowlist.ts` y está testeada.

**Probar el gate en local:** con `ALLOWED_IPS` vacío el sitio queda abierto. Para
simular bloqueo, pon una IP que no sea la tuya (p. ej. `ALLOWED_IPS=203.0.113.1`)
y visita `http://localhost:3000/auth/login`: verás la página 403.

### Auth (Auth.js v5)

- `src/auth.ts` — providers (Credentials + Google) y callbacks `jwt`/`session`.
- `src/lib/auth-api.ts` — cliente server-only de la API NestJS. El punto de canje
  del token de Google (`POST /api/v1/auth/google`) está aislado ahí; ajústalo si
  el contrato real de la API difiere.
- Los tokens de la API (access/refresh) viven dentro de la sesión de Auth.js y se
  refrescan automáticamente vía `/api/v1/auth/refresh-token`.

### BFF (Route Handlers)

Los endpoints protegidos se llaman vía `/api/bff/*`. `src/lib/api-server.ts`
valida la sesión (401 si falta), añade el JWT y el `x-admin-api-key` en el
servidor, y limpia los headers sensibles de la respuesta. Plantilla de
referencia: `src/app/api/bff/knowledge/documents/route.ts`.

## Diseño

El sistema de diseño ("Operator control desk") está documentado en `DESIGN.md`.
La consola usa modo oscuro (canvas slate) con un único acento teal de señal.
