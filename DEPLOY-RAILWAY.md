# Deploying Temanyoga to Railway

This repo is Railway-ready. Builds use **Railpack** (no Dockerfile needed); deploy
settings live in [`railway.json`](./railway.json).

## What the config does

- **Build:** `npm run build` → `prisma generate && next build`
- **Pre-deploy:** `npx prisma db push --skip-generate` applies the schema to the
  database before traffic switches over (see the migration caveat below)
- **Start:** `npm run start` → `next start` (binds `0.0.0.0` and reads Railway's `PORT`)
- **Healthcheck:** `GET /api/health` (DB-free liveness probe)

## One-time setup

1. **Create the project + service**
   - New Project → "Deploy from GitHub repo" and pick this repo, **or** from the
     repo root run `railway init` then `railway up`.

2. **Connect to your Supabase Postgres** — no Railway database needed. In the
   Supabase dashboard: **Connect** → **ORMs → Prisma** (or **Project Settings →
   Database → Connection string**). Set two variables on the Railway app service:
   ```
   # Runtime (Prisma Client) — Transaction pooler, port 6543
   DATABASE_URL = postgresql://postgres.[REF]:[PASSWORD]@[POOLER_HOST]:6543/postgres?pgbouncer=true

   # Migrations / pre-deploy db push — Session pooler, port 5432
   DIRECT_URL   = postgresql://postgres.[REF]:[PASSWORD]@[POOLER_HOST]:5432/postgres
   ```
   - Use the **pooler** host (`*.pooler.supabase.com`) for both — not the direct
     `db.[REF].supabase.co` host. The direct host is IPv6-only without Supabase's
     paid IPv4 add-on; the poolers are IPv4 and reachable from Railway.
   - `pgbouncer=true` is **required** on `DATABASE_URL`: the transaction pooler
     (6543) doesn't support prepared statements, and without the flag Prisma throws
     "prepared statement already exists".
   - `DIRECT_URL` uses the **session** pooler (5432). `prisma.config.ts` points the
     Prisma CLI here, so this is what the pre-deploy `db push` connects through —
     session mode supports the DDL the transaction pooler can't.

4. **Set the remaining variables** (see checklist below).

5. **Generate a domain**
   - App service → Settings → Networking → "Generate Domain". Then set `AUTH_URL`
     to that URL (or your custom domain) and redeploy.

6. **Seed the admin user + sample data** — run once after the first successful deploy:
   ```bash
   railway run npm run db:seed
   ```
   `ADMIN_SEED_PASSWORD` must be set first. The seed is idempotent (upserts), so
   re-running it is safe.

## Environment variable checklist

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase **transaction pooler** (6543) + `?pgbouncer=true`. App runtime |
| `DIRECT_URL` | ✅ | Supabase **session pooler** (5432). **Load-bearing:** `prisma.config.ts` points the Prisma CLI here, so the pre-deploy `db push` fails without it |
| `AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | ✅ | `true` — required behind Railway's proxy or login breaks |
| `AUTH_URL` | ✅ | Public deployment URL, e.g. `https://temanyoga.up.railway.app` |
| `ADMIN_SEED_PASSWORD` | ✅ | Required by the seed script in production |
| `R2_ACCOUNT_ID` | ✅ | Cloudflare R2 (image storage stays external) |
| `R2_ACCESS_KEY_ID` | ✅ | |
| `R2_SECRET_ACCESS_KEY` | ✅ | |
| `R2_BUCKET_NAME` | ✅ | |
| `R2_PUBLIC_URL` | ✅ | Must match an entry in `next.config.ts` `images.remotePatterns` |
| `UPSTASH_REDIS_REST_URL` | ✅ | Login rate limiting (Upstash stays external) |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | |
| `RESEND_API_KEY` | ⬜ | Email — omit to disable |
| `FONNTE_TOKEN` | ⬜ | WhatsApp — omit to disable |
| `API_CO_ID_KEY` | ⬜ | Shipping cost lookup — omit to use fallback |

`PORT` is injected by Railway automatically — do **not** set it manually.

> If you serve R2 images from a new public URL, add that hostname to
> `images.remotePatterns` in `next.config.ts`, otherwise `next/image` will 400.

## Migration caveat (read before going live)

The pre-deploy step uses `prisma db push`, which matches this project's current
dev workflow (no `prisma/migrations/` history exists). It's fine for the first
deploy and an empty database.

**`db push` can drop columns/tables to match the schema, with no rollback.** Once
you have real production data, switch to a proper migration flow:

1. Run `npx prisma migrate dev --name init` locally to generate the baseline.
2. Commit `prisma/migrations/`.
3. Change `preDeployCommand` in `railway.json` to `["npx prisma migrate deploy"]`.

## Deploying updates

Push to the connected branch (Railway auto-deploys) or run `railway up` from the
repo root. Each deploy re-runs the pre-deploy schema sync and the healthcheck
before cutting traffic over.
