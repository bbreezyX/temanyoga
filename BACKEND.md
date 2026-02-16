# Temanyoga Backend — Implementation Summary

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Language | TypeScript 5.9 |
| Database | PostgreSQL |
| ORM | Prisma 6.19.2 (`prisma-client` generator) |
| Auth | Auth.js v5 (next-auth@5.0.0-beta.30) — Credentials + JWT |
| File Storage | Cloudflare R2 (via @aws-sdk/client-s3) |
| Validation | Zod 4.3.6 |
| UI Foundation | Tailwind CSS 4 + shadcn/ui (installed, used in frontend phase) |

---

## Project Structure

```
temanyoga/
├── prisma/
│   ├── schema.prisma          # Database schema (6 models, 3 enums)
│   └── seed.ts                # Admin user + 3 sample products
├── prisma.config.ts           # Prisma engine config
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── products/
│   │       │   ├── route.ts                  # GET — paginated active products
│   │       │   └── [slug]/route.ts           # GET — product detail
│   │       ├── orders/
│   │       │   ├── route.ts                  # POST — create order
│   │       │   └── [orderCode]/
│   │       │       ├── status/route.ts       # GET — order status
│   │       │       └── payment-proof/route.ts # POST — upload proof
│   │       └── admin/
│   │           ├── products/
│   │           │   ├── route.ts              # GET, POST — list/create
│   │           │   └── [id]/
│   │           │       ├── route.ts          # PATCH, DELETE — update/deactivate
│   │           │       └── images/route.ts   # POST — upload image
│   │           ├── orders/
│   │           │   ├── route.ts              # GET — filtered list
│   │           │   └── [id]/
│   │           │       ├── route.ts          # GET — full detail
│   │           │       ├── status/route.ts   # PATCH — update status
│   │           │       └── tracking/route.ts # PATCH — set tracking
│   │           └── payment-proofs/
│   │               └── [id]/route.ts         # PATCH — approve/reject
│   ├── lib/
│   │   ├── prisma.ts           # PrismaClient singleton (hot-reload safe)
│   │   ├── auth.ts             # Auth.js config (Credentials + JWT + role)
│   │   ├── r2.ts               # Cloudflare R2 upload/delete helpers
│   │   ├── api-response.ts     # Standardized JSON response helpers
│   │   ├── order-code.ts       # ORD-YYYYMMDD-XXXXXX generator
│   │   ├── order-status.ts     # Status transition validation
│   │   ├── errors.ts           # Custom error classes
│   │   └── validations/
│   │       ├── product.ts      # createProductSchema, updateProductSchema
│   │       ├── order.ts        # createOrderSchema, updateOrderStatusSchema, etc.
│   │       └── payment-proof.ts # reviewPaymentProofSchema
│   ├── middleware.ts           # Protects /api/admin/** (JWT + ADMIN role)
│   ├── types/
│   │   └── next-auth.d.ts      # Type augmentation for session.user.role
│   └── generated/prisma/       # Auto-generated Prisma client (gitignored)
├── .env                        # Environment variables (gitignored)
└── .env.example                # Template for env setup
```

---

## Database Schema

### Models

| Model | Purpose |
|-------|---------|
| **User** | Admin accounts (Credentials auth) |
| **Product** | Keychain products with name, slug, description, price, stock |
| **ProductImage** | Product images stored in R2 (ordered, cascade delete) |
| **Order** | Customer orders with status lifecycle |
| **OrderItem** | Line items with price/name snapshots for history integrity |
| **PaymentProof** | Uploaded payment proof images, reviewed by admin |

### Enums

| Enum | Values |
|------|--------|
| **Role** | `CUSTOMER`, `ADMIN` |
| **OrderStatus** | `PENDING_PAYMENT`, `AWAITING_VERIFICATION`, `PAID`, `PROCESSING`, `SHIPPED`, `COMPLETED`, `CANCELLED` |
| **PaymentProofStatus** | `PENDING`, `APPROVED`, `REJECTED` |

### Key Design Decisions

- **cuid() IDs** — URL-safe, sortable, no collisions
- **Int prices** — IDR has no decimals, stored as integers
- **Snapshot fields** on OrderItem (`productNameSnapshot`, `unitPriceSnapshot`) — preserves order history even if product changes
- **Nullable stock** — `null` means unlimited (made-to-order items)
- **Soft-delete** on products — sets `isActive = false` instead of removing

---

## API Routes

