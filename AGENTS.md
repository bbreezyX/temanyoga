# AGENTS.md — Coding Agent Guidelines for Temanyoga

## Project Overview

(D'TEMAN YOGA) is a Next.js 16 e-commerce application for handmade yoga boneka (plushies). It features a customer-facing storefront with product browsing, cart, checkout, order tracking, and reviews — plus a full admin dashboard for product/order/coupon/accessory management with real-time notifications.

## Tech Stack

| Layer         | Technology                            | Version        |
| ------------- | ------------------------------------- | -------------- |
| Framework     | Next.js (App Router, Turbopack)       | 16.1.6         |
| Runtime       | React                                 | 19.2.3         |
| Language      | TypeScript (strict)                   | 5              |
| ORM           | Prisma                                | 6.19.2         |
| Database      | PostgreSQL                            | —              |
| Auth          | Auth.js (next-auth)                   | 5.0.0-beta.30  |
| Validation    | Zod                                   | 4.3.6          |
| CSS           | Tailwind CSS                          | 4              |
| UI Kit        | shadcn/ui (new-york style)            | 3.8.5          |
| Icons         | Lucide React                          | 0.564.0        |
| Storage       | Cloudflare R2 (via AWS SDK S3)        | —              |
| Email         | Resend                                | 6.9.2          |
| WhatsApp      | Fonnte API                            | —              |
| Rate Limiting | Upstash Redis + Ratelimit             | —              |
| Forms         | React Hook Form + @hookform/resolvers | 7.71.1 / 5.2.2 |

## Build, Lint, and Test Commands

```bash
npm run dev          # Start development server with Turbopack
npm run build        # prisma generate + next build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema changes to database
npm run db:seed      # Seed database with admin user and sample products
npm run db:studio    # Open Prisma Studio GUI
```

**Note:** No automated test suite is currently configured. When adding tests, create a `test` script in package.json.

---

## Critical Gotchas

### Prisma v6

- Generator is `prisma-client-js` with output to `src/generated/prisma/`
- **Server-side**: import from `@/generated/prisma/client`
- **Client components**: import enums from `@/generated/prisma/enums` (client.ts has Node.js imports that break browser bundle)
- Seed script uses relative import: `../src/generated/prisma/client`

### Zod v4 (NOT v3)

- `z.nativeEnum()` is **DEPRECATED** — use `z.enum(NativeEnum)` instead
- `ZodError` has `.issues` NOT `.errors`
- Access first error: `parsed.error.issues[0].message`

### Next.js 16

- Route params are `Promise<{...}>` — must `await params`
- Pages using `useSearchParams()` must be wrapped in `<Suspense>` boundary
- Use `export const dynamic = "force-dynamic"` for pages with DB queries
- Server components should use Prisma directly (not fetch API routes) — avoids localhost connection errors at build time
- `middleware.ts` convention is deprecated (warns to use "proxy")

### Auth.js v5 beta.30

- Export: `{ handlers, auth, signIn, signOut }` from `NextAuth()`
- JWT callbacks: `jwt({ token, user })` and `session({ session, token })`
- Session strategy: JWT (no database sessions)

---

## Code Style Guidelines

### Imports

- Use `@/*` path alias for imports from `src/` (configured in tsconfig.json)
- Group imports: React/Next first, then external libraries, then internal modules
- Use named imports for React hooks: `import { useState, useEffect } from "react"`
- Import types with `import type { ... }` for type-only imports

```typescript
import { useState, useEffect, type ReactNode } from "react";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, serverError } from "@/lib/api-response";
import type { ProductListItem } from "@/types/api";
```

### TypeScript

- Strict mode is enabled — no `any` types unless absolutely necessary
- Use `type` for object shapes, `interface` for extensible contracts
- Prefer function components with explicit return types for API routes
- Use Zod schemas for validation; export inferred types alongside schemas

```typescript
export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().int().positive(),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;
```

### React Components

- Use function declarations for components, not arrow functions
- Destructure props in the function signature
- Use `"use client"` directive for client components
- Use `cn()` utility for conditional class merging

```typescript
export function ProductCard({ product }: { product: ProductListItem }) {
  return <div className={cn("base-class", condition && "conditional-class")}>...</div>;
}
```

### Naming Conventions

| Element            | Convention           | Example                               |
| ------------------ | -------------------- | ------------------------------------- |
| Components         | PascalCase           | `ProductCard`, `CartProvider`         |
| Functions          | camelCase            | `getImageUrl`, `formatCurrency`       |
| Constants          | SCREAMING_SNAKE_CASE | `CART_KEY`, `R2_PUBLIC_URL`           |
| Types/Interfaces   | PascalCase           | `ProductListItem`, `CartContextType`  |
| API Route Handlers | HTTP method          | `GET`, `POST`, `PATCH`                |
| Zod Schemas        | camelCase + Schema   | `createProductSchema`                 |
| Files              | kebab-case           | `product-card.tsx`, `api-response.ts` |

### API Routes

- Export async functions named after HTTP methods: `GET`, `POST`, `PATCH`, `DELETE`
- Use `NextRequest` and `NextResponse` from `next/server`
- Wrap logic in try/catch, return standardized responses using `apiSuccess`, `apiError` helpers

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

- Use custom error classes from `@/lib/errors.ts` for domain errors
- Use `apiSuccess`, `apiError`, `notFound`, `unauthorized`, `badRequest` from `@/lib/api-response.ts`
- Log errors with `console.error()` including route context
- Client-side: throw descriptive errors for hook usage violations

### Styling

- Tailwind CSS 4 with shadcn/ui components (new-york style)
- Use `cn()` from `@/lib/utils` for conditional class composition
- shadcn components live in `@/components/ui/`
- Custom components go in feature folders: `@/components/product/`, `@/components/cart/`, etc.
- Custom theme colors: terracotta, sage, cream, dark-brown, warm-sand, warm-gray
- Fonts: Manrope (body), Archivo (display)

### Images

- Always use `next/image` with the `getImageUrl()` helper from `@/lib/image-url.ts`
- Cloudflare R2 CDN: `pub-38c629e713a54e8e9ed0a762c8f2666d.r2.dev`
- Configure new external image hosts in `next.config.ts` under `images.remotePatterns`

### Database (Prisma)

- Import singleton client: `import { prisma } from "@/lib/prisma"`
- Use transactions for multi-step operations: `prisma.$transaction([...])`
- Use `include` for relations, `select` for specific fields
- Generated types in `@/generated/prisma/` — import enums via `@/generated/prisma/enums` in client components

### Authentication

- Auth.js v5 with JWT sessions (no database sessions)
- Protect admin routes via middleware (`src/middleware.ts`)
- Access session in server components via `auth()` from `@/lib/auth`
- Client components use `SessionProvider` from `@/components/providers/session-provider.tsx`

---

## Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (admin)/                   # Admin route group
│   │   ├── admin/                 # Dashboard & management pages
│   │   │   ├── page.tsx           # Dashboard home (stats)
│   │   │   ├── products/          # Product CRUD
│   │   │   ├── orders/            # Order management
│   │   │   │   └── [id]/          # Order detail
│   │   │   ├── accessories/       # Accessory management
│   │   │   ├── coupons/           # Coupon management
│   │   │   ├── settings/          # Site settings
│   │   │   │   ├── email-preview/ # Email template preview
│   │   │   │   └── whatsapp-preview/
│   │   │   └── layout.tsx         # Admin layout (auth-protected)
│   │   └── login/                 # Admin login page
│   ├── (customer)/                # Customer/storefront route group
│   │   ├── page.tsx               # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx           # Products listing (paginated)
│   │   │   └── [slug]/page.tsx    # Product detail
│   │   ├── cart/page.tsx          # Shopping cart
│   │   ├── checkout/
│   │   │   ├── page.tsx           # Checkout form
│   │   │   └── success/[orderCode]/page.tsx
│   │   ├── track-order/
│   │   │   ├── page.tsx           # Order tracking search
│   │   │   └── [orderCode]/page.tsx
│   │   └── layout.tsx             # Customer layout (header/footer)
│   ├── api/                       # API routes (see API Reference below)
│   │   ├── auth/[...nextauth]/    # Auth.js handler
│   │   ├── products/              # Public product endpoints
│   │   ├── accessories/           # Public accessories
│   │   ├── orders/                # Public order endpoints
│   │   ├── coupons/validate/      # Coupon validation
│   │   ├── shipping-zones/        # Public shipping zones
│   │   ├── reviews/               # Public reviews
│   │   ├── settings/              # Public settings
│   │   ├── r2/[...key]/           # R2 image proxy
│   │   └── admin/                 # Protected admin API routes
│   │       ├── products/          # Product CRUD + image upload
│   │       ├── orders/            # Order management + status + tracking
│   │       ├── payment-proofs/    # Payment proof review
│   │       ├── accessories/       # Accessory CRUD
│   │       ├── coupons/           # Coupon CRUD
│   │       ├── shipping-zones/    # Shipping zone CRUD
│   │       ├── settings/          # Site settings
│   │       ├── dashboard/         # Dashboard stats
│   │       ├── notifications/     # Notifications + SSE stream
│   │       └── email-preview/     # Email template preview
│   ├── ulas/page.tsx              # Terms & Conditions page
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Global styles & Tailwind theme
│   └── robots.ts                  # robots.txt config
├── components/
│   ├── ui/                        # shadcn/ui primitives
│   │   ├── alert, avatar, badge, button, card, dialog
│   │   ├── dropdown-menu, input, label, select, separator
│   │   ├── sheet, skeleton, switch, table, tabs
│   │   └── textarea, toast
│   ├── layout/                    # Header, Footer, BrandLogo
│   ├── admin/                     # Admin-specific components
│   │   ├── admin-header.tsx       # Top bar with notifications
│   │   ├── admin-sidebar.tsx      # Collapsible sidebar nav
│   │   ├── notification-dropdown.tsx  # Real-time SSE notifications
│   │   ├── products/              # product-table, product-form, image-upload
│   │   ├── orders/                # order-table, order-detail-card, order-filters,
│   │   │                          # status-update, tracking-form, payment-proof-review
│   │   ├── accessories/           # accessory-list, accessory-form
│   │   ├── coupons/               # coupon-list, coupon-form
│   │   └── settings/              # email/whatsapp/payment-settings, shipping-zone-*
│   ├── cart/                      # cart-sheet, cart-item-row, cart-summary
│   ├── product/                   # product-grid, product-card, product-detail,
│   │                              # image-gallery, pagination-controls, accessories-selector
│   ├── order/                     # order-status-tracker, status-badge, payment-proof-upload
│   ├── review/                    # product-reviews, review-list, review-form
│   └── providers/                 # session-provider (Auth.js SessionProvider)
├── contexts/
│   ├── cart-context.tsx           # Cart state (localStorage, key: temanyoga_cart)
│   └── sidebar-context.tsx        # Admin sidebar collapse state
├── lib/
│   ├── auth.ts                    # NextAuth config (Credentials + JWT)
│   ├── auth.config.ts             # Auth config object
│   ├── prisma.ts                  # Prisma singleton
│   ├── api-response.ts            # apiSuccess, apiError, badRequest, unauthorized, notFound, serverError
│   ├── api-client.ts              # Client-side fetch: apiFetch, apiPost, apiPatch, apiDelete, apiUpload
│   ├── r2.ts                      # Cloudflare R2: uploadToR2, deleteFromR2
│   ├── email.ts                   # Resend: sendEmailToCustomer, isEmailEnabled
│   ├── email-templates.ts         # Email HTML template generators
│   ├── whatsapp.ts                # Fonnte: sendWhatsAppToCustomer, sendWhatsAppToAdmin
│   ├── whatsapp-templates.ts      # WhatsApp message template generators
│   ├── order-code.ts              # generateOrderCode (ORD-YYYYMMDD-XXXXXX)
│   ├── order-status.ts            # validateStatusTransition
│   ├── rate-limit.ts              # Upstash rate limiting (10/60s standard, 5/60s strict)
│   ├── notification-broadcast.ts  # SSE: addClient, removeClient, broadcastNotification
│   ├── format.ts                  # formatCurrency, formatDate, formatDateTime, status labels
│   ├── image-url.ts               # Image URL utility
│   ├── utils.ts                   # cn() Tailwind merge helper
│   ├── errors.ts                  # AppError, ValidationError, NotFoundError, UnauthorizedError
│   └── validations/               # Zod v4 schemas
│       ├── product.ts, order.ts, payment-proof.ts, review.ts
│       ├── accessory.ts, coupon.ts, shipping-zone.ts, settings.ts
├── types/
│   ├── api.ts                     # All API response types
│   └── next-auth.d.ts             # Auth.js module augmentation
├── generated/prisma/              # Prisma generated client (do not edit)
└── middleware.ts                   # Auth middleware for /api/admin/**
```

---

## Database Schema

### Enums

| Enum                 | Values                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `Role`               | `CUSTOMER`, `ADMIN`                                                                                   |
| `OrderStatus`        | `PENDING_PAYMENT`, `AWAITING_VERIFICATION`, `PAID`, `PROCESSING`, `SHIPPED`, `COMPLETED`, `CANCELLED` |
| `PaymentProofStatus` | `PENDING`, `APPROVED`, `REJECTED`                                                                     |
| `NotificationType`   | `NEW_ORDER`, `PAYMENT_PROOF_UPLOADED`, `ORDER_STATUS_CHANGED`                                         |
| `DiscountType`       | `PERCENTAGE`, `FIXED_AMOUNT`                                                                          |

### Models

| Model            | Key Fields                                                                                                             | Relations                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **User**         | id, email (unique), password (bcrypt), name, role                                                                      | —                                                                            |
| **Product**      | id, name, slug (unique), description, price (int IDR), stock (null=unlimited), isActive                                | images[], orderItems[], reviews[]                                            |
| **ProductImage** | id, productId, url, key, order                                                                                         | product (cascade delete)                                                     |
| **ShippingZone** | id, name, description, price (int IDR), sortOrder, isActive                                                            | orders[]                                                                     |
| **Accessory**    | id, name, description, price (int IDR), groupName, imageUrl, imageKey, isActive, sortOrder                             | —                                                                            |
| **Coupon**       | id, code (unique), discountType, discountValue, isActive, expiresAt                                                    | orders[]                                                                     |
| **Order**        | id, orderCode (unique), customer*, shipping*, status, totalAmount, shippingCost, discount*, tracking*, notes           | items[], paymentProofs[], notifications[], reviews[], shippingZone?, coupon? |
| **OrderItem**    | id, orderId, productId, quantity, unitPriceSnapshot, productNameSnapshot, accessoriesSnapshot (JSON), accessoriesTotal | order (cascade), product, review?                                            |
| **PaymentProof** | id, orderId, imageUrl, imageKey, status, notes, reviewedAt                                                             | order (cascade)                                                              |
| **Notification** | id, type, title, message, orderId, isRead                                                                              | order? (SetNull)                                                             |
| **SiteSetting**  | key (PK), value                                                                                                        | —                                                                            |
| **Review**       | id, orderId, productId, orderItemId (unique), customerName, customerEmail, rating (1-5), comment                       | order, product, orderItem                                                    |

---

## API Reference

### Public Endpoints

| Method | Route                                   | Description                                                         |
| ------ | --------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/api/products`                         | List products (paginated, active only)                              |
| GET    | `/api/products/[slug]`                  | Get product by slug                                                 |
| GET    | `/api/products/[slug]/reviews`          | Get product reviews                                                 |
| GET    | `/api/accessories`                      | List active accessories                                             |
| GET    | `/api/shipping-zones`                   | List shipping zones                                                 |
| POST   | `/api/orders`                           | Create order (validates stock, applies coupon, sends notifications) |
| GET    | `/api/orders/[orderCode]/status`        | Get order status                                                    |
| POST   | `/api/orders/[orderCode]/payment-proof` | Upload payment proof                                                |
| POST   | `/api/coupons/validate`                 | Validate coupon code                                                |
| GET    | `/api/reviews`                          | Get reviews (paginated)                                             |
| POST   | `/api/reviews/verify`                   | Verify order for review submission                                  |
| POST   | `/api/reviews`                          | Submit product review                                               |
| GET    | `/api/settings`                         | Get public site settings                                            |
| GET    | `/api/r2/[...key]`                      | R2 image proxy                                                      |

### Admin Endpoints (all require JWT + ADMIN role)

| Method           | Route                                  | Description                                   |
| ---------------- | -------------------------------------- | --------------------------------------------- |
| GET/POST         | `/api/admin/products`                  | List/Create products                          |
| GET/PATCH/DELETE | `/api/admin/products/[id]`             | Read/Update/Delete product                    |
| POST             | `/api/admin/products/images`           | Upload image to R2                            |
| POST             | `/api/admin/products/[id]/images`      | Add images to product                         |
| DELETE           | `/api/admin/products/images/[imageId]` | Delete product image                          |
| GET              | `/api/admin/orders`                    | List orders (filtered, paginated, with stats) |
| GET/PATCH        | `/api/admin/orders/[id]`               | Get/Update order                              |
| PATCH            | `/api/admin/orders/[id]/status`        | Update order status                           |
| PATCH            | `/api/admin/orders/[id]/tracking`      | Update tracking number & courier              |
| PATCH            | `/api/admin/payment-proofs/[id]`       | Review payment proof (approve/reject)         |
| GET/POST         | `/api/admin/accessories`               | List/Create accessories                       |
| GET/PATCH/DELETE | `/api/admin/accessories/[id]`          | Read/Update/Delete accessory                  |
| GET/POST         | `/api/admin/coupons`                   | List/Create coupons                           |
| GET/PATCH/DELETE | `/api/admin/coupons/[id]`              | Read/Update/Delete coupon                     |
| GET/POST         | `/api/admin/shipping-zones`            | List/Create shipping zones                    |
| GET/PATCH/DELETE | `/api/admin/shipping-zones/[id]`       | Read/Update/Delete zone                       |
| GET/PATCH        | `/api/admin/settings`                  | Get/Update site settings                      |
| GET              | `/api/admin/dashboard`                 | Dashboard statistics                          |
| GET              | `/api/admin/notifications`             | Get notifications (paginated)                 |
| PATCH            | `/api/admin/notifications/[id]`        | Mark notification as read                     |
| GET              | `/api/admin/notifications/stream`      | SSE stream for real-time notifications        |
| GET              | `/api/admin/email-preview`             | Email template HTML preview                   |

### API Response Format

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string }
```

---

## Key Business Logic

### Order Flow

1. Customer adds products + accessories to cart (localStorage)
2. Checkout: validates stock, applies coupon, selects shipping zone
3. Order created with `PENDING_PAYMENT` status (stock decremented in transaction)
4. WhatsApp + email notifications sent to customer & admin (fire-and-forget)
5. Customer uploads payment proof -> status becomes `AWAITING_VERIFICATION`
6. Admin reviews proof (approve/reject)
7. Status progression: `PENDING_PAYMENT` -> `AWAITING_VERIFICATION` -> `PAID` -> `PROCESSING` -> `SHIPPED` -> `COMPLETED`
8. `CANCELLED` can occur from most statuses
9. Customer tracks order by order code
10. Customer submits reviews after order completion

### Order Code Format

`ORD-YYYYMMDD-XXXXXX` (6-digit random suffix, collision-checked)

### Price Snapshots

Prices are snapshot at order time in `OrderItem.unitPriceSnapshot`, `OrderItem.accessoriesSnapshot`, and `Order.shippingZoneSnapshot` for historical accuracy.

### Stock Management

- `Product.stock = null` means unlimited
- `Product.stock = N` means finite, decremented atomically in transaction
- Insufficient stock is rejected immediately

### Accessories

- Grouped by `groupName` (e.g., "Colour", "Size")
- Max 1 per group per order item
- Prices added to order total

### Notifications

- **Real-time (SSE)**: Admin dashboard via `/api/admin/notifications/stream`
- **Email**: Resend integration (configurable via SiteSetting)
- **WhatsApp**: Fonnte API integration (configurable via SiteSetting)
- All external notifications are fire-and-forget (errors logged, not thrown)

### Rate Limiting

- Standard: 10 requests per 60s (most endpoints)
- Strict: 5 requests per 60s (payment proof upload, review submission)

---

## Environment Variables

```
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth.js
AUTH_SECRET="..."

