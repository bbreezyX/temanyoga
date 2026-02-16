import { prisma } from "@/lib/prisma";
import { apiSuccess, notFound, serverError } from "@/lib/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderCode: string }> }
) {
  try {
    const { orderCode } = await params;

    const order = await prisma.order.findUnique({
      where: { orderCode },
      select: {
        orderCode: true,
        status: true,
        totalAmount: true,
        trackingNumber: true,
        courier: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!order) return notFound("Order");

    return apiSuccess(order);
  } catch (error) {
    console.error("GET /api/orders/[orderCode]/status error:", error);
    return serverError();
  }
}