### Public Routes (no auth required)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | Paginated active products with thumbnail. Query: `?page=1&limit=12` |
| GET | `/api/products/[slug]` | Single product with all images |
| POST | `/api/orders` | Create order — validates items, checks stock, calculates totals, generates order code, decrements stock in transaction |
| GET | `/api/orders/[orderCode]/status` | Returns order status, tracking info (no PII) |
| POST | `/api/orders/[orderCode]/payment-proof` | Multipart file upload to R2, sets order to `AWAITING_VERIFICATION` |

### Admin Routes (JWT + ADMIN role required)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/products` | All products (including inactive) with order count |
| POST | `/api/admin/products` | Create product with auto-generated slug |
| PATCH | `/api/admin/products/[id]` | Update product fields |
| DELETE | `/api/admin/products/[id]` | Soft-delete (set `isActive = false`) |
| POST | `/api/admin/products/[id]/images` | Upload product image to R2 |
| GET | `/api/admin/orders` | Paginated with filters: `?status=`, `?search=`, `?dateFrom=`, `?dateTo=` |
| GET | `/api/admin/orders/[id]` | Full order detail with items + payment proofs |
| PATCH | `/api/admin/orders/[id]/status` | Update status with transition validation |
| PATCH | `/api/admin/orders/[id]/tracking` | Set tracking number + courier |
| PATCH | `/api/admin/payment-proofs/[id]` | Approve → order becomes `PAID`; Reject → order reverts to `PENDING_PAYMENT` |

---

## Order Status Lifecycle

```
PENDING_PAYMENT ──→ AWAITING_VERIFICATION ──→ PAID ──→ PROCESSING ──→ SHIPPED ──→ COMPLETED
      │                    │                    │          │
      ├──→ CANCELLED       ├──→ CANCELLED       ├──→ CANCELLED
      │                    │                                │
      │                    ├──→ PENDING_PAYMENT (reject)    └──→ CANCELLED
      │                    │
```

| From | Allowed Transitions |
|------|---------------------|
| `PENDING_PAYMENT` | `AWAITING_VERIFICATION`, `CANCELLED` |
| `AWAITING_VERIFICATION` | `PAID`, `PENDING_PAYMENT` (reject), `CANCELLED` |
| `PAID` | `PROCESSING`, `CANCELLED` |
| `PROCESSING` | `SHIPPED`, `CANCELLED` |
| `SHIPPED` | `COMPLETED` |
| `COMPLETED` | _(terminal)_ |
| `CANCELLED` | _(terminal)_ |

---

## Authentication

- **Provider**: Credentials (email + password)
- **Session strategy**: JWT (no database sessions)
- **Role in token**: `user.role` is stored in the JWT and exposed via `session.user.role`
- **Middleware**: All `/api/admin/**` routes require a valid JWT with `role === "ADMIN"`
- **Admin returns 401** without auth, **403** if authenticated but not admin

---

## File Upload

- **Storage**: Cloudflare R2 (S3-compatible)
- **Max size**: 5MB
- **Allowed types**: JPEG, PNG, WebP
- **Folders**: `products/` for product images, `payment-proofs/` for payment proofs
- **Naming**: nanoid-based unique keys with file extension

---

## Seed Data

Run `npm run db:seed` to create:

| Type | Details |
|------|---------|
| Admin user | `admin@temanyoga.com` / `admin123` |
| Product 1 | Gantungan Kunci Kucing Lucu — Rp 35.000 (stock: 50) |
| Product 2 | Gantungan Kunci Bunga Sakura — Rp 45.000 (stock: 30) |
| Product 3 | Gantungan Kunci Custom Nama — Rp 55.000 (unlimited) |

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/temanyoga?schema=public"

# Auth.js
AUTH_SECRET="generate-with-openssl-rand-base64-32"

# Cloudflare R2
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="temanyoga"
R2_PUBLIC_URL=""
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed admin user + sample products |
| `npm run db:studio` | Open Prisma Studio |

---

## Setup Instructions

1. Clone the repository
2. `npm install`
3. Copy `.env.example` to `.env` and fill in values
4. Start PostgreSQL and ensure `DATABASE_URL` is correct
5. `npm run db:push` — create tables
6. `npm run db:seed` — seed admin + products
7. `npm run dev` — start at http://localhost:3000

---

## Known Warnings

- **Middleware deprecation**: Next.js 16 warns that `middleware.ts` is deprecated in favor of "proxy". This is non-blocking and the middleware functions correctly.
- **Edge Runtime warnings**: Prisma client uses Node.js modules (`node:path`, `node:process`, `node:url`) which trigger warnings when imported transitively by middleware. These are non-blocking — Auth.js JWT verification in middleware does not invoke Prisma at runtime.
