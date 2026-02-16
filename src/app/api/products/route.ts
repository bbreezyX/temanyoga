import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, serverError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          images: {
            orderBy: { order: "asc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    return apiSuccess({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return serverError();
  }
}
