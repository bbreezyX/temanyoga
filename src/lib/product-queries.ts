import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { ProductDetail, ProductListItem } from "@/types/api";

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
      include: { images: { orderBy: { order: "asc" } } },
    });
    return JSON.parse(JSON.stringify(products)) as ProductListItem[];
  } catch {
    return [];
  }
});
