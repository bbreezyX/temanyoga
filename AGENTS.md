# AGENTS.md — Temanyoga Coding Agent Guidelines

Next.js 16 e-commerce app for D'TEMAN YOGA — handmade yoga boneka (plushies). Indonesian-language storefront (`lang="id"`) with cart/checkout/order tracking/reviews + admin dashboard for product/order/coupon/accessory/user management with real-time SSE notifications. Live at `https://ditemaniyoga.com`.

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router, Turbopack, React Compiler) | 16.1.6 |
| UI | React | 19.2.3 |
| Language | TypeScript (strict) | 5 |
| ORM | Prisma (PostgreSQL) | 6.19.2 |
| Auth | Auth.js / NextAuth (JWT, Credentials) | 5.0.0-beta.30 |
| Validation | Zod | 4.3.6 |
| Styling | Tailwind CSS 4 + shadcn/ui (new-york) + tw-animate-css | |
| Forms | react-hook-form + @hookform/resolvers | 7.71.1 |
| Data fetching | SWR | 2.4.0 |
| Storage | Cloudflare R2 (via AWS SDK S3) | |
| Email | Resend | 6.9.2 |
| WhatsApp | Fonnte | |
| Rate limiting | Upstash Redis + @upstash/ratelimit | |
| Icons | lucide-react | |
| Slugs | slugify | |
| IDs | nanoid | |
| Hashing | bcryptjs | 3.0.3 |

## Commands

```bash
npm run dev          # Dev server with Turbopack
npm run build        # prisma generate + next build
npm run start        # Production server
npm run lint         # ESLint (flat config, core-web-vitals + typescript)
npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed admin user + sample products + default settings
npm run db:studio    # Prisma Studio GUI
```

**No test suite is configured.** When adding tests, use Vitest: add a `test` script to package.json, then `npx vitest run path/to/test.ts`.

## Critical Gotchas

### Prisma v6
- Generated client output: `src/generated/prisma/` — **do not edit**
- **Server-side**: `import { prisma } from "@/lib/prisma"` (singleton), types from `@/generated/prisma/client`
- **Client components**: import enums from `@/generated/prisma/enums` (the `client` module has Node.js imports that break browser bundles)
- Seed script uses **relative import**: `../src/generated/prisma/client`
- After schema changes: run `npm run db:push` which auto-runs `prisma generate`
- **11 models**: User, Product, ProductImage, ShippingZone, Accessory, Coupon, Order, OrderItem, PaymentProof, Notification, SiteSetting, Review
- **5 enums**: Role, OrderStatus, PaymentProofStatus, NotificationType, DiscountType

### Zod v4 (NOT v3)
- `z.nativeEnum()` is **DEPRECATED** — use `z.enum(NativeEnum)` instead
- `ZodError` has `.issues` NOT `.errors`; first error: `parsed.error.issues[0].message`

### Next.js 16
- **Route params are `Promise<{...}>`** — must `await params` in page/layout/route handlers
- Pages with `useSearchParams()` must be wrapped in `<Suspense>`
- Use `export const dynamic = "force-dynamic"` for pages with DB queries
- Server components should query Prisma directly (do not `fetch()` your own API routes)
- **`middleware.ts` is deprecated** — this project uses `src/proxy.ts` with the `proxy` export convention instead
- React Compiler is enabled (`reactCompiler: true` in next.config.ts)

### Auth.js v5 beta.30
- Exports: `{ handlers, auth, signIn, signOut }` from `NextAuth()` in `lib/auth.ts`
- JWT strategy (no database sessions); role stored on token
- Callbacks: `jwt({ token, user })` stores `id` + `role`, `session({ session, token })` injects them onto `session.user`
- Login rate-limited: 5 attempts / 15 min per email:IP (Upstash + in-memory lockout)
- Sign-in page: `/login`

