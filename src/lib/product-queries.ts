import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { ProductDetail, ProductListItem } from "@/types/api";

export type ProductListSort = "latest" | "oldest" | "price-asc" | "price-desc";

function productListOrderBy(
  sort: string,
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "oldest":
      return { createdAt: "asc" };
    default:
      return { createdAt: "desc" };
  }
}

export const getProductListPage = cache(
  async (page: number, limit: number, sort: string = "latest") => {
    const orderBy = productListOrderBy(sort);
    const where = { isActive: true };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: JSON.parse(JSON.stringify(products)) as ProductListItem[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
);

export const getProductBySlug = cache(
  async (slug: string): Promise<ProductDetail | null> => {
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: { images: { orderBy: { order: "asc" } } },
    });
    if (!product) return null;
    return JSON.parse(JSON.stringify(product)) as ProductDetail;
  },
);

export const getFeaturedProducts = cache(async (): Promise<ProductListItem[]> => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    });
    return JSON.parse(JSON.stringify(products)) as ProductListItem[];
  } catch {
    return [];
  }
});
