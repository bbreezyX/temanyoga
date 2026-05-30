import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { AdminProductListItem, AdminProductListResponse } from "@/types/api";

export const ADMIN_PRODUCTS_PER_PAGE = 20;

export type AdminProductCatalogParams = {
  page: number;
  limit: number;
  search: string;
  stock: string;
  status: string;
};

export function parseAdminProductCatalogParams(
  searchParams: Record<string, string | string[] | undefined>,
): AdminProductCatalogParams {
  const pageValue = Number(
    typeof searchParams.page === "string" ? searchParams.page : "1",
  );

  return {
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
    limit: ADMIN_PRODUCTS_PER_PAGE,
    search:
      typeof searchParams.search === "string" ? searchParams.search.trim() : "",
    stock:
      typeof searchParams.stock === "string" ? searchParams.stock : "all",
    status:
      typeof searchParams.status === "string" ? searchParams.status : "all",
  };
}

function buildAdminProductWhere(
  params: Pick<AdminProductCatalogParams, "search" | "stock" | "status">,
): Prisma.ProductWhereInput {
  const filters: Prisma.ProductWhereInput[] = [];

  if (params.search) {
    filters.push({
      OR: [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ],
    });
  }

  if (params.status === "active") {
    filters.push({ isActive: true });
  } else if (params.status === "inactive") {
    filters.push({ isActive: false });
  }

  if (params.stock === "in-stock") {
    filters.push({
      OR: [{ stock: null }, { stock: { gt: 10 } }],
    });
  } else if (params.stock === "low-stock") {
    filters.push({ stock: { gt: 0, lte: 10 } });
  } else if (params.stock === "out-of-stock") {
    filters.push({ stock: 0 });
  }

  return filters.length > 0 ? { AND: filters } : {};
}

const adminProductListSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  stock: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  images: { orderBy: { order: "asc" as const }, take: 1 },
  _count: { select: { orderItems: true } },
} satisfies Prisma.ProductSelect;

type AdminProductListRow = Prisma.ProductGetPayload<{
  select: typeof adminProductListSelect;
}>;

function serializeAdminProduct(product: AdminProductListRow): AdminProductListItem {
  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: product.images.map((image) => ({
      ...image,
      createdAt: image.createdAt.toISOString(),
    })),
  };
}

export async function getAdminProductList(
  params: AdminProductCatalogParams,
): Promise<AdminProductListResponse> {
  const where = buildAdminProductWhere(params);
  const skip = (params.page - 1) * params.limit;

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: adminProductListSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: params.limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / params.limit) || 0;
  const page =
    totalPages > 0 && params.page > totalPages ? totalPages : params.page;

  let products = rows;

  if (page !== params.page && totalPages > 0) {
    products = await prisma.product.findMany({
      where,
      select: adminProductListSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * params.limit,
      take: params.limit,
    });
  }

  return {
    products: products.map(serializeAdminProduct),
    pagination: {
      page,
      limit: params.limit,
      total,
      totalPages,
    },
  };
}