### Proxy (Auth Middleware)
- File: `src/proxy.ts` — replaces deprecated `middleware.ts`
- Protects: `/api/admin/:path*` — requires valid JWT + `ADMIN` role
- Returns 401/403 JSON responses for unauthorized/forbidden requests

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | Direct PostgreSQL URL (for migrations) |
| `AUTH_SECRET` | JWT signing secret for Auth.js |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API access key |
| `R2_SECRET_ACCESS_KEY` | R2 API secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Public CDN URL for R2 images |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `RESEND_API_KEY` | Resend email API key |
| `FONNTE_TOKEN` | Fonnte WhatsApp API token |
| `ADMIN_SEED_PASSWORD` | Admin password for seeding (required in production) |
| `NODE_ENV` | `development` / `production` |
| `NEXT_PUBLIC_SITE_URL` | Site URL for email preview links |

## Code Style

### Imports
Use `@/*` path alias (maps to `src/`). Group: React/Next → external libs → internal modules. Use `import type { ... }` for type-only imports.

```typescript
import { useState, useEffect, type ReactNode } from "react";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, serverError } from "@/lib/api-response";
import type { ProductListItem } from "@/types/api";
```

### TypeScript
- Strict mode — no `any` unless absolutely necessary
- Use `type` for object shapes, `interface` for extensible contracts
- Use Zod schemas for validation; export inferred types: `type X = z.infer<typeof xSchema>`

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `ProductCard`, `CartProvider` |
| Functions | camelCase | `getImageUrl`, `formatCurrency` |
| Constants | SCREAMING_SNAKE_CASE | `CART_KEY`, `R2_PUBLIC_URL` |
| Types/Interfaces | PascalCase | `ProductListItem` |
| API handlers | HTTP method name | `GET`, `POST`, `PATCH`, `DELETE` |
| Zod schemas | camelCase + Schema | `createProductSchema` |
| Files | kebab-case | `product-card.tsx` |

### React Components
- Function declarations (not arrow functions), `"use client"` directive when hooks/events needed
- Use `cn()` from `@/lib/utils` for conditional Tailwind class merging
- shadcn components in `@/components/ui/`, custom components in feature folders

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
- Custom error classes in `lib/errors.ts`: `AppError` (base), `ValidationError` (400), `NotFoundError` (404), `UnauthorizedError` (401), `InvalidStatusTransitionError` (400)
- Response helpers in `lib/api-response.ts`: `apiSuccess`, `apiError`, `notFound`, `unauthorized`, `forbidden`, `badRequest`, `rateLimited`, `insufficientStock`, `invalidCoupon`, `conflict`, `serverError`
- Error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `RATE_LIMITED`, `INSUFFICIENT_STOCK`, `INVALID_COUPON`, `PAYMENT_REQUIRED`, `CONFLICT`, `INTERNAL_ERROR`
- Type guards: `isApiError()`, `isApiSuccess()`
- `serverError()` auto-generates a request ID for tracing
- Log with `console.error()` including route context

### Input Sanitization
Always sanitize user input via `lib/sanitize.ts` before persisting:
- `sanitizeText`, `sanitizeMultilineText` — escapes HTML, trims
- `sanitizeName`, `sanitizeEmail`, `sanitizePhone`, `sanitizeAddress`, `sanitizeNotes` — type-specific
- `containsDangerousContent` — detects `<script`, `javascript:`, `on*=`, `data:`, `vbscript:`
- `sanitizeObject(obj, fields)` — batch-sanitize an object by field type map
- Validation schemas in `lib/validations/order.ts` already use sanitize transforms

### Styling
- Tailwind CSS 4 with shadcn/ui (new-york style)
- Theme colors: terracotta, sage, cream, dark-brown, warm-sand, warm-gray
- Fonts: Manrope (body, `--font-manrope`), Archivo (display, `--font-archivo`)
- Always use `next/image` with `getImageUrl()` from `lib/image-url.ts`
- Security headers set in `next.config.ts`: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `X-DNS-Prefetch-Control`

### Database
- Singleton: `import { prisma } from "@/lib/prisma"`
- Use `prisma.$transaction([...])` for multi-step operations
- After schema changes: update `types/api.ts` + `lib/validations/*` + run `npm run db:push`

## Project Structure

