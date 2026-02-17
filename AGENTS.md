# AGENTS.md — Coding Agent Guidelines for Temanyoga

## Project Overview

Temanyoga is a Next.js 16 e-commerce application for handmade keychain products. It uses the App Router, Prisma ORM with PostgreSQL, Auth.js v5 for authentication, and Cloudflare R2 for file storage.

## Build, Lint, and Test Commands

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema changes to database
npm run db:seed      # Seed database with admin user and sample products
npm run db:studio    # Open Prisma Studio GUI
```

**Note:** No automated test suite is currently configured. When adding tests, create a `test` script in package.json.

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

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `ProductCard`, `CartProvider` |
| Functions | camelCase | `getImageUrl`, `formatCurrency` |
| Constants | SCREAMING_SNAKE_CASE | `CART_KEY`, `R2_PUBLIC_URL` |
| Types/Interfaces | PascalCase | `ProductListItem`, `CartContextType` |
| API Route Handlers | HTTP method | `GET`, `POST`, `PATCH` |
| Zod Schemas | camelCase + Schema | `createProductSchema` |
| Files | kebab-case | `product-card.tsx`, `api-response.ts` |

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

```typescript
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
```

### Styling

- Tailwind CSS 4 with shadcn/ui components
- Use `cn()` from `@/lib/utils` for conditional class composition
- shadcn components live in `@/components/ui/`
- Custom components go in feature folders: `@/components/product/`, `@/components/cart/`, etc.

### Images

- Always use `next/image` with the `getImageUrl()` helper from `@/lib/image-url.ts`
- This converts R2 public URLs to local API routes for proper optimization
- Configure new external image hosts in `next.config.ts` under `images.remotePatterns`

### Database (Prisma)

- Import singleton client: `import { prisma } from "@/lib/prisma"`
- Use transactions for multi-step operations: `prisma.$transaction([...])`
- Use `include` for relations, `select` for specific fields
- Generated types are in `@/generated/prisma/` — import enums via `@/generated/prisma/enums`

### Authentication

- Auth.js v5 with JWT sessions (no database sessions)
- Protect admin routes via middleware (`src/middleware.ts`)
- Access session in server components via `auth()` from `@/lib/auth`
- Client components use `SessionProvider` from `@/components/providers/session-provider.tsx`

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin route group
│   ├── (customer)/        # Customer route group
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── layout/            # Header, Footer
│   ├── product/           # Product-related components
│   ├── cart/              # Cart-related components
│   └── order/             # Order-related components
├── contexts/              # React contexts (CartContext)
├── lib/                   # Utility functions and shared logic
│   ├── validations/       # Zod schemas
│   └── ...                # Other utilities
└── types/                 # TypeScript type definitions
```

## Key Patterns

### Server vs Client Components

- Default to Server Components (no `"use client"`)
- Use Client Components only when: using React hooks, browser APIs, event handlers, or context providers
- Server Components can `await` data directly; Client Components receive data via props

### Environment Variables

- Required: `DATABASE_URL`, `AUTH_SECRET`, `R2_*` variables
- Public vars prefixed with `NEXT_PUBLIC_`
- Never commit `.env` files

### API Response Format

All API responses follow this structure:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string }
```

## Common Tasks

### Adding a new API endpoint

1. Create route file in appropriate `app/api/` subfolder
2. Export async function(s) for supported HTTP methods
3. Use validation schemas from `lib/validations/`
4. Return responses using helpers from `lib/api-response.ts`

### Adding a new UI component

1. Create file in appropriate `components/` subfolder
2. Add `"use client"` if hooks/events needed
3. Use `cn()` for conditional styling
4. Export as named function component

### Modifying database schema

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Update corresponding TypeScript types in `types/api.ts` if needed