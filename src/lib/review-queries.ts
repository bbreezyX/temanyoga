import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { ReviewListResponse } from "@/types/api";

export const getProductReviews = cache(
  async (productId: string): Promise<ReviewListResponse> => {
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: {
        id: true,
        rating: true,
        comment: true,
        customerName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10,
          ) / 10
        : 0;

    return {
      reviews: reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
      averageRating,
      totalReviews,
    };
  },
);

export const getProductReviewsBySlug = cache(
  async (slug: string): Promise<ReviewListResponse | null> => {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!product) return null;
    return getProductReviews(product.id);
  },
);