```
src/
  proxy.ts                   # Auth middleware (replaces middleware.ts) — protects /api/admin/*
  app/
    layout.tsx               # Root layout: fonts, metadata, ErrorBoundary → Toast → CartProvider
    global-error.tsx         # Global error boundary
    globals.css              # Tailwind + theme CSS
    manifest.ts              # PWA manifest
    robots.ts, sitemap.ts    # SEO
    opengraph-image.tsx      # Default OG image
    (admin)/
      login/page.tsx         # Admin login page
      admin/
        layout.tsx           # Admin layout (sidebar + header)
        page.tsx             # Dashboard (stats overview)
        products/            # Product CRUD
        orders/              # Order list + [id] detail
        coupons/             # Coupon management
        accessories/         # Accessory management
        shipping-zones/      # (via settings or dedicated page)
        settings/            # Site settings + email-preview + whatsapp-preview
        users/               # User management
    (customer)/
      layout.tsx             # Storefront layout (header + footer)
      page.tsx               # Home page
      products/
        page.tsx             # Product listing with pagination
        [slug]/page.tsx      # Product detail with reviews
      cart/page.tsx          # Full cart page
      checkout/
        page.tsx             # Checkout form
        success/[orderCode]/ # Order confirmation
      track-order/
        page.tsx             # Track by order code
        [orderCode]/page.tsx # Order status detail
    ulas/page.tsx            # Review submission page (outside route groups)
    api/                     # See "API Routes" section below
  components/
    ui/                      # shadcn/ui primitives (button, card, dialog, input, etc.)
    admin/                   # Admin: sidebar, header, dashboard, tables, forms
      accessories/           # Accessory table + form components
      coupons/               # Coupon table + form components
      orders/                # Order table + detail components
      products/              # Product table + form components
      settings/              # Settings form components
    cart/                    # CartSheet, CartItemRow, CartSummary
    product/                 # ProductCard, ProductGrid, ProductDetail, ImageGallery, AccessoriesSelector, Pagination
    order/                   # OrderStatusTracker, PaymentProofUpload, StatusBadge
    review/                  # ProductReviews, ReviewForm, ReviewList
    checkout/                # AddressFields (uses wilayah hooks)
    layout/                  # BrandLogo, Header, Footer
    providers/               # SessionProvider (Auth.js)
    error-boundary.tsx       # ErrorBoundary component
  contexts/
    cart-context.tsx          # Cart state in localStorage ("temanyoga_cart"), debounced saves
    sidebar-context.tsx       # Admin sidebar open/close state
  hooks/
    use-wilayah.ts            # SWR hooks: useProvinces, useRegencies, useDistricts, useVillages
  lib/
    auth.ts                   # NextAuth config + Credentials provider + login rate limiting
    auth.config.ts            # Auth.js base config (JWT callbacks, sign-in page)
    prisma.ts                 # Prisma singleton client
    api-response.ts           # Typed response helpers (apiSuccess, apiError, notFound, etc.)
    api-client.ts             # Client-side fetch helpers (apiFetch, apiPost, apiPatch, apiDelete, apiUpload)
    errors.ts                 # Custom error classes (AppError, ValidationError, etc.)
    r2.ts                     # Cloudflare R2 upload/delete (uploadToR2, deleteFromR2)
    image-url.ts              # getImageUrl() — returns image URL for next/image
    format.ts                 # formatCurrency (IDR), formatDate/DateTime (id locale), status label/variant mappers
    order-code.ts             # generateOrderCode() → "ORD-YYYYMMDD-NNNNNN"
    order-status.ts           # Order state machine (ALLOWED_TRANSITIONS) + validateStatusTransition()
    notification-broadcast.ts # In-memory SSE pub/sub (addClient, removeClient, broadcastNotification, broadcastUnreadCount)
    email.ts                  # sendEmailToCustomer (Resend)
    email-templates.ts        # HTML email templates for all order lifecycle events
    whatsapp.ts               # sendWhatsAppToCustomer, sendWhatsAppToAdmin, getSiteSetting (Fontte)
    whatsapp-templates.ts     # WhatsApp message templates for all order lifecycle events
    rate-limit.ts             # Upstash rate limiters (standard: 10/60s, strict: 5/60s) + getClientIp()
    sanitize.ts               # Input sanitization (escapeHtml, sanitizeText/Name/Email/Phone/Address, etc.)
    utils.ts                  # cn() for Tailwind class merging
    validations/              # Zod schemas — see "Validation Schemas" section
  types/
    api.ts                    # All API response/request types
    next-auth.d.ts            # Auth.js type augmentation (role on session.user)
  generated/prisma/           # Generated Prisma client (do not edit)
```

