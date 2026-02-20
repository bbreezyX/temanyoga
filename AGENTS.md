# AGENTS.md — Temanyoga Coding Agent Guidelines

Next.js 16 e-commerce app for handmade yoga boneka (plushies). Customer storefront with cart/checkout/order tracking/reviews + admin dashboard for product/order/coupon/accessory management with real-time SSE notifications.

## Tech Stack

Next.js 16.1.6 (App Router, Turbopack) | React 19.2.3 | TypeScript 5 (strict) | Prisma 6.19.2 (PostgreSQL) | Auth.js 5.0.0-beta.30 (JWT) | Zod 4.3.6 | Tailwind CSS 4 | shadcn/ui (new-york) | Cloudflare R2 | Resend (email) | Fonnte (WhatsApp) | Upstash Redis (rate limiting) | SWR 2.4.0

## Build, Lint, and Test Commands

```bash
npm run dev          # Dev server with Turbopack
npm run build        # prisma generate + next build
npm run lint         # ESLint (flat config, core-web-vitals + typescript)
npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed admin user + sample products
npm run db:studio    # Prisma Studio GUI
```

**No test suite is configured.** When adding tests, create a `test` script in package.json using your preferred runner (e.g. Vitest). Single-test execution would then be: `npx vitest run path/to/test.ts`.

## Critical Gotchas

### Prisma v6
- Generated client output: `src/generated/prisma/`
- **Server-side**: `import { prisma } from "@/lib/prisma"` (singleton), types from `@/generated/prisma/client`
- **Client components**: import enums from `@/generated/prisma/enums` (client.ts has Node.js imports that break browser)
- Seed script uses relative import: `../src/generated/prisma/client`

### Zod v4 (NOT v3)
- `z.nativeEnum()` is **DEPRECATED** -- use `z.enum(NativeEnum)` instead
- `ZodError` has `.issues` NOT `.errors`; first error: `parsed.error.issues[0].message`

### Next.js 16
- Route params are `Promise<{...}>` -- must `await params`
- Pages with `useSearchParams()` must be wrapped in `<Suspense>`
- Use `export const dynamic = "force-dynamic"` for pages with DB queries
- Server components should use Prisma directly (not fetch API routes)
- `middleware.ts` convention is deprecated (warns to use "proxy")

### Auth.js v5 beta.30
- Exports: `{ handlers, auth, signIn, signOut }` from `NextAuth()`
- JWT strategy (no database sessions); callbacks: `jwt({ token, user })`, `session({ session, token })`

## Code Style

### Imports
Use `@/*` path alias (maps to `src/`). Group: React/Next first, external libs, then internal modules. Use `import type { ... }` for type-only imports.

```typescript
import { useState, useEffect, type ReactNode } from "react";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, serverError } from "@/lib/api-response";
import type { ProductListItem } from "@/types/api";
```

### TypeScript
- Strict mode -- no `any` unless absolutely necessary
- Use `type` for object shapes, `interface` for extensible contracts
- Use Zod schemas for validation; export inferred types: `type X = z.infer<typeof xSchema>`

### Naming Conventions

| Element          | Convention           | Example                          |
|------------------|----------------------|----------------------------------|
| Components       | PascalCase           | `ProductCard`, `CartProvider`    |
| Functions        | camelCase            | `getImageUrl`, `formatCurrency`  |
| Constants        | SCREAMING_SNAKE_CASE | `CART_KEY`, `R2_PUBLIC_URL`      |
| Types/Interfaces | PascalCase           | `ProductListItem`                |
| API handlers     | HTTP method name     | `GET`, `POST`, `PATCH`, `DELETE` |
| Zod schemas      | camelCase + Schema   | `createProductSchema`            |
| Files            | kebab-case           | `product-card.tsx`               |

### React Components
- Function declarations (not arrow functions), `"use client"` directive when hooks/events needed
- Use `cn()` from `@/lib/utils` for conditional Tailwind class merging
- shadcn components in `@/components/ui/`, custom components in feature folders (`@/components/product/`, etc.)

### API Routes
Export async functions named after HTTP methods. Use `NextRequest`/`NextResponse`. Wrap in try/catch with standardized response helpers:

```typescript
export async function GET(request: NextRequest) {
  try {
    const data = await prisma.product.findMany();
    return apiSuccess(data);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return serverError();
  }
}
```

### Error Handling
- Custom error classes in `@/lib/errors.ts` (`AppError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`)
- Response helpers in `@/lib/api-response.ts`: `apiSuccess`, `apiError`, `notFound`, `unauthorized`, `badRequest`, `serverError`
- Log with `console.error()` including route context

### Styling
- Tailwind CSS 4 with shadcn/ui (new-york style)
- Theme colors: terracotta, sage, cream, dark-brown, warm-sand, warm-gray
- Fonts: Manrope (body), Archivo (display)
- Always use `next/image` with `getImageUrl()` from `@/lib/image-url.ts`

### Database
- Singleton: `import { prisma } from "@/lib/prisma"`
- Use `prisma.$transaction([...])` for multi-step operations
- Update `types/api.ts` and `lib/validations/` when schema changes

## Key Structure

```
src/
  app/(admin)/admin/     # Admin dashboard pages (auth-protected)
  app/(customer)/        # Storefront pages (home, products, cart, checkout, track-order)
  app/api/               # Public API routes
  app/api/admin/         # Protected admin API routes (JWT + ADMIN role via middleware)
  components/ui/         # shadcn/ui primitives
  components/admin/      # Admin components (tables, forms, notifications)
  components/{cart,product,order,review}/ # Feature components
  contexts/              # cart-context (localStorage), sidebar-context
  lib/                   # Auth, prisma, R2, email, whatsapp, rate-limit, validations/
  types/api.ts           # All API response types
  generated/prisma/      # Generated Prisma client (do not edit)
  middleware.ts          # Auth middleware for /api/admin/**
```

## Common Tasks

**New API endpoint**: Create route in `app/api/`, use schemas from `lib/validations/`, return via `lib/api-response.ts` helpers. Admin endpoints go under `app/api/admin/` (auto-protected by middleware).

**New page**: Create `page.tsx` in `(customer)` or `(admin)` route group. Add `export const dynamic = "force-dynamic"` for DB queries. Remember `await params` for dynamic routes.

**Schema change**: Edit `prisma/schema.prisma`, run `npm run db:push`, update `types/api.ts` and `lib/validations/`.

**New shadcn component**: `npx shadcn@latest add <name>` (installs to `src/components/ui/`).

## AI Assistant Tools

- **Fast Apply**: Prefer `edit_file` over full file writes. Works with partial code snippets.
- **Warp Grep**: Use for broad semantic queries ("Find the order flow", "Where is auth handled?"), not keyword pinpointing.
