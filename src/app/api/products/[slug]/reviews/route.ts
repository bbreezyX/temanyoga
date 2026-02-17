import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return badRequest("Produk tidak ditemukan");
    }

    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
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
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return apiSuccess({
      reviews: reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    });
  } catch (error) {
    console.error("GET /api/products/[slug]/reviews error:", error);
    return serverError();
  }
}