## API Routes

### Public Endpoints

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/products` | GET | List products with pagination |
| `/api/products/[slug]` | GET | Product detail by slug |
| `/api/products/[slug]/reviews` | GET | Product reviews |
| `/api/accessories` | GET | List active accessories |
| `/api/shipping-zones` | GET | List active shipping zones |
| `/api/coupons/validate` | POST | Validate a coupon code |
| `/api/orders` | POST | Create new order |
| `/api/orders/[orderCode]/status` | GET | Track order status |
| `/api/orders/[orderCode]/payment-proof` | POST | Upload payment proof |
| `/api/reviews` | POST | Submit a review |
| `/api/reviews/verify` | POST | Verify order ownership for review |
| `/api/settings` | GET | Public site settings |
| `/api/wilayah` | GET | Indonesian regions (provinces/regencies/districts/villages) |
| `/api/r2/[...key]` | GET | Proxy R2 images |
| `/api/auth/[...nextauth]` | GET, POST | Auth.js handlers |

### Admin Endpoints (protected by proxy — requires JWT + ADMIN role)

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/admin/dashboard` | GET | Dashboard stats |
| `/api/admin/products` | GET, POST | List/create products |
| `/api/admin/products/[id]` | PATCH, DELETE | Update/delete product |
| `/api/admin/products/[id]/images` | POST | Upload product images |
| `/api/admin/products/images/[imageId]` | DELETE | Delete product image |
| `/api/admin/orders` | GET | List orders with filters + stats |
| `/api/admin/orders/[id]` | GET, PATCH | Order detail / update |
| `/api/admin/orders/[id]/status` | PATCH | Update order status |
| `/api/admin/orders/[id]/tracking` | PATCH | Add tracking number |
| `/api/admin/payment-proofs/[id]` | PATCH | Approve/reject payment proof |
| `/api/admin/coupons` | GET, POST | List/create coupons |
| `/api/admin/coupons/[id]` | PATCH, DELETE | Update/delete coupon |
| `/api/admin/accessories` | GET, POST | List/create accessories |
| `/api/admin/accessories/[id]` | PATCH, DELETE | Update/delete accessory |
| `/api/admin/shipping-zones` | GET, POST | List/create shipping zones |
| `/api/admin/shipping-zones/[id]` | PATCH, DELETE | Update/delete shipping zone |
| `/api/admin/users` | GET, POST, PATCH, DELETE | User management |
| `/api/admin/notifications` | GET, PUT | List / mark-all-read notifications |
| `/api/admin/notifications/[id]` | PUT, DELETE | Mark read / delete notification |
| `/api/admin/notifications/stream` | GET | SSE stream for real-time notifications |
| `/api/admin/settings` | GET, PATCH, POST | Site settings CRUD |
| `/api/admin/email-preview` | GET | Preview email templates |

## Validation Schemas (`lib/validations/`)

| File | Exported Schemas |
|------|-----------------|
| `product.ts` | `createProductSchema`, `updateProductSchema` |
| `order.ts` | `orderItemSchema`, `createOrderSchema`, `updateOrderStatusSchema`, `updateTrackingSchema` |
| `payment-proof.ts` | `reviewPaymentProofSchema`, `paymentProofMetadataSchema` |
| `coupon.ts` | `createCouponSchema`, `updateCouponSchema`, `validateCouponSchema` |
| `accessory.ts` | `createAccessorySchema`, `updateAccessorySchema` |
| `shipping-zone.ts` | `createShippingZoneSchema`, `updateShippingZoneSchema` |
| `review.ts` | `verifyOrderSchema`, `createReviewSchema` |
| `settings.ts` | `updateSettingsSchema`, `SETTING_KEYS` |
| `user.ts` | `createUserSchema`, `updateUserSchema` |

All schemas export inferred types (e.g., `CreateProductInput`). Order schemas include sanitization transforms.

## Order State Machine

