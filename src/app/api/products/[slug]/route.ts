import { prisma } from "@/lib/prisma";
import { apiSuccess, notFound, serverError } from "@/lib/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: { order: "asc" } },
      },
    });

    if (!product) return notFound("Product");

    return apiSuccess(product);
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);
    return serverError();
  }
}
