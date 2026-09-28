# AGENTS.md

Project: **new-tube** — a YouTube-like web app built with Nuxt 4 (Vue 3 SSR, full-stack), Tailwind CSS v4, shadcn-vue, Clerk auth, Drizzle ORM + Neon Postgres (`@neondatabase/serverless`, neon-http driver).

## Commands

- `pnpm dev` — dev server
- `pnpm build` / `pnpm preview` — production build / preview
- `pnpm lint` / `pnpm lint:fix` — oxlint (config in `.oxlintrc.json`, `correctness` as error)
- `pnpm fmt` / `pnpm fmt:check` — oxfmt (config in `.oxfmtrc.json`; `.agents/*` ignored)
- `pnpm dlx drizzle-kit push` (or `generate`/`migrate`) — apply `server/db/schema.ts` to Neon DB (config: `drizzle.config.ts`)
- No test framework is configured; do not add test scaffolding unless asked.

`postinstall` runs `nuxt prepare` — regenerated `.nuxt/` types are gitignored output, never edit them.

## Architecture

Nuxt 4 source layout:

- `app/` — Vue client. `pages/` (file-based routing; `sign-in/`, `sign-up/` from Clerk's docs), `layouts/` (`default.vue`, `auth.vue`), `components/` (feature subfolders + `ui/` for shadcn), `lib/utils.ts` (`cn`), `plugins/`
- `server/` — Nitro backend
  - `server/db/index.ts` · exports `db` …
  - `server/db/schema.ts` · Drizzle schema (e.g. `users` table with `clerkId`); `drizzle.config.ts` points here.
- Root `env.ts` — T3 env (+ zod). `DATABASE_URL`, `NUXT_CLERK_SECRET_KEY` are typed server vars, `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY` typed client var. Add new vars here, not to `.env` alone — types and validation come from this file.
- `.env` (gitignored copy) holds real secrets — never hardcode, never commit.

## Conventions

- Auto-imports: Nuxt (`ref`, `computed`, `useFetch`, …), VueUse, shadcn components — import aliases are `@/…` (app) and `~~/…` or `~~/env.ts` style root (`~~/env.ts` for env/db). Don't add redundant explicit imports for auto-imported symbols/composables/components.
- Icons: `@lucide/vue` (`@lucide/vue` default) and `@remixicon/vue` — both present; `<script setup lang="ts">` for Vue SFCs; `tw-animate-css` utilities available in Tailwind.
- shadcn-vue: `style: "new-york"`, Tailwind **v4 CSS-first** (`app/assets/css/tailwind.css`, `@theme` variables, colorMode classSuffix empty). Follow existing components in `app/components/ui/` before adding new ones via the shadcn CLI.
- Drizzle: stay on drizzle-orm API (`db.select().from(...)`, `db.insert(...).values(...)`); schema files use `pgTable` + index helpers returning arrays, not objects.
- Oxlint (`.oxlintrc.json`) must pass: no `any` leaks, no unused vars, etc.
- Oxfmt (`fmt`) before delivery; one declaration per line convention used in schema (eslintrc-style arrays).
- Any file change to `env.ts` or `server/db/*` requires running the related generator (`drizzle-kit`) so migration files stay in sync.

## Gotchas

### Drizzle-kit in Postgres

- `drizzle-kit generate` (name via `--name`), then `drizzle-kit migrate` or push directly.
- Schema-first, no snake_case… naming: explicit `text("clerk_id")` snake_case mapping is required per column.
- `neon-http` driver: single-f instance queries only — batch with `db.…` batching (`db.batch`) or a single transaction via `db.transaction` is NOT supported by neon-http; use `db.batch` if supported or sequential queries.

### Nuxt 4 layout migration

- `pages/`, `components/`, `composables/` live under `app/` since Nuxt 4 — broader `server/` for Nitro handlers remains at root; `server/api` (new API routes for files) belong there.
- `useAsyncData`/`useFetch` Warnings if you forget `key` option `sharing same key` — provide unique `key` in `useAsyncData` in SSR.

---