# Cloudflare R2
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="temanyoga"
R2_PUBLIC_URL=""

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# WhatsApp (Fonnte)
FONNTE_TOKEN=""

# Email (Resend)
RESEND_API_KEY=""

# Seed
ADMIN_SEED_PASSWORD=""
```

### Site Settings (stored in DB, managed via admin)

`whatsapp_enabled`, `whatsapp_admin_phone`, `email_enabled`, `email_from`, `email_reply_to`, `site_url`, `bank_name`, `bank_account_number`, `bank_account_name`

---

## Common Tasks

### Adding a new API endpoint

1. Create route file in appropriate `app/api/` subfolder
2. Export async function(s) for supported HTTP methods
3. Use validation schemas from `lib/validations/`
4. Return responses using helpers from `lib/api-response.ts`
5. For admin endpoints: place under `app/api/admin/` (protected by middleware)

### Adding a new UI component

1. Create file in appropriate `components/` subfolder
2. Add `"use client"` if hooks/events needed
3. Use `cn()` for conditional styling
4. Export as named function component

### Adding a new page

1. Create `page.tsx` in appropriate route group: `(customer)` for storefront, `(admin)` for dashboard
2. For pages with DB queries: use `export const dynamic = "force-dynamic"`
3. For pages with `useSearchParams()`: wrap in `<Suspense>` boundary
4. For dynamic routes: `await params` since they are `Promise<{...}>`

### Modifying database schema

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Update corresponding TypeScript types in `types/api.ts` if needed
4. Update validation schemas in `lib/validations/` if needed

### Adding a shadcn/ui component

```bash
npx shadcn@latest add <component-name>
```

Components are installed to `src/components/ui/`.