```
PENDING_PAYMENT ──→ AWAITING_VERIFICATION ──→ PAID ──→ PROCESSING ──→ SHIPPED ──→ COMPLETED
       │                    │                   │          │
       ↓                    ↓                   ↓          ↓
   CANCELLED            CANCELLED           CANCELLED   CANCELLED
                            │
                            ↓
                     PENDING_PAYMENT (reject proof → back to pending)
```

Transitions enforced by `validateStatusTransition()` in `lib/order-status.ts`. Invalid transitions throw `InvalidStatusTransitionError`.

## Real-time Notifications (SSE)

- Admin dashboard connects to `/api/admin/notifications/stream` via `EventSource`
- In-memory client map in `lib/notification-broadcast.ts`
- Two event types: `notification` (new notification data) and `unreadCount` (badge count)
- Triggered when: new order created, payment proof uploaded, order status changed

## Cart System

- Client-side only — `contexts/cart-context.tsx` with `localStorage` key `"temanyoga_cart"`
- Cart item key = composite of `productId` + sorted accessory IDs (same product with different accessories = different cart items)
- Debounced localStorage writes (150ms)
- Lazy-loads on mount via `setTimeout(0)` to avoid SSR hydration mismatch
- Exposes: `items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `cartCount`, `cartTotal`, `getItemKey`

## Rate Limiting

| Limiter | Limit | Window | Used For |
|---------|-------|--------|----------|
| `standard` | 10 req | 60s | General API routes |
| `strict` | 5 req | 60s | Sensitive operations |
| Login | 5 attempts | 15 min | Per email:IP, Upstash + in-memory lockout |

Rate-limited responses use `rateLimited()` helper with `Retry-After` header.

## Image Handling

- Upload: `uploadToR2(file, folder, contentType)` → stores as `{folder}/{nanoid()}.{ext}` in R2
- Delete: `deleteFromR2(key)` → removes from R2 bucket
- Serve: images accessed via `R2_PUBLIC_URL` CDN, optimized by `next/image`
- Remote pattern in `next.config.ts` allows `pub-38c629e713a54e8e9ed0a762c8f2666d.r2.dev`
- Proxy fallback: `/api/r2/[...key]` proxies R2 objects via `GetObjectCommand`
- Always use `getImageUrl()` from `lib/image-url.ts` with `next/image`

## Internationalization

All user-facing strings are in **Bahasa Indonesia**:
- Status labels (`format.ts`): `PENDING_PAYMENT` → "Menunggu Pembayaran", etc.
- Date formatting uses `id-ID` locale
- Currency: IDR (Indonesian Rupiah), no decimals
- Email + WhatsApp templates are Indonesian
- Root layout: `<html lang="id">`

## Common Tasks

**New API endpoint**: Create route in `app/api/`, add Zod schema in `lib/validations/`, validate input, return via `lib/api-response.ts` helpers. Admin endpoints go under `app/api/admin/` (auto-protected by proxy). Use `lib/sanitize.ts` for user text input.

**New page**: Create `page.tsx` in `(customer)` or `(admin)` route group. Add `export const dynamic = "force-dynamic"` for DB queries. Remember `await params` for dynamic routes. Add `loading.tsx` for loading states.

**Schema change**: Edit `prisma/schema.prisma` → run `npm run db:push` → update `types/api.ts` + `lib/validations/*`.

**New shadcn component**: `npx shadcn@latest add <name>` (installs to `src/components/ui/`).

**New notification type**: Add to `NotificationType` enum in schema → update `lib/notification-broadcast.ts` → trigger via `broadcastNotification()` in relevant API route.

**New email/WhatsApp template**: Add template function in `lib/email-templates.ts` / `lib/whatsapp-templates.ts` → call via `sendEmailToCustomer()` / `sendWhatsAppToCustomer()` in API route.

**Client-side API calls**: Use typed helpers from `lib/api-client.ts`: `apiFetch<T>`, `apiPost<T>`, `apiPatch<T>`, `apiDelete<T>`, `apiUpload<T>` (FormData). All return `ApiResponse<T>`.

**Seed data**: `prisma/seed.ts` upserts admin user (`admin@temanyoga.com`), 3 sample products, and default site settings. Idempotent via `upsert`.
