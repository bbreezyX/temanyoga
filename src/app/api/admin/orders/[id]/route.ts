import { prisma } from "@/lib/prisma";
import { apiSuccess, notFound, serverError } from "@/lib/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { slug: true, isActive: true },
            },
          },
        },
        paymentProofs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) return notFound("Order");

    return apiSuccess(order);
  } catch (error) {
    console.error("GET /api/admin/orders/[id] error:", error);
    return serverError();
  }
}